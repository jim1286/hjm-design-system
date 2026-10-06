import {createRequire} from 'node:module';
const require = createRequire(new URL('../packages/react/package.json', import.meta.url));
const {chromium} = require('playwright');
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
// QA captures are temporary output (root docs/QA_REPORT_STANDARD.md QR-03): write outside the repository and
// summarize the result in docs/qa/. Writing into docs/evidence left thousands of raw files to clean up (2026-10-06).
const out=new URL(`file://${path.resolve(process.env.HJM_SCREEN_CAPTURE_DIR ?? path.join(os.tmpdir(),'hjm-screen-captures'))}/`);
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:414,height:900},deviceScaleFactor:1});
// Read-only captures of local Storybook fixtures; pass a different port for an isolated server.
const origin = process.env.HJM_SCREEN_STORYBOOK_ORIGIN ?? 'http://localhost:6006';
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const theme of ['default','dark','large-text']){
 for(const kind of ['login','settings','notifications','chat','shell','composer']){
  await page.goto(`${origin}/iframe.html?id=common-screen-${kind}--${theme}&viewMode=story`);
  await page.locator('#storybook-root button').first().waitFor();
  await page.screenshot({path:new URL(`${kind}-${theme}.png`,out).pathname,fullPage:true});
 }
}
for (const theme of ['default', 'dark', 'large-text']) {
 for (const [kind, label] of [['loading','로딩'],['empty','빈 화면'],['error','오류'],['restricted','접근 제한']]) {
  await page.goto(`${origin}/iframe.html?id=common-screen-shell--${kind}&viewMode=story&globals=theme:${theme === 'dark' ? 'dark' : 'light'};textScale:${theme === 'large-text' ? '2' : '1'}`);
  await page.locator('.hjm-screen__state').waitFor();
  await page.screenshot({path:new URL(`state-${kind}-${theme}.png`,out).pathname,fullPage:true});
 }
}
await page.goto(`${origin}/iframe.html?id=common-screen-chat--recovery&viewMode=story`);
await page.getByRole('textbox',{name:'메시지 보내기',exact:true}).fill('전송 실패 후에도 남아 있는 초안');
await page.getByRole('button',{name:'다음 전송 실패',exact:true}).click();
await page.getByRole('button',{name:'전송',exact:true}).click();
await page.getByText('보내지 못했어요. 작성한 메시지는 남아 있어요.').waitFor();
await page.screenshot({path:new URL('chat-failed-draft.png',out).pathname,fullPage:true});
await page.setViewportSize({width:1280,height:900});
for (const kind of ['settings','notifications','chat']) {
 await page.goto(`${origin}/iframe.html?id=common-screen-${kind}--default&viewMode=story`);
 await page.locator('.hjm-screen').waitFor();
 await page.screenshot({path:new URL(`${kind}-desktop.png`,out).pathname,fullPage:true});
}
await fs.writeFile(new URL('browser-errors.json',out),JSON.stringify(errors,null,2));
console.log(JSON.stringify({captures:34,errors}));
await browser.close();
