// Stores the latest Apple Watch snapshot posted by an iOS Shortcut and serves it to naijei.com.
//
//   POST /snapshot  (Authorization: Bearer <WRITE_TOKEN>)  body: flat JSON from the Shortcut
//   POST /pause     (Authorization: Bearer <WRITE_TOKEN>)  body: {"paused": true | false}
//   GET  /snapshot  public, cached briefly at the edge
//
// Only a few coarse, non-medical fields are kept; anything else in the request body is dropped.

const KEY = 'latest'
const PAUSE_KEY = 'paused'
const MAX_BODY = 4096
// Automations can fire often; skipping near-duplicate writes keeps KV well under the free 1,000 writes/day.
const MIN_WRITE_INTERVAL_MS = 60_000

const json = (data, init = {}, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders, ...init.headers },
  })

function cors(request, env) {
  const origin = request.headers.get('origin') ?? ''
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const ok = allowed.includes('*') || allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)
  return ok
    ? { 'access-control-allow-origin': origin || '*', 'access-control-allow-methods': 'GET, OPTIONS', vary: 'origin' }
    : { vary: 'origin' }
}

function authorized(request, env) {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!env.WRITE_TOKEN || token.length !== env.WRITE_TOKEN.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ env.WRITE_TOKEN.charCodeAt(i)
  return diff === 0
}

/** Shortcuts may send "72 count/min" or "8,412" as text, so parse leniently and clamp. */
function num(value, max) {
  if (value === undefined || value === null || value === '') return undefined
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''))
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.round(Math.min(n, max))
}

/**
 * Stand hours arrive as a number ("2", "2 hr", "2 count") or as the raw Stand Hour category samples,
 * which Shortcuts renders as "Stood"/"Idle" text (a list, or one per line). Summing those samples'
 * numeric values gives 0, because HealthKit encodes Stood as 0 and Idle as 1, so count "Stood" instead.
 */
export function standHours(value) {
  const items = Array.isArray(value) ? value.map(String) : typeof value === 'string' ? [value] : null
  if (items) {
    const words = items.join('\n')
    if (/\b(stood|idle)\b/i.test(words)) return Math.min(24, (words.match(/\bstood\b/gi) ?? []).length)
    if (Array.isArray(value)) return undefined
  }
  return num(value, 24)
}

function text(value, max) {
  if (typeof value !== 'string') return undefined
  const s = value
    .replace(/[\u0000-\u001f<>]/g, '')
    .trim()
    .slice(0, max)
  return s || undefined
}

function date(value) {
  const t = Date.parse(String(value ?? ''))
  return Number.isFinite(t) ? new Date(t).toISOString() : undefined
}

export function sanitize(body, now = new Date()) {
  const ring = (value, goal, maxGoal) => {
    const g = num(goal, maxGoal)
    return value === undefined || !g ? undefined : { value, goal: g }
  }
  const workoutMinutes = num(body.workoutMinutes, 600)
  const workoutType = text(body.workoutType, 40)

  return {
    heartRate: num(body.heartRate, 240),
    steps: num(body.steps, 200000),
    rings: {
      move: ring(num(body.moveKcal, 10000), body.moveGoal, 5000),
      exercise: ring(num(body.exerciseMin, 1440), body.exerciseGoal, 240),
      stand: ring(standHours(body.standHours), body.standGoal, 24),
    },
    workout:
      workoutType || workoutMinutes !== undefined
        ? { type: workoutType ?? 'Workout', minutes: workoutMinutes, endedAt: date(body.workoutEnded) }
        : undefined,
    updatedAt: now.toISOString(),
  }
}

async function readBody(request) {
  const raw = await request.text()
  if (raw.length > MAX_BODY) throw new Error('too large')
  const body = JSON.parse(raw || '{}')
  if (typeof body !== 'object' || body === null || Array.isArray(body)) throw new Error('not an object')
  return body
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const headers = cors(request, env)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })

    if (url.pathname === '/snapshot' && request.method === 'GET') {
      const cache = globalThis.caches?.default
      const cacheKey = new Request(url.origin + '/snapshot', { method: 'GET' })
      let cached = cache ? await cache.match(cacheKey) : undefined
      if (!cached) {
        const paused = env.PAUSED === 'true' || (await env.WATCH.get(PAUSE_KEY)) === 'true'
        const snapshot = paused ? null : await env.WATCH.get(KEY, 'json')
        const data = paused ? { paused: true } : (snapshot ?? { empty: true })
        cached = json(data, {}, { 'cache-control': 'public, max-age=60' })
        if (cache) ctx.waitUntil(cache.put(cacheKey, cached.clone()))
      }
      const out = new Response(cached.body, cached)
      for (const [k, v] of Object.entries(headers)) out.headers.set(k, v)
      return out
    }

    if (request.method === 'POST' && (url.pathname === '/snapshot' || url.pathname === '/pause')) {
      if (!authorized(request, env)) return json({ error: 'unauthorized' }, { status: 401 })
      let body
      try {
        body = await readBody(request)
      } catch {
        return json({ error: 'invalid JSON body' }, { status: 400 })
      }

      const cache = globalThis.caches?.default
      if (cache) ctx.waitUntil(cache.delete(new Request(url.origin + '/snapshot', { method: 'GET' })))

      if (url.pathname === '/pause') {
        const paused = body.paused === true || body.paused === 'true'
        await env.WATCH.put(PAUSE_KEY, String(paused))
        return json({ ok: true, paused })
      }

      const previous = await env.WATCH.get(KEY, 'json')
      if (previous && Date.now() - Date.parse(previous.updatedAt) < MIN_WRITE_INTERVAL_MS) {
        return json({ ok: true, skipped: 'updated less than a minute ago' })
      }
      const snapshot = sanitize(body)
      await env.WATCH.put(KEY, JSON.stringify(snapshot))
      return json({ ok: true, snapshot })
    }

    return json({ error: 'not found' }, { status: 404 }, headers)
  },
}
