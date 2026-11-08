import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { sealData } from 'iron-session'
import { loadConfig, productionBlockers } from '../src/server/config.js'
import { AMPLIFY_SOURCES, GAP_SOURCES, loadHosting, type HostingCache, type MetricQuerier } from '../src/server/hosting.js'
import { EventStore } from '../src/server/store.js'
import { OWNER_EMAIL } from '../src/server/access.js'
import { SECRET, apiHeaders, testConfig, withServer } from './harness.js'

const now = new Date('2026-11-08T15:00:00.000Z')
const range = { from: '2026-10-12', to: '2026-11-08' }

test('the hosting IAM example is a usable identity policy for standard metrics', () => {
  const policy = JSON.parse(readFileSync(new URL('../docs/iam-hosting-metrics.json', import.meta.url), 'utf8'))
  assert.equal(policy.Version, '2012-10-17')
  assert.equal('Policies' in policy, false)
  assert.equal(policy.Statement.length, 1)
  const statement = policy.Statement[0]
  assert.equal(statement.Effect, 'Allow')
  assert.equal(statement.Action, 'cloudwatch:GetMetricData')
  assert.equal(statement.Resource, '*')
  assert.deepEqual(statement.Condition, { StringEquals: { 'aws:RequestedRegion': 'us-east-1' } })
  assert.equal(JSON.stringify(policy).includes('dataset'), false)
  assert.equal(JSON.stringify(policy).includes('cloudwatch:namespace'), false)
})

test('hosting sources stay on the verified allowlist', () => {
  assert.deepEqual(
    AMPLIFY_SOURCES.map((source) => source.appId),
    ['d3otcaeyemrjvk', 'd253xhq1uabld3'],
  )
  assert.equal(AMPLIFY_SOURCES.some((source) => source.id.includes('lambda') || source.id.includes('gnarly')), false)
  assert.equal(GAP_SOURCES.some((source) => source.id === 'gnarly-frontend'), true)
  assert.equal(GAP_SOURCES.some((source) => source.id === 'sql-lightsail'), true)
})

test('disabled and failed hosting metrics are not zeros', async () => {
  const cache: HostingCache = new Map()
  const off = await loadHosting({ mode: 'off', site: 'all', range, now, cache })
  assert.equal(off.enabled, false)
  assert.equal(off.separateFromCollector, true)
  assert.ok(off.sources.every((source) => source.requests === null))
  assert.equal(off.sources.some((source) => source.status === 'not-configured'), true)
  assert.equal(off.sources.some((source) => source.status === 'unavailable'), true)

  let calls = 0
  const failing: MetricQuerier = async () => {
    calls += 1
    throw new Error('AccessDenied')
  }
  const failed = await loadHosting({ mode: 'on', site: 'all', range, now, cache, query: failing })
  assert.equal(calls, 1)
  assert.ok(failed.sources.filter((source) => source.id.endsWith('amplify')).every((source) => source.requests === null))
  assert.match(failed.note, /not zero/)
})

test('returned CloudWatch buckets are request totals and absent buckets stay null', async () => {
  const cache: HostingCache = new Map()
  let calls = 0
  const query: MetricQuerier = async (input) => {
    calls += 1
    assert.equal(input.region, 'us-east-1')
    assert.equal(input.queries.length, 1)
    assert.equal(input.queries[0]?.dimensionValue, 'd3otcaeyemrjvk')
    assert.equal(input.queries[0]?.namespace, 'AWS/AmplifyHosting')
    assert.equal(input.queries[0]?.metricName, 'Requests')
    return [
      {
        id: 'flashcards',
        points: [
          { timestamp: '2026-11-01T00:00:00.000Z', value: 12 },
          { timestamp: '2026-11-02T00:00:00.000Z', value: 0 },
        ],
      },
    ]
  }
  const report = await loadHosting({ mode: 'on', site: 'flashcards', range, now, cache, query })
  const again = await loadHosting({ mode: 'on', site: 'flashcards', range, now, cache, query })
  assert.equal(calls, 1)
  assert.equal(again.cached, true)
  const flashcards = report.sources.find((source) => source.id === 'flashcards-amplify')
  assert.equal(flashcards?.status, 'ok')
  assert.equal(flashcards?.requests, 12)
  assert.equal(flashcards?.buckets.find((bucket) => bucket.day === '2026-11-02')?.requests, 0)
  assert.equal(report.sources.some((source) => source.id === 'voter-amplify'), false)
  assert.equal(report.sources.some((source) => source.id === 'sql-lightsail'), false)

  const empty = await loadHosting({
    mode: 'on',
    site: 'voter',
    range,
    now,
    cache: new Map(),
    query: async () => [{ id: 'voter', points: [] }],
  })
  const voter = empty.sources.find((source) => source.id === 'voter-amplify')
  assert.equal(voter?.status, 'no-buckets')
  assert.equal(voter?.requests, null)
})

test('a long range does not query CloudWatch', async () => {
  let calls = 0
  const report = await loadHosting({
    mode: 'on',
    site: 'all',
    range: { from: '2026-01-01', to: '2026-11-08' },
    now,
    cache: new Map(),
    query: async () => {
      calls += 1
      return []
    },
  })
  assert.equal(calls, 0)
  assert.equal(report.sources.every((source) => source.requests === null), true)
  assert.match(report.note, /90/)
})

test('retention drops old events from the file and keeps recent ones', () => {
  const dir = mkdtempSync(join(tmpdir(), 'naijei-retain-'))
  const file = join(dir, 'events.ndjson')
  try {
    const store = EventStore.open(file)
    const base = {
      path: '/',
      referrerHost: null,
      visitHash: null,
      visitorHash: null,
      eventHash: null,
    }
    store.accept({ ...base, siteId: 'naijei', day: '2020-01-01', receivedAt: '2020-01-01T00:00:00.000Z' })
    store.accept({ ...base, siteId: 'naijei', day: '2026-11-08', receivedAt: '2026-11-08T00:00:00.000Z' })
    assert.equal(store.prune('2026-01-01'), 1)
    const reopened = EventStore.open(file)
    assert.deepEqual(reopened.all.map((event) => event.day), ['2026-11-08'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('hosting route is guarded and does not invent requests', async () => {
  await withServer({}, async ({ base, origin }) => {
    assert.equal((await fetch(`${base}/api/hosting`, { headers: apiHeaders(origin) })).status, 401)
    const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
    const body = await (await fetch(`${base}/api/hosting`, { headers: apiHeaders(origin, `naijei_admin=${sealed}`) })).json()
    assert.equal(body.separateFromCollector, true)
    assert.equal(body.enabled, false)
    assert.ok(body.sources.every((source: { requests: number | null }) => source.requests === null))
    const exported = await (await fetch(`${base}/api/export`, { headers: apiHeaders(origin, `naijei_admin=${sealed}`) })).text()
    assert.equal(exported.includes('d3otcaeyemrjvk'), false)
  })
})

test('an enabled adapter reports requests separately from collector pageviews', async () => {
  let calls = 0
  const config = testConfig({
    HOSTING_METRICS: '1',
    AWS_REGION: 'us-east-1',
    AWS_EXPECTED_ACCOUNT: '402275401617',
  })
  assert.equal(config.hosting, 'on')
  await withServer(
    {
      config,
      hostingQuery: async () => {
        calls += 1
        return [{ id: 'flashcards', points: [{ timestamp: '2026-11-07T00:00:00.000Z', value: 40 }] }, { id: 'voter', points: [] }]
      },
    },
    async ({ base, origin }) => {
      const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
      const headers = apiHeaders(origin, `naijei_admin=${sealed}`)
      const hosting = await (await fetch(`${base}/api/hosting?site=all`, { headers })).json()
      const overview = await (await fetch(`${base}/api/overview?site=all`, { headers })).json()
      assert.equal(calls, 1)
      assert.equal(hosting.sources.find((source: { id: string }) => source.id === 'flashcards-amplify').requests, 40)
      assert.equal(hosting.sources.find((source: { id: string }) => source.id === 'voter-amplify').requests, null)
      assert.equal(overview.totals.pageviews, 0)
      assert.equal(overview.demo, false)
      const second = await (await fetch(`${base}/api/hosting?site=all`, { headers })).json()
      assert.equal(second.cached, true)
      assert.equal(calls, 1)
    },
  )
})

test('production demo mode still serves an empty collector store', async () => {
  const config = loadConfig({
    NODE_ENV: 'production',
    ADMIN_DEMO: '1',
    HOSTING_METRICS: '1',
    AWS_REGION: 'us-east-1',
    AWS_EXPECTED_ACCOUNT: '402275401617',
    APP_ORIGIN: 'https://admin.naijei.com',
    GOOGLE_CLIENT_ID: 'id',
    GOOGLE_CLIENT_SECRET: 'secret',
    SESSION_SECRET: SECRET,
    DATA_FILE: '/var/lib/naijei-admin/events.ndjson',
  })
  assert.equal(config.demo, 'off')
  assert.equal(config.hosting, 'on')
  assert.deepEqual(productionBlockers(config), [])
  await withServer(
    {
      config,
      hostingQuery: async () => {
        throw new Error('denied')
      },
    },
    async ({ base }) => {
      const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
      const headers = apiHeaders('https://admin.naijei.com', `__Host-naijei_admin=${sealed}`)
      const overview = await (await fetch(`${base}/api/overview`, { headers })).json()
      const hosting = await (await fetch(`${base}/api/hosting`, { headers })).json()
      assert.equal(overview.demo, false)
      assert.equal(overview.totals.pageviews, 0)
      assert.equal(overview.totals.estimatedUniques, null)
      assert.equal(JSON.stringify(overview).includes('Demo fixture'), false)
      assert.equal(hosting.sources.every((source: { requests: number | null }) => source.requests === null), true)
    },
  )
})

test('a misconfigured hosting flag does not call CloudWatch', async () => {
  const config = testConfig({ HOSTING_METRICS: '1', AWS_REGION: 'us-west-2' })
  assert.equal(config.hosting, 'misconfigured')
  let calls = 0
  await withServer(
    {
      config,
      hostingQuery: async () => {
        calls += 1
        return []
      },
    },
    async ({ base, origin }) => {
      const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
      const body = await (
        await fetch(`${base}/api/hosting`, { headers: apiHeaders(origin, `naijei_admin=${sealed}`) })
      ).json()
      assert.equal(calls, 0)
      assert.equal(body.enabled, false)
      assert.ok(body.sources.every((source: { requests: number | null }) => source.requests === null))
    },
  )
})
