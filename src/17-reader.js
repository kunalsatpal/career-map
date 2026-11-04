// =====================================================================================
// The same work, as a plain page: for screen readers, for anyone in a hurry, for print.
// =====================================================================================
const readerEl = $('reader')
function buildReader() {
  const room = id => {
    const B = ROOMS[id], chs = CASES[id]
    return `<article id="r-${id}"><h3>${B.title}</h3>${B.stat ? `<p class="stat">${B.stat}</p>` : ''}${B.body ? `<p>${B.body}</p>` : ''}`
      + (B.list ? `<ul>${B.list.map(li => `<li>${li}</li>`).join('')}</ul>` : '')
      + (B.links ? `<ul>${B.links.map(([t, h]) => `<li><a href="${abs(h)}" target="_blank" rel="noopener">${t}</a></li>`).join('')}</ul>` : '')
      + (chs ? chs.map(c => `<h4>${c.k}</h4>${c.body ? `<p>${c.body}</p>` : ''}${c.list ? `<ul>${c.list.map(li => `<li>${li}</li>`).join('')}</ul>` : ''}${c.draft ? `<p class="draft">${c.draft}</p>` : ''}`).join('') : '')
      + `<p class="onmap"><button data-map="${id}">See it on the map</button>${B.href?.startsWith('#') ? ` · <button data-reader-case="${id}">${B.caseLabel || 'Full case study'} →</button>` : B.href ? ` · <a href="${abs(B.href)}" target="_blank" rel="noopener">Full case study ↗</a>` : ''}</p></article>`
  }
  const realms = REALMS.filter(r => r.key !== 'home')
  readerEl.querySelector('.rd').innerHTML = `<header><p class="kick">A map of the work of</p><h1>Kunal Satpal</h1><p class="lede">Staff Product Designer at Hinge Health. ${realmBy.home.blurb}</p>`
    + `<nav aria-label="Contents"><ol>${realms.map(r => `<li><a href="#rr-${r.key}">${r.name}</a> <span>${r.years}</span></li>`).join('')}<li><a href="#rr-earlier">Earlier stops</a> <span>2017 – 2019</span></li><li><a href="#rr-home">About me</a></li></ol></nav></header>`
    + realms.map(r => `<section id="rr-${r.key}" aria-labelledby="rh-${r.key}"><h2 id="rh-${r.key}">${r.name} <span>${r.years}</span></h2><p class="role">${r.role}</p><p>${r.blurb}</p>${roomsOf(r.key).map(([id]) => room(id)).join('')}</section>`).join('')
    + `<section id="rr-earlier"><h2>Earlier stops <span>2017 – 2019</span></h2>${STOPS.map(S => `<article><h3>${S.name}</h3><p>${[S.years, S.note].filter(Boolean).join(' · ')}</p></article>`).join('')}</section>`
    + `<section id="rr-home"><h2>About me</h2>${roomsOf('home').map(([id]) => room(id)).join('')}</section>`
}
let readerFrom = null
function openReader() {
  if (!readerEl.querySelector('article')) buildReader()
  readerFrom = document.activeElement
  closePanel(); closeMenu()
  readerEl.hidden = false; document.body.classList.add('reading')
  readerEl.scrollTop = 0; readerEl.querySelector('.rclose').focus({ preventScroll: true })
}
function closeReader() { if (readerEl.hidden) return; readerEl.hidden = true; document.body.classList.remove('reading'); readerFrom?.focus?.({ preventScroll: true }) }
readerEl.addEventListener('click', e => {
  if (e.target.closest('.rclose')) return closeReader()
  const full = e.target.closest('[data-reader-case]'); if (full) { closeReader(); goCase(full.dataset.readerCase); return }
  const m = e.target.closest('[data-map]'); if (m) { closeReader(); go(m.dataset.map) }
})
readerEl.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closeReader() } })

