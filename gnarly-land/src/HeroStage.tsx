import { useEffect, useRef, useState } from 'react'

function FloorFallback() {
  return (
    <svg className="floor-fallback" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: 18 }, (_, row) => (
        <path key={`h${row}`} d={`M80 ${80 + row * 32} H1120`} stroke="rgba(243,246,248,0.16)" strokeWidth="1" />
      ))}
      {Array.from({ length: 16 }, (_, col) => (
        <path key={`v${col}`} d={`M${90 + col * 70} 60 V660`} stroke="rgba(243,246,248,0.16)" strokeWidth="1" />
      ))}
      {Array.from({ length: 42 }, (_, i) => (
        <circle
          key={i}
          className="scan-point"
          cx={140 + (i * 47) % 920}
          cy={120 + ((i * 83) % 460)}
          r="2.2"
        />
      ))}
      <path
        className="scan-route"
        d="M180 560 C420 520 520 360 760 300 S1040 180 1080 150"
        fill="none"
        stroke="#12b5cb"
        strokeWidth="7"
        strokeLinecap="round"
        pathLength="1"
      />
    </svg>
  )
}

export function HeroStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let stop = () => {}
    let cancelled = false
    setLive(true)
    import('./scan-scene').then(({ mountScan }) => {
      if (cancelled || !canvasRef.current) return
      stop = mountScan(canvasRef.current)
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  return (
    <>
      <FloorFallback />
      <canvas ref={canvasRef} className={live ? 'hero-canvas is-live' : 'hero-canvas'} />
    </>
  )
}

export function PhoneMock() {
  return (
    <figure className="phone-float" aria-label="Diagram of the navigator. Not a recording.">
      <div className="phone-bezel" aria-hidden="true">
        <svg viewBox="0 0 180 360">
          <rect width="180" height="360" fill="#10161a" />
          <path d="M20 300 L90 70 L160 300" fill="none" stroke="rgba(243,246,248,0.35)" strokeWidth="2" />
          <path d="M70 300 C78 210 86 150 90 110" fill="none" stroke="#12b5cb" strokeWidth="5" strokeLinecap="round" />
          <path d="M78 230 L90 210 L102 230" fill="none" stroke="#f3f6f8" strokeWidth="3" strokeLinecap="round" />
          <path d="M82 170 L90 154 L98 170" fill="none" stroke="#f3f6f8" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <figcaption>Diagram of the navigator. Not a recording.</figcaption>
    </figure>
  )
}
