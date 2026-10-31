// Does the camera ever move against the scroll? Sends trackpad-like flicks (a burst that decays,
// like momentum), mouse-wheel spins, and sloppy diagonal swipes, all forward; counts frames where
// the camera moves backward.
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
await ev(`__map.flyTo(0, 7600, 0, 10); true`); await sleep(1500)
await ev(`(() => { window.__s = []; const tick = () => { __s.push(__map.cam.cy); if (__s.length < 30000) requestAnimationFrame(tick) }; requestAnimationFrame(tick); return 1 })()`)
const wheel = (dx, dy) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 760, y: 520, deltaX: dx, deltaY: dy })
const test = async (name, fn) => {
  await ev(`__map.flyTo(0, 7600, 0, 10); true`); await sleep(1200)
  const a = await ev('__s.length'); await fn(); await sleep(1600); const s = await ev(`__s.slice(${a})`)
  let back = 0, worst = 0, fwd = 0
  for (let i = 1; i < s.length; i++) { const d = s[i] - s[i - 1]; if (d > .5) { back++; worst = Math.max(worst, d) } else if (d < -.5) fwd++ }
  console.log(name.padEnd(22), 'frames forward', String(fwd).padStart(4), 'backward', String(back).padStart(3), 'worst backward step', worst.toFixed(1), 'cy', Math.round(s[0]), '→', Math.round(s.at(-1)))
}
// Forward is a negative deltaY (scroll up).
await test('trackpad flicks', async () => { for (let k = 0; k < 4; k++) { for (let i = 0; i < 40; i++) { await wheel(0, -Math.max(2, 140 * Math.exp(-i / 9))); await sleep(16) } await sleep(120) } })
await test('fast wheel then stop', async () => { for (let k = 0; k < 3; k++) { for (let i = 0; i < 14; i++) { await wheel(0, -100); await sleep(14) } await sleep(700) } })
await test('diagonal swipes', async () => { for (let i = 0; i < 60; i++) { await wheel(i % 3 ? 160 : -40, -60); await sleep(16) } })
await test('slow wheel', async () => { for (let i = 0; i < 20; i++) { await wheel(0, -100); await sleep(180) } })
ws.close(); process.exit(0)
