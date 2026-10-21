import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Group, type Mesh } from 'three'
import SceneCanvas from '../SceneCanvas'
import { DRAW_END, RouteMeshes, beats, drawMeshes, plaque, poseAt, useRoute } from './kit'

const ONE = plaque('1', '#1A73E8')
const TWO = plaque('2', '#E37400')

/** Map drawn on the phone glass, in the phone's local space. */
const POINTS = [
  new Vector3(0.05, -0.3, 0.062),
  new Vector3(-0.08, -0.14, 0.062),
  new Vector3(-0.08, 0.16, 0.062),
  new Vector3(0.04, 0.28, 0.062),
  new Vector3(0.16, 0.28, 0.062),
]

function Floor({ y }: { y: number }) {
  const w = 0.38
  const h = 0.24
  const t = 0.016
  const bars: [number, number, number, number][] = [
    [0, h / 2, w, t],
    [0, -h / 2, w, t],
    [-w / 2, 0, t, h],
    [w / 2, 0, t, h],
  ]
  return (
    <group position={[0.05, y, 0.052]}>
      {bars.map(([x, yy, bw, bh], i) => (
        <mesh key={i} position={[x, yy, 0]}>
          <boxGeometry args={[bw, bh, 0.01]} />
          <meshStandardMaterial color="#DADCE0" />
        </mesh>
      ))}
    </group>
  )
}

function Map() {
  const root = useRef<Group>(null)
  const sweep = useRef<Mesh>(null)
  const lines = useRef<(Mesh | null)[]>([])
  const walker = useRef<Mesh>(null)
  const cabin = useRef<Mesh>(null)
  const { segs, total } = useRoute(POINTS)
  const tmp = useMemo(() => new Vector3(), [])
  const shaft = segs.find((s) => s.vertical) ?? segs[0]

  useFrame(({ clock }) => {
    const b = beats(clock.elapsedTime)
    const g = root.current
    if (g) {
      g.rotation.order = 'YXZ'
      g.rotation.x = -0.18
      g.rotation.y = Math.sin(b.sweep) * 0.42
      g.rotation.z = Math.sin(b.sweep * 2) * 0.04
    }
    if (sweep.current) {
      sweep.current.visible = b.t < DRAW_END
      sweep.current.rotation.z = -b.sweep
      sweep.current.scale.setScalar(0.65 + 0.4 * b.scan)
    }
    drawMeshes(lines.current, segs, b.draw)
    const riding = b.walk > 0.02 ? poseAt(segs, b.walk * total, tmp) : null
    if (walker.current) {
      walker.current.visible = b.walk > 0.02
      if (riding) walker.current.position.copy(tmp)
    }
    if (cabin.current) {
      cabin.current.position.y = riding?.vertical ? tmp.y : b.walk > 0.5 ? shaft.to.y : shaft.from.y
    }
  })

  return (
    <group ref={root} scale={2.6}>
      <mesh>
        <boxGeometry args={[0.64, 1.12, 0.07]} />
        <meshStandardMaterial color="#202124" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.038]}>
        <planeGeometry args={[0.54, 0.96]} />
        <meshStandardMaterial color="#F4F7FE" />
      </mesh>
      <Floor y={-0.22} />
      <Floor y={0.24} />
      <mesh position={[-0.08, 0.01, 0.056]}>
        <boxGeometry args={[0.06, 0.38, 0.012]} />
        <meshStandardMaterial color="#E8EAED" />
      </mesh>
      <mesh ref={cabin} position={[-0.08, -0.14, 0.068]}>
        <boxGeometry args={[0.042, 0.06, 0.016]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#8AB4F8" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.2, -0.22, 0.058]}>
        <planeGeometry args={[0.07, 0.07]} />
        <meshStandardMaterial map={ONE} />
      </mesh>
      <mesh position={[-0.2, 0.24, 0.058]}>
        <planeGeometry args={[0.07, 0.07]} />
        <meshStandardMaterial map={TWO} />
      </mesh>
      <mesh position={[0.18, 0.28, 0.064]}>
        <boxGeometry args={[0.028, 0.09, 0.016]} />
        <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.45} />
      </mesh>
      <mesh ref={sweep} position={[0.05, -0.22, 0.06]}>
        <circleGeometry args={[0.15, 22, 0, 0.9]} />
        <meshStandardMaterial
          color="#4285F4"
          emissive="#4285F4"
          emissiveIntensity={0.75}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </mesh>
      <RouteMeshes segs={segs} meshes={lines} radius={0.016} />
      <mesh ref={walker} visible={false}>
        <sphereGeometry args={[0.026, 14, 12]} />
        <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

/** A: the card is the phone. The scan, the route, and the elevator all happen on its screen. */
export default function ConceptA({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0, 0.02, 4.5]} target={[0, 0, 0]}>
      <Map />
    </SceneCanvas>
  )
}
