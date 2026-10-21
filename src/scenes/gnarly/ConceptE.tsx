import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Mesh, type MeshStandardMaterial } from 'three'
import SceneCanvas from '../SceneCanvas'
import { NUMERAL, phase, placeRoute, pointAt, segments } from './motion'

type Wall = { x: number; z: number; w: number; d: number; floor: 0 | 1; dist: number }

const FLOORS = [
  { y: 0, z: 0.55, w: 2.35, d: 1.4 },
  { y: 1.55, z: -0.85, w: 2.35, d: 1.4 },
]

function wallsFor(floor: 0 | 1, origin: [number, number]): Wall[] {
  const { z, w, d } = FLOORS[floor]
  const hw = w / 2
  const hd = d / 2
  const bars: Omit<Wall, 'floor' | 'dist'>[] = [
    { x: 0, z: z - hd, w, d: 0.05 },
    { x: 0, z: z + hd, w, d: 0.05 },
    { x: -hw, z, w: 0.05, d },
    { x: hw, z, w: 0.05, d },
  ]
  return bars.map((b) => ({
    ...b,
    floor,
    dist: Math.hypot(b.x - origin[0], b.z - origin[1]),
  }))
}

const WALLS = [...wallsFor(0, [0.35, 0.55]), ...wallsFor(1, [-1.05, -0.85])]

const POINTS: [number, number, number][] = [
  [0.35, 0.16, 0.55],
  [-1.05, 0.16, 0.55],
  [-1.05, 1.7, -0.85],
  [0.85, 1.7, -0.85],
]

function PinMap() {
  const segs = useMemo(() => segments(POINTS), [])
  const route = useRef<(Mesh | null)[]>([])
  const grown = useRef<(Mesh | null)[]>([])
  const rings = useRef<(Mesh | null)[]>([])
  const pin = useRef<Mesh>(null)
  const cabin = useRef<Mesh>(null)
  const tmp = useMemo(() => new Vector3(), [])

  useFrame(({ clock }) => {
    const { scan, draw, walk } = phase(clock.elapsedTime)
    placeRoute(route.current, segs, draw)

    grown.current.forEach((mesh, i) => {
      if (!mesh) return
      const wall = WALLS[i]
      const local = wall.floor === 0 ? scan / 0.62 : (scan - 0.4) / 0.6
      const reach = Math.max(0, Math.min(1, local * 1.7 - wall.dist * 0.35))
      mesh.scale.y = Math.max(0.001, reach)
      mesh.position.y = FLOORS[wall.floor].y + (0.22 * mesh.scale.y) / 2
    })

    rings.current.forEach((ring, i) => {
      if (!ring) return
      const p = (scan + i * 0.45) % 1
      ring.visible = scan < 1
      const s = 0.2 + p * 1.45
      ring.scale.set(s, s, 1)
      ring.position.y = 0.03
      ;(ring.material as MeshStandardMaterial).opacity = (1 - p) * 0.7
    })

    if (pin.current) {
      if (walk > 0.02) pointAt(segs, walk, tmp)
      else tmp.set(POINTS[0][0], POINTS[0][1], POINTS[0][2])
      pin.current.position.copy(tmp)
    }
    if (cabin.current) {
      const riding = walk > 0.02 && tmp.y > 0.3 && tmp.y < 1.55 && tmp.x < -0.7
      cabin.current.position.y = riding ? tmp.y : walk > 0.7 ? 1.7 : 0.1
    }
  })

  return (
    <group position={[0, -0.7, 0.05]}>
      {FLOORS.map((f, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, f.y, f.z]}>
          <planeGeometry args={[f.w, f.d]} />
          <meshStandardMaterial color={i === 0 ? '#4285F4' : '#FBBC04'} transparent opacity={0.08} />
        </mesh>
      ))}
      {WALLS.map((w, i) => (
        <mesh key={i} ref={(m) => (grown.current[i] = m)} position={[w.x, FLOORS[w.floor].y, w.z]} scale={[1, 0.001, 1]}>
          <boxGeometry args={[w.w, 0.22, w.d]} />
          <meshStandardMaterial color="#F1F3F4" roughness={0.65} />
        </mesh>
      ))}

      <mesh position={[-1.05, 0.78, -0.15]}>
        <boxGeometry args={[0.04, 1.55, 0.04]} />
        <meshStandardMaterial color="#9AA0A6" />
      </mesh>
      <mesh ref={cabin} position={[-1.05, 0.1, -0.15]}>
        <boxGeometry args={[0.18, 0.08, 0.18]} />
        <meshStandardMaterial color="#F8F9FA" />
      </mesh>
      <mesh position={[1.1, 1.82, -0.85]}>
        <boxGeometry args={[0.07, 0.26, 0.32]} />
        <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.4} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.85, 0.02, 0.15]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial map={NUMERAL.one} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.85, 1.57, -1.25]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial map={NUMERAL.two} transparent />
      </mesh>

      {[0, 1].map((i) => (
        <mesh key={i} ref={(m) => (rings.current[i] = m)} position={[0.35, 0.04, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1, 64]} />
          <meshStandardMaterial color="#8AB4F8" emissive="#4285F4" emissiveIntensity={0.55} transparent opacity={0.55} />
        </mesh>
      ))}

      {segs.map((_, i) => (
        <mesh key={i} ref={(m) => (route.current[i] = m)} visible={false}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial color="#1A73E8" emissive="#4285F4" emissiveIntensity={0.8} />
        </mesh>
      ))}
      <mesh ref={pin}>
        <sphereGeometry args={[0.1, 20, 16]} />
        <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

export default function ConceptE({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.15, 4.15, 6.15]} target={[0, 0.55, -0.1]}>
      <PinMap />
    </SceneCanvas>
  )
}
