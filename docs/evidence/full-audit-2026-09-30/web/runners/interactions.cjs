const{chromium}=require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');const fs=require('fs'),assert=require('assert');const root='/tmp/hjm-web-audit-0930';
(async()=>{let b=await chromium.launch();let p=await b.newPage({viewport:{width:1100,height:900}});p.setDefaultTimeout(3000);let results=[];
const attr=async(l,a,v)=>{await p.waitForTimeout(100);assert.equal(await l.getAttribute(a),v)};const text=async(l,t)=>{await p.waitForTimeout(100);assert((await l.innerText()).includes(t))};const shot=async n=>{await p.waitForTimeout(350);return p.screenshot({path:root+'/web-screens/'+n+'-action.png',fullPage:true});};
const tests={
Button:async()=>{await p.getByRole('button',{name:'Primary',exact:true}).click();await text(p.getByRole('status'),'Primary 실행');assert(await p.getByRole('button',{name:'Disabled',exact:true}).isDisabled())},
IconButton:async()=>{await p.getByRole('button',{name:'좋아요',exact:true}).click();await text(p.getByRole('status'),'좋아요 실행')},
BottomCTA:async()=>{await p.getByRole('button',{name:'계속하기'}).click();await text(p.getByRole('status'),'행동 실행')},
Form:async()=>{await p.getByRole('button',{name:'저장',exact:true}).click();await text(p.getByRole('status'),'저장했어요')},
Chip:async()=>{await p.getByRole('checkbox',{name:'완료',exact:true}).click();await attr(p.getByRole('checkbox',{name:'완료',exact:true}),'aria-checked','true')},
FilePicker:async()=>{await p.locator('input[type=file]').setInputFiles({name:'tiny.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=','base64')});await text(p.getByRole('status'),'파일을 선택했어요')},
LoadMore:async()=>{await p.getByRole('button',{name:'더 보기'}).click();await text(p.getByRole('status'),'추가 항목을 불러왔어요')},
ListRow:async()=>{await p.locator('[data-hjm-renderer] button').click();await text(p.getByRole('status'),'선수 상세를 열었어요')},
UploadItem:async()=>{await p.getByRole('button',{name:'취소',exact:true}).click();await text(p.getByRole('status'),'업로드를 취소했어요')},
Result:async()=>{await p.getByRole('button',{name:'확인',exact:true}).click();await text(p.locator('[data-hjm-renderer]'),'확인했어요')},
Toast:async()=>{await p.getByRole('button',{name:'닫기',exact:true}).click();await text(p.getByRole('status'),'알림을 닫았어요');assert.equal(await p.locator('.hjm-toast').count(),0)},
Top:async()=>{await p.getByRole('button',{name:'크기 바꾸기'}).click();assert.equal(await p.locator('.hjm-top').getAttribute('data-size'),'medium')},
Link:async()=>{await p.getByRole('link',{name:'컴포넌트 문서로 이동'}).click();assert(p.url().endsWith('#components'))},
BottomNavigation:async()=>{await p.getByRole('link',{name:'프로필'}).click();assert(p.url().endsWith('#profile'))},
AuthProviderButton:async()=>{let q=p.getByRole('button',{name:'Google로 계속하기',exact:true});await q.click();await attr(q,'aria-busy','true')},
Tour:async()=>{await p.getByRole('button',{name:'둘러보기 시작'}).click();await p.getByRole('dialog').waitFor();await p.getByRole('button',{name:'다음',exact:true}).click();await p.getByRole('button',{name:'다음',exact:true}).click();await p.getByRole('button',{name:'다 봤어요'}).click();await text(p.locator('[data-hjm-renderer]'),'끝까지 보셨어요')},
SkipNav:async()=>{await p.keyboard.press('Tab');let q=p.getByRole('link',{name:'본문 바로가기'});await q.press('Enter');assert(await p.locator('#showcase-main').evaluate(e=>e===document.activeElement))},

Field:async()=>{let q=p.getByLabel('이름',{exact:true});await q.fill('확인한 입력');assert.equal(await q.inputValue(),'확인한 입력')},
SearchField:async()=>{await p.getByLabel('검색어 지우기').click();assert.equal(await p.locator('input').inputValue(),'')},
TextArea:async()=>{let q=p.getByLabel('설명',{exact:true});await q.fill('첫 줄\n둘째 줄');assert.equal(await q.inputValue(),'첫 줄\n둘째 줄')},
PasswordField:async()=>{await p.getByRole('button',{name:'비밀번호 보기'}).click();await attr(p.locator('input'),'type','text');assert.equal(await p.locator('input').inputValue(),'hjm-password');await p.getByRole('button',{name:'비밀번호 숨기기'}).click();await attr(p.locator('input'),'type','password')},
OtpField:async()=>{await p.locator('input').fill('123456');assert.equal(await p.locator('input').inputValue(),'123456')},
NumberField:async()=>{await p.getByRole('button',{name:'수량 늘리기'}).click();assert.equal(await p.getByRole('spinbutton').inputValue(),'3');await p.getByRole('button',{name:'수량 줄이기'}).click();assert.equal(await p.getByRole('spinbutton').inputValue(),'2')},
Slider:async()=>{await p.getByRole('slider').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.getByRole('slider').inputValue(),'73')},
Checkbox:async()=>{let q=p.getByRole('checkbox');await q.click();assert.equal(await q.isChecked(),false)},
Radio:async()=>{let q=p.getByRole('radio');await q.focus();await p.keyboard.press('Space');assert(await q.isChecked())},
CheckboxGroup:async()=>{await p.getByRole('checkbox').nth(1).check();assert(await p.getByRole('checkbox').nth(1).isChecked());assert(await p.getByRole('checkbox').nth(2).isDisabled())},
RadioGroup:async()=>{await p.getByRole('radio').nth(1).check();assert(await p.getByRole('radio').nth(1).isChecked());assert(!(await p.getByRole('radio').nth(0).isChecked()))},
Switch:async()=>{await p.getByRole('switch').click();await attr(p.getByRole('switch'),'aria-checked','false')},
SegmentedControl:async()=>{await p.getByRole('radio').nth(1).check();assert(await p.getByRole('radio').nth(1).isChecked())},
Select:async()=>{await p.getByRole('combobox').click();await p.getByRole('option',{name:'English',exact:true}).click();await text(p.getByRole('combobox'),'English')},
Combobox:async()=>{await p.getByRole('combobox').fill('부');await p.getByRole('option',{name:'부산',exact:true}).click();assert.equal(await p.getByRole('combobox').inputValue(),'부산')},
Tabs:async()=>{await p.getByRole('tab',{name:'두 번째'}).click();await text(p.getByRole('tabpanel'),'두 번째 패널 내용')},
Accordion:async()=>{let q=p.getByRole('button',{name:/언제 도착/});await q.click();await attr(q,'aria-expanded','true');assert(await p.getByText('내일 도착할 예정입니다.',{exact:true}).isVisible());await q.click();await attr(q,'aria-expanded','false')},
Collapsible:async()=>{let q=p.getByRole('button',{name:/환불/});await q.click();await attr(q,'aria-expanded','true');assert(await p.getByText('받은 날부터 7일 안에는 그대로 돌려드립니다.').isVisible())},
ToggleGroup:async()=>{let q=p.getByRole('button',{name:'기울임',exact:true});await q.click();await attr(q,'aria-pressed','true')},
TagsInput:async()=>{let q=p.locator('[data-hjm-renderer] input');await q.fill('검증');await q.press('Enter');assert(await p.getByRole('button',{name:'검증 지우기'}).isVisible());await p.getByRole('button',{name:'검증 지우기'}).click();assert.equal(await p.getByRole('button',{name:'검증 지우기'}).count(),0)},
DateRangePicker:async()=>{await p.getByRole('gridcell',{name:'2026-09-03',exact:true}).click();await p.getByRole('gridcell',{name:'2026-09-07',exact:true}).click();await text(p.getByRole('status'),'2026-09-03 ~ 2026-09-07')},
DatePicker:async()=>{await p.getByRole('button',{name:/날짜를 선택하세요/}).click();await p.getByRole('gridcell',{name:'2027-02-10',exact:true}).click();await text(p.locator('[data-hjm-renderer]'),'2027-02-10')},
Calendar:async()=>{await p.getByRole('button',{name:'다음 달',exact:true}).click();await text(p.locator('[data-hjm-renderer]'),'2026년 10월')},
Carousel:async()=>{await p.getByRole('button',{name:'다음',exact:true}).click();assert(await p.getByText('언제든 설정을 바꿀 수 있어요',{exact:true}).isVisible())},
Splitter:async()=>{let q=p.getByRole('separator',{name:'목록 폭 조절'});await q.focus();await q.press('ArrowRight');await text(p.getByRole('status'),'40%');await p.getByRole('button',{name:'보기',exact:true}).nth(1).click();await text(p.locator('.hjm-showcase-splitter-pane'),'국이 좀 짰지만')},
DataTable:async()=>{await p.getByRole('button',{name:'제목 정렬',exact:true}).click();assert.equal(await p.locator('[aria-sort=ascending]').count(),1);await p.getByRole('checkbox',{name:'모든 기록 선택'}).click();await text(p.getByRole('status'),'3개 골랐어요')},
VirtualList:async()=>{let q=p.getByRole('list',{name:'가상화 예제 1000개 항목'});await q.evaluate(e=>e.scrollTop=15000);await p.waitForTimeout(100);assert((await q.innerText()).includes('항목 23'));assert((await q.getByRole('listitem').count())<20)},
Dialog:async()=>{await p.getByRole('button',{name:'Dialog 열기',exact:true}).click();await p.getByRole('dialog').waitFor();await shot('Dialog-open');await p.keyboard.press('Escape');assert.equal(await p.getByRole('dialog').count(),0)},
Sheet:async()=>{await p.getByRole('button',{name:'Sheet 열기'}).click();await p.getByRole('dialog').waitFor();await shot('Sheet-open');await p.getByRole('button',{name:'필터 닫기'}).click();assert.equal(await p.getByRole('dialog').count(),0)},
AlertDialog:async()=>{await p.getByRole('button',{name:'AlertDialog 열기',exact:true}).click();await shot('AlertDialog-open');await p.getByRole('button',{name:'취소',exact:true}).click();assert.equal(await p.getByRole('alertdialog').count(),0)},
Menu:async()=>{await p.getByRole('button',{name:'작업 열기'}).click();await p.getByRole('menu').waitFor();await shot('Menu-open');await p.getByRole('menuitem',{name:'이름 바꾸기'}).click();assert.equal(await p.getByRole('menu').count(),0)},
ContextMenu:async()=>{await p.locator('.hjm-showcase-context-target').click({button:'right'});await shot('ContextMenu-open');await p.getByRole('menuitem',{name:/이름 바꾸기/}).click();await text(p.locator('[data-hjm-renderer]'),'edit 작업을 실행했습니다.')},
Menubar:async()=>{await p.getByRole('menuitem',{name:'파일',exact:true}).click();await p.getByRole('menuitem',{name:/새 기록/}).click();await text(p.locator('[data-hjm-renderer]'),'file/new')},
Tooltip:async()=>{await p.getByRole('button',{name:'도움말에 포커스하거나 가리키기'}).focus();await p.getByRole('tooltip').waitFor();await text(p.getByRole('tooltip'),'자세한 도움말');await shot('Tooltip-open')},
Pagination:async()=>{await p.getByRole('button',{name:'다음 페이지'}).click();await text(p.getByRole('status'),'6–10번째 기록')},
Tree:async()=>{let q=p.getByRole('treeitem',{name:/2단계 2개 중 1번째/});await q.focus();await q.press('ArrowRight');await attr(q,'aria-expanded','true')},
Agreement:async()=>{await p.getByRole('checkbox',{name:'전체 동의하기'}).click();await p.locator('input').fill('qa@example.com');await p.getByRole('button',{name:'가입하고 시작하기'}).click();await text(p.locator('[data-hjm-renderer]'),'가입했어요')},
Popover:async()=>{await p.getByRole('button',{name:'필터',exact:true}).click();await shot('Popover-open');await p.keyboard.press('Escape');await attr(p.getByRole('button',{name:'필터',exact:true}),'aria-expanded','false')},
SidePanel:async()=>{await p.getByRole('button',{name:'고치기'}).first().click();await p.getByRole('dialog').waitFor();await shot('SidePanel-open');await p.keyboard.press('Escape');assert.equal(await p.getByRole('dialog').count(),0)},
CommandPalette:async()=>{await p.getByRole('button',{name:'명령 열기'}).click();await shot('CommandPalette-open');await p.getByRole('option').first().click();await text(p.locator('[data-hjm-renderer]'),'실행했어요')},
TransferList:async()=>{await p.getByRole('option',{name:'느리게 걸었던 오후'}).click();await p.getByRole('button',{name:'담기 →'}).click();await text(p.getByRole('listbox',{name:'모아둔 기록'}),'느리게 걸었던 오후')},
Mentions:async()=>{await p.getByRole('combobox').fill('오늘의 검증 기록');await p.getByRole('button',{name:'기록 저장하기'}).click();await text(p.locator('[data-hjm-renderer]'),'오늘의 검증 기록')},

ColorPicker:async()=>{const r=p.locator('[data-hjm-renderer]');const hex=p.getByLabel('HEX 값');const out=()=>r.innerText();
await hex.fill('#338844');await hex.press('Enter');await text(r,'선택한 색상: #338844cc');
assert.equal(await p.locator('.hjm-color-picker__preview').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(51, 136, 68, 0.8)');
const range=p.getByRole('slider',{name:'불투명도'});await range.fill('50');await text(r,'선택한 색상: #33884480');await text(r,'불투명도 50%');
await hex.fill('#6644aa40');await hex.press('Enter');await text(r,'선택한 색상: #6644aa40');assert.equal(await range.inputValue(),'25');
await hex.fill('zzz');await hex.press('Enter');await p.getByRole('alert').waitFor();await attr(hex,'aria-invalid','true');await text(r,'선택한 색상: #6644aa40');
await hex.press('Escape');assert.equal(await hex.inputValue(),'#6644aa40');assert.equal(await p.getByRole('alert').count(),0);
await p.getByRole('button',{name:/#338844ff/}).click();await text(r,'선택한 색상: #338844ff');await attr(p.getByRole('button',{name:/#338844ff/}),'aria-pressed','true')},
Watermark:async()=>{const t=await p.locator('.hjm-watermark__overlay pattern text').evaluateAll(es=>es.map(e=>e.textContent));assert.deepEqual(t,['HJM','검토용 문서']);
const boxes=await p.locator('.hjm-watermark__overlay').evaluate(svg=>{const rect=svg.querySelector('rect').getBoundingClientRect();return {w:rect.width,h:rect.height}});assert(boxes.w>0&&boxes.h>0);
const btn=p.getByRole('button',{name:'문서 저장'});const b=await btn.boundingBox();const hit=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.closest('button')?.textContent,[b.x+b.width/2,b.y+b.height/2]);assert.equal(hit,'문서 저장');
await btn.click();await text(p.locator('[data-hjm-renderer]'),'저장됨');
const sel=await p.evaluate(()=>{const n=document.querySelector('.hjm-watermark__content p');const r=document.createRange();r.selectNodeContents(n);getSelection().removeAllRanges();getSelection().addRange(r);return getSelection().toString()});assert(sel.includes('워터마크 위에서도'))},
Affix:async()=>{const a=p.locator('[data-hjm-affix]');const sc=a.locator('xpath=..');assert.equal(await a.getAttribute('data-affixed'),'false');await text(p.locator('[data-hjm-renderer]'),'일반 위치');
await sc.evaluate(e=>e.scrollTop=220);await p.waitForTimeout(200);await attr(a,'data-affixed','true');await text(p.locator('[data-hjm-renderer]'),'상단 고정 중');
const g=await sc.evaluate(e=>{const c=e.getBoundingClientRect(),x=e.querySelector('[data-hjm-affix]').getBoundingClientRect();return x.top-c.top});assert(Math.abs(g-8)<=1.5,'offset '+g);
await shot('Affix-stuck');const btn=p.getByRole('button',{name:'변경 저장'});await btn.focus();await btn.press('Enter');await p.getByRole('button',{name:'저장됨'}).waitFor();assert(await p.getByRole('button',{name:'저장됨'}).evaluate(e=>e===document.activeElement));
await sc.evaluate(e=>e.scrollTop=0);await p.waitForTimeout(200);await attr(a,'data-affixed','false');await text(p.locator('[data-hjm-renderer]'),'일반 위치')},
Sidebar:async()=>{let q=p.getByRole('button',{name:'메뉴 접기'});await q.click();assert(await p.getByRole('button',{name:'메뉴 펼치기'}).isVisible())}
};
const data=JSON.parse(fs.readFileSync(root+'/web.json'));for(const [n,test]of Object.entries(tests)){const row=data.results.find(r=>r.component===n);if(!row)continue;try{await p.goto('http://127.0.0.1:6016/iframe.html?id='+row.storyId+'&viewMode=story');await p.locator('[data-hjm-renderer]').waitFor({state:'attached'});await test();await shot(n);results.push({component:n,status:'pass',evidence:'web-screens/'+n+'-action.png',assertions:test.toString()});}catch(e){await shot(n+'-failed');results.push({component:n,status:'fail',error:e.message});}fs.writeFileSync(root+'/web-interactions.json',JSON.stringify(results,null,2));console.log(n,results.at(-1).status,results.at(-1).error||'')};await b.close()})();
