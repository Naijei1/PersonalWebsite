import { isAbsolute } from 'node:path'

export type AppConfig = {
  nodeEnv: string
  port: number
  appOrigin: string | null
  googleClientId: string | null
  googleClientSecret: string | null
  sessionSecret: string | null
  ingestKey: string | null
  visitorSalt: string | null
  demo: 'off' | 'demo' | 'empty'
  authReady: boolean
  dataFile: string | null
  retentionDays: number | null
  hosting: 'off' | 'on' | 'misconfigured'
  rejected: { ingestKey: boolean; visitorSalt: boolean; retention: boolean }
}

export function isAllowedAppOrigin(origin: string): boolean {
  if (origin === 'https://admin.naijei.com') return true
  try {
    const url = new URL(origin)
    if (url.origin !== origin) return false
    if (url.protocol !== 'http:') return false
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return false
    const port = Number(url.port)
    return Number.isInteger(port) && port >= 1024 && port <= 65535
  } catch {
    return false
  }
}

function present(value: string | undefined): string | null {
  if (!value || !value.trim() || value !== value.trim()) return null
  return value
}

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const nodeEnv = env.NODE_ENV || 'development'
  const origin = present(env.APP_ORIGIN)
  const appOrigin = origin && isAllowedAppOrigin(origin) ? origin : null
  const googleClientId = present(env.GOOGLE_CLIENT_ID)
  const googleClientSecret = present(env.GOOGLE_CLIENT_SECRET)
  const sessionCandidate = present(env.SESSION_SECRET)
  const sessionSecret = sessionCandidate && sessionCandidate.length >= 32 ? sessionCandidate : null
  const ingestCandidate = present(env.INGEST_KEY)
  const ingestKey = ingestCandidate && ingestCandidate.length >= 16 ? ingestCandidate : null
  const saltCandidate = present(env.VISITOR_HASH_SALT)
  const visitorSalt = saltCandidate && saltCandidate.length >= 16 ? saltCandidate : null
  const local = nodeEnv === 'development' || nodeEnv === 'test'
  const demo = local && env.ADMIN_DEMO === '1' ? 'demo' : local && env.ADMIN_DEMO === 'empty' ? 'empty' : 'off'
  const port = Number(env.PORT || 8787)
  const dataCandidate = present(env.DATA_FILE)
  const dataFile = dataCandidate && isAbsolute(dataCandidate) ? dataCandidate : null
  const retention = retentionDays(env.RETENTION_DAYS)
  const hosting = hostingMode(env)
  return {
    nodeEnv,
    port: Number.isInteger(port) && port > 0 ? port : 8787,
    appOrigin,
    googleClientId,
    googleClientSecret,
    sessionSecret,
    ingestKey,
    visitorSalt,
    demo,
    authReady: Boolean(appOrigin && googleClientId && googleClientSecret && sessionSecret),
    dataFile,
    retentionDays: retention.days,
    hosting,
    rejected: {
      ingestKey: Boolean(ingestCandidate) && !ingestKey,
      visitorSalt: Boolean(saltCandidate) && !visitorSalt,
      retention: retention.invalid,
    },
  }
}

function retentionDays(value: string | undefined): { days: number | null; invalid: boolean } {
  if (value === undefined || value === '') return { days: 400, invalid: false }
  if (!/^\d+$/.test(value)) return { days: null, invalid: true }
  const days = Number(value)
  if (days < 30 || days > 800) return { days: null, invalid: true }
  return { days, invalid: false }
}

function hostingMode(env: NodeJS.ProcessEnv): 'off' | 'on' | 'misconfigured' {
  if (env.HOSTING_METRICS !== '1') return 'off'
  if (env.AWS_REGION === 'us-east-1' && env.AWS_EXPECTED_ACCOUNT === '402275401617') return 'on'
  return 'misconfigured'
}

export function productionBlockers(config: AppConfig): string[] {
  if (config.nodeEnv !== 'production') return []
  const missing: string[] = []
  if (!config.appOrigin) missing.push('APP_ORIGIN')
  if (!config.googleClientId) missing.push('GOOGLE_CLIENT_ID')
  if (!config.googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET')
  if (!config.sessionSecret) missing.push('SESSION_SECRET')
  if (!config.dataFile) missing.push('DATA_FILE')
  if (config.rejected.ingestKey) missing.push('INGEST_KEY')
  if (config.rejected.visitorSalt) missing.push('VISITOR_HASH_SALT')
  if (config.rejected.retention) missing.push('RETENTION_DAYS')
  if (config.demo !== 'off') missing.push('ADMIN_DEMO')
  if (config.hosting === 'misconfigured') missing.push('HOSTING_METRICS')
  return missing
}
