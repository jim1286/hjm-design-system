const{chromium}=require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://127.0.0.1:6016/iframe.html?id=patterns-optional-motion--playground&viewMode=story&globals=motion:reduced');const t=p.getByRole('button',{name:'작업 선택'});await t.waitFor();await p.waitForTimeout(300);
console.log(JSON.stringify(await t.evaluate(e=>{const c=getComputedStyle(e);return{bg:c.backgroundColor,border:c.border,h:e.offsetHeight,w:e.offsetWidth}})));await p.screenshot({path:'/tmp/hjm-web-audit-0930/web-screens/OptionalMotion-reduced-trigger.png'});
await t.click();await p.getByRole('menuitem',{name:'저장',exact:true}).click();console.log((await p.locator('body').innerText()).includes('save'));
await p.goto('http://127.0.0.1:6016/iframe.html?id=patterns-optional-motion--playground&viewMode=story&globals=direction:rtl');await t.waitFor();await p.waitForTimeout(300);await p.screenshot({path:'/tmp/hjm-web-audit-0930/web-screens/OptionalMotion-rtl-trigger.png'});await b.close()})();
