import { useEffect, useState, type ReactNode } from 'react'
import { useInView, useMediaQuery, useReducedMotion } from '../lib/hooks'

export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  // A phone scroll moves through a section before a fade can finish, which reads as an empty gap
  // and then a jump. Touch and reduced-motion show the content in place.
  const immediate = useReducedMotion() || useMediaQuery('(hover: none)')
  const [ref, inView] = useInView<HTMLDivElement>('160px 0px 160px 0px')
  const [shown, setShown] = useState(immediate)

  useEffect(() => {
    if (immediate || inView) setShown(true)
  }, [immediate, inView])

  if (immediate) return <div className={className}>{children}</div>

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 ease-out ${shown ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

export function Section({
  id,
  eyebrow,
  title,
  children,
  className = '',
}: {
  id: string
  eyebrow: string
  title: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="mb-10 text-3xl font-medium tracking-tight sm:mb-14 sm:text-5xl">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
