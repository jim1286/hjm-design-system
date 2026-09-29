const { chromium } = require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:6026/iframe.html?id=components-data-display--tree&viewMode=story');await p.locator('[data-hjm-renderer]').waitFor({state:'attached'});await p.waitForTimeout(300);
const q=p.getByRole('treeitem',{name:/2단계 2개 중 1번째/});console.log(await q.evaluate(e=>e.outerHTML.slice(0,700)));
await q.tap();await p.waitForTimeout(300);console.log('after tap row',await q.getAttribute('aria-expanded'),await q.getAttribute('aria-selected'));
const tg=q.locator('button, [data-hjm-tree-toggle], .hjm-tree__toggle').first();console.log('toggle count',await tg.count());if(await tg.count()){const bb=await tg.boundingBox();console.log('toggle box',bb);await tg.tap();await p.waitForTimeout(300);console.log('after toggle tap',await q.getAttribute('aria-expanded'))}
await p.mouse.click(0,0);const q2=p.getByRole('treeitem',{name:/2단계 2개 중 1번째/});
await b.close()})();
