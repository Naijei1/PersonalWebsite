import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh, MeshStandardMaterial } from 'three'
import SceneCanvas from './SceneCanvas'

const NODES = Array.from({ length: 6 }, (_, i) => ({
  x: ((i % 3) - 1) * 1.45,
  z: (Math.floor(i / 3) - 0.5) * 1.6,
}))
const JOB_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853']
const JOBS = 9
const DROP = 1.6
const RACK_H = 1.3
const LEDS = 4

function Cluster() {
  const jobs = useRef<(Mesh | null)[]>([])
  const bars = useRef<(Mesh | null)[]>([])
  const leds = useRef<(Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const load = NODES.map(() => 0)

    for (let i = 0; i < JOBS; i++) {
      const mesh = jobs.current[i]
      if (!mesh) continue
      const cycle = (t + i * (DROP * 0.7)) / (DROP * JOBS * 0.7)
      const round = Math.floor(cycle)
      const phase = (cycle - round) * JOBS * 0.7
      const node = NODES[(i * 4 + round * 5) % NODES.length]
      const p = Math.min(1, phase / DROP)
      const eased = 1 - (1 - p) ** 3
      mesh.position.set(node.x, 3.2 - eased * (3.2 - RACK_H - 0.12), node.z)
      const sink = Math.max(0, phase - DROP) / 1.2
      mesh.scale.setScalar(Math.max(0.001, 1 - sink))
      mesh.rotation.y = (1 - eased) * 3
      if (sink > 0 && sink < 1) load[(i * 4 + round * 5) % NODES.length] += 1 - sink
    }

    bars.current.forEach((bar, i) => {
      if (!bar) return
      const target = 0.25 + Math.min(1, load[i]) * 0.7 + Math.sin(t * 2 + i) * 0.05
      bar.scale.y += (target - bar.scale.y) * 0.08
      bar.position.y = (bar.scale.y * RACK_H * 0.8) / 2 + 0.12
    })

    const failing = Math.floor(t / 4) % NODES.length
    leds.current.forEach((led, k) => {
      if (!led) return
      const node = Math.floor(k / LEDS)
      const mat = led.material as MeshStandardMaterial
      const blink = Math.sin(t * 6 + k * 1.7) > 0
      const down = node === failing && t % 4 < 1.2
      mat.color.set(down ? '#EA4335' : '#34A853')
      mat.emissive.set(down ? '#EA4335' : '#34A853')
      mat.emissiveIntensity = down ? 1 : blink ? 0.8 : 0.15
    })
  })

  return (
    <group position={[0, -0.9, 0]}>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[5.2, 0.08, 4]} />
        <meshStandardMaterial color="#E8EAED" roughness={0.8} />
      </mesh>
      {NODES.map((n, i) => (
        <group key={i} position={[n.x, 0, n.z]}>
          <mesh position={[0, RACK_H / 2, 0]}>
            <boxGeometry args={[0.95, RACK_H, 0.95]} />
            <meshStandardMaterial color="#3C4043" roughness={0.45} />
          </mesh>
          {Array.from({ length: 3 }, (_, s) => (
            <mesh key={s} position={[0, 0.28 + s * 0.36, 0.48]}>
              <boxGeometry args={[0.82, 0.26, 0.02]} />
              <meshStandardMaterial color="#5F6368" roughness={0.5} />
            </mesh>
          ))}
          {Array.from({ length: LEDS }, (_, l) => (
            <mesh
              key={l}
              ref={(m) => (leds.current[i * LEDS + l] = m)}
              position={[-0.3 + l * 0.11, RACK_H - 0.14, 0.49]}
            >
              <boxGeometry args={[0.06, 0.06, 0.02]} />
              <meshStandardMaterial color="#34A853" emissive="#34A853" />
            </mesh>
          ))}
          <mesh ref={(m) => (bars.current[i] = m)} position={[0.52, 0.3, 0.3]}>
            <boxGeometry args={[0.06, RACK_H * 0.8, 0.06]} />
            <meshStandardMaterial color={JOB_COLORS[i % 4]} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: JOBS }, (_, i) => (
        <mesh key={i} ref={(m) => (jobs.current[i] = m)} position={[0, 3, 0]}>
          <boxGeometry args={[0.42, 0.22, 0.42]} />
          <meshStandardMaterial color={JOB_COLORS[i % 4]} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

export default function ClusterScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[4, 4.6, 7]} target={[0, -0.3, 0]}>
      <Cluster />
    </SceneCanvas>
  )
}
