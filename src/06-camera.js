// =====================================================================================
// Camera: an eye flying up the long sheet, looking ahead along the road. Scrolling carries
// it forward. It rides low through each world, climbs over the river or shore that ends it,
// and banks a little into the road's turns. The ink layer (a CSS 3D plane), the standing
// cities (on the GPU) and the labels (placed on screen) all share its one projection.
// =====================================================================================
const cam = { cx: W / 2, cy: 0, s: .8, ax: 0, ay: 0, intro: 0 }
let VW = innerWidth, VH = innerHeight
const DEG = Math.PI / 180, FOV = 40 * DEG, NEAR = 40, FAR = 16000
// Flat, straight down, when motion is reduced or the GPU is unavailable; flying otherwise.
let TILT = !reduce
// The journey runs from the title at the foot of the sheet to the lighthouse at its head.
const START_Y = 8000, END_Y = 890
// The eye's own line up the sheet. Beside each city it looks between the road and the city's
// far side, so both stay in view; elsewhere it follows the road. The whole line is smoothed so
// broadly that its bends become a slow drift and the zigzag between the isles never swings it.
function framedX(y) {
  const road = pathAtY(clamp(y, END_Y, ROAD[0][1]))[0]
  let x = road, best = 0
  for (const R0 of REALMS) {
    const b = R0.key === 'home' ? GEO.isleBox : { x0: R0.ox, x1: R0.ox + R0.w, y0: R0.oy, y1: R0.oy + R0.h }
    const w = smoothstep(b.y0 - 700, b.y0 - 250, y) * (1 - smoothstep(b.y1 + 250, b.y1 + 700, y))
    if (w <= best) continue
    const r = pathAtY(clamp((b.y0 + b.y1) / 2, END_Y, ROAD[0][1]))[0], c = (b.x0 + b.x1) / 2
    const aim = r > b.x0 && r < b.x1 ? c : (r + (r < c ? b.x1 : b.x0)) / 2
    best = w; x = lerp(road, aim, w)
  }
  return x
}
const EYE_LINE = (() => {
  const y0 = END_Y - 700, step = 20, n = Math.ceil((START_Y + 700 - y0) / step) + 1, k = 28
  const raw = Array.from({ length: n }, (_, i) => framedX(y0 + i * step))
  const wts = Array.from({ length: 2 * k + 1 }, (_, j) => Math.exp(-(((j - k) / (k / 2)) ** 2) / 2)), sum = wts.reduce((a, b) => a + b)
  return { y0, step, n, x: raw.map((_, i) => wts.reduce((s, wt, j) => s + raw[clamp(i + j - k, 0, n - 1)] * wt, 0) / sum) }
})()
function eyeX(y) {
  const t = clamp((y - EYE_LINE.y0) / EYE_LINE.step, 0, EYE_LINE.n - 1), i = Math.min(EYE_LINE.n - 2, Math.floor(t))
  return lerp(EYE_LINE.x[i], EYE_LINE.x[i + 1], t - i)
}
// The shot list: each stretch of the road has its own camera, keyed by where the eye is looking.
// The swings are gentle, and each one is spread over a long stretch of road.
//   y      pitch°  zoom  yaw°  pace (how far one notch of the wheel carries you)
const SHOTS = [
  [START_Y, 60, .82,  0, 1.05],  // the title, from above
  [7650,    50, .92,  0, 1.0],
  [7250,    40, 1.14, -3, .92],  // Hinge Health: low and close
  [6950,    42, 1.10,  3, .92],
  [6590,    55, .88,  0, 1.12],  // the river: up, the road ahead laid out
  [6330,    45, 1.04,  9, .95],  // Gojek: round the market square
  [5930,    45, 1.04, -9, .95],
  [5635,    51, .93,  0, 1.08],  // the river Pivot
  [5320,    41, 1.18, -2, .92],  // Cult.fit: in on the cart arcade
  [5050,    45, 1.04,  0, .95],
  [4770,    48, .97,  0, 1.04],  // the mountains
  [4470,    37, 1.0,  0, 1.04],  // the coast: down by the water
  [4180,    55, .87,  0, 1.12],  // earlier work: higher, the isles as one chain
  [3300,    56, .86,  0, 1.12],
  [2900,    46, 1.02,  0, .96],
  [2620,    42, 1.12,  0, .92],  // field notes: slow and close
  [2300,    44, 1.07,  0, .94],
  [1900,    47, 1.0,  0, 1.0],   // the Isle of Kunal
  [1300,    44, 1.04,  0, .96],
  [END_Y,   35, 1.10,  0, .94],  // the lighthouse, against the evening sky
]
// Each channel runs through its keys on a monotone cubic: smooth, and never overshooting.
function monotone(xs, vs) {
  const n = xs.length, d = [], m = new Array(n)
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (xs[i + 1] - xs[i]))
  m[0] = d[0]; m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i] }
  }
  return x => {
    if (x <= xs[0]) return vs[0]
    if (x >= xs[n - 1]) return vs[n - 1]
    let i = 0; while (x > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * vs[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * vs[i + 1] + (t3 - t2) * h * m[i + 1]
  }
}
// Each channel is then blurred along the road, so no turn of the camera is ever sudden.
function smoothChannel(fn, sigma = 200, step = 10) {
  const y0 = END_Y - 3 * sigma, n = Math.ceil((START_Y + 3 * sigma - y0) / step) + 1, k = Math.ceil(3 * sigma / step)
  const raw = Array.from({ length: n }, (_, i) => fn(-(y0 + i * step)))
  const wts = Array.from({ length: 2 * k + 1 }, (_, j) => Math.exp(-(((j - k) * step / sigma) ** 2) / 2)), sum = wts.reduce((a, b) => a + b)
  const out = raw.map((_, i) => wts.reduce((s2, w, j) => s2 + raw[clamp(i + j - k, 0, n - 1)] * w, 0) / sum)
  return ny => { const t = clamp((-ny - y0) / step, 0, n - 1), i = Math.min(n - 2, Math.floor(t)); return lerp(out[i], out[i + 1], t - i) }
}
const SHOT_CURVE = [1, 2, 3, 4].map(ch => smoothChannel(monotone(SHOTS.map(k => -k[0]), SHOTS.map(k => k[ch]))))
function shot(y) {
  // Besides its shot, the eye leans a little the way the road drifts.
  const slope = (eyeX(y - 200) - eyeX(y + 200)) / 400, drift = clamp(Math.atan(slope) * .3, -4 * DEG, 4 * DEG)
  return { pitch: SHOT_CURVE[0](-y) * DEG, zoom: SHOT_CURVE[1](-y), yaw: SHOT_CURVE[2](-y) * DEG + drift }
}
const pace = y => SHOT_CURVE[3](-y)
// How far along the journey the eye is, from the title (0) to the lighthouse (1).
const journey = y => clamp((START_Y - y) / (START_Y - END_Y), 0, 1)
// The angles the eye actually holds: they follow the shot with a short lag, eased per frame.
function stepShot(t) {
  const want = shot(cam.cy)
  if (!cam.sh || reduce || !TILT) { cam.sh = want; cam.shT = t; return false }
  const dt = Math.min(64, Math.max(0, t - cam.shT)); cam.shT = t
  const k = 1 - Math.exp(-dt / 150), sh = cam.sh
  sh.pitch += (want.pitch - sh.pitch) * k; sh.zoom += (want.zoom - sh.zoom) * k; sh.yaw += (want.yaw - sh.yaw) * k
  return Math.abs(want.pitch - sh.pitch) > 1e-4 || Math.abs(want.zoom - sh.zoom) > 1e-4 || Math.abs(want.yaw - sh.yaw) > 1e-4
}
function view() {
  const sh = TILT ? (cam.sh || shot(cam.cy)) : { pitch: 90 * DEG, zoom: 1, yaw: 0 }
  const k = TILT ? cam.intro : 0
  const pitch = lerp(sh.pitch, 90 * DEG, k), yaw = lerp(sh.yaw, 0, k)
  const s = cam.s * lerp(sh.zoom, VW / (W - 100) / cam.s, k), F = VH / 2 / Math.tan(FOV / 2), D = F / s
  const sp = Math.sin(pitch), cp = Math.cos(pitch), syw = Math.sin(yaw), cyw = Math.cos(yaw)
  const d = [syw * cp, -cyw * cp, -sp], r = [cyw, syw, 0], u = [d[1] * r[2] - d[2] * r[1], d[2] * r[0] - d[0] * r[2], d[0] * r[1] - d[1] * r[0]]
  const E = [cam.cx - d[0] * D, cam.cy - d[1] * D, -d[2] * D]
  return { t: TILT ? 1 : 0, s, sp, cp, F, D, E, d, r, u, px: cam.ax, py: cam.ay }
}
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
// World (x, y, z) to screen (CSS px), with the depth from the eye as a third value.
function project(x, y, z = 0, v = view()) {
  const p = [x - v.E[0], y - v.E[1], z - v.E[2]], zc = Math.max(NEAR, dot3(p, v.d))
  return [v.px + v.F * dot3(p, v.r) / zc, v.py - v.F * dot3(p, v.u) / zc, zc]
}
// Screen to the ground plane, along the ray through that pixel (held short of the horizon).
function unproject(X, Y, v = view()) {
  const a = (X - v.px) / v.F, b = (Y - v.py) / v.F
  const dir = [v.d[0] + a * v.r[0] - b * v.u[0], v.d[1] + a * v.r[1] - b * v.u[1], Math.min(-.08, v.d[2] + a * v.r[2] - b * v.u[2])]
  const t = Math.min(FAR, -v.E[2] / dir[2])
  return [v.E[0] + dir[0] * t, v.E[1] + dir[1] * t]
}
// The rows of the projection: screen x·w, screen y·w and w, each as [x, y, z, 1] weights.
function rows(v) {
  const R = [...v.r, -dot3(v.r, v.E)], U = [...v.u, -dot3(v.u, v.E)], Dd = [...v.d, -dot3(v.d, v.E)]
  const X = Dd.map((w, i) => v.px * w + v.F * R[i]), Y = Dd.map((w, i) => v.py * w - v.F * U[i])
  return { X, Y, Dd }
}
// The ink layer's CSS matrix3d (column-major), in CSS px.
function groundMatrix(v = view()) {
  const { X, Y, Dd } = rows(v), Z = [0, 0, 1, 0]
  return [X[0], Y[0], Z[0], Dd[0], X[1], Y[1], Z[1], Dd[1], X[2], Y[2], Z[2], Dd[2], X[3], Y[3], Z[3], Dd[3]]
}
// The same projection for the GPU, into clip space with perspective depth.
function clipMatrix(v = view()) {
  const { X, Y, Dd } = rows(v), A = (FAR + NEAR) / (FAR - NEAR), B = -2 * FAR * NEAR / (FAR - NEAR)
  const cx = X.map((x, i) => 2 * x / VW - Dd[i]), cy = Y.map((y, i) => Dd[i] - 2 * y / VH), cz = Dd.map((w, i) => A * w + (i === 3 ? B : 0))
  return new Float32Array([cx[0], cy[0], cz[0], Dd[0], cx[1], cy[1], cz[1], Dd[1], cx[2], cy[2], cz[2], Dd[2], cx[3], cy[3], cz[3], Dd[3]])
}
// Screen to ground as a 3×3 homography (column-major), for the GPU's shadows on the paper.
function groundInverse(v = view()) {
  const { X, Y, Dd } = rows(v)
  const m = [[X[0], X[1], X[3]], [Y[0], Y[1], Y[3]], [Dd[0], Dd[1], Dd[3]]]
  const [a, b, c] = m[0], [d, e, f2] = m[1], [g, h, i] = m[2]
  const A = e * i - f2 * h, B = -(d * i - f2 * g), C = d * h - e * g, det = a * A + b * B + c * C
  const inv = [[A, -(b * i - c * h), b * f2 - c * e], [B, a * i - c * g, -(a * f2 - c * d)], [C, -(a * h - b * g), a * e - b * d]].map(rw => rw.map(n => n / det))
  return new Float32Array([inv[0][0], inv[1][0], inv[2][0], inv[0][1], inv[1][1], inv[2][1], inv[0][2], inv[1][2], inv[2][2]])
}
// How far ahead the paper fades into mist, as depths from the eye.
const fogRange = v => [v.D * 1.18, v.D * 1.95]
const fogAt = (depth, v) => TILT && v.cp > .05 ? smoothstep(...fogRange(v), depth) * .82 : 0
// The part of the ground in view, as a box, for deciding what to build and light.
function groundView(v = view()) {
  const pts = [[0, 0], [VW, 0], [0, VH], [VW, VH], [VW / 2, 0]].map(([X, Y]) => unproject(X, Y, v))
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}
const mobile = () => VW <= 760
const panelEl = $('panel')
// What the note is about, while one is open.
let cardFor = null
const panelOpen = () => !!cardFor
const fitScale = () => mobile() ? VW / 1100 : clamp((VW - 40) / (W * .92), .45, 1.1)
function setAnchor() { cam.s = fitScale(); cam.ax = VW / 2; cam.ay = VH * (mobile() ? .5 : .56) }
const yLimits = () => [END_Y, START_Y]
// Across, the eye keeps the road in view, more closely on narrow screens.
// On a phone (BATCH.phoneFrame) the eye frames the city in view instead (phoneX, 17-phone.js).
function followX(y) { return PHONE_FRAME ? phoneX(y) : lerp(W / 2, eyeX(y), mobile() ? .95 : .9) }
function clampCam() { cam.cy = clamp(cam.cy, END_Y, START_Y); cam.cx = followX(cam.cy) }
// World units travelled per pixel of scrolling, at the place being looked at.
// The same flick carries you a little further across open land and sea, a little less through a
// city; and the land always passes under you at the same speed, however close the eye is.
const perPx = () => { const y = targetY ?? cam.cy; return TILT ? pace(y) / (cam.s * .7 * shot(y).zoom) : 1 / (cam.s * .7) }

// Scrolling eases toward a target, so a mouse wheel's steps glide like a trackpad's.
// Forward is north: a positive scroll moves the eye up the sheet.
let targetY = null, easeRaf = 0, flyId = 0, glideId = 0, easeT = 0, camVel = 0
function scrollBy(forward) {
  cancelFly()
  // A scroll only ever moves you the way it points. Backward at the very start there is nothing
  // behind you: the map stays put and the hint shows which way is forward.
  if (forward < 0 && (targetY ?? cam.cy) >= START_Y - 1) { wrongWay(); return }
  // The scroll may run only a little ahead of the eye, so letting go stops the journey promptly.
  targetY = clamp(clamp((targetY ?? cam.cy) - forward, cam.cy - 760, cam.cy + 760), END_Y, START_Y)
  if (!easeRaf) { easeT = performance.now(); easeRaf = requestAnimationFrame(easeStep) }
}
// The eye follows the scroll on a critically damped spring: it gathers speed smoothly, never
// overshoots, and never runs ahead faster than a top speed however hard the wheel is spun.
const SPRING = 9, LEAD = 650
function easeStep(now) {
  const dt = Math.min(34, now - easeT) / 1000; easeT = now
  if (reduce) { cam.cy = targetY; targetY = null; camVel = 0 }
  else {
    const d = clamp(cam.cy - targetY, -LEAD, LEAD), base = cam.cy - d
    // The eye only ever moves the way you are scrolling: never away from where you are heading,
    // never past it.
    if (camVel * d > 0) camVel = 0
    const e = Math.exp(-SPRING * dt), B = camVel + SPRING * d
    cam.cy = base + (d + B * dt) * e; camVel = (camVel - SPRING * B * dt) * e
    if ((cam.cy - targetY) * d < 0) { cam.cy = targetY; camVel = 0 }
    if (Math.abs(cam.cy - targetY) < .3 && Math.abs(camVel) < 6) { cam.cy = targetY; targetY = null; camVel = 0 }
  }
  clampCam(); moved(); render()
  easeRaf = targetY != null ? requestAnimationFrame(easeStep) : 0
}
const cancelFly = () => { cancelAnimationFrame(flyId); cancelAnimationFrame(glideId); flyId = glideId = 0 }
const cancelMotion = () => { cancelFly(); cancelAnimationFrame(easeRaf); easeRaf = 0; targetY = null; camVel = 0 }
// Travel along the road until world height y is the place being looked at.
function flyTo(_x, y, _s, dur = 1000, done) {
  cancelMotion()
  const from = cam.cy, to = clamp(y, END_Y, START_Y), t0 = performance.now()
  dur = reduce ? 0 : Math.min(2200, dur * (.6 + Math.min(1, Math.abs(to - from) / 2500) * .9))
  const step = now => {
    const p = dur <= 0 ? 1 : clamp((now - t0) / dur, 0, 1)
    cam.cy = lerp(from, to, easeInOut(p)); clampCam(); moved(); render()
    flyId = p < 1 ? requestAnimationFrame(step) : 0
    if (!flyId) { settle(); done?.() }
  }
  flyId = requestAnimationFrame(step)
}
const fitAll = dur => { closePanel(); flyTo(0, START_Y, 0, dur) }
// The first sight of the map: straight down on the title, then the eye leans in and the
// cities stand up.
function leanIn(dur = 2600) {
  if (!TILT || reduce) { cam.intro = 0; return requestRender() }
  const t0 = performance.now()
  const step = now => { const p = clamp((now - t0) / dur, 0, 1); cam.intro = 1 - easeInOut(p); moved(); render(); if (p < 1) requestAnimationFrame(step) }
  requestAnimationFrame(step)
}

// The ink layer is one plane in 3D, moved by the compositor; the mist lies over its distance.
const ground = $('ground'), mist = $('mist')
let settleTimer = 0, frame = 0
function moved() { document.body.classList.add('moving'); clearTimeout(settleTimer); settleTimer = setTimeout(settle, 200) }
function settle() { if (flyId) return; document.body.classList.remove('moving'); onSettle() }
const requestRender = () => { if (!frame) frame = requestAnimationFrame(render) }
const lineWeight = s => clamp(.85 / s, 1, 1.8).toFixed(2)
function placeMist(v) {
  if (!TILT || v.cp < .05) { mist.style.opacity = 0; return }
  // On the middle line of the screen, depth z lies at height py + F·(Ez/z − sin)/cos.
  const at = z => v.py + v.F * (v.E[2] / z - v.sp) / v.cp, [z0, z1] = fogRange(v), y0 = at(z0), y1 = at(z1)
  const sy = Math.max(.01, (y0 - y1) / 100)
  mist.style.opacity = 1
  mist.style.transform = `translate3d(0,${(y1 - 900 * sy).toFixed(1)}px,0) scaleY(${sy.toFixed(4)})`
}
// Evening comes on over the last stretch: a warm light over everything below the interface.
const dusk = $('dusk')
let duskO = -1
function placeDusk() {
  const o = +(smoothstep(.62, 1, journey(cam.cy)) * .13).toFixed(2)
  if (o === duskO) return
  duskO = o; dusk.style.opacity = o; dusk.style.display = o ? '' : 'none'
}
// One picture per frame: whichever loop asks first draws it; a second ask in the same frame only
// redraws if the camera has moved since, and the eye's angles advance once per frame.
let renderedAt = -1
function render() {
  frame = 0
  const stamp = document.timeline.currentTime, fresh = stamp !== renderedAt
  renderedAt = stamp
  const easing = fresh ? stepShot(stamp) : false
  const v = view(), m = groundMatrix(v)
  ground.style.transform = `matrix3d(${m.map(n => +n.toPrecision(8)).join(',')})`
  placeMist(v); placeDusk()
  onRender(v)
  // Keep the angles settling only if nothing else is already driving frames.
  if (easing && !easeRaf && !flyId) requestRender()
}
