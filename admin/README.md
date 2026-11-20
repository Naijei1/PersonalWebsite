# Naijei admin analytics

Private dashboard for the naijei.com family. It is a separate app from the public Vite site and is not part of the GitHub Pages build.

The owner dashboard reads GoatCounter visitors, raw Amplify requests, and events from the optional local collector. Each has its own coverage.

## What it can see

The collector panels show accepted local events. GoatCounter and CloudWatch have independent data sources and configuration.

The local collector cannot see:

- GitHub Pages request logs
- visitors who never run an opted-in collector
- traffic from before a collector is added
- a person moving between sites (hashes are site-scoped, and daily uniques are not linked across days)

Pageviews, visits, and estimated uniques are defined only for accepted events:

- A pageview is one accepted event.
- A visit is a distinct visit key for that site. Browsers that store none still count as pageviews.
- Estimated uniques add each day’s site-scoped hashes. The same person tomorrow, or on another site, counts separately.

Bot filtering and the 10-second duplicate window are heuristics. They will both miss and over-block.

## Run locally

```bash
cd admin
npm install
npm test
npm run build
npm start
```

Open `http://127.0.0.1:8787`.

Without Google settings, the page explains that sign-in is not configured. Analytics routes stay closed.

Design-review fixtures (never honored when `NODE_ENV=production`):

```bash
NODE_ENV=development ADMIN_DEMO=1 APP_ORIGIN=http://127.0.0.1:8787 npm start
```

`ADMIN_DEMO=empty` shows the same screen with an empty store. Both banners say the numbers are not live traffic.

Copy `.env.example` to `.env` when you are ready to fill in secrets. The server reads the process environment. It does not read `VITE_` variables, and the client bundle has no Google secret.

## Google sign-in

You create the OAuth client in Google Cloud project `cs-5414` after Cornell SSO and Duo. This change does not. Use a new Web client. Do not modify the Gnarly client. The full field list is in `docs/oauth.md`.

Authorized redirect URIs:

- `https://admin.naijei.com/auth/callback`
- `http://127.0.0.1:8787/auth/callback`

1. In Google Cloud Console, create an OAuth client of type Web application. Leave the Cornell Internal audience unchanged.
2. Add those two redirect URIs exactly. Leave Authorized JavaScript origins empty. This server does not use the Google JavaScript sign-in library.
3. Put the client id and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Set `APP_ORIGIN` to the same origin as the redirect, with no path and no trailing slash. Allowed values are `https://admin.naijei.com` and `http://127.0.0.1:<port>` or `http://localhost:<port>` (port 1024–65535).
5. Set `SESSION_SECRET` to at least 32 characters (`openssl rand -base64 32`).

The server uses `openid-client` (authorization code, PKCE, state, nonce, ID token checks) and `iron-session` (encrypted httpOnly cookie, SameSite=Lax, 12-hour TTL). The allowlist is the exact address `nj277@cornell.edu`, and `email_verified` must be the boolean `true`. Other accounts, missing claims, and the string `"true"` are refused. A `hd=cornell.edu` hint is sent to Google and is not the security check.

Production (`NODE_ENV=production`) exits on startup if those four settings are missing or unusable, or if `DATA_FILE` is not an absolute path. It ignores `ADMIN_DEMO` and still boots when that variable is present.

Google’s network login was not exercised here. There is no OAuth client in this repo.

## Collecting later

`/api/collect` stays disabled until `INGEST_KEY` is set (16+ characters). The key is not an admin password. Anyone who can see a site’s script can submit bounded page events. They cannot read or export analytics.

Set `VISITOR_HASH_SALT` (16+ characters) as well, or estimated uniques stay unavailable.

The snippet lives in `src/collector` and `collector/example/index.html`. The public site does not import it. `install()` does nothing unless `enabled` is exactly `true`. It loads as a module, sends `location.pathname` and the referrer hostname only, caps how often it sends, and swallows errors. Per-site notes are in `docs/adoption.md`.

## GoatCounter visitors

Set `GOATCOUNTER_API_TOKEN` in the admin server environment to a read-only token with statistics access to the five configured GoatCounter sites. The server requests only the selected site and UTC date range, and caches successful results for one hour. The Visitors panel shows the daily trend and up to ten countries, referrers and pages. A missing token displays “not configured”. Rate-limited sites serve their last cached result for the selected range when available.

The `naijei` code covers naijei.com, including `/gnarly-land/`. `/gnarly` redirects to gnarlynav.com, which uses `gnarlynav`. Flashcards, Voter and SQL use `naijei-flashcards`, `naijei-voter` and `naijei-sql`. Each of those hosts needs its own public tracker to collect data. The admin itself has no tracking script. Keep the token out of public build variables.

On Lightsail, update the root-only environment file used by the running service and restart the Node process using the steps in [hosting.md](docs/hosting.md#lightsail-environment-and-restart). `ADMIN_DEMO=1` in the local preview command above also populates the Visitors panel for screenshots.

## Hosting requests

Optional and off. When `HOSTING_METRICS=1` is paired with region `us-east-1` and account `402275401617`, the server reads three Amplify `Requests` series. Those counts include assets and bots. They are not pageviews and they are not mixed into the collector totals. Unconfigured, failed, and unverified sources stay null. Details and the deployment sketch are in `docs/hosting.md`.

Events are appended to `data/events.ndjson` (gitignored). One Node process is assumed. The in-memory rate limit is 30 accepted attempts per minute per socket address and resets on restart. Query strings, unexpected fields, and non-inventory hosts are rejected.

## Later hosting

This app needs a Node process, not GitHub Pages. A small VM or a single container in front of TLS is enough. SQLite or a hosted database is not required at this size; the ndjson file needs a persistent disk. Expect a small always-on compute bill and disk, plus the Google OAuth client which has no fee for this login volume. Point `admin.naijei.com` at that process only after you say so. This change does not do that.

Bind a public interface with `HOST=0.0.0.0` only behind TLS. Leave the default `127.0.0.1` for local use.

## Security limits

- Sign-in depends on Google and on the session secret. A leaked secret can forge a cookie.
- The ingest key becomes public once a site embeds it. Treat it as a write-only quota key and rotate it by changing the env and the snippet together.
- Rate limits are per process and per immediate peer address. A reverse proxy must be configured deliberately; this app does not trust `X-Forwarded-For`.
- CSRF protection for the admin API is SameSite=Lax plus an Origin or `Sec-Fetch-Site` check. The OAuth callback relies on state and PKCE because Google’s redirect is cross-site.
- Bot and duplicate handling is best-effort.
- There is no audit log of rejected emails, on purpose.
