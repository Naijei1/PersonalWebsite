import { Moon, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useActiveSection, type Theme } from '../lib/hooks'

export const NAV = [
  { id: 'about', label: 'About', color: 'bg-g-blue' },
  { id: 'experience', label: 'Experience', color: 'bg-g-red' },
  { id: 'projects', label: 'Projects', color: 'bg-g-yellow' },
  { id: 'hobbies', label: 'Hobbies', color: 'bg-g-green' },
  { id: 'contact', label: 'Contact', color: 'bg-g-blue' },
]
const IDS = ['top', ...NAV.map((n) => n.id)]

export default function Navbar({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const active = useActiveSection(IDS)
  const tabs = useRef<HTMLUListElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(window.scrollY > 8)
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const strip = tabs.current
    const tab = strip?.querySelector<HTMLElement>(`a[href="#${active}"]`)
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return
    strip.scrollTo({ left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' })
  }, [active])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/85 shadow-[0_1px_0_rgba(0,0,0,.06)] backdrop-blur-md dark:bg-night/85 dark:shadow-[0_1px_0_rgba(255,255,255,.06)]'
          : ''
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 h-[3px] origin-left bg-[linear-gradient(90deg,#4285F4_0_25%,#EA4335_25%_50%,#FBBC04_50%_75%,#34A853_75%)]"
        style={{ width: '100%', transform: `scaleX(${progress})` }}
      />
      <nav className="shell flex h-16 items-center gap-3" aria-label="Main">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2 rounded-full pr-2 font-medium"
          aria-label="Back to top"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[conic-gradient(#4285F4_0_25%,#EA4335_0_50%,#FBBC04_0_75%,#34A853_0)] p-[2px]">
            <span className="grid h-full w-full place-items-center rounded-full bg-white text-sm font-bold text-g-blue dark:bg-night">
              N
            </span>
          </span>
          <span className="hidden sm:inline">Naijei Jiang</span>
        </a>

        <ul ref={tabs} className="no-scrollbar tab-strip relative mx-auto flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1">
          {NAV.map((item) => {
            const isActive = active === item.id
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative flex h-16 items-center whitespace-nowrap px-2.5 text-sm sm:px-3 transition-colors ${
                    isActive
                      ? 'text-ink dark:text-night-text'
                      : 'text-ink-soft hover:text-ink dark:text-night-soft dark:hover:text-night-text'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2.5 bottom-0 sm:inset-x-3 h-[3px] rounded-t-full ${item.color} transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={onToggleTheme}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-black/5 dark:text-night-soft dark:hover:bg-white/10"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </nav>
    </header>
  )
}
