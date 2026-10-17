// Web ↔ Native reference screen comparison (on demand only — not a CI gate or automatic test).
//
// Why: web/app drift in shared screens was only found by the user eyeballing both Storybooks
// (2026-10-17 request). This captures the same reference stories on both platforms and writes
// side-by-side images (web | native) so a person can scan them in one place. It does not judge
// pass/fail; it reports which captures succeeded.
//
// Prerequisites (the script does not start or boot anything):
//   - Web Storybook on http://localhost:6006   (pnpm showcase:web)
//   - Native Storybook Metro on port 8084 with the showcase already open in Expo Go on the
//     booted simulator                         (pnpm showcase:native:ios)
//   - The simulator stays the existing one (portfolio rule: never create/boot another device).
//
// Usage:
//   pnpm compare:screens
//   pnpm compare:screens -- --only common-screen-chat--default,patterns-search--default
//   pnpm compare:screens -- --stage 구성,화면   (every 구성/화면 story's first export, for full audits)
// Each story is captured as Web mobile (402pt), Web desktop (1280px) and Native.
//   env: HJM_COMPARE_UDID (simulator, default booted iPhone 17 Pro below),
//        HJM_COMPARE_WEB_ORIGIN, HJM_COMPARE_EXPO_URL, HJM_COMPARE_OUT
//
// Native story selection uses @storybook/react-native's documented Linking hook: the on-device UI
// listens for a URL with ?STORYBOOK_STORY_ID=<id> and emits SET_CURRENT_STORY (10.4.4
// dist/index.js, STORYBOOK_STORY_ID_PARAM). `simctl openurl` delivers that URL through Expo Go,
// so no websocket server, coordinate tapping or .rnstorybook change is needed.
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Reuse dependencies already installed in the showcases instead of adding root dependencies.
const {chromium} = createRequire(path.join(root, 'showcase/web/package.json'))('playwright');
const {toId, storyNameFromExport} = createRequire(path.join(root, 'showcase/native/package.json'))('storybook/internal/csf');

// Same Web story ids as the usage docs; native ids are derived from the shared title + export name,
// because Web metas pin explicit `id`s while native metas use the (Korean) title.
const STORIES = [
  'common-screen-chat--default',
  'common-screen-comments--default',
  'common-screen-conversation-list--default',
  'common-screen-notifications--default',
  'reference-settings--default',
  'common-screen-settings--default',
  'screen-flow-collection--default',
  'screen-flow-editor--default',
  'common-screen-login--default',
  'patterns-search--default',
  'common-screen-shell--empty',
  'common-screen-shell--error',
];

const args = process.argv.slice(2);
const onlyIndex = args.indexOf('--only');
const stageIndex = args.indexOf('--stage');
const udid = process.env.HJM_COMPARE_UDID ?? 'AC433031-1746-46C6-86A9-143A1FC839F8';
const webOrigin = process.env.HJM_COMPARE_WEB_ORIGIN ?? 'http://localhost:6006';
const expoUrl = process.env.HJM_COMPARE_EXPO_URL ?? 'exp://127.0.0.1:8084';
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const out = path.resolve(process.env.HJM_COMPARE_OUT ?? path.join(root, 'artifacts/screen-compare', stamp));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const booted = execFileSync('xcrun', ['simctl', 'list', 'devices', 'booted'], {encoding: 'utf8'});
if (!booted.includes(udid)) throw new Error(`Simulator ${udid} is not booted. Open the existing simulator; this script never boots one.`);

const index = await fetch(`${webOrigin}/index.json`).then(r => r.json()).catch(() => {
  throw new Error(`Web Storybook is not reachable at ${webOrigin}`);
});
// --stage picks one representative story (the first export) per 구성/화면 title for audits.
function stageStories(stages) {
  const firstPerTitle = new Map();
  for (const entry of Object.values(index.entries)) {
    if (entry.type !== 'story' || !stages.includes(entry.title.split('/')[1])) continue;
    if (!firstPerTitle.has(entry.title)) firstPerTitle.set(entry.title, entry.id);
  }
  return [...firstPerTitle.values()];
}
const selected = onlyIndex >= 0 ? args[onlyIndex + 1].split(',') : stageIndex >= 0 ? stageStories(args[stageIndex + 1].split(',')) : STORIES;
// Native stories live in src/ and src/components/; read every *.stories file recursively.
const nativeSources = await Promise.all((await fs.readdir(path.join(root, 'showcase/native/src'), {recursive: true}))
  .filter(f => /\.stories\.tsx?$/.test(f))
  .map(f => fs.readFile(path.join(root, 'showcase/native/src', f), 'utf8')));

function nativeIdFor(entry) {
  // Story files write the title with or without a space after the colon.
  const source = nativeSources.find(s => s.includes(`title: "${entry.title}"`) || s.includes(`title:"${entry.title}"`));
  if (!source) return {error: `no native story file with title "${entry.title}"`};
  if (!new RegExp(`export const ${entry.exportName}\\b`).test(source)) return {error: `native file lacks export ${entry.exportName}`};
  return {id: toId(entry.title, storyNameFromExport(entry.exportName))};
}

function simShot(file) {
  execFileSync('xcrun', ['simctl', 'io', udid, 'screenshot', file], {stdio: 'ignore'});
  return fs.readFile(file);
}

// Wait until two consecutive frames match so the capture is not a mid-transition frame.
// Animated stories may never settle; that is reported instead of hidden.
async function captureNative(id, file) {
  execFileSync('xcrun', ['simctl', 'openurl', udid, `${expoUrl}/--/?STORYBOOK_STORY_ID=${encodeURIComponent(id)}`]);
  await sleep(1500);
  let previous = await simShot(file);
  for (let i = 0; i < 8; i += 1) {
    await sleep(700);
    const next = await simShot(file);
    if (next.equals(previous)) return {stable: true};
    previous = next;
  }
  return {stable: false};
}

// Start from a fresh JS runtime: after source edits, Fast Refresh can leave a duplicated provider module
// whose LogBox error then covers every later story (2026-10-17: a whole component batch captured that
// error screen). Relaunch Expo Go on the showcase and give Metro time to serve the bundle.
execFileSync('xcrun', ['simctl', 'terminate', udid, 'host.exp.Exponent'], {stdio: 'ignore'});
execFileSync('xcrun', ['simctl', 'openurl', udid, expoUrl]);
await sleep(Number(process.env.HJM_COMPARE_BOOT_MS ?? 30000));

await fs.mkdir(out, {recursive: true});
const browser = await chromium.launch({headless: true});
// iPhone 17 Pro: 402×874 pt at 3x, the same frame `simctl io screenshot` returns (1206×2622).
const page = await browser.newPage({viewport: {width: 402, height: 874}, deviceScaleFactor: 3});
const desktop = await browser.newPage({viewport: {width: 1280, height: 800}, deviceScaleFactor: 1});
const composer = await browser.newPage({viewport: {width: 1000, height: 1000}, deviceScaleFactor: 1});
const results = [];

for (const webId of selected) {
  const result = {webId, web: 'missing', native: 'missing'};
  results.push(result);
  const entry = index.entries[webId];
  if (!entry) { result.error = 'not in Web Storybook index'; continue; }
  const dir = path.join(out, webId);
  await fs.mkdir(dir, {recursive: true});
  const webFile = path.join(dir, 'web.png');
  const desktopFile = path.join(dir, 'web-desktop.png');
  const nativeFile = path.join(dir, 'native.png');

  const pageErrors = [];
  const onError = e => pageErrors.push(e.message);
  page.on('pageerror', onError);
  try {
    await page.goto(`${webOrigin}/iframe.html?id=${encodeURIComponent(webId)}&viewMode=story`, {waitUntil: 'networkidle'});
    // Storybook marks a failed story load with body.sb-show-errordisplay; report its message
    // instead of waiting for a root that never renders.
    await page.locator('#storybook-root > *, body.sb-show-errordisplay').first().waitFor({state: 'attached'});
    if (await page.locator('body.sb-show-errordisplay').count()) {
      throw new Error(`Storybook error: ${await page.locator('#error-message').innerText()}`);
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({path: webFile});
    result.web = pageErrors.length ? 'captured-with-errors' : 'captured';
    if (pageErrors.length) result.webErrors = pageErrors;
  } catch (error) {
    result.web = 'failed';
    result.webError = error.message.split('\n')[0];
  }
  page.off('pageerror', onError);
  try {
    await desktop.goto(`${webOrigin}/iframe.html?id=${encodeURIComponent(webId)}&viewMode=story`, {waitUntil: 'networkidle'});
    await desktop.locator('#storybook-root > *, body.sb-show-errordisplay').first().waitFor({state: 'attached'});
    await desktop.evaluate(() => document.fonts.ready);
    await desktop.screenshot({path: desktopFile, fullPage: true});
    result.webDesktop = 'captured';
  } catch (error) {
    result.webDesktop = 'failed';
  }

  const native = nativeIdFor(entry);
  result.nativeId = native.id;
  if (native.error) {
    result.nativeError = native.error;
  } else {
    try {
      const {stable} = await captureNative(native.id, nativeFile);
      result.native = stable ? 'captured' : 'captured-unstable';
    } catch (error) {
      result.native = 'failed';
      result.nativeError = error.message.split('\n')[0];
    }
  }

  // Inline as data URLs: an about:blank page may not load file:// images.
  const dataUrl = async file => `data:image/png;base64,${(await fs.readFile(file)).toString('base64')}`;
  const panel = async (label, file, ok) => ok
    ? `<figure><figcaption>${label}</figcaption><img src="${await dataUrl(file)}"></figure>`
    : `<figure><figcaption>${label}</figcaption><div class="missing">캡처 없음</div></figure>`;
  await composer.setContent(`<style>
    body{margin:0;font:600 28px system-ui;background:#e5e7eb}
    h1{margin:0;padding:16px 24px;font-size:30px;background:#111827;color:#fff}
    main{display:flex;gap:24px;padding:24px}
    figure{margin:0;width:603px} figure.wide{width:1280px} figure.wide img{width:1280px} figcaption{margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    img{width:603px;display:block;border:1px solid #9ca3af}
    .missing{width:603px;height:1311px;display:grid;place-items:center;background:#fff;border:1px dashed #9ca3af}
  </style><h1>${entry.title} / ${entry.name} · ${webId}</h1><main>
    ${await panel('Web (402pt)', webFile, result.web.startsWith('captured'))}
    ${(await panel('Web desktop (1280px)', desktopFile, result.webDesktop === 'captured')).replace('<figure>', '<figure class="wide">')}
    ${await panel(`Native · ${native.id ?? ''}`, nativeFile, result.native.startsWith('captured'))}
  </main>`, {waitUntil: 'load'});
  await composer.screenshot({path: path.join(dir, 'compare.png'), fullPage: true});
  console.log(`${webId}: web=${result.web}${result.webError ? ` (${result.webError})` : ''} native=${result.native}${result.nativeError ? ` (${result.nativeError})` : ''}`);
}

await browser.close();
await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify({udid, webOrigin, expoUrl, results}, null, 2));
const complete = results.filter(r => r.web === 'captured' && r.native === 'captured').length;
console.log(`\n${complete}/${results.length} captured cleanly on both platforms → ${out}`);
