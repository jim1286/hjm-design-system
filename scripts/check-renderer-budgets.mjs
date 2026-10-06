import { access, readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

// Bytes are measured and reported, not enforced (2026-10-06 user decision: "상한 없애").
// The 2026-10-02 alarm (+10% tolerance) still turned comment-only and feature growth into
// CI failures and cap debates. The `raw`/`gzip` numbers below are reviewed baselines: the
// report prints growth against them so a large jump stays visible in review. Module counts,
// optional-peer leaks and root-barrel traversal still fail immediately — those catch import
// edges that crash device Metro while typecheck and tests pass, which byte size never did.
const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));

// Baselines are the reviewed 0.7 renderer graphs with roughly 15-25% byte headroom.
// Module limits are deliberately tighter: adding an import edge must be an
// explicit review instead of being hidden inside gzip variance.
const rendererBudgets = [
  {
    packageName: "@hjmds/react",
    directory: "packages/react",
    surface: "web",
    // 1.5.0: shared modules most entries reach grew on purpose, so the allowance
    // is added to every entry whose graph contains them instead of re-deriving
    // ~40 per-entry limits. theme.js now emits the focus, overlay, button and
    // field variables from the recipes (they were hand-copied into styles.css
    // and drifted): measured +3.1 kB raw / +0.84 kB gzip. provider.js gained the
    // brandPalette prop and its inheritance context: +0.7 kB / +0.24 kB.
    sharedModuleAllowances: [
      // Spinner was extracted from feedback for reuse by ScreenLayout without
      // importing toast/notice implementations. One internal edge, no byte increase.
      { file: "internal/spinner.js", modules: 1, raw: 0, gzip: 0 },
      // Gooey Tabs adds 2513 raw / 674 gzip bytes to navigation.js, no local import edge.
      { file: "navigation.js", raw: 2600, gzip: 700 },
      // Sidebar presentation adds 1476 raw / 496 gzip bytes to its emitted module.
      // Root already reaches the provider; apply this only to graphs importing Sidebar.
      { file: "sidebar.js", raw: 1500, gzip: 500 },
      { file: "theme.js", raw: 3_300, gzip: 900 },
      // Optional Icon glyph callback grows supplemental-display by measured
      // 142 raw / 31 gzip bytes; retain exact graph edges and base-peer bans.
      { file: "supplemental-display.js", raw: 160, gzip: 40 },
      { file: "provider.js", raw: 800, gzip: 280 },
    ],
    // 2026-10-01 overlap refactor: menu-typeahead.js and table-sort-button.js
    // replace repeated host behavior. Reviewed local edges only: root +2, affected
    // families +1. The split source graph measured root 94.5 kB gzip,
    // display 77.5 kB raw and overlays 19.4 kB gzip; add only 500/600/350 bytes
    // to those three pre-allowance limits; Node 24 additionally needs 100 gzip bytes
    // on display (18.4 kB measured). Other byte/optional-peer gates stay fixed.
    budgets: {
      // Glass header composition: 4 modules, 18730 raw / 5174 gzip; provider allowances apply.
      "./navigation-bar": { modules: 4, raw: 17500, gzip: 5000 },
      // GravityLetters provider graph: 19763 raw / 5556 gzip; bounded DOM motion, no peer.
      "./gravity-letters": { modules: 4, raw: 22800, gzip: 6400 },
      // GridReveal shares the provider: measured 19586 raw / 5504 gzip, no motion peer.
      "./grid-reveal": { modules: 4, raw: 22600, gzip: 6400 },
      // VoiceNote reuses canonical Asset/Slider/Button; measured 45229/11108 raw/gzip.
      "./voice-note": { modules: 8, raw: 52100, gzip: 12800 },
      // StepPlayer reuses canonical Steps/Progress/Button; measured 27759/6658 raw/gzip.
      "./step-player": { modules: 6, raw: 32000, gzip: 7700 },
      // Optional Blobatar motion graph measured 19720/5520 raw/gzip bytes; static entry stays separate.
      "./avatar-blobatar-motion": { modules: 4, raw: 22700, gzip: 6400 },
      // FolderPreview composition measured 21246/5970 raw/gzip bytes; no new motion peer.
      "./folder-preview": { modules: 5, raw: 24500, gzip: 6900 },
      // TaskList reuses canonical list/checkbox: measured 57442/12261 raw/gzip bytes.
      "./task-list": { modules: 7, raw: 66100, gzip: 14200 },
      // Activity grid/list composes existing primitives; measured local graphs with ~15% headroom.
      "./activity-heatmap": { modules: 1, raw: 1700, gzip: 830 },
      // CodeBlock presentation measured independently; no highlighting or clipboard engine import.
      "./code-block": { modules: 1, raw: 1700, gzip: 820 },
      // ScrollProgress reuses feedback: measured 4 local modules; ~15% byte headroom.
      "./scroll-progress": { modules: 4, raw: 17400, gzip: 4400 },
      // 2026-10-01 compound controls: measured local graphs, ~15% byte headroom;
      // exact module limits preserve reuse of NumberField/Button/IconButton/CounterBadge.
      "./duration-field": { modules: 3, raw: 12200, gzip: 3700 },
      "./inline-confirm": { modules: 3, raw: 11000, gzip: 3050 },
      // 2026-10-06 measured 9.6/2.7 kB, above this baseline: the `more` catalog, layoutStyle and returning
      // focus to the toggle when a catalog button unmounts on collapse.
      "./reaction-picker": { modules: 3, raw: 9000, gzip: 2500 },
      "./notification-bell": { modules: 6, raw: 39200, gzip: 10700 },

      // Static avatar bridge: measured <0.8 kB source, one local module;
      // external generation stays an explicit optional peer.
      "./avatar-blobatar": { modules: 1, raw: 900, gzip: 550 },
      // New isolated graphs measured at 21,520/6,013 B (effect) and 575/377 B (glyph factory).
      "./effect-surface": { modules: 4, raw: 24800, gzip: 6950 },
      // Isolated decoration uses the same provider graph; no media/blur engine import.
      "./progressive-blur": { modules: 4, raw: 24000, gzip: 6500 },
      "./icon-lucide": { modules: 1, raw: 750, gzip: 500 },
      // 2026-09-30: optional interaction graphs measured independently; ~20% byte headroom, exact module counts.
      "./sortable": { modules: 5, raw: 29800, gzip: 8000 },
      "./swipe-actions": { modules: 3, raw: 9700, gzip: 2700 },
      "./content-transition": { modules: 4, raw: 22500, gzip: 6400 },
      "./rating": { modules: 3, raw: 10900, gzip: 3100 },
      "./image-comparison": { modules: 6, raw: 42200, gzip: 11500 },
      "./carousel-motion": { modules: 5, raw: 28700, gzip: 7600 },
      "./celebration": { modules: 4, raw: 23700, gzip: 6700 },

      // Opt-in data layouts reuse provider primitives; external QR peers remain separately installed.
      // Measured Web: 1.2/0.5, 3.8/1.4, 1.3/0.7 kB raw/gzip; one module each.
      // Three isolated Web entries import only React and granular contracts; do not inflate the root graph.
      "./color-picker": { modules: 1, raw: 6_000, gzip: 2_200 },
      "./watermark": { modules: 1, raw: 2_500, gzip: 1_100 },
      "./affix": { modules: 1, raw: 4_000, gzip: 1_600 },
      "./masonry": { modules: 1, raw: 1_500, gzip: 700 },
      "./virtual-list": { modules: 1, raw: 4_800, gzip: 1_800 },
      "./qr-code": { modules: 1, raw: 1_700, gzip: 900 },
      // Optional adoption graphs reuse HJM semantics; measurements exclude external peers.
      // 2026-09-29: Statistic 35.6/9.1 kB (5 modules), Menu 93.5/19.8 kB (8).
      "./statistic-motion": { modules: 6, raw: 40_000, gzip: 10_200 },
      "./menu-morph": { modules: 9, raw: 104_000, gzip: 22_000 },
      // Standalone ThinkingOrb reuses the provider; geometry lives in the separately budgeted contracts entry.
      "./thinking-orb": { modules: 4, raw: 20_000, gzip: 5_700 },
      // 28: the canonical composition-style contract module. `hjmCompositionStyleKeys`
      // is a runtime value, so exporting it from the root adds one graph edge.
      // Byte budgets are unchanged and still pass with ~28% headroom.
      // Screen chrome adds two implementation modules; measured root 277.2/55.4 kB.
      // Keep byte limits unchanged. See docs/screen-chrome.md for the shared-recipe choice.
      // Breadcrumb/Pagination split adds one module; Anchor adds one. Root bytes stay within budget.
      // Popover adds one renderer; its portal/focus changes reuse existing modules.
      // 36 -> 48 over this train: SidePanel + the extracted `modal.js`,
      // Splitter, Tour, Tree, TransferList, Mentions, CommandPalette,
      // DataTable, Agreement, Top, AuthProviderButton. Bytes are those
      // renderers' own code — measured 380.6 kB raw / 79.4 kB gzip.
      // +1 for Heading.
      // P2-b(Collapsible·ContextMenu·Menubar)로 58 -> 61 모듈.
      // 측정 425.5 kB raw / 88.7 kB gzip — 기존 한도 안이라 바이트는 그대로 둔다.
      // 2026-09-19 AuthScreenLayout로 62 -> 63 모듈. 계약 resolver와 `classNames`만
      // 더해지므로 바이트 증가는 미미하고 기존 한도 안이다.
      // 2026-10-01 auth card pending state: Node 24 root measured 94.8 kB gzip including shared allowances.
      // Add 300 bytes only here for the new inert/centred loader branch; auth-screen, CSS and dependency gates already fit.
      ".": { modules: 65, raw: 445_000, gzip: 93_800 },
      // FAB reuses actions/provider; measured 21.0 kB raw / 5.5 kB gzip.
      "./floating-action-button": { modules: 5, raw: 23_000, gzip: 6_100 },
      // Carousel adds one module, reuses actions/provider; measured 22.5/5.8 kB.
      "./carousel": { modules: 5, raw: 25_000, gzip: 6_400 },
      // Each includes actions + provider: measured 5 modules, 19.1/19.2 kB raw,
      // 4.89/4.90 kB gzip. Reuse preserves button/loading/theme contracts.
      "./top-bar": { modules: 5, raw: 21_000, gzip: 5_400 },
      // Spinner-only loading retains the label's layout; measured 25.2 kB raw with shared allowances, same 5 modules.
      "./bottom-cta": { modules: 5, raw: 21_300, gzip: 5_400 },
      // 0.10.0: skeleton의 원 지름·펄스 길이·곡선·opacity를 recipe에서 읽어 CSS 변수로
      // 내보내면서 커졌다. modules가 3으로 그대로라 새 import 경로는 없다. 다음에 이
      // 한도를 올릴 때는 modules가 함께 늘었는지 먼저 확인한다.
      // 1.0.3: raw 12_500 -> 12_700, gzip 3_400 -> 3_500. provider가 textScale의
      // large-text 전환을 `data-large-text`로 한 번만 계산해 내보내면서(#20) 커졌다.
      // 이 자리가 맞는 이유가 예산에도 보인다 — 같은 판정을 renderer가 직접 하면
      // ./selection 같은 granular entry가 provider 모듈을 통째로 끌어와 gzip 24%가 는다.
      // modules는 3으로 그대로라 새 import 경로는 없다.
      // density 해석 helper가 더해져 13.2/3.7 kB. modules는 3 그대로다.
      "./provider": { modules: 3, raw: 14_000, gzip: 4_000 },
      "./layout": { modules: 2, raw: 17_000, gzip: 4_500 },
      // Splitter reuses NumberField's range judgment from contracts and adds no
      // renderer dependency: measured 8.9 kB raw / 2.9 kB gzip over 2 modules.
      // 2026-10-06 measured 10.4/3.3 kB, above this baseline: layoutStyle plus measuring pane overflow so a
      // pane is a Tab stop only while it scrolls (review: unconditional stops were dead).
      "./splitter": { modules: 2, raw: 10_000, gzip: 3_200 },
      "./actions": { modules: 2, raw: 7_000, gzip: 1_900 },
      // The forms barrel reexports DatePicker, which now imports the shared Calendar.
      "./forms": { modules: 13, raw: 116_000, gzip: 24_000 },
      "./password-field": { modules: 9, raw: 100_000, gzip: 20_000 },
      "./otp-field": { modules: 9, raw: 100_000, gzip: 20_000 },
      "./number-field": { modules: 2, raw: 11_500, gzip: 3_300 },
      "./slider": { modules: 2, raw: 11_500, gzip: 3_100 },
      // Calendar extraction adds one edge to DatePicker; both share the same grid.
      // Measured DatePicker 24.8 kB raw / 6.5 kB gzip including focus and read-only guards.
      "./calendar": { modules: 4, raw: 24_000, gzip: 6_000 },
      // 2026-09-30: viewport clamp + flip-up for phones/landscape (responsive audit). gzip raised from 7_200.
      // 1.10.0: theme.ts now emits the Toast badge/action variables every themed graph carries; measured 32.6 kB raw.
      "./date-picker": { modules: 5, raw: 29_000, gzip: 7_600 },
      "./file-picker": { modules: 2, raw: 13_000, gzip: 3_600 },
      "./steps": { modules: 2, raw: 8_000, gzip: 2_500 },
      "./upload-item": { modules: 4, raw: 17_000, gzip: 4_000 },
      "./selection": { modules: 2, raw: 24_000, gzip: 4_100 },
      // Existing family barrel retains compatibility and now traverses two split entries.
      // Measured split entries 3.7/1.3 and 4.8/1.5 kB; Anchor 19.2/5.3 kB with provider.
      "./breadcrumb": { modules: 2, raw: 4_300, gzip: 1_500 },
      "./pagination": { modules: 2, raw: 5_600, gzip: 1_800 },
      "./anchor": { modules: 4, raw: 22_000, gzip: 6_000 },
      "./navigation": { modules: 11, raw: 48_000, gzip: 11_000 },
      // Tree reuses the contract's collection navigation and typeahead; the
      // renderer adds only rows: measured 20.9 kB raw / 5.6 kB gzip over 4 modules.
      "./tree": { modules: 4, raw: 23_000, gzip: 6_300 },
      // Both reuse existing contract judgment and existing renderers (Button,
      // TextArea, the anchored popup): measured 14.5/3.6 kB and 37.3/8.4 kB.
      "./transfer-list": { modules: 3, raw: 16_000, gzip: 4_000 },
      "./mentions": { modules: 4, raw: 41_000, gzip: 9_300 },
      // CommandPalette shares the modal machinery with the other overlays and
      // DataTable adds only table chrome over contract judgment: measured
      // 46.1/11.0 kB over 6 modules and 7.8/2.3 kB over 2.
      "./command-palette": { modules: 6, raw: 50_000, gzip: 12_000 },
      // 전역 density 축을 읽으려면 provider 모듈이 그래프에 들어온다: 2 -> 4 모듈,
      // 측정 18.9 kB raw / 5.2 kB gzip. provider 예산의 경고("granular entry가 provider를
      // 통째로 끌어온다")를 알고 올린다 — 제품은 어차피 HjmProvider를 항상 싣고,
      // 대신 얻는 것은 목록·메뉴·표가 같은 밀도를 쓰는 것이다. 그게 이 축의 목적이다.
      "./data-table": { modules: 5, raw: 21_000, gzip: 5_800 },
      // Collapsible and Menubar add only their own chrome: measured 4.0/1.4 kB
      // and 10.0/2.6 kB over 2 modules each. ContextMenu is bigger because it
      // reaches the shared modal/portal module for its layer — the same stack
      // the other overlays use, not a new dependency: measured 45.5/10.5 kB.
      "./collapsible": { modules: 2, raw: 5_000, gzip: 1_700 },
      "./context-menu": { modules: 7, raw: 50_000, gzip: 11_500 },
      // 2026-09-30: the panel now uses the shared portal (like Menu/ContextMenu) so clipping ancestors can't
      // hide items; portal.js is the added module. Raised from 2 / 11.5 kB / 3.0 kB.
      "./menubar": { modules: 3, raw: 27_000, gzip: 6_500 },
      // 액자 규칙만 있는 얇은 렌더러이고 재생기 의존이 없다(계약이 슬롯으로 받는다).
      "./asset": { modules: 4, raw: 17_000, gzip: 4_700 },
      // Both reuse existing judgment and existing chrome: measured 6.0/1.9 kB
      // over 2 modules and 3.9/1.3 kB over 2.
      "./agreement": { modules: 2, raw: 7_000, gzip: 2_200 },
      "./top": { modules: 2, raw: 4_500, gzip: 1_500 },
      // Provider fills come from the contract table, not the theme: measured
      // 15.0 kB raw / 4.1 kB gzip over 4 modules (provider + internal).
      "./provider-button": { modules: 4, raw: 17_000, gzip: 4_700 },
      // AuthScreenLayout은 계약 resolver와 `classNames`만 쓰고 다른 컴포넌트를
      // 부르지 않는다 — 슬롯으로 받기 때문이다. 그래서 그래프가 가장 얕다.
      "./auth-screen": { modules: 3, raw: 12_000, gzip: 3_600 },
      // DM reactions intentionally compose internal/message-reactions, ReactionPicker, Popover and
      // portal. Reimplementing focus/collision would duplicate Popover; no root barrel or optional
      // peer enters this opt-in screen graph. Unreleased entries: limits are the 2026-10-06 measured
      // base (graph minus shared allowances) rounded up to 100 raw / 50 gzip, not provisional headroom.
      // ./screens 14 modules 105,772/24,359 (base 13, 101,672/23,179).
      "./screens": { modules: 13, raw: 101_700, gzip: 23_200 },
      // Separate opt-in workflow graph includes confirmation dialogs and upload controls.
      // 21 modules 204,540/42,909 (base 20, 200,440/41,729).
      "./screen-flows": { modules: 20, raw: 200_500, gzip: 41_750 },
      // SavedItemsScreen adds one renderer: 22 modules 207,552/43,673 (base 21, 203,452/42,493).
      "./saved-items": { modules: 21, raw: 203_500, gzip: 42_500 },
      // Exposes the existing scale; no new dependency: 3.5 kB raw / 1.2 kB gzip.
      "./heading": { modules: 2, raw: 4_200, gzip: 1_400 },
      // Elements over existing tokens, and the clipboard button over Button:
      // measured 3.2/1.2 kB over 2 modules and 8.8/2.4 kB over 3.
      "./text-formats": { modules: 2, raw: 3_900, gzip: 1_500 },
      "./clipboard": { modules: 3, raw: 10_000, gzip: 2_900 },
      // Both reuse existing judgment and chrome: 4.3/1.4 kB and 6.6/2.1 kB.
      "./toggle-group": { modules: 2, raw: 5_000, gzip: 1_700 },
      // 후보 목록(suggestions)·draft 통지가 더해져 7.6 -> 9.1 kB raw / 2.7 kB gzip.
      // 모듈 수는 2 그대로다 — 새 import 경로가 아니라 같은 파일이 커진 것이다.
      "./tags-input": { modules: 2, raw: 10_000, gzip: 3_000 },
      // Three small Web-shell entries over existing chrome: measured 3.9/1.4,
      // 3.6/1.3 and 5.8/1.7 kB over 2 modules each.
      "./skip-nav": { modules: 2, raw: 4_600, gzip: 1_700 },
      "./bottom-info": { modules: 2, raw: 4_300, gzip: 1_600 },
      // Provider theme access is needed for explicit reduced-motion overrides.
      // Four-module graph measured 22787 raw / 6167 gzip; no optional motion peer.
      "./sidebar": { modules: 4, raw: 19_000, gzip: 5_200 },
      // The imperative layer reaches the whole overlay barrel on purpose — it
      // mounts Dialog and Sheet: measured 85.0 kB raw / 17.6 kB gzip.
      "./overlay-stack": { modules: 9, raw: 93_000, gzip: 19_400 },
      // Range selection reuses the Calendar grid: 21.9 kB raw / 5.9 kB gzip.
      "./date-range": { modules: 5, raw: 24_000, gzip: 6_500 },
      // ListRow가 전역 density를 읽으면서 16.6 -> 16.8 kB gzip. provider는 이미
      // 이 그래프 안에 있었으므로 modules는 11 그대로다.
      "./display": { modules: 12, raw: 73_600, gzip: 17_300 },
      // 최초 43_000은 마지막 focus/dismiss 보강 전 추정값이라 실측 44.0 kB에서 걸렸다.
      // portal·overlay 공유 모듈 6개는 그대로이고 gzip은 9.3% 여유다. 다른 entry와 같은
      // 수준(약 8%)의 raw 여유를 준다.
      "./popover": { modules: 6, raw: 48_000, gzip: 11_500 },
      // SidePanel shares the extracted modal machinery with Dialog/Sheet rather
      // than the whole overlays barrel: measured 45.9 kB raw / 11.0 kB gzip over
      // the same 6 modules Popover reaches.
      "./side-panel": { modules: 6, raw: 50_000, gzip: 12_000 },
      // 6 -> 7 modules: `modal.js` is now its own file so SidePanel can share the
      // single modal stack. The graph gained a file, not a dependency — measured
      // 81.2 kB raw / 16.7 kB gzip against 80.8/16.6 before the split.
      // Tour reuses the anchored popup helper and the shared modal machinery:
      // measured 51.0 kB raw / 12.0 kB gzip over 7 modules, no new dependency.
      "./tour": { modules: 7, raw: 56_000, gzip: 13_200 },
      "./overlays": { modules: 8, raw: 90_000, gzip: 18_350 },
      "./feedback": { modules: 3, raw: 13_500, gzip: 3_300 },
      // density helper가 provider 모듈에 들어가면서 6.8 kB gzip 경계에 닿았다.
      // 1.10.0 Toast refresh: five inline stroke SVG tone glyphs + close glyph replace text glyphs, and theme
      // emits badge/action variables; module count unchanged. Measured 33.4 kB raw / 8.5 kB gzip.
      "./toast": { modules: 4, raw: 30_000, gzip: 7_600 },
      // Two new claims add metadata only: measured 6,045 B raw / 1,594 B gzip.
      // Three Web navigation claims add metadata (6.5 kB raw); no import edges.
      // Six more claims, metadata only: measured 6.9 kB raw / 1.7 kB gzip.
      // 1.5.0: claims now derive per-scenario proofs from the gap and long-copy
      // tables of the real scenario matrix: measured 9.8 kB raw / 2.65 kB gzip.
      // 2026-09-29: stable interactive claims add keyboard proof links (no new module).
      // Mentions keyboard proof and its long-copy matrix reference add 51 raw / 10 gzip bytes; keep the one-module graph exact.
      // The promotion batch adds explicit keyboard/Native-action and long-copy proof references;
      // measured 13,074 raw / 3,161 gzip bytes, still one module and no renderer imports.
      // Three data-layout scenario claims grow metadata only; no new import edges.
      "./evidence": { modules: 1, raw: 14_000, gzip: 3_400 },
    },
    cssBudgets: {
      // 1.0.0+: gzip 13_500 -> 14_000. Switch의 꺼짐 hairline을 추가할 때 규칙 자체는
      // gzip 기준 사실상 0(주석을 뺀 본문은 11.8 kB로 그대로)인데, main의 여유가 4바이트라
      // 근거 주석 몇 줄에 예산이 터졌다. 이 파일은 주석까지 소비자에게 배포되므로 주석이
      // 곧 바이트다 — 한도를 규칙이 아니라 문서화가 잡아먹는 상태를 풀되, 여유는 다시
      // 명시적 검토가 필요할 만큼만 둔다. 다음에 올릴 때는 주석을 뺀 본문이 커졌는지
      // (scripts로 주석 제거 후 gzip) 먼저 확인한다.
      // 1.0.3+: gzip 14_000 -> 14_400. Field 포커스 링(#19)은 `1px`을 `2px`로 바꾼 것이
      // 전부라 규칙은 커지지 않았다 — 주석을 뺀 본문은 gzip 11,821 -> 11,823B다. 남은
      // 여유가 6바이트뿐이라 근거 주석 네 줄이 다시 한도를 밀었을 뿐이므로, 위 절차대로
      // 본문을 먼저 확인하고 주석 몫만 올린다.
      // 1.0.3: raw 92_000 -> 93_000. #19(포커스 링)과 #20(large-text 플래그)이 각각은
      // 한도 안이었는데 main에서 합쳐지며 92.1 kB가 됐다. 규칙은 거의 그대로다 —
      // 주석을 뺀 본문은 raw 87.4 -> 87.6 kB, gzip 11,821 -> 11,841B다. gzip 한도는
      // 14_400 그대로 두고(측정 14.1 kB) raw만 올린다.
      // TopBar/BottomCTA responsive rules and Toast layout: measured 95.8/14.9 kB.
      // Actual feature CSS grew; this is not a comment-only budget adjustment.
      // Carousel and FAB add functional positioning/scaling rules: 98.8/15.5 kB.
      // Anchor and trail wrapping add functional CSS: measured 102.2 kB raw, gzip below 16.1 kB.
      // Contextual form/exit styles add 1.5 kB raw; measured total 103.7/16.3 kB.
      // SidePanel's docked edge/size/footer rules add 2.1 kB raw: measured
      // 105.8 kB raw / 16.6 kB gzip. Functional CSS, not a comment-only bump.
      // Splitter's axis/hit-target/handle rules add 1.9 kB raw: measured
      // 107.7 kB raw / 17.0 kB gzip. Also functional, not comments.
      // Tour's veil/highlight/card rules add 1.5 kB raw: measured 109.2 kB raw
      // / 17.3 kB gzip. Tree's row/indent/check rules add 2.1 kB: 111.3/17.6 kB.
      // TransferList panels and the Mentions popup add 3.8 kB: 115.1/18.1 kB.
      // The palette shell and table chrome add 4.4 kB: 119.5 kB raw / 18.7 kB gzip.
      // Top's heading block and Agreement's consent rows add 3.9 kB: 123.4/19.2 kB.
      // Provider fills, the progress ring, Heading and the ListRow loader add
      // 5.3 kB: measured 128.7 kB raw / 20.3 kB gzip. All functional rules.
      // ToggleGroup, TagsInput, SkipNav, BottomInfo and Sidebar add 7.6 kB:
      // measured 136.3 kB raw / 21.5 kB gzip.
      // Collapsible·ContextMenu·Menubar의 규칙이 9.1 kB 더한다: 측정 145.4 kB raw /
      // 22.8 kB gzip. ListRow의 relaxed·spacious 밀도와 TagsInput 후보 목록도 여기 있다.
      // AuthScreenLayout의 두 영역 규칙(약 40줄)만큼 gzip 0.4 kB 늘었다.
      // 1.4 Switch row/description/reflow and Sheet alignment measure 149.8/24.2 kB.
      // Keep selection's module budget unchanged; only these shared CSS rules grow.
      // 2026-09-29 optional Menu Morph adds HJM-owned focus, target, and hover rules; measured CSS is 24.9 kB gzip.
      // 2026-09-29 long-copy wrapping in modal and transfer-list copy adds functional rules; measured 153,703/25,304 B.
      // ColorPicker input/palette and decorative/sticky layout rules add 3.1 kB; measured total 155.9/25.3 kB.
      // Bounded sidebar decoration adds CSS only; no animation runtime dependency.
      // Capsule/header styles add measured 3339 raw / 600 gzip; preserve prior headroom.
      // Centered busy overlays add 602 raw bytes (163,441 measured); no new assets or animation runtime.
      "./styles.css": { raw: 163_700, gzip: 27_000 },
      // Same rules wrapped in `@layer hjm { }` by packages/react/scripts/copy-styles.mjs;
      // the wrapper adds ~15 bytes, so this budget tracks styles.css plus that margin.
      "./styles.layered.css": { raw: 163_800, gzip: 27_032 },
    },
  },
  {
    packageName: "@hjmds/react-native",
    directory: "packages/react-native",
    surface: "native",
    // 1.5.0: provider.js gained the brandPalette prop and its inheritance
    // context, measured +0.6 kB raw / +0.19 kB gzip; see the Web note above.
    sharedModuleAllowances: [
      // FixedGlyph extracts the existing overlay glyph rule for search/tags/messages.
      // Charge exactly one internal edge only to graphs that include it; no new peer.
      { file: "internal/fixed-glyph.js", modules: 1, raw: 0, gzip: 0 },
      // Spinner was extracted from feedback for reuse by ScreenLayout without
      // importing toast/notice implementations. One internal edge, no byte increase.
      { file: "internal/spinner.js", modules: 1, raw: 0, gzip: 0 },
      // 2.0: private RecipeButton keeps FAB/LoadMore paint overrides out of the public
      // Button API. One explicit local edge replaces exposing private props to products.
      // Reviewed emitted graphs: sheet-gesture 41.8/10.2 kB and navigation 154.3/31.8 kB;
      // bounded wrapper/import cost only, no peer or Metro budget change. See major-api-removal evidence.
      { file: "internal/recipe-button.js", modules: 1, raw: 512, gzip: 256 },
      // Measured Core Animated indicator adds 3325 raw / 717 gzip bytes to navigation.js.
      // Selected-tab viewport correction adds exactly 1005 raw / 331 gzip bytes.
      // Same-file measurement: docs/evidence/component-flows-2026-10-01/tab-viewport-cost.json.
      // Capsule layout adds 1446 raw / 305 gzip, measured with the same TypeScript options.
      // See docs/evidence/navigation-references-2026-10-01/native-budget-delta.json.
      { file: "navigation.js", raw: 5851, gzip: 1386 },
      // OTP underline adds 360 raw / 81 gzip bytes to inputs.js (same emitted file with only the new branches removed).
      // Apply only to graphs importing that module; no extra module or optional dependency allowance.
      // Fixed-size Checkbox/Chip artwork adds 267 raw / 163 gzip bytes, including rationale comments.
      // Same-file inverse measurement: docs/evidence/component-flows-2026-10-01/selection-mark-cost.json.
      { file: "inputs.js", raw: 667, gzip: 263 },
      { file: "provider.js", raw: 700, gzip: 220 },
      // Liquid's dependency-free host seam adds measured timing/occlusion/announcement logic
      // to feedback (also reached by navigation). The optional Skia renderer is budgeted separately.
      // Strict Effects-safe store lifetime adds measured 567 raw / 178 gzip bytes;
      // preserve teardown while avoiding disposal during development replay.
      { file: "feedback.js", raw: 8_100, gzip: 2_000 },
      // Grid device-pixel floor (Utilverse 411dp wrap fix) adds exactly 189 raw / 89 gzip
      // to primitives.js, measured against the committed 1.12.0 dist.
      { file: "primitives.js", raw: 189, gzip: 89 },
      // 2026-10-06 1.13: one shared dev-only warner for deprecated visual style props, measured
      // 1657 raw / 818 gzip. A per-component inline warning was rejected: it repeats the
      // dedupe/__DEV__ logic in ~40 files. Per-file call-site growth is reported against the baselines.
      { file: "internal/deprecated-style.js", modules: 1, raw: 1_657, gzip: 818 },
    ],
    // 2026-10-01: internal/field-frame.js replaces repeated Field/TextField
    // label/support presentation. Only its consuming graphs gain one local edge;
    // provider, native-linking and optional-peer boundaries remain unchanged.
    budgets: {
      // Native opaque header fallback: 2 modules, 7123 raw / 2264 gzip; no blur peer.
      "./navigation-bar": { modules: 2, raw: 7500, gzip: 2500 },
      // GravityLetters uses canonical Text: 23498 raw / 6194 gzip, Core Animated only.
      "./gravity-letters": { modules: 4, raw: 27100, gzip: 7200 },
      // Native mask shares provider only: measured 7806 raw / 2458 gzip.
      "./grid-reveal": { modules: 2, raw: 9000, gzip: 2900 },
      // VoiceNote reuses canonical Asset/Slider/Button; measured 52452/12085 raw/gzip.
      "./voice-note": { modules: 8, raw: 60400, gzip: 13900 },
      // StepPlayer reuses canonical Steps/Progress/Button; measured 81110/17302 raw/gzip.
      "./step-player": { modules: 7, raw: 93400, gzip: 20000 },
      // Optional Blobatar motion graph measured 7252/2270 raw/gzip bytes; static entry stays separate.
      "./avatar-blobatar-motion": { modules: 2, raw: 8400, gzip: 2700 },
      // FolderPreview composition measured 26528/6892 raw/gzip bytes; no new motion peer.
      "./folder-preview": { modules: 6, raw: 30600, gzip: 8000 },
      // TaskList reuses canonical list/checkbox: measured 133367/26205 raw/gzip bytes.
      "./task-list": { modules: 9, raw: 153400, gzip: 30200 },
      // Native Statistic + existing ContentTransition measured 8 modules, 79.8/16.8 kB raw/gzip.
      "./statistic-motion": { modules: 8, raw: 92000, gzip: 19300 },
      // Activity grid/list composes existing primitives; measured local graphs with ~15% headroom.
      "./activity-heatmap": { modules: 4, raw: 26200, gzip: 6900 },
      // CodeBlock presentation measured independently; no highlighting or clipboard engine import.
      // Shared Native text-scale helper fixes controlled large-text rendering without
      // duplicating scaling policy: +1 module/+2131 raw/+627 gzip, measured in
      // docs/evidence/component-flows-2026-10-01/code-scale-cost.json.
      "./code-block": { modules: 3, raw: 10631, gzip: 3427 },
      // ScrollProgress reuses feedback: measured 6 local modules; ~15% byte headroom.
      "./scroll-progress": { modules: 6, raw: 89500, gzip: 19000 },
      // 2026-10-01 compound controls: measured local graphs, ~15% byte headroom;
      // exact module limits preserve reuse of NumberField/Button/IconButton/CounterBadge.
      "./duration-field": { modules: 6, raw: 40000, gzip: 9800 },
      "./inline-confirm": { modules: 5, raw: 41300, gzip: 9700 },
      "./reaction-picker": { modules: 5, raw: 39800, gzip: 9300 },
      "./notification-bell": { modules: 8, raw: 105100, gzip: 21400 },

      // Static avatar bridge: measured <0.8 kB source, one local module;
      // external generation stays an explicit optional peer.
      "./avatar-blobatar": { modules: 1, raw: 900, gzip: 550 },
      // Native measurements: 9,056/2,891 B and 632/410 B; no extra local edges allowed.
      "./effect-surface": { modules: 2, raw: 10500, gzip: 3350 },
      // Native platform blur is supplied by the product host, not this graph.
      "./progressive-blur": { modules: 2, raw: 11000, gzip: 3500 },
      "./icon-lucide": { modules: 1, raw: 800, gzip: 520 },
      // 2026-09-30: optional interaction graphs measured independently; ~20% byte headroom, exact module counts.
      "./sortable": { modules: 5, raw: 44900, gzip: 10600 },
      "./swipe-actions": { modules: 5, raw: 43300, gzip: 10100 },
      "./content-transition": { modules: 4, raw: 26800, gzip: 7000 },
      "./rating": { modules: 6, raw: 43600, gzip: 10200 },
      "./image-comparison": { modules: 8, raw: 101700, gzip: 21000 },
      "./carousel-motion": { modules: 5, raw: 42500, gzip: 10100 },
      "./celebration": { modules: 2, raw: 9500, gzip: 3000 },
      "./screen-transition": { modules: 2, raw: 8400, gzip: 2700 },

      // Opt-in data layouts reuse provider primitives; external QR peers remain separately installed.
      // Measured Native: 6.5/2.1 (2 modules), 1.0/0.5 and 1.4/0.7 kB (1 each).
      "./masonry": { modules: 2, raw: 8_000, gzip: 2_700 },
      "./virtual-list": { modules: 1, raw: 1_400, gzip: 700 },
      "./qr-code": { modules: 1, raw: 1_800, gzip: 900 },
      // 2026-09-29 measured local adapter graphs: viewer 37.4/8.9 kB, sheet 36.2/8.6 kB;
      // keyboard 1.2/0.6 kB and OS menu 1.1/0.5 kB. External native peers are Metro-checked separately.
      "./image-viewer": { modules: 5, raw: 42_000, gzip: 10_000 },
      // 2026-10-01: recipe-owned typography/geometry and controlled font scaling
      // replace the independent 48pt style. Measured 10.1 kB gzip incl provider;
      // +150 bytes covers that shared accessibility behavior, with unchanged edges/raw.
      // Shared RecipeButton now reserves content width under its centered spinner; measured 42.4 kB raw, same graph.
      // 2026-10-06 1.13: + composition-style.js through overlays (see ./overlays).
      "./sheet-gesture": { modules: 6, raw: 42_333, gzip: 10_526 },
      "./keyboard-controller": { modules: 1, raw: 1_600, gzip: 850 },
      "./context-menu-native": { modules: 1, raw: 1_500, gzip: 800 },
      // Optional Skia renderer shares provider only, leaving the root graph unchanged.
      "./thinking-orb": { modules: 2, raw: 15_000, gzip: 4_500 },
      // Separate opt-in graph: measured 15.3 kB raw / 4.2 kB gzip in two modules.
      // Geometry is in contracts; this entry reaches provider only (no feedback barrel).
      // Dark borderless surface fix measures +254 raw / +106 gzip bytes (native visual evidence, 2026-10-01).
      // Keep the same graph/raw ceiling; reserve 120 gzip bytes for the theme branch and its rationale.
      "./toast-liquid": { modules: 2, raw: 17_500, gzip: 4_920 },
      // +1 module on ".", "./inputs", "./navigation" and "./data-display":
      // `internal/web-a11y.js` holds the DOM ARIA and keyboard contracts that
      // react-native-web needs, shared by Accordion, ChoiceRow/RadioGroup, Chip
      // and Tabs. Duplicating it per entry point would keep the counts but
      // fork four copies of a keyboard contract.
      // Carousel adds one renderer module and reuses the existing state/primitive graph.
      // Agreement, Top, AuthProviderButton and Heading add one module each over
      // the same primitive graph.
      // Collapsible(native)로 31 -> 32 모듈. 측정 387.9 kB raw / 70.0 kB gzip —
      // 기존 바이트 한도 안이라 모듈 수만 올린다.
      // 2026-09-19 AuthScreenLayout로 37 -> 38 모듈. 바이트는 기존 한도 안이다.
      ".": { modules: 39, raw: 458_000, gzip: 82_000 },
      // Native FAB + existing actions/primitives: measured 36.4/8.5 kB.
      "./floating-action-button": { modules: 5, raw: 40_000, gzip: 9_400 },
      "./carousel": { modules: 6, raw: 43_000, gzip: 10_300 },
      // 2026-09-30 native audit: provider carries window safe-area insets for overlays (was 4_700/1_550).
      "./provider": { modules: 1, raw: 5_300, gzip: 1_650 },
      "./composition-style": { modules: 1, raw: 2_000, gzip: 1_000 },
      "./primitives": { modules: 3, raw: 21_500, gzip: 5_650 },
      "./actions": { modules: 4, raw: 34_700, gzip: 7_900 },
      // Compatibility aliases retain existing family graphs; no tree-shaking claim.
      // Progress gained the circular shape, which the top-bar graph also reaches.
      // Spinner-only Button presentation adds ~0.1 kB gzip to both existing action graphs, without new modules.
      "./top-bar": { modules: 9, raw: 143_000, gzip: 28_350 },
      "./bottom-cta": { modules: 4, raw: 34_700, gzip: 7_900 },
      // Inputs reexports DatePicker; the shared grid adds one transitive implementation.
      // 1.4 Switch row/inline and large-text reflow measure 170.7/31.4 kB, still 15 modules.
      // Calendar equal-column fix and the expanded validation preserve the 15-module graph; measured gzip 32.3 kB.
      // 2026-09-30 native audit fixes (Switch, Combobox, Tags, Slider, NumberField, sheet insets) measure 179.1/34.2 kB (was 178_000/32_600).
      // 2026-10-06 1.13: + composition-style.js through overlays (see ./overlays).
      "./inputs": { modules: 17, raw: 185_033, gzip: 35_176 },
      "./password-field": { modules: 9, raw: 105_000, gzip: 20_000 },
      "./otp-field": { modules: 9, raw: 105_000, gzip: 20_000 },
      // 2026-09-30: announced value text + provider insets measure 19.8/5.2 kB (gzip was 4_900).
      "./number-field": { modules: 4, raw: 20_200, gzip: 5_200 },
      // 2026-09-30: gesture-intent responder (no write on grant) measures 21.5/5.6 kB (was 19_800/4_800).
      "./slider": { modules: 4, raw: 21_800, gzip: 5_600 },
      // Native Calendar reuses primitives/provider instead of an overlay dependency.
      // The calendar resolves the semantic focus border through color-references.
      // 2026-09-30: shared provider/state growth from the native audit measures 35.0/9.4 kB (gzip was 9_000).
      "./calendar": { modules: 6, raw: 38_000, gzip: 9_400 },
      // Native reaches the shared primitive/provider graph: measured 24.8/6.1 kB
      // and 22.1/5.6 kB over 4 modules each, no new dependency.
      // 2026-09-30: +internal/state.js for the Android-safe mixed state helper; measured 28.5/7.3 kB (was 4 / 27_000 / 6_800).
      "./agreement": { modules: 5, raw: 28_500, gzip: 7_300 },
      "./top": { modules: 4, raw: 24_500, gzip: 6_200 },
      // Same table on Native over the shared primitive graph: 22.2/5.6 kB.
      "./provider-button": { modules: 4, raw: 24_500, gzip: 6_200 },
      // AuthScreenLayout keeps RN hosts and uses the existing provider only for the opt-in action card palette.
      // 2026-10-01: centred pending/card state measured 9.4/3.0 kB; existing limits cover it without loosening the gate.
      "./auth-screen": { modules: 3, raw: 14_000, gzip: 4_200 },
      // Native screen composition: existing input/display hosts dominate, plus the core Modal
      // reaction helper and ReactionPicker. Keep optional keyboard peers outside this entry.
      // Unreleased entries: limits are the 2026-10-06 measured base (graph minus shared allowances)
      // rounded up to 100 raw / 50 gzip, not provisional headroom. Includes the review fixes
      // (ChatMessage accessibility, private ListRow/TextArea inputs: +0.7 kB raw on ./screens).
      // ./screens 15 modules 178,300/36,888 (base 12, 174,575/35,242).
      "./screens": { modules: 12, raw: 174_600, gzip: 35_250 },
      // Keep workflow dependencies out of the lightweight screens entry; overlays brings
      // composition-style.js. 21 modules 292,899/58,757 (base 18, 281,074/55,111).
      // 2026-10-06 SearchScreen public API (sections, sort Menu, filter sheet) adds two reviewed edges:
      // heading.js (section titles need the header role and level5 recipe) and navigation.js (Native Menu
      // for sort, the same control the Web renderer uses). Inlined in screen-flows.tsx instead of an internal
      // module so the Web graph stays at its limit. Measured 23 modules 376.8/75.0 kB.
      "./screen-flows": { modules: 20, raw: 281_100, gzip: 55_150 },
      // SavedItemsScreen adds its renderer and Grid primitives: 22 modules 296,100/59,361
      // (base 19, 284,275/55,715). +2 SearchScreen edges as above (24 modules).
      "./saved-items": { modules: 21, raw: 284_300, gzip: 55_750 },
      // Same primitive graph as Top: 21.0 kB raw / 5.4 kB gzip over 4 modules.
      "./heading": { modules: 4, raw: 23_000, gzip: 6_000 },
      // Same primitive graph as the other Native additions: 22.6/5.8 kB.
      "./toggle-group": { modules: 4, raw: 25_000, gzip: 6_400 },
      // Same primitive graph: 21.3 kB raw / 5.6 kB gzip over 4 modules.
      "./bottom-info": { modules: 4, raw: 23_500, gzip: 6_200 },
      // Contract judgment plus RN's own Keyboard module: 2.2 kB raw / 0.9 kB gzip.
      // Web과 같은 판단을 Pressable + accessibilityState로만 옮긴 얇은 렌더러다.
      "./collapsible": { modules: 4, raw: 24_000, gzip: 6_300 },
      // Web과 같은 액자 규칙이고 재생기 의존은 없다.
      "./asset": { modules: 2, raw: 9_000, gzip: 2_800 },
      // 네 개 모두 계약 판정을 그대로 쓰고 기존 RN 렌더러 위에 얹는다. Mentions만
      // 큰 것은 TextArea(=inputs 그래프)를 통째로 끌어오기 때문이고, DateRangePicker는
      // Calendar를, TransferList는 Button을 같은 이유로 끌어온다. 새 의존성은 없다.
      // 측정: 24.4/6.2, 35.7/9.3, 80.8/16.5, 37.6/8.7 kB.
      "./tags-input": { modules: 4, raw: 27_000, gzip: 6_800 },
      "./date-range": { modules: 7, raw: 39_000, gzip: 10_200 },
      // The extracted field frame changes the shared compressed graph to 18.4 kB
      // on CI's Node 24; allow 200 additional gzip bytes, with no raw growth budget.
      "./mentions": { modules: 8, raw: 88_000, gzip: 18_200 },
      "./transfer-list": { modules: 6, raw: 41_000, gzip: 9_500 },
      "./keyboard": { modules: 1, raw: 2_800, gzip: 1_200 },
      // 2026-10-06 1.13: + composition-style.js through overlays (see ./overlays).
      "./date-picker": { modules: 11, raw: 106_033, gzip: 22_076 },
      "./file-picker": { modules: 4, raw: 24_000, gzip: 6_500 },
      "./steps": { modules: 4, raw: 25_000, gzip: 6_500 },
      "./upload-item": { modules: 6, raw: 82_000, gzip: 17_000 },
      "./forms": { modules: 8, raw: 83_000, gzip: 16_600 },
      // gzip 26_700 -> 26_750: BottomNavigation needs the same `Platform.OS`
      // branch Tabs already has, because RN maps `tab` to
      // UIAccessibilityTraitNone on iOS. Under 50 bytes for a trait that
      // decides whether VoiceOver calls the destination activatable.
      // 0.10.0: navigation은 feedback을 경유해 Skeleton을 포함한다. Skeleton이
      // recipe의 shape·펄스를 실제로 구현하면서 커졌고 modules는 9로 그대로다.
      "./navigation": { modules: 9, raw: 143_000, gzip: 28_350 },
      // 2026-09-30: UploadItem action split + mixed-state helper measure 75.9/15.6 kB (gzip was 15_000).
      "./data-display": { modules: 6, raw: 77_000, gzip: 15_600 },
      "./feedback": { modules: 5, raw: 73_500, gzip: 15_100 },
      // 2026-10-01: all six emitted files match HEAD 8543b6f byte-for-byte.
      // Node 26.9.0 measures 15_332 gzip vs the effective 15_320 limit; +20 only.
      // Evidence: docs/evidence/overlay-budget-2026-10-01/baseline.json.
      // CloseGlyph fixes the reproduced 200% clipping: +339 raw / +138 gzip bytes
      // over that exact six-module baseline; no new graph edge, peer or raw allowance.
      // Evidence: docs/evidence/pattern-polish-2026-10-01/overlay-close-budget.json.
      // 2026-10-06 1.13: AlertDialog/Sheet contentStyle warn only for non-layout keys, so overlays
      // imports the runtime hjmCompositionStyleKeys list (composition-style.js, 1033 raw / 576 gzip)
      // instead of duplicating it. Warning on every contentStyle was rejected: layout-only use stays valid.
      "./overlays": { modules: 7, raw: 85_533, gzip: 15_834 },
      // evidence 목록에 auth-screen 한 줄이 늘었다.
      // 1.5.0: per-scenario proofs from the Native scenario matrix tables:
      // measured 8.1 kB raw / 2.23 kB gzip.
      // 2026-09-29: five stable controls add host-action proof references; same one-module graph.
      // Keep executable case ids; measured 8.6 kB raw / 2.4 kB gzip.
      // Mentions host-action proof and long-copy matrix add 51 raw / 12 gzip bytes; keep the one-module graph exact.
      // Promotion batch adds explicit native-action and long-copy proof references; measured 10,211/2,630 B.
      // ThinkingOrb adds default/environment proof metadata (10.7 kB raw / 2.72 kB gzip);
      // the graph remains one module: Skia is not imported into evidence or the base renderer.
      // Three data-layout scenario claims grow metadata only; no new import edges.
      "./evidence": { modules: 1, raw: 12_000, gzip: 3_100 },
    },
    cssBudgets: {},
  },
];

function formatBytes(value) {
  return `${(value / 1_000).toFixed(1)} kB`;
}

function formatHeadroom(measured, limit) {
  return `${((limit / measured - 1) * 100).toFixed(1)}%`;
}

function getRuntimeTarget(definition, surface) {
  if (typeof definition === "string") return definition;
  if (definition === null || typeof definition !== "object") return undefined;
  if (surface === "native" && typeof definition["react-native"] === "string") {
    return definition["react-native"];
  }
  if (typeof definition.import === "string") return definition.import;
  if (typeof definition.default === "string") return definition.default;
  return undefined;
}

function getModuleSpecifiers(source) {
  const specifiers = [];
  const staticEsm = /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s*)?["']([^"']+)["']/g;
  const dynamicEsm = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  for (const expression of [staticEsm, dynamicEsm]) {
    for (const match of source.matchAll(expression)) {
      if (match[1] !== undefined) specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function forbiddenReason(specifier, surface) {
  if (specifier === "@hjmds/design-contracts") {
    return "imports the contracts root barrel; use a granular contracts subpath";
  }
  if (specifier.includes("/src/") || specifier.includes("/dist/")) {
    return "reaches through a package's private src/dist boundary";
  }
  if (surface === "web") {
    if (
      specifier === "react-native" ||
      specifier.startsWith("react-native/") ||
      specifier.startsWith("react-native-") ||
      specifier.startsWith("@react-native/") ||
      specifier === "@hjmds/react-native" ||
      specifier.startsWith("@hjmds/react-native/")
    ) {
      return "pulls React Native code into the Web renderer";
    }
  } else if (
    specifier === "react-dom" ||
    specifier.startsWith("react-dom/") ||
    specifier === "react-native-web" ||
    specifier.startsWith("react-native-web/") ||
    specifier === "@hjmds/react" ||
    specifier.startsWith("@hjmds/react/")
  ) {
    return "pulls Web renderer code into the Native renderer";
  }
  if (
    specifier === "expo" ||
    specifier.startsWith("expo/") ||
    specifier.startsWith("expo-") ||
    specifier.startsWith("@expo/")
  ) {
    return "introduces an Expo runtime dependency into an Expo-independent renderer";
  }
  return undefined;
}

async function readJavaScriptFiles(distDirectory) {
  const files = await readdir(distDirectory, { recursive: true });
  return files
    .filter((file) => typeof file === "string" && file.endsWith(".js"))
    .map((file) => resolve(distDirectory, file));
}

async function measureGraph(entryFile, distDirectory, availableFiles) {
  const visited = new Set();
  const externals = new Set();

  async function visit(modulePath) {
    const normalized = resolve(modulePath);
    const relativePath = relative(distDirectory, normalized);
    if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
      throw new Error(`${entryFile} escapes its renderer dist boundary via ${modulePath}`);
    }
    if (!availableFiles.has(normalized)) {
      throw new Error(`${entryFile} references missing dist module ${relativePath}`);
    }
    if (visited.has(normalized)) return;
    visited.add(normalized);
    const source = await readFile(normalized, "utf8");
    for (const specifier of getModuleSpecifiers(source)) {
      if (specifier.startsWith(".")) {
        await visit(resolve(dirname(normalized), specifier));
      } else {
        externals.add(specifier);
      }
    }
  }

  await visit(entryFile);
  const sources = await Promise.all([...visited].sort().map((file) => readFile(file)));
  const bytes = Buffer.concat(sources);
  return {
    modules: visited.size,
    raw: bytes.byteLength,
    gzip: gzipSync(bytes, { level: 9 }).byteLength,
    externals: [...externals].sort(),
    files: visited,
  };
}

async function checkRenderer(renderer) {
  const packageDirectory = resolve(workspaceRoot, renderer.directory);
  const packageJsonPath = resolve(packageDirectory, "package.json");
  const distDirectory = resolve(packageDirectory, "dist");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  if (packageJson.name !== renderer.packageName) {
    throw new Error(`${renderer.directory} is ${packageJson.name}, expected ${renderer.packageName}`);
  }

  const javaScriptFiles = await readJavaScriptFiles(distDirectory);
  const availableFiles = new Set(javaScriptFiles.map((file) => resolve(file)));
  const failures = [];

  for (const modulePath of javaScriptFiles) {
    const source = await readFile(modulePath, "utf8");
    for (const specifier of getModuleSpecifiers(source)) {
      if (specifier.startsWith(".")) continue;
      const reason = forbiddenReason(specifier, renderer.surface);
      if (reason) {
        failures.push(`${relative(packageDirectory, modulePath)} imports ${specifier}: ${reason}`);
      }
    }
  }

  const executableExports = Object.entries(packageJson.exports)
    .map(([exportPath, definition]) => [
      exportPath,
      getRuntimeTarget(definition, renderer.surface),
    ])
    .filter(([, target]) => typeof target === "string" && target.endsWith(".js"));
  const executableExportNames = new Set(executableExports.map(([exportPath]) => exportPath));
  for (const exportPath of executableExportNames) {
    if (!(exportPath in renderer.budgets)) failures.push(`${exportPath}: missing explicit budget`);
  }
  for (const exportPath of Object.keys(renderer.budgets)) {
    if (!executableExportNames.has(exportPath)) failures.push(`${exportPath}: budget has no package export`);
  }

  const cssExports = Object.entries(packageJson.exports)
    .map(([exportPath, definition]) => [
      exportPath,
      getRuntimeTarget(definition, renderer.surface),
    ])
    .filter(([, target]) => typeof target === "string" && target.endsWith(".css"));
  const cssExportNames = new Set(cssExports.map(([exportPath]) => exportPath));
  for (const exportPath of cssExportNames) {
    if (!(exportPath in renderer.cssBudgets)) failures.push(`${exportPath}: missing explicit CSS budget`);
  }
  for (const exportPath of Object.keys(renderer.cssBudgets)) {
    if (!cssExportNames.has(exportPath)) failures.push(`${exportPath}: CSS budget has no package export`);
  }

  console.log(`\n${renderer.packageName} import-graph budgets`);
  for (const [exportPath, target] of executableExports) {
    const baseBudget = renderer.budgets[exportPath];
    if (!baseBudget || typeof target !== "string") continue;
    const entryFile = resolve(packageDirectory, target);
    await access(entryFile);
    const measured = await measureGraph(entryFile, distDirectory, availableFiles);
    const allowance = (renderer.sharedModuleAllowances ?? [])
      .filter(({ file }) => measured.files.has(resolve(distDirectory, file)))
      .reduce((sum, { raw, gzip, modules = 0 }) => ({ raw: sum.raw + raw, gzip: sum.gzip + gzip, modules: sum.modules + modules }), { raw: 0, gzip: 0, modules: 0 });
    const budget = { ...baseBudget, modules: baseBudget.modules + allowance.modules, raw: baseBudget.raw + allowance.raw, gzip: baseBudget.gzip + allowance.gzip };
    const regressions = [];
    // Opt-in peers must never become a hidden installation requirement of base entries.
    // Derive the peer list from the manifest so new optional runtimes cannot escape this gate.
    const optionalEntries = new Set(["./avatar-blobatar-motion", "./progressive-blur", "./effect-surface", "./icon-lucide", "./avatar-blobatar", "./sortable", "./swipe-actions", "./content-transition", "./carousel-motion", "./celebration", "./screen-transition", "./qr-code", "./thinking-orb", "./toast-liquid", "./statistic-motion", "./menu-morph", "./image-viewer", "./keyboard-controller", "./sheet-gesture", "./context-menu-native"]);
    if (!optionalEntries.has(exportPath)) {
      for (const [peer, metadata] of Object.entries(packageJson.peerDependenciesMeta ?? {})) {
        if (metadata.optional && measured.externals.some(specifier => specifier === peer || specifier.startsWith(`${peer}/`))) {
          regressions.push(`base entry imports optional peer ${peer}`);
        }
      }
    }
    if (
      exportPath !== "." &&
      measured.files.has(resolve(distDirectory, "index.js"))
    ) {
      regressions.push("granular entry traverses the renderer root barrel");
    }
    if (measured.modules > budget.modules) {
      regressions.push(`${measured.modules} modules > ${budget.modules}`);
    }
    const status = regressions.length > 0 ? "FAIL" : "PASS";
    console.log(
      `${status.padEnd(4)} ${exportPath.padEnd(20)} ` +
        `${String(measured.modules).padStart(2)} modules  ` +
        `${formatBytes(measured.raw).padStart(9)} raw  ` +
        `${formatBytes(measured.gzip).padStart(8)} gzip  ` +
        `vs baseline=${formatHeadroom(measured.raw, budget.raw)} raw/` +
        `${formatHeadroom(measured.gzip, budget.gzip)} gzip`,
    );
    for (const regression of regressions) failures.push(`${exportPath}: ${regression}`);
  }

  for (const [exportPath, target] of cssExports) {
    const budget = renderer.cssBudgets[exportPath];
    if (!budget || typeof target !== "string") continue;
    const bytes = await readFile(resolve(packageDirectory, target));
    const measured = { raw: bytes.byteLength, gzip: gzipSync(bytes, { level: 9 }).byteLength };
    const regressions = [];
    const status = regressions.length > 0 ? "FAIL" : "PASS";
    console.log(
      `${status.padEnd(4)} ${exportPath.padEnd(20)} ` +
        `${formatBytes(measured.raw).padStart(9)} raw  ` +
        `${formatBytes(measured.gzip).padStart(8)} gzip  ` +
        `vs baseline=${formatHeadroom(measured.raw, budget.raw)} raw/` +
        `${formatHeadroom(measured.gzip, budget.gzip)} gzip`,
    );
    for (const regression of regressions) failures.push(`${exportPath}: ${regression}`);
  }

  if (failures.length > 0) {
    throw new Error(`${renderer.packageName} renderer budget regression:\n- ${failures.join("\n- ")}`);
  }
}

for (const renderer of rendererBudgets) await checkRenderer(renderer);
console.log("\nVerified renderer graph budgets and platform boundaries.");
