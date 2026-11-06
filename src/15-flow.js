// =====================================================================================
// Where you are: a thin rail down the right with a dot for each world. Each city's own
// banner on the map names it as you arrive.
// =====================================================================================
const rail = $('rail')
const RAIL = [{ key: 'start', name: 'Start', years: '' }, ...WORLDS]
rail.innerHTML = `<ol>${RAIL.map((w, i) => `<li><button data-world="${i}" aria-label="${w.name}${w.years ? `, ${w.years}` : ''}"><i></i><span><b>${w.name}</b>${w.years && !BATCH.railNames ? `<small>${w.years}</small>` : ''}</span></button></li>`).join('')}</ol>`
let worldAt = -1
document.body.classList.toggle('m2', BATCH.mobile2)
// Phones, third pass (00-batches.js): their CSS hangs off these classes, so a desktop never matches it.
document.body.classList.toggle('phone', PHONE); document.body.classList.toggle('ph-layers', PHONE_LAYERS)
rail.classList.toggle('polish', BATCH.railPolish); rail.classList.toggle('up', BATCH.railUp)
// Phones (BATCH.mobile): the rail's place in one line, "3 / 7 · Cult.fit", at the foot of the screen.
const whereChip = BATCH.mobile ? Object.assign(document.createElement('p'), { className: 'ui where', hidden: true }) : null
if (whereChip) { whereChip.setAttribute('aria-live', 'polite'); document.body.appendChild(whereChip) }
function placeRail(v) {
  const mid = cam.cy
  let wi = WORLDS.findIndex(w => mid <= w.y1 + 200 && mid > w.y0 + 200) + 1
  if (mid <= WORLDS.at(-1).y1 + 200) wi = WORLDS.length
  rail.style.setProperty('--p', clamp((START_Y - 300 - mid) / (START_Y - 300 - END_Y), 0, 1).toFixed(3))
  if (wi === worldAt) return
  worldAt = wi
  rail.querySelectorAll('button').forEach((b, i) => { b.setAttribute('aria-current', String(i === wi)); b.classList.toggle('past', i < wi) })
  if (whereChip) { whereChip.hidden = !wi; if (wi) whereChip.innerHTML = `<b>${wi} / ${WORLDS.length}</b> · ${WORLDS[wi - 1].name}` }
}
function goWorld(i) {
  if (i === 0) return fitAll()
  const w = WORLDS[i - 1], firstLevel = LEVELS.find(L => L.world === w.key)
  closePanel(); flyTo(0, firstLevel ? firstLevel.y - 120 : (w.y0 + w.y1) / 2, 0, 1400)
}
rail.addEventListener('click', e => { const b = e.target.closest('[data-world]'); if (b) goWorld(+b.dataset.world) })
function onLevelChange() {}
$('brand').addEventListener('click', () => { closePanel(); fitAll() })
