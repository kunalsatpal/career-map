// =====================================================================================
// Specimens: the map's small delights, live on the page that tells their story (my portfolio's
// field note). Each sits on a small sheet of its own and answers the pointer as it does on the
// map, with the same pieces: the compass rose and its needle, the ship and her wreck (shipSink),
// rings on the water, the whale, the wand's sparks and words, my footprints, the spreading ink.
// Nothing runs until a sheet is touched or scrolled into view, and every effect removes itself.
//
// And the chapters rail: a long field note gets a way along it that keeps your place. Beside the
// text on a wide screen; dots only when the gutter is narrow; a pill at the foot on a phone.
// =====================================================================================
const SP_NEEDLE = '<svg viewBox="-50 -50 100 100" aria-hidden="true"><path class="n" d="M0-46L8 0L0 5L-8 0Z"/><path class="s" d="M0 46L8 0L0-5L-8 0Z"/><circle r="4.5"/></svg>'
// The road my footprints walk on the secret's sheet, in its 600 × 260 drawing.
const SP_ROAD = 'M-10 214C96 206 150 120 250 140S400 230 470 160S560 70 612 64'
const spReplay = '<button class="sp-btn" data-sp-replay>Replay</button>'

function specimenHTML(b) {
  const k = b.kind, head = `<div class="sp-head"><p class="sp-title">${keep(b.title)}</p><p class="sp-hint">${keep(b.hint)}</p></div>`
  const stage = {
    compass: `<div class="sp-stage" data-sp="compass" role="img" aria-label="${caseAttr('A compass rose. Its needle follows the pointer and spins when clicked.')}">`
      + `<img class="sp-rose" src="${abs('./assets/compass.webp')}" alt="" width="380" height="380" loading="lazy" decoding="async"><div class="sp-needle">${SP_NEEDLE}</div></div>`,
    sea: `<div class="sp-stage" data-sp="sea" role="img" aria-label="${caseAttr('A ship on an engraved sea. Click her and she sinks, then comes back; click the water and it rings.')}">`
      + `<div class="ship sp-ship" data-sp-ship><img src="${abs('./assets/ship.webp')}" width="112" height="115" alt=""></div><div class="sp-whale" aria-hidden="true"><img src="${abs('./assets/whale.webp')}" width="170" height="105" alt=""><i></i><i></i></div></div>`,
    wand: `<div class="sp-stage" data-sp="wand" role="img" aria-label="${caseAttr('Hinge Health’s campus on the map, with a wizard at work. Clicking casts a spell.')}"><img src="${abs(b.src)}" alt="" loading="lazy" decoding="async"></div>`,
    swear: `<div class="sp-stage" data-sp="swear" tabindex="0" aria-label="${caseAttr('A blank stretch of the map. Focus it and type I solemnly swear, or use the button.')}">`
      + `<svg class="sp-road" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true"><path d="${SP_ROAD}"/></svg><p class="sp-prompt" aria-hidden="true">Click here, then type <q>I solemnly swear</q></p><p class="sp-ink" aria-live="polite"></p></div>`,
    spread: `<div class="sp-stage" data-sp="spread" role="img" aria-label="${caseAttr('The title page of the map, revealed as ink spreads out from the middle of a blank sheet.')}"><img src="${abs(b.src)}" alt="" loading="lazy" decoding="async"><span class="sp-blank" aria-hidden="true"></span><span class="sp-bloom" aria-hidden="true"></span></div>`,
  }[k] || ''
  const after = k === 'swear' ? '<button class="sp-btn" data-sp-say>Say it for me</button>' : k === 'spread' ? spReplay : ''
  return `<figure class="specimen sp-${k} rise" data-specimen="${k}">${head}${stage}<div class="sp-foot">${b.cap ? `<figcaption>${keep(b.cap)}</figcaption>` : ''}${after}</div></figure>`
}

// ---------- What each sheet does ----------
const spLocal = (st, e) => { const r = st.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r] }
// A short-lived element on a sheet, moved by the compositor and removed when it is done.
function spFly(st, cls, html, frames, opts) {
  const el = document.createElement(cls === 'wspark' ? 'i' : 'div'); el.className = cls; el.setAttribute('aria-hidden', 'true'); if (html) el.innerHTML = html
  st.appendChild(el); el.animate(frames, { fill: 'both', ...opts }).finished.then(() => el.remove(), () => el.remove())
  return el
}
function spRings(st, X, Y, w = 70) {
  for (let i = 0; i < 2; i++) {
    const r = spFly(st, 'ripple sp-ring', RINGS, [{ transform: 'scale(.25)', opacity: .85 }, { transform: 'scale(1)', opacity: 0 }], { duration: 1200, delay: i * 260, easing: 'ease-out' })
    Object.assign(r.style, { left: X - w / 2 + 'px', top: Y - w * .13 + 'px', width: w + 'px', height: w * .26 + 'px' })
  }
}
// The whale wakes after a few rings on the water, somewhere away from the ship.
function spWhale(st) {
  const wh = st.querySelector('.sp-whale'), W = st.clientWidth
  if (!wh || wh.busy) return
  wh.busy = true; wh.style.left = Math.round(W * (.18 + Math.random() * .5)) + 'px'
  wh.querySelector('img').animate([
    { transform: 'translateY(46px) rotate(-14deg) scale(.86)', opacity: 0 },
    { transform: 'translateY(-8px) rotate(-4deg) scale(1)', opacity: 1, offset: .32 },
    { transform: 'translateY(-14px) rotate(6deg) scale(1)', opacity: 1, offset: .58 },
    { transform: 'translateY(52px) rotate(18deg) scale(.9)', opacity: 0 }], { duration: 3600, easing: 'ease-in-out', fill: 'both' })
  wh.querySelectorAll('i').forEach((r, k) => r.animate([{ transform: 'scale(.2)', opacity: 0 }, { opacity: .8, offset: .2 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 1800, delay: 1900 + k * 300, fill: 'both', easing: 'ease-out' }))
  setTimeout(() => { wh.busy = false }, 4200)
}
// The wand: sparks where it touches, and a word in a bubble. The wizard says hello first.
const SP_WIZ = [.497, .505]
function spCast(st, e) {
  const [X, Y, r] = spLocal(st, e), nearWiz = Math.hypot(X / r.width - SP_WIZ[0], (Y / r.height - SP_WIZ[1]) * .6) < .07
  const [x0, y0] = nearWiz ? [SP_WIZ[0] * r.width, SP_WIZ[1] * r.height - 18] : [X, Y]
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + Math.random() * .5, d = 22 * (.6 + Math.random() * .8)
    spFly(st, 'wspark', '', [{ transform: `translate(${x0}px,${y0}px)`, opacity: 1 }, { transform: `translate(${x0 + Math.cos(a) * d}px,${y0 + Math.sin(a) * d * .7 - 11}px) scale(.5)`, opacity: 0 }], { duration: 550 + Math.random() * 350, easing: 'cubic-bezier(.2, .7, .3, 1)' })
  }
  st.querySelector('.hello')?.remove()
  st.spell = (st.spell || 0) + 1
  const text = nearWiz && st.spell % 3 === 1 ? pick(HELLO) : SPELLS[(st.spell - 1) % SPELLS.length]
  const b = spFly(st, 'hello', `<span>${text}</span>`, [{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 2000 })
  b.style.transform = `translate(${x0}px,${y0 - 14}px)`
}
// The secret: the oath written in ink, then my footprints along the road with my name,
// until "Mischief managed" (said by me at the end, or typed by you) wipes them.
function spSwear(st) {
  if (st.walk) return
  const ink = st.querySelector('.sp-ink'), path = st.querySelector('.sp-road path'), L = path.getTotalLength()
  const write = text => { ink.textContent = text; ink.getAnimations().forEach(a => a.cancel()); ink.animate([{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, offset: .35 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, offset: .85 }, { clipPath: 'inset(0 0% 0 0)', opacity: 0 }], { duration: 4200, easing: 'ease-out', fill: 'both' }) }
  st.classList.add('sworn'); write('I solemnly swear that I am up to no good.')
  const label = document.createElement('div'); label.className = 'mlabel sp-name'; label.setAttribute('aria-hidden', 'true'); label.innerHTML = '<span>Kunal Satpal</span>'; st.appendChild(label)
  const at = s => { const p = path.getPointAtLength(clamp(s, 0, L)), W = st.clientWidth / 600, H = st.clientHeight / 260; return [p.x * W, p.y * H] }
  let k = 0, side = 1; const n = 30
  const end = () => { clearTimeout(st.walk); st.walk = 0; write('Mischief managed.'); label.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' }).finished.then(() => label.remove(), () => label.remove()); setTimeout(() => st.classList.remove('sworn'), 3800) }
  const step = () => {
    if (!st.isConnected) return
    if (k >= n) return end()
    const s = L * k / (n - 1), [x, y] = at(s), [x2, y2] = at(s + 6), ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI; side = -side
    const px = x + Math.cos((ang + 90) * Math.PI / 180) * 5 * side, py = y + Math.sin((ang + 90) * Math.PI / 180) * 5 * side
    const f = spFly(st, 'sp-step', FOOT('marauder'), [{ opacity: 0 }, { opacity: .9, offset: .03 }, { opacity: .65, offset: .35 }, { opacity: 0 }], { duration: 2600, easing: 'linear' })
    f.style.transform = `translate(${(px - 12).toFixed(1)}px,${(py - 8).toFixed(1)}px) rotate(${(ang + side * 6).toFixed(1)}deg)`
    label.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`
    k++; st.walk = setTimeout(step, 330)
  }
  st.end = end; st.walk = setTimeout(step, 1100)
}

// ---------- Wiring, once for every page ----------
letterEl.addEventListener('pointermove', e => {
  const st = e.target.closest?.('[data-sp="compass"]')
  if (!st || reduce || st.raf) return
  st.raf = requestAnimationFrame(() => {
    st.raf = 0; const [X, Y, r] = spLocal(st, e)
    st.deg = Math.atan2(X - r.width / 2, -(Y - r.height / 2)) * 180 / Math.PI
    st.querySelector('.sp-needle svg').style.rotate = st.deg.toFixed(1) + 'deg'
  })
})
letterEl.addEventListener('pointerover', e => { const st = e.target.closest?.('[data-sp]'); if (st && !st.dataset.wand) { st.dataset.wand = 1; st.style.cursor = WAND } })
letterEl.addEventListener('pointerout', e => {
  const st = e.target.closest?.('[data-sp="compass"]')
  if (st && !st.contains(e.relatedTarget)) { st.deg = 0; st.querySelector('.sp-needle svg').style.rotate = '0deg' }
})
letterEl.addEventListener('click', e => {
  if (e.target.closest('[data-sp-say]')) return spSwear(e.target.closest('.specimen').querySelector('[data-sp]'))
  if (e.target.closest('[data-sp-replay]')) { const st = e.target.closest('.specimen').querySelector('[data-sp]'); st.getAnimations({ subtree: true }).forEach(a => { a.cancel(); a.play() }); return }
  const st = e.target.closest('[data-sp]')
  if (!st || reduce) return
  const kind = st.dataset.sp
  if (kind === 'compass') { const svg = st.querySelector('.sp-needle svg'), d = st.deg || 0; svg.animate([{ rotate: d + 'deg' }, { rotate: d + 720 + 'deg' }], { duration: 1600, easing: 'cubic-bezier(.2, .8, .3, 1)' }) }
  else if (kind === 'sea') {
    const ship = e.target.closest('[data-sp-ship]')
    if (ship) return shipSink(ship)
    const [X, Y] = spLocal(st, e); spRings(st, X, Y)
    st.rings = (st.rings || 0) + 1; if (st.rings % 4 === 0) setTimeout(() => spWhale(st), 500)
  }
  else if (kind === 'wand') spCast(st, e)
  else if (kind === 'swear') st.focus({ preventScroll: true })
})
// Typing on the secret's sheet: the oath, or "mischief managed" to end the walk early.
letterEl.addEventListener('keydown', e => {
  const st = e.target.closest?.('[data-sp="swear"]')
  if (!st || e.metaKey || e.ctrlKey || e.altKey) return
  const key = e.key.toLowerCase(), t = performance.now()
  if (t - (st.typedAt || 0) > 2500) st.typed = ''
  st.typedAt = t
  if (key === ' ' || key === 'enter') { e.preventDefault(); if (key === 'enter') spSwear(st); return }
  if (!/^[a-z]$/.test(key)) return
  let s = (st.typed || '') + key
  while (s && !SECRET.startsWith(s) && !MISCHIEF.startsWith(s)) s = s.slice(1)
  st.typed = s
  if (s === SECRET) { st.typed = ''; spSwear(st) }
  else if (s === MISCHIEF) { st.typed = ''; st.walk && st.end?.() }
})

// ---------- The chapters rail ----------
// Its chapters come from the field note's own list (`jump`: the words a heading starts with, a
// short label and a year), so a new chapter is one line in its JSON.
function chapRailHTML(L) {
  const D = FULLCASE_DATA[L.doc], J = D?.jump
  if (!J?.length) return ''
  const heads = D.blocks.filter(b => b.t === 'h')
  const items = J.map(j => { const h = heads.find(b => b.text.includes(j.match)); return h && { id: h.id || headId(h.text), label: j.label, year: j.year || (h.text.match(/\b(?:19|20)\d\d\b/) || [''])[0] } }).filter(Boolean)
  if (items.length < 3) return ''
  const n = items.length
  return `<nav class="chap-rail" aria-label="Chapters" style="--n:${n}"><p class="cr-title">Chapters</p><ol>${items.map((it, i) => `<li style="--i:${i}"><button data-case-jump="${it.id}" data-chap="${it.id}"><span class="cr-dot" aria-hidden="true"></span><span class="cr-year">${keep(it.year)}</span><span class="cr-label">${keep(it.label)}</span></button></li>`).join('')}</ol>`
    + `<div class="chap-pill"><button class="cp-step" data-chap-step="-1" aria-label="Previous chapter">‹</button><button class="cp-now" data-chap-open aria-expanded="false"><span class="cp-n">01 / ${two(n)}</span><span class="cp-label">${keep(items[0].label)}</span></button><button class="cp-step" data-chap-step="1" aria-label="Next chapter">›</button></div></nav>`
}
let spyRaf = 0
function chapSpy() {
  const nav = pageEl.querySelector('.chap-rail')
  if (!nav) return
  const btns = [...nav.querySelectorAll('[data-chap]')], H = lscroll.clientHeight
  let cur = -1
  btns.forEach((b, i) => { const s = document.getElementById(b.dataset.chap); if (s && s.getBoundingClientRect().top < H * .4) cur = i })
  if (nav.cur !== cur) {
    nav.cur = cur
    btns.forEach((b, i) => { b.classList.toggle('past', i < cur); if (i === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current') })
    nav.style.setProperty('--p', Math.max(0, cur) / (btns.length - 1))
    const now = btns[Math.max(0, cur)]
    nav.querySelector('.cp-n').textContent = `${two(Math.max(0, cur) + 1)} / ${two(btns.length)}`
    nav.querySelector('.cp-label').textContent = now.querySelector('.cr-label').textContent
  }
  const foot = pageEl.querySelector('.pfoot')?.getBoundingClientRect().top ?? Infinity
  nav.classList.toggle('on', lscroll.scrollTop > H * .55 && foot > H * .55)
  if (!nav.classList.contains('on')) chapList(nav, false)
}
function chapList(nav, open) { nav.classList.toggle('open', open); nav.querySelector('[data-chap-open]')?.setAttribute('aria-expanded', open) }
lscroll.addEventListener('scroll', () => { if (!spyRaf) spyRaf = requestAnimationFrame(() => { spyRaf = 0; chapSpy() }) }, { passive: true })
letterEl.addEventListener('click', e => {
  const nav = e.target.closest?.('.chap-rail')
  if (!nav) { const open = pageEl.querySelector('.chap-rail.open'); if (open) chapList(open, false); return }
  if (e.target.closest('[data-chap-open]')) return chapList(nav, !nav.classList.contains('open'))
  const step = e.target.closest('[data-chap-step]')
  if (step) { const btns = nav.querySelectorAll('[data-chap]'), i = clamp((nav.cur ?? -1) + Number(step.dataset.chapStep), 0, btns.length - 1); btns[i].click(); return }
  if (e.target.closest('[data-chap]')) chapList(nav, false)
})
