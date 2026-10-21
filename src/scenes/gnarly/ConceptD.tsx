import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Mesh, type MeshStandardMaterial } from 'three'
import SceneCanvas from '../SceneCanvas'
import { NUMERAL, phase, placeRoute, pointAt, segments } from './motion'

/** Floor rectangles and the shaft that joins them. The route is the only moving line. */
const POINTS: [number, number, number][] = [
  [0.55, 0.05, 0.62],
  [-1.05, 0.05, 0.62],
  [-1.05, 1.72, -0.72],
  [0.95, 1.72, -0.72],
]

function Outline({ y, z, w, d }: { y: number; z: number; w: number; d: number }) {
  const hw = w / 2
  const hd = d / 2
  const t = 0.03
  const bars: [number, number, number, number, number, number][] = [
    [0, y, z - hd, w, t, t],
    [0, y, z + hd, w, t, t],
    [-hw, y, z, t, t, d],
    [hw, y, z, t, t, d],
  ]
  return bars.map((b, i) => (
    <mesh key={i} position={[b[0], b[1], b[2]]}>
      <boxGeometry args={[b[3], b[4], b[5]]} />
      <meshStandardMaterial color="#E8EAED" roughness={0.7} />
    </mesh>
  ))
}

function Wayfinding() {
  const segs = useMemo(() => segments(POINTS), [])
  const route = useRef<(Mesh | null)[]>([])
  const ring = useRef<Mesh>(null)
  const dot = useRef<Mesh>(null)
  const cabin = useRef<Mesh>(null)
  const tmp = useMemo(() => new Vector3(), [])

  useFrame(({ clock }) => {
    const { t, scan, draw, walk } = phase(clock.elapsedTime)
    placeRoute(route.current, segs, draw)

    if (ring.current) {
      ring.current.visible = t < 3.2
      const s = 0.25 + scan * 0.85
      ring.current.scale.set(s, s, 1)
      ;(ring.current.material as MeshStandardMaterial).opacity = (1 - scan) * 0.5
    }

    if (dot.current) {
      dot.current.visible = walk > 0.02
      pointAt(segs, walk, tmp)
      dot.current.position.copy(tmp)
    }
    if (cabin.current) {
      const riding = walk > 0.02 && tmp.y > 0.2 && tmp.y < 1.6 && tmp.x < -0.7
      const parked = walk > 0.72 ? 1.72 : 0.08
      cabin.current.position.y = riding ? tmp.y : parked
    }
  })

  return (
    <group position={[0.05, -0.85, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0.62]}>
        <planeGeometry args={[2.5, 1.45]} />
        <meshStandardMaterial color="#4285F4" transparent opacity={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.66, -0.72]}>
        <planeGeometry args={[2.5, 1.45]} />
        <meshStandardMaterial color="#FBBC04" transparent opacity={0.1} />
      </mesh>
      <Outline y={0} z={0.62} w={2.5} d={1.45} />
      <Outline y={1.67} z={-0.72} w={2.5} d={1.45} />

      <mesh position={[-1.05, 0.84, -0.05]}>
        <boxGeometry args={[0.045, 1.67, 0.045]} />
        <meshStandardMaterial color="#9AA0A6" />
      </mesh>
      <mesh ref={cabin} position={[-1.05, 0.08, -0.05]}>
        <boxGeometry args={[0.2, 0.1, 0.2]} />
        <meshStandardMaterial color="#F8F9FA" />
      </mesh>

      <mesh position={[1.18, 1.82, -0.72]}>
        <boxGeometry args={[0.08, 0.28, 0.36]} />
        <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.45} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.15, 0.03, 0.2]}>
        <planeGeometry args={[0.46, 0.46]} />
        <meshBasicMaterial map={NUMERAL.one} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.15, 1.7, -1.12]}>
        <planeGeometry args={[0.46, 0.46]} />
        <meshBasicMaterial map={NUMERAL.two} transparent />
      </mesh>

      <mesh ref={ring} position={[0.55, 0.04, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 1, 48]} />
        <meshStandardMaterial color="#8AB4F8" emissive="#4285F4" emissiveIntensity={0.4} transparent opacity={0.45} />
      </mesh>

      {segs.map((_, i) => (
        <mesh key={i} ref={(m) => (route.current[i] = m)} visible={false}>
          <boxGeometry args={[0.09, 1, 0.09]} />
          <meshStandardMaterial color="#1A73E8" emissive="#4285F4" emissiveIntensity={0.85} />
        </mesh>
      ))}
      <mesh ref={dot} visible={false}>
        <sphereGeometry args={[0.09, 18, 14]} />
        <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

export default function ConceptD({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.2, 3.55, 6.5]} target={[0.05, 0.45, -0.05]}>
      <Wayfinding />
    </SceneCanvas>
  )
}
