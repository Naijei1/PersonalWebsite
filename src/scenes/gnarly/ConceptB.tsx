import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Group, type Mesh } from 'three'
import SceneCanvas from '../SceneCanvas'
import { Phone, RouteMeshes, beats, drawMeshes, plaque, poseAt, useRoute } from './kit'

const ONE = plaque('1', '#1A73E8')
const TWO = plaque('2', '#E37400')

const POINTS = [
  new Vector3(0.35, 0.12, 0.72),
  new Vector3(-0.15, 0.12, 0.2),
  new Vector3(-1.02, 0.12, 0.05),
  new Vector3(-1.02, 1.82, -0.08),
  new Vector3(-0.1, 1.82, -0.35),
  new Vector3(0.85, 1.82, -0.72),
]

function Slab({ y, z }: { y: number; z: number }) {
  return (
    <group position={[0.05, y, z]}>
      <mesh>
        <boxGeometry args={[2.35, 0.06, 1.85]} />
        <meshStandardMaterial color="#F8F9FA" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.16, -0.9]}>
        <boxGeometry args={[2.35, 0.28, 0.05]} />
        <meshStandardMaterial color="#E8EAED" />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0.14, 0]}>
          <boxGeometry args={[0.05, 0.24, 1.85]} />
          <meshStandardMaterial color="#E8EAED" />
        </mesh>
      ))}
    </group>
  )
}

function Story() {
  const phone = useRef<Group>(null)
  const sweep = useRef<Mesh>(null)
  const lines = useRef<(Mesh | null)[]>([])
  const walker = useRef<Mesh>(null)
  const cabin = useRef<Mesh>(null)
  const { segs, total } = useRoute(POINTS)
  const tmp = useMemo(() => new Vector3(), [])
  const shaft = segs.find((s) => s.vertical) ?? segs[0]

  useFrame(({ clock }) => {
    const b = beats(clock.elapsedTime)
    const g = phone.current
    if (g) {
      g.rotation.order = 'YXZ'
      g.rotation.x = -1.05
      g.rotation.y = b.sweep
      g.rotation.z = 0
    }
    if (sweep.current) {
      sweep.current.visible = b.scanning
      sweep.current.rotation.z = -b.sweep
      sweep.current.scale.setScalar(0.55 + b.scan * 0.5)
    }
    drawMeshes(lines.current, segs, b.draw)
    const riding = b.walk > 0.02 ? poseAt(segs, b.walk * total, tmp) : null
    if (walker.current) {
      walker.current.visible = b.walk > 0.02
      if (riding) walker.current.position.set(tmp.x, tmp.y + 0.08, tmp.z)
    }
    if (cabin.current) {
      cabin.current.position.y = riding?.vertical ? tmp.y : b.walk > 0.5 ? shaft.to.y : shaft.from.y
    }
  })

  return (
    <group position={[0, -0.15, 0]}>
      <Slab y={0} z={0.05} />
      <Slab y={1.7} z={-0.2} />
      {[-0.16, 0.16].map((z) => (
        <mesh key={z} position={[-1.02, 0.86, z]}>
          <boxGeometry args={[0.035, 1.7, 0.035]} />
          <meshStandardMaterial color="#5F6368" />
        </mesh>
      ))}
      <mesh ref={cabin} position={[-1.02, 0.16, 0.0]}>
        <boxGeometry args={[0.28, 0.08, 0.28]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#8AB4F8" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[1.05, 0.28, 0.85]} rotation={[-0.7, 0, 0]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial map={ONE} />
      </mesh>
      <mesh position={[1.05, 1.98, 0.55]} rotation={[-0.7, 0, 0]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial map={TWO} />
      </mesh>
      <mesh position={[0.95, 1.98, -0.95]}>
        <boxGeometry args={[0.06, 0.32, 0.28]} />
        <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={sweep} position={[0.05, 0.08, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 28, 0, 0.75]} />
        <meshStandardMaterial
          color="#4285F4"
          emissive="#4285F4"
          emissiveIntensity={0.55}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      <Phone phoneRef={phone} scale={1.25} position={[0.45, 0.85, 1.35]} />
      <RouteMeshes segs={segs} meshes={lines} radius={0.035} />
      <mesh ref={walker} visible={false}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

/** B: a cutaway of two floors. The phone scans the lower plate, then the route climbs the shaft. */
export default function ConceptB({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[1.7, 3.15, 5.15]} target={[0.05, 0.75, 0]}>
      <Story />
    </SceneCanvas>
  )
}
