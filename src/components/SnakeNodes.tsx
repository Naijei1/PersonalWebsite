import { useEffect, useRef } from 'react'
import { BOOT, RESUME, smooth, snakeTime, storyAt, type NodeRole } from '../scenes/snakeStory'

const POS = [
  { x: 120, y: 26 },
  { x: 58, y: 90 },
  { x: 182, y: 90 },
]

type Paint = {
  fill: string
  stroke: string
  ink: string
  glow: number
}

function paintOf(role: NodeRole, phase: number): Paint {
  if (role === 'main') return { fill: '#E6F4EA', stroke: '#34A853', ink: '#137333', glow: 1 }
  if (role === 'crash') {
    const flick = 0.55 + Math.abs(Math.sin(phase * 28)) * 0.45
    return { fill: '#FCE8E6', stroke: '#EA4335', ink: '#C5221F', glow: flick }
  }
  if (role === 'dead') return { fill: '#F1F3F4', stroke: '#BDC1C6', ink: '#80868B', glow: 0.35 }
  if (role === 'boot') return { fill: '#E6F4EA', stroke: '#34A853', ink: '#137333', glow: 1 }
  if (role === 'recover') return { fill: '#F8F9FA', stroke: '#81C995', ink: '#5F6368', glow: 0.7 }
  return { fill: '#FFFFFF', stroke: '#DADCE0', ink: '#3C4043', glow: 0.85 }
}

/** Flat cluster diagram. Follows the snake scene clock so the crash and the pause land together. */
export default function SnakeNodes() {
  const svg = useRef<SVGSVGElement>(null)
  const badge = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const pulses = [0, 1, 2, 3].map((i) => svg.current?.querySelector<SVGCircleElement>(`[data-pulse="${i}"]`) ?? null)
    const boxes = [0, 1, 2].map((i) => svg.current?.querySelector<SVGRectElement>(`[data-box="${i}"]`) ?? null)
    const names = [0, 1, 2].map((i) => svg.current?.querySelector<SVGTextElement>(`[data-name="${i}"]`) ?? null)
    const lines = [0, 1].map((i) => svg.current?.querySelector<SVGLineElement>(`[data-line="${i}"]`) ?? null)
    const restored = badge.current

    let raf = 0
    const tick = () => {
      const t = snakeTime.live ? snakeTime.t : 0
      const frame = storyAt(t)
      const from = POS[frame.source]
      const targets = [0, 1, 2].filter((i) => i !== frame.source)

      lines.forEach((line, i) => {
        const to = POS[targets[i]]
        if (!line) return
        line.setAttribute('x1', String(from.x))
        line.setAttribute('y1', String(from.y + 16))
        line.setAttribute('x2', String(to.x))
        line.setAttribute('y2', String(to.y - 14))
        line.setAttribute('stroke-opacity', String(0.35 + frame.pulse * 0.45))
      })

      pulses.forEach((dot, i) => {
        if (!dot) return
        const to = POS[targets[i % targets.length]]
        const along = (t * 0.55 + (i % 2) * 0.5) % 1
        const x = from.x + (to.x - from.x) * along
        const y = from.y + 16 + (to.y - 14 - (from.y + 16)) * along
        dot.setAttribute('cx', String(x))
        dot.setAttribute('cy', String(y))
        dot.setAttribute('opacity', String(frame.pulse * (0.35 + 0.65 * Math.sin(along * Math.PI))))
      })

      boxes.forEach((box, i) => {
        const look = paintOf(frame.roles[i], frame.phase)
        const booting = frame.roles[i] === 'boot'
        const bootU = booting ? smooth((frame.phase - BOOT) / (RESUME - BOOT)) : 1
        box?.setAttribute('fill', look.fill)
        box?.setAttribute('stroke', look.stroke)
        box?.setAttribute('stroke-width', frame.roles[i] === 'main' || booting ? '2.25' : '1.25')
        box?.setAttribute('opacity', String(look.glow * (booting ? 0.45 + bootU * 0.55 : 1)))
        const name = names[i]
        if (name) {
          name.textContent = frame.labels[i]
          name.setAttribute('fill', look.ink)
          name.setAttribute('opacity', String(frame.roles[i] === 'dead' ? 0.55 : 1))
        }
      })

      if (restored) {
        restored.style.opacity = String(frame.restored)
        const shown = frame.restored > 0.02
        restored.style.height = shown ? 'auto' : '0px'
        restored.style.marginTop = shown ? '2px' : '0px'
        restored.style.overflow = 'hidden'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="pointer-events-none absolute right-2 top-2 z-10 w-[min(48%,200px)] sm:right-3 sm:top-3 sm:w-[248px]">
      <div className="relative rounded-2xl border border-black/10 bg-white px-2 pb-1 pt-1.5 shadow-card">
        <svg ref={svg} viewBox="0 0 240 128" className="h-auto w-full" role="img" aria-label="Main node and two backups">
          <line data-line="0" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" />
          <line data-line="1" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} data-pulse={i} r="3.2" fill="#34A853" />
          ))}
          {POS.map((p, i) => (
            <g key={i}>
              <rect data-box={i} x={p.x - 50} y={p.y - 16} width="100" height="32" rx="10" />
              <text
                data-name={i}
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontFamily="Google Sans, system-ui, sans-serif"
                fontSize="14"
                fontWeight="500"
              >
                {i === 0 ? 'Main' : `Backup ${i}`}
              </text>
            </g>
          ))}
        </svg>
        <p
          ref={badge}
          className="mt-0.5 text-center text-[11px] font-medium leading-tight text-[#137333] opacity-0 sm:text-xs"
        >
          State restored
        </p>
      </div>
    </div>
  )
}
