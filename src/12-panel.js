// =====================================================================================
// Details: a note pinned beside the place it is about. The square, each city, each piece
// of work and the isles have one; case studies open into the building itself.
// =====================================================================================
const note = $('note')
let current = null
function kicker(realm) {
  return realm ? `<p class="kicker">${crest(realm.hue, realm.sig)}<span>${realm.key === 'home' ? 'About me · the Isle of Kunal' : `${realm.name} · ${realm.years}`}</span></p>`
    : `<p class="kicker">${crest(70, 'star')}<span>An earlier stop, in the western isles</span></p>`
}
const figHTML = (src, alt = '') => src ? `<figure><img src="${abs(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.parentElement.remove()"></figure>` : ''
// A few pictures at once: book covers, posters, photos.
const picsHTML = (pics, grid) => pics ? `<div class="pics ${grid || ''}">${pics.map(src => `<img src="${abs(src)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`).join('')}</div>` : ''
// The buildings that open into a full page; the rest only have their note.
const opens = id => hasCase(id) || !!ROOMS[id]?.see
// Their note opens a little window of the map, as the universe site opens one of sky: the final
// design standing on a wash of its company's colour, or the story's cover pinned to it.
function winHTML(id) {
  const B = ROOMS[id], P = PAGES[FULL_OF[letterFor(id) || B.see]] || {}, src = P.hero || B.img || P.icon
  return src ? `<figure class="win${P.hero ? ' phone' : ''}"><img src="${abs(src)}" alt="" decoding="async" onerror="this.parentElement.remove()"></figure>` : ''
}
// A field note's popover is a page from a notebook: its cover small beside the title, what it is
// about and how long it takes, a few lines of it, and the way in.
function noteHTML(id) {
  const B = ROOMS[id], P = PAGES[FULL_OF[id]] || {}, mins = readMins(caseBody(id))
  return `<div class="jhead">${P.icon ? `<img class="jicon${P.iconBg ? ' mark' : ''}" src="${abs(P.icon)}" alt="" decoding="async"${P.iconBg ? ` style="background:${P.iconBg};padding:${P.iconPad ?? 11}px"` : ''}>` : ''}<div><p class="jtag">${P.tag || 'Field note'} · ${mins} min read</p><h2>${B.title}</h2></div></div>`
    + (B.body ? `<p class="body jline">${B.body}</p>` : '') + `<button class="go" data-enter="${id}">Read the note <span>→</span></button>`
}
// The How I work pillars carry their crown, drawn small, beside the line in their note.
const CROWNS = {
  grow: '<path d="M20 34V22"/><circle cx="20" cy="15" r="8"/><circle cx="11" cy="20" r="5"/><circle cx="29" cy="19" r="6"/><path d="M12 34H28"/>',
  strategy: '<path d="M20 4V10M17 7H23"/><path d="M15 15Q20 10 25 15L23 29H17Z"/><path d="M12 34H28L26 29H14Z"/>',
  data: '<path d="M6 34H34"/><rect x="8" y="25" width="4.5" height="9"/><rect x="15" y="19" width="4.5" height="15"/><rect x="22" y="13" width="4.5" height="21"/><rect x="29" y="6" width="4.5" height="28"/>',
  tools: '<path d="M5 15H29Q32 19 25 21H22V27H27V31H12V27H17V21H12Q7 19 5 15Z"/><path d="M27 4L35 10M31 3L36 6"/>',
  code: '<path d="M13 12L5 20L13 28M27 12L35 20L27 28M23 8L17 32"/>',
}
const crownSVG = kind => CROWNS[kind] ? `<span class="emblem"><svg viewBox="0 0 40 40" aria-hidden="true">${CROWNS[kind]}</svg></span>` : ''
function showRoom(id) {
  const B = ROOMS[id], realm = B.realm ? realmBy[B.realm] : null, c = realm ? ok(48, .11, realm.hue) : ok(50, .08, 70)
  panelEl.classList.toggle('journal', !!B.blog); panelEl.classList.toggle('hcard', !B.blog); panelEl.classList.toggle('cartouche', BATCH.cardCartouche && !B.blog)
  note.style.setProperty('--c', c); panelEl.style.setProperty('--c', c)
  if (B.blog) { note.innerHTML = noteHTML(id); return }
  // As on the universe site: the outcome is the headline, one line supports it, and one accent
  // says what else there is. The building's name is already on its tag, so it is not repeated.
  // In a cartouche the headline is centred and set larger, so a line of numbers breaks after its dot, not before.
  const head = (B.tip ? B.tip[0] : B.stop ? B.title : B.stat || B.title).replace(/ · /g, BATCH.cardCartouche ? '&nbsp;· ' : ' · ')
  const line = B.tip ? B.tip[1] : B.stop ? [B.stat, B.body].filter(Boolean).join(' · ') : B.body
  note.innerHTML = (opens(id) || B.hoverImg ? winHTML(id) : !B.tip ? figHTML(B.img, B.alt) : '') + picsHTML(B.pics, B.grid)
    + (B.part?.t === 'pillar' ? `<div class="ehead">${crownSVG(B.part.kind)}<p class="headline">${head}</p></div>` : `<p class="headline">${head}</p>`) + (line ? `<p class="body">${line}</p>` : '')
    + (!B.tip && B.list ? `<ul>${B.list.map(li => `<li><span>${li}</span></li>`).join('')}</ul>` : '')
    + (B.links && !(BATCH.finale && id === 'home-hello') ? `<ul class="links">${B.links.map(([t, h]) => `<li><a href="${abs(h)}" target="_blank" rel="noopener">${t}</a></li>`).join('')}</ul>` : '')
    + (B.nda ? `<p class="status">Under NDA · <a class="ext" href="mailto:kunalsatpal1@gmail.com?subject=${encodeURIComponent(B.title)}">ask me about it</a></p>`
      : B.soon ? '<p class="status">Case study coming soon</p>' : '')
    + (hasCase(id) ? `<button class="go" data-enter="${id}">Read the case study <span>· ${readMins(caseBody(letterFor(id)))} min →</span></button>`
      : B.see ? `<button class="go" data-letter="${B.see}">${B.seeLabel || 'Read the story'} <span>· ${readMins(caseBody(B.see))} min →</span></button>`
      : B.href ? `<a class="cta" href="${abs(B.href)}" target="_blank" rel="noopener">${B.cta || 'Read the case study'} <span aria-hidden="true">↗</span></a>` : '')
    + (id === 'home-hello' ? `<a class="cta" href="mailto:kunalsatpal1@gmail.com?subject=${encodeURIComponent('Found you on the map')}">Write to me <span aria-hidden="true">✉</span></a>` : '')
    // The sign-off (BATCH.finale): one way to write, then everything else in a single line.
    + (BATCH.finale && id === 'home-hello' ? `<p class="also">${B.links.filter(([, h]) => !h.startsWith('mailto:')).map(([t, h]) => `<a href="${abs(h)}" target="_blank" rel="noopener">${t.replace(' (PDF)', '')}</a>`).join('<span aria-hidden="true"> · </span>')}</p>` : '')
}
// Ink writes itself onto the note: each line sweeps in, a beat after the last.
function writeOn() {
  if (reduce) return
  note.classList.remove('write'); void note.offsetWidth
  ;[...note.children].forEach((el, i) => el.style.setProperty('--i', i))
  note.classList.add('write')
  clearTimeout(writeOn.t); writeOn.t = setTimeout(() => note.classList.remove('write'), 2200)
}
// The first sentence of a blurb.
const oneLine = s => (String(s).match(/^.*?[.!?](?=\s|$)/) || [s])[0]
function markSelected(id) {
  document.querySelectorAll('.room.selected').forEach(g => g.classList.remove('selected'))
  if (id) $('room-' + id)?.classList.add('selected')
  const B = id && ROOMS[id], key = B ? (B.stop ? 'earlier' : B.realm) : id
  document.querySelectorAll('#legendList button').forEach(b => b.setAttribute('aria-current', String(b.dataset.go === key)))
  citySelect(id && ROOMS[id] ? id : null)
}
// Open a level: travel down the road until it sits mid-screen, then a note unfurls beside it.
// With `enter`, the case study opens instead.
let cardW = 400, cardH = 300, pinned = false, hideT = 0
function go(id, opts = {}) {
  if (!id) return
  const B = ROOMS[id], R0 = realmBy[id]
  if (!B && !R0 && id !== 'earlier') return
  if (caseId) return closeCase(() => go(id, opts))
  // A company, or the isles: just travel there. Its banner on the map already says who it was.
  if (!B) { closePanel(); hideTip(); closeMenu(); const b = R0 ? (R0.key === 'home' ? GEO.aboutBox : R0.box) : ISLES; return flyTo(0, R0?.key === 'home' ? b.y1 - 260 : (b.y0 + b.y1) / 2, 0, 1100) }
  clearTimeout(hideT); current = id; cardFor = id; pinned = true; panelEl.classList.add('pinned')
  showRoom(id)
  markSelected(id); hideTip(); closeMenu()
  panelEl.classList.remove('open'); leader.classList.remove('on')
  history.replaceState(null, '', '#' + id)
  const done = () => { if (cardFor !== id) return; if (opts.enter) openCase(id); else openCard() }
  markVisited(id); flyTo(0, levelOf[id].y + (mobile() ? 220 : 0), 0, 1100, done)
}
function openCard(quick) {
  if (!cardFor || panelEl.classList.contains('open')) return
  panelEl.classList.add('open'); panelEl.scrollTop = 0
  measureCard(); placeCard(view())
  if (quick) { if (!reduce) panelEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' }); return }
  if (!reduce) panelEl.animate([{ clipPath: 'inset(0 0 100% 0 round 4px)', opacity: .3 }, { clipPath: 'inset(0 0 0 0 round 4px)', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.22, 1, .36, 1)' })
  writeOn()
  setTimeout(() => $('close').focus({ preventScroll: true }), 60)
}
// Hovering a building reads its note beside it, where it stands: no travelling, no address
// change. The note stays while the pointer is on the building, its name or the note itself.
function showCard(id, pin) {
  if (caseId || !ROOMS[id]) return
  clearTimeout(hideT)
  if (cardFor === id) { if (pin) { pinned = true; panelEl.classList.add('pinned') } return }
  panelEl.classList.remove('open'); leader.classList.remove('on')
  current = id; cardFor = id; pinned = !!pin; panelEl.classList.toggle('pinned', pinned)
  showRoom(id); markSelected(id); hideTip()
  openCard(true)
}
function hoverCard(id) {
  if (id) return showCard(id)
  if (!pinned) { clearTimeout(hideT); hideT = setTimeout(() => { if (!pinned && !panelEl.matches(':hover')) closePanel() }, 520) }
}
panelEl.addEventListener('pointerenter', () => clearTimeout(hideT))
panelEl.addEventListener('pointerleave', () => hoverCard(null))
// A click opens what a building holds: its full story, if it has one. Everything else is said by
// its note on hover; the lighthouse's note stays open, for the ways to write to me.
// On a touch screen the first tap shows the note, and the next opens the story.
function clickPlace(id) {
  if (!ROOMS[id]) return go(id)
  if (coarse && cardFor !== id) return showCard(id, true)
  if (hasCase(id)) return openCase(id)
  if (ROOMS[id].see) return openCase(ROOMS[id].see, id)
  if (ROOMS[id].links) showCard(id, true)
}
const measureCard = () => { cardW = panelEl.offsetWidth; cardH = panelEl.offsetHeight }
// A note grows when its picture arrives: measure it again and keep it on the screen.
if ('ResizeObserver' in window) new ResizeObserver(() => { if (!panelEl.classList.contains('open')) return; measureCard(); placeCard(view()) }).observe(panelEl)
panelEl.addEventListener('click', e => {
  const en = e.target.closest('[data-enter]'); if (en) return openCase(en.dataset.enter)
  const lt = e.target.closest('[data-letter]'); if (lt) return openCase(lt.dataset.letter, cardFor)
  const g = e.target.closest('[data-go]'); if (g) return go(g.dataset.go)
})

// The screen box of whatever the note is about: a level and its building together.
function anchorBox(v) {
  const B = ROOMS[cardFor], pts = []
  const add = (x0, y0, x1, y1, z = 0) => { for (const x of [x0, x1]) for (const y of [y0, y1]) for (const zz of [0, z]) pts.push(project(x, y, zz, v)) }
  if (B) {
    const p = B.part, z = city.ready ? (ROOM_TOP[cardFor] || 40) * v.t : 0
    if ('x' in p) add(p.x, p.y, p.x + p.w, p.y + p.h, z); else add(p.cx - p.r, p.cy - p.r, p.cx + p.r, p.cy + p.r, z)
  } else { const b = boxOf(cardFor); add(b.x0, b.y0, b.x1, b.y1) }
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}
const leader = $('leader')
// Where the note goes: beside its building, on whichever side covers least of everything else that
// can be pointed at on the map — other buildings, their tags and banners, the small things that
// answer. Chosen once as the note opens (and again when the map settles), then kept while it moves.
let cardSpot = null
const SPOT_BIAS = { r: 0, l: 1500, ru: 2500, rd: 2500, lu: 3500, ld: 3500, a: 4500, b: 4500 }
function spotAt(spot, b) {
  const gap = 36, my = clamp((b.y0 + b.y1) / 2, 120, VH - 120), cx = (b.x0 + b.x1) / 2
  let left = spot[0] === 'r' ? b.x1 + (spot.length > 1 ? gap * .5 : gap) : spot[0] === 'l' ? b.x0 - (spot.length > 1 ? gap * .5 : gap) - cardW : cx - cardW / 2
  let top = spot === 'a' ? b.y0 - gap - cardH : spot === 'b' ? b.y1 + gap : spot[1] === 'u' ? b.y0 - cardH * .75 : spot[1] === 'd' ? b.y1 - cardH * .25 : my - cardH * .4
  left = clamp(left, 14, VW - cardW - 48); top = clamp(top, 70, Math.max(70, VH - 20 - cardH))
  return { left, top }
}
const overlap = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))
function chooseSpot(v, b) {
  const obs = [{ r: b, w: 4 }]
  for (const id of Object.keys(ROOM_PTS)) {
    const p = ROOMS[id]?.part
    if (!p || id === cardFor) continue
    const pts = [], z = (ROOM_TOP[id] || 40) * v.t, add = (x0, y0, x1, y1) => { for (const x of [x0, x1]) for (const y of [y0, y1]) for (const zz of [0, z]) pts.push(project(x, y, zz, v)) }
    if ('x' in p) add(p.x, p.y, p.x + p.w, p.y + p.h); else add(p.cx - p.r, p.cy - p.r, p.cx + p.r, p.cy + p.r)
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), r = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
    if (r.x1 > 0 && r.x0 < VW && r.y1 > 0 && r.y0 < VH) obs.push({ r, w: 1 })
  }
  for (const el of document.querySelectorAll('.lvl .lv-t, .lab.realm')) {
    if (el.closest('.lvl')?.dataset.id === cardFor || getComputedStyle(el).visibility === 'hidden') continue
    const q = el.getBoundingClientRect()
    if (q.width) obs.push({ r: { x0: q.left, y0: q.top, x1: q.right, y1: q.bottom }, w: 1.4 })
  }
  if (typeof DECOR !== 'undefined') for (let i = 1; i < DECOR.length; i++) {
    const D = DECOR[i], [x, y, z] = project(D.x, D.y, ((D.base || 0) + D.h * .5) * v.t, v)
    if (z > NEAR && x > 0 && x < VW && y > 0 && y < VH) obs.push({ r: { x0: x - 14, y0: y - 14, x1: x + 14, y1: y + 14 }, w: .6 })
  }
  let best = 'r', bestS = Infinity
  for (const spot of Object.keys(SPOT_BIAS)) {
    const { left, top } = spotAt(spot, b), c = { x0: left, y0: top, x1: left + cardW, y1: top + cardH }
    const s = obs.reduce((t, o) => t + overlap(c, o.r) * o.w, SPOT_BIAS[spot])
    if (s < bestS) { bestS = s; best = spot }
  }
  return best
}
function placeCard(v) {
  if (!cardFor || !panelEl.classList.contains('open') || mobile()) { leader.classList.remove('on'); return }
  const b = anchorBox(v)
  if (cardSpot?.id !== cardFor) cardSpot = { id: cardFor, spot: chooseSpot(v, b) }
  const spot = cardSpot.spot, { left, top } = spotAt(spot, b), my = clamp((b.y0 + b.y1) / 2, 120, VH - 120)
  const seen = b.x1 > 0 && b.x0 < VW && b.y1 > 0 && b.y0 < VH
  panelEl.style.transform = `translate3d(${left.toFixed(1)}px,${top.toFixed(1)}px,0)`
  panelEl.classList.toggle('off', !seen)
  // The leader runs from the building's near edge to the note's.
  let ax, ay, bx, by
  if (spot === 'a' || spot === 'b') { ax = (b.x0 + b.x1) / 2; ay = spot === 'a' ? b.y0 : b.y1; bx = clamp(ax, left + 30, left + cardW - 30); by = spot === 'a' ? top + cardH : top }
  else { const right = spot[0] === 'r'; ax = right ? b.x1 - Math.min(24, (b.x1 - b.x0) * .2) : b.x0 + Math.min(24, (b.x1 - b.x0) * .2); ay = my; bx = right ? left : left + cardW; by = clamp(ay, top + 30, top + cardH - 30) }
  const mx = (ax + bx) / 2, mid = (ay + by) / 2, vertical = spot === 'a' || spot === 'b'
  leader.firstElementChild.setAttribute('d', vertical ? `M${f(ax)},${f(ay)}C${f(ax)},${f(mid)} ${f(bx)},${f(mid)} ${f(bx)},${f(by)}` : `M${f(ax)},${f(ay)}C${f(mx)},${f(ay)} ${f(mx)},${f(by)} ${f(bx)},${f(by)}`)
  leader.lastElementChild.setAttribute('cx', f(ax)); leader.lastElementChild.setAttribute('cy', f(ay))
  leader.classList.toggle('on', seen)
}
// Travel on far enough and the note folds itself away.
function cardOnSettle() {
  if (!cardFor || caseId) return
  const b = anchorBox(view())
  if (b.y1 < 0 || b.y0 > VH) return closePanel()
  cardSpot = null
  if (!flyId) openCard()
}
function closePanel() {
  clearTimeout(hideT); pinned = false; panelEl.classList.remove('pinned')
  if (!cardFor) return
  cardFor = null
  panelEl.classList.remove('open', 'off'); leader.classList.remove('on')
  current = null; markSelected(null)
  history.replaceState(null, '', location.pathname + location.search)
}
