import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { moreProjects, type MoreProject } from '../data/content'
import { useMediaQuery } from '../lib/hooks'

export default function MoreProjects() {
  return (
    <>
      <h3 className="mb-6 text-2xl font-medium">More projects</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {moreProjects.map((project) => (
          <MoreCard key={project.name} project={project} />
        ))}
      </div>
    </>
  )
}

function MoreCard({ project }: { project: MoreProject }) {
  const ref = useRef<HTMLElement | null>(null)
  const setRef = (node: HTMLElement | null) => {
    ref.current = node
  }
  const [visible, setVisible] = useState(false)
  const [hot, setHot] = useState(false)
  const touch = useMediaQuery('(hover: none)')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const external = (href: string) => href.startsWith('http')
  const showButtons = Boolean(project.liveDemo || project.codeHref)
  const cardClass = `surface group flex h-full flex-col overflow-hidden transition-colors duration-200 hover:bg-[#F1F3F4] hover:shadow-lift dark:hover:bg-[#3C4043] ${visible && (hot || touch) ? 'mini-play' : ''}`
  const pointer = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setHot(true)
    },
    onPointerLeave: () => setHot(false),
    onPointerDown: () => setHot(true),
    onFocus: () => setHot(true),
    onBlur: () => setHot(false),
  }
  const body = (
    <>
      <div className="mini-scene h-28 sm:h-32" style={{ '--tint': project.color } as CSSProperties}>
        <Scene scene={project.scene} color={project.color} />
      </div>
      <div className={`flex flex-1 flex-col p-5 ${showButtons ? 'pb-3' : ''}`}>
        <span className="flex items-center gap-2 text-lg font-medium">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: project.color }} />
          {project.name}
          {project.status && (
            <span className="rounded-full bg-g-green/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#137333] dark:text-[#81C995]">
              {project.status}
            </span>
          )}
        </span>
        <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink-soft dark:text-night-soft">{project.blurb}</p>
        <p className="mt-4 font-mono text-xs text-ink-faint dark:text-night-soft">{project.tags.join(' · ')}</p>
      </div>
    </>
  )

  if (!showButtons) {
    return (
      <a
        ref={setRef}
        href={project.href}
        target={project.href && external(project.href) ? '_blank' : undefined}
        rel={project.href && external(project.href) ? 'noreferrer' : undefined}
        {...pointer}
        className={cardClass}
      >
        {body}
      </a>
    )
  }

  const linkProps = (href: string) =>
    external(href) ? { target: '_blank' as const, rel: 'noreferrer' } : {}

  return (
    <div ref={setRef} {...pointer} className={cardClass}>
      <a href={project.href} className="flex flex-1 flex-col" {...(project.href ? linkProps(project.href) : {})}>
        {body}
      </a>
      <div className="mt-auto flex flex-wrap gap-2 px-5 pb-5">
        {project.href && (
          <a href={project.href} className="btn-primary px-4 text-sm" {...linkProps(project.href)}>
            Live demo
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
        {project.codeHref && (
          <a href={project.codeHref} target="_blank" rel="noreferrer" className="btn-tonal px-4 text-sm">
            Code
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}

const paxosBox = { w: 440, h: 100 }
const paxosRows = [28, 50, 72] as const
const paxosMessages = [
  { id: 'ab', from: [78, paxosRows[0]], to: [156, paxosRows[1]], delay: 0 },
  { id: 'ac', from: [48, paxosRows[0]], to: [186, paxosRows[2]], delay: 0.26 },
  { id: 'ba', from: [216, paxosRows[1]], to: [304, paxosRows[0]], delay: 1.42 },
  { id: 'ca', from: [240, paxosRows[2]], to: [352, paxosRows[0]], delay: 1.72 },
] as const

function paxosArrow(from: readonly [number, number], to: readonly [number, number]) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const head = 8
  const wing = 2.7
  const n = (value: number) => Number(value.toFixed(2))
  const bx = n(to[0] - ux * head)
  const by = n(to[1] - uy * head)
  return {
    x1: from[0],
    y1: from[1],
    bx,
    by,
    tipX: to[0],
    tipY: to[1],
    leftX: n(bx + px * wing),
    leftY: n(by + py * wing),
    rightX: n(bx - px * wing),
    rightY: n(by - py * wing),
  }
}

function PaxosTimelines({ color }: { color: string }) {
  return (
    <svg
      viewBox={`0 0 ${paxosBox.w} ${paxosBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="mini-paxos h-full w-full"
      style={{ color }}
      aria-hidden
    >
      {['A', 'B', 'C'].map((name, i) => (
        <g key={name}>
          <text
            x="16"
            y={paxosRows[i]}
            fill={color}
            fontSize="11"
            fontWeight="600"
            fontFamily="Google Sans, Roboto, system-ui, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {name}
          </text>
          <line
            className="pa-track"
            x1="30"
            y1={paxosRows[i]}
            x2="424"
            y2={paxosRows[i]}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
      {paxosMessages.map((message) => {
        const arrow = paxosArrow(message.from, message.to)
        const motion = {
          '--x1': `${arrow.x1}px`,
          '--y1': `${arrow.y1}px`,
          '--tx': `${arrow.tipX}px`,
          '--ty': `${arrow.tipY}px`,
          '--len': `${Math.hypot(arrow.tipX - arrow.x1, arrow.tipY - arrow.y1).toFixed(2)}px`,
        } as CSSProperties
        return (
          <g key={message.id} style={motion}>
            <polygon
              className={`pa-head ${message.id}`}
              points={`${arrow.tipX},${arrow.tipY} ${arrow.leftX},${arrow.leftY} ${arrow.rightX},${arrow.rightY}`}
            />
            <line
              className={`pa-shaft ${message.id}`}
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.tipX}
              y2={arrow.tipY}
              strokeDasharray={Math.hypot(arrow.tipX - arrow.x1, arrow.tipY - arrow.y1)}
            />
            <circle className={`pa-pulse ${message.id}`} cx={arrow.tipX} cy={arrow.tipY} r="3.2" />
            {(['pa-t2', 'pa-t1', 'pa-lead'] as const).map((cls, i) => (
              <circle
                key={cls}
                className={`pa-dot ${cls} ${message.id}`}
                cx={arrow.x1}
                cy={arrow.y1}
                r={cls === 'pa-lead' ? 2.5 : cls === 'pa-t1' ? 1.8 : 1.25}
                style={{ animationDelay: `${(2 - i) * 0.07}s` }}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function Scene({ scene, color }: { scene: MoreProject['scene']; color: string }) {
  if (scene === 'paxos') return <PaxosTimelines color={color} />
  if (scene === 'sql') {
    return (
      <svg viewBox="0 0 200 96" className="mini-sql h-full w-full">
        {[0, 1, 2].map((i) => (
          <g key={i} className="mini-table" style={{ animationDelay: `${i * 160}ms` }}>
            <rect x={28 + i * 50} y="22" width="40" height="52" rx="6" fill={color} opacity={0.16 + i * 0.16} />
            {[0, 1, 2].map((row) => (
              <rect key={row} x={34 + i * 50} y={30 + row * 13} width="28" height="5" rx="2" fill={color} />
            ))}
          </g>
        ))}
      </svg>
    )
  }
  if (scene === 'cards') {
    return (
      <div className="mini-cards flex h-full items-center justify-center">
        <div className="relative h-16 w-24 [perspective:500px]">
          <div className="absolute inset-0 -translate-x-3 -rotate-12 rounded-lg bg-white/80 shadow-card dark:bg-night" />
          <div className="mini-flip absolute inset-0 [transform-style:preserve-3d]">
            <div className="absolute inset-0 rounded-lg shadow-card [backface-visibility:hidden]" style={{ background: color }} />
            <div className="absolute inset-0 rounded-lg bg-white shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-night">
              <span className="absolute inset-x-3 top-1/2 h-1 -translate-y-2 rounded-full bg-black/15 dark:bg-white/20" />
              <span className="absolute inset-x-3 top-1/2 h-1 translate-y-1 rounded-full bg-black/15 dark:bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <svg viewBox="0 0 200 96" className="mini-road h-full w-full">
      <path d="M16 70 H184" stroke={color} strokeWidth="3" strokeDasharray="7 7" opacity="0.45" />
      <g className="mini-car">
        <rect x="28" y="42" width="48" height="22" rx="6" fill={color} />
        <circle cx="40" cy="66" r="6" fill="#202124" />
        <circle cx="64" cy="66" r="6" fill="#202124" />
      </g>
    </svg>
  )
}
