export type Cell = { x: number; y: number }

/** Even order so the board has a single loop every snake can share. */
export const COLS = 12
export const ROWS = 12
export const CELL = 0.38
export const SNAKE_MAX = 8
export const STEP = 0.28

const MIN_LEN = 5

export const SNAKE_COLORS = ['#34A853', '#4285F4', '#F9AB00', '#A142F4'] as const

export type Snake = {
  body: Cell[]
  from: Cell[]
  color: string
}

export type Sim = {
  snakes: Snake[]
  apple: Cell
  appleTick: number
  tick: number
  eats: number
  runners: Runner[]
}

/** One Hamiltonian cycle over the whole board. Snakes share it, spaced apart, so they weave everywhere and never collide. */
function buildCycle(n: number): Cell[] {
  const path: Cell[] = []
  for (let y = 0; y < n - 1; y++) {
    if (y % 2 === 0) {
      for (let x = 1; x < n; x++) path.push({ x, y })
    } else {
      for (let x = n - 1; x >= 1; x--) path.push({ x, y })
    }
  }
  for (let x = n - 1; x >= 0; x--) path.push({ x, y: n - 1 })
  for (let y = n - 2; y >= 0; y--) path.push({ x: 0, y })
  return path
}

const CYCLE = buildCycle(COLS)
const LOOP = CYCLE.length

const copy = (c: Cell): Cell => ({ x: c.x, y: c.y })

const at = (index: number) => CYCLE[((index % LOOP) + LOOP) % LOOP]

type Runner = { cursor: number; length: number; hold: number; color: string }

function paint(runner: Runner, fromCursor: number, fromLength: number): Snake {
  const body = Array.from({ length: runner.length }, (_, i) => copy(at(runner.cursor - i)))
  const from = Array.from({ length: runner.length }, (_, i) => copy(at(fromCursor - Math.min(i, fromLength - 1))))
  return { body, from, color: runner.color }
}

function makeRunners(): Runner[] {
  const gap = LOOP / SNAKE_COLORS.length
  return SNAKE_COLORS.map((color, i) => ({
    cursor: i * gap,
    length: MIN_LEN,
    hold: 0,
    color,
  }))
}

export function createSim(): Sim {
  const runners = makeRunners()
  const apple = copy(at(runners[0].cursor + 8))
  return {
    snakes: runners.map((runner) => paint(runner, runner.cursor, runner.length)),
    apple,
    appleTick: -8,
    tick: 0,
    eats: 0,
    runners,
  }
}

export function stepSim(sim: Sim) {
  const appleIndex = CYCLE.findIndex((cell) => cell.x === sim.apple.x && cell.y === sim.apple.y)

  sim.runners.forEach((runner, index) => {
    const fromCursor = runner.cursor
    const fromLength = runner.length
    runner.cursor = (runner.cursor + 1) % LOOP
    const ate = runner.cursor === appleIndex
    if (ate) {
      runner.length = Math.min(SNAKE_MAX, runner.length + 1)
      runner.hold = 80
      sim.eats += 1
      const next = sim.runners[(index + 1) % sim.runners.length]
      sim.apple = copy(at(next.cursor + 9))
      sim.appleTick = sim.tick + 1
    } else if (runner.hold > 0) {
      runner.hold -= 1
    } else if (runner.length > MIN_LEN) {
      runner.length -= 1
    }
    sim.snakes[index] = paint(runner, fromCursor, fromLength)
  })
}

export function catchUp(sim: Sim, playTime: number) {
  const target = Math.floor(playTime / STEP)
  let guard = 0
  while (sim.tick < target && guard < 4000) {
    stepSim(sim)
    sim.tick += 1
    guard += 1
  }
}
