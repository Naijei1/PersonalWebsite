import * as THREE from 'three'

const pointVert = `
attribute float aT;
varying float vT;
uniform float uScale;
void main() {
  vT = aT;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(uScale * (42.0 / max(1.0, -mv.z)), 1.2, 11.0);
  gl_Position = projectionMatrix * mv;
}
`

const pointFrag = `
precision mediump float;
uniform float uHead;
uniform vec3 uColor;
varying float vT;
void main() {
  if (vT > uHead) discard;
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.12, d);
  gl_FragColor = vec4(uColor, a);
}
`

function pushPoint(
  positions: number[],
  times: number[],
  x: number,
  y: number,
  z: number,
  t: number,
) {
  positions.push(x, y, z)
  times.push(t)
}

function buildCloud() {
  const positions: number[] = []
  const times: number[] = []
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 22; j++) {
      const x = -3.3 + (i / 31) * 6.6 + ((i * 13 + j * 5) % 7) * 0.01
      const z = -4.4 + (j / 21) * 6.6
      pushPoint(positions, times, x, (j % 5) * 0.004, z, (z + 4.4) / 6.6)
    }
  }
  for (let i = 0; i < 40; i++) {
    for (let k = 0; k < 9; k++) {
      const z = -4.4 + (i / 39) * 6.6
      const y = 0.12 + (k / 8) * 2.35
      const gap = z > -0.85 && z < 0.85 && y < 1.9
      if (gap) continue
      const t = (z + 4.4) / 6.6
      pushPoint(positions, times, -3.3, y, z, t)
      pushPoint(positions, times, 3.3, y, z, t)
    }
  }
  for (let i = 0; i < 28; i++) {
    for (let k = 0; k < 9; k++) {
      const x = -3.3 + (i / 27) * 6.6
      const y = (k / 8) * 2.4
      if (Math.abs(x) < 0.75 && y < 1.85) continue
      pushPoint(positions, times, x, y, -4.4, 0.98)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(times, 1))
  return geo
}

function buildRoute() {
  const positions: number[] = []
  const times: number[] = []
  for (let i = 0; i <= 90; i++) {
    const t = i / 90
    const z = 1.8 - t * 5.8
    const x = Math.sin(t * 2.4) * 0.42
    pushPoint(positions, times, x, 0.08, z, t)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(times, 1))
  return geo
}

function makePoints(geo: THREE.BufferGeometry, color: THREE.Color, scale: number, additive = false) {
  const uniforms = {
    uHead: { value: 0 },
    uScale: { value: scale },
    uColor: { value: color },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: pointVert,
    fragmentShader: pointFrag,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  return { points: new THREE.Points(geo, material), uniforms }
}

export function mountScan(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x10161a, 1)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 40)
  camera.position.set(-1.15, 2.15, 5.7)

  const cloudGeo = buildCloud()
  const routeGeo = buildRoute()
  const cloud = makePoints(cloudGeo, new THREE.Color('#d7e6ec'), 1.15)
  const ribbon = makePoints(routeGeo, new THREE.Color('#12b5cb'), 3.4)
  const glow = makePoints(routeGeo, new THREE.Color('#12b5cb'), 6.5, true)
  scene.add(cloud.points, glow.points, ribbon.points)

  let pointerX = 0
  let pointerY = 0
  const onPointer = (event: PointerEvent) => {
    pointerX = event.clientX / window.innerWidth * 2 - 1
    pointerY = event.clientY / window.innerHeight * 2 - 1
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width < 2 || height < 2) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)

  let running = true
  const visibility = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting
  })
  visibility.observe(canvas)

  const started = performance.now()
  let frame = 0
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop)
    if (!running) return
    const elapsed = (now - started) / 1000
    cloud.uniforms.uHead.value = Math.min(1, elapsed / 2.4)
    const routeHead = Math.min(1, Math.max(0, (elapsed - 0.55) / 2.1))
    ribbon.uniforms.uHead.value = routeHead
    glow.uniforms.uHead.value = routeHead
    const aimX = -0.85 + pointerX * 0.35
    const aimY = 2.05 - pointerY * 0.22
    camera.position.x += (aimX - camera.position.x) * 0.045
    camera.position.y += (aimY - camera.position.y) * 0.045
    camera.lookAt(1.35, 0.35, -1.5)
    renderer.render(scene, camera)
  }
  frame = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', onPointer)
    observer.disconnect()
    visibility.disconnect()
    cloudGeo.dispose()
    routeGeo.dispose()
    ;(cloud.points.material as THREE.Material).dispose()
    ;(ribbon.points.material as THREE.Material).dispose()
    ;(glow.points.material as THREE.Material).dispose()
    renderer.dispose()
  }
}
