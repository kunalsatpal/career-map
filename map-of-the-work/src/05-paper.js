// =====================================================================================
// Paper: painted once into a canvas. Light, warm and even, with a hand-coloured wash on
// each realm and along the coast, foxing at the edges, and the creases of its folds.
// =====================================================================================
// The paper is painted at modest resolution (it is all soft washes; the grain on top is a
// sharp tile), and runs well past the drawing on every side, so the land never ends in view.
// Phones get a smaller one: the paper is the biggest texture on the page.
const PM = 1000, PMN = 1800, PK = Math.min(innerWidth, innerHeight) <= 760 ? .3 : .38, PW = Math.round((W + 2 * PM) * PK), PH = Math.round((H + PM + PMN) * PK)
function valueNoise(w, h, seed) {
  const r = rng(seed), c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d'), img = g.createImageData(w, h)
  for (let i = 0; i < w * h; i++) { const v = r() * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255 }
  g.putImageData(img, 0, 0)
  return c
}
// A soft, slightly ragged blob around a box: the edge a brush leaves.
function blobPath(g, x0, y0, x1, y1, seed, rough = .1) {
  const r = rng(seed), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2, n = 28, pts = []
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, k = 1 + (r() - .5) * rough * 2, c = Math.cos(a), s = Math.sin(a)
    const e = Math.pow(Math.abs(c) ** 4 + Math.abs(s) ** 4, -.25)   // a rounded rectangle, not an ellipse
    pts.push([cx + c * rx * e * k, cy + s * ry * e * k])
  }
  g.beginPath()
  pts.forEach((p, i) => { const q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; i ? g.quadraticCurveTo(p[0], p[1], m[0], m[1]) : g.moveTo(m[0], m[1]) })
  g.closePath()
}
// Grain, fibres and gentle unevenness: the paper before anything is drawn on it.
function paperBase(g, w, h, seed) {
  g.fillStyle = 'rgb(238,227,201)'; g.fillRect(0, 0, w, h)
  g.imageSmoothingQuality = 'high'
  g.globalCompositeOperation = 'multiply'
  for (const [nw, a, sd] of [[14, .07, seed], [42, .045, seed + 1]]) { const nh = Math.max(2, Math.round(nw * h / w)), n = valueNoise(nw, nh, sd); g.globalAlpha = a; g.filter = `blur(${Math.round(w / nw * .5)}px)`; g.drawImage(n, -40, -40, w + 80, h + 80) }
  g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
}
function paperFinish(g, w, h, seed) {
  const r = rng(seed)
  g.globalCompositeOperation = 'source-over'
  for (let i = 0; i < w * h / 700; i++) { const x = r() * w, y = r() * h, a = r() * Math.PI, l = 3 + r() * 10; g.strokeStyle = r() < .5 ? 'rgba(120,90,50,.05)' : 'rgba(255,250,236,.12)'; g.lineWidth = .6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + r() * 2, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke() }
}
// The map's sheet: sea and land hand-coloured, a wash over each realm. The bare paper, before any
// colour, is kept for the opening's blank sheet (18-spread.js) until it has been laid.
let BARE = null
function paintPaper() {
  const c = document.createElement('canvas'); c.width = PW; c.height = PH
  const g = c.getContext('2d')
  paperBase(g, PW, PH, 3)
  if (BATCH.calmOpen && !reduce) { BARE = document.createElement('canvas'); BARE.width = PW; BARE.height = PH; BARE.getContext('2d').drawImage(c, 0, 0) }
  g.globalCompositeOperation = 'multiply'
  const wash = (fill, draw, blur) => { g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = fill; g.strokeStyle = fill; draw(); g.restore() }
  g.scale(PK, PK); g.translate(PM, PMN)
  const outline = pts => { g.moveTo(pts[0][0], pts[0][1]); pts.forEach(([x, y]) => g.lineTo(x, y)); g.closePath() }
  const shore = () => { g.moveTo(...COAST[0]); COAST.forEach(([x, y]) => g.lineTo(x, y)) }
  wash('rgba(190,214,222,.4)', () => { g.beginPath(); g.rect(-PM, -PMN, W + 2 * PM, H + PM + PMN); outline(LAND); SHORES.forEach(outline); g.fill('evenodd') }, 24)
  wash('rgba(150,188,204,.5)', () => { g.lineWidth = 40; g.lineJoin = 'round'; g.beginPath(); shore(); g.stroke(); for (const p of SHORES) { g.beginPath(); outline(p); g.stroke() } }, 14)
  wash('rgba(150,190,206,.62)', () => { g.lineWidth = 30; g.lineJoin = 'round'; for (const rv of RIVERS) { g.beginPath(); rv.pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke() } }, 6)
  for (const R0 of REALMS) {
    const [r, gg, b] = ['iit', 'intern', 'home', 'writing'].includes(R0.key) ? oklchRGB(.9, .05, 122) : oklchRGB(.9, .055, R0.hue), b0 = R0.key === 'home' ? GEO.isleBox : R0.box
    wash(`rgba(${r * 255 | 0},${gg * 255 | 0},${b * 255 | 0},.72)`, () => { blobPath(g, b0.x0 - 20, b0.y0 + 20, b0.x1 + 20, b0.y1 + 10, R0.ox, .06); g.fill() }, 22)
  }
  { const g0 = PARTS.find(p => p.t === 'garden'); wash('rgba(150,196,118,.5)', () => { g.beginPath(); g.rect(g0.x + 8, g0.y + 8, g0.w - 16, g0.h - 16); g.fill() }, 4) }
  // A sandy beach just inside each island's shore.
  wash('rgba(222,198,146,.55)', () => { g.lineWidth = 60; g.lineJoin = 'round'; for (const p of SHORES) { g.save(); g.beginPath(); outline(p); g.clip(); g.beginPath(); outline(p); g.stroke(); g.restore() } }, 10)
  // Hand-colour edging just inside the coast, as the Homann workshop coloured its maps.
  wash('rgba(170,186,120,.45)', () => { g.lineWidth = 56; g.lineJoin = 'round'; g.save(); g.beginPath(); outline(LAND); g.clip(); g.beginPath(); shore(); g.stroke(); g.restore() }, 12)
  for (const [cx, cy, rx, ry] of GEO.forests) if (onLand(cx, cy)) wash('rgba(150,176,120,.4)', () => { g.beginPath(); g.ellipse(cx, cy, rx * 1.05, ry * 1.05, 0, 0, Math.PI * 2); g.fill() }, 24)
  { const Mn = GEO.mountains; wash('rgba(176,150,112,.28)', () => { g.beginPath(); g.rect(-700, Mn.y0, W + 1400, Mn.y1 - Mn.y0 + 40); g.fill() }, 40) }
  for (const Q of STOPS) wash('rgba(222,210,170,.6)', () => { g.beginPath(); g.arc(Q.x, Q.y, Q.r * 1.2, 0, Math.PI * 2); g.fill() }, 12)
  g.setTransform(1, 0, 0, 1, 0, 0)
  paperFinish(g, PW, PH, 9)
  return c
}
// A small tile of grain for close up, where the big sheet would be soft.
let GRAIN = null
function grainTile() {
  if (GRAIN) return GRAIN
  const c = document.createElement('canvas'), S = 512; c.width = c.height = S
  const g = c.getContext('2d'), r = rng(3)
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${90 + r() * 50},${66 + r() * 34},38,${r() * .07})`; g.fillRect(r() * S, r() * S, 1 + r(), 1 + r()) }
  g.lineWidth = .6
  for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S, a = r() * Math.PI, l = 4 + r() * 14; g.strokeStyle = r() < .6 ? 'rgba(110,80,44,.05)' : 'rgba(255,250,236,.16)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke() }
  return (GRAIN = c)
}
