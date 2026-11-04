// =====================================================================================
// Boot.
// =====================================================================================
function onRender(v) { placeLabels(v); cityFrame(v); placeCard(v); placeRail(v); placeSky(v); placeGym(v); placeWip(); placeLit(v); placeStars(v); sideFrame(v); playMoments() }
function onSettle() { cityFrame(view()); cardOnSettle(); lifeCull(); if (pointerAt && city.active && !caseId) cityHover(...pointerAt) }
function boot() {
  ground.style.width = W + 'px'; ground.style.height = H + 'px'
  // The paper and its grain run on past the drawing on every side.
  const paper = paintPaper(), grain = document.createElement('div'), grainURL = grainTile().toDataURL('image/png')
  paper.id = 'paper'; grain.id = 'grain'; grain.style.backgroundImage = `url(${grainURL})`
  for (const el of [paper, grain]) Object.assign(el.style, { left: -PM + 'px', top: -PMN + 'px', width: W + 2 * PM + 'px', height: H + PM + PMN + 'px' }), ground.appendChild(el)
  document.documentElement.style.setProperty('--grain', `url(${grainURL})`)
  // Patterns, defined once and shared by every world's drawing.
  const defs = document.createElementNS(SVGNS, 'svg')
  defs.setAttribute('width', 0); defs.setAttribute('height', 0); defs.setAttribute('aria-hidden', 'true'); defs.style.position = 'absolute'
  defs.innerHTML = `<defs><pattern id="poche" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V4" stroke="var(--ink)" stroke-width=".7"/></pattern>`
    + `<pattern id="stip" width="44" height="44" patternUnits="userSpaceOnUse">${Array.from({ length: 26 }, (_, i) => { const r = rng(i + 7); return `<circle cx="${f(r() * 44)}" cy="${f(r() * 44)}" r="${f(.5 + r() * .5)}" fill="var(--ink-2)"/>` }).join('')}</pattern></defs>`
  ground.appendChild(defs)
  // One drawing per world.
  drawSheet().forEach((html, i) => {
    const y0 = BANDS[i] - 200, y1 = BANDS[i + 1] + 200, el = document.createElementNS(SVGNS, 'svg')
    el.setAttribute('class', 'band'); el.setAttribute('width', W); el.setAttribute('height', y1 - y0); el.setAttribute('viewBox', `0 ${y0} ${W} ${y1 - y0}`); el.setAttribute('aria-hidden', 'true')
    el.style.top = y0 + 'px'; el.innerHTML = html
    ground.appendChild(el)
  })
  for (const { id } of BLOGS) {
    const B = ROOMS[id], p = FULLCASE_DATA[FULL_OF[id]].blocks.find(x => x.t === 'p'), text = p ? keep(p.html).replace(/<[^>]+>/g, '').trim() : ''
    B.key = B.stat = `Field note · ${readMins(caseBody(id))} min read`
    if (text) B.body = (text.match(/^.{40,260}?[.!?](?=\s|$)/) || [text.slice(0, 220) + '…'])[0]
  }
  buildLabels(); buildSky(); buildGym(); buildWip(); if (BATCH.wanderCat) buildCat(); markInert()
  // No cover: the map opens straight onto the title, and the eye leans in.
  const deep = decodeURIComponent(location.hash.slice(1))
  // One calm entrance (BATCH.calmOpen): a blank sheet stands over the page while the fonts load, the
  // warm-up runs and the 3D city gets ready. It stays at least LOADER_MIN from the start; then the ink
  // spreads out from the middle until the whole map has appeared (18-spread.js); the eye leans in once
  // the title has stood a moment, while the ink is still reaching the corners. Without WebGL2 the plain
  // sheet simply fades; without the switch, it is simply removed.
  const loader = $('loader'), LOADER_MIN = 1100
  if (!BATCH.calmOpen || reduce) loader?.remove(); else city.built = true
  let spread = null
  const unload = () => {
    city.built = false
    if (!loader?.isConnected) return
    const ink = spread?.run()
    if (ink) { ink.then(() => loader.remove()); return true }
    loader.classList.add('done'); setTimeout(() => loader.remove(), 1400)
  }
  const linger = () => new Promise(r => setTimeout(r, Math.max(0, LOADER_MIN - performance.now())))
  // The first sight is straight down on the title; the eye leans in as the map comes alive.
  setAnchor(); cam.cy = START_Y; cam.intro = deep || reduce ? 0 : 1; clampCam()
  ground.style.setProperty('--hatch', '.7'); ground.style.setProperty('--lw', lineWeight(cam.s))
  render()
  if (loader?.isConnected && !deep) spread = prepareSpread(loader)
  else BARE = null
  // The web fonts' stylesheets load without holding up the first paint (build.py), so the loader shows
  // at once instead of a blank tab; the fonts count as ready once those sheets are in and their faces loaded.
  const fontsIn = Promise.all([...document.querySelectorAll('link[data-font]')].map(l => l.media === 'all' ? 0 : new Promise(r => { l.addEventListener('load', r, { once: true }); l.addEventListener('error', r, { once: true }) })))
    .then(() => new Promise(requestAnimationFrame)).then(() => document.fonts.ready)
  fontsIn.then(render)
  performance.mark('map-ready')
  startLife(); buildCompass(); prewarmGL(); const warm = prewarmPage()
  if (deep) { warm.then(unload); const [did, mode] = deep.split('/'); setTimeout(() => ROOMS[did] || realmBy[did] || did === 'earlier' ? go(did, { enter: mode === 'read' }) : openCase(did, [VW - 200, 40]), 300) }
  // The lean-in waits for the first-visit warm-up (BATCH.prewarm) to finish, so it never stutters.
  else Promise.race([fontsIn, new Promise(r => setTimeout(r, 1500))]).then(() => warm).then(() => BATCH.calmOpen && cityReady().then(linger)).then(() => {
    const inking = unload()
    setTimeout(() => leanIn(2600), inking ? 1200 : BATCH.calmOpen ? 650 : 250)
  })
  let resizeT = 0
  addEventListener('resize', () => { VW = innerWidth; VH = innerHeight; setAnchor(); clampCam(); cityResize(); ground.style.setProperty('--lw', lineWeight(cam.s)); if (cardFor) measureCard(); render(); clearTimeout(resizeT); resizeT = setTimeout(render, 120) })
  window.__map = { cam, go, flyTo, fitAll, render, view, project, city, cam, LEVELS, ROOMS, DECOR, decorAt, decorState: () => [decorRaf, decorIdle], openCase, scrollBy, pick: (x, y) => cityPick(x, y), gls: () => GLS && ({ p: !!GLS.pieceP.u, s: !!GLS.shadowP.u, c: !!GLS.compP.u }) }
}
boot()
