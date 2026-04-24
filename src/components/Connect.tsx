import { Mail, Github, Youtube, Instagram, MessageSquare, Linkedin } from 'lucide-react'
import SectionHeader from './SectionHeader'
import ScrollSection from './ScrollSection'

const links = [
  {
    icon: Mail,
    label: 'Email',
    value: 'nj277@cornell.edu',
    href: 'mailto:nj277@cornell.edu',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-400/40',
    iconColor: 'text-blue-400',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/naijei',
    href: 'https://www.linkedin.com/in/naijei',
    color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-400/40',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/Naijei1',
    href: 'https://github.com/Naijei1',
    color: 'from-gray-500/10 to-gray-600/10 border-gray-600/20 hover:border-gray-500/40',
    iconColor: 'text-gray-400',
  },
  {
    icon: Youtube,
    label: 'YouTube',
    value: '@ItzNaijei',
    href: 'https://www.youtube.com/@itznaijei6316',
    color: 'from-red-500/10 to-red-600/10 border-red-500/20 hover:border-red-400/40',
    iconColor: 'text-red-400',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@naijeie',
    href: 'https://www.instagram.com/naijeie/',
    color: 'from-pink-500/10 to-purple-500/10 border-pink-500/20 hover:border-pink-400/40',
    iconColor: 'text-pink-400',
  },
  {
    icon: MessageSquare,
    label: 'Discord',
    value: 'Naije',
    href: 'https://discordapp.com/users/447773523868647424/',
    color: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20 hover:border-indigo-400/40',
    iconColor: 'text-indigo-400',
  },
]

export default function Connect() {
  return (
    <ScrollSection id="connect" className="section-shell py-20 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeader title="Connect" icon={<Mail className="w-4 h-4 text-indigo-400" />} className="mb-4" />
        <p className="text-gray-500 mb-12">
          Based in Rochester, NY · Available for internships &amp; collaboration
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {links.map(({ icon: Icon, label, value, href, color, iconColor }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`group card-hover touch-target flex items-center gap-4 rounded-2xl border bg-gradient-to-br p-4 sm:p-5 transition-all duration-200 ${color}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-900/60 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-gray-300 text-sm font-medium truncate group-hover:text-white transition-colors">
                  {value}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </ScrollSection>
  )
}
