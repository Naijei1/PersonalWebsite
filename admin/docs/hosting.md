# Running the admin for real data

Nothing in this file is provisioned. DNS, certificates, IAM roles, and the Google client stay for a later explicit yes.

## Process

The admin is one Node process. GitHub Pages cannot host it. Do not put it on the Gnarly Lambda or Cognito stack. The smallest separate place is one small always-on machine with a persistent disk:

- a platform machine plus a 1 GB volume, or
- one small VPS with Caddy or the platform's TLS in front

Budget a few dollars a month for the smallest always-on machine and about the host's per-GB disk price. Check the current price before creating anything. The Google OAuth client has no charge at this login volume. CloudWatch `GetMetricData` for two Amplify series, cached for an hour, stays inside the free tier for a personal account, but confirm that before enabling it.

## What the process needs

- TLS for `https://admin.naijei.com`
- `HOST=0.0.0.0` only behind that TLS. Local runs stay on `127.0.0.1`
- `DATA_FILE` as an absolute path on the persistent disk, for example `/var/lib/naijei-admin/events.ndjson`
- `RETENTION_DAYS` optional, default 400, allowed range 30–800. Older UTC days are removed at startup
- Secrets in the host secret store or a root-only environment file: `SESSION_SECRET`, `GOOGLE_CLIENT_SECRET`, and later `INGEST_KEY` and `VISITOR_HASH_SALT`
- No secret in the browser bundle

A redeploy that does not keep `DATA_FILE` on a volume will look empty again. That emptiness is missing storage, not a traffic measurement.

## Hosting request metrics

Optional, off by default. Set all of these together:

```
HOSTING_METRICS=1
AWS_REGION=us-east-1
AWS_EXPECTED_ACCOUNT=402275401617
```

Credentials come from the standard Node provider chain on the server (an instance role is the right production choice). They are not sent to the browser. The adapter queries only:

- `AWS/AmplifyHosting` `Requests`, dimension `App=d3otcaeyemrjvk` (FlashCardApp)
- `AWS/AmplifyHosting` `Requests`, dimension `App=d253xhq1uabld3` (Candate-voter)

It does not query Lambda `Invocations` or `UrlRequestCount`. Those series exist for `gnarly-api` and would double-count the same API activity. SQL Lightsail `sql-workshop` has no verified HTTP history. GitHub Pages for naijei.com and the `/gnarly` frontend have no request series here. Those sources stay unavailable, with a null total, not a zero.

Queries are capped at 90 UTC days, one `GetMetricData` call, and cached for an hour. A failed or unconfigured source does not become zero and is not added to collector pageviews. A bucket CloudWatch actually returns as 0 stays 0 for that bucket only. Days with no bucket are omitted.

Attach a read-only identity policy only when you choose to enable this. `iam-hosting-metrics.json` is the IAM Policy Autopilot baseline for `GetMetricData`. It is not applied. Autopilot scoped the resource to a CloudWatch dataset ARN. Standard `AWS/AmplifyHosting` metrics are often authorized with `Resource: "*"` instead, so confirm the example in IAM before attaching it.

## Collector

The public site is not wired to the collector. Adoption notes for a later opt-in are in `adoption.md`.
