# Editing the map

How the map is put together, and how to make the common changes: words, buildings, props, pages, the camera. Read "How it fits together" once; after that, each recipe stands alone.

## How it fits together

**One page, built from `src/`.** `build.py` joins `src/[0-9][0-9]-*.js` in filename order into one script inside a single closure, and inlines `style.css`, `body.html`, the case-study JSON, the engravings and the font. There are no modules or imports: a file can use anything defined in the files before it, and anything at all inside functions that run after startup. Every top-level name shares one scope, so give new ones names nothing else uses.

**The loop for any change:**

1. Edit a file in `src/`.
2. Run `python3 -I build.py` in this folder.
3. Reload the page with DevTools open and **Network → Disable cache** ticked. Otherwise Chrome may keep showing the old page.
4. Check the console for red errors, and check that `__map.city.failed` is `false`. A broken 3D recipe doesn't stop the page: it falls back to the flat ink map, with only a yellow warning.

**Switches.** `src/00-batches.js` turns each post-critique change on or off. To try something you may want to undo, put it behind a new switch there and test `BATCH.yourSwitch` in the code.

**The world.** One large sheet, measured in world units.

- **x** runs west to east. The land is roughly 0 to 1,900.
- **y** runs north to south. You start at the title, at y 8000 in the south, and travel north to the lighthouse at y 890. Going forward means y getting smaller.
- **z** is height.
- `cam.cy` is the y the camera is looking at.

**Where things live:**

| What | File | Name |
|---|---|---|
| Companies: name, years, colour hue, crest, and where each walled city sits (`ox`, `oy` is its north-west corner; `w`, `h` its size) | `02-content.js` | `REALMS` |
| Every building's words: its tag and hover card | `02-content.js` | `ROOMS` |
| The earlier-work islands | `02-content.js` | `STOPS` |
| The sections the rail and phone chip use | `02-content.js` | `WORLDS` |
| Road, coast, islands, forests, ships | `02-content.js` | `ROAD`, `COAST`, `ISLE`, `GEO` |
| Each city's floor plan: walls, towers, buildings | `03-plans.js` | `PLANS` |
| Where each building's stop is on the road | `03-plans.js` | `LEVEL_Y` |
| How each kind of building looks in 3D | `09-city.js` | `BUILD` |
| The same buildings as flat ink plans | `04-ground.js` | `DRAW` |
| Each company's colours and materials | `09-city.js` | `STY` |
| Scenery placed in each city | `09-city.js` | `PROPS` |
| Things that move when hovered or clicked | `16-delight.js` | `ON_HOVER`, `decorClick` |
| Case-study and field-note pages | `src/cases/*.json`, `03-cases.js`, `18-letter.js` | `FULLCASE_DATA`, `PAGES`, `FULL_OF` |
| The camera's path | `06-camera.js` | `SHOTS` |
| Interface colours, type and cards | `style.css` | tokens at the top: `--ink`, `--paper`, `--seal`, fonts |

**How buildings appear.** You never animate a building by hand. A builder in `BUILD` describes it as simple shapes. Every face of every shape is cut into small tiles automatically, and each tile is stored with its final position, colour and texture. When you arrive at a city, the graphics card moves each tile from the paper to its place, nearest and lowest first. That's the brick-by-brick build. The ink outlines and watercolour are painted per tile as it's drawn.

## Recipes

### Change a building's words

Edit its entry in `ROOMS` (`02-content.js`):

- `title`: the name on its tag on the map. Field notes can also have a `short` tag; see `NOTE_TAGS`.
- `tip: [headline, line]`: what the hover card shows, a bold headline and one line under it.
- `stat`, `body`, `list`, `img`, `pics`: used when there's no `tip`.
- `nda: true`: the card says "Under NDA · ask me about it", and the building never opens a page.
- `soon: true`: the card says "Case study coming soon".

### Move or resize a building

Each city's buildings are in `PLANS[city].parts` (`03-plans.js`), for example:

```js
{ t: 'market', room: 'gojek-promo', x: 36, y: 148, w: 270, h: 212 }   // box-shaped
{ t: 'observatory', room: 'blog-portfolio', cx: 420, cy: 540, r: 60 }  // round
```

- Coordinates are relative to the city's `ox`, `oy` in `REALMS`.
- Keep buildings inside the city's `walls`, which are point lists in the same coordinates.
- Builders scale with `w`, `h` or `r`. Scenery in `PROPS` uses fixed coordinates, so move it to match.
- **Check for overrides further down `03-plans.js`.** Some switches adjust a plan after it's written:
  - `BATCH.onePromo` widens the Gojek market and moves the experiments building;
  - `BATCH.labTower` turns that building into the science tower;
  - `BATCH.biggerYard` and `BATCH.biggerIsle` enlarge the About me yard and the lighthouse.

  Search the file for `if (BATCH.` before editing a value in the base list. If a block below sets it, change it there, or your edit won't show.

### Change how a building looks

Set its `t` to another kind; every name in `BUILD` is one. Each kind needs **both** a `BUILD` entry (3D) and a `DRAW` entry (the flat ink plan):

- **With no `DRAW` entry,** the page fails to start (`DRAW[q.t] is not a function`).
- **With no `BUILD` entry,** or if a builder throws, the page starts but the whole 3D city is replaced by the flat map. `__map.city.failed` turns `true` and there's only a yellow warning in the console.

### Make a new kind of building

1. **Write `BUILD.mytype(q, st)` in `09-city.js`.** `q` is the part from the plan: `x, y, w, h` or `cx, cy, r`, already converted to world units. `st` holds the company's colours if the part has a `room`; parts without one get plain grey stone and slate (`plainSty`). Shape helpers:
   - `boxF(x, y, w, d, z0, h, wallMat, topMat)`: a box.
   - `gableF(x, y, w, d, z0, rise, roofMat, wallMat)`: a pitched roof.
   - `latheF(cx, cy, profile, segments, mat)`: anything round. `profile` is a list of `[radius, height]` points, spun like pottery on a wheel. It makes towers, domes, flasks and lamps.
   - `wallsF`, `flatF`, `ballF(x, y, r, colour, z)`.
   - Small ready-made props, all placed by world position:
     - `lampF(x, y, height, glow, z)`
     - `benchF(x, y, width)`
     - `scooterF(x, y, colour)`
     - `umbrellaF(x, y, r, colourA, colourB)`
     - `flowersF(x, y)`
     - `fellTreeF(x, y, r)`

     Lamps and trees are interactive: a click lights a lamp or fells a tree.

   Materials:
   - `mat(colour, pattern, overlay)`.
   - Colours are `col3(L, C, hue)`, which is OKLCH: lightness 0–100, chroma about 0–0.2, hue in degrees.
   - Patterns are in `PAT` (stone, brick, plaster, timber, tile, slate, glass…), overlays in `OVL` (windows, door…).
   - `wallM(st)` and `roofM(st)` take the company's own colours.

   A good model: `labtower`, the science tower.
2. **Write `DRAW.mytype(P, q)` in `04-ground.js`**: the flat plan in ink. `P` is a pen:
   - `P.rect(x, y, w, h)`, `P.circ(cx, cy, r)` and `P.line([[x, y], …])`. These take an optional line weight: `'fine'`, `'hair'`, `'bold'`.
   - `P.boxWall(x, y, w, h, thickness, door)` for walls with a gap.
   - `P.a('pfill', path)` to fill a shape. `path` is an SVG path string; `rectD(x, y, w, h)` and `circleD(cx, cy, r)` in `01-util.js` make one.

   You can leave out the `roomName(…)` call some drawings end with: it draws nothing, because names live on the HTML tags.
3. **Use `t: 'mytype'` in a plan.**

### Add a new building, a new piece of work

1. **Add a `ROOMS` entry** with `realm` set to its company, plus its words.
2. **Add a part** with `room: 'your-id'` to `PLANS[realm].parts`.
3. **Add `LEVEL_Y['your-id']`**: its stop on the road. Pick a value between its neighbours; smaller is further north, so it comes later. Don't skip it: without one there's no error, but the building's stop lands at the end of the road, by the lighthouse.

Every `ROOMS` entry needs a part, and every part's `room` needs a `ROOMS` entry; otherwise startup fails. To retire a building, either delete both, or delete the room and its part together, as `BATCH.onePromo` does for the old banner hall.

### Add scenery, or things that move

- **Scenery:** add it to `PROPS[city](ox, oy)` in `09-city.js` with the ready-made helpers, written as offsets from the city's corner, e.g. `lampF(ox + 290, oy + 150, 30)`. Scenery doesn't follow the buildings: if you move a building, move its scenery too.
- **Things that move:** wrap their shapes in `decorF(kind, x, y, z, h, r, () => { …shapes… })`, then handle that `kind` in `16-delight.js`:
  - `stir` for the small idle movement;
  - `decorClick` for the trick;
  - add it to `ON_HOVER` if it should play on hover.

  How long each motion lasts is set in `DEC_T`, keyed by motion number (1 felling, 2 toppling, 3 hop, 4 swing, 5 flip, 6 spin, 7 rustle, 8 lift, 9 tilt), not by kind name. Use these sparingly: each one is something the pointer is tested against.

### Add or edit a case study or field note

- **Its text and pictures:** `src/cases/<Name>.json`, a list of blocks (`h`, `h3`, `p`, `list`, `img`, `gallery`, `video`, `table`). Pictures go in `site/cases/m/`.
- **Link it to its building:** `FULL_OF` in `18-letter.js` (`'room-id': 'Name'`).
- **How it opens:** `PAGES` in `03-cases.js` sets the kicker, title, summary, number chips and hero picture.
  - Its key is the case file's name, the value in `FULL_OF`: for example `PAGES.cart_abandonment`, not `PAGES['cult-cart']`.
  - The page title is `PAGES[name].title` if set, otherwise the building's `title`. So changing a building's `title` only changes its page title when `PAGES` has none.
- **Previous/next order:** `CASE_ORDER` in `18-letter.js`.
- **Small fixes without touching the JSON:** `PAGE_FIXES`, for text replacements, and `PAGE_SWAPS`, for swapping a picture for a block, both in `18-letter.js`.

### Change the camera

`SHOTS` in `06-camera.js` lists `[y, pitch°, zoom, yaw°, pace]` keyed by position on the road. Keep neighbouring rows close: big jumps read as jerks. `tools/camjerk.mjs` measures it.

### Phones

Phone behaviour sits behind the `mobile` and `mobile2` switches. Phone-only CSS lives inside `@media (max-width: 760px)` or `@media (pointer: coarse)` blocks, and phone-only logic checks `coarse`. Keep phone changes there, so the desktop site is untouched.

## Check your change

- **The console:** `window.__map` gives you the following.
  - `flyTo(0, y, 0, ms)` flies to a place.
  - `ROOMS`, `LEVELS` and `DECOR` hold the data.
  - `pick(x, y)` says which building is under a screen point.
  - `openCase(id)` opens a page.
  - `city.ready` tells you the 3D city has built.
- **The tools** in `tools/` measure hover areas, camera smoothness and frame times. `README.md` explains how to run them.
- **Performance:** it should hold 60 fps while scrolling. The whole city draws in one go, so the cost is the number of tiles. Lots of round shapes with many segments add up.

## Keep first visits smooth

On a computer's first visit, the graphics card builds a program the first time it meets each kind of drawing, and each build is a short freeze. `src/17-prewarm.js` draws a copy of every kind once, nearly invisible, while the title is up, so the builds happen before you move. The lean-in waits for it.

- **If you add a new kind of label, card or effect, add a sample of it to `prewarmPage()`.** For a card, add its id to the list; elements made only when needed get their markup there too.
- **Avoid animating soft shadows and blurs** (`box-shadow` or `text-shadow` with blur, `filter: drop-shadow` or `blur`). Each blur size needs its own program, so an animated blur builds one per size it passes through. Change them at once, and animate `transform` or `opacity` instead.
- **To check:** in a fresh Chrome profile, record a trace of the first flight and count the graphics programs first set up after the opening. `LEARNINGS.md` section 9 describes it. Today that count is 2.

## The opening and when cities build

- **The opening** (switch `calmOpen`). While the page warms up, a blank sheet covers it with one drop of ink gathering where the title is. Then the ink spreads from that drop to the edges until the whole map shows, as on the very first cover. The camera starts leaning in 1.2 s into the spread (`19-boot.js`).
  - **How it works:** `src/18-spread.js` draws the blank sheet in WebGL. Where the ink hasn't reached yet, it shows the bare paper, before any wash or ink (`BARE` in `05-paper.js`), with a dark wet rim at the front.
  - **Timing:** the sheet stays at least `LOADER_MIN` from the start. It also waits for the warm-up, and for the 3D city and its tree cards (`cityReady()` in `09-city.js`).
  - **The flat veil** in `style.css` is the sheet's average colour. It covers the page until the WebGL sheet is laid, and it is also the fallback without WebGL2.
  - **Both are 99.4% opaque,** so the page beneath is still drawn and warmed up. Don't make them fully opaque.
- **When a city builds** (switch `lateBuild`). Each city starts assembling once its middle is a quarter of the way down the screen. Nothing starts during the opening's lean-in. The rule is `realmNear()` in `09-city.js`: raise `.25` to start later, lower it to start sooner.
- **How I work and About me** (switch `workBuild`) share one city in the code (`home`), but they build separately: everything south of `WORK_Y` belongs to a ninth realm, `work`.
- **Woods and trees** (switch `softCards`) fade from ink to card as they stand up. The card's fill is carried in its alpha, and `FS_COMP` draws an edge wherever that "solidity" changes, so the outline doesn't vanish in one frame.

## Things that catch people out

- **A new top-level name that already exists** elsewhere (every file shares one scope) stops the page starting.
- **A room without a part, or a part without its room,** stops the page starting.
- **A building kind with no `DRAW` entry** stops the page starting. One with no `BUILD` entry quietly drops the whole 3D city to the flat map (`__map.city.failed`).
- **A building with no `LEVEL_Y`** gets its stop at the end of the road, without any error.
- **A value in a plan that doesn't change anything** is probably overridden by an `if (BATCH.…)` block lower in `03-plans.js`.
- **Name tags sit at fixed heights** above the ground (`roofOf` in `07-labels.js`), not on each roof.
- **Chrome may show a cached copy** after a rebuild: keep "Disable cache" ticked while DevTools is open.
- **A background tab pauses all animation**, which can look like a page that won't load.
