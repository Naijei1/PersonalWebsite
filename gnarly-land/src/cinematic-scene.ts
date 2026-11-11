import * as THREE from "three";
export type ScenePhase = "scanning" | "mapping" | "navigating" | "ready";
export type SceneLabels = {
  start: HTMLElement | null;
  end: HTMLElement | null;
};
export type SceneController = {
  destination: (index: number) => void;
  /** Scroll position through the pinned hero, 0 to 1. */
  setProgress: (p: number) => void;
  /** Scrubbed: autoplay stops on the floor overview and scroll draws the route. */
  setScrubbed: (scrubbed: boolean) => void;
  pause: () => void;
  play: () => void;
  finish: () => void;
  replay: () => void;
  dispose: () => void;
};
const ease = (t: number) => 1 - Math.pow(1 - THREE.MathUtils.clamp(t, 0, 1), 3);
const ramp = (t: number, a: number, b: number) =>
  THREE.MathUtils.smoothstep(t, a, b);
/** Timeline, in seconds of autoplay. */
const START = 0.6,
  HOLD = 4.4,
  END = 8.4;
const endpoints = [
  new THREE.Vector3(-2.85, 0.12, -3.7),
  new THREE.Vector3(2.85, 0.12, 0),
  new THREE.Vector3(-2.85, 0.12, 3.7),
];
const entrance = new THREE.Vector3(0, 0.12, 6.1);
/** Procedural scan → three connected floors → one route on the ground floor. */
export function mountCinematic(
  canvas: HTMLCanvasElement,
  {
    onPhase,
    onReady,
    onAutoplayEnd,
    labels,
  }: {
    onPhase: (phase: ScenePhase) => void;
    onReady: () => void;
    onAutoplayEnd: () => void;
    labels: SceneLabels;
  },
): SceneController {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor("#080d17");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#080d17", 0.022);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight("#b8d1ff", "#0b1424", 2.2));
  const key = new THREE.DirectionalLight("#b2cdff", 3.2);
  key.position.set(4, 10, 6);
  scene.add(key);
  const building = new THREE.Group();
  scene.add(building);
  const floors: {
    group: THREE.Group;
    materials: THREE.MeshStandardMaterial[];
    edges: THREE.LineBasicMaterial[];
    cloud: THREE.Points;
    count: number;
  }[] = [];
  const narrow = () => canvas.clientWidth < 700;
  // Below 900px the copy sits above the canvas instead of beside the model.
  const stacked = () => canvas.clientWidth < 900;
  for (let level = 0; level < 3; level++) {
    const group = new THREE.Group();
    building.add(group);
    const materials: THREE.MeshStandardMaterial[] = [];
    const edges: THREE.LineBasicMaterial[] = [];
    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      color: string,
    ) => {
      const geo = new THREE.BoxGeometry(w, h, d),
        mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.6,
          metalness: 0.15,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });
      materials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      group.add(mesh);
      const lineMat = new THREE.LineBasicMaterial({
        color: "#8eaad4",
        transparent: true,
        opacity: 0,
      });
      edges.push(lineMat);
      const lines = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        lineMat,
      );
      lines.position.copy(mesh.position);
      group.add(lines);
    };
    box(9, 0.12, 11, 0, -0.1, 0, "#1d2a40");
    for (const x of [-2.85, 2.85])
      for (const z of [-3.7, 0, 3.7]) {
        const inner = x + (x < 0 ? 1.55 : -1.55);
        box(3.1, 0.04, 3.2, x, 0.01, z, "#26354e");
        box(3.1, 1.35, 0.075, x, 0.68, z - 1.6, "#263851");
        box(0.075, 1.35, 3.2, x + (x < 0 ? -1.55 : 1.55), 0.68, z, "#2c3c55");
        // Corridor wall with a doorway in the middle.
        box(0.07, 1.35, 0.9, inner, 0.68, z - 1.15, "#3b506e");
        box(0.07, 1.35, 0.9, inner, 0.68, z + 1.15, "#3b506e");
      }
    if (level === 0) {
      box(0.12, 2.2, 0.15, -1.05, 1.1, 5.45, "#5a7aa8");
      box(0.12, 2.2, 0.15, 1.05, 1.1, 5.45, "#5a7aa8");
      box(2.2, 0.12, 0.15, 0, 2.2, 5.45, "#7896c2");
    }
    const points: number[][] = [],
      density = narrow() ? 20 : 30;
    for (let i = 0; i < density; i++)
      for (let j = 0; j < density; j++) {
        const x = -4.4 + (i / (density - 1)) * 8.8,
          z = -5.4 + (j / (density - 1)) * 10.8;
        points.push([x, 0.04, z]);
        if (i % 2 === 0)
          for (let k = 1; k < 6; k++) points.push([x, k * 0.27, -5.4]);
        if (j % 2 === 0)
          for (let k = 1; k < 6; k++) {
            points.push([-4.4, k * 0.27, z]);
            points.push([4.4, k * 0.27, z]);
            points.push([-1.3, k * 0.27, z]);
            points.push([1.3, k * 0.27, z]);
          }
      }
    // The sweep travels from the entrance (+z) to the back wall.
    points.sort((a, b) => b[2] - a[2]);
    const geo = new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.Float32BufferAttribute(points.flat(), 3),
      ),
      mat = new THREE.PointsMaterial({
        color: "#a8c8ff",
        size: 0.04,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
      cloud = new THREE.Points(geo, mat);
    group.add(cloud);
    geo.setDrawRange(0, 0);
    floors.push({ group, materials, edges, cloud, count: points.length });
  }
  const grid = new THREE.GridHelper(48, 48, "#22344f", "#141f33");
  grid.position.y = -0.22;
  scene.add(grid);
  // The scan sweep: a tinted sheet with a bright leading frame, tall enough for every floor.
  const sweep = new THREE.Group();
  const sheetGeo = new THREE.PlaneGeometry(10, 9.6);
  sweep.add(
    new THREE.Mesh(
      sheetGeo,
      new THREE.MeshBasicMaterial({
        color: "#5d8dff",
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
    new THREE.LineSegments(
      new THREE.EdgesGeometry(sheetGeo),
      new THREE.LineBasicMaterial({
        color: "#c3d8ff",
        transparent: true,
        opacity: 0.9,
      }),
    ),
  );
  sweep.position.y = 4.6;
  scene.add(sweep);
  let route: THREE.Mesh,
    wash: THREE.Mesh,
    routeCount = 0,
    selected = 0;
  const beacon = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.045, 8, 40),
    new THREE.MeshBasicMaterial({ color: "#e4efff", toneMapped: false }),
  );
  beacon.rotation.x = -Math.PI / 2;
  scene.add(beacon);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 12),
    new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }),
  );
  scene.add(head);
  let curve: THREE.CatmullRomCurve3;
  const setRoute = (index: number) => {
    if (route) {
      scene.remove(route, wash);
      route.geometry.dispose();
      (route.material as THREE.Material).dispose();
      wash.geometry.dispose();
      (wash.material as THREE.Material).dispose();
    }
    const end = endpoints[index],
      door = end.x < 0 ? -1.3 : 1.3;
    curve = new THREE.CatmullRomCurve3(
      [
        entrance.clone(),
        new THREE.Vector3(0, 0.12, 4.9),
        new THREE.Vector3(0, 0.12, end.z + 0.7),
        new THREE.Vector3(door * 0.6, 0.12, end.z),
        new THREE.Vector3(door, 0.12, end.z),
        end,
      ],
      false,
      "centripetal",
    );
    route = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 140, 0.075, 10, false),
      new THREE.MeshBasicMaterial({
        color: "#d6e6ff",
        toneMapped: false,
        depthTest: false,
        transparent: true,
      }),
    );
    wash = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 140, 0.24, 10, false),
      new THREE.MeshBasicMaterial({
        color: "#4d7bff",
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    route.renderOrder = 5;
    routeCount = route.geometry.index?.count || 0;
    scene.add(wash, route);
    beacon.position.copy(end);
    beacon.position.y = 0.14;
  };
  setRoute(0);
  let clock = START,
    t = START,
    scrub = 0,
    scrubbed = false,
    autoplaying = true,
    last = performance.now(),
    frame = 0,
    paused = false,
    visible = true,
    disposed = false,
    initialized = false,
    redrawAt = -1,
    lastPhase: ScenePhase | null = null;
  const focus = new THREE.Vector3(),
    focusGoal = new THREE.Vector3(),
    target = new THREE.Vector3(),
    position = new THREE.Vector3(),
    projected = new THREE.Vector3();
  const stop = () => (scrubbed ? HOLD : END);
  // Scrolling into the pin skips ahead to the overview, then draws the route.
  const goal = () =>
    Math.min(
      END,
      Math.max(clock, scrubbed && scrub > 0 ? HOLD + scrub * (END - HOLD) : 0),
    );
  let requestRender = () => {};
  const resize = () => {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Leave the left of a wide stage for the headline.
    camera.setViewOffset(
      w,
      h,
      stacked() ? 0 : -w * (w < 1200 ? 0.23 : 0.17),
      0,
      w,
      h,
    );
    camera.updateProjectionMatrix();
    requestRender();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const place = (
    element: HTMLElement | null,
    point: THREE.Vector3,
    opacity: number,
  ) => {
    if (!element) return;
    projected.copy(point).project(camera);
    element.style.opacity = String(opacity);
    element.style.transform = `translate(${((projected.x + 1) / 2) * canvas.clientWidth}px, ${((1 - projected.y) / 2) * canvas.clientHeight}px)`;
  };
  const overview = new THREE.Vector3(13, 12.5, 19),
    scanView = new THREE.Vector3(10.5, 8.5, 17),
    floorView = new THREE.Vector3(9.5, 12.5, 15);
  const update = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const delta = Math.min((now - last) / 1000, 0.08);
    last = now;
    if (autoplaying && !paused) {
      clock = Math.min(stop(), clock + delta);
      if (clock >= stop()) {
        autoplaying = false;
        onAutoplayEnd();
      }
    }
    const aim = goal();
    // Scrubbing eases toward the scroll position instead of jumping to it.
    t += (aim - t) * (1 - Math.exp(-delta * 7));
    if (Math.abs(aim - t) < 0.002) t = aim;
    const phase: ScenePhase =
      t < 2.6
        ? "scanning"
        : t < 6
          ? "mapping"
          : t < 7.9
            ? "navigating"
            : "ready";
    if (phase !== lastPhase) {
      lastPhase = phase;
      onPhase(phase);
    }
    const scanned = ramp(t, 0.2, 2.5),
      upper = 1 - ramp(t, 4.6, 5.8);
    floors.forEach((floor, i) => {
      const fade = i === 0 ? 1 : upper,
        materialize = ramp(t, 0.9 + i * 0.15, 3 + i * 0.15);
      floor.group.position.y = i * (3 + ramp(t, 2.4, 3.8) * 0.75);
      floor.materials.forEach((m) => (m.opacity = materialize * fade * 0.85));
      floor.edges.forEach(
        (m) => (m.opacity = materialize * fade * (i === 0 ? 0.5 : 0.36)),
      );
      floor.cloud.geometry.setDrawRange(0, Math.floor(floor.count * scanned));
      (floor.cloud.material as THREE.PointsMaterial).opacity =
        (1 - materialize * 0.82) * fade * 0.9;
      floor.group.visible = fade > 0.005;
    });
    sweep.position.z = 6.4 - scanned * 12.6;
    sweep.visible = t > 0.15 && t < 2.6;
    // Route: drawn by the timeline, redrawn quickly when the destination changes.
    let drawn = ramp(t, 6, 7.8);
    if (redrawAt >= 0 && t >= 7.8) {
      drawn = ease((now - redrawAt) / 1100);
      if (drawn >= 1) redrawAt = -1;
    }
    const indices = Math.floor((routeCount * drawn) / 3) * 3;
    route.geometry.setDrawRange(0, indices);
    wash.geometry.setDrawRange(0, indices);
    route.visible = wash.visible = drawn > 0.001;
    head.visible = drawn > 0.001 && drawn < 0.999;
    if (head.visible) head.position.copy(curve.getPointAt(drawn));
    beacon.visible = drawn > 0.97;
    focusGoal.copy(endpoints[selected]).multiplyScalar(0.3);
    focus.lerp(focusGoal, 1 - Math.exp(-delta * 4));
    let zoom = 1;
    if (t < HOLD) {
      const p = ease((t - START) / (HOLD - 0.4 - START));
      position.copy(scanView).lerp(overview, p);
      target.set(0, 2.6 + p * 1.2, 0);
    } else {
      const p = ease((t - HOLD) / 1.9);
      position.copy(overview).lerp(floorView, p);
      // Aim below the floor so the model sits above the copy and route picker.
      target
        .set(0, 3.8, 0)
        .lerp(new THREE.Vector3(focus.x, stacked() ? 0 : -1, focus.z + 0.4), p);
      position.x += focus.x * p;
      // Small stages come closer once only the ground floor matters.
      zoom = 1 - (stacked() ? (narrow() ? 0.34 : 0.2) : 0) * p;
    }
    // Pull back on tall stages so all three floors stay in frame.
    const fit = THREE.MathUtils.clamp(1.65 / camera.aspect, 1, 1.45) * zoom;
    camera.position.copy(target).lerp(position, fit);
    camera.lookAt(target);
    renderer.render(scene, camera);
    place(labels.start, entrance, ramp(t, 5.2, 5.9));
    place(labels.end, endpoints[selected], beacon.visible ? 1 : 0);
    if (!initialized) {
      initialized = true;
      onReady();
    }
    if (
      (autoplaying && !paused) ||
      Math.abs(goal() - t) > 0.0005 ||
      redrawAt >= 0 ||
      focus.distanceTo(focusGoal) > 0.005
    )
      frame = requestAnimationFrame(update);
  };
  const schedule = () => {
    if (!frame) last = performance.now();
    if (!frame && !disposed && visible && !document.hidden)
      frame = requestAnimationFrame(update);
  };
  requestRender = schedule;
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { threshold: 0.01 },
  );
  observer.observe(canvas);
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else schedule();
  };
  document.addEventListener("visibilitychange", visibility);
  schedule();
  return {
    destination(index) {
      if (index === selected) return;
      selected = index;
      setRoute(index);
      clock = END;
      autoplaying = false;
      redrawAt = performance.now();
      schedule();
    },
    setProgress(p) {
      scrub = THREE.MathUtils.clamp(p, 0, 1);
      schedule();
    },
    setScrubbed(value) {
      scrubbed = value;
      if (clock < stop()) autoplaying = true;
      schedule();
    },
    pause() {
      paused = true;
    },
    play() {
      paused = false;
      schedule();
    },
    finish() {
      clock = END;
      autoplaying = false;
      paused = false;
      schedule();
    },
    replay() {
      clock = t = START;
      autoplaying = true;
      paused = false;
      redrawAt = -1;
      schedule();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.LineSegments
        ) {
          geometries.add(object.geometry);
          for (const mat of Array.isArray(object.material)
            ? object.material
            : [object.material])
            materials.add(mat);
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
