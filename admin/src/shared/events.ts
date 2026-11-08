import { resolveSite, type Site } from './inventory.js'

const ALLOWED_KEYS = new Set(['host', 'path', 'referrerHost', 'visitId', 'visitorId', 'eventId'])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const HOST = /^[a-z0-9.-]+$/

export type AcceptedEvent = {
  site: Site
  host: string
  path: string
  referrerHost: string | null
  visitId: string | null
  visitorId: string | null
  eventId: string | null
}

export type EventError =
  | 'not-object'
  | 'unexpected-field'
  | 'bad-host'
  | 'unknown-site'
  | 'bad-path'
  | 'bad-referrer'
  | 'bad-id'

export function cleanHost(value: string): string | null {
  const host = value.trim().toLowerCase().replace(/\.$/, '')
  if (host.length < 1 || host.length > 253) return null
  if (!HOST.test(host) || host.includes('..') || host.startsWith('.') || host.endsWith('.') || host.startsWith('-')) {
    return null
  }
  return host
}

function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code <= 31 || code === 127) return true
  }
  return false
}

export function cleanPath(value: string): string | null {
  if (value.length < 1 || value.length > 200 || !value.startsWith('/')) return null
  if (/[?#\\]/.test(value) || hasControlChar(value)) return null
  const segments = value.split('/')
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i]
    if (segment === '' && i !== 0 && i !== segments.length - 1) return null
    if (segment === '.' || segment === '..') return null
    try {
      const decoded = decodeURIComponent(segment)
      if (decoded === '.' || decoded === '..' || /[?#\\/]/.test(decoded) || hasControlChar(decoded)) return null
    } catch {
      return null
    }
  }
  return value
}

function optionalId(value: unknown): string | null | EventError {
  if (value === undefined) return null
  if (typeof value !== 'string' || !UUID.test(value)) return 'bad-id'
  return value.toLowerCase()
}

export function validateEvent(body: unknown): { ok: true; event: AcceptedEvent } | { ok: false; error: EventError } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'not-object' }
  const record = body as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) return { ok: false, error: 'unexpected-field' }
  }
  if (typeof record.host !== 'string') return { ok: false, error: 'bad-host' }
  const host = cleanHost(record.host)
  if (!host) return { ok: false, error: 'bad-host' }
  if (typeof record.path !== 'string') return { ok: false, error: 'bad-path' }
  const path = cleanPath(record.path)
  if (!path) return { ok: false, error: 'bad-path' }
  const site = resolveSite(host, path)
  if (!site) return { ok: false, error: 'unknown-site' }

  let referrerHost: string | null = null
  if (record.referrerHost !== undefined && record.referrerHost !== null && record.referrerHost !== '') {
    if (typeof record.referrerHost !== 'string') return { ok: false, error: 'bad-referrer' }
    referrerHost = cleanHost(record.referrerHost)
    if (!referrerHost) return { ok: false, error: 'bad-referrer' }
  }

  const visitId = optionalId(record.visitId)
  if (visitId === 'bad-id') return { ok: false, error: 'bad-id' }
  const visitorId = optionalId(record.visitorId)
  if (visitorId === 'bad-id') return { ok: false, error: 'bad-id' }
  const eventId = optionalId(record.eventId)
  if (eventId === 'bad-id') return { ok: false, error: 'bad-id' }

  return { ok: true, event: { site, host, path, referrerHost, visitId, visitorId, eventId } }
}

const BOT =
  /bot|spider|crawl|slurp|headless|phantom|selenium|bytespider|petalbot|ahrefs|semrush|gptbot|claudebot|googlebot|bingbot|duckduckbot|wget|curl\/|python-requests|go-http-client/i

export function looksLikeBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false
  return BOT.test(userAgent)
}
