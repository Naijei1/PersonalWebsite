import { ArrowUpRight } from 'lucide-react'
import { moreProjects, type MoreProject } from '../data/content'

export const MORE_DRAFTS = [
  {
    id: 1,
    name: 'Mini scenes',
    line: 'Each card keeps a tiny scene that plays when you hover.',
  },
  {
    id: 2,
    name: 'Shared shelf',
    line: 'Every project stands on one shelf, and the one you point at comes forward.',
  },
  {
    id: 3,
    name: 'Logo coins',
    line: 'A tilting coin stands in for each project, with the blurb beside it.',
  },
  {
    id: 4,
    name: 'Terminal',
    line: 'A command-line listing, in the same monospace voice as the section labels.',
  },
  {
    id: 5,
    name: 'Bento',
    line: 'The live workshop gets the large tile. The rest stay small and scannable.',
  },
  {
    id: 6,
    name: 'Graduate',
    line: 'A project that earns a scene moves up beside the main work. The rest stay listed.',
  },
] as const

export function readMoreDraft() {
  if (typeof window === 'undefined') return null
  const n = Number(new URLSearchParams(window.location.search).get('more'))
  return MORE_DRAFTS.find((d) => d.id === n) ?? null
}

function DraftBar({ id }: { id: number }) {
  const draft = MORE_DRAFTS[id - 1]
  return (
    <div id="more-draft" className="mb-5 rounded-3xl border border-dashed border-black/15 px-5 py-4 dark:border-white/15">
      <p className="eyebrow">More projects · draft {id} of 6</p>
      <h3 className="mt-1 text-2xl font-medium">{draft.name}</h3>
      <p className="mt-1 max-w-2xl text-[15px] text-ink-soft dark:text-night-soft">{draft.line}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="#projects" className="btn-tonal">
          Current
        </a>
        {MORE_DRAFTS.map((d) => (
          <a key={d.id} href={`?more=${d.id}#more-projects`} className={d.id === id ? 'btn-primary' : 'btn-tonal'}>
            {d.id} {d.name}
          </a>
        ))}
      </div>
    </div>
  )
}

function Mini({ index, color }: { index: number; color: string }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 200 96" className="h-full w-full">
        {[0, 1, 2].map((i) => (
          <g key={i} className="transition-transform duration-700 group-hover:translate-x-3" style={{ transitionDelay: `${i * 80}ms` }}>
            <rect x={28 + i * 46} y="22" width="36" height="52" rx="6" fill={color} opacity={0.18 + i * 0.18} />
            {[0, 1, 2].map((r) => (
              <rect key={r} x={34 + i * 46} y={30 + r * 12} width="24" height="4" rx="2" fill={color} />
            ))}
          </g>
        ))}
      </svg>
    )
  }
  if (index === 1) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative h-16 w-24">
          <div className="absolute inset-0 -translate-x-2 -rotate-6 rounded-lg bg-white shadow-card transition-transform duration-500 group-hover:-translate-x-4 group-hover:-rotate-12 dark:bg-night" />
          <div
            className="absolute inset-0 translate-x-2 rotate-6 rounded-lg shadow-card transition-transform duration-500 group-hover:translate-x-4 group-hover:rotate-12"
            style={{ background: color }}
          />
        </div>
      </div>
    )
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 200 96" className="h-full w-full">
        {[28, 48, 36, 64, 52].map((h, i) => (
          <rect
            key={i}
            x={36 + i * 28}
            y={78 - h}
            width="16"
            height={h}
            rx="4"
            fill={color}
            opacity={0.35 + i * 0.12}
            className="origin-bottom transition-transform duration-500 group-hover:scale-y-110"
            style={{ transitionDelay: `${i * 60}ms` }}
          />
        ))}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 96" className="h-full w-full">
      <path d="M16 68 H184" stroke={color} strokeWidth="3" strokeDasharray="6 6" opacity="0.45" />
      <g className="transition-transform duration-700 group-hover:translate-x-10">
        <rect x="36" y="40" width="46" height="22" rx="6" fill={color} />
        <circle cx="48" cy="64" r="6" fill="#202124" />
        <circle cx="70" cy="64" r="6" fill="#202124" />
      </g>
    </svg>
  )
}

function MiniScenes() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {moreProjects.map((p, i) => (
        <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="surface group flex h-full flex-col overflow-hidden">
          <div className="h-32" style={{ background: `${p.color}14` }}>
            <Mini index={i} color={p.color} />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <span className="flex items-center gap-2 text-lg font-medium">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink-soft dark:text-night-soft">{p.blurb}</p>
            <p className="mt-4 font-mono text-xs text-ink-faint dark:text-night-soft">{p.tags.join(' · ')}</p>
          </div>
        </a>
      ))}
    </div>
  )
}

function Shelf() {
  return (
    <div className="surface overflow-hidden px-4 py-10 sm:px-8 sm:py-14" style={{ perspective: '1100px' }}>
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5" style={{ transform: 'rotateX(14deg)' }}>
        {moreProjects.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="group relative flex h-52 flex-col justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-lift transition duration-300 [transform:translateZ(12px)] hover:[transform:translateZ(24px)_translateY(-12px)] dark:border-white/10 dark:bg-night"
          >
            <span className="h-8 w-8 rounded-xl" style={{ background: p.color }} />
            <span>
              <span className="block text-[15px] font-medium leading-snug">{p.name}</span>
              <span className="mt-1 block font-mono text-[11px] text-ink-faint dark:text-night-soft">{p.tags[0]}</span>
            </span>
            <span className="pointer-events-none absolute -bottom-3 left-4 right-4 h-3 rounded-[100%] bg-black/10 blur-sm dark:bg-black/40" />
          </a>
        ))}
      </div>
    </div>
  )
}

function Coins() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {moreProjects.map((p) => (
        <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="surface group flex items-center gap-4 p-4 sm:p-5">
          <span className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center [perspective:600px]">
            <span
              className="grid h-full w-full place-items-center rounded-full text-lg font-medium text-white shadow-lift transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
              style={{ background: `radial-gradient(circle at 35% 30%, #fff6, transparent 42%), ${p.color}` }}
            >
              {p.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()}
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-medium">{p.name}</span>
            <span className="mt-1 block text-[15px] leading-relaxed text-ink-soft dark:text-night-soft">{p.blurb}</span>
            <span className="mt-2 block font-mono text-xs text-ink-faint dark:text-night-soft">{p.tags.join(' · ')}</span>
          </span>
        </a>
      ))}
    </div>
  )
}

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function Terminal() {
  return (
    <div className="surface overflow-hidden font-mono text-[13px] leading-relaxed sm:text-sm">
      <div className="flex items-center gap-1.5 border-b border-black/10 px-4 py-3 dark:border-white/10">
        <span className="h-2.5 w-2.5 rounded-full bg-[#EA4335]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FBBC04]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
        <span className="ml-2 text-xs text-ink-faint dark:text-night-soft">more — zsh</span>
      </div>
      <div className="space-y-1.5 px-4 py-4 sm:px-5">
        <p>
          <span className="text-[#137333] dark:text-[#81C995]">naijei@site</span>
          <span className="text-ink-faint">:</span>
          <span className="text-g-blue-ink dark:text-[#8AB4F8]">~/projects</span>
          <span className="text-ink-faint">$ ls more</span>
        </p>
        {moreProjects.map((p) => (
          <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="grid grid-cols-[7.5rem_1fr] gap-3 rounded-lg px-2 py-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] sm:grid-cols-[11rem_8rem_1fr]">
            <span style={{ color: p.color }}>{slug(p.name)}/</span>
            <span className="hidden text-ink-faint dark:text-night-soft sm:block">{p.tags[0]}</span>
            <span className="truncate text-ink-soft dark:text-night-soft">{p.blurb}</span>
          </a>
        ))}
        <p className="px-2 pt-1">
          <span className="text-ink-faint">$</span> <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-ink dark:bg-night-text" />
        </p>
      </div>
    </div>
  )
}

function BentoCard({ p, className }: { p: MoreProject; className?: string }) {
  return (
    <a href={p.href} target="_blank" rel="noreferrer" className={`surface group flex h-full flex-col justify-between p-5 ${className ?? ''}`}>
      <span>
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-lg font-medium">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <ArrowUpRight className="h-4 w-4 text-ink-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <span className="mt-2 block text-[15px] leading-relaxed text-ink-soft dark:text-night-soft">{p.blurb}</span>
      </span>
      <span className="mt-4 block font-mono text-xs text-ink-faint dark:text-night-soft">{p.tags.join(' · ')}</span>
    </a>
  )
}

function Bento() {
  const [sql, flash, ml, cruise] = moreProjects
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <BentoCard p={sql} className="sm:col-span-2 sm:row-span-2" />
      <BentoCard p={flash} className="sm:col-span-2" />
      <BentoCard p={ml} className="sm:col-span-1" />
      <BentoCard p={cruise} className="sm:col-span-1" />
    </div>
  )
}

function Graduate() {
  const [lead, ...rest] = moreProjects
  if (!lead) return null
  return (
    <div className="space-y-4">
      <article className="surface grid items-center gap-6 p-4 sm:p-6 lg:grid-cols-2 lg:gap-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem]" style={{ background: `radial-gradient(120% 90% at 50% 15%, ${lead.color}33, ${lead.color}0c 62%, transparent)` }}>
          <Mini index={0} color={lead.color} />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-card">
            Graduated · scene
          </span>
        </div>
        <div className="px-1">
          <p className="eyebrow">Moved into Projects</p>
          <h4 className="mt-1 text-3xl font-medium tracking-tight">
            <span className="mr-3 inline-block h-3 w-3 rounded-full align-middle" style={{ background: lead.color }} />
            {lead.name}
          </h4>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft dark:text-night-soft">{lead.blurb}</p>
          <p className="mt-4 flex flex-wrap gap-1.5">
            {lead.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </p>
        </div>
      </article>
      <p className="text-sm text-ink-soft dark:text-night-soft">Still in More projects</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {rest.map((p) => (
          <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="surface block p-4">
            <span className="flex items-center gap-2 font-medium">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-ink-soft dark:text-night-soft">{p.blurb}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

const VIEWS = [MiniScenes, Shelf, Coins, Terminal, Bento, Graduate]

export default function MoreDrafts({ id }: { id: number }) {
  const View = VIEWS[id - 1]
  return (
    <div>
      <DraftBar id={id} />
      <View />
    </div>
  )
}
