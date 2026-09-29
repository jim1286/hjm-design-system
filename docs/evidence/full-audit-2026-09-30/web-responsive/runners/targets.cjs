// 44px touch-target census at 390x844 touch. Effective box = control box unioned with its <label> (a native
// checkbox wrapped in a 44px label is a 44px target). Inline links inside running text are listed separately
// (WCAG 2.5.8 inline exception); 44px is the HJM/Apple guideline the task asked for, stricter than WCAG's 24px.
const { chromium } = require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
const fs = require('fs');
const repo = '/Users/jimin/Developer/app-portfolio/packages/hjm-design-system';
const out = '/tmp/hjm-web-resp-0930';
const prior = JSON.parse(fs.readFileSync(repo + '/docs/evidence/full-audit-2026-09-30/web/web.json')).results;
const extra = [['TimePicker', 'patterns-time-selection--choose-time'], ['Cascader', 'patterns-tree--cascader-composition'], ['TreeSelect', 'patterns-tree--tree-select-composition'], ['ConfirmPopover', 'patterns-popover--reversible-confirmation'], ['OptionalMotion', 'patterns-optional-motion--playground'], ['InteractionAdapters', 'experimental-interaction-adapters--playground'], ['Rating', 'patterns-rating--half-point'], ['FabNotes', 'patterns-floating-action-button--notes']];
const targets = prior.map(r => [r.component, r.storyId]).concat(extra);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }); const p = await ctx.newPage();
  const results = [];
  for (const [component, id] of targets) {
    try {
      await p.goto(`http://127.0.0.1:6026/iframe.html?id=${id}&viewMode=story`); await p.locator('[data-hjm-renderer], .hjm-story-root').first().waitFor({ state: 'attached', timeout: 20000 }); await p.waitForTimeout(250);
      const r = await p.evaluate(() => {
        const root = document.querySelector('[data-hjm-renderer]') || document.querySelector('.hjm-story-root') || document.body;
        const sel = 'button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button],[role=tab],[role=checkbox],[role=radio],[role=switch],[role=menuitem],[role=option],[role=slider],[role=combobox],[role=treeitem],[role=gridcell],[role=link],[role=separator][tabindex],[tabindex="0"]';
        const seen = new Set(); const rows = [];
        for (const e of root.querySelectorAll(sel)) {
          if (seen.has(e)) continue; seen.add(e);
          const cs = getComputedStyle(e); let r = e.getBoundingClientRect();
          if (e.disabled || e.getAttribute('aria-disabled') === 'true') continue;
          const lab = e.closest('label') || (e.id && document.querySelector(`label[for="${e.id}"]`));
          let box = { l: r.left, t: r.top, r: r.right, b: r.bottom };
          if (lab) { const q = lab.getBoundingClientRect(); box = { l: Math.min(box.l, q.left), t: Math.min(box.t, q.top), r: Math.max(box.r, q.right), b: Math.max(box.b, q.bottom) }; }
          const w = box.r - box.l, h = box.b - box.t;
          if (w * h === 0 || cs.visibility === 'hidden') continue;
          // a control nested inside a larger interactive ancestor (e.g. input inside a sized wrapper) is reported once
          const inline = e.tagName === 'A' && getComputedStyle(e).display === 'inline' && (e.parentElement?.textContent.trim().length || 0) > e.textContent.trim().length + 4;
          // Real hit extent: walk out from the centre until elementFromPoint leaves the control
          // (covers ::after hit slop and label wrappers; a neighbour on top ends the walk).
          const cx = (box.l + box.r) / 2, cy = (box.t + box.b) / 2;
          const hits = (x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t) || (lab && lab.contains(t))); };
          const extent = (dx, dy) => { let n = 0; while (n < 40 && hits(cx + dx * (n + 1), cy + dy * (n + 1))) n++; return n; };
          const onScreen = cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight;
          const hitW = onScreen && hits(cx, cy) ? extent(-1, 0) + extent(1, 0) + 1 : null, hitH = onScreen && hits(cx, cy) ? extent(0, -1) + extent(0, 1) + 1 : null;
          if (w < 44 || h < 44) rows.push({ hitWidth: hitW, hitHeight: hitH, tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), type: e.getAttribute('type'), name: (e.getAttribute('aria-label') || e.textContent || e.getAttribute('placeholder') || '').trim().slice(0, 40), cls: String(e.className).split(' ')[0], width: Math.round(w), height: Math.round(h), inline });
        }
        return rows;
      });
      results.push({ component, storyId: id, undersized: r }); console.log(component, r.length, r.slice(0, 4).map(x => `${x.tag}${x.role ? '[' + x.role + ']' : ''} "${x.name}" ${x.width}x${x.height} hit ${x.hitWidth}x${x.hitHeight}`).join(' | '));
    } catch (e) { results.push({ component, storyId: id, error: e.message.split('\n')[0] }); console.log(component, 'ERR', e.message.split('\n')[0]); }
  }
  fs.writeFileSync(out + '/targets-mobile.json', JSON.stringify(results, null, 2)); await b.close();
})();
