import { ArrowDown, Github, Linkedin, Mail, Watch } from 'lucide-react'
import { profile } from '../data/content'
import Wordmark from './Wordmark'

const STICKERS = [
  { text: '🧗 rock climber', className: '-right-4 top-6 rotate-[8deg] bg-[#E8F0FE] text-[#174EA6]' },
  { text: '🥁 Makeathon ’26 winner', className: '-left-12 top-1/2 -rotate-[7deg] bg-[#FEF7E0] text-[#8C4A00]' },
  { text: '🀄 learning Chinese', className: '-right-8 bottom-20 rotate-[5deg] bg-[#FCE8E6] text-[#A50E0E]' },
  { text: '🏆 Best Hardware Hack ’25', className: 'left-2 -bottom-9 -rotate-[4deg] bg-[#E6F4EA] text-[#0D652D]' },
]

const SOCIALS = [
  { href: `mailto:${profile.email}`, label: 'Email', Icon: Mail },
  { href: 'https://www.linkedin.com/in/naijei', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://github.com/Naijei1', label: 'GitHub', Icon: Github },
]

export default function Hero({ onLucky }: { onLucky: () => void }) {
  return (
    <section
      id="top"
      className="hero-grid relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-24"
    >
      <div className="shell grid items-center gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <div className="order-2 lg:order-1">
          <p className="animate-rise chip mb-6 bg-white/70 dark:bg-white/5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-g-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-g-green" />
            </span>
            {profile.role} · Cornell CS ’28
          </p>

          <div className="animate-rise" style={{ animationDelay: '80ms' }}>
            <Wordmark text="Hi, I’m Naijei." className="text-[clamp(3.2rem,8.5vw,6.5rem)] leading-[0.98]" />
          </div>

          <p
            className="animate-rise mt-6 max-w-xl text-xl leading-relaxed text-ink-soft dark:text-night-soft sm:text-2xl"
            style={{ animationDelay: '160ms' }}
          >
            {profile.tagline}
          </p>

          <ul className="animate-rise mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ animationDelay: '220ms' }}>
            <li className="font-hand text-xl text-ink-faint dark:text-night-soft">right now →</li>
            {profile.now.map((item) => (
              <li key={item} className="flex items-center gap-2 text-ink-soft dark:text-night-soft">
                <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
                {item}
              </li>
            ))}
          </ul>

          <div className="animate-rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '280ms' }}>
            <a href="#projects" className="btn-primary">
              See my projects <ArrowDown className="h-4 w-4" />
            </a>
            <button type="button" onClick={onLucky} className="btn-tonal group" title="Peek at my Apple Watch">
              <Watch className="h-4 w-4 transition-transform group-hover:rotate-12" /> I’m Feeling Lucky
            </button>
            <span className="mx-1 hidden h-6 w-px bg-black/10 dark:bg-white/15 sm:block" />
            {SOCIALS.map(({ href, label, Icon }) => (
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

        <div className="animate-rise order-1 flex justify-center lg:order-2" style={{ animationDelay: '120ms' }}>
          <figure className="polaroid group relative w-[min(68vw,330px)] -rotate-[4deg] rounded-md bg-white p-3 pb-16 shadow-lift transition-transform duration-500 hover:rotate-[-1deg] dark:bg-[#2B2C2E]">
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[3deg] bg-g-yellow/50"
            />
            <img
              src={profile.photo}
              alt="Naijei Jiang smiling by the water at sunset"
              width={540}
              height={540}
              className="aspect-square w-full rounded-sm object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-3 text-center font-hand text-3xl text-ink dark:text-night-text">
              hi, that’s me 👋
            </figcaption>
            {STICKERS.map((s) => (
              <span
                key={s.text}
                className={`sticker absolute hidden whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-card sm:inline-block ${s.className}`}
              >
                {s.text}
              </span>
            ))}
          </figure>
        </div>
      </div>
    </section>
  )
}
