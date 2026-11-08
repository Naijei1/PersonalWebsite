import type { AddressInfo } from 'node:net'
import { mkdtempSync, rmSync } from 'node:fs'
import type { Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp, type CreateAppOptions } from '../src/server/app.js'
import { loadConfig, type AppConfig } from '../src/server/config.js'
import type { IdentityProvider } from '../src/server/google.js'
import type { MetricQuerier } from '../src/server/hosting.js'
import type { OauthTxn } from '../src/server/session.js'

export const SECRET = '0123456789abcdef0123456789abcdef'
export const ORIGIN = 'http://127.0.0.1:8787'
export const INGEST = 'test-ingest-key-16'
export const SALT = 'test-visitor-salt-1'

export function testConfig(overrides: NodeJS.ProcessEnv = {}): AppConfig {
  return loadConfig({
    NODE_ENV: 'test',
    APP_ORIGIN: ORIGIN,
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    SESSION_SECRET: SECRET,
    INGEST_KEY: INGEST,
    VISITOR_HASH_SALT: SALT,
    ...overrides,
  })
}

export function apiHeaders(origin: string, cookie = ''): HeadersInit {
  return {
    origin,
    'sec-fetch-site': 'same-origin',
    accept: 'application/json',
    ...(cookie ? { cookie } : {}),
  }
}

export class Jar {
  private readonly cookies = new Map<string, string>()

  store(response: Response): void {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';')
      const eq = pair.indexOf('=')
      const name = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1)
      const lower = cookie.toLowerCase()
      if (!value || lower.includes('max-age=0') || lower.includes('expires=thu, 01 jan 1970')) this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
  }

  header(): string {
    return [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; ')
  }
}

export function scriptedProvider(next: unknown): IdentityProvider {
  return {
    async authorizationUrl(txn: OauthTxn) {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      url.searchParams.set('state', txn.state)
      return url
    },
    async claimsFromCallback(current: URL, txn: OauthTxn) {
      if (current.searchParams.get('state') !== txn.state) throw new Error('state')
      if (next instanceof Error) throw next
      return next
    },
  }
}

export async function withServer(
  options: {
    config?: AppConfig
    provider?: IdentityProvider
    now?: () => Date
    collectPerMinute?: number
    hostingQuery?: MetricQuerier
  },
  fn: (ctx: { base: string; origin: string; config: AppConfig }) => Promise<void>,
): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'naijei-admin-'))
  const config = options.config ?? testConfig()
  const createOptions: CreateAppOptions = {
    config,
    dataFile: join(dir, 'events.ndjson'),
    now: options.now ?? (() => new Date('2026-11-08T15:00:00.000Z')),
    collectPerMinute: options.collectPerMinute,
    ...(options.hostingQuery ? { hostingQuery: options.hostingQuery } : {}),
  }
  if (options.provider) createOptions.provider = options.provider
  const app = createApp(createOptions)
  const server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening))
  })
  const address = server.address() as AddressInfo
  try {
    await fn({ base: `http://127.0.0.1:${address.port}`, origin: config.appOrigin || ORIGIN, config })
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
    rmSync(dir, { recursive: true, force: true })
  }
}

export async function signIn(base: string, providerClaimsReady: Jar): Promise<string> {
  const start = await fetch(`${base}/auth/google`, { redirect: 'manual' })
  providerClaimsReady.store(start)
  const location = start.headers.get('location')
  if (!location) throw new Error('missing redirect')
  const state = new URL(location, base).searchParams.get('state')
  const callback = await fetch(`${base}/auth/callback?code=test&state=${encodeURIComponent(state || '')}`, {
    redirect: 'manual',
    headers: { cookie: providerClaimsReady.header() },
  })
  providerClaimsReady.store(callback)
  return callback.headers.get('location') || ''
}
