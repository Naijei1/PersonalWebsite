import { SITES, resolveSite } from '../shared/inventory.js'
import { cleanHost, cleanPath } from '../shared/events.js'

export type CollectorConfig = {
  enabled: true
  endpoint: string
  key: string
  hosts?: readonly string[]
}

export type ClientGate = { lastAt: number; count: number }

const MAX_BODY = 1500

export function parseConfig(input: unknown): CollectorConfig | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const record = input as Record<string, unknown>
  if (record.enabled !== true) return null
  if (typeof record.endpoint !== 'string' || typeof record.key !== 'string') return null
  if (record.key.length < 16 || record.key.length > 200 || /\s/.test(record.key)) return null
  let endpoint: URL
  try {
    endpoint = new URL(record.endpoint)
  } catch {
    return null
  }
  if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return null
  const local = endpoint.hostname === '127.0.0.1' || endpoint.hostname === 'localhost'
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && local)) return null
  let hosts: string[] | undefined
  if (record.hosts !== undefined) {
    if (!Array.isArray(record.hosts) || record.hosts.length === 0 || record.hosts.length > 10) return null
    hosts = []
    for (const host of record.hosts) {
      if (typeof host !== 'string') return null
      const clean = cleanHost(host)
      if (!clean || !SITES.some((site) => site.hosts.includes(clean))) return null
      hosts.push(clean)
    }
  }
  return {
    enabled: true,
    endpoint: `${endpoint.origin}${endpoint.pathname}`,
    key: record.key,
    hosts,
  }
}

export function referrerHostname(referrer: string): string | null {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    if (url.username || url.password) return null
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return cleanHost(url.hostname)
  } catch {
    return null
  }
}

export function pageAllowed(host: string, path: string, hosts: readonly string[] | undefined): boolean {
  const clean = cleanHost(host)
  const cleanedPath = cleanPath(path)
  if (!clean || !cleanedPath) return false
  if (hosts && !hosts.includes(clean)) return false
  return resolveSite(clean, cleanedPath) !== null
}

export function buildBody(input: {
  host: string
  path: string
  referrer: string
  visitId: string | null
  visitorId: string | null
  eventId: string
}): string | null {
  const host = cleanHost(input.host)
  const path = cleanPath(input.path)
  if (!host || !path || !resolveSite(host, path)) return null
  const body: Record<string, string> = { host, path, eventId: input.eventId }
  const referrerHost = referrerHostname(input.referrer)
  if (referrerHost) body.referrerHost = referrerHost
  if (input.visitId) body.visitId = input.visitId
  if (input.visitorId) body.visitorId = input.visitorId
  const raw = JSON.stringify(body)
  if (raw.length > MAX_BODY) return null
  if (raw.includes('?') || raw.includes('#')) return null
  return raw
}

/** Returns the next gate, or null when the send should be dropped. */
export function nextGate(prev: ClientGate | null, now: number): ClientGate | null {
  const count = prev?.count ?? 0
  const lastAt = prev?.lastAt ?? 0
  if (count >= 30) return null
  if (now - lastAt < 1000) return null
  return { lastAt: now, count: count + 1 }
}
