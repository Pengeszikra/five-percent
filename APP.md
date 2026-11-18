# five-percent: developer handover

Entry for the **Meta VR Start Developer Competition 2026** (the project is called *Fifth Percent*; the competition page is https://start-developer-competition-26.devpost.com/). Related to [3Draft](https://github.com/Pengeszikra/3Draft) (minimalist 3D engine and editor) and [Spider-Paint](https://github.com/Pengeszikra/Spider-Paint) (its viewer as a PWA): the models and the engine can feed the VR experience. Two collaborators (models) take turns on the project, so keep this file true. The owner speaks Hungarian to the assistant; code, docs and commits are English.

Branch: `main`. Status: the competition entry is being handed in. The app is **Spider Paint** (`index.html`), copied here with only the scenes Fifth Percent ships (see `scripts/from-spider.mjs`); beside it, a **dependency-free WebXR emulator** and its demo scene (`emulator.html`).

## Layout

| File | Role |
|---|---|
| `src/emulator/xr.js` | installs a working `navigator.xr` (`immersive-vr`) in a normal desktop browser: sessions, `local` / `local-floor` / `viewer` spaces, `XRFrame.getViewerPose` with two views, `XRWebGLLayer` (both eyes side by side in the canvas), `XRRigidTransform`, two tracked-pointer controllers with `select` / `squeeze` events and an xr-standard gamepad |
| `src/emulator/devices.js` | Meta Quest 3 and 2 profiles: per-eye FOV, eye distance, resolution, refresh rates |
| `src/math.js` | small vector/matrix helpers (no libraries) |
| `index.html`, `engine/`, `models/`, `player.html`, `sky.html`, `api/`, `icons/`, `media/`, `sw.js`, … | the app: Spider Paint, **generated** by `npm run sync` (never edit them here; change 3Draft, release Spider Paint, sync again) |
| `scripts/from-spider.mjs` | the sync: copies Spider Paint and keeps only the scenes in its `SCENES` list (and their model files); trims the scene list, the Exa menu and the service worker's offline list |
| `src/demo.js` + `emulator.html` | the emulator's demo scene; renders **only through the WebXR API**, so it also runs on a real headset |
| `tests/math.mjs` | maths unit tests |
| `tests/smoke.mjs` | headless Chromium test of the emulator (Playwright) |
| `tests/serve.mjs` | tiny static server used by `npm start` |

## Commands

```sh
npm start        # static server: / is the app, emulator.html?emulate the emulator demo
npm run sync     # Spider Paint (../spider-paint) into this repo, with the shipped scenes only
npm test         # tests/math.mjs && tests/smoke.mjs  (needs a Chromium that Playwright can launch)
```

`?emulate` installs the emulator before the app code runs; without it the page uses the real `navigator.xr` (a headset). Application code must never import from `src/emulator`, only call the standard WebXR API, so the emulator can later be swapped for IWER without touching the app.

Emulator controls: **WASD** walk, **R/F** up/down, **arrows** or right-drag look, **click** right trigger, **Shift+click** left trigger, **Space** squeeze (Shift+Space left), the mouse position aims the hands. Scripted control for tests: `window.__xrEmulator.setHead({position, yaw, pitch})`, `.setController(hand, {position, orientation})`, `.click(hand, 'trigger')`, `.thumbstick(hand, x, y)`.

## Conventions

- **No npm dependencies** for the pages (Playwright is only the test browser, supplied by the environment); the one dependency, `@vercel/blob`, is for the Vercel function `api/store.mjs`. Plain ES modules, no bundler, no build step.
- Headless WebGL: launch Chromium with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- Keep the emulator faithful to the WebXR spec names so code written against it runs on a Quest unchanged; add a test in `tests/smoke.mjs` for every emulator feature.
- Using 3Draft models: a 3Draft mesh is `{ positions: Vec3[], faces: [{ v, color?, mat? }] }`, y up, faces planar and convex, CCW from outside. The app carries the engine beside it (`engine/<commit>/`, from the sync).
- Do not decide the app's concept alone: propose, let the owner confirm.
- When done, leave the tree committed and pushed, tests green, and state in your last message what changed and what is half done.
