// =====================================================================================
// Moments. Each world has one thing that happens as you arrive, instead of everything
// moving all the time: riders' tyre tracks leave the Gojek market, a class laps the Cult.fit
// arena, gulls sweep past at the coast, a whale breaks the sea among the earlier isles. Up high, clouds
// drift past close to the eye, so the height of the flight can be felt.
// =====================================================================================
const sky = $('sky')
const GULL = '<svg viewBox="0 0 26 12"><path d="M1 9 Q 7 1, 13 8 Q 19 1, 25 9" fill="none"/></svg>'
const once = (el, frames, opts) => el.animate(frames, { fill: 'both', ...opts }).finished.then(() => el.remove(), () => el.remove())
// Three riders leave by the east gate: three tyre tracks, side by side, pressed into the road.
let convoyWheels = null
function convoy() {
  const road = []; for (let y = 6150; y >= 5760; y -= 60) road.push(pathAtY(y))
  const pts = [[760, 6122], [920, 6128], [1080, 6140], ...road]
  convoyWheels ||= treads(120)
  for (let i = 0; i < 3; i++) setTimeout(() => ride(convoyWheels, pts, 170, (i - 1) * 7), i * 420)
}
function breach() {
  const el = sprite(`<img src="assets/whale.webp" width="170" height="${Math.round(170 * .62)}" alt=""><i></i><i></i>`, 'breach')
  el.style.transform = 'translate(1500px,3830px)'
  el.querySelector('img').animate([
    { transform: 'translateY(46px) rotate(-14deg) scale(.86)', opacity: 0 },
    { transform: 'translateY(-8px) rotate(-4deg) scale(1)', opacity: 1, offset: .32 },
    { transform: 'translateY(-14px) rotate(6deg) scale(1)', opacity: 1, offset: .58 },
    { transform: 'translateY(52px) rotate(18deg) scale(.9)', opacity: 0 }], { duration: 3600, easing: 'ease-in-out', fill: 'both' })
  el.querySelectorAll('i').forEach((r, k) => r.animate([{ transform: 'scale(.2)', opacity: 0 }, { opacity: .8, offset: .2 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 1800, delay: 1900 + k * 300, fill: 'both', easing: 'ease-out' }))
  setTimeout(() => el.remove(), 4400)
}
function flock() {
  for (let i = 0; i < 3; i++) {
    sky.classList.add('birds')
    const g = document.createElement('div'); g.className = 'flock'; g.innerHTML = GULL; sky.appendChild(g)
    const y = VH * (.16 + i * .06), w = 24 + (i % 2) * 10
    g.style.width = w + 'px'
    g.animate([{ transform: `translate(${-120 - i * 60}px,${y}px)` }, { transform: `translate(${VW * .5}px,${y - 40 + i * 12}px)`, offset: .5 }, { transform: `translate(${VW + 140}px,${y - 90}px)` }],
      { duration: 4200 + i * 300, delay: i * 180, easing: 'cubic-bezier(.4, .1, .6, .9)', fill: 'both' }).finished.then(() => g.remove(), () => g.remove()).then(() => { if (!sky.querySelector('.flock')) sky.classList.remove('birds') })
  }
}
const MOMENTS = [[6000, 6420, convoy], [4280, 4660, flock], [3600, 4000, breach]].map(([a, b, fire]) => ({ a, b, fire, armed: true }))
function playMoments() {
  if (reduce || !TILT || caseId || document.hidden) return
  const y = cam.cy
  for (const m of MOMENTS) {
    const inside = y >= m.a && y <= m.b
    if (inside && m.armed) { m.armed = false; m.fire() }
    else if (!inside && (y < m.a - 260 || y > m.b + 260)) m.armed = true
  }
}

// ---------- Clouds near the eye, on the high stretches ----------
const CLOUDS = []
// A cloud as an engraver draws one: puffs of every size heaped together, one ink outline round
// the whole (each puff is stroked first, then all are filled over, so only the outside edge
// shows), and a little hatching under its belly. Kept faint: it is there for depth, not to look at.
function cloudSVG(r, w) {
  const puffs = [], H = 120
  let x = 30
  while (x < w - 30) { const rr = 22 + r() * 26; puffs.push([x, H - 30 - r() * 8, rr]); x += rr * (1 + r() * .5) }
  for (let k = 0, n = 2 + Math.floor(r() * 2); k < n; k++) puffs.push([w * (.25 + .5 * (k + r() * .6) / n), H - 58 - r() * 14, 34 + r() * 20])
  const c = ([cx, cy, rr]) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}"/>`, belly = `<ellipse cx="${f(w / 2)}" cy="${H - 22}" rx="${f(w / 2 - 14)}" ry="14"/>`
  const hatch = Array.from({ length: 7 }, (_, i) => { const hx = w * (.18 + i * .1); return `M${f(hx)},${H - 16}l${f(14 + r() * 10)},-7` }).join('')
  return `<svg viewBox="0 0 ${f(w)} ${H}" aria-hidden="true"><g class="co">${puffs.map(c).join('')}${belly}</g><g class="cf">${puffs.map(c).join('')}${belly}</g><path class="ch" d="${hatch}"/></svg>`
}
function buildSky() {
  if (reduce || !sky) return
  const r = rng(77)
  for (let i = 0; i < 6; i++) {
    const w = 240 + r() * 200, el = document.createElement('div'); el.className = 'cloud'; el.style.width = w + 'px'; el.innerHTML = cloudSVG(r, w); sky.appendChild(el)
    // Near the eye, at the edges of the view: they frame the land, never cover it.
    CLOUDS.push({ el, w, sx: i % 2 ? .9 + r() * .14 : -.04 + r() * .14, phase: r() * 2000, speed: 1.3 + r() * .7, o: -1 })
  }
}
let skyOn = -1
function placeSky(v) {
  if (!CLOUDS.length) return
  const pitch = Math.asin(clamp(v.sp, -1, 1)) / DEG, y = cam.cy
  const a = TILT ? smoothstep(50, 56, pitch) * (1 - smoothstep(ROAD[0][1] - 300, ROAD[0][1] + 100, y)) * (1 - smoothstep(.86, .96, journey(y))) * (1 - cam.intro) : 0
  const on = a > .01 ? 1 : 0
  if (on !== skyOn) { skyOn = on; sky.classList.toggle('on', !!on) }
  if (!on) return
  const t = START_Y - y, span = VH + 700
  for (const c of CLOUDS) {
    const sy = ((t * c.speed + c.phase) % span + span) % span - 350, sx = c.sx * VW - c.w / 2 + Math.sin((t + c.phase) / 900) * 40
    c.el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`
    const o = (a * .34).toFixed(2); if (c.o !== o) { c.o = o; c.el.style.opacity = o }
  }
}

// ---------- Hinge Health: its buildings going up (the WIP_SITE experiment) ----------
// One wizard raises all the half-built buildings: a stone lifts off the pile, a line of
// sparks runs from the wand to it, and it arcs over to settle on the walls. Drawn over the city
// like the arena's prints, frame by frame only while the campus is in view.
const WIP = { el: null, stones: [], on: -1, raf: 0 }
function buildWip() {
  const to = {}
  if (WIP_SITE && !reduce) for (const p of PARTS) if (WIP_PLANS[p.t]) to[p.room] = WIP_PLANS[p.t](p).targets[0]
  if (!Object.keys(to).length) return
  WIP.el = document.createElement('div'); WIP.el.className = 'wip'; WIP.el.setAttribute('aria-hidden', 'true')
  WIP.stones = WIP_CASTERS().flatMap(C => C.rooms.filter(r => to[r]).map(r => ({ wand: casterTip(C), to: to[r], from: C.pile }))).map(L => {
    const el = document.createElement('div'); el.className = 'wstone'; el.innerHTML = '<b></b>'; WIP.el.appendChild(el)
    const sparks = Array.from({ length: 5 }, () => { const s = document.createElement('i'); s.className = 'wspark'; WIP.el.appendChild(s); return s })
    return { el, sparks, ...L }
  })
  labelLayer.appendChild(WIP.el)
}
function placeWip() {
  if (!WIP.el) return
  const s = GLS?.starts[REALM_IDX.hinge] ?? 1e6, built = TILT && city.active && s < 1e5 && now() - s > 3, near = Math.abs(cam.cy - 7100) < 900
  if (near && TILT && city.active && !built && !WIP.wait) WIP.wait = setTimeout(() => { WIP.wait = 0; requestRender() }, 500)
  const on = built && near && !document.hidden ? 1 : 0
  if (on !== WIP.on) { WIP.on = on; WIP.el.classList.toggle('on', !!on) }
  if (on && !WIP.raf) WIP.raf = requestAnimationFrame(wipFrame)
}
function wipFrame() {
  WIP.raf = WIP.on === 1 && !caseId ? requestAnimationFrame(wipFrame) : 0
  if (!WIP.raf) return
  const v = view(), t = performance.now() / 1000
  WIP.stones.forEach((S, i) => {
    const u = (t / 3.2 + (i % 2) / 2 + (i >> 1) * .17) % 1, m = Math.min(1, u / .75), e = m * m * (3 - 2 * m)
    const x = lerp(S.from[0], S.to[0], e), y = lerp(S.from[1], S.to[1], e), z = lerp(S.from[2], S.to[2], e) + Math.sin(Math.PI * e) * Math.max(30, Math.hypot(S.to[0] - S.from[0], S.to[1] - S.from[1]) * .35)
    const [X, Y, zc] = project(x, y, z * v.t, v), k = depthScale(zc, v), [WX, WY] = project(S.wand[0], S.wand[1], S.wand[2] * v.t, v)
    S.el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) scale(${k.toFixed(3)}) rotate(${((1 - e) * 50).toFixed(1)}deg)`
    S.el.style.opacity = (u < .06 ? u / .06 : u > .88 ? (1 - u) / .12 : 1).toFixed(2)
    S.sparks.forEach((sp, j) => {
      const f = (j + 1) / 6, wob = Math.sin(t * 17 + j * 2.1 + i) * 2.2
      sp.style.transform = `translate3d(${(lerp(WX, X, f) + wob).toFixed(1)}px,${(lerp(WY, Y, f) - wob).toFixed(1)}px,0) scale(${k.toFixed(3)})`
      sp.style.opacity = u < .75 ? (.55 + .45 * Math.sin(t * 13 + j * 1.7)).toFixed(2) : '0'
    })
  })
}

// ---------- Cult.fit: a class lapping the arena ----------
// Only their footsteps: two runners on the arena's red ring, pressed in and fading, like the runner
// on the track outside. The ring is part of the standing arena, so the prints live with the labels
// and the camera places them on its floor. They only appear once the arena has built itself.
const GYM = { el: null, prints: [], i: 0, on: -1, a: null }
const RING_R = 78, RING_Z = 2.2
function buildGym() {
  if (reduce) return
  GYM.a = ROOMS['cult-fitclub'].part
  GYM.el = document.createElement('div'); GYM.el.className = 'gym'; GYM.el.setAttribute('aria-hidden', 'true')
  GYM.prints = Array.from({ length: 36 }, () => { const el = document.createElement('div'); el.className = 'gymprint'; el.innerHTML = FOOT(''); GYM.el.appendChild(el); return { el, x: 0, y: 0, a: 0 } })
  labelLayer.appendChild(GYM.el)
  let t = 0, side = 1
  const lap = () => {
    if (GYM.on === 1 && !document.hidden) {
      side = -side
      for (const ph of [0, Math.PI * .9]) {
        const ang = t + ph, dir = ang + Math.PI / 2, r = RING_R + side * 2.4, P = GYM.prints[GYM.i++ % GYM.prints.length]
        P.x = GYM.a.cx + Math.cos(ang) * r; P.y = GYM.a.cy + Math.sin(ang) * r; P.a = dir
        placePrint(P, view())
        P.el.getAnimations().forEach(c => c.cancel())
        P.el.animate([{ opacity: 0 }, { opacity: .8, offset: .04 }, { opacity: .45, offset: .45 }, { opacity: 0 }], { duration: 3400, easing: 'linear', fill: 'forwards' })
      }
    }
    // About a stride of 12 along the ring each step.
    t += 12 / RING_R
    setTimeout(lap, 190)
  }
  setTimeout(lap, 1200)
}
// A print on the arena floor: where the camera sees it, turned along the ring, at the floor's scale.
function placePrint(P, v) {
  const [X, Y, z] = project(P.x, P.y, RING_Z * v.t, v), [X2, Y2] = project(P.x + Math.cos(P.a) * 6, P.y + Math.sin(P.a) * 6, RING_Z * v.t, v)
  const k = Math.hypot(X2 - X, Y2 - Y) / 6
  P.el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) rotate(${Math.atan2(Y2 - Y, X2 - X).toFixed(3)}rad) scale(${(k * 1.1).toFixed(3)})`
  const seen = z > NEAR && !standsHide(P.x, P.y, RING_Z * v.t + 1.5, v)
  if (P.z !== seen) { P.z = seen; P.el.style.visibility = seen ? '' : 'hidden' }
}
// The prints are drawn over the city, so the arena's stands must hide them by hand: walk the line
// of sight out to the eye, and if it passes under the inner wall, the tiers or the rim, the print is hidden.
function standsHide(x, y, z, v) {
  const a = GYM.a, R0 = a.r * .96, r1 = R0 * .64, r2 = R0 - 14, ex = v.E[0] - x, ey = v.E[1] - y, hd = Math.hypot(ex, ey), dz = (v.E[2] - z) / hd
  for (let s = 3; s < R0 * 2.2; s += 3) {
    const px = x + ex / hd * s, py = y + ey / hd * s, r = Math.hypot(px - a.cx, py - a.cy), pz = z + dz * s
    if (r > R0 + 3 || pz > 60) return false
    const h = r < r1 ? 0 : r < r2 ? 14 + (r - r1) / (r2 - r1) * 44 : 60
    if (pz < h) return true
  }
  return false
}
function placeGym(v) {
  if (!GYM.el) return
  const built = TILT && city.active && GLS && GLS.starts[REALM_IDX.cult] < 1e5 && now() - GLS.starts[REALM_IDX.cult] > 2.6
  const near = Math.abs(cam.cy - 5250) < 900, on = built && near ? 1 : 0
  if (near && TILT && !built && !GYM.wait) GYM.wait = setTimeout(() => { GYM.wait = 0; requestRender() }, 500)
  if (on !== GYM.on) { GYM.on = on; GYM.el.classList.toggle('on', !!on) }
  if (on) for (const P of GYM.prints) placePrint(P, v)
}
