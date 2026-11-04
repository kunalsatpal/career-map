// =====================================================================================
// How I work, read through (BATCH.pillarStars). A pillar whose note stays open a moment gets a
// small star over its crown. When all five have theirs, an ink line joins them into a
// constellation, the planks over the strait glow, and the lamps on the Isle of Kunal's path
// light one by one, north from the bridge. Nothing runs until a pillar is read; the stars are
// placed each frame only while How I work is in view.
// =====================================================================================
const PILLAR_IDS = ['work-grow', 'work-strategy', 'work-data', 'work-tools', 'work-code']
const STAR_Z = 164, READ_MS = 900
// A compass-point star as the engraver cuts one: gold, outlined in ink, on a faint gold halo.
const STAR = '<circle class="halo" r="9"/><path d="M0 -6.5L1.5 -1.5L6.5 0L1.5 1.5L0 6.5L-1.5 1.5L-6.5 0L-1.5 -1.5Z"/>'
const PSTARS = { read: new Set(), el: null, line: null, glow: null, dots: {}, lit: false }

// Called whenever a note is shown (12-panel). It counts once the note has stayed open READ_MS.
function pillarRead(id) {
  if (!BATCH.pillarStars || PSTARS.lit || PSTARS.read.has(id) || !PILLAR_IDS.includes(id)) return
  // A note opened from the rail or menu waits for the flight there before it opens: keep checking.
  const check = () => {
    if (current !== id || PSTARS.read.has(id)) return
    if (!panelEl.classList.contains('open')) return setTimeout(check, READ_MS)
    PSTARS.read.add(id); starOn(id)
    if (PSTARS.read.size === PILLAR_IDS.length) setTimeout(lightTheWay, reduce ? 0 : 500)
  }
  setTimeout(check, READ_MS)
}

function starsLayer() {
  if (PSTARS.el) return PSTARS.el
  const el = document.createElementNS(SVGNS, 'svg')
  el.setAttribute('class', 'pstars'); el.setAttribute('aria-hidden', 'true')
  // Over the place banners, so the middle star is never lost under About me's.
  labelLayer.appendChild(el); PSTARS.el = el
  return el
}
function starOn(id) {
  const el = starsLayer(), g = document.createElementNS(SVGNS, 'g'), inner = document.createElementNS(SVGNS, 'g')
  g.setAttribute('class', 'st'); inner.innerHTML = STAR; g.appendChild(inner); el.appendChild(g)
  PSTARS.dots[id] = g; placeStars(view())
  if (reduce) return
  inner.animate([{ transform: 'scale(0) rotate(-90deg)', opacity: 0 }, { transform: 'scale(1.4) rotate(10deg)', opacity: 1, offset: .6 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.2, .8, .3, 1)', fill: 'both' })
  const [x, y] = ROOMS[id].part.c
  flecks([x, y, STAR_Z], 'wspark', 6, 10)
}

// All five: the constellation, then the bridge, then the lamps.
function lightTheWay() {
  if (PSTARS.lit) return
  PSTARS.lit = true
  // The line in ink, over a soft gold wash, drawn from the first star to the last.
  const mk = cls => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('class', cls); p.setAttribute('pathLength', '1'); starsLayer().prepend(p); return p }
  PSTARS.line = mk('cl'); PSTARS.glow = mk('cg'); placeStars(view())
  const DRAW = 1800
  if (!reduce) {
    for (const p of [PSTARS.line, PSTARS.glow]) p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: DRAW, easing: 'linear', fill: 'both' })
    // Each star brightens as the line reaches it.
    PILLAR_IDS.forEach((id, i) => setTimeout(() => {
      PSTARS.dots[id]?.firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)', offset: .35 }, { transform: 'scale(1)' }], { duration: 600, easing: 'cubic-bezier(.2, .8, .3, 1)' })
      const [x, y] = ROOMS[id].part.c; flecks([x, y, STAR_Z], 'wspark', 5, 12)
    }, i / (PILLAR_IDS.length - 1) * DRAW))
    // A word, on a slip of paper over the middle of the constellation, once the line is drawn.
    setTimeout(() => { const [x, y] = ROOMS['work-data'].part.c; pinNote('That’s how I work. Now come and meet me.', x, y, STAR_Z + 26, 4200) }, DRAW)
  } else for (const p of [PSTARS.line, PSTARS.glow]) p.style.strokeDashoffset = 0
  setTimeout(glowStrait, reduce ? 0 : 1500)
  setTimeout(lightPath, reduce ? 0 : 1900)
}
// The gap in the east hedge of About me's yard (09-city garden), facing the path.
function yardGate() {
  const g = PARTS.find(p => p.t === 'garden' && p.realm === 'home')
  return g && { x: g.x + g.w, y: g.y + g.h * .5, inside: g.x + g.w - 46 }
}

// The planks over the strait, where the isle path leaves the land (as 04-ground lays them).
function straitGap() {
  let wet = null
  for (const p of isleS2) { if (onLand(...p)) { if (wet) return wet } else (wet ||= []).push(p) }
  return null
}
function glowStrait() {
  const g = straitGap()
  if (!g) return
  const a = g[0], b = g.at(-1), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L
  const [x1, y1, x2, y2] = [a[0] - ux * 14, a[1] - uy * 14, b[0] + ux * 14, b[1] + uy * 14], pad = 40
  const x0 = Math.min(x1, x2) - pad, y0 = Math.min(y1, y2) - pad, w = Math.abs(x2 - x1) + 2 * pad, h = Math.abs(y2 - y1) + 2 * pad
  const ln = (sw, op) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke-width="${sw}" opacity="${op}"/>`
  const el = sprite(`<svg width="${f(w)}" height="${f(h)}" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" aria-hidden="true">${ln(52, .16)}${ln(34, .24)}${ln(18, .36)}</svg>`, 'strait-glow')
  el.style.transform = `translate(${f(x0)}px,${f(y0)}px)`
  if (!reduce) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1400, easing: 'ease-out', fill: 'both' })
}
// The lamps along the path, south to north up to the yard, each a beat after the last.
function lightPath() {
  if (!city.active || !DECOR.length) return
  const ids = []
  // Only as far as the yard's gate: the lamps lead to About me, as the route does.
  const b = GEO.isleBox, gate = yardGate()?.y ?? b.y0
  DECOR.forEach((D, id) => { if (D?.kind === 'lamp' && D.x > b.x0 && D.x < b.x1 && D.y > gate - 40 && D.y < b.y1) ids.push(id) })
  ids.sort((p, q) => DECOR[q].y - DECOR[p].y).slice(0, 8)
    .forEach((id, i) => setTimeout(() => { if (!LIT.has(id)) lamp(id) }, reduce ? 0 : i * 320))
}

// Each frame (19-boot): the stars over the crowns, and the line through them.
function placeStars(v) {
  const el = PSTARS.el
  if (!el) return
  const pts = PILLAR_IDS.map(id => { const [x, y] = ROOMS[id].part.c; return at3(x, y, STAR_Z, v) })
  const show = onWorkIsle() && !caseId && pts.every(p => p[2] > NEAR)
  el.style.display = show ? '' : 'none'
  if (!show) return
  PILLAR_IDS.forEach((id, i) => { const g = PSTARS.dots[id]; if (g) g.setAttribute('transform', `translate(${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}) scale(${depthScale(pts[i][2], v).toFixed(3)})`) })
  const d = 'M' + pts.map(([X, Y]) => `${X.toFixed(1)} ${Y.toFixed(1)}`).join('L')
  PSTARS.line?.setAttribute('d', d); PSTARS.glow?.setAttribute('d', d)
}

// A note on paper, held over a point on the map while the map moves, then faded.
function pinNote(html, x, y, z, life) {
  document.querySelector('.wnote')?.remove()
  const el = document.createElement('div'); el.className = 'wnote'; el.setAttribute('aria-live', 'polite'); el.innerHTML = `<p>${html}</p>`
  labelLayer.appendChild(el)
  const t0 = performance.now()
  const step = () => {
    const k = (performance.now() - t0) / life
    if (k >= 1 || caseId || !el.isConnected) return el.remove()
    const [X, Y] = at3(x, y, z)
    el.style.transform = tr(X, Y); el.style.opacity = (k < .06 ? k / .06 : k > .85 ? (1 - k) / .15 : 1).toFixed(2)
    requestAnimationFrame(step)
  }
  step()
}

// =====================================================================================
// Pieces with a trick of their own (09-city trickF): the pillars' crowns (BATCH.pillarCrowns), and on
// the Isle of Kunal the hammock's book (hammock), the cherry tree (cherryTree) and the two friends on
// the bench (wavers). Hovering the place plays its pieces; so does touching one, and now and then one
// stirs on its own, as the other props do (16-delight stir).
// =====================================================================================
function playTrick(id, idle = false) {
  const D = DECOR[id], T = D?.trick
  if (!T || !decorLive() || decorBusy(id)) return
  decorPlay(id, T.kind, T.axis, T.amount, idle)
  if (!idle && T.fx) TRICK_FX[T.fx]?.(D)
}
function playRoom(room) {
  let i = 0
  DECOR.forEach((D, id) => { if (D?.room === room && D.trick) { const k = i++; k ? setTimeout(() => playTrick(id), 220 * k) : playTrick(id) } })
}
// What a piece throws off as it moves: a leaf from the tree, petals from the cherry, sparks off the anvil.
function fall(D, cls, n) {
  const v = view()
  for (let i = 0; i < n; i++) {
    const [X, Y, z] = at3(D.x + (Math.random() - .5) * D.r * 1.6, D.y, D.base + D.h * (.45 + Math.random() * .4), v), k = depthScale(z, v), dx = (Math.random() - .3) * 22 * k, r0 = Math.random() * 180
    fly('fall ' + cls, '<i></i>', [
      { transform: tr(X, Y, ` scale(${k.toFixed(3)}) rotate(${r0}deg)`), opacity: 0 },
      { opacity: 1, offset: .12 },
      { transform: tr(X + dx * .6, Y + 14 * k, ` scale(${k.toFixed(3)}) rotate(${r0 + 120}deg)`), offset: .5 },
      { transform: tr(X + dx, Y + (26 + Math.random() * 12) * k, ` scale(${k.toFixed(3)}) rotate(${r0 + 220}deg)`), opacity: 0 }],
      { duration: 1700 + Math.random() * 600, delay: i * 160, easing: 'cubic-bezier(.3, .2, .5, 1)' })
  }
}
const TRICK_FX = {
  leaf: D => fall(D, 'leaf', 1),
  petals: D => fall(D, 'petal', 5),
  // The hammer's head comes down on the anvil's face: sparks there, as it strikes and again.
  sparks: D => { const at = [D.x + D.r * 2.5, D.y - 1, D.base]; flecks(at, 'wspark', 7, 12); setTimeout(() => flecks(at, 'wspark', 5, 10), 640) },
}
if (BATCH.pillarCrowns) for (const id of PILLAR_IDS) ROOM_FX[id] = () => playRoom(id)
if (BATCH.hammock) ROOM_FX['life-books'] = () => playRoom('life-books')
if (BATCH.wavers) {
  ROOM_FX['life-people'] = () => playRoom('life-people')
  // They wave as you come up to the yard, too.
  MOMENTS.push({ a: 1150, b: 1480, fire: () => playRoom('life-people'), armed: true })
}
if (BATCH.cherryTree) { const steam = ROOM_FX['life-anime']; ROOM_FX['life-anime'] = () => { steam?.(); playRoom('life-anime') } }
