import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Mesh, MeshStandardMaterial } from 'three'
import { playDrum } from '../lib/easterEggs'
import SceneCanvas from './SceneCanvas'

const LANES = ['#4285F4', '#EA4335', '#FBBC04', '#34A853']
const LANE_X = [-1.5, -0.5, 0.5, 1.5]
const KEYS = ['d', 'f', 'j', 'k']
const HIT_Z = 1.2
const FAR_Z = -9
const SPEED = 3
const LOOP = 8

const BEATS: [number, number][] = [
  [0, 0],
  [2, 0.5],
  [1, 1],
  [3, 1.5],
  [0, 2],
  [2, 2.25],
  [2, 2.5],
  [1, 3],
  [3, 3.5],
  [0, 4],
  [1, 4.5],
  [2, 5],
  [3, 5.25],
  [3, 5.5],
  [0, 6],
  [1, 6.5],
  [2, 6.75],
  [3, 7],
  [0, 7.5],
]

const mod = (a: number, n: number) => ((a % n) + n) % n

function Kit({ hits }: { hits: React.MutableRefObject<number[]> }) {
  const notes = useRef<(Mesh | null)[]>([])
  const pads = useRef<(Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const sinceHit = [9, 9, 9, 9]

    BEATS.forEach(([lane, time], i) => {
      const mesh = notes.current[i]
      if (!mesh) return
      const until = mod(time - t, LOOP)
      const z = HIT_Z - until * SPEED
      mesh.position.z = z
      mesh.visible = z > FAR_Z
      const s = Math.min(1, (z - FAR_Z) / 1.5)
      mesh.scale.setScalar(Math.max(0.001, s))
      sinceHit[lane] = Math.min(sinceHit[lane], mod(t - time, LOOP))
    })

    pads.current.forEach((pad, lane) => {
      if (!pad) return
      const since = Math.min(sinceHit[lane], performance.now() / 1000 - hits.current[lane])
      const pulse = Math.max(0, 1 - since / 0.3)
      pad.scale.set(1 + pulse * 0.25, 1 - pulse * 0.4, 1 + pulse * 0.25)
      const mat = pad.material as MeshStandardMaterial
      mat.emissiveIntensity = pulse * 0.9
    })
  })

  return (
    <group position={[0, -0.4, 0]}>
      {LANES.map((color, lane) => (
        <group key={color} position={[LANE_X[lane], 0, 0]}>
          <mesh position={[0, -0.06, (HIT_Z + FAR_Z) / 2]}>
            <boxGeometry args={[0.86, 0.06, HIT_Z - FAR_Z + 0.6]} />
            <meshStandardMaterial color={color} transparent opacity={0.16} />
          </mesh>
          <mesh ref={(m) => (pads.current[lane] = m)} position={[0, 0.06, HIT_Z]}>
            <cylinderGeometry args={[0.38, 0.4, 0.2, 40]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.02, HIT_Z]}>
            <cylinderGeometry args={[0.44, 0.44, 0.06, 40]} />
            <meshStandardMaterial color="#DADCE0" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {BEATS.map(([lane], i) => (
        <mesh key={i} ref={(m) => (notes.current[i] = m)} position={[LANE_X[lane], 0.12, FAR_Z]}>
          <boxGeometry args={[0.7, 0.14, 0.26]} />
          <meshStandardMaterial color={LANES[lane]} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, -0.03, HIT_Z]}>
        <boxGeometry args={[4.2, 0.02, 0.05]} />
        <meshStandardMaterial color="#5F6368" />
      </mesh>
      <Sticks />
    </group>
  )
}

function Sticks() {
  const left = useRef<Mesh>(null)
  const right = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * Math.PI * 2
    if (left.current) left.current.rotation.x = -0.9 + Math.max(0, Math.sin(t)) * 0.7
    if (right.current) right.current.rotation.x = -0.9 + Math.max(0, Math.sin(t + Math.PI)) * 0.7
  })
  return (
    <>
      {[left, right].map((ref, i) => (
        <group key={i} position={[i === 0 ? -1.15 : 1.15, 0.95, HIT_Z + 0.55]}>
          <mesh ref={ref} rotation={[-0.9, 0, i === 0 ? 0.25 : -0.25]}>
            <cylinderGeometry args={[0.035, 0.05, 1.3, 12]} />
            <meshStandardMaterial color="#34A853" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </>
  )
}

export default function GroovyScene({ active }: { active: boolean }) {
  const hits = useRef([-99, -99, -99, -99])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea')) return
      const lane = KEYS.indexOf(e.key.toLowerCase())
      if (lane < 0 || e.repeat) return
      hits.current[lane] = performance.now() / 1000
      playDrum(lane)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <SceneCanvas active={active} camera={[0, 3.6, 6.2]} target={[0, -0.9, -1.4]}>
      <Kit hits={hits} />
    </SceneCanvas>
  )
}
