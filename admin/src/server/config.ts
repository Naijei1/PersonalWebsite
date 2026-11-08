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
  rejected: { ingestKey: boolean; visitorSalt: boolean }
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
    rejected: {
      ingestKey: Boolean(ingestCandidate) && !ingestKey,
      visitorSalt: Boolean(saltCandidate) && !visitorSalt,
    },
  }
}

export function productionBlockers(config: AppConfig): string[] {
  if (config.nodeEnv !== 'production') return []
  const missing: string[] = []
  if (!config.appOrigin) missing.push('APP_ORIGIN')
  if (!config.googleClientId) missing.push('GOOGLE_CLIENT_ID')
  if (!config.googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET')
  if (!config.sessionSecret) missing.push('SESSION_SECRET')
  if (config.rejected.ingestKey) missing.push('INGEST_KEY')
  if (config.rejected.visitorSalt) missing.push('VISITOR_HASH_SALT')
  if (config.demo !== 'off') missing.push('ADMIN_DEMO')
  return missing
}
