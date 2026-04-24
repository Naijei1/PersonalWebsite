import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: shouldReduceMotion ? 1000 : 180,
    damping: shouldReduceMotion ? 120 : 28,
    restDelta: 0.001,
  })

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-gray-950/80 backdrop-blur-sm"
    >
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shadow-[0_0_18px_rgba(129,140,248,0.55)]"
        style={{ scaleX }}
      />
    </div>
  )
}
