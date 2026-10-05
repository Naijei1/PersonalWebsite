import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import SceneCanvas from './SceneCanvas'

const LAYERS = 16
const LAYER_H = 0.13
const PERIOD = 9
const radiusAt = (i: number) => 0.55 + Math.sin(i * 0.35) * 0.22
const TISSUE = ['#F28B82', '#EA4335', '#F28B82', '#C5221F']

function Printer() {
  const layers = useRef<(Mesh | null)[]>([])
  const head = useRef<Group>(null)
  const gantry = useRef<Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const progress = Math.min(1, (t % PERIOD) / (PERIOD * 0.85))
    const exact = progress * LAYERS
    const current = Math.min(LAYERS - 1, Math.floor(exact))

    layers.current.forEach((layer, i) => {
      if (!layer) return
      const grow = Math.max(0, Math.min(1, exact - i))
      layer.visible = grow > 0
      layer.scale.setScalar(Math.max(0.001, 0.6 + grow * 0.4))
    })

    const angle = t * 5
    const r = radiusAt(current)
    const y = (current + 1) * LAYER_H + 0.35
    if (head.current) head.current.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r)
    if (gantry.current) gantry.current.position.y = y + 0.55
  })

  return (
    <group position={[0, -1.1, 0]}>
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[3.6, 0.12, 2.6]} />
        <meshStandardMaterial color="#E8EAED" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.08, 48]} />
        <meshStandardMaterial color="#AECBFA" transparent opacity={0.7} roughness={0.2} />
      </mesh>
      {Array.from({ length: LAYERS }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => (layers.current[i] = m)}
          position={[0, 0.1 + i * LAYER_H, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[radiusAt(i), 0.07, 12, 48]} />
          <meshStandardMaterial color={TISSUE[i % TISSUE.length]} roughness={0.55} />
        </mesh>
      ))}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.9]}>
          <boxGeometry args={[0.12, 3.2, 0.12]} />
          <meshStandardMaterial color="#A142F4" roughness={0.4} />
        </mesh>
      ))}
      <group ref={gantry} position={[0, 2.4, 0]}>
        <mesh position={[0, 0, -0.9]}>
          <boxGeometry args={[3.2, 0.12, 0.12]} />
          <meshStandardMaterial color="#A142F4" roughness={0.4} />
        </mesh>
      </group>
      <group ref={head}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.36, 0.42, 0.36]} />
          <meshStandardMaterial color="#5F6368" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.26, 20]} />
          <meshStandardMaterial color="#DADCE0" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.0, 0]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  )
}

export default function BioprintScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0, 2.6, 6.4]} target={[0, 0, 0]}>
      <Printer />
    </SceneCanvas>
  )
}
