# Installing Map of the work

A learning project: Kunal Satpal's portfolio as a hand-drawn, 3D map you fly over by scrolling. It is one HTML page plus its pictures. There is nothing to install and nothing to run in the background.

## What you need

- **Google Chrome**, a current version. It's tested in Chrome on macOS; other browsers aren't tested.
- **WebGL2**, which almost any computer from the last several years has. To check, open `chrome://gpu` and look for "WebGL2: Hardware accelerated".
- **Internet: optional.** The fonts come from Google Fonts; offline, the text falls back to Georgia.
- **Only if you want to change it:** Python 3.8 or later (standard library only).
- **Only if you want to measure it:** Node 22 or later.

## Open it (about a minute)

1. Unzip `map-of-the-work.zip` anywhere, for example in `~/Documents`.
2. Open `map-of-the-work/index.html` in Chrome: drag it onto a Chrome window, or use File → Open File.
3. Scroll up (or drag the map toward you, or press ↑) to travel. Hover a building to read about it. Buildings with a red wax seal open a full case study or field note.

Keep `index.html` next to the `site/` folder: the pictures load from there.

**To see the phone version:** open DevTools (⌥⌘I on a Mac, Ctrl+Shift+I elsewhere), switch on device mode (⇧⌘M, or Ctrl+Shift+M), pick a phone and reload. On a phone you swipe down to move on, one place per swipe.

**If the map stays blank or flat:** check `chrome://gpu` for WebGL2, and make sure "Use graphics acceleration when available" is on in Chrome's Settings → System.

## Change it

1. Edit the files in `src/`.
2. Rebuild: in the `map-of-the-work` folder, run `python3 -I build.py`. It writes a new `index.html`.
3. Reload the page.

Useful starting points:

- **`src/00-batches.js`** has an on/off switch for each change made after the design critique. Set one to `false` and rebuild to undo just that change.
- **`window.__map`** in the browser console lets you drive it: `__map.flyTo(0, 5300, 0, 1000)` flies to Cult.fit.
- **`EDITING.md`** shows how to change a building's words, move or add buildings, add scenery and pages, and adjust the camera.
- **`README.md`** explains what's in each file and how the tools work. **`LEARNINGS.md`** covers what building it taught.

## A local web server (optional)

You don't need one: the page runs straight from disk. If you'd rather use `http://`, keep it to your own machine:

```
cd map-of-the-work
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open http://127.0.0.1:8000/. The `--bind 127.0.0.1` matters: without it, the server is reachable by anyone on your network.

## Ground rules

- **It stays local.** It's for learning: don't host it, publish it, or push it to a personal GitHub account. A local `git init` is fine. If it ever needs a shared repository, an engineer creates it in an approved Hinge Health GitHub org, with signed commits.
- **No secrets are in it, and it calls nothing on the internet** except Google Fonts.
- **The content is Kunal's.** Keep it within Hinge Health. The "Harry P" font used for his name is a fan font that isn't cleared for reuse; see the credits in `README.md`.
- **The measurement tools** in `tools/` drive Chrome through its remote-debugging port, which gives full control of that browser. Run them in a throwaway Chrome profile and close it when you're done. `README.md` has the commands.

## Questions

Ask Kunal Satpal.
