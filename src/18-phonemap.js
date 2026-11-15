// =====================================================================================
// The phone page: the same map, told as one scroll down a sheet of paper. Only phones build
// it (boot() never runs on them). Every top-level name here is prefixed pm.
// =====================================================================================
let pmCase = null, pmHist = false, pmSeq = 0, pmOpener = null, pmSheetOn = false
const PM_WORLD_KICK_REALMS = ['hinge', 'gojek', 'cult']
const PM_LIFE = ['life-lift', 'life-books', 'life-games', 'life-anime', 'life-people']
const PM_WORK = ['work-grow', 'work-strategy', 'work-data', 'work-tools', 'work-code']
const PM_EARLIER_BLURB = 'Where it started: a campus design team, two internships, and five small stops.'

// The buildings of one chapter, in the content's order.
function pmIds(key) {
  const ids = key === 'earlier' ? [...roomsOf('iit').map(x => x[0]), ...roomsOf('intern').map(x => x[0]), ...STOPS.map(S => S.id)]
    : key === 'writing' ? roomsOf('writing').map(x => x[0])
    : key === 'work' ? PM_WORK : key === 'home' ? PM_LIFE
    : roomsOf(key).map(x => x[0])
  return ids.filter(id => ROOMS[id])
}
// The short line under a building's name in its chapter.
function pmSub(id) {
  const B = ROOMS[id]
  if (B.stop) return [B.stat, B.body].filter(Boolean).join(' · ')
  const t = B.tip?.[0]
  if (Array.isArray(t)) return t[0] === B.title ? t[1] : t.join(' · ')
  if (t) return t
  return B.key || B.stat || ''
}
// The note's three lines: a label, the headline, and one line of text.
function pmCopy(id) {
  const B = ROOMS[id], t = B.tip
  if (t && Array.isArray(t[0])) return { label: t[0][0], head: t[0][1], line: t[1] }
  if (t) return { label: B.stop ? B.stat : B.title, head: t[0], line: t[1] }
  if (B.stop) return { label: B.stat, head: B.title, line: B.body }
  return { label: '', head: B.title, line: [B.stat, B.body].filter(Boolean).join(' ') }
}
function pmKick(key, W) {
  if (key === 'earlier') return W.years
  if (PM_WORLD_KICK_REALMS.includes(key)) return [realmBy[key].role, realmBy[key].years].filter(Boolean).join(' · ')
  return ''
}
function pmBlurb(key) {
  if (key === 'earlier') return PM_EARLIER_BLURB
  if (key === 'work') return ''
  return realmBy[key]?.blurb || ''
}
function pmLeg(k) {
  // Odd legs (counting from one) swing left to right, even ones back again; the road runs off both ends.
  const right = k % 2 === 0, sx = right ? 125 : 265, ex = right ? 265 : 125, d = `M${sx},-14 C${sx},70 ${ex},80 ${ex},164`
  const cls = k === 3 ? ' pm-shore' : k > 3 ? ' pm-sea' : ''
  return `<div class="pm-leg${cls}" aria-hidden="true"><svg viewBox="0 0 390 150" width="100%" height="150" focusable="false">`
    + `<path class="pm-road-ink" d="${d}"/><path class="pm-road-in" d="${d}"/><g class="pm-feet"></g></svg></div>`
}
// Eight footprints on the road itself, alternating a little either side of the centreline.
function pmFeet(leg) {
  const road = leg.querySelector('.pm-road-in'), g = leg.querySelector('.pm-feet'), L = road.getTotalLength()
  for (let j = 0; j < 8; j++) {
    const t = (j + .5) / 8 * L, p = road.getPointAtLength(t), q = road.getPointAtLength(Math.min(L, t + 1)), r = road.getPointAtLength(Math.max(0, t - 1))
    const a = Math.atan2(q.y - r.y, q.x - r.x), side = j % 2 ? 1.7 : -1.7, nx = -Math.sin(a) * side, ny = Math.cos(a) * side
    const e = document.createElementNS(SVGNS, 'ellipse')
    e.setAttribute('class', 'pm-foot'); e.setAttribute('cx', 0); e.setAttribute('cy', 0); e.setAttribute('rx', 1.1); e.setAttribute('ry', 2)
    e.setAttribute('transform', `translate(${(p.x + nx).toFixed(1)} ${(p.y + ny).toFixed(1)}) rotate(${(a * 180 / Math.PI - 90).toFixed(1)})`)
    e.setAttribute('style', `--i:${j}`)
    g.appendChild(e)
  }
}
// Pins that would sit on each other are pushed apart: kept inside the picture's sides, then spread vertically.
function pmSpreadPins(fig) {
  const pins = [...fig.querySelectorAll('.pm-pin')]; if (!pins.length) return
  pins.forEach(p => { p.style.removeProperty('--dx'); p.style.removeProperty('--dy') })
  const F = fig.getBoundingClientRect()
  const R = pins.map(p => { const r = p.getBoundingClientRect(); return { p, x0: r.left - F.left, x1: r.right - F.left, y0: r.top - F.top, y1: r.bottom - F.top, dx: 0, dy: 0 } })
  for (const q of R) {
    if (q.x0 < 8) q.dx = 8 - q.x0; else if (q.x1 > F.width - 8) q.dx = F.width - 8 - q.x1
    q.x0 += q.dx; q.x1 += q.dx
  }
  for (let pass = 0; pass < 30; pass++) {
    let moved = false
    for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
      const a = R[i], b = R[j]
      const hx = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) + 4, vy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) + 4
      if (hx <= 0 || vy <= 0) continue
      const up = (a.y0 + a.y1) <= (b.y0 + b.y1) ? a : b, down = up === a ? b : a
      up.dy -= vy / 2; up.y0 -= vy / 2; up.y1 -= vy / 2
      down.dy += vy / 2; down.y0 += vy / 2; down.y1 += vy / 2
      moved = true
    }
    if (!moved) break
  }
  for (const q of R) { q.p.style.setProperty('--dx', q.dx.toFixed(1) + 'px'); q.p.style.setProperty('--dy', q.dy.toFixed(1) + 'px') }
}
function pmScene(key, W) {
  const S = typeof PHONE_SCENES !== 'undefined' && PHONE_SCENES[key]
  if (!S) return ''
  const pins = Object.entries(S.pins || {}).filter(([id]) => ROOMS[id]).map(([id, [x, y]], i) => {
    const dark = hasCase(id)
    return `<button class="pm-pin${dark ? ' dark' : ''}" type="button" data-room="${id}" style="left:${x}%;top:${y}%;--i:${i}">${esc(ROOMS[id].title)}${dark ? ' →' : ''}</button>`
  }).join('')
  return `<figure class="pm-scene" style="aspect-ratio:${S.w} / ${S.h}"><img src="${abs(S.img)}" width="${S.w}" height="${S.h}" loading="lazy" decoding="async" alt="A drawing of ${esc(W.name)} on the map">${pins}</figure>`
}
function pmChapter(W, i, n) {
  const key = W.key, R = realmBy[key], kick = pmKick(key, W), blurb = pmBlurb(key)
  const logo = R && PM_WORLD_KICK_REALMS.includes(key) ? crest(R.hue, R.sig) : R?.logo ? `<span class="logo"><img src="${abs('assets/logos/' + R.logo + '.png')}" alt="" decoding="async"></span>` : ''
  const rooms = pmIds(key).map(id => `<li><button class="pm-room" type="button" data-room="${id}"><span class="pm-rt"><b>${esc(ROOMS[id].title)}</b><span>${esc(pmSub(id))}</span></span><i aria-hidden="true">${hasCase(id) ? '→' : '+'}</i></button></li>`).join('')
  return pmLeg(i) + `<section class="pm-city${i >= 3 ? ' pm-sea' : ''}" id="pm-${key}" data-world="${key}" aria-labelledby="pm-h-${key}">`
    + (kick ? `<p class="pm-kick">${esc(kick)}</p>` : '')
    + `<h2 id="pm-h-${key}">${logo}${esc(W.name)}</h2>`
    + (blurb ? `<p class="pm-blurb">${esc(blurb)}</p>` : '')
    + pmScene(key, W)
    + `<ul class="pm-rooms">${rooms}</ul></section>`
}

function pmNote(id, opener) {
  const B = ROOMS[id]; if (!B) return
  pmOpener = opener || document.activeElement
  const C = pmCopy(id), sh = $('pm-sheet')
  let pic = ''
  if (B.pics) {
    const cols = B.pics.length >= 12 ? 4 : B.pics.length === 2 ? 2 : 3
    pic = `<div class="pm-sh-pics" style="--cols:${cols};--ratio:${B.grid === 'books' ? '2 / 3' : '4 / 3'}">${B.pics.map(p => `<img src="${abs(p)}" alt="" loading="lazy" decoding="async">`).join('')}</div>`
  } else if (B.hoverSrc || B.img) {
    pic = `<figure class="pm-sh-pic"><img src="${abs(B.hoverSrc || B.img)}" alt="${esc(B.alt || '')}" loading="lazy" decoding="async"></figure>`
  }
  const links = (B.links || []).map(([t, h]) => h.startsWith('mailto:') ? `<a class="pm-btn" href="${h}">${esc(t)}</a>`
    : `<a class="pm-btn" href="${abs(h)}" target="_blank" rel="noopener">${esc(t)}</a>`).join('')
  const act = hasCase(id) ? `<button class="pm-btn dark" type="button" data-read="${id}">Read now →</button>`
    : B.href && !B.href.startsWith('#') ? `<a class="pm-btn" href="${abs(B.href)}" target="_blank" rel="noopener">Full case study ↗</a>` : ''
  sh.innerHTML = `<div class="pm-back" data-x></div>`
    + `<div class="pm-panel" role="dialog" aria-modal="true" aria-labelledby="pm-sh-h">`
    + `<button class="pm-x" type="button" data-x aria-label="Close"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14"/></svg></button>`
    + pic + (C.label ? `<p class="pm-label">${esc(C.label)}</p>` : '')
    + `<h3 id="pm-sh-h">${esc(C.head)}</h3>` + (C.line ? `<p class="pm-line">${esc(C.line)}</p>` : '')
    + ((links || act) ? `<div class="pm-sh-links">${links}${act}</div>` : '') + `</div>`
  sh.hidden = false
  document.documentElement.classList.add('pm-lock')
  requestAnimationFrame(() => sh.classList.add('on'))
  pmSheetOn = true
  sh.querySelector('.pm-x').focus({ preventScroll: true })
}
function pmSheetClose(noFocus) {
  if (!pmSheetOn) return
  pmSheetOn = false
  const sh = $('pm-sheet')
  sh.classList.remove('on')
  if (!pmCase) document.documentElement.classList.remove('pm-lock')
  setTimeout(() => { if (!pmSheetOn) sh.hidden = true }, reduce ? 0 : 280)
  if (!noFocus) pmOpener?.focus?.({ preventScroll: true })
}
// A building or a pin: its note, or straight to its page when it is a blog post.
function pmActivate(id, el) {
  const B = ROOMS[id]; if (!B) return
  if (B.blog && hasCase(id)) pmOpenCase(id)
  else pmNote(id, el)
}

// ---------- Case studies on the phone: the page slides over the scroll, with no camera ----------
function pmOpenCase(n, replace) {
  if (pmCase) return pmSwap(n)
  const id = letterFor(n), L = id && letterOf(id)
  if (!L) return
  if (pmSheetOn) pmSheetClose(true); else pmOpener = document.activeElement
  const my = ++pmSeq
  pmCase = id
  letterEl.dataset.openCase = id
  pageEl.innerHTML = pageHTML(id)
  letterEl.style.setProperty('--rc', ok(46, .12, fromOf(L).hue)); setBack(L)
  letterEl.hidden = false; letterEl.classList.remove('in'); lscroll.scrollTop = 0; watchRise()
  document.body.classList.add('reading-case'); document.documentElement.classList.add('pm-lock')
  if (replace) history.replaceState({ pm: id }, '', `#${id}/read`)
  else { history.pushState({ pm: id }, '', `#${id}/read`); pmHist = true }
  reveal?.cancel(); reveal = null
  requestAnimationFrame(() => { if (my === pmSeq) letterEl.classList.add('in') })
  if (!reduce) reveal = letterEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out', fill: 'both' })
  pageEl.focus({ preventScroll: true })
}
// From one page to the next (its Previous / Next cards): the page turns in place, with no stacked history.
function pmSwap(n) {
  const id = letterFor(n), L = id && letterOf(id)
  if (!L) return
  const my = ++pmSeq
  pmCase = id
  lightboxClose()
  const put = () => {
    if (my !== pmSeq) return
    letterEl.dataset.openCase = id
    pageEl.innerHTML = pageHTML(id); letterEl.style.setProperty('--rc', ok(46, .12, fromOf(L).hue)); setBack(L)
    lscroll.scrollTop = 0; watchRise(); history.replaceState({ pm: id }, '', `#${id}/read`)
    pageEl.focus({ preventScroll: true })
    if (!reduce) pageEl.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: SETTLE })
  }
  if (reduce) return put()
  const out = pageEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease-in', fill: 'forwards' })
  out.finished.then(() => { put(); out.cancel() }, () => {})
}
function pmCloseCase() {
  if (!pmCase) return
  pmCase = null
  const my = ++pmSeq
  lightboxClose()
  document.body.classList.remove('reading-case')
  if (!pmSheetOn) document.documentElement.classList.remove('pm-lock')
  const done = () => {
    if (my !== pmSeq) return
    reveal?.cancel(); reveal = null
    letterEl.hidden = true; letterEl.classList.remove('in'); pageEl.innerHTML = ''; riseIO?.disconnect(); sysIO?.disconnect()
    if (pmOpener?.isConnected) pmOpener.focus({ preventScroll: true })
  }
  if (reduce) return done()
  reveal?.cancel()
  reveal = letterEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-in', fill: 'forwards' })
  reveal.finished.then(done, () => {})
}
// "Back": the history entry we pushed is popped; a page opened from a link is simply cleaned up.
function pmBack() {
  const pushed = pmHist
  pmHist = false
  pmCloseCase()
  if (pushed) history.back()
  else history.replaceState(null, '', location.pathname + location.search)
}

// Build the whole phone page, once.
function phoneBoot() {
  const root = document.documentElement
  root.classList.add('pm')
  $('loader')?.remove()
  // The blog posts' line on the map, as the desktop sets it.
  for (const [id] of roomsOf('writing')) { const B = ROOMS[id]; if (B.blog && FULLCASE_DATA[FULL_OF[id]]) B.key = `Blog · ${readMins(caseBody(id))} min read` }
  try { root.style.setProperty('--pm-grain', `url(${grainTile().toDataURL('image/png')})`) } catch (e) {}

  const bar = `<header class="pm-bar" id="pm-bar"><button class="pm-brand" type="button" aria-label="Kunal Satpal: back to the top">`
    + `<svg viewBox="0 0 33 31" aria-hidden="true"><rect y="1.09" width="7.68" height="28.36" rx="1.4" fill="currentColor"/><path fill="currentColor" d="M31.24.92c.77 0 1.4.63 1.4 1.4v25.52c0 .77-.63 1.4-1.4 1.4h-6.1c-.27 0-.52-.11-.7-.31L12.18 15.08 24.44 1.22c.18-.19.43-.3.7-.3z"/></svg>`
    + `<b>Kunal Satpal</b></button><span class="pm-where" id="pm-where" aria-live="off"></span></header>`
  const T = typeof PHONE_SCENES !== 'undefined' && PHONE_SCENES.title
  const hero = T ? `<figure class="pm-hero" style="aspect-ratio:${T.w} / ${T.h}"><img src="${abs(T.img)}" width="${T.w}" height="${T.h}" fetchpriority="high" alt=""></figure>` : ''
  const title = `<section class="pm-title" id="pm-title" aria-labelledby="pm-name">${hero}<div class="pm-head">`
    + `<h1 class="pm-name" id="pm-name">Kunal Satpal</h1>`
    + `<p class="pm-tag">Crafting with strategy &amp; technical fluency</p>`
    + `<p class="pm-role">Staff Product Designer, Hinge Health<br>Designing since 2017</p>`
    + `<p class="pm-rule" aria-hidden="true">✦</p></div>`
    + `<p class="pm-cue">Scroll to begin<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5l4 4 4-4"/></svg></p></section>`
  const chapters = WORLDS.map((W, i) => pmChapter(W, i)).join('')
  const h = ROOMS['home-hello'], links = (h.links || []).map(([t, u], i) => i === 0
    ? `<a class="btn ink" href="${u}">${esc(t)}</a>` : `<a class="pm-btn" href="${abs(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join('')
  const end = `<section class="pm-end pm-sea" id="pm-hello" aria-labelledby="pm-hello-h"><h2 id="pm-hello-h">Say hello</h2>`
    + `<p class="pm-end-say">${esc(h.stat)}</p><div class="pm-links">${links}</div>`
    + `<p class="pm-end-foot">The full map is in 3D on a bigger screen.</p></section>`

  const pm = document.createElement('div'); pm.id = 'pm'
  pm.innerHTML = bar + title + chapters + end
  document.body.appendChild(pm)
  const sheet = document.createElement('div'); sheet.id = 'pm-sheet'; sheet.hidden = true
  document.body.appendChild(sheet)
  pm.querySelectorAll('.pm-leg').forEach(pmFeet)

  const barEl = $('pm-bar'), where = $('pm-where'), cities = [...pm.querySelectorAll('.pm-city')]
  pm.querySelector('.pm-brand').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }))
  pm.addEventListener('click', e => { const b = e.target.closest('[data-room]'); if (b) pmActivate(b.dataset.room, b) })
  sheet.addEventListener('click', e => {
    if (e.target.closest('[data-x]')) return pmSheetClose()
    const r = e.target.closest('[data-read]')
    if (r) pmOpenCase(r.dataset.read)  // closes the sheet itself, keeping the row that opened it for focus
  })
  letterEl.addEventListener('click', e => {
    // The desktop's handler would fly the camera for these: the phone does its own version.
    const back = e.target.closest('[data-close]'), next = e.target.closest('[data-case]')
    if (!back && !next) return
    e.stopPropagation(); e.preventDefault()
    if (back) pmBack(); else pmSwap(next.dataset.case)
  }, true)
  // The desktop's window-level handlers (wheel, touch drag, keys, camera) never see these events on the phone.
  for (const t of ['wheel', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'keydown']) document.addEventListener(t, e => e.stopPropagation())
  // A mail link opens the mail app here, not the desktop's "copy email".
  addEventListener('click', e => { if (e.target.closest?.('#pm a[href^="mailto:"], #pm-sheet a[href^="mailto:"]')) e.stopPropagation() }, true)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return
    if (!lightbox.hidden) lightboxClose()
    else if (pmSheetOn) pmSheetClose()
    else if (pmCase) pmBack()
  })
  addEventListener('popstate', () => { if (pmCase && !/\/read$/.test(location.hash)) { pmHist = false; pmCloseCase() } })

  // Ticks: the title's end hides the top bar; the chapter in the middle names itself up top.
  const titleEl = $('pm-title')
  new IntersectionObserver(es => es.forEach(e => barEl.classList.toggle('on', !e.isIntersecting)), { threshold: 0 }).observe(titleEl)
  const whereIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return
    const i = cities.indexOf(e.target), W = WORLDS[i]
    if (W) where.textContent = `${i + 1} / ${WORLDS.length} · ${W.name}`
  }), { rootMargin: '-45% 0px -50% 0px' })
  cities.forEach(c => whereIO.observe(c))
  // Arrival: a road's footprints and a picture settle in once they are seen.
  const arrive = new IntersectionObserver(es => es.forEach(e => {
    if (e.intersectionRatio < .35) return
    e.target.classList.add('in'); arrive.unobserve(e.target)
    if (e.target.classList.contains('pm-scene')) pmSpreadPins(e.target)
  }), { threshold: [0, .35] })
  pm.querySelectorAll('.pm-leg, .pm-scene').forEach(el => arrive.observe(el))
  if (reduce) pm.querySelectorAll('.pm-leg, .pm-scene').forEach(el => el.classList.add('in'))
  const spreadAll = () => pm.querySelectorAll('.pm-scene.in').forEach(pmSpreadPins)
  addEventListener('resize', spreadAll); addEventListener('orientationchange', spreadAll)
  document.fonts?.ready?.then(spreadAll); spreadAll()

  // A deep link: a case study's page, or a building's chapter.
  const hash = decodeURIComponent(location.hash.slice(1))
  const m = hash.match(/^(.+)\/read$/)
  if (m && hasCase(m[1])) pmOpenCase(m[1], true)
  else if (ROOMS[hash]) pm.querySelector(`[data-room="${hash}"]`)?.closest('.pm-city')?.scrollIntoView({ block: 'start' })
}
