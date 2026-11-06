'use strict'
// =====================================================================================
// Basics: the sheet, randomness, curves, colour.
// =====================================================================================
const W = 1900, H = 8600
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse = matchMedia('(pointer: coarse)').matches
// A touch phone: a coarse pointer and a small screen (its shorter side, so turning it doesn't change it).
// A desktop or laptop is never one, whatever its window size; the phone-only batches check this.
const PHONE = coarse && Math.min(screen.width, screen.height) <= 760
const PHONE_LAYERS = PHONE && BATCH.phoneLayers, PHONE_FRAME = PHONE && BATCH.phoneFrame, PHONE_START = PHONE && BATCH.phoneStart, PHONE_LITE = PHONE && BATCH.phoneLite
const $ = id => document.getElementById(id)
const SVGNS = 'http://www.w3.org/2000/svg'
const SITE = 'https://kunalsatpal.com/kunalsatpal.com/'
// Pictures travel with the map, in its own site/ folder; pages and links point to the website.
const abs = p => !p ? null : /^(https?:|mailto:)/.test(p) ? p : /^(\.\/)?(site|assets)\//.test(p) ? p.replace(/^\.\//, '') : SITE + p.replace(/^\.\//, '')
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function rng(seed) { let a = seed * 2654435761 >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
let R = rng(1)
const J = a => (R() - .5) * 2 * a
const f = n => (Math.round(n * 10) / 10).toString()
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
const easeOut = t => 1 - Math.pow(1 - t, 4)
const easeInOut = t => t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2

// A line drawn by a steady hand: straight, with the faintest tremor.
function hline(pts, closed = false, j = .28, seg = 60) {
  let d = ''
  const n = pts.length, m = closed ? n : n - 1
  for (let i = 0; i < m; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n]
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, k = Math.max(1, Math.round(L / seg)), nx = -(y2 - y1) / L, ny = (x2 - x1) / L
    if (i === 0) d += `M${f(x1)},${f(y1)}`
    for (let s = 1; s <= k; s++) { const t = s / k, o = s < k ? J(j) : 0; d += `L${f(x1 + (x2 - x1) * t + nx * o)},${f(y1 + (y2 - y1) * t + ny * o)}` }
  }
  return d + (closed ? 'Z' : '')
}
const circleD = (cx, cy, r) => `M${f(cx - r)},${f(cy)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0Z`
const rectD = (x, y, w, h) => `M${f(x)},${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`
const ring = (cx, cy, r, n, j = 0, rot = 0) => Array.from({ length: n }, (_, i) => { const a = rot + i / n * Math.PI * 2, rr = r + J(j); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] })

// Smooth curve through points (Catmull–Rom as cubic Béziers).
function smooth(pts, closed = false) {
  const n = pts.length, P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2)
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`
  }
  return d + (closed ? 'Z' : '')
}
// Dense samples along the same curve.
function sample(pts, step = 6, closed = false) {
  const n = pts.length, P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))], out = []
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), k = Math.max(2, Math.ceil(L / step))
    for (let s = 0; s < k; s++) {
      const t = s / k, t2 = t * t, t3 = t2 * t
      const c = (a, b, c2, d2) => .5 * ((2 * b) + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d2) * t2 + (-a + 3 * b - 3 * c2 + d2) * t3)
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  if (!closed) out.push(pts[n - 1])
  return out
}
const lengthOf = s => s.reduce((a, p, i) => i ? a + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0, 0)
// Offset a sampled line to its left (y down), keeping its ends square.
function offset(s, d) {
  return s.map((p, i) => { const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [p[0] + (b[1] - a[1]) / L * d, p[1] - (b[0] - a[0]) / L * d] })
}
const polyD = (pts, closed = true) => 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join('L') + (closed ? 'Z' : '')
const distTo = (pts, x, y) => { let m = Infinity; for (const p of pts) { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < m) m = d } return Math.sqrt(m) }
const inside = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c } return c }
const area = pts => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1] }, 0) / 2
// A polygon pushed inward by d, with mitred corners (simple polygons).
function insetPoly(pts, d) {
  const n = pts.length, s = area(pts) > 0 ? 1 : -1
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n]
    const e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]], l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1
    const n1 = [-e1[1] / l1 * s, e1[0] / l1 * s], n2 = [-e2[1] / l2 * s, e2[0] / l2 * s]
    const m = [n1[0] + n2[0], n1[1] + n2[1]], ml = Math.hypot(...m) || 1, k = d / Math.max(.2, (m[0] * n1[0] + m[1] * n1[1]) / ml)
    return [p[0] + m[0] / ml * k, p[1] + m[1] / ml * k]
  })
}

// OKLCH → sRGB (0–1), so the canvas and the GPU share the page's colours.
function oklchRGB(L, C, h) {
  const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180)
  const l_ = L + .3963377774 * a + .2158037573 * b, m_ = L - .1055613458 * a - .0638541728 * b, s_ = L - .0894841775 * a - 1.291485548 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  const lin = [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s]
  return lin.map(c => clamp(c <= .0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - .055, 0, 1))
}
const ok = (L, C, h) => `oklch(${L}% ${C} ${h})`
const rgbCSS = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`
