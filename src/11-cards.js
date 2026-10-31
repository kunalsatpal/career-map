// =====================================================================================
// Pop-ups. The engraved woods, hills and mountains, and the trees along the road, are cut
// out of the sheet like the pages of a pop-up book: they lie flat in the distance, fold up
// off the paper as you come near, and throw their shadows on the land.
// =====================================================================================
const CARD_KIND = { forest: 0, mountain: 1, hill: 2, tree: 3 }
const CARD_BACK = [col3(89, .05, 128), col3(91, .032, 76), col3(90, .045, 108), col3(78, .085, 134)].flat()
const VS_CARD = `#version 300 es
precision highp float;
layout(location=0) in vec2 aC;
layout(location=1) in vec4 b1; layout(location=2) in vec4 b2; layout(location=3) in vec4 b3;
uniform mat4 uVP; uniform float uCamY, uLie; uniform vec2 uStand;
out vec2 vUV; out vec3 vW; out float vUp; flat out vec3 vN; flat out vec2 vKid;
void main() {
  // How far ahead of the place being looked at it stands, give or take its own whim.
  float ahead = uCamY - b1.y + (b3.y - .5) * 260.;
  float u = 1. - smoothstep(uStand.y, uStand.x, ahead), k = u - 1.;
  // It springs up a touch past upright, then settles.
  float up = (1. + 2.7 * k * k * k + 1.7 * k * k) * (1. - uLie);
  float a = 1.5708 * up, t = (1. - aC.y) * b1.w;
  vec3 P = vec3(b1.x + (aC.x - .5) * b1.z, b1.y - cos(a) * t, sin(a) * t);
  vW = P; vUp = up; vN = vec3(0., sin(a), cos(a)); vKid = b3.xz;
  vUV = mix(b2.xy, b2.zw, aC);
  gl_Position = uVP * vec4(P, 1.);
}`
const FS_CARD = `#version 300 es
precision highp float;
in vec2 vUV; in vec3 vW; in float vUp; flat in vec3 vN; flat in vec2 vKid;
uniform sampler2D uAtlas; uniform highp sampler2D uShadow; uniform mat4 uLVP;
uniform vec3 uInk, uLight, uCam; uniform vec3 uBack[4];
layout(location=0) out vec4 oCol;
layout(location=1) out vec4 oNid;
void main() {
  vec4 a = texture(uAtlas, vUV);
  // Lying flat it is only ink on the paper; once it lifts, it is cut from card. With BATCH.softCards the
  // card fades in under the ink as it lifts (its strength goes to the paper in alpha, 09-city FS_COMP),
  // so a whole wood standing up together doesn't switch from ink to card in one frame.
  float fill = a.g > .5 ? ${BATCH.softCards ? 'smoothstep(.02, .3, vUp)' : 'step(.06, vUp)'} : 0.;
  bool ink = a.r >= .4;
  if (!ink && fill < .01) discard;
  vec3 col = mix(uBack[int(vKid.x + .5)], uInk * 1.08, a.r * .92);
  vec3 n = vN; if (dot(n, uCam - vW) < 0.) n = -n;
  vec4 ls = uLVP * vec4(vW, 1.); vec3 sc = ls.xyz * .5 + .5; float shd = 0.;
  if (sc.x > 0. && sc.x < 1. && sc.y > 0. && sc.y < 1.) shd = sc.z - .003 > texture(uShadow, sc.xy).r ? 1. : 0.;
  col *= mix(.95 + .06 * dot(n, uLight), .8, shd * .85);
  oCol = vec4(col, ink ? 1. : fill);
  float id = 60000. + vKid.y;
  oNid = vec4(n.xy * .5 + .5, mod(id, 256.) / 255., mod(floor(id / 256.), 256.) / 255.);
}`
const FS_CARD_SHADOW = `#version 300 es
precision highp float;
in vec2 vUV; in float vUp;
uniform sampler2D uAtlas;
out vec4 o;
void main() { if (texture(uAtlas, vUV).g < .5 || vUp < .15) discard; o = vec4(1.); }`

let CARDGL = null
function startCards() {
  const names = [...new Set(CARDS.map(c => c.name))].filter(n => ENG_DATA[n])
  Promise.all(names.map(n => new Promise(res => { const im = new Image(); im.onload = () => res([n, im]); im.onerror = () => res([n, null]); im.src = ENG_DATA[n] })))
    .then(list => { if (!gl || city.failed) return; try { buildCards(Object.fromEntries(list)) } catch (err) { city.cardsDone = true; console.warn('pop-ups unavailable:', err.message) } })
}
// A tree drawn for standing: a scalloped crown over a trunk, in the map's own hand.
function drawTreeCard(g, it) {
  const r2 = rng(it.tree + 5), cx = it.x + 48, cy = it.y + 48, R2 = 36 + it.tree * 2, n = 7 + it.tree
  g.save(); g.strokeStyle = 'rgba(52,36,24,1)'; g.lineCap = 'round'; g.lineJoin = 'round'
  g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy + R2 * .7); g.lineTo(cx, it.y + it.h - 3); g.stroke()
  g.lineWidth = 3.4; g.beginPath()
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2 - Math.PI / 2, p = [cx + Math.cos(a) * R2, cy + Math.sin(a) * R2 * .95]
    if (!i) { g.moveTo(...p); continue }
    const am = (i - .5) / n * Math.PI * 2 - Math.PI / 2, k = 1.22 + r2() * .1
    g.quadraticCurveTo(cx + Math.cos(am) * R2 * k, cy + Math.sin(am) * R2 * .95 * k, ...p)
  }
  g.closePath(); g.stroke()
  g.lineWidth = 2.2
  for (let k = 0; k < 6; k++) { const a = .1 + k * .3, rr = R2 * (.35 + r2() * .35); g.beginPath(); g.moveTo(cx + Math.cos(a) * rr * .4, cy + Math.sin(a) * rr * .4 + 6); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr + 6); g.stroke() }
  g.restore()
}
// Each card's ink in red, and its silhouette in green: from the topmost to the lowest ink in
// every column, widened a little, so the cut runs just outside the drawing.
function silhouette(src, out, AW, it) {
  const top = new Int32Array(it.w).fill(-1), bot = new Int32Array(it.w).fill(-1)
  for (let c = 0; c < it.w; c++) for (let r = 0; r < it.h; r++) {
    if (src[((it.y + r) * AW + it.x + c) * 4 + 3] > 60) { if (top[c] < 0) top[c] = r; bot[c] = r }
  }
  for (let c = 0; c < it.w; c++) {
    let t = Infinity, b = -1
    for (let k = -3; k <= 3; k++) { const cc = c + k; if (cc < 0 || cc >= it.w || top[cc] < 0) continue; t = Math.min(t, top[cc]); b = Math.max(b, bot[cc]) }
    for (let r = 0; r < it.h; r++) {
      const i = ((it.y + r) * AW + it.x + c) * 4
      out[i] = src[i + 3]; out[i + 1] = r >= t - 2 && r <= b ? 255 : 0; out[i + 3] = 255
    }
  }
}
function cardAtlas(imgs) {
  const AW = 2048, items = []
  for (const [n, im] of Object.entries(imgs)) if (im) items.push({ n, w: im.naturalWidth, h: im.naturalHeight, im })
  for (let i = 0; i < 4; i++) items.push({ n: 'tree' + i, w: 96, h: 128, tree: i })
  items.sort((a, b) => b.h - a.h)
  let x = 4, y = 4, rowH = 0
  for (const it of items) { if (x + it.w + 4 > AW) { x = 4; y += rowH + 8; rowH = 0 } it.x = x; it.y = y; x += it.w + 8; rowH = Math.max(rowH, it.h) }
  const AH = 2 ** Math.ceil(Math.log2(y + rowH + 4))
  const c = document.createElement('canvas'); c.width = AW; c.height = AH
  const g = c.getContext('2d', { willReadFrequently: true })
  for (const it of items) it.tree != null ? drawTreeCard(g, it) : g.drawImage(it.im, it.x, it.y)
  const src = g.getImageData(0, 0, AW, AH).data, out = new Uint8Array(AW * AH * 4)
  for (const it of items) silhouette(src, out, AW, it)
  return { w: AW, h: AH, data: out, at: Object.fromEntries(items.map(it => [it.n, [it.x / AW, it.y / AH, (it.x + it.w) / AW, (it.y + it.h) / AH]])) }
}
function buildCards(imgs) {
  const A = cardAtlas(imgs)
  const list = CARDS.filter(c => !c.tree?.lathe && A.at[c.name]), F2 = 12, data = new Float32Array(list.length * F2)
  list.forEach((c, i) => data.set([c.x, c.y, c.w, c.h, ...A.at[c.name], CARD_KIND[c.kind], (i * .618034) % 1, i, 0], i * F2))
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao)
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const inst = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, inst); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  for (let i = 0; i < 3; i++) { gl.enableVertexAttribArray(i + 1); gl.vertexAttribPointer(i + 1, 4, gl.FLOAT, false, F2 * 4, i * 16); gl.vertexAttribDivisor(i + 1, 1) }
  gl.bindVertexArray(null)
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, A.w, A.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, A.data); gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const progs = [compile(VS_CARD, FS_CARD), compile(VS_CARD, FS_CARD_SHADOW)]
  const finish = () => {
    city.cardsDone = true
    try { progs.forEach(finishProgram) } catch (err) { return console.warn('pop-ups unavailable:', err.message) }
    CARDGL = { P: progs[0], SP: progs[1], vao, count: list.length, tex: t }
    city.cards = list.length; requestRender()
  }
  const par = gl.getExtension('KHR_parallel_shader_compile')
  if (!par) return finish()
  const poll = () => progs.every(P => gl.getProgramParameter(P.p, par.COMPLETION_STATUS_KHR)) ? finish() : requestAnimationFrame(poll)
  requestAnimationFrame(poll)
}
function drawCards(prog, m, v, lvp) {
  gl.useProgram(prog.p); gl.bindVertexArray(CARDGL.vao)
  const u = prog.u
  gl.uniformMatrix4fv(u.uVP, false, m); gl.uniform1f(u.uCamY, cam.cy); gl.uniform1f(u.uLie, cam.intro); gl.uniform2f(u.uStand, v.D * 1.02, v.D * .34)
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, CARDGL.tex); gl.uniform1i(u.uAtlas, 1)
  if (lvp) {
    gl.uniformMatrix4fv(u.uLVP, false, lvp); gl.uniform3f(u.uInk, ...INK); gl.uniform3f(u.uLight, ...LIGHT); gl.uniform3f(u.uCam, ...v.E); gl.uniform3fv(u.uBack, CARD_BACK)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, GLS.smTex); gl.uniform1i(u.uShadow, 0)
  }
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, CARDGL.count)
}
