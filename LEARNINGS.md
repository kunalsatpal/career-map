# What this project teaches

Notes for working through the code together. File and line references (`file:line`) point to `src/` as shipped in this folder. If you edit a file, its line numbers shift, so search for the name instead. To make a change, start with `EDITING.md`; this file explains why things are built the way they are.

## How it was built

Kunal directed it in plain language and Claude Code wrote the code. Every change followed the same loop:

1. Describe the change.
2. Build it.
3. Check it with a screenshot, or a measurement for anything about motion, speed or interaction.
4. Give feedback.

A copy of the project was kept before each large change, so a rejected idea could be rolled back completely. Motion and performance problems were measured before and after each fix, not judged by eye alone. The tools in `tools/` came out of that.

## 1. One camera, five layers

The world is drawn in five separate layers. All of them take their projection from one function, `view()` (`06-camera.js:110`), so they can never drift apart:

| Layer | Technology | Projected by |
|---|---|---|
| Paper | One canvas, painted once (`05-paper.js`) | Sits under the ground |
| Ink drawing | SVG on a CSS 3D plane (`04-ground.js`) | `groundMatrix()` → `matrix3d` (`06-camera.js:140`) |
| Cities | WebGL2 canvas (`09-city.js`) | `clipMatrix()` (`06-camera.js:145`) |
| Pop-up engravings | WebGL, the same canvas (`11-cards.js`) | The same matrices |
| Labels, banners and notes | Plain HTML in screen space (`07-labels.js`, `12-panel.js`) | `project()` (`06-camera.js:122`) |

**One picture per frame.** Scrolling, a city building itself and a hover can all ask for a redraw in the same frame. Before the fix, each got its own, and that was the fast-scroll lag. Now `render()` (`06-camera.js:266`) and the GL `draw()` (`09-city.js:1311`) each run at most once per frame, keyed on `document.timeline.currentTime`.

## 2. Buildings from code, not models

No 3D models are used. Every building comes from a short recipe:

1. **Plan.** `PLANS` in `03-plans.js` places each structure in its city, for example `{ t: 'market', room: 'gojek-promo', x: 36, y: 148, w: 270, h: 212 }`. The flat ink drawing comes from the same plan (`DRAW` in `04-ground.js`), so a building always rises out of its own outline.
2. **Recipe.** `BUILD` (`09-city.js:151`) has 44 builders: hall, rotunda, arena, market, science tower, lighthouse, pillar and so on. Each stacks a few primitives:
   - `face`, `boxF`;
   - `gableF`, a pitched roof;
   - `latheF`, turned shapes such as towers, domes, cones and flasks.

   Scenery for each city is in `PROPS` (`09-city.js:805`).
3. **Pieces.** `buildPieces()` (`09-city.js:903`) cuts every face into bricks, planks or tiles, sized by its material (`PIECE_SIZE`). Each piece is 40 numbers in one shared buffer: its corners, colour, material, building, and the pivot it turns on if it moves. Each city gets its own vertex array over that buffer, so only the cities in sight are drawn.
4. **Assembly happens on the graphics card.** Each piece's start delay is worked out in the vertex shader (`09-city.js:964`) from three things: its distance from the city's centre, its height, and a little randomness. JavaScript only sets one start time per city, which is why tens of thousands of flying bricks cost almost nothing on the CPU.

**Three render passes:**

1. **A shadow map** from the sun (`FS_SHADOW`, `09-city.js:1033`). The sun moves along the journey (`sunAt`, `09-city.js:1258`), so shadows lengthen as you go back in time. They're only re-cast after the eye travels 520 units.
2. **Pieces into two targets at once** (`FS_PIECE`, `09-city.js:1038`, multiple render targets):
   - colour: the material pattern, painted windows and doors, light, and hatched shadow;
   - normal plus face id.
3. **Composite** (`FS_COMP`, `09-city.js:1113`). An ink line goes wherever depth, normal or face id jumps between neighbouring pixels. It's wobbled by noise so it looks drawn with a pen, then paper grain and mist are added. On empty paper, shadows are drawn as hatching.

**Startup never blocks the page.**

- The city is built during idle time (`prewarmGL`, `09-city.js:1188`).
- Shaders compile in the background with `KHR_parallel_shader_compile` (`09-city.js:1163`).
- The GL canvas is capped at 1.25× pixel density on desktop and 1× on phones (`DPR`, `09-city.js:1185`).

**Things that move.** Trees, lamps, scooters, the barbell and other props are wrapped in `decorF`, which tags their pieces with an id. When you hover or click one (`16-delight.js`), the shader turns just those pieces about their pivot (the `uDec` slots). Nothing else in the city is touched.

## 3. A camera that feels directed

The camera is written like a director's shot list. `SHOTS` (`06-camera.js:43`) sets pitch, zoom, yaw and pace at points along the road: low and close at Hinge Health, aerial over the river, a slow orbit at Gojek. Several filters stand between those keys and the screen:

1. **Monotone cubic** (`monotone`, `06-camera.js:66`) joins the keys without overshooting.
2. **Gaussian blur along the road** (`smoothChannel`, `06-camera.js:85`, σ 200) means no turn is ever sudden.
3. **Time easing** (`stepShot`, `06-camera.js:102`, 150 ms) keeps a fast scroll from snapping the angles.
4. **`perPx` divides by zoom**, so on-screen speed stays steady when the camera pushes in.

Before the fix, the steep shot keys caused jumps of up to 3.9° pitch, 2.8° yaw and 7.6% zoom in a single frame. After it, the worst frame changes 0.4°, 0.4° and 0.7%. The spread in on-screen speed (p90 over p10) dropped from 2.0× to 1.1×. Measure it with `tools/camjerk.mjs`. The original change is in `lessons/01-smooth-camera.diff`.

**The lesson:** the keyframes set the intent; the filters between them and the screen make it feel smooth.

## 4. A scroll that never goes backward

**Bug:** a fast trackpad swipe sometimes sent the map the wrong way.

**Cause:** the wheel handler used `deltaX` whenever it was larger than `deltaY`. On a sloppy diagonal swipe, the sideways drift became backward motion.

**Fix** (shown in `lessons/02-one-direction-scroll.diff`):

- Only `deltaY` moves you (the wheel handler, `13-input.js:8`).
- The camera follows the scroll on a critically damped spring (`easeStep`, `06-camera.js:199`). The step is worked out in closed form, so it's exact for any frame time and stable at 30, 60 or 120 Hz. It drops any velocity pointing away from the target, and it never passes the target.
- The scroll target may run at most 760 units ahead of the eye, so letting go stops promptly.

`tools/camreverse.mjs` sends flicks, wheel spins and diagonal swipes, all forward. Backward frames went from 24 to 0.

## 5. The hover that never fired

**Symptom:** hovering a building felt "really tough". In practice only the small name slips above the buildings responded.

**Cause:** every face records which room it belongs to as a number (`BX.room`), because the shader uses it to lift the hovered building. The table of room outlines and heights was filed under that number too, but everything reading it asked by name (`ROOMS[id]`). The hit test (`cityPick`, `09-city.js:1394`) threw on its very first entry. It ran inside a `requestAnimationFrame` callback, so the only sign was an error in the console.

**Fix** (shown in `lessons/04-hover-that-never-fired.diff`):

- Outlines and heights are filed by room name.
- The hit area is forgiving:
  - a margin around each outline, wider for small buildings;
  - the building under the pointer holds until the pointer is clearly away;
  - after the map stops moving, it checks again under the resting pointer;
  - the note waits 520 ms for you to move onto it.
- Building names stay at fixed heights (`roofOf`, `07-labels.js:106`). When real heights were tried, some names collided with the city banners. The real heights are used only for picking and for placing notes.

`tools/hovercheck.mjs` sweeps the mouse over a grid below each building name. The 3D buildings at Hinge Health and Cult.fit went from 0 to an average of 95 hits out of 121 points.

**The lesson:** one path that works (the name slips) can hide a dead one (the 3D buildings). Measure the interaction itself, not only the frame rate, and watch the console.

## 6. Case studies as full pages

They were once letters that flew out of the roof and unfolded: nice the first time, slow by the tenth. Now each is a full page laid out like the portfolio site, in `18-letter.js`.

- **Opening:** the title, summary and numbers sit beside the final design. Field notes open centred, with their icon.
- **Body:** numbered sections in a text column, with pictures on wider trays.
- **Ending:** the previous and next stories, then "Want to talk about this work? Write to me · Résumé".

How it works:

- **Opening and closing** (`openCase`, `18-letter.js:123`): the page fades in while rising 12 px (340 ms), and fades out (200 ms). It's quiet enough to sit through every time.
- **The map underneath:** once a page is open, the map layers are hidden (`body.reading-case`), so the GPU isn't painting a 3D city under a full page of text.
- **Pictures:** they rise into place as they scroll in. An `IntersectionObserver` rooted in the page's own scroll container drives this, because the window itself never scrolls.
- **Where the pictures live:** all 172 are in `site/` and load from disk. Before, they loaded from the live site, and 20 that weren't published had been dropped without a sign.
- **Corrections** (`PAGE_FIXES`, `PAGE_SWAPS`) are laid over the page text at render time, so the original JSON from the portfolio stays untouched.

## 7. Performance rules that came out of it

- Paint once per frame (section 1).
- Give labels their own compositor layers (`#labels > * { will-change: transform, opacity; contain: layout style }` in `style.css`). Without that, every zoom change repainted all the text.
- Pause animations that are off screen (`lifeCull`, `08-life.js:10`), and remove one-off sprites when they finish.
- Use opacity for a full-screen tint during motion, not `mix-blend-mode`. The dusk overlay was changed this way.
- Don't redraw shadows every frame (section 2).
- Inline the images that WebGL reads, so the page also works from `file://`.
- Small delights run at a third of the frame rate when idle, and stop when the map moves or a page opens.

## 8. Changing a finished thing safely

The changes after the design critique were made so any of them could be undone on its own:

- **One switch per change** in `src/00-batches.js`. The code checks `BATCH.name`, and turning a switch off restores the earlier behaviour exactly.
- **Phone-only changes stay phone-only.** They sit in `@media (max-width: 760px)` or `@media (pointer: coarse)` CSS, or behind the `coarse` check in code. That the desktop site was unchanged was proved by loading the old and new builds and comparing the computed style and position of every visible interface element: title, a city, a hover card, the lighthouse note and a case page.
- **Choices were made from rendered options.** Before building a visual change, two or three versions were drawn on the live map with injected CSS and shown side by side. Text or ASCII descriptions of visual ideas proved a poor guide.
- **Tried and rejected, so don't redo:**
  - a palette desaturation and soft haze clouds;
  - night mode, a kraken, a 2D ink wizard, four wizards and floating wands;
  - a dotted "ink" rail and a footprints rail;
  - a food-court layout for the Gojek market;
  - a Hinge Health case page (built, then switched off: `hingePage: false`).

## 9. Know what your measurements can't tell you

- **Headless Chrome isn't a real display.** It's useful for comparing before and after, but `droptrace.mjs` reports about 42% of frames "presented without an update" in headless mode. That figure stayed the same with every layer switched off in turn, so it comes from headless compositing, not from the page. Judge smoothness on a real screen.
- **A tab in the background pauses everything.** In that state the city never builds and the camera won't move, which looks exactly like a broken first load. Test scripts bring the tab to the front first (`Page.bringToFront`, `Emulation.setFocusEmulationEnabled`).
- **Chrome may serve a cached page** after a rebuild, and navigating to the same address can reuse the old page. Disable the cache, and go via `about:blank`.

### First visits: the graphics programs

On a truly first visit (a computer whose macOS shader cache has never seen the page), the flight froze for 200–500 ms on arriving at each city. Later visits were smooth. A trace showed why. The browser's graphics engine (Skia Graphite on Metal) builds a program the first time it draws each new combination of effects, and the frame waits for it. The 3D city wasn't the cause: turning WebGL off left the freezes in place.

- **How it was measured without a cold machine.** A fresh Chrome profile still sets up every program the page uses once, even when macOS has it cached. So a trace (`gpu.dawn` categories) lists each program by name, with when it was set up. Every program set up during the flight is a freeze on a truly cold visit.
- **What caused most of them: blurs.** Each band of blur size needs its own program (`$1DBlur4`, `$2DBlur12`…). Labels change size with distance, and the rail animated its dots' soft shadow, so new blur sizes kept turning up as you flew.
- **The fix** (`17-prewarm.js`, switch `prewarm`):
  - The warm-up draws every kind of label at the full range of sizes, plus each card, the rail's states, the moments' sprites and the tip.
  - It then nudges a few copies so that partial redraws, which use their own program variants, also happen up front.
  - The rail's shadow no longer animates.

  Programs first set up during the flight went from 15 to 2. Opening a page normally costs about 0.4 s more before the lean-in.
- **Still open:** two programs are still built after the opening. One comes when the rail first changes place, as the current dot grows on its own layer. The other comes when a note first opens through its rounded clip. Copies inside the warm-up's transparent layer don't reproduce those compositor effects.

### The opening, and seeing the cities build

- **An abrupt opening.** At first, the cities built and the trees switched from ink to card in the same moments the camera leaned in, so the opening looked like a glitch. The fixes:
  - The opening waits behind a sheet until the 3D city and its cards are ready (`cityReady()`).
  - Cards fade from ink to colour over about 0.4 s instead of in one frame (`softCards`).
- **Loaders tried:** a wax seal in a compass ring, then the "I solemnly swear…" oath written line by line. Kept: the first cover's idea, ink spreading from the middle over a blank sheet (`18-spread.js`). It reveals the real map, so the loader is the entrance itself.
- **Keeping the loader smooth:**
  - Only opacity and transform animate, and every moving part has its own layer from the first frame.
  - The sheet is very slightly see-through, so the page underneath keeps drawing and warming up. What shows through is at most 3 brightness steps out of 255.
  - The ink shader compiles in the background (`KHR_parallel_shader_compile`). Compiling it on the spot added a 0.7 s stall on first visits.
- **Seeing the cities build.** At first each city started assembling while it was still small near the top of the screen, so the build was over before you got close.
  - Now a city starts once its middle is a quarter of the way down the screen (`lateBuild`).
  - How I work and About me used to build together as one city; now they build separately (`workBuild`).
  - The first try, at 40% down the screen, felt too late.

### Phones: layers, not pixels

A lag evaluation on 6 Nov compared nine device profiles. Desktops were smooth. Phones were the problem, and three fixes came out of it, all phone-only (`PHONE` in `01-util.js`, switches `phoneLayers`, `phoneFrame`, `phoneStart` and `phoneLite`). A desktop or laptop never takes these paths, which was checked by comparing every label placement and the ground transform at 25 points along the road, old build against new.

- **What it cost.** During a swipe the page had 334 compositor layers. Most were footprints, tyre marks and paw prints: each sprite kept its layer for good through `will-change` and a fade held with `fill: 'forwards'`, even when invisible. Chrome re-layerizes and commits every layer each frame.
- **The fix.** On a phone a print holds a layer only while it fades. Between fades it is `hidden`, so it isn't in the paint tree at all. The fast trails (the scooter's tyre track, the runners) fade sooner, so fewer overlap. Worlds out of sight leave the sheet. Result: 334 layers down to 87, and main-thread time per frame down by about 30% (Layerize −40%, Commit −47%).
- **Framing.** A phone shows a narrow strip of the sheet, and the camera followed the road, so cities beside it were cut off with no way to pan. `phoneX` (`17-phone.js`) follows the buildings near the place being looked at instead.
- **The weakest phones.** With software WebGL the 3D map ran at 1–2 fps. Such a phone now goes straight to the flat ink map, and so does any phone whose frames stay over 60 ms while moving; there it runs at 8–29 fps. A slow phone that can keep up stays 3D: with the CPU slowed 12× it went from 27 to 41 fps.
- **The lesson:** count layers (`LayerTree` in CDP), not only frames. A fast desktop GPU hides a layer count that a phone's main thread can't carry.

## 10. Things to try together

1. **Add a building type.** Follow "Make a new kind of building" in `EDITING.md`, modelled on the science tower (`labtower` in `09-city.js` and `04-ground.js`). `lessons/03-add-a-building-standing-stones.diff` shows an earlier end-to-end example, for reading only.
2. **Re-break the scroll and watch the tool catch it.** In the wheel handler (`13-input.js:8`), replace the last two lines:

   ```js
   if (!e.deltaY) return
   scrollBy(-e.deltaY * unit * perPx())
   ```

   with:

   ```js
   const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
   if (!d) return
   scrollBy(-d * unit * perPx())
   ```

   Rebuild and run `camreverse.mjs`: the backward frames come back. Undo the edit to fix it.
3. **Flip a switch.** Set `labTower: false` in `src/00-batches.js` and rebuild: the old kitchens come back at Gojek. Set it back to `true`.
4. **Retune a shot.** Change one row of `SHOTS`, rebuild, and compare `camjerk.mjs` before and after.
5. **Play with the ink.** In `FS_COMP` (`09-city.js:1136–1137`), change the edge thresholds (`smoothstep(.0035, .008, …)` for depth, `smoothstep(.8, .7, …)` for normals) and watch the line weight change.
6. **Compare with a library.** Port one builder to Three.js and compare the code size and frame times.

The four diffs in `lessons/` are for reading. Later changes touch the same lines, so they no longer apply onto the current source.

## Known open issues

- Three earlier-work stops (Mobily Invited, Pipeline Security, stockroom.io) have only a short line each; the details weren't in the résumé.
- On phones, the About me stop and the lighthouse at the end of the road are only a short way apart, so the last two swipes show nearly the same view.
- The "Harry P" font for the name is a fan font that isn't cleared for reuse.
- On a truly first visit, two short graphics-program builds remain after the opening: the rail's first change of place and the first note opening (section 9).
