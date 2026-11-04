// =====================================================================================
// Delight: small things on the map answer the pointer. The wizards on Hinge's building sites say
// hello and cast; a tree on the last islands can be cut down, and grows back from the stump; a
// parked scooter tips over; the hourglass flips, the orrery spins, a punching bag swings, the
// dumbbell on the gym's roof and my barbell are lifted, the telescope looks up and a star shoots
// past; the controller hops as its buttons are pressed; the fountain spurts; a lamp turns on and off; the ramen steams; a ship breaks up and sinks,
// and comes back; open water rings where you touch it; the compass needle follows you. Over them the pointer becomes a wand, and now and then one stirs on its own, so they can be
// told from the scenery. And two secrets, typed: "I solemnly swear", and the Konami code.
// Nothing here runs until something is touched. The pieces themselves move on the GPU (09-city),
// with frames drawn only while one moves (at a third of the rate for a stir on its own); everything else is a
// short-lived element moved by the compositor and removed when it is done.
// =====================================================================================
const DEC_U = new Float32Array(24), DEC_A = new Float32Array(24)
// How long each kind of movement lasts, in seconds.
const DEC_T = { 1: 6.2, 2: 3.3, 3: 2.2, 4: 7, 5: 4.1, 6: 3.6, 7: 1.5, 8: 1.5, 9: 4 }
const WAND = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><path d="M7 7L23 23" stroke="#fbf3e2" stroke-width="4.6" stroke-linecap="round"/><path d="M7 7L23 23" stroke="#3b2618" stroke-width="2.6" stroke-linecap="round"/><path d="M5 .8l1.1 2.6 2.7 1.1-2.7 1.1L5 8.2 3.9 5.6 1.2 4.5l2.7-1.1z" fill="#f1c84b" stroke="#3b2618" stroke-width=".7" stroke-linejoin="round"/></svg>')}") 5 5, pointer`
const HELLO = ['Hello!', 'Oh, hi there!', 'Hello, traveller!'], SPELLS = ['Wingardium leviosa!', 'Nearly there!', 'Mind the crane!', 'Shh, it’s under NDA', 'Coming soon, promise']
let decorRaf = 0, decorUntil = 0, decorHot = 0, spell = 0, decorIdle = false, decorTick = 0
const pick = list => list[Math.floor(Math.random() * list.length)]
const gone = el => el.remove()
// An element moved by the compositor from frame to frame, removed when it is done.
function fly(cls, html, frames, opts) {
  const el = document.createElement('div'); el.className = cls; el.setAttribute('aria-hidden', 'true'); if (html) el.innerHTML = html
  labelLayer.appendChild(el); el.animate(frames, { fill: 'both', ...opts }).finished.then(() => gone(el), () => gone(el))
  return el
}
const at3 = (x, y, z, v = view()) => project(x, y, z * v.t, v)
// Rings on water, as the engraver draws them: two broken ink lines, not a coloured ring.
const RINGS = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="50" rx="49" ry="49"/><ellipse cx="50" cy="50" rx="31" ry="31"/></svg>'
const tr = (X, Y, more = '') => `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0)${more}`

// ---------- The pieces that move on the GPU ----------
// Start a movement in a free slot (or the oldest), and draw frames until every one has finished.
// A click's movement is marked whole: until it ends, another click on the same thing waits.
function decorPlay(id, kind, axis, amount = 0, idle = false, whole = false) {
  const t = now()
  decorIdle = idle && (!decorRaf || decorIdle)
  let slot = -1, oldest = Infinity
  for (let i = 0; i < 6 && slot < 0; i++) {
    const sid = DEC_U[i * 4], start = DEC_U[i * 4 + 2]
    if (sid === id || !sid || t - start > DEC_T[DEC_U[i * 4 + 1]]) slot = i
    else if (start < oldest) { oldest = start; slot = -2 - i }
  }
  if (slot < -1) slot = -2 - slot
  DEC_U.set([id, kind, t, whole ? 1 : 0], slot * 4); DEC_A.set([...axis, amount], slot * 4)
  decorUntil = Math.max(decorUntil, t + DEC_T[kind])
  if (!decorRaf) decorRaf = requestAnimationFrame(decorFrame)
}
function decorFrame() {
  if (now() < decorUntil && city.active) { if (!decorIdle || decorTick++ % 3 === 0) draw(view()); decorRaf = requestAnimationFrame(decorFrame); return }
  // All still: clear the slots, and paint the resting picture once.
  DEC_U.fill(0); decorRaf = 0; decorIdle = false; city.drawn = ''; if (city.active) draw(view())
}
const decorBusy = (id, whole = false) => { const t = now(); for (let i = 0; i < 6; i++) if (DEC_U[i * 4] === id && (!whole || DEC_U[i * 4 + 3]) && t - DEC_U[i * 4 + 2] < DEC_T[DEC_U[i * 4 + 1]]) return DEC_U[i * 4 + 1]; return 0 }

// The decor under the pointer, if any is close enough: its standing line on the screen, from its
// foot to its top, give or take its reach.
const segDist = (X, Y, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, u = L ? clamp(((X - ax) * dx + (Y - ay) * dy) / L, 0, 1) : 0; return Math.hypot(X - ax - u * dx, Y - ay - u * dy) }
const decorLive = () => !reduce && TILT && city.active && GLS && !caseId && DECOR.length > 1
// Where a piece of decor stands on the screen, if it is built and in clear view.
function decorSeen(D, v, t, pad = 40) {
  const s = GLS.starts[D.realm]
  if (s > 1e5 || t - s < 3) return null
  const p = project(D.x, D.y, 0, v)
  return p[2] <= NEAR || fogAt(p[2], v) > .5 || p[0] < -pad || p[0] > VW + pad || p[1] < -pad || p[1] > VH + pad * 5 ? null : p
}
function decorAt(X, Y) {
  if (!decorLive()) return 0
  const v = view(), t = now()
  let best = 0, bestD = Infinity
  for (let id = 1; id < DECOR.length; id++) {
    const D = DECOR[id]
    if (!decorSeen(D, v, t)) continue
    const b = D.base || 0, [x0, y0] = at3(D.x, D.y, b, v), [x1, y1] = at3(D.x, D.y, b + D.h, v), [xr, yr] = at3(D.x + D.r, D.y, b, v)
    const d = segDist(X, Y, x0, y0, x1, y1)
    if (d < Math.max(14, Math.hypot(xr - x0, yr - y0) * 1.25) && d < bestD) { best = id; bestD = d }
  }
  return best
}
const unit = (x, y) => { const L = Math.hypot(x, y) || 1; return [x / L, y / L, 0] }
// A small stir: as the pointer arrives, or on its own now and then. Lamps keep still.
function stir(id, idle = false) {
  const D = DECOR[id], k = idle ? .7 : 1
  if (D.kind === 'lamp') return
  if (D.trick) return playTrick(id, idle)
  if (D.kind === 'wizard') decorPlay(id, 3, [0, 0, 1], (idle ? 2.5 : 4) * D.k, idle)
  else if (D.kind === 'swing') decorPlay(id, 4, [0, 1, 0], .14 * k, idle)
  else if (D.kind === 'spin') decorPlay(id, 7, [0, 0, 1], .2 * k, idle)
  else if (D.kind === 'rep' || D.kind === 'barbell') decorPlay(id, 8, [0, 0, 1], 3, idle)
  else if (D.kind === 'scope') decorPlay(id, 9, [0, 1, 0], .12, idle)
  else if (D.kind === 'pad') decorPlay(id, 3, [0, 0, 1], 3, idle)
  else if (D.kind === 'fountain') spurt(D, 4)
  else decorPlay(id, 7, D.kind === 'scooter' ? [1, 0, 0] : unit(Math.random() - .5, Math.random() - .5), (D.kind === 'tree' ? .07 : .06) * k, idle)
}
// The small props do their whole trick as soon as the pointer reaches them, with no click needed:
// the hourglass, the bags, the orrery, the weights, the telescope, the fountain, the scooters. A tree
// is only cut, a lamp only lit and a wizard only casts when clicked; on hover they stir or say hello.
const ON_HOVER = new Set(['flip', 'swing', 'spin', 'rep', 'barbell', 'scope', 'fountain', 'scooter', 'pad'])
function decorHover(id) {
  if (id === decorHot) return
  decorHot = id
  if (!id) return
  if (DECOR[id].kind === 'barbell' || DECOR[id].kind === 'pad') keepLifting(id)
  if (ON_HOVER.has(DECOR[id].kind)) return decorClick(id)
  if (decorBusy(id)) return
  stir(id)
  if (DECOR[id].kind === 'wizard') say(DECOR[id], pick(HELLO))
}
// The weights (and the controller) keep going while the pointer rests on them, a rep (or a combo)
// each time, and stop as soon as it leaves.
let repTimer = 0
function keepLifting(id) {
  clearInterval(repTimer)
  repTimer = setInterval(() => {
    const p = pointerAt
    if (decorHot !== id || !p || !decorLive() || decorAt(p[0], p[1]) !== id) { clearInterval(repTimer); repTimer = 0; if (decorHot === id) decorHot = 0; return }
    decorClick(id)
  }, DEC_T[8] * 1000 + 100)
}
// A click: the thing does what it does.
function decorClick(id) {
  const D = DECOR[id]
  if (decorBusy(id, true) && D.kind !== 'wizard' && D.kind !== 'swing' && D.kind !== 'barbell' && D.kind !== 'pad') return
  const play = (kind, axis, amount = 0) => decorPlay(id, kind, axis, amount, false, true)
  if (D.trick) return playTrick(id)
  if (D.kind === 'tree') { play(1, [0, Math.random() < .5 ? 1 : -1, 0]); flecks([D.x, D.y, D.z], 'chip', 7, 12); setTimeout(() => flecks([D.x, D.y, D.z], 'chip', 6, 10), 200) }
  else if (D.kind === 'scooter') play(2, [-1, 0, 0])
  else if (D.kind === 'flip') play(5, [1, 0, 0])
  else if (D.kind === 'spin') play(6, [0, 0, 1])
  else if (D.kind === 'swing') play(4, [0, 1, 0], .55)
  else if (D.kind === 'rep') play(8, [0, 0, 1], 14)
  else if (D.kind === 'barbell') { play(8, [0, 0, 1], 18); D.reps = (D.reps || 0) + 1; say(D, D.reps % 3 ? `Rep ${D.reps}` : 'Light weight!') }
  // Three silent button presses, then the fourth says something: a goal for FIFA or a shout for God of War.
  else if (D.kind === 'pad') { play(3, [0, 0, 1], 9); D.hits = (D.hits || 0) + 1; if (D.hits % 4 === 0) say(D, D.hits % 8 ? 'GOAL!' : 'BOY!') }
  else if (D.kind === 'scope') { play(9, [0, 1, 0], .55); shootingStar(D) }
  else if (D.kind === 'fountain') { spurt(D, 14); ripples(D) }
  else if (D.kind === 'lamp') lamp(id)
  else if (D.kind === 'owl') nightWatch()
  else if (D.kind === 'wizard') cast(id, SPELLS[spell++ % SPELLS.length])
}
function cast(id, words) { const D = DECOR[id]; decorPlay(id, 3, [0, 0, 1], 8 * D.k); flecks(wandTip(D), 'wspark', 12, 20); if (words) say(D, words) }
// Hovering a half-built building, its wizard looks up from the work: a hop, a twinkle at the
// staff, and a word, to say it can be clicked. Not more than once every few seconds.
function wizardNudge(room) {
  if (!decorLive()) return
  const id = DECOR.findIndex(D => D?.kind === 'wizard' && (D.rooms || [D.room]).includes(room)), D = DECOR[id], t = performance.now()
  if (id < 1 || t - (D.nudged || 0) < 5000 || decorBusy(id)) return
  D.nudged = t; decorPlay(id, 3, [0, 0, 1], 4 * D.k); flecks(wandTip(D), 'wspark', 6, 10)
}
// Now and then one piece of decor in view stirs on its own: one at a time, never while the map is
// moving, a city is building or a page is open, and drawn at a third of the frame rate.
let lastMove = 0
addEventListener('wheel', () => { lastMove = performance.now() }, { passive: true })
addEventListener('pointerdown', () => { lastMove = performance.now() }, { passive: true })
function idleStir() {
  setTimeout(idleStir, 5200 + Math.random() * 3000)
  if (!decorLive() || document.hidden || decorRaf || assemblyRaf || flyId || drag || performance.now() - lastMove < 1800) return
  const v = view(), t = now(), on = []
  for (let id = 1; id < DECOR.length; id++) if (id !== decorHot && DECOR[id].kind !== 'lamp' && decorSeen(DECOR[id], v, t, -30)) on.push(id)
  if (on.length) stir(pick(on), true)
}
setTimeout(idleStir, 9000)

// ---------- What the touched things do besides move ----------
// What a wizard (or a lamp) says, in a little bubble over its top, for a moment.
function say(D, text, cls = '') {
  D.bubble?.remove()
  const el = document.createElement('div'); el.className = 'hello' + (cls ? ' ' + cls : ''); el.setAttribute('aria-hidden', 'true'); el.innerHTML = `<span>${text}</span>`
  labelLayer.appendChild(el); D.bubble = el
  const t0 = performance.now(), life = 2000
  const step = () => {
    const k = (performance.now() - t0) / life
    if (k >= 1 || !city.active || caseId || D.bubble !== el) { el.remove(); if (D.bubble === el) D.bubble = null; return }
    let [X, Y] = at3(D.x, D.y, (D.base || 0) + D.h + 5)
    // A prop shares its building's hover, so the building's name may be showing just where the
    // bubble would sit: then the bubble rises to sit above the name instead of covering it.
    const L = document.querySelector('.lvl.peek .lv-t')
    if (L) {
      const r = L.getBoundingClientRect(), o = labelLayer.getBoundingClientRect(), w = el.firstChild.offsetWidth / 2 + 4, h = el.firstChild.offsetHeight + 10
      const top = r.top - o.top, left = r.left - o.left
      if (r.width && X + w > left && X - w < left + r.width && Y > top && Y - h < top + r.height) Y = top - 2
    }
    el.style.transform = tr(X, Y); el.style.opacity = (k < .08 ? k / .08 : k > .8 ? (1 - k) / .2 : 1).toFixed(2)
    requestAnimationFrame(step)
  }
  step()
}
// Where a wizard's staff ends: the orb it casts from.
const wandTip = D => [D.x + D.dir * WIZ_ORB[0] * D.k, D.y, WIZ_ORB[1] * D.k]
// Flecks thrown off a point: sparks from a staff, chips from an axe.
function flecks([x, y, z], cls, n, reach) {
  const [X, Y] = at3(x, y, z)
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + Math.random() * .5, r = reach * (.6 + Math.random() * .8)
    const s = document.createElement('i'); s.className = cls; labelLayer.appendChild(s)
    s.animate([{ transform: tr(X, Y), opacity: 1 }, { transform: tr(X + Math.cos(a) * r, Y + Math.sin(a) * r * .7 - reach * .5, ' scale(.5)'), opacity: 0 }],
      { duration: 550 + Math.random() * 350, easing: 'cubic-bezier(.2, .7, .3, 1)', fill: 'both' }).finished.then(() => gone(s), () => gone(s))
  }
}
// The fountain: drops thrown up from the spout into the basin, and rings spreading on the water.
function spurt(D, n) {
  const v = view(), [X, Y, z] = at3(D.x, D.y, 29, v), k = depthScale(z, v)
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + Math.random() * .4, [bx, by] = at3(D.x + Math.cos(a) * 13, D.y + Math.sin(a) * 13, 5, v), up = (12 + Math.random() * 12) * k
    fly('drop', '', [{ transform: tr(X, Y), opacity: 0 }, { transform: tr((X + bx) / 2, Math.min(Y, by) - up), opacity: 1, offset: .45 }, { transform: tr(bx, by), opacity: .3 }], { duration: 650 + Math.random() * 250, delay: i * 22, easing: 'ease-in-out' })
  }
}
function ripples(D) {
  const v = view(), [X, Y] = at3(D.x, D.y, 5, v), rx = Math.abs(at3(D.x + 15, D.y, 5, v)[0] - X), ry = Math.max(4, Math.abs(at3(D.x, D.y + 15, 5, v)[1] - Y))
  for (let i = 0; i < 2; i++) {
    const r = fly('ripple', RINGS, [{ transform: tr(X, Y, ' scale(.2)'), opacity: .8 }, { transform: tr(X, Y), opacity: 0 }], { duration: 1100, delay: 450 + i * 320, easing: 'ease-out' })
    Object.assign(r.style, { width: rx * 2 + 'px', height: ry * 2 + 'px', marginLeft: -rx + 'px', marginTop: -ry + 'px' })
  }
}
// The telescope looks up, and a star shoots across the sky above it.
function shootingStar(D) {
  const [X, Y] = at3(D.x - 24, D.y, 36), x0 = X - 30, y0 = Math.max(70, Y - 230)
  fly('star', '<i></i><svg viewBox="-6 -6 12 12" width="12" height="12"><path d="M0-5.5L1.3-1.3L5.5 0L1.3 1.3L0 5.5L-1.3 1.3L-5.5 0L-1.3-1.3Z"/></svg>', [{ transform: tr(x0, y0, ' rotate(161deg)'), opacity: 0 }, { opacity: 1, offset: .12 }, { transform: tr(x0 - 280, y0 + 96, ' rotate(161deg)'), opacity: 0 }], { duration: 1150, delay: 750, easing: 'cubic-bezier(.3, .2, .4, 1)' })
}
// A lamp turned on: its glass glows (the shader, through LIT_U) and it lights a soft pool on the
// ground; clicked again, it goes out. Eight can be on at once; the ninth puts out the first.
const LIT = new Map(), LIT_U = new Float32Array(8)
function lamp(id) {
  const D = DECOR[id]
  if (LIT.has(id)) { const el = LIT.get(id); LIT.delete(id); el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).finished.then(() => gone(el), () => gone(el)) }
  else {
    if (LIT.size >= 8) { const [first, el] = LIT.entries().next().value; LIT.delete(first); gone(el) }
    const el = document.createElement('div'); el.className = 'lamplight'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = '<i class="pool"></i><i class="halo"></i>'
    labelLayer.appendChild(el); LIT.set(id, el); el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' })
  }
  LIT_U.fill(0); [...LIT.keys()].forEach((k, i) => { LIT_U[i] = k })
  city.drawn = ''; draw(view()); placeLit(view())
}
function placeLit(v) {
  for (const [id, el] of LIT) {
    const D = DECOR[id], [X, Y, z] = at3(D.x, D.y, D.base + D.h - 5, v), show = v.t > .5 && city.active && z > NEAR && fogAt(z, v) < .6
    el.style.display = show ? '' : 'none'
    if (!show) continue
    const [gx, gy] = at3(D.x, D.y, D.base, v), rx = Math.abs(at3(D.x + 24, D.y, D.base, v)[0] - gx), ry = Math.max(4, Math.abs(at3(D.x, D.y + 24, D.base, v)[1] - gy)), k = depthScale(z, v)
    const [pool, halo] = el.children
    Object.assign(pool.style, { transform: tr(gx, gy), width: rx * 2 + 'px', height: ry * 2 + 'px', marginLeft: -rx + 'px', marginTop: -ry + 'px' })
    halo.style.transform = tr(X, Y, ` scale(${k.toFixed(3)})`)
  }
}

// ---------- Buildings with a trick of their own ----------
// The ramen stall steams as the pointer comes by; not more than once every few seconds.
const roomFxAt = {}
function roomHover(id) { const t = performance.now(); if (!ROOM_FX[id] || reduce || t - (roomFxAt[id] || 0) < 2600) return; roomFxAt[id] = t; ROOM_FX[id]() }
const STEAM = '<svg width="12" height="26" viewBox="-6 -25 12 26"><path d="M0 0c-4-4 4-7 0-12s4-7 0-12"/></svg>'
const ROOM_FX = {
  'life-anime'() {
    const v = view(), [x, y] = ROOMS['life-anime'].part.c
    ;[-20, 0, 20].forEach((dx, i) => { for (let j = 0; j < 2; j++) {
      const [X, Y, z] = at3(x + dx, y - 2, 21, v), k = depthScale(z, v)
      fly('steam', STEAM, [{ transform: tr(X, Y, ` scale(${k})`), opacity: 0 }, { opacity: .85, offset: .25 }, { transform: tr(X + (j ? 6 : -4) * k, Y - 34 * k, ` scale(${k * 1.25})`), opacity: 0 }], { duration: 1700, delay: i * 160 + j * 620, easing: 'ease-out' })
    } })
  },
}

// ---------- On the sea ----------
// A click on open water: a small ring spreads on it, drawn in ink.
let lastRing = 0
function seaClick(X, Y) {
  if (reduce || !TILT || performance.now() - lastRing < 600) return
  const [gx, gy] = unproject(X, Y)
  if (onLand(gx, gy)) return
  lastRing = performance.now()
  const v = view(), k = depthScale(project(gx, gy, 0, v)[2], v)
  for (let i = 0; i < 2; i++) { const r = fly('ripple', RINGS, [{ transform: tr(X, Y, ' scale(.25)'), opacity: .8 }, { transform: tr(X, Y), opacity: 0 }], { duration: 1200, delay: i * 260, easing: 'ease-out' }); Object.assign(r.style, { width: 56 * k + 'px', height: 14 * k + 'px', marginLeft: -28 * k + 'px', marginTop: -7 * k + 'px' }) }
}
// A click on a ship: she shudders, breaks in two along a ragged line, and goes down below the
// waterline, leaving planks and rings on the water. A little later she comes up whole, and sails on.
function shipSink(el) {
  if (el.sinking || reduce) return
  const a = el.getAnimations()[0], img = el.querySelector('img'), w = img.width, h = img.height
  el.sinking = true; a?.pause()
  const wreck = document.createElement('div'); wreck.className = 'wreck'; Object.assign(wreck.style, { width: w + 'px', height: Math.round(h * .86) + 'px' })
  wreck.innerHTML = `<img src="${img.src}" width="${w}" height="${h}" alt="" class="half bow"><img src="${img.src}" width="${w}" height="${h}" alt="" class="half stern">`
  el.appendChild(wreck); img.style.visibility = 'hidden'
  wreck.querySelectorAll('img').forEach((half, i) => {
    const d = i ? 1 : -1
    half.animate([{ transform: 'none' }, { transform: 'translate(-2px, 1px) rotate(-2deg)', offset: .04 }, { transform: 'translate(2px, 0) rotate(2deg)', offset: .08 }, { transform: 'none', offset: .12 },
      { transform: `translate(${d * 5}px, 2px) rotate(${d * 7}deg)`, offset: .3 }, { transform: `translate(${d * 12}px, ${h * .7}px) rotate(${d * 30}deg)` }], { duration: 3000, easing: 'cubic-bezier(.45, 0, .8, .6)', fill: 'forwards' })
  })
  const water = Math.round(h * .86)
  for (let i = 0; i < 4; i++) {
    const p = document.createElement('i'); p.className = 'plank'; el.appendChild(p)
    const x0 = w * (.3 + i * .13)
    p.animate([{ transform: `translate(${x0}px, ${water - 2}px) rotate(${i * 40}deg)`, opacity: 0 }, { opacity: 1, offset: .2 }, { transform: `translate(${x0 + (i - 1.5) * 22}px, ${water + 2}px) rotate(${i * 40 + 60}deg)`, opacity: 0 }], { duration: 4200, delay: 900 + i * 120, easing: 'ease-out', fill: 'both' }).finished.then(() => gone(p), () => gone(p))
  }
  for (let i = 0; i < 2; i++) {
    const r = document.createElement('i'); r.className = 'ripple'; r.innerHTML = RINGS; Object.assign(r.style, { width: w + 'px', height: w * .22 + 'px', left: 0, top: water - w * .11 + 'px' }); el.appendChild(r)
    r.animate([{ transform: 'scale(.3)', opacity: .9 }, { transform: 'scale(1.1)', opacity: 0 }], { duration: 1600, delay: 1400 + i * 700, easing: 'ease-out', fill: 'both' }).finished.then(() => gone(r), () => gone(r))
  }
  setTimeout(() => {
    wreck.remove(); img.style.visibility = ''
    img.animate([{ opacity: 0, translate: '0 18px' }, { opacity: 1, translate: '0 0' }], { duration: 1400, easing: 'ease-out' })
    a?.play(); el.sinking = false
  }, 7500)
}
// The compass roses: a needle over each, that swings to follow the pointer, spins when clicked,
// and settles back on north.
function buildCompass() {
  for (const o of GEO.roses) {
    const L = o.r * .62, el = sprite(`<svg viewBox="-50 -50 100 100" width="${f(L)}" height="${f(L)}"><path class="n" d="M0-46L8 0L0 5L-8 0Z"/><path class="s" d="M0 46L8 0L0-5L-8 0Z"/><circle r="4.5"/></svg>`, 'needle')
    el.style.transform = `translate(${f(o.x - L / 2)}px,${f(o.y - L / 2)}px)`; el.style.cursor = WAND
    const svg = el.firstChild
    let raf = 0, deg = 0
    el.addEventListener('pointermove', e => { if (raf || reduce) return; raf = requestAnimationFrame(() => { raf = 0; const [gx, gy] = unproject(e.clientX, e.clientY); deg = Math.atan2(gx - o.x, -(gy - o.y)) * 180 / Math.PI; svg.style.rotate = deg.toFixed(1) + 'deg' }) })
    el.addEventListener('pointerleave', () => { deg = 0; svg.style.rotate = '0deg' })
    el.addEventListener('click', () => { if (!reduce) svg.animate([{ rotate: deg + 'deg' }, { rotate: deg + 720 + 'deg' }], { duration: 1600, easing: 'cubic-bezier(.2, .8, .3, 1)' }) })
  }
}

// ---------- Two secrets ----------
// Typed anywhere on the map: "I solemnly swear" sets my footprints walking with my name, as on the
// Marauder's Map, until "Mischief managed" (said by me, or typed by you) wipes them. The Konami code
// has every wizard cast at once. Spaces typed mid-phrase do not move the map.
const SECRET = 'isolemnlyswear', MISCHIEF = 'mischiefmanaged', KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']
let typed = '', typedAt = 0, kon = 0, marauder = null
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || caseId || e.target.closest?.('input, textarea')) return
  const key = e.key.toLowerCase(), t = performance.now()
  kon = key === KONAMI[kon] ? kon + 1 : key === KONAMI[0] ? 1 : 0
  if (kon === KONAMI.length) { kon = 0; allCast() }
  if (t - typedAt > 2500) typed = ''
  if (key === ' ') { if (typed) { e.preventDefault(); e.stopImmediatePropagation() } typedAt = t; return }
  if (!/^[a-z]$/.test(key)) return
  typed += key; typedAt = t
  while (typed && !SECRET.startsWith(typed) && !MISCHIEF.startsWith(typed)) typed = typed.slice(1)
  if (typed === SECRET) { typed = ''; solemnlySwear() }
  else if (typed === MISCHIEF) { typed = ''; mischiefManaged() }
}, true)
// A line written in ink across the top of the map, then faded.
const inkLine = text => fly('inkline', `<span>${text}</span>`, [{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, offset: .3 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, offset: .82 }, { clipPath: 'inset(0 0% 0 0)', opacity: 0 }], { duration: 4200, easing: 'ease-out' })
function solemnlySwear() {
  if (reduce || !TILT || !city.active || marauder) return
  inkLine('I solemnly swear that I am up to no good.')
  // The walk: from the way nearest the middle of the view, onward up the sheet; or, out at sea,
  // straight across the view.
  const [mx, my] = unproject(VW / 2, VH * .7)
  let i0 = 0, best = Infinity
  PATH_ALL.forEach(([x, y], i) => { const d = Math.hypot(x - mx, y - my); if (d < best) { best = d; i0 = i } })
  let steps = []
  if (best < 260) for (let i = i0; i < PATH_ALL.length - 5 && steps.length < 26; i += 4) { const [x, y] = PATH_ALL[i], [x2, y2] = PATH_ALL[i + 4]; steps.push([x, y, Math.atan2(y2 - y, x2 - x) * 180 / Math.PI]) }
  else { const [ax, ay] = unproject(VW * .3, VH * .72), [bx, by] = unproject(VW * .7, VH * .38), ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI; for (let k = 0; k < 26; k++) steps.push([lerp(ax, bx, k / 25), lerp(ay, by, k / 25), ang]) }
  const stamp = marauder?.stamp || trail(26, 'marauder'), label = document.createElement('div')
  label.className = 'mlabel'; label.setAttribute('aria-hidden', 'true'); label.innerHTML = '<span>Kunal Satpal</span>'; labelLayer.appendChild(label)
  marauder = { stamp, label, k: 0 }
  const next = () => {
    if (!marauder || marauder.label !== label) return
    if (marauder.k >= steps.length || caseId) return mischiefManaged()
    const [x, y, a] = steps[marauder.k++]; stamp(x, y, a)
    const [X, Y] = at3(x, y, 0); label.style.transform = tr(X, Y)
    setTimeout(next, 400)
  }
  setTimeout(next, 900)
}
function mischiefManaged() {
  if (!marauder) return
  const { label } = marauder; marauder = null
  inkLine('Mischief managed.')
  label.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' }).finished.then(() => gone(label), () => gone(label))
}
// The Konami code: every wizard casts at once, flying to Hinge's campus first if need be.
function allCast() {
  if (!decorLive()) return
  const ws = DECOR.flatMap((D, id) => D?.kind === 'wizard' ? [id] : [])
  const go = () => ws.forEach((id, i) => setTimeout(() => cast(id, 'Wingardium leviosa!'), i * 140))
  if (Math.abs(cam.cy - 7150) < 500) go(); else flyTo(0, 7200, 0, 1600, () => setTimeout(go, 3400))
}
