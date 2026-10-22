/** Shared fault-tolerance clock for the snake scene and the flat node diagram. */
export const LOOP = 13
export const CRASH = 4.4
export const PAUSE = 6.5
export const BOOT = 8.15
export const RESUME = 9.7
export const RECOVER_END = 11.4
export const NODES = 3

export const snakeTime = { t: 0, live: false }

export const smooth = (u: number) => {
  const x = Math.max(0, Math.min(1, u))
  return x * x * (3 - 2 * x)
}

export function playTimeAt(t: number) {
  const cycle = Math.floor(t / LOOP)
  const phase = t - cycle * LOOP
  const perCycle = PAUSE + (LOOP - RESUME)
  const inCycle = phase < PAUSE ? phase : phase < RESUME ? PAUSE : PAUSE + (phase - RESUME)
  return cycle * perCycle + inCycle
}

export function fadeWindow(phase: number, start: number, end: number) {
  if (phase <= start || phase >= end) return 0
  const edge = 0.28
  return Math.min(smooth((phase - start) / edge), smooth((end - phase) / edge))
}

export type NodeRole = 'main' | 'backup' | 'crash' | 'dead' | 'boot' | 'recover'

export type StoryFrame = {
  phase: number
  leader: number
  next: number
  /** Who pulses originate from. Switches when play resumes. */
  source: number
  pulse: number
  restored: number
  roles: NodeRole[]
  labels: string[]
}

export function storyAt(t: number): StoryFrame {
  const cycle = Math.floor(t / LOOP)
  const phase = t - cycle * LOOP
  const leader = cycle % NODES
  const next = (leader + 1) % NODES
  const source = phase >= RESUME ? next : leader
  const pulse =
    phase < CRASH
      ? 1
      : phase < PAUSE
        ? 1 - smooth((phase - CRASH) / (PAUSE - CRASH))
        : phase < RESUME
          ? 0
          : smooth((phase - RESUME) / 0.4)

  const roles: NodeRole[] = [0, 1, 2].map((i) => {
    if (i === leader) {
      if (phase < CRASH) return 'main'
      if (phase < PAUSE) return 'crash'
      if (phase < RESUME) return 'dead'
      if (phase < RECOVER_END) return 'recover'
      return 'backup'
    }
    if (i === next) {
      if (phase < BOOT) return 'backup'
      if (phase < RESUME) return 'boot'
      return 'main'
    }
    return 'backup'
  })

  const order = [0, 1, 2].filter((i) => i !== source)
  const labels = [0, 1, 2].map((i) => (i === source ? 'Main' : i === order[0] ? 'Backup 1' : 'Backup 2'))

  return {
    phase,
    leader,
    next,
    source,
    pulse,
    restored: fadeWindow(phase, BOOT, RECOVER_END + 1.1),
    roles,
    labels,
  }
}
