export type Ranking = { label: string; count: number }[]
export type VisitorData = {
  visitors: number
  trend: { day: string; visitors: number }[]
  countries: Ranking
  referrers: Ranking
  pages: Ranking
}
export type VisitorReport =
  | { status: 'ok' | 'stale'; data: VisitorData }
  | { status: 'not-configured' | 'unauthorized' | 'rate-limited' | 'unavailable' }
