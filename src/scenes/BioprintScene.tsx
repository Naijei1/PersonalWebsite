import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { CanvasTexture, type Group, type Mesh, type MeshStandardMaterial } from 'three'
import SceneCanvas from './SceneCanvas'

const LAYERS = 7
const LAYER_H = 0.11
const PERIOD = 8
const RADII = [0.26, 0.4, 0.5, 0.52, 0.46, 0.34, 0.22]
const TISSUE = ['#F6AEA9', '#EA4335', '#E3746B', '#C5221F', '#E3746B', '#F6AEA9', '#F28B82']
const STEPS = ['Look', 'Print', 'Check']

function stepTexture(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const g = canvas.getContext('2d')
  if (!g) return null
  g.fillStyle = '#F8F9FA'
  g.fillRect(0, 0, 128, 64)
  g.fillStyle = '#3C4043'
  g.font = '700 28px sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 64, 34)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

const STEP_TEXTURES = STEPS.map(stepTexture)

function Lesson() {
  const layers = useRef<(Mesh | null)[]>([])
  const nozzle = useRef<Group>(null)
  const gantry = useRef<Group>(null)
  const drop = useRef<Mesh>(null)
  const visor = useRef<MeshStandardMaterial>(null)
  const steps = useRef<(MeshStandardMaterial | null)[]>([])

  useFrame(({ clock }) => {
    const u = (clock.elapsedTime % PERIOD) / PERIOD
    const step = u < 0.2 ? 0 : u < 0.78 ? 1 : 2
    const printU = step === 0 ? 0 : step === 2 ? 1 : (u - 0.2) / 0.58
    const exact = printU * LAYERS
    const current = Math.min(LAYERS - 1, Math.floor(exact))

    layers.current.forEach((layer, i) => {
      if (!layer) return
      const grow = Math.max(0, Math.min(1, exact - i))
      layer.visible = grow > 0.02
      layer.scale.set(Math.max(0.001, grow), Math.max(0.001, grow), 1)
    })

    const angle = printU * Math.PI * 10
    const r = RADII[current]
    const y = 0.16 + current * LAYER_H
    if (nozzle.current) nozzle.current.position.set(Math.cos(angle) * r, y + 0.42, Math.sin(angle) * r * 0.72)
    if (gantry.current) gantry.current.position.y = y + 1.05
    if (drop.current) {
      const fall = (printU * 18) % 1
      drop.current.visible = step === 1
      drop.current.position.set(Math.cos(angle) * r, y + 0.34 - fall * 0.28, Math.sin(angle) * r * 0.72)
    }
    if (visor.current) visor.current.emissiveIntensity = step === 0 ? 0.55 : 0.12
    steps.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = i === step ? 0.85 : 0.05
    })
  })

  return (
    <group>
      <group position={[-1.7, 0.15, 0.15]}>
        <mesh position={[0, -0.15, 0]}>
          <sphereGeometry args={[0.38, 20, 16]} />
          <meshStandardMaterial color="#F6D2BE" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.02, 0.08]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.4, 0.07, 8, 20]} />
          <meshStandardMaterial color="#3C4043" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.28]}>
          <boxGeometry args={[0.62, 0.32, 0.16]} />
          <meshStandardMaterial ref={visor} color="#A142F4" emissive="#A142F4" emissiveIntensity={0.2} roughness={0.25} />
        </mesh>
        <mesh position={[-0.14, 0.05, 0.37]}>
          <boxGeometry args={[0.16, 0.12, 0.04]} />
          <meshStandardMaterial color="#202124" roughness={0.3} />
        </mesh>
        <mesh position={[0.14, 0.05, 0.37]}>
          <boxGeometry args={[0.16, 0.12, 0.04]} />
          <meshStandardMaterial color="#202124" roughness={0.3} />
        </mesh>
      </group>

      <group position={[0.15, -1.05, 0]}>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[2.4, 0.1, 1.7]} />
          <meshStandardMaterial color="#E8EAED" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 0.08, 24]} />
          <meshStandardMaterial color="#D2E3FC" roughness={0.25} />
        </mesh>
        {RADII.map((radius, i) => (
          <mesh key={i} ref={(m) => (layers.current[i] = m)} position={[0, 0.1 + i * LAYER_H, 0]}>
            <cylinderGeometry args={[radius, radius * 0.92, LAYER_H * 0.86, 16]} />
            <meshStandardMaterial color={TISSUE[i]} roughness={0.55} />
          </mesh>
        ))}
        {[-1.05, 1.05].map((x) => (
          <mesh key={x} position={[x, 0.85, -0.55]}>
            <boxGeometry args={[0.08, 1.7, 0.08]} />
            <meshStandardMaterial color="#A142F4" roughness={0.45} />
          </mesh>
        ))}
        <group ref={gantry}>
          <mesh position={[0, 0, -0.55]}>
            <boxGeometry args={[2.2, 0.08, 0.08]} />
            <meshStandardMaterial color="#A142F4" roughness={0.45} />
          </mesh>
        </group>
        <group ref={nozzle}>
          <mesh>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color="#5F6368" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <coneGeometry args={[0.07, 0.18, 10]} />
            <meshStandardMaterial color="#DADCE0" roughness={0.3} />
          </mesh>
        </group>
        <mesh ref={drop}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={0.4} />
        </mesh>
      </group>

      <group position={[1.85, 0.05, 0.2]}>
        {STEPS.map((label, i) => (
          <group key={label} position={[0, 0.55 - i * 0.48, 0]}>
            <mesh>
              <boxGeometry args={[0.72, 0.32, 0.06]} />
              <meshStandardMaterial
                ref={(m) => (steps.current[i] = m)}
                map={STEP_TEXTURES[i]}
                color="#FFFFFF"
                emissive="#A142F4"
                emissiveIntensity={0.05}
                roughness={0.6}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function BioprintScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={[0.2, 1.7, 6.3]} target={[0.1, 0.05, 0]}>
      <Lesson />
    </SceneCanvas>
  )
}
