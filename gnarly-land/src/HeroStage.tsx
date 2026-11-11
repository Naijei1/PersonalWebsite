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
    <figure className="phone-float" aria-label="Diagram of the navigator, not a recording.">
      <div className="device" aria-hidden="true">
        <span className="device-key" />
        <div className="device-screen">
          <svg viewBox="0 0 180 390">
            <rect width="180" height="390" fill="#0c1216" />
            {Array.from({ length: 70 }, (_, i) => (
              <circle
                key={i}
                cx={18 + ((i * 47) % 146)}
                cy={36 + ((i * 29) % 250)}
                r={i % 5 === 0 ? 1.6 : 1}
                fill={i % 4 === 0 ? '#12b5cb' : '#d5e2e8'}
                opacity={0.35 + (i % 5) * 0.1}
              />
            ))}
            <path d="M16 300 L90 150 L164 300" fill="none" stroke="rgba(213,226,232,0.28)" strokeWidth="1.4" />
            <path d="M28 330 L90 168 L152 330" fill="none" stroke="rgba(213,226,232,0.18)" strokeWidth="1.2" />
            <path
              d="M90 318 C92 250 88 200 90 168"
              fill="none"
              stroke="#12b5cb"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path d="M78 236 L90 214 L102 236" fill="none" stroke="#f4f7f8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="62" y="16" width="56" height="10" rx="5" fill="#07090b" />
          </svg>
          <div className="nav-sheet">
            <span>Route</span>
            <strong>Follow the floor</strong>
          </div>
        </div>
      </div>
    </figure>
  )
}
