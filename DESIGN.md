---
name: naijei.com
description: Google Sans on ink and night, dark unless the owner chose light.
colors:
  blue: "#4285F4"
  blue-ink: "#1A73E8"
  red: "#EA4335"
  yellow: "#FBBC04"
  green: "#34A853"
  ink: "#202124"
  ink-soft: "#5F6368"
  ink-faint: "#80868B"
  night: "#1F1F1F"
  night-raised: "#28292A"
  night-line: "#3C4043"
  night-text: "#E8EAED"
  night-soft: "#9AA0A6"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: "\"Google Sans\", Roboto, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 8.5vw, 6.5rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "\"Google Sans\", Roboto, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    letterSpacing: "-0.025em"
  title:
    fontFamily: "\"Google Sans\", Roboto, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    letterSpacing: "-0.025em"
  body:
    fontFamily: "\"Google Sans\", Roboto, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "\"Google Sans\", Roboto, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  mono:
    fontFamily: "\"Google Sans Code\", \"JetBrains Mono\", monospace"
    fontSize: "0.75rem"
    fontWeight: 400
  hand:
    fontFamily: "Caveat, cursive"
    fontSize: "1.25rem"
    fontWeight: 500
rounded:
  full: "9999px"
  panel: "1.5rem"
spacing:
  shell: "1.25rem"
  bar: "4rem"
  control: "2.75rem"
  button-x: "1.25rem"
  card: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.blue-ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "#1765cc"
    textColor: "{colors.white}"
  button-primary-dark:
    backgroundColor: "#8AB4F8"
    textColor: "#062E6F"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-dark-hover:
    backgroundColor: "#AECBFA"
    textColor: "#062E6F"
  button-tonal:
    backgroundColor: "#F1F3F4"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-tonal-hover:
    backgroundColor: "{colors.night-text}"
    textColor: "{colors.ink}"
  button-tonal-dark:
    backgroundColor: "rgba(255, 255, 255, 0.1)"
    textColor: "{colors.night-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-tonal-dark-hover:
    backgroundColor: "rgba(255, 255, 255, 0.15)"
    textColor: "{colors.night-text}"
  chip:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "1.5rem"
  card-dark:
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.panel}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  input-dark:
    backgroundColor: "{colors.night}"
    textColor: "{colors.night-text}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  nav-bar:
    backgroundColor: "rgba(255, 255, 255, 0.85)"
    textColor: "{colors.ink}"
    height: "{spacing.bar}"
  nav-bar-dark:
    backgroundColor: "rgba(31, 31, 31, 0.85)"
    textColor: "{colors.night-text}"
    height: "{spacing.bar}"
  mark:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.blue}"
    rounded: "{rounded.full}"
    size: "2rem"
---

# Design System: naijei.com

## Overview

**Creative North Star: "Portfolio chrome"**

naijei.com is a personal portfolio set in Google's product chrome: Google Sans, ink on a white page, and night text on a near-black page. The page opens dark unless a stored theme says light. The layout is one column. Blue, red, yellow, and green mark a section, a site, a step, or a status strip. The page ground stays white or night.

Panels are white or raised night, with a hairline and a large corner. Controls are pills. The N mark is a small blue ring with the letter inside. Light panels carry a soft card shadow. Dark panels use the raised fill instead. A 22px dot grid fades behind the public hero and the admin page. The public config also carries Caveat and the wordmark animations. The admin config keeps the same colors, the sans and mono families, and both shadows.

**Key Characteristics:**

- Dark unless the stored theme is light
- Google Sans at weight 500 for titles and controls
- Four marker colors, with Blue Ink for actions
- Pills for controls and 1.5rem corners for panels
- Soft card shadow on light panels only

## Colors

The palette is ink, night, white, and four Google marker colors. Both Tailwind configs define the same set.

### Primary

- **Blue** (#4285F4): the N mark, the focus ring, text selection, and the first marker.
- **Blue Ink** (#1A73E8): primary buttons and text links on a light page.
- **Red** (#EA4335): a marker for a section, a site, or a step. On the public nav it marks Experience.
- **Yellow** (#FBBC04): a marker in the same set. On the public nav it marks Projects. A fixture or empty-preview band on the admin page uses it as a full-width notice.
- **Green** (#34A853): a marker in the same set. On the public nav it marks Hobbies.

### Neutral

- **White** (#FFFFFF): the light page, light panels, and the inner disc of the N mark.
- **Ink** (#202124): text on white.
- **Soft Ink** (#5F6368): secondary text on white.
- **Faint Ink** (#80868B): the quietest text on white, and the light scrollbar on the admin page.
- **Night** (#1F1F1F): the dark page, and the theme color.
- **Raised Night** (#28292A): dark panels.
- **Night Line** (#3C4043): the darker neutral step. Scene geometry and the dark hover of a project card use it. Default hairlines use a 6% black or white border instead.
- **Night Text** (#E8EAED): text on night.
- **Soft Night** (#9AA0A6): secondary text on night.

### Named Rules

**The Marker Rule.** Blue, red, yellow, and green mark a difference: a section, a site, a step, or a status strip. Blue Ink is the action color on a light page. The page ground stays white or night.

## Typography

**Display Font:** Google Sans (with Roboto, system-ui, sans-serif)

**Body Font:** Google Sans (with Roboto, system-ui, sans-serif)

**Label/Mono Font:** Google Sans Code (with JetBrains Mono, monospace). Caveat is the public handwritten aside.

**Character:** One sans does the reading and the controls. Titles sit at medium weight. The mono face is for code and compact values. The script face is a caption on the public page.

### Hierarchy

- **Display** (500, clamp(3.2rem, 8.5vw, 6.5rem), line-height 0.98, tracking -0.035em): the public wordmark.
- **Headline** (500, 1.875rem, tracking -0.025em): section titles. From 640px they step to 3rem.
- **Title** (500, 1.25rem, tracking -0.025em): panel and card headings. A featured project title steps to 1.875rem, then 2.25rem from 640px.
- **Body** (400, 1rem, line-height 1.5): running text. A lede is 1.25rem, then 1.5rem from 640px, with relaxed line-height.
- **Label** (500, 0.875rem): nav items, buttons, and meta.
- **Mono** (400, 0.75rem): code and compact values.
- **Hand** (500, 1.25rem, Caveat): the public "right now" line. The polaroid caption uses the same face at 1.875rem. The admin font list does not load Caveat.

### Named Rules

**The Medium Weight Rule.** Titles and controls use weight 500. Weight 700 is reserved for the N in the mark.

## Layout

The page column is 72rem wide, with 1.25rem of inline padding plus the device safe area. The top bar is fixed at 4rem. Public sections stack with 5rem of vertical padding, and 7rem from 640px. From 1024px the hero and some project rows become two columns. Tab labels sit in the bar and can scroll when they overflow. A 22px dot grid, masked so it fades, sits behind the public hero and the admin page. Light dots are the night neutral at 16% opacity. Dark dots are night text at 10% opacity.

## Elevation & Depth

Light panels use the card shadow. On hover, a project card and the public primary button pick up the lift shadow. Dark panels clear the shadow and sit as raised night on night, split by a hairline of 6% white. The light hairline is 6% black. Primary buttons keep the card shadow in both themes. The public stylesheet collapses animation and transition duration when the user prefers reduced motion.

### Shadow Vocabulary

- **Card** (`box-shadow: 0 1px 2px rgba(60,64,67,.12), 0 2px 6px 2px rgba(60,64,67,.08)`): light panels, and primary buttons.
- **Lift** (`box-shadow: 0 1px 3px rgba(60,64,67,.16), 0 8px 24px 4px rgba(60,64,67,.12)`): hover on light cards, and hover on the public primary button.

### Named Rules

**The Light Shadow Rule.** A dark panel does not wear a drop shadow. Its depth is the raised fill and the hairline.

## Shapes

Controls, chips, fields, and the N mark are fully round. Panels use a 1.5rem corner. The active tab is a 3px bar with a rounded top. Strokes are 1px hairlines.

### Named Rules

**The Pill and Panel Rule.** If it is pressed or typed into, it is a pill. If it holds a group of content, it is a panel with a 1.5rem corner.

## Components

### Buttons

- **Shape:** pill (9999px).
- **Primary:** Blue Ink fill, white label, 2.75rem minimum height, 1.25rem of horizontal padding, card shadow. Hover uses the deeper blue. On the public site the hover also switches to the lift shadow, and a press scales the control to 0.97. In dark the fill is a light blue and the label is a deep blue.
- **Hover / Focus:** color and shadow move over 200ms. Focus is a 2px Blue ring, offset 2px from the page.
- **Tonal:** a light gray fill and ink text. In dark, white at 10% and night text. No shadow. The public press scale applies here too.

### Chips

- **Style:** pill, 1px border at 10% black, soft-ink label at 0.75rem, padding 0.25rem 0.75rem.
- **State:** in dark the border is 15% white and the label is soft night. A chip can sit on a translucent white or night wash.

### Cards / Containers

- **Corner Style:** 1.5rem.
- **Background:** white, or raised night in dark.
- **Shadow Strategy:** card shadow in light, none in dark.
- **Border:** 1px at 6% black, or 6% white in dark.
- **Internal Padding:** 1.5rem is the common step. Compact cards use 1.25rem, and the contact panel steps up to 2.5rem from 640px.

### Inputs / Fields

- **Style:** the same pill and 2.75rem height as a button. White field, ink text, 1rem of horizontal padding, 1px border at 10% black.
- **Focus:** the same 2px Blue ring, offset 2px.
- **Error / Disabled:** no separate error chrome is defined. Empty data stays an ordinary sentence.

### Navigation

The bar is fixed, 4rem tall, and full width. At rest on the public page it is transparent. Once the page scrolls, and always on the admin page, it is white or night at 85% with a backdrop blur and a hairline. The N mark is 2rem: a Blue outer ring, a white or night inner disc, and a Blue N at weight 700. Tabs are 0.875rem. Inactive text is soft ink or soft night. Active text is ink or night text, with a 3px bar in that item's marker color and a 300ms scale. The theme control is a 2.5rem round button.

## Do's and Don'ts

### Do:

- **Do** default to dark unless the stored theme is light.
- **Do** keep focus as a 2px Blue ring with a 2px offset.
- **Do** mark the active item with a 3px bar in that item's marker color.
- **Do** keep the page column at 72rem with at least 1.25rem of inline padding.
- **Do** collapse animation and transitions when the user prefers reduced motion.

### Don't:

- **Don't** introduce an accent hue beyond blue, red, yellow, and green.
- **Don't** put a drop shadow on a dark panel.
- **Don't** use Caveat on a surface whose font list does not load it.
