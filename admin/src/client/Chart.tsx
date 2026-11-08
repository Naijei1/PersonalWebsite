import { useLayoutEffect, useRef, useState } from 'react'

type Point = { day: string; pageviews: number }

function formatDay(day: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  )
}

export default function Chart({ points, color, label }: { points: Point[]; color: string; label: string }) {
  const pathRef = useRef<SVGPathElement>(null)
  const [length, setLength] = useState(0)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const width = 640
  const height = 220
  const pad = { l: 56, r: 8, t: 16, b: 32 }
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const peak = Math.max(0, ...points.map((point) => point.pageviews))
  const max = Math.max(peak, 1)
  const coords = points.map((point, index) => {
    const x = pad.l + (points.length <= 1 ? innerW / 2 : (index / (points.length - 1)) * innerW)
    const y = pad.t + innerH - (point.pageviews / max) * innerH
    return { ...point, x, y }
  })
  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const last = coords[coords.length - 1]
  const first = coords[0]
  const area = last && first ? `${line} L${last.x.toFixed(1)} ${pad.t + innerH} L${first.x.toFixed(1)} ${pad.t + innerH} Z` : ''
  const ticks = peak === 0 ? [0] : [peak, Math.round(peak / 2), 0]
  const labelIndexes = points.length <= 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1]

  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path) return
    const next = path.getTotalLength()
    path.style.setProperty('--trend-len', `${next}`)
    setLength(next)
  }, [line])

  if (!first || !last) return null

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="h-auto w-full font-sans">
      {ticks.map((tick) => {
        const y = pad.t + innerH - (tick / max) * innerH
        return (
          <g key={tick}>
            <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} className="stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-ink-faint text-[11px] dark:fill-night-soft">
              {tick}
            </text>
          </g>
        )
      })}
      <path d={area} fill={color} opacity="0.14" />
      <path
        ref={pathRef}
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={length > 0 && !reduce ? 'trend-draw' : undefined}
        style={length > 0 && !reduce ? { strokeDasharray: length, strokeDashoffset: length } : undefined}
      />
      {points.length <= 14 &&
        coords.map((point) => <circle key={point.day} cx={point.x} cy={point.y} r="3" fill={color} />)}
      {labelIndexes.map((index) => {
        const point = coords[index]
        return (
          <text
            key={point.day}
            x={point.x}
            y={height - 8}
            textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
            className="fill-ink-faint text-[11px] dark:fill-night-soft"
          >
            {formatDay(point.day)}
          </text>
        )
      })}
    </svg>
  )
}
