import { useRef, useState } from 'react'

const HOVER = ['hover:text-g-blue', 'hover:text-g-red', 'hover:text-g-yellow', 'hover:text-g-green']
const ACTIVE = ['text-g-blue', 'text-g-red', 'text-g-yellow', 'text-g-green']
const GRAVITY_CLICKS = 5

/** Name whose letters pick up a color on hover; click a letter to make it hop, or click five times fast for gravity. */
export default function Wordmark({ text, className = '' }: { text: string; className?: string }) {
  const [hopping, setHopping] = useState<number | null>(null)
  const [falling, setFalling] = useState(false)
  const clicks = useRef<number[]>([])

  const onClick = (i: number) => {
    const now = Date.now()
    clicks.current = [...clicks.current.filter((c) => now - c < 1500), now]
    if (clicks.current.length >= GRAVITY_CLICKS && !falling) {
      clicks.current = []
      setFalling(true)
      window.setTimeout(() => setFalling(false), 2700)
      return
    }
    setHopping(null)
    requestAnimationFrame(() => setHopping(i))
  }

  let letter = 0
  return (
    <h1 className={`select-none font-medium tracking-[-0.035em] ${className}`} aria-label={text}>
      {[...text].map((ch, i) => {
        if (ch === ' ') return <span key={i}> </span>
        const c = letter++ % 4
        return (
          <span
            key={i}
            aria-hidden
            onClick={() => onClick(i)}
            onAnimationEnd={() => setHopping(null)}
            className={`inline-block cursor-pointer transition-colors duration-200 ${HOVER[c]} ${
              falling ? `animate-fall ${ACTIVE[c]}` : hopping === i ? `animate-hop ${ACTIVE[c]}` : ''
            }`}
            style={
              falling
                ? ({
                    '--fall': `${55 + ((i * 37) % 30)}vh`,
                    '--spin': `${(i % 2 ? 1 : -1) * (20 + i * 17)}deg`,
                    animationDelay: `${i * 50}ms`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {ch}
          </span>
        )
      })}
    </h1>
  )
}
