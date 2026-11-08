# Google OAuth client for admin.naijei.com

Create a new Web application client in Google Cloud project `cs-5414`. Opening that project needs Cornell SSO and Duo in your own browser. This repository does not create the client and does not read a secret. No client exists yet.

Do not edit the existing Gnarly client. Leave the project's Cornell Internal audience as it is. Do not switch it to External, and do not move the shared consent screen to Testing or add test users.

## What the server actually uses

Sign-in is a server redirect, not the Google Identity Services script. `GET /auth/google` sends the browser to Google's authorization endpoint. Google sends it back to the redirect URI. The server then exchanges the code using the client secret, PKCE, state, and nonce. JavaScript origins are not part of this flow. Leave that field empty.

Authorized redirect URIs, with no trailing slash and no query:

- `https://admin.naijei.com/auth/callback`
- `http://127.0.0.1:8787/auth/callback`

`APP_ORIGIN` must be exactly `https://admin.naijei.com` in production and exactly `http://127.0.0.1:8787` for the local URI. `http://localhost:8787` is a different redirect. Do not add `https://naijei.com` or `https://naijei.com/gnarly/`.

The authorization request scope is `openid email`. `email_verified` must be the boolean `true`. The allowlist is exactly `nj277@cornell.edu`. `hd=cornell.edu` is only a hint.

Google may ask to add `naijei.com` as an authorized domain because the public redirect host is `admin.naijei.com`. That approval is the pending owner step. It is not a reason to edit the rest of the shared consent screen.

## Server settings

Put the client id and secret in the admin process environment, not in a `VITE_` variable and not in git:

- `APP_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET` of at least 32 characters

Production also requires `DATA_FILE` to be an absolute path. It ignores `ADMIN_DEMO`, so fixture numbers are not served. It still boots if that variable is present.
