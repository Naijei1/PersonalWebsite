import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateEvent } from '../src/shared/events.js'
import { resolveSite } from '../src/shared/inventory.js'
import { aggregate, demoOverview, type StoredEvent } from '../src/shared/overview.js'
import { parseRange } from '../src/shared/range.js'
import { buildBody, nextGate, pageAllowed, parseConfig, referrerHostname } from '../src/collector/payload.js'
import { readFileSync } from 'node:fs'

const now = new Date('2026-11-08T15:00:00.000Z')

function stored(partial: Partial<StoredEvent> & Pick<StoredEvent, 'siteId' | 'path' | 'day'>): StoredEvent {
  return {
    referrerHost: null,
    visitHash: null,
    visitorHash: null,
    eventHash: null,
    receivedAt: `${partial.day}T12:00:00.000Z`,
    ...partial,
  }
}

test('gnarly is one site and is excluded from the main site', () => {
  assert.equal(resolveSite('naijei.com', '/')?.id, 'naijei')
  assert.equal(resolveSite('www.naijei.com', '/about')?.id, 'naijei')
  assert.equal(resolveSite('naijei.com', '/gnarly')?.id, 'gnarly')
  assert.equal(resolveSite('www.naijei.com', '/gnarly/map')?.id, 'gnarly')
  assert.equal(resolveSite('naijei.com', '/gnarlyish')?.id, 'naijei')
  assert.equal(resolveSite('flashcards.naijei.com', '/review')?.id, 'flashcards')
  assert.equal(resolveSite('sql.naijei.com', '/')?.id, 'sql')
  assert.equal(resolveSite('voter.naijei.com', '/board')?.id, 'voter')
  assert.equal(resolveSite('evil.com', '/'), null)
  assert.equal(resolveSite('naijei.com.evil.com', '/'), null)
  assert.equal(resolveSite('flashcards.naijei.com.evil.com', '/'), null)
})

test('events reject query strings, extra fields, and unknown hosts', () => {
  const good = validateEvent({
    host: 'NAIJEI.com',
    path: '/about',
    referrerHost: 'GitHub.com',
    visitId: '11111111-1111-4111-8111-111111111111',
  })
  assert.equal(good.ok, true)
  if (good.ok) {
    assert.equal(good.event.host, 'naijei.com')
    assert.equal(good.event.site.id, 'naijei')
    assert.equal(good.event.referrerHost, 'github.com')
  }
  assert.equal(validateEvent({ host: 'naijei.com', path: '/secret?token=abc' }).ok, false)
  assert.equal(validateEvent({ host: 'naijei.com', path: '/docs#private' }).ok, false)
  assert.equal(validateEvent({ host: 'naijei.com', path: '/../etc/passwd' }).ok, false)
  assert.equal(validateEvent({ host: 'naijei.com', path: '/a/../../b' }).ok, false)
  assert.equal(validateEvent({ host: 'evil.com', path: '/' }).ok, false)
  assert.equal(validateEvent({ host: 'naijei.com', path: '/', password: 'hunter2' }).ok, false)
  assert.equal(validateEvent({ host: 'naijei.com', path: '/', email: 'a@b.c' }).ok, false)
  assert.equal(validateEvent([{ host: 'naijei.com', path: '/' }]).ok, false)
  assert.equal(validateEvent({ host: 'naijei.com', path: '/', visitId: 'not-a-uuid' }).ok, false)
})

test('empty storage reports zeros and unavailable uniques', () => {
  const range = parseRange(undefined, undefined, now)
  assert.equal('from' in range, true)
  if (!('from' in range)) return
  const overview = aggregate([], range, 'all')
  assert.equal(overview.totals.pageviews, 0)
  assert.equal(overview.totals.visits, 0)
  assert.equal(overview.totals.estimatedUniques, null)
  assert.equal(overview.demo, false)
  assert.equal(overview.coverage.source, 'store')
  assert.match(overview.coverage.note, /No events are stored/)
  assert.equal(overview.trend.length, 28)
})

test('uniques are summed per day and gnarly is not double counted', () => {
  const range = { from: '2026-11-07', to: '2026-11-08' }
  const events = [
    stored({ siteId: 'naijei', path: '/', day: '2026-11-08', visitorHash: 'a', visitHash: 'v1' }),
    stored({ siteId: 'naijei', path: '/about', day: '2026-11-08', visitorHash: 'a', visitHash: 'v1' }),
    stored({ siteId: 'naijei', path: '/', day: '2026-11-07', visitorHash: 'a', visitHash: 'v2' }),
    stored({ siteId: 'gnarly', path: '/gnarly/', day: '2026-11-08', visitorHash: 'g' }),
  ]
  const all = aggregate(events, range, 'all')
  assert.equal(all.totals.pageviews, 4)
  assert.equal(all.totals.estimatedUniques, 3)
  const main = aggregate(events, range, 'naijei')
  assert.equal(main.totals.pageviews, 3)
  assert.equal(main.pages.some((page) => page.path.includes('gnarly')), false)
  const gnarly = aggregate(events, range, 'gnarly')
  assert.equal(gnarly.totals.pageviews, 1)
  const noKeys = aggregate([stored({ siteId: 'sql', path: '/', day: '2026-11-08' })], range, 'sql')
  assert.equal(noKeys.totals.pageviews, 1)
  assert.equal(noKeys.totals.estimatedUniques, null)
})

test('ranges reject inverted, future, and over-long windows', () => {
  assert.equal('error' in parseRange('2026-11-08', '2026-11-01', now), true)
  assert.equal('error' in parseRange('2026-11-01', '2026-11-09', now), true)
  assert.equal('error' in parseRange('2024-01-01', '2026-11-08', now), true)
  assert.equal('error' in parseRange('2026-02-31', '2026-11-08', now), true)
})

test('demo fixtures are labeled and stay inside the requested site', () => {
  const overview = demoOverview({ from: '2026-11-01', to: '2026-11-08' }, 'gnarly')
  assert.equal(overview.demo, true)
  assert.match(overview.coverage.note, /Demo fixture/)
  assert.ok(overview.totals.pageviews > 0)
  assert.equal(overview.sites.find((site) => site.id === 'naijei')?.pageviews, 0)
  assert.ok((overview.sites.find((site) => site.id === 'gnarly')?.pageviews || 0) > 0)
})

test('collector stays disabled unless enabled is exactly true', () => {
  assert.equal(parseConfig(undefined), null)
  assert.equal(parseConfig({ endpoint: 'https://admin.naijei.com/api/collect', key: INGEST_PLACEHOLDER }), null)
  assert.equal(parseConfig({ enabled: 'true', endpoint: 'https://admin.naijei.com/api/collect', key: INGEST_PLACEHOLDER }), null)
  const parsed = parseConfig({
    enabled: true,
    endpoint: 'https://admin.naijei.com/api/collect',
    key: INGEST_PLACEHOLDER,
    hosts: ['naijei.com'],
  })
  assert.ok(parsed)
  assert.equal(parseConfig({ enabled: true, endpoint: 'http://evil.example/collect', key: INGEST_PLACEHOLDER }), null)
  assert.equal(
    parseConfig({ enabled: true, endpoint: 'https://admin.naijei.com/api/collect?x=1', key: INGEST_PLACEHOLDER }),
    null,
  )
  assert.equal(parseConfig({ enabled: true, endpoint: 'https://admin.naijei.com/api/collect', key: 'short', hosts: ['nope.example'] }), null)
})

const INGEST_PLACEHOLDER = 'replace-with-ingest'

test('collector payload drops query strings and refuses other hosts', () => {
  assert.equal(referrerHostname('https://user:secret@google.com/search?q=private'), null)
  assert.equal(referrerHostname('https://google.com/search?q=private'), 'google.com')
  const body = buildBody({
    host: 'flashcards.naijei.com',
    path: '/review',
    referrer: 'https://google.com/search?q=private#token',
    visitId: null,
    visitorId: null,
    eventId: '11111111-1111-4111-8111-111111111111',
  })
  assert.ok(body)
  assert.equal(body?.includes('private'), false)
  assert.equal(body?.includes('?'), false)
  assert.equal(body?.includes('token'), false)
  assert.equal(buildBody({
    host: 'evil.com',
    path: '/',
    referrer: '',
    visitId: null,
    visitorId: null,
    eventId: '11111111-1111-4111-8111-111111111111',
  }), null)
  assert.equal(pageAllowed('naijei.com', '/gnarly', ['flashcards.naijei.com']), false)
  assert.equal(pageAllowed('naijei.com', '/gnarly/', ['naijei.com']), true)
  assert.equal(nextGate(null, 1_000)?.count, 1)
  assert.equal(nextGate({ lastAt: 1_000, count: 1 }, 1_500), null)
  assert.equal(nextGate({ lastAt: 0, count: 30 }, 10_000), null)
})

test('the collector module does not install itself', () => {
  const source = readFileSync(new URL('../src/collector/browser.ts', import.meta.url), 'utf8')
  assert.equal(/^\s*install\(/m.test(source), false)
  assert.match(source, /export function install/)
})

test('client source does not contain server secrets', () => {
  for (const file of ['../src/client/App.tsx', '../src/client/Chart.tsx', '../src/client/main.tsx', '../index.html']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    assert.equal(/GOOGLE_CLIENT_SECRET\s*[:=]\s*['"][^'"]+['"]/.test(source), false)
    assert.equal(/SESSION_SECRET\s*[:=]\s*['"][^'"]+['"]/.test(source), false)
    assert.equal(/INGEST_KEY\s*[:=]\s*['"][^'"]+['"]/.test(source), false)
  }
})
