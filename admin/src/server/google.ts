import * as oidc from 'openid-client'
import type { OauthTxn } from './session.js'

export type IdentityProvider = {
  authorizationUrl(txn: OauthTxn): Promise<URL>
  claimsFromCallback(currentUrl: URL, txn: OauthTxn): Promise<unknown>
}

type GoogleAuth = {
  appOrigin: string
  googleClientId: string
  googleClientSecret: string
}

export function googleAuthParameters(txn: OauthTxn, origin: string, codeChallenge: string): Record<string, string> {
  return {
    redirect_uri: `${origin}/auth/callback`,
    scope: 'openid email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: txn.state,
    nonce: txn.nonce,
    hd: 'cornell.edu',
  }
}

export class GoogleIdentityProvider implements IdentityProvider {
  private configuration: oidc.Configuration | undefined

  constructor(private readonly auth: GoogleAuth) {}

  private async ready(): Promise<oidc.Configuration> {
    if (!this.configuration) {
      this.configuration = await oidc.discovery(
        new URL('https://accounts.google.com'),
        this.auth.googleClientId,
        this.auth.googleClientSecret,
      )
    }
    return this.configuration
  }

  async authorizationUrl(txn: OauthTxn): Promise<URL> {
    const configuration = await this.ready()
    const codeChallenge = await oidc.calculatePKCECodeChallenge(txn.codeVerifier)
    return oidc.buildAuthorizationUrl(configuration, googleAuthParameters(txn, this.auth.appOrigin, codeChallenge))
  }

  async claimsFromCallback(currentUrl: URL, txn: OauthTxn): Promise<unknown> {
    const configuration = await this.ready()
    const tokens = await oidc.authorizationCodeGrant(configuration, currentUrl, {
      pkceCodeVerifier: txn.codeVerifier,
      expectedState: txn.state,
      expectedNonce: txn.nonce,
    })
    const claims = tokens.claims()
    if (!claims) throw new Error('missing id token')
    return claims
  }
}
