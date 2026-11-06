// =====================================================================================
// Side missions: things that are there for whoever lingers or pokes about, and that never get in
// the way of the road.
//   pawTrail    the wizard has lost his cat: her paw prints wander near the road in each world; click
//               one and there she is, "meow!", and off she runs.
//   fireflies   linger in About me's yard and a few fireflies come out over the garden.
// Nothing here runs until it's called for, and every effect removes itself.
// =====================================================================================

// ---------- The wizard's cat ----------
// The wizard at Hinge has lost his cat ("Have you seen my cat?"). As you come into each world on land, a
// trail of her paw prints wanders over the open ground near the road, pressed into the paper and fading,
// like the footprints. Click a print and her trail stops, and there she is, a ginger tabby, where it had
// got to: "meow!", a moment sitting, and she fades away. The wizard thanks you, the next time you pass.
const PAWS = { asked: false, found: false, thanked: false }
const PAW = '<svg width="8" height="8" viewBox="-4 -4 8 8" aria-hidden="true"><ellipse cx="0" cy="1.2" rx="1.7" ry="1.4"/><circle cx="-1.9" cy="-1.4" r=".75"/><circle cx="0" cy="-2.3" r=".75"/><circle cx="1.9" cy="-1.4" r=".75"/></svg>'
// A paw print every third step, a little to either side, as a cat's are; enough to be noticed, not more.
// Her trail pauses while she's been found (PAWS.halt).
function pawStamp(n) {
  const pool = Array.from({ length: n }, () => sprite(PAW, 'paw step'))
  let i = 0, k = 0
  return (x, y, ang) => {
    if (PAWS.halt || k++ % 3) return
    const el = pool[i++ % n], side = i % 2 ? 4 : -4, a = ang * Math.PI / 180
    el.style.transform = `translate(${f(x - Math.sin(a) * side - 4)}px,${f(y + Math.cos(a) * side - 4)}px) rotate(${f(ang + 90)}deg) scale(1.8)`
    el.getAnimations().forEach(an => an.cancel())
    el.dataset.x = f(x); el.dataset.y = f(y); el.dataset.a = f(ang); PAWS.head = [x, y, ang]; PAWS.headAt = performance.now()
    // Each print is pressed in, a quick small settle as it lands; the first few of a trail a little darker,
    // to catch the eye. Clickable while it shows, until it has all but faded.
    const first = (PAWS.n = (PAWS.n || 0) + 1) <= 4
    el.animate([{ scale: '1.5' }, { scale: '1' }], { duration: 240, easing: 'cubic-bezier(.2, .8, .3, 1)' })
    el.animate([{ opacity: 0, pointerEvents: 'none' }, { opacity: first ? .9 : .75, offset: .04, pointerEvents: 'auto' }, { opacity: .55, offset: .55, pointerEvents: 'auto' }, { opacity: .08, offset: .93, pointerEvents: 'auto' }, { opacity: 0, pointerEvents: 'none' }], { duration: 7000, easing: 'linear', fill: 'forwards' })
  }
}
// Open ground she'll walk on: land, off the road, clear of the buildings.
const openGround = (x, y) => onLand(x, y) && distTo(PATH_ALL, x, y) > 16 && !PARTS.some(p => Math.hypot(p.c[0] - x, p.c[1] - y) < p.size / 2 + 14)
// Her walk: from just beside the road, near the middle of the view, wandering north over the open ground, turning this
// way and that, now and then doubling back a little.
function wanderPath(w, to) {
  const r = Math.random, [rx] = pathAtY(cam.cy - 60), side = r() < .5 ? -1 : 1
  let x = rx + side * (30 + r() * 25), y = cam.cy - 60, h = -Math.PI / 2 + side * .4
  if (!openGround(x, y)) { x = rx - side * (30 + r() * 25); h = -Math.PI / 2 - side * .4 }
  if (!openGround(x, y)) { x = rx + side * (60 + r() * 30); h = -Math.PI / 2 + side * .4 }
  const pts = [[x, y]]
  for (let i = 0; i < 26 && y > w.y0 + 40; i++) {
    const goal = to ? Math.atan2(to[1] - y, to[0] - x) : -Math.PI / 2
    h += (r() - .5) * .9 + Math.sin(goal - h) * (to ? .35 : .12)
    if (r() < .06) h += (r() < .5 ? -1 : 1) * 1.6
    let nx = x + Math.cos(h) * 13, ny = y + Math.sin(h) * 13
    if (!openGround(nx, ny)) { h += Math.PI * (.4 + r() * .4); nx = x + Math.cos(h) * 13; ny = y + Math.sin(h) * 13; if (!openGround(nx, ny)) continue }
    x = nx; y = ny; pts.push([x, y])
    if (to && Math.hypot(to[0] - x, to[1] - y) < 26) break
  }
  return pts
}
let pawWalk = null
function pawTrail(w) {
  if (reduce || !TILT) return
  pawWalk ||= pawStamp(60)
  const pts = wanderPath(w, null)
  PAWS.n = 0
  if (pts.length > 6) ride(pawWalk, pts, 90, 0)
}
if (BATCH.pawTrail) for (const w of WORLDS) if (w.key !== 'earlier') MOMENTS.push({ a: w.y0 + 160, b: w.y1 - 120, fire: () => pawTrail(w), armed: true })

// The cat herself, only seen when you catch her up: a ginger tabby, in ink, standing up off the paper where
// her trail has got to, a soft shadow under her; placed each frame (sideFrame). She leaves as she came:
// she just fades away where she sat.
const CAT_SIT = '<svg width="30" height="26" viewBox="0 0 30 26"><path class="tail" d="M7 23Q1 23 1.5 17Q2 13 5 12"/><path d="M6 24Q5 15 10 12Q12 9 15 9L16 3.5L18.6 7.4H20.6L23 3.5L23.6 9.4Q26 12 24.4 15Q23.4 17.2 20.8 17.6Q22 20.5 21 24Z"/><path class="stripe" d="M8.4 15.4Q10.4 15 11.4 16.6M7.6 18.6Q9.8 18 10.8 19.8M7.4 21.6Q9.4 21.2 10.2 22.6M18 9.6l.5 1.7M20.8 9.3l.1 1.7"/><path class="fine" d="M13 24V19"/><circle class="eye" cx="19.4" cy="12.4" r=".95"/><circle class="eye" cx="22.4" cy="12.4" r=".95"/></svg>'
const CAT = { el: null, at: null }
function placeCat(v) {
  if (!CAT.el) return
  const [X, Y, z] = at3(CAT.at[0], CAT.at[1], 0, v), show = z > NEAR && fogAt(z, v) < .5 && X > -60 && X < VW + 60 && Y > -60 && Y < VH + 60 && !caseId
  CAT.el.style.display = show ? '' : 'none'
  if (show) CAT.el.style.transform = tr(X, Y, ` scale(${(depthScale(z, v) * .9).toFixed(3)})`)
}
// A print clicked: her wandering trail stops, and there she is at the head of it (or by the print, if
// her walk is over): "meow!", a moment sitting, then she's off.
function pawClick(el) {
  if (CAT.el || reduce) return
  const [x, y, ang] = PAWS.head && performance.now() - (PAWS.headAt || 0) < 9000 ? PAWS.head : [+el.dataset.x, +el.dataset.y, +el.dataset.a]
  const a = ang * Math.PI / 180
  PAWS.halt = true; PAWS.found = true
  CAT.el = document.createElement('div'); CAT.el.className = 'cat' + (Math.cos(a) < 0 ? ' left' : ''); CAT.el.setAttribute('aria-hidden', 'true')
  CAT.el.innerHTML = `<i class="shadow"></i><div class="body">${CAT_SIT}</div>`
  labelLayer.prepend(CAT.el); CAT.at = [x, y]
  CAT.el.querySelector('.body').animate([{ scale: '.3', opacity: 0 }, { scale: '1.12', opacity: 1, offset: .6 }, { scale: '1', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2, .8, .3, 1)' })
  say({ x, y, base: 0, h: 16 }, 'meow!', 'small')
  placeCat(view())
  setTimeout(() => {
    const cat = CAT.el
    if (!cat) return
    // She just vanishes, where she sat; her wandering trail can carry on after.
    cat.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease-in-out', fill: 'forwards' }).finished.then(() => { cat.remove(); if (CAT.el === cat) CAT.el = null; PAWS.halt = false })
  }, 1900)
}
// What the wizard says when you come by (16-delight decorHover).
function wizardLine() {
  if (!BATCH.pawTrail) return pick(HELLO)
  // He only thanks you if he asked you first; and once she's been found, he has no need to ask.
  if (PAWS.found && PAWS.asked && !PAWS.thanked) { PAWS.thanked = true; return 'You found her? Thank you!' }
  if (!PAWS.asked && !PAWS.found) { PAWS.asked = true; return 'Have you seen my cat?' }
  return !PAWS.found && Math.random() < .3 ? 'Still no sign of my cat…' : pick(HELLO)
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

