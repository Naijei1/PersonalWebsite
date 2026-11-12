import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
const source = (name) =>
  readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const app = [
    "src/App.tsx",
    "src/Sections.tsx",
    "src/HowItWorks.tsx",
    "src/Nav.tsx",
    "src/ui.tsx",
  ]
    .map(source)
    .join("\n"),
  stage = source("src/HeroStage.tsx"),
  scene = source("src/cinematic-scene.ts"),
  form = source("src/DemoRequest.tsx"),
  html = source("index.html"),
  config = source("vite.config.ts");
test("startup branding, real evidence, demo conversion, and walkthrough", () => {
  assert.match(app, /Walk a building\./);
  assert.match(app, /Give visitors<\/span>/);
  assert.match(app, /className="scan-word">directions\.</);
  assert.match(app, /Explore the live map/);
  assert.match(app, /Watch the walkthrough/);
  assert.match(app, /https:\/\/gnarlynav\.com/);
  assert.doesNotMatch(app + form, /href="\/gnarly\/"/);
  assert.doesNotMatch(
    app,
    /Illustrative diagram|Discover Gnarly|Explore Gnarly/,
  );
  for (const name of [
    "plan",
    "hallway",
    "ar",
    "capture",
    "connect",
    "elevator",
  ])
    assert.ok(
      existsSync(new URL(`../public/evidence/${name}.webp`, import.meta.url)),
      name,
    );
  // The FormSubmit address is the one allowed exception, and it is never shown.
  assert.doesNotMatch(
    app + stage + html + form.replace("nj277@cornell.edu", ""),
    /naijei\.com|Cornell|student team|BigRed|Big Red|hackathon|Capture pending/i,
  );
  assert.match(form, /https:\/\/formsubmit.co\/ajax\/nj277@cornell.edu/);
  assert.match(form, /form-success/);
  // Campus buildings are the only use case; the test building stays generic.
  assert.doesNotMatch(
    app + stage + html + form,
    /Healthcare|hospital|terminal|Events & public|Offices & workplaces|Baker|auditorium|third floor/i,
  );
  assert.match(app, /two-floor campus building/);
  assert.equal((app.match(/78 m/g) || []).length, 2, "78 m only in the field test");
  assert.ok(!existsSync(new URL("../src/scan-scene.ts", import.meta.url)));
});
test("hero holds one headline, one line, one primary button and the model", () => {
  for (const removed of [
    "Show the route",
    "Scroll to draw the route",
    "Rooms, doorways and floors connected",
    "hero-proof",
    "No beacons</span>",
  ])
    assert.ok(!(app + stage).includes(removed), removed);
  assert.doesNotMatch(app + stage, /Statements|UseCases|Advantages|Horizon/);
});
test("motion supports scrubbing, skipping, pausing, replay, static fallback, and destination selection", () => {
  for (const word of [
    "prefers-reduced-motion",
    "Skip intro",
    "Pause animation",
    "Replay the journey",
    "selectDestination",
    "SpatialFallback",
    "Illustrative model",
  ])
    assert.ok(stage.includes(word), word);
  assert.match(scene, /setProgress/);
  assert.match(app, /Skip to content/);
  // Canonical and Open Graph URLs are absolute once built.
  assert.match(html, /rel="canonical" href="%SITE_URL%"/);
  assert.match(html, /og:image" content="%SITE_URL%og\.jpg"/);
  assert.match(config, /GNARLY_SITE_URL/);
});
