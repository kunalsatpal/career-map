// Camera smoothness under a steady scroll: per-frame changes in pitch, yaw, zoom and on-screen speed.
const [port, url] = process.argv.slice(2)
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r, { once: true }))
let id = 0; const pending = new Map()
const send = (method, params = {}) => new Promise(resolve => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })) })
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id) } })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.value
await send('Page.enable'); await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1512, height: 982, deviceScaleFactor: 2, mobile: false })
await send('Page.navigate', { url }); await sleep(5000)
await ev(`(() => { window.__s = []; const tick = t => { const v = __map.view(); __s.push([t, __map.cam.cy, Math.asin(v.sp) * 57.3, Math.atan2(v.r[1], v.r[0]) * 57.3, v.s]); if (__s.length < 20000) requestAnimationFrame(tick) }; requestAnimationFrame(tick); return 1 })()`)
// A steady notched wheel: one notch every 50 ms, like a mouse wheel turned evenly.
for (let i = 0; i < 300; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 760, y: 520, deltaX: 0, deltaY: -100 }); await sleep(50) }
await sleep(1500)
const s = await ev(`__s`)
const seg = [[8000, 6600, 'hinge'], [6600, 5600, 'gojek'], [5600, 4600, 'cult'], [4600, 3000, 'coast+isles'], [3000, 1600, 'notes'], [1600, 0, 'kunal']]
for (const [a, b, name] of seg) {
  const fr = []
  for (let i = 1; i < s.length; i++) if (s[i][1] <= a && s[i][1] > b && s[i - 1][1] !== s[i][1]) fr.push(i)
  if (!fr.length) continue
  let dp = 0, dy = 0, dz = 0, spd = []
  for (const i of fr) { dp = Math.max(dp, Math.abs(s[i][2] - s[i - 1][2])); dy = Math.max(dy, Math.abs(s[i][3] - s[i - 1][3])); dz = Math.max(dz, Math.abs(s[i][4] / s[i - 1][4] - 1)); spd.push(Math.abs(s[i][1] - s[i - 1][1]) * s[i][4]) }
  spd.sort((x, y) => x - y)
  const p10 = spd[Math.floor(spd.length * .1)], p90 = spd[Math.floor(spd.length * .9)]
  console.log(name.padEnd(12), 'frames', String(fr.length).padStart(4), 'max Δpitch/frame', dp.toFixed(2) + '°', 'max Δyaw/frame', dy.toFixed(2) + '°', 'max zoom step', (dz * 100).toFixed(2) + '%', 'screen speed p90/p10', (p90 / Math.max(.01, p10)).toFixed(1) + '×')
}
ws.close(); process.exit(0)
