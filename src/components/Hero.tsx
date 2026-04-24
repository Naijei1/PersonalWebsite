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
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
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

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Profile image */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-2xl shadow-indigo-500/30">
              <img
                src={`${import.meta.env.BASE_URL}project-logos/naijei-owner.png`}
                alt="Naijei Jiang"
                className="w-full h-full rounded-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-950" />
          </div>
        </div>

        {/* Name & headline */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-indigo-400 font-mono text-sm mb-3 tracking-widest uppercase">
            Hello, I'm
          </p>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-gradient">Naijei Jiang</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light mb-8">
            Software Engineer &amp; Distributed Systems Enthusiast
          </p>
        </div>

        {/* Badges */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-10 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          {badges.map((badge) => (
            <span
              key={badge}
              className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Short bio */}
        <p
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          CS sophomore at Cornell building distributed systems, teaching Data Structures &amp;
          Algorithms, and shipping real-world projects. Passionate about infrastructure,
          education, and creative tech.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-wrap justify-center gap-4 mb-14 animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <a
            href="#projects"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            View Projects
          </a>
          <a
            href="mailto:nj277@cornell.edu"
            className="px-6 py-3 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold transition-all duration-200 hover:-translate-y-0.5"
          >
            Get In Touch
          </a>
        </div>

        {/* Social links */}
        <div
          className="flex flex-wrap justify-center gap-3 animate-slide-up"
          style={{ animationDelay: '0.5s' }}
        >
          {socialLinks.map(({ icon: Icon, label, href, username }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200"
            >
              <Icon className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
              <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                {username}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
        <span className="text-xs font-mono tracking-widest uppercase">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
      </div>
    </section>
  )
}
