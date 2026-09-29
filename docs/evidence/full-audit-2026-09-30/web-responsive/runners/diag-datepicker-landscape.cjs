const { chromium } = require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:3});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:6026/iframe.html?id=components-inputs--date-picker&viewMode=story');await p.locator('[data-hjm-renderer]').waitFor({state:'attached'});await p.waitForTimeout(300);
await p.getByRole('button',{name:/날짜를 선택하세요/}).tap();await p.waitForTimeout(500);
const m=()=>p.evaluate(()=>{const e=document.querySelector('.hjm-date-picker__popover');const r=e.getBoundingClientRect();return {pos:getComputedStyle(e).position,overflowY:getComputedStyle(e).overflowY,maxH:getComputedStyle(e).maxHeight,top:r.top,bottom:r.bottom,scrollH:e.scrollHeight,clientH:e.clientHeight,scrollY,docH:document.documentElement.scrollHeight}});
console.log(await m());await p.evaluate(()=>scrollBy(0,200));await p.waitForTimeout(300);console.log('after page scroll',await m());
await b.close()})();
