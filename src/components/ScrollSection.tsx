import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type ScrollSectionProps = {
  children: ReactNode
  className?: string
  id?: string
  amount?: number
}

export default function ScrollSection({
  children,
  className = '',
  id,
  amount = 0.18,
}: ScrollSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      id={id}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 32, filter: 'blur(8px)' }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
