# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by the request: keep the public Vite/React GitHub Pages site unchanged, and put a private admin in an isolated `admin/` app that can be hosted on its own later. Chosen stack: a Node server plus a Vite/React client in `admin/`, Google sign-in through `openid-client`, encrypted cookies through `iron-session`, and an append-only event file. No new dependency was added to the public site.

## Users

Naijei Jiang is the only user. The job is to open a private dashboard, filter the naijei.com family by site and date, and read aggregate traffic without mixing that into the public visitor experience. Inferred from the request: there is no second admin, editor, or public audience for this surface.

## Product Purpose

A private analytics dashboard for the naijei.com family. Success means the owner can see pageviews, visits, estimated uniques, referrers, top pages, and trends for the agreed sites, with honest coverage, while anonymous visitors and every other Google account see nothing. The public sites stay as they are until the owner reviews this and explicitly says to go further.

## Positioning

The dashboard is a separate origin, meant for a future `admin.naijei.com`, with server-checked Google identity. It does not inject tracking into the live sites, and it does not share a visitor identity across sites.

## Operating Context

Local review only for this change. Google sign-in needs a client the owner creates later. Hosting, DNS, and storage are later decisions and are not part of this change. Real traffic numbers do not exist here until a collector is opted in or logs are imported. Neither has been done.

## Capabilities and Constraints

- Inventory: `naijei.com` (www included), `naijei.com/gnarly` as its own site so those paths are not also counted on the main site, `flashcards.naijei.com`, `sql.naijei.com`, `voter.naijei.com`.
- Allowlist is exactly `nj277@cornell.edu`. Missing, unverified, or other Google accounts are refused. The check runs on the server for every analytics and export route.
- Unconfigured auth fails closed. Production does not boot a data API that skips sign-in, and demo fixtures exist only when `NODE_ENV` is `development` or `test` and `ADMIN_DEMO` is set.
- Events must not include query strings, passwords, form fields, or a cross-site id.
- Confirmed non-goals: merging, deploying, DNS, cloud changes, live tracking, edits to other repositories, and changes to the public Pages build.
- Inferred and undecided: the future host, the Google OAuth client, and whether any site will opt into the collector. Those stay off until a later explicit yes.

## Brand Commitments

The admin surface uses the public site's existing visual system: Google Sans, the ink/night palette, the Google blue/red/yellow/green accents, pill controls, the N mark, and light/dark behavior that defaults to dark. The public site's copy, pages, and behavior stay untouched.

## Evidence on Hand

Public site tokens live in `tailwind.config.js` and `src/index.css`. Site names are in `src/data/content.ts` and the redirect pages under `public/`. There is no analytics history in this repository. Demo numbers, when shown, are fixtures and must stay labeled as such.

## Product Principles

- The public site is not the place for admin or tracking.
- The server, not the screen, decides who is allowed in.
- Empty and unavailable stay honest. Do not invent live traffic.
- Measure aggregates. Do not build a cross-site profile of a visitor.
- Nothing goes live without a separate explicit yes.

## Accessibility & Inclusion

Inferred from the public site and from the dashboard being a tool the owner uses: keyboard focus, reduced motion, and the same light and dark themes. No separate accessibility standard was specified.
