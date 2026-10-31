// =====================================================================================
// The opening (BATCH.calmOpen), as on the first cover: a blank sheet while the page warms up, then the
// ink spreads out from the middle until the whole map has appeared. A WebGL sheet over the page shows
// the bare paper (the very paper the map is drawn on, before any wash or ink) wherever the ink has not
// reached yet, with a dark wet rim at the front. The eye holds still, straight down, until it is done.
// =====================================================================================
const FS_SPREAD = `#version 300 es
precision highp float;
uniform sampler2D uBare; uniform vec2 uRes, uFrom; uniform float uT, uDpr; uniform vec3 uInk;
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0., a = .5; for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= .5; } return s; }
void main() {
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  // Distance from where the ink starts, roughened like ink finding the paper's grain.
  float d = distance(css, uFrom) / length(uRes / uDpr) * 1.3 + (fbm(css / 120.) - .5) * .16 + (fbm(css / 18.) - .5) * .03;
  float front = mix(-.12, .8, uT);
  float cover = smoothstep(front - .012, front + .012, d);
  float rim = exp(-pow((d - front) / .02, 2.)) * (1. - cover * .6) * (1. - smoothstep(.8, 1., uT));
  vec3 bare = texture(uBare, vec2(gl_FragCoord.x / uRes.x, 1. - gl_FragCoord.y / uRes.y)).rgb;
  vec3 c = mix(bare, mix(uInk, bare * .55, .25), rim * .6);
  // Very slightly see-through while it covers, so the page beneath is still drawn (and warmed up).
  float a = max(cover * .994, rim * .55);
  o = vec4(c * a, a);
}`
// The bare sheet in view, laid out the way the ground lays out the paper and its grain.
function bareSheet(dpr) {
  const c = document.createElement('canvas'); c.width = Math.round(VW * dpr); c.height = Math.round(VH * dpr)
  const g = c.getContext('2d'), v = view(), [x0, y0] = project(0, 0, 0, v), [x1, y1] = project(1000, 1000, 0, v)
  // Past the paper's edge (low on a phone, straight down) there is only the mist.
  g.fillStyle = `rgb(${MIST.map(n => Math.round(n * 255))})`; g.fillRect(0, 0, c.width, c.height)
  g.setTransform((x1 - x0) / 1000 * dpr, 0, 0, (y1 - y0) / 1000 * dpr, x0 * dpr, y0 * dpr)
  g.translate(-PM, -PMN)
  g.drawImage(BARE, 0, 0, W + 2 * PM, H + PM + PMN)
  g.fillStyle = g.createPattern(grainTile(), 'repeat'); g.fillRect(0, 0, W + 2 * PM, H + PM + PMN)
  return c
}
// Sets the blank sheet over the loader; returns null where WebGL2 is missing, and the plain paper
// veil simply fades instead.
function prepareSpread(loader) {
  try {
    let gone = false
    const dpr = DPR(), cvs = document.createElement('canvas')
    cvs.width = Math.round(VW * dpr); cvs.height = Math.round(VH * dpr); cvs.setAttribute('aria-hidden', 'true')
    const g = cvs.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false })
    if (!g) throw new Error('no webgl2')
    const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); return s }
    const p = g.createProgram(); g.attachShader(p, sh(g.VERTEX_SHADER, VS_FULL)); g.attachShader(p, sh(g.FRAGMENT_SHADER, FS_SPREAD)); g.linkProgram(p)
    const bare = bareSheet(dpr); BARE = null
    let uT = null, ready = false
    const draw = t => { g.viewport(0, 0, cvs.width, cvs.height); g.uniform1f(uT, t); g.drawArrays(g.TRIANGLES, 0, 3) }
    // The program builds off the main thread where it can; the flat veil holds until it is ready, then
    // the sheet is laid and the veil under it goes.
    const lay = () => {
      if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p))
      const tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tex)
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, bare)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
      g.useProgram(p); g.uniform1i(g.getUniformLocation(p, 'uBare'), 0)
      g.uniform2f(g.getUniformLocation(p, 'uRes'), cvs.width, cvs.height); g.uniform1f(g.getUniformLocation(p, 'uDpr'), dpr)
      g.uniform2f(g.getUniformLocation(p, 'uFrom'), cam.ax, cam.ay); g.uniform3f(g.getUniformLocation(p, 'uInk'), ...INK)
      uT = g.getUniformLocation(p, 'uT'); draw(0); loader.appendChild(cvs); ready = true
      requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add('sheet')))
    }
    const par = g.getExtension('KHR_parallel_shader_compile')
    if (!par) lay()
    else { const poll = () => { if (gone) return; if (!g.getProgramParameter(p, par.COMPLETION_STATUS_KHR)) return requestAnimationFrame(poll); try { lay() } catch (err) { console.warn('spread unavailable:', err.message); gone = true } }; requestAnimationFrame(poll) }
    const drop = () => { g.getExtension('WEBGL_lose_context')?.loseContext(); cvs.remove() }
    // The sheet was laid for this window; if it changes before the ink spreads, the veil takes over.
    const onResize = () => { gone = true; loader.classList.remove('sheet'); drop() }
    // addEventListener('resize', onResize, { once: true })
    return {
      // The ink spreads; the promise settles when it has reached the corners. Null if the sheet never
      // got laid (the veil then simply fades).
      run(dur = 2400) {
        removeEventListener('resize', onResize)
        if (gone || !ready) { drop(); return null }
        loader.classList.add('spreading')
        return new Promise(done => {
          const t0 = performance.now()
          const step = now2 => { const t = clamp((now2 - t0) / dur, 0, 1); draw(1 - Math.pow(1 - t, 1.8)); if (t < 1) requestAnimationFrame(step); else { drop(); done() } }
          requestAnimationFrame(step)
        })
      },
    }
  } catch (err) { console.warn('spread unavailable:', err.message); BARE = null; return null }
}
