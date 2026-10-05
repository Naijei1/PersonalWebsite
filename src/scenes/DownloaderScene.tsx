import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import SceneCanvas from './SceneCanvas'

const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#4285F4', '#34A853']
const PEERS = COLORS.map((_, i) => {
  const a = (i / COLORS.length) * Math.PI * 2 + 0.3
  return new Vector3(Math.cos(a) * 3, Math.sin(i * 1.7) * 0.6, Math.sin(a) * 3)
})
const CLIENT = new Vector3(0, 0.2, 0)
const GRID = 4
const TILES = GRID * GRID
const CYCLE = 7
const CHUNKS = 12

const arc = (from: Vector3, to: Vector3, p: number, out: Vector3) => {
  out.lerpVectors(from, to, p)
  out.y += Math.sin(p * Math.PI) * 1.1
  return out
}

function Swarm() {
  const chunks = useRef<(Mesh | null)[]>([])
  const tiles = useRef<(Mesh | null)[]>([])
  const peers = useRef<(Mesh | null)[]>([])
  const ring = useRef<Group>(null)
  const tmp = useMemo(() => new Vector3(), [])

  const links = useMemo(() => {
    const pts = PEERS.flatMap((p) => [p, CLIENT])
    return new LineSegments(
      new BufferGeometry().setFromPoints(pts),
      new LineBasicMaterial({ color: '#9AA0A6', transparent: true, opacity: 0.45 }),
    )
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ring.current) ring.current.rotation.y = t * 0.12
    const progress = (t % CYCLE) / CYCLE
    const filled = Math.floor(progress * (TILES + 2))

    for (let i = 0; i < CHUNKS; i++) {
      const mesh = chunks.current[i]
      if (!mesh) continue
      const peer = i % PEERS.length
      const p = (t * 0.55 + i / CHUNKS) % 1
      arc(PEERS[peer], CLIENT, p, mesh.position)
      mesh.rotation.set(t * 2 + i, t * 1.5, 0)
      mesh.scale.setScalar(p > 0.92 ? (1 - p) * 12 : Math.min(1, p * 8))
    }

    tiles.current.forEach((tile, i) => {
      if (!tile) return
      const on = i < filled
      const mat = tile.material as MeshStandardMaterial
      mat.color.set(on ? COLORS[i % 4] : '#DADCE0')
      const pop = on && i === filled - 1 ? 1.25 : 1
      tile.scale.set(pop, pop, 1)
    })

    peers.current.forEach((peer, i) => {
      if (peer) peer.position.y = PEERS[i].y + Math.sin(t * 1.5 + i) * 0.08
    })
  })

  return (
    <group>
      <group ref={ring}>
        <primitive object={links} />
        {PEERS.map((pos, i) => (
          <group key={i}>
            <mesh ref={(m) => (peers.current[i] = m)} position={pos}>
              <icosahedronGeometry args={[0.36, 1]} />
              <meshStandardMaterial color={COLORS[i]} roughness={0.35} flatShading />
            </mesh>
          </group>
        ))}
        {Array.from({ length: CHUNKS }, (_, i) => (
          <mesh key={i} ref={(m) => (chunks.current[i] = m)} position={arc(PEERS[i % 6], CLIENT, 0, tmp.clone())}>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshStandardMaterial color={COLORS[i % PEERS.length]} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <group position={[CLIENT.x, CLIENT.y + 0.3, CLIENT.z]} rotation={[-0.25, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.25, 1.25, 0.12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
        {Array.from({ length: TILES }, (_, i) => (
          <mesh
            key={i}
            ref={(m) => (tiles.current[i] = m)}
            position={[((i % GRID) - 1.5) * 0.27, (1.5 - Math.floor(i / GRID)) * 0.27, 0.08]}
          >
            <boxGeometry args={[0.22, 0.22, 0.04]} />
            <meshStandardMaterial color="#DADCE0" roughness={0.4} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.8, 64]} />
        <meshStandardMaterial color="#4285F4" transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

export default function DownloaderScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0, 3.4, 8.4]} target={[0, 0, 0]}>
      <Swarm />
    </SceneCanvas>
  )
}
