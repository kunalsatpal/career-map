// =====================================================================================
// The ink. One steady pen in three weights, poché walls, plans with their furniture,
// and the land around them. Everything collects into a few combined paths per weight.
// =====================================================================================
const ORDER = ['road', 'crown', 'pfill', 'block', 'stip', 'tone', 'hatch', 'hair', 'fine', 'main', 'bold', 'dash', 'dot', 'lane', 'solid']
class Pen {
  constructor() { this.k = {}; this.txt = '' }
  a(cls, d) { this.k[cls] = (this.k[cls] || '') + d; return this }
  svg() { return ORDER.map(c => this.k[c] ? `<path class="${c}" d="${this.k[c]}"/>` : '').join('') + (this.names ? '' : this.txt) }
  line(pts, cls = 'fine', closed = false) { return this.a(cls, hline(pts, closed)) }
  rect(x, y, w, h, cls = 'fine') { return this.a(cls, hline([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true)) }
  circ(cx, cy, r, cls = 'fine') { return this.a(cls, circleD(cx, cy, r)) }
  text(x, y, s, size, cls = 'rn', extra = '') { this.txt += `<text class="${cls}" x="${f(x)}" y="${f(y)}" font-size="${f(size)}"${extra}>${esc(s)}</text>`; return this }
  // A wall of thickness th along an open polyline: two lines, the poché between, capped ends.
  band(pts, th) {
    const o = offsetLine(pts, th / 2), i = offsetLine(pts, -th / 2), body = polyD([...o, ...i.reverse()])
    this.a('tone', body).a('hatch', body).line(o, 'main').line(i.reverse(), 'fine')
    this.line([o[0], i[0]], 'fine').line([o.at(-1), i.at(-1)], 'fine')
    return this
  }
  // A round wall, optionally broken by a doorway centred on angle `gap` (radians).
  ringBand(cx, cy, r, th, gap = null, gw = .32) {
    if (gap === null) {
      const body = circleD(cx, cy, r) + circleD(cx, cy, r - th)
      return this.a('tone', body).a('hatch', body).circ(cx, cy, r, 'main').circ(cx, cy, r - th, 'fine')
    }
    const a0 = gap + gw / 2, a1 = gap - gw / 2 + Math.PI * 2, P = (rr, a) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]
    const arc = (rr, from, to, sweep) => { const p = P(rr, to); return `A${f(rr)},${f(rr)} 0 ${Math.abs(to - from) > Math.PI ? 1 : 0} ${sweep} ${f(p[0])},${f(p[1])}` }
    const o0 = P(r, a0), i1 = P(r - th, a1), i0 = P(r - th, a0)
    const body = `M${f(o0[0])},${f(o0[1])}${arc(r, a0, a1, 1)}L${f(i1[0])},${f(i1[1])}${arc(r - th, a1, a0, 0)}Z`
    this.a('tone', body).a('hatch', body)
    this.a('main', `M${f(o0[0])},${f(o0[1])}${arc(r, a0, a1, 1)}`).a('fine', `M${f(i0[0])},${f(i0[1])}${arc(r - th, a0, a1, 1)}`)
    const o1 = P(r, a1)
    return this.line([o0, i0], 'fine').line([o1, i1], 'fine')
  }
  // A building's walls, set inside its footprint, with a doorway on one side.
  boxWall(x, y, w, h, th, door = { side: 's', at: .5, w: 24 }) {
    const t = th / 2, X0 = x + t, Y0 = y + t, X1 = x + w - t, Y1 = y + h - t
    if (!door) { const o = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], i = [[X0 + t, Y0 + t], [X1 - t, Y0 + t], [X1 - t, Y1 - t], [X0 + t, Y1 - t]]; const body = polyD(o) + polyD([...i].reverse()); return this.a('tone', body).a('hatch', body).line(o, 'main', true).line(i, 'fine', true) }
    const dw = door.w / 2, at = door.at
    const paths = {
      s: () => { const c = lerp(X0, X1, at); return [[c - dw, Y1], [X0, Y1], [X0, Y0], [X1, Y0], [X1, Y1], [c + dw, Y1]] },
      n: () => { const c = lerp(X0, X1, at); return [[c + dw, Y0], [X1, Y0], [X1, Y1], [X0, Y1], [X0, Y0], [c - dw, Y0]] },
      w: () => { const c = lerp(Y0, Y1, at); return [[X0, c - dw], [X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1], [X0, c + dw]] },
      e: () => { const c = lerp(Y0, Y1, at); return [[X1, c + dw], [X1, Y1], [X0, Y1], [X0, Y0], [X1, Y0], [X1, c - dw]] },
    }
    return this.band(paths[door.side](), th)
  }
}
// Offset an open polyline to its left (y down), with mitred joints and square ends.
function offsetLine(pts, d) {
  const n = pts.length
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]
    if (i === 0 || i === n - 1) { const [q0, q1] = i === 0 ? [p, b] : [a, p], L = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) || 1; return [p[0] + (q1[1] - q0[1]) / L * d, p[1] - (q1[0] - q0[0]) / L * d] }
    const e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]], l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1
    const n1 = [e1[1] / l1, -e1[0] / l1], n2 = [e2[1] / l2, -e2[0] / l2], m = [n1[0] + n2[0], n1[1] + n2[1]], ml = Math.hypot(...m) || 1
    const k = d / Math.max(.25, (m[0] * n1[0] + m[1] * n1[1]) / ml)
    return [p[0] + m[0] / ml * k, p[1] + m[1] / ml * k]
  })
}
const star4 = (x, y, r) => `M${f(x)},${f(y - r)}L${f(x + r * .28)},${f(y - r * .28)}L${f(x + r)},${f(y)}L${f(x + r * .28)},${f(y + r * .28)}L${f(x)},${f(y + r)}L${f(x - r * .28)},${f(y + r * .28)}L${f(x - r)},${f(y)}L${f(x - r * .28)},${f(y - r * .28)}Z`
const scallops = (x0, x1, y, n, d = 5) => { const w = (x1 - x0) / n; let s = `M${f(x0)},${f(y)}`; for (let i = 0; i < n; i++) s += `q${f(w / 2)},${f(d)} ${f(w)},0`; return s }
// Room names: split a long name over two lines.
const nameLines = (s, size, maxW) => { if (s.length * size * .48 <= maxW) return [s]; const words = s.split(' '); if (words.length < 2) { const i = s.indexOf('-'); return i > 0 ? [s.slice(0, i + 1), s.slice(i + 1)] : [s] } let best = 1, bd = Infinity; for (let i = 1; i < words.length; i++) { const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length); if (d < bd) { bd = d; best = i } } return [words.slice(0, best).join(' '), words.slice(best).join(' ')] }
const NAMES = []
function roomName(P, q, x, y, maxW, size) {
  if (q.room || !ROOMS[q.room]) return
  const T = new Pen()
  const B = ROOMS[q.room], lines = nameLines(B.title, size, maxW), lh = size * 1.04
  lines.forEach((l, i) => T.text(x, y - (lines.length - 1) * lh / 2 + i * lh, l, size))
  if (B.hall) T.text(x, y + (lines.length - 1) * lh / 2 + size * .95, B.hall, size * .62, 'rh')
  NAMES.push(T.txt)
}

// The furniture of each kind of building, drawn in plan.
const DRAW = {
  hall(P, q) {
    const { x, y, w, h } = q, cx = x + w / 2, cy = y + h / 2
    P.boxWall(x, y, w, h, 8, { side: 's', at: .5, w: 28 })
    for (const ry of [y + h * .27, y + h * .73]) for (let c = x + 34; c < x + w - 54; c += 30) { P.a('tone', rectD(c - 4, ry - 4, 8, 8)).rect(c - 4, ry - 4, 8, 8) }
    for (const ty of [y + h * .41, y + h * .59]) for (const [a, b] of [[x + 30, cx - 62], [cx + 62, x + w - 62]]) { P.rect(a, ty - 4, b - a, 8); P.line([[a, ty - 9], [b, ty - 9]], 'hair').line([[a, ty + 9], [b, ty + 9]], 'hair') }
    P.rect(x + w - 50, y + 20, 32, h - 40); for (let k = 1; k < 4; k++) P.line([[x + w - 50 - k * 5, y + 26], [x + w - 50 - k * 5, y + h - 26]], 'hair')
    P.rect(x + w * .3 - 16, y + 8, 32, 10).a('solid', rectD(x + w * .3 - 9, y + 10, 18, 5))
    roomName(P, q, cx, cy + 2, w * .36, 22)
  },
  rotunda(P, q) {
    const { cx, cy, r } = q
    P.ringBand(cx, cy, r, 8, Math.PI * .78)
    P.circ(cx, cy, r * .74, 'hair'); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; if (Math.abs(((a - Math.PI * .78 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < .3) continue; P.line([[cx + Math.cos(a) * r * .74, cy + Math.sin(a) * r * .74], [cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8)]], 'hair') }
    const S = rng(11), stars = Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 + S() * .6, d = r * (.2 + S() * .32); return [cx + Math.cos(a) * d, cy - r * .12 + Math.sin(a) * d * .8] })
    P.a('hair', polyD([stars[0], stars[2], stars[5], stars[3], stars[1]], false) + polyD([stars[5], stars[7], stars[6]], false))
    for (const [sx, sy] of stars) P.a('solid', star4(sx, sy, 3.4 + S() * 2))
    roomName(P, q, cx, cy + r * .34, r * 1.2, 19)
  },
  cloister(P, q) {
    const { x, y, w, h } = q, cx = x + w / 2, cy = y + h / 2, g = 34
    P.boxWall(x, y, w, h, 7, { side: 'n', at: .5, w: 26 })
    P.rect(x + g, y + g, w - 2 * g, h - 2 * g, 'hair')
    for (let u = x + g; u <= x + w - g + .1; u += (w - 2 * g) / 8) for (const v of [y + g, y + h - g]) P.a('tone', rectD(u - 3, v - 3, 6, 6)).rect(u - 3, v - 3, 6, 6, 'hair')
    for (let v = y + g + (h - 2 * g) / 5; v < y + h - g - 1; v += (h - 2 * g) / 5) for (const u of [x + g, x + w - g]) P.a('tone', rectD(u - 3, v - 3, 6, 6)).rect(u - 3, v - 3, 6, 6, 'hair')
    P.line([[x + g + 6, cy - 5], [cx - 22, cy - 5]], 'hair').line([[x + g + 6, cy + 5], [cx - 22, cy + 5]], 'hair').line([[cx + 22, cy - 5], [x + w - g - 6, cy - 5]], 'hair').line([[cx + 22, cy + 5], [x + w - g - 6, cy + 5]], 'hair')
    P.circ(cx, cy, 20).circ(cx, cy, 11, 'hair').a('tone', circleD(cx, cy, 11))
    for (const [px, py] of [[x + g + 22, y + g + 20], [x + w - g - 22, y + g + 20], [x + g + 22, y + h - g - 20], [x + w - g - 22, y + h - g - 20]]) P.a('stip', circleD(px, py, 13)).circ(px, py, 13, 'hair')
    roomName(P, q, cx, cy - 44, w * .62, 21)
  },
  roundtower(P, q) {
    const { cx, cy, r } = q
    P.ringBand(cx, cy, r, 9, Math.PI * 1.15)
    P.circ(cx, cy, r * .64, 'hair'); P.circ(cx, cy - r * .2, r * .13).a('tone', circleD(cx, cy - r * .2, r * .13))
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; P.line([[cx + Math.cos(a) * r * .13, cy - r * .2 + Math.sin(a) * r * .13], [cx + Math.cos(a) * r * .42, cy - r * .2 + Math.sin(a) * r * .42]], 'hair') }
    roomName(P, q, cx, cy + r * .4, r * 1.4, 18)
  },
  arena(P, q) {
    const { cx, cy, r } = q
    P.ringBand(cx, cy, r, 9, 0, .2)
    for (let rr = r - 16; rr > r * .74; rr -= 8) P.circ(cx, cy, rr, 'hair')
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + .1; if (Math.abs(a - Math.PI * 2) < .2 || a < .2) continue; P.line([[cx + Math.cos(a) * r * .73, cy + Math.sin(a) * r * .73], [cx + Math.cos(a) * (r - 9), cy + Math.sin(a) * (r - 9)]], 'fine') }
    P.circ(cx, cy, r * .68).circ(cx, cy, r * .56)
    for (const k of [.64, .6]) P.a('dash', circleD(cx, cy, r * k))
    P.circ(cx, cy, r * .5, 'hair').line([[cx, cy - r * .5], [cx, cy + r * .5]], 'hair').circ(cx, cy, r * .1, 'hair')
    roomName(P, q, cx - r * .25, cy, r * .5, 22)
  },
  guild(P, q) {
    const { x, y, w, h } = q
    P.boxWall(x, y, w, h, 7, { side: 's', at: .5, w: 24 })
    const cols = 5, rows = 3, tw = (w - 34) / cols, thh = (h * .58) / rows
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const tx = x + 17 + i * tw + 3, ty = y + 16 + j * thh + 3, ww = tw - 6, hh = thh - 6, g = (i + j * 2) % 4
      P.rect(tx, ty, ww, hh, 'hair')
      if (g === 0) P.circ(tx + ww / 2, ty + hh / 2, Math.min(ww, hh) * .28, 'hair')
      else if (g === 1) P.line([[tx + 4, ty + hh / 2], [tx + ww - 4, ty + hh / 2]], 'hair')
      else if (g === 2) P.a('tone', rectD(tx + 4, ty + 4, ww - 8, hh - 8))
      else P.a('hair', `M${f(tx + 4)},${f(ty + hh - 4)}L${f(tx + ww / 2)},${f(ty + 4)}L${f(tx + ww - 4)},${f(ty + hh - 4)}Z`)
    }
    roomName(P, q, x + w / 2, y + h * .8, w * .8, 17)
  },
  shops(P, q) {
    const { x, y, w, h } = q, n = 4, sw = w / n
    P.boxWall(x, y, w, h, 6, null)
    for (let i = 1; i < n; i++) P.line([[x + i * sw, y + 6], [x + i * sw, y + h - 6]], 'fine')
    for (let i = 0; i < n; i++) { const sx = x + i * sw; P.rect(sx + 8, y + 12, sw - 16, 8, 'hair'); P.a('hair', `M${f(sx + sw / 2 - 8)},${f(y + h - 6)}a10,10 0 0 1 10,-10`) }
    P.a('fine', scallops(x, x + w, y + h + 2, 12, 6))
    roomName(P, q, x + w / 2, y + h * .56, w * .8, 17)
  },
  gatehouse(P, q) {
    const { x, y, w, h } = q, cy = y + h / 2, r = 21
    P.band([[x + r + 2, cy - 14], [x + w - r - 2, cy - 14]], 8).band([[x + r + 2, cy + 14], [x + w - r - 2, cy + 14]], 8)
    for (const tx of [x + r, x + w - r]) { P.a('pfill', circleD(tx, cy, r)).ringBand(tx, cy, r, 7); P.circ(tx, cy, 5, 'hair') }
    P.a('dash', hline([[x + r + 6, cy], [x + w - r - 6, cy]]))
    roomName(P, q, x + w / 2, y - 26, w * 1.6, 16)
  },
  market(P, q) {
    const { x, y, w, h } = q, cx = x + w / 2, cy = y + h / 2
    P.a('stip', rectD(x + 6, y + 6, w - 12, h - 12))
    for (const [side, at] of [['s', .5]]) P.boxWall(x, y, w, h, 5, { side, at, w: 40 })
    const n = Math.max(4, Math.round((w - 44) / 56))
    for (let i = 0; i < n; i++) for (const j of [0, 1]) { const sx = x + 22 + i * ((w - 44) / n) + 4, sy = j ? y + h - 62 : y + 24, sw = (w - 44) / n - 8; P.a('pfill', rectD(sx, sy, sw, 26)).rect(sx, sy, sw, 26); P.a('fine', scallops(sx, sx + sw, sy + 26, 4, 5)) }
    P.a('pfill', circleD(cx, cy, 15)).circ(cx, cy, 15).circ(cx, cy, 7, 'hair')
    roomName(P, q, cx, cy - 30, w * .7, 21)
  },
  bannerhall(P, q) {
    const { x, y, w, h } = q
    P.boxWall(x, y, w, h, 7, { side: 's', at: .5, w: 24 })
    for (let i = 0; i < 5; i++) { const bx = x + 22 + i * (w - 44) / 4; P.a('tone', `M${f(bx - 7)},${f(y + 8)}h14v20l-7,-6l-7,6Z`).a('fine', `M${f(bx - 7)},${f(y + 8)}h14v20l-7,-6l-7,6Z`) }
    P.rect(x + 24, y + h * .7, w - 48, 9, 'hair')
    roomName(P, q, x + w / 2, y + h * .5, w * .82, 18)
  },
  // The science tower in plan: the lab wing, the round tower, and the three flasks by the door.
  labtower(P, q) {
    const { x, y, w, h } = q, cx = x + w - 44, cy = y + h / 2
    P.boxWall(x + 8, y + 24, w - 92, h - 36, 6, { side: 's', at: .5, w: 18 })
    P.a('pfill', circleD(cx, cy, 31)).circ(cx, cy, 31).circ(cx, cy, 20, 'hair')
    for (const k of [0, 1, 2]) P.circ(x + 20 + k * 22, y + h, 7, 'hair')
    roomName(P, q, x + w / 2, y + h * .54, w * .82, 18)
  },
  kitchens(P, q) {
    const { x, y, w, h } = q
    P.boxWall(x, y, w, h, 7, { side: 'w', at: .7, w: 24 })
    for (let i = 0; i < 3; i++) { const ox = x + 34 + i * (w - 68) / 2; P.circ(ox, y + 30, 15).a('tone', circleD(ox, y + 30, 7)).circ(ox, y + 30, 7, 'hair').a('solid', rectD(ox - 5, y + 4, 10, 6)) }
    P.rect(x + 26, y + h - 42, w * .36, 14, 'hair').rect(x + w * .54, y + h - 42, w * .32, 14, 'hair')
    roomName(P, q, x + w / 2, y + h * .54, w * .82, 18)
  },
  cottage(P, q) {
    const { x, y, w, h } = q
    P.boxWall(x, y, w, h, 6, { side: 's', at: .3, w: 22 })
    P.band([[x + w * .62, y + 6], [x + w * .62, y + h * .45]], 4).band([[x + w * .62, y + h * .72], [x + w * .62, y + h - 6]], 4)
    P.rect(x + 8, y + h * .3, 10, 30).a('solid', rectD(x + 9, y + h * .3 + 6, 5, 18))
    P.rect(x + w * .7, y + 16, w * .22, 14, 'hair').circ(x + w * .81, y + 40, 5, 'hair')
    roomName(P, q, x + w * .32, y + h * .54, w * .55, 16)
  },

  lighthouse(P, q) {
    const { cx, cy, r } = q
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; P.line([[cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10)], [cx + Math.cos(a) * (r + (i % 2 ? 26 : 44)), cy + Math.sin(a) * (r + (i % 2 ? 26 : 44))]], 'hair') }
    P.a('pfill', circleD(cx, cy, r)).ringBand(cx, cy, r, 7, Math.PI / 2)
    P.circ(cx, cy, r * .52).a('tone', circleD(cx, cy, r * .3)).circ(cx, cy, r * .3, 'hair')
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.line([[cx + Math.cos(a) * r * .52, cy + Math.sin(a) * r * .52], [cx + Math.cos(a) * (r - 7), cy + Math.sin(a) * (r - 7)]], 'hair') }
  },
  post(P, q) {
    const { cx, cy, r } = q
    P.ringBand(cx, cy, r, 7, Math.PI / 2)
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 - Math.PI / 2; if (Math.abs(a - Math.PI / 2) < .3) continue; P.rect(cx + Math.cos(a) * r * .66 - 3, cy + Math.sin(a) * r * .66 - 3, 6, 6, 'hair') }
    roomName(P, q, cx, cy - 2, r * 1.3, 14)
  },
  garden(P, q) {
    const { x, y, w, h } = q
    P.a('hair', hline([[x + 6, y + 6], [x + w - 6, y + 6], [x + w - 6, y + h - 6], [x + 6, y + h - 6]], true)).a('fine', hline([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true))
    if (q.realm !== 'home') for (const [px, py] of [[x + 20, y + 54], [x + 82, y + 54]]) { P.rect(px, py, 50, 50, 'fine').line([[px, py], [px + 50, py + 50]], 'hair').line([[px + 50, py], [px, py + 50]], 'hair').circ(px + 25, py + 25, 9, 'hair') }
    const fx = x + w * .5, fy = y + h * .44, fw = w * .44, fh = h * .5
    if (q.realm !== 'home') P.rect(fx, fy, fw, fh).line([[fx + fw / 2, fy], [fx + fw / 2, fy + fh]], q.realm === 'home' ? 'none' : 'hair')
    const px = x + 70, py = y + h - 62
    P.a('pfill', `M${f(px - 46)},${f(py)}a46,24 0 1 0 92,0a46,24 0 1 0 -92,0Z`).a('fine', `M${f(px - 46)},${f(py)}a46,24 0 1 0 92,0a46,24 0 1 0 -92,0Z`)
    for (const [dx, dy, ww] of [[-26, -6, 22], [4, 4, 26], [-14, 12, 18]]) P.a('hair', `M${f(px + dx)},${f(py + dy)}q${f(ww / 4)},-3 ${f(ww / 2)},0t${f(ww / 2)},0`)
  },
  // The Field notes' buildings, in plan.
  observatory(P, q) { P.a('pfill', circleD(q.cx, q.cy, q.r)).ringBand(q.cx, q.cy, q.r * .82, 6, Math.PI / 2); P.line([[q.cx - q.r * .5, q.cy], [q.cx + q.r * .5, q.cy]], 'hair') },
  gymhall(P, q) { P.boxWall(q.x, q.y, q.w, q.h, 6, { side: 's', at: .5, w: 22 }) },
  clockhouse(P, q) { P.boxWall(q.x, q.y, q.w, q.h, 6, { side: 's', at: .3, w: 20 }); P.circ(q.x + q.w - 29, q.y + 33, 12, 'hair') },
  tent(P, q) { P.a('pfill', circleD(q.cx, q.cy, q.r)).circ(q.cx, q.cy, q.r); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; P.line([[q.cx, q.cy], [q.cx + Math.cos(a) * q.r, q.cy + Math.sin(a) * q.r]], 'hair') } },
  // A pillar, and the workshop, in plan.
  pillar(P, q) { P.a('pfill', rectD(q.cx - 23, q.cy - 23, 46, 46)).rect(q.cx - 23, q.cy - 23, 46, 46).circ(q.cx, q.cy, 14, 'fine') },
  workshop(P, q) { const { x, y, w, h } = q; P.boxWall(x + 10, y + 10, w - 20, h - 50, 6, null); P.rect(x + 24, y + h - 30, 90, 16, 'fine') },
  // The garden's pleasures, in ink: what stands up in 3D, and all there is on a flat map.
  lift(P, q) { const [x, y] = q.c; P.line([[x - 30, y], [x + 30, y]], 'main'); for (const d of [-26, -21, 21, 26]) P.line([[x + d, y - 10], [x + d, y + 10]], 'bold'); P.rect(x - 8, y + 14, 16, 26, 'fine') },
  reading(P, q) { const [x, y] = q.c; P.rect(x - 34, y - 4, 40, 9, 'fine'); for (let i = 0; i < 4; i++) { const w = 26 - i * 3; P.a('pfill', rectD(x + 22 - w / 2 + (i % 2) * 2, y - 12 + i * 7, w, 7)).rect(x + 22 - w / 2 + (i % 2) * 2, y - 12 + i * 7, w, 7) } },
  games(P, q) {
    const [x, y] = q.c, d = `M${f(x - 30)},${f(y)}q0,-14 14,-14h32q14,0 14,14l5,14q2,10 -9,10q-7,0 -11,-8h-30q-4,8 -11,8q-11,0 -9,-10Z`
    P.a('pfill', d).a('fine', d).line([[x - 20, y - 2], [x - 10, y - 2]], 'fine').line([[x - 15, y - 7], [x - 15, y + 3]], 'fine').circ(x + 14, y - 3, 2.4, 'fine').circ(x + 21, y + 2, 2.4, 'fine')
  },
  noodles(P, q) { const [x, y] = q.c; P.a('pfill', rectD(x - 32, y - 12, 64, 24)).rect(x - 32, y - 12, 64, 24).a('fine', scallops(x - 36, x + 36, y - 14, 6, 5)); for (const dx of [-18, 0, 18]) P.circ(x + dx, y + 20, 4, 'fine') },
  feast(P, q) { const [x, y] = q.c; P.a('pfill', circleD(x, y, 24)).circ(x, y, 24); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + .3; P.rect(x + Math.cos(a) * 34 - 5, y + Math.sin(a) * 34 - 5, 10, 10, 'fine') } },
  // Hinge's rehab bars and its crest, in plan.
  rehab(P, q) { const cx = q.x + q.w / 2; for (const dx of [-11, 11]) P.line([[cx + dx, q.y + 28], [cx + dx, q.y + 92]], 'fine'); for (const [dx, dy, r] of [[-30, 22, 9], [31, 44, 10], [-29, 102, 8], [32, 110, 7]]) P.circ(cx + dx, q.y + dy, r, 'hair') },
  crest(P, q) { P.a('pfill', rectD(q.cx - 30, q.cy - 10, 60, 20)).rect(q.cx - 30, q.cy - 10, 60, 20) },
  internhall(P, q) { const { x, y, w, h } = q; P.boxWall(x + 6, y + 6, w - 12, h - 12, 5, { side: 's', at: .5, w: 14 }) },
  stall(P, q) { const cx = q.x + q.w / 2, cy = q.y + q.h / 2; P.a('pfill', circleD(cx, cy, 17)).circ(cx, cy, 17); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P.line([[cx, cy], [cx + Math.cos(a) * 17, cy + Math.sin(a) * 17]], 'hair') } },
  marquee(P, q) { DRAW.stall(P, q) }, watchtower(P, q) { const cx = q.x + q.w / 2, cy = q.y + q.h / 2; P.rect(cx - 12, cy - 12, 24, 24) }, lab(P, q) { P.rect(q.x, q.y + 4, 26, 22).circ(q.x + 38, q.y + 14, 11, 'hair') }, warehouse(P, q) { DRAW.hut(P, q) },
  thomason(P, q) { const X = q.x + 4, Y = q.y + 10, BW = q.w - 8; P.boxWall(X, Y, BW, 62, 6, { side: 's', at: .5, w: 26 }); P.circ(X + BW / 2, Y + 31, 17, 'hair') },
  colonnade(P, q) { P.boxWall(q.x + 4, q.y + 8, q.w - 8, 54, 6, null); P.line([[q.x + 6, q.y + 74], [q.x + q.w - 6, q.y + 74]], 'hair') },
  hallwip(P, q) { DRAW.hall(P, q) }, rotundawip(P, q) { DRAW.rotunda(P, q) }, towerwip(P, q) { DRAW.roundtower(P, q) }, cloisterwip(P, q) { DRAW.cloister(P, q) },
  house(P, q) {
    const { x, y, w, h } = q
    P.boxWall(x, y, w, h, 5, { side: 's', at: .5, w: 14 })
    if (w > h) P.line([[x + 10, y + h / 2], [x + w - 10, y + h / 2]], 'hair'); else P.line([[x + w / 2, y + 10], [x + w / 2, y + h - 10]], 'hair')
  },
  well(P, q) { P.a('pfill', circleD(q.cx, q.cy, q.r)).circ(q.cx, q.cy, q.r).circ(q.cx, q.cy, q.r * .55, 'hair').a('tone', circleD(q.cx, q.cy, q.r * .55)) },
  hut(P, q) { const { x, y, w, h } = q; P.boxWall(x, y, w, h, 4, { side: 's', at: .5, w: 10 }); P.line([[x + 4, y + 4], [x + w - 4, y + h - 4]], 'hair').line([[x + w - 4, y + 4], [x + 4, y + h - 4]], 'hair') },
}


// =====================================================================================
// The sheet, drawn world by world. Each world is its own SVG, so scrolling only ever
// rasterises the part of the road coming into view.
// =====================================================================================
const TREES = []          // [x, y, r] of every tree, for the standing cities too
const CARDS = []          // the engravings and trees that stand up off the paper as you near them
const RESERVED = []       // areas kept clear of trees
const BANDS = [0, ...WORLDS.map(w => w.y1).reverse(), H]
const bandAt = y => { for (let i = 1; i < BANDS.length; i++) if (y < BANDS[i]) return i - 1; return BANDS.length - 2 }
const LAYERS = ['sea', 'land', 'wet', 'trees', 'realm', 'deco', 'text']
class Sheet {
  constructor() { this.b = BANDS.slice(1).map(() => Object.fromEntries(LAYERS.map(l => [l, { pen: new Pen(), raw: '' }]))) }
  pen(layer, y) { return this.b[bandAt(y)][layer].pen }
  raw(layer, y, str) { this.b[bandAt(y)][layer].raw += str }
  // A long line, cut into a run per band (each run overlapping the next by a point).
  runs(pts, fn) {
    let run = [pts[0]], b = bandAt(pts[0][1])
    for (let i = 1; i < pts.length; i++) {
      run.push(pts[i])
      const nb = bandAt(pts[i][1])
      if (nb !== b) { fn(run, BANDS[b] + 1); run = [pts[i - 1], pts[i]]; b = nb }
    }
    if (run.length > 1) fn(run, BANDS[b] + 1)
  }
  html() { return this.b.map(L => LAYERS.map(l => `<g class="ly-${l}">${L[l].pen.svg()}${L[l].raw}</g>`).join('')) }
}
function drawSheet() {
  R = rng(42)
  const S = new Sheet()
  const coastS = sample(COAST, 6), shoreS = SHORES.map(p => sample(p, 6, true)), toShore = (x, y) => Math.min(...shoreS.map(s => distTo(s, x, y)))
  const riverS = RIVERS.map(rv => sample(rv.pts, 6))
  const nearRiver = (x, y, d) => riverS.some(r => distTo(r, x, y) < d)
  const reserve = (x0, y0, x1, y1) => RESERVED.push({ x0, y0, x1, y1 })
  for (const R0 of REALMS) reserve(R0.box.x0 + 10, R0.box.y0 + 30, R0.box.x1 - 10, R0.box.y1 - 20)
  const T = GEO.trail, TK = GEO.track
  reserve(T.cx - T.rx - 30, T.cy - T.ry - 30, T.cx + T.rx + 30, T.cy + T.ry + 30); reserve(TK.cx - TK.rx - 30, TK.cy - TK.ry - 30, TK.cx + TK.rx + 30, TK.cy + TK.ry + 30)
  reserve(560, 7880, 1340, 8420)
  const gj = realmBy.gojek; reserve(gj.ox, gj.oy - 200, gj.ox + gj.w + 40, gj.oy)
  const clear = (x, y, m = 0) => onLand(x, y) && distTo(coastS, x, y) > 40 + m && toShore(x, y) > 26 + m && !nearRiver(x, y, 36 + m)
    && distTo(roadS, x, y) > 34 + m && distTo(isleS2, x, y) > 26 + m && !RESERVED.some(b => x > b.x0 - m && x < b.x1 + m && y > b.y0 - m && y < b.y1 + m)
    && !LEVELS.some(L => Math.hypot(L.x - x, L.y - y) < 60 + m)

  // ---- The sea: water-lining along every coast, waves, rhumb lines from the roses.
  const seaSide = onLand(coastS[40][0] + 30, coastS[40][1]) ? -1 : 1
  for (const [d, op, cls] of [[10, .8, 'fine'], [20, .6, 'fine'], [32, .42, 'hair'], [46, .3, 'hair'], [64, .2, 'hair'], [86, .12, 'hair']]) {
    const o = offset(coastS, d * seaSide).filter((_, i) => i % 3 === 0)
    S.runs(o, (run, y) => S.raw('sea', y, `<path class="${cls}" d="${smooth(run)}" style="opacity:${op}"/>`))
    for (const so of shoreS) { const oi = offset([...so, so[0]], -d).filter((_, i) => i % 3 === 0); S.raw('sea', so[0][1], `<path class="${cls}" d="${smooth(oi, true)}" style="opacity:${op}"/>`) }
  }
  for (let i = 0; i < 1700; i++) {
    const x = -900 + R() * (W + 1800), y = -1700 + R() * 6400, w = 10 + R() * 7
    if (onLand(x, y) || distTo(coastS, x, y) < 110 || toShore(x, y) < 110 || distTo(laneS, x, y) < 40 || STOPS.some(Q => Math.hypot(x - Q.x, y - Q.y) < Q.r + 90)) continue
    S.pen('sea', y).a('hair', `M${f(x)},${f(y)}q${f(w / 2)},-5 ${f(w)},0t${f(w)},0`)
  }
  for (const [k, rose] of GEO.roses.entries()) for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a), cls = i % 4 === 0 ? 'rh-k' : i % 2 === 0 ? 'rh-r' : 'rh-g'
    let run = null
    for (let t = rose.r * .9; ; t += 30) {
      const x = rose.x + dx * t, y = rose.y + dy * t, out = x < -900 || y > 4460 || x > W + 900 || y < -1700, sea = !out && !onLand(x, y) && toShore(x, y) > 50 && !STOPS.some(Q => Math.hypot(x - Q.x, y - Q.y) < Q.r + 40)
      if (sea && !run) run = [x, y]
      if ((!sea || out) && run) { S.raw('sea', (run[1] + y) / 2, `<path class="${cls}" d="M${f(run[0])},${f(run[1])}L${f(x - dx * 15)},${f(y - dy * 15)}"/>`); run = null }
      if (out) break
    }
    void k
  }
  // The shore itself, bold, and the beach of the isle.
  S.runs(coastS.filter((_, i) => i % 2 === 0), (run, y) => S.pen('sea', y).a('bold', smooth(run)))
  S.pen('sea', 1000).a('bold', smooth(ISLE, true))
  S.pen('sea', 1600).a('bold', smooth(WORKISLE, true))
  for (const p of ISLANDS) S.pen('sea', p[0][1]).a('bold', smooth(p, true))
  // The isles of earlier work, each ringed by its own shallows.
  for (const Q of STOPS) {
    R = rng(Q.x * 7 + Q.y)
    const pts = ring(Q.x, Q.y, Q.r, 14, Q.r * .14), sm = sample([...pts], 6, true)
    let isl = `<path class="land-fill" d="${smooth(pts, true)}"/><path class="main" d="${smooth(pts, true)}"/>`
    for (const [d, op] of [[8, .6], [16, .4], [26, .24], [38, .12]]) isl += `<path class="fine" d="${smooth(offset([...sm, sm[0]], d).filter((_, i) => i % 3 === 0), true)}" style="opacity:${op}"/>`
    const P = new Pen(); DRAW.hut(P, ROOMS[Q.id].part)
    for (let k = 0; k < 4; k++) { const a = k * 1.7 + .5; treeGlyph(P, Q.x + Math.cos(a) * Q.r * .6, Q.y + 12 + Math.sin(a) * Q.r * .42, 8) }
    isl += roomG(Q.id, `M${f(Q.x - Q.r)},${f(Q.y)}a${Q.r},${Q.r} 0 1 0 ${Q.r * 2},0a${Q.r},${Q.r} 0 1 0 ${-Q.r * 2},0Z`, P.svg(), 70, 'early')
    S.raw('sea', Q.y, isl)
  }
  R = rng(43)

  // ---- The land: woods, mountains, hills and villages, in engravings after Vischer (1697).
  const art = []
  const put = (name, x, y, w, ar, kind) => { art.push([y, `<image class="eng up" href="assets/v/${name}.webp" x="${f(x - w / 2)}" y="${f(y - w * ar)}" width="${f(w)}" height="${f(w * ar)}"/>`]); CARDS.push({ name, x, y, w, h: w * ar, kind }) }
  const FOREST = [['forest1', .603], ['forest2', .413], ['forest3', .479], ['forest5', .347], ['forest8', .511], ['forest12', .358], ['forest13', .45], ['forest14', .455]]
  for (const [fx, fy, rx, ry] of GEO.forests) {
    const cw = rx * ry > 20000 ? 210 : 170, rowH = cw * .3
    for (let yy = fy - ry; yy <= fy + ry; yy += rowH) for (let xx = fx - rx + ((yy - fy) / rowH % 2 ? cw * .3 : 0); xx <= fx + rx; xx += cw * .62) {
      const x = xx + J(cw * .14), y = yy + J(rowH * .3), e = ((x - fx) / rx) ** 2 + ((y - fy) / ry) ** 2
      if (e > 1 || !clear(x, y, 4) || !clear(x - cw * .4, y, -6) || !clear(x + cw * .4, y, -6)) continue
      const [name, ar] = FOREST[Math.floor(R() * FOREST.length)], w = cw * (.85 + R() * .3) * (1 - e * .25)
      put(name, x, y + 10, w, ar, 'forest')
      for (let k = 0; k < 3; k++) TREES.push([x + J(w * .35), y + J(rowH * .3), 10 + R() * 4])
    }
  }
  const land = y => S.pen('land', y)
  for (let i = 0; i < 580; i++) { const isl = i >= 420, x = isl ? 560 + R() * 900 : -500 + R() * (W + 1000), y = isl ? 2280 + R() * 2060 : 4560 + R() * 3900, r = 7 + R() * 3; if (!clear(x, y, 16) || TREES.some(t => Math.hypot(t[0] - x, t[1] - y) < 120)) continue; TREES.push([x, y, r, 1]) }
  for (const t of TREES.slice().sort((a, b) => a[1] - b[1])) if (t[3]) { treeGlyph(S.pen('trees', t[1]), t[0], t[1], t[2]); treeCard(t[0], t[1], t[2], t) }
  // The Mountains of Feedback, with a pass where the road goes through.
  const M = GEO.mountains, MTN = [['mountain2', .747], ['mountain3', .467], ['mountain4', .663], ['mountain5', .633], ['mountain6', .573], ['mountain8', .497], ['mountain9', .453], ['mountain10', .627]]
  for (let r2 = 0; r2 < 3; r2++) for (let i = -4; i < 15; i++) {
    const x = 190 + i * 152 + (r2 % 2) * 76 + J(22), y = M.y0 + 90 + r2 * 85 + J(12)
    if (distTo(roadS, x, y) < 150 || !onLand(x, y) || distTo(coastS, x, y) < 70) continue
    const [name, ar] = MTN[Math.floor(R() * MTN.length)]
    put(name, x, y, (200 + R() * 90) * (1 - r2 * .1), ar, 'mountain')
  }
  const HILL = [['hill3', .514], ['hill4', .345], ['hill7', .355], ['hill8', .3], ['hill10', .295], ['hill13', .264], ['hill14', .414], ['hill17', .214], ['hill18', .405]]
  for (const [x, y, sz] of GEO.hills) { const [name, ar] = HILL[Math.floor(R() * HILL.length)]; put(name, x, y, 190 * sz, ar, 'hill') }
  for (const [y, img] of art.sort((p, q) => p[0] - q[0])) S.raw('land', y, img)
  for (const [hx, hy, n] of GEO.hamlets) {
    const r2 = rng(hx + hy), P = land(hy)
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + r2(), d = 30 + r2() * 34, x = hx + Math.cos(a) * d, y = hy + Math.sin(a) * d * .7, w = 18 + r2() * 9, h = 12 + r2() * 5; if (!onLand(x, y)) continue; P.a('block', rectD(x, y, w, h)).rect(x, y, w, h).line([[x + 2, y + h / 2], [x + w - 2, y + h / 2]], 'hair') }
    P.a('block', rectD(hx - 8, hy - 16, 16, 30)).rect(hx - 8, hy - 16, 16, 30).circ(hx, hy - 23, 7).line([[hx, hy - 34], [hx, hy - 44]], 'fine')
  }

  // ---- Water and the road.
  for (const [k, rs] of riverS.entries()) {
    const wetRun = rs.filter(([x, y]) => onLand(x, y))
    const P = S.pen('wet', rs[0][1])
    P.line(offset(wetRun, 18), 'main').line(offset(wetRun, -18), 'main')
    for (let i = 4; i < wetRun.length - 3; i += 6) { const [x, y] = wetRun[i]; P.a('hair', `M${f(x - 10)},${f(y + (i % 12 ? 4 : -4))}q4.5,-3 9,0t9,0`) }
    void k
  }
  // Planks laid across a way, centred on (x, y) and running along (tx, ty): half as long and wide as given.
  const planks = (P, x, y, tx, ty, hl, hw) => {
    const pt = (u, v) => [x + tx * u - ty * v, y + ty * u + tx * v], q = [pt(-hl, -hw), pt(hl, -hw), pt(hl, hw), pt(-hl, hw)]
    P.a('pfill', polyD(q)).line(q, 'fine', true)
    for (let u = -hl + 8; u < hl - 3; u += 8) P.line([pt(u, -hw), pt(u, hw)], 'hair')
  }
  // The road: a paved way with an avenue of trees, bold parapets on its bridges.
  const roadOnWater = (x, y) => nearRiver(x, y, 26)
  S.runs(roadS, (run, y) => {
    const P = S.pen('wet', y), e1 = offset(run, 12), e2 = offset(run, -12)
    P.a('road', polyD([...e1, ...[...e2].reverse()]))
    for (const e of [e1, e2]) {
      P.line(e.filter((_, i) => i % 2 === 0 || i === e.length - 1), 'fine')
      let wr = []
      e.forEach((p, i) => { if (roadOnWater(...run[i])) wr.push(p); else if (wr.length) { if (wr.length > 1) P.line(wr, 'bold'); wr = [] } })
      if (wr.length > 1) P.line(wr, 'bold')
    }
  })
  for (const side of [-1, 1]) {
    const line = offset(roadS, 32 * side)
    let acc = 0
    for (let i = 1; i < line.length; i++) {
      acc += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]); if (acc < 40) continue; acc = 0
      const [x, y] = line[i]
      if (!onLand(x, y) || nearRiver(x, y, 50) || REALMS.some(R0 => { const b = R0.box; return x > b.x0 + 40 && x < b.x1 - 40 && y > b.y0 + 80 && y < b.y1 - 40 }) || LEVELS.some(L => Math.hypot(L.x - x, L.y - y) < 56) || y > ROAD[0][1] - 60) continue
      treeGlyph(S.pen('trees', y), x, y, 8); treeCard(x, y, 8)
    }
  }
  // The way across the water: dotted at sea, a path where it comes ashore. Then the path
  // across the Isle of Kunal.
  let wet = [], dry = []
  const flush = () => {
    if (wet.length > 1) S.runs(wet, (run, y) => S.pen('wet', y).a('lane', smooth(run.filter((_, i) => i % 3 === 0 || i === run.length - 1))))
    if (dry.length > 1) { const P = S.pen('wet', dry[0][1]), e1 = offset(dry, 8), e2 = offset(dry, -8); P.a('road', polyD([...e1, ...[...e2].reverse()])).line(e1, 'fine').line(e2, 'fine') }
    wet = []; dry = []
  }
  const landings = []
  laneS.forEach(p => { const land = onLand(...p); if (land ? wet.length : dry.length) { (land ? wet : dry).push(p); flush(); landings.push(p) } (land ? dry : wet).push(p) })
  flush()
  // The path over the two isles: road on land, and a plank bridge over the strait between them.
  {
    const runs = [[]], gaps = []
    let wet = null
    for (const p of isleS2) {
      if (onLand(...p)) { if (wet) { gaps.push(wet); wet = null; runs.push([]) } runs.at(-1).push(p) }
      else (wet ||= []).push(p)
    }
    for (const run of runs) if (run.length > 1) { const P = S.pen('wet', run[0][1]), e1 = offset(run, 8), e2 = offset(run, -8); P.a('road', polyD([...e1, ...[...e2].reverse()])).line(e1, 'fine').line(e2, 'fine') }
    for (const g of gaps) {
      const a = g[0], b = g.at(-1), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      planks(S.pen('wet', Math.max(a[1], b[1]) + 16), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (b[0] - a[0]) / L, (b[1] - a[1]) / L, L / 2 + 14, 11)
    }
  }
  // A jetty wherever the way comes ashore or puts to sea: turned to run along the way, and reaching
  // out over the water from the shore rather than lying across the land.
  for (const [x, y] of [[940, 4515], ...landings.filter(([x, y]) => Math.hypot(x - 940, y - 4515) > 60)]) {
    let i = 0, best = Infinity
    laneS.forEach((q, k) => { const d = Math.hypot(q[0] - x, q[1] - y); if (d < best) { best = d; i = k } })
    const a = laneS[Math.max(0, i - 3)], b = laneS[Math.min(laneS.length - 1, i + 3)], L = Math.hypot(b[0] - a[0], b[1] - a[1])
    const [tx, ty] = best < 20 && L > 1 ? [(b[0] - a[0]) / L, (b[1] - a[1]) / L] : [0, 1], sea = onLand(x + tx * 18, y + ty * 18) ? -1 : 1
    planks(S.pen('wet', y), x + tx * sea * 10, y + ty * sea * 10, tx, ty, 20, 10)
  }

  // ---- Little scenes that say who lived where.
  drawScenes(S)

  // ---- The realms. Buildings hand-coloured in their realm's colour.
  for (const R0 of REALMS) {
    R = rng(R0.ox + R0.oy)
    const PL = PLANS[R0.key], ox = R0.ox, oy = R0.oy, walls = new Pen(), towers = new Pen()
    for (const wl of PL.walls) walls.band(wl.map(([x, y]) => [x + ox, y + oy]), PL.th)
    if (PL.palisade) for (const wl of PL.walls) for (const s2 of [sample(wl.map(([x, y]) => [x + ox, y + oy]), 9)]) s2.forEach(([x, y], i) => i % 2 || walls.circ(x, y, 1.6, 'hair'))
    for (const [x, y, r] of PL.towers) {
      const X = x + ox, Y = y + oy
      if (PL.square) { towers.a('pfill', rectD(X - r, Y - r, 2 * r, 2 * r)).boxWall(X - r, Y - r, 2 * r, 2 * r, 7, null); towers.rect(X - r * .35, Y - r * .35, r * .7, r * .7, 'hair') }
      else { towers.a('pfill', circleD(X, Y, r)).ringBand(X, Y, r, Math.min(8, r * .3)); towers.circ(X, Y, r * .28) }
    }
    let rooms = '', blocks = ''
    for (const q of PARTS.filter(p => p.realm === R0.key)) {
      const shape = 'x' in q ? rectD(q.x, q.y, q.w, q.h) : circleD(q.cx, q.cy, q.r)
      if (!['home', 'writing'].includes(R0.key) && !['garden', 'market', 'cloister', 'arena'].includes(q.t)) blocks += shape
      const P = new Pen(); DRAW[q.t](P, q)
      if (q.room) rooms += roomG(q.room, shape, P.svg(), R0.hue, R0.group)
      else rooms += `<g class="part">${P.svg()}</g>`
    }
    S.raw('realm', oy + 1, `<g class="realm" data-key="${R0.key}" style="--rc:${ok(R0.key === 'home' ? 74 : 66, R0.key === 'home' ? .06 : .1, R0.hue)}"><path class="town" d="${blocks}"/>${walls.svg()}${rooms}${towers.svg()}</g>`)
  }

  // ---- The title at the foot of the road, where the journey sets out.
  S.raw('text', 8000, `<text class="hub-name${BATCH.bareTitle ? ' bare' : ''}" x="950" y="8160" font-size="300" text-anchor="middle">Kunal Satpal</text>`
    + `<text class="hub-sub${BATCH.bareTitle ? ' bare' : ''}" x="950" y="8270" font-size="64">${BATCH.tagline ? 'Crafting with strategy &amp; technical fluency' : 'A design leader who loves craft &amp; code'}</text>`
    + `<text class="cart-small i" x="950" y="8336" font-size="28">Staff Product Designer, Hinge Health · Designing since 2017</text>`
    + `<path class="fine" d="M720,8382H930M970,8382H1180"/><path class="solid" d="${star4(950, 8382, 10)}"/>`)
  // ---- Names of the country.
  for (const [t, cx, cy, size, sub] of GEO.regions) S.raw('text', cy, `<text class="region" x="${cx}" y="${cy}" font-size="${size}" text-anchor="middle">${t}</text>` + (sub ? `<text class="region-sub" x="${cx}" y="${cy + size * .9}" font-size="${size * .5}">${sub}</text>` : ''))
  for (const [fx, fy, , ry, , name] of GEO.forests) if (name) S.raw('text', fy, `<text class="area feat" x="${fx}" y="${fy + ry + 50}" font-size="30">${name}</text>`)
  drawDeco(S)
  return S.html()
}

// A room on the map: a wash that shows on hover, the drawing, and a hit area. Pieces of
// work carry a faint gilding, so they read apart from the houses around them.
const roomG = (id, shape, inner, hue, group) => `<g class="room ${group === 'about' ? 'about' : group === 'early' && id.startsWith('stop-') ? 'stop' : 'work'}" id="room-${id}" data-id="${id}" tabindex="-1" style="--c:${ok(62, .12, hue)}"><path class="gild" d="${shape}"/><path class="wash" d="${shape}"/>${inner}<path class="hit" d="${shape}"/></g>`

// A tree that will stand up: its card is a little taller than the plan drawn on the sheet.
const treeCard = (x, y, r, tree) => CARDS.push({ name: 'tree' + Math.floor(R() * 4), x, y: y + r * 1.45, w: r * 2.8, h: r * 3.7, kind: 'tree', tree })
// A map tree: a scalloped crown, shaded on its lower right, over a short trunk.
function treeGlyph(P, x, y, r) {
  const n = 7 + Math.floor(R() * 3), rot = R() * 6
  let d = ''
  for (let i = 0; i <= n; i++) {
    const a = rot + i / n * Math.PI * 2, p = [x + Math.cos(a) * r, y + Math.sin(a) * r * .9]
    if (!i) { d += `M${f(p[0])},${f(p[1])}`; continue }
    const am = rot + (i - .5) / n * Math.PI * 2, c = [x + Math.cos(am) * r * 1.3, y + Math.sin(am) * r * 1.18]
    d += `Q${f(c[0])},${f(c[1])} ${f(p[0])},${f(p[1])}`
  }
  P.a('crown', d + 'Z').a('fine', d + 'Z').a('fine', `M${f(x)},${f(y + r * .95)}v${f(r * .5)}`)
  for (let k = 0; k < 3; k++) { const a = .25 + k * .42, rr = r * .62; P.a('hair', `M${f(x + Math.cos(a) * rr * .3)},${f(y + Math.sin(a) * rr * .3 + r * .18)}l${f(Math.cos(a) * rr * .55)},${f(Math.sin(a) * rr * .55)}`) }
}

// The vignettes, placed by their realms: the heartbeat hedge and exercise trail by Hinge,
// Gojek's night market, the running track by Cult.fit.
function drawScenes(S) {
  const hg = realmBy.hinge, gj = realmBy.gojek, P = S.pen('land', hg.oy - 34)
  const ey = hg.oy - 34, ecg = [[hg.ox + 40, ey]]
  for (let x = hg.ox + 40; x < hg.ox + 330; x += 60) ecg.push([x + 14, ey], [x + 20, ey - 12], [x + 26, ey + 14], [x + 32, ey - 22], [x + 38, ey + 6], [x + 44, ey], [x + 60, ey])
  P.line(ecg, 'main'); for (let i = 0; i < ecg.length; i += 2) P.circ(ecg[i][0], ecg[i][1] + 6, 2.2, 'hair')
  const T = GEO.trail, trail = ring(T.cx, T.cy, 1, 8, 0, .4).map(([x, y]) => [T.cx + (x - T.cx) * T.rx, T.cy + (y - T.cy) * T.ry])
  P.a('dot', smooth(trail, true))
  P.a('pfill', `M${f(T.cx - 44)},${f(T.cy)}a44,22 0 1 0 88,0a44,22 0 1 0 -88,0Z`).a('fine', `M${f(T.cx - 44)},${f(T.cy)}a44,22 0 1 0 88,0a44,22 0 1 0 -88,0Z`)
  P.a('hair', `M${f(T.cx - 26)},${f(T.cy)}a26,13 0 1 0 52,0a26,13 0 1 0 -52,0Z`)
  const Q = S.pen('land', gj.oy - 100)
  for (let i = 0; i < 9; i++) for (const j of [0, 1]) { const x = gj.ox + 20 + i * 56 + j * 28, y = gj.oy - 62 - j * 56; Q.a('pfill', rectD(x, y, 26, 16)).rect(x, y, 26, 16).a('fine', scallops(x, x + 26, y + 16, 3, 4)) }
  for (const [dx0, dx1, dy] of [[10, gj.w - 10, 36], [30, gj.w, 92]]) {
    const x0 = gj.ox + dx0, x1 = gj.ox + dx1, y = gj.oy - dy - 14, n = 8; let d = `M${x0},${y}`
    for (let i = 0; i < n; i++) { const a = x0 + (x1 - x0) * i / n, b = x0 + (x1 - x0) * (i + 1) / n; d += `Q${f((a + b) / 2)},${y + 14} ${f(b)},${y}`; Q.a('tone', circleD((a + b) / 2, y + 7.5, 3.6)).circ((a + b) / 2, y + 7.5, 3.6, 'hair') }
    Q.a('hair', d)
  }
  const TK = GEO.track, K = S.pen('land', TK.cy)
  for (const [rx, ry, cls] of [[TK.rx, TK.ry, 'fine'], [TK.rx - 12, TK.ry - 11, 'hair'], [TK.rx - 24, TK.ry - 22, 'fine']]) K.a(cls, `M${TK.cx - rx},${TK.cy}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`)
  K.line([[TK.cx - 30, TK.cy - 42], [TK.cx - 30, TK.cy + 42]], 'hair')
}

function drawDeco(S) {
  // No neatline: the country runs on past the sheet, so there is no edge to draw.
  for (const o of GEO.roses) S.raw('deco', o.y, `<image href="assets/compass.webp" x="${o.x - o.r}" y="${o.y - o.r}" width="${o.r * 2}" height="${o.r * 2}"/>`)
  for (const [x, y, w, flip] of GEO.whales) S.raw('deco', y, `<image href="assets/whale.webp" x="${flip ? -x - w : x}" y="${y}" width="${w}" height="${f(w * .62)}" opacity=".9"${flip ? ' transform="scale(-1 1)"' : ''}/>`)
}
// One footprint, pointing along `ang` degrees.
function footD(x, y, ang, s = 1) {
  const a = ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), T = (u, v) => `${f(x + (u * c - v * sn) * s)},${f(y + (u * sn + v * c) * s)}`
  return `M${T(4.4, 0)}C${T(4.4, -3.4)} ${T(1, -4.4)} ${T(-2, -4)}C${T(-5, -3.6)} ${T(-5, 3.6)} ${T(-2, 4)}C${T(1, 4.4)} ${T(4.4, 3.4)} ${T(4.4, 0)}Z`
    + `M${T(-6.6, 0)}C${T(-6.6, -2.6)} ${T(-8.2, -3)} ${T(-10, -2.6)}C${T(-11.6, -2.2)} ${T(-11.6, 2.2)} ${T(-10, 2.6)}C${T(-8.2, 3)} ${T(-6.6, 2.6)} ${T(-6.6, 0)}Z`
}
