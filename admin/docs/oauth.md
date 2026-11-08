# Google OAuth client for admin.naijei.com

Create a new Web application client in Google Cloud project `cs-5414`. Opening that project needs Cornell SSO and Duo in your own browser. This repository does not create the client, and it does not read or store the secret.

Do not edit the existing Gnarly Cognito client or any Google client already used by Gnarly. Admin sign-in is a separate client.

## Exact console values

Application type: Web application

Name: `naijei admin`

Authorized JavaScript origins:

- `https://admin.naijei.com`
- `http://127.0.0.1:8787`

Authorized redirect URIs:

- `https://admin.naijei.com/auth/callback`
- `http://127.0.0.1:8787/auth/callback`

The redirect URI has no trailing slash, no query string, and no port on the public host. `APP_ORIGIN` must be exactly `https://admin.naijei.com` in production and exactly `http://127.0.0.1:8787` for that local client. A localhost origin is a different URI. Do not add `https://naijei.com` or `https://naijei.com/gnarly/`.

OAuth consent screen, while the app stays in Testing:

- User type: External
- Test user: `nj277@cornell.edu`
- Scopes: `openid`, `email`, and `.../auth/userinfo.email`

The server requests only `openid email`. `email_verified` must come back as the boolean `true`. The allowlist is exactly `nj277@cornell.edu`. `hd=cornell.edu` is only a hint.

## Server settings

Put the client id and secret in the admin process environment, not in a `VITE_` variable and not in git:

- `APP_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET` of at least 32 characters

Production refuses to start when any of those is missing, when `DATA_FILE` is not an absolute path, or when `ADMIN_DEMO` is set. Demo numbers are never served in real data mode.
