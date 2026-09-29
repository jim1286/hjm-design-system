// Responsive render pass: screenshot + horizontal-overflow measurement per viewport.
// usage: node render.cjs <viewportName>   (tablet | wide | landscape)
const { chromium } = require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
const fs = require('fs');
const repo = '/Users/jimin/Developer/app-portfolio/packages/hjm-design-system';
const out = '/tmp/hjm-web-resp-0930';
const BASE = 'http://127.0.0.1:6026';
const VP = {
  tablet: { viewport: { width: 768, height: 1024 } },
  wide: { viewport: { width: 1440, height: 900 } },
  landscape: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 },
};
const name = process.argv[2];
const only = process.argv[3] ? process.argv[3].split(',') : null; // optional re-run subset, merged into the existing ledger
const prior = JSON.parse(fs.readFileSync(repo + '/docs/evidence/full-audit-2026-09-30/web/web.json')).results;
let targets = prior.map(r => ({ component: r.component, storyId: r.storyId, kind: 'canonical' }));
const OPTIONAL = [
  ['OptionalMotion', 'patterns-optional-motion--playground'],
  ['InteractionAdapters', 'experimental-interaction-adapters--playground'],
  ['ThinkingOrbStates', 'patterns-thinking-orb--all-states'],
  ['DataLayouts', 'patterns-data-layouts--data-layout-preview'],
  ['PackedCards', 'patterns-data-layouts--packed-cards'],
  ['WindowedList', 'patterns-data-layouts--windowed-list'],
  ['ShareCode', 'patterns-data-layouts--share-code'],
  ['WebAdditions', 'patterns-web-additions--web-additions-preview'],
  ['FabNotes', 'patterns-floating-action-button--notes'],
  ['Rating', 'patterns-rating--half-point'],
  ['TimePicker', 'patterns-time-selection--choose-time'],
  ['Cascader', 'patterns-tree--cascader-composition'],
  ['TreeSelect', 'patterns-tree--tree-select-composition'],
  ['ConfirmPopover', 'patterns-popover--reversible-confirmation'],
  ['SidebarShell', 'patterns-sidebar--desktop-shell'],
  ['SplitterListDetail', 'patterns-splitter--list-and-detail'],
  ['WebNavigationRecords', 'patterns-webnavigation--records'],
];
targets = targets.concat(OPTIONAL.map(([component, storyId]) => ({ component, storyId, kind: 'optional' })));
if (name === 'landscape') {
  const keep = ['Sheet', 'Dialog', 'AlertDialog', 'SidePanel', 'Layout', 'BottomNavigation', 'BottomCTA', 'Tour', 'CommandPalette', 'Popover', 'Menu', 'Select', 'DatePicker', 'AuthScreenLayout', 'Toast', 'TopBar', 'FabNotes', 'TimePicker', 'Cascader', 'TreeSelect'];
  targets = targets.filter(t => keep.includes(t.component));
}
if (only) targets = targets.filter(t => only.includes(t.component));
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(VP[name]);
  const page = await ctx.newPage();
  let errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const results = [];
  fs.mkdirSync(`${out}/shots/${name}`, { recursive: true });
  for (const t of targets) {
    errors = [];
    const row = { ...t, viewport: name, size: VP[name].viewport };
    try {
      for (let attempt = 0; ; attempt++) {
        // retry once: cold loads under host load (load avg 20-30 on 2026-09-30) timed out, not the story
        try { await page.goto(`${BASE}/iframe.html?id=${t.storyId}&viewMode=story`); await page.locator('[data-hjm-renderer], .hjm-story-root').first().waitFor({ state: 'attached', timeout: 20000 }); break; }
        catch (e) { if (attempt >= 1) throw e; }
      }
      await page.waitForTimeout(250);
      row.overflow = await page.evaluate(() => {
        const w = innerWidth;
        const off = [...document.querySelectorAll('body *')].filter(e => {
          const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
          if (!r.width || cs.visibility === 'hidden' || cs.display === 'none') return false;
          // skip descendants clipped by an overflow container (scrollers are fine)
          for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX; if (o !== 'visible') { const pr = p.getBoundingClientRect(); if (pr.right <= w + 1 && pr.left >= -1) return false; }
          }
          return r.right > w + 1 || r.left < -1;
        });
        return { viewport: w, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
          horizontalScroll: document.documentElement.scrollWidth > w + 1,
          offenders: off.slice(0, 6).map(e => e.tagName + '.' + String(e.className).slice(0, 60) + ' ' + Math.round(e.getBoundingClientRect().left) + '..' + Math.round(e.getBoundingClientRect().right)) };
      });
      const file = `shots/${name}/${t.component}.png`;
      await page.screenshot({ path: `${out}/${file}`, fullPage: t.component !== 'BottomNavigation' });
      row.screenshot = file;
      const rend = page.locator('[data-hjm-renderer]').first();
      // BottomNavigation's renderer wraps a position:fixed bar; element screenshots time out on it, the viewport capture is the evidence.
      if (t.component !== 'BottomNavigation' && await rend.count()) {
        const crop = `shots/${name}/${t.component}-renderer.png`;
        await rend.screenshot({ path: `${out}/${crop}` }); row.rendererScreenshot = crop;
        row.renderer = await rend.evaluate(e => { const r = e.getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; });
      }
      row.runtimeErrors = errors;
      row.render = errors.length ? 'errors' : 'pass';
    } catch (e) { row.render = 'fail'; row.error = e.message; }
    results.push(row);
    console.log(name, t.component, row.render, row.overflow?.documentWidth, row.overflow?.offenders?.length || 0);
  }
  let merged = results;
  if (only && fs.existsSync(`${out}/render-${name}.json`)) { const old = JSON.parse(fs.readFileSync(`${out}/render-${name}.json`)); merged = old.map(r => results.find(n => n.component === r.component) || r); }
  fs.writeFileSync(`${out}/render-${name}.json`, JSON.stringify(merged, null, 2));
  await browser.close();
})();
