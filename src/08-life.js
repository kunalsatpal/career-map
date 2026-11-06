// =====================================================================================
// Life on the sheet. Footprints walk the road. A ship works the isles, a runner's footsteps lap the track, a
// scooter's tyre track runs the road past Gojek. Each is a small layer moved by the compositor.
// =====================================================================================
const FOOT = (cls = '') => `<svg class="foot ${cls}" width="24" height="16" viewBox="-12 -8 24 16" aria-hidden="true"><path d="${footD(0, 0, 0)}"/></svg>`
const sprite = (html, cls = '') => { const el = document.createElement('div'); el.className = 'sprite ' + cls; el.innerHTML = html; ground.appendChild(el); return el }
// Phones (BATCH.phoneLayers): a print that has faded lets its animation go, so it stops holding a
// compositor layer; it ends at opacity 0 either way, which is where its class leaves it. On a desktop the
// animation is kept, as before.
const letGo = PHONE_LAYERS ? an => { const el = an.effect.target; el.hidden = false; an.onfinish = () => { an.cancel(); el.hidden = true }; return an } : an => an
// Between fades a phone's prints are taken out of the drawing altogether (hidden), so the compositor has
// nothing of them to sort through; letGo brings each back as it is pressed in.
const idlePool = pool => { if (PHONE_LAYERS) for (const el of pool) el.hidden = true; return pool }
// The runner's prints and the scooter's tyre track are laid several a second, so on a phone they fade sooner
// (and their pools are smaller to match): fewer are fading, each a layer, at any one time. Each still fades
// out whole before its element is used again. My own footprints up the road are unchanged.
// Every moving thing keeps the box it moves in; off screen, its animations rest.
const LIFE = []
const lives = (el, pts, pad = 160) => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); LIFE.push({ el, box: { x0: Math.min(...xs) - pad, x1: Math.max(...xs) + pad, y0: Math.min(...ys) - pad, y1: Math.max(...ys) + pad }, on: true }) }
function lifeCull() {
  const gv = groundView(view())
  for (const L of LIFE) {
    const on = L.box.x1 > gv.x0 && L.box.x0 < gv.x1 && L.box.y1 > gv.y0 && L.box.y0 < gv.y1
    if (on === L.on) continue
    L.on = on; L.el.style.visibility = on ? '' : 'hidden'
    for (const a of L.el.getAnimations({ subtree: true })) on ? a.play() : a.pause()
  }
}
function trail(n, cls) {
  const pool = idlePool(Array.from({ length: n }, () => sprite(FOOT(cls), 'step')))
  let i = 0, side = 1
  return (x, y, ang) => {
    const el = pool[i++ % n]; side = -side
    const px = x + Math.cos((ang + 90) * Math.PI / 180) * 5 * side, py = y + Math.sin((ang + 90) * Math.PI / 180) * 5 * side
    el.style.transform = `translate(${f(px - 12)}px,${f(py - 8)}px) rotate(${f(ang + side * 6)}deg)`
    el.getAnimations().forEach(a => a.cancel())
    letGo(el.animate([{ opacity: 0 }, { opacity: .9, offset: .03 }, { opacity: .65, offset: .35 }, { opacity: 0 }], { duration: cls ? (PHONE_LAYERS ? 1500 : 2600) : 5600, easing: 'linear', fill: 'forwards' }))
  }
}
// A tyre's track: short marks pressed in a line just behind the wheel, fading as it goes on.
// Two edges and a chevron tread between them, so a run of marks reads as a tyre, not a line.
const TREAD = '<svg class="tread" width="12" height="8" viewBox="-6 -4 12 8" aria-hidden="true"><path d="M-5 -2.6H5M-5 2.6H5M-4.2 -2.6L-2.4 0L-4.2 2.6M-0.9 -2.6L0.9 0L-0.9 2.6M2.4 -2.6L4.2 0L2.4 2.6"/></svg>'
function treads(n) {
  const pool = idlePool(Array.from({ length: n }, () => sprite(TREAD, 'step')))
  let i = 0
  return (x, y, ang) => {
    const el = pool[i++ % n]
    el.style.transform = `translate(${f(x - 6)}px,${f(y - 4)}px) rotate(${f(ang)}deg)`
    el.getAnimations().forEach(a => a.cancel())
    letGo(el.animate([{ opacity: 0 }, { opacity: .8, offset: .04 }, { opacity: .45, offset: .4 }, { opacity: 0 }], { duration: PHONE_LAYERS ? 1000 : 2400, easing: 'linear', fill: 'forwards' }))
  }
}
// Ride a path at a speed (units a second), a little to one side of it: a mark every few units,
// only while that stretch is on screen. Calls done at the end.
function ride(stamp, pts, speed, side = 0, done) {
  const s = sample(pts, 3), marks = []
  let acc = 0
  for (let i = 1; i < s.length; i++) {
    const [ax, ay] = s[i - 1], [bx, by] = s[i], d = Math.hypot(bx - ax, by - ay), ang = Math.atan2(by - ay, bx - ax)
    for (acc += d; acc >= 10; acc -= 10) { const k = 1 - (acc - 10) / d, x = ax + (bx - ax) * k, y = ay + (by - ay) * k; marks.push([x - Math.sin(ang) * side, y + Math.cos(ang) * side, ang * 180 / Math.PI]) }
  }
  let k = 0
  const next = () => {
    if (k >= marks.length) return done?.()
    const [x, y, a] = marks[k++], gv = groundView(view())
    if (!document.hidden && x > gv.x0 - 40 && x < gv.x1 + 40 && y > gv.y0 - 40 && y < gv.y1 + 40) stamp(x, y, a)
    setTimeout(next, 10000 / speed)
  }
  next()
}
function startLife() {
  // My walk: footprints up the road, a pause at the shore, then on across the island.
  const walk = [], STEP = 28
  for (const seg of [ROAD, ISLEPATH]) {
    const s2 = sample(seg, 4)
    let acc = 0
    for (let i = 1; i < s2.length; i++) {
      acc += Math.hypot(s2[i][0] - s2[i - 1][0], s2[i][1] - s2[i - 1][1])
      if (acc < STEP) continue
      acc = 0
      const a2 = s2[Math.max(0, i - 2)], b2 = s2[Math.min(s2.length - 1, i + 2)]
      walk.push([s2[i][0], s2[i][1], Math.atan2(b2[1] - a2[1], b2[0] - a2[0]) * 180 / Math.PI])
    }
    walk.push(null)
  }
  const step = trail(16, '')
  if (!reduce) {
    // Walk only where someone is looking: set out from the road at the foot of the screen.
    let at = 0
    const tick = () => {
      if (document.hidden) return setTimeout(tick, 1000)
      const far = unproject(VW / 2, -40)[1], near = unproject(VW / 2, VH + 40)[1]
      let w = walk[at]
      if (!w || w[1] > near + 200 || w[1] < far) { at = walk.findIndex(p => p && p[1] < near); if (at < 0) at = 0; w = walk[at] }
      at = (at + 1) % walk.length
      if (w) step(...w)
      setTimeout(tick, 420)
    }
    setTimeout(tick, 1600)
  }
  if (reduce) return
  const loop = (el, pts, dur, opts = {}) => {
    const s = sample(pts, 10, opts.closed), total = lengthOf(opts.closed ? [...s, s[0]] : s), frames = []
    let acc = 0
    s.forEach((p, i) => {
      if (i) acc += Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1])
      const q = s[Math.min(s.length - 1, i + 1)], dx = q[0] - p[0]
      frames.push({ offset: acc / total, transform: `translate(${f(p[0])}px,${f(p[1])}px)${opts.flip ? ` scaleX(${dx < 0 ? -1 : 1})` : ''}` })
    })
    if (opts.closed) frames.push({ ...frames[0], offset: 1 })
    lives(el, pts)
    return el.animate(frames, { duration: dur, iterations: Infinity, easing: 'linear', direction: opts.alternate ? 'alternate' : 'normal', delay: opts.delay || 0 })
  }
  // The ship among the isles.
  const ship = sprite(`<img src="assets/ship.webp" width="96" height="${Math.round(96 * 1.03)}" alt="">`, 'ship')
  ship.style.cursor = WAND
  loop(ship, GEO.ships[0].map(([x, y]) => [x - 48, y - 80]), 90000, { flip: true, alternate: true })
  const schooner = sprite(`<img src="assets/schooner.webp" width="58" height="58" alt="">`, 'ship small'); schooner.style.cursor = WAND
  loop(schooner, GEO.ships[1].map(([x, y]) => [x - 29, y - 50]), 170000, { closed: true, flip: true })
  // Someone is out running on the track: small, quick footsteps going round its middle lane,
  // only while the track is in view.
  const run = trail(PHONE_LAYERS ? 10 : 18, 'run'), TK = GEO.track, RX = TK.rx - 12, RY = TK.ry - 11
  let ra = 0
  const lap = () => {
    if (document.hidden) return setTimeout(lap, 1000)
    const gv = groundView(view())
    if (TK.cx + RX > gv.x0 && TK.cx - RX < gv.x1 && TK.cy + RY > gv.y0 && TK.cy - RY < gv.y1)
      run(TK.cx + Math.cos(ra) * RX, TK.cy + Math.sin(ra) * RY, Math.atan2(Math.cos(ra) * RY, -Math.sin(ra) * RX) * 180 / Math.PI)
    // About a stride of 14 along the lane, whatever its curve.
    ra = (ra + 14 / Math.hypot(Math.sin(ra) * RX, Math.cos(ra) * RY)) % (Math.PI * 2)
    setTimeout(lap, 170)
  }
  setTimeout(lap, 1200)
  // A scooter runs the road past Gojek and back: only its tyre track shows, pressed in as it goes.
  const roadRun = sample(ROAD, 40).filter(([, y]) => y > 5800 && y < 6400), wheel = treads(PHONE_LAYERS ? 16 : 40)
  let back = false
  const runRoad = () => { const pts = back ? roadRun.slice().reverse() : roadRun; back = !back; ride(wheel, pts, 150, back ? 4 : -4, () => setTimeout(runRoad, 2600)) }
  setTimeout(runRoad, 2000)
  // A pulse runs along the heartbeat hedge.
  const pulse = sprite('<i></i>', 'pulse')
  const hg = realmBy.hinge, ey = hg.oy - 32, ecg = [[hg.ox + 30, ey]]; for (let x = hg.ox + 30; x < hg.ox + 300; x += 60) ecg.push([x + 14, ey], [x + 20, ey - 12], [x + 26, ey + 14], [x + 32, ey - 22], [x + 38, ey + 6], [x + 44, ey], [x + 60, ey])
  const ef = []; let el2 = 0; const tot = lengthOf(ecg)
  ecg.forEach((p, i) => { if (i) el2 += Math.hypot(p[0] - ecg[i - 1][0], p[1] - ecg[i - 1][1]); ef.push({ offset: el2 / tot, transform: `translate(${p[0] - 4}px,${p[1] - 4}px)` }) })
  pulse.animate(ef, { duration: 5200, iterations: Infinity, easing: 'linear' }); lives(pulse, ecg)
  // Two gulls over the sea.
  for (let g = 0; g < GEO.gulls.length; g++) {
    const gull = sprite('<svg width="26" height="12" viewBox="0 0 26 12"><path d="M1 9 Q 7 1, 13 8 Q 19 1, 25 9" fill="none"/></svg>', 'gull')
    const [gx, gy] = GEO.gulls[g]
    gull.animate(Array.from({ length: 7 }, (_, i) => ({ transform: `translate(${gx + i * 70}px,${f(gy + Math.sin(i * 1.3 + g) * 50)}px)`, offset: i / 6 })), { duration: 38000 + g * 9000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -g * 12000 }); lives(gull, [[gx, gy], [gx + 420, gy]])
  }
  // The creature that lives off the coast; it dives when you poke it.
  const [sx0, sy0, sw] = GEO.serpent, cr = sprite(`<div class="body"><img src="assets/serpent.webp" width="${sw}" height="${Math.round(sw * .82)}" alt=""></div>`, 'creature')
  cr.style.transform = `translate(${sx0}px,${sy0}px)`; lives(cr, [[sx0, sy0], [sx0 + sw, sy0 + sw]])
  lifeCull()
  cr.addEventListener('click', () => { cr.classList.add('dive'); setTimeout(() => cr.classList.remove('dive'), 2600) })
}
