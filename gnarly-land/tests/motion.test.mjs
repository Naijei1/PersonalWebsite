import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { createServer } from "vite";

const url = "http://127.0.0.1:5198/gnarly-land/";
test(
  "responsive destination explorer, links, evidence, and demo form delivery states",
  { timeout: 90000 },
  async () => {
    let server, browser;
    try {
      server = await createServer({
        server: { host: "127.0.0.1", port: 5198, strictPort: true },
        logLevel: "silent",
      });
      await server.listen();
      browser = await chromium.launch({ headless: true });
      const errors = [];
      const watch = (p) => {
        p.on("pageerror", (error) => errors.push(error.message));
        return p;
      };
      const page = watch(
        await browser.newPage({
          viewport: { width: 1280, height: 800 },
          reducedMotion: "reduce",
        }),
      );
      let payload,
        mode = "error",
        submissions = 0;
      await page.route("https://formsubmit.co/ajax/**", async (route) => {
        submissions++;
        payload = route.request().postDataJSON();
        await route.fulfill({
          status: mode === "error" ? 503 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            mode === "error"
              ? { success: false }
              : mode === "activation"
                ? {
                    success: "true",
                    message:
                      "Please activate your form by confirming your email",
                  }
                : { success: "true", message: "Form successfully submitted" },
          ),
        });
      });
      await page.goto(url, { waitUntil: "networkidle" });
      // Reduced motion skips the WebGL sweep. The SVG route stays on screen,
      // fully drawn, and the canvas that would play the scan stays hidden.
      const reducedScene = () =>
        page.evaluate(() => {
          const route = document.querySelector(".scan-route");
          const point = document.querySelector(".scan-point");
          const fallback = document.querySelector(".spatial-fallback");
          const canvas = document.querySelector(".cinematic-canvas");
          const hero = document.querySelector(".cinematic-hero");
          const routeStyle = getComputedStyle(route);
          const pointStyle = getComputedStyle(point);
          const fallbackStyle = getComputedStyle(fallback);
          const canvasStyle = getComputedStyle(canvas);
          const routeBox = route.getBoundingClientRect();
          const pointBox = point.getBoundingClientRect();
          const fallbackBox = fallback.getBoundingClientRect();
          return {
            phase: hero.getAttribute("data-phase"),
            hasScene: hero.classList.contains("has-scene"),
            staticTrack: document
              .querySelector(".hero-track")
              .classList.contains("is-static"),
            heroPosition: getComputedStyle(hero).position,
            controls: document.querySelectorAll(".cinematic-controls button")
              .length,
            routeAnimation: routeStyle.animationName,
            routeOffset: routeStyle.strokeDashoffset,
            routeWidth: routeBox.width,
            routeHeight: routeBox.height,
            pointAnimation: pointStyle.animationName,
            pointWidth: pointBox.width,
            pointOpacity: Number(pointStyle.opacity),
            fallbackDisplay: fallbackStyle.display,
            fallbackVisibility: fallbackStyle.visibility,
            fallbackOpacity: Number(fallbackStyle.opacity),
            fallbackWidth: fallbackBox.width,
            fallbackHeight: fallbackBox.height,
            canvasOpacity: Number(canvasStyle.opacity),
            routePath: route.getAttribute("d"),
          };
        });
      const assertRouteHeld = (state, label) => {
        assert.equal(state.phase, "ready", label);
        assert.equal(state.hasScene, false, label);
        assert.equal(state.staticTrack, true, label);
        assert.equal(state.heroPosition, "relative", label);
        assert.equal(state.controls, 0, label);
        assert.equal(state.routeAnimation, "none", label);
        assert.equal(state.pointAnimation, "none", label);
        assert.match(state.routeOffset, /^0(px)?$/, label);
        assert.ok(
          state.routeWidth > 8 && state.routeHeight > 8,
          `${label} route box ${state.routeWidth}x${state.routeHeight}`,
        );
        assert.ok(
          state.pointWidth > 2 && state.pointOpacity > 0.5,
          `${label} point ${state.pointWidth}px at opacity ${state.pointOpacity}`,
        );
        assert.notEqual(state.fallbackDisplay, "none", label);
        assert.notEqual(state.fallbackVisibility, "hidden", label);
        assert.ok(
          state.fallbackOpacity > 0.5 &&
            state.fallbackWidth > 100 &&
            state.fallbackHeight > 100,
          `${label} fallback ${state.fallbackWidth}x${state.fallbackHeight} at opacity ${state.fallbackOpacity}`,
        );
        assert.equal(state.canvasOpacity, 0, label);
      };
      const resting = await reducedScene();
      assertRouteHeld(resting, "reduced motion");
      assert.equal(
        await page.getByRole("button", { name: "Pause animation" }).count(),
        0,
      );
      await page.getByLabel("Choose a destination").selectOption("2");
      const chosen = await reducedScene();
      assertRouteHeld(chosen, "reduced motion after a destination change");
      assert.notEqual(chosen.routePath, resting.routePath);
      assert.match(
        await page.locator(".spatial-fallback").textContent(),
        /Front desk/,
      );
      assert.match(
        await page.locator(".destination-panel").innerText(),
        /first door on your left/,
      );
      // Every in-page link lands on a section; external links go to real hosts.
      const links = await page.$$eval("a[href]", (anchors) =>
        anchors.map((a) => a.getAttribute("href")),
      );
      for (const href of links) {
        if (href.startsWith("#"))
          assert.ok(await page.locator(href).count(), `missing target ${href}`);
        else
          assert.match(
            href,
            /^https:\/\/(youtu\.be|gnarlynav\.com|github\.com|formsubmit\.co)\b/,
            href,
          );
      }
      // Product evidence is real footage that loads, including the frames
      // waiting in the steps stage.
      const frames = page.locator(
        "#field-test img, #how-it-works img, #product img",
      );
      assert.equal(await frames.count(), 9);
      for (const img of await frames.all()) {
        const handle = await img.elementHandle();
        await handle.evaluate((el) => {
          el.loading = "eager";
          el.scrollIntoView();
        });
        await page.waitForFunction(
          (el) => el.complete && el.naturalWidth > 0,
          handle,
        );
      }
      // Reduced motion: no pin and no autoplay; steps open on request and
      // only the open step's frame is reachable.
      const how = page.locator("#how-it-works");
      assert.equal(await how.getAttribute("data-mode"), "manual");
      assert.equal(await how.locator(".step-timer").count(), 0);
      const connect = how.getByRole("button", { name: /Connect/ });
      await connect.click();
      assert.equal(await connect.getAttribute("aria-expanded"), "true");
      assert.equal(
        await how
          .locator('.stage-panel[data-active="true"] img')
          .getAttribute("src"),
        "/gnarly-land/evidence/connect.webp",
      );
      assert.equal(
        await how.locator(".stage-panel[inert]").count(),
        3,
        "hidden stage panels are inert",
      );
      // The first screen: one primary button, no copy over the model, and
      // nothing overlapping on phones.
      const box = (selector) =>
        page.evaluate((s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
        }, selector);
      const visibleModel = (s) =>
        page.evaluate((s) => {
          const el = document.querySelector(s);
          const r = el.getBoundingClientRect();
          // The fallback drawing is letterboxed inside its box.
          const view = el.viewBox?.baseVal;
          if (!view) return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
          const scale = Math.min(r.width / view.width, r.height / view.height);
          const w = view.width * scale;
          return { x: r.x + (r.width - w) / 2, right: r.x + (r.width + w) / 2 };
        }, s);
      for (const width of [1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        const copy = await box(".hero-copy h1"),
          lede = await box(".hero-copy .lede"),
          scene = await box(".cinematic-scene"),
          drawing = await visibleModel(".spatial-fallback");
        assert.ok(copy.right <= scene.x, `headline clear of model at ${width}`);
        assert.ok(lede.right <= scene.x, `lede clear of model at ${width}`);
        assert.ok(copy.right <= drawing.x, `headline clear of drawing at ${width}`);
        const primaries = await page.evaluate(
          () =>
            [...document.querySelectorAll(".btn-primary")].filter((el) => {
              const r = el.getBoundingClientRect();
              return r.bottom > 0 && r.top < innerHeight;
            }).length,
        );
        assert.equal(primaries, 1, `one primary button above the fold at ${width}`);
        const tag = await box(".scene-tag");
        assert.ok(tag.x >= scene.x && tag.right <= width, `tag on the model at ${width}`);
      }
      await page.setViewportSize({ width: 390, height: 844 });
      {
        const h1 = await box(".hero-copy h1"),
          lede = await box(".hero-copy .lede"),
          actions = await box(".hero .actions"),
          frame = await box(".hero-frame"),
          tag = await box(".scene-tag");
        assert.ok(h1.bottom <= lede.y, "headline above lede on phones");
        assert.ok(lede.bottom <= actions.y, "lede above actions on phones");
        assert.ok(actions.bottom <= frame.y, "actions above model on phones");
        assert.ok(
          tag.y >= frame.y && tag.bottom <= frame.bottom && tag.right <= 390,
          "tag inside the model on phones",
        );
      }
      for (const width of [320, 390, 700, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `overflow at ${width}`,
        );
        const controls = await page.locator(".destination-panel").boundingBox();
        assert.ok(
          controls.width > 0 &&
            controls.x >= 0 &&
            controls.x + controls.width <= width + 1,
          `destination at ${width}`,
        );
        // Supporting text stays readable on every screen.
        const smallest = await page.evaluate(() =>
          Math.min(
            ...[
              ...document.querySelectorAll(
                "main p, main label, main a, main button, main figcaption, footer a, footer p",
              ),
            ]
              .filter((el) => el.offsetParent && el.textContent.trim())
              .map((el) => parseFloat(getComputedStyle(el).fontSize)),
          ),
        );
        assert.ok(smallest >= 12, `text at ${smallest}px on ${width}`);
      }
      // On phones the route picker sits directly below the map.
      await page.setViewportSize({ width: 390, height: 844 });
      const map = await page.locator(".cinematic-scene").boundingBox(),
        picker = await page.locator(".destination-panel").boundingBox();
      assert.ok(
        Math.abs(picker.y - (map.y + map.height)) < 4,
        "picker under map",
      );
      await page.setViewportSize({ width: 1280, height: 630 });
      await page
        .getByRole("link", { name: "Gnarly home", exact: true })
        .first()
        .click();
      await page.waitForFunction(() => window.scrollY < 2);
      const primaryActions = await page.locator(".hero .actions").boundingBox();
      assert.ok(
        primaryActions.y + primaryActions.height <= 630,
        "hero actions visible on short desktop",
      );
      // Phones fold the links into a menu that closes on Escape and on choice.
      await page.setViewportSize({ width: 390, height: 844 });
      const toggle = page.getByRole("button", { name: "Open menu" });
      await toggle.click();
      const menu = page.locator("#nav-menu");
      await menu.getByRole("link", { name: "Product" }).waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(await menu.getAttribute("inert"), "");
      assert.ok(
        await toggle.evaluate((el) => el === document.activeElement),
        "focus returns to the menu button",
      );
      await toggle.click();
      await menu.getByRole("link", { name: "Product" }).click();
      await page.waitForFunction(() => {
        const top = document
          .querySelector("#product")
          .getBoundingClientRect().top;
        return top >= 0 && top < 120;
      });
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      await page
        .locator("header")
        .getByRole("link", { name: "Request a demo", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Request a demo", exact: true })
        .click();
      assert.equal(submissions, 0, "invalid empty form must not send");
      await page.getByLabel("Full name", { exact: true }).fill("Demo Test");
      await page
        .getByLabel("Work email", { exact: true })
        .fill("demo@example.com");
      await page
        .getByLabel("Organization", { exact: true })
        .fill("Test Organization");
      await page
        .getByLabel("What kind of space?", { exact: true })
        .selectOption("Campus building");
      await page
        .getByLabel("Describe your building", { exact: false })
        .fill("Three floors, two entrances.");
      await page
        .getByRole("button", { name: "Request a demo", exact: true })
        .click();
      await page.getByRole("alert").waitFor();
      assert.equal(
        await page.getByLabel("Full name", { exact: true }).inputValue(),
        "Demo Test",
      );
      mode = "activation";
      await page
        .getByRole("button", { name: "Request a demo", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelector(".demo-form")?.getAttribute("aria-busy") ===
          "false",
      );
      assert.equal(
        await page.locator(".form-success").count(),
        0,
        "activation is not delivery",
      );
      mode = "success";
      await page
        .getByRole("button", { name: "Request a demo", exact: true })
        .click();
      await page.locator(".form-success").waitFor();
      assert.match(
        await page.locator(".form-success").innerText(),
        /demo@example.com/,
      );
      assert.equal(payload.email, "demo@example.com");
      assert.equal(payload.organization, "Test Organization");
      assert.equal(payload.message, "Three floors, two entrances.");
      assert.equal(payload._subject, "Gnarly — New demo request");
      assert.ok(
        await page
          .locator(".form-success")
          .evaluate((el) => el === document.activeElement),
      );

      // Desktop: the scan plays, holds on the floors, and scroll draws the route.
      const cinematic = watch(
        await browser.newPage({
          viewport: { width: 1280, height: 800 },
        }),
      );
      await cinematic.goto(url, { waitUntil: "networkidle" });
      await cinematic.locator(".hero.has-scene").waitFor();
      const panel = cinematic.locator(".destination-panel");
      assert.equal(await panel.getAttribute("data-revealed"), "false");
      assert.equal(await panel.getAttribute("inert"), "");
      // Autoplay holds on the overview; only scroll draws the route.
      await cinematic
        .locator('.hero[data-holding="true"]')
        .waitFor({ timeout: 10000 });
      assert.equal(await cinematic.locator(".cinematic-controls").count(), 0);
      assert.equal(await panel.getAttribute("data-revealed"), "false");
      const span = await cinematic.evaluate(
        () => document.querySelector(".hero-track").offsetHeight - innerHeight,
      );
      assert.ok(span > 400, `pinned scroll span ${span}`);
      await cinematic.mouse.wheel(0, span);
      await cinematic.locator('.hero[data-phase="ready"]').waitFor();
      await cinematic
        .locator('.destination-panel[data-revealed="true"]')
        .waitFor();
      assert.equal(await panel.getAttribute("inert"), null);
      assert.match(
        await cinematic.locator(".scene-tag").innerText(),
        /Illustrative model/i,
      );
      // The framed scene reaches full bleed by the end of the pin.
      await cinematic.waitForFunction(() => {
        const frame = getComputedStyle(document.querySelector(".hero-frame"));
        return (
          parseFloat(frame.left) < 0.5 &&
          parseFloat(frame.borderTopLeftRadius) < 0.5
        );
      });
      // The renderer stops after completion; the scene must survive canvas readback.
      await cinematic.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      const colors = await cinematic
        .locator(".cinematic-canvas")
        .evaluate((canvas) => {
          const gl = canvas.getContext("webgl2");
          const pixels = new Uint8Array(canvas.width * canvas.height * 4);
          gl.readPixels(
            0,
            0,
            canvas.width,
            canvas.height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels,
          );
          const unique = new Set();
          for (let i = 0; i < pixels.length; i += 64)
            unique.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
          return unique.size;
        });
      assert.ok(
        colors > 20,
        `completed WebGL frame contains only ${colors} colors`,
      );
      const endLabel = cinematic.locator(".scene-label.is-end");
      const before = await endLabel.evaluate((el) => el.style.transform);
      await cinematic.getByLabel("Choose a destination").selectOption("1");
      assert.match(await endLabel.innerText(), /Room 104/);
      await cinematic.waitForFunction(
        (previous) =>
          document.querySelector(".scene-label.is-end").style.transform !==
          previous,
        before,
      );
      await cinematic
        .getByRole("button", { name: "Replay the journey", exact: true })
        .click();
      await cinematic
        .getByRole("button", { name: "Pause animation", exact: true })
        .click();
      await cinematic
        .getByRole("button", { name: "Play animation", exact: true })
        .waitFor();

      // Wide screens pin the steps; scrolling through the section changes step.
      await cinematic.evaluate(() =>
        document
          .querySelector("#how-it-works")
          .scrollIntoView({ behavior: "instant" }),
      );
      const pinned = cinematic.locator("#how-it-works");
      assert.equal(await pinned.getAttribute("data-mode"), "pinned");
      const howSpan = await pinned.evaluate(
        (el) => el.offsetHeight - innerHeight,
      );
      assert.ok(howSpan > 600, `steps pin span ${howSpan}`);
      await cinematic.evaluate(
        (y) => scrollTo({ top: scrollY + y, behavior: "instant" }),
        Math.round(howSpan * 0.6),
      );
      await cinematic.waitForFunction(
        () =>
          document
            .querySelector("#step-follow")
            ?.getAttribute("aria-expanded") === "true",
      );
      const stageTop = await pinned
        .locator(".how-stage")
        .evaluate((el) => el.getBoundingClientRect().top);
      assert.ok(stageTop > 0 && stageTop < 800, `stage pinned at ${stageTop}`);

      // Phones skip the pin and play the short version, with a skip control.
      const phone = watch(
        await browser.newPage({
          viewport: { width: 390, height: 844 },
        }),
      );
      await phone.goto(url, { waitUntil: "networkidle" });
      await phone.locator(".hero.has-scene").waitFor();
      assert.equal(
        await phone.evaluate(
          () =>
            document.querySelector(".hero-track").offsetHeight <=
            document.querySelector(".hero").offsetHeight + 1,
        ),
        true,
        "no pin on phones",
      );
      const scene = await phone.locator(".cinematic-scene").boundingBox();
      assert.ok(scene.y + scene.height * 0.5 < 844, "map on the first screen");
      await phone
        .getByRole("button", { name: "Skip intro", exact: true })
        .click();
      await phone.locator('.hero[data-phase="ready"]').waitFor();
      // Without a pin the steps autoplay on a timer that pauses offscreen.
      const phoneHow = phone.locator("#how-it-works");
      assert.equal(await phoneHow.getAttribute("data-mode"), "autoplay");
      await phoneHow.scrollIntoViewIfNeeded();
      // Hover holds the timer, so park the pointer off the steps first.
      await phone.mouse.move(1, 1);
      await phoneHow.locator('.step-timer[data-running="true"]').waitFor();

      const fallback = watch(
        await browser.newPage({
          viewport: { width: 390, height: 844 },
        }),
      );
      await fallback.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          if (String(kind).startsWith("webgl")) return null;
          return original.call(this, kind, ...args);
        };
      });
      await fallback.goto(url, { waitUntil: "networkidle" });
      await fallback.locator('.hero[data-phase="ready"]').waitFor();
      assert.equal(await fallback.locator(".hero.has-scene").count(), 0);
      assert.equal(
        await fallback.locator(".spatial-fallback").isVisible(),
        true,
      );
      await fallback
        .getByLabel("Choose a destination", { exact: true })
        .selectOption("1");
      assert.match(
        await fallback.locator(".destination-panel").innerText(),
        /second door on your right/,
      );
      assert.deepEqual(errors, [], "no page errors");
    } finally {
      await browser?.close();
      await server?.close();
    }
  },
);
