import assert from 'node:assert/strict'
import { test } from 'node:test'
import worker, { sanitize } from '../src/index.js'

const TOKEN = 'test-token-1234567890'

function makeEnv(overrides = {}) {
  const store = new Map()
  return {
    WRITE_TOKEN: TOKEN,
    ALLOWED_ORIGINS: 'https://naijei.com',
    PAUSED: 'false',
    WATCH: {
      get: async (key, type) => {
        const v = store.get(key)
        return v === undefined ? null : type === 'json' ? JSON.parse(v) : v
      },
      put: async (key, value) => void store.set(key, value),
    },
    ...overrides,
  }
}
const ctx = { waitUntil: () => {} }
const call = (env, method, path, { body, token, origin } = {}) =>
  worker.fetch(
    new Request(`https://watch.example${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(origin ? { origin } : {}),
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    }),
    env,
    ctx,
  )

test('rejects writes without the token', async () => {
  const env = makeEnv()
  assert.equal((await call(env, 'POST', '/snapshot', { body: { steps: 1 } })).status, 401)
  assert.equal((await call(env, 'POST', '/snapshot', { body: { steps: 1 }, token: 'wrong' })).status, 401)
})

test('stores a sanitized snapshot and serves it with CORS', async () => {
  const env = makeEnv()
  const res = await call(env, 'POST', '/snapshot', {
    token: TOKEN,
    body: {
      heartRate: '72 count/min',
      steps: '8,412',
      moveKcal: 410.6,
      moveGoal: 500,
      exerciseMin: 25,
      exerciseGoal: 30,
      standHours: 9,
      standGoal: 12,
      workoutType: 'Outdoor Run<script>',
      workoutMinutes: 31.4,
      workoutEnded: '2026-10-05T07:30:00-04:00',
      latitude: 42.44,
    },
  })
  assert.equal(res.status, 200)

  const get = await call(env, 'GET', '/snapshot', { origin: 'https://naijei.com' })
  assert.equal(get.headers.get('access-control-allow-origin'), 'https://naijei.com')
  const data = await get.json()
  assert.equal(data.heartRate, 72)
  assert.equal(data.steps, 8412)
  assert.deepEqual(data.rings.move, { value: 411, goal: 500 })
  assert.equal(data.workout.type, 'Outdoor Runscript')
  assert.equal(data.workout.minutes, 31)
  assert.equal(data.workout.endedAt, '2026-10-05T11:30:00.000Z')
  assert.equal(data.latitude, undefined)
  assert.ok(data.updatedAt)
})

test('does not send CORS headers to unknown origins', async () => {
  const get = await call(makeEnv(), 'GET', '/snapshot', { origin: 'https://evil.example' })
  assert.equal(get.headers.get('access-control-allow-origin'), null)
})

test('skips writes less than a minute apart', async () => {
  const env = makeEnv()
  await call(env, 'POST', '/snapshot', { token: TOKEN, body: { steps: 100 } })
  const second = await (await call(env, 'POST', '/snapshot', { token: TOKEN, body: { steps: 200 } })).json()
  assert.ok(second.skipped)
  assert.equal((await (await call(env, 'GET', '/snapshot')).json()).steps, 100)
})

test('pause hides stats; resume restores them', async () => {
  const env = makeEnv()
  await call(env, 'POST', '/snapshot', { token: TOKEN, body: { steps: 100 } })
  await call(env, 'POST', '/pause', { token: TOKEN, body: { paused: true } })
  assert.deepEqual(await (await call(env, 'GET', '/snapshot')).json(), { paused: true })
  await call(env, 'POST', '/pause', { token: TOKEN, body: { paused: false } })
  assert.equal((await (await call(env, 'GET', '/snapshot')).json()).steps, 100)
})

test('PAUSED var is a kill switch', async () => {
  const env = makeEnv({ PAUSED: 'true' })
  await call(env, 'POST', '/snapshot', { token: TOKEN, body: { steps: 100 } })
  assert.deepEqual(await (await call(env, 'GET', '/snapshot')).json(), { paused: true })
})

test('empty store and bad bodies', async () => {
  const env = makeEnv()
  assert.deepEqual(await (await call(env, 'GET', '/snapshot')).json(), { empty: true })
  assert.equal((await call(env, 'POST', '/snapshot', { token: TOKEN, body: '[1,2]' })).status, 400)
  assert.equal((await call(env, 'POST', '/snapshot', { token: TOKEN, body: 'x'.repeat(5000) })).status, 400)
})

test('sanitize clamps and drops rings without goals', () => {
  const s = sanitize({ heartRate: 999, steps: -5, moveKcal: 300 })
  assert.equal(s.heartRate, 240)
  assert.equal(s.steps, undefined)
  assert.equal(s.rings.move, undefined)
  assert.equal(s.workout, undefined)
})
