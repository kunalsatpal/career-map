// =====================================================================================
// Case studies and field notes, as full pages, laid out like the ones on kunalsatpal.com:
// an opening with the title, its numbers and the final design, then numbered sections with
// the pictures on trays. A page settles in quietly over the map, and fades away again.
// =====================================================================================
const FULL_OF = { 'cult-fitclub': 'Fitclub', 'cult-cart': 'cart_abandonment', 'gojek-promo': 'promo',
  'blog-portfolio': 'portfolio', 'blog-curefit': 'Internship_curefit', 'blog-whatsapp': 'whatsapp', 'blog-pibit': 'Pibit' }
// Hinge Health's page (BATCH.hingePage). The work is under NDA, so it keeps to the outcomes already
// on the map, one section for each building, and each of the four buildings opens it.
const HINGE_PAGE = 'hinge-share'
const EXTRA_PAGES = !BATCH.hingePage ? {} : { [HINGE_PAGE]: { title: 'What I can share', realm: 'hinge', from: 'hinge-carehub', cases: [
  { k: 'CareHub 2.0', body: 'Owned the design of its core, the member record, the queue and AI actions, replacing the legacy tool. It is used by every PT and coach, with a 6% efficiency gain.' },
  { k: 'AI next-best-action', body: 'Set the strategy and roadmap for recommendations care teams can trust, cutting clinician time per member by 6–12%.' },
  { k: 'Care-team workflows', body: 'Simplified the everyday workflows care teams run in CareHub: time per member down 8% for PTs and 16% for coaches.' },
  { k: 'Video visits', body: 'Redesigned video visits between members and their care team: recording rates up from 53% to 95%, and visit time down 4.5%.' },
] } }
if (BATCH.hingePage) {
  PAGES[HINGE_PAGE] = { title: 'Designing the tools care teams use every day', hero: './site/img/proof_carehub.png',
    summary: "I design CareHub, the tool Hinge Health's physical therapists and health coaches use to care for members. Most of this work is under NDA, so this page sticks to outcomes. I'm glad to walk through the work itself in a conversation." }
  for (const id of ['hinge-carehub', 'hinge-ai', 'hinge-workflows', 'hinge-video']) Object.assign(ROOMS[id], { see: HINGE_PAGE, seeLabel: 'Read what I can share', soon: false })
}
const CASE_ORDER = [...(BATCH.hingePage ? [HINGE_PAGE] : []), 'gojek-promo', 'cult-cart', 'cult-fitclub']
// The field notes, one building each on their island.
const BLOGS = Object.keys(ROOMS).filter(id => ROOMS[id].realm === 'writing' && FULLCASE_DATA[FULL_OF[id]]).map(id => ({ id, title: ROOMS[id].title }))
const BLOG_ORDER = BLOGS.map(b => b.id)
// The page a building holds, if any. Work under NDA keeps its note and its numbers, but no page.
const letterFor = id => EXTRA_PAGES[id] ? id : !ROOMS[id] || ROOMS[id].nda ? null : (FULLCASE_DATA[FULL_OF[id]] || CASES[id]) ? id : null
const hasCase = id => !!letterFor(id)
function letterOf(id) {
  const X = EXTRA_PAGES[id]
  if (X) return { title: X.title, realm: X.realm, doc: id, cases: X.cases, blog: false, from: X.from }
  const B = ROOMS[id]
  return B ? { title: B.title, stat: B.stat, body: B.body, realm: B.realm, doc: FULL_OF[id], cases: CASES[id], blog: !!B.blog, from: id, href: B.href } : null
}
// The case studies are my own pages, but they are still HTML: keep only plain emphasis.
const keep = h => String(h ?? '').replace(/<(?!\/?(?:b|i|em|strong|br)\b)[^>]*>/gi, '').replace(/<(\/?)(b|i|em|strong|br)\b[^>]*>/gi, '<$1$2>')
const photo = (src, size = 'large', cap) => `<figure class="ph ${size} rise"><button class="phb" data-zoom="${abs(src)}" aria-label="Enlarge picture"><img src="${abs(src)}" alt="" loading="lazy" decoding="async" onerror="this.closest('figure').remove()"></button>${cap ? `<figcaption>${keep(cap)}</figcaption>` : ''}</figure>`
const clip = src => `<figure class="ph large rise"><video src="${abs(src)}" muted loop playsinline autoplay controls preload="metadata"></video></figure>`
const two = n => String(n).padStart(2, '0')
// Corrections laid over the pages as they come from kunalsatpal.com (BATCH.pageFixes), so the
// originals stay as they are: typos mended, and a picture of numbers set again as text.
const PAGE_FIXES = {
  Fitclub: [
    ['Beacuse of which a lot of cancellations happen with nearly zero penalty', 'Because of this, a lot of classes are cancelled with nearly zero penalty'],
    ['User motivations very much different from Eat.fit users.', 'Their motivations are very different from those of Eat.fit users.'],
    ['This internship has completely changed my mindset about gamification and incentivization.', 'What I still use: pick the motivation first, then the mechanic. A reward should feed the habit, never become it.'],
  ],
}
const PAGE_SWAPS = {
  './site/cases/m/d012e14b6c.png': { t: 'metrics', items: [['66', 'Fitcash flow on the app per user', 'up from 40, against a target of 50'], ['2.4', 'classes attended per user each month', 'up from 2.1, against a target of 3']] },
}
function fixedBlocks(doc, blocks) {
  if (!BATCH.pageFixes) return blocks.slice()
  const F = PAGE_FIXES[doc] || [], fix = h => F.reduce((s, [a, b]) => s.split(a).join(b), h)
  return blocks.map(b => PAGE_SWAPS[b.src] || (b.html ? { ...b, html: fix(b.html) } : b.items ? { ...b, items: b.items.map(fix) } : b.rows ? { ...b, rows: b.rows.map(r => r.map(fix)) } : b))
}
// The body: one numbered section per heading. With `page`, a cover that only repeats the
// title is left out when the page opens on the final design instead, as the website does.
function caseBody(id, page) {
  const L = letterOf(id), data = L && FULLCASE_DATA[L.doc]
  if (!data) return (L?.cases || []).map((c, i) => `<section><p class="pnum">${two(i + 1)}</p><h2>${c.k}</h2>${c.body ? `<p>${c.body}</p>` : ''}${c.list ? `<ul>${c.list.map(li => `<li>${li}</li>`).join('')}</ul>` : ''}`
    + (c.video ? clip(c.video) : c.img ? photo(c.img) : '') + '</section>').join('')
  const blocks = fixedBlocks(L.doc, data.blocks)
  if (page && PAGES[L.doc]?.hero) { const i = blocks.findIndex(b => b.t === 'img'); if (i >= 0 && i < 2) blocks.splice(i, 1) }
  let out = '', n = 0
  for (const b of blocks) {
    if (b.t === 'h') out += `${n ? '</section>' : ''}<section><p class="pnum">${two(++n)}</p><h2>${keep(b.text)}</h2>`
    else if (b.t === 'h3') out += `<h3>${keep(b.text)}</h3>`
    else if (b.t === 'p') out += `<p>${keep(b.html)}</p>`
    else if (b.t === 'list') { const tag = b.ordered ? 'ol' : 'ul'; out += `<${tag}>${b.items.map(x => `<li>${keep(x)}</li>`).join('')}</${tag}>` }
    else if (b.t === 'table') out += `<table>${b.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${keep(c)}</td>` : `<th>${keep(c)}</th>`).join('')}</tr>`).join('')}</table>`
    else if (b.t === 'img') out += photo(b.src, b.size === 'text' ? 'text' : b.size === 'wide' ? 'wide' : 'large', b.cap)
    else if (b.t === 'gallery') out += `<div class="gal rise${b.size === 'wide' ? ' wide' : ''}">${b.srcs.map((s, i) => photo(s, 'small', b.caps?.[i])).join('')}</div>`
    else if (b.t === 'video') out += clip(b.src)
    else if (b.t === 'metrics') out += `<dl class="pmetrics rise">${b.items.map(([n, what, from]) => `<div><dt>${n}</dt><dd><b>${what}</b>${from}</dd></div>`).join('')}</dl>`
  }
  return out + (n ? '</section>' : '')
}
const readMins = html => Math.max(2, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 200))
// Who a page is from: the company it was written at, or my own field notes.
const fromOf = L => L.realm && !L.blog ? realmBy[L.realm] : { name: 'Field notes', years: '', role: '', hue: 320, sig: 'quill' }
const plain = h => String(h).replace(/<[^>]+>/g, '')
function pageHTML(id) {
  const L = letterOf(id), from = fromOf(L), P = PAGES[L.doc] || {}, body = caseBody(id, true), mins = readMins(body)
  const order = L.blog ? BLOG_ORDER : CASE_ORDER, at = order.indexOf(id), kind = L.blog ? 'field note' : 'case study'
  const head = L.blog
    ? `<header class="phero blog">${P.icon ? `<div class="picon"${P.iconBg ? ` style="background:${P.iconBg}"` : ''}><img src="${abs(P.icon)}" alt=""${P.iconBg ? ` style="padding:${Math.round((P.iconPad ?? 11) * 1.3)}px"` : ' class="logo-fill"'}></div>` : ''}<p class="pkick">Field note ${two(P.n || 1)} · ${P.tag || 'Writing'} · ${mins} min read</p>`
      + `<h1>${P.title || L.title}</h1>${P.stand ? `<p class="pstand">${P.stand}</p>` : ''}</header>`
    : `<header class="phero case"><div class="ptext"><p class="pkick">${crest(from.hue, from.sig)}<span>${P.kicker || from.name} · ${from.years}</span></p><h1>${P.title || L.title}</h1>`
      + `${P.summary ? `<p class="psum">${P.summary}</p>` : ''}${P.chips ? `<dl class="pchips">${P.chips.map(([b, t]) => `<div><dt>${b}</dt><dd>${t}</dd></div>`).join('')}</dl>` : ''}<p class="pmeta">${from.role} · ${mins} min read</p></div>`
      + `${P.hero ? `<div class="pland"><img src="${abs(P.hero)}" alt="The final design"></div>` : ''}</header>`
  // The end offers two ways on: the one before and the one after, each with its picture.
  const card = (step, label) => {
    const to = order[(at + step + order.length) % order.length], N = to !== id && letterOf(to)
    if (!N) return ''
    const NP = PAGES[N.doc] || {}, pic = NP.hero || NP.icon, arrow = `<i aria-hidden="true">${step < 0 ? '←' : '→'}</i>`
    return `<button class="pnext${step < 0 ? ' prev' : ''}" data-case="${to}">${step < 0 ? arrow : ''}<span><small>${label} ${kind}</small><b>${plain(NP.title || N.title)}</b></span>`
      + `${pic ? `<img${NP.hero ? '' : NP.iconBg ? ` class="icon" style="background:${NP.iconBg}"` : ' class="icon logo-fill"'} src="${abs(pic)}" alt="">` : ''}${step > 0 ? arrow : ''}</button>`
  }
  const prev = order.length > 2 ? card(-1, 'Previous') : '', next = card(1, 'Next')
  // Every page ends with a way to get in touch (BATCH.pageFixes): write, or take the résumé.
  const cv = ROOMS['home-hello'].links.find(([t]) => /sum/.test(t)), title = plain(P.title || L.title)
  const say = BATCH.pageFixes || EXTRA_PAGES[id] ? `<p class="psay">Want to talk about ${L.blog ? 'this' : 'this work'}? <a href="mailto:kunalsatpal1@gmail.com?subject=${encodeURIComponent(title)}">Write to me</a><span aria-hidden="true"> · </span><a href="${abs(cv[1])}" target="_blank" rel="noopener">Résumé</a></p>` : ''
  const foot = `<footer class="pfoot">${prev || next ? `<nav class="pnav${prev && next ? ' two' : ''}" aria-label="More to read">${prev}${next}</nav>` : ''}`
    + say + `<button class="pback" data-close>Back to the map</button></footer>`
  return head + `<div class="pbody${L.blog ? ' blog' : ''}">${body}</div>` + foot
}

// ---------- Opening and closing ----------
// Quiet on purpose: the page fades up a few pixels over the map, and fades away again.
const letterEl = $('letter'), pageEl = letterEl.querySelector('.page'), lscroll = letterEl.querySelector('.lscroll'), lightbox = $('lightbox')
let caseId = null, letterFrom = null, seq = 0, reveal = null, riseIO = null
const SETTLE = 'cubic-bezier(.22, 1, .36, 1)'
// Pictures rise into place as they scroll into view.
function watchRise() {
  riseIO?.disconnect()
  const all = pageEl.querySelectorAll('.rise')
  if (reduce || !('IntersectionObserver' in window)) return all.forEach(el => el.classList.add('in'))
  riseIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); riseIO.unobserve(e.target) } }), { root: lscroll, rootMargin: '0px 0px -8% 0px' })
  all.forEach(el => riseIO.observe(el))
}
// Open a page: a building's (by its id), or a field note's.
function openCase(id) {
  id = letterFor(id)
  const L = id && letterOf(id)
  if (caseId || !L) return
  caseId = id; letterFrom = document.activeElement
  const my = ++seq
  closeMenu(); levelPeek(null); closePanel(); markVisited(L.from)
  pageEl.innerHTML = pageHTML(id); letterEl.style.setProperty('--rc', ok(46, .12, fromOf(L).hue))
  letterEl.hidden = false; letterEl.classList.remove('in'); lscroll.scrollTop = 0; watchRise()
  history.replaceState(null, '', `#${id}/read`)
  if (ROOMS[L.from]) citySelect(L.from)
  const done = () => { if (my !== seq) return; reveal?.cancel(); reveal = null; document.body.classList.add('reading-case'); pageEl.focus({ preventScroll: true }) }
  requestAnimationFrame(() => letterEl.classList.add('in'))
  if (reduce) return done()
  reveal?.cancel()
  reveal = letterEl.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: SETTLE, fill: 'forwards' })
  reveal.finished.then(done, () => {})
}
function closeCase(then) {
  if (!caseId) return
  const id = caseId, my = ++seq
  lightboxClose()
  document.body.classList.remove('reading-case')
  const done = () => {
    if (my !== seq) return
    reveal?.cancel(); reveal = null
    letterEl.hidden = true; letterEl.classList.remove('in'); pageEl.innerHTML = ''; riseIO?.disconnect(); caseId = null; citySelect(null)
    if (then) then(); else { const home = letterOf(id).from; history.replaceState(null, '', ROOMS[home] ? '#' + home : location.pathname + location.search); if (cardFor && cardFor === home) openCard(); letterFrom?.focus?.({ preventScroll: true }) }
  }
  if (reduce) return done()
  reveal?.cancel()
  reveal = letterEl.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' })
  reveal.finished.then(done, () => {})
}
function goCase(id) { if (caseId) return closeCase(() => goCase(id)); go(id, { enter: true }) }

// ---------- Looking closer ----------
function lightboxOpen(src) {
  lightbox.querySelector('.lbin').innerHTML = `<img src="${src}" alt="">`
  lightbox.hidden = false; lightbox.querySelector('.lbclose').focus({ preventScroll: true })
}
function lightboxClose() { if (lightbox.hidden) return; lightbox.hidden = true; lightbox.querySelector('.lbin').innerHTML = '' }
lightbox.addEventListener('click', lightboxClose)
letterEl.addEventListener('click', e => {
  const t = e.target.closest('[data-zoom], [data-close], [data-case]')
  if (t?.dataset.zoom) lightboxOpen(t.dataset.zoom)
  else if (t?.hasAttribute('data-close')) closeCase()
  else if (t?.dataset.case) { const n = t.dataset.case; closeCase(() => goCase(n)) }
})
addEventListener('keydown', e => {
  if (!caseId || e.key !== 'Escape') return
  e.preventDefault(); lightbox.hidden ? closeCase() : lightboxClose()
}, true)
