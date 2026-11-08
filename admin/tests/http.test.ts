import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { sealData } from 'iron-session'
import { createApp } from '../src/server/app.js'
import { loadConfig } from '../src/server/config.js'
import { OWNER_EMAIL } from '../src/server/access.js'
import { INGEST, ORIGIN, SALT, SECRET, apiHeaders, scriptedProvider, signIn, testConfig, withServer, Jar } from './harness.js'

const owner = { email: OWNER_EMAIL, email_verified: true, name: 'Naijei' }
const eventId = '11111111-1111-4111-8111-111111111111'
const visitId = '22222222-2222-4222-8222-222222222222'
const visitorId = '33333333-3333-4333-8333-333333333333'

function collect(base: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return fetch(`${base}/api/collect`, {
    method: 'POST',
    headers: {
      origin: 'https://naijei.com',
      authorization: `Bearer ${INGEST}`,
      'content-type': 'application/json',
      'user-agent': 'naijei-admin-test',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

test('anonymous overview and export are refused', async () => {
  await withServer({}, async ({ base, origin }) => {
    const overview = await fetch(`${base}/api/overview`, { headers: apiHeaders(origin) })
    const exported = await fetch(`${base}/api/export`, { headers: apiHeaders(origin) })
    assert.equal(overview.status, 401)
    assert.equal(exported.status, 401)
    const body = await overview.json()
    assert.equal(JSON.stringify(body).includes('pageviews'), false)
  })
})

test('a request without browser origin signals is refused', async () => {
  await withServer({}, async ({ base }) => {
    const response = await fetch(`${base}/api/overview`)
    assert.equal(response.status, 403)
  })
})

test('a cross-site overview is refused even with an owner cookie', async () => {
  const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
  await withServer({}, async ({ base, origin }) => {
    const response = await fetch(`${base}/api/overview`, {
      headers: {
        origin: 'https://evil.example',
        'sec-fetch-site': 'cross-site',
        cookie: `naijei_admin=${sealed}`,
      },
    })
    assert.equal(response.status, 403)
    const same = await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, `naijei_admin=${sealed}`) })
    assert.equal(same.status, 200)
  })
})

test('a sealed cookie for another email or a tampered cookie is refused', async () => {
  const other = await sealData({ email: 'other@gmail.com' }, { password: SECRET, ttl: 3600 })
  const ownerSeal = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
  const tampered = `${ownerSeal.slice(0, 40)}X${ownerSeal.slice(41)}`
  await withServer({}, async ({ base, origin }) => {
    const wrong = await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, `naijei_admin=${other}`) })
    const broken = await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, `naijei_admin=${tampered}`) })
    assert.equal(wrong.status, 401)
    assert.equal(broken.status, 401)
  })
})

test('the owner session can read an empty store and export it', async () => {
  const sealed = await sealData({ email: OWNER_EMAIL, loginAt: '2026-11-08T00:00:00.000Z' }, { password: SECRET, ttl: 3600 })
  await withServer({}, async ({ base, origin }) => {
    const overview = await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, `naijei_admin=${sealed}`) })
    assert.equal(overview.status, 200)
    const body = await overview.json()
    assert.equal(body.demo, false)
    assert.equal(body.totals.pageviews, 0)
    assert.equal(body.totals.estimatedUniques, null)
    assert.match(body.coverage.note, /No events are stored/)
    const exported = await fetch(`${base}/api/export?site=all`, { headers: apiHeaders(origin, `naijei_admin=${sealed}`) })
    assert.equal(exported.status, 200)
    assert.match(exported.headers.get('content-type') || '', /text\/csv/)
    const csv = await exported.text()
    assert.match(csv, /kind,day,site,label,pageviews,visits,estimated_uniques/)
    assert.equal(csv.includes(OWNER_EMAIL), false)
    assert.equal(csv.includes(SALT), false)
  })
})

test('google callback refuses unverified and foreign accounts and accepts the owner', async () => {
  await withServer({ provider: scriptedProvider({ email: OWNER_EMAIL, email_verified: false }) }, async ({ base, origin }) => {
    const jar = new Jar()
    const location = await signIn(base, jar)
    assert.equal(location, '/?auth=denied')
    const overview = await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, jar.header()) })
    assert.equal(overview.status, 401)
  })
  await withServer({ provider: scriptedProvider({ email: 'other@gmail.com', email_verified: true }) }, async ({ base, origin }) => {
    const jar = new Jar()
    assert.equal(await signIn(base, jar), '/?auth=denied')
    assert.equal((await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, jar.header()) })).status, 401)
  })
  await withServer({ provider: scriptedProvider(owner) }, async ({ base, origin }) => {
    const jar = new Jar()
    assert.equal(await signIn(base, jar), '/')
    const overview = await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, jar.header()) })
    assert.equal(overview.status, 200)
    const session = await fetch(`${base}/api/session`, { headers: apiHeaders(origin, jar.header()) })
    const sessionBody = await session.json()
    assert.equal(sessionBody.authenticated, true)
    assert.equal(sessionBody.email, OWNER_EMAIL)
    const logout = await fetch(`${base}/auth/logout`, { method: 'POST', headers: apiHeaders(origin, jar.header()) })
    assert.equal(logout.status, 204)
    jar.store(logout)
    assert.equal((await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, jar.header()) })).status, 401)
  })
})

test('sign-in ignores an off-site next parameter and a hostile authorization host', async () => {
  await withServer({ provider: scriptedProvider(owner) }, async ({ base }) => {
    const start = await fetch(`${base}/auth/google?next=https://evil.example`, { redirect: 'manual' })
    const location = start.headers.get('location') || ''
    assert.equal(new URL(location).origin, 'https://accounts.google.com')
    assert.equal(location.includes('evil.example'), false)
  })
  await withServer(
    {
      provider: {
        async authorizationUrl() {
          return new URL('https://evil.example/steal')
        },
        async claimsFromCallback() {
          return owner
        },
      },
    },
    async ({ base }) => {
      const start = await fetch(`${base}/auth/google`, { redirect: 'manual' })
      assert.equal(start.headers.get('location'), '/?auth=failed')
    },
  )
})

test('a mismatched oauth state does not create a session', async () => {
  await withServer({ provider: scriptedProvider(owner) }, async ({ base, origin }) => {
    const start = await fetch(`${base}/auth/google`, { redirect: 'manual' })
    const jar = new Jar()
    jar.store(start)
    const callback = await fetch(`${base}/auth/callback?code=test&state=nope`, {
      redirect: 'manual',
      headers: { cookie: jar.header() },
    })
    assert.equal(callback.headers.get('location'), '/?auth=failed')
    jar.store(callback)
    assert.equal((await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, jar.header()) })).status, 401)
  })
})

test('logout from another site does not clear a valid session', async () => {
  const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
  await withServer({}, async ({ base, origin }) => {
    const denied = await fetch(`${base}/auth/logout`, {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site', cookie: `naijei_admin=${sealed}` },
    })
    assert.equal(denied.status, 403)
    assert.equal((await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, `naijei_admin=${sealed}`) })).status, 200)
    assert.equal((await fetch(`${base}/auth/logout`)).status, 404)
  })
})

test('unconfigured sign-in does not redirect to Google', async () => {
  const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: ORIGIN })
  await withServer({ config }, async ({ base }) => {
    const start = await fetch(`${base}/auth/google`, { redirect: 'manual' })
    assert.equal(start.status, 303)
    assert.equal(start.headers.get('location'), '/?auth=unconfigured')
    const session = await fetch(`${base}/api/session`)
    const body = await session.json()
    assert.equal(body.configured, false)
    assert.equal(body.authenticated, false)
    assert.equal(JSON.stringify(body).includes('test-client'), false)
  })
})

test('production demo mode cannot bypass sign-in', async () => {
  const config = loadConfig({
    NODE_ENV: 'production',
    ADMIN_DEMO: '1',
    APP_ORIGIN: 'https://admin.naijei.com',
    GOOGLE_CLIENT_ID: 'id',
    GOOGLE_CLIENT_SECRET: 'secret',
    SESSION_SECRET: SECRET,
  })
  assert.equal(config.demo, 'off')
  await withServer({ config }, async ({ base }) => {
    const response = await fetch(`${base}/api/overview`, { headers: apiHeaders('https://admin.naijei.com') })
    assert.equal(response.status, 401)
  })
})

test('an injected provider is refused in production', () => {
  const config = testConfig({ NODE_ENV: 'production', APP_ORIGIN: 'https://admin.naijei.com' })
  assert.throws(() => createApp({ config, dataFile: '/tmp/naijei-admin-should-not-write', provider: scriptedProvider(owner) }))
})

test('explicit local demo is labeled and does not require a session', async () => {
  await withServer({ config: testConfig({ ADMIN_DEMO: '1' }) }, async ({ base, origin }) => {
    const response = await fetch(`${base}/api/overview?site=sql`, { headers: apiHeaders(origin) })
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.demo, true)
    assert.match(body.coverage.note, /Demo fixture/)
    assert.ok(body.totals.pageviews > 0)
    const exported = await fetch(`${base}/api/export`, { headers: apiHeaders(origin) })
    const csv = await exported.text()
    assert.match(csv, /Demo fixture/)
  })
})

test('empty preview stays empty', async () => {
  await withServer({ config: testConfig({ ADMIN_DEMO: 'empty' }) }, async ({ base, origin }) => {
    const body = await (await fetch(`${base}/api/overview`, { headers: apiHeaders(origin) })).json()
    assert.equal(body.preview, 'empty')
    assert.equal(body.demo, false)
    assert.equal(body.totals.pageviews, 0)
    assert.equal(body.totals.estimatedUniques, null)
  })
})

test('collect rejects bad events, bots, duplicates, and the wrong key', async () => {
  await withServer({ collectPerMinute: 20 }, async ({ base, origin }) => {
    const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
    const cookie = `naijei_admin=${sealed}`
    const good = {
      host: 'naijei.com',
      path: '/about',
      referrerHost: 'github.com',
      eventId,
      visitId,
      visitorId,
    }
    assert.equal((await collect(base, good)).status, 204)
    assert.equal((await collect(base, good)).status, 204)
    assert.equal((await collect(base, { ...good, path: '/about?token=secret', eventId: '44444444-4444-4444-8444-444444444444' })).status, 400)
    assert.equal((await collect(base, { ...good, path: '/other', password: 'x', eventId: '55555555-5555-4555-8555-555555555555' })).status, 400)
    assert.equal((await collect(base, { host: 'naijei.com', path: '/gnarly/map', eventId: '66666666-6666-4666-8666-666666666666' }, { 'user-agent': 'Mozilla/5.0 Googlebot' })).status, 204)
    assert.equal((await collect(base, { host: 'flashcards.naijei.com', path: '/' })).status, 403)
    assert.equal((await collect(base, good, { authorization: 'Bearer wrong-key-value' })).status, 401)
    const overview = await (await fetch(`${base}/api/overview?site=all`, { headers: apiHeaders(origin, cookie) })).json()
    assert.equal(overview.totals.pageviews, 1)
    assert.equal(overview.totals.estimatedUniques, 1)
    assert.equal(overview.sites.find((site: { id: string }) => site.id === 'gnarly').pageviews, 0)
    const main = await (await fetch(`${base}/api/overview?site=naijei`, { headers: apiHeaders(origin, cookie) })).json()
    assert.equal(main.totals.pageviews, 1)
    const fileWouldLeak = JSON.stringify(overview)
    assert.equal(fileWouldLeak.includes(visitorId), false)
    assert.equal(fileWouldLeak.includes(visitId), false)
    const exported = await (await fetch(`${base}/api/export`, { headers: apiHeaders(origin, cookie) })).text()
    assert.equal(exported.includes(visitorId), false)
    assert.equal(exported.includes(OWNER_EMAIL), false)
  })
})

test('gnarly traffic is attributed once', async () => {
  await withServer({}, async ({ base, origin }) => {
    const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
    const cookie = `naijei_admin=${sealed}`
    assert.equal((await collect(base, { host: 'www.naijei.com', path: '/gnarly/', eventId: '77777777-7777-4777-8777-777777777777' })).status, 204)
    const all = await (await fetch(`${base}/api/overview`, { headers: apiHeaders(origin, cookie) })).json()
    const main = await (await fetch(`${base}/api/overview?site=naijei`, { headers: apiHeaders(origin, cookie) })).json()
    const gnarly = await (await fetch(`${base}/api/overview?site=gnarly`, { headers: apiHeaders(origin, cookie) })).json()
    assert.equal(all.totals.pageviews, 1)
    assert.equal(main.totals.pageviews, 0)
    assert.equal(gnarly.totals.pageviews, 1)
  })
})

test('collect is disabled until an ingest key exists', async () => {
  const config = testConfig({ INGEST_KEY: '' })
  await withServer({ config }, async ({ base }) => {
    const response = await collect(base, { host: 'naijei.com', path: '/' })
    assert.equal(response.status, 404)
  })
})

test('collect preflight allows inventory origins only', async () => {
  await withServer({}, async ({ base }) => {
    const ok = await fetch(`${base}/api/collect`, { method: 'OPTIONS', headers: { origin: 'https://sql.naijei.com' } })
    assert.equal(ok.status, 204)
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://sql.naijei.com')
    const evil = await fetch(`${base}/api/collect`, { method: 'OPTIONS', headers: { origin: 'https://evil.example' } })
    assert.equal(evil.status, 403)
    assert.equal(evil.headers.get('access-control-allow-origin'), null)
  })
})

test('oversized and query-string collect requests are refused', async () => {
  await withServer({}, async ({ base }) => {
    const queried = await fetch(`${base}/api/collect?key=1`, {
      method: 'POST',
      headers: {
        origin: 'https://naijei.com',
        authorization: `Bearer ${INGEST}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ host: 'naijei.com', path: '/' }),
    })
    assert.equal(queried.status, 400)
    const oversized = await fetch(`${base}/api/collect`, {
      method: 'POST',
      headers: {
        origin: 'https://naijei.com',
        authorization: `Bearer ${INGEST}`,
        'content-type': 'application/json',
      },
      body: `{"host":"naijei.com","path":"/${'b'.repeat(4000)}"}`,
    })
    assert.equal(oversized.status, 413)
  })
})

test('the rate limit rejects a burst', async () => {
  await withServer({ collectPerMinute: 2 }, async ({ base }) => {
    const body = { host: 'voter.naijei.com', path: '/board' }
    const headers = { origin: 'https://voter.naijei.com' }
    assert.equal((await collect(base, body, headers)).status, 204)
    assert.equal((await collect(base, { ...body, path: '/next' }, headers)).status, 204)
    assert.equal((await collect(base, { ...body, path: '/again' }, headers)).status, 429)
  })
})

test('invalid filters are rejected for an owner', async () => {
  const sealed = await sealData({ email: OWNER_EMAIL }, { password: SECRET, ttl: 3600 })
  await withServer({}, async ({ base, origin }) => {
    const headers = apiHeaders(origin, `naijei_admin=${sealed}`)
    assert.equal((await fetch(`${base}/api/overview?site=nope`, { headers })).status, 400)
    assert.equal((await fetch(`${base}/api/overview?from=2026-12-01&to=2026-12-02`, { headers })).status, 400)
    assert.equal((await fetch(`${base}/api/export?from=2020-01-01&to=2026-11-08`, { headers })).status, 400)
  })
})

test('a built client shell is served when present', async () => {
  const index = fileURLToPath(new URL('../dist/client/index.html', import.meta.url))
  if (!existsSync(index)) return
  const html = readFileSync(index, 'utf8')
  if (!html.includes('Analytics')) return
  await withServer({}, async ({ base }) => {
    const response = await fetch(`${base}/`)
    const text = await response.text()
    assert.equal(response.status, 200)
    assert.match(text, /Analytics/)
    assert.match(response.headers.get('content-security-policy') || '', /default-src 'self'/)
  })
})
