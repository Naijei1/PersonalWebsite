import { useEffect, useState, type ReactNode } from 'react'
import { useInView } from '../lib/hooks'

export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>('0px 0px -10% 0px')
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (inView) setShown(true)
  }, [inView])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
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
