// =====================================================================================
// Experiment: a card for each city. While you are in a city its overview stays docked beside
// it; hovering a building turns the card to that building, and leaving turns it back.
// To undo: set CITY_CARD to false, or delete this file, and rebuild. Nothing else uses it:
// it only wraps placeCard, closePanel and cardOnSettle from 12-panel.js.
// =====================================================================================
const CITY_CARD = false
if (CITY_CARD) {
  const DOCK_TOP = 84, DOCK_GAP = 16, RAIL_ROOM = 48
  let cityKey = null, dismissed = null, side = 'r'
  const canDock = () => !mobile() && !coarse
  const isCity = id => !!id && WORLDS.some(w => w.key === id)
  // The world the eye is in, by the same bands as the rail; none at the start of the road.
  function worldHere() {
    const mid = cam.cy
    if (mid > WORLDS[0].y1 + 200) return null
    return (WORLDS.find(w => mid <= w.y1 + 200 && mid > w.y0 + 200) || WORLDS.at(-1)).key
  }
  // The overview: who it was, my role there, and one line. Its buildings are on the map.
  function cityHTML(key) {
    const R0 = realmBy[key], w = WORLDS.find(x => x.key === key)
    if (key === 'earlier') return `<p class="kicker">${crest(70, 'star')}<span>${w.years}</span></p><h2>${w.name}</h2><p class="body">Internships, contracts and freelance work around my first roles.</p>`
    return kicker(R0) + `<h2>${key === 'home' ? 'Kunal Satpal' : R0.name}</h2>${R0.role && key !== 'writing' ? `<p class="role">${R0.role}</p>` : ''}<p class="body">${oneLine(R0.blurb)}</p>`
  }
  function showCity(key) {
    clearTimeout(hideT)
    current = cardFor = key; pinned = true
    note.style.setProperty('--c', realmBy[key] ? ok(48, .11, realmBy[key].hue) : ok(50, .08, 70))
    note.innerHTML = cityHTML(key)
    panelEl.classList.remove('open'); panelEl.classList.add('dock'); leader.classList.remove('on')
    openCard(true)
  }
  // Show the city's card whenever nothing else is showing, unless it was closed in this city.
  const ensure = () => { if (cityKey && !cardFor && dismissed !== cityKey && !caseId && !flyId) showCity(cityKey) }
  // Docked on the side away from the city, below the top bar; a building's card keeps its line to it.
  function dock(v) {
    const b = boxOf(cityKey), cx = project((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 0, v)[0]
    if (cx > VW * .56) side = 'l'; else if (cx < VW * .44) side = 'r'
    const left = side === 'r' ? VW - cardW - RAIL_ROOM : DOCK_GAP, top = DOCK_TOP
    panelEl.style.transform = `translate3d(${left.toFixed(1)}px,${top}px,0)`
    panelEl.classList.remove('off'); panelEl.classList.add('dock')
    if (!ROOMS[cardFor]) return leader.classList.remove('on')
    const a = anchorBox(v), seen = a.x1 > 0 && a.x0 < VW && a.y1 > 0 && a.y0 < VH
    const ax = side === 'r' ? a.x1 - Math.min(24, (a.x1 - a.x0) * .2) : a.x0 + Math.min(24, (a.x1 - a.x0) * .2), ay = clamp((a.y0 + a.y1) / 2, 0, VH)
    const bx = side === 'r' ? left : left + cardW, by = clamp(ay, top + 30, top + cardH - 30), mx = (ax + bx) / 2
    const under = side === 'r' ? ax > bx : ax < bx
    leader.firstElementChild.setAttribute('d', `M${f(ax)},${f(ay)}C${f(mx)},${f(ay)} ${f(mx)},${f(by)} ${f(bx)},${f(by)}`)
    leader.lastElementChild.setAttribute('cx', f(ax)); leader.lastElementChild.setAttribute('cy', f(ay))
    leader.classList.toggle('on', seen && !under)
  }
  const basePlace = placeCard, baseClose = closePanel, baseSettle = cardOnSettle
  placeCard = v => {
    const key = canDock() ? worldHere() : null
    if (key !== cityKey) { if (isCity(cardFor)) baseClose(); cityKey = key; dismissed = null }
    if (!cityKey) { panelEl.classList.remove('dock'); return basePlace(v) }
    ensure()
    if (!cardFor || !panelEl.classList.contains('open')) return leader.classList.remove('on')
    dock(v)
  }
  // Closing a building's card brings the city's back; closing the city's keeps it away here.
  closePanel = () => { const wasCity = isCity(cardFor); baseClose(); if (wasCity && cityKey) dismissed = cityKey; requestRender() }
  cardOnSettle = () => {
    if (!cityKey) return baseSettle()
    if (ROOMS[cardFor] && !caseId) { const b = anchorBox(view()); if (b.y1 < 0 || b.y0 > VH) closePanel() }
    ensure()
  }
  // The close button was wired before this file ran: note a city card being closed by it.
  $('close').addEventListener('click', () => { if (isCity(cardFor) && cityKey) dismissed = cityKey }, true)
  // After a case study closes, the city's card comes back without waiting for the map to move.
  const baseCloseCase = closeCase
  closeCase = then => { baseCloseCase(then); setTimeout(requestRender, 260) }
}
