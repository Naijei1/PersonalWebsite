import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Group, type Mesh } from 'three'
import SceneCanvas from '../SceneCanvas'
import { Phone, RouteMeshes, beats, drawMeshes, plaque, poseAt, useRoute } from './kit'

const ONE = plaque('1', '#1A73E8')
const TWO = plaque('2', '#E37400')

const POINTS = [
  new Vector3(0.45, 0.1, 1.15),
  new Vector3(-0.35, 0.1, 1.15),
  new Vector3(-1.28, 0.1, 0.55),
  new Vector3(-1.28, 0.4, -0.55),
  new Vector3(-0.2, 0.4, -1.25),
  new Vector3(0.85, 0.4, -1.25),
]

function Plan({ y, z }: { y: number; z: number }) {
  return (
    <group position={[0.1, y, z]}>
      <mesh>
        <boxGeometry args={[2.55, 0.05, 1.28]} />
        <meshStandardMaterial color="#F8F9FA" roughness={0.6} />
      </mesh>
      {(
        [
          [0, 0.62, 2.55, 0.04],
          [0, -0.62, 2.55, 0.04],
          [-1.25, 0, 0.04, 1.28],
          [1.25, 0, 0.04, 1.28],
        ] as const
      ).map(([x, zz, w, d], i) => (
        <mesh key={i} position={[x, 0.06, zz]}>
          <boxGeometry args={[w, 0.08, d]} />
          <meshStandardMaterial color="#9AA0A6" />
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
      g.rotation.x = -1.15
      g.rotation.y = b.sweep
      g.rotation.z = 0
    }
    if (sweep.current) {
      sweep.current.visible = b.scanning
      sweep.current.rotation.z = -b.sweep
      sweep.current.scale.setScalar(0.6 + b.scan * 0.55)
    }
    drawMeshes(lines.current, segs, b.draw)
    const riding = b.walk > 0.02 ? poseAt(segs, b.walk * total, tmp) : null
    if (walker.current) {
      walker.current.visible = b.walk > 0.02
      if (riding) walker.current.position.set(tmp.x, tmp.y + 0.1, tmp.z)
    }
    if (cabin.current && riding?.vertical) {
      cabin.current.position.copy(tmp)
    } else if (cabin.current) {
      const parked = b.walk > 0.55 ? shaft.to : shaft.from
      cabin.current.position.copy(parked)
    }
  })

  return (
    <group>
      <Plan y={0} z={1.15} />
      <Plan y={0.3} z={-1.25} />
      <mesh position={[-1.28, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.7]} />
        <meshStandardMaterial color="#DADCE0" />
      </mesh>
      <mesh ref={cabin} position={[-1.28, 0.14, 0.55]}>
        <boxGeometry args={[0.22, 0.08, 0.22]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#8AB4F8" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[1.15, 0.1, 1.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshStandardMaterial map={ONE} />
      </mesh>
      <mesh position={[1.15, 0.42, -1.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshStandardMaterial map={TWO} />
      </mesh>
      <mesh position={[0.95, 0.48, -1.25]}>
        <boxGeometry args={[0.16, 0.1, 0.28]} />
        <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={sweep} position={[0.45, 0.08, 1.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24, 0, 0.8]} />
        <meshStandardMaterial
          color="#4285F4"
          emissive="#4285F4"
          emissiveIntensity={0.6}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
      <Phone phoneRef={phone} scale={1.15} position={[0.45, 0.55, 1.15]} />
      <RouteMeshes segs={segs} meshes={lines} radius={0.04} />
      <mesh ref={walker} visible={false}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

/** C: a flat directory. Floor 1 and floor 2 sit on the page, joined by an elevator rail. */
export default function ConceptC({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.15, 6.6, 3.15]} target={[0.05, 0.15, -0.05]}>
      <Story />
    </SceneCanvas>
  )
}
