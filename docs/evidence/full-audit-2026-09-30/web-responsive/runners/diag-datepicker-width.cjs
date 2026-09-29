const { chromium } = require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
(async()=>{const b=await chromium.launch();for(const vp of [{width:390,height:844},{width:360,height:740},{width:320,height:640}]){const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:3});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:6026/iframe.html?id=components-inputs--date-picker&viewMode=story');await p.locator('[data-hjm-renderer]').waitFor({state:'attached'});await p.waitForTimeout(300);
await p.getByRole('button',{name:/날짜를 선택하세요/}).tap();await p.waitForTimeout(500);
console.log(vp.width,await p.evaluate(()=>{const e=document.querySelector('.hjm-date-picker__popover');const r=e.getBoundingClientRect();const t=document.querySelector('.hjm-date-picker button, [data-hjm-renderer] button').getBoundingClientRect();return {innerWidth,vv:visualViewport.width,left:r.left,right:r.right,width:r.width,trigger:[t.left,t.right],docW:document.documentElement.scrollWidth,style:e.getAttribute('style'),minw:getComputedStyle(e).minWidth,maxw:getComputedStyle(e).maxWidth}}));
await p.screenshot({path:`/tmp/hjm-web-resp-0930/shots/mobile-touch/DatePicker-open-${vp.width}.png`});await ctx.close()}
await b.close()})();
