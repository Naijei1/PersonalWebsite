import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { experience } from '../data/content'
import Reveal, { Section } from './Reveal'

const DOT = ['bg-g-blue', 'bg-g-red', 'bg-g-yellow', 'bg-g-green']
const VISIBLE = 5

export default function Experience() {
  const [showAll, setShowAll] = useState(false)
  const items = showAll ? experience : experience.slice(0, VISIBLE)

  return (
    <Section
      id="experience"
      eyebrow="02 · Experience"
      title="Internships, leadership, and teaching."
      className="bg-[#F8F9FA] dark:bg-black/20"
    >
      <ol className="relative ml-2 border-l-2 border-black/[0.08] dark:border-white/10 sm:ml-4">
        {items.map((item, i) => (
          <li key={`${item.org}-${item.role}`} className="relative pb-10 pl-8 last:pb-0 sm:pl-12">
            <span
              aria-hidden
              className={`absolute -left-[9px] top-6 h-4 w-4 rounded-full border-[3px] border-[#F8F9FA] dark:border-[#191919] ${DOT[i % 4]}`}
            />
            <Reveal delay={Math.min(i, 3) * 60}>
              <article className="surface p-5 transition-shadow hover:shadow-lift sm:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <h3 className="text-xl font-medium">
                    {item.org}
                    {item.current && (
                      <span className="ml-2 align-middle text-[11px] font-medium uppercase tracking-wider text-g-green">
                        ● Now
                      </span>
                    )}
                  </h3>
                  <p className="font-mono text-xs text-ink-faint dark:text-night-soft">
                    {item.period} · {item.place}
                  </p>
                </div>
                <p className="mt-1 text-ink-soft dark:text-night-soft">{item.role}</p>
                <ul className="mt-4 space-y-2 text-[15px] leading-relaxed">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <span aria-hidden className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[i % 4]}`} />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
      {experience.length > VISIBLE && (
        <div className="mt-10 flex justify-center">
          <button type="button" className="btn-tonal" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll}>
            {showAll ? 'Show fewer roles' : `Show ${experience.length - VISIBLE} earlier roles`}
            <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </Section>
  )
}
