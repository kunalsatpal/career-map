// Phone-sized scene shots of the 3D city map, plus where each building label sits in each picture.
// Usage (from repo root): node tools/phoneshots.mjs <port> [reviewDir]
// Writes site/m/<key>.webp and src/phone-scenes.json; with reviewDir also writes scene-<key>.png there.
import { writeFileSync, mkdirSync, statSync } from 'node:fs'

// ---- config: hand-tune here ----
const SCENES = [
  { key: 'title',   y: 8000, ids: null, clip: [170, 0, 570, 590] },   // the start of the road: the backdrop of the phone's title
  { key: 'hinge',   y: 6900, ids: /^hinge-/ },
  { key: 'gojek',   y: 5950, ids: /^gojek-/ },
  { key: 'cult',    y: 5050, ids: /^cult-/ },
  { key: 'earlier', y: 3800, ids: /^(iit-|intern-|stop-)/, clip: [138, 340, 624, 590] },
  { key: 'writing', y: 2600, ids: /^blog-/, clip: [168, 474, 560, 420] },
  { key: 'work',    y: 1900, ids: /^work-/, clip: [200, 462, 500, 300] },
  { key: 'home',    y: 1000, ids: /^(life-|home-)/, clip: [92, 292, 560, 540] },
  // optional: clip: [x, y, w, h] in CSS px of the 900x1100 viewport
]
const VW = 900, VH = 1100

const [port, reviewDir] = process.argv.slice(2)
const repo = process.cwd()
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ---- inline CDP connection (copy of the scratchpad cdp.mjs helper) ----
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r, { once: true }))
let msgId = 0; const pending = new Map()
const send = (method, params = {}) => new Promise(res => { const i = ++msgId; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id) } })
const ev = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error('EVAL ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
  return r.result?.value
}

// ---- crop: bbox of label centres, grown, then made 0.8..1.0 portrait-ish ----
function autoClip(pts) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  const x0 = Math.min(...xs) - 190, x1 = Math.max(...xs) + 190
  const y0 = Math.min(...ys) - 230, y1 = Math.max(...ys) + 190
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  let w = Math.max(x1 - x0, 560), h = y1 - y0
  if (w / h > 1.0) h = w
  if (w / h < 0.8) w = h * 0.8
  w = Math.min(Math.round(w), VW); h = Math.min(Math.round(h), VH)
  const x = Math.max(0, Math.min(Math.round(cx - w / 2), VW - w))
  const y = Math.max(0, Math.min(Math.round(cy - h / 2), VH - h))
  return { x, y, w, h }
}

// ---- run ----
await send('Page.enable'); await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: 2, mobile: false })
await send('Page.navigate', { url: `file://${repo}/index.html?open` })
await sleep(9000)
let ready = false
for (let t = 0; t < 20 && !ready; t++) { ready = (await ev('!!(window.__map && __map.city && __map.city.ready)')) === true; if (!ready) await sleep(1000) }
if (!ready) throw new Error('__map.city.ready never became true')

mkdirSync(`${repo}/site/m`, { recursive: true })
mkdirSync(`${repo}/src`, { recursive: true })
if (reviewDir) mkdirSync(reviewDir, { recursive: true })

const out = {}
for (const s of SCENES) {
  await ev(`__map.flyTo(0, ${s.y}, 0, 10); true`)
  await sleep(5000)

  // read label positions while labels are still visible
  const all = await ev(`[...document.querySelectorAll('.lvl')].map(e => { const r = e.getBoundingClientRect(); return { id: e.dataset.id, hidden: e.style.visibility === 'hidden', x: r.left + r.width / 2, y: r.top + r.height / 2 } })`)
  const inView = !s.ids ? [] : all.filter(l => l.id && s.ids.test(l.id) && !l.hidden && l.x >= 0 && l.x <= VW && l.y >= 0 && l.y <= VH)
  if (s.ids && !inView.length) throw new Error(`${s.key}: no visible labels in view`)

  // hide UI for the picture (rects are kept under opacity:0)
  await ev(`(() => { if (!document.getElementById('shots-hide')) { const st = document.createElement('style'); st.id = 'shots-hide'; st.textContent = '.ui, #labels, #leader, #panel, .where, #rail, .lab { opacity: 0 !important; transition: none !important; animation: none !important; }'; document.head.append(st) } return true })()`)
  await sleep(300)

  const clip = s.clip ? { x: s.clip[0], y: s.clip[1], w: s.clip[2], h: s.clip[3] } : autoClip(inView)

  const pins = {}
  for (const p of inView) {
    const px = (p.x - clip.x) / clip.w * 100, py = (p.y - clip.y) / clip.h * 100
    if (px >= 0 && px <= 100 && py >= 0 && py <= 100) pins[p.id] = [+px.toFixed(1), +py.toFixed(1)]
  }

  const cdpClip = { x: clip.x, y: clip.y, width: clip.w, height: clip.h, scale: 1 }
  const webp = await send('Page.captureScreenshot', { format: 'webp', quality: 82, clip: cdpClip })
  const imgPath = `${repo}/site/m/${s.key}.webp`
  writeFileSync(imgPath, Buffer.from(webp.data, 'base64'))
  if (reviewDir) {
    const png = await send('Page.captureScreenshot', { format: 'png', clip: { ...cdpClip, scale: 0.5 } })
    writeFileSync(`${reviewDir}/scene-${s.key}.png`, Buffer.from(png.data, 'base64'))
  }

  out[s.key] = { img: `site/m/${s.key}.webp`, w: clip.w * 2, h: clip.h * 2, pins }
  const kb = (statSync(imgPath).size / 1024).toFixed(0)
  console.log(`${s.key.padEnd(8)} clip [${clip.x}, ${clip.y}, ${clip.w}, ${clip.h}]  pins ${Object.keys(pins).length}  ${kb} KB`)
}

writeFileSync(`${repo}/src/phone-scenes.json`, JSON.stringify(out, null, 2) + '\n')
console.log(`wrote src/phone-scenes.json (${Object.keys(out).length} scenes)`)
ws.close()
