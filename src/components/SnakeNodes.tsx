import { useEffect, useRef } from 'react'
import { BOOT, RESUME, smooth, snakeTime, storyAt, type NodeRole } from '../scenes/snakeStory'

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

/** Corner inset. Main sends "state" to each backup, and each backup answers "ACK". */
export default function SnakeNodes() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const boxes = [0, 1, 2].map((i) => el.querySelector<HTMLElement>(`[data-box="${i}"]`))
    const names = [0, 1, 2].map((i) => el.querySelector<HTMLElement>(`[data-name="${i}"]`))
    const restored = el.querySelector<HTMLElement>('[data-restored]')

    let raf = 0
    const tick = () => {
      const t = snakeTime.live ? snakeTime.t : 0
      const frame = storyAt(t)
      const along = (t * 0.45) % 1

      boxes.forEach((box, i) => {
        const look = paintOf(frame.roles[i], frame.phase)
        const booting = frame.roles[i] === 'boot'
        const bootU = booting ? smooth((frame.phase - BOOT) / (RESUME - BOOT)) : 1
        if (box) {
          box.style.background = look.fill
          box.style.borderColor = look.stroke
          box.style.color = look.ink
          box.style.opacity = String(look.glow * (booting ? 0.45 + bootU * 0.55 : 1))
        }
        const name = names[i]
        if (name) {
          name.textContent = frame.labels[i]
          name.style.opacity = frame.roles[i] === 'dead' ? '0.55' : '1'
        }
      })

      ;[0, 1].forEach((link) => {
        const state = el.querySelector<HTMLElement>(`[data-packet="state-${link}"]`)
        const ack = el.querySelector<HTMLElement>(`[data-packet="ack-${link}"]`)
        const back = (along + 0.5) % 1
        const fade = (u: number) => frame.pulse * (0.35 + 0.65 * Math.sin(u * Math.PI))
        if (state) {
          state.style.top = `${along * 62}%`
          state.style.opacity = String(fade(along))
        }
        if (ack) {
          ack.style.top = `${(1 - back) * 62}%`
          ack.style.opacity = String(fade(back))
        }
      })

      if (restored) {
        const shown = frame.restored > 0.04
        restored.style.opacity = String(frame.restored)
        restored.style.display = shown ? 'block' : 'none'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={root}
      className="pointer-events-none absolute right-1 top-1 z-10 w-1/5 sm:right-1.5 sm:top-1.5 sm:w-[23%]"
    >
      <div className="rounded-md border border-black/10 bg-white px-0.5 py-0.5 shadow-card sm:rounded-lg sm:px-1 sm:py-1">
        <div className="ml-1 border-l-2 border-[#34A853]/55 pl-1">
          <Node index={0} label="Main" />
          <Lane link={0} />
          <Node index={1} label="Backup 1" />
          <Lane link={1} />
          <Node index={2} label="Backup 2" />
        </div>
        <p
          data-restored
          className="mt-0.5 hidden text-center text-[7px] font-medium leading-none text-[#137333] sm:text-[8px]"
        >
          State restored
        </p>
      </div>
    </div>
  )
}

function Node({ index, label }: { index: number; label: string }) {
  return (
    <div
      data-box={index}
      className="truncate rounded border px-0.5 text-center text-[8px] font-medium leading-tight sm:text-[10px] sm:leading-4"
    >
      <span data-name={index}>{label}</span>
    </div>
  )
}

function Lane({ link }: { link: number }) {
  return (
    <div className="relative h-3.5 sm:h-4">
      <span
        data-packet={`state-${link}`}
        className="absolute left-0.5 rounded-sm bg-[#E6F4EA] px-0.5 text-[7px] font-semibold leading-none text-[#137333] sm:text-[8px]"
      >
        state
      </span>
      <span
        data-packet={`ack-${link}`}
        className="absolute right-0 rounded-sm bg-[#E8F0FE] px-0.5 text-[7px] font-semibold leading-none text-[#174EA6] sm:text-[8px]"
      >
        ACK
      </span>
    </div>
  )
}
