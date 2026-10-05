// Regenerates the static fallback images in public/showcase/ from the live 3D scenes.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/capture-posters.mjs [ids...]
// Needs Playwright's Chromium once: npx playwright install chromium
import { writeFile, mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = process.env.SITE_URL ?? 'http://localhost:4173/'
const ALL = ['groovy', 'downloader', 'gnarly', 'cluster', 'seeround', 'bioprint']
// Scenes that build up over time are captured at a later, more complete moment.
const WAIT_MS = { gnarly: 9500 }
const IDS = process.argv.length > 2 ? process.argv.slice(2) : ALL

await mkdir(new URL('../public/showcase/', import.meta.url), { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 })

for (const id of IDS) {
  await page.goto(`${BASE}?3d=1&poster=1#project-${id}`)
  await page.locator(`#project-${id}`).scrollIntoViewIfNeeded()
  await page.locator(`#project-${id} canvas`).waitFor()
  await page.waitForTimeout(WAIT_MS[id] ?? 3200)
  const dataUrl = await page.locator(`#project-${id} canvas`).evaluate((c) => c.toDataURL('image/png'))
  const out = new URL(`../public/showcase/${id}.png`, import.meta.url)
  await writeFile(out, Buffer.from(dataUrl.split(',')[1], 'base64'))
  console.log(`saved ${out.pathname}`)
}

await browser.close()
