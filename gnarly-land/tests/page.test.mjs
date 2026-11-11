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

test('share metadata is present', () => {
  assert.match(html, /rel="canonical" href="https:\/\/naijei.com\/gnarly-land\/"/)
  assert.match(html, /property="og:image" content="https:\/\/naijei.com\/gnarly-land\/og.png"/)
  assert.match(html, /name="description"/)
  assert.match(app, /Skip to content/)
})

test('reduced motion turns the scan off and leaves the route line alone', () => {
  const start = css.indexOf('@media (prefers-reduced-motion: reduce)')
  assert.ok(start >= 0, 'missing prefers-reduced-motion block')
  const block = css.slice(start)
  assert.match(block, /\.scan-route\b[\s\S]*?animation:\s*none/)
  assert.match(block, /stroke-dashoffset:\s*0/)
  assert.doesNotMatch(block, /\.tape\b[^}]*\{[^}]*(?:display:\s*none|visibility:\s*hidden|opacity:\s*0)/)
})

test('unconfirmed claims and teammate names stay off the page', () => {
  assert.doesNotMatch(page, /App Store|TestFlight|Firebase|testimonial|award|press/i)
  assert.doesNotMatch(app, /\d+(\.\d+)?\s*%/)
  for (const name of ['Geneustace', 'Mukund', 'Grant Lin', 'Maruf', 'Naijei Jiang']) {
    assert.equal(page.includes(name), false, name)
  }
})
