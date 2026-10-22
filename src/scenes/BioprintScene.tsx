import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import SceneCanvas from './SceneCanvas'

const LAYERS = 6
const LAYER_H = 0.16
const PERIOD = 8
const RADII = [0.22, 0.38, 0.5, 0.5, 0.36, 0.2]
const TISSUE = ['#F6AEA9', '#EA4335', '#E3746B', '#C5221F', '#E3746B', '#F28B82']

const EDGES: [number, number, number, number, number, number][] = [
  [0, 0.7, -0.85, 2.3, 0.02, 0.02],
  [0, 0.7, 0.85, 2.3, 0.02, 0.02],
  [0, -0.7, -0.85, 2.3, 0.02, 0.02],
  [0, -0.7, 0.85, 2.3, 0.02, 0.02],
  [-1.15, 0, -0.85, 0.02, 1.4, 0.02],
  [1.15, 0, -0.85, 0.02, 1.4, 0.02],
  [-1.15, 0, 0.85, 0.02, 1.4, 0.02],
  [1.15, 0, 0.85, 0.02, 1.4, 0.02],
  [-1.15, 0.7, 0, 0.02, 0.02, 1.7],
  [1.15, 0.7, 0, 0.02, 0.02, 1.7],
  [-1.15, -0.7, 0, 0.02, 0.02, 1.7],
  [1.15, -0.7, 0, 0.02, 0.02, 1.7],
]

function Studio() {
  const layers = useRef<(Mesh | null)[]>([])
  const nozzle = useRef<Group>(null)
  const drop = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const u = (clock.elapsedTime % PERIOD) / PERIOD
    const build = u < 0.84 ? u / 0.84 : 1
    const fade = u > 0.84 ? 1 - (u - 0.84) / 0.16 : 1
    const exact = build * LAYERS
    const current = Math.min(LAYERS - 1, Math.floor(exact))

    layers.current.forEach((layer, i) => {
      if (!layer) return
      const grow = Math.max(0, Math.min(1, exact - i))
      layer.visible = grow > 0.04 && fade > 0.02
      const s = Math.max(0.001, grow * fade)
      layer.scale.set(s, s, s)
    })

    const angle = build * Math.PI * 8
    const r = RADII[current]
    const y = -0.42 + current * LAYER_H
    if (nozzle.current) {
      nozzle.current.visible = fade > 0.4
      nozzle.current.position.set(Math.cos(angle) * r, y + 0.38, Math.sin(angle) * r)
    }
    if (drop.current) {
      const fall = (build * 16) % 1
      drop.current.visible = u < 0.84
      drop.current.position.set(Math.cos(angle) * r, y + 0.28 - fall * 0.22, Math.sin(angle) * r)
    }
  })

  return (
    <group position={[0.35, 0.05, 0]}>
      {EDGES.map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#A142F4" emissive="#A142F4" emissiveIntensity={0.35} transparent opacity={0.45} />
        </mesh>
      ))}

      <group position={[-1.85, 0.15, 0.55]} rotation={[0.15, 0.55, 0]}>
        <mesh rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.62, 0.07, 8, 22]} />
          <meshStandardMaterial color="#3C4043" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0.28]}>
          <boxGeometry args={[1.15, 0.52, 0.22]} />
          <meshStandardMaterial color="#202124" roughness={0.4} />
        </mesh>
        {[-0.28, 0.28].map((x) => (
          <mesh key={x} position={[x, 0.02, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.06, 20]} />
            <meshStandardMaterial color="#8AB4F8" emissive="#4285F4" emissiveIntensity={0.55} roughness={0.2} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 24]} />
        <meshStandardMaterial color="#E8EAED" roughness={0.7} />
      </mesh>
      {RADII.map((radius, i) => (
        <mesh key={i} ref={(m) => (layers.current[i] = m)} position={[0, -0.42 + i * LAYER_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.045, 6, 18]} />
          <meshStandardMaterial color={TISSUE[i]} roughness={0.45} />
        </mesh>
      ))}
      <group ref={nozzle}>
        <mesh>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color="#5F6368" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.14, 0]}>
          <coneGeometry args={[0.05, 0.14, 8]} />
          <meshStandardMaterial color="#DADCE0" roughness={0.3} />
        </mesh>
      </group>
      <mesh ref={drop}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.45} />
      </mesh>
    </group>
  )
}

export default function BioprintScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[1.35, 1.55, 5.4]} target={[0.15, 0.05, 0]}>
      <Studio />
    </SceneCanvas>
  )
}
