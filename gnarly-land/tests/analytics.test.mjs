import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../public/analytics.js', import.meta.url), 'utf8')
function browser(url, tags = ['data-gnarly']) {
  const location = new URL(url)
  const scripts = [], hits = []
  const window = new EventTarget()
  const history = { pushState() {}, replaceState() {} }
  const document = {
    currentScript: { hasAttribute: (attr) => tags.includes(attr) },
    createElement: () => ({ dataset: {} }), head: { append: (script) => scripts.push(script) },
    title: 'Private name', referrer: 'https://example.org/secret?name=private',
  }
  runInNewContext(source, { window, history, location, document, URL })
  function ready() {
    window.goatcounter.count = (hit) => hits.push({ ...hit })
    scripts[0].onload()
  }
  return { scripts, hits, window, history, location, ready }
}

test('loads count.js only for a production site and selects the code at runtime', () => {
  for (const host of ['admin.naijei.com', 'localhost', '127.0.0.1', '192.168.1.2', 'main.example.amplifyapp.com', 'gnarlynav.com.example']) {
    assert.deepEqual(browser(`https://${host}/`).scripts, [])
  }
  assert.deepEqual(browser('file:///index.html').scripts, [])
  assert.deepEqual(browser('https://gnarlynav.com/', []).scripts, [])
  assert.deepEqual(browser('https://naijei.com/gnarly/map', ['data-404']).scripts, [])
  const missing = browser('https://naijei.com/private-name', ['data-404'])
  missing.ready()
  assert.equal(missing.hits[0].path, '/404.html')
  for (const [host, code, path] of [['naijei.com', 'naijei', '/gnarly-land/'], ['gnarlynav.com', 'gnarlynav', '/']]) {
    for (const prefix of ['', 'www.']) {
      const b = browser(`https://${prefix}${host}${path}?email=private#private`)
      assert.equal(b.window.goatcounter.no_onload, true)
      assert.equal(b.window.goatcounter.allow_local, false)
      assert.equal(b.scripts[0].dataset.goatcounter, `https://${code}.goatcounter.com/count`)
      assert.equal(b.scripts[0].src, 'https://gc.zgo.at/count.js')
      b.ready()
      assert.equal(b.hits[0].path, path)
      assert.equal(b.hits[0].event, false)
      assert.equal(JSON.stringify(b.hits).includes('private'), false)
    }
  }
})

test('queues path changes, deduplicates adjacent paths, and groups unrecognized paths', () => {
  const b = browser('https://naijei.com/')
  b.window.dispatchEvent(new Event('hashchange'))
  b.location.pathname = '/downloader/'
  b.history.pushState()
  b.history.replaceState()
  b.ready()
  for (const path of ['/Alice', '/user@example.com', '/token/1e5dff9cb1a907cd', '/search/secret', '/']) {
    b.location.pathname = path
    b.window.dispatchEvent(new Event('popstate'))
  }
  assert.deepEqual(b.hits.map((hit) => hit.path), ['/', '/downloader/', '/other', '/'])
  assert.ok(b.hits.every((hit) => hit.title === 'naijei.com' && hit.referrer === 'https://example.org'))
})
