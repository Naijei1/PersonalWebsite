import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { playDrum, type DrumKind } from '../lib/easterEggs'
import SceneCanvas from './SceneCanvas'

type Vec3 = [number, number, number]

/** `pos` is the center of the playing surface; `tilt` turns the surface toward the player. */
type Piece = { kind: DrumKind; pos: Vec3; radius: number; depth: number; tilt: number; cymbal?: boolean; key?: string }

const KIT: Piece[] = [
  { kind: 'kick', pos: [0, 0.55, -0.35], radius: 0.55, depth: 0.55, tilt: Math.PI / 2, key: 'k' },
  { kind: 'snare', pos: [-0.85, 0.82, 0.45], radius: 0.3, depth: 0.18, tilt: 0.15, key: 'f' },
  { kind: 'hat', pos: [-1.55, 1.12, 0.15], radius: 0.3, depth: 0.03, tilt: 0.1, cymbal: true, key: 'd' },
  { kind: 'tom', pos: [0.15, 1.38, -0.5], radius: 0.24, depth: 0.22, tilt: 0.45, key: 'j' },
  { kind: 'floor', pos: [1.05, 0.72, 0.4], radius: 0.34, depth: 0.42, tilt: 0.08 },
  { kind: 'crash', pos: [1.35, 1.75, -0.55], radius: 0.42, depth: 0.03, tilt: 0.5, cymbal: true },
]
const INDEX = Object.fromEntries(KIT.map((p, i) => [p.kind, i])) as Record<DrumKind, number>

const LOOP = 4
const APPROACH = 1.1
const BURST = 0.4
/** Rings start this far (in world units) outside the rim, so big and small drums read the same. */
const START_GAP = 0.55
const RED = '#EA4335'
const FLASH = '#FBBC04'

const BEATS: [DrumKind, number][] = [
  ['kick', 0],
  ['hat', 0.5],
  ['snare', 1],
  ['hat', 1.5],
  ['kick', 2],
  ['tom', 2.5],
  ['snare', 3],
  ['floor', 3.25],
  ['crash', 3.5],
]

const mod = (a: number, n: number) => ((a % n) + n) % n

function Kit({ hits, onHit }: { hits: React.MutableRefObject<number[]>; onHit: (i: number) => void }) {
  const rings = useRef<(Mesh | null)[]>([])
  const pieces = useRef<(Group | null)[]>([])
  const heads = useRef<(Mesh | null)[]>([])
  const targets = useRef<(Mesh | null)[]>([])
  const bursts = useRef<(Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const now = performance.now() / 1000
    const since = KIT.map((_, i) => now - hits.current[i])
    const approach = KIT.map(() => 0)

    BEATS.forEach(([kind, time], b) => {
      const drum = INDEX[kind]
      const until = mod(time - t, LOOP)
      since[drum] = Math.min(since[drum], mod(t - time, LOOP))
      const ring = rings.current[b]
      if (!ring) return
      const showing = until < APPROACH
      ring.visible = showing
      if (!showing) return
      const p = until / APPROACH
      ring.scale.setScalar(1 + (START_GAP / KIT[drum].radius) * p)
      ;(ring.material as MeshStandardMaterial).opacity = 0.35 + (1 - p) * 0.65
      approach[drum] = Math.max(approach[drum], 1 - p)
    })

    KIT.forEach((piece, i) => {
      const s = since[i]
      const pulse = s < BURST ? 1 - s / BURST : 0
      const group = pieces.current[i]
      if (group) {
        const squash = piece.cymbal ? 0 : pulse * 0.12
        group.scale.set(1 + squash * 0.4, 1 - squash, 1 + squash * 0.4)
        if (piece.cymbal) group.rotation.z = Math.sin(s * 30) * 0.12 * pulse
      }
      const head = heads.current[i]
      if (head) (head.material as MeshStandardMaterial).emissiveIntensity = pulse * 1.2
      const target = targets.current[i]
      if (target) (target.material as MeshStandardMaterial).opacity = approach[i] * 0.45
      const burst = bursts.current[i]
      if (burst) {
        burst.visible = pulse > 0
        burst.scale.setScalar(1 + (1 - pulse) * 1.1)
        ;(burst.material as MeshStandardMaterial).opacity = pulse
      }
    })
  })

  const ringIndex = (drum: number) => BEATS.map(([kind], b) => (INDEX[kind] === drum ? b : -1)).filter((b) => b >= 0)

  return (
    <group position={[0, -0.75, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[2.6, 64]} />
        <meshStandardMaterial color="#EA4335" transparent opacity={0.07} />
      </mesh>

      {KIT.map((piece, i) => (
        <group key={piece.kind}>
          {piece.kind !== 'kick' && (
            <mesh position={[piece.pos[0], (piece.pos[1] - piece.depth) / 2, piece.pos[2]]}>
              <cylinderGeometry args={[0.025, 0.025, piece.pos[1] - piece.depth, 8]} />
              <meshStandardMaterial color="#9AA0A6" metalness={0.6} roughness={0.3} />
            </mesh>
          )}
          <group position={piece.pos} rotation={[piece.tilt, 0, 0]}>
            <group
              ref={(g) => (pieces.current[i] = g)}
              onPointerDown={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation()
                onHit(i)
              }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = '')}
            >
              {piece.cymbal ? (
                <>
                  <mesh position={[0, -0.02, 0]}>
                    <cylinderGeometry args={[0.05, piece.radius, 0.04, 40]} />
                    <meshStandardMaterial color="#D4A72C" metalness={0.7} roughness={0.3} />
                  </mesh>
                  {piece.kind === 'hat' && (
                    <mesh position={[0, -0.08, 0]} rotation={[Math.PI, 0, 0]}>
                      <cylinderGeometry args={[0.05, piece.radius, 0.04, 40]} />
                      <meshStandardMaterial color="#B8901F" metalness={0.7} roughness={0.3} />
                    </mesh>
                  )}
                </>
              ) : (
                <>
                  <mesh position={[0, -piece.depth / 2, 0]}>
                    <cylinderGeometry args={[piece.radius, piece.radius, piece.depth, 40]} />
                    <meshStandardMaterial color="#202124" roughness={0.35} metalness={0.2} />
                  </mesh>
                  <mesh position={[0, -0.01, 0]}>
                    <torusGeometry args={[piece.radius, 0.02, 8, 48]} />
                    <meshStandardMaterial color="#DADCE0" metalness={0.8} roughness={0.25} />
                  </mesh>
                </>
              )}
              <mesh ref={(m) => (heads.current[i] = m)} position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[piece.cymbal ? piece.radius * 0.35 : piece.radius * 0.97, 40]} />
                <meshStandardMaterial
                  color={piece.cymbal ? '#E8C55A' : '#F8F9FA'}
                  emissive={FLASH}
                  emissiveIntensity={0}
                  roughness={0.6}
                />
              </mesh>
            </group>

            <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <mesh ref={(m) => (targets.current[i] = m)}>
                <circleGeometry args={[piece.radius * 0.95, 40]} />
                <meshStandardMaterial color={RED} transparent opacity={0} depthWrite={false} />
              </mesh>
              {ringIndex(i).map((b) => (
                <mesh key={b} ref={(m) => (rings.current[b] = m)} visible={false}>
                  <ringGeometry args={[piece.radius * 0.94, piece.radius * 1.04, 48]} />
                  <meshStandardMaterial
                    color={RED}
                    emissive={RED}
                    emissiveIntensity={0.6}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
              ))}
              <mesh ref={(m) => (bursts.current[i] = m)} visible={false}>
                <ringGeometry args={[piece.radius * 1.0, piece.radius * 1.22, 48]} />
                <meshStandardMaterial
                  color={FLASH}
                  emissive={FLASH}
                  emissiveIntensity={1.5}
                  transparent
                  depthWrite={false}
                />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  )
}

export default function GroovyScene({ active }: { active: boolean }) {
  const hits = useRef(KIT.map(() => -99))

  const hit = (i: number) => {
    hits.current[i] = performance.now() / 1000
    playDrum(KIT[i].kind)
  }

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea') || e.repeat) return
      const i = KIT.findIndex((p) => p.key === e.key.toLowerCase())
      if (i >= 0) hit(i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <SceneCanvas active={active} camera={[0, 2.7, 4.8]} target={[0, 0.25, -0.1]}>
      <Kit hits={hits} onHit={hit} />
    </SceneCanvas>
  )
}
