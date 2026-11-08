# Collector adoption

The collector is not installed on any live site. The public naijei.com build does not import it. Do not add it to another repository until you explicitly decide to.

It loads asynchronously, ignores its own failures, and sends `location.pathname` plus the referrer hostname. It does not send the query string, hash, form fields, or a cross-site id. Visitor and visit keys are random per browser origin. If the browser cannot mint a random id, the pageview is sent without one rather than with a shared fallback.

`/api/collect` stays closed until `INGEST_KEY` is set on the admin. The key can only submit events.

## naijei.com

This Vite app. Leave it unwired. A later activation would be a separate change that sets `VITE_ANALYTICS_ENABLED=true`, `VITE_ANALYTICS_ENDPOINT`, and `VITE_ANALYTICS_KEY` at build time and calls `install()` from `admin/src/collector/browser.ts` with:

```ts
install({
  enabled: true,
  endpoint: 'https://admin.naijei.com/api/collect',
  key: 'INGEST_KEY',
  hosts: ['naijei.com', 'www.naijei.com'],
})
```

The Pages workflow does not set those variables. Paths under `/gnarly` on `naijei.com` are classified as Gnarly by the server. The mounted Gnarly app is a different document, so it does not run this snippet unless that repo opts in on its own.

## flashcards.naijei.com

Next.js. A later client component can call `install()` inside `useEffect`, or load the built `collect.js` with `next/script` and `strategy="afterInteractive"`. Host `flashcards.naijei.com`. Keep `enabled` false until the ingest key exists. Do not change that repository from this branch.

## sql.naijei.com

A separate app. Add one deferred module script at the end of the document, host `sql.naijei.com`. Lightsail instance `sql-workshop` has no verified HTTP history, so this snippet is the only future pageview source. Do not change that app from this branch.

## voter.naijei.com

Amplify app Candate-voter. Same pattern as a single client bundle, host `voter.naijei.com`. Amplify `Requests` are already a separate hosting series and are not pageviews. Do not change that app from this branch.

## naijei.com/gnarly

The Gnarly web app lives in another repository and has its own auth client. Do not modify that client or that repo. A later snippet would use host `naijei.com` or `www.naijei.com`. The path prefix selects the Gnarly site. Do not also record Lambda invocations as pageviews.
