# five-percent
participant of Meta VR Start Developer Competition 2026

## WebXR emulator (dependency-free)

`src/emulator/xr.js` installs a working `navigator.xr` (`immersive-vr`) so WebXR code runs in a plain desktop browser, without a headset and without npm packages.

- Meta Quest 3 / 2 profiles (`devices.js`): per-eye field of view, eye distance, resolution, frame rates.
- Session, `local` / `local-floor` / `viewer` spaces, `XRFrame.getViewerPose` with two views, `XRWebGLLayer` (both eyes side by side in the page canvas), `XRRigidTransform`.
- Two tracked-pointer controllers with `select` / `squeeze` events and an xr-standard gamepad.
- Keyboard and mouse: **WASD** walk, **R/F** up/down, **arrows** or right-drag look, **click** right trigger, **Shift+click** left trigger, **Space** squeeze (Shift+Space left), mouse position aims the hands.
- Scripted control (tests): `window.__xrEmulator.setHead({position, yaw, pitch})`, `.setController(hand, {position, orientation})`, `.click(hand, 'trigger')`, `.thumbstick(hand, x, y)`.

Use it with `install()` from the module, or open `index.html?emulate` for the demo scene (it renders only through the WebXR API, so it runs on a real headset too).

Tests: `npm test` (needs a Chromium available to Playwright; the repo itself has no dependencies).

The emulator is meant to be replaceable later by IWER without touching the application code.
