import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chromium } from 'playwright'
import { createServer } from 'vite'

test('reduced motion stops the sweep and keeps the route line visible', async () => {
  let server
  let browser
  try {
    server = await createServer({
      server: { host: '127.0.0.1', port: 5198, strictPort: true },
      logLevel: 'silent',
    })
    await server.listen()
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'reduce',
    })
    await page.goto('http://127.0.0.1:5198/gnarly-land/', { waitUntil: 'networkidle' })
    const state = await page.evaluate(() => {
      const route = document.querySelector('.scan-route')
      const point = document.querySelector('.scan-point')
      const tape = document.querySelector('.tape')
      const routeStyle = getComputedStyle(route)
      const pointStyle = getComputedStyle(point)
      const tapeStyle = getComputedStyle(tape)
      const box = tape.getBoundingClientRect()
      const routeBox = route.getBoundingClientRect()
      return {
        routeAnimation: routeStyle.animationName,
        routeOffset: routeStyle.strokeDashoffset,
        pointOpacity: Number(pointStyle.opacity),
        pointAnimation: pointStyle.animationName,
        tapeDisplay: tapeStyle.display,
        tapeVisibility: tapeStyle.visibility,
        tapeOpacity: Number(tapeStyle.opacity),
        tapeWidth: box.width,
        tapeHeight: box.height,
        routeWidth: routeBox.width,
        filmInHero: document.querySelector('.hero img') !== null,
      }
    })
    assert.equal(state.routeAnimation, 'none')
    assert.equal(state.pointAnimation, 'none')
    assert.match(state.routeOffset, /^0(px)?$/)
    assert.ok(state.pointOpacity > 0.5, `point opacity ${state.pointOpacity}`)
    assert.ok(state.routeWidth > 8, `route width ${state.routeWidth}`)
    assert.equal(state.filmInHero, false)
    assert.notEqual(state.tapeDisplay, 'none')
    assert.notEqual(state.tapeVisibility, 'hidden')
    assert.ok(state.tapeOpacity > 0.5, `tape opacity ${state.tapeOpacity}`)
    assert.ok(state.tapeWidth >= 2, `tape width ${state.tapeWidth}`)
    assert.ok(state.tapeHeight > 40, `tape height ${state.tapeHeight}`)
  } finally {
    await browser?.close()
    await server?.close()
  }
})
