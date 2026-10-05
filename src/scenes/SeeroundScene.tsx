import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh, MeshStandardMaterial } from 'three'
import SceneCanvas from './SceneCanvas'

const RINGS = 3
const PERIOD = 3
const MAX_R = 4.2
const OBSTACLES = [
  { x: 1.8, z: -1.2, h: 1.1, color: '#4285F4', shape: 'box' },
  { x: -2.2, z: -0.6, h: 0.7, color: '#EA4335', shape: 'cyl' },
  { x: -0.6, z: -2.9, h: 1.5, color: '#34A853', shape: 'box' },
  { x: 2.6, z: 1.5, h: 0.6, color: '#FBBC04', shape: 'cyl' },
  { x: -2.4, z: 2.0, h: 0.9, color: '#4285F4', shape: 'box' },
] as const

function Wearable() {
  const rings = useRef<(Mesh | null)[]>([])
  const obstacles = useRef<(Mesh | null)[]>([])
  const notes = useRef<(Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const radii: number[] = []

    rings.current.forEach((ring, i) => {
      if (!ring) return
      const p = ((t + (i * PERIOD) / RINGS) % PERIOD) / PERIOD
      const r = 0.7 + p * MAX_R
      radii.push(r)
      ring.scale.set(r, r, 1)
      ;(ring.material as MeshStandardMaterial).opacity = (1 - p) * 0.8
    })

    OBSTACLES.forEach((o, i) => {
      const dist = Math.hypot(o.x, o.z)
      const hit = Math.max(0, ...radii.map((r) => 1 - Math.abs(r - dist) / 0.45))
      const mesh = obstacles.current[i]
      if (mesh) (mesh.material as MeshStandardMaterial).emissiveIntensity = hit * 0.8
      const note = notes.current[i]
      if (note) {
        note.position.y = o.h + 0.35 + hit * 0.35
        note.scale.setScalar(Math.max(0.001, hit))
      }
    })
  })

  return (
    <group position={[0, -0.8, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[4.8, 64]} />
        <meshStandardMaterial color="#FBBC04" transparent opacity={0.08} />
      </mesh>
      {Array.from({ length: RINGS }, (_, i) => (
        <mesh key={i} ref={(m) => (rings.current[i] = m)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.97, 1, 96]} />
          <meshStandardMaterial color="#FBBC04" emissive="#FBBC04" emissiveIntensity={0.6} transparent />
        </mesh>
      ))}
      <group position={[0, 0.9, 0]}>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.32, 0.55, 0.9, 32]} />
          <meshStandardMaterial color="#DADCE0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.5, 40, 32]} />
          <meshStandardMaterial color="#F1F3F4" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.51, 0.06, 16, 64]} />
          <meshStandardMaterial color="#202124" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.42, 0.55]}>
          <boxGeometry args={[0.32, 0.16, 0.12]} />
          <meshStandardMaterial color="#202124" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.42, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
          <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {OBSTACLES.map((o, i) => (
        <group key={i} position={[o.x, 0, o.z]}>
          <mesh ref={(m) => (obstacles.current[i] = m)} position={[0, o.h / 2, 0]}>
            {o.shape === 'box' ? (
              <boxGeometry args={[0.6, o.h, 0.6]} />
            ) : (
              <cylinderGeometry args={[0.32, 0.32, o.h, 32]} />
            )}
            <meshStandardMaterial color={o.color} emissive={o.color} emissiveIntensity={0} roughness={0.45} />
          </mesh>
          <mesh ref={(m) => (notes.current[i] = m)} position={[0, o.h + 0.35, 0]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={o.color} emissive={o.color} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function SeeroundScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0, 4.6, 7]} target={[0, -0.4, 0]}>
      <Wearable />
    </SceneCanvas>
  )
}
