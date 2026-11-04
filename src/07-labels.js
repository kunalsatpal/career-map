// =====================================================================================
// Labels live in screen space, crisp at any size, pinned to the sheet by the camera. The
// company's banner rides over each city. Every piece of work is a building: a small name
// over its roof, and hovering or clicking the building opens it.
// =====================================================================================
const EMBLEM = {
  ecg: '<polyline points="7,25 14,25 17,17 21,33 24,20 27,25 33,25" fill="none" stroke-width="2.6"/>',
  route: '<path d="M10 37 C 10 27, 28 30, 26 20 C 25 14, 18 14, 20 10" fill="none" stroke-width="2.6" stroke-dasharray="3 2.6"/><circle cx="20" cy="10" r="3.4" stroke="none"/>',
  track: '<ellipse cx="20" cy="23" rx="12.5" ry="8" fill="none" stroke-width="2.4"/><ellipse cx="20" cy="23" rx="7" ry="3.6" fill="none" stroke-width="1.8"/>',
  circuit: '<path d="M8 15 H17 V27 H32 M13 34 H25 V20 H32" fill="none" stroke-width="2.2"/><circle cx="8" cy="15" r="2.4"/><circle cx="32" cy="27" r="2.4"/><circle cx="13" cy="34" r="2.4"/><circle cx="32" cy="20" r="2.4"/>',
  offers: '<path d="M9 15 H24 L32 24 L24 33 H9 Z" fill="none" stroke-width="2.4"/><circle cx="14" cy="24" r="2.5"/>',
  mark: '<g transform="translate(9.5 12) scale(.64)" stroke="none"><rect y="1.09" width="7.68" height="28.36" rx="1.4"/><path d="M31.24.92c.77 0 1.4.63 1.4 1.4v25.52c0 .77-.63 1.4-1.4 1.4h-6.1c-.27 0-.52-.11-.7-.31L12.18 15.08 24.44 1.22c.18-.19.43-.3.7-.3z"/></g>',
  star: '<path d="M20 9 L23 21 L33 24 L23 27 L20 39 L17 27 L7 24 L17 21 Z" stroke="none"/>',
  quill: '<path d="M31 8 C 21 10, 13 20, 12 33 L 10 38 L 13 35 C 23 33, 30 22, 31 8 Z" stroke="none"/><path d="M12 34 L 24 19" fill="none" stroke="oklch(30% 0.05 320)" stroke-width="1.4"/>',
}
const crest = (hue, sig) => `<svg class="crest" viewBox="0 0 40 49" aria-hidden="true"><path d="M2 2 H38 V24 C38 37 26 44 20 47 C14 44 2 37 2 24 Z" fill="${ok(52, .1, hue)}" stroke="var(--ink)" stroke-width="1.8"/><path d="M5.5 5.5 H34.5 V24 C34.5 34.5 25 40.5 20 43 C15 40.5 5.5 34.5 5.5 24 Z" fill="none" stroke="var(--gilt)" stroke-width=".9" opacity=".85"/><g fill="var(--gilt)" stroke="var(--gilt)">${EMBLEM[sig]}</g></svg>`
const K_MARK = '<svg viewBox="0 0 33 31" aria-hidden="true"><rect y="1.09" width="7.68" height="28.36" rx="1.4"/><path d="M31.24.92c.77 0 1.4.63 1.4 1.4v25.52c0 .77-.63 1.4-1.4 1.4h-6.1c-.27 0-.52-.11-.7-.31L12.18 15.08 24.44 1.22c.18-.19.43-.3.7-.3z"/></svg>'

// A company's own mark, from the portfolio, where there is one.
const logoHTML = name => `<span class="logo"><img src="assets/logos/${name}.png" alt="" decoding="async"></span>`
const labelLayer = $('labels'), LABELS = [], BRANDS = []
let visited = new Set()
try { visited = new Set(JSON.parse(sessionStorage.getItem('map-visited') || '[]')) } catch {}
function markVisited(id) { if (!levelOf[id] || visited.has(id)) return; visited.add(id); try { sessionStorage.setItem('map-visited', JSON.stringify([...visited])) } catch {}; levelOf[id].el?.classList.add('done') }
const START = { x: ROAD[0][0], y: ROAD[0][1], el: null }, BEACON = { el: null, o: -1 }
function buildLabels() {
  document.body.classList.toggle('ink-logos', BATCH.inkLogos)
  // A ribbon over each city.
  for (const R0 of REALMS) {
    const el = document.createElement('button'), home = R0.key === 'home'
    el.className = 'lab realm' + (home ? ' isle' : '') + (R0.minor ? ' minor' : ''); el.dataset.go = R0.key; el.setAttribute('aria-label', `${R0.name}, ${R0.years}`)
    el.style.setProperty('--c', ok(60, .1, R0.hue))
    el.innerHTML = `<span class="rib">${R0.logo ? logoHTML(R0.logo) : crest(R0.hue, R0.sig)}${R0.wordmark ? '' : `<b>${R0.name}</b>`}</span>${R0.lead ? `<span class="sub">${R0.lead}</span>` : ''}`
    labelLayer.appendChild(el)
    // The Field notes' banner stands on the island's open west side, clear of About me's to the north.
    const notes = R0.key === 'writing'
    LABELS.push({ el, x: home ? 950 : notes ? R0.ox - 120 : R0.ox + R0.w / 2, y: home ? GEO.aboutBox.y1 + 25 : notes ? R0.oy + 250 : R0.oy - (R0.minor ? 70 : 30), z: home || notes || R0.minor ? 0 : 130, a: -1 })
  }
  // A banner over each group of buildings, like a city's.
  for (const G of GROUPS) {
    const el = document.createElement('button'); el.className = 'lab realm group'; el.dataset.go = G.go; el.setAttribute('aria-label', G.name)
    el.style.setProperty('--c', ok(60, .1, G.hue))
    el.innerHTML = `<span class="rib">${crest(G.hue, G.sig)}<b>${G.name}</b></span>${G.sub ? `<span class="sub">${G.sub}</span>` : ''}`
    labelLayer.appendChild(el); LABELS.push({ el, x: G.x, y: G.y, z: G.z, a: -1 })
  }
  // The field notes wear their brand: a round badge on the face of each building, as in their notes.
  for (const { id } of BATCH.noBadges ? [] : BLOGS) {
    const P = PAGES[FULL_OF[id]]
    if (!P?.icon) continue
    const el = document.createElement('div'); el.className = 'brand-badge'; el.setAttribute('aria-hidden', 'true')
    el.innerHTML = `<img src="${abs(P.icon)}" alt="" decoding="async"${P.iconBg ? ` class="mark" style="background:${P.iconBg};padding:${Math.round((P.iconPad ?? 11) * .65)}px"` : ''}>`
    labelLayer.appendChild(el); BRANDS.push({ el, id })
  }
  // The start of the road.
  const st = document.createElement('div'); st.className = 'lvl start'
  st.innerHTML = `<button class="lv-hint" data-flow="next" aria-label="Start the walk at level 1">${BATCH.mobile2 && coarse ? 'Swipe down to begin' : 'Scroll to begin'}<i aria-hidden="true"></i></button>`
  labelLayer.appendChild(st); START.el = st
  // The lighthouse's light, lit when you reach the end of the road.
  BEACON.el = document.createElement('div'); BEACON.el.className = 'beacon'; BEACON.el.setAttribute('aria-hidden', 'true'); BEACON.el.innerHTML = '<i></i>'; labelLayer.appendChild(BEACON.el)
  // The levels: a name over each building.
  for (const L of LEVELS) {
    const B = ROOMS[L.id], realm = B.realm ? realmBy[B.realm] : null, about = B.realm === 'home', c = realm ? ok(50, .12, realm.hue) : ok(52, .08, 70)
    const el = document.createElement('div'); el.className = 'lvl' + (about ? ' about' : '') + (B.logo ? ' has-logo' : '') + (opens(L.id) ? ' case' : '') + (B.group === 'work' && BATCH.pillarNames ? ' plaque' : B.group || B.quiet || /^life-/.test(L.id) ? ' quiet' : '') + (visited.has(L.id) ? ' done' : ''); el.dataset.id = L.id; el.style.setProperty('--c', c)
    const cta = hasCase(L.id) ? (letterOf(letterFor(L.id)).blog ? 'Read the blog' : B.caseLabel || 'Read the case study') : B.see ? B.seeLabel || 'Read the story' : '', k = (B.tip || [])[0] || B.stat || B.key || B.body
    el.innerHTML = `<button class="lv-t" data-go="${L.id}" aria-label="${B.title}. ${k || ''}">${B.logo ? logoHTML(B.logo) : ''}<b>${B.short || B.title}</b>${k ? `<span class="lv-k">${k}</span>` : ''}${cta ? `<span class="lv-cta">${cta} →</span>` : ''}</button>`
    labelLayer.appendChild(el); L.el = el
    const peekOn = () => levelPeek(L.id)
    el.addEventListener('pointerenter', peekOn); el.addEventListener('focusin', peekOn)
    el.addEventListener('pointerleave', () => levelPeek(null)); el.addEventListener('focusout', () => levelPeek(null))
  }
}
// Peek at a level: its building lifts and glows, and a small note opens beside it.
let peeked = null
function levelPeek(id) {
  if (id === peeked) return
  if (peeked) levelOf[peeked]?.el.classList.remove('peek')
  peeked = id
  if (id) levelOf[id]?.el.classList.add('peek')
  cityHoverRoom(id)
  if (!coarse) hoverCard(id)
}

// The level nearest the place being looked at is the one you are at.
let here = -2
// A scroll the wrong way at the start: stay, and show which way is forward.
let wrongAt = 0
function wrongWay() {
  const t = performance.now(); if (t - wrongAt < 1200 || !START.el) return; wrongAt = t
  START.el.classList.remove('pulse'); void START.el.offsetWidth; START.el.classList.add('pulse')
}
function trackLevel() {
  const mid = cam.cy
  let best = -1, bd = Infinity
  LEVELS.forEach((L, i) => { const d = Math.abs(L.y - mid); if (d < bd) { bd = d; best = i } })
  if (mid > LEVELS[0].y + 380) best = -1
  if (best === here) return
  here = best
  LEVELS.forEach((L, i) => L.el.classList.toggle('here', i === best))
  onLevelChange(best)
}

// Names stand at one height over the buildings once they stand (on the plan before then), so
// they line up and stay clear of the company banners over tall towers.
// Pillar names are plaques, low on the shaft, every other one a little higher so neighbours never meet.
const roofOf = (id, v) => (city.ready ? (ROOMS[id]?.group ? (ROOMS[id].tagUp ? 64 : 14) : ROOMS[id]?.stop ? 74 : 40) : 20) * v.t + 14
// Nearer labels are larger, farther ones smaller and paler, as if printed on the land.
const depthScale = (z, v) => v.t ? clamp(v.D / z, .58, 1.18) : 1
// With BATCH.crispFog a name stays whole until the mist is a third in, then goes within a short
// stretch, so nothing lingers at a ghostly third of its ink.
const inkLeft = (z, v) => BATCH.crispFog ? 1 - smoothstep(.3, .5, fogAt(z, v)) : 1 - fogAt(z, v) * 1.15
const fade = (el, z, v) => { const a = inkLeft(z, v).toFixed(2); if (el._a !== a) { el._a = a; el.style.opacity = a } }
// Phones (BATCH.mobile): every name is kept inside the screen and out from under the top bar, and
// where two would overlap, the farther one waits until there is room. Sizes are measured once.
const narrow = () => BATCH.mobile && mobile(), TOP_BAR = 62, placedRects = []
const sizeOf = (o, el) => o.wh || (o.wh = [el.offsetWidth, el.offsetHeight])
addEventListener('resize', () => { for (const o of [...LABELS, ...LEVELS]) o.wh = null })
document.fonts?.ready.then(() => { for (const o of [...LABELS, ...LEVELS]) o.wh = null })
const keepIn = (X, w) => X > -40 && X < VW + 40 ? clamp(X, 8 + w / 2, VW - 8 - w / 2) : X, offEdge = r => r[0] < 0 || r[2] > VW
const meets = (a, b) => a[0] < b[2] + 6 && b[0] < a[2] + 6 && a[1] < b[3] + 4 && b[1] < a[3] + 4
const onWorkIsle = () => { const w = worldOf('work'); return cam.cy < w.y1 + 150 && cam.cy > w.y0 - 250 }
function tuck(o, on) { if (o.tucked !== on) { o.tucked = on; o.el.classList.toggle('tuck', on) } }
function placeLabels(v) {
  const cull = (X, Y, m = 120) => X < -m || X > VW + m || Y < -m || Y > VH + m, thin = narrow()
  placedRects.length = 0
  for (const L of LABELS) {
    // A company's banner leads you into its city, and bows out once you have passed it.
    let [X, Y, z] = project(L.x, L.y, L.z * v.t, v), gone = smoothstep(120, 420, L.y - cam.cy), a = cull(X, Y) || z <= NEAR || gone >= 1 ? 0 : 1
    const s = depthScale(z, v)
    if (thin && a) {
      const [w, h] = sizeOf(L, L.el); X = keepIn(X, w * s)
      const r = [X - w * s / 2, Y - h / 2 - h * s / 2, X + w * s / 2, Y - h / 2 + h * s / 2], under = r[1] < TOP_BAR || offEdge(r)
      tuck(L, under); if (!under) placedRects.push(r)
    } else if (L.tucked) tuck(L, false)
    L.el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) translate(-50%,-100%) scale(${s.toFixed(3)})`
    if (a) { const o = (inkLeft(z, v) * (1 - gone)).toFixed(2); if (L.el._a !== o) { L.el._a = o; L.el.style.opacity = o } }
    if (a !== L.a) { L.a = a; L.el.style.visibility = a ? 'visible' : 'hidden' }
  }
  const place = (el, x, y, h = 0) => {
    const [X, Y, z] = project(x, y, h, v), hide = cull(X, Y, 160) || z <= NEAR
    if (hide !== el._h) { el._h = hide; el.style.visibility = hide ? 'hidden' : 'visible' }
    if (!hide) { el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) scale(${depthScale(z, v).toFixed(3)})`; fade(el, z, v) }
  }
  place(START.el, START.x, START.y)
  // With BATCH.pillarNames, How I work's names are lettered on the ground at each plinth, and only
  // while you are on that island.
  const atWork = onWorkIsle()
  if (thin) placeLevelsNarrow(v)
  else for (const L of LEVELS) { const p = ROOMS[L.id].part, plaque = BATCH.pillarNames && ROOMS[L.id].group === 'work'; if (plaque) tuck(L, !atWork); place(L.el, p.c[0], p.c[1], plaque ? 0 : roofOf(L.id, v)) }
  // Each brand badge sits halfway up the side of its building that faces you. It is pressed on
  // like a seal once the island has built itself, one building after another.
  const ws = city.ready && city.active && v.t > .5 && GLS ? GLS.starts[REALM_IDX.writing] : 1e6, age = ws < 1e5 ? now() - ws : -1
  BRANDS.forEach((B, i) => {
    const p = ROOMS[B.id].part, at = 2.5 + i * .28, vis = age >= 0, on = age > at
    if (vis !== B.vis) { B.vis = vis; B.el.style.display = vis ? '' : 'none' }
    if (on !== B.on) { B.on = on; B.el.classList.toggle('on', on) }
    if (vis) place(B.el, p.c[0], 'x' in p ? p.y + p.h : p.cy + p.r * .9, (ROOM_TOP[B.id] || 40) * .5 * v.t)
    if (vis && !on && !BRANDS.wait) BRANDS.wait = setTimeout(() => { BRANDS.wait = 0; requestRender() }, 120)
  })
  trackLevel()
  // The beam turns over the sea from the lamp room, brighter the nearer the end.
  const lh = ROOMS['home-hello'].part, o = v.t ? 1 - smoothstep(END_Y + 250, END_Y + 750, cam.cy) : 0
  if (o > .01) { const [X, Y, z] = project(lh.cx, lh.cy, 216 * LIGHTHOUSE_K * v.t, v), k = depthScale(z, v) * 1.5 * LIGHTHOUSE_K; BEACON.el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) scale(${k.toFixed(3)},${(k * v.sp).toFixed(3)})` }
  if (Math.abs(o - BEACON.o) > .01) { BEACON.o = o; BEACON.el.style.opacity = o.toFixed(2) }
  // Arriving at the end of the road, the lighthouse's note opens by itself, once a visit (BATCH.finale).
  if (BATCH.finale && cam.cy <= END_Y + 60 && !BEACON.signed && city.active) {
    if (cardFor === 'home-hello') BEACON.signed = true
    else if (!cardFor && !caseId) { BEACON.signed = true; setTimeout(() => { if (!cardFor && !caseId) showCard('home-hello', true) }, 900) }
    // Another note still open on arrival: look again once it has gone, even if nothing else redraws.
    else if (!BEACON.wait) BEACON.wait = setTimeout(() => { BEACON.wait = 0; requestRender() }, 800)
  }
  START.el.classList.toggle('gone', cam.cy < START_Y - 260)
}

// The narrow-screen pass: place every name, nearest first, and tuck any that would land on one
// already placed, under the top bar, or off the edge of the screen.
function placeLevelsNarrow(v) {
  const order = []
  for (const L of LEVELS) {
    const p = ROOMS[L.id].part, plaque = BATCH.pillarNames && ROOMS[L.id].group === 'work', [X, Y, z] = project(p.c[0], p.c[1], plaque ? 0 : roofOf(L.id, v), v)
    const hide = X < -160 || X > VW + 160 || Y < -160 || Y > VH + 160 || z <= NEAR
    if (hide !== L.el._h) { L.el._h = hide; L.el.style.visibility = hide ? 'hidden' : 'visible' }
    if (hide) continue
    // The pillars' lettering is too small to read at a phone's distance: there a tap names them.
    order.push({ L, X, Y, z, plaque, quiet: L.el.classList.contains('quiet') || plaque })
  }
  order.sort((a, b) => a.z - b.z)
  for (const o of order) {
    const { L, Y, z } = o, s = depthScale(z, v), [w, h] = sizeOf(L, L.el.firstElementChild), X = keepIn(o.X, w * s)
    const top = o.plaque ? Y + 12 * s : Y - h * s, r = [X - w * s / 2, top, X + w * s / 2, top + h * s]
    const out = o.quiet || r[1] < TOP_BAR || r[3] > VH || offEdge(r) || placedRects.some(q => meets(q, r))
    tuck(L, out); if (!out) placedRects.push(r)
    L.el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) scale(${s.toFixed(3)})`; fade(L.el, z, v)
  }
}
