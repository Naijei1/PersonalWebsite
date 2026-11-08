import { getIronSession, type IronSession, type SessionOptions } from 'iron-session'
import type { Request, Response } from 'express'
import { randomBytes } from 'node:crypto'
import type { AppConfig } from './config.js'

export type AdminSessionData = { email?: string; loginAt?: string }
export type OauthTxn = { state: string; nonce: string; codeVerifier: string }

export function sessionOptions(config: AppConfig, kind: 'admin' | 'oauth'): SessionOptions {
  if (!config.sessionSecret) throw new Error('session secret missing')
  const secure = config.appOrigin?.startsWith('https://') === true
  const cookieName =
    kind === 'admin' ? (secure ? '__Host-naijei_admin' : 'naijei_admin') : secure ? '__Host-naijei_oauth' : 'naijei_oauth'
  return {
    cookieName,
    password: config.sessionSecret,
    ttl: kind === 'admin' ? 60 * 60 * 12 : 60 * 10,
    cookieOptions: {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    },
  }
}

export async function adminSession(req: Request, res: Response, config: AppConfig): Promise<IronSession<AdminSessionData>> {
  return getIronSession<AdminSessionData>(req, res, sessionOptions(config, 'admin'))
}

export async function oauthSession(req: Request, res: Response, config: AppConfig): Promise<IronSession<OauthTxn>> {
  return getIronSession<OauthTxn>(req, res, sessionOptions(config, 'oauth'))
}

export function newTxn(): OauthTxn {
  return {
    state: randomBytes(32).toString('base64url'),
    nonce: randomBytes(32).toString('base64url'),
    codeVerifier: randomBytes(32).toString('base64url'),
  }
}
