# five-percent
participant of Meta VR Start Developer Competition 2026 (**Fifth Percent**)

## The app

`index.html` is [Spider Paint](https://github.com/Pengeszikra/Spider-Paint), the [3Draft](https://github.com/Pengeszikra/3Draft)
engine's viewer and editor, with the scenes Fifth Percent ships:

- Stone Bridge
- Globe
- Deep Sky (1000 galaxies, 400 black holes, 3000 stars)
- Betterman (pose him: J)
- LARK + Deep Sky: the LARK-4 lander as the starship; in VR (Meta Quest 3, hand tracking) you fly it with bare hands and
  work in its cabin
- Story: Last Light (LARK-4C)
- Story: LARK build (746 steps)

It starts with **LARK + Deep Sky**. On a headset's browser (Meta Quest) VR starts by itself: the browser is offered the
session at once (its own Enter VR) and the page shows a full-screen **ENTER VR** (one tap or pinch). In VR only the **hands**
count (hand tracking; controllers are ignored). `?novr` keeps the page flat, `?empty` starts with nothing, `?scene=<value>`
with another scene of the list. Pick another scene in **+ scene**; **VR** enters again. The VR hands, the starship and the workshop are described
in 3Draft's `VR-WORKSHOP.md` and `VRTSH.md`; the embeddable player in `PLAYER.md`; the sky in `sky.md`.

It is a static site with two Vercel functions in `api/` (the online scene store, which also takes the in-VR debug reports, and
an MCP endpoint). Everything here except `scripts/`, `src/`, `tests/`, `emulator.html` and the docs is copied from Spider Paint
by `npm run sync` (`scripts/from-spider.mjs ../spider-paint`), which also trims the scene list: change the scenes there, not
in `index.html`.

## WebXR emulator (dependency-free)

`src/emulator/xr.js` installs a working `navigator.xr` (`immersive-vr`) so WebXR code runs in a plain desktop browser, without a headset and without npm packages.

- Meta Quest 3 / 2 profiles (`devices.js`): per-eye field of view, eye distance, resolution, frame rates.
- Session, `local` / `local-floor` / `viewer` spaces, `XRFrame.getViewerPose` with two views, `XRWebGLLayer` (both eyes side by side in the page canvas), `XRRigidTransform`.
- Two tracked-pointer controllers with `select` / `squeeze` events and an xr-standard gamepad.
- Keyboard and mouse: **WASD** walk, **R/F** up/down, **arrows** or right-drag look, **click** right trigger, **Shift+click** left trigger, **Space** squeeze (Shift+Space left), mouse position aims the hands.
- Scripted control (tests): `window.__xrEmulator.setHead({position, yaw, pitch})`, `.setController(hand, {position, orientation})`, `.click(hand, 'trigger')`, `.thumbstick(hand, x, y)`.

Use it with `install()` from the module, or open `emulator.html?emulate` for the demo scene (it renders only through the WebXR API, so it runs on a real headset too).

Tests: `npm test` (needs a Chromium available to Playwright; the repo itself has no dependencies).

The emulator is meant to be replaceable later by IWER without touching the application code.
