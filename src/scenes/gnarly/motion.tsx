import { CanvasTexture, Quaternion, Vector3, type Mesh } from 'three'

export const LOOP = 12
export const SCAN_END = 3.2
export const DRAW_END = 6.8
export const WALK_END = 11.2

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function phase(elapsed: number) {
  const t = elapsed % LOOP
  return {
    t,
    scan: t < SCAN_END ? t / SCAN_END : 1,
    draw: t <= SCAN_END ? 0 : clamp01((t - SCAN_END) / (DRAW_END - SCAN_END)),
    walk: t <= DRAW_END ? 0 : clamp01((t - DRAW_END) / (WALK_END - DRAW_END)),
  }
}

export type Seg = { a: Vector3; b: Vector3; len: number; quat: Quaternion }

export function segments(points: [number, number, number][]): Seg[] {
  const dir = new Vector3()
  const up = new Vector3(0, 1, 0)
  const segs: Seg[] = []
  for (let i = 1; i < points.length; i++) {
    const a = new Vector3(...points[i - 1])
    const b = new Vector3(...points[i])
    const len = Math.max(0.001, a.distanceTo(b))
    dir.copy(b).sub(a).normalize()
    segs.push({ a, b, len, quat: new Quaternion().setFromUnitVectors(up, dir) })
  }
  return segs
}

export function placeRoute(meshes: (Mesh | null)[], segs: Seg[], draw: number) {
  const total = segs.reduce((n, s) => n + s.len, 0)
  let remain = clamp01(draw) * total
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]
    const mesh = meshes[i]
    if (!mesh) continue
    const p = Math.max(0, Math.min(1, remain / s.len))
    remain -= s.len
    mesh.visible = p > 0.03
    mesh.scale.y = Math.max(0.001, s.len * p)
    mesh.position.copy(s.a).lerp(s.b, p * 0.5)
    mesh.quaternion.copy(s.quat)
  }
}

const at = new Vector3()
export function pointAt(segs: Seg[], amount: number, out: Vector3) {
  const total = segs.reduce((n, s) => n + s.len, 0)
  let d = clamp01(amount) * total
  for (const s of segs) {
    if (d <= s.len) {
      out.lerpVectors(s.a, s.b, d / s.len)
      return
    }
    d -= s.len
  }
  out.copy(segs[segs.length - 1]?.b ?? at)
}

function numeral(text: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const g = canvas.getContext('2d')!
  g.fillStyle = color
  g.font = '700 92px sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 64, 72)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export const NUMERAL = {
  one: numeral('1', '#8AB4F8'),
  two: numeral('2', '#FDD663'),
}
