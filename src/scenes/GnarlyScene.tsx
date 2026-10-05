import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Group, type Mesh, type MeshStandardMaterial } from 'three'
import SceneCanvas from './SceneCanvas'

const LOOP = 12
const SCAN_END = 4
const CONNECT_END = 6.5
const WALK_END = 11.2
const WALL_H = 0.55
const WALL_T = 0.06
const UPPER_Y = 1.9
const UPPER_Z = -1.5

type Wall = { room: number; x: number; z: number; w: number; d: number; angle: number }

const ROOMS = [
  { x: -1.3, z: 0, y: 0 },
  { x: 1.3, z: 0, y: 0 },
]

/** Walls of a 2.4 × 2.4 room; `gap` leaves a doorway in the east (+x) or west (−x) wall. */
function roomWalls(room: number, gapSide: 'east' | 'west'): Wall[] {
  const { x: cx, z: cz } = ROOMS[room]
  const h = 1.2
  const walls: Omit<Wall, 'angle'>[] = [
    { room, x: cx, z: cz - h, w: 2.4, d: WALL_T },
    { room, x: cx, z: cz + h, w: 2.4, d: WALL_T },
  ]
  const solid = gapSide === 'east' ? -1 : 1
  walls.push({ room, x: cx + solid * h, z: cz, w: WALL_T, d: 2.4 })
  for (const s of [-1, 1]) walls.push({ room, x: cx - solid * h, z: cz + s * 0.75, w: WALL_T, d: 0.9 })
  return walls.map((w) => ({ ...w, angle: (Math.atan2(w.z - cz, w.x - cx) + Math.PI * 2) % (Math.PI * 2) }))
}

const WALLS = [...roomWalls(0, 'east'), ...roomWalls(1, 'west')]

const PATH = [
  new Vector3(-1.9, 0.04, 0.7),
  new Vector3(-0.7, 0.04, 0),
  new Vector3(0.7, 0.04, 0),
  new Vector3(2.2, 0.04, 0),
]
const SEGMENTS = PATH.slice(1).map((p, i) => ({ from: PATH[i], to: p, len: p.distanceTo(PATH[i]) }))
const PATH_LEN = SEGMENTS.reduce((sum, s) => sum + s.len, 0)
const ARROWS = 9

function pointAt(dist: number, out: Vector3) {
  let d = Math.max(0, Math.min(PATH_LEN, dist))
  for (const s of SEGMENTS) {
    if (d <= s.len) {
      out.lerpVectors(s.from, s.to, d / s.len)
      return Math.atan2(s.to.x - s.from.x, s.to.z - s.from.z)
    }
    d -= s.len
  }
  out.copy(PATH[PATH.length - 1])
  return 0
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

function Building() {
  const walls = useRef<(Mesh | null)[]>([])
  const sweep = useRef<Mesh>(null)
  const phone = useRef<Group>(null)
  const upper = useRef<Group>(null)
  const links = useRef<(Mesh | null)[]>([])
  const arrows = useRef<(Group | null)[]>([])
  const walker = useRef<Mesh>(null)
  const door = useRef<Mesh>(null)
  const tmp = useMemo(() => new Vector3(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime % LOOP
    const scanRoom = t < SCAN_END / 2 ? 0 : 1
    const scanP = clamp01((t - scanRoom * (SCAN_END / 2)) / (SCAN_END / 2))
    const scanning = t < SCAN_END
    const sweepAngle = scanP * Math.PI * 2

    walls.current.forEach((mesh, i) => {
      if (!mesh) return
      const w = WALLS[i]
      const built = w.room < scanRoom || !scanning || (w.room === scanRoom && sweepAngle >= w.angle)
      const target = built ? 1 : 0.001
      mesh.scale.y += (target - mesh.scale.y) * 0.18
      mesh.position.y = (WALL_H * mesh.scale.y) / 2
    })

    if (sweep.current && phone.current) {
      const room = ROOMS[scanRoom]
      sweep.current.visible = scanning
      phone.current.visible = scanning
      sweep.current.position.set(room.x, 0.03, room.z)
      sweep.current.rotation.z = -sweepAngle
      phone.current.position.set(room.x, 0.5, room.z)
      phone.current.rotation.y = -sweepAngle + Math.PI / 2
    }

    const connect = clamp01((t - SCAN_END) / (CONNECT_END - SCAN_END))
    if (upper.current) {
      const e = 1 - (1 - connect) ** 3
      upper.current.position.y = UPPER_Y + (1 - e) * 0.8
      upper.current.scale.setScalar(Math.max(0.001, e))
    }
    links.current.forEach((link, i) => {
      if (!link) return
      const p = clamp01(connect * 2 - i * 0.6)
      link.scale.setScalar(Math.max(0.001, p))
    })

    const walk = clamp01((t - CONNECT_END) / (WALK_END - CONNECT_END))
    const walking = t >= CONNECT_END
    arrows.current.forEach((arrow, i) => {
      if (!arrow) return
      arrow.visible = walking
      const dist = ((i / ARROWS) * PATH_LEN + t * 0.9) % PATH_LEN
      arrow.rotation.y = pointAt(dist, arrow.position)
      arrow.position.y = 0.06
      const fade = Math.min(1, (walk * PATH_LEN - dist + 0.6) / 0.6)
      arrow.scale.setScalar(Math.max(0.001, fade))
    })
    if (walker.current) {
      walker.current.visible = walking
      pointAt(walk * PATH_LEN, tmp)
      walker.current.position.set(tmp.x, 0.22 + Math.abs(Math.sin(t * 7)) * 0.05, tmp.z)
    }
    if (door.current) {
      const mat = door.current.material as MeshStandardMaterial
      mat.emissiveIntensity = walking ? 0.4 + Math.sin(t * 6) * 0.3 + walk * 0.4 : 0.05
    }
  })

  return (
    <group position={[0, -1.0, 0.3]}>
      {ROOMS.map((r, i) => (
        <mesh key={i} position={[r.x, 0, r.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshStandardMaterial color="#4285F4" transparent opacity={0.12} />
        </mesh>
      ))}
      {WALLS.map((w, i) => (
        <mesh key={i} ref={(m) => (walls.current[i] = m)} position={[w.x, 0, w.z]} scale={[1, 0.001, 1]}>
          <boxGeometry args={[w.w, WALL_H, w.d]} />
          <meshStandardMaterial color="#F1F3F4" roughness={0.6} />
        </mesh>
      ))}

      <mesh ref={door} position={[2.47, 0.3, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.5]} />
        <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.05} />
      </mesh>

      <mesh ref={sweep} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 32, 0, 0.7]} />
        <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
      <group ref={phone}>
        <mesh>
          <boxGeometry args={[0.2, 0.38, 0.03]} />
          <meshStandardMaterial color="#202124" roughness={0.3} />
        </mesh>
        <mesh position={[0.05, 0.12, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.9} />
        </mesh>
      </group>

      <group ref={upper} position={[-1.3, UPPER_Y, UPPER_Z]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshStandardMaterial color="#FBBC04" transparent opacity={0.22} />
        </mesh>
        {[
          [0, -1.2, 2.4, WALL_T],
          [0, 1.2, 2.4, WALL_T],
          [-1.2, 0, WALL_T, 2.4],
          [1.2, 0, WALL_T, 2.4],
        ].map(([x, z, w, d], i) => (
          <mesh key={i} position={[x, 0.15, z]}>
            <boxGeometry args={[w, 0.3, d]} />
            <meshStandardMaterial color="#F1F3F4" roughness={0.6} />
          </mesh>
        ))}
      </group>

      <mesh ref={(m) => (links.current[0] = m)} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshStandardMaterial color="#FBBC04" emissive="#FBBC04" emissiveIntensity={0.5} />
      </mesh>
      <group position={[-2.3, 0, -1.0]}>
        <mesh ref={(m) => (links.current[1] = m)} position={[0, UPPER_Y / 2, 0]}>
          <cylinderGeometry args={[0.035, 0.035, UPPER_Y, 10]} />
          <meshStandardMaterial color="#FBBC04" emissive="#FBBC04" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {Array.from({ length: ARROWS }, (_, i) => (
        <group key={i} ref={(g) => (arrows.current[i] = g)}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.12, 0.26, 3]} />
            <meshStandardMaterial color="#1A73E8" emissive="#4285F4" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      <mesh ref={walker}>
        <sphereGeometry args={[0.12, 20, 16]} />
        <meshStandardMaterial color="#EA4335" roughness={0.4} />
      </mesh>
    </group>
  )
}

export default function GnarlyScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.6, 4.6, 6.4]} target={[0, -0.1, -0.3]}>
      <Building />
    </SceneCanvas>
  )
}
