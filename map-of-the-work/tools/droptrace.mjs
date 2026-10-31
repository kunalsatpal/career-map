// Dropped frames while scrolling the journey, from Chrome's own frame reporter (vsync on).
// Usage: node droptrace.mjs <port> <url> [setupJs]
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
await send('Tracing.start', { categories: 'cc,benchmark,disabled-by-default-devtools.timeline.frame', transferMode: 'ReportEvents' })
await ev(`window.__marks = []; true`)
const wheel = async (n, dy) => { for (let i = 0; i < n; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 760, y: 520, deltaX: 0, deltaY: dy }); await sleep(16) } }
const segs = ['hinge', 'gojek', 'cult', 'coast', 'earlier', 'notes', 'kunal']
for (const s of segs) { await ev(`__marks.push(['${s}', performance.timeOrigin + performance.now(), Math.round(__map.cam.cy)]); true`); await wheel(45, -30); await sleep(250) }
const marks = await ev(`__marks`)
const fin = new Promise(r => { done = r }); await send('Tracing.end'); await fin
const names = {}; for (const e of events) names[e.name] = (names[e.name] || 0) + 1
const reps = events.filter(e => e.name === 'PipelineReporter' && (e.ph === 'b' || e.ph === 'X') && e.args?.frame_reporter && e.args.frame_reporter.state !== 'STATE_NO_UPDATE_DESIRED')
const hosts = {}
for (const r of reps) { const fr = r.args.frame_reporter, k = r.pid + '/' + fr.layer_tree_host_id; (hosts[k] ||= { n: 0, st: {}, t0: Infinity, t1: -Infinity, main: 0, smooth: 0 }); const h = hosts[k]; h.n++; h.st[fr.state] = (h.st[fr.state] || 0) + 1; h.t0 = Math.min(h.t0, r.ts); h.t1 = Math.max(h.t1, r.ts); if (fr.has_main_animation) h.main++; if (fr.affects_smoothness) h.smooth++ }
for (const [k, h] of Object.entries(hosts)) console.log('host', k, 'frames', h.n, 'over', Math.round((h.t1 - h.t0) / 1000), 'ms', JSON.stringify(h.st), 'mainAnim', h.main, 'affectsSmooth', h.smooth)
// The page's own compositor: the host with the most frames that carry main-thread animation.
const pageKey = Object.entries(hosts).sort((a, b) => b[1].main - a[1].main)[0][0]
const page = reps.filter(r => r.pid + '/' + r.args.frame_reporter.layer_tree_host_id === pageKey).sort((a, b) => a.ts - b.ts)
// Runs of frames where the camera did not move on screen: PARTIAL or DROPPED while main-thread animation is active.
const bad = page.filter(r => r.args.frame_reporter.has_main_animation && r.args.frame_reporter.state !== 'STATE_PRESENTED_ALL')
const good = page.filter(r => r.args.frame_reporter.has_main_animation && r.args.frame_reporter.state === 'STATE_PRESENTED_ALL')
console.log('page frames with camera animating:', good.length + bad.length, 'presented with update:', good.length, 'without:', bad.length, `(${Math.round(bad.length / Math.max(1, good.length + bad.length) * 100)}%)`)
// The sequence of frames, as letters: A presented with the camera's update, p without, D dropped.
const seq = page.filter(r => r.args.frame_reporter.has_main_animation).map(r => { const st = r.args.frame_reporter.state; return st === 'STATE_PRESENTED_ALL' ? 'A' : /DROPPED/.test(st) ? 'D' : 'p' }).join('')
const runs = seq.match(/(.)\1*/g) || [], hist = {}
for (const r of runs) { const k = r[0] + (r.length > 8 ? '>8' : r.length); hist[k] = (hist[k] || 0) + 1 }
console.log('runs:', JSON.stringify(hist));
{ const an = page.filter(r => r.args.frame_reporter.has_main_animation), span = (an.at(-1).ts - an[0].ts) / 1e6
  const bmf = events.filter(e => e.name === 'ProxyMain::BeginMainFrame' && e.ph === 'X' && e.pid === an[0].pid && e.ts >= an[0].ts && e.ts <= an.at(-1).ts).length
  console.log('compositor frames/s', (an.length / span).toFixed(1), 'main frames/s', (bmf / span).toFixed(1), 'over', span.toFixed(1), 's') } console.log('sample:', seq.slice(400, 640))
const reasons = {}; for (const r of bad) { const fr = r.args.frame_reporter; const k = Object.entries(fr).filter(([kk, v]) => v === true).map(([kk]) => kk).join(',') + ' ' + fr.state; reasons[k] = (reasons[k] || 0) + 1 }
console.log('bad-frame flags:', JSON.stringify(reasons).slice(0, 600))
ws.close(); process.exit(0)
