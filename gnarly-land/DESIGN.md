---
name: Gnarly — Walk a Building
description: A dark, editorial page with one light chapter. A scan becomes a route, then recorded proof, steps, the product and a demo request.
colors:
  ink-950: "#070a10"
  ink-900: "#0c1119"
  ink-800: "#141b27"
  paper: "#f4f5f1"
  text-on-dark: "#eef2f8"
  muted-on-dark: "#98a1b0"
  text-on-light: "#0b0f16"
  muted-on-light: "#586070"
  scan: "#4cc9ff"
  scan-hover: "#8adcff"
  scan-ink: "#04121c"
  scan-deep: "#0b7fb8"
  depth-1: "#4cc9ff"
  depth-2: "#6b7cff"
  depth-3: "#b26bff"
  depth-4: "#ff7ab6"
typography:
  display: {fontFamily: '"Geist Variable", sans-serif', fontSize: "min(clamp(2.6rem, 1rem + 5.6vw, 7rem), 11.5svh)", fontWeight: 300, lineHeight: 0.96, letterSpacing: "-0.05em"}
  headline-display: {fontFamily: '"Geist Variable", sans-serif', fontSize: "clamp(2.4rem, 1.5rem + 3.4vw, 4.5rem)", fontWeight: 350, lineHeight: 1.08, letterSpacing: "-0.035em"}
  headline: {fontFamily: '"Geist Variable", sans-serif', fontSize: "clamp(2rem, 1.35rem + 2.4vw, 3.5rem)", fontWeight: 350, lineHeight: 1.08, letterSpacing: "-0.035em"}
  quote: {fontFamily: '"Geist Variable", sans-serif', fontSize: "clamp(1.35rem, 1.1rem + 1vw, 2rem)", fontWeight: 350, lineHeight: 1.2, letterSpacing: "-0.025em"}
  lede: {fontFamily: '"Geist Variable", sans-serif', fontSize: "clamp(1.05rem, 0.95rem + 0.35vw, 1.25rem)", fontWeight: 400, lineHeight: 1.45}
  ui: {fontFamily: '"Geist Variable", sans-serif', fontSize: "0.95rem", fontWeight: 500, lineHeight: 1}
  label: {fontFamily: '"Geist Mono Variable", monospace', fontSize: "0.75rem", fontWeight: 450, letterSpacing: "0.07em", textTransform: uppercase}
rounded:
  button: "8px"
  card: "12px"
  nav: "14px"
  frame: "24px (20px under 64rem)"
  phone: "1.9rem"
  pill: "999px"
spacing:
  content: "90rem"
  gutter: "clamp(1rem, 0.4rem + 2.4vw, 2.5rem)"
  section: "clamp(4rem, 2rem + 6vw, 9rem) bottom, 0.6× top"
---
# Design System: Gnarly

## Overview
**North Star: "Walk a building. Give visitors directions."** The page is dark-first and editorial: thin, oversized type, hairlines instead of boxes, and one saturated accent. Its visual metaphors are gnarly's own: LiDAR point clouds, scan sweeps, depth-coloured geometry and a route on the floor. A single light chapter (Tools) breaks the dark run.

Order: floating nav → framed hero (copy left, illustrative model right) → field test proof (recorded footage) → pinned How it works → **Product (light)** → demo request → footer.

## Colour
Ink 950/900/800 build dark surfaces; paper is the light chapter. **Scan (`#4cc9ff`) is the only accent** and does every job: primary buttons, the route, open states, focus, bullets, timecodes. It matches the AR route in the real footage. On paper or white, links and focus rings use `scan-deep` for contrast. The depth ramp tints art only (point clouds, use-case icons, bento art bands), never chrome.

## Typography
Geist Variable for everything; display at 300–350 with tight tracking. Geist Mono for labels, chips, timecodes and scene captions: the "instrument" voice. Body copy never drops below 16px on phones; labels are 12px minimum.
**The accent word.** One word of the H1 ("directions.") is set in solid `--scan`. No stripes, glow or sweep.

## Layout
Content caps at 90rem. Dark sections in a row share a 1px hairline. The hero copy sits bottom-left over the frame, with the route picker bottom-right. Below 900px the hero stacks in reading order: copy, the framed map, then the picker joined to its bottom edge.

## Motion
No animation libraries. Easing: `--ease-out` (0.16,1,0.3,1), `--ease-in-out` (0.83,0,0.17,1), `--ease-spring` (0.34,1.56,0.64,1).
- **Hero intro:** the frame opens out of a small pill (clip-path, 1.2s), headline lines rise out of masks (35–50ms stagger), and the CTAs spring in. While the pinned hero scrolls, the frame's inset and radius go to zero (`--open`, driven by the same progress that draws the route).
- **Hero scene:** the existing timeline. Autoplay to the floor overview, then scroll draws the route. Pause, skip and replay stay available; while the pin holds on the overview, scroll alone draws the route. Reduced motion, WebGL failure and context loss show the SVG plan.
- **How it works:** at ≥64rem wide and ≥40rem tall it pins and steps with scroll (45svh per step). Smaller screens autoplay 6s per step, timed by the hairline above the open row, paused on hover, on focus or off-screen. Reduced motion opens steps on request. Inactive stage panels are `inert`.
- **Reveals:** sections rise 16px and fade in once. Skipped under reduced motion.

## Evidence
Frames in `public/evidence/` are crops of the team's recorded walkthrough (`https://youtu.be/XkmW11bmEXg`), each linked to its timestamp. The hero model and the showcase point cloud are labelled "Illustrative model". Never present a render as footage, and never add customers, pilots, metrics, testimonials or team claims without a source.

## Components
**Nav:** a dark glass card, fixed and inset from the top. Below 48rem the links fold into a menu (clip-path unroll) that closes on Escape, an outside click or a link choice; the CTA stays visible.
**Actions:** "Request a demo" → `#request-demo`; hero secondary "Explore the live map" → `https://gnarlynav.com`.
**Demo form:** a white card on dark. Required name, email, organization and space type; optional building description. Success only after an accepted provider response without activation messaging; failure keeps details and announces an alert; 15s timeout.

## Do's and Don'ts
- Do keep the headline, demo action and an understandable model on the first screen at every size.
- Do keep keyboard access, reduced motion and honest form states.
- Don't add a second accent, warm cream surfaces, maze or contour art, or dot-matrix lettering.
- Don't claim iPad support, mesh or splat output, privacy guarantees or outside statistics until the team confirms them.
- Don't add smooth-scroll libraries; native scroll keeps both pins honest and accessible.
