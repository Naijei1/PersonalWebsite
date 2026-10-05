import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ReactNode } from 'react'
import type { Group } from 'three'

type Vec3 = [number, number, number]

/** `?poster=1` keeps the drawing buffer so scripts/capture-posters.mjs can export frames as static fallbacks. */
const POSTER_MODE = new URLSearchParams(window.location.search).has('poster')

function Rig({ target, children }: { target: Vec3; children: ReactNode }) {
  const group = useRef<Group>(null)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    camera.lookAt(...target)
  }, [camera, target])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const k = 1 - Math.exp(-delta * 3)
    g.rotation.y += (state.pointer.x * 0.35 - g.rotation.y) * k
    g.rotation.x += (-state.pointer.y * 0.08 - g.rotation.x) * k
  })

  return <group ref={group}>{children}</group>
}

export default function SceneCanvas({
  active,
  camera,
  target = [0, 0, 0],
  children,
}: {
  active: boolean
  camera: Vec3
  target?: Vec3
  children: ReactNode
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, 1.75]}
      camera={{ position: camera, fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: POSTER_MODE }}
      style={{ touchAction: 'pan-y' }}
    >
      <hemisphereLight args={['#ffffff', '#c7d2e0', 1.4]} />
      <directionalLight position={[4, 8, 6]} intensity={1.8} />
      <directionalLight position={[-5, 3, -4]} intensity={0.5} />
      <Rig target={target}>{children}</Rig>
    </Canvas>
  )
}
