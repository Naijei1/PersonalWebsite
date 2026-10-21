import { useMemo, type MutableRefObject, type Ref } from 'react'
import { CanvasTexture, Quaternion, Vector3, type Group, type Mesh } from 'three'

export const LOOP = 12
export const SCAN_END = 3.4
export const DRAW_END = 6.6
export const WALK_END = 11.2

export function beats(elapsed: number) {
  const t = elapsed % LOOP
  const scanning = t < SCAN_END
  const scan = scanning ? t / SCAN_END : 1
  const draw = t <= SCAN_END ? 0 : Math.min(1, (t - SCAN_END) / (DRAW_END - SCAN_END))
  const walk = t <= DRAW_END ? 0 : Math.min(1, (t - DRAW_END) / (WALK_END - DRAW_END))
  return { t, scanning, scan, draw, walk, sweep: scan * Math.PI * 2 }
}

const UP = new Vector3(0, 1, 0)

export type Seg = {
  from: Vector3
  to: Vector3
  len: number
  quat: Quaternion
  vertical: boolean
}

export function route(points: Vector3[]) {
  const segs: Seg[] = points.slice(1).map((to, i) => {
    const from = points[i]
    const dir = new Vector3().subVectors(to, from)
    const len = dir.length()
    if (len > 0) dir.multiplyScalar(1 / len)
    return {
      from,
      to,
      len,
      quat: new Quaternion().setFromUnitVectors(UP, len > 0 ? dir : UP),
      vertical: Math.abs(to.y - from.y) > 0.12,
    }
  })
  const total = segs.reduce((sum, s) => sum + s.len, 0)
  return { segs, total }
}

export function useRoute(points: Vector3[]) {
  return useMemo(() => route(points), [points])
}

export function poseAt(segs: Seg[], dist: number, out: Vector3) {
  let d = Math.max(0, dist)
  for (const s of segs) {
    if (d <= s.len || s === segs[segs.length - 1]) {
      const u = s.len === 0 ? 1 : Math.min(1, d / s.len)
      out.lerpVectors(s.from, s.to, u)
      return s
    }
    d -= s.len
  }
  out.copy(segs[segs.length - 1].to)
  return segs[segs.length - 1]
}

/** How far the drawn route has traveled. Drawing finishes before `walk` leaves 0. */
export function drawMeshes(meshes: (Mesh | null)[], segs: Seg[], shown: number) {
  let acc = 0
  const total = segs.reduce((sum, s) => sum + s.len, 0) || 1
  meshes.forEach((mesh, i) => {
    if (!mesh) return
    const s = segs[i]
    const start = acc / total
    acc += s.len
    const p = shown <= 0 ? 0 : Math.max(0, Math.min(1, (shown - start) / (s.len / total)))
    mesh.visible = p > 0.04
    mesh.scale.set(1, Math.max(0.001, s.len * p), 1)
    mesh.position.lerpVectors(s.from, s.to, p * 0.5)
    mesh.quaternion.copy(s.quat)
  })
}

export function plaque(text: string, ink: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const g = canvas.getContext('2d')
  if (!g) return null
  g.fillStyle = '#F8F9FA'
  g.fillRect(0, 0, 128, 128)
  g.fillStyle = ink
  g.font = '700 84px sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 64, 72)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

const SCREEN = (() => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 220
  const g = canvas.getContext('2d')
  if (!g) return null
  g.fillStyle = '#E8F0FE'
  g.fillRect(0, 0, 128, 220)
  g.strokeStyle = '#1A73E8'
  g.lineWidth = 8
  g.strokeRect(30, 36, 68, 68)
  g.beginPath()
  g.moveTo(64, 70)
  g.lineTo(90, 44)
  g.stroke()
  g.fillStyle = '#1A73E8'
  g.font = '700 32px sans-serif'
  g.textAlign = 'center'
  g.fillText('Scan', 64, 150)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
})()

/** Face-up enough that a yaw still shows the screen to a camera above and in front. */
export function Phone({
  phoneRef,
  scale = 1,
  position,
}: {
  phoneRef: Ref<Group>
  scale?: number
  position?: [number, number, number]
}) {
  return (
    <group ref={phoneRef} scale={scale} position={position}>
      <mesh>
        <boxGeometry args={[0.62, 1.08, 0.07]} />
        <meshStandardMaterial color="#202124" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.04]}>
        <planeGeometry args={[0.5, 0.9]} />
        <meshStandardMaterial map={SCREEN} emissive="#8AB4F8" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.16, 0.38, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.02, 12]} />
        <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

export function RouteMeshes({
  segs,
  meshes,
  radius = 0.045,
}: {
  segs: Seg[]
  meshes: MutableRefObject<(Mesh | null)[]>
  radius?: number
}) {
  return (
    <>
      {segs.map((s, i) => (
        <mesh key={i} ref={(m) => (meshes.current[i] = m)} quaternion={s.quat}>
          <boxGeometry args={[radius * 2, 1, radius * 2]} />
          <meshStandardMaterial color="#1A73E8" emissive="#4285F4" emissiveIntensity={0.65} />
        </mesh>
      ))}
    </>
  )
}
