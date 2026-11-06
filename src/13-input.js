// =====================================================================================
// Input: the wheel, a drag or the keys move you down the road; a click opens what it lands
// on. Nothing zooms: the road is the whole way through.
// =====================================================================================
const vp = $('viewport')
const BLOCK = '#panel, #letter, #reader, #lightbox, .ui'
const busy = () => document.body.classList.contains('reading') || caseId
addEventListener('wheel', e => {
  if (e.target.closest?.('#panel, #letter, #reader, #lightbox') || busy()) return
  e.preventDefault()
  if (e.ctrlKey || e.metaKey) return
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? VH : 1
  // Travelling on puts a hovered note away; the next one opens where the pointer lands.
  if (cardFor && !pinned) { levelPeek(null); closePanel() }
  // Only the up-and-down of a scroll moves you: a swipe's sideways drift never steers the journey.
  if (!e.deltaY) return
  scrollBy(-e.deltaY * unit * perPx())
}, { passive: false })

let drag = null, vel = 0, dragged = false
// The map follows the hand: pull it toward you to go forward.
// At the start of the road on a phone (BATCH.phoneStart), a swipe up, the way a phone page scrolls, is
// not the wrong way: there is nothing behind you, so it holds still and, let go, begins the walk (swipeTo).
const nudge = dY => { if (dY < 0 && cam.cy >= START_Y - 1) return PHONE_START ? undefined : wrongWay(); cam.cy -= dY * perPx(); clampCam(); moved(); requestRender() }
addEventListener('pointerdown', e => {
  if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest?.(BLOCK) || busy()) return
  cancelMotion()
  drag = { id: e.pointerId, y: e.clientY, sy: e.clientY, cy0: cam.cy, t: performance.now(), moved: false, target: e.target }
})
// Where the mouse rests, so the building under it is found again once the map stops moving.
let pointerAt = null
// The names over the buildings sit in their own layer, above the map but part of it.
const onMap = t => vp.contains(t) || !!t?.closest?.('#labels')
addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') pointerAt = onMap(e.target) ? [e.clientX, e.clientY] : null
  if (!drag || e.pointerId !== drag.id) { if (!drag && e.pointerType === 'mouse' && onMap(e.target)) cityHover(e.clientX, e.clientY, e.target); return }
  if (!drag.moved && Math.abs(e.clientY - drag.sy) > 6) { drag.moved = true; document.body.classList.add('dragging'); levelPeek(null) }
  if (!drag.moved) return
  const dy = e.clientY - drag.y, now = performance.now(), dt = now - drag.t
  if (PHONE_SWIPE) leanTo(e.clientY - drag.sy, drag.cy0); else nudge(dy)
  if (dt > 0) vel = dy / dt
  drag.y = e.clientY; drag.t = now
})
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return
  const d = drag; drag = null; document.body.classList.remove('dragging')
  if (d.moved) { dragged = true; setTimeout(() => { dragged = false }, 0); if (BATCH.mobile && coarse) swipeTo(e.clientY - d.sy, d.cy0); else if (!reduce && performance.now() - d.t < 70 && Math.abs(vel) > .2) glide() }
  else if (e.type === 'pointerup' && vp.contains(d.target)) activate(d.target, e.clientX, e.clientY)
}
addEventListener('pointerup', endDrag)
addEventListener('pointercancel', endDrag)
// A drag never counts as a click on whatever it started over.
addEventListener('click', e => { if (dragged) { e.stopPropagation(); e.preventDefault() } }, true)
// Phones (BATCH.mobile): one place per swipe. The stops are each world's first view, a second one
// where a world runs long, and the lighthouse at the end of the road.
let roadStops = null
const PHONE_AHEAD = 200
function stopsOnRoad() {
  if (roadStops) return roadStops
  const s = [START_Y, END_Y]
  for (const w of WORLDS) {
    let first = null
    // On a tall phone screen (BATCH.mobile2) each stop looks a little ahead, so the place you are at fills
    // the lower half and the next one shows above, rather than the one you just left filling the bottom.
    for (const L of LEVELS.filter(L => L.world === w.key).sort((a, b) => b.y - a.y)) if (first === null || first - L.y > 520) { first = L.y; s.push(L.y - 120 - (BATCH.mobile2 ? PHONE_AHEAD : 0)) }
  }
  return roadStops = s.map(y => clamp(y, END_Y, START_Y)).sort((a, b) => b - a).filter((y, i, a) => !i || a[i - 1] - y > 150)
}
// A phone's swipe (BATCH.phoneSwipe): while the finger moves, the map only leans toward the stop it is heading
// for, at most a third of the way, so it never runs past it; let go, and the swipe carries you there. Before,
// the map followed the finger one to one, and a phone-length swipe (about 1,200 units of road) ran past the
// next stop, so letting go flew it back to the nearest one: a lurch forward and a jump back on every swipe.
function leanTo(dy, cy0) {
  const S = stopsOnRoad(), fwd = dy > 0 || (PHONE_START && cy0 >= START_Y - 1), to = fwd ? S.find(y => y < cy0 - 30) : S.findLast(y => y > cy0 + 30)
  if (to == null) return
  const k = clamp(Math.abs(dy) / (VH * .45), 0, 1)
  cam.cy = cy0 + (to - cy0) * .3 * (1 - (1 - k) ** 2); clampCam(); moved(); requestRender()
}
function swipeTo(dy, cy0) {
  // Too small to be a swipe: on a phone the map comes back from its lean (BATCH.phoneSwipe).
  if (Math.abs(dy) < 24 && Math.abs(vel) < .25) { if (PHONE_SWIPE && Math.abs(cam.cy - cy0) > .5) flyTo(0, cy0, 0, 250); return }
  const S = stopsOnRoad(), fwd = dy > 0 || (PHONE_START && cy0 >= START_Y - 1), ahead = y => fwd ? y < cy0 - 30 : y > cy0 + 30
  let to = fwd ? S.find(ahead) : S.findLast(ahead)
  if (to == null) return
  // A long drag that has already passed the next stop settles on the nearest one instead.
  if (fwd ? cam.cy < to : cam.cy > to) to = S.reduce((b, y) => Math.abs(y - cam.cy) < Math.abs(b - cam.cy) ? y : b)
  closePanel(); flyTo(0, to, 0, 900)
}
function glide() {
  let v = vel * 16
  const step = () => { v *= .94; nudge(v); glideId = Math.abs(v) > .3 ? requestAnimationFrame(step) : 0 }
  glideId = requestAnimationFrame(step)
}
// A click on the sheet: a building, a room on the plan, or nothing (which closes the note).
function activate(target, X, Y) {
  // A paw print of the wizard's cat (16-side), while it shows, comes before whatever is under it.
  if (target.closest?.('.paw')) return pawClick(target.closest('.paw'))
  // A prop that does its trick on hover hands the click to its building (BATCH.propsShareHover)
  // when the building has a page or links to open; otherwise the click plays the trick again, the
  // barbell's next rep. On a touch screen, where nothing hovers, the tap plays the trick as well.
  const dec = decorAt(X, Y), share = BATCH.propsShareHover && dec && ON_HOVER.has(DECOR[dec].kind) && propRoom(dec, X, Y)
  // Under a finger a building comes first, and decor answers only where there is none (BATCH.mobile2).
  if (dec && !share && BATCH.mobile2 && coarse) { const built = cityPick(X, Y, peeked); if (built) return clickPlace(built) }
  if (share && (coarse || hasCase(share) || ROOMS[share].see || ROOMS[share].links)) { if (decorHot !== dec) decorClick(dec); return clickPlace(share) }
  if (dec) return decorClick(dec)
  const built = cityPick(X, Y, peeked); if (built) return clickPlace(built)
  if (target.closest?.('.creature')) { const c = target.closest('.creature'); c.classList.add('dive'); return setTimeout(() => c.classList.remove('dive'), 2600) }
  if (target.closest?.('.ship')) return shipSink(target.closest('.ship'))
  if (target.closest?.('.needle')) return
  const link = target.closest?.('[data-go]'); if (link) return go(link.dataset.go)
  const g = target.closest?.('.room'); if (g) return clickPlace(g.dataset.id)
  closePanel(); seaClick(X, Y)
}
document.addEventListener('click', e => {
  if (e.target.closest('#letter, #panel')) return
  const en = e.target.closest('[data-enter]'); if (en) { e.preventDefault(); return goCase(en.dataset.enter) }
  const fl = e.target.closest('[data-flow]'); if (fl) { e.preventDefault(); return go(LEVELS[0].id) }
  const t = e.target.closest('[data-go]'); if (t && !vp.contains(t)) { e.preventDefault(); t.classList.contains('lv-t') ? clickPlace(t.dataset.go) : go(t.dataset.go) }
})
// From one level to the next, from wherever you are.
function stepLevel(d) {
  const cur = cardFor && levelOf[cardFor] ? levelOf[cardFor].n - 1 : Math.max(-1, here)
  go(LEVELS[clamp(cur + d, 0, LEVELS.length - 1)].id)
}
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || busy() || e.target.closest?.('input, textarea')) return
  const k = e.key, unit = perPx()
  if (k === 'Escape') { closePanel() }
  else if (k === 'ArrowUp') { e.preventDefault(); scrollBy(140 * unit) }
  else if (k === 'ArrowDown') { e.preventDefault(); scrollBy(-140 * unit) }
  else if (k === 'PageUp' || (k === ' ' && !e.shiftKey && !e.target.closest?.('button, a'))) { e.preventDefault(); scrollBy(VH * .8 * unit) }
  else if (k === 'PageDown' || (k === ' ' && e.shiftKey)) { e.preventDefault(); scrollBy(-VH * .8 * unit) }
  else if (k === 'Home') { e.preventDefault(); fitAll() }
  else if (k === 'End') { e.preventDefault(); flyTo(0, END_Y, 0, 1600) }
  else if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); stepLevel(k === 'ArrowRight' ? 1 : -1) }
})
$('close').addEventListener('click', closePanel)
