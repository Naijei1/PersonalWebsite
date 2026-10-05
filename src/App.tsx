import { useEffect, useState } from 'react'
import About from './components/About'
import Contact from './components/Contact'
import Experience from './components/Experience'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Hobbies from './components/Hobbies'
import Navbar from './components/Navbar'
import Projects from './components/Projects'
import { EGG_EVENT, useEasterEggs, type Egg } from './lib/easterEggs'
import { useTheme } from './lib/hooks'

const TOASTS: Record<Egg, string> = {
  roll: 'Do a barrel roll! 🌀',
  askew: 'Something feels a little… askew.',
  drums: 'Drum mode: press D F J K on the GroovyAR scene 🥁',
}

export default function App() {
  const { theme, toggle } = useTheme()
  const egg = useEasterEggs()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (egg) setToast(TOASTS[egg])
  }, [egg])

  useEffect(() => {
    const onEgg = (e: Event) => {
      if ((e as CustomEvent<Egg>).detail !== 'drums') return
      document.getElementById('project-groovy')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setToast(TOASTS.drums)
    }
    window.addEventListener(EGG_EVENT, onEgg)
    return () => window.removeEventListener(EGG_EVENT, onEgg)
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(id)
  }, [toast])

  return (
    <>
      <a
        href="#about"
        className="sr-only z-[60] rounded-full bg-g-blue-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar theme={theme} onToggleTheme={toggle} />
      <div className={egg === 'roll' ? 'animate-roll' : egg === 'askew' ? 'askew' : ''}>
        <main>
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Hobbies />
          <Contact />
        </main>
        <Footer />
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#202124] px-5 py-3 text-sm text-white shadow-lift transition-all duration-300 dark:bg-[#E8EAED] dark:text-[#202124] ${
          toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        {toast}
      </div>
    </>
  )
}
