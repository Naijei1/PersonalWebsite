import { useEffect, useRef } from 'react'
import { CRASH, RESUME, snakeTime, storyAt, type NodeRole } from '../scenes/snakeStory'

const CYCLE = 1.7
const STATE_END = 0.4
const FLASH_END = 0.5
const ACK_END = 0.9
const SPAN = 70
const LOG0 = 12

function linkPacket(t: number, link: number, source: number, pulse: number) {
  const mainAbove = source <= link
  const u = ((t / CYCLE + link * 0.5) % 1 + 1) % 1
  const shown = pulse > 0.08 ? 1 : Math.max(0, pulse / 0.08)
  let stateAlong = 0
  let ackAlong = 0
  let stateOp = 0
  let ackOp = 0
  let flash = 0
  if (shown > 0 && u < STATE_END) {
    stateAlong = u / STATE_END
    stateOp = shown
  } else if (shown > 0 && u < FLASH_END) {
    const p = (u - STATE_END) / (FLASH_END - STATE_END)
    flash = Math.sin(p * Math.PI) * shown
  } else if (shown > 0 && u < ACK_END) {
    ackAlong = (u - FLASH_END) / (ACK_END - FLASH_END)
    ackOp = shown
  }
  const fromTop = (fromMain: number) => (mainAbove ? fromMain : 1 - fromMain) * SPAN
  return {
    u,
    stateAlong,
    stateTop: fromTop(stateAlong),
    ackTop: fromTop(1 - ackAlong),
    stateOp,
    ackOp,
    flash,
    dest: mainAbove ? link + 1 : link,
  }
}

function nodeStyle(role: NodeRole, elect: boolean) {
  if (role === 'crash') return { background: '#EA4335', borderColor: '#EA4335', shadow: 'none' }
  if (role === 'dead') return { background: '#3C4043', borderColor: '#5F6368', shadow: 'none' }
  if (role === 'boot' || elect) {
    return { background: '#81C995', borderColor: '#81C995', shadow: '0 0 0 3px rgba(129,201,149,0.35)' }
  }
  if (role === 'main') return { background: '#81C995', borderColor: '#81C995', shadow: '0 0 0 2px rgba(129,201,149,0.28)' }
  if (role === 'recover') return { background: 'transparent', borderColor: '#81C995', shadow: 'none' }
  return { background: 'transparent', borderColor: 'rgba(232,234,237,0.45)', shadow: 'none' }
}

/** Small primary-backup inset. A log entry travels out, the backup applies it, then the ACK returns. */
export default function SnakeNodes() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const boxes = [0, 1, 2].map((i) => el.querySelector<HTMLElement>(`[data-box="${i}"]`))
    const logs = [0, 1, 2].map((i) => el.querySelector<HTMLElement>(`[data-log="${i}"]`))
    const lines = [0, 1].map((i) => el.querySelector<HTMLElement>(`[data-line="${i}"]`))
    const beats = [0, 1].map((i) => el.querySelector<HTMLElement>(`[data-beat="${i}"]`))
    const restored = el.querySelector<HTMLElement>('[data-restored]')
    const states = [0, 1].map((link) => el.querySelector<HTMLElement>(`[data-packet="state-${link}"]`))
    const acks = [0, 1].map((link) => el.querySelector<HTMLElement>(`[data-packet="ack-${link}"]`))

    let raf = 0
    const seen = [false, false]
    const applied = [false, false]
    let source = -1
    let roundKey = ''
    let closed = ''
    let commit = LOG0

    const tick = () => {
      const t = snakeTime.live ? snakeTime.t : 0
      const frame = storyAt(t)
      const phase = frame.phase
      const outage = phase >= CRASH && phase < RESUME
      if (frame.source !== source) {
        seen[0] = false
        seen[1] = false
        applied[0] = false
        applied[1] = false
        source = frame.source
        roundKey = ''
      }

      const local = phase >= RESUME ? phase - RESUME : phase
      const round = Math.floor(local / CYCLE)
      const key = `${frame.source}:${outage ? 'down' : round}`
      if (key !== roundKey) {
        roundKey = key
        applied[0] = false
        applied[1] = false
        seen[0] = false
        seen[1] = false
      }

      const flashes = [0, 0, 0]
      ;[0, 1].forEach((link) => {
        const trip = linkPacket(t, link, frame.source, frame.pulse)
        if (trip.u < 0.08) seen[link] = false
        if (trip.stateOp > 0.55 && trip.stateAlong > 0.88) seen[link] = true
        if (!seen[link]) {
          trip.ackOp = 0
          trip.flash = 0
        } else if (!outage) {
          applied[link] = true
        }
        flashes[trip.dest] = Math.max(flashes[trip.dest], trip.flash)
        const state = states[link]
        const ack = acks[link]
        if (state) {
          state.style.top = `${trip.stateTop}%`
          state.style.opacity = String(trip.stateOp * 0.95)
        }
        if (ack) {
          ack.style.top = `${trip.ackTop}%`
          ack.style.opacity = String(trip.ackOp * 0.95)
        }
        const beat = beats[link]
        if (beat) {
          const healthy = frame.pulse > 0.45
          beat.style.opacity = healthy ? String(0.25 + 0.55 * Math.abs(Math.sin(t * 5 + link))) : '0'
        }
        const line = lines[link]
        if (line) line.style.opacity = frame.pulse > 0.2 ? '1' : String(Math.max(0.2, frame.pulse))
      })

      const roundId = `${frame.source}:${round}`
      if (!outage && applied[0] && applied[1] && closed !== roundId) {
        commit += 1
        closed = roundId
      }
      const entry = !outage && closed !== roundId ? commit + 1 : commit
      const shown = [commit, commit, commit]
      if (!outage) {
        shown[frame.source] = entry
        ;[0, 1].forEach((link) => {
          const dest = frame.source <= link ? link + 1 : link
          if (applied[link]) shown[dest] = entry
        })
      }

      boxes.forEach((box, i) => {
        const elect = outage && i === frame.next && phase >= CRASH + 1.2
        const look = nodeStyle(frame.roles[i], elect)
        if (box) {
          box.style.background = look.background
          box.style.borderColor = look.borderColor
          box.style.boxShadow = flashes[i] > 0.04 ? `0 0 0 3px rgba(129,201,149,${flashes[i].toFixed(2)})` : look.shadow
        }
        const log = logs[i]
        if (!log) return
        log.textContent = `log ${shown[i]}`
        log.style.opacity = frame.roles[i] === 'dead' ? '0.45' : '1'
      })

      if (restored) restored.style.opacity = String(frame.restored)
      const commitLine = el.querySelector<HTMLElement>('[data-commit]')
      if (commitLine) commitLine.textContent = `@ log ${commit}`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={root} className="pointer-events-none absolute right-1.5 top-1.5 z-10 w-[34%] max-w-[168px] sm:right-2 sm:top-2 sm:w-[26%] sm:max-w-[180px]">
      <div className="rounded-xl border border-white/10 bg-[#1A1B1E]/92 px-2 py-1.5">
        <Node index={0} />
        <Lane link={0} />
        <Node index={1} />
        <Lane link={1} />
        <Node index={2} />
        <p
          data-restored
          className="mt-1 border-t border-white/10 pt-1 text-center font-mono text-[9px] leading-tight text-[#81C995] opacity-0 sm:text-[10px]"
        >
          state restored
          <span data-commit className="block">
            @ log 12
          </span>
        </p>
      </div>
    </div>
  )
}

function Node({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-1">
      <span data-box={index} className="h-2 w-2 shrink-0 rounded-full border border-white/40 sm:h-2.5 sm:w-2.5" />
      <span data-log={index} className="font-mono text-[8px] leading-none tracking-tight text-[#E8EAED] sm:text-[9px]">
        log 12
      </span>
    </div>
  )
}

function Lane({ link }: { link: number }) {
  return (
    <div data-line={link} className="relative ml-[3px] h-3.5 border-l border-white/20 sm:ml-1 sm:h-4">
      <span data-packet={`state-${link}`} className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-[#81C995] opacity-0" />
      <span data-packet={`ack-${link}`} className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-[#8AB4F8] opacity-0" />
      <span data-beat={link} className="absolute left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white/70 opacity-0" />
    </div>
  )
}
