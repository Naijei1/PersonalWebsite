---
name: Gnarly
description: A night corridor with one teal route.
colors:
  tape: "#12b5cb"
  tape-hot: "#9ae7f2"
  tape-ink: "#0a5c68"
  tape-text: "#062026"
  ground: "#0b0e10"
  plate: "#141a1e"
  ink: "#f3f6f8"
  mute: "#c3ced4"
  line: "rgba(243, 246, 248, 0.16)"
  paper: "#e4eeef"
  ink-day: "#102226"
  mute-day: "#3e5258"
  line-day: "rgba(16, 34, 38, 0.16)"
typography:
  display:
    fontFamily: "Pathway Extreme Variable, sans-serif"
    fontSize: "clamp(2.7rem, 6.2vw, 6rem)"
    fontWeight: 650
    lineHeight: 0.94
    letterSpacing: "-0.035em"
    fontVariation: "font-stretch 84%"
  headline:
    fontFamily: "Pathway Extreme Variable, sans-serif"
    fontSize: "clamp(2.15rem, 4.8vw, 4.25rem)"
    fontWeight: 640
    lineHeight: 0.98
    letterSpacing: "-0.035em"
    fontVariation: "font-stretch 88%"
  title:
    fontFamily: "Pathway Extreme Variable, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 660
    letterSpacing: "-0.035em"
    fontVariation: "font-stretch 86%"
  body:
    fontFamily: "Pathway Extreme Variable, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 430
    lineHeight: 1.55
  label:
    fontFamily: "Pathway Extreme Variable, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 620
rounded:
  pill: "999px"
  frame: "1.25rem"
spacing:
  tight: "0.35rem"
  control: "0.75rem"
  pad: "max(1.25rem, env(safe-area-inset-left))"
  pad-end: "max(1.25rem, env(safe-area-inset-right))"
  pad-desk: "max(4.5rem, env(safe-area-inset-left))"
  pad-end-desk: "max(4.5rem, env(safe-area-inset-right))"
  tape-clearance: "1.35rem"
  band-top: "clamp(4.75rem, 12vh, 8rem)"
  band-bottom: "clamp(2.5rem, 6vh, 4rem)"
components:
  button-primary:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-text}"
    rounded: "{rounded.pill}"
    padding: "0 1.2rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.tape-hot}"
    textColor: "{colors.tape-text}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 1.2rem"
    height: "2.75rem"
  button-line-hover:
    backgroundColor: "transparent"
    textColor: "{colors.tape}"
  text-link:
    textColor: "{colors.tape}"
    padding: "0 0.2rem"
    height: "2.75rem"
  nav-link:
    textColor: "{colors.mute}"
    padding: "0 0.75rem"
    height: "2.75rem"
  nav-link-hover:
    textColor: "{colors.ink}"
  chip-tape:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-text}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.8rem"
  chip-status:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 0.75rem"
  frame:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
  proof:
    textColor: "{colors.ink}"
    padding: "0.7rem 0 0"
  slab:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-day}"
---

# Design System: Gnarly

## Overview

**Creative North Star: "The Night Corridor"**

Gnarly is a light page with one dark stage. The stage is a WebGL LiDAR room: points gather, then a teal route draws through them. Pathway Extreme Variable is light and large on that stage. A phone diagram sits on the stage. The nav is a floating white bar. Scan, Publish, and Navigate share one scrolling story. The film is a later chapter. Actions use an 8px corner. Reduced motion shows a static floor plan instead of the WebGL loop.

The palette stays on that one route. A lighter step of the same teal is the primary hover and the single moving segment. One band, the team, turns on a pale slab and deepens the tape so the route still holds. The sticky bar is the same ground, frosted with a 14px blur. Surfaces do not cast shadows.

Motion is one pass. A brighter segment travels down the first screen along the tape and ends. Reduced motion removes that pass. The standing tape stays.

**Key Characteristics:**

- Dark ground, with one pale team slab
- One teal tape, deeper on that slab
- Pathway Extreme Variable, condensed on the signs
- Pills for actions and 1.25rem frames for the film and the stage
- Hairlines on a flat night
- One scan: points gather, then the route draws, and reduced motion shows the finished drawing

## Colors

Night ground, fog text, and a single teal route. The pale slab is a change of light, and the tape deepens on it.

### Primary

- **Route Teal** (`#12b5cb`): The standing tape, the primary pill, links, selection, and the route inside the diagrams. On the night ground this is the accent.
- **Hot Tape** (`#9ae7f2`): The same route, brighter. Primary pill hover.
- **Corridor Teal** (`#0a5c68`): The tape, the links, and the selection on the pale slab. Also the scrollbar thumb against the night ground.
- **Tape Text** (`#062026`): Type and marks that sit on the route: the primary pill, the film pill, the skip link, selection text, and the chevrons on the corridor path.

### Neutral

- **Night Ground** (`#0b0e10`): Page background, the corridor field, the status pill, and the theme color. The page is dark-first.
- **Plate** (`#141a1e`): The field inside the film frame and the stage. One step above the ground.
- **Corridor Ink** (`#f3f6f8`): Text, the wordmark, and light diagram marks on the night.
- **Fog** (`#c3ced4`): Ledes, captions, notes, the lockup, and resting navigation links.
- **Night Hairline** (`rgba(243, 246, 248, 0.16)`): The 1px edge on the bar, frames, menu panel, stack, and footer.
- **Team Paper** (`#e4eeef`): The team band.
- **Day Ink** (`#102226`): Text on the team band.
- **Day Fog** (`#3e5258`): Secondary text on the team band.
- **Day Hairline** (`rgba(16, 34, 38, 0.16)`): Hairlines on the team band.

**The One Tape Rule.** Route teal is the only accent on the night. On the pale slab the tape, the links, and the selection switch to corridor teal. Hot tape is a lighter step of the same route, used for the primary hover.

**The One Slab Rule.** Team paper is the team band. Every other chapter stays on night ground, and plate is only the field inside a frame.

## Typography

**Display Font:** Pathway Extreme Variable (with sans-serif)
**Body Font:** Pathway Extreme Variable (with sans-serif)

The loaded face is the standard variable cut, weight 100–900 and stretch 75%–100%. Signs use that width axis. Reading text does not. The root sets weight 440 and turns synthesis off. The lede sits at 430.

**Character:** Condensed signs, regular reading. Tracking tightens with the stretch. One family does both jobs.

### Hierarchy

- **Display** (650, `clamp(2.7rem, 6.2vw, 6rem)`, line-height 0.94, stretch 84%, tracking -0.035em): The hero sign, held to about 11 characters, sitting low in the first viewport.
- **Headline** (640, `clamp(2.15rem, 4.8vw, 4.25rem)`, line-height 0.98, stretch 88%, tracking -0.035em): Chapter titles, held to about 18 characters.
- **Title** (660, 1.35rem, stretch 86%, tracking -0.035em): The wordmark in the bar.
- **Body** (430, 1.125rem, line-height 1.55): The lede, held to 68 characters. Notes use the root weight 440 and the same line-height. Captions are 0.95rem at line-height 1.45, in fog, also held to 68 characters. The lockup is fog at 0.95rem.
- **Label** (620, 0.8125rem): The status pill. The film pill uses the same weight at the inherited size. Proof lines are 1.05rem, weight 600, tracking -0.02em. Buttons are weight 600, tracking -0.015em.

**The Condensed Sign Rule.** The hero, the chapter titles, and the wordmark set stretch under 90% and tracking at -0.035em. Reading text stays at the standard width.

**The Single Face Rule.** Pathway Extreme Variable is the only family, including the labels inside the diagrams. The fallback is generic sans-serif.

## Layout

Chapters are full-measure bands. The gutter is the pad: 1.25rem until 960px, then 4.5rem, and never inside the safe area. The right edge mirrors the left. A 2px tape stands at that pad. Type, actions, and the footer start 1.35rem further in.

The first viewport is one screen minus the 4rem bar. The scan fills the upper row. The sign, lede, and one primary pill sit in the lower row, left aligned. The demo film is not in this viewport. It is a later chapter. Chapter bands pad `clamp(4.75rem, 12vh, 8rem)` on top and `clamp(2.5rem, 6vh, 4rem)` below, except the problem band, which is shorter. Actions sit 1.75rem under the lede.

The navigate chapter breaks the column. Its corridor is full-bleed. The sign under it returns to the inset, with 1.5rem on top and `clamp(3rem, 8vh, 5.5rem)` below. The scan chapter splits at 960px into text and an 18.5rem phone, with a 4rem gap.

The bar is sticky, at least 4rem tall, and scroll clearance is 5.5rem. From 960px the links sit in the bar. Below that they open from a disclosure onto a ground panel. At 720px the lockup hides and the bar pill's horizontal padding tightens to 0.85rem. At 420px that pill's label shortens. Proofs become a row at 800px. The stack becomes one column under 640px.

**The Full-Measure Rule.** A chapter is a band across the viewport.

**The Tape Gutter Rule.** The standing tape is 2px at the pad edge. Body copy, signs, and the footer clear it by 1.35rem. The corridor diagram bleeds past the gutter, and the tape still runs over it.

## Elevation & Depth

Flat. Depth is a change of surface: night ground, plate inside a frame, then the one paper slab. The bar mixes the ground to 90% and blurs it 14px, so the corridor reads through a frost. The line button draws its edge as an inset 1px ring and, on hover, redraws that ring in route teal. Controls do not lift. There is no timed hover transition.

**The Flat Night Rule.** Surfaces stay flat at rest and on hover. The line button's inset ring is a hairline. Depth comes from night ground, plate, and the one paper slab.

## Shapes

Two silhouettes. Pills (`999px`) are the skip link, both buttons, the film pill, and the status pill. Frames (`1.25rem`) are the film and the stage, each closed with a 1px hairline. The route is a 2px solid tape, or a 2px tape edge along the top of a proof. Small corners inside a diagram belong to that drawing.

**The Pill and Frame Rule.** Actions and labels are pills. The film and the stage are 1.25rem frames. Diagram-only corners stay inside the drawing.

## Components

Focus on the page is a 2px solid outline in the link color, 3px outside the control. On the night the link is route teal. On the team slab it is corridor teal. Selection is route teal with tape text. On the slab, selection is corridor teal with team paper.

### Buttons

- **Shape:** Pill (`999px`). Minimum height 2.75rem. Padding `0 1.2rem`. Weight 600. Tracking -0.015em.
- **Primary:** Route teal fill, tape text. Hover changes the fill to hot tape and leaves the label color. In the bar, under 720px, the horizontal padding becomes 0.85rem.
- **Hover / Focus:** The fill changes in place. Focus uses the page outline.
- **Line:** Transparent, corridor ink, with an inset 1px night hairline. Hover redraws the ring in route teal and sets the label to route teal.

The skip link is the primary pill, padding `0.65rem 1rem`, weight 620, parked off-screen until focused.

### Chips

- **Tape pill:** Route teal, tape text, weight 620, padding `0.45rem 0.8rem`, set on the lower corner of the film frame.
- **Status pill:** Night ground, corridor ink, 0.8125rem, weight 620, padding `0.4rem 0.75rem`, 1px hairline, set on a frame. On the corridor it clears the bar.

### Cards / Containers

- **Corner style:** 1.25rem.
- **Background:** Plate. The corridor figure is night ground and is not framed.
- **Shadow strategy:** None. The flat night rule.
- **Border:** 1px night hairline.
- **Internal padding:** The picture or diagram runs to the frame edge. The status pill sits about 0.85rem in. A phone frame is at most 18.5rem wide, and its diagram is 9 / 16. The film frame crops to 1180 / 560.

### Navigation

The bar sticks, at least 4rem, on ground mixed to 90% with a 14px blur, and a hairline under it. The wordmark uses the title face. The lockup is fog at 0.95rem and hides below 720px. Links are fog, 2.75rem tall, padded `0 0.75rem`, and turn corridor ink on hover. From 960px they are a row. Below that, the disclosure opens a full-width panel on solid ground with a hairline. The primary pill stays in the bar.

### Text links

Route teal, with a 2.75rem target and `0 0.2rem` of side padding in the action row. The link reads as color. Footer links use the same color and the same 2.75rem target. On the team slab, links follow corridor teal.

### Proofs

Each item is capped near 16rem, at 1.05rem, weight 600, tracking -0.02em, with 0.7rem of air under a 2px route-teal edge. The list stacks with a 1.25rem gap and becomes a row with a 2.75rem gap from 800px.

### Stack

The term is weight 620. The description is fog. A night hairline tops each row. From 640px up, the term column runs from 7.5rem to 11rem. Below that, the row is one column.

### Team slab

The day band. Team paper, day ink, day fog, and the day hairline. For that band the tape and the link are reassigned to corridor teal, so the route, the selection, and any link inside it deepen together. The chapter rhythm is otherwise the same band.

### Route tape and scan

A 2px solid tape runs the height of each chapter, including the footer. It does not animate. The authored motion is the hero scan: returns fade in along the walls, then a route stroke draws to the door, 2.6s, `cubic-bezier(0.16, 1, 0.3, 1)`. The finished drawing is the default, so a failed animation still shows the route. `prefers-reduced-motion: reduce` sets those animations to none and keeps the stroke and the points visible.

### Diagrams

Line drawings. The scan and the publish diagram sit on plate. The corridor sits on night ground and bleeds. The route inside a diagram is tape, a 4px stroke with round caps. Labels are Pathway Extreme Variable in fog. The status pill marks each drawing. Wall tones and chevrons stay inside the corridor drawing.

## Do's and Don'ts

### Do:

- **Do** keep chapters on night ground, plate inside frames, and team paper on the one pale band.
- **Do** set the hero and chapter signs in Pathway Extreme Variable under 90% stretch, with tracking at -0.035em.
- **Do** park the 2px tape in the pad gutter and inset the type by 1.35rem.
- **Do** use a pill for actions and labels, and a 1.25rem frame for the film and the stage.
- **Do** keep the hero scan as the only authored motion, and show the finished route under prefers-reduced-motion.

### Don't:

- **Don't** add a second accent hue. Hot tape is the lighter step of route teal, and corridor teal is that route on paper.
- **Don't** add a drop shadow, a glow on the tape or the frames, or a second typeface. The bar's 14px blur is the frost on the ground.
- **Don't** wrap the bands in a centered max-width column.
- **Don't** turn the standing tape into a dash, a blur, or a second animated line.
