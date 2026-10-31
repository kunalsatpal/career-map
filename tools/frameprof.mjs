// Main-thread time per frame while scrolling (vsync on), split by where it goes.
const [port, url, setup] = process.argv.slice(2)
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r, { once: true }))
let id = 0; const pending = new Map(), events = []; let done
const send = (method, params = {}) => new Promise(resolve => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })) })
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id) }
  if (m.method === 'Tracing.dataCollected') events.push(...m.params.value); if (m.method === 'Tracing.tracingComplete') done() })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.value
await send('Page.enable'); await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1512, height: 982, deviceScaleFactor: 2, mobile: false })
await send('Page.navigate', { url }); await sleep(5000)
if (setup) console.log('setup →', await ev(setup))
await ev(`__map.flyTo(0, ${process.argv[5] || 4700}, 0, 10); true`); await sleep(4000)
if (process.argv[6]) console.log('setup2 →', await ev(process.argv[6]))
await send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink,cc,gpu', transferMode: 'ReportEvents' })
for (let i = 0; i < 120; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 760, y: 520, deltaX: 0, deltaY: -25 }); await sleep(16) }
await sleep(300)
const fin = new Promise(r => { done = r }); await send('Tracing.end'); await fin
// Renderer main thread: the thread with the most FunctionCall time.
const byTid = {}
for (const e of events) if (e.ph === 'X' && e.dur && (e.name === 'FunctionCall' || e.name === 'FireAnimationFrame')) byTid[e.pid + ':' + e.tid] = (byTid[e.pid + ':' + e.tid] || 0) + e.dur
const main = Object.entries(byTid).sort((a, b) => b[1] - a[1])[0][0]
const top = {}
for (const e of events) if (e.ph === 'X' && e.dur && (e.pid + ':' + e.tid) === main) top[e.name] = (top[e.name] || 0) + e.dur
let t0 = Infinity, t1 = -Infinity; for (const e of events) if (e.ts && (e.pid + ':' + e.tid) === main) { t0 = Math.min(t0, e.ts); t1 = Math.max(t1, e.ts + (e.dur || 0)) }
console.log('main thread window ms', Math.round((t1 - t0) / 1000))
// Per main frame: how long each BeginMainFrame took, and what inside it.
const bmf = events.filter(e => e.ph === 'X' && e.name === 'ProxyMain::BeginMainFrame' && (e.pid + ':' + e.tid) === main).sort((a, b) => a.ts - b.ts)
const durs = bmf.map(e => e.dur / 1000).sort((a, b) => a - b), q = f => durs[Math.floor(durs.length * f)]
console.log('main frames', durs.length, 'ms p50', q(.5)?.toFixed(1), 'p90', q(.9)?.toFixed(1), 'p99', q(.99)?.toFixed(1))
const parts = ['FireAnimationFrame', 'UpdateLayoutTree', 'Layout', 'LocalFrameView::RunPaintLifecyclePhase', 'Layerize', 'Commit', 'PrePaint', 'Paint', 'HitTest', 'UpdateLayer', 'ScrollingCoordinator::UpdateAfterPaint']
const inside = Object.fromEntries(parts.map(n => [n, 0]))
for (const e of events) if (e.ph === 'X' && e.dur && (e.pid + ':' + e.tid) === main && inside[e.name] !== undefined) inside[e.name] += e.dur / 1000
console.log('per main frame avg ms:', Object.entries(inside).map(([n, d]) => n.replace('LocalFrameView::', '') + ' ' + (d / Math.max(1, durs.length)).toFixed(2)).join(' | '))
for (const [n, d] of Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 22)) console.log(String(Math.round(d / 1000)).padStart(6), n)
// GPU process main: total busy
const gpu = {}; for (const e of events) if (e.ph === 'X' && e.dur && /Gpu|CommandBuffer|GLES2DecoderPassthroughImpl|Display/.test(e.name)) gpu[e.name] = (gpu[e.name] || 0) + e.dur
console.log('gpu-ish:', Object.entries(gpu).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, d]) => n + ' ' + Math.round(d / 1000)).join(' | '))
ws.close(); process.exit(0)
