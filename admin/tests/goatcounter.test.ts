import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sealData } from 'iron-session'
import { GOATCOUNTER_SITES } from '../src/server/config.js'
import { createGoatCounter } from '../src/server/goatcounter.js'
import { OWNER_EMAIL } from '../src/server/access.js'
import { apiHeaders, SECRET, testConfig, withServer } from './harness.js'

const [site, otherSite] = GOATCOUNTER_SITES
const range = { from: '2026-11-01', to: '2026-11-02' }
const token = 'only-for-this-mock'
const responses = {
  total: { total: 7, total_events: 18, stats: [{ day: '2026-10-31', daily: 9 }, { day: range.from, daily: 7 }, { day: range.to, daily: 0 }] },
  hits: { hits: [{ event: false, path: '/docs', count: 5 }, { event: true, path: 'click', count: 2 }] },
  toprefs: { stats: [{ name: '', count: 3 }, { name: 'example.org', count: 2 }] },
  locations: { stats: [{ id: 'US', name: 'United States', count: 4 }] },
}

const mockFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input))
  assert.equal(url.origin, 'https://naijei.goatcounter.com')
  assert.equal(new Headers(init?.headers).get('authorization'), `Bearer ${token}`)
  const endpoint = url.pathname.replace('/api/v0/stats/', '') as keyof typeof responses
  assert.equal(url.searchParams.get('start'), `${range.from}T00:00:00Z`)
  assert.equal(url.searchParams.get('end'), `${range.to}T23:59:59Z`)
  assert.equal(url.searchParams.get('limit'), endpoint === 'total' ? null : '10')
  return Response.json(responses[endpoint])
}

test('parses four endpoints, coalesces concurrent calls, caches for an hour and honors Retry-After', async () => {
  let calls = 0, now = 0, limited = false
  const load = createGoatCounter(token, async (...args) => {
    calls++
    return limited ? new Response(token, { status: 429, headers: { 'Retry-After': '60' } }) : mockFetch(...args)
  }, () => now)
  const [report, concurrent] = await Promise.all([load(site, range), load(site, range)])
  assert.deepEqual(report, { status: 'ok', data: {
    visitors: 7, trend: [{ day: range.from, visitors: 7 }, { day: range.to, visitors: 0 }],
    pages: [{ label: '/docs', count: 5 }], countries: [{ label: 'United States', count: 4 }],
    referrers: [{ label: 'Direct / unknown', count: 3 }, { label: 'example.org', count: 2 }],
  } })
  assert.deepEqual(concurrent, report)
  now = 3_599_999
  assert.deepEqual(await load(site, range), report)
  assert.equal(calls, 4)
  limited = true
  now++
  assert.deepEqual(await load(site, range), { ...report, status: 'stale' })
  assert.equal((await load(site, { from: range.to, to: range.to })).status, 'rate-limited')
  assert.equal(calls, 5)
  now += 60_000
  limited = false
  assert.deepEqual(await load(site, range), report)
  assert.equal(calls, 9)
})

test('missing config makes no requests and upstream failures stay isolated and scrubbed', async () => {
  let calls = 0
  const fail: typeof fetch = async () => { calls++; throw new Error(token) }
  assert.deepEqual(await createGoatCounter(null, fail)(site, range), { status: 'not-configured' })
  assert.equal(calls, 0)
  assert.deepEqual(await createGoatCounter(token, fail)(site, range), { status: 'unavailable' })
  for (const status of [401, 403, 500]) {
    const load = createGoatCounter(token, async (url, init) => String(url).includes(otherSite.code)
      ? new Response(token, { status }) : mockFetch(url, init))
    assert.deepEqual(await load(otherSite, range), { status: status === 500 ? 'unavailable' : 'unauthorized' })
    assert.equal((await load(site, range)).status, 'ok')
  }
})

test('visitor API requires an owner session and keeps the token out of responses', async () => {
  let status = 401
  await withServer({ config: testConfig({ GOATCOUNTER_API_TOKEN: token }), goatcounterFetch: (url, init) =>
    status === 401 ? Promise.resolve(new Response(token, { status })) : mockFetch(url, init),
  }, async ({ base, origin }) => {
    const url = `${base}/api/goatcounter?site=naijei&from=${range.from}&to=${range.to}`
    assert.equal((await fetch(url, { headers: apiHeaders(origin) })).status, 401)
    const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
    const cookie = `naijei_admin=${sealed}`
    assert.equal((await fetch(url, { headers: apiHeaders('https://example.com', cookie) })).status, 403)
    const headers = apiHeaders(origin, cookie)
    assert.deepEqual(await (await fetch(url, { headers })).json(), { status: 'unauthorized' })
    status = 200
    const body = await (await fetch(url, { headers })).text()
    assert.equal(JSON.parse(body).data.visitors, 7)
    assert.equal(body.includes(token), false)
  })
})
