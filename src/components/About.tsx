import { GraduationCap, MapPin, Sparkles, Wrench } from 'lucide-react'
import { education, profile, toolkit } from '../data/content'
import Reveal, { Section } from './Reveal'

const FACTS = [
  { Icon: GraduationCap, label: 'Studies', value: `${education.degree}, ${education.school}` },
  { Icon: MapPin, label: 'Based in', value: profile.location },
  { Icon: Wrench, label: 'Builds', value: 'Backend, distributed systems, AI + XR' },
  { Icon: Sparkles, label: 'Currently', value: 'Learning Rust and leading CDS data engineering' },
]

export default function About() {
  return (
    <Section id="about" eyebrow="01 · About" title="A systems person who likes to make things move.">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        <Reveal className="space-y-8">
          <p className="text-lg leading-relaxed text-ink-soft dark:text-night-soft sm:text-xl">{profile.intro}</p>
          <div className="flex flex-wrap gap-2">
            {profile.chips.map((chip) => (
              <span key={chip} className="chip">
                {chip}
              </span>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {toolkit.map((group) => (
              <div key={group.label}>
                <p className="eyebrow mb-2">{group.label}</p>
                <p className="text-sm leading-relaxed">{group.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <aside className="surface overflow-hidden" aria-label="Quick facts">
            <div className="flex items-center gap-4 border-b border-black/[0.06] p-5 dark:border-white/[0.06]">
              <img src={profile.photo} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <p className="text-xl font-medium">{profile.name}</p>
                <p className="text-sm text-ink-soft dark:text-night-soft">Computer Science student at Cornell</p>
              </div>
            </div>
            <dl className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {FACTS.map(({ Icon, label, value }) => (
                <div key={label} className="flex gap-3 px-5 py-3.5 text-sm">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-g-blue-ink dark:text-[#8AB4F8]" />
                  <dt className="w-20 shrink-0 font-medium">{label}</dt>
                  <dd className="text-ink-soft dark:text-night-soft">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-black/[0.06] px-5 py-4 dark:border-white/[0.06]">
              <p className="eyebrow mb-2">Coursework</p>
              <p className="text-sm text-ink-soft dark:text-night-soft">{education.coursework.join(' · ')}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </Section>
  )
}
