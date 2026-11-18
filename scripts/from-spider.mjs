// Brings Spider Paint (the 3Draft viewer as a site) into this repository, with only the scenes Fifth Percent ships.
//
//   node scripts/from-spider.mjs ../spider-paint
//
// Copies the page, the engine (engine/<commit>/), the player, the sky guide, the icons, the Vercel functions (api/) and the
// listed models from a Spider Paint checkout, then trims the page's scene list (and the phone's Exa menu) to SCENES and the
// service worker's offline list to the files that are here. Every edit is an exact text replacement: if one no longer matches
// (Spider Paint changed), the script stops and says which. Run it again after every Spider Paint release.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const src = resolve(process.argv[2] ?? '../spider-paint');
const here = resolve(new URL('..', import.meta.url).pathname);

// the scene list: [value, label, the model files it needs]
const SCENES = [
  ['bridge', 'Stone Bridge', ['bridge.scene.json']],
  ['globe', 'Globe', ['globe.scene.json']],
  ['deepsky', 'Deep Sky (1000 galaxies, 400 black holes, 3000 stars)', ['deepsky.scene.json']],
  ['betterman', 'Betterman (pose him: J)', ['betterman.scene.json']],
  ['game:lark', 'LARK + Deep Sky: the LARK-4 as the starship (VR: fly it with the hands)', ['lark.game.json', 'lark-4.scene.json', 'deepsky-lark.scene.json']],
  ['story:lark-4c-accident', 'Story: Last Light (LARK-4C)', ['lark-4c-accident.build.json', 'lark-4c-accident.scene.json']],
  ['story:lark-4', 'Story: LARK build (746 steps)', ['lark-4.build.json']],
];
// the scene it starts with
const START = 'game:lark';
const MODEL_TOOLS = ['spider-build-v2.mjs', 'spider-build-v2.md', 'spider-build-v2.schema.json'];
const FILES = ['index.html', 'player.html', 'PLAYER.md', 'sky.html', 'sky.md', 'help.md', 'favicon.svg', 'manifest.webmanifest', 'sw.js', 'MCP.md', 'xr-test.html', 'xr-compare.html'];
const DIRS = ['engine', 'icons', 'media', 'api'];

for (const d of [...DIRS, 'models']) rmSync(join(here, d), { recursive: true, force: true });
for (const d of DIRS) cpSync(join(src, d), join(here, d), { recursive: true });
for (const f of FILES) cpSync(join(src, f), join(here, f));
mkdirSync(join(here, 'models'), { recursive: true });
const models = [...new Set([...SCENES.flatMap(([, , m]) => m), ...MODEL_TOOLS])];
for (const m of models) {
  if (!existsSync(join(src, 'models', m))) throw new Error(`missing in Spider Paint: models/${m}`);
  cpSync(join(src, 'models', m), join(here, 'models', m));
}

const edit = (file, steps) => {
  let text = readFileSync(join(here, file), 'utf8');
  for (const [name, from, to] of steps) {
    const hit = typeof from === 'string' ? text.includes(from) : from.test(text);
    if (!hit) throw new Error(`${file}: the step "${name}" no longer matches`);
    text = text.replace(from, to);
  }
  writeFileSync(join(here, file), text);
};
const opt = ([v, label]) => `<option value="${v}">${label}</option>`;
const plain = SCENES.filter(([v]) => !v.includes(':')), games = SCENES.filter(([v]) => v.startsWith('game:')), stories = SCENES.filter(([v]) => v.startsWith('story:'));
edit('index.html', [
  ['scene list', /(<option value="">\+ scene<\/option>\n)[\s\S]*?(\s*<optgroup id="savedGroup")/, (_, head, tail) =>
    `${head}${plain.map((s) => `        ${opt(s)}\n`).join('')}        <optgroup label="games">${games.map(opt).join('')}</optgroup>\n        <optgroup label="stories">${stories.map(opt).join('')}</optgroup>${tail}`],
  ['exa menu', /for \(const name of \['empty', 'globe'[^\]]*\]\)/, `for (const name of ['empty', ${plain.map(([v]) => `'${v}'`).join(', ')}])`],
  // VR with the hands only: the controllers are ignored
  ['hands only', "const XR_HANDS_ONLY = new URLSearchParams(location.search).has('handsonly');", 'const XR_HANDS_ONLY = true; // (Fifth Percent: the hands only)'],
  // on a headset VR starts by itself (?novr: not)
  ['auto vr', "const XR_AUTO = new URLSearchParams(location.search).has('autovr');", "const XR_AUTO = !new URLSearchParams(location.search).has('novr'); // (Fifth Percent: on a headset, VR at once)"],
  // the starting scene: START (?scene=… another one, ?empty nothing)
  ['start scene', "else if (!EMBED && !SHOW && new URLSearchParams(location.search).has('deepsky'))\n      (startScene = 'deepsky'), setTimeout(() => withLoader('deepsky', async () => loadScene(await sceneOf('deepsky'), true)).then(() => targetByName(linkTarget)).catch((e) => sceneNote(`scene: ${e.message}`)), 0);",
    `else if (!EMBED && !SHOW && !new URLSearchParams(location.search).has('empty'))\n      setTimeout(() => addExample('${START}').then(() => targetByName(linkTarget)).catch((e) => sceneNote(\`scene: \${e.message}\`)), 0);`],
]);
// the offline list: only what is here; its own cache name (Spider Paint's version number kept, so a new sync renews it)
edit('sw.js', [
  ['cache name', /const CACHE = 'spider-paint-(v\d+)';/, (_, v) => `const CACHE = 'five-percent-${v}';`],
  ['shell', /const SHELL = \[[^\]]*\];/, (all) => {
    const list = JSON.parse(all.slice(all.indexOf('['), all.lastIndexOf(']') + 1).replace(/'/g, '"'));
    return `const SHELL = ${JSON.stringify(list.filter((f) => f === './' || existsSync(join(here, f)))).replace(/"/g, "'").replace(/,/g, ', ')};`;
  }],
]);
console.log(`Spider Paint copied: ${models.length} model files, ${SCENES.length} scenes in the list`);
