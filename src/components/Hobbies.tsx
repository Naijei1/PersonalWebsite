import { ArrowUpRight } from 'lucide-react'
import { hobbies } from '../data/content'
import Reveal, { Section } from './Reveal'

const TINTS = ['bg-g-blue/10', 'bg-g-red/10', 'bg-g-green/10']

export default function Hobbies() {
  return (
    <Section id="hobbies" eyebrow="04 · Off the keyboard" title="Hobbies" className="bg-[#F8F9FA] dark:bg-black/20">
      <div className="grid gap-4 sm:grid-cols-3">
        {hobbies.map((h, i) => (
          <Reveal key={h.title} delay={i * 80}>
            <div className="surface group h-full p-5">
              <span
                aria-hidden
                className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl text-2xl transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 ${TINTS[i % 3]}`}
              >
                {h.emoji}
              </span>
              <h3 className="text-lg font-medium">{h.title}</h3>
              <p className="mt-1 text-[15px] text-ink-soft dark:text-night-soft">{h.text}</p>
              {h.href && (
                <a
                  href={h.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-g-blue-ink hover:underline dark:text-[#8AB4F8]"
                >
                  {h.linkLabel} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
