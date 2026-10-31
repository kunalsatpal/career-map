// Hover hit area: for each building name in view, sweep the mouse over a grid below its name
// and count the points that open that building. Usage: node hovercheck.mjs <port> <url> <y,y,...>
const [port, url, ys] = process.argv.slice(2)
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r, { once: true }))
let id = 0; const pending = new Map()
const send = (method, params = {}) => new Promise(resolve => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })) })
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id) } })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.value
await send('Page.enable'); await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1512, height: 982, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url }); await sleep(5000)
const move = (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, pointerType: 'mouse' })
let total = 0, n = 0
for (const y of ys.split(',')) {
  await ev(`__map.flyTo(0, ${y}, 0, 10); true`); await sleep(5000)
  const labs = await ev(`[...document.querySelectorAll('.lvl:not(.start)')].filter(e => e.style.visibility !== 'hidden').map(e => { const m = e.style.transform.match(/translate3d\\(([-\\d.]+)px, ?([-\\d.]+)px/); return m && { id: e.dataset.id, x: +m[1], y: +m[2] } }).filter(p => p && p.x > 80 && p.x < 1430 && p.y > 120 && p.y < 860)`)
  for (const L of labs) {
    let hits = 0, pts = 0
    for (let dy = 0; dy <= 100; dy += 10) for (let dx = -60; dx <= 60; dx += 12) {
      await move(L.x + dx, L.y + dy); await sleep(28); pts++
      if (await ev(`document.querySelector('.lvl.peek')?.dataset.id || ''`) === L.id) hits++
    }
    await move(5, 500); await sleep(700)
    console.log(`y ${y}  ${L.id.padEnd(18)} ${String(hits).padStart(3)} / ${pts} grid points`)
    total += hits; n++
  }
}
console.log(`average ${(total / n).toFixed(1)} points per building over ${n} buildings`)
ws.close()
