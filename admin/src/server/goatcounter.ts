import { GOATCOUNTER_SITES } from './config.js'
import { eachDay, validDay } from '../shared/range.js'
import type { Ranking, VisitorData, VisitorReport } from '../shared/visitors.js'

const HOUR = 3_600_000
type Site = typeof GOATCOUNTER_SITES[number]
type Range = { from: string; to: string }

function count(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new Error('Invalid count')
  return value
}

function rankings(rows: { name: string; count: number }[], fallback: string): Ranking {
  return rows.slice(0, 10).map((row) => {
    if (typeof row.name !== 'string') throw new Error('Invalid label')
    return { label: row.name || fallback, count: count(row.count) }
  })
}

export function createGoatCounter(token: string | null, fetcher = fetch, now = Date.now) {
  const cache = new Map<string, { at: number; data: VisitorData }>()
  const pending = new Map<string, Promise<VisitorReport>>()
  const retryAt = new Map<string, number>()

  async function refresh(site: Site, range: Range, key: string): Promise<VisitorReport> {
    const signal = AbortSignal.timeout(8000)
    async function get(endpoint: string) {
      if (now() < (retryAt.get(site.key) ?? 0)) throw 429
      // A bare end date means midnight at the start of that day, so send explicit UTC bounds to include the last day.
      const params = new URLSearchParams({ start: `${range.from}T00:00:00Z`, end: `${range.to}T23:59:59Z` })
      if (endpoint !== 'total') params.set('limit', '10')
      const res = await fetcher(`https://${site.code}.goatcounter.com/api/v0/stats/${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
        redirect: 'error',
      })
      if (res.status === 429) {
        const retry = res.headers.get('Retry-After') || ''
        const until = /^\d+$/.test(retry) ? now() + Number(retry) * 1000 : Date.parse(retry)
        retryAt.set(site.key, Number.isFinite(until) && until > now() ? until : now() + HOUR)
      }
      if (!res.ok) throw res.status
      return res.json()
    }
    try {
      const total = await get('total')
      const visitors = count(total.total)
      const trend = (total.stats as { day: string; daily: number }[])
        .filter(({ day }) => validDay(day) && day >= range.from && day <= range.to)
        .map(({ day, daily }) => ({ day, visitors: count(daily) }))
        .sort((a, b) => a.day.localeCompare(b.day))
      const hits = await get('hits')
      const pages = rankings((hits.hits as { event: boolean; path: string; count: number }[])
        .filter((hit) => hit.event === false).map((hit) => ({ name: hit.path, count: hit.count })), '/')
      const referrers = rankings((await get('toprefs')).stats, 'Direct / unknown')
      const countries = rankings((await get('locations')).stats, 'Unknown')
      const data = { visitors, trend, pages, referrers, countries }
      // Retain expired results for 429 fallback, with a bounded number of custom ranges.
      cache.delete(key)
      if (cache.size >= 256) cache.delete(cache.keys().next().value!)
      cache.set(key, { at: now(), data })
      return { status: 'ok', data }
    } catch (error) {
      if (error === 429) {
        const cached = cache.get(key)
        return cached ? { status: 'stale', data: cached.data } : { status: 'rate-limited' }
      }
      return { status: error === 401 || error === 403 ? 'unauthorized' : 'unavailable' }
    }
  }
  return async (site: Site, range: Range): Promise<VisitorReport> => {
    if (!token) return { status: 'not-configured' }
    const key = `${site.key}:${range.from}:${range.to}`
    const cached = cache.get(key)
    if (cached && now() - cached.at < HOUR) return { status: 'ok', data: cached.data }
    const active = pending.get(key)
    if (active) return active
    const request = refresh(site, range, key).finally(() => pending.delete(key))
    pending.set(key, request)
    return request
  }
}

export function fixtureVisitors(range: Range, empty: boolean): VisitorReport {
  const trend = eachDay(range.from, range.to).map((day, i) => ({ day, visitors: empty ? 0 : 8 + (i * 7) % 13 }))
  const visitors = trend.reduce((sum, point) => sum + point.visitors, 0)
  return {
    status: 'ok',
    data: {
      visitors,
      trend,
      pages: empty ? [] : [{ label: '/', count: visitors }],
      countries: empty ? [] : [{ label: 'United States', count: visitors }],
      referrers: empty ? [] : [{ label: 'Direct / unknown', count: visitors }],
    },
  }
}
