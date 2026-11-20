(() => {
  const { hostname, protocol } = location
  if (protocol !== 'https:' && protocol !== 'http:') return
  const tag = document.currentScript
  const gnarly = tag.hasAttribute('data-gnarly') && ['gnarlynav.com', 'www.gnarlynav.com'].includes(hostname)
  if (!gnarly && !['naijei.com', 'www.naijei.com'].includes(hostname)) return

  const missing = tag.hasAttribute('data-404')
  if (missing && /^\/(?:gnarly|gnary)(?:\/|$)/.test(location.pathname)) return

  const code = gnarly ? 'gnarlynav' : 'naijei'
  // Only published, fixed page names may leave the browser. Unknown URLs share a bucket.
  const known = /^\/(?:index\.html|404\.html|(?:downloader|gnarly-land|paxos|demo)(?:\/(?:index\.html)?)?)?$/
  function referrer() {
    try { return new URL(document.referrer).origin } catch { return '' }
  }
  window.goatcounter = { no_onload: true, allow_local: false, referrer }
  const pending = []
  let previous
  function flush() {
    if (!window.goatcounter.count) return
    for (const hit of pending.splice(0)) window.goatcounter.count(hit)
  }
  function visit() {
    const path = missing ? '/404.html' : known.test(location.pathname) ? location.pathname : '/other'
    if (path === previous) return
    previous = path
    pending.push({ path, title: gnarly ? 'Gnarly' : 'naijei.com', event: false, referrer: referrer() })
    flush()
  }
  visit()
  window.addEventListener('popstate', visit)
  window.addEventListener('hashchange', visit)
  for (const method of ['pushState', 'replaceState']) {
    const original = history[method]
    history[method] = function (...args) {
      original.apply(this, args)
      visit()
    }
  }
  const script = document.createElement('script')
  script.async = true
  script.dataset.goatcounter = `https://${code}.goatcounter.com/count`
  script.src = 'https://gc.zgo.at/count.js'
  script.referrerPolicy = 'no-referrer'
  script.onload = flush
  document.head.append(script)
})()
