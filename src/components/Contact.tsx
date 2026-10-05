import { Check, Copy, Github, Instagram, Linkedin, Mail, Youtube } from 'lucide-react'
import { useState } from 'react'
import { links, profile } from '../data/content'
import Reveal, { Section } from './Reveal'

const ICONS: Record<string, typeof Mail> = {
  Email: Mail,
  LinkedIn: Linkedin,
  GitHub: Github,
  YouTube: Youtube,
  Instagram,
}

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <Section id="contact" eyebrow="05 · Contact" title="Let’s talk.">
      <Reveal>
        <div className="surface flex flex-col items-start gap-6 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg text-ink-soft dark:text-night-soft">
              Recruiting, collaborating, or just want to say hi? My inbox is open.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-2 block break-all text-2xl font-medium text-g-blue-ink hover:underline dark:text-[#8AB4F8] sm:text-3xl"
            >
              {profile.email}
            </a>
          </div>
          <div className="flex gap-2">
            <a href={`mailto:${profile.email}`} className="btn-primary">
              <Mail className="h-4 w-4" /> Email me
            </a>
            <button type="button" onClick={copy} className="btn-tonal" aria-live="polite">
              {copied ? <Check className="h-4 w-4 text-g-green" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </Reveal>
      <div className="mt-6 flex flex-wrap gap-2">
        {links
          .filter((l) => l.label !== 'Email')
          .map((l) => {
            const Icon = ICONS[l.label]
            return (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="btn-tonal">
                <Icon className="h-4 w-4" /> {l.label}
                <span className="text-ink-faint dark:text-night-soft">{l.handle}</span>
              </a>
            )
          })}
      </div>
    </Section>
  )
}
