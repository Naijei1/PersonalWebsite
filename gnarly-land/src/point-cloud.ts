/**
 * A LiDAR-style point cloud of a multi-floor building, drawn on a 2D canvas.
 * "showcase": slow orbit, a scan band rising through the floors on a loop,
 * and a route that crosses floors by elevator.
 * "horizon": a wide, low building that one sweep lights once on enter.
 * Pauses offscreen; reduced motion draws a single finished frame.
 */
export type CloudVariant = "showcase" | "horizon";
type P = [number, number, number];
const ramp: [number, number, number][] = [
  [76, 201, 255],
  [107, 124, 255],
  [178, 107, 255],
  [255, 122, 182],
];
const tint = (t: number) => {
  const x = Math.min(0.999, Math.max(0, t)) * (ramp.length - 1),
    i = Math.floor(x),
    f = x - i,
    a = ramp[i],
    b = ramp[i + 1];
  return a.map((v, k) => Math.round(v + (b[k] - v) * f)) as [number, number, number];
};
// Small deterministic jitter so the cloud reads as sampled, not ruled.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;

function building(width: number, floors: number, floorGap: number) {
  const pts: P[] = [];
  const floorPts = new Set<number>();
  const half = width / 2,
    depth = 2.6,
    wallH = 1.05;
  const wall = (x0: number, z0: number, x1: number, z1: number, y: number, gaps: number[] = []) => {
    const len = Math.hypot(x1 - x0, z1 - z0),
      n = Math.max(2, Math.round(len / 0.13));
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        x = x0 + (x1 - x0) * t,
        z = z0 + (z1 - z0) * t;
      if (gaps.some((g) => Math.abs((x0 === x1 ? z : x) - g) < 0.32)) continue;
      for (let k = 0; k <= 6; k++)
        pts.push([x + rand() * 0.03, y + (k / 6) * wallH, z + rand() * 0.03]);
    }
  };
  for (let f = 0; f < floors; f++) {
    const y = f * floorGap;
    for (let x = -half; x <= half; x += 0.3)
      for (let z = -depth; z <= depth; z += 0.3) {
        pts.push([x + rand() * 0.08, y, z + rand() * 0.08]);
        floorPts.add(pts.length - 1);
      }
    wall(-half, -depth, half, -depth, y);
    wall(-half, depth, half, depth, y, [-half * 0.6]);
    wall(-half, -depth, -half, depth, y, [0]);
    wall(half, -depth, half, depth, y);
    // Corridor walls with doorways into each room.
    const doors: number[] = [];
    for (let x = -half + 1.4; x < half - 0.6; x += 2.4) doors.push(x);
    wall(-half, -0.55, half, -0.55, y, doors);
    wall(-half, 0.55, half, 0.55, y, doors.map((d) => d + 0.8));
    for (let x = -half + 2.4; x < half - 0.4; x += 2.4) {
      wall(x, -depth, x, -0.55, y);
      wall(x, 0.55, x, depth, y);
    }
  }
  return { pts, floorPts };
}

export function mountPointCloud(canvas: HTMLCanvasElement, variant: CloudVariant) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const horizon = variant === "horizon";
  const floors = horizon ? 2 : 3,
    gap = 1.7,
    width = horizon ? 22 : 8.6;
  seed = horizon ? 11 : 7;
  const { pts, floorPts } = building(width, floors, gap);
  const top = (floors - 1) * gap + 1.05;
  const colors = pts.map((p) => tint(horizon ? (p[0] + width / 2) / width : p[1] / top));
  // Route: entrance → corridor → elevator → upper floor room.
  const lift = width / 2 - 1;
  const route: P[] = horizon
    ? [
        [-width / 2, 0.05, 0],
        [-2, 0.05, 0],
        [-2, 0.05, 0],
        [-2, gap + 0.05, 0],
        [width / 2 - 2.5, gap + 0.05, 0],
        [width / 2 - 2.5, gap + 0.05, -1.4],
      ]
    : [
        [-width / 2, 0.05, 0],
        [lift, 0.05, 0],
        [lift, 2 * gap + 0.05, 0],
        [-1.6, 2 * gap + 0.05, 0],
        [-1.6, 2 * gap + 0.05, -1.5],
      ];
  const segs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1], p[2] - route[i][2]));
  const total = segs.reduce((a, b) => a + b, 0);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let w = 0,
    h = 0,
    dpr = 1,
    frame = 0,
    visible = false,
    start = 0,
    clock = 0,
    last = 0;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    draw();
  };
  const project = (p: P, yaw: number, pitch: number, out: number[]) => {
    const cy = Math.cos(yaw),
      sy = Math.sin(yaw),
      cp = Math.cos(pitch),
      sp = Math.sin(pitch);
    const x = p[0] * cy - p[2] * sy,
      z0 = p[0] * sy + p[2] * cy,
      y0 = p[1] - top / 2;
    const y = y0 * cp - z0 * sp,
      z = y0 * sp + z0 * cp;
    const dist = horizon ? 17 : 13.5,
      f = (horizon ? Math.min(w / 18, h / 3.2) : Math.min(w / 11, h / 7)) * dist;
    const s = f / (dist + z);
    out[0] = w * (horizon ? 0.5 : 0.56) + x * s;
    out[1] = h * (horizon ? 0.6 : 0.5) - y * s;
    out[2] = s;
  };
  const tmp = [0, 0, 0],
    tmp2 = [0, 0, 0];
  const draw = () => {
    if (!w || !h) return;
    const t = clock;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const yaw = horizon ? 0.12 + Math.sin(t * 0.08) * 0.05 : -0.62 + Math.sin(t * 0.12) * 0.32;
    const pitch = horizon ? 0.2 : 0.5;
    // Showcase: a band rises through the floors every 6s. Horizon: one sweep, left to right.
    const loop = (t % 6) / 6;
    const band = horizon ? -width / 2 - 2 + Math.min(1, t / 2.6) * (width + 4) : -0.6 + loop * (top + 1.2);
    const size = horizon ? 1.3 : 1.5;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      project(p, yaw, pitch, tmp);
      const along = horizon ? p[0] : p[1];
      const d = along - band;
      const glow = Math.exp(-(d * d) / (horizon ? 0.9 : 0.06));
      // Points the band has passed stay lit; ahead of it they are faint.
      const lit = horizon ? (d < 0 ? 0.62 : 0.1) : 0.34 + (d < 0 ? 0.22 : 0);
      // Floors stay quieter than walls so the rooms read.
      const a = Math.min(1, lit + glow * 0.9) * Math.min(1, tmp[2] / 70) * (floorPts.has(i) ? 0.5 : 1);
      const [r, g, b] = glow > 0.25 ? [205, 242, 255] : colors[i];
      ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
      const s = size * (0.7 + tmp[2] / 120);
      ctx.fillRect(tmp[0] - s / 2, tmp[1] - s / 2, s, s);
    }
    // Route ribbon, drawn on in step with the scan.
    const drawn = horizon ? Math.min(1, Math.max(0, (t - 1.4) / 2.4)) : Math.min(1, loop * 1.5);
    let remain = drawn * total;
    ctx.lineCap = ctx.lineJoin = "round";
    for (const [lineWidth, alpha] of [
      [9, 0.16],
      [2.4, 0.95],
    ]) {
      ctx.beginPath();
      remain = drawn * total;
      project(route[0], yaw, pitch, tmp);
      ctx.moveTo(tmp[0], tmp[1]);
      for (let i = 0; i < segs.length && remain > 0; i++) {
        const k = Math.min(1, remain / segs[i]),
          a = route[i],
          b = route[i + 1];
        project([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k], yaw, pitch, tmp2);
        ctx.lineTo(tmp2[0], tmp2[1]);
        remain -= segs[i];
      }
      ctx.strokeStyle = `rgba(76,201,255,${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    if (drawn > 0.98) {
      project(route[route.length - 1], yaw, pitch, tmp);
      ctx.fillStyle = "#e3f7ff";
      ctx.beginPath();
      ctx.arc(tmp[0], tmp[1], 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const tick = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) return;
    clock += Math.min(0.05, (now - last) / 1000);
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  };
  const run = () => {
    if (reduce.matches) {
      // One still frame with the scan finished and the route drawn.
      clock = horizon ? 6 : 3.7;
      draw();
      return;
    }
    if (!frame && visible && !document.hidden) {
      last = performance.now();
      if (!start) start = last;
      frame = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) run();
    else stop();
  });
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const visibility = () => (document.hidden ? stop() : run());
  document.addEventListener("visibilitychange", visibility);
  const motion = () => {
    stop();
    run();
  };
  reduce.addEventListener("change", motion);
  resize();
  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    reduce.removeEventListener("change", motion);
  };
}
