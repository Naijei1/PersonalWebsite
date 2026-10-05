# naijei-watch Worker

A tiny Cloudflare Worker (free plan) that stores the latest Apple Watch snapshot sent by an iOS Shortcut and serves it to the site's "I'm Feeling Lucky" watch easter egg.

| Route | Auth | Purpose |
|---|---|---|
| `POST /snapshot` | `Authorization: Bearer <WRITE_TOKEN>` | Save the latest stats (flat JSON from the Shortcut). Writes less than 60 s apart are skipped. |
| `POST /pause` | `Authorization: Bearer <WRITE_TOKEN>` | `{"paused": true}` hides all stats; `{"paused": false}` shows them again. |
| `GET /snapshot` | public | Latest snapshot, `{"paused": true}`, or `{"empty": true}`. Cached for 60 s. |

Accepted fields: `heartRate`, `steps`, `moveKcal`, `moveGoal`, `exerciseMin`, `exerciseGoal`, `standHours`, `standGoal`, `workoutType`, `workoutMinutes`, `workoutEnded` (ISO 8601). Everything else is dropped. Numbers are parsed leniently (`"72 count/min"`, `"8,412"`, `"2 hr"`) and clamped. `standHours` may also be raw Stand Hour sample values (`"Stood"`/`"Idle"`, as text or a list); the Worker counts the Stood ones.

## Deploy

```bash
cd watch-worker
npm install
npx wrangler login
npx wrangler kv namespace create WATCH   # paste the id into wrangler.toml
npx wrangler secret put WRITE_TOKEN      # paste a long random token, e.g. from `openssl rand -hex 24`
npx wrangler deploy
```

Then put the deployed URL, e.g. `https://naijei-watch.<subdomain>.workers.dev/snapshot`, in `public/watch.json` as `endpoint`. With an empty endpoint, the site shows demo data labeled "Offline · demo".

Kill switch: set `PAUSED = "true"` in `wrangler.toml` and redeploy.

## Develop

```bash
npm test                                         # unit tests with an in-memory KV
echo 'WRITE_TOKEN=local-dev-token' > .dev.vars
npx wrangler dev                                 # local runtime on http://127.0.0.1:8787
```
