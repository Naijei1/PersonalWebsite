import { GraduationCap, MapPin, Server, Sparkles } from 'lucide-react'
import { education, profile, toolkit } from '../data/content'
import Reveal, { Section } from './Reveal'

const FACTS = [
  { Icon: Server, label: 'Focus', value: 'Backend & distributed systems' },
  { Icon: GraduationCap, label: 'Studies', value: `CS @ ${education.school}, ’28` },
  { Icon: MapPin, label: 'Based in', value: profile.location },
  { Icon: Sparkles, label: 'Learning', value: 'Rust' },
]

export default function About() {
  return (
    <Section id="about" eyebrow="01 · About" title="Backend and systems, end to end.">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        <Reveal className="space-y-8">
          <p className="max-w-xl text-xl leading-relaxed sm:text-2xl">{profile.intro}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {toolkit.map((group) => (
              <div key={group.label}>
                <p className="eyebrow mb-2">{group.label}</p>
                <p className="text-sm leading-relaxed text-ink-soft dark:text-night-soft">{group.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <dl className="surface divide-y divide-black/[0.06] dark:divide-white/[0.06]" aria-label="Quick facts">
            {FACTS.map(({ Icon, label, value }) => (
              <div key={label} className="flex gap-3 px-5 py-4 text-[15px]">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-g-blue-ink dark:text-[#8AB4F8]" />
                <dt className="w-20 shrink-0 font-medium">{label}</dt>
                <dd className="text-ink-soft dark:text-night-soft">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  )
}
