import { asset } from '../data/content'

export type Ring = { value: number; goal: number }

export type WatchSnapshot = {
  heartRate?: number
  steps?: number
  rings?: { move?: Ring; exercise?: Ring; stand?: Ring }
  workout?: { type: string; minutes?: number; endedAt?: string }
  updatedAt?: string
}

export type WatchStatus = 'loading' | 'live' | 'stale' | 'offline' | 'paused'

export type WatchState = { status: WatchStatus; data: WatchSnapshot }

const STALE_AFTER_MS = 6 * 60 * 60 * 1000
const TIMEOUT_MS = 4000

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

export const demoSnapshot = (): WatchSnapshot => ({
  heartRate: 68,
  steps: 8412,
  rings: {
    move: { value: 420, goal: 500 },
    exercise: { value: 24, goal: 30 },
    stand: { value: 9, goal: 12 },
  },
  workout: { type: 'Outdoor Run', minutes: 32, endedAt: minutesAgo(140) },
  updatedAt: minutesAgo(12),
})

async function endpoint(): Promise<string | null> {
  try {
    const res = await fetch(asset('watch.json'), { cache: 'no-store' })
    if (!res.ok) return null
    const config = (await res.json()) as { endpoint?: string }
    return config.endpoint?.trim() || null
  } catch {
    return null
  }
}

/** Reads the latest snapshot from the Cloudflare Worker, falling back to demo data when unconfigured or unreachable. */
export async function loadWatch(): Promise<WatchState> {
  const offline: WatchState = { status: 'offline', data: demoSnapshot() }
  const url = await endpoint()
  if (!url) return offline

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return offline
    const body = (await res.json()) as WatchSnapshot & { paused?: boolean; empty?: boolean }
    if (body.paused) return { status: 'paused', data: {} }
    if (body.empty || !body.updatedAt) return offline
    const age = Date.now() - Date.parse(body.updatedAt)
    return { status: age > STALE_AFTER_MS ? 'stale' : 'live', data: body }
  } catch {
    return offline
  } finally {
    window.clearTimeout(timer)
  }
}

export function timeAgo(iso: string | undefined, now = Date.now()) {
  if (!iso) return 'unknown'
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}
