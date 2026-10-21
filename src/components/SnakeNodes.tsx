import { useEffect, useRef } from 'react'
import { snakeTime, storyAt, type NodeRole } from '../scenes/snakeStory'

type Paint = {
  fill: string
  stroke: string
  ink: string
}

function paintOf(role: NodeRole): Paint {
  if (role === 'main') return { fill: '#E6F4EA', stroke: '#34A853', ink: '#137333' }
  if (role === 'crash') return { fill: '#EA4335', stroke: '#C5221F', ink: '#FFFFFF' }
  if (role === 'dead') return { fill: '#3C4043', stroke: '#202124', ink: '#FFFFFF' }
  if (role === 'boot') return { fill: '#34A853', stroke: '#137333', ink: '#FFFFFF' }
  if (role === 'recover') return { fill: '#E6F4EA', stroke: '#81C995', ink: '#137333' }
  return { fill: '#FFFFFF', stroke: '#DADCE0', ink: '#3C4043' }
}

/** Corner inset. Main sends a labeled state packet; each backup sends a labeled ACK. */
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
        const look = paintOf(frame.roles[i])
        if (box) {
          box.style.background = look.fill
          box.style.borderColor = look.stroke
          box.style.color = look.ink
          box.style.opacity = '1'
        }
        const name = names[i]
        if (name) name.textContent = frame.labels[i]
      })

      ;[0, 1].forEach((link) => {
        const state = el.querySelector<HTMLElement>(`[data-packet="state-${link}"]`)
        const ack = el.querySelector<HTMLElement>(`[data-packet="ack-${link}"]`)
        const back = (along + 0.5) % 1
        const shown = frame.pulse > 0.08 ? 1 : frame.pulse / 0.08
        if (state) {
          state.style.top = `${along * 55}%`
          state.style.opacity = String(shown)
        }
        if (ack) {
          ack.style.top = `${(1 - back) * 55}%`
          ack.style.opacity = String(shown)
        }
      })

      if (restored) restored.style.opacity = String(frame.restored)
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
      <div className="rounded-md border border-black/10 bg-white px-0.5 py-0.5 shadow-card sm:rounded-lg sm:px-1">
        <div className="ml-0.5 border-l-2 border-[#34A853]/70 pl-0.5">
          <Node index={0} label="Main" />
          <Lane link={0} />
          <Node index={1} label="Backup 1" />
          <Lane link={1} />
          <Node index={2} label="Backup 2" />
        </div>
        <p
          data-restored
          className="h-3 text-center text-[8px] font-semibold leading-3 text-[#137333] opacity-0 sm:h-3.5 sm:text-[10px] sm:leading-4"
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
      className="truncate rounded border border-[#DADCE0] bg-white px-0.5 text-center text-[8px] font-semibold leading-tight text-[#3C4043] sm:text-[11px] sm:leading-4"
    >
      <span data-name={index}>{label}</span>
    </div>
  )
}

function Lane({ link }: { link: number }) {
  return (
    <div className="relative h-4 sm:h-5">
      <span
        data-packet={`state-${link}`}
        className="absolute left-0 rounded-sm bg-[#137333] px-0.5 text-[8px] font-bold leading-none text-white sm:text-[11px]"
      >
        state
      </span>
      <span
        data-packet={`ack-${link}`}
        className="absolute right-0 rounded-sm bg-[#174EA6] px-0.5 text-[8px] font-bold leading-none text-white sm:text-[11px]"
      >
        ACK
      </span>
    </div>
  )
}
