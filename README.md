# Map of the work

A learning project by Kunal Satpal, built with Claude Code to practise working with an AI agent on a demanding front end. It turns a design portfolio into a Marauder's-Map-style parchment world. Scrolling flies a camera up the sheet, past one hand-drawn city per company, and each city builds itself brick by brick as you arrive.

There are no frameworks, no 3D libraries and no npm packages: it's plain JavaScript, CSS and raw WebGL2. One Python script joins the source into a single HTML file.

## Quick start

1. Unzip.
2. Open `index.html` in Chrome. Nothing to install, no server.

That's it; `INSTALL.md` has the step-by-step for a new machine, and `EDITING.md` explains how to change buildings, words, pages and the camera. It runs straight from disk and needs WebGL2. Every picture is in the folder; only the Google Fonts come from the web, so offline it falls back to Georgia. It's tested in Chrome on macOS. It opens straight onto the title. Everything below is for working on it.

**Ground rules**
- This stays local. It's for learning only: don't host it, publish it, or push it to a personal GitHub account.
- If you want version control, a local `git init` is fine. If it ever has to go on GitHub, an engineer creates the repo in an approved Hinge Health org, with signed commits.
- The portfolio content is Kunal's. Keep it within Hinge Health.

**Controls**
- Scroll, drag, ↑/↓, Space or Page Up/Down move along the road. ←/→ jump between stops. Home and End go to the start and the end.
- Hover over a building to see its note. Buildings with a red wax seal hold a full case study or field note: click one to open it. Esc or "Back to the map" closes it.
- Small things on the map answer the pointer: rest on the barbell, click a lamp or a tree, poke the ship.
- On a phone, swipe down to move on, one stop per swipe; a chip at the foot of the screen says where you are. Tap a building for its note.
- With `prefers-reduced-motion` set, the camera stays top-down and the cities appear without animating.

## Build it

`index.html` is generated. Edit the files in `src/`, then rebuild:

```
python3 -I build.py      # Python 3.8+, standard library only → writes index.html
```

`build.py` joins `src/[0-9][0-9]-*.js` **in filename order** into one script, inside a single closure. There are no imports: every module sees the ones before it, so the order matters. It also inlines:
- `src/style.css` and `src/body.html`;
- the case-study JSON from `src/cases/`, as `FULLCASE_DATA`;
- the engravings from `assets/v/`, as base64 `ENG_DATA`. They're inlined so WebGL can read their pixels even from `file://`. The four `wet*` engravings are left out on purpose, as they aren't used.
- the Harry P font, as base64.

The pictures in `site/` are not inlined: the page loads them from the folder, so keep `index.html` next to `site/`.

**Switches.** `src/00-batches.js` holds an on/off switch for each change made after the design critique, each with a one-line description. Set one to `false` and rebuild to undo just that change.

## What's where

| Path | What it holds |
|---|---|
| `src/00-batches.js` | On/off switches for each batch of post-critique changes |
| `src/01-util.js` | Sheet size, seeded randomness, curves, OKLCH colour helpers |
| `src/02-content.js` | All copy. Realms are companies, rooms are pieces of work. Also `GEO`, the geography |
| `src/03-plans.js` | Floor plans: every structure in every realm, plus `LEVEL_Y` (where each stop sits on the road) |
| `src/03-cases.js` | How each case-study page opens (`PAGES`: kicker, title, summary, numbers, hero image) |
| `src/04-ground.js` | The ink drawing (SVG on a CSS 3D plane): walls, plans, coast, road, terrain |
| `src/05-paper.js` | The paper, painted once into a canvas |
| `src/06-camera.js` | **The camera**: shot list, smoothing, scroll spring, projection, `render()` |
| `src/07-labels.js` | Screen-space labels and banners pinned to the 3D world |
| `src/08-life.js`, `src/16-moments.js` | Ambient life and one-off moments (ships, scooters, whale, gulls) |
| `src/09-city.js` | **The 3D cities**: procedural geometry and the WebGL2 ink-and-watercolour renderer |
| `src/11-cards.js` | Pop-up engravings that fold up off the paper as you approach |
| `src/12-panel.js`, `src/18-letter.js` | Hover notes, and the full-page case studies that open out of their building |
| `src/13-input.js` | Wheel, drag, keys, click, and the phone's one-stop-per-swipe |
| `src/14-citycard.js` | Experiment, switched off (`CITY_CARD = false`): a city's overview card docked beside it |
| `src/15-flow.js` | The progress rail, the phone's place chip, and the menu |
| `src/16-delight.js` | Small interactions: trees to cut, lamps to light, props that move, the ship that sinks, the secrets |
| `src/17-prewarm.js` | First-visit warm-up: draws every kind of label, card and effect once, nearly invisible, while the title is up |
| `src/17-reader.js` | Plain-page version for screen readers and print |
| `src/18-spread.js` | The opening: a blank sheet while the page warms up, then the ink spreads from the middle to the edges (WebGL) |
| `src/19-boot.js` | Startup, and the `window.__map` debug handle |
| `assets/` | Engravings, ships, logos, font |
| `site/` | Every picture from the portfolio: case-study and blog images, phone heroes, About-me photos, book covers and posters (about 53 MB) |
| `tools/` | Performance and motion measurement scripts (below) |
| `lessons/` | Four before/after diffs of real changes: three fixes and one new feature (see `LEARNINGS.md`) |

## Poke at it from the console

```js
__map.flyTo(0, 5300, 0, 1000)    // fly to Cult.fit over 1 s (y runs 8000 at the title → 890 at the lighthouse)
__map.cam                         // live camera state
__map.city.ready                  // true once the 3D city has built (city.failed if WebGL2 is missing)
__map.LEVELS                      // every stop on the road
__map.pick(x, y)                  // which building is under a screen point, if any
__map.ROOMS['cult-cart']          // a building's words, as in src/02-content.js
__map.openCase('cult-cart')       // open its case study
```

## Measurement tools

`tools/*.mjs` drive Chrome over the DevTools protocol. They need Node 22+ (built-in `fetch` and `WebSocket`) and no packages.

Start a throwaway Chrome with remote debugging. Use its own profile, and close it when you're done, because the debugging port gives full control of that browser:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9337 --user-data-dir="$TMPDIR/map-perf" \
  --window-size=1512,982 --no-first-run --disable-extensions about:blank &
cd tools
URL="file://$PWD/../index.html?open"
```

| Command | What it measures |
|---|---|
| `node camreverse.mjs 9337 "$URL"` | Sends trackpad flicks, wheel spins and diagonal swipes, all forward, and counts frames where the camera moves backward. Should be 0 |
| `node camjerk.mjs 9337 "$URL"` | Per-frame change in pitch, yaw and zoom, and on-screen speed, under a steady scroll |
| `node fly3dperf-up.mjs 9337 "$URL"` | Frame times over the whole journey. Add `--disable-frame-rate-limit --disable-gpu-vsync` to Chrome for uncapped numbers |
| `node frameprof.mjs 9337 "$URL"` | Main-thread time per frame, split by where it goes |
| `node droptrace.mjs 9337 "$URL"` | Chrome's own frame reporter: dropped and presented frames |
| `node hovercheck.mjs 9337 "$URL" 7250,5300` | Hover hit area: sweeps the mouse over a grid below each building name, at the given road positions, and counts the points that open that building |

Add `--headless=new` to run without a window. Headless numbers are good for comparing before and after, not for judging how smooth it feels: see the caveat in `LEARNINGS.md`.

## Credits and licences

| Item | Source | Licence |
|---|---|---|
| Engravings (forests, mountains, hills, wetlands, cartouche, compass, ships, whale, serpent) | K.M. Alexander's public-domain collection | CC0 |
| Display and body type (IM Fell Great Primer, EB Garamond) | Google Fonts, loaded from fonts.googleapis.com | SIL Open Font License |
| "Harry P" lettering for the name (`assets/fonts/harry-p.ttf`) | Fan font by GemFonts, from dafont.com | No licence terms in its readme: fine for this local study, not cleared for reuse |
| Company and project logos (`assets/logos/`) | Kunal's portfolio site | Trademarks of their owners |
| Case-study, blog and About-me pictures (`site/`) | Kunal's portfolio site | Kunal's own work and photos: keep within Hinge Health |
| All code, the buildings and the shaders | Written for this project | — |
