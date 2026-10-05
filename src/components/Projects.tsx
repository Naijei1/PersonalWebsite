import { ArrowUpRight, Play, Trophy } from 'lucide-react'
import { featured, moreProjects } from '../data/content'
import Reveal, { Section } from './Reveal'
import Showcase from './Showcase'

export default function Projects() {
  return (
    <Section id="projects" eyebrow="03 · Projects" title="Things I’ve built, and the ideas behind them.">
      <div className="space-y-10 sm:space-y-16">
        {featured.map((project, i) => (
          <Reveal key={project.id}>
            <article
              id={`project-${project.id}`}
              className="lucky-target surface grid scroll-mt-24 items-center gap-6 p-4 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8"
              style={{ '--accent': project.accent } as React.CSSProperties}
            >
              <div className={i % 2 ? 'lg:order-2' : ''}>
                <Showcase project={project} />
              </div>
              <div className="px-1 pb-2 sm:px-2">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="eyebrow">{project.kicker}</span>
                  {project.award && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-g-yellow/15 px-2.5 py-1 text-xs font-medium text-[#B06000] dark:text-g-yellow">
                      <Trophy className="h-3.5 w-3.5" /> {project.award}
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-medium tracking-tight sm:text-4xl">
                  <span
                    className="mr-3 inline-block h-3 w-3 rounded-full align-middle"
                    style={{ background: project.accent }}
                  />
                  {project.name}
                </h3>
                <p className="mt-3 text-lg leading-relaxed">{project.summary}</p>
                <p className="mt-3 text-[15px] italic text-ink-soft dark:text-night-soft">The scene: {project.idea}</p>
                <ul className="mt-5 space-y-2 text-[15px] leading-relaxed text-ink-soft dark:text-night-soft">
                  {project.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <span
                        aria-hidden
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: project.accent }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.links.map((link, k) => {
                    const external = link.href.startsWith('http')
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target={external ? '_blank' : undefined}
                        rel="noreferrer"
                        className={k === 0 ? 'btn-primary' : 'btn-tonal'}
                      >
                        {link.label.startsWith('Watch') && <Play className="h-4 w-4" />}
                        {link.label}
                        {!link.label.startsWith('Watch') && <ArrowUpRight className="h-4 w-4" />}
                      </a>
                    )
                  })}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <h3 className="mb-6 mt-20 text-2xl font-medium">More projects</h3>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2">
        {moreProjects.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="surface group flex h-full flex-col p-5 transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-lg font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink dark:group-hover:text-night-text" />
              </div>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-soft dark:text-night-soft">{p.blurb}</p>
              <p className="mt-4 font-mono text-xs text-ink-faint dark:text-night-soft">{p.tags.join(' · ')}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
