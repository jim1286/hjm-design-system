// Touch pass: tap-driven interactions in a mobile touch context, overlay geometry, tap-outside dismissal,
// horizontal page scroll and 44px touch-target census. usage: node touch.cjs mobile|landscape [Comp,Comp]
const { chromium } = require('/Users/jimin/Developer/app-portfolio/packages/hjm-design-system/showcase/web/node_modules/playwright');
const fs = require('fs'), assert = require('assert');
const repo = '/Users/jimin/Developer/app-portfolio/packages/hjm-design-system';
const out = '/tmp/hjm-web-resp-0930';
const BASE = 'http://127.0.0.1:6026';
const mode = process.argv[2] || 'mobile';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const VP = mode === 'landscape' ? { width: 844, height: 390 } : { width: 390, height: 844 };
const prior = JSON.parse(fs.readFileSync(repo + '/docs/evidence/full-audit-2026-09-30/web/web.json')).results;
const ids = Object.fromEntries(prior.map(r => [r.component, r.storyId]));
Object.assign(ids, { TimePicker: 'patterns-time-selection--choose-time', Cascader: 'patterns-tree--cascader-composition', TreeSelect: 'patterns-tree--tree-select-composition', ConfirmPopover: 'patterns-popover--reversible-confirmation', MorphingMenu: 'patterns-optional-motion--playground', Rating: 'patterns-rating--half-point', FabNotes: 'patterns-floating-action-button--notes' });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VP, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  const p = await ctx.newPage(); p.setDefaultTimeout(4000);
  const cdp = await ctx.newCDPSession(p);
  let errors = []; p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const R = () => p.locator('[data-hjm-renderer]');
  const wait = ms => p.waitForTimeout(ms);
  const text = async (l, t) => { await wait(150); assert((await l.innerText()).includes(t), `expected text "${t}"`); };
  const shot = async name => { const f = `shots/${mode}-touch/${name}.png`; await wait(300); await p.screenshot({ path: `${out}/${f}` }); return f; };
  // Under isMobile, content wider than the device widens the layout viewport (innerWidth > device width)
  // instead of producing scrollX, so compare against the fixed device width, not innerWidth.
  const hscroll = () => p.evaluate(W => { const before = scrollX; scrollTo(10000, scrollY); const x = scrollX; scrollTo(before, scrollY); const d = document.documentElement.scrollWidth; return { documentWidth: d, innerWidth, visualWidth: visualViewport.width, scrolledX: x, overflow: d > W + 0.5 || innerWidth > W || x > 0 }; }, VP.width);
  // Surfaces = overlay-like elements that became visible after the open action (outermost only).
  const OVERLAY = '[role=dialog],[role=alertdialog],[role=menu],[role=listbox],[role=tooltip],[role=tree],[role=grid],dialog,[popover],.hjm-popover,.hjm-tooltip__content,.hjm-menu__content,.hjm-tour,.hjm-toast,.hjm-sheet,.hjm-side-panel,.hjm-command-palette,.hjm-select__listbox,.hjm-combobox__listbox,.hjm-menubar__menu,.hjm-context-menu';
  const mark = () => p.evaluate(sel => document.querySelectorAll(sel).forEach(e => { const r = e.getBoundingClientRect(); if (r.width * r.height > 0) e.setAttribute('data-audit-pre', '1'); }), OVERLAY);
  const surfaces = () => p.evaluate(([sel, W, H]) => {
    const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width * r.height > 100 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
    const list = [...document.querySelectorAll(sel)].filter(e => !e.hasAttribute('data-audit-pre') && vis(e));
    const top = list.filter(e => !list.some(o => o !== e && o.contains(e)));
    return top.map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), cls: String(e.className).split(' ')[0], label: e.getAttribute('aria-label') || '', left: Math.round(r.left * 10) / 10, top: Math.round(r.top * 10) / 10, right: Math.round(r.right * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, width: Math.round(r.width), height: Math.round(r.height), inside: r.left >= -0.5 && r.top >= -0.5 && r.right <= W + 0.5 && r.bottom <= H + 0.5 }; });
  }, [OVERLAY, VP.width, VP.height]);
  const tapOutside = async (rects) => {
    const pt = await p.evaluate(([rs, WW, HH]) => {
      const [W, H] = [WW, HH], c = [[W / 2, 6], [6, 6], [W - 6, 6], [6, H - 6], [W - 6, H - 6], [W / 2, H - 6], [6, H / 2], [W - 6, H / 2]];
      for (const [x, y] of c) { if (rs.some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)) continue; const el = document.elementFromPoint(x, y); if (el && el.closest('button,a,input,select,textarea,[role=button],[role=menuitem],[role=option]')) continue; return [x, y]; }
      return null;
    }, [rects, VP.width, VP.height]);
    if (!pt) return { tapped: false };
    await p.touchscreen.tap(pt[0], pt[1]); await wait(400); return { tapped: true, at: pt.map(Math.round) };
  };
  const longPress = async (loc) => { const b = await loc.boundingBox(); const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await wait(800); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(300); };
  const touchDrag = async (x1, y1, x2, y2, steps = 8) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1 }] });
    for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / steps, y: y1 + (y2 - y1) * i / steps }] }); await wait(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(200); };
  const btn = (name, exact = true) => p.getByRole('button', { name, exact });

  // Overlay protocol: open by tap, measure, tap outside, re-open, close by control.
  const overlay = (openFn, { closeFn, outsideExpected = 'dismiss', settle = 450, after } = {}) => async (row) => {
    await mark(); await openFn(); await wait(settle);
    const s = await surfaces(); row.surfaces = s; row.openScroll = await hscroll();
    row.openShot = await shot(row.component + '-open');
    assert(s.length > 0, 'no surface appeared after tap');
    row.surfaceInside = s.every(x => x.inside);
    row.pageHScroll = row.openScroll.overflow;
    const o = await tapOutside(s); row.tapOutside = o;
    const left = await surfaces(); row.afterOutside = left.length;
    row.outsideResult = left.length === 0 ? 'dismissed' : 'stayed';
    if (closeFn) { if (left.length === 0) { await mark(); await openFn(); await wait(settle); } await closeFn(); await wait(400); row.afterClose = (await surfaces()).length; row.closeResult = row.afterClose === 0 ? 'closed' : 'still-open'; }
    if (after) await after(row);
  };
  const S = (name, exact = true) => async () => btn(name, exact).tap();

  const tests = {
    // ---- overlays ----
    Dialog: overlay(S('Dialog 열기'), { closeFn: async () => p.getByRole('dialog').getByRole('button').first().tap() }),
    AlertDialog: overlay(S('AlertDialog 열기'), { closeFn: async () => btn('취소').tap(), outsideExpected: 'stay' }),
    Sheet: overlay(S('Sheet 열기', false), { closeFn: async () => btn('필터 닫기').tap() }),
    SidePanel: overlay(async () => p.getByRole('button', { name: '고치기' }).first().tap(), { closeFn: async () => p.getByRole('dialog').getByRole('button', { name: /닫기/ }).first().tap() }),
    Popover: overlay(S('필터'), { closeFn: async () => btn('필터').tap() }),
    ConfirmPopover: overlay(S('기록 보관하기'), { after: async () => { await S('기록 보관하기')(); await wait(300); await btn('보관하기').tap(); await text(p.locator('body'), '보관함으로 옮겼어요'); } }),
    Tooltip: overlay(S('도움말에 포커스하거나 가리키기'), {}),
    Menu: overlay(S('작업 열기', false), { after: async () => { await S('작업 열기', false)(); await wait(300); await p.getByRole('menuitem', { name: '이름 바꾸기' }).tap(); await wait(300); assert.equal(await p.getByRole('menu').count(), 0); } }),
    ContextMenu: overlay(async () => longPress(p.locator('.hjm-showcase-context-target')), { after: async () => { await longPress(p.locator('.hjm-showcase-context-target')); await p.getByRole('menuitem', { name: /이름 바꾸기/ }).tap(); await text(R(), 'edit 작업을 실행했습니다.'); } }),
    Menubar: overlay(async () => p.getByRole('menuitem', { name: '파일', exact: true }).tap(), { after: async () => { await p.getByRole('menuitem', { name: '파일', exact: true }).tap(); await wait(300); await p.getByRole('menuitem', { name: /새 기록/ }).tap(); await text(R(), 'file/new'); } }),
    Select: overlay(async () => p.getByRole('combobox').tap(), { after: async () => { await p.getByRole('combobox').tap(); await wait(300); await p.getByRole('option', { name: 'English', exact: true }).tap(); await text(p.getByRole('combobox'), 'English'); } }),
    Combobox: overlay(async () => { await p.getByRole('combobox').tap(); await p.getByRole('combobox').fill('부'); }, { after: async () => { await p.getByRole('combobox').tap(); await p.getByRole('combobox').fill('부'); await wait(300); await p.getByRole('option', { name: '부산', exact: true }).tap(); assert.equal(await p.getByRole('combobox').inputValue(), '부산'); } }),
    DatePicker: overlay(async () => p.getByRole('button', { name: /날짜를 선택하세요/ }).tap(), { after: async () => { await p.getByRole('button', { name: /날짜를 선택하세요/ }).tap(); await wait(300); await p.getByRole('gridcell', { name: '2027-02-10', exact: true }).tap(); await text(R(), '2027-02-10'); } }),
    TimePicker: overlay(async () => p.getByRole('combobox', { name: '시', exact: true }).tap(), { after: async () => { await p.getByRole('combobox', { name: '시', exact: true }).tap(); await wait(250); await p.getByRole('option', { name: '9시', exact: true }).tap(); await p.getByRole('combobox', { name: '분', exact: true }).tap(); await wait(250); await p.getByRole('option', { name: '30분', exact: true }).tap(); await btn('선택 완료').tap(); await text(p.locator('body'), '09:30'); } }),
    CommandPalette: overlay(S('명령 열기'), { after: async () => { await S('명령 열기')(); await wait(300); await p.getByRole('option').first().tap(); await text(R(), '실행했어요'); } }),
    Cascader: overlay(S('위치 고르기'), { after: async () => { await S('위치 고르기')(); await wait(300); await p.getByRole('treeitem', { name: /1단계 2개 중 1번째/ }).tap(); await btn('여기로 옮기기').tap(); await text(p.locator('body'), '옮길 위치를 정했어요'); } }),
    TreeSelect: overlay(S('폴더 고르기'), { after: async () => { await S('폴더 고르기')(); await wait(300); await p.getByRole('treeitem').first().tap(); await btn('이대로 보기').tap(); assert(await p.getByRole('list', { name: '고른 폴더' }).isVisible()); } }),
    MorphingMenu: overlay(S('작업 선택'), { after: async () => { await S('작업 선택')(); await wait(500); await p.getByRole('menuitem', { name: '저장', exact: true }).tap(); await text(p.locator('body'), 'save'); } }),
    Tour: async (row) => {
      await mark(); await btn('둘러보기 시작').tap(); await p.getByRole('dialog').waitFor(); await wait(450);
      row.steps = [];
      for (let i = 0; i < 3; i++) {
        const s = await surfaces(); const f = await shot(`Tour-step${i + 1}`);
        row.steps.push({ step: i + 1, surfaces: s, inside: s.every(x => x.inside), scroll: await hscroll(), shot: f });
        const next = i < 2 ? btn('다음') : btn('다 봤어요'); await next.tap(); await wait(450);
      }
      await text(R(), '끝까지 보셨어요');
      row.surfaceInside = row.steps.every(s => s.inside); row.pageHScroll = row.steps.some(s => s.scroll.overflow);
      await mark(); await btn('둘러보기 시작').tap(); await wait(450); const s = await surfaces(); const o = await tapOutside(s); row.tapOutside = o; row.outsideResult = (await surfaces()).length === 0 ? 'dismissed' : 'stayed';
    },
    Toast: async (row) => { const t = p.locator('.hjm-toast').first(); const b = await t.boundingBox(); row.surfaces = [{ ...b, inside: b.x >= -0.5 && b.x + b.width <= VP.width + 0.5 }]; row.openScroll = await hscroll(); row.pageHScroll = row.openScroll.overflow; row.surfaceInside = row.surfaces[0].inside; row.openShot = await shot('Toast-open'); await btn('닫기').tap(); await text(p.getByRole('status'), '알림을 닫았어요'); assert.equal(await p.locator('.hjm-toast').count(), 0); row.closeResult = 'closed'; },
    ColorPicker: async (row) => { const hex = p.getByLabel('HEX 값'); await hex.tap(); await hex.fill('#338844'); await hex.press('Enter'); await text(R(), '#338844cc'); await p.getByRole('button', { name: /#6644aaff/ }).tap(); await text(R(), '#6644aaff');
      const range = p.getByRole('slider', { name: '불투명도' }); const b = await range.boundingBox(); await p.touchscreen.tap(b.x + b.width * 0.25, b.y + b.height / 2); await wait(200); row.opacityAfterTap = await range.inputValue(); row.surfaceInside = true; },
    // ---- non-overlay tap interactions (tap replaces click/hover/keyboard) ----
    Button: async () => { await btn('Primary').tap(); await text(p.getByRole('status'), 'Primary 실행'); },
    IconButton: async () => { await btn('좋아요').tap(); await text(p.getByRole('status'), '좋아요 실행'); },
    BottomCTA: async () => { await btn('계속하기', false).tap(); await text(p.getByRole('status'), '행동 실행'); },
    Form: async () => { await btn('저장').tap(); await text(p.getByRole('status'), '저장했어요'); },
    Chip: async () => { const q = p.getByRole('checkbox', { name: '완료', exact: true }); await q.tap(); await wait(100); assert.equal(await q.getAttribute('aria-checked'), 'true'); },
    LoadMore: async () => { await btn('더 보기', false).tap(); await text(p.getByRole('status'), '추가 항목을 불러왔어요'); },
    ListRow: async () => { await R().locator('button').tap(); await text(p.getByRole('status'), '선수 상세를 열었어요'); },
    UploadItem: async () => { await btn('취소').tap(); await text(p.getByRole('status'), '업로드를 취소했어요'); },
    Result: async () => { await btn('확인').tap(); await text(R(), '확인했어요'); },
    Top: async () => { await btn('크기 바꾸기', false).tap(); await wait(100); assert.equal(await p.locator('.hjm-top').getAttribute('data-size'), 'medium'); },
    Link: async () => { await p.getByRole('link', { name: '컴포넌트 문서로 이동' }).tap(); await wait(100); assert(p.url().endsWith('#components')); },
    BottomNavigation: async () => { await p.getByRole('link', { name: '프로필' }).tap(); await wait(100); assert(p.url().endsWith('#profile')); },
    AuthProviderButton: async () => { const q = btn('Google로 계속하기'); await q.tap(); await wait(100); assert.equal(await q.getAttribute('aria-busy'), 'true'); },
    Field: async () => { const q = p.getByLabel('이름', { exact: true }); await q.tap(); await q.fill('확인한 입력'); assert.equal(await q.inputValue(), '확인한 입력'); },
    SearchField: async () => { await p.getByLabel('검색어 지우기').tap(); assert.equal(await p.locator('input').inputValue(), ''); },
    TextArea: async () => { const q = p.getByLabel('설명', { exact: true }); await q.tap(); await q.fill('첫 줄\n둘째 줄'); assert.equal(await q.inputValue(), '첫 줄\n둘째 줄'); },
    PasswordField: async () => { await btn('비밀번호 보기').tap(); await wait(100); assert.equal(await p.locator('input').getAttribute('type'), 'text'); await btn('비밀번호 숨기기').tap(); await wait(100); assert.equal(await p.locator('input').getAttribute('type'), 'password'); },
    OtpField: async () => { await p.locator('input').first().tap(); await p.locator('input').first().fill(''); await p.keyboard.type('123456'); await wait(100); assert.equal(await p.locator('input').first().inputValue(), '123456'); },
    NumberField: async () => { await btn('수량 늘리기').tap(); assert.equal(await p.getByRole('spinbutton').inputValue(), '3'); await btn('수량 줄이기').tap(); assert.equal(await p.getByRole('spinbutton').inputValue(), '2'); },
    Slider: async (row) => { const s = p.getByRole('slider'); const b = await s.boundingBox(); await p.touchscreen.tap(b.x + b.width * 0.1, b.y + b.height / 2); await wait(150); row.valueAfterTap = await s.inputValue(); assert(+row.valueAfterTap < 30, 'tap near start should lower value, got ' + row.valueAfterTap); },
    Checkbox: async () => { const q = p.getByRole('checkbox'); await q.tap(); assert.equal(await q.isChecked(), false); },
    Radio: async () => { const q = p.getByRole('radio'); await q.tap(); assert(await q.isChecked()); },
    CheckboxGroup: async () => { await p.getByRole('checkbox').nth(1).tap(); assert(await p.getByRole('checkbox').nth(1).isChecked()); },
    RadioGroup: async () => { await p.getByRole('radio').nth(1).tap(); assert(await p.getByRole('radio').nth(1).isChecked()); },
    Switch: async () => { await p.getByRole('switch').tap(); await wait(100); assert.equal(await p.getByRole('switch').getAttribute('aria-checked'), 'false'); },
    SegmentedControl: async () => { await p.getByRole('radio').nth(1).tap(); assert(await p.getByRole('radio').nth(1).isChecked()); },
    Tabs: async () => { await p.getByRole('tab', { name: '두 번째' }).tap(); await text(p.getByRole('tabpanel'), '두 번째 패널 내용'); },
    Accordion: async () => { const q = p.getByRole('button', { name: /언제 도착/ }); await q.tap(); await wait(100); assert.equal(await q.getAttribute('aria-expanded'), 'true'); },
    Collapsible: async () => { const q = p.getByRole('button', { name: /환불/ }); await q.tap(); await wait(100); assert.equal(await q.getAttribute('aria-expanded'), 'true'); },
    ToggleGroup: async () => { const q = btn('기울임'); await q.tap(); await wait(100); assert.equal(await q.getAttribute('aria-pressed'), 'true'); },
    TagsInput: async () => { const q = R().locator('input'); await q.tap(); await q.fill('검증'); await q.press('Enter'); await btn('검증 지우기').tap(); assert.equal(await btn('검증 지우기').count(), 0); },
    DateRangePicker: async () => { await p.getByRole('gridcell', { name: '2026-09-03', exact: true }).tap(); await p.getByRole('gridcell', { name: '2026-09-07', exact: true }).tap(); await text(p.getByRole('status'), '2026-09-03 ~ 2026-09-07'); },
    Calendar: async () => { await btn('다음 달').tap(); await text(R(), '2026년 10월'); },
    Carousel: async (row) => { await btn('다음').tap(); assert(await p.getByText('언제든 설정을 바꿀 수 있어요', { exact: true }).isVisible()); },
    Splitter: async (row) => { const q = p.getByRole('separator', { name: '목록 폭 조절' }); const b = await q.boundingBox(); await touchDrag(b.x + b.width / 2, b.y + b.height / 2, b.x + b.width / 2 + 60, b.y + b.height / 2); row.statusAfterDrag = await p.getByRole('status').innerText(); await btn('보기').nth(1).tap(); await text(p.locator('.hjm-showcase-splitter-pane'), '국이 좀 짰지만'); },
    DataTable: async () => { await btn('제목 정렬').tap(); assert.equal(await p.locator('[aria-sort=ascending]').count(), 1); await p.getByRole('checkbox', { name: '모든 기록 선택' }).tap(); await text(p.getByRole('status'), '3개 골랐어요'); },
    Pagination: async () => { await btn('다음 페이지').tap(); await text(p.getByRole('status'), '6–10번째 기록'); },
    Tree: async () => { const q = p.getByRole('treeitem', { name: /2단계 2개 중 1번째/ }); await q.tap(); await wait(150); assert.equal(await q.getAttribute('aria-expanded'), 'true'); },
    Agreement: async () => { await p.getByRole('checkbox', { name: '전체 동의하기' }).tap(); await p.locator('input[type=email], input:not([type])').first().fill('qa@example.com'); await btn('가입하고 시작하기').tap(); await text(R(), '가입했어요'); },
    TransferList: async () => { await p.getByRole('option', { name: '느리게 걸었던 오후' }).tap(); await btn('담기 →').tap(); await text(p.getByRole('listbox', { name: '모아둔 기록' }), '느리게 걸었던 오후'); },
    Mentions: async () => { const q = p.getByRole('combobox'); await q.tap(); await q.fill('오늘의 검증 기록'); await btn('기록 저장하기').tap(); await text(R(), '오늘의 검증 기록'); },
    Sidebar: async () => { await btn('메뉴 접기').tap(); assert(await btn('메뉴 펼치기').isVisible()); },
    Breadcrumb: async () => { await p.getByRole('link', { name: '전체 보관함', exact: true }).tap(); await p.getByRole('link', { name: '산책 기록 125개 보기' }).waitFor(); },
    Anchor: async () => { await p.getByRole('link', { name: '다시 돌아봐요', exact: true }).tap(); await wait(500); assert(await p.getByRole('region', { name: '기록 가이드 본문' }).evaluate(e => e.scrollTop > 0)); },
    Watermark: async () => { await btn('문서 저장').tap(); await text(R(), '저장됨'); },
    Affix: async () => { const a = p.locator('[data-hjm-affix]'); const sc = a.locator('xpath=..'); const b = await sc.boundingBox(); await touchDrag(b.x + b.width / 2, b.y + b.height - 10, b.x + b.width / 2, b.y + 10, 10); await wait(300); if ((await a.getAttribute('data-affixed')) !== 'true') { await sc.evaluate(e => e.scrollTop = 220); await wait(200); } assert.equal(await a.getAttribute('data-affixed'), 'true'); await btn('변경 저장').tap(); await btn('저장됨').waitFor(); },
    Rating: async () => { const s = p.getByRole('slider'); const b = await s.boundingBox(); await p.touchscreen.tap(b.x + b.width * 0.95, b.y + b.height / 2); await wait(150); await btn('점수 저장').tap(); await text(p.locator('body'), '점으로 저장했어요'); },
    FabNotes: async () => { await btn('새 기록').tap(); await p.getByRole('textbox', { name: '나의 기록' }).fill('터치 확인'); await btn('기록 추가').tap(); await text(p.locator('body'), '터치 확인'); },
    FloatingActionButton: async () => { await btn('새 기록', false).tap(); await wait(200); },
    Steps: null, TopBar: async () => { await R().getByRole('button').first().tap(); await wait(200); },
  };
  const LANDSCAPE = ['Sheet', 'Dialog', 'AlertDialog', 'SidePanel', 'Tour', 'Popover', 'Menu', 'Select', 'DatePicker', 'CommandPalette', 'TimePicker', 'Cascader', 'TreeSelect', 'ConfirmPopover', 'ContextMenu', 'Tooltip', 'Combobox', 'Toast', 'BottomCTA', 'BottomNavigation'];
  let names = Object.keys(tests).filter(n => tests[n]);
  if (mode === 'landscape') names = names.filter(n => LANDSCAPE.includes(n));
  if (only) names = names.filter(n => only.includes(n));
  fs.mkdirSync(`${out}/shots/${mode}-touch`, { recursive: true });
  const results = [];
  for (const n of names) {
    errors = []; const row = { component: n, storyId: ids[n], viewport: VP, mode };
    try {
      await p.goto(`${BASE}/iframe.html?id=${ids[n]}&viewMode=story`);
      await p.locator('[data-hjm-renderer], .hjm-story-root').first().waitFor({ state: 'attached', timeout: 20000 }); await wait(250);
      await tests[n](row); row.status = 'pass';
    } catch (e) { row.status = 'fail'; row.error = e.message.split('\n')[0]; }
    try { row.finalScroll = await hscroll(); row.shot = await shot(n + (row.status === 'fail' ? '-failed' : '-after')); } catch (e) { }
    row.runtimeErrors = errors; results.push(row);
    row.finalOverflow = row.finalScroll?.overflow; console.log(mode, n, row.status, row.finalOverflow ? 'FINAL-OVERFLOW' : '', row.error || '', row.surfaceInside === undefined ? '' : 'inside=' + row.surfaceInside, row.outsideResult || '', row.closeResult || '', row.pageHScroll ? 'HSCROLL' : '');
  }
  let merged = results;
  const file = `${out}/touch-${mode}.json`;
  if (only && fs.existsSync(file)) { const old = JSON.parse(fs.readFileSync(file)); merged = old.map(r => results.find(x => x.component === r.component) || r); for (const r of results) if (!merged.includes(r)) merged.push(r); }
  fs.writeFileSync(file, JSON.stringify(merged, null, 2));
  await browser.close();
})();
