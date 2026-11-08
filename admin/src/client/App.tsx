import { useEffect, useState } from 'react'
import Chart from './Chart'
import type { Overview } from '../shared/overview.js'
import { addDays, utcDay } from '../shared/range.js'

type HostingReport = {
  separateFromCollector: true
  enabled: boolean
  note: string
  sources: {
    id: string
    label: string
    status: 'not-configured' | 'ok' | 'no-buckets' | 'unavailable'
    requests: number | null
    buckets: { day: string; requests: number }[]
    coverage: string
  }[]
}

type Session = {
  configured: boolean
  authenticated: boolean
  email: string | null
  preview: 'off' | 'demo' | 'empty'
}

type Theme = 'dark' | 'light'

const FLASH: Record<string, string> = {
  denied: 'That Google account cannot open this admin. Use the owner account.',
  expired: 'That sign-in attempt expired. Start it again.',
  failed: 'Google did not complete sign-in. Nothing was granted.',
  unconfigured: 'Google sign-in is not configured on this server yet.',
}

const numberFormat = new Intl.NumberFormat('en-US')

function formatNumber(value: number): string {
  return numberFormat.format(value)
}

function formatDay(day: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  )
}

function rangeTitle(from: string, to: string): string {
  const today = utcDay(new Date())
  if (to === today && from === addDays(today, -6)) return 'Last 7 days'
  if (to === today && from === addDays(today, -27)) return 'Last 28 days'
  if (to === today && from === addDays(today, -89)) return 'Last 90 days'
  return `${formatDay(from)} – ${formatDay(to)}`
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function Mark() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-g-blue p-[2px]" aria-hidden="true">
      <span className="grid h-full w-full place-items-center rounded-full bg-white text-sm font-bold text-g-blue dark:bg-night">
        N
      </span>
    </span>
  )
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
  const [session, setSession] = useState<Session | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [hosting, setHosting] = useState<HostingReport | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [search, setSearch] = useState(() => window.location.search)

  useEffect(() => {
    const params = new URLSearchParams(search)
    const code = params.get('auth')
    if (code && FLASH[code]) setFlash(FLASH[code])
    if (code) {
      params.delete('auth')
      const next = params.toString()
      const url = `${window.location.pathname}${next ? `?${next}` : ''}`
      window.history.replaceState(null, '', url)
      setSearch(next ? `?${next}` : '')
    }
  }, [search])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* The theme still applies for this visit. */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1F1F1F' : '#ffffff')
  }, [theme])

  useEffect(() => {
    const params = new URLSearchParams(search)
    params.delete('auth')
    const site = params.get('site') || 'all'
    const query = new URLSearchParams()
    query.set('site', site)
    const from = params.get('from')
    const to = params.get('to')
    if (from) query.set('from', from)
    if (to) query.set('to', to)
    let cancelled = false

    async function load() {
      setStatus((current) => (current === 'ready' ? current : 'loading'))
      const sessionResponse = await fetch('/api/session', { headers: { accept: 'application/json' } })
      if (!sessionResponse.ok) throw new Error('The admin service did not answer.')
      const nextSession = (await sessionResponse.json()) as Session
      if (cancelled) return
      setSession(nextSession)
      if (!nextSession.authenticated && nextSession.preview === 'off') {
        setOverview(null)
        setHosting(null)
        setStatus('ready')
        return
      }
      const overviewResponse = await fetch(`/api/overview?${query}`, { headers: { accept: 'application/json' } })
      if (overviewResponse.status === 401) {
        setSession({ ...nextSession, authenticated: false })
        setOverview(null)
        setHosting(null)
        setStatus('ready')
        return
      }
      if (!overviewResponse.ok) {
        const body = (await overviewResponse.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error === 'bad-range' || body?.error === 'bad-date' ? 'That date range is not valid.' : 'The range could not be loaded.')
      }
      const nextOverview = (await overviewResponse.json()) as Overview
      const hostingResponse = await fetch(`/api/hosting?${query}`, { headers: { accept: 'application/json' } })
      const nextHosting = hostingResponse.ok ? ((await hostingResponse.json()) as HostingReport) : null
      if (cancelled) return
      setOverview(nextOverview)
      setHosting(nextHosting)
      setStatus('ready')
      setMessage(null)
    }

    load().catch((error: unknown) => {
      if (cancelled) return
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'The range could not be loaded.')
    })
    return () => {
      cancelled = true
    }
  }, [search])

  function pushQuery(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(window.location.search)
    params.delete('auth')
    mutate(params)
    const next = params.toString()
    window.history.pushState(null, '', `${window.location.pathname}${next ? `?${next}` : ''}`)
    setSearch(next ? `?${next}` : '')
  }

  useEffect(() => {
    const onPop = () => setSearch(window.location.search)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const signedIn = Boolean(session?.authenticated)
  const preview = session?.preview ?? 'off'
  const showDashboard = Boolean(overview) && (signedIn || preview !== 'off')
  const params = new URLSearchParams(search)
  const activeSite = params.get('site') || 'all'

  async function signOut() {
    const response = await fetch('/auth/logout', { method: 'POST' })
    if (response.ok || response.status === 204) {
      window.location.assign('/')
      return
    }
    setMessage('Sign-out did not complete. Refresh and try again.')
  }

  async function download() {
    const query = new URLSearchParams(window.location.search)
    query.delete('auth')
    const response = await fetch(`/api/export?${query}`)
    if (response.status === 401) {
      setOverview(null)
      setSession((current) => (current ? { ...current, authenticated: false, preview: 'off' } : current))
      return
    }
    if (!response.ok) {
      setMessage('The export did not complete.')
      return
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'naijei-analytics.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-screen">
      <div className="page-grid pointer-events-none fixed inset-x-0 top-0 h-[28rem]" aria-hidden="true" />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 dark:focus:bg-night-raised"
      >
        Skip to content
      </a>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-md dark:border-white/[0.06] dark:bg-night/85"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <nav className="shell flex h-16 min-w-0 items-center gap-2 overflow-hidden" aria-label="Admin">
          <a href="/" className="flex shrink-0 items-center gap-2 rounded-full pr-1 font-medium">
            <Mark />
            <span className="hidden sm:inline">Analytics</span>
          </a>
          {showDashboard && overview && (
            <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" role="tablist" aria-label="Site">
              <SiteTab id="all" label="All" color="#4285F4" active={activeSite === 'all'} onSelect={() => pushQuery((next) => next.delete('site'))} />
              {overview.sites.map((site) => (
                <SiteTab
                  key={site.id}
                  id={site.id}
                  label={site.id === 'naijei' ? 'naijei.com' : site.id === 'gnarly' ? '/gnarly' : site.label.replace('.naijei.com', '')}
                  color={site.color}
                  active={activeSite === site.id}
                  onSelect={() => pushQuery((next) => next.set('site', site.id))}
                />
              ))}
            </div>
          )}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-black/5 dark:text-night-soft dark:hover:bg-white/10"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {signedIn && (
              <button type="button" className="btn-tonal px-4" onClick={() => void signOut()}>
                Sign out
              </button>
            )}
          </div>
        </nav>
      </header>

      <main id="content" className="relative pt-16">
        {preview === 'demo' && (
          <div className="bg-g-yellow text-ink" role="status">
            <p className="shell py-3 text-sm font-medium sm:text-base">
              Demo data. Local fixture for design review. These figures are not traffic from the live sites.
            </p>
          </div>
        )}
        {preview === 'empty' && (
          <div className="bg-g-yellow text-ink" role="status">
            <p className="shell py-3 text-sm font-medium sm:text-base">
              Empty preview. No events are stored. Zeros are empty storage, not a count of visitors.
            </p>
          </div>
        )}

        {!showDashboard && status === 'loading' && <p className="shell py-16 text-lg text-ink-soft dark:text-night-soft">Loading.</p>}
        {status === 'error' && <p className="shell py-16 text-lg">{message}</p>}

        {session && !showDashboard && status !== 'loading' && status !== 'error' && (
          <Login configured={session.configured} flash={flash} />
        )}

        {showDashboard && overview && (
          <Dashboard
            overview={overview}
            hosting={hosting}
            flash={flash}
            onPreset={(days) =>
              pushQuery((next) => {
                const today = utcDay(new Date())
                next.set('from', addDays(today, -(days - 1)))
                next.set('to', today)
              })
            }
            onRange={(from, to) =>
              pushQuery((next) => {
                next.set('from', from)
                next.set('to', to)
              })
            }
            onExport={() => void download()}
          />
        )}
      </main>
    </div>
  )
}

function SiteTab({
  id,
  label,
  color,
  active,
  onSelect,
}: {
  id: string
  label: string
  color: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`site-${id}`}
      aria-selected={active}
      onClick={onSelect}
      className={`relative h-16 shrink-0 whitespace-nowrap px-2.5 text-sm sm:px-3 ${
        active ? 'text-ink dark:text-night-text' : 'text-ink-soft hover:text-ink dark:text-night-soft dark:hover:text-night-text'
      }`}
    >
      {label}
      <span
        aria-hidden="true"
        className={`absolute inset-x-2.5 bottom-0 h-[3px] rounded-t-full transition-transform duration-300 sm:inset-x-3 ${
          active ? 'scale-x-100' : 'scale-x-0'
        }`}
        style={{ background: color }}
      />
    </button>
  )
}

function Login({ configured, flash }: { configured: boolean; flash: string | null }) {
  return (
    <div className="shell pb-20 pt-14">
      <h1 className="max-w-[12ch] text-[clamp(2.75rem,8vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-balance">
        Sign in
      </h1>
      <p className="mt-5 max-w-[42rem] text-xl leading-relaxed text-ink-soft dark:text-night-soft sm:text-2xl">
        Private analytics for naijei.com, /gnarly, flashcards, SQL, and voter.
      </p>
      {flash && (
        <p className="mt-6 max-w-xl text-base text-ink dark:text-night-text" role="status">
          {flash}
        </p>
      )}
      {configured ? (
        <a className="btn-primary mt-8" href="/auth/google">
          Continue with Google
        </a>
      ) : (
        <section className="surface mt-10 max-w-xl p-6 sm:p-8">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Google sign-in is not configured</h2>
          <p className="mt-3 leading-relaxed text-ink-soft dark:text-night-soft">
            The server will not open a Google prompt, and it will not invent a signed-in session. Add these environment
            variables, then restart.
          </p>
          <ul className="mt-5 space-y-2 font-mono text-sm">
            <li>APP_ORIGIN</li>
            <li>GOOGLE_CLIENT_ID</li>
            <li>GOOGLE_CLIENT_SECRET</li>
            <li>SESSION_SECRET</li>
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft dark:text-night-soft">
            The admin README has the Google Cloud steps. This copy has not been signed in against a live Google client.
          </p>
        </section>
      )}
    </div>
  )
}

function Dashboard({
  overview,
  hosting,
  flash,
  onPreset,
  onRange,
  onExport,
}: {
  overview: Overview
  hosting: HostingReport | null
  flash: string | null
  onPreset: (days: number) => void
  onRange: (from: string, to: string) => void
  onExport: () => void
}) {
  const today = utcDay(new Date())
  const title = rangeTitle(overview.range.from, overview.range.to)
  const presets = [
    { days: 7, label: '7 days' },
    { days: 28, label: '28 days' },
    { days: 90, label: '90 days' },
  ]
  const activePreset = presets.find((preset) => overview.range.to === today && overview.range.from === addDays(today, -(preset.days - 1)))
  const color = overview.site === 'all' ? '#4285F4' : overview.sites.find((site) => site.id === overview.site)?.color || '#4285F4'
  const siteLabel = overview.site === 'all' ? 'All sites' : overview.sites.find((site) => site.id === overview.site)?.label || overview.site
  const maxPage = Math.max(1, ...overview.pages.map((page) => page.pageviews))
  const maxReferrer = Math.max(1, ...overview.referrers.map((referrer) => referrer.pageviews))
  const [from, setFrom] = useState(overview.range.from)
  const [to, setTo] = useState(overview.range.to)

  useEffect(() => {
    setFrom(overview.range.from)
    setTo(overview.range.to)
  }, [overview.range.from, overview.range.to])

  return (
    <div className="shell pb-16 pt-8">
      {flash && (
        <p className="mb-6 text-base" role="status">
          {flash}
        </p>
      )}
      <section className="surface p-5 sm:p-8" aria-labelledby="range-title">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 id="range-title" className="text-[clamp(2rem,5vw,3.25rem)] font-medium leading-none tracking-[-0.035em] text-balance">
              {title}
            </h1>
            <p className="mt-3 text-base text-ink-soft dark:text-night-soft sm:text-lg">
              {siteLabel}. {overview.coverage.note}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Date range">
            {presets.map((preset) => (
              <button
                key={preset.days}
                type="button"
                className={activePreset?.days === preset.days ? 'btn-primary px-4' : 'btn-tonal px-4'}
                aria-pressed={activePreset?.days === preset.days}
                onClick={() => onPreset(preset.days)}
              >
                {preset.label}
              </button>
            ))}
            <button type="button" className="btn-tonal px-4" onClick={onExport}>
              Export CSV
            </button>
          </div>
        </div>

        <form
          className="mt-5 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onRange(from, to)
          }}
        >
          <label className="text-sm text-ink-soft dark:text-night-soft">
            From
            <input
              className="mt-1 block min-h-11 rounded-full border border-black/10 bg-white px-4 text-ink dark:border-white/15 dark:bg-night dark:text-night-text"
              type="date"
              value={from}
              max={today}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="text-sm text-ink-soft dark:text-night-soft">
            To
            <input
              className="mt-1 block min-h-11 rounded-full border border-black/10 bg-white px-4 text-ink dark:border-white/15 dark:bg-night dark:text-night-text"
              type="date"
              value={to}
              max={today}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
          <button type="submit" className="btn-tonal px-4">
            Apply dates
          </button>
        </form>

        <div className="mt-8 grid items-end gap-8 lg:grid-cols-[16rem_1fr]">
          <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1">
            <Figure value={formatNumber(overview.totals.pageviews)} label="Pageviews" />
            <Figure value={formatNumber(overview.totals.visits)} label="Visits" />
            <Figure
              value={overview.totals.estimatedUniques === null ? 'Unavailable' : formatNumber(overview.totals.estimatedUniques)}
              label="Estimated uniques"
              quiet={overview.totals.estimatedUniques === null}
            />
          </dl>
          <Chart
            points={overview.trend}
            color={color}
            label={`${title} pageviews for ${siteLabel}`}
          />
        </div>
        {overview.totals.pageviews === 0 && (
          <p className="mt-4 text-sm text-ink-soft dark:text-night-soft">No events in this range.</p>
        )}
        {overview.site === 'all' && (
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {overview.sites.map((site) => (
              <li key={site.id} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: site.color }} aria-hidden="true" />
                <span>{site.label}</span>
                <span className="tabular-nums text-ink-soft dark:text-night-soft">{formatNumber(site.pageviews)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hosting && <HostingPanel report={hosting} />}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <DataTable
          title="Top pages"
          empty="No pages in this range."
          rows={overview.pages.map((page) => ({ label: page.path, value: page.pageviews, width: `${(page.pageviews / maxPage) * 100}%` }))}
          tint={color}
          valueLabel="Pageviews"
        />
        <DataTable
          title="Referrers"
          hint="Hostname only. Direct includes browsers that omitted a referrer."
          empty="No referrers in this range."
          rows={overview.referrers.map((referrer) => ({
            label: referrer.host,
            value: referrer.pageviews,
            width: `${(referrer.pageviews / maxReferrer) * 100}%`,
          }))}
          tint={color}
          valueLabel="Pageviews"
        />
      </div>

      <details className="surface mt-8 p-5 sm:p-6">
        <summary className="cursor-pointer text-base font-medium">Daily numbers</summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-soft dark:text-night-soft">
              <tr>
                <th className="pb-2 pr-4 font-medium">Day</th>
                <th className="pb-2 pr-4 text-right font-medium">Pageviews</th>
                <th className="pb-2 text-right font-medium">Visits</th>
              </tr>
            </thead>
            <tbody>
              {overview.trend.map((point) => (
                <tr key={point.day} className="border-t border-black/[0.06] dark:border-white/[0.06]">
                  <td className="py-2 pr-4 tabular-nums">{formatDay(point.day)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatNumber(point.pageviews)}</td>
                  <td className="py-2 text-right tabular-nums">{formatNumber(point.visits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <section className="mt-16 max-w-[68ch]">
        <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] font-medium tracking-[-0.03em]">What this can see</h2>
        <ul className="mt-5 space-y-3 text-base leading-7 text-ink-soft dark:text-night-soft">
          {overview.coverage.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
        {overview.coverage.unreadableRows > 0 && (
          <p className="mt-4 text-sm">Some stored rows were unreadable and were left out of these totals.</p>
        )}
        {overview.coverage.truncated && (
          <p className="mt-4 text-sm">The store was longer than this process keeps in memory. Older events were left out.</p>
        )}
      </section>
      <p className="mt-12 text-sm text-ink-faint dark:text-night-soft">Private admin for the naijei.com family.</p>
    </div>
  )
}

function HostingPanel({ report }: { report: HostingReport }) {
  return (
    <section className="surface mt-8 p-5 sm:p-8" aria-labelledby="hosting-title">
      <h2 id="hosting-title" className="text-xl font-medium tracking-[-0.03em]">
        Hosting requests
      </h2>
      <p className="mt-3 max-w-[68ch] text-sm leading-6 text-ink-soft dark:text-night-soft">{report.note}</p>
      <ul className="mt-6 space-y-5">
        {report.sources.map((source) => (
          <li key={source.id} className="border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-base font-medium">{source.label}</h3>
              <p className="text-sm tabular-nums">
                {source.status === 'ok' && source.requests !== null
                  ? `${formatNumber(source.requests)} requests`
                  : source.status === 'no-buckets'
                    ? 'No buckets'
                    : source.status === 'not-configured'
                      ? 'Not configured'
                      : 'Unavailable'}
              </p>
            </div>
            <p className="mt-2 max-w-[68ch] text-sm leading-6 text-ink-soft dark:text-night-soft">{source.coverage}</p>
            {source.buckets.length > 0 && (
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-ink-soft dark:text-night-soft">
                  <tr>
                    <th className="pb-2 font-medium">UTC bucket</th>
                    <th className="pb-2 text-right font-medium">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {source.buckets.map((bucket) => (
                    <tr key={bucket.day} className="border-t border-black/[0.06] dark:border-white/[0.06]">
                      <td className="py-2 tabular-nums">{formatDay(bucket.day)}</td>
                      <td className="py-2 text-right tabular-nums">{formatNumber(bucket.requests)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Figure({ value, label, quiet = false }: { value: string; label: string; quiet?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-sm text-ink-soft dark:text-night-soft">{label}</dt>
      <dd className={`font-medium tracking-[-0.03em] tabular-nums ${quiet ? 'text-2xl text-ink-soft dark:text-night-soft' : 'text-4xl'}`}>
        {value}
      </dd>
    </div>
  )
}

function DataTable({
  title,
  hint,
  empty,
  rows,
  tint,
  valueLabel,
}: {
  title: string
  hint?: string
  empty: string
  rows: { label: string; value: number; width: string }[]
  tint: string
  valueLabel: string
}) {
  return (
    <section className="surface overflow-hidden">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <h2 className="text-xl font-medium tracking-[-0.03em]">{title}</h2>
        {hint && <p className="mt-2 text-sm leading-6 text-ink-soft dark:text-night-soft">{hint}</p>}
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead className="text-ink-soft dark:text-night-soft">
          <tr>
            <th className="px-5 pb-2 font-medium sm:px-6">{title === 'Referrers' ? 'Host' : 'Page'}</th>
            <th className="px-5 pb-2 text-right font-medium sm:px-6">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-black/[0.06] dark:border-white/[0.06]">
              <td className="px-5 py-4 text-ink-soft dark:text-night-soft sm:px-6" colSpan={2}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.label} className="border-t border-black/[0.06] dark:border-white/[0.06]">
                <td
                  className="bar-cell break-all px-5 py-3 font-mono text-[13px] sm:px-6"
                  style={{ ['--bar' as string]: row.width, ['--tint' as string]: tint }}
                >
                  {row.label}
                </td>
                <td className="px-5 py-3 text-right tabular-nums sm:px-6">{formatNumber(row.value)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}
