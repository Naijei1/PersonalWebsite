import { SITES } from './inventory.js'
import { eachDay } from './range.js'

export const COVERAGE_LIMITS = [
  'No collector is installed on the live sites by this change.',
  'GitHub Pages request logs are not connected, so older traffic is invisible.',
  'People who block scripts, and requests that never hit an opted-in collector, are not counted.',
  'Estimated uniques add up each day’s site-scoped hashes. A person on another day or another site is not linked.',
  'Visits are distinct visit keys. A browser that stores none still counts as a pageview.',
  'Bot filtering and the 10-second duplicate window are heuristics. Some bots are counted and some reloads are not.',
  'Query strings, form fields, and passwords are rejected and are not stored.',
] as const

export type StoredEvent = {
  siteId: string
  path: string
  referrerHost: string | null
  visitHash: string | null
  visitorHash: string | null
  eventHash: string | null
  day: string
  receivedAt: string
}

export type Overview = {
  demo: boolean
  preview: 'off' | 'demo' | 'empty'
  site: string
  range: { from: string; to: string }
  totals: {
    pageviews: number
    visits: number
    estimatedUniques: number | null
  }
  trend: { day: string; pageviews: number; visits: number }[]
  pages: { path: string; pageviews: number }[]
  referrers: { host: string; pageviews: number }[]
  sites: { id: string; label: string; color: string; pageviews: number }[]
  coverage: {
    source: 'store' | 'demo' | 'empty-preview'
    events: number
    note: string
    limits: string[]
    unreadableRows: number
    truncated: boolean
  }
}

export function emptyOverview(
  range: { from: string; to: string },
  site: string,
  preview: Overview['preview'],
  extra?: { unreadableRows?: number; truncated?: boolean; eventsInStore?: number },
): Overview {
  const source = preview === 'demo' ? 'demo' : preview === 'empty' ? 'empty-preview' : 'store'
  const note =
    preview === 'demo'
      ? 'Demo fixture for local review. These numbers are not traffic from naijei.com.'
      : preview === 'empty'
        ? 'Empty local preview. Nothing is stored, and this is not a census of the live sites.'
        : extra?.eventsInStore
          ? 'Counts are events this app accepted in the selected range. They are not every visitor.'
          : 'No events are stored. Zeros mean this app received nothing, not that the sites were quiet.'
  return {
    demo: preview === 'demo',
    preview,
    site,
    range,
    totals: { pageviews: 0, visits: 0, estimatedUniques: null },
    trend: eachDay(range.from, range.to).map((day) => ({ day, pageviews: 0, visits: 0 })),
    pages: [],
    referrers: [],
    sites: SITES.map((item) => ({ id: item.id, label: item.label, color: item.color, pageviews: 0 })),
    coverage: {
      source,
      events: 0,
      note,
      limits: [...COVERAGE_LIMITS],
      unreadableRows: extra?.unreadableRows ?? 0,
      truncated: extra?.truncated ?? false,
    },
  }
}

function siteEvents(events: StoredEvent[], site: string, range: { from: string; to: string }): StoredEvent[] {
  return events.filter((event) => event.day >= range.from && event.day <= range.to && (site === 'all' || event.siteId === site))
}

export function aggregate(
  events: StoredEvent[],
  range: { from: string; to: string },
  site: string,
  meta?: { unreadableRows?: number; truncated?: boolean },
): Overview {
  const selected = siteEvents(events, site, range)
  const base = emptyOverview(range, site, 'off', {
    unreadableRows: meta?.unreadableRows,
    truncated: meta?.truncated,
    eventsInStore: events.length,
  })
  if (selected.length === 0) return base

  const trend = new Map(base.trend.map((point) => [point.day, { ...point }]))
  const pages = new Map<string, number>()
  const referrers = new Map<string, number>()
  const visits = new Set<string>()
  const uniquesByDay = new Map<string, Set<string>>()
  let sawVisitor = false

  for (const event of selected) {
    const point = trend.get(event.day)
    if (point) point.pageviews += 1
    const pageLabel = site === 'all' ? `${siteShort(event.siteId)} ${event.path}` : event.path
    pages.set(pageLabel, (pages.get(pageLabel) ?? 0) + 1)
    const referrer = event.referrerHost ?? 'Direct / not sent'
    referrers.set(referrer, (referrers.get(referrer) ?? 0) + 1)
    if (event.visitHash) visits.add(event.visitHash)
    if (event.visitorHash) {
      sawVisitor = true
      const set = uniquesByDay.get(event.day) ?? new Set<string>()
      set.add(event.visitorHash)
      uniquesByDay.set(event.day, set)
    }
  }

  for (const point of trend.values()) {
    point.visits = countDistinct(selected, point.day, 'visitHash')
  }

  const siteCounts = SITES.map((item) => ({
    id: item.id,
    label: item.label,
    color: item.color,
    pageviews: siteEvents(events, item.id, range).length,
  }))

  return {
    ...base,
    totals: {
      pageviews: selected.length,
      visits: visits.size,
      estimatedUniques: sawVisitor ? [...uniquesByDay.values()].reduce((sum, set) => sum + set.size, 0) : null,
    },
    trend: base.trend.map((point) => trend.get(point.day) ?? point),
    pages: topCounts(pages, 8).map(([path, pageviews]) => ({ path, pageviews })),
    referrers: topCounts(referrers, 8).map(([host, pageviews]) => ({ host, pageviews })),
    sites: siteCounts,
    coverage: {
      ...base.coverage,
      events: selected.length,
    },
  }
}

function countDistinct(events: StoredEvent[], day: string, field: 'visitHash' | 'visitorHash'): number {
  const seen = new Set<string>()
  for (const event of events) {
    if (event.day !== day) continue
    const value = event[field]
    if (value) seen.add(value)
  }
  return seen.size
}

function siteShort(siteId: string): string {
  return SITES.find((site) => site.id === siteId)?.short ?? siteId
}

function topCounts(counts: Map<string, number>, limit: number): [string, number][] {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit)
}

function spread(total: number, buckets: readonly string[]): Map<string, number> {
  const weights = buckets.map((_, index) => (index === 0 ? 2 : 1))
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
  const shares = new Map<string, number>()
  let remaining = total
  buckets.forEach((bucket, index) => {
    const share = index === buckets.length - 1 ? remaining : Math.floor((total * weights[index]) / weightSum)
    remaining -= share
    shares.set(bucket, (shares.get(bucket) ?? 0) + share)
  })
  return shares
}

export function demoCount(siteIndex: number, day: string): number {
  const time = Date.parse(`${day}T00:00:00Z`)
  const dow = new Date(time).getUTCDay()
  const serial = Math.floor(time / 86_400_000)
  const bases = [36, 14, 18, 11, 8]
  const wave = bases[siteIndex] + ((serial * (siteIndex + 3)) % 9)
  return dow === 0 || dow === 6 ? Math.max(1, Math.round(wave * 0.45)) : wave
}

const DEMO_PATHS: Record<string, readonly string[]> = {
  naijei: ['/', '/paxos/', '/downloader/'],
  gnarly: ['/gnarly/', '/gnarly/map'],
  flashcards: ['/', '/review', '/decks'],
  sql: ['/', '/play'],
  voter: ['/', '/board'],
}

const DEMO_REFERRERS = ['google.com', 'github.com', 'Direct / not sent', 'cornell.edu']

export function demoOverview(range: { from: string; to: string }, site: string): Overview {
  const base = emptyOverview(range, site, 'demo')
  const days = eachDay(range.from, range.to)
  const selected = site === 'all' ? [...SITES] : SITES.filter((item) => item.id === site)
  const trend = days.map((day) => ({ day, pageviews: 0, visits: 0 }))
  const pages = new Map<string, number>()
  const referrers = new Map<string, number>()
  let pageviews = 0
  let visits = 0
  let uniques = 0

  selected.forEach((item) => {
    const index = SITES.findIndex((candidate) => candidate.id === item.id)
    days.forEach((day, dayIndex) => {
      const views = demoCount(index, day)
      pageviews += views
      const dayVisits = Math.max(1, Math.round(views * 0.62))
      const dayUniques = Math.max(1, Math.round(views * 0.41))
      visits += dayVisits
      uniques += dayUniques
      const point = trend[dayIndex]
      point.pageviews += views
      point.visits += dayVisits
      const paths = (DEMO_PATHS[item.id] ?? ['/']).map((path) => (site === 'all' ? `${item.short} ${path}` : path))
      for (const [path, share] of spread(views, paths)) {
        pages.set(path, (pages.get(path) ?? 0) + share)
      }
      for (const [host, share] of spread(views, DEMO_REFERRERS)) {
        referrers.set(host, (referrers.get(host) ?? 0) + share)
      }
    })
  })

  return {
    ...base,
    totals: { pageviews, visits, estimatedUniques: uniques },
    trend,
    pages: [...pages.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([path, count]) => ({ path, pageviews: count })),
    referrers: [...referrers.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([host, count]) => ({ host, pageviews: count })),
    sites: SITES.map((item, index) => ({
      id: item.id,
      label: item.label,
      color: item.color,
      pageviews: days.reduce((sum, day) => sum + (site === 'all' || site === item.id ? demoCount(index, day) : 0), 0),
    })),
    coverage: { ...base.coverage, events: pageviews },
  }
}
