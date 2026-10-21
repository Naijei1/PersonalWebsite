import { useEffect, useRef, useState } from 'react'
import { moreProjects, type MoreProject } from '../data/content'

export default function MoreProjects() {
  return (
    <>
      <h3 className="mb-6 text-2xl font-medium">More projects</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {moreProjects.map((project, index) => (
          <MoreCard key={project.name} project={project} index={index} />
        ))}
      </div>
    </>
  )
}

function MoreCard({ project, index }: { project: MoreProject; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [visible, setVisible] = useState(false)
  const [hot, setHot] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <a
      ref={ref}
      href={project.href}
      target="_blank"
      rel="noreferrer"
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setHot(true)
      }}
      onPointerLeave={() => setHot(false)}
      onPointerDown={() => setHot(true)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      className={`surface group flex h-full flex-col overflow-hidden ${visible && hot ? 'mini-play' : ''}`}
    >
      <div className="h-28 sm:h-32" style={{ background: `${project.color}14` }}>
        <Scene index={index} color={project.color} />
      </div>
      <div className="flex flex-1 flex-col p-5">
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
    </a>
  )
}

function Scene({ index, color }: { index: number; color: string }) {
  if (index === 0) {
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
  if (index === 1) {
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
  if (index === 2) {
    return (
      <svg viewBox="0 0 200 96" className="mini-bars h-full w-full">
        {[28, 48, 36, 64, 52].map((h, i) => (
          <rect
            key={i}
            className="mini-bar"
            x={36 + i * 28}
            y={80 - h}
            width="16"
            height={h}
            rx="4"
            fill={color}
            opacity={0.4 + i * 0.1}
            style={{ animationDelay: `${i * 90}ms`, transformOrigin: `${44 + i * 28}px 80px` }}
          />
        ))}
      </svg>
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
