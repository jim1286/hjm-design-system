const{chromium}=require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
for(const g of ['theme:light','theme:dark','direction:rtl','textScale:2','theme:dark;direction:rtl;textScale:2']){await p.goto('http://127.0.0.1:6016/iframe.html?id=patterns-optional-motion--playground&viewMode=story&globals='+g);await p.getByRole('button',{name:'작업 선택'}).waitFor();await p.waitForTimeout(300);
const s=await p.getByRole('button',{name:'작업 선택'}).evaluate(e=>{const c=getComputedStyle(e);return {cls:e.className,bg:c.backgroundColor,radius:c.borderRadius,pad:c.padding,shadow:c.boxShadow.slice(0,40),border:c.border,w:e.offsetWidth,parentCls:e.parentElement.className}});console.log(g,JSON.stringify(s))}
await b.close()})();
