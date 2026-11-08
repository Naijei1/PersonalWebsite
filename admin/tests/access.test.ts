import assert from 'node:assert/strict'
import { test } from 'node:test'
import { OWNER_EMAIL, decideAccess } from '../src/server/access.js'
import { isAllowedAppOrigin, loadConfig, productionBlockers } from '../src/server/config.js'
import { googleAuthParameters } from '../src/server/google.js'
import { sessionOptions } from '../src/server/session.js'
import { testConfig } from './harness.js'

test('owner with a verified boolean claim is allowed', () => {
  const decision = decideAccess({ email: OWNER_EMAIL, email_verified: true, name: 'Naijei Jiang' })
  assert.equal(decision.ok, true)
  if (decision.ok) assert.equal(decision.email, OWNER_EMAIL)
})

test('missing, unverified, and other accounts are refused', () => {
  assert.equal(decideAccess(null).ok, false)
  assert.equal(decideAccess([]).ok, false)
  assert.equal(decideAccess({}).ok, false)
  assert.equal(decideAccess({ email: OWNER_EMAIL }).ok, false)
  assert.equal(decideAccess({ email: OWNER_EMAIL, email_verified: 'true' }).ok, false)
  assert.equal(decideAccess({ email: OWNER_EMAIL, email_verified: 1 }).ok, false)
  assert.equal(decideAccess({ email: OWNER_EMAIL, email_verified: false }).ok, false)
  assert.equal(decideAccess({ email_verified: true }).ok, false)
  assert.equal(decideAccess({ email: 'other@gmail.com', email_verified: true }).ok, false)
  assert.equal(decideAccess({ email: 'NJ277@cornell.edu', email_verified: true }).ok, false)
  assert.equal(decideAccess({ email: ' nj277@cornell.edu', email_verified: true }).ok, false)
  assert.equal(decideAccess({ email: 'nj277@cornell.edu ', email_verified: true }).ok, false)
})

test('an env allowlist cannot add another email', () => {
  const config = loadConfig({ ADMIN_ALLOWED_EMAILS: 'other@gmail.com', NODE_ENV: 'test' })
  assert.equal('allowedEmails' in config, false)
  assert.equal(decideAccess({ email: 'other@gmail.com', email_verified: true }).ok, false)
})

test('app origin is the admin host or a local high port', () => {
  assert.equal(isAllowedAppOrigin('https://admin.naijei.com'), true)
  assert.equal(isAllowedAppOrigin('http://127.0.0.1:8787'), true)
  assert.equal(isAllowedAppOrigin('http://localhost:8787'), true)
  assert.equal(isAllowedAppOrigin('https://admin.naijei.com.evil.com'), false)
  assert.equal(isAllowedAppOrigin('http://admin.naijei.com'), false)
  assert.equal(isAllowedAppOrigin('https://evil.example'), false)
  assert.equal(isAllowedAppOrigin('http://127.0.0.1:80'), false)
  assert.equal(isAllowedAppOrigin('https://admin.naijei.com/extra'), false)
})

test('production ignores demo mode and refuses a short secret', () => {
  const config = loadConfig({
    NODE_ENV: 'production',
    ADMIN_DEMO: '1',
    APP_ORIGIN: 'https://admin.naijei.com',
    GOOGLE_CLIENT_ID: 'id',
    GOOGLE_CLIENT_SECRET: 'secret',
    SESSION_SECRET: 'too-short',
    INGEST_KEY: 'short',
  })
  assert.equal(config.demo, 'off')
  assert.equal(config.authReady, false)
  assert.ok(productionBlockers(config).includes('SESSION_SECRET'))
  assert.ok(productionBlockers(config).includes('INGEST_KEY'))
})

test('production boot lists missing setting names and not values', () => {
  const secret = 'super-secret-value'
  const missing = productionBlockers(loadConfig({ NODE_ENV: 'production', GOOGLE_CLIENT_SECRET: secret }))
  assert.deepEqual(missing, ['APP_ORIGIN', 'GOOGLE_CLIENT_ID', 'SESSION_SECRET'])
  assert.equal(missing.join(' ').includes(secret), false)
})

test('local demo is explicit and test-only', () => {
  assert.equal(testConfig({ ADMIN_DEMO: '1' }).demo, 'demo')
  assert.equal(testConfig({ ADMIN_DEMO: 'empty' }).demo, 'empty')
  assert.equal(testConfig().demo, 'off')
  assert.equal(loadConfig({ NODE_ENV: 'development', ADMIN_DEMO: '1' }).demo, 'demo')
})

test('google parameters pin the callback, email scope, and cornell hint', () => {
  const params = googleAuthParameters(
    { state: 'state', nonce: 'nonce', codeVerifier: 'verifier' },
    'https://admin.naijei.com',
    'challenge',
  )
  assert.equal(params.redirect_uri, 'https://admin.naijei.com/auth/callback')
  assert.equal(params.scope, 'openid email')
  assert.equal(params.hd, 'cornell.edu')
  assert.equal(params.code_challenge_method, 'S256')
})

test('session cookies are httpOnly and use the host prefix only on https', () => {
  const local = sessionOptions(testConfig(), 'admin')
  assert.equal(local.cookieName, 'naijei_admin')
  assert.equal(local.cookieOptions?.httpOnly, true)
  assert.equal(local.cookieOptions?.secure, false)
  assert.equal(local.cookieOptions?.sameSite, 'lax')
  const hosted = sessionOptions(
    testConfig({ APP_ORIGIN: 'https://admin.naijei.com', NODE_ENV: 'production' }),
    'admin',
  )
  assert.equal(hosted.cookieName, '__Host-naijei_admin')
  assert.equal(hosted.cookieOptions?.secure, true)
  assert.equal(hosted.cookieOptions?.domain, undefined)
})
