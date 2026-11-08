import express, { type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decideAccess, digestEqual } from './access.js'
import { looksLikeBot, validateEvent } from '../shared/events.js'
import { SITES, siteById } from '../shared/inventory.js'
import { aggregate, demoOverview, emptyOverview, type Overview } from '../shared/overview.js'
import { parseRange, utcDay } from '../shared/range.js'
import type { AppConfig } from './config.js'
import { GoogleIdentityProvider, type IdentityProvider } from './google.js'
import { RateLimiter } from './limit.js'
import { adminSession, newTxn, oauthSession } from './session.js'
import { EventStore, keyHash, type NewEvent } from './store.js'

export type CreateAppOptions = {
  config: AppConfig
  dataFile: string
  provider?: IdentityProvider
  now?: () => Date
  collectPerMinute?: number
}

const CLIENT_DIR = fileURLToPath(new URL('../../dist/client/', import.meta.url))

export function createApp(options: CreateAppOptions): express.Express {
  const { config } = options
  if (options.provider && config.nodeEnv === 'production') {
    throw new Error('Refusing an injected identity provider in production.')
  }
  const now = options.now ?? (() => new Date())
  const store = EventStore.open(options.dataFile)
  const provider =
    options.provider ??
    (config.authReady && config.appOrigin && config.googleClientId && config.googleClientSecret
      ? new GoogleIdentityProvider({
          appOrigin: config.appOrigin,
          googleClientId: config.googleClientId,
          googleClientSecret: config.googleClientSecret,
        })
      : null)
  const collectLimit = new RateLimiter(options.collectPerMinute ?? 30, 60_000, () => now().getTime())
  const authLimit = new RateLimiter(20, 60_000, () => now().getTime())

  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', false)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          styleSrcAttr: ["'unsafe-inline'"],
          fontSrc: ['https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      hsts: config.appOrigin?.startsWith('https://') ? { maxAge: 15_552_000, includeSubDomains: false } : false,
    }),
  )
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.get('/api/session', asyncRoute(async (req, res) => {
    const preview = config.demo
    if (!config.authReady || !config.sessionSecret || !config.appOrigin) {
      res.json({ configured: false, authenticated: false, email: null, preview })
      return
    }
    if (!browserSameOrigin(req, config.appOrigin)) {
      res.status(403).json({ error: 'cross-origin' })
      return
    }
    const session = await adminSession(req, res, config)
    const decision = decideAccess({ email: session.email, email_verified: true })
    res.json({
      configured: true,
      authenticated: decision.ok,
      email: decision.ok ? decision.email : null,
      preview,
    })
  }))

  app.get('/api/overview', asyncRoute(async (req, res) => {
    if (!(await guardData(req, res, config))) return
    const built = buildOverview(req, store, config, now)
    if ('error' in built) {
      res.status(400).json({ error: built.error })
      return
    }
    res.json(built)
  }))

  app.get('/api/export', asyncRoute(async (req, res) => {
    if (!(await guardData(req, res, config))) return
    const built = buildOverview(req, store, config, now)
    if ('error' in built) {
      res.status(400).json({ error: built.error })
      return
    }
    res.set('Content-Type', 'text/csv; charset=utf-8')
    res.set('Content-Disposition', 'attachment; filename="naijei-analytics.csv"')
    res.send(toCsv(built))
  }))

  app.options('/api/collect', (req, res) => {
    const origin = allowedCollectOrigin(req.get('origin'), config.nodeEnv)
    if (!origin) {
      res.status(403).end()
      return
    }
    res.set(collectCors(origin))
    res.status(204).end()
  })

  app.post(
    '/api/collect',
    express.json({ limit: '2kb', strict: true, type: ['application/json'] }),
    asyncRoute(async (req, res) => {
      if (!config.ingestKey) {
        res.status(404).json({ error: 'collect-disabled' })
        return
      }
      if (req.originalUrl.includes('?')) {
        res.status(400).json({ error: 'no-query' })
        return
      }
      const origin = allowedCollectOrigin(req.get('origin'), config.nodeEnv)
      if (!origin) {
        res.status(403).json({ error: 'origin' })
        return
      }
      res.set(collectCors(origin))
      const token = bearer(req.get('authorization'))
      if (!token || !digestEqual(token, config.ingestKey)) {
        res.status(401).json({ error: 'collect-unauthorized' })
        return
      }
      if (!collectLimit.allow(req.socket.remoteAddress || 'unknown')) {
        res.status(429).json({ error: 'rate-limit' })
        return
      }
      if (!req.is('application/json')) {
        res.status(415).json({ error: 'content-type' })
        return
      }
      const validated = validateEvent(req.body)
      if (!validated.ok) {
        res.status(400).json({ error: validated.error })
        return
      }
      const originHost = new URL(origin).hostname
      if (!validated.event.site.hosts.includes(originHost)) {
        res.status(403).json({ error: 'origin' })
        return
      }
      if (looksLikeBot(req.get('user-agent'))) {
        res.status(204).end()
        return
      }
      const receivedAt = now().toISOString()
      const day = utcDay(now())
      const salt = config.visitorSalt
      const event: NewEvent = {
        siteId: validated.event.site.id,
        path: validated.event.path,
        referrerHost: validated.event.referrerHost,
        visitHash:
          salt && validated.event.visitId
            ? keyHash(salt, ['visit', validated.event.site.id, validated.event.visitId])
            : null,
        visitorHash:
          salt && validated.event.visitorId
            ? keyHash(salt, ['visitor', validated.event.site.id, day, validated.event.visitorId])
            : null,
        eventHash: validated.event.eventId ? keyHash(salt || 'event-id', ['event', validated.event.eventId]) : null,
        day,
        receivedAt,
      }
      store.accept(event)
      res.status(204).end()
    }),
  )

  app.get('/auth/google', asyncRoute(async (req, res) => {
    if (!authLimit.allow(req.socket.remoteAddress || 'unknown')) {
      res.status(429).type('text/plain').send('Too many sign-in attempts. Wait a minute and try again.')
      return
    }
    if (!provider || !config.authReady || !config.appOrigin) {
      res.redirect(303, '/?auth=unconfigured')
      return
    }
    const txn = newTxn()
    const oauth = await oauthSession(req, res, config)
    oauth.state = txn.state
    oauth.nonce = txn.nonce
    oauth.codeVerifier = txn.codeVerifier
    await oauth.save()
    try {
      const url = await provider.authorizationUrl(txn)
      if (url.origin !== 'https://accounts.google.com') throw new Error('unexpected authorization host')
      res.redirect(303, url.toString())
    } catch {
      console.error('sign-in could not start')
      oauth.destroy()
      res.redirect(303, '/?auth=failed')
    }
  }))

  app.get('/auth/callback', asyncRoute(async (req, res) => {
    const fail = (code: 'expired' | 'denied' | 'failed' | 'unconfigured') => {
      res.redirect(303, `/?auth=${code}`)
    }
    if (!provider || !config.authReady || !config.appOrigin) {
      fail('unconfigured')
      return
    }
    const current = callbackUrl(req, config.appOrigin)
    if (!current) {
      fail('failed')
      return
    }
    const oauth = await oauthSession(req, res, config)
    const txn =
      oauth.state && oauth.nonce && oauth.codeVerifier
        ? { state: oauth.state, nonce: oauth.nonce, codeVerifier: oauth.codeVerifier }
        : null
    oauth.destroy()
    if (!txn) {
      fail('expired')
      return
    }
    try {
      const claims = await provider.claimsFromCallback(current, txn)
      const decision = decideAccess(claims)
      if (!decision.ok) {
        const admin = await adminSession(req, res, config)
        admin.destroy()
        fail('denied')
        return
      }
      const admin = await adminSession(req, res, config)
      for (const key of Object.keys(admin)) delete admin[key as keyof typeof admin]
      admin.email = decision.email
      admin.loginAt = now().toISOString()
      await admin.save()
      res.redirect(303, '/')
    } catch {
      console.error('sign-in callback failed')
      fail('failed')
    }
  }))

  app.post('/auth/logout', asyncRoute(async (req, res) => {
    if (!config.appOrigin || !browserSameOrigin(req, config.appOrigin) || !config.sessionSecret) {
      res.status(403).json({ error: 'cross-origin' })
      return
    }
    const session = await adminSession(req, res, config)
    session.destroy()
    res.status(204).end()
  }))

  if (existsSync(CLIENT_DIR)) {
    app.use(express.static(CLIENT_DIR, { index: false, maxAge: '1h' }))
    app.get(/.*/, (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next()
        return
      }
      if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
        next()
        return
      }
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        next()
        return
      }
      res.set('Cache-Control', 'no-cache')
      res.sendFile(join(CLIENT_DIR, 'index.html'), (error) => {
        if (error) next()
      })
    })
  }

  app.use((error: { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return
    if (error?.type === 'entity.too.large') {
      res.status(413).json({ error: 'too-large' })
      return
    }
    if (error?.type === 'entity.parse.failed' || error?.status === 400) {
      res.status(400).json({ error: 'invalid-json' })
      return
    }
    console.error('request failed')
    res.status(500).json({ error: 'server-error' })
  })

  return app
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next)
  }
}

export function browserSameOrigin(req: Request, origin: string): boolean {
  const header = req.get('origin')
  const site = req.get('sec-fetch-site')
  if (header && header !== origin) return false
  if (site && site !== 'same-origin' && site !== 'none') return false
  if (!header && site !== 'same-origin' && site !== 'none') return false
  if (!header && !site) return false
  return true
}

export function allowedCollectOrigin(origin: string | undefined, _nodeEnv: string): string | null {
  if (!origin) return null
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return null
  }
  if (url.origin !== origin || url.protocol !== 'https:') return null
  if (!SITES.some((site) => site.hosts.includes(url.hostname))) return null
  return url.origin
}

function collectCors(origin: string): Record<string, string> {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '600',
    vary: 'Origin',
    'cross-origin-resource-policy': 'cross-origin',
  }
}

function bearer(header: string | undefined): string | null {
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice('Bearer '.length)
  if (!token || /\s/.test(token) || token.length > 200) return null
  return token
}

async function guardData(req: Request, res: Response, config: AppConfig): Promise<boolean> {
  if (config.appOrigin && !browserSameOrigin(req, config.appOrigin)) {
    res.status(403).json({ error: 'cross-origin' })
    return false
  }
  if (!config.appOrigin) {
    res.status(401).json({ error: 'sign-in-required' })
    return false
  }
  if (config.demo !== 'off') return true
  if (!config.authReady || !config.sessionSecret) {
    res.status(401).json({ error: 'sign-in-required' })
    return false
  }
  const session = await adminSession(req, res, config)
  const decision = decideAccess({ email: session.email, email_verified: true })
  if (!decision.ok) {
    res.status(401).json({ error: 'sign-in-required' })
    return false
  }
  return true
}

function buildOverview(
  req: Request,
  store: EventStore,
  config: AppConfig,
  now: () => Date,
): Overview | { error: string } {
  if (Array.isArray(req.query.site) || Array.isArray(req.query.from) || Array.isArray(req.query.to)) {
    return { error: 'bad-date' }
  }
  const site = typeof req.query.site === 'string' && req.query.site !== '' ? req.query.site : 'all'
  if (site !== 'all' && !siteById(site)) return { error: 'bad-site' }
  const range = parseRange(
    typeof req.query.from === 'string' ? req.query.from : undefined,
    typeof req.query.to === 'string' ? req.query.to : undefined,
    now(),
  )
  if ('error' in range) return range
  if (config.demo === 'demo') return demoOverview(range, site)
  if (config.demo === 'empty') return emptyOverview(range, site, 'empty')
  return aggregate(store.all, range, site, { unreadableRows: store.unreadableRows, truncated: store.truncated })
}

function callbackUrl(req: Request, origin: string): URL | null {
  if (req.path !== '/auth/callback') return null
  const current = new URL(req.originalUrl, origin)
  if (current.origin !== origin || current.pathname !== '/auth/callback') return null
  return current
}

function csvCell(value: string | number | null): string {
  if (value === null) return ''
  let text = String(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

function toCsv(overview: Overview): string {
  const lines = [
    `# ${overview.coverage.note.replace(/[\r\n]/g, ' ')}`,
    'kind,day,site,label,pageviews,visits,estimated_uniques',
  ]
  lines.push(
    [
      'summary',
      `${overview.range.from}/${overview.range.to}`,
      overview.site,
      '',
      overview.totals.pageviews,
      overview.totals.visits,
      overview.totals.estimatedUniques,
    ]
      .map(csvCell)
      .join(','),
  )
  for (const point of overview.trend) {
    lines.push(['day', point.day, overview.site, '', point.pageviews, point.visits, ''].map(csvCell).join(','))
  }
  for (const page of overview.pages) {
    lines.push(['page', '', overview.site, page.path, page.pageviews, '', ''].map(csvCell).join(','))
  }
  for (const referrer of overview.referrers) {
    lines.push(['referrer', '', overview.site, referrer.host, referrer.pageviews, '', ''].map(csvCell).join(','))
  }
  return `${lines.join('\n')}\n`
}
