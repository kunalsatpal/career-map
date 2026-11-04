// =====================================================================================
// Plans: every realm is a list of structures in its own coordinates. The ink drawing and
// the standing city are both built from these, so a building always rises out of its plan.
// =====================================================================================
// Hinge buildings with previews stand complete; the remaining case studies use the construction
// treatment by default. Each room can override it with underConstruction.
const WIP_SITE = true
// Each half-built building's layout, shared by its stones (09-city) and the spells cast on it
// (16-moments): where its stones go.
// Places on the campus plan.
const onCampus = (x, y) => [realmBy.hinge.ox + x, realmBy.hinge.oy + y]

// The hall: its west end finished; east of it a timber frame in bays, each bay's stone laid to a
// [front, back] height that falls away to the east.
function hallWipPlan(q) {
  const X = q.x + 8, Y = q.y + 8, W2 = q.w - 16, D2 = q.h - 16, done = 164, n = 5, bay = (W2 - done) / n, xs = Array.from({ length: n + 1 }, (_, i) => X + done + i * bay)
  const fill = [[56, 60], [50, 56], [42, 50], [32, 42], [22, 32]]
  return { X, Y, W2, D2, done, bay, xs, fill, k: 2, targets: [[xs[3] + bay * .5, Y + D2 - 3, fill[3][0] + 4]] }
}
// A round building in N segments: those facing west (all but the east-most share, `open`) stand
// finished to `full`; the rest are laid lower the further east they face, in ragged courses.
function roundWip(cx, cy, R, N, full, low, open = .3) {
  const ang = j => (j + .5) / N * Math.PI * 2, west = j => (1 - Math.cos(ang(j))) / 2, done = j => west(j) >= open
  const h = j => done(j) ? full : Math.max(6, Math.round((low + (full - low) * west(j) / open) / 6) * 6 - (j % 2) * 6)
  const at = (j, r = R) => [cx + Math.cos(ang(j)) * r, cy + Math.sin(ang(j)) * r]
  return { N, ang, done, h, at }
}
function rotundaWipPlan(q) {
  const R0 = q.r * .86, G = roundWip(q.cx, q.cy, R0, 24, 58, 8, .62), t = j => [...G.at(j), G.h(j) + 4]
  return { ...G, R0, k: 2, targets: [t(5)] }
}
function towerWipPlan(q) {
  const R0 = q.r * .74, G = roundWip(q.cx, q.cy, R0, 16, 120, 84), t = j => [...G.at(j), G.h(j) + 4]
  return { ...G, R0, k: 2, targets: [t(1)] }
}
// The cloister: its west half finished, its east half laid in lengths that fall away to the east.
function cloisterWipPlan(q) {
  const { x, y, w, h } = q, g = 34, xm = x + w / 2 + 10, L = 20, n = Math.ceil((x + w - 4 - xm) / L), fall = i => Math.max(6, 22 - i * 3 - (i % 2) * 4)
  return { g, xm, L, n, fall, k: 2, targets: [[xm + 2.5 * L, y + h - g, fall(2) - 2]] }
}
const WIP_PLANS = { hallwip: hallWipPlan, rotundawip: rotundaWipPlan, towerwip: towerWipPlan, cloisterwip: cloisterWipPlan }
// Who raises them: one wizard on the open ground in the middle of the campus, between the crest and
// the front row, working on all four from one pile of stone. tip is where his spells start (WIZ_ORB is
// in 09-city).
const WIP_CASTERS = () => [
  { kind: 'wizard', at: onCampus(444, 252), dir: 1, k: 2, rooms: ['hinge-carehub', 'hinge-ai', 'hinge-workflows', 'hinge-video'].filter(id => ROOMS[id].underConstruction ?? WIP_SITE), pile: [...onCampus(470, 266), 8] },
]
const casterTip = C => [C.at[0] + C.dir * WIZ_ORB[0] * C.k, C.at[1], WIZ_ORB[1] * C.k]
const PLANS = {
  hinge: {
    walls: [[[0, 278], [0, 540], [740, 540], [740, 278]], [[740, 202], [740, 0], [398, 0]], [[322, 0], [0, 0], [0, 202]]], th: 10,
    towers: [[0, 540, 30], [740, 540, 30], [740, 0, 30], [0, 0, 30], [0, 282, 17], [0, 198, 17], [318, 0, 17], [402, 0, 17], [740, 282, 17], [740, 198, 17]],
    parts: [
      // Use the existing finished BUILD/DRAW pairs for previews, preserving their footprints.
      { t: (ROOMS['hinge-carehub'].underConstruction ?? WIP_SITE) ? 'hallwip' : 'hall', room: 'hinge-carehub', x: 54, y: 326, w: 300, h: 160, banners: true },
      { t: (ROOMS['hinge-ai'].underConstruction ?? WIP_SITE) ? 'rotundawip' : 'rotunda', room: 'hinge-ai', cx: 590, cy: 382, r: 92 },
      { t: WIP_SITE ? 'cloisterwip' : 'cloister', room: 'hinge-workflows', x: 60, y: 48, w: 280, h: 200 },
      { t: WIP_SITE ? 'towerwip' : 'roundtower', room: 'hinge-video', cx: 598, cy: 136, r: 70 },
      { t: 'rehab', x: 388, y: 356, w: 86, h: 128 },
      { t: 'crest', cx: 436, cy: 197, r: 34 },
      { t: 'well', cx: 446, cy: 84, r: 13 },
    ],
  },
  gojek: {
    walls: [[[238, 400], [0, 400], [0, 0], [540, 0], [540, 178]], [[540, 222], [540, 400], [282, 400]]], th: 8,
    towers: [[0, 400, 22], [540, 400, 22], [540, 0, 22], [0, 0, 22], [232, 400, 12], [288, 400, 12], [540, 228, 12], [540, 172, 12]], square: true,
    parts: [
      { t: 'market', room: 'gojek-promo', x: 36, y: 148, w: 270, h: 212 },
      { t: 'bannerhall', room: 'gojek-visits', x: 330, y: 240, w: 176, h: 124 },
      { t: 'kitchens', room: 'gojek-experiments', x: 330, y: 38, w: 176, h: 168 },
      { t: 'house', x: 36, y: 32, w: 62, h: 80 }, { t: 'house', x: 106, y: 32, w: 62, h: 80 }, { t: 'house', x: 176, y: 32, w: 62, h: 80 }, { t: 'house', x: 246, y: 32, w: 60, h: 80 },
    ],
  },
  cult: {
    walls: [[[0, 248], [0, 440], [600, 440], [600, 0], [356, 0]], [[244, 0], [0, 0], [0, 192]]], th: 9,
    towers: [[0, 440, 26], [600, 440, 26], [600, 0, 26], [0, 0, 26], [0, 254, 14], [0, 186, 14]],
    parts: [
      // The cart arcade stands first, by the road; the arena and the guild behind it.
      { t: 'shops', room: 'cult-cart', x: 24, y: 246, w: 280, h: 176 },
      { t: 'arena', room: 'cult-fitclub', cx: 440, cy: 182, r: 140 },
      { t: 'guild', room: 'cult-ds', x: 24, y: 36, w: 170, h: 138 },
      { t: 'gatehouse', room: 'cult-onboarding', x: 244, y: -38, w: 112, h: 76 },
      { t: 'house', x: 364, y: 352, w: 88, h: 62 }, { t: 'house', x: 470, y: 352, w: 88, h: 62 },
    ],
  },
  // Two isles of earlier work: IIT Roorkee's campus, its clock tower and studio either side of
  // the path, and the studio of the Cult.fit internships.
  iit: {
    walls: [], th: 8, open: true,
    towers: [],
    parts: [
      // After the James Thomason Building: its domed centre west of the path, a colonnaded wing east.
      { t: 'thomason', room: 'iit-placement', x: -10, y: 30, w: 170, h: 110 },
      { t: 'colonnade', room: 'iit-team', x: 205, y: 40, w: 130, h: 96 },
    ],
  },
  intern: {
    walls: [], th: 6, open: true,
    towers: [],
    // One studio for each summer.
    parts: [{ t: 'internhall', room: 'intern-2018', x: -22, y: -14, w: 76, h: 62 }, { t: 'internhall', room: 'intern-2019', x: 112, y: 44, w: 76, h: 62, gym: true }],
  },
  // The Field notes: one building for each post, along the path across the island.
  writing: {
    walls: [], th: 6, open: true,
    towers: [],
    parts: [
      { t: 'observatory', room: 'blog-portfolio', cx: 420, cy: 540, r: 60 },
      { t: 'gymhall', room: 'blog-curefit', x: 50, y: 370, w: 150, h: 100 },
      { t: 'clockhouse', room: 'blog-whatsapp', x: 360, y: 220, w: 120, h: 110 },
      { t: 'tent', room: 'blog-pibit', cx: 140, cy: 130, r: 46 },
    ],
  },
  home: {
    walls: [], th: 6, open: true,
    towers: [],
    parts: [
      // How I work: five pillars in an arc on the lawn, opening south to face you as you come up
      // from the bridge, read left to right.
      { t: 'pillar', kind: 'grow', room: 'work-grow', cx: 42, cy: 1143, r: 24 },
      { t: 'pillar', kind: 'strategy', room: 'work-strategy', cx: 133, cy: 1018, r: 24 },
      { t: 'pillar', kind: 'data', room: 'work-data', cx: 280, cy: 970, r: 24 },
      { t: 'pillar', kind: 'tools', room: 'work-tools', cx: 427, cy: 1018, r: 24 },
      { t: 'pillar', kind: 'code', room: 'work-code', cx: 518, cy: 1143, r: 24 },
      { t: 'garden', x: 0, y: 180, w: 420, h: 520 },
      { t: 'lift', room: 'life-lift', x: 30, y: 296, w: 80, h: 82 },
      { t: 'reading', room: 'life-books', x: 204, y: 290, w: 110, h: 60 },
      { t: 'games', room: 'life-games', x: 44, y: 450, w: 92, h: 44 },
      { t: 'noodles', room: 'life-anime', x: 264, y: 444, w: 74, h: 50 },
      { t: 'feast', room: 'life-people', x: 146, y: 548, w: 108, h: 92 },
      { t: 'lighthouse', room: 'home-hello', cx: 300, cy: 70, r: 46 },
    ],
  },
}
// On the larger isle (BATCH.biggerIsle) the lighthouse, its cottage and its post box stand a third
// taller, so they still hold their own beside the yard.
const LIGHTHOUSE_K = BATCH.biggerIsle ? 1.35 : 1
PLANS.home.parts.find(p => p.t === 'lighthouse').r *= LIGHTHOUSE_K
// About me's yard, pushed out to use more of the island (BATCH.biggerYard): the hedge stops short of
// the shore, the path and the lighthouse, and what stands inside spreads out to match.
if (BATCH.biggerYard) {
  const P = PLANS.home.parts, g = P.find(p => p.t === 'garden'), to = BATCH.biggerIsle ? { x: -75, y: 170, w: 530, h: 525 } : { x: -20, y: 170, w: 475, h: 525 }, sx = to.w / g.w, sy = to.h / g.h
  for (const p of P) if (p.room?.startsWith('life-')) { const cx = p.x + p.w / 2, cy = p.y + p.h / 2; p.x = Math.round(to.x + (cx - g.x) * sx - p.w / 2); p.y = Math.round(to.y + (cy - g.y) * sy - p.h / 2) }
  Object.assign(g, to)
}
// With one promo building (BATCH.onePromo), the banner hall goes; the market square widens into its place,
// and the kitchens move up into the top row beside the houses.
if (BATCH.onePromo) {
  const P = PLANS.gojek.parts
  P.splice(P.findIndex(p => p.room === 'gojek-visits'), 1)
  Object.assign(P.find(p => p.room === 'gojek-promo'), { y: 156, w: 470, h: 204 })
  Object.assign(P.find(p => p.room === 'gojek-experiments'), { y: 32, h: 108 })
}
// Promo experiments, a year of tests, stands as a science tower in place of the kitchens (BATCH.labTower).
if (BATCH.labTower) PLANS.gojek.parts.find(p => p.room === 'gojek-experiments').t = 'labtower'
// The plan of each part in world coordinates, for hit-testing, focus and the standing city.
const PARTS = []
for (const R0 of REALMS) for (const p of PLANS[R0.key].parts) {
  const q = { ...p, realm: R0.key }
  if ('x' in p) { q.x += R0.ox; q.y += R0.oy; q.c = [q.x + q.w / 2, q.y + q.h / 2]; q.size = Math.max(q.w, q.h) }
  else { q.cx += R0.ox; q.cy += R0.oy; q.c = [q.cx, q.cy]; q.size = q.r * 2 }
  if (p.tower) q.tower = [p.tower[0] + R0.ox, p.tower[1] + R0.oy, p.tower[2]]
  PARTS.push(q)
  if (p.room) ROOMS[p.room].part = q
}
for (const S of STOPS) { const q = { t: S.build || 'hut', room: S.id, realm: 'earlier', x: S.x - 17, y: S.y - 22, w: 34, h: 28, c: [S.x, S.y + 10], size: S.r * 2.4 }; PARTS.push(q); ROOMS[S.id].part = q }
for (const R0 of REALMS) R0.box = { x0: R0.ox - 70, y0: R0.oy - 110, x1: R0.ox + R0.w + 70, y1: R0.oy + R0.h + 70 }
const ISLES = STOPS.reduce((b, S) => ({ x0: Math.min(b.x0, S.x - S.r - 70), y0: Math.min(b.y0, S.y - S.r - 70), x1: Math.max(b.x1, S.x + S.r + 70), y1: Math.max(b.y1, S.y + S.r + 90) }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity })
const boxOf = key => key === 'earlier' ? ISLES : realmBy[key].box

// ---------- The levels: every piece of work, numbered along the road ----------
const roadS = sample(ROAD, 6), laneS = sample(LANE, 6), isleS2 = sample(ISLEPATH, 6), PATH_ALL = [...roadS, ...laneS, ...isleS2]
// Where the road is at a given height (it only ever runs north).
function pathAtY(y, pts = PATH_ALL) {
  for (let i = 1; i < pts.length; i++) if (pts[i][1] <= y) { const a = pts[i - 1], b = pts[i], t = (a[1] - y) / Math.max(1e-6, a[1] - b[1]); return [lerp(a[0], b[0], clamp(t, 0, 1)), y] }
  return pts.at(-1)
}
const LEVEL_Y = {
  'hinge-carehub': 7330, 'hinge-ai': 7170, 'hinge-workflows': 7010, 'hinge-video': 6850,
  'gojek-promo': 6290, 'gojek-visits': 6130, 'gojek-experiments': 5970,
  'cult-cart': 5400, 'cult-fitclub': 5250, 'cult-ds': 5100, 'cult-onboarding': 4950,
  'iit-placement': 4150, 'iit-team': 4145, 'intern-2018': 3760, 'intern-2019': 3750,
  'blog-portfolio': 2870, 'blog-curefit': 2730, 'blog-whatsapp': 2590, 'blog-pibit': 2450,
  'work-grow': 1926, 'work-strategy': 1916, 'work-data': 1906, 'work-tools': 1896, 'work-code': 1886, 'life-people': 1304, 'life-games': 1190, 'life-anime': 1170, 'life-lift': 1038, 'life-books': 1022, 'home-hello': 780,
}
const LEVELS = []
for (const [id, B] of Object.entries(ROOMS)) {
  const p = B.stop ? [STOPS.find(S => S.id === id).x, STOPS.find(S => S.id === id).y] : pathAtY(LEVEL_Y[id])
  const part = B.part, side = part ? Math.sign(part.c[0] - p[0]) || 1 : 1
  LEVELS.push({ id, x: p[0], y: p[1], side, world: B.world || (B.stop || realmBy[B.realm]?.minor ? 'earlier' : B.realm) })
}
LEVELS.sort((a, b) => b.y - a.y).forEach((L, i) => { L.n = i + 1 })
const levelOf = Object.fromEntries(LEVELS.map(L => [L.id, L]))
const worldOf = key => WORLDS.find(w => w.key === key)
