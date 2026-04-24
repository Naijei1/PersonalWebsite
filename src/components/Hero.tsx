import { Github, Mail, Youtube, Instagram } from 'lucide-react'

const socialLinks = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/Naijei1',
    username: 'Naijei1',
  },
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:nj277@cornell.edu',
    username: 'nj277@cornell.edu',
  },
  {
    icon: Youtube,
    label: 'YouTube',
    href: 'https://www.youtube.com/@itznaijei6316',
    username: '@ItzNaijei',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/naijeie/',
    username: '@naijeie',
  },
]

const badges = ['CS @ Cornell', 'GPA 3.8', 'Cornell DS Technical Chair', 'TA @ CS 2110']

export default function Hero() {
  return (
    <section
      id="about"
      className="section-shell relative flex min-h-dvh flex-col items-center justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1.5s' }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        {/* Profile image */}
        <div className="mb-7 flex justify-center animate-fade-in sm:mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-2xl shadow-indigo-500/30 sm:h-32 sm:w-32">
              <img
                src={`${import.meta.env.BASE_URL}project-logos/naijei-owner.png`}
                alt="Naijei Jiang"
                className="w-full h-full rounded-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-gray-950 bg-green-500 sm:h-6 sm:w-6" />
          </div>
        </div>

        {/* Name & headline */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="mb-3 text-xs font-mono uppercase tracking-[0.3em] text-indigo-400 sm:text-sm">
            Hello, I'm
          </p>
          <h1 className="mb-4 text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-gradient">Naijei Jiang</span>
          </h1>
          <p className="mx-auto mb-7 max-w-2xl text-base font-light leading-relaxed text-gray-400 sm:mb-8 sm:text-xl md:text-2xl">
            Software Engineer &amp; Distributed Systems Enthusiast
          </p>
        </div>

        {/* Badges */}
        <div
          className="mb-8 flex flex-wrap justify-center gap-2 animate-slide-up sm:mb-10"
          style={{ animationDelay: '0.2s' }}
        >
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-medium text-indigo-300 sm:text-xs"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Short bio */}
        <p
          className="mx-auto mb-10 max-w-2xl text-base leading-7 text-gray-400 animate-slide-up sm:mb-12 sm:text-lg sm:leading-relaxed"
          style={{ animationDelay: '0.3s' }}
        >
          CS sophomore at Cornell building distributed systems, teaching Data Structures &amp;
          Algorithms, and shipping real-world projects. Passionate about infrastructure,
          education, and creative tech.
        </p>

        {/* CTA buttons */}
        <div
          className="mb-12 grid w-full max-w-md gap-3 animate-slide-up sm:mb-14 sm:max-w-none sm:grid-flow-col sm:auto-cols-max sm:justify-center sm:gap-4"
          style={{ animationDelay: '0.4s' }}
        >
          <a
            href="#projects"
            className="touch-target inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-indigo-500/40"
          >
            View Projects
          </a>
          <a
            href="mailto:nj277@cornell.edu"
            className="touch-target inline-flex items-center justify-center rounded-xl border border-gray-700 px-6 py-3 text-base font-semibold text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-500 hover:text-white"
          >
            Get In Touch
          </a>
        </div>

        {/* Social links */}
        <div
          className="grid w-full gap-3 animate-slide-up sm:grid-cols-2 lg:grid-cols-4"
          style={{ animationDelay: '0.5s' }}
        >
          {socialLinks.map(({ icon: Icon, label, href, username }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group touch-target flex min-w-0 items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-left transition-all duration-200 hover:border-indigo-500/50 hover:bg-gray-800"
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-gray-500 transition-colors group-hover:text-indigo-400" />
              <span className="min-w-0 truncate text-sm text-gray-400 transition-colors group-hover:text-gray-200">
                {username}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-gray-600 animate-bounce sm:flex">
        <span className="text-xs font-mono tracking-widest uppercase">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
      </div>
    </section>
  )
}
