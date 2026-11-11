# Gnarly landing page

Run `npm ci`, then `npm run dev`. The page is served at `/`. Companion-app links go to `/demo/`.
`npm run build` creates the GitHub Pages artifact; `npm test` checks responsive
layouts, accessible destination selection, reduced motion, form validation,
provider errors, activation responses, and successful submission.

## Demo-request delivery

The form posts JSON over HTTPS to FormSubmit, addressed to `nj277@cornell.edu`.
It does not open a mail client. The visitor's email becomes the reply address.
FormSubmit must be activated by the mailbox owner before accepting customer
requests. Submit a clearly labeled setup request from the intended hosted page,
follow the confirmation email, then verify that a second request arrives.
No email delivery or activation was confirmed by the development environment:
the live setup test was denied by the provider with HTTP 403.

`VITE_DEMO_FORM_ENDPOINT` can replace the default with an activated FormSubmit
endpoint or a compatible JSON endpoint returning `{ "success": true }` only
when the request is accepted. Do not put private API keys in this variable;
Vite includes it in public JavaScript. No requests are stored in browser storage.
The form retains entered details on errors, times out after 15 seconds, and
includes a honeypot. A request receives an on-page confirmation only after an
accepted provider response; recognized activation responses remain errors.

Mocked integration tests do not establish live email delivery. Complete the
mailbox confirmation and a real delivery check before production use.

## Cinematic scene

`src/cinematic-scene.ts` procedurally renders the room scan, connected floors,
and a route from a labelled entrance to a chosen room in Three.js.
`HeroStage.tsx` lazy-loads it. On wide screens the scan autoplays to the floor
overview, then scroll progress (`setProgress`) through a short pinned track
draws the route; phones play the whole sequence once. Rendering stops when idle,
offscreen, or hidden. Buttons provide pause, skip, show-the-route, and replay.
Reduced motion and WebGL failures use an interactive SVG plan with the same
destinations. The scene is an authored illustration and is labelled as one.

## Product evidence

`public/evidence/*.webp` are crops of the team's recorded walkthrough
(https://youtu.be/XkmW11bmEXg). Each frame on the page links to its timestamp.

## Metadata

Canonical and Open Graph URLs are absolute. Set `GNARLY_SITE_URL` when the page
is served somewhere other than the default in `vite.config.ts`.
