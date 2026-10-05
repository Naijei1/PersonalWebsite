import { Footprints, Pause, X, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { loadWatch, timeAgo, type Ring, type WatchState } from '../lib/watch'

const RING_COLORS = { move: '#FA114F', exercise: '#92E82A', stand: '#1EEAEF' }
const RING_UNITS = { move: 'CAL', exercise: 'MIN', stand: 'HRS' }

const STATUS = {
  loading: { label: 'Connecting…', dot: 'bg-zinc-400' },
  live: { label: 'Live', dot: 'bg-[#30D158]' },
  stale: { label: 'Last seen', dot: 'bg-[#FFD60A]' },
  offline: { label: 'Offline · demo', dot: 'bg-zinc-500' },
  paused: { label: 'Paused', dot: 'bg-[#FF9F0A]' },
}

function Rings({ rings, animate }: { rings: NonNullable<WatchState['data']['rings']>; animate: boolean }) {
  const order = ['move', 'exercise', 'stand'] as const
  return (
    <svg viewBox="0 0 100 100" className="h-[92px] w-[92px] -rotate-90" aria-hidden>
      {order.map((key, i) => {
        const ring = rings[key]
        const r = 42 - i * 13
        const c = 2 * Math.PI * r
        const pct = ring ? Math.min(1, ring.value / ring.goal) : 0
        return (
          <g key={key}>
            <circle cx="50" cy="50" r={r} fill="none" stroke={RING_COLORS[key]} strokeOpacity={0.22} strokeWidth="11" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={RING_COLORS[key]}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={animate ? c * (1 - pct) : c}
              style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1) ${i * 120}ms` }}
            />
          </g>
        )
      })}
    </svg>
  )
}

function RingLegend({ rings }: { rings: NonNullable<WatchState['data']['rings']> }) {
  return (
    <dl className="space-y-1 font-mono text-[11px] leading-tight">
      {(['move', 'exercise', 'stand'] as const).map((key) => {
        const ring: Ring | undefined = rings[key]
        return (
          <div key={key} style={{ color: RING_COLORS[key] }}>
            <dt className="sr-only">{key}</dt>
            <dd>{ring ? `${ring.value}/${ring.goal} ${RING_UNITS[key]}` : `— ${RING_UNITS[key]}`}</dd>
          </div>
        )
      })}
    </dl>
  )
}

export default function WatchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<WatchState>({ status: 'loading', data: {} })
  const [now, setNow] = useState(Date.now())
  const [animate, setAnimate] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    let cancelled = false
    setState({ status: 'loading', data: {} })
    setAnimate(false)
    loadWatch().then((s) => {
      if (cancelled) return
      setState(s)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    })
    closeRef.current?.focus()
    const tick = window.setInterval(() => setNow(Date.now()), 30_000)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      cancelled = true
      window.clearInterval(tick)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      opener?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const { status, data } = state
  const bpm = data.heartRate
  const beat = bpm ? `${(60 / bpm).toFixed(3)}s` : '1s'
  const clock = new Date(now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="watch-title"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="watch-backdrop absolute inset-0 bg-black/55 backdrop-blur-sm"
      />
      <div className="watch-pop relative flex flex-col items-center">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close watch"
          className="absolute -right-2 -top-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-lift transition hover:scale-105 sm:-right-14"
        >
          <X className="h-5 w-5" />
        </button>

        <div aria-hidden className="h-14 w-[190px] rounded-t-[28px] bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e]" />
        <div className="relative rounded-[68px] bg-gradient-to-br from-[#5a5a5e] via-[#2c2c2e] to-[#1c1c1e] p-[10px] shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)]">
          <span
            aria-hidden
            className="absolute -right-[9px] top-[78px] h-14 w-[11px] rounded-r-lg bg-gradient-to-r from-[#8e8e93] to-[#48484a]"
          />
          <span aria-hidden className="absolute -right-[5px] top-[160px] h-16 w-[6px] rounded-r bg-[#48484a]" />
          <div className="flex h-[348px] w-[292px] flex-col rounded-[58px] border border-white/5 bg-black px-6 py-6 text-white">
            <div className="flex items-center justify-between text-[13px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-zinc-300">
                <span
                  className={`h-2 w-2 rounded-full ${STATUS[status].dot} ${status === 'live' ? 'animate-pulse' : ''}`}
                />
                {STATUS[status].label}
              </span>
              <span className="font-medium tabular-nums text-[#FF9F0A]">{clock}</span>
            </div>
            <h2 id="watch-title" className="sr-only">
              Naijei’s Apple Watch stats
            </h2>

            {status === 'loading' ? (
              <div className="grid flex-1 place-items-center text-sm text-zinc-400">Pairing with wrist…</div>
            ) : status === 'paused' ? (
              <div className="grid flex-1 place-items-center text-center">
                <div>
                  <Pause className="mx-auto mb-3 h-8 w-8 text-[#FF9F0A]" />
                  <p className="text-[15px] font-medium">Stats are paused</p>
                  <p className="mt-1 text-xs text-zinc-400">Naijei is taking a break from sharing.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 flex items-center gap-4">
                  {data.rings && <Rings rings={data.rings} animate={animate} />}
                  {data.rings && <RingLegend rings={data.rings} />}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="heartbeat h-9 w-9 shrink-0 fill-[#FF375F]"
                    style={{ animationDuration: beat }}
                    aria-hidden
                  >
                    <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.4 2.5h1.8c.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" />
                  </svg>
                  <p className="leading-none">
                    <span className="text-[34px] font-medium tabular-nums">{bpm ?? '--'}</span>
                    <span className="ml-1 text-sm font-medium text-[#FF375F]">BPM</span>
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-[13px]">
                  <p className="flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-[#1EEAEF]" />
                    <span className="tabular-nums">{data.steps?.toLocaleString() ?? '—'}</span>
                    <span className="text-zinc-400">steps today</span>
                  </p>
                  {data.workout && (
                    <p className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#92E82A]" />
                      <span className="truncate">
                        {data.workout.type}
                        {data.workout.minutes !== undefined && ` · ${data.workout.minutes} min`}
                      </span>
                      {data.workout.endedAt && (
                        <span className="shrink-0 text-zinc-400">{timeAgo(data.workout.endedAt, now)}</span>
                      )}
                    </p>
                  )}
                </div>

                <p className="mt-auto text-center text-[11px] text-zinc-500">Updated {timeAgo(data.updatedAt, now)}</p>
              </>
            )}
          </div>
        </div>
        <div aria-hidden className="h-14 w-[190px] rounded-b-[28px] bg-gradient-to-t from-[#3a3a3c] to-[#1c1c1e]" />

        <p className="mt-5 max-w-xs text-center text-sm text-white/85">
          {status === 'offline'
            ? 'Offline right now, so this is demo data. When it’s connected, it shows live stats from my Apple Watch.'
            : status === 'stale'
              ? 'My watch hasn’t checked in for a while, so these are my last stats.'
              : status === 'paused'
                ? 'Sharing is paused right now.'
                : status === 'loading'
                  ? 'Checking my wrist…'
                  : 'Live from my Apple Watch.'}{' '}
          <span className="text-white/60">Just for fun, not medical data.</span>
        </p>
      </div>
    </div>
  )
}
