import { addDays } from '../shared/range.js'

export const HOSTING_ACCOUNT = '402275401617'
export const HOSTING_REGION = 'us-east-1'
export const HOSTING_CACHE_MS = 60 * 60 * 1000
export const HOSTING_MAX_DAYS = 90

export type MetricQuery = {
  id: string
  namespace: 'AWS/AmplifyHosting'
  metricName: 'Requests'
  dimensionName: 'App'
  dimensionValue: string
  period: 86400
  stat: 'Sum'
}

export type MetricPoint = { timestamp: string; value: number }

export type MetricQuerier = (input: {
  region: typeof HOSTING_REGION
  start: Date
  end: Date
  queries: MetricQuery[]
}) => Promise<{ id: string; points: MetricPoint[] }[]>

type AmplifySource = {
  id: 'flashcards-amplify' | 'voter-amplify'
  queryId: 'flashcards' | 'voter'
  label: string
  appId: string
  siteId: 'flashcards' | 'voter'
  coverage: string
}

type GapSource = {
  id: 'sql-lightsail' | 'naijei-pages' | 'gnarly-frontend'
  label: string
  siteId: 'sql' | 'naijei' | 'gnarly'
  coverage: string
}

/** Verified Amplify request metrics. Lambda invocation counts are intentionally absent. */
export const AMPLIFY_SOURCES: readonly AmplifySource[] = [
  {
    id: 'flashcards-amplify',
    queryId: 'flashcards',
    label: 'FlashCardApp Amplify',
    appId: 'd3otcaeyemrjvk',
    siteId: 'flashcards',
    coverage:
      'App-level AWS/AmplifyHosting Requests for App d3otcaeyemrjvk. The hostname and git branch were not verified. Buckets are CloudWatch UTC periods, not a local calendar day. The count includes assets and bots. It is not pageviews, visits, or unique people.',
  },
  {
    id: 'voter-amplify',
    queryId: 'voter',
    label: 'Candate-voter Amplify',
    appId: 'd253xhq1uabld3',
    siteId: 'voter',
    coverage:
      'App-level AWS/AmplifyHosting Requests for App d253xhq1uabld3. The hostname and git branch were not verified. Buckets are CloudWatch UTC periods, not a local calendar day. The count includes assets and bots. It is not pageviews, visits, or unique people.',
  },
]

export const GAP_SOURCES: readonly GapSource[] = [
  {
    id: 'sql-lightsail',
    label: 'sql-workshop Lightsail',
    siteId: 'sql',
    coverage: 'The Lightsail instance sql-workshop is known. HTTP request history was not verified, so this app has no request series for it.',
  },
  {
    id: 'naijei-pages',
    label: 'naijei.com Pages',
    siteId: 'naijei',
    coverage: 'GitHub Pages request history for the main site is not available to this app.',
  },
  {
    id: 'gnarly-frontend',
    label: 'naijei.com/gnarly frontend',
    siteId: 'gnarly',
    coverage:
      'Request history for the /gnarly frontend is not available. Lambda invocation counts were left out so API calls are not shown as site traffic.',
  },
]

export type HostingBucket = { day: string; requests: number }

export type HostingSourceReport = {
  id: string
  label: string
  siteId: string
  status: 'not-configured' | 'ok' | 'no-buckets' | 'unavailable'
  requests: number | null
  buckets: HostingBucket[]
  coverage: string
}

export type HostingReport = {
  separateFromCollector: true
  enabled: boolean
  cached: boolean
  note: string
  sources: HostingSourceReport[]
}

export type HostingCache = Map<string, { at: number; report: HostingReport }>

function gapReport(source: GapSource): HostingSourceReport {
  return {
    id: source.id,
    label: source.label,
    siteId: source.siteId,
    status: 'unavailable',
    requests: null,
    buckets: [],
    coverage: source.coverage,
  }
}

function selectedAmplify(site: string): AmplifySource[] {
  return AMPLIFY_SOURCES.filter((source) => site === 'all' || source.siteId === site)
}

function selectedGaps(site: string): GapSource[] {
  return GAP_SOURCES.filter((source) => site === 'all' || source.siteId === site)
}

function idleReport(site: string, status: 'not-configured' | 'unavailable', note: string): HostingReport {
  const amplify: HostingSourceReport[] = selectedAmplify(site).map((source) => ({
    id: source.id,
    label: source.label,
    siteId: source.siteId,
    status,
    requests: null,
    buckets: [],
    coverage: source.coverage,
  }))
  return {
    separateFromCollector: true,
    enabled: false,
    cached: false,
    note,
    sources: [...amplify, ...selectedGaps(site).map(gapReport)],
  }
}

function utcDayFromTimestamp(timestamp: string): string | null {
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function bucketsFromPoints(points: MetricPoint[]): HostingBucket[] {
  const totals = new Map<string, number>()
  for (const point of points) {
    if (!Number.isFinite(point.value)) continue
    const day = utcDayFromTimestamp(point.timestamp)
    if (!day) continue
    totals.set(day, (totals.get(day) ?? 0) + point.value)
  }
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, requests]) => ({ day, requests }))
}

export async function loadHosting(input: {
  mode: 'off' | 'on' | 'misconfigured'
  site: string
  range: { from: string; to: string }
  now: Date
  query?: MetricQuerier
  cache: HostingCache
}): Promise<HostingReport> {
  if (input.mode === 'off') {
    return idleReport(
      input.site,
      'not-configured',
      'Hosting request metrics are off. Missing numbers are not zeros, and they are not pageviews.',
    )
  }
  if (input.mode === 'misconfigured') {
    return idleReport(
      input.site,
      'unavailable',
      'Hosting metrics were switched on without the expected us-east-1 account pin. No query was sent.',
    )
  }
  const span = Math.round(
    (Date.parse(`${input.range.to}T00:00:00Z`) - Date.parse(`${input.range.from}T00:00:00Z`)) / 86_400_000,
  )
  if (span + 1 > HOSTING_MAX_DAYS) {
    return idleReport(
      input.site,
      'unavailable',
      `Hosting requests are queried for at most ${HOSTING_MAX_DAYS} UTC days. Narrow the range. Nothing here was filled with zeros.`,
    )
  }
  const amplify = selectedAmplify(input.site)
  const gaps = selectedGaps(input.site).map(gapReport)
  if (amplify.length === 0) {
    return {
      separateFromCollector: true,
      enabled: true,
      cached: false,
      note: 'No CloudWatch request series is configured for this site. Collector pageviews are a separate count.',
      sources: gaps,
    }
  }
  const cacheKey = `${input.site}:${input.range.from}:${input.range.to}`
  const cached = input.cache.get(cacheKey)
  if (cached && input.now.getTime() - cached.at < HOSTING_CACHE_MS) {
    return { ...cached.report, cached: true }
  }
  if (!input.query) {
    return idleReport(input.site, 'unavailable', 'Hosting metrics are enabled, but the CloudWatch client is not available. No zero was substituted.')
  }
  try {
    const results = await input.query({
      region: HOSTING_REGION,
      start: new Date(`${input.range.from}T00:00:00Z`),
      end: new Date(`${addDays(input.range.to, 1)}T00:00:00Z`),
      queries: amplify.map((source) => ({
        id: source.queryId,
        namespace: 'AWS/AmplifyHosting',
        metricName: 'Requests',
        dimensionName: 'App',
        dimensionValue: source.appId,
        period: 86400,
        stat: 'Sum',
      })),
    })
    const byId = new Map(results.map((result) => [result.id, result.points]))
    const sources: HostingSourceReport[] = amplify.map((source) => {
      if (!byId.has(source.queryId)) {
        return {
          id: source.id,
          label: source.label,
          siteId: source.siteId,
          status: 'unavailable',
          requests: null,
          buckets: [],
          coverage: source.coverage,
        }
      }
      const buckets = bucketsFromPoints(byId.get(source.queryId) ?? [])
      if (buckets.length === 0) {
        return {
          id: source.id,
          label: source.label,
          siteId: source.siteId,
          status: 'no-buckets',
          requests: null,
          buckets: [],
          coverage: `${source.coverage} CloudWatch returned no buckets for this range.`,
        }
      }
      return {
        id: source.id,
        label: source.label,
        siteId: source.siteId,
        status: 'ok',
        requests: buckets.reduce((sum, bucket) => sum + bucket.requests, 0),
        buckets,
        coverage: source.coverage,
      }
    })
    const report: HostingReport = {
      separateFromCollector: true,
      enabled: true,
      cached: false,
      note: 'Hosting requests are AWS request totals. They are not added to collector pageviews, visits, or estimated uniques.',
      sources: [...sources, ...gaps],
    }
    if (sources.every((source) => source.status === 'ok' || source.status === 'no-buckets')) {
      input.cache.set(cacheKey, { at: input.now.getTime(), report })
    }
    return report
  } catch {
    const failed = idleReport(
      input.site,
      'unavailable',
      'CloudWatch did not return hosting requests. The missing series is unavailable, not zero, and collector pageviews are unchanged.',
    )
    return { ...failed, enabled: true }
  }
}
