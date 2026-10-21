import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CanvasTexture,
  Color,
  Object3D,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three'
import SceneCanvas from './SceneCanvas'
import { CELL, COLS, ROWS, SNAKE_MAX, STEP, catchUp, createSim, type Cell, type Sim } from './snakeSim'

/**
 * Fault-tolerance loop (13s), then the next machine is the leader and it repeats:
 * play → leader crashes → snakes pause → a peer boots and takes the crown → play resumes.
 */
const LOOP = 13
const CRASH = 4.4
const PAUSE = 6.5
const BOOT = 8.15
const RESUME = 9.7
const RECOVER_END = 11.4
const SERVERS = 3
const SLOTS = [-0.2, 0, 0.2]
const SPARKS = 7

const DEAD = new Color('#202124')
const IDLE = new Color('#3C4043')
const RED = new Color('#EA4335')
const GOLD = new Color('#FBBC04')
const GREEN = new Color('#34A853')
const tint = new Color()

const smooth = (u: number) => {
  const x = Math.max(0, Math.min(1, u))
  return x * x * (3 - 2 * x)
}

/** Play time holds still while the match is paused, and stays continuous across the loop. */
function playTimeAt(t: number) {
  const cycle = Math.floor(t / LOOP)
  const phase = t - cycle * LOOP
  const perCycle = PAUSE + (LOOP - RESUME)
  const inCycle = phase < PAUSE ? phase : phase < RESUME ? PAUSE : PAUSE + (phase - RESUME)
  return cycle * perCycle + inCycle
}

function fadeWindow(phase: number, start: number, end: number) {
  if (phase <= start || phase >= end) return 0
  const edge = 0.28
  return Math.min(smooth((phase - start) / edge), smooth((end - phase) / edge))
}

function world(cell: Cell, fracFrom: Cell, frac: number): [number, number] {
  const x = fracFrom.x + (cell.x - fracFrom.x) * frac
  const z = fracFrom.y + (cell.y - fracFrom.y) * frac
  return [(x - (COLS - 1) / 2) * CELL, (z - (ROWS - 1) / 2) * CELL]
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

function usePausedTexture() {
  const [texture, setTexture] = useState<CanvasTexture | null>(null)
  useEffect(() => {
    let drop = false
    const draw = () => {
      if (drop) return
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 160
      const g = canvas.getContext('2d')
      if (!g) return
      g.clearRect(0, 0, 512, 160)
      roundRect(g, 16, 36, 480, 96, 48)
      g.fillStyle = 'rgba(32, 33, 36, 0.92)'
      g.fill()
      g.beginPath()
      g.arc(108, 84, 14, 0, Math.PI * 2)
      g.fillStyle = '#EA4335'
      g.fill()
      g.font = '500 54px "Google Sans", system-ui, sans-serif'
      g.fillStyle = '#ffffff'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText('Paused', 290, 86)
      const next = new CanvasTexture(canvas)
      next.needsUpdate = true
      setTexture((current) => {
        current?.dispose()
        return next
      })
    }
    void document.fonts.ready.then(draw)
    return () => {
      drop = true
    }
  }, [])
  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

function Arena() {
  const sim = useRef<Sim | null>(null)
  if (!sim.current) sim.current = createSim()
  const snakes = useRef<InstancedMesh>(null)
  const tiles = useRef<InstancedMesh>(null)
  const apple = useRef<Group>(null)
  const label = useRef<Mesh>(null)
  const dim = useRef<Mesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const color = useMemo(() => new Color(), [])
  const pausedMap = usePausedTexture()

  useLayoutEffect(() => {
    const board = tiles.current
    const worms = snakes.current
    const state = sim.current
    if (!board || !worms || !state) return
    let i = 0
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        dummy.position.set((x - (COLS - 1) / 2) * CELL, 0, (y - (ROWS - 1) / 2) * CELL)
        dummy.scale.set(1, 1, 1)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        board.setMatrixAt(i, dummy.matrix)
        board.setColorAt(i, color.set((x + y) % 2 === 0 ? '#ffffff' : '#E6E8EC'))
        i += 1
      }
    }
    board.instanceMatrix.needsUpdate = true
    if (board.instanceColor) board.instanceColor.needsUpdate = true
    state.snakes.forEach((snake, si) => {
      for (let n = 0; n < SNAKE_MAX; n++) worms.setColorAt(si * SNAKE_MAX + n, color.set(snake.color))
    })
    if (worms.instanceColor) worms.instanceColor.needsUpdate = true
  }, [color, dummy])

  useFrame(({ clock }) => {
    const state = sim.current
    const worms = snakes.current
    if (!state || !worms) return
    const t = clock.elapsedTime
    const phase = t % LOOP
    const play = playTimeAt(t)
    catchUp(state, play)
    const frac = play / STEP - Math.floor(play / STEP)

    state.snakes.forEach((snake, si) => {
      for (let n = 0; n < SNAKE_MAX; n++) {
        const id = si * SNAKE_MAX + n
        if (n >= snake.body.length) {
          dummy.position.set(0, -6, 0)
          dummy.scale.setScalar(0.0001)
          dummy.rotation.set(0, 0, 0)
          dummy.updateMatrix()
          worms.setMatrixAt(id, dummy.matrix)
          continue
        }
        const [x, z] = world(snake.body[n], snake.from[n] ?? snake.body[n], frac)
        dummy.position.set(x, 0.2, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(n === 0 ? 1.14 : 1)
        dummy.updateMatrix()
        worms.setMatrixAt(id, dummy.matrix)
      }
    })
    worms.instanceMatrix.needsUpdate = true

    if (apple.current) {
      const age = state.appleTick < 0 ? 1 : state.tick + frac - state.appleTick
      const pop = Math.min(1, Math.max(0, age) * 3)
      const [x, z] = world(state.apple, state.apple, 0)
      apple.current.position.set(x, 0.24 + Math.sin(play * 3) * 0.04 * pop, z)
      apple.current.scale.setScalar(0.9 * pop)
    }

    const paused = fadeWindow(phase, PAUSE, RESUME)
    if (dim.current) {
      const mat = dim.current.material as MeshBasicMaterial
      mat.opacity = paused * 0.18
      dim.current.visible = paused > 0.01
    }
    if (label.current) {
      const mat = label.current.material as MeshBasicMaterial
      mat.opacity = paused
      label.current.visible = paused > 0.01
      const s = 0.85 + paused * 0.15
      label.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      <mesh position={[0, -0.07, 0]}>
        <boxGeometry args={[5.05, 0.08, 5.05]} />
        <meshStandardMaterial color="#DADCE0" roughness={0.85} />
      </mesh>
      <instancedMesh ref={tiles} args={[undefined, undefined, COLS * ROWS]} frustumCulled={false}>
        <boxGeometry args={[0.34, 0.05, 0.34]} />
        <meshStandardMaterial roughness={0.78} />
      </instancedMesh>
      <instancedMesh ref={snakes} args={[undefined, undefined, SNAKE_MAX * 4]} frustumCulled={false}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
      <group ref={apple}>
        <mesh>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#EA4335" roughness={0.38} />
        </mesh>
        <mesh position={[0.04, 0.18, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.06]} />
          <meshStandardMaterial color="#188038" roughness={0.5} />
        </mesh>
      </group>
      <mesh ref={dim} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} visible={false}>
        <planeGeometry args={[5.1, 5.1]} />
        <meshBasicMaterial color="#202124" transparent opacity={0} depthWrite={false} />
      </mesh>
      {pausedMap && (
        <mesh ref={label} position={[0, 0.72, 0.15]} rotation={[-0.55, 0, 0]} visible={false}>
          <planeGeometry args={[1.7, 0.53]} />
          <meshBasicMaterial map={pausedMap} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function ScreenPin({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame(({ camera }) => {
    const group = ref.current
    if (!group) return
    group.position.copy(camera.position)
    group.quaternion.copy(camera.quaternion)
    group.translateX(0.55)
    group.translateY(0.4)
    group.translateZ(-1.72)
    group.scale.setScalar(0.48)
  })
  return <group ref={ref}>{children}</group>
}

function ClusterHud() {
  const bodies = useRef<(MeshStandardMaterial | null)[]>([])
  const leds = useRef<(MeshStandardMaterial | null)[]>([])
  const scans = useRef<(Mesh | null)[]>([])
  const sparks = useRef<(Mesh | null)[]>([])
  const marker = useRef<Group>(null)
  const crown = useRef<MeshStandardMaterial>(null)
  const prongs = useRef<(MeshStandardMaterial | null)[]>([])
  const ring = useRef<MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const cycle = Math.floor(t / LOOP)
    const phase = t - cycle * LOOP
    const leader = cycle % SERVERS
    const next = (leader + 1) % SERVERS
    const crashU = smooth((phase - CRASH) / (PAUSE - CRASH))

    for (let i = 0; i < SERVERS; i++) {
      const body = bodies.current[i]
      if (!body) continue
      const recovering = i === leader && phase >= RESUME && phase < RECOVER_END
      const booting = i === next && phase >= BOOT && phase < RESUME
      const crashing = i === leader && phase >= CRASH && phase < PAUSE
      const dead = i === leader && phase >= PAUSE && phase < RESUME
      const leading = (i === leader && phase < CRASH) || (i === next && phase >= RESUME)
      const bootU = booting ? smooth((phase - BOOT) / (RESUME - BOOT)) : 0
      const recoverU = recovering ? smooth((phase - RESUME) / (RECOVER_END - RESUME)) : 0

      if (crashing) {
        const flick = 0.65 + Math.abs(Math.sin(t * 46 + i)) * 0.9
        body.color.copy(RED)
        body.emissive.copy(RED)
        body.emissiveIntensity = flick
      } else if (dead) {
        body.color.copy(DEAD)
        body.emissive.set('#000000')
        body.emissiveIntensity = 0
      } else if (recovering) {
        body.color.copy(DEAD).lerp(IDLE, recoverU)
        body.emissive.set('#000000')
        body.emissiveIntensity = 0
      } else if (booting) {
        body.color.copy(IDLE)
        body.emissive.copy(GREEN)
        body.emissiveIntensity = 0.15 + bootU * 0.7
      } else if (leading) {
        body.color.set('#4A5056')
        body.emissive.copy(GREEN)
        body.emissiveIntensity = 0.22 + Math.sin(t * 3) * 0.06
      } else {
        body.color.copy(IDLE)
        body.emissive.set('#000000')
        body.emissiveIntensity = 0
      }

      for (let l = 0; l < 2; l++) {
        const led = leds.current[i * 2 + l]
        if (!led) continue
        if (crashing) {
          led.color.copy(RED)
          led.emissive.copy(RED)
          led.emissiveIntensity = Math.sin(t * 50 + l) > 0 ? 1.1 : 0.05
        } else if (dead) {
          led.color.set('#3C4043')
          led.emissive.set('#000000')
          led.emissiveIntensity = 0
        } else if (booting) {
          led.color.copy(GREEN)
          led.emissive.copy(GREEN)
          led.emissiveIntensity = bootU
        } else {
          const blink = Math.sin(t * 5 + i + l) > 0
          led.color.copy(GREEN)
          led.emissive.copy(GREEN)
          led.emissiveIntensity = leading ? 0.9 : blink ? 0.45 : 0.08
        }
      }

      const scan = scans.current[i]
      if (scan) {
        const mat = scan.material as MeshBasicMaterial
        scan.position.y = -0.08 + bootU * 0.16
        scan.scale.y = booting ? 1 : 0.001
        mat.opacity = booting ? 0.95 : 0
      }
    }

    if (marker.current) {
      let x = SLOTS[leader]
      let y = 0.2
      if (phase >= CRASH && phase < BOOT) {
        x = SLOTS[leader] + (phase < PAUSE ? Math.sin(t * 48) * 0.012 * (1 - crashU) : 0)
        y = 0.2 - smooth(phase < PAUSE ? crashU : 1) * 0.05
      } else if (phase >= BOOT && phase < RESUME) {
        const u = smooth((phase - BOOT) / (RESUME - BOOT))
        x = SLOTS[leader] + (SLOTS[next] - SLOTS[leader]) * u
        y = 0.15 + u * 0.05 + Math.sin(t * 2.4) * 0.006
      } else {
        x = phase >= RESUME ? SLOTS[next] : SLOTS[leader]
        y = 0.2 + Math.sin(t * 2.4) * 0.008
      }
      marker.current.position.set(x, y, 0.02)
    }

    if (crown.current && ring.current) {
      const failed = phase >= CRASH && phase < BOOT
      const traveling = phase >= BOOT && phase < RESUME
      const travelU = smooth((phase - BOOT) / (RESUME - BOOT))
      if (failed) tint.copy(GOLD).lerp(RED, Math.min(1, crashU * 1.4))
      else if (traveling) tint.copy(RED).lerp(GOLD, travelU)
      else tint.copy(GOLD)
      crown.current.color.copy(tint)
      crown.current.emissive.copy(tint)
      crown.current.emissiveIntensity = failed ? 0.2 + (1 - crashU) * 0.5 : 0.45
      prongs.current.forEach((prong) => {
        if (!prong || !crown.current) return
        prong.color.copy(crown.current.color)
        prong.emissive.copy(crown.current.emissive)
        prong.emissiveIntensity = crown.current.emissiveIntensity
      })
      ring.current.color.copy(failed ? RED : GREEN)
      ring.current.opacity = failed ? 1 - crashU * 0.85 : traveling ? travelU : 0.95
    }

    const sparking = phase >= CRASH && phase < PAUSE
    for (let s = 0; s < SPARKS; s++) {
      const spark = sparks.current[s]
      if (!spark) continue
      const mat = spark.material as MeshBasicMaterial
      if (!sparking) {
        spark.scale.setScalar(0.0001)
        mat.opacity = 0
        continue
      }
      const ang = s * 0.9 + cycle
      const dist = 0.03 + crashU * 0.2
      spark.position.set(
        SLOTS[leader] + Math.cos(ang) * dist,
        0.06 + crashU * 0.26 - crashU * crashU * 0.1,
        0.1 + Math.sin(ang) * dist,
      )
      spark.scale.setScalar((1 - crashU) * 0.85 + 0.45)
      mat.opacity = 1 - crashU
    }
  })

  return (
    <ScreenPin>
      <pointLight position={[0, 0.45, 0.7]} intensity={1.6} distance={2.4} />
      <mesh position={[0, 0.02, -0.18]}>
        <planeGeometry args={[0.86, 0.52]} />
        <meshBasicMaterial color="#DADCE0" />
      </mesh>
      <mesh position={[0, 0.02, -0.16]}>
        <planeGeometry args={[0.8, 0.46]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.68, 0.045, 0.26]} />
        <meshStandardMaterial color="#E8EAED" roughness={0.7} />
      </mesh>
      {SLOTS.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.16, 0.22, 0.14]} />
            <meshStandardMaterial ref={(m) => (bodies.current[i] = m)} color="#3C4043" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.072]}>
            <boxGeometry args={[0.12, 0.15, 0.008]} />
            <meshStandardMaterial color="#5F6368" roughness={0.5} />
          </mesh>
          {[0, 1].map((l) => (
            <mesh key={l} position={[-0.028 + l * 0.056, 0.055, 0.08]}>
              <boxGeometry args={[0.028, 0.022, 0.01]} />
              <meshStandardMaterial
                ref={(m) => (leds.current[i * 2 + l] = m)}
                color="#34A853"
                emissive="#34A853"
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
          <mesh ref={(m) => (scans.current[i] = m)} position={[0, -0.08, 0.082]}>
            <boxGeometry args={[0.1, 0.018, 0.012]} />
            <meshBasicMaterial color="#81C995" transparent opacity={0} />
          </mesh>
        </group>
      ))}
      <group ref={marker} position={[SLOTS[0], 0.2, 0.02]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.155, 0.04]}>
          <ringGeometry args={[0.09, 0.115, 18]} />
          <meshBasicMaterial ref={ring} color="#34A853" transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.028, 0.07]} />
          <meshStandardMaterial ref={crown} color="#FBBC04" emissive="#FBBC04" emissiveIntensity={0.4} roughness={0.35} />
        </mesh>
        {[-0.05, 0, 0.05].map((x, i) => (
          <mesh key={x} position={[x, 0.04, 0]}>
            <boxGeometry args={[0.032, 0.055, 0.05]} />
            <meshStandardMaterial
              ref={(m) => (prongs.current[i] = m)}
              color="#FBBC04"
              emissive="#FBBC04"
              emissiveIntensity={0.35}
              roughness={0.35}
            />
          </mesh>
        ))}
      </group>
      {Array.from({ length: SPARKS }, (_, i) => (
        <mesh key={i} ref={(m) => (sparks.current[i] = m)} scale={0.001}>
          <boxGeometry args={[0.055, 0.055, 0.055]} />
          <meshBasicMaterial color={i % 2 ? '#EA4335' : '#FBBC04'} transparent opacity={0} />
        </mesh>
      ))}
    </ScreenPin>
  )
}

export default function SnakeScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.2, 6.15, 7.15]} target={[0, -0.05, 0]} hud={<ClusterHud />}>
      <Arena />
    </SceneCanvas>
  )
}
