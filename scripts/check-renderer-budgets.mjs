import { access, readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));

// Baselines are the reviewed 0.7 renderer graphs with roughly 15-25% byte headroom.
// Module limits are deliberately tighter: adding an import edge must be an
// explicit review instead of being hidden inside gzip variance.
const rendererBudgets = [
  {
    packageName: "@hjmds/react",
    directory: "packages/react",
    surface: "web",
    budgets: {
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
      ".": { modules: 63, raw: 445_000, gzip: 93_000 },
      // FAB reuses actions/provider; measured 21.0 kB raw / 5.5 kB gzip.
      "./floating-action-button": { modules: 5, raw: 23_000, gzip: 6_100 },
      // Carousel adds one module, reuses actions/provider; measured 22.5/5.8 kB.
      "./carousel": { modules: 5, raw: 25_000, gzip: 6_400 },
      // Each includes actions + provider: measured 5 modules, 19.1/19.2 kB raw,
      // 4.89/4.90 kB gzip. Reuse preserves button/loading/theme contracts.
      "./top-bar": { modules: 5, raw: 21_000, gzip: 5_400 },
      "./bottom-cta": { modules: 5, raw: 21_000, gzip: 5_400 },
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
      "./date-picker": { modules: 5, raw: 28_000, gzip: 7_200 },
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
      "./data-table": { modules: 4, raw: 21_000, gzip: 5_800 },
      // Collapsible and Menubar add only their own chrome: measured 4.0/1.4 kB
      // and 10.0/2.6 kB over 2 modules each. ContextMenu is bigger because it
      // reaches the shared modal/portal module for its layer — the same stack
      // the other overlays use, not a new dependency: measured 45.5/10.5 kB.
      "./collapsible": { modules: 2, raw: 5_000, gzip: 1_700 },
      "./context-menu": { modules: 6, raw: 50_000, gzip: 11_500 },
      "./menubar": { modules: 2, raw: 11_500, gzip: 3_000 },
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
      "./sidebar": { modules: 2, raw: 6_800, gzip: 2_100 },
      // The imperative layer reaches the whole overlay barrel on purpose — it
      // mounts Dialog and Sheet: measured 85.0 kB raw / 17.6 kB gzip.
      "./overlay-stack": { modules: 8, raw: 93_000, gzip: 19_400 },
      // Range selection reuses the Calendar grid: 21.9 kB raw / 5.9 kB gzip.
      "./date-range": { modules: 5, raw: 24_000, gzip: 6_500 },
      // ListRow가 전역 density를 읽으면서 16.6 -> 16.8 kB gzip. provider는 이미
      // 이 그래프 안에 있었으므로 modules는 11 그대로다.
      "./display": { modules: 11, raw: 73_000, gzip: 17_200 },
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
      "./overlays": { modules: 7, raw: 90_000, gzip: 18_000 },
      "./feedback": { modules: 3, raw: 13_500, gzip: 3_300 },
      // density helper가 provider 모듈에 들어가면서 6.8 kB gzip 경계에 닿았다.
      "./toast": { modules: 4, raw: 28_000, gzip: 7_100 },
      // Two new claims add metadata only: measured 6,045 B raw / 1,594 B gzip.
      // Three Web navigation claims add metadata (6.5 kB raw); no import edges.
      // Six more claims, metadata only: measured 6.9 kB raw / 1.7 kB gzip.
      "./evidence": { modules: 1, raw: 8_200, gzip: 2_100 },
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
      "./styles.css": { raw: 153_000, gzip: 24_800 },
    },
  },
  {
    packageName: "@hjmds/react-native",
    directory: "packages/react-native",
    surface: "native",
    budgets: {
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
      ".": { modules: 38, raw: 458_000, gzip: 82_000 },
      // Native FAB + existing actions/primitives: measured 36.4/8.5 kB.
      "./floating-action-button": { modules: 5, raw: 40_000, gzip: 9_400 },
      "./carousel": { modules: 6, raw: 43_000, gzip: 10_300 },
      "./provider": { modules: 1, raw: 4_700, gzip: 1_550 },
      "./composition-style": { modules: 1, raw: 2_000, gzip: 1_000 },
      "./primitives": { modules: 3, raw: 21_500, gzip: 5_650 },
      "./actions": { modules: 4, raw: 34_700, gzip: 7_900 },
      // Compatibility aliases retain existing family graphs; no tree-shaking claim.
      // Progress gained the circular shape, which the top-bar graph also reaches.
      "./top-bar": { modules: 9, raw: 143_000, gzip: 28_200 },
      "./bottom-cta": { modules: 4, raw: 34_700, gzip: 7_900 },
      // Inputs reexports DatePicker; the shared grid adds one transitive implementation.
      // 1.4 Switch row/inline and large-text reflow measure 170.7/31.4 kB, still 15 modules.
      "./inputs": { modules: 15, raw: 178_000, gzip: 32_000 },
      "./password-field": { modules: 9, raw: 105_000, gzip: 20_000 },
      "./otp-field": { modules: 9, raw: 105_000, gzip: 20_000 },
      "./number-field": { modules: 4, raw: 20_200, gzip: 4_900 },
      "./slider": { modules: 4, raw: 19_800, gzip: 4_800 },
      // Native Calendar reuses primitives/provider instead of an overlay dependency.
      // The calendar resolves the semantic focus border through color-references.
      "./calendar": { modules: 6, raw: 38_000, gzip: 9_000 },
      // Native reaches the shared primitive/provider graph: measured 24.8/6.1 kB
      // and 22.1/5.6 kB over 4 modules each, no new dependency.
      "./agreement": { modules: 4, raw: 27_000, gzip: 6_800 },
      "./top": { modules: 4, raw: 24_500, gzip: 6_200 },
      // Same table on Native over the shared primitive graph: 22.2/5.6 kB.
      "./provider-button": { modules: 4, raw: 24_500, gzip: 6_200 },
      // AuthScreenLayout은 계약 resolver와 RN `ScrollView`/`View`만 쓴다 —
      // 슬롯으로 받으므로 HJM primitive를 하나도 부르지 않는다.
      "./auth-screen": { modules: 3, raw: 14_000, gzip: 4_200 },
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
      "./mentions": { modules: 7, raw: 88_000, gzip: 18_000 },
      "./transfer-list": { modules: 6, raw: 41_000, gzip: 9_500 },
      "./keyboard": { modules: 1, raw: 2_800, gzip: 1_200 },
      "./date-picker": { modules: 10, raw: 105_000, gzip: 21_500 },
      "./file-picker": { modules: 4, raw: 24_000, gzip: 6_500 },
      "./steps": { modules: 4, raw: 25_000, gzip: 6_500 },
      "./upload-item": { modules: 6, raw: 82_000, gzip: 17_000 },
      "./forms": { modules: 7, raw: 83_000, gzip: 16_600 },
      // gzip 26_700 -> 26_750: BottomNavigation needs the same `Platform.OS`
      // branch Tabs already has, because RN maps `tab` to
      // UIAccessibilityTraitNone on iOS. Under 50 bytes for a trait that
      // decides whether VoiceOver calls the destination activatable.
      // 0.10.0: navigation은 feedback을 경유해 Skeleton을 포함한다. Skeleton이
      // recipe의 shape·펄스를 실제로 구현하면서 커졌고 modules는 9로 그대로다.
      "./navigation": { modules: 9, raw: 143_000, gzip: 28_200 },
      "./data-display": { modules: 6, raw: 77_000, gzip: 15_000 },
      "./feedback": { modules: 5, raw: 73_500, gzip: 15_100 },
      "./overlays": { modules: 6, raw: 84_500, gzip: 15_100 },
      // evidence 목록에 auth-screen 한 줄이 늘었다.
      "./evidence": { modules: 1, raw: 6_800, gzip: 1_800 },
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
    const budget = renderer.budgets[exportPath];
    if (!budget || typeof target !== "string") continue;
    const entryFile = resolve(packageDirectory, target);
    await access(entryFile);
    const measured = await measureGraph(entryFile, distDirectory, availableFiles);
    const regressions = [];
    if (
      exportPath !== "." &&
      measured.files.has(resolve(distDirectory, "index.js"))
    ) {
      regressions.push("granular entry traverses the renderer root barrel");
    }
    if (measured.modules > budget.modules) {
      regressions.push(`${measured.modules} modules > ${budget.modules}`);
    }
    if (measured.raw > budget.raw) {
      regressions.push(`${formatBytes(measured.raw)} raw > ${formatBytes(budget.raw)}`);
    }
    if (measured.gzip > budget.gzip) {
      regressions.push(`${formatBytes(measured.gzip)} gzip > ${formatBytes(budget.gzip)}`);
    }
    const status = regressions.length === 0 ? "PASS" : "FAIL";
    console.log(
      `${status.padEnd(4)} ${exportPath.padEnd(20)} ` +
        `${String(measured.modules).padStart(2)} modules  ` +
        `${formatBytes(measured.raw).padStart(9)} raw  ` +
        `${formatBytes(measured.gzip).padStart(8)} gzip  ` +
        `headroom=${formatHeadroom(measured.raw, budget.raw)} raw/` +
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
    if (measured.raw > budget.raw) {
      regressions.push(`${formatBytes(measured.raw)} raw > ${formatBytes(budget.raw)}`);
    }
    if (measured.gzip > budget.gzip) {
      regressions.push(`${formatBytes(measured.gzip)} gzip > ${formatBytes(budget.gzip)}`);
    }
    const status = regressions.length === 0 ? "PASS" : "FAIL";
    console.log(
      `${status.padEnd(4)} ${exportPath.padEnd(20)} ` +
        `${formatBytes(measured.raw).padStart(9)} raw  ` +
        `${formatBytes(measured.gzip).padStart(8)} gzip  ` +
        `headroom=${formatHeadroom(measured.raw, budget.raw)} raw/` +
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
