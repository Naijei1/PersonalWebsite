import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Quaternion, Vector3, type Mesh, type MeshStandardMaterial } from 'three'
import SceneCanvas from '../SceneCanvas'
import { NUMERAL, phase, placeRoute, pointAt, segments } from './motion'

const X0 = -1.15
const X1 = 1.15
const Z0 = -0.72
const Z1 = 0.72
const Y = [0, 1.28, 2.42] as const

type Edge = { a: [number, number, number]; b: [number, number, number]; floor: 0 | 1 | 2 }

function rect(y: number, floor: Edge['floor']): Edge[] {
  const c: [number, number][] = [
    [X0, Z0],
    [X1, Z0],
    [X1, Z1],
    [X0, Z1],
  ]
  return c.map((p, i) => {
    const q = c[(i + 1) % 4]
    return { a: [p[0], y, p[1]], b: [q[0], y, q[1]], floor }
  })
}

const EDGES: Edge[] = [
  ...rect(Y[0], 0),
  ...rect(Y[1], 1),
  ...rect(Y[2], 2),
  ...[
    [X0, Z0],
    [X1, Z0],
    [X1, Z1],
    [X0, Z1],
  ].map(([x, z]) => ({ a: [x, Y[0], z] as [number, number, number], b: [x, Y[2], z] as [number, number, number], floor: 2 as const })),
]

const POINTS: [number, number, number][] = [
  [0.45, 0.06, 0.2],
  [-0.78, 0.06, 0.2],
  [-0.78, 1.34, 0.2],
  [0.72, 1.34, 0.2],
]

const up = new Vector3(0, 1, 0)
const dir = new Vector3()

function Wire() {
  const segs = useMemo(() => segments(POINTS), [])
  const wires = useMemo(
    () =>
      EDGES.map((e) => {
        const a = new Vector3(...e.a)
        const b = new Vector3(...e.b)
        const len = a.distanceTo(b)
        dir.copy(b).sub(a).normalize()
        return { a, b, len, quat: new Quaternion().setFromUnitVectors(up, dir), floor: e.floor }
      }),
    [],
  )
  const edge = useRef<(Mesh | null)[]>([])
  const route = useRef<(Mesh | null)[]>([])
  const floors = useRef<(Mesh | null)[]>([])
  const dot = useRef<Mesh>(null)
  const cabin = useRef<Mesh>(null)
  const tmp = useMemo(() => new Vector3(), [])

  useFrame(({ clock }) => {
    const { draw, walk } = phase(clock.elapsedTime)
    placeRoute(route.current, segs, draw)

    wires.forEach((w, i) => {
      const mesh = edge.current[i]
      if (!mesh) return
      mesh.scale.y = w.len
      mesh.position.copy(w.a).lerp(w.b, 0.5)
      mesh.quaternion.copy(w.quat)
      const lit = w.floor === 0 ? draw : w.floor === 1 ? Math.max(0, draw - 0.42) / 0.58 : 0
      ;(mesh.material as MeshStandardMaterial).emissiveIntensity = lit * 0.55
    })

    floors.current.forEach((mesh, i) => {
      if (!mesh) return
      const lit = i === 0 ? Math.min(1, draw / 0.45) : Math.max(0, (draw - 0.4) / 0.6)
      ;(mesh.material as MeshStandardMaterial).opacity = 0.04 + lit * 0.2
    })

    if (dot.current) {
      dot.current.visible = walk > 0.02
      pointAt(segs, walk, tmp)
      dot.current.position.copy(tmp)
    }
    if (cabin.current) {
      const riding = walk > 0.02 && tmp.y > 0.25 && tmp.y < 1.22 && tmp.x < -0.45
      cabin.current.position.y = riding ? tmp.y : walk > 0.68 ? 1.28 : 0.08
    }
  })

  return (
    <group position={[0, -1.05, 0]}>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(m) => (floors.current[i] = m)} rotation={[-Math.PI / 2, 0, 0]} position={[0, Y[i] + 0.01, 0]}>
          <planeGeometry args={[2.3, 1.44]} />
          <meshStandardMaterial color={i === 0 ? '#4285F4' : '#FBBC04'} transparent opacity={0.04} />
        </mesh>
      ))}
      {wires.map((w, i) => (
        <mesh key={i} ref={(m) => (edge.current[i] = m)}>
          <boxGeometry args={[0.028, 1, 0.028]} />
          <meshStandardMaterial color="#E8EAED" emissive={w.floor === 1 ? '#FDD663' : '#8AB4F8'} emissiveIntensity={0} />
        </mesh>
      ))}

      <mesh position={[-0.78, 0.64, 0.2]}>
        <boxGeometry args={[0.035, 1.28, 0.035]} />
        <meshStandardMaterial color="#9AA0A6" />
      </mesh>
      <mesh ref={cabin} position={[-0.78, 0.08, 0.2]}>
        <boxGeometry args={[0.16, 0.08, 0.16]} />
        <meshStandardMaterial color="#F8F9FA" />
      </mesh>
      <mesh position={[1.05, 1.5, 0.2]}>
        <boxGeometry args={[0.06, 0.28, 0.28]} />
        <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.45} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 0.04, -0.32]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshBasicMaterial map={NUMERAL.one} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 1.32, -0.32]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshBasicMaterial map={NUMERAL.two} transparent />
      </mesh>

      {segs.map((_, i) => (
        <mesh key={i} ref={(m) => (route.current[i] = m)} visible={false}>
          <boxGeometry args={[0.07, 1, 0.07]} />
          <meshStandardMaterial color="#1A73E8" emissive="#4285F4" emissiveIntensity={0.9} />
        </mesh>
      ))}
      <mesh ref={dot} visible={false}>
        <sphereGeometry args={[0.08, 18, 14]} />
        <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export default function ConceptF({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[3.15, 2.85, 4.35]} target={[0, 0.15, 0]}>
      <Wire />
    </SceneCanvas>
  )
}
