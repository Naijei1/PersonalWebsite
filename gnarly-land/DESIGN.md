---
name: Gnarly — Walk a Building
description: One dark spatial page where a scan becomes a route, followed by recorded proof.
colors:
  ground: "#080d17"
  plate: "#0e1727"
  raise: "#132036"
  line: "#1f2d45"
  line-strong: "#34486a"
  ink: "#eef3ff"
  body: "#c3d0e6"
  mute: "#9aabc8"
  tape: "#91b3ff"
  tape-hover: "#b3caff"
  tape-ink: "#0a1630"
  route-core: "#d6e6ff"
  route-wash: "#4d7bff"
typography:
  display: {fontFamily: '"Inter Variable", sans-serif', fontSize: "clamp(2.9rem, 5vw, 4.75rem)", fontWeight: 560, lineHeight: 1.02, letterSpacing: "-0.04em"}
  headline: {fontFamily: '"Inter Variable", sans-serif', fontSize: "clamp(2.1rem, 3.6vw, 3.25rem)", fontWeight: 560, lineHeight: 1.08, letterSpacing: "-0.035em"}
  lede: {fontFamily: '"Inter Variable", sans-serif', fontSize: "1.125rem", fontWeight: 400, lineHeight: 1.6}
  body: {fontFamily: '"Inter Variable", sans-serif', fontSize: "1.0625rem", fontWeight: 400, lineHeight: 1.65}
  ui: {fontFamily: '"Inter Variable", sans-serif', fontSize: "0.875rem", fontWeight: 520, lineHeight: 1.4}
  caption: {fontFamily: '"Inter Variable", sans-serif', fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.55}
rounded:
  button: "8px"
  panel: "12px"
  form: "14px"
  phone-frame: "22px"
  pill: "999px"
spacing:
  page: "clamp(1.25rem, 5vw, 5rem)"
  bar: "64px"
  bar-mobile: "58px"
  section: "120px"
  section-mobile: "72px"
components:
  button-primary:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-ink}"
    rounded: "{rounded.button}"
    height: "48px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderColor: "{colors.line-strong}"
    rounded: "{rounded.button}"
  destination-panel:
    backgroundColor: "#0d1729"
    rounded: "{rounded.panel}"
  scene-label-end:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-ink}"
    rounded: "{rounded.pill}"
---
# Design System: Gnarly

## Overview
**North Star: "Walk a building. Give visitors directions."**
The page is one continuous night surface. The hero is an illustrative model of the promise: a LiDAR sweep reveals three floors, the stack holds, the ground floor comes forward, and the route draws from a labelled main entrance to a named room. Directly below, the same story is proven with recorded footage of a real route. There is no change to a white page; depth comes from the scene, hairlines, and the footage itself.

## Colors
Ground, plate, and raise build the surfaces. Ink is for headings and controls, body for paragraphs, mute for labels and secondary headline lines. Tape is route blue: the primary action, focus ring, scene accents, and the destination pill.
**The Route Rule.** In the 3D model the route is the brightest element (route-core with an additive route-wash). Nothing else in the scene may compete with it.

## Typography
Inter Variable through `@fontsource-variable/inter/standard.css`; only the Latin subset downloads (unicode-range). Body text never drops below 16px on phones; supporting UI stays at 13–14px. The hero second line and the "Finally connected." caption use tape.

## Layout
Bar and content cap at 1440px. On screens at least 900×620 without reduced motion, the hero sits in a track 80vh taller than the stage, so the stage pins while scroll draws the route; one firm scroll reaches the evidence. Copy sits bottom left, the destination panel bottom right, controls bottom left under the copy. Below 900px the hero stacks in reading order: copy, map (with playback controls in its lower edge), then the route picker directly beneath. Evidence frames share one height on desktop (columns follow their aspect ratios) and become hallway-over-two-phones on narrow screens.

## Motion
**Hero timeline:** autoplay 0.6s→4.4s (scan sweep, materialize, floor separation), then hold. Scroll progress maps the hold to the end (8.4s): upper floors fade, the camera comes to the ground floor, the route draws (6–7.8s), the beacon lands, "Finally connected." appears and the picker reveals. Scrolling up rewinds to the floor overview. Phones autoplay the whole sequence once.
**Controls:** one persistent button changes between Pause/Play, Show the route, and Replay the journey so focus is never lost; Skip intro appears during autoplay. Skipping moves focus to the route picker, which is `inert` until revealed. Rendering stops when idle, offscreen, or hidden. Reduced motion, WebGL failure, and context loss show an SVG plan with the same entrance, destinations, and route changes, without a pin.
**Destination change:** new route geometry redraws over 1.1s and the camera eases toward the new room.

## Evidence
Frames in `public/evidence/` are crops of the team's recorded walkthrough (`https://youtu.be/XkmW11bmEXg`), each linked to its timestamp. Captions state only what the frame shows. The hero carries an "Illustrative model" tag. Never present a render as footage, and never add customers, pilots, metrics, testimonials, or team claims without a source.

## Components
**Actions:** header and hero "Request a demo" → `#request-demo`; "See a mapped route" → `#product`. Live map and "Explore the live map" → `/demo/`. No secondary "Explore"/"Discover" links.
**Demo form:** required name, email, organization, space type; optional building description. Success only after an accepted provider response without activation messaging; failure keeps details and announces an alert; 15s timeout. FormSubmit default recipient `nj277@cornell.edu` (delivery configuration, never shown), overridable with `VITE_DEMO_FORM_ENDPOINT`.
**Metadata:** canonical, `og:url`, and image URLs are absolute, built from `GNARLY_SITE_URL` (default `https://gnarlynav.com/`).

## Do's and Don'ts
- Do keep the headline, demo action, and an understandable model on the first screen at every size.
- Do keep keyboard access, reduced motion, and honest form states.
- Don't introduce personal-domain labels, school or hackathon branding, or unsupported claims.
- Don't lengthen the pin, loop the scene, or add smooth-scroll libraries; native scroll keeps the pin honest and accessible.
