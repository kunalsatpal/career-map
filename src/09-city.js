// =====================================================================================
// The standing city. Lean in and every realm builds itself out of its plan: stones rise
// off the ink in a slow swirl and lock into courses, roofs settle from above, trees grow.
// It is drawn by the GPU as ink and watercolour: outlines found from depth and normals,
// hatching on the shadowed side, shadows hatched onto the paper.
// =====================================================================================
const city = { ready: false, failed: false, cardsDone: false, built: false, rise: 0, sel: 0, hover: 0, lift: 0, active: false, gather: 0, gRoom: 0, grid: [10, 10], sheet: [-.5, -.8, .5, .8] }
const REALM_IDX = { hinge: 0, gojek: 1, cult: 2, iit: 3, intern: 4, home: 5, earlier: 6, writing: 7, ...BATCH.workBuild && { work: 8 } }
const REALM_KEYS = Object.keys(REALM_IDX)
// How I work stands on the south of the Isle of Kunal. With BATCH.workBuild it builds as a city of its
// own, when you reach it, and About me builds later, when you reach that.
const WORK_Y = WORLDS.find(w => w.key === 'work').y0
const buildBox = key => key === 'work' ? { ...boxOf('home'), y0: WORK_Y } : key === 'home' && BATCH.workBuild ? { ...boxOf('home'), y1: WORK_Y } : boxOf(key)
const partRealm = q => BATCH.workBuild && q.realm === 'home' && q.c[1] > WORK_Y ? 'work' : q.realm
const INK = oklchRGB(.27, .04, 42), MIST = oklchRGB(.95, .022, 84)
const PAT = { none: 0, stone: 1, brick: 2, plaster: 3, timber: 4, tile: 5, slate: 6, thatch: 7, glass: 8, tiers: 9, grass: 10, stripe: 11, leaf: 12 }
const OVL = { windows: 1, arcade: 2, door: 3, clock: 4, portcullis: 5, pigeon: 6, lit: 7 }
const CRENEL = 1, PALISADE = 2, ROUND = 4
const col3 = (L, C, h) => oklchRGB(L / 100, C, h)

// ---------- Geometry: faces, collected from the plans ----------
const FACES = [], ROOM_IDS = [null], ROOM_TOP = {}, ROOM_PTS = {}
// The few small things that answer the pointer (16-delight): each one's faces share its id, and it
// turns about its pivot (x, y, z). h and r are its height and reach, for finding it under the pointer.
const DECOR = [null]
function decorF(kind, x, y, z, h, r, fn, more) { const prev = BX.decor; BX.decor = DECOR.push({ kind, x, y, z, h, r, realm: BX.realm, room: ROOM_IDS[BX.room] || null, ...more }) - 1; fn(); BX.decor = prev }
let BX = { realm: 0, room: 0, ctr: [0, 0], kind: null }, GID = 1, groupId = null
// One face: a plane standing on edge a→b at height z0, stepping `run` inward while rising
// `rise`; its top edge is `topL` long (centred). Its outward normal follows from the winding.
function face(a, b, z0, run, rise, topL, m) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), S = Math.hypot(run, rise)
  if (L < .5 || S < .5) return
  FACES.push({ a, dx: dx / L, dy: dy / L, z0, run, rise, L, S, topL: topL == null ? L : Math.max(0, topL), m, realm: BX.realm, room: BX.room, ctr: BX.ctr, kind: BX.kind ?? (run === 0 ? 0 : 1), gid: groupId ?? GID++, decor: BX.decor || 0 })
  // A room's height and outline are kept under its name, which is how labels, notes and picking ask for them.
  const rid = ROOM_IDS[BX.room]
  if (rid) { const top = z0 + rise; ROOM_TOP[rid] = Math.max(ROOM_TOP[rid] || 0, top); (ROOM_PTS[rid] ||= []).push([a[0], a[1], z0], [b[0], b[1], z0], [a[0], a[1], top], [b[0], b[1], top]) }
}
const rectPts = (x, y, w, d) => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]]
const wallsF = (pts, z0, h, m) => pts.forEach((a, i) => face(a, pts[(i + 1) % pts.length], z0, 0, h, null, m))
const flatF = (x, y, w, d, z, m) => face([x + w, y + d], [x, y + d], z, d, 0, null, m)
const boxF = (x, y, w, d, z0, h, m, top) => { wallsF(rectPts(x, y, w, d), z0, h, m); if (top) flatF(x, y, w, d, z0 + h, top) }
function gableF(x, y, w, d, z0, rise, roof, wall, axis = w >= d ? 'x' : 'y', ov = 4) {
  if (axis === 'x') {
    face([x - ov, y - ov], [x + w + ov, y - ov], z0, d / 2 + ov, rise, null, roof); face([x + w + ov, y + d + ov], [x - ov, y + d + ov], z0, d / 2 + ov, rise, null, roof)
    face([x, y + d], [x, y], z0, 0, rise, 0, wall); face([x + w, y], [x + w, y + d], z0, 0, rise, 0, wall)
  } else {
    face([x + w + ov, y - ov], [x + w + ov, y + d + ov], z0, w / 2 + ov, rise, null, roof); face([x - ov, y + d + ov], [x - ov, y - ov], z0, w / 2 + ov, rise, null, roof)
    face([x, y], [x + w, y], z0, 0, rise, 0, wall); face([x + w, y + d], [x, y + d], z0, 0, rise, 0, wall)
  }
}
// A body of revolution from a profile of [radius, height] pairs: drums, cones, domes. Where mm gives
// a segment no material, that segment is left out: a wall or a dome still being built.
function latheF(cx, cy, prof, N, m, rot = 0, mm) {
  const v = (r, j) => { const a = rot + j / N * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] }
  const k = Math.cos(Math.PI / N), e = 2 * Math.sin(Math.PI / N)
  for (let i = 0; i < prof.length - 1; i++) {
    const [r1, z1] = prof[i], [r2, z2] = prof[i + 1]
    if (r1 <= 0) continue
    groupId = GID++
    for (let j = 0; j < N; j++) { const mj = mm ? mm(i, j) : m; if (mj) face(v(r1, j), v(r1, j + 1), z1, (r1 - r2) * k, z2 - z1, r2 * e, mj) }
    groupId = null
  }
}
const mat = (c, p = 'none', o = 0, fl = 0) => ({ c, p: PAT[p], o, fl })

// Each realm's architecture, in watercolour.
const STY = {
  hinge: { wall: col3(95, .014, 160), wallP: 'stone', roof: col3(70, .085, 168), roofP: 'slate', crenel: true, wallH: 50, flag: col3(60, .12, 165), tower: r => ({ h: r * 2.3 + 30, roof: r > 26 ? 'dome' : 'spire' }) },
  gojek: { wall: col3(93, .035, 82), wallP: 'plaster', roof: col3(62, .12, 146), roofP: 'tile', crenel: false, wallH: 34, flag: col3(58, .15, 146), square: true, tower: r => ({ h: r * 1.6 + 22, roof: 'tiered' }) },
  cult: { wall: col3(86, .05, 22), wallP: 'brick', roof: col3(60, .13, 16), roofP: 'tile', crenel: true, wallH: 44, flag: col3(56, .17, 12), tower: r => ({ h: r * 2 + 24, roof: 'cone' }) },
  iit: { wall: col3(88, .05, 72), wallP: 'stone', roof: col3(57, .075, 262), roofP: 'slate', crenel: false, wallH: 40, flag: col3(52, .12, 265), tower: r => ({ h: r * 2.1 + 26, roof: 'dome' }) },
  pibit: { wall: col3(74, .06, 62), wallP: 'timber', roof: col3(72, .14, 58), roofP: 'thatch', crenel: false, wallH: 24, flag: col3(66, .15, 58), tower: r => ({ h: r * 2.4 + 16, roof: 'pyramid' }), palisade: true },
  intern: { wall: col3(86, .05, 22), wallP: 'brick', roof: col3(60, .13, 16), roofP: 'tile', crenel: false, wallH: 24, flag: col3(56, .17, 12), tower: r => ({ h: r * 2 + 20, roof: 'cone' }) },
  writing: { wall: col3(93, .02, 84), wallP: 'stone', roof: col3(52, .1, 320), roofP: 'slate', crenel: false, wallH: 0, flag: col3(50, .13, 320), tower: r => ({ h: r * 2 + 14, roof: 'cone' }) },
  home: { wall: col3(91, .02, 80), wallP: 'stone', roof: col3(50, .045, 240), roofP: 'slate', crenel: false, wallH: 18, flag: col3(48, .07, 240), tower: r => ({ h: r * 2 + 14, roof: 'cone' }) },
  earlier: { wall: col3(88, .03, 80), wallP: 'timber', roof: col3(70, .08, 78), roofP: 'thatch', wallH: 0, flag: col3(60, .1, 70), tower: () => ({ h: 0, roof: 'cone' }) },
}
const wallM = (st, o = 0, fl = 0) => mat(st.wall, st.wallP, o, fl)
const roofM = st => mat(st.roof, st.roofP)
const DARK = mat(col3(34, .03, 50))
const GREEN = col3(74, .09, 140), GREEN2 = col3(66, .1, 145), TRUNK = col3(48, .05, 55), WATER = col3(80, .05, 215), CREAM = col3(95, .02, 85)

function towerF(cx, cy, r, st, flag = true) {
  const { h, roof } = st.tower(r), sq = st.square, N = sq ? 4 : r < 20 ? 8 : 12, rot = sq ? Math.PI / 4 : 0, rr = sq ? r * Math.SQRT2 : r, R = rr + 3
  latheF(cx, cy, [[rr, 0], [rr, h]], N, wallM(st, r > 14 ? OVL.windows : 0), rot)
  const profs = {
    cone: [[R, h], [0, h + r * 1.5]], spire: [[R, h], [0, h + r * 2.4]], pyramid: [[R + 2, h], [0, h + r * 1.3]],
    dome: [[R, h], [rr * .86, h + r * .5], [rr * .5, h + r * .86], [0, h + r]],
    tiered: [[rr * 1.32, h], [rr * .96, h + r * .32], [rr * .78, h + r * .4], [rr * .34, h + r * 1], [0, h + r * 1.1]],
  }
  latheF(cx, cy, profs[roof], N, roofM(st), rot)
  const top = profs[roof].at(-1)[1]
  if (flag && r >= 16) flagF(cx, cy, top, st)
}
function flagF(x, y, z, st) {
  latheF(x, y, [[1.4, z - 2], [1.1, z + 26]], 4, DARK)
  face([x, y], [x + 20, y + 1], z + 13, 0, 12, null, mat(st.flag))
}
function blockF(x, y, w, d, st, h = st.wallH + 4) {
  boxF(x, y, w, d, 0, h, wallM(st, OVL.windows))
  if (st.square && Math.abs(w - d) < Math.min(w, d) * .4) latheF(x + w / 2, y + d / 2, [[Math.hypot(w, d) / 2 + 4, h], [0, h + Math.min(w, d) * .6]], 4, roofM(st), Math.PI / 4)
  else gableF(x, y, w, d, h, Math.min(w, d) * .44, roofM(st), wallM(st))
}
function treeF(x, y, r) {
  BX.kind = 2
  boxF(x - 1.6, y - 1.6, 3.2, 3.2, 0, r * 1.1, mat(TRUNK))
  latheF(x, y, [[r * .55, r * 1], [r * 1, r * 1.5], [r * .9, r * 2.2], [r * .45, r * 2.65], [0, r * 2.75]], 7, mat(R() < .5 ? GREEN : GREEN2, 'leaf'), R() * 3)
  BX.kind = null
}
// A tree that can be felled (16-delight): its stump, pale where it will be cut, stands on its own;
// the trunk above the cut and the crown are one piece of decor, turning about the cut.
const CUT = 4
function fellTreeF(x, y, r) {
  BX.kind = 2; boxF(x - 1.6, y - 1.6, 3.2, 3.2, 0, CUT, mat(TRUNK), mat(col3(76, .07, 72)))
  decorF('tree', x, y, CUT, r * 2.75, r, () => {
    BX.kind = 2; boxF(x - 1.6, y - 1.6, 3.2, 3.2, CUT, r * 1.1 - CUT, mat(TRUNK))
    latheF(x, y, [[r * .55, r * 1], [r * 1, r * 1.5], [r * .9, r * 2.2], [r * .45, r * 2.65], [0, r * 2.75]], 7, mat(R() < .5 ? GREEN : GREEN2, 'leaf'), R() * 3)
  })
  BX.kind = null
}
// The buildings of the work, one design per kind of plan.
// A piece that does one trick of its own when its place is hovered (16-pillars): `trick` is the GPU
// movement (kind, axis, amount, as decorPlay takes them) and `fx` what it throws off besides.
const trickF = (kind, x, y, z, h, r, trick, fn) => decorF(kind, x, y, z, h, r, fn, { base: z, trick })
// With BATCH.pillarCrowns, one part of each crown moves: the tree rustles and drops a leaf, a pawn
// is moved, the brass bar ticks up, the hammer strikes, the brass slash turns.
const crownF = (trick, x, y, z, h, r, fn) => BATCH.pillarCrowns ? trickF('crown', x, y, z, h, r, trick, fn) : fn()
// The crowns of the How I work pillars, one for each principle, drawn at a pillar's scale k.
const PILLAR_TOPS = {
  // Grow the team: a young tree growing out of the stone.
  grow(x, y, z, k) {
    latheF(x, y, [[2.2 * k, z], [2.2 * k, z + 14 * k]], 6, mat(TRUNK))
    crownF({ kind: 7, axis: [1, 0, 0], amount: .12, fx: 'leaf' }, x, y, z + 8 * k, 28 * k, 14 * k, () => { ballF(x, y, 13 * k, GREEN, z + 9 * k); ballF(x - 9 * k, y + 3 * k, 8 * k, GREEN2, z + 7 * k); ballF(x + 9 * k, y - 2 * k, 9 * k, GREEN, z + 8 * k) })
  },
  // Think like a strategist: a chessboard, a king behind two pawns.
  strategy(x, y, z, k) {
    const c = 4.6 * k, x0 = x - 2 * c, y0 = y - 2 * c, D = mat(col3(36, .02, 250)), L = mat(col3(92, .02, 85)), base = z + 2 * k
    boxF(x0 - k, y0 - k, 4 * c + 2 * k, 4 * c + 2 * k, z, 2 * k, mat(WOOD, 'timber'))
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) flatF(x0 + i * c, y0 + j * c, c, c, base, (i + j) % 2 ? D : L)
    const pawn = (px, py, m) => { latheF(px, py, [[2.6 * k, base], [2.6 * k, base + 1.4 * k], [1.3 * k, base + 2.8 * k], [1.1 * k, base + 6 * k]], 8, m); ballF(px, py, 2 * k, m.c, base + 5.4 * k) }
    const kx = x + c * .5, ky = y - c * .5
    latheF(kx, ky, [[3.4 * k, base], [3.4 * k, base + 2 * k], [1.8 * k, base + 4 * k], [1.5 * k, base + 13 * k], [3 * k, base + 15 * k], [2.2 * k, base + 17 * k], [0, base + 17.6 * k]], 10, D)
    boxF(kx - .8 * k, ky - .8 * k, 1.6 * k, 1.6 * k, base + 17 * k, 5 * k, D, D); boxF(kx - 2.4 * k, ky - .8 * k, 4.8 * k, 1.6 * k, base + 19 * k, 1.6 * k, D, D)
    crownF({ kind: 3, axis: [0, 0, 1], amount: 4 * k }, x - c * 1.5, y + c * .5, base, 8 * k, 4 * k, () => pawn(x - c * 1.5, y + c * .5, L)); pawn(x + c * 1.5, y + c * 1.5, D)
  },
  // Data-driven design: a bar chart, each bar taller than the last, the tallest in brass.
  data(x, y, z, k) {
    const w = 4.4 * k, g = 1.6 * k, x0 = x - (4 * w + 3 * g) / 2, S = mat(col3(36, .02, 250))
    boxF(x0 - g, y - 5 * k, 4 * w + 5 * g, 10 * k, z, 1.6 * k, mat(STONE), mat(STONE))
    ;[8, 13, 19, 28].forEach((h, i) => { const m = i === 3 ? mat(BRASS) : S, bar = () => boxF(x0 + i * (w + g), y - w / 2, w, w, z + 1.6 * k, h * k, m, m); i === 3 ? crownF({ kind: 8, axis: [0, 0, 1], amount: 6 * k }, x0 + i * (w + g) + w / 2, y, z + 1.6 * k, h * k, w, bar) : bar() })
  },
  // Build tools for the team: an anvil, a hammer resting on it.
  tools(x, y, z, k) {
    const D = mat(col3(36, .02, 250))
    boxF(x - 8 * k, y - 6 * k, 16 * k, 12 * k, z, 6 * k, D, D); boxF(x - 4 * k, y - 4 * k, 8 * k, 8 * k, z + 6 * k, 6 * k, D); boxF(x - 13 * k, y - 6 * k, 24 * k, 12 * k, z + 12 * k, 6 * k, D, mat(col3(48, .02, 250)))
    crownF({ kind: 4, axis: [0, 1, 0], amount: -.3, fx: 'sparks' }, x - 2 * k, y + 2.2 * k, z + 18 * k, 8 * k, 12 * k, () => { boxF(x - 2 * k, y + k, 18 * k, 2.5 * k, z + 18 * k, 2.5 * k, mat(WOOD, 'timber')); boxF(x + 13 * k, y - 2 * k, 4 * k, 8 * k, z + 18 * k, 5 * k, D, D) })
  },
  // Code and motion: a </> in blocks, standing on the capital and facing the road.
  code(x, y, z, k) {
    const s = 2.1 * k, lt = ['..X', '.X.', 'X..', '.X.', '..X'], sl = ['..X', '..X', '.X.', 'X..', 'X..'], gt = ['X..', '.X.', '..X', '.X.', 'X..'], gap = '...'
    blocksF(x, y, z, lt.map((r, i) => r + '.' + gap + '.' + gt[i]), s, mat(col3(36, .02, 250)), 2.4 * k)
    crownF({ kind: 6, axis: [0, 0, 1], amount: 0 }, x, y, z, 12 * k, 8 * k, () => blocksF(x, y, z, sl.map(r => '....' + r + '....'), s, mat(BRASS), 2.4 * k))
  },
}
const BUILD = {
  hall(q, st) {
    const X = q.x + 8, Y = q.y + 8, W2 = q.w - 16, D2 = q.h - 16, H0 = 64, rise = D2 * .42
    boxF(X, Y, W2, D2, 0, H0, wallM(st, OVL.windows)); gableF(X, Y, W2, D2, H0, rise, roofM(st), wallM(st))
    boxF(X + W2 / 2 - 24, Y + D2, 48, 16, 0, 42, wallM(st, OVL.door)); gableF(X + W2 / 2 - 24, Y + D2, 48, 16, 42, 16, roofM(st), wallM(st), 'y')
    latheF(X + W2 / 2, Y + D2 / 2, [[11, H0 + rise - 8], [11, H0 + rise + 22], [13, H0 + rise + 22], [0, H0 + rise + 60]], 8, wallM(st), 0, i => i === 2 ? roofM(st) : wallM(st))
    flagF(X + W2 / 2, Y + D2 / 2, H0 + rise + 60, st)
    if (q.banners) for (const t of [.2, .8]) bannerF(X + W2 * t, Y + D2, st.flag)
  },
  // CareHub 2.0, its case study still being written: the hall half built. Its west end stands
  // finished. East of it the hall is a timber frame at full height, its stone laid to ragged heights
  // that fall away bay by bay, its roof bare rafters and purlins where the tiles run out; scaffolding
  // along the front, a crane with a stone on its hook, bare earth, and stacks of stone and timber.
  // The wizard in the middle of the campus raises the rest (16-moments flies the stones).
  hallwip(q, st) {
    const P = hallWipPlan(q), { X, Y, W2, D2, done, bay, xs, fill } = P, H0 = 64, rise = D2 * .42, n = fill.length, E = X + W2
    const plain = wallM(st), wood = mat(WOOD, 'timber'), S = BUILT.stone, top = BUILT.top
    flatF(X + done - 6, Y - 6, W2 - done + 60, D2 + 46, .7, BUILT.dirt)
    boxF(X, Y, done, D2, 0, H0, wallM(st, OVL.windows)); gableF(X, Y, done, D2, H0, rise, roofM(st), plain)
    flagF(X + done / 2, Y + D2 / 2, H0 + rise, st); if (q.banners) bannerF(X + done / 2, Y + D2, st.flag)
    // The tiles run on a bay past the finished end, then stop.
    const tl = bay * 1.2, ov = 4
    face([X + done, Y - ov], [X + done + tl, Y - ov], H0, D2 / 2 + ov, rise, null, roofM(st)); face([X + done + tl, Y + D2 + ov], [X + done, Y + D2 + ov], H0, D2 / 2 + ov, rise, null, roofM(st))
    // Stone laid bay by bay, each bay's top ragged: its two halves a course apart.
    fill.forEach(([fr, bk], i) => {
      for (const [y0, hh] of [[Y + D2 - 5, fr], [Y + 1, bk]]) { boxF(xs[i], y0, bay / 2, 4, 0, hh, S, top); boxF(xs[i] + bay / 2, y0, bay / 2, 4, 0, Math.max(3, hh - 6), S, top) }
    })
    ;[14, 8, 18, 6].forEach((hh, i) => boxF(E - 5, Y + 4 + i * (D2 - 8) / 4, 4, (D2 - 8) / 4, 0, hh, S, top))
    // The frame: posts at every bay, front, back and along the east end, with a rail and a top plate.
    for (const x of xs) for (const y of [Y + D2 - 6, Y]) boxF(x - 2, y, 4, 6, 0, H0, wood, wood)
    for (let i = 1; i < 4; i++) boxF(E - 6, Y + i * D2 / 4 - 2, 6, 4, 0, H0, wood, wood)
    for (const y of [Y + D2 - 6, Y]) for (const z of [32, H0 - 4]) boxF(X + done, y, W2 - done, 6, z, 4, wood, wood)
    boxF(E - 6, Y, 6, D2, H0 - 4, 4, wood, wood)
    // The roof's bones: rafters at every half bay past the tiles, a ridge beam, and two purlins a side.
    for (let x = X + done + tl + bay * .5; x <= E; x += bay * .5) { face([x + 3, Y + D2], [x, Y + D2], H0, D2 / 2, rise, 3, wood); face([x, Y], [x + 3, Y], H0, D2 / 2, rise, 3, wood) }
    boxF(X + done, Y + D2 / 2 - 2, W2 - done, 4, H0 + rise - 3, 4, wood, wood)
    for (const f of [.35, .7]) for (const side of [1, -1]) boxF(X + done + tl, Y + D2 / 2 + side * (1 - f) * D2 / 2 - 1.5, W2 - done - tl, 3, H0 + f * rise - 1.5, 3, wood, wood)
    // Scaffolding along the front: poles, planks at three levels, a ladder.
    const sy = Y + D2 + 7
    for (let x = xs[1]; x <= E + 1; x += bay) boxF(x - 1, sy, 2, 2, 0, 72, wood); for (let x = xs[1]; x <= E + 1; x += bay) boxF(x - 1, sy + 10, 2, 2, 0, 72, wood)
    for (const z of [22, 44, 66]) boxF(xs[1] - 2, sy - 1, E - xs[1] + 4, 13, z, 1.6, wood, wood)
    for (const dx of [0, 7]) boxF(xs[2] + 6 + dx, sy + 13, 1.2, 1.2, 0, 46, wood); for (let z = 5; z < 46; z += 6) boxF(xs[2] + 6, sy + 13, 8.2, 1.2, z, 1, wood, wood)
    // The crane at the front corner, its jib out over the frame; stone and timber waiting on the earth.
    craneF(E + 30, Y + D2 + 24, 150, 160, 36, xs[4], 76)
    for (let i = 0; i < 4; i++) boxF(E + 6, Y + D2 - 34 + (i % 2) * 5, 46, 4, i * 3.4, 3.4, wood, wood)
  },
  // AI next-best-action, half built: its drum laid to ragged heights, finished on the west under its
  // cornice and dome; elsewhere timber posts stand where the wall will rise, the dome is ribs and rings,
  // scaffolding rings the open side and a crane leans over it.
  rotundawip(q, st) {
    const P = rotundaWipPlan(q), { N, done, h, at, R0 } = P, H0 = 58, base = H0 + 6, cx = q.cx, cy = q.cy, wood = mat(WOOD, 'timber')
    flatF(cx - 12, cy - R0 - 12, R0 + 44, 2 * R0 + 40, .7, BUILT.dirt)
    for (let jj = 0; jj < N; jj++) latheF(cx, cy, [[R0, 0], [R0, h(jj)]], N, null, 0, (_, j) => j === jj ? wallM(st, done(j) ? OVL.windows : 0) : null)
    latheF(cx, cy, [[R0 + 4, H0], [R0 + 4, base], [R0 * .9, base]], N, null, 0, (_, j) => done(j) ? wallM(st) : null)
    const dome = [[R0 * .9, base], [R0 * .84, base + R0 * .34], [R0 * .64, base + R0 * .66], [R0 * .34, base + R0 * .88], [0, base + R0 * .93]]
    latheF(cx, cy, dome, N, null, 0, (_, j) => done(j) ? roofM(st) : null)
    latheF(cx, cy, dome, N * 4, null, 0, (_, j) => j % 4 === 0 && !done(j >> 2) ? wood : null)
    for (const [r, z] of dome.slice(0, 3)) latheF(cx, cy, [[r + .5, z - 3], [r + .5, z]], N, null, 0, (_, j) => done(j) ? null : wood)
    for (let j = 0; j < N; j++) if (!done(j)) {
      if (j % 2 === 0) { const [px, py] = at(j); boxF(px - 2, py - 2, 4, 4, 0, base, wood, wood) }
      const [sx, sy] = at(j, R0 + 10); boxF(sx - 1, sy - 1, 2, 2, 0, 70, wood)
    }
    for (const z of [22, 44, 66]) latheF(cx, cy, [[R0 + 14, z], [R0 + 6, z]], N, null, 0, (_, j) => done(j) ? null : wood)
    craneF(cx + R0 + 28, cy + R0 * .7, 160, 190, 36, cx + 18, 92)
  },
  // Video visits, half built: the tower laid to ragged heights, finished on the west; elsewhere timber
  // posts stand to its planned height inside a ring of scaffolding, and a crane rises from within it.
  towerwip(q, st) {
    const P = towerWipPlan(q), { N, done, h, at, R0 } = P, cx = q.cx, cy = q.cy, wood = mat(WOOD, 'timber'), top = 124
    flatF(cx - R0 - 10, cy - 8, 2 * R0 + 24, R0 + 36, .7, BUILT.dirt)
    for (let jj = 0; jj < N; jj++) latheF(cx, cy, [[R0, 0], [R0, h(jj)]], N, null, 0, (_, j) => j === jj ? wallM(st, done(j) ? OVL.windows : 0) : null)
    for (let j = 0; j < N; j++) if (!done(j)) { const [px, py] = at(j), [sx, sy] = at(j, R0 + 9); boxF(px - 2, py - 2, 4, 4, 0, top, wood, wood); boxF(sx - 1, sy - 1, 2, 2, 0, top + 6, wood) }
    latheF(cx, cy, [[R0 + .5, top - 4], [R0 + .5, top]], N, null, 0, (_, j) => done(j) ? null : wood)
    for (const z of [30, 60, 90, 118]) latheF(cx, cy, [[R0 + 13, z], [R0 + 5, z]], N, null, 0, (_, j) => done(j) ? null : wood)
    craneF(cx, cy, 190, 150, 40, cx - 64, 118)
  },
  // Care-team workflows, half built: the cloister finished on its west side; east of the middle its
  // walls are laid in lengths that fall away, joists lie bare where the roofs will go, the east towers
  // are stumps in their frames; the wizard raises the rest.
  cloisterwip(q, st) {
    const P = cloisterWipPlan(q), { g, xm, L, n, fall } = P, { x, y, w, h } = q, cx = x + w / 2, cy = y + h / 2, T = 3
    const arc = wallM(st, OVL.arcade), plain = wallM(st), top = BUILT.top, wood = mat(WOOD, 'timber'), E = x + w
    flatF(xm, y + g, E - g - xm, h - 2 * g, .7, BUILT.dirt)
    for (const [yy, hh] of [[y + 4, 26], [y + h - 4 - T, 26], [y + g, 22], [y + h - g - T, 22]]) boxF(x + 4, yy, xm - x - 4, T, 0, hh, arc, top)
    boxF(x + 4, y + 4, T, h - 8, 0, 26, arc, top); boxF(x + g, y + g, T, h - 2 * g, 0, 22, arc, top)
    for (const [a, b, c, d] of [[x + 4, y + 4, xm - x - 4, g - 4], [x + 4, y + h - g, xm - x - 4, g - 4], [x + 4, y + g, g - 4, h - 2 * g]]) flatF(a, b, c, d, 26, roofM(st))
    for (let i = 0; i < n; i++) {
      const x0 = xm + i * L, len = Math.min(L, E - 4 - x0), f = fall(i)
      for (const [yy, hh] of [[y + 4, f + 4], [y + h - 4 - T, f], [y + g, f - 2], [y + h - g - T, f - 4]]) boxF(x0, yy, len, T, 0, Math.max(4, hh), plain, top)
    }
    ;[8, 12, 6, 10, 5].forEach((hh, i) => boxF(E - 4 - T, y + 4 + i * (h - 8) / 5, T, (h - 8) / 5, 0, hh, plain, top))
    ;[10, 6, 9].forEach((hh, i) => boxF(E - g, y + g + i * (h - 2 * g) / 3, T, (h - 2 * g) / 3, 0, hh, plain, top))
    for (let xx = xm + 6; xx < E - 6; xx += 12) for (const y0 of [y + 4, y + h - g]) boxF(xx, y0, 2.5, g - 4, 26, 2.5, wood, wood)
    for (let yy = y + g + 6; yy < y + h - g; yy += 12) boxF(E - g, yy, g - 4, 2.5, 26, 2.5, wood, wood)
    for (const [px, py] of [[E - 6, y + 6], [E - 6, y + h - 6], [E - g, y + g], [E - g, y + h - g], [(xm + E) / 2, y + h - 6], [(xm + E) / 2, y + 6]]) boxF(px - 2, py - 2, 4, 4, 0, 26, wood, wood)
    decorF('fountain', cx, cy, 0, 29, 20, () => { latheF(cx, cy, [[20, 0], [20, 8], [15, 8], [15, 4]], 12, wallM(st)); latheF(cx, cy, [[15, 4.5], [0, 4.5]], 12, mat(WATER)); latheF(cx, cy, [[3, 4], [3, 24], [7, 26], [0, 29]], 6, wallM(st)) })
    for (const [qx, qy] of [[x + 4, y + 4], [x + 4, y + h - 34]]) { boxF(qx, qy, 30, 30, 0, 40, plain); latheF(qx + 15, qy + 15, [[24, 40], [0, 64]], 4, roofM(st), Math.PI / 4) }
    for (const [qx, qy, hh] of [[E - 34, y + 4, 18], [E - 34, y + h - 34, 12]]) {
      boxF(qx, qy, 30, 30, 0, hh, plain, top)
      for (const [dx, dy] of [[0, 0], [27.5, 0], [0, 27.5], [27.5, 27.5]]) boxF(qx + dx, qy + dy, 2.5, 2.5, 0, 40, wood, wood)
      for (const dy of [0, 27.5]) boxF(qx, qy + dy, 30, 2.5, 38, 2.5, wood, wood)
    }
    for (let xx = xm; xx <= E; xx += 20) boxF(xx - 1, y + h + 3, 2, 2, 0, 34, wood)
    for (const z of [14, 28]) boxF(xm - 1, y + h + 2, E - xm + 2, 6, z, 1.5, wood, wood)
    craneF(E + 22, y + 44, 120, 170, 30, xm + 50, 50)
  },
  // The clinic's crest on a plinth: a green shield, its pulse line in white blocks.
  crest(q) {
    const { cx: x, cy: y } = q, G = mat(col3(56, .1, 168)), S = mat(STONE, 'stone')
    boxF(x - 30, y - 10, 60, 20, 0, 12, S, mat(STONE))
    boxF(x - 28, y - 3, 56, 6, 36, 40, G, G)
    ;[48, 36, 24, 12].forEach((w, i) => boxF(x - w / 2, y - 3, w, 6, 30 - i * 6, 6, G, G))
    blocksF(x, y + 3.6, 48, ['....X......', '...X.X.....', 'XXX...X.XXX', '.......X...'], 4.2, mat(col3(97, .01, 90)), 1.6)
  },
  // Physical therapy in the open: parallel bars to walk between, and exercise balls on the grass.
  rehab(q) {
    const { x, y, w } = q, cx = x + w / 2, rail = mat(col3(60, .09, 168))
    for (const dx of [-11, 11]) {
      for (const dy of [0, 30, 60]) latheF(cx + dx, y + 30 + dy, [[1.6, 0], [1.6, 24]], 6, DARK)
      boxF(cx + dx - 1.4, y + 28, 2.8, 64, 23, 2.8, rail, rail)
    }
    for (const [dx, dy, r, c] of [[-30, 22, 9, 168], [31, 44, 10, 30], [-29, 102, 8, 30], [32, 110, 7, 168]]) ballF(cx + dx, y + dy, r, col3(70, .11, c))
  },
  rotunda(q, st) {
    const R0 = q.r * .86, H0 = 58, base = H0 + 6
    latheF(q.cx, q.cy, [[R0, 0], [R0, H0]], 16, wallM(st, OVL.windows)); latheF(q.cx, q.cy, [[R0 + 4, H0], [R0 + 4, base], [R0 * .9, base]], 16, wallM(st))
    latheF(q.cx, q.cy, [[R0 * .9, base], [R0 * .84, base + R0 * .34], [R0 * .64, base + R0 * .66], [R0 * .34, base + R0 * .88], [0, base + R0 * .93]], 16, roofM(st), 0, (i, j) => j === 11 && i < 3 ? DARK : roofM(st))
  },
  cloister(q, st) {
    const { x, y, w, h } = q, g = 34, cx = x + w / 2, cy = y + h / 2
    boxF(x + 4, y + 4, w - 8, h - 8, 0, 26, wallM(st, OVL.arcade)); boxF(x + g, y + g, w - 2 * g, h - 2 * g, 0, 22, wallM(st, OVL.arcade))
    for (const [a, b, c, d] of [[x + 4, y + 4, w - 8, g - 4], [x + 4, y + h - g, w - 8, g - 4], [x + 4, y + g, g - 4, h - 2 * g], [x + w - g, y + g, g - 4, h - 2 * g]]) flatF(a, b, c, d, 26, roofM(st))
    decorF('fountain', cx, cy, 0, 29, 20, () => { latheF(cx, cy, [[20, 0], [20, 8], [15, 8], [15, 4]], 12, wallM(st)); latheF(cx, cy, [[15, 4.5], [0, 4.5]], 12, mat(WATER)); latheF(cx, cy, [[3, 4], [3, 24], [7, 26], [0, 29]], 6, wallM(st)) })
    for (const [qx, qy] of [[x + 4, y + 4], [x + w - 34, y + 4], [x + 4, y + h - 34], [x + w - 34, y + h - 34]]) { boxF(qx, qy, 30, 30, 0, 40, wallM(st)); latheF(qx + 15, qy + 15, [[24, 40], [0, 64]], 4, roofM(st), Math.PI / 4) }
  },
  roundtower(q, st) {
    const R0 = q.r * .74, H0 = 138, top = H0 + R0 * 1.3
    latheF(q.cx, q.cy, [[R0, 0], [R0, H0]], 14, wallM(st, OVL.windows)); latheF(q.cx, q.cy, [[R0 + 6, H0 - 14], [R0 + 6, H0 - 8], [R0, H0 - 8]], 14, wallM(st))
    latheF(q.cx, q.cy, [[R0 + 5, H0], [0, top]], 14, roofM(st)); flagF(q.cx, q.cy, top, st)
  },
  arena(q, st) {
    const R0 = q.r * .96, N = 24
    latheF(q.cx, q.cy, [[R0, 0], [R0, 54]], N, mat(st.wall, 'stone', OVL.arcade)); latheF(q.cx, q.cy, [[R0 + 3, 54], [R0 + 3, 60], [R0 - 14, 60]], N, mat(st.wall, 'stone'))
    latheF(q.cx, q.cy, [[R0 - 14, 58], [R0 * .64, 14]], N, mat(col3(76, .07, 20), 'tiers')); latheF(q.cx, q.cy, [[R0 * .64, 14], [R0 * .64, 2]], N, mat(st.wall, 'stone'))
    latheF(q.cx, q.cy, [[R0 * .64, 2], [R0 * .52, 2]], N, mat(col3(68, .1, 30))); latheF(q.cx, q.cy, [[R0 * .52, 2.2], [0, 2.2]], N, mat(col3(74, .11, 140), 'grass'))
    flagF(q.cx + Math.cos(.4) * R0, q.cy + Math.sin(.4) * R0, 60, st)
  },
  guild(q, st) {
    const { x, y, w, h } = q, C = [col3(72, .14, 15), col3(95, .02, 85), col3(82, .09, 165), col3(86, .07, 15)], cw = (w - 40) / 3, ch = (h - 40) / 2
    boxF(x + 10, y + 10, w - 20, h - 20, 0, 12, wallM(st), wallM(st))
    for (const [i, j, hh, c] of [[0, 0, 66, 0], [1, 0, 42, 1], [2, 0, 92, 2], [0, 1, 50, 3], [1, 1, 118, 0], [2, 1, 34, 1]]) boxF(x + 20 + i * cw + 3, y + 20 + j * ch + 3, cw - 6, ch - 6, 12, hh, mat(C[c]), mat(C[c]))
    latheF(x + 20 + cw * 1.5, y + 20 + ch * 1.5, [[13, 130], [13, 146], [0, 146]], 10, mat(C[2]))
  },
  // Cart abandonment: a grand shopping arcade, lit storefronts under striped awnings, and a
  // giant cart on the roof.
  shops(q, st) {
    const { x, y, w, h } = q, n = 4, sw = w / n, H0 = 62
    for (let i = 0; i < n; i++) {
      const sx = x + i * sw, wm = mat(i % 2 ? st.wall : col3(93, .03, 80), 'plaster', OVL.lit)
      boxF(sx + 2, y + 6, sw - 4, h - 18, 0, H0, wm)
      face([sx + sw - 2, y + h - 12], [sx + 2, y + h - 12], 38, -16, -10, null, mat(col3(60, .17, 15), 'stripe'))
    }
    flatF(x + 2, y + 6, w - 4, h - 18, H0, roofM(st)); wallsF(rectPts(x + 2, y + 6, w - 4, h - 18), H0, 7, wallM(st))
    cartF(x + w / 2 - 44, y + h / 2 - 36, 2.4, col3(54, .19, 20), H0)
    for (let i = 0; i <= n; i++) lampF(x + i * sw, y + h + 6, 28)
  },
  gatehouse(q, st) {
    const { x, y, w, h } = q, cy = y + h / 2
    towerF(x + 21, cy, 21, st); towerF(x + w - 21, cy, 21, st)
    boxF(x + 40, cy - 20, w - 80, 40, 0, 70, wallM(st, OVL.portcullis, CRENEL))
  },
  market(q, st) {
    const { x, y, w, h } = q, stall = mat(col3(80, .05, 70), 'timber')
    wallsF(rectPts(x + 4, y + 4, w - 8, h - 8), 0, 14, wallM(st))
    // A stall about every 56 units along each side, so a wider square gets more of them, not longer ones.
    const n = Math.max(4, Math.round((w - 44) / 56))
    for (let i = 0; i < n; i++) for (const j of [0, 1]) {
      const sw = (w - 44) / n - 8, sx = x + 22 + i * ((w - 44) / n) + 4, sy = j ? y + h - 62 : y + 24
      boxF(sx, sy, sw, 26, 0, 16, stall); gableF(sx - 3, sy - 3, sw + 6, 32, 16, 13, mat(col3(60, .18, 27), 'stripe'), stall, 'x')
    }
    latheF(x + w / 2, y + h / 2, [[16, 0], [16, 7], [12, 7], [12, 3]], 12, wallM(st)); latheF(x + w / 2, y + h / 2, [[12, 3.5], [0, 3.5]], 12, mat(WATER))
  },
  bannerhall(q, st) {
    const { x, y, w, h } = q, X = x + 6, Y = y + 8, W2 = w - 12, D2 = h - 16
    boxF(X, Y, W2, D2, 0, 54, wallM(st, OVL.windows)); boxF(X, Y + D2 - 2, W2, 18, 0, 32, wallM(st, OVL.arcade)); flatF(X, Y + D2 - 2, W2, 18, 32, roofM(st))
    gableF(X, Y, W2, D2, 54, D2 * .38, roofM(st), wallM(st))
    for (let i = 0; i < 4; i++) { const bx = X + 22 + i * (W2 - 44) / 3; face([bx + 9, Y + D2 + 17], [bx - 9, Y + D2 + 17], 34, 0, 18, null, mat(i % 2 ? st.flag : col3(62, .17, 27))) }
  },
  // Promo experiments as a science tower (BATCH.labTower): a lab wing with tall windows, its tower crowned
  // by a lit lantern, a copper dome and a lightning rod, and three flasks brewing by the lab door.
  labtower(q, st) {
    const { x, y, w, h } = q, glass = mat(col3(74, .1, 165), 'glass'), stone = mat(col3(80, .02, 70), 'stone')
    const X = x + 8, Y = y + 24, W2 = w - 92, D2 = h - 36
    boxF(X, Y, W2, D2, 0, 36, wallM(st, OVL.windows)); gableF(X, Y, W2, D2, 36, D2 * .4, roofM(st), wallM(st))
    // The tower: a stone band low and a gallery high, slit windows up the face, then the lit lantern of the
    // laboratory under a copper-green dome, and the lightning rod with its glowing tip.
    const cx = x + w - 44, cy = y + h / 2, R0 = 26, H0 = 132
    latheF(cx, cy, [[R0 + 3, 0], [R0 + 3, 10], [R0, 10], [R0, H0]], 14, wallM(st))
    latheF(cx, cy, [[R0 + 2, 58], [R0 + 2, 64], [R0, 64]], 14, stone)
    for (const z of [26, 76, 104]) boxF(cx - 2.2, cy + R0 - 1.6, 4.4, 3, z, 13, DARK, DARK)
    latheF(cx, cy, [[R0 + 4, H0], [R0 + 4, H0 + 5], [R0 * .74, H0 + 5]], 14, stone)
    latheF(cx, cy, [[R0 * .74, H0 + 5], [R0 * .74, H0 + 24]], 12, mat(LAMP, 'glass'))
    latheF(cx, cy, [[R0 * .84, H0 + 24], [R0 * .7, H0 + 34], [R0 * .42, H0 + 41], [0, H0 + 43]], 12, mat(col3(56, .1, 168), 'slate'))
    latheF(cx, cy, [[1, H0 + 43], [1, H0 + 66]], 5, DARK); ballF(cx, cy, 3, col3(84, .13, 95), H0 + 66)
    // Three flasks brewing by the lab door: green, magenta and gold, each with a glass neck.
    for (const [k, c] of [[0, col3(64, .15, 155)], [1, col3(56, .18, 335)], [2, col3(80, .14, 90)]]) {
      const fx = X + 12 + k * 22, fy = Y + D2 + 12
      latheF(fx, fy, [[7, 0], [7, 2], [8, 6], [6.4, 12], [2.2, 15]], 12, mat(c))
      latheF(fx, fy, [[2.2, 15], [2.2, 23], [3.2, 24], [0, 24]], 8, glass)
    }
  },
  kitchens(q, st) {
    const { x, y, w, h } = q, X = x + 8, Y = y + 10, W2 = w - 16, D2 = h - 20
    boxF(X, Y, W2, D2, 0, 44, wallM(st, OVL.windows)); gableF(X, Y, W2, D2, 44, D2 * .4, roofM(st), wallM(st))
    for (let i = 0; i < 3; i++) boxF(X + 28 + i * 54, Y + 10, 12, 12, 44, 48, mat(col3(68, .04, 40), 'brick'), DARK)
  },
  // IIT Roorkee's main building: a long white block, its flat roof behind a parapet, end pavilions,
  // a portico of columns at the centre, and over it a dome with a lantern.
  thomason(q, st) {
    const { x, y, w } = q, W = mat(col3(95, .01, 85), 'plaster', OVL.windows), P = mat(col3(95, .01, 85), 'plaster'), top = mat(col3(88, .015, 85)), C = mat(col3(98, .006, 85))
    const X = x + 4, Y = y + 10, BW = w - 8, BD = 62, H = 32, cx = X + BW / 2, F = Y + BD
    boxF(X, Y, BW, BD, 0, H, W, top); wallsF(rectPts(X - 1, Y - 1, BW + 2, BD + 2), H, 5, P)
    for (const ex of [X - 4, X + BW - 22]) { boxF(ex, F - 22, 26, 30, 0, H + 4, W, top); for (const dx of [5, 21]) latheF(ex + dx, F + 4, [[2.2, 0], [2.2, H + 4]], 8, C) }
    for (let i = 0; i < 6; i++) latheF(cx - 30 + i * 12, F + 14, [[2.6, 0], [2.6, H + 2]], 8, C)
    boxF(cx - 35, F, 70, 18, H + 2, 6, P, top); boxF(cx - 38, F - 4, 76, 4, 0, 4, mat(STONE), mat(STONE))
    const dy = Y + BD / 2
    latheF(cx, dy, [[17, H], [17, H + 10]], 16, P); latheF(cx, dy, [[19, H + 10], [19, H + 12], [17, H + 12]], 16, P)
    latheF(cx, dy, [[17, H + 12], [16, H + 18], [13.5, H + 24], [9.5, H + 28.5], [4.5, H + 31], [0, H + 32]], 16, C)
    latheF(cx, dy, [[3.4, H + 31], [3.4, H + 39]], 6, P); latheF(cx, dy, [[4.4, H + 39], [0, H + 45]], 6, C)
    flagF(X + BW - 14, Y + 8, H + 4, st)
  },
  // Its east wing: the same white block with a colonnade the length of its front.
  colonnade(q) {
    const { x, y, w } = q, W = mat(col3(95, .01, 85), 'plaster', OVL.windows), P = mat(col3(95, .01, 85), 'plaster'), top = mat(col3(88, .015, 85)), C = mat(col3(98, .006, 85))
    const X = x + 4, Y = y + 8, BW = w - 8, BD = 54, H = 30, F = Y + BD
    boxF(X, Y, BW, BD, 0, H, W, top); wallsF(rectPts(X - 1, Y - 1, BW + 2, BD + 2), H, 4, P)
    for (let i = 0; i < 9; i++) latheF(X + 6 + i * (BW - 12) / 8, F + 12, [[2.2, 0], [2.2, H]], 8, C)
    boxF(X + 2, F, BW - 4, 15, H, 5, P, top); boxF(X, F - 2, BW, 18, 0, 3, mat(STONE), mat(STONE))
  },
  // A summer at Cure.fit: a small studio in Cult's red brick; the second summer's carries a dumbbell on its ridge.
  internhall(q) {
    const { x, y, w, h } = q, brick = mat(col3(64, .12, 22), 'brick', OVL.lit), tile = mat(col3(52, .14, 18), 'tile'), X = x + 6, Y = y + 6, W = w - 12, D = h - 12, rise = D * .42
    boxF(X, Y, W, D, 0, 34, brick); gableF(X, Y, W, D, 34, rise, tile, brick, 'x')
    if (!q.gym) return
    const cx = X + W / 2, cy = Y + D / 2, rz = 34 + rise
    boxF(cx - 20, cy - 1.5, 40, 3, rz + 7, 3, DARK)
    for (const dx of [-17, 12]) boxF(cx + dx, cy - 7, 5, 14, rz, 14, DARK, DARK)
  },
  // The earlier stops, each in its company's colours. Mobily Invited, an invitations product: a marquee
  // for the party, striped in its purple.
  marquee(q) {
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2, P = col3(46, .19, 288)
    for (const [dx, dy] of [[-15, -12], [15, -12], [15, 12], [-15, 12]]) latheF(cx + dx, cy + dy, [[1.3, 0], [1.3, 16]], 6, DARK)
    boxF(cx - 15, cy - 12, 30, 24, 4, 12, mat(CREAM))
    latheF(cx, cy, [[23, 16], [0, 36]], 8, null, Math.PI / 8, (_, k) => k % 2 ? mat(P) : mat(CREAM))
    latheF(cx, cy, [[.9, 35], [.9, 46]], 5, DARK); face([cx, cy], [cx + 11, cy + .5], 40, 0, 6, null, mat(P))
  },
  // Pipeline Security: a watchtower, roofed in its red, a lantern lit at the top.
  watchtower(q) {
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2, S = mat(STONE, 'stone'), red = mat(col3(54, .19, 26), 'tile')
    boxF(cx - 9, cy - 9, 18, 18, 0, 40, S); boxF(cx - 12, cy - 12, 24, 24, 40, 4, S, mat(STONE))
    latheF(cx, cy, [[16, 44], [0, 64]], 4, red, Math.PI / 4); ballF(cx, cy + 12.5, 2.6, LAMP, 26)
  },
  // West Agile Labs: a small lab house, and beside it a great flask in its green.
  lab(q) {
    const { x, y } = q, glass = mat(col3(74, .1, 165), 'glass')
    boxF(x, y + 4, 26, 22, 0, 18, mat(col3(93, .02, 85), 'plaster', OVL.lit), mat(col3(80, .03, 85))); boxF(x + 4, y + 8, 6, 6, 18, 8, DARK, DARK)
    latheF(x + 38, y + 14, [[11, 0], [11, 3], [12, 9], [9, 17], [3.2, 23], [3.2, 34], [4.4, 35], [0, 35]], 12, glass)
    latheF(x + 38, y + 14, [[9.6, 1], [10.4, 9], [0, 9]], 12, mat(col3(62, .14, 160)))
  },
  // stockroom.io, a stockroom for candidates: a navy shed, its goods stacked by the door.
  warehouse(q) {
    const { x, y, w, h } = q, navy = mat(col3(40, .07, 262), 'tile'), wall = mat(col3(90, .02, 250), 'timber')
    boxF(x, y, w, h - 6, 0, 20, wall); gableF(x, y, w, h - 6, 20, 12, navy, wall, 'x')
    for (const [dx, dy, s] of [[w + 2, 4, 10], [w + 2, 15, 10], [w + 4, 8, 8]]) crateF(x + dx, y + dy, s)
    crateF(x + w + 3, y + 7, 8); boxF(x + w + 3, y + 7, 8, 8, 10, 8, mat(col3(48, .08, 262)), mat(col3(54, .08, 262)))
  },
  // Pibit, as a stop of its own: one striped market tent.
  stall(q) {
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2
    latheF(cx, cy, [[17, 0], [17, 10], [0, 38]], 10, null, 0, (_, k) => k % 2 ? mat(col3(72, .15, 55)) : mat(CREAM))
  },
  // The study: a timber studio house with a glass roof to the light, a chimney, and a turret.
  cottage(q, st) {
    const { x, y } = q, wall = mat(HOME.cream, 'timber', OVL.lit), tile = mat(HOME.terracotta, 'tile'), glass = mat(col3(84, .05, 225), 'glass')
    const X = x + 14, Y = y + 26, BW = 156, BD = 104, H1 = 50, rise = 44
    boxF(X, Y, BW, BD, 0, H1, wall)
    face([X - 4, Y - 4], [X + BW + 4, Y - 4], H1, BD / 2 + 4, rise, null, tile)
    face([X + BW + 4, Y + BD + 4], [X - 4, Y + BD + 4], H1, BD / 2 + 4, rise, null, glass)
    face([X, Y + BD], [X, Y], H1, 0, rise, 0, wall); face([X + BW, Y], [X + BW, Y + BD], H1, 0, rise, 0, wall)
    boxF(X + 22, Y + 22, 13, 13, H1 + 14, 50, mat(col3(58, .06, 38), 'brick'), DARK)
    boxF(X + 56, Y + BD, 44, 18, 0, 32, wall); gableF(X + 56, Y + BD, 44, 18, 32, 13, tile, wall, 'y')
    lampF(X + 110, Y + BD + 12, 26)
    const tx = X + BW + 28, ty = Y + 46
    latheF(tx, ty, [[25, 0], [25, 92]], 12, wall); latheF(tx, ty, [[30, 92], [30, 97], [0, 160]], 12, mat(HOME.slate, 'slate'))
    flagF(tx, ty, 160, st)
  },
  // The lighthouse: taller, its lamp alight, a keeper's cottage, a post box, and an owl on watch.
  lighthouse(q, st) {
    // Drawn for a base of radius 46; every height and the cottage beside it scale with the base.
    const k = q.r / 46, R0 = q.r * .62, H0 = 196 * k, white = mat(col3(95, .015, 80), 'plaster', OVL.lit), red = mat(col3(52, .16, 27), 'plaster')
    const rAt = z => R0 * (1 - .22 * (z - 18 * k) / (H0 - 18 * k)) + .5
    latheF(q.cx, q.cy, [[q.r * 1.05, 0], [q.r * 1.05, 18 * k], [R0, 18 * k]], 16, mat(col3(78, .02, 70), 'stone'))
    latheF(q.cx, q.cy, [[R0, 18 * k], [R0 * .78, H0]], 16, null, 0, () => white)
    for (const [a, b] of [[50, 76], [108, 134], [162, 180]]) latheF(q.cx, q.cy, [[rAt(a * k), a * k], [rAt(b * k), b * k]], 16, red)
    latheF(q.cx, q.cy, [[R0 * 1.24, H0], [R0 * 1.24, H0 + 6 * k], [R0 * .62, H0 + 6 * k]], 16, DARK)
    latheF(q.cx, q.cy, [[R0 * .62, H0 + 6 * k], [R0 * .62, H0 + 34 * k]], 12, mat(LAMP, 'glass'))
    latheF(q.cx, q.cy, [[R0 * .74, H0 + 34 * k], [0, H0 + 62 * k]], 12, red); ballF(q.cx, q.cy, 2.6 * k, col3(40, .03, 60), H0 + 61 * k)
    owlF(q.cx + R0 * .3, q.cy + R0 * 1.14, H0 + 6 * k, 1.7 * k)
    const kx = q.cx - 104 * k, ky = q.cy - 26 * k
    boxF(kx, ky, 62 * k, 44 * k, 0, 30 * k, mat(HOME.cream, 'plaster', OVL.lit)); gableF(kx, ky, 62 * k, 44 * k, 30 * k, 20 * k, mat(HOME.terracotta, 'tile'), mat(HOME.cream, 'plaster'), 'x')
    boxF(kx + 44 * k, ky + 8 * k, 9 * k, 9 * k, 40 * k, 22 * k, mat(col3(58, .06, 38), 'brick'), DARK)
    latheF(q.cx + 54 * k, q.cy + 56 * k, [[4.2 * k, 0], [4.2 * k, 20 * k], [3.8 * k, 23 * k], [0, 25 * k]], 10, mat(col3(48, .17, 27)))
  },
  post(q, st) {
    const R0 = q.r * .78, H0 = 92
    latheF(q.cx, q.cy, [[R0, 0], [R0, H0]], 12, wallM(st, OVL.pigeon)); latheF(q.cx, q.cy, [[R0 + 5, H0], [0, H0 + 70]], 12, roofM(st)); flagF(q.cx, q.cy, H0 + 70, st)
  },
  // Off duty: a lawn inside a low hedge, and the things he spends it on, as large as life.
  garden(q) {
    const { x, y, w, h } = q, hedge = mat(col3(58, .1, 145), 'leaf')
    boxF(x, y, w, 10, 0, 14, hedge, hedge); boxF(x, y + h - 10, w, 10, 0, 14, hedge, hedge); boxF(x, y + 10, 10, h - 20, 0, 14, hedge, hedge)
    boxF(x + w - 10, y + 10, 10, h * .42, 0, 14, hedge, hedge); boxF(x + w - 10, y + h * .58, 10, h * .42 - 10, 0, 14, hedge, hedge)
    // The pond, and a little bridge over it.
    const px = x + 70, py = y + h - 62
    flatF(px - 46, py - 24, 92, 48, .8, mat(WATER, 'none', 0, ROUND))
    gableF(px - 9, py - 30, 18, 60, 2, 9, mat(WOOD, 'timber'), mat(WOOD, 'timber'), 'x', 0)
    for (const dx of [-10, 9]) boxF(px + dx, py - 28, 1.6, 56, 8, 7, mat(WOOD))
    // The flowers and trees keep their places as the yard grows (it was drawn 420 by 520).
    const kx = w / 420, ky = h / 520
    for (const [fx, fy] of [[30, 40], [390, 40], [150, 36], [30, 480], [390, 470], [340, 440], [150, 230], [390, 210]]) flowersF(x + fx * kx, y + fy * ky)
    for (const [tx, ty] of [[24, 210], [396, 120], [24, 380], [396, 360], [260, 470]]) fellTreeF(x + tx * kx, y + ty * ky, 12)
  },
  // I lift every day: a rack, a loaded bar, a bench.
  lift(q) {
    const [bx, by] = [q.x + 40, q.y + 24]
    for (const dx of [-26, 26]) latheF(bx + dx, by, [[2.2, 0], [2.2, 44]], 6, DARK)
    decorF('barbell', bx, by, 26, 20, 40, () => {
      boxF(bx - 38, by - 1.3, 76, 2.6, 34, 2.6, mat(col3(72, .01, 60)))
      for (const dx of [-33, -29, 29, 33]) boxF(bx + dx - 1.6, by - 10, 3.2, 20, 26, 18, DARK, DARK)
    }, { base: 26 })
    boxF(bx - 9, by + 14, 18, 38, 0, 11, mat(col3(38, .03, 40)), mat(col3(34, .04, 20)))
  },
  // Weekends are for books: a bench, a lamp, a pile to get through.
  reading(q) {
    const [kx, ky] = [q.x + 46, q.y + 30]
    if (BATCH.hammock) hammockF(kx - 26, ky + 8); else benchF(kx - 22, ky + 4, 44)
    lampF(kx - 34, ky - 4, 30)
    let bz = 0
    for (const [bw, bd, bh, a, c] of [[30, 22, 6, .2, [50, .15, 27]], [27, 20, 5, -.18, [40, .09, 258]], [28, 19, 6, .06, [52, .11, 150]], [24, 17, 5, -.1, [70, .12, 80]]]) { slabF(kx + 34, ky - 6, bw, bd, bz, bh, a, mat(col3(...c)), mat(HOME.page, 'tiers'), mat(col3(...c))); bz += bh }
  },
  // Breaks mean a controller; a noodle stand for the anime; a table for the people who matter.
  games(q) { controllerF(...q.c) },
  noodles(q) { ramenF(...q.c); if (BATCH.cherryTree) cherryF(q.x + q.w + 20, q.y + 4) },
  feast(q) { tableF(...q.c); if (BATCH.wavers) wavingBenchF(q.c[0], q.c[1] + 60) },
  // Designing my portfolio: an observatory, for a portfolio built as a universe.
  observatory(q, st) {
    const R0 = q.r * .82, H0 = 48, top = H0 + 4, dome = mat(col3(62, .07, 255), 'slate')
    latheF(q.cx, q.cy, [[R0, 0], [R0, H0]], 16, wallM(st, OVL.lit))
    latheF(q.cx, q.cy, [[R0 + 3, H0], [R0 + 3, top], [R0, top]], 16, DARK)
    latheF(q.cx, q.cy, [[R0, top], [R0 * .93, top + R0 * .38], [R0 * .72, top + R0 * .7], [R0 * .4, top + R0 * .92], [0, top + R0]], 16, null, 0, (i, j) => j === 4 || j === 5 ? DARK : dome)
    flagF(q.cx, q.cy, top + R0, st)
    // On the lawn: an orrery of the planets my portfolio is made of, and a telescope on its tripod.
    orreryF(q.cx + 104, q.cy - 46); telescopeF(q.cx - 88, q.cy + 30)
  },
  // The Cure.fit internships: a gym hall in Cult.fit's red brick, a dumbbell on its ridge.
  gymhall(q, st) {
    const { x, y, w, h } = q, brick = mat(col3(64, .12, 22), 'brick', OVL.lit), tile = mat(col3(52, .14, 18), 'tile'), rise = (h - 16) * .42
    boxF(x + 6, y + 8, w - 12, h - 16, 0, 40, brick); gableF(x + 6, y + 8, w - 12, h - 16, 40, rise, tile, brick, 'x')
    const cx = x + w / 2, cy = y + h / 2, rz = 40 + rise
    decorF('rep', cx, cy, rz, 22, 30, () => { boxF(cx - 32, cy - 1.5, 64, 3, rz + 8, 3, DARK); for (const dx of [-28, 22]) boxF(cx + dx, cy - 9, 6, 18, rz, 19, DARK, DARK) }, { base: rz })
    // The yard where the interns trained: a pull-up bar, kettlebells, a rack of weights.
    pullupF(x + 14, y - 40, 34)
    for (const [dx, c] of [[70, 22], [90, 150], [110, 85]]) kettlebellF(x + dx, y - 36, col3(46, .1, c))
    rackF(x + 104, y - 82)
    // And by the door, a punching bag in Cult's red and black.
    bagF(x + w + 24, y + h - 26)
  },
  // The 4-hour sprint: a slim clock house, its clock the deadline.
  clockhouse(q, st) {
    const { x, y, w, h } = q, wall = mat(col3(93, .02, 85), 'plaster', OVL.lit), slate = mat(col3(56, .1, 162), 'slate'), ts = 46, tx = x + w - ts - 6, ty = y + 10
    boxF(x + 6, y + h - 56, w - 58, 48, 0, 30, wall); gableF(x + 6, y + h - 56, w - 58, 48, 30, 16, slate, wall, 'x')
    boxF(tx, ty, ts, ts, 0, 96, wall); boxF(tx - 3, ty - 3, ts + 6, ts + 6, 96, 24, mat(col3(93, .02, 85), 'plaster', OVL.clock))
    latheF(tx + ts / 2, ty + ts / 2, [[(ts + 12) / Math.SQRT2, 120], [0, 164]], 4, slate, Math.PI / 4)
    // Roofed in WhatsApp's green. Four hours on a giant hourglass, and a sign of chat bubbles on the lawn.
    hourglassF(x + w + 54, y + 40); chatSignF(x + w + 28, y + h + 4)
  },
  // Starting with Pibit: a striped market tent, like the bazaar where it began.
  tent(q) {
    latheF(q.cx, q.cy, [[q.r, 0], [q.r, 18], [0, 70]], 12, null, 0, (_, k) => k % 2 ? mat(col3(72, .15, 55)) : mat(CREAM))
    flagF(q.cx, q.cy, 68, STY.pibit)
    // A market day: bunting strung across the front, crates of goods, a merchant's handcart.
    buntingF(q.cx - 60, q.cx + 62, q.cy + 66, 44)
    for (const [dx, dy, s] of [[52, -6, 13], [64, 6, 11], [56, 18, 12], [70, -16, 10]]) crateF(q.cx + dx, q.cy + dy, s)
    handcartF(q.cx - 92, q.cy - 6)
    // Pibit was offers for local shops: a sign out front, chalked with a percent.
    offerSignF(q.cx + 86, q.cy + 52)
  },
  // How I work: a stone pillar on a plinth, crowned by what its principle means.
  pillar(q) {
    // Squat enough not to hide what stands behind; the crown carries the meaning, at full size.
    const x = q.cx, y = q.cy, S = mat(STONE, 'stone'), k = 1.75, H = 108, z = H + 8 * k
    boxF(x - 13 * k, y - 13 * k, 26 * k, 26 * k, 0, 8 * k, S, mat(STONE)); latheF(x, y, [[8 * k, 8 * k], [8 * k, H], [10 * k, H + 3 * k]], 10, S); boxF(x - 11 * k, y - 11 * k, 22 * k, 22 * k, H + 3 * k, 5 * k, S, mat(STONE))
    PILLAR_TOPS[q.kind]?.(x, y, z, k)
  },
  // The workshop: a timber shop, its front open under an awning, a bench of tools before it.
  workshop(q) {
    const { x, y, w, h } = q, wood = mat(WOOD, 'timber'), wall = mat(HOME.cream, 'timber', OVL.lit), tile = mat(HOME.terracotta, 'tile')
    const X = x + 10, Y = y + 10, BW = w - 20, BD = h - 50
    boxF(X, Y, BW, BD, 0, 42, wall); gableF(X, Y, BW, BD, 42, BD * .42, tile, wall, 'x')
    boxF(X + BW - 34, Y + 14, 13, 13, 42 + BD * .2, 46, mat(col3(58, .06, 38), 'brick'), DARK)
    face([X + BW - 4, Y + BD + 2], [X + 4, Y + BD + 2], 32, -22, -9, null, mat(col3(58, .14, 40), 'stripe'))
    // The bench: a hammer, a mallet, jars of paint, a stack of planks.
    const bx = x + 24, by = y + h - 30
    boxF(bx, by, 90, 16, 0, 16, wood, mat(col3(64, .06, 55), 'timber'))
    boxF(bx + 10, by + 6, 24, 3, 16, 3, DARK); boxF(bx + 30, by + 2, 6, 11, 16, 6, DARK)
    boxF(bx + 44, by + 5, 14, 6, 16, 5, mat(WOOD), mat(col3(60, .06, 55)))
    for (const [dx, c] of [[66, [60, .12, 27]], [75, [62, .1, 150]], [84, [70, .12, 85]]]) latheF(bx + dx, by + 8, [[3, 16], [3, 25], [0, 25]], 8, mat(col3(...c)))
    for (let k = 0; k < 4; k++) boxF(x + w - 70, y + h - 30 + k * .6, 52, 10, k * 3, 3, wood, wood)
    // A sawhorse, and a signboard on a post.
    for (const dx of [0, 30]) boxF(x + 130 + dx, y + h - 12, 4, 10, 0, 14, wood)
    boxF(x + 126, y + h - 10, 40, 6, 14, 3, wood, wood)
    latheF(x + w - 8, y + h - 8, [[1.6, 0], [1.6, 40]], 6, DARK); boxF(x + w - 28, y + h - 9, 20, 2, 26, 12, mat(HOME.cream, 'timber'), wood)
  },
  house(q, st) { blockF(q.x + 3, q.y + 3, q.w - 6, q.h - 6, st, 26 + (q.w * q.h % 13)) },
  well(q, st) { latheF(q.cx, q.cy, [[q.r, 0], [q.r, 10], [q.r * .6, 10]], 10, wallM(st)); latheF(q.cx, q.cy, [[q.r + 3, 26], [0, 36]], 8, roofM(st)) },
  hut(q, st) { boxF(q.x, q.y, q.w, q.h, 0, 22, mat(st.wall, 'timber', OVL.door)); gableF(q.x, q.y, q.w, q.h, 22, 16, roofM(st), mat(st.wall, 'timber')) },
}
// City walls as solid masonry: two faces and a walk on top, crenels on the outside.
function cityWallF(pts, th, st) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = (b[1] - a[1]) / L * th / 2, ny = -(b[0] - a[0]) / L * th / 2
    const o = [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]], n = [[a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny]]
    const fl = st.crenel ? CRENEL : st.palisade ? PALISADE : 0
    face(o[0], o[1], 0, 0, st.wallH + (fl ? 11 : 0), null, wallM(st, 0, fl)); face(n[1], n[0], 0, 0, st.wallH, null, wallM(st))
    face(o[1], o[0], st.wallH, th, 0, null, wallM(st))
  }
}
// The rest of each town is plain stone and slate, so what opens reads apart from what does not.
const plainSty = st => ({ ...st, wall: col3(91, .008, 80), roof: col3(77, .01, 72), roofP: 'slate' })

// ---------- Each town's own small things ----------
const WOOD = col3(56, .06, 55), STONE = col3(84, .015, 75), LAMP = col3(90, .11, 88)
const ballF = (x, y, r, c, z = 0) => latheF(x, y, [[r * .42, z], [r * .87, z + r * .5], [r, z + r], [r * .87, z + r * 1.5], [r * .42, z + r * 1.9], [0, z + r * 2]], 10, mat(c))
const benchF = (x, y, w) => { boxF(x, y, w, 7, 0, 6, mat(WOOD, 'timber'), mat(WOOD)); boxF(x, y + 6, w, 2, 6, 7, mat(WOOD, 'timber')) }
// A lamp on a post: Lumos lights it, and Nox puts it out (16-delight).
const lampF = (x, y, h = 34, glow = LAMP, z = 0) => decorF('lamp', x, y, z, h + 10, 6, () => { latheF(x, y, [[1.3, z], [1.3, z + h]], 6, DARK); latheF(x, y, [[3.6, z + h], [4.4, z + h + 6], [0, z + h + 10]], 8, mat(glow, 'glass')) }, { base: z })
// A slab turned by `ang`: its south face, the one toward the eye, in `front`; the rest in `side`.
function slabF(cx, cy, w, d, z0, h, ang, front, side, top) {
  const c = Math.cos(ang), s = Math.sin(ang), P = (u, v) => [cx + u * c - v * s, cy + u * s + v * c]
  const pts = [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)]
  pts.forEach((a, i) => face(a, pts[(i + 1) % 4], z0, 0, h, null, i === 2 ? front : side))
  face(pts[2], pts[3], z0 + h, d, 0, null, top)
}
// The isle's own palette: warm walls, terracotta and slate, pages, and lit windows.
const HOME = { cream: col3(94, .025, 84), terracotta: col3(58, .12, 38), slate: col3(46, .07, 255), page: col3(95, .02, 86) }
// An owl on watch for letters: body, head, ear tufts, bright eyes, looking out toward you.
function owlF(x, y, z, k = 1) {
  const brown = mat(col3(50, .06, 58)), dark = col3(50, .06, 58), Z = n => z + n * k
  latheF(x, y, [[4.6 * k, Z(0)], [7.2 * k, Z(5)], [6.6 * k, Z(11)], [4.6 * k, Z(15)]], 10, brown)
  ballF(x, y, 5.4 * k, dark, Z(13))
  for (const dx of [-3.3, 3.3]) { latheF(x + dx * k, y, [[1.7 * k, Z(22)], [0, Z(27)]], 5, brown); ballF(x + dx * .62 * k, y + 4.8 * k, 1.5 * k, col3(86, .15, 92), Z(18)) }
  latheF(x, y + 5.4 * k, [[1.1 * k, Z(17.5)], [0, Z(15.5)]], 4, mat(col3(70, .1, 70)))
}
// A game controller, larger than life, on a plinth. A bright shell so it reads against the grass,
// a pale d-pad, four coloured buttons and two dark sticks; it hops to a combo when hovered (16-delight).
function controllerF(x, y) {
  const shell = col3(58, .15, 255), body = mat(shell), top = mat(col3(64, .14, 255)), key = mat(col3(92, .01, 80)), stick = mat(col3(28, .02, 260))
  boxF(x - 42, y - 20, 84, 40, 0, 12, mat(STONE, 'stone'), mat(STONE))
  decorF('pad', x, y, 12, 18, 42, () => {
    boxF(x - 24, y - 10, 48, 18, 12, 12, body, top)
    for (const dx of [-28, 28]) latheF(x + dx, y + 4, [[12, 12], [12, 24], [0, 25]], 12, body)
    boxF(x - 34, y + 2, 14, 4, 25, 2, key); boxF(x - 29, y - 3, 4, 14, 25, 2, key)
    for (const [dx, dy, c] of [[28, -1, 150], [34, 4, 27], [28, 9, 85], [22, 4, 300]]) ballF(x + dx, y + dy, 2.6, col3(72, .17, c), 26)
    for (const dx of [-11, 11]) { latheF(x + dx, y + 2, [[2, 24], [2, 27]], 8, stick); latheF(x + dx, y + 2, [[4.2, 27], [4.2, 29], [0, 29.5]], 10, stick) }
  }, { base: 12 })
}
// A noodle stand: a counter, a striped awning, paper lanterns, stools.
function ramenF(x, y) {
  const wood = mat(WOOD, 'timber')
  boxF(x - 32, y - 12, 64, 24, 0, 20, wood, mat(col3(62, .06, 55)))
  for (const dx of [-30, 30]) latheF(x + dx, y + 11, [[1.5, 0], [1.5, 42]], 6, DARK)
  gableF(x - 36, y - 16, 72, 32, 40, 13, mat(col3(58, .16, 27), 'stripe'), wood, 'x')
  for (const dx of [-30, 0, 30]) ballF(x + dx, y + 18, 3.8, col3(64, .18, 30), 30)
  for (const dx of [-18, 0, 18]) { latheF(x + dx, y + 24, [[1.2, 0], [1.2, 10]], 5, DARK); latheF(x + dx, y + 24, [[4.5, 10], [4.5, 12], [0, 12]], 8, wood) }
}
// Weekends are for books (BATCH.hammock): a striped hammock between two posts, an open book left in
// it; hovered, its right-hand page turns over (16-pillars).
function hammockF(x0, y) {
  const W2 = 54, P = mat(WOOD, 'timber'), stripes = [mat(col3(70, .1, 38)), mat(CREAM)], n = 9, sag = 8, top = 17
  for (const dx of [0, W2]) { latheF(x0 + dx, y, [[1.6, 0], [1.6, 24]], 6, P); ballF(x0 + dx, y, 1.8, WOOD, 23) }
  const zAt = t => top - sag * Math.sin(Math.PI * t), sw = (W2 - 10) / n
  for (let i = 0; i < n; i++) { const t = (i + .5) / n; boxF(x0 + 5 + i * sw, y - 6, sw + .3, 12, zAt(t), 1.2, stripes[i % 2], stripes[i % 2]) }
  for (const [a, b] of [[0, 5], [W2 - 5, W2]]) boxF(x0 + a, y - .4, b - a, .8, top + 2, .8, DARK, DARK)
  // The book, open at the lowest point of the cloth.
  const bx = x0 + W2 / 2, bz = top - sag + 1.3, page = mat(HOME.page), cover = mat(col3(42, .1, 258))
  boxF(bx - 8.6, y - 5.6, 17.2, 11.2, bz, .7, cover, cover)
  boxF(bx - 8, y - 5, 7.8, 10, bz + .7, .9, page, page)
  trickF('page', bx, y, bz + .7, 3, 8, { kind: 9, axis: [0, 1, 0], amount: -2.9 }, () => boxF(bx + .2, y - 5, 7.8, 10, bz + .7, .9, page, page))
}
// A cherry tree in blossom beside the noodle stand (BATCH.cherryTree); hovered, it rustles and lets
// a few petals fall.
function cherryF(x, y) {
  latheF(x, y, [[2.6, 0], [2.2, 20]], 6, mat(TRUNK))
  const pink = col3(86, .07, 350), pink2 = col3(80, .09, 355)
  trickF('blossom', x, y, 18, 30, 16, { kind: 7, axis: [1, 0, 0], amount: .08, fx: 'petals' }, () => {
    ballF(x, y, 11, pink, 17); ballF(x - 8, y + 2, 7, pink2, 16); ballF(x + 8, y - 2, 8, pink, 17); ballF(x + 2, y + 4, 6, pink2, 25)
  })
}
// People matter most (BATCH.wavers): two friends on a bench by the table, who wave when you come by.
function wavingBenchF(x, y) {
  const K = 1.7, skin = col3(78, .06, 55)
  benchF(x - 30, y, 60)
  ;[[-14, col3(58, .12, 38), -1], [14, col3(50, .08, 255), 1]].forEach(([dx, shirt, side]) => {
    const fx = x + dx, fy = y + 3.5, m = mat(shirt)
    latheF(fx, fy, [[3.4 * K, 6], [3.2 * K, 6 + 5 * K], [2.4 * K, 6 + 8.6 * K], [1.1 * K, 6 + 9.4 * K]], 10, m)
    ballF(fx, fy, 2.5 * K, skin, 6 + 9 * K)
    // The arm on the outer side, raised to wave: it swings about the shoulder.
    const ax = fx + side * 3.2 * K, az = 6 + 7.4 * K
    trickF('waver', ax, fy, az, 7 * K, 3 * K, { kind: 4, axis: [0, 1, 0], amount: .5 * side }, () => { boxF(ax - .8 * K, fy - .8 * K, 1.6 * K, 1.6 * K, az, 5.6 * K, m, m); ballF(ax, fy, 1.1 * K, skin, az + 5.4 * K) })
  })
}
// A round table with chairs for six, and lights strung between four poles.
function tableF(x, y) {
  latheF(x, y, [[3.4, 0], [3.4, 14]], 8, mat(WOOD)); latheF(x, y, [[24, 14], [24, 17], [0, 17]], 18, mat(col3(62, .07, 55), 'timber'))
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + .3, cx = x + Math.cos(a) * 34, cy = y + Math.sin(a) * 34; boxF(cx - 5.5, cy - 5.5, 11, 11, 0, 10, mat(WOOD), mat(col3(60, .07, 55))) }
  const P = [[-48, -42], [48, -42], [48, 42], [-48, 42]]
  for (const [dx, dy] of P) latheF(x + dx, y + dy, [[1.2, 0], [1.2, 40]], 6, DARK)
  for (const [i, j] of [[0, 2], [1, 3]]) for (let k = 1; k < 9; k++) { const t = k / 9; ballF(x + lerp(P[i][0], P[j][0], t), y + lerp(P[i][1], P[j][1], t), 1.9, LAMP, 36 - Math.sin(Math.PI * t) * 7) }
}
// For the field notes. Brass and glass for the stars; iron for the gym; sand for the sprint.
const BRASS = col3(74, .11, 85)
function orreryF(x, y) {
  decorF('spin', x, y, 0, 38, 30, () => {
    const brass = mat(BRASS)
    latheF(x, y, [[11, 0], [11, 4], [4, 4], [2.4, 24]], 10, brass)
    ballF(x, y, 6.5, col3(84, .16, 80), 22)
    latheF(x, y, [[30, 30], [28.6, 30]], 24, brass); latheF(x, y, [[19, 37], [17.8, 37]], 20, brass)
    latheF(x, y, [[1.2, 24], [1.2, 38]], 6, brass)
    for (const [a, r, z, s, c] of [[.6, 29.3, 27, 3.6, [56, .12, 250]], [2.6, 29.3, 27, 2.8, [62, .14, 30]], [4.2, 18.4, 34, 2.6, [66, .12, 150]], [1.7, 18.4, 34, 2.2, [70, .04, 60]]])
      ballF(x + Math.cos(a) * r, y + Math.sin(a) * r, s, col3(...c), z)
  })
}
// A telescope on its tripod; its tube turns up to the sky about the tripod's head (16-delight).
function telescopeF(x, y) {
  for (const [dx, dy] of [[-9, 6], [9, 6], [0, -9]]) boxF(x + dx - 1, y + dy - 1, 2, 2, 0, 28, DARK)
  decorF('scope', x, y, 30, 36, 18, () => { boxF(x - 20, y - 3, 34, 6, 28, 6, mat(BRASS), mat(BRASS)); boxF(x + 14, y - 4, 4, 8, 27, 8, DARK, DARK); boxF(x - 24, y - 1.5, 4, 3, 29.5, 3, DARK) })
}
function kettlebellF(x, y, c) { ballF(x, y, 5.5, c, 0); for (const dx of [-3.5, 2]) boxF(x + dx, y - 1, 1.5, 2, 9, 6, mat(c)); boxF(x - 3.5, y - 1, 7, 2, 14, 1.6, mat(c)) }
function rackF(x, y) {
  boxF(x, y, 44, 10, 0, 18, mat(WOOD, 'timber'), mat(WOOD))
  for (let k = 0; k < 4; k++) { const px = x + 6 + k * 11; for (const dy of [2, 8]) latheF(px, y + dy, [[3.4, 18], [3.4, 24], [0, 24]], 8, DARK) }
}
function hourglassF(x, y) {
  decorF('flip', x, y, 30, 60, 17, () => {
    const wood = mat(WOOD, 'timber'), glass = mat(col3(88, .03, 220), 'glass'), sand = mat(col3(80, .1, 80))
    latheF(x, y, [[16, 0], [16, 4], [0, 4]], 12, wood); latheF(x, y, [[16, 56], [16, 60], [0, 60]], 12, wood)
    for (const a of [.4, 2.5, 4.6]) boxF(x + Math.cos(a) * 14 - 1.5, y + Math.sin(a) * 14 - 1.5, 3, 3, 4, 52, wood)
    latheF(x, y, [[12, 4], [2, 30], [12, 56]], 14, glass)
    latheF(x, y, [[9, 4], [0, 16]], 12, sand); latheF(x, y, [[5, 40], [2.4, 34]], 10, sand)
  })
}
// A glyph in blocks, standing upright and facing the road: rows run top to bottom, X is a block.
// A run repeated in the rows below it is one block, so a glyph stands as a few solid pieces, not a stack of slats.
function blocksF(cx, y, z, rows, s, m, d = s) {
  const x0 = cx - rows[0].length * s / 2, n = rows.length, runs = rows.map(r => [...r.matchAll(/X+/g)].map(q => q.index + ':' + q[0].length))
  runs.forEach((row, i) => row.forEach(k => {
    if (i && runs[i - 1].includes(k)) return
    let j = i; while (j + 1 < n && runs[j + 1].includes(k)) j++
    const [a, len] = k.split(':').map(Number)
    boxF(x0 + a * s, y - d / 2, len * s, d, z + (n - 1 - j) * s, (j - i + 1) * s, m, m)
  }))
}
// The sprint was a WhatsApp feature: a sign of two chat bubbles in blocks, like the percent on
// Pibit's sign. Someone typing in white; the poll I sent in green, its two options in white.
function chatSignF(x, y) {
  const s = 3.4, W = mat(col3(98, .005, 90)), G = mat(col3(72, .15, 150)), D = mat(col3(52, .12, 155)), wx = x - 6, gx = x + 10, gy = y + 5
  boxF(wx - 1.5, y - 1.5, 3, 3, 0, 40, DARK)
  blocksF(wx, y, 40, ['.XXXXXXX.', 'XXXXXXXXX', 'XXXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '.XX......'], s, W, 3)
  blocksF(wx, y + 2, 40, ['.........', '.........', '..X.X.X..', '.........', '.........', '.........'], s, D, 1.2)
  blocksF(gx, gy, 24, ['.XXXXXX.', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '......XX'], s, G, 3)
  const x0 = gx - 4 * s
  for (const [i, w] of [[1, 5], [2, 3]]) boxF(x0 + s, gy + 1.5, w * s, 1.2, 24 + (4 - i) * s + s * .3, s * .45, W, W)
}
// A shop's sign on two legs, chalked with a percent in Pibit's orange.
function offerSignF(x, y) {
  for (const dx of [-12, 12]) boxF(x + dx - 1.2, y - 1.2, 2.4, 2.4, 0, 40, DARK)
  boxF(x - 15, y - 1.5, 30, 3, 13, 27, mat(CREAM), mat(CREAM))
  blocksF(x, y + 2.2, 17.5, ['XX..X', 'XX.X.', '..X..', '.X.XX', 'X..XX'], 3.6, mat(col3(66, .16, 52)), 1.4)
}
// A punching bag hung from a frame.
function bagF(x, y) {
  for (const dx of [-14, 14]) latheF(x + dx, y, [[1.4, 0], [1.4, 54]], 6, DARK)
  boxF(x - 15, y - 1, 30, 2, 52, 2, DARK)
  decorF('swing', x, y, 52, 52, 9, () => { boxF(x - .5, y - .5, 1, 1, 41, 11, DARK); latheF(x, y, [[6, 14], [6.8, 17], [6.8, 37], [6, 40], [0, 41]], 10, null, 0, i => i === 0 || i === 3 ? DARK : mat(col3(52, .16, 22))) })
}
// The stuff of a building site: bare earth, white stone for Hinge's walls, the tops of its courses.
const BUILT = { dirt: mat(col3(76, .05, 68)), stone: mat(col3(95, .014, 160), 'stone'), top: mat(col3(88, .02, 160)) }
// A timber crane: a lattice mast at (cx, cy), its jib reaching `west` one way and `east` the other at
// height H, a counterweight on the short arm, and a stone hung from the hook at hx, its foot at hz.
function craneF(cx, cy, H, west, east, hx, hz) {
  const wood = mat(WOOD, 'timber')
  for (const dx of [-3, 3]) boxF(cx + dx - 1.5, cy - 1.5, 3, 3, 0, H, wood, wood)
  for (let z = 10; z < H; z += 12) boxF(cx - 3, cy - 1, 6, 2, z, 1.6, wood, wood)
  boxF(cx - west, cy - 2, west + east, 4, H, 4, wood, wood); boxF(cx + east - 14, cy - 5, 14, 10, H - 9, 9, DARK, DARK)
  boxF(hx - .4, cy - .4, .8, .8, hz + 12, H - hz - 12, DARK); boxF(hx - 7, cy - 6, 14, 12, hz, 12, BUILT.stone, BUILT.top)
}
// Stones stacked ready on the ground.
function pileF(px, py) { for (const [dx, dy, z] of [[-9, 0, 0], [0, 1, 0], [9, -1, 0], [-4, 0, 7], [5, 0, 7], [0, 0, 14]]) boxF(px - 4 + dx, py - 3 + dy, 8, 6, z, 7, BUILT.stone, BUILT.top) }
// A wizard at scale k: a robe drawn in at the belt and broad at the shoulders, a face between a
// white beard and the brim of a pointed hat, one arm out to a staff taller than he is, the other
// raised to cast. dir is the side the staff is on (1 east, -1 west); its orb is 25.5k up, 5.6k out.
const WIZ_ORB = [5.6, 25.5]
function wizardF(x, y, c, k = 1, room = null, dir = 1, rooms = null) {
  const robe = mat(c), skin = col3(82, .06, 58), beard = mat(col3(96, .006, 90)), K = v => v * k, X = dx => x + dir * K(dx)
  // A box d units out on the facing side, w wide, starts at its inner edge whichever side that is.
  const side = (dx, w) => dir > 0 ? X(dx) : X(dx) - K(w)
  decorF('wizard', x, y, 0, K(25.5), K(5), () => {
    latheF(x, y, [[K(4), 0], [K(3.4), K(6)], [K(3), K(8.5)], [K(3.8), K(11.6)], [K(3.5), K(13)], [K(1.3), K(13.4)]], 10, robe)
    latheF(x, y, [[K(3.15), K(8)], [K(3.15), K(9.1)]], 10, mat(col3(64, .1, 80)))
    ballF(x, y, K(2.4), skin, K(13.2))
    latheF(x, y + K(1.4), [[K(1.9), K(14.6)], [0, K(10.2)]], 6, beard)
    latheF(x, y, [[K(4.4), K(17.6)], [K(4.4), K(18.2)], [K(2.3), K(18.2)], [0, K(25.5)]], 10, robe)
    boxF(side(3.2, 2.6), y - K(.7), K(2.6), K(1.4), K(11), K(1.6), robe, robe); ballF(X(5.6), y, K(1), skin, K(10.9))
    boxF(side(-3.2, 1.4) - (dir > 0 ? K(1.4) : -K(1.4)), y - K(.7), K(1.4), K(1.4), K(11), K(5.4), robe, robe); ballF(X(-3.9), y, K(1), skin, K(16))
    boxF(side(5.2, .8), y - K(.4), K(.8), K(.8), 0, K(24.2), mat(WOOD, 'timber')); ballF(X(WIZ_ORB[0]), y, K(1.3), col3(88, .12, 92), K(24.2))
  }, { k, dir, ...(room && { room }), ...(rooms && { rooms }) })
}
// A banner hung on a wall, in the realm's colour.
function bannerF(x, y, c) {
  boxF(x - 9, y, 18, 1.2, 50, 1.6, DARK, DARK)
  boxF(x - 7, y, 14, 1.2, 18, 32, mat(c), mat(c)); face([x + 7, y + 1.2], [x - 7, y + 1.2], 18, 0, -7, 0, mat(c))
}
// A signpost: which way next. The best way is painted in green.
function signpostF(x, y) {
  boxF(x - 1.6, y - 1.6, 3.2, 3.2, 0, 56, mat(WOOD, 'timber'), mat(WOOD)); ballF(x, y, 2.4, BRASS, 56)
  for (const [z, dir, c] of [[44, 1, col3(56, .1, 168)], [34, -1, CREAM], [24, 1, CREAM]]) {
    const x0 = dir > 0 ? x + 1.6 : x - 27.6
    boxF(x0, y - 1.5, 26, 3, z, 7, mat(c), mat(c)); boxF(dir > 0 ? x0 + 26 : x0 - 4, y - 1.5, 4, 3, z + 1.5, 4, mat(c), mat(c))
  }
}
// A video visit on a screen: the care team's tile, the member's, and the red dot of a recording.
function screenF(x, y) {
  for (const dx of [-16, 16]) boxF(x + dx - 1.2, y - 1.2, 2.4, 2.4, 0, 20, DARK)
  boxF(x - 24, y - 2, 48, 4, 18, 32, DARK, DARK)
  const F = y + 2
  face([x + 21, F + .2], [x - 21, F + .2], 21, 0, 26, null, mat(col3(88, .02, 80)))
  boxF(x - 19, F, 26, 1, 23, 22, mat(col3(68, .08, 175)), mat(col3(68, .08, 175)))
  boxF(x + 9, F, 10, 1, 23, 11, mat(col3(78, .07, 60)), mat(col3(78, .07, 60)))
  ballF(x + 15, F + 1, 1.8, col3(58, .19, 27), 41)
}
function buntingF(x0, x1, y, z) {
  for (const x of [x0, x1]) latheF(x, y, [[1.4, 0], [1.4, z + 4]], 6, DARK)
  boxF(x0, y - .6, x1 - x0, 1.2, z, 1.2, DARK)
  const n = 7, w = (x1 - x0) / n
  for (let i = 0; i < n; i++) face([x0 + i * w + w - 2, y], [x0 + i * w + 2, y], z, 0, -11, 0, mat(i % 2 ? CREAM : col3(66, .16, 52)))
}
function handcartF(x, y) {
  boxF(x - 16, y - 10, 32, 20, 8, 10, mat(WOOD, 'timber'), mat(col3(72, .15, 55)))
  for (const dy of [-12, 12]) latheF(x - 4, y + dy, [[7, 0], [7, 2], [0, 2]], 10, DARK)
  boxF(x + 16, y - 6, 22, 2, 14, 2, mat(WOOD)); boxF(x + 16, y + 4, 22, 2, 14, 2, mat(WOOD))
}
// A bed of flowers.
// A young palm: a slim trunk, and fronds fanned out at the top.
function palmF(x, y) {
  latheF(x, y, [[1.6, 0], [1.2, 26]], 6, mat(TRUNK))
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, ex = x + Math.cos(a) * 11, ey = y + Math.sin(a) * 11; face([x, y], [ex, ey], 26, 0, -5, 0, mat(GREEN)); face([ex, ey], [x, y], 26, 0, -5, 0, mat(GREEN2)) }
  ballF(x, y, 2.6, GREEN, 24.5)
}
function flowersF(x, y) { const r = rng(x * 3 + y); for (let k = 0; k < 4; k++) ballF(x + (r() - .5) * 24, y + (r() - .5) * 16, 4.4 + r() * 1.4, col3(78, .13, [350, 88, 300, 30][k])) }
const umbrellaF = (x, y, r, a, b) => { latheF(x, y, [[1.1, 0], [1.1, 22]], 6, DARK); latheF(x, y, [[r, 19], [0, 27]], 10, null, 0, (_, j) => mat(j % 2 ? a : b)) }
const crateF = (x, y, s) => boxF(x, y, s, s, 0, s, mat(col3(70, .07, 66), 'timber'), mat(col3(74, .06, 66), 'timber'))
// GoFood's riders: a scooter with the green box on its back.
function scooterF(x, y, c) {
  decorF('scooter', x + 11, y + 7.5, 0, 20, 12, () => {
    boxF(x, y + 1, 6, 5, 0, 6, DARK); boxF(x + 17, y + 1, 6, 5, 0, 6, DARK)
    boxF(x, y, 22, 7, 4, 6, mat(c)); boxF(x + 5, y + 1, 9, 5, 10, 2, DARK); boxF(x + 19, y + 2, 2, 3, 10, 9, DARK)
    boxF(x + 1, y - .5, 9, 8, 12, 8, mat(col3(60, .15, 146)), mat(col3(66, .14, 146)))
  })
}
// A shopping cart: a wire basket on legs and wheels, its handle raised at the back.
function cartF(x, y, s, c, z = 0) {
  const L = 40 * s, D = 26 * s, z0 = z + 12 * s, hb = 18 * s, wire = mat(c, 'glass'), frame = mat(col3(34, .03, 40))
  wallsF(rectPts(x, y, L, D), z0, hb, wire); flatF(x, y, L, D, z0, wire)
  for (const [dx, dy] of [[3, 3], [35, 3], [3, 21], [35, 21]]) { boxF(x + dx * s, y + dy * s, 2 * s, 2 * s, z + 4 * s, 8 * s, frame); ballF(x + (dx + 1) * s, y + (dy + 1) * s, 2.4 * s, col3(30, .02, 40), z) }
  for (const dy of [3, 21]) boxF(x - 6 * s, y + dy * s, 2 * s, 2 * s, z0 + hb - 6 * s, 12 * s, frame)
  boxF(x - 7 * s, y + 2 * s, 3 * s, D - 4 * s, z0 + hb + 5 * s, 3 * s, mat(col3(58, .18, 12)), mat(col3(62, .17, 12)))
}
const dumbbellF = (x, y) => { boxF(x, y - 1, 14, 2, 2.5, 2, DARK); for (const dx of [0, 14]) latheF(x + dx, y, [[3.8, 0], [3.8, 7], [0, 7]], 8, DARK) }
const matF = (x, y, w, h, c) => flatF(x, y, w, h, .8, mat(c, 'none', 0, 0))
function pullupF(x, y, w) { for (const dx of [0, w]) latheF(x + dx, y, [[1.4, 0], [1.4, 34]], 6, DARK); boxF(x, y - 1, w, 2, 32, 2, DARK) }
function statueF(x, y) { boxF(x - 9, y - 9, 18, 18, 0, 14, mat(STONE, 'stone'), mat(STONE)); latheF(x, y, [[4.5, 14], [5.5, 26], [3, 33], [0, 34]], 8, mat(col3(62, .03, 150))); ballF(x, y, 3.2, col3(62, .03, 150), 33) }
function archF(x, y, w) { for (const dx of [0, w - 12]) boxF(x + dx, y, 12, 12, 0, 46, mat(STONE, 'stone'), mat(STONE)); boxF(x, y, w, 12, 46, 10, mat(STONE, 'stone'), mat(STONE)) }
// A garden boundary for the clinic: clipped hedges, and topiary at the corners.
function topiaryF(x, y, r) { boxF(x - r * .55, y - r * .55, r * 1.1, r * 1.1, 0, 9, mat(STONE, 'stone'), mat(STONE)); ballF(x, y, r * .6, GREEN, 9); if (r > 20) ballF(x, y, r * .34, GREEN2, 9 + r * 1.1) }
const PROPS = {
  hinge(ox, oy) {
    // Exercise mats in the cloister garden, balls and benches on the green: care that moves.
    for (const [x, y, c] of [[100, 96, 168], [100, 186, 30], [262, 96, 30], [262, 186, 168]]) matF(ox + x - 15, oy + y - 7, 30, 14, col3(72, .1, c))
    for (const [x, y, r, c] of [[402, 286, 8, 168], [432, 316, 6.5, 30], [468, 284, 7.5, 168], [452, 336, 5.5, 30]]) ballF(ox + x, oy + y, r, col3(70, .11, c))
    benchF(ox + 382, oy + 258, 30)
    // The wizard raising the half-built buildings, and his pile of stone: built apart from the buildings,
    // so he answers the pointer on his own (16-delight).
    if (WIP_SITE) for (const C of WIP_CASTERS()) { pileF(...C.pile); wizardF(...C.at, col3(58, .17, 295), C.k, null, C.dir, C.rooms) }
    // By the AI rotunda, a signpost to the next best action; by the video tower, a visit on screen.
    signpostF(ox + 486, oy + 470); screenF(ox + 520, oy + 204)
    for (let x = 80; x < 700; x += 92) { lampF(ox + x, oy + 512); if (x < 640) benchF(ox + x + 22, oy + 506, 26) }
  },
  gojek(ox, oy) {
    // Riders parked in the market square; food stalls under umbrellas; lanterns for the night market.
    // In the wider square (BATCH.onePromo) the riders park in two longer rows, clear of the fountain.
    if (BATCH.onePromo) {
      for (const x of [62, 104, 146, 188, 354, 396, 438, 480]) scooterF(ox + x, oy + 232, x % 4 ? col3(94, .01, 90) : col3(62, .15, 146))
      for (const x of [84, 140, 196, 346, 402, 458]) scooterF(ox + x, oy + 284, col3(62, .15, 146))
    } else {
      for (const x of [48, 76, 104, 206, 234, 262]) scooterF(ox + x, oy + 226, x % 3 ? col3(94, .01, 90) : col3(62, .15, 146))
      for (const x of [58, 104, 236, 270]) scooterF(ox + x, oy + 274, col3(62, .15, 146))
    }
    for (const [x, c] of [[70, 27], [150, 146], [230, 27]]) umbrellaF(ox + x, oy + 130, 13, col3(60, .17, c), col3(96, .01, 90))
    for (let x = 40; x < 520; x += 58) lampF(ox + x, oy + 380, 26, col3(62, .17, 27))
  },
  cult(ox, oy) {
    // A gym yard between the guild and the arcade; mats and weights on the arena's field.
    pullupF(ox + 50, oy + 212, 36); pullupF(ox + 116, oy + 212, 36)
    for (const x of [190, 226, 262]) dumbbellF(ox + x, oy + 214)
    for (const [x, y] of [[410, 156], [446, 156], [410, 192], [446, 192]]) matF(ox + x, oy + y, 22, 12, col3(66, .13, 12))
    dumbbellF(ox + 424, oy + 226); dumbbellF(ox + 452, oy + 140)
  },
  intern(ox, oy) {
    // The yard in front of the two studios: mats and weights, a punching bag by the water.
    ;[12, 85, 230].forEach((c, i) => matF(ox + 38 + i * 34, oy + 88, 26, 13, col3(66, .13, c)))
    dumbbellF(ox + 46, oy + 112); kettlebellF(ox + 118, oy + 114, col3(46, .1, 22)); bagF(ox + 85, oy + 34)
  },
  iit(ox, oy) {
    // A campus: lamps along the path between the main building's two halves, a statue, a bench.
    for (const y of [20, 90, 160]) lampF(ox + 162, oy + y, 30)
    // And its garden, as in front of the real one: lawns either side of the path, flower beds along
    // the front, clipped shrubs, and young palms at the corners.
    const lawn = mat(col3(76, .11, 138), 'grass')
    flatF(ox - 16, oy + 134, 172, 74, .5, lawn); flatF(ox + 196, oy + 134, 146, 74, .5, lawn)
    for (const x of [-4, 40, 108, 214, 262, 312]) flowersF(ox + x, oy + 138)
    for (const x of [20, 74, 128, 238, 290]) ballF(ox + x, oy + 202, 4.6, GREEN2, .5)
    for (const [x, y] of [[-8, 196], [150, 196], [204, 196], [334, 196]]) palmF(ox + x, oy + y)
    statueF(ox + 75, oy + 182); benchF(ox + 252, oy + 170, 30)
  },

  writing(ox, oy) {
    // The path across the island, lit; benches to read on.
    for (let y = oy + 60; y < oy + 630; y += 95) lampF(pathAtY(y)[0] + 26, y, 28)
    benchF(ox + 320, oy + 478, 30); benchF(ox + 212, oy + 350, 30)
  },
  home(ox, oy) {
    // The path lit all the way to the light; an orchard and flowers between the houses.
    // With the bigger yard (BATCH.biggerYard) the lamps stand on the far side of the path, following it.
    for (let y = 160; y < 1300; y += 170) lampF(BATCH.biggerYard ? pathAtY(oy + y)[0] + 26 : ox + 470, oy + y, 30)
    for (const [x, y] of [[300, 900], [350, 940], [300, 990], [370, 1010], [330, 1060], [290, 1210], [350, 1250], [400, 1180], [60, 1030], [140, 1050]]) fellTreeF(ox + x, oy + y, 11)
    for (const [x, y] of [[240, 1100], [60, 1110], [230, 1030], [690, 1150], [680, 940]]) flowersF(ox + x, oy + y)
    benchF(ox + 226, oy + 1060, 30)
  },
}
function buildFaces() {
  for (const R0 of REALMS) {
    const st = STY[R0.key], plain = plainSty(st), PL = PLANS[R0.key], ri = REALM_IDX[R0.key], ctr = [R0.ox + R0.w / 2, R0.oy + R0.h / 2], f0 = FACES.length, d0 = DECOR.length
    // Hinge's campus is a garden behind hedges, not a fortress.
    const clinic = R0.key === 'hinge', edge = clinic ? { ...plain, wall: GREEN2, wallP: 'leaf', wallH: 22, crenel: false } : plain
    R = rng(R0.ox * 3 + R0.oy)
    BX = { realm: ri, room: 0, ctr, kind: null }
    for (const wl of PL.walls) cityWallF(wl.map(([x, y]) => [x + R0.ox, y + R0.oy]), clinic ? 14 : PL.th, edge)
    for (const [x, y, r] of PL.towers) { BX.ctr = [x + R0.ox, y + R0.oy]; clinic ? topiaryF(x + R0.ox, y + R0.oy, r) : towerF(x + R0.ox, y + R0.oy, r, plain, false) }
    for (const q of PARTS.filter(p => p.realm === R0.key)) {
      BX = { realm: ri, room: q.room ? ROOM_IDS.push(q.room) - 1 : 0, ctr: q.c, kind: null }
      BUILD[q.t](q, q.room ? st : plain)
    }
    BX = { realm: ri, room: 0, ctr, kind: null }
    PROPS[R0.key]?.(R0.ox, R0.oy)
    const b = R0.box
    const bb = R0.key === 'home' ? GEO.isleBox : b
    // The trees nearest each city grow with it, in the round; the rest stand up as cut-outs.
    // Every tree that stands in the round can be cut down (16-delight).
    TREES.filter(([x, y, , single]) => single && x > bb.x0 - 110 && x < bb.x1 + 110 && y > bb.y0 - 110 && y < bb.y1 + 80).slice(0, 60).forEach(t => {
      t.lathe = true; BX.ctr = [t[0], t[1]]; fellTreeF(t[0], t[1], t[2] * 1.1)
    })
    // How I work's share of the isle: each thing by where it stands (the isle's own pieces, by
    // where the face is), kept together after About me's in the buffer.
    if (R0.key === 'home' && BATCH.workBuild) {
      const W = REALM_IDX.work, mine = FACES.splice(f0)
      for (const F of mine) if ((F.ctr === ctr ? F.a[1] : F.ctr[1]) > WORK_Y) F.realm = W
      for (const F of mine) if (F.realm !== W) FACES.push(F)
      for (const F of mine) if (F.realm === W) FACES.push(F)
      for (const D of DECOR.slice(d0)) if (D.y > WORK_Y) D.realm = W
    }
  }
  for (const S of STOPS) {
    const q = ROOMS[S.id].part
    BX = { realm: REALM_IDX.earlier, room: ROOM_IDS.push(S.id) - 1, ctr: q.c, kind: null }
    BUILD[q.t](q, STY.earlier)
  }
}

// ---------- Pieces: each face cut into stones (walls) or tiles (roofs) ----------
const PIECE_SIZE = { [PAT.stone]: [24, 12], [PAT.brick]: [32, 12], [PAT.plaster]: [28, 14], [PAT.timber]: [12, 40], [PAT.glass]: [28, 28], [PAT.tiers]: [26, 14], [PAT.grass]: [30, 30] }
const FLOATS = 40
function buildPieces() {
  const out = []
  for (const F of FACES) {
    const { a, dx, dy, z0, run, rise, L, S, topL, m } = F
    // Frame: U along the bottom edge, V down the face from its top edge, N outward.
    const nin = [-dy, dx], U = [dx, dy, 0], V = [(-nin[0] * run) / S, (-nin[1] * run) / S, -rise / S]
    const O = [a[0] + nin[0] * run, a[1] + nin[1] * run, z0 + rise]
    const N = [V[1] * U[2] - V[2] * U[1], V[2] * U[0] - V[0] * U[2], V[0] * U[1] - V[1] * U[0]]
    const l0 = (L - topL) / 2
    let [pw, ph] = F.kind === 2 ? [L + 1, S + 1] : F.kind === 1 ? (rise === 0 ? [34, 34] : [26, 13]) : (PIECE_SIZE[m.p] || [26, 14])
    if (L < pw * 1.4) pw = L + .01
    const rows = Math.max(1, Math.round(S / ph)); ph = S / rows
    for (let r = 0; r < rows; r++) {
      const v0 = r * ph, v1 = v0 + ph, lb = l0 * (1 - v1 / S), off = F.kind === 0 && r % 2 ? -pw / 2 : 0
      for (let u0 = off; u0 < L; u0 += pw) {
        const u1 = Math.min(L, u0 + pw), uu0 = Math.max(0, u0)
        if (u1 < lb - .01 || uu0 > L - lb + .01 || u1 - uu0 < .5) continue
        const rnd = R()
        out.push(O[0], O[1], O[2], U[0], U[1], U[2], V[0], V[1], V[2], N[0], N[1], N[2],
          uu0, v0, u1, v1, L, S, l0, F.gid, m.c[0], m.c[1], m.c[2], rnd,
          m.p, m.o, m.fl, F.room, F.kind, F.realm, F.ctr[0], F.ctr[1],
          F.kind === 0 ? 1.5 + rnd * 2.5 : F.kind === 1 ? 2 + rnd * 3 : 0, F.kind === 0 ? 18 + rnd * 26 : 0, F.kind === 1 ? .25 : F.kind === 2 ? .5 : 0, 0,
          F.decor, ...(F.decor ? [DECOR[F.decor].x, DECOR[F.decor].y, DECOR[F.decor].z] : [0, 0, 0]))
      }
    }
  }
  // Number each room's pieces from its rooftop down and left to right: that is the order they
  // take their places in the page when the building becomes a case study.
  const byRoom = {}
  for (let i = 0; i < out.length; i += FLOATS) {
    const room = out[i + 27]; if (!room) continue
    const uc = (out[i + 12] + out[i + 14]) / 2, vc = (out[i + 13] + out[i + 15]) / 2
    const cx = out[i] + out[i + 3] * uc + out[i + 6] * vc, cz = out[i + 2] + out[i + 5] * uc + out[i + 8] * vc
    ;(byRoom[room] ||= []).push([i, cz, cx])
  }
  for (const [room, list] of Object.entries(byRoom)) {
    list.sort((p, q) => (q[1] - p[1]) || (p[2] - q[2])).forEach(([i], k) => { out[i + 35] = k })
    ROOM_N[room] = list.length
  }
  return new Float32Array(out)
}
const ROOM_N = {}

// ---------- Shaders ----------
const VS_PIECE = `#version 300 es
precision highp float;
layout(location=0) in vec2 aC;
layout(location=1) in vec4 a1; layout(location=2) in vec4 a2; layout(location=3) in vec4 a3;
layout(location=4) in vec4 a4; layout(location=5) in vec4 a5; layout(location=6) in vec4 a6;
layout(location=7) in vec4 a7; layout(location=8) in vec4 a8; layout(location=9) in vec4 a9; layout(location=10) in vec4 a10;
uniform mat4 uVP; uniform float uRise, uTime, uK1, uK2, uGather, uGRoom, uIsShadow, uHover, uLift; uniform vec4 uSheet; uniform vec2 uGrid;
uniform float uStart[9]; uniform vec2 uFocus[9]; uniform vec4 uDec[6]; uniform vec4 uDecA[6];
out vec2 vUV; out vec2 vPc; out vec3 vW; out float vP; out float vG; flat out float vDec;
flat out vec4 vFace; flat out vec4 vCol; flat out vec4 vMat; flat out vec3 vN; flat out vec2 vPs;
const float DUR = .9;
vec3 rot(vec3 v, vec3 k, float a) { float c = cos(a), s = sin(a); return v * c + cross(k, v) * s + k * dot(k, v) * (1. - c); }
void main() {
  vec3 O = a1.xyz, U = vec3(a1.w, a2.xy), V = vec3(a2.zw, a3.x), N = a3.yzw;
  vec2 uv = mix(a4.xy, a4.zw, aC), uvc = (a4.xy + a4.zw) * .5;
  vec3 P = O + U * uv.x + V * uv.y, C = O + U * uvc.x + V * uvc.y;
  int realm = int(a8.y + .5); float kind = a8.x, rnd = a6.w;
  float delay = distance(C.xy, uFocus[realm]) * uK1 + C.z * uK2 + a9.z + rnd * .16;
  float p = clamp((uTime - uStart[realm] - delay) / DUR, 0., 1.);
  vP = p;
  if (p <= 0.) { gl_Position = vec4(2., 2., 2., 1.); return; }
  float e = 1. - pow(1. - p, 3.);
  vec3 q = rot(P - C, normalize(vec3(sin(rnd * 91.), cos(rnd * 53.), .5)), (1. - e) * a9.x);
  vec3 pos;
  if (kind < .5) {
    // Stones lift off the ink and spiral in to their course.
    vec2 rel = C.xy - a8.zw; float th = (1. - e) * (rnd - .5) * 2.2, k = mix(1.18 + rnd * .3, 1., e);
    q *= mix(.25, 1., smoothstep(0., .6, p));
    vec2 r2 = mat2(cos(th), sin(th), -sin(th), cos(th)) * rel * k;
    pos = vec3(a8.zw + r2, C.z * smoothstep(0., 1., p) + sin(3.14159 * e) * a9.y) + q;
  } else if (kind < 1.5) {
    pos = mix(C + vec3((rnd - .5) * 40., (fract(rnd * 7.) - .5) * 40., 110. + rnd * 90.), C, e) + q;
  } else {
    pos = vec3(C.xy, C.z * e) + q * e;
  }
  // A piece of decor that has been touched turns about its pivot: a tree is cut and grows back (1), a
  // scooter tips over and is righted (2), a wizard hops (3), a bag swings (4), an hourglass flips (5),
  // an orrery spins (6), anything rustles (7), a dumbbell is lifted (8), a telescope looks up (9).
  // Each slot is (id, kind, start) and (axis, amount).
  vec3 n = N;
  if (a10.x > .5) for (int i = 0; i < 6; i++) {
    if (abs(a10.x - uDec[i].x) > .5) continue;
    float t = uTime - uDec[i].z, kd = uDec[i].y, a = 0., s = 1.; vec3 ax = uDecA[i].xyz, pv = a10.yzw, off = vec3(0.);
    if (kd < 1.5) {
      float f = t - .4;
      a = t < .4 ? .045 * sin(t * 47.) : f < .9 ? 1.5 * f * f / .81 : 1.5 + .05 * sin((f - .9) * 20.) * exp(-(f - .9) * 7.);
      if (t > 4.3) s = 1. - smoothstep(4.3, 4.7, t);
      if (t > 4.7) { a = 0.; float g = clamp((t - 4.7) / 1.4, 0., 1.); s = 1. - pow(1. - g, 3.); }
    } else if (kd < 2.5) a = t < .45 ? 1.35 * t * t / .2025 : t < 2.6 ? 1.35 + .04 * sin((t - .45) * 22.) * exp(-(t - .45) * 8.) : 1.35 * (1. - smoothstep(2.6, 3.2, t));
    else if (kd < 3.5) off.z = uDecA[i].w * abs(sin(t * 7.)) * exp(-t * 2.4);
    else if (kd < 4.5) a = uDecA[i].w * sin(t * 5.) * exp(-t * .7);
    else if (kd < 5.5) a = 3.14159 * (smoothstep(0., 1., t) + smoothstep(3., 4., t));
    else if (kd < 6.5) a = 12.566 * (1. - pow(1. - clamp(t / 3.5, 0., 1.), 3.));
    else if (kd < 7.5) a = uDecA[i].w * sin(t * 16.) * exp(-t * 3.);
    else if (kd < 8.5) off.z = uDecA[i].w * sin(3.14159 * clamp(t / 1.4, 0., 1.));
    else a = uDecA[i].w * (smoothstep(0., .8, t) - smoothstep(3., 3.8, t));
    pos = pv + rot(pos - pv, ax, a) * s + off; n = rot(N, ax, a);
  }
  // A hovered building lifts a little off the paper.
  if (a7.w > .5 && abs(a7.w - uHover) < .5) pos.z += 10. * uLift;
  pos.z *= uRise;
  vW = pos;
  gl_Position = uVP * vec4(pos, 1.);
  vG = 0.;
  // Opening a case study: the building comes apart from the roof down, and each piece flies
  // on a smooth arc to its own tile of a sheet the size of the page. Row by row, top to
  // bottom, the tiles make the paper; the seams between them close as they land.
  if (uGather > 0. && a7.w > .5 && abs(a7.w - uGRoom) < .5) {
    float idx = a9.w, col = mod(idx, uGrid.x), row = min(floor(idx / uGrid.x), uGrid.y - 1.);
    float delay = row / uGrid.y * .5 + col / uGrid.x * .05;
    float g = clamp((uGather - delay) / .45, 0., 1.), e2 = g * g * (3. - 2. * g);
    if (g > 0.) {
      if (uIsShadow > .5) { gl_Position = vec4(2., 2., 2., 1.); return; }
      vec4 from = gl_Position / gl_Position.w;
      vec2 cell = vec2(uSheet.z - uSheet.x, uSheet.w - uSheet.y) / uGrid;
      vec2 cc = vec2(uSheet.x + (col + .5) * cell.x, uSheet.w - (row + .5) * cell.y);
      vec2 tgt = cc + vec2(aC.x - .5, .5 - aC.y) * cell * 1.02;
      // The arc rises first, then settles: a lift off the paper, a glide, a landing.
      vec2 ctrl = mix(from.xy, tgt, .35) + vec2(0., .22 + .1 * fract(idx * .137));
      vec2 p2 = mix(mix(from.xy, ctrl, e2), mix(ctrl, tgt, e2), e2);
      gl_Position = vec4(p2, mix(from.z, -.98, e2), 1.);
      vG = e2;
    }
  }
  vUV = uv; vPs = a4.zw - a4.xy; vPc = aC * vPs; vFace = a5; vCol = a6; vMat = a7; vN = n; vDec = a10.x;
}`
const FS_SHADOW = `#version 300 es
precision highp float;
in vec2 vUV; flat in vec4 vFace; in float vP;
out vec4 o;
void main() { float lv = vFace.z * (1. - vUV.y / vFace.y); if (vUV.x < lv || vUV.x > vFace.x - lv) discard; o = vec4(1.); }`
const FS_PIECE = `#version 300 es
precision highp float;
in vec2 vUV; in vec2 vPc; in vec3 vW; in float vP; in float vG; flat in float vDec;
flat in vec4 vFace; flat in vec4 vCol; flat in vec4 vMat; flat in vec3 vN; flat in vec2 vPs;
uniform vec3 uLight, uCam, uInk, uHl, uPaper; uniform float uSel, uHover, uDpr; uniform float uLit[8];
uniform mat4 uLVP; uniform highp sampler2D uShadow;
layout(location=0) out vec4 oCol;
layout(location=1) out vec4 oNid;
float lineAA(float d, float w) { float fw = max(fwidth(d), 1e-4); return 1. - smoothstep(w - fw, w + fw, d); }
float rows(float v, float p, float at, float w) { return lineAA(abs(mod(v - at + p * .5, p) - p * .5), w); }
float pattern(int k, float u, float v) {
  if (k == 1) { float r = floor(v / 12.); float j = mod(r, 2.) < .5 ? 6. : 18.; return max(rows(v, 12., 11.5, .4), rows(u, 24., j, .4)); }
  if (k == 2) { float r = floor(v / 6.); float j = mod(r, 2.) < .5 ? 4. : 12.; return max(rows(v, 6., 5.5, .35), rows(u, 16., j, .35)); }
  if (k == 3) { vec2 c = mod(vec2(u, v), 40.); return max(lineAA(length(c - vec2(8., 9.)), .8), lineAA(length(c - vec2(27., 22.)), .7)); }
  if (k == 4) return max(rows(u, 12., 11.5, .45), rows(v, 40., 13.5, .4));
  if (k == 5) { vec2 c = vec2(mod(u, 6.), mod(v, 8.)); float t = c.x / 6.; return lineAA(abs(c.y - (8. - 10. * t * (1. - t))), .38); }
  if (k == 6) return max(rows(v, 7., 6.5, .33), rows(u + floor(v / 7.) * 5., 10., 5., .33));
  if (k == 7) { float x = mod(u - v * .1, 3.); return lineAA(abs(x - 1.5), .3); }
  if (k == 8) return max(rows(v, 14., .5, .45), rows(u, 14., .5, .45));
  if (k == 9) return rows(v, 7., 6.5, .4);
  if (k == 10) { vec2 c = mod(vec2(u, v), 20.); return lineAA(length(c - vec2(4., 5.)), .7) + lineAA(length(c - vec2(13., 14.)), .7); }
  if (k == 12) { vec2 c = mod(vec2(u, v), 9.); return lineAA(abs(length(c - vec2(4.5)) - 3.), .3) * .6; }
  return 0.;
}
// Openings painted on a wall: a dark ink shape, and how much of the pixel it covers.
float arch(vec2 p, vec2 lo, vec2 hi) { float r = (hi.x - lo.x) * .5; vec2 c = vec2(lo.x + r, lo.y + r); if (p.y < c.y) return step(length(p - c), r); return step(lo.x, p.x) * step(p.x, hi.x) * step(p.y, hi.y); }
float opening(int k, float u, float v, float L, float S, out float shade) {
  shade = 1.;
  if (k == 7) { float y0 = (S - 26.) * .3; if (S < 30.) return 0.; vec2 p = vec2(mod(u, 34.), v - y0); shade = -2.; return arch(p, vec2(13., 6.), vec2(21., 26.)); }
  if (k == 1) { float y0 = (S - 26.) * .3; if (S < 30.) return 0.; vec2 p = vec2(mod(u, 34.), v - y0); return arch(p, vec2(13., 6.), vec2(21., 26.)); }
  if (k == 2) { float h = S; vec2 p = vec2(mod(u, 26.), v); shade = .82; return arch(p, vec2(4., h * .32), vec2(22., h)); }
  if (k == 3) { vec2 p = vec2(u - (L - 24.) * .5, v - (S - 30.)); return arch(p, vec2(3., 3.), vec2(21., 30.)); }
  if (k == 4) { vec2 c = vec2(L * .5, S * .45); float d = length(vec2(u, v) - c); shade = -1.; return step(d, 10.); }
  if (k == 5) { vec2 p = vec2(u - (L - 40.) * .5, v - (S - 46.)); float a = arch(p, vec2(2., 2.), vec2(38., 46.)); float bars = max(step(abs(mod(p.x, 8.) - 4.), .7), step(abs(mod(p.y, 12.) - 6.), .7)); shade = bars > .5 ? .55 : 1.; return a; }
  if (k == 6) { vec2 c = mod(vec2(u, v), 14.) - 7.; return step(length(c), 2.4); }
  return 0.;
}
void main() {
  float L = vFace.x, S = vFace.y, l0 = vFace.z, u = vUV.x, v = vUV.y;
  float lv = l0 * (1. - v / S);
  if (u < lv - .02 || u > L - lv + .02 || v < -.02 || v > S + .02) discard;
  int fl = int(vMat.z + .5);
  if ((fl & 1) != 0 && v < 11. && mod(u, 20.) > 11.) discard;
  if ((fl & 2) != 0 && v < 6. * abs(mod(u, 8.) - 4.) / 4.) discard;
  if ((fl & 4) != 0) { vec2 e = (vUV - vec2(L, S) * .5) / (vec2(L, S) * .5); if (dot(e, e) > 1.) discard; }
  int pat = int(vMat.x + .5), ovl = int(vMat.y + .5);
  vec3 base = vCol.rgb;
  if (pat == 11) base = mod(u, 14.) < 7. ? base : vec3(.97, .94, .87);
  vec3 col = mix(base, uInk, pattern(pat, u, v) * .45);
  float sh; float op = opening(ovl, u, v, L, S, sh);
  if (op > .5) col = sh < -1.5 ? vec3(.99, .8, .42) : sh < 0. ? vec3(.97, .94, .86) : mix(col, uInk * 1.05, .92 * sh);
  vec3 n = normalize(vN); if (dot(n, uCam - vW) < 0.) n = -n;
  float lam = dot(n, uLight);
  vec4 ls = uLVP * vec4(vW, 1.); vec3 sc = ls.xyz * .5 + .5; float shd = 0.;
  if (sc.x > 0. && sc.x < 1. && sc.y > 0. && sc.y < 1.) shd = sc.z - .0018 > texture(uShadow, sc.xy).r ? 1. : 0.;
  float dark = max(shd * .9, smoothstep(.22, -.08, lam));
  col *= mix(.93 + .08 * lam, .8, dark);
  float hs = 4.2 * uDpr, hx = abs(fract((gl_FragCoord.x - gl_FragCoord.y) / hs) - .5) * hs;
  col = mix(col, uInk, dark * (1. - smoothstep(.45 * uDpr, .95 * uDpr, hx)) * .5);
  // In flight: ink first, colour as it lands, and a warm glint when it locks in.
  col = mix(uInk * 1.15, col, smoothstep(.04, .5, vP));
  col += vec3(1., .82, .45) * smoothstep(.72, .92, vP) * (1. - smoothstep(.92, 1., vP)) * .32;
  if (vP < 1.) { vec2 d2 = min(vPc, vPs - vPc); col = mix(col, uInk, lineAA(min(d2.x, d2.y), .6) * (1. - smoothstep(.8, 1., vP)) * .85); }
  // A lamp that has been turned on: its glass glows warm, out of the shade (16-delight).
  if (vDec > .5 && pat == 8) for (int i = 0; i < 8; i++) if (abs(vDec - uLit[i]) < .5) col = mix(col, vec3(1., .87, .52), .88);
  float room = vMat.w;
  if (room > .5 && abs(room - uSel) < .5) col = mix(col, uHl, .3); else if (room > .5 && abs(room - uHover) < .5) col = mix(col, uHl, .17);
  // On their way to the page, the pieces turn to paper, and once landed they are one sheet.
  col = mix(col, uPaper, smoothstep(.05, .75, vG));
  oCol = vec4(col, 1.);
  float id = vFace.w;
  oNid = vG > .92 ? vec4(.5, .5, 0., 0.) : vec4(n.xy * .5 + .5, mod(id, 256.) / 255., mod(floor(id / 256.), 256.) / 255.);
}`
const VS_FULL = `#version 300 es
void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2. - 1., 0., 1.); }`
const FS_COMP = `#version 300 es
precision highp float;
uniform sampler2D uCol, uNid, uGrain; uniform highp sampler2D uDepth, uShadow;
uniform mat4 uLVP; uniform mat3 uInv; uniform vec2 uRes, uFog, uRayZ; uniform float uEyeZ; uniform float uDpr, uNear, uFar; uniform vec3 uInk, uMist;
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
vec3 dec(vec2 e) { vec2 n = e * 2. - 1.; return vec3(n, sqrt(max(0., 1. - dot(n, n)))); }
// Depth from the eye, back out of the perspective depth buffer.
float lin(float d) { return 2. * uNear * uFar / ((uFar + uNear) - (2. * d - 1.) * (uFar - uNear)); }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy), mx = ivec2(uRes) - 1;
  // A pen's waver: every line drifts a little off true.
  vec2 w = (vec2(noise(gl_FragCoord.xy * .045), noise(gl_FragCoord.yx * .045 + 9.)) - .5) * 1.6 * uDpr;
  ivec2 q = clamp(p + ivec2(round(w)), ivec2(0), mx);
  float dc = texelFetch(uDepth, q, 0).r, zc = lin(dc); vec4 nc = texelFetch(uNid, q, 0);
  // How solid each pixel is: 0 for bare paper, 1 for the city, and in between for a pop-up card still
  // fading in as it lifts (11-cards). A change in it is an edge, so the ink outlines of a lying wood
  // fade as its card fills in, rather than vanish in one frame.
  float fq = dc < 1. ? texelFetch(uCol, q, 0).a : 0.;
  float edge = 0.;
  ivec2 OF[4] = ivec2[4](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));
  for (int i = 0; i < 4; i++) {
    ivec2 r = clamp(q + OF[i], ivec2(0), mx);
    float dn = texelFetch(uDepth, r, 0).r, e = abs(fq - (dn < 1. ? texelFetch(uCol, r, 0).a : 0.));
    if (dc < 1. && dn < 1.) {
      vec4 nn = texelFetch(uNid, r, 0);
      e = max(e, smoothstep(.0035, .008, abs(lin(dn) - zc) / zc));
      e = max(e, smoothstep(.8, .7, dot(dec(nc.xy), dec(nn.xy))));
      e = max(e, step(.003, distance(nc.zw, nn.zw)) * .9);
    }
    edge = max(edge, e);
  }
  float grain = texture(uGrain, gl_FragCoord.xy / (512. * uDpr)).a;
  vec4 solid = vec4(0.);
  if (dc < 1.) {
    vec3 c = texelFetch(uCol, p, 0).rgb * (1. - grain * .7);
    // Far off, the buildings fade into the same mist as the paper under them.
    solid = vec4(mix(mix(c, uInk, edge), uMist, smoothstep(uFog.x, uFog.y, zc) * .82), 1.);
  }
  if (fq > .999) o = solid;
  else {
    vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
    vec3 gh = uInv * vec3(css, 1.); vec2 g = gh.xy / gh.z;
    vec4 ls = uLVP * vec4(g, 0., 1.); vec3 sc = ls.xyz * .5 + .5; float sh = 0.;
    if (sc.x > 0. && sc.x < 1. && sc.y > 0. && sc.y < 1.) sh = sc.z - .0025 > texture(uShadow, sc.xy).r ? 1. : 0.;
    float hs = 4.2 * uDpr, hx = abs(fract((gl_FragCoord.x - gl_FragCoord.y) / hs) - .5) * hs;
    float a = max(edge * .95, sh * ((1. - smoothstep(.45 * uDpr, .95 * uDpr, hx)) * .42 + .07));
    // The same depth on the paper: the eye's height over the ground along this pixel's ray.
    a *= 1. - smoothstep(uFog.x, uFog.y, uEyeZ / max(.02, uRayZ.x + uRayZ.y * css.y)) * .82;
    o = mix(vec4(uInk * a, a), solid, fq);
  }
}`

// ---------- The renderer ----------
const cv = $('gl')
let gl = null, GLS = null
// Compile without blocking: with KHR_parallel_shader_compile the driver works in the
// background, and the program is only touched once it reports it is done.
function compile(vs, fs) {
  const mk = (t, src) => { const sh = gl.createShader(t); gl.shaderSource(sh, src); gl.compileShader(sh); return sh }
  const p = gl.createProgram(), v = mk(gl.VERTEX_SHADER, vs), fr = mk(gl.FRAGMENT_SHADER, fs)
  gl.attachShader(p, v); gl.attachShader(p, fr); gl.linkProgram(p)
  return { p, v, fr, u: null }
}
function finishProgram(P) {
  if (!gl.getProgramParameter(P.p, gl.LINK_STATUS)) throw new Error(gl.getShaderInfoLog(P.v) || gl.getShaderInfoLog(P.fr) || gl.getProgramInfoLog(P.p))
  const u = {}, n = gl.getProgramParameter(P.p, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(P.p, i); u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(P.p, info.name) }
  P.u = u
}
function tex(w, h, internal, format, type, filter = gl.NEAREST) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t)
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return t
}
// The ink is drawn a little under the screen's full density: the lines stay crisp, the GPU breathes.
const DPR = () => Math.min(devicePixelRatio || 1, mobile() ? 1 : 1.25)
// Get the city ready in idle time after the page loads, so leaning in never waits on it.
let glQueued = false
function prewarmGL() {
  if (gl || city.failed || glQueued) return
  glQueued = true
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 400))
  idle(() => { if (gl || city.failed) return; try { startGL() } catch (err) { failGL(err) } }, { timeout: 3000 })
}
// Settles once the 3D city and its standing trees (11-cards) can draw, or can't, or after a few seconds
// whichever way. The trees swap in for the flat ink ones all at once, so that is best done out of sight.
const cityReady = (cap = 5000) => new Promise(r => { const t0 = performance.now()
  const check = () => city.ready && city.cardsDone || city.failed || !TILT || performance.now() - t0 > cap ? r() : setTimeout(check, 50); check() })
function failGL(err) { console.warn('3D city unavailable:', err?.message || err); city.failed = true; city.ready = false; gl = null; CARDGL = null; TILT = false; document.body.classList.remove('cards', 'city3d'); requestRender() }
function startGL() {
  gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
  if (!gl) throw new Error('no webgl2')
  const par = gl.getExtension('KHR_parallel_shader_compile')
  const t0 = performance.now()
  buildFaces(); const data = buildPieces(), count = data.length / FLOATS
  const progs = [compile(VS_PIECE, FS_PIECE), compile(VS_PIECE, FS_SHADOW), compile(VS_FULL, FS_COMP)]
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
  const inst = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, inst); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  // Each realm's pieces lie together in the buffer; each gets its own view of it, so only the
  // realms in sight are ever drawn.
  const runs = []
  for (let i = 0; i < count; i++) { const ri = data[i * FLOATS + 29]; if (!runs.length || runs.at(-1).ri !== ri) runs.push({ ri, start: i, count: 0 }); runs.at(-1).count++ }
  for (const run of runs) {
    run.vao = gl.createVertexArray(); gl.bindVertexArray(run.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, inst)
    for (let i = 0; i < 10; i++) { gl.enableVertexAttribArray(i + 1); gl.vertexAttribPointer(i + 1, 4, gl.FLOAT, false, FLOATS * 4, run.start * FLOATS * 4 + i * 16); gl.vertexAttribDivisor(i + 1, 1) }
    run.box = boxOf(REALM_KEYS[run.ri] === 'work' ? 'home' : REALM_KEYS[run.ri])
  }
  gl.bindVertexArray(null)
  const vao = runs[0].vao
  // Paper grain, so the buildings sit on the same sheet.
  const grain = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, grain)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, GRAIN); gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  const SM = mobile() ? 768 : 1024, smTex = tex(SM, SM, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, gl.NEAREST), smColor = tex(SM, SM, gl.R8, gl.RED, gl.UNSIGNED_BYTE)
  const smFb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, smFb)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, smColor, 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, smTex, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  GLS = { pieceP: progs[0], shadowP: progs[1], compP: progs[2], vao, runs, count, grain, SM, smTex, smFb, fb: null, starts: new Float32Array(9).fill(1e6), focus: new Float32Array(18) }
  REALMS.forEach(R0 => { const i = REALM_IDX[R0.key]; GLS.focus[i * 2] = R0.ox + R0.w / 2; GLS.focus[i * 2 + 1] = R0.oy + R0.h / 2 })
  GLS.focus[REALM_IDX.earlier * 2] = (ISLES.x0 + ISLES.x1) / 2; GLS.focus[REALM_IDX.earlier * 2 + 1] = (ISLES.y0 + ISLES.y1) / 2
  if (BATCH.workBuild) { const b = buildBox('work'); GLS.focus[16] = (b.x0 + b.x1) / 2; GLS.focus[17] = (b.y0 + b.y1) / 2 }
  for (const L of LABELS) if (L.room) L.top = ROOM_TOP[L.room] || 40
  cityResize(); startCards()
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); failGL('context lost'); cv.style.display = 'none' })
  city.pieces = count; city.buildMs = { cpu: Math.round(performance.now() - t0) }
  const finish = () => {
    try { progs.forEach(finishProgram) } catch (err) { return failGL(err) }
    city.ready = true; city.buildMs.total = Math.round(performance.now() - t0)
    if (view().t > 0) render()
  }
  if (!par) return finish()
  const poll = () => progs.every(P => gl.getProgramParameter(P.p, par.COMPLETION_STATUS_KHR)) ? finish() : requestAnimationFrame(poll)
  requestAnimationFrame(poll)
}
function cityResize() {
  if (!gl || !GLS) return
  const d = DPR(), w = Math.round(VW * d), h = Math.round(VH * d)
  if (cv.width === w && cv.height === h && GLS.fb) return
  cv.width = w; cv.height = h
  if (GLS.fb) { gl.deleteFramebuffer(GLS.fb); for (const t of GLS.fbTex) gl.deleteTexture(t) }
  const c0 = tex(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE), c1 = tex(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE), dt = tex(w, h, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT)
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, c0, 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, c1, 0)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, dt, 0)
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  GLS.fb = fb; GLS.fbTex = [c0, c1, dt]
}
// Light from the west-south-west and high: the faces you see are lit, east sides fall into hatching.
// The sun moves with the journey: high from the west-south-west over the newest work, low in the
// west by the lighthouse, so the shadows lengthen as you go back in time.
function sunAt(y) {
  const t = journey(y), el = lerp(58, 24, t ** 1.2) * DEG, az = lerp(2.69, 3.02, t)
  return [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)]
}
let LIGHT = sunAt(START_Y)
function lightMatrix(v) {
  const f3 = LIGHT.map(x => -x), up = [0, 0, 1]
  let r = [f3[1] * up[2] - f3[2] * up[1], f3[2] * up[0] - f3[0] * up[2], f3[0] * up[1] - f3[1] * up[0]]; const rl = Math.hypot(...r); r = r.map(x => x / rl)
  const u = [r[1] * f3[2] - r[2] * f3[1], r[2] * f3[0] - r[0] * f3[2], r[0] * f3[1] - r[1] * f3[0]]
  // Fit the visible ground, plus room for tall buildings and long shadows.
  const pts = [[0, 0], [VW, 0], [0, VH], [VW, VH]].map(([X, Y]) => unproject(X, Y, v)).map(([x, y]) => [clamp(x, -500, W + 500), clamp(y, cam.cy - 2500, cam.cy + 1700)])
  let mn = [Infinity, Infinity, Infinity], mxv = [-Infinity, -Infinity, -Infinity]
  const pad = 260 + 420 * journey(cam.cy)
  for (const [x, y] of pts) for (const z of [0, 320]) for (const [ox, oy] of [[-pad, -pad], [pad, pad], [-pad, pad], [pad, -pad]]) {
    const p = [x + ox, y + oy, z], l = [p[0] * r[0] + p[1] * r[1] + p[2] * r[2], p[0] * u[0] + p[1] * u[1] + p[2] * u[2], p[0] * f3[0] + p[1] * f3[1] + p[2] * f3[2]]
    for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], l[k]); mxv[k] = Math.max(mxv[k], l[k]) }
  }
  const s = mxv.map((m, k) => 2 / (m - mn[k])), c = mxv.map((m, k) => (m + mn[k]) / 2)
  return new Float32Array([r[0] * s[0], u[0] * s[1], f3[0] * s[2], 0, r[1] * s[0], u[1] * s[1], f3[1] * s[2], 0, r[2] * s[0], u[2] * s[1], f3[2] * s[2], 0, -c[0] * s[0], -c[1] * s[1], -c[2] * s[2], 1])
}
let assemblyRaf = 0, lastT = 0
const now = () => performance.now() / 1000
// A city builds itself once you are near enough to watch it: when its near edge is well
// inside the view ahead, not while it is still a speck in the mist. With BATCH.lateBuild it waits
// longer, until its middle is a quarter of the way down the screen and the opening's lean-in is over,
// so the build plays where it is seen.
function realmNear(key, v) {
  const b = buildBox(key)
  if (!BATCH.lateBuild || reduce || !v) return b.y1 > cam.cy - 520 && b.y0 < cam.cy + 900
  // Nothing starts while the eye is still leaning in from straight above.
  if (cam.intro > 0) return false
  return b.y0 < cam.cy + 900 && project((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 0, v)[1] > VH * .25
}
// Whether a realm can show up on screen, or throw a shadow onto it.
const inSight = (b, gv) => b.x1 > gv.x0 - 400 && b.x0 < gv.x1 + 400 && b.y1 > gv.y0 - 300 && b.y0 < gv.y1 + 700
// Called on every camera change: build what has come into view, then draw.
function cityFrame(v) {
  city.rise = v.t
  if (v.t <= 0.001) {
    if (city.active) { city.active = false; cv.style.display = 'none'; document.body.classList.remove('cards', 'city3d'); if (GLS) GLS.starts.fill(1e6); cancelAnimationFrame(assemblyRaf); assemblyRaf = 0 }
    return
  }
  if (!city.ready) { prewarmGL(); return }
  if (!city.active) { city.active = true; cv.style.display = 'block' }
  document.body.classList.toggle('cards', !!CARDGL); document.body.classList.add('city3d')
  const t = now()
  // A realm starting to build gets one more pass of the labels, which wait on it (the brand seals do).
  let began = false
  // (Behind the opening's loader, BATCH.calmOpen, they are simply there: built, not building.)
  for (const key of REALM_KEYS) { const i = REALM_IDX[key]; if (GLS.starts[i] > 1e5 && realmNear(key, v)) { GLS.starts[i] = reduce || city.built ? t - 99 : t + .05; began = true } }
  if (began) setTimeout(requestRender, 60)
  // Nothing moved: the last picture still stands.
  const key = [...v.E, ...v.d, VW, VH, CARDGL ? 1 : 0].map(n => n.toFixed(2)).join()
  if (key === city.drawn && !assemblyRaf) return
  draw(v)
  // Keep drawing while any stone is still in the air.
  const busy = Array.from(GLS.starts).some(s => s < 1e5 && t - s < 4.2)
  if (busy && !assemblyRaf) assemblyRaf = requestAnimationFrame(function loop() { const v2 = view(); draw(v2); const t2 = now(); assemblyRaf = Array.from(GLS.starts).some(s => s < 1e5 && t2 - s < 4.2) ? requestAnimationFrame(loop) : 0 })
}
function draw(v) {
  // One picture per frame: scrolling, a city building itself and a hover can all ask in the
  // same frame, and the GPU should only paint it once.
  const stamp = document.timeline.currentTime, key = [...v.E, ...v.d, VW, VH, CARDGL ? 1 : 0].map(n => n.toFixed(2)).join()
  if (stamp === city.stamp && key === city.drawn) return
  city.stamp = stamp; city.drawn = key
  const t = now(), d = DPR(), W2 = cv.width, H2 = cv.height
  // The light's picture of the land is kept until the eye has travelled a way, unless
  // something is moving; the view between uses the same picture.
  // (A stir of decor on its own is too small to need its shadows recast.)
  const moving = assemblyRaf || gatherRaf || liftRaf || (decorRaf && !decorIdle) || city.gather > 0, at = GLS.shadowAt
  const recast = !at || moving || Math.abs(cam.cy - at[1]) > 520 || Math.abs(cam.cx - at[0]) > 320 || at[2] !== VW
  if (recast) { LIGHT = sunAt(cam.cy); GLS.lvp = lightMatrix(v); GLS.shadowAt = [cam.cx, cam.cy, VW] }
  const vp = clipMatrix(v), lvp = GLS.lvp
  const P = GLS.pieceP, SP = GLS.shadowP, C = GLS.compP
  const setCommon = (prog, m) => {
    gl.uniformMatrix4fv(prog.u.uVP, false, m); gl.uniform1f(prog.u.uRise, v.t); gl.uniform1f(prog.u.uTime, t)
    gl.uniform1f(prog.u.uK1, .00055); gl.uniform1f(prog.u.uK2, .0045)
    gl.uniform1fv(prog.u.uStart, GLS.starts)
    gl.uniform2fv(prog.u.uFocus, GLS.focus)
    gl.uniform1f(prog.u.uGather, city.gather); gl.uniform1f(prog.u.uGRoom, city.gRoom); gl.uniform4fv(prog.u.uSheet, city.sheet); gl.uniform2fv(prog.u.uGrid, city.grid)
    gl.uniform1f(prog.u.uHover, city.hover); gl.uniform1f(prog.u.uLift, city.lift)
    gl.uniform4fv(prog.u.uDec, DEC_U); gl.uniform4fv(prog.u.uDecA, DEC_A); gl.uniform1fv(prog.u.uLit, LIT_U)
    gl.uniform1f(prog.u.uIsShadow, prog === SP ? 1 : 0)
  }
  const gv = groundView(v), runs = GLS.runs.filter(r => inSight(r.box, gv))
  const pieces = () => { for (const r of runs) { gl.bindVertexArray(r.vao); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, r.count) } }
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE)
  // 1. Shadows.
  if (recast) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, GLS.smFb); gl.viewport(0, 0, GLS.SM, GLS.SM); gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(SP.p); setCommon(SP, lvp)
    pieces()
    if (CARDGL) drawCards(CARDGL.SP, lvp, v)
  }
  // 2. The buildings, into colour, normal and depth.
  gl.bindFramebuffer(gl.FRAMEBUFFER, GLS.fb); gl.viewport(0, 0, W2, H2)
  gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]); gl.clearBufferfv(gl.COLOR, 1, [.5, .5, 0, 0]); gl.clearBufferfv(gl.DEPTH, 0, [1])
  gl.useProgram(P.p); setCommon(P, vp)
  gl.uniform3f(P.u.uLight, ...LIGHT); gl.uniform3f(P.u.uCam, ...v.E); gl.uniform3f(P.u.uInk, ...INK)
  gl.uniform3fv(P.u.uHl, oklchRGB(.84, .11, 85)); gl.uniform3fv(P.u.uPaper, oklchRGB(.955, .024, 84)); gl.uniform1f(P.u.uSel, city.sel); gl.uniform1f(P.u.uHover, city.hover); gl.uniform1f(P.u.uDpr, d)
  gl.uniformMatrix4fv(P.u.uLVP, false, lvp)
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, GLS.smTex); gl.uniform1i(P.u.uShadow, 0)
  pieces()
  if (CARDGL) drawCards(CARDGL.P, vp, v, lvp)
  gl.bindVertexArray(null)
  // 3. Ink and paper, onto the page.
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W2, H2); gl.disable(gl.DEPTH_TEST)
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(C.p)
  const [c0, c1, dt] = GLS.fbTex
  ;[[c0, 'uCol'], [c1, 'uNid'], [dt, 'uDepth'], [GLS.smTex, 'uShadow'], [GLS.grain, 'uGrain']].forEach(([tx, name], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx); gl.uniform1i(C.u[name], i) })
  gl.uniformMatrix3fv(C.u.uInv, false, groundInverse(v))
  gl.uniformMatrix4fv(C.u.uLVP, false, lvp); gl.uniform2f(C.u.uRes, W2, H2); gl.uniform1f(C.u.uDpr, d); gl.uniform3f(C.u.uInk, ...INK)
  gl.uniform1f(C.u.uNear, NEAR); gl.uniform1f(C.u.uFar, FAR); gl.uniform3fv(C.u.uMist, MIST)
  // Fog by depth, and the ray's fall per screen row, so the paper's shadows fade with it.
  const fr = fogRange(v), on = TILT && v.cp > .05
  gl.uniform2f(C.u.uFog, on ? fr[0] : 1e9, on ? fr[1] : 2e9); gl.uniform1f(C.u.uEyeZ, v.E[2]); gl.uniform2f(C.u.uRayZ, v.sp - v.py / v.F * v.cp, v.cp / v.F)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.bindVertexArray(null)
}
// Picking: the hull of each built room on screen, front-most wins.
function hull(pts) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = []
  for (const p of pts) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p) }
  for (const p of pts.slice().reverse()) { while (up.length > 1 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p) }
  return lo.slice(0, -1).concat(up.slice(0, -1))
}
// How far a point lies outside a screen outline, in pixels: 0 inside.
function outside(poly, X, Y) {
  if (inside(poly, X, Y)) return 0
  let d = Infinity
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dy = b[1] - a[1], k = clamp(((X - a[0]) * dx + (Y - a[1]) * dy) / (dx * dx + dy * dy || 1), 0, 1)
    d = Math.min(d, Math.hypot(X - a[0] - k * dx, Y - a[1] - k * dy))
  })
  return d
}
// A near miss still counts, so a small building is as easy to find as a big one. Inside an
// outline beats near one (the front-most wins); the building already under the pointer
// holds on until the pointer has clearly left it.
const PICK_PAD = 28
// The owl on the lighthouse's gallery is only scenery: the pointer over it is not over the lighthouse.
function owlAt(X, Y) {
  const q = ROOMS['home-hello']?.part
  if (!q || !city.active) return false
  const k = q.r / 46, R0 = q.r * .62, ox = q.cx + R0 * .3, oy = q.cy + R0 * 1.14, z = 196 * k + 6 * k, v = view()
  const [x0, y0] = project(ox, oy, z * v.t, v), [x1, y1] = project(ox, oy, (z + 27 * 1.7 * k) * v.t, v), [xr] = project(ox + 8 * 1.7 * k, oy, z * v.t, v)
  return Math.abs(X - x0) < Math.max(8, Math.abs(xr - x0) * 1.2) && Y < y0 + 4 && Y > y1 - 4
}
function cityPick(X, Y, held) {
  if (owlAt(X, Y)) return null
  if (!city.active || !GLS || city.rise < .25) return null
  const v = view(), t = now()
  let best = null, bestD = Infinity, bestZ = Infinity, heldD = Infinity
  for (const [id, pts] of Object.entries(ROOM_PTS)) {
    const part = ROOMS[id]?.part, ri = part && REALM_IDX[partRealm(part)]
    if (!part || GLS.starts[ri] > 1e5 || t - GLS.starts[ri] < .6) continue
    const sp = pts.map(([x, y, z]) => project(x, y, z * v.t, v)), h = hull(sp)
    const xs = sp.map(p => p[0]), ys = sp.map(p => p[1]), size = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
    const d = outside(h, X, Y), pad = PICK_PAD + Math.max(0, 56 - size) / 2
    if (id === held) heldD = d <= pad * 1.8 ? d : Infinity
    if (d > pad) continue
    const z = project(part.c[0], part.c[1], 0, v)[2]
    if (d < bestD - .5 || (Math.abs(d - bestD) <= .5 && z < bestZ)) { best = id; bestD = d; bestZ = z }
  }
  return heldD < Infinity && bestD > 0 ? held : best
}
let hoverRaf = 0, liftRaf = 0, pointedRoom = null
function cityHover(X, Y, target) {
  if (!city.active) { const r = target?.closest?.('.room')?.dataset.id || null; if (r !== peeked && (r || !peeked || !levelOf[peeked]?.el.matches(':hover'))) levelPeek(r); return }
  if (flyId || hoverRaf) return
  hoverRaf = requestAnimationFrame(() => {
    hoverRaf = 0
    // A piece of decor under the pointer answers it (16-delight), and takes it from the building;
    // with BATCH.propsShareHover, a prop that belongs to a building plays and leaves it the hover.
    const dec = decorAt(X, Y), share = BATCH.propsShareHover && DECOR[dec]?.room, id = dec && !share ? null : share || cityPick(X, Y, peeked)
    decorHover(dec)
    // The pointer arriving over a building: its wizard looks up, or its own trick plays (16-delight).
    if (id !== pointedRoom) { pointedRoom = id; if (id) { wizardNudge(id); roomHover(id) } }
    // Only a building with a full story to open takes a pointer; the rest are read on hover.
    // The wand only over a prop with a trick of its own to click; the pieces that play when their place
    // is hovered (trickF) don't need it. A hand only where a click opens something.
    vp.style.cursor = dec && !DECOR[dec].trick ? WAND : id && clickable(id) ? 'pointer' : ''
    if (id !== peeked && (id || !peeked || !levelOf[peeked]?.el.matches(':hover'))) levelPeek(id)
  })
}
// Lift the hovered room's building off the paper, easing in and out.
function cityHoverRoom(id) {
  const h = id ? Math.max(0, ROOM_IDS.indexOf(id)) : 0
  cancelAnimationFrame(liftRaf)
  if (h) city.hover = h
  const to = h ? 1 : 0, from = city.lift, t0 = performance.now()
  if (!city.active || !city.ready || reduce) { city.lift = to; if (!h) city.hover = 0; if (city.active && city.ready) draw(view()); return }
  const step = now => {
    const k = clamp((now - t0) / 220, 0, 1)
    city.lift = lerp(from, to, easeOut(k)); draw(view())
    if (k < 1) liftRaf = requestAnimationFrame(step)
    else { liftRaf = 0; if (!h) city.hover = 0 }
  }
  liftRaf = requestAnimationFrame(step)
}
function citySelect(id) { city.sel = id ? Math.max(0, ROOM_IDS.indexOf(id)) : 0; if (city.active) draw(view()) }
// Gather a building's pieces into the page (to = 1), or send them home again (to = 0).
let gatherRaf = 0
function cityGather(id, to, dur, done) {
  if (!city.active || !city.ready || reduce) { city.gather = to; done?.(); return false }
  city.gRoom = ROOM_IDS.indexOf(id)
  // A grid of tiles about as square on screen as the page allows, one tile per piece.
  const n = ROOM_N[city.gRoom] || 100, sw = (city.sheet[2] - city.sheet[0]) * VW, sh = (city.sheet[3] - city.sheet[1]) * VH
  const cols = Math.max(4, Math.round(Math.sqrt(n * sw / sh))), rows = Math.max(4, Math.floor(n / cols))
  city.grid = [cols, rows]
  cancelAnimationFrame(gatherRaf)
  const from = city.gather, t0 = performance.now()
  const step = now => {
    const k = clamp((now - t0) / dur, 0, 1)
    city.gather = lerp(from, to, k)
    draw(view())
    if (k < 1) gatherRaf = requestAnimationFrame(step)
    else { gatherRaf = 0; done?.() }
  }
  gatherRaf = requestAnimationFrame(step)
  return true
}
