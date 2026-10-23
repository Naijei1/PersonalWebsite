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

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let running = false
    let settling = false
    let settleFrom: number[] = []
    let settleStart = 0

    const nodes = () => [...el.querySelectorAll<HTMLElement>('.mini-bar')]
    const active = () => el.matches(':hover, :focus-within') || el.classList.contains('mini-play')

    const tick = (now: number) => {
      const bars = nodes()
      if (active()) {
        settling = false
        bars.forEach((bar, i) => {
          const phase = (now / 1200 + i * 0.2) % 1
          const scale = 0.81 + 0.19 * Math.cos(phase * Math.PI * 2)
          bar.style.transform = `scaleY(${scale.toFixed(4)})`
        })
        raf = requestAnimationFrame(tick)
        return
      }
      if (!settling) {
        settling = true
        settleStart = now
        settleFrom = bars.map((bar) => {
          const match = bar.style.transform.match(/scaleY\(([\d.]+)\)/)
          return match ? Number(match[1]) : 1
        })
      }
      const u = Math.min(1, (now - settleStart) / 280)
      const eased = 1 - (1 - u) * (1 - u)
      bars.forEach((bar, i) => {
        const scale = (settleFrom[i] ?? 1) + (1 - (settleFrom[i] ?? 1)) * eased
        bar.style.transform = `scaleY(${scale.toFixed(4)})`
      })
      if (u < 1) {
        raf = requestAnimationFrame(tick)
        return
      }
      bars.forEach((bar) => {
        bar.style.transform = ''
      })
      running = false
    }

    const start = () => {
      if (running) return
      running = true
      settling = false
      raf = requestAnimationFrame(tick)
    }

    const watch = new MutationObserver(() => {
      if (el.classList.contains('mini-play')) start()
    })
    watch.observe(el, { attributes: true, attributeFilter: ['class'] })
    el.addEventListener('pointerenter', start)
    el.addEventListener('pointerdown', start)
    el.addEventListener('focus', start)
    if (el.classList.contains('mini-play')) start()
    return () => {
      cancelAnimationFrame(raf)
      watch.disconnect()
      el.removeEventListener('pointerenter', start)
      el.removeEventListener('pointerdown', start)
      el.removeEventListener('focus', start)
    }
  }, [])

  const external = (href: string) => href.startsWith('http')
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
      <div className={`flex flex-1 flex-col p-5 ${project.codeHref ? 'pb-3' : ''}`}>
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

  if (!project.codeHref) {
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

  return (
    <div
      ref={setRef}
      {...pointer}
      className={cardClass}
    >
      <a href={project.href} className="flex flex-1 flex-col">
        {body}
      </a>
      <div className="flex flex-wrap gap-2 px-5 pb-5">
        <a href={project.href} className="btn-primary px-4 text-sm">
          Live demo
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <a href={project.codeHref} target="_blank" rel="noreferrer" className="btn-tonal px-4 text-sm">
          Code
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

function Scene({ scene, color }: { scene: MoreProject['scene']; color: string }) {
  if (scene === 'paxos') {
    const spots = [16, 32, 48, 64, 80]
    return (
      <div className="relative h-full">
        <span
          className="absolute top-[38%] right-[20%] left-[16%] h-0 -translate-y-1/2 border-t border-dashed opacity-70"
          style={{ borderColor: color }}
        />
        {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
          <span
            key={letter}
            className="absolute top-[58%] z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-medium text-white"
            style={{ left: `${spots[i]}%`, background: color }}
          >
            {letter}
          </span>
        ))}
        <span
          className="mini-packet absolute top-[38%] z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{ border: `2px solid ${color}` }}
        />
      </div>
    )
  }
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
  if (scene === 'bars') {
    return (
      <div className="flex h-full items-end justify-center gap-4 px-8 pb-6">
        {[36, 64, 48, 92, 72].map((h, i) => (
          <span
            key={i}
            className="mini-bar w-4 rounded-sm"
            style={{
              ['--bar' as string]: `${h}px`,
              background: color,
            }}
          />
        ))}
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
