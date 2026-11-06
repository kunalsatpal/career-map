// =====================================================================================
// Phones, third pass (00-batches.js: phoneFrame, phoneLayers, phoneLite). Everything here runs only on a
// touch phone (PHONE, 01-util.js); on a desktop or laptop none of it is reached.
// =====================================================================================

// Where the eye looks across, on a phone (BATCH.phoneFrame). The road swings from side to side while a
// phone shows only a narrow strip of the sheet, so a city beside the road was left half off the screen
// with no way to pan to it. Here the eye follows the buildings near the place being looked at, weighted
// by size, and the road only where there are none (the sea, the open land between worlds). The weights
// are smooth along the road, so the eye eases across as you travel; it never strays far from the road.
function phoneX(y) {
  const road = lerp(W / 2, eyeX(y), .95)
  const P = phoneX.pts ||= PARTS.map(p => [p.c[0], p.c[1], Math.sqrt(p.size)])
  const at = y - 100
  let sw = 0, sx = 0
  for (const [x, py, k] of P) { const w = k * Math.exp(-(((py - at) / 450) ** 2)); sw += w; sx += w * x }
  if (sw < 1e-6) return road
  const want = clamp(sx / sw, road - 320, road + 320)
  return lerp(road, want, smoothstep(4, 30, sw))
}

// Called with every picture on a phone (19-boot onRender).
function phoneRender(v) {
  if (PHONE_LAYERS) cullBands(v)
  if (PHONE_LITE) watchFrames()
}

// The ink drawing is one SVG per world, each its own compositor layer. Worlds wholly behind the eye or
// beyond the far edge of the view leave the sheet (display: none) until they come back into range, so
// the compositor carries two or three of them, not ten.
function cullBands(v) {
  const B = cullBands.list ||= [...ground.querySelectorAll('svg.band')].map(el => { const y0 = parseFloat(el.style.top); return { el, y0, y1: y0 + +el.getAttribute('height'), on: true } })
  const gv = groundView(v), lo = gv.y0 - 400, hi = gv.y1 + 400
  for (const b of B) {
    const on = b.y1 > lo && b.y0 < hi
    if (on !== b.on) { b.on = on; b.el.style.display = on ? '' : 'none' }
  }
}

// A phone that can't keep up (BATCH.phoneLite). While the map is moving (the opening lean-in included),
// the time between pictures is watched in runs of 16; if 12 of a run took longer than 60 ms (well under 20
// a second, held for a second or more, not a passing stall) the 3D city and the tilted camera are let go,
// and the map carries on as its flat ink drawing, the way it shows without WebGL2. One way only, for the
// rest of the visit. Nothing is timed while the map stands still or a page is open.
function watchFrames() {
  const S = watchFrames.s ||= { last: 0, n: 0, slow: 0 }
  if (!TILT || caseId || document.hidden) { S.last = 0; return }
  const t = document.timeline.currentTime, dt = t - S.last
  if (dt <= 0) return
  S.last = t
  if (dt > 2500 || !document.body.classList.contains('moving')) return
  S.n++; if (dt > 60) S.slow++
  if (S.n < 16) return
  if (S.slow >= 12) goLite()
  S.n = S.slow = 0
}
function goLite() {
  if (!TILT) return
  console.info('This phone can’t keep up with the 3D map: switching to the flat ink map.')
  const ctx = gl
  failGL(new Error('too slow on this phone'))
  cv.style.display = 'none'
  try { ctx?.getExtension('WEBGL_lose_context')?.loseContext() } catch {}
  document.body.classList.add('lite')
  cam.intro = 0; clampCam(); render()
}
// WebGL drawn on the CPU (a phone whose graphics chip the browser won't use): the 3D city would run at a
// frame or two a second there.
function softwareGL(g) {
  const ext = g.getExtension('WEBGL_debug_renderer_info')
  const name = String(ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER))
  return /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(name)
}
