// =====================================================================================
// Side missions: things that are there for whoever lingers or pokes about, and that never get in
// the way of the road.
//   wanderCat   a black cat naps beside the road at Hinge. Come near it and it stretches and pads off
//               up the road, to the isles of earlier work; the second time, on to the lighthouse, where
//               it curls up, and stays.
//   fireflies   linger in About me's yard and a few fireflies come out over the garden.
//   nightWatch  click the lighthouse's lamp room: night falls, the beam sweeps once round, and day
//               comes back.
// Nothing here runs until it's called for, and every effect removes itself.
// =====================================================================================

// ---------- The wandering cat ----------
// A black cat. Sitting, seen side on as the engraver draws a creature on a chart, its eyes catching
// the light; and curled up asleep.
const CAT_SIT = '<svg width="30" height="26" viewBox="0 0 30 26"><path class="tail" d="M7 23Q1 23 1.5 17Q2 13 5 12"/><path d="M6 24Q5 15 10 12Q12 9 15 9L16 3.5L18.6 7.4H20.6L23 3.5L23.6 9.4Q26 12 24.4 15Q23.4 17.2 20.8 17.6Q22 20.5 21 24Z"/><path class="fine" d="M13 24V19"/><circle class="eye" cx="19.4" cy="12.4" r=".95"/><circle class="eye" cx="22.4" cy="12.4" r=".95"/></svg>'
const CAT_CURL = '<svg width="34" height="22" viewBox="0 0 34 22"><path d="M3 19Q2.5 11 10.5 9Q17 7.6 22.4 9.6L23.4 4.6L26.4 8Q28 7.8 29.4 8.4L31.4 5L31.4 10.4Q33 13 31.6 15.8Q29.6 19.4 24 19.4H5Q3 19.4 3 19Z"/><path class="tuck" d="M4.8 18.4Q8.4 14.4 15 15.2Q19.6 15.8 22 18.6"/><path class="tuck" d="M26.4 13.4q1.1 .9 2.2 0"/><text class="zz" x="30" y="2">z</text><text class="zz s" x="33.6" y="-2.6">z</text></svg>'
const CAT = { el: null, spots: [], i: 0, busy: false }
function catSpots() {
  const spots = [], clearOf = (x, y) => onLand(x, y) && !PARTS.some(p => Math.hypot(p.c[0] - x, p.c[1] - y) < p.size / 2 + 26)
    && !TREES.some(([tx, ty]) => Math.hypot(tx - x, ty - y) < 42) && distTo(PATH_ALL, x, y) > 20
    // Clear of everything that stands up off the paper (the road's trees, the woods, the hills, 04-ground
    // CARDS): nothing just in front of it to hide it, nothing just behind it for it to stand over.
    && !CARDS.some(c => Math.abs(c.x - x) < c.w / 2 + 16 && y > c.y - c.h - 20 && y < c.y + 40)
  // Three places, so it's found twice and then stays: Hinge, where the road starts; the isles of earlier
  // work; and, last, the lighthouse.
  for (const w of WORLDS.filter(w => w.key === 'hinge' || w.key === 'earlier')) {
    // Beside the road, near the middle of the world, whichever side is clear.
    const mid = (w.y0 + w.y1) / 2
    search: for (let dy = 0; dy < (w.y1 - w.y0) / 2 - 80; dy += 30) for (const y of [mid + dy, mid - dy]) for (const d of [-44, 44, -64, 64, -88, 88, -112, 112]) {
      const x = pathAtY(y)[0] + d
      if (clearOf(x, y)) { spots.push([x, y]); break search }
    }
  }
  // The last place: curled up in the open beside the lighthouse, toward the post box, clear of its base.
  const L = ROOMS['home-hello'].part
  spots.push([L.cx + L.r * 1.5, L.cy + L.r * 1.3])
  return spots
}
// It stands up off the paper, as the woods and trees do: its place is on the map, but it is drawn
// upright, at the size things are there, and placed each frame (sideFrame).
function catPlace() {
  const last = CAT.i === CAT.spots.length - 1
  CAT.el.innerHTML = last ? CAT_CURL : CAT_SIT
  CAT.el.classList.toggle('asleep', last)
  placeCat(view())
}
function placeCat(v) {
  if (!CAT.el) return
  const [x, y] = CAT.spots[CAT.i], [X, Y, z] = at3(x, y, 0, v), show = z > NEAR && fogAt(z, v) < .5 && X > -40 && X < VW + 40 && Y > -40 && Y < VH + 40 && !caseId
  CAT.el.style.display = show ? '' : 'none'
  if (show) CAT.el.style.transform = tr(X, Y, ` scale(${(depthScale(z, v) * .8).toFixed(3)})`)
}
function buildCat() {
  CAT.spots = catSpots()
  if (CAT.spots.length < 2) return
  CAT.el = document.createElement('div'); CAT.el.className = 'cat'; CAT.el.setAttribute('aria-hidden', 'true')
  labelLayer.prepend(CAT.el)
  catPlace()
  // It wakes only for a pointer that rests on it a moment, not one passing over on its way elsewhere.
  let rest = 0
  CAT.el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { clearTimeout(rest); rest = setTimeout(catWakes, 380) } })
  CAT.el.addEventListener('pointerleave', () => clearTimeout(rest))
  // A tap on a phone wakes it too, and doesn't start a drag of the map.
  CAT.el.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.pointerType !== 'mouse') catPet() })
  // A click: wakes it, or, asleep by the lighthouse, pats it (catLife).
  CAT.el.addEventListener('click', e => { e.stopPropagation(); BATCH.catLife ? catPet() : catWakes() })
}
// Paw prints, pressed into the paper toward where it's going, fading as it goes.
const PAW = '<svg width="8" height="8" viewBox="-4 -4 8 8" aria-hidden="true"><ellipse cx="0" cy="1.2" rx="1.7" ry="1.4"/><circle cx="-1.9" cy="-1.4" r=".75"/><circle cx="0" cy="-2.3" r=".75"/><circle cx="1.9" cy="-1.4" r=".75"/></svg>'
function pawsToward([x0, y0], [x1, y1]) {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / L, uy = (y1 - y0) / L, ang = Math.atan2(uy, ux) * 180 / Math.PI + 90
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 3 : -3, x = x0 + ux * (10 + i * 11) - uy * side, y = y0 + uy * (10 + i * 11) + ux * side
    const p = sprite(PAW, 'paw'); p.style.transform = `translate(${f(x - 4)}px,${f(y - 4)}px) rotate(${f(ang)}deg)`
    p.animate([{ opacity: 0 }, { opacity: .75, offset: .1 }, { opacity: 0 }], { duration: 2600, delay: i * 110, fill: 'both' }).finished.then(() => p.remove(), () => p.remove())
  }
}
function catWakes() {
  if (CAT.busy || reduce) return
  const last = CAT.i === CAT.spots.length - 1, svg = CAT.el.firstChild
  // Asleep by the lighthouse: it only purrs, two slow breaths.
  if (last) {
    CAT.busy = true; catSays('prrr…')
    svg.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06, .94)' }, { transform: 'scale(1)' }], { duration: 1100, iterations: 2, easing: 'ease-in-out' }).finished.then(() => { CAT.busy = false }, () => { CAT.busy = false })
    return
  }
  CAT.busy = true
  catSays('mrrp?')
  const from = CAT.spots[CAT.i], to = CAT.spots[CAT.i + 1]
  // A long stretch, then off up the road.
  svg.animate([{ transform: 'none' }, { transform: 'scale(1.18, .82) skewX(-8deg)', offset: .45 }, { transform: 'none' }], { duration: 700, easing: 'ease-in-out' }).finished.then(() => {
    pawsToward(from, [from[0] + (to[0] - from[0]) * .1, from[1] - 90])
    return CAT.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'both' }).finished
  }).then(() => {
    CAT.i++; catPlace()
    return CAT.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: 'both' }).finished
  }).then(() => { CAT.busy = false }, () => { CAT.busy = false })
}

// Little things it does (catLife): a word in a bubble; now and then a blink or a flick of the tail; its
// eyes following the pointer as it comes near, and a tilt of the head; a heart, if you pat it asleep.
function catSays(text) { const [x, y] = CAT.spots[CAT.i]; say({ x, y, base: 0, h: 10 }, text, 'small') }
const catShown = () => CAT.el && CAT.el.style.display !== 'none' && !document.hidden && !reduce
setInterval(() => {
  if (!BATCH.catLife || !catShown() || CAT.busy) return
  const svg = CAT.el.firstChild, asleep = CAT.i === CAT.spots.length - 1
  if (asleep) { svg.querySelectorAll('.zz').forEach((z, i) => z.animate([{ translate: '0 0', opacity: 1 }, { translate: '1px -3px', opacity: .3 }, { translate: '0 0', opacity: 1 }], { duration: 2200, delay: i * 300, easing: 'ease-in-out' })); return }
  if (Math.random() < .55) svg.querySelectorAll('.eye').forEach(e => e.animate([{ scale: '1 1' }, { scale: '1 .1', offset: .5 }, { scale: '1 1' }], { duration: 180 }))
  else svg.querySelector('.tail')?.animate([{ rotate: '0deg' }, { rotate: '-16deg', offset: .3 }, { rotate: '8deg', offset: .65 }, { rotate: '0deg' }], { duration: 900, easing: 'ease-in-out' })
}, 4200)
let catNear = false, catLook = 0
addEventListener('pointermove', e => {
  if (!BATCH.catLife || e.pointerType !== 'mouse' || catLook) return
  catLook = requestAnimationFrame(() => {
    catLook = 0
    if (!catShown() || CAT.busy || CAT.i === CAT.spots.length - 1) return
    const svg = CAT.el.firstChild, r = svg.getBoundingClientRect(), cx = r.x + r.width * .7, cy = r.y + r.height * .45
    const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy), near = d < 120
    svg.querySelectorAll('.eye').forEach(el => { el.style.translate = near && d ? `${(dx / d * .7).toFixed(2)}px ${(dy / d * .6).toFixed(2)}px` : '' })
    // Coming near: it looks up, a tilt of the head toward you.
    if (near && !catNear) svg.animate([{ rotate: '0deg' }, { rotate: (dx < 0 ? -5 : 5) + 'deg', offset: .4 }, { rotate: '0deg' }], { duration: 600, easing: 'ease-in-out' })
    catNear = near
  })
}, { passive: true })
const HEART = '<svg width="12" height="11" viewBox="-6 -5.5 12 11"><path d="M0 4.6C-4.6 1.4 -5.4 -1.2 -4.2 -3.2C-3 -5 -.8 -4.4 0 -2.6C.8 -4.4 3 -5 4.2 -3.2C5.4 -1.2 4.6 1.4 0 4.6Z"/></svg>'
function catPet() {
  if (!BATCH.catLife || reduce || !CAT.el) return
  if (CAT.i !== CAT.spots.length - 1) return catWakes()
  const r = CAT.el.firstChild.getBoundingClientRect(), o = labelLayer.getBoundingClientRect(), X = r.x - o.x + r.width + 4, Y = r.y - o.y + r.height * .3
  // Off to its side, clear of any bubble over its head, drifting up and away.
  fly('heart', HEART, [{ transform: tr(X, Y, ' scale(.4)'), opacity: 0 }, { transform: tr(X + 6, Y - 8, ' scale(1)'), opacity: 1, offset: .3 }, { transform: tr(X + 12, Y - 28, ' scale(.9)'), opacity: 0 }], { duration: 1500, easing: 'ease-out' })
}

// ---------- Cursors ----------
// A building's plan on the sheet, and its name, only take a hand where a click opens something.
function markInert() {
  document.querySelectorAll('.room[data-id]').forEach(el => el.classList.toggle('inert', !clickable(el.dataset.id)))
  for (const L of LEVELS) L.el?.classList.toggle('inert', !clickable(L.id))
}

// ---------- The map at rest: fireflies in the yard ----------
const IDLE = { at: performance.now(), cam: '', flies: null }
// Moving the map, by any means, ends the rest. A pointer only moving over it does not.
function idleNudge() {
  IDLE.at = performance.now()
  if (IDLE.flies) firefliesOut()
}
for (const ev of ['wheel', 'pointerdown', 'keydown', 'touchstart']) addEventListener(ev, idleNudge, { passive: true })
// Each frame (19-boot): the camera having moved counts as moving the map.
function sideFrame(v) {
  placeCat(v)
  const c = `${cam.cx.toFixed(1)},${cam.cy.toFixed(1)}`
  if (c !== IDLE.cam) { IDLE.cam = c; idleNudge() }
}
const restful = () => !reduce && TILT && city.active && city.ready && !caseId && !document.hidden && !flyId && !drag
setInterval(() => {
  if (!restful()) return
  const still = performance.now() - IDLE.at
  if (BATCH.fireflies && still > 5000 && !IDLE.flies && worldAt === WORLDS.length) firefliesOut(true)
}, 1000)

// Fireflies over the garden: faint gold specks, each drifting on its own slow loop.
function firefliesOut(on) {
  if (!on) {
    const box = IDLE.flies; IDLE.flies = null
    box?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'both' }).finished.then(() => box.remove(), () => box.remove())
    return
  }
  const g = PARTS.find(p => p.t === 'garden' && p.realm === 'home')
  if (!g) return
  const v = view(), box = document.createElement('div')
  box.className = 'fireflies'; labelLayer.appendChild(box); IDLE.flies = box
  for (let i = 0; i < 9; i++) {
    const [X, Y, z] = at3(g.x + 30 + Math.random() * (g.w - 60), g.y + 30 + Math.random() * (g.h - 60), 8 + Math.random() * 22, v)
    if (z < NEAR || X < 0 || X > VW || Y < 0 || Y > VH) continue
    const s = document.createElement('i')
    s.style.transform = tr(X, Y)
    s.style.setProperty('--dx', (Math.random() * 30 - 15).toFixed(1) + 'px'); s.style.setProperty('--dy', (Math.random() * 20 - 14).toFixed(1) + 'px')
    s.style.setProperty('--t', (3 + Math.random() * 3).toFixed(2) + 's'); s.style.setProperty('--d', (-Math.random() * 4).toFixed(2) + 's')
    box.appendChild(s)
  }
  box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1800, fill: 'both' })
}

// ---------- Night watch ----------
// The lamp room: the glass at the top of the lighthouse (09-city lighthouse), where it stands on screen.
function lampRoom(v = view()) {
  const q = ROOMS['home-hello'].part, k = q.r / 46, R0 = q.r * .62
  const [X, Y, z] = at3(q.cx, q.cy, 196 * k + 20 * k, v), [Xr] = at3(q.cx + R0 * .62, q.cy, 196 * k + 20 * k, v)
  return { X, Y, z, r: Math.max(20, Math.abs(Xr - X) * 2.6) }
}
function lampRoomAt(X, Y) {
  if (!BATCH.nightWatch || !city.active || worldAt !== WORLDS.length) return false
  const L = lampRoom()
  return L.z > NEAR && Math.hypot(X - L.X, Y - L.Y) < L.r
}
// The owl on the lighthouse's gallery sits just in front of the lamp room: clicking either, it calls
// the night in, a hoot first.
function owlHoots() {
  const q = ROOMS['home-hello'].part, k = q.r / 46, R0 = q.r * .62
  say({ x: q.cx + R0 * .3, y: q.cy + R0 * 1.14, base: 196 * k + 6 * k, h: 26 * k }, 'Hoo!', 'small')
}
let nightOn = false
function nightWatch() {
  if (nightOn || reduce) return
  nightOn = true
  try { owlHoots(); nightFalls() } catch (err) { nightOn = false; document.querySelectorAll('.night, .beam').forEach(el => el.remove()); console.warn('night watch:', err.message) }
}
function nightFalls() {
  const night = document.createElement('div'), beam = document.createElement('div')
  night.className = 'night'; beam.className = 'beam'
  const DUR = 6400
  // Two beams back to back, each a soft wedge of light fading along its length, on a disc squashed to
  // lie on the sea as the map does. Each beam is its own layer, turned and faded by the compositor; a
  // beam fades as it swings toward you, so the light plays on the sea and never across the tower or
  // the island in front of it.
  const ONE = (id, len) => `<svg class="rot" width="1800" height="1800" viewBox="-900 -900 1800 1800"><defs>`
    + `<linearGradient id="bf${id}" x1="0" x2="1"><stop offset="0" stop-color="oklch(97% 0.05 92)" stop-opacity=".95"/><stop offset=".35" stop-color="oklch(96% 0.05 90)" stop-opacity=".45"/><stop offset="1" stop-color="oklch(95% 0.04 88)" stop-opacity="0"/></linearGradient>`
    + `<filter id="bs${id}" x="-10%" y="-80%" width="120%" height="260%"><feGaussianBlur stdDeviation="6"/></filter></defs>`
    + `<path d="M0 0L${len} -58Q${len + 30} 0 ${len} 58Z" fill="url(#bf${id})" filter="url(#bs${id})"/></svg>`
  beam.innerHTML = `<div class="sweep">${ONE('a', 820)}${ONE('b', 700)}</div><b></b>`
  document.body.append(night, beam)
  night.animate([{ opacity: 0 }, { opacity: 1, offset: .18 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: DUR, easing: 'ease-in-out', fill: 'both' })
  const [ra, rb] = beam.querySelectorAll('.rot'), halo = beam.querySelector('b')
  // The turn: once round, slow at either end; the beams' strength rises and falls with the night.
  const turn = t => { const k = clamp((t - DUR * .14) / (DUR * .64), 0, 1); return 160 + 360 * (k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2) }
  const level = t => { const k = t / DUR; return k < .2 ? k / .2 : k > .76 ? Math.max(0, 1 - (k - .76) / .1) : 1 }
  const t0 = performance.now()
  const follow = () => {
    if (performance.now() - t0 > DUR || caseId) { night.remove(); beam.remove(); nightOn = false; return }
    const L = lampRoom(), t = performance.now() - t0, a = turn(t), lv = level(t)
    beam.style.transform = tr(L.X, L.Y)
    // Toward you is down the screen: a beam pointing that way (sin > 0) fades out.
    const face = deg => lv * (1 - smoothstep(-.15, .45, Math.sin(deg * Math.PI / 180)))
    const set = (el, deg, o) => { el.style.rotate = deg.toFixed(1) + 'deg'; el.style.opacity = o.toFixed(3); el.style.visibility = o < .02 ? 'hidden' : '' }
    set(ra, a, face(a)); set(rb, a + 180, face(a + 180) * .7)
    halo.style.opacity = lv.toFixed(3)
    requestAnimationFrame(follow)
  }
  follow()
}

