import { buildBody, nextGate, pageAllowed, parseConfig, type ClientGate } from './payload.js'

const VISIT_KEY = 'naijei_visit'
const VISITOR_KEY = 'naijei_visitor'
const GATE_KEY = 'naijei_sent'
const VISIT_MS = 30 * 60 * 1000

function uuid(): string | null {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return null
}

function readGate(): ClientGate | null {
  try {
    const raw = sessionStorage.getItem(GATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ClientGate
    if (typeof parsed.lastAt !== 'number' || typeof parsed.count !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function visitId(now: number): string | null {
  try {
    const raw = sessionStorage.getItem(VISIT_KEY)
    const parsed = raw ? (JSON.parse(raw) as { id?: string; at?: number }) : null
    const fresh = !parsed?.id || typeof parsed.at !== 'number' || now - parsed.at > VISIT_MS
    const id = fresh ? uuid() : parsed.id
    if (!id) return null
    sessionStorage.setItem(VISIT_KEY, JSON.stringify({ id, at: now }))
    return id
  } catch {
    return null
  }
}

function visitorId(): string | null {
  try {
    const existing = localStorage.getItem(VISITOR_KEY)
    if (existing) return existing
    const created = uuid()
    if (!created) return null
    localStorage.setItem(VISITOR_KEY, created)
    return created
  } catch {
    return null
  }
}

function send(config: NonNullable<ReturnType<typeof parseConfig>>): void {
  if (navigator.webdriver) return
  const host = location.hostname
  const path = location.pathname
  if (!pageAllowed(host, path, config.hosts)) return
  const now = Date.now()
  const gate = nextGate(readGate(), now)
  if (!gate) return
  const body = buildBody({
    host,
    path,
    referrer: document.referrer,
    visitId: visitId(now),
    visitorId: visitorId(),
    eventId: uuid(),
  })
  if (!body) return
  sessionStorage.setItem(GATE_KEY, JSON.stringify(gate))
  void fetch(config.endpoint, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    keepalive: true,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.key}`,
    },
    body,
  }).catch(() => undefined)
}

/**
 * Does nothing unless `enabled` is exactly true.
 * Failures are swallowed. The public sites do not import this module.
 */
export function install(config: unknown): void {
  try {
    const parsed = parseConfig(config)
    if (!parsed) return
    const run = () => {
      try {
        send(parsed)
      } catch {
        /* A collector must never break the page that opted in. */
      }
    }
    if (document.readyState === 'complete') run()
    else window.addEventListener('load', run, { once: true })
  } catch {
    /* Disabled and broken configs stay silent. */
  }
}
