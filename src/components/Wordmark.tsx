import { useRef, useState } from 'react'

const COLORS = ['text-g-blue', 'text-g-red', 'text-g-yellow', 'text-g-blue', 'text-g-green', 'text-g-red']
const GRAVITY_CLICKS = 5

/** Google-style multicolor name. Click a letter to make it hop; click five times fast for gravity. */
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

  return (
    <h1 className={`select-none font-medium tracking-[-0.04em] ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden
          onClick={() => onClick(i)}
          onAnimationEnd={() => setHopping(null)}
          className={`inline-block cursor-pointer ${COLORS[i % COLORS.length]} ${
            falling ? 'animate-fall' : hopping === i ? 'animate-hop' : ''
          }`}
          style={
            falling
              ? ({
                  '--fall': `${55 + ((i * 37) % 30)}vh`,
                  '--spin': `${(i % 2 ? 1 : -1) * (20 + i * 17)}deg`,
                  animationDelay: `${i * 60}ms`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {ch}
        </span>
      ))}
    </h1>
  )
}
