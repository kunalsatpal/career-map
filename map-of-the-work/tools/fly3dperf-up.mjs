// Frame timing while scrolling the 3D journey end to end. Usage: node fly3dperf.mjs <port> <url>
const [port, url] = process.argv.slice(2)
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r, { once: true }))
let id = 0; const pending = new Map(), errors = []
const send = (method, params = {}) => new Promise(resolve => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })) })
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id) } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.value
await send('Page.enable'); await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1512, height: 982, deviceScaleFactor: 2, mobile: false })
await send('Page.navigate', { url })
await sleep(700)
await ev(`(() => { window.__f = []; window.__loaf = []; window.__mark = []; const tick = t => { __f.push(t); requestAnimationFrame(tick) }; requestAnimationFrame(tick)
  try { new PerformanceObserver(l => l.getEntries().forEach(e => __loaf.push([e.startTime, e.duration, Math.round(e.renderStart ? e.renderStart - e.startTime : -1), Math.round(e.styleAndLayoutStart ? e.styleAndLayoutStart - e.startTime : -1), (e.scripts || []).map(x => (x.sourceFunctionName || x.invoker || '?') + ':' + Math.round(x.duration)).join(' ')]))).observe({ type: 'long-animation-frame', buffered: true }) } catch {}
  window.mark = n => __mark.push([n, performance.now(), Math.round(__map.cam.cy)]); return true })()`)
await sleep(4500)
if (process.argv[4]) console.log('setup →', await ev(process.argv[4]))
const wheel = async (n, dy) => { for (let i = 0; i < n; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 760, y: 520, deltaX: 0, deltaY: -dy }); await sleep(16) } }
await ev(`mark('idle'); true`); await sleep(1500)
for (const seg of ['hinge', 'gojek', 'cult', 'coast', 'iit', 'pibit', 'isles', 'isles2', 'home']) { await ev(`mark('${seg}'); true`); await wheel(50, 30); await sleep(300) }
await ev(`mark('end'); true`)
const d = await ev(`JSON.stringify({ f: __f, loaf: __loaf, mark: __mark })`).then(JSON.parse)
for (let i = 0; i < d.mark.length - 1; i++) {
  const [name, a, y] = d.mark[i], b = d.mark[i + 1][1], fr = d.f.filter(t => t >= a && t < b), gaps = fr.slice(1).map((t, k) => t - fr[k]), lf = d.loaf.filter(([t]) => t >= a && t < b)
  gaps.sort((x, z) => z - x)
  console.log(name.padEnd(8), `y ${String(y).padStart(5)}`, `fps ${(fr.length / ((b - a) / 1000)).toFixed(0).padStart(3)}`, `>25ms ${String(gaps.filter(g => g > 25).length).padStart(3)}`, `worst ${gaps.slice(0, 3).map(g => Math.round(g)).join('/')}ms`, `loaf ${lf.length}`, lf.slice(0, 3).map(([, du, rs, sl, sc]) => `${Math.round(du)}ms(render@${rs},style@${sl})[${sc}]`).join(' '))
}
console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'no errors')
ws.close(); process.exit(0)
