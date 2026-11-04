// =====================================================================================
// First-visit smoothness (BATCH.prewarm). The graphics card builds a program the first time it
// meets each kind of drawing: a ribbon, a shadowed slip, a gradient card, a masked beam, the ink
// map's hatching, a footprint on the tilted map. On a first visit those builds froze the flight at
// each new place. While the title is up, a copy of every kind is drawn once, nearly transparent,
// then taken away, so the builds happen before you start moving; the lean-in waits until frames
// flow again. Later visits find the programs already built, so this takes a moment only.
// =====================================================================================
function prewarmPage() {
  if (!BATCH.prewarm) return Promise.resolve()
  const add = (to, el, ...cls) => { const c = el.cloneNode(true); c.classList.add('pw', ...cls); to.appendChild(c); return c }
  // Flat things, in screen space: labels, banners, the moments that ride the labels layer, cards and effects.
  const box = document.createElement('div')
  box.className = 'prewarm'; box.setAttribute('aria-hidden', 'true'); box.inert = true
  // Every label and banner, as it stands and as it looks when a building is hovered.
  for (const el of labelLayer.children) { add(box, el); if (el.classList.contains('lvl')) add(box, el, 'peek') }
  // Labels shrink and grow with distance (depthScale, .58 to 1.18), and their soft shadows and halos need
  // a blur program for each band of size. So one label of each kind is drawn again across that range.
  const kinds = new Map()
  for (const el of labelLayer.children) { const k = el.className.replace(/\b(here|done|peek|tuck)\b/g, '').trim(); if (!kinds.has(k)) kinds.set(k, el) }
  for (const s of [.58, .7, .82, .94, 1.06, 1.18]) {
    const row = document.createElement('div'); row.className = 'pw pw-scale'; row.style.scale = s
    for (const el of kinds.values()) { add(row, el); if (el.classList.contains('lvl')) add(row, el, 'peek') }
    box.appendChild(row)
  }
  // One card of each kind: a picture window, a photo, a grid of covers, a pillar, a stop, an NDA note,
  // a field note, the lighthouse's sign-off (pinned), and the ink writing itself on.
  const saved = [panelEl.className, note.innerHTML, panelEl.style.cssText]
  for (const id of ['cult-cart', 'life-lift', 'life-books', 'work-data', 'stop-west', 'hinge-ai', 'hinge-carehub', 'blog-pibit', 'home-hello']) {
    if (!ROOMS[id]) continue
    showRoom(id); const c = add(box, panelEl, 'open'); c.style.cssText = ''
    if (id === 'home-hello') c.classList.add('pinned')
    if (id === 'cult-cart') { c.querySelector('.note')?.classList.add('write'); c.style.clipPath = 'inset(0 0 10% 0 round 4px)' }
  }
  ;[panelEl.className, note.innerHTML, panelEl.style.cssText] = saved
  // The effects that only appear later on: the lighthouse's beam, the evening tint, the sky's sprites,
  // a gull flock and a cloud like the ones the moments bring.
  if (BEACON.el) add(box, BEACON.el).style.opacity = '1'
  const dusk = $('dusk'); if (dusk) { const d = add(box, dusk); d.style.display = 'block'; d.style.opacity = '.2' }
  for (const el of sky.children) add(box, el)
  const flock = document.createElement('div'); flock.className = 'flock pw'; flock.innerHTML = GULL; box.appendChild(flock)
  const cloud = document.createElement('div'); cloud.className = 'cloud pw'; cloud.style.width = '300px'; cloud.innerHTML = cloudSVG(rng(7), 300); box.appendChild(cloud)
  // The rail in each state it takes as you travel: places passed, the place you're at, and the names showing.
  if (rail.isConnected) {
    const r = add(box, rail, 'pw-rail'); r.classList.add('ui', 'rail')
    r.querySelectorAll('button').forEach((b, i) => { b.setAttribute('aria-current', String(i === 3)); b.classList.toggle('past', i < 3) })
    r.querySelectorAll('span').forEach(s => { s.style.opacity = '1'; s.style.transform = 'none' })
  }
  // Things made only when they're needed: a speech bubble.
  for (const [cls, html] of [['hello', '<span>Rep 1</span>']]) {
    const el = document.createElement('div'); el.className = cls + ' pw'; el.innerHTML = html; box.appendChild(el)
  }
  // The whole ink map, small: every section of the road, with every kind of line, fill and engraving.
  // (The first SVG only holds the shared patterns, which the copies use from where it is.)
  for (const svg of ground.querySelectorAll(':scope > svg')) if (svg.children.length > 1 || svg.firstElementChild?.tagName !== 'defs') add(box, svg, 'pw-ink')
  // Things that ride the tilted map itself: footprints, tyre tracks, ships, the serpent, the whale.
  // They are drawn on the same plane, by the title, because a tilted drawing can need its own programs.
  const plane = document.createElement('div'); plane.className = 'prewarm-g'; plane.setAttribute('aria-hidden', 'true')
  plane.style.transform = `translate(${f(cam.cx)}px, ${f(cam.cy + 80)}px)`
  for (const el of ground.querySelectorAll(':scope > .sprite')) add(plane, el)
  const whale = document.createElement('div'); whale.className = 'sprite breach pw'; whale.innerHTML = '<img src="assets/whale.webp" width="170" height="105" alt=""><i></i><i></i>'; plane.appendChild(whale)
  document.body.appendChild(box); ground.appendChild(plane)
  // Keep the copies for a few drawn frames (a frame that needs a new program waits for it), then wait
  // until frames come steadily again before letting the opening move.
  const frames = n => new Promise(r => { const step = () => --n ? requestAnimationFrame(step) : r(); requestAnimationFrame(step) })
  const steady = () => new Promise(r => { let last = performance.now(), ok = 0; const t0 = last
    const step = now => { ok = now - last < 40 ? ok + 1 : 0; last = now; ok >= 4 || now - t0 > 6000 ? r() : requestAnimationFrame(step) }; requestAnimationFrame(step) })
  // Then nudge a few copies so part of what was drawn is drawn again: a partial redraw of a tile uses its
  // own variants of the programs, and those otherwise turn up mid-flight, depending on timing.
  const nudge = () => { for (const el of [...box.querySelectorAll('.pw-ink, .lvl.pw b, .lab.pw b')].filter((_, i) => i % 5 === 0)) el.style.opacity = '.99' }
  return frames(4).then(nudge).then(() => frames(3)).then(() => { box.remove(); plane.remove() }).then(steady)
}
