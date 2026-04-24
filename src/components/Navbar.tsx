import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#connect', label: 'Connect' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="nav-safe-top">
        <div className="page-shell mx-auto flex max-w-6xl items-center justify-between py-3 sm:py-4">
        <a
          href="#about"
          className="touch-target inline-flex items-center font-mono text-base font-semibold tracking-tight text-indigo-400 transition-colors hover:text-indigo-300 sm:text-lg"
          onClick={() => setMenuOpen(false)}
        >
          NJ<span className="text-gray-500">.</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="touch-target inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="mailto:nj277@cornell.edu"
            className="touch-target inline-flex items-center rounded-lg border border-indigo-500/50 px-4 py-2 text-sm font-medium text-indigo-400 transition-all hover:border-indigo-400 hover:bg-indigo-500/10"
          >
            Contact Me
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="touch-target inline-flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900/70 text-gray-300 transition-colors hover:border-gray-700 hover:text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="page-shell safe-bottom border-t border-gray-800/60 bg-gray-950/95 pb-5 backdrop-blur-md md:hidden">
          <div
            id="mobile-navigation"
            className="max-h-[calc(100dvh-4.5rem-env(safe-area-inset-top))] overflow-y-auto pt-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="touch-target flex items-center rounded-xl border border-transparent bg-gray-900/70 px-4 py-3 text-base font-medium text-gray-300 transition-colors hover:border-indigo-500/30 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="mailto:nj277@cornell.edu"
                onClick={() => setMenuOpen(false)}
                className="touch-target mt-2 inline-flex items-center justify-center rounded-xl border border-indigo-500/50 bg-indigo-500/10 px-4 py-3 text-base font-semibold text-indigo-300 transition-all hover:border-indigo-400 hover:bg-indigo-500/15"
              >
                Contact Me
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
