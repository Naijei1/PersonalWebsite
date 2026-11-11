import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const page = `${app}\n${html}`

test('real destinations and the three CTAs are present', () => {
  assert.match(page, /https:\/\/naijei.com\/gnarly\//)
  assert.match(page, /https:\/\/youtu\.be\/XkmW11bmEXg/)
  assert.match(page, /https:\/\/github.com\/gnarly-nav\/gnarly/)
  assert.match(page, /Open the live map/)
  assert.match(page, /Watch the demo/)
  assert.match(page, /View the code/)
  assert.match(page, /North Hall/)
  assert.match(page, /Capture pending/)
  assert.match(page, /experimental/)
  assert.match(page, /Gaussian splat/)
})

test('share metadata and motion fallback exist', () => {
  assert.match(html, /rel="canonical" href="https:\/\/naijei.com\/gnarly-land\/"/)
  assert.match(html, /property="og:image" content="https:\/\/naijei.com\/gnarly-land\/og.png"/)
  assert.match(html, /name="description"/)
  assert.match(css, /prefers-reduced-motion/)
  assert.match(app, /Skip to content/)
})

test('unconfirmed claims and teammate names stay off the page', () => {
  assert.doesNotMatch(page, /App Store|TestFlight|Firebase|testimonial|award|press/i)
  assert.doesNotMatch(app, /\d+(\.\d+)?\s*%/)
  for (const name of ['Geneustace', 'Mukund', 'Grant Lin', 'Maruf', 'Naijei Jiang']) {
    assert.equal(page.includes(name), false, name)
  }
})
