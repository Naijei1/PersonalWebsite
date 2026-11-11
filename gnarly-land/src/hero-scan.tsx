type Point = { x: number; y: number; delay: number; tone: 'ink' | 'tape' }

function along(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  count: number,
  spread: number,
  delayStart: number,
  delaySpan: number,
  tone: Point['tone'],
): Point[] {
  const points: Point[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1)
    const wobble = ((i * 37) % 13) - 6
    points.push({
      x: x0 + (x1 - x0) * t + wobble * spread,
      y: y0 + (y1 - y0) * t,
      delay: delayStart + t * delaySpan,
      tone,
    })
  }
  return points
}

const points: Point[] = [
  ...along(150, 900, 600, 500, 22, 0.7, 0, 1.05, 'ink'),
  ...along(1290, 900, 840, 500, 22, 0.7, 0.08, 1.05, 'ink'),
  ...along(720, 860, 680, 530, 9, 0.2, 0.15, 0.85, 'tape'),
  ...along(720, 860, 760, 530, 9, 0.2, 0.22, 0.85, 'tape'),
]

/** The hero is the scan: returns gather, then the route draws to the door. */
export function HeroScan() {
  return (
    <svg className="hero-scan" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M150 900 L600 500 L840 500 L1290 900" fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d="M600 500 V390 H840 V500" fill="none" stroke="var(--mute)" strokeWidth="2" />
      <path d="M430 900 L620 500 M1010 900 L820 500" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      {points.map((point) => (
        <circle
          key={`${point.x}-${point.y}-${point.delay}`}
          className={point.tone === 'tape' ? 'scan-point scan-point-tape' : 'scan-point'}
          cx={point.x}
          cy={point.y}
          r={point.tone === 'tape' ? 3.2 : 2.4}
          style={{ animationDelay: `${point.delay}s` }}
        />
      ))}
      <path
        className="scan-route"
        d="M720 900 C708 760 700 640 720 520"
        fill="none"
        stroke="var(--tape)"
        strokeWidth="7"
        strokeLinecap="round"
        pathLength="1"
      />
      <path className="scan-chev" d="M676 820 L720 784 L764 820" />
      <path className="scan-chev scan-chev-2" d="M686 680 L720 648 L754 680" />
      <path className="scan-chev scan-chev-3" d="M696 560 L720 534 L744 560" />
    </svg>
  )
}
