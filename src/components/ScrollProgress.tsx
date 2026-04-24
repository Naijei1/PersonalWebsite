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
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.5rem)] z-[60] h-1 border-y border-white/5 bg-gray-950/95 shadow-[0_10px_35px_rgba(0,0,0,0.28)] backdrop-blur-md sm:h-1.5"
    >
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shadow-[0_0_22px_rgba(129,140,248,0.75)]"
        style={{ scaleX }}
      />
    </div>
  )
}
