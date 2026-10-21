import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  CanvasTexture,
  Quaternion,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import SceneCanvas from './SceneCanvas'

const LOOP = 14
const SCAN_END = 3.8
const CONNECT_END = 5.8
const DRAW_END = 8
const WALK_START = 8.75
const WALK_END = 13.15
const WALL_H = 0.55
const WALL_T = 0.06
const UPPER_Y = 1.75
const FLOOR_Y = 0.045
const UPPER_FLOOR_Y = UPPER_Y + FLOOR_Y
const ELEV = { x: -1.3, z: 0.02 }

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
  new Vector3(-1.75, FLOOR_Y, 0.62),
  new Vector3(-1.3, FLOOR_Y, 0.28),
  new Vector3(ELEV.x, FLOOR_Y, ELEV.z),
  new Vector3(ELEV.x, UPPER_FLOOR_Y, ELEV.z),
  new Vector3(-1.3, UPPER_FLOOR_Y, -0.72),
  new Vector3(-0.42, UPPER_FLOOR_Y, -1.5),
]

const UP = new Vector3(0, 1, 0)
const SEGMENTS = PATH.slice(1).map((to, i) => {
  const from = PATH[i]
  const dir = new Vector3().subVectors(to, from).normalize()
  return {
    from,
    to,
    len: from.distanceTo(to),
    quat: new Quaternion().setFromUnitVectors(UP, dir),
    vertical: Math.abs(dir.y) > 0.5,
  }
})
const PATH_LEN = SEGMENTS.reduce((sum, s) => sum + s.len, 0)
const VERTICAL = SEGMENTS.findIndex((s) => s.vertical)
const BEFORE_LIFT = SEGMENTS.slice(0, VERTICAL).reduce((sum, s) => sum + s.len, 0)
const LIFT_LEN = SEGMENTS[VERTICAL].len
const ARROWS = 5

function pointAt(dist: number, out: Vector3) {
  let d = Math.max(0, Math.min(PATH_LEN, dist))
  for (const s of SEGMENTS) {
    if (d <= s.len) {
      out.lerpVectors(s.from, s.to, s.len === 0 ? 0 : d / s.len)
      return s
    }
    d -= s.len
  }
  out.copy(PATH[PATH.length - 1])
  return SEGMENTS[SEGMENTS.length - 1]
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

function labelTexture(text: string, ink: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const g = canvas.getContext('2d')
  if (!g) return null
  g.fillStyle = '#F8F9FA'
  g.fillRect(0, 0, 128, 128)
  g.fillStyle = ink
  g.font = '700 78px sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 64, 70)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function screenTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 220
  const g = canvas.getContext('2d')
  if (!g) return null
  g.fillStyle = '#E8F0FE'
  g.fillRect(0, 0, 128, 220)
  g.strokeStyle = '#1A73E8'
  g.lineWidth = 7
  g.strokeRect(28, 40, 72, 72)
  g.beginPath()
  g.moveTo(64, 76)
  g.lineTo(92, 48)
  g.stroke()
  g.fillStyle = '#1A73E8'
  g.font = '700 32px sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('Scan', 64, 168)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

const FLOOR_TEX = [labelTexture('1', '#1A73E8'), labelTexture('2', '#E37400')]
const SCREEN_TEX = screenTexture()

function Building() {
  const walls = useRef<(Mesh | null)[]>([])
  const sweep = useRef<Mesh>(null)
  const phone = useRef<Group>(null)
  const upper = useRef<Group>(null)
  const link = useRef<Mesh>(null)
  const posts = useRef<(Mesh | null)[]>([])
  const cabin = useRef<Mesh>(null)
  const path = useRef<(Mesh | null)[]>([])
  const arrows = useRef<(Group | null)[]>([])
  const walker = useRef<Mesh>(null)
  const door = useRef<MeshStandardMaterial>(null)
  const floorLights = useRef<(MeshStandardMaterial | null)[]>([])
  const floorDots = useRef<(Mesh | null)[]>([])
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
      // Orbit across the room with the sweep. The screen stays on local +Z, pitched toward the camera.
      // Sit above the walls, on the camera side of the room, and rock with the sweep.
      // A full yaw turns the screen edge-on; a swing of about ±40° keeps "Scan" readable.
      phone.current.position.set(
        room.x + Math.sin(sweepAngle) * 0.28,
        1.38,
        room.z + 0.62,
      )
      phone.current.scale.setScalar(2.05)
      phone.current.rotation.order = 'YXZ'
      phone.current.rotation.y = Math.sin(sweepAngle) * 0.7
      phone.current.rotation.x = -0.58
      phone.current.rotation.z = Math.sin(sweepAngle * 2) * 0.06
    }

    const connect = clamp01((t - SCAN_END) / (CONNECT_END - SCAN_END))
    const e = 1 - (1 - connect) ** 3
    if (upper.current) {
      upper.current.position.y = UPPER_Y + (1 - e) * 0.8
      upper.current.scale.setScalar(Math.max(0.001, e))
    }
    if (link.current) link.current.scale.setScalar(Math.max(0.001, clamp01(connect * 2)))
    posts.current.forEach((post) => {
      if (!post) return
      post.scale.y = Math.max(0.001, e)
      post.position.y = (UPPER_Y * post.scale.y) / 2
    })

    const draw = t >= CONNECT_END ? clamp01((t - CONNECT_END) / (DRAW_END - CONNECT_END)) : 0
    const shown = draw
    let acc = 0
    path.current.forEach((mesh, i) => {
      if (!mesh) return
      const s = SEGMENTS[i]
      const start = acc / PATH_LEN
      acc += s.len
      const p = t < CONNECT_END ? 0 : clamp01((shown - start) / (s.len / PATH_LEN))
      const len = Math.max(0.001, s.len * p)
      mesh.visible = p > 0.03 && shown > 0
      mesh.scale.set(1, len, 1)
      mesh.position.lerpVectors(s.from, s.to, p * 0.5)
      mesh.quaternion.copy(s.quat)
    })

    const walking = t >= WALK_START
    const walk = walking ? clamp01((t - WALK_START) / (WALK_END - WALK_START)) : 0
    const along = walk * PATH_LEN
    arrows.current.forEach((arrow, i) => {
      if (!arrow) return
      const base = ((i + 0.5) / ARROWS) * PATH_LEN
      const moved = walking ? (t - WALK_START) * 0.28 : 0
      const seg = pointAt((base + moved) % PATH_LEN, arrow.position)
      arrow.quaternion.copy(seg.quat)
      arrow.position.y += 0.09
      const appear = clamp01((draw * PATH_LEN - base) / 0.3)
      arrow.visible = appear > 0.05
      arrow.scale.setScalar(Math.max(0.001, appear))
    })

    const lifted = clamp01((along - BEFORE_LIFT) / LIFT_LEN)
    const cabinY = FLOOR_Y + (UPPER_FLOOR_Y - FLOOR_Y) * (along >= BEFORE_LIFT ? lifted : 0)
    if (cabin.current) {
      cabin.current.visible = e > 0.4
      cabin.current.position.y = cabinY + 0.03
      cabin.current.scale.setScalar(Math.max(0.001, Math.min(1, e * 1.4)))
    }
    floorLights.current.forEach((mat, i) => {
      if (!mat) return
      const on = i === 0 ? cabinY < UPPER_Y * 0.45 : cabinY >= UPPER_Y * 0.45
      mat.emissiveIntensity = on ? 0.9 : 0.08
    })
    floorDots.current.forEach((dot) => {
      if (dot) dot.visible = e > 0.45
    })

    if (walker.current) {
      walker.current.visible = walking && walk > 0.01 && t < LOOP
      const seg = pointAt(along, tmp)
      const bob = seg.vertical ? 0 : Math.abs(Math.sin(t * 8)) * 0.035
      walker.current.position.set(tmp.x, tmp.y + 0.16 + bob, tmp.z)
    }
    if (door.current) {
      const near = walk > 0.78
      door.current.emissiveIntensity = near ? 0.45 + Math.sin(t * 6) * 0.25 : 0.08
    }
  })

  return (
    <group position={[0, -1.05, 0.15]}>
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

      <mesh position={[-2.42, 0.42, 0.85]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[0.34, 0.34]} />
        <meshStandardMaterial map={FLOOR_TEX[0]} />
      </mesh>

      <mesh ref={sweep} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.55, 28, 0, 0.7]} />
        <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
      <group ref={phone}>
        <mesh>
          <boxGeometry args={[0.34, 0.56, 0.05]} />
          <meshStandardMaterial color="#202124" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.01, 0.028]}>
          <planeGeometry args={[0.26, 0.44]} />
          <meshStandardMaterial map={SCREEN_TEX} emissive="#8AB4F8" emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0.09, 0.18, -0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.014, 12]} />
          <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.85} />
        </mesh>
      </group>

      <group ref={upper} position={[-1.3, UPPER_Y, -1.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshStandardMaterial color="#FBBC04" transparent opacity={0.22} />
        </mesh>
        {[
          [0, -1.2, 2.4, WALL_T],
          [-0.78, 1.2, 0.84, WALL_T],
          [0.78, 1.2, 0.84, WALL_T],
          [-1.2, 0, WALL_T, 2.4],
          [1.2, 0, WALL_T, 2.4],
        ].map(([x, z, w, d], i) => (
          <mesh key={i} position={[x, 0.14, z]}>
            <boxGeometry args={[w, 0.28, d]} />
            <meshStandardMaterial color="#F1F3F4" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[1.24, 0.26, 0]}>
          <boxGeometry args={[0.05, 0.42, 0.38]} />
          <meshStandardMaterial ref={door} color="#34A853" emissive="#34A853" emissiveIntensity={0.08} />
        </mesh>
        <mesh position={[-1.22, 0.46, 0.95]} rotation={[-0.5, 0, 0]}>
          <planeGeometry args={[0.34, 0.34]} />
          <meshStandardMaterial map={FLOOR_TEX[1]} />
        </mesh>
      </group>

      <mesh ref={link} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.46, 0.02, 0.46]} />
        <meshStandardMaterial color="#FBBC04" emissive="#FBBC04" emissiveIntensity={0.45} />
      </mesh>

      {[-0.22, 0.22].map((x, i) => (
        <mesh key={i} ref={(m) => (posts.current[i] = m)} position={[ELEV.x + x, 0, ELEV.z]} scale={[1, 0.001, 1]}>
          <boxGeometry args={[0.035, UPPER_Y, 0.035]} />
          <meshStandardMaterial color="#5F6368" />
        </mesh>
      ))}
      <mesh ref={cabin} position={[ELEV.x, FLOOR_Y, ELEV.z]}>
        <boxGeometry args={[0.34, 0.05, 0.34]} />
        <meshStandardMaterial color="#F8F9FA" roughness={0.45} />
      </mesh>
      {[0.2, UPPER_Y - 0.15].map((y, i) => (
        <mesh key={i} ref={(m) => (floorDots.current[i] = m)} position={[ELEV.x + 0.24, y, ELEV.z]}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshStandardMaterial
            ref={(m) => (floorLights.current[i] = m)}
            color={i === 0 ? '#4285F4' : '#FBBC04'}
            emissive={i === 0 ? '#4285F4' : '#FBBC04'}
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}

      {SEGMENTS.map((s, i) => (
        <mesh key={i} ref={(m) => (path.current[i] = m)} quaternion={s.quat}>
          <boxGeometry args={[s.vertical ? 0.05 : 0.07, 1, s.vertical ? 0.05 : 0.07]} />
          <meshStandardMaterial color="#1A73E8" emissive="#4285F4" emissiveIntensity={0.55} />
        </mesh>
      ))}
      {Array.from({ length: ARROWS }, (_, i) => (
        <group key={i} ref={(g) => (arrows.current[i] = g)}>
          <mesh>
            <coneGeometry args={[0.07, 0.16, 3]} />
            <meshStandardMaterial color="#1A73E8" emissive="#4285F4" emissiveIntensity={0.65} />
          </mesh>
        </group>
      ))}
      <mesh ref={walker}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color="#EA4335" roughness={0.4} />
      </mesh>
    </group>
  )
}

export default function GnarlyScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.55, 4.7, 6.6]} target={[0.05, 0.05, -0.35]}>
      <Building />
    </SceneCanvas>
  )
}
