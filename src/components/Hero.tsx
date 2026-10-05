import { ArrowDown, Github, Linkedin, Mail, Sparkles } from 'lucide-react'
import { featured, profile } from '../data/content'
import Wordmark from './Wordmark'

const DOTS = [
  { c: '#4285F4', s: 18, x: '12%', y: '22%', d: '0s' },
  { c: '#EA4335', s: 12, x: '84%', y: '18%', d: '1.2s' },
  { c: '#FBBC04', s: 22, x: '78%', y: '70%', d: '.6s' },
  { c: '#34A853', s: 14, x: '18%', y: '74%', d: '1.8s' },
  { c: '#4285F4', s: 8, x: '62%', y: '12%', d: '2.4s' },
  { c: '#EA4335', s: 10, x: '30%', y: '88%', d: '.9s' },
]

export function feelingLucky() {
  const pick = featured[Math.floor(Math.random() * featured.length)]
  const el = document.getElementById(`project-${pick.id}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.dataset.lucky = 'true'
  window.setTimeout(() => delete el.dataset.lucky, 2200)
}

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {DOTS.map((dot, i) => (
          <span
            key={i}
            className="float-dot absolute rounded-full opacity-70 dark:opacity-50"
            style={{ background: dot.c, width: dot.s, height: dot.s, left: dot.x, top: dot.y, animationDelay: dot.d }}
          />
        ))}
      </div>

      <div className="shell relative flex flex-col items-center text-center">
        <div className="animate-rise mb-7 rounded-full bg-[conic-gradient(#4285F4_0_25%,#EA4335_0_50%,#FBBC04_0_75%,#34A853_0)] p-[3px] shadow-lift">
          <img
            src={profile.photo}
            alt="Portrait of Naijei Jiang"
            width={128}
            height={128}
            className="h-28 w-28 rounded-full border-4 border-white object-cover dark:border-night sm:h-32 sm:w-32"
          />
        </div>

        <p className="animate-rise eyebrow mb-2" style={{ animationDelay: '80ms' }}>
          Hi, I’m
        </p>
        <div className="animate-rise" style={{ animationDelay: '140ms' }}>
          <Wordmark text={profile.firstName} className="text-[clamp(4.5rem,16vw,10rem)] leading-[0.95]" />
        </div>
        <p
          className="animate-rise mt-5 text-lg text-ink-soft dark:text-night-soft sm:text-xl"
          style={{ animationDelay: '200ms' }}
        >
          Jiang · CS @ Cornell ’28
        </p>

        <p
          className="animate-rise mx-auto mt-6 max-w-2xl text-balance text-xl leading-relaxed sm:text-2xl"
          style={{ animationDelay: '260ms' }}
        >
          {profile.tagline}
        </p>

        <div className="animate-rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: '320ms' }}>
          <a href="#projects" className="btn-primary">
            See my projects <ArrowDown className="h-4 w-4" />
          </a>
          <button type="button" onClick={feelingLucky} className="btn-tonal" title="Jump to a random project">
            <Sparkles className="h-4 w-4 text-g-yellow" /> I’m Feeling Lucky
          </button>
        </div>

        <div className="animate-rise mt-8 flex items-center gap-2" style={{ animationDelay: '380ms' }}>
          {[
            { href: `mailto:${profile.email}`, label: 'Email', Icon: Mail },
            { href: 'https://www.linkedin.com/in/naijei', label: 'LinkedIn', Icon: Linkedin },
            { href: 'https://github.com/Naijei1', label: 'GitHub', Icon: Github },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer"
              aria-label={label}
              title={label}
              className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition hover:-translate-y-0.5 hover:bg-black/5 hover:text-ink dark:text-night-soft dark:hover:bg-white/10 dark:hover:text-night-text"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
