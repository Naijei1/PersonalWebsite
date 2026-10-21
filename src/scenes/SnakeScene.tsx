import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture, Color, Object3D, type Group, type InstancedMesh, type Mesh, type MeshBasicMaterial } from 'three'
import SceneCanvas from './SceneCanvas'
import { CELL, COLS, ROWS, SNAKE_MAX, STEP, catchUp, createSim, type Cell, type Sim } from './snakeSim'
import { LOOP, PAUSE, RESUME, fadeWindow, playTimeAt, snakeTime } from './snakeStory'

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

  useEffect(() => {
    snakeTime.live = true
    return () => {
      snakeTime.live = false
    }
  }, [])

  useFrame(({ clock }) => {
    const state = sim.current
    const worms = snakes.current
    if (!state || !worms) return
    const t = clock.elapsedTime
    snakeTime.t = t
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
    <group position={[-1.05, 0, 0.95]} scale={0.72}>
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
        <mesh ref={label} position={[-1.45, 0.42, 1.35]} rotation={[-0.72, 0.15, 0]} visible={false}>
          <planeGeometry args={[1.7, 0.53]} />
          <meshBasicMaterial map={pausedMap} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

export default function SnakeScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.2, 6.15, 7.15]} target={[0, -0.05, 0]}>
      <Arena />
    </SceneCanvas>
  )
}
