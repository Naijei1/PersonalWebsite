import { useRef, useState } from 'react'
import { useReducedMotion } from '../lib/hooks'

const HOVER = ['hover:text-g-blue', 'hover:text-g-red', 'hover:text-g-yellow', 'hover:text-g-green']
const ACTIVE = ['text-g-blue', 'text-g-red', 'text-g-yellow', 'text-g-green']
const SPARK_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FFFFFF']
const BURST_CLICKS = 5
const BURST_MS = 2500
const SPARKS = 28

type Burst = {
  id: number
  letters: { dx: number; dy: number; rot: number }[]
  sparks: { sx: number; sy: number; size: number; color: string; delay: number }[]
}

function makeBurst(count: number): Burst {
  const mid = (count - 1) / 2
  return {
    id: Date.now(),
    letters: Array.from({ length: count }, (_, i) => {
      const angle = Math.atan2(-0.6 - Math.random(), (i - mid) / Math.max(1, mid) + (Math.random() - 0.5) * 0.8)
      const dist = 110 + Math.random() * 180
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist * (Math.random() < 0.35 ? -0.8 : 1),
        rot: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360),
      }
    }),
    sparks: Array.from({ length: SPARKS }, (_, i) => {
      const angle = (i / SPARKS) * Math.PI * 2 + Math.random() * 0.4
      const dist = 100 + Math.random() * 220
      return {
        sx: Math.cos(angle) * dist,
        sy: Math.sin(angle) * dist * 0.7,
        size: 6 + Math.random() * 8,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
        delay: Math.random() * 120,
      }
    }),
  }
}

/** Name whose letters pick up a color on hover; click a letter to make it hop, or click five times fast to blow it apart. */
export default function Wordmark({ text, className = '' }: { text: string; className?: string }) {
  const [hopping, setHopping] = useState<number | null>(null)
  const [burst, setBurst] = useState<Burst | null>(null)
  const clicks = useRef<number[]>([])
  const reduced = useReducedMotion()
  const chars = [...text]

  const onClick = (i: number) => {
    const now = Date.now()
    clicks.current = [...clicks.current.filter((c) => now - c < 1500), now]
    if (clicks.current.length >= BURST_CLICKS && !burst) {
      clicks.current = []
      setBurst(makeBurst(chars.length))
      window.setTimeout(() => setBurst(null), reduced ? 1200 : BURST_MS)
      return
    }
    setHopping(null)
    requestAnimationFrame(() => setHopping(i))
  }

  let letter = 0
  return (
    <h1 className={`relative select-none font-medium tracking-[-0.035em] ${className}`} aria-label={text}>
      {chars.map((ch, i) => {
        if (ch === ' ') return <span key={i}> </span>
        const c = letter++ % 4
        const b = burst?.letters[i]
        const exploding = b && !reduced
        return (
          <span
            key={i}
            aria-hidden
            onClick={() => onClick(i)}
            onAnimationEnd={() => setHopping(null)}
            className={`relative inline-block cursor-pointer transition-colors duration-200 ${HOVER[c]} ${
              burst ? ACTIVE[c] : ''
            } ${exploding ? 'z-10 animate-explode' : hopping === i ? `animate-hop ${ACTIVE[c]}` : ''}`}
            style={
              exploding
                ? ({
                    '--dx': `${b.dx}px`,
                    '--dy': `${b.dy}px`,
                    '--rot': `${b.rot}deg`,
                    animationDelay: `${i * 12}ms`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {ch}
          </span>
        )
      })}
      {burst && !reduced && (
        <span key={burst.id} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20">
          {burst.sparks.map((s, i) => (
            <span
              key={i}
              className="animate-spark absolute left-0 top-0 rounded-full"
              style={
                {
                  width: s.size,
                  height: s.size,
                  background: s.color,
                  boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                  '--sx': `${s.sx}px`,
                  '--sy': `${s.sy}px`,
                  animationDelay: `${s.delay}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      )}
    </h1>
  )
}
