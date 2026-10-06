import { access, readFile, readdir } from "node:fs/promises";
import { posix, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const repositoryRoot = new URL("../", import.meta.url);
const distDirectory = new URL("../dist/", import.meta.url);
const packageJsonUrl = new URL("../package.json", import.meta.url);

/**
 * These are import-graph budgets, not the size of a minified application
 * bundle. Metro follows ESM re-exports before an application bundler can
 * discard them, so module count is tracked alongside raw and gzip bytes.
 * Raising a budget requires an intentional review of the changed graph.
 */
const budgets = [
  // Screen geometry reuses foundation tokens; the contract has no catalog/renderer dependencies.
  // 2026-10-06 measured 11,524/4,028 with foundations; limit rounded up to 100 raw / 50 gzip.
  { exportPath: "./screen-patterns", maxModules: 2, maxRawBytes: 11_600, maxGzipBytes: 4_050, forbiddenModules: metadataModules },
  // Optional action state store: measured 2504 raw / 889 gzip bytes; no dependency graph.
  { exportPath: "./action-session", maxModules: 1, maxRawBytes: 2900, maxGzipBytes: 1050, forbiddenModules: metadataModules },
  // Pure elastic-indicator geometry: 720 raw / 439 gzip bytes.
  { exportPath: "./gooey-navigation", maxModules: 1, maxRawBytes: 850, maxGzipBytes: 520, forbiddenModules: metadataModules },
  // Bounded grapheme geometry: 775 raw / 509 gzip bytes, one pure module.
  { exportPath: "./gravity-letters", maxModules: 1, maxRawBytes: 900, maxGzipBytes: 600, forbiddenModules: metadataModules },
  // Task validation reuses existing sortable identity validation; measured 2606/1145 bytes.
  { exportPath: "./task-list", maxModules: 2, maxRawBytes: 3000, maxGzipBytes: 1400, forbiddenModules: metadataModules },
  // Bounded calendar grid measured 2128 raw / 981 gzip bytes, no date-library dependency.
  { exportPath: "./activity-heatmap", maxModules: 1, maxRawBytes: 2500, maxGzipBytes: 1150, forbiddenModules: metadataModules },
  // Exact-source token validation measured 781 raw / 447 gzip bytes.
  // VoiceNote metadata normalization measured 1084 raw / 455 gzip bytes; no dependencies.
  // Theme studio composes existing colors and contrast rules: 6291 raw / 2380 gzip.
  // Fixed reveal geometry plus existing timing foundations: 7014 raw / 2600 gzip.
  { exportPath: "./grid-reveal", maxModules: 2, maxRawBytes: 8100, maxGzipBytes: 3000, forbiddenModules: metadataModules },
  { exportPath: "./theme-studio", maxModules: 3, maxRawBytes: 7300, maxGzipBytes: 2800, forbiddenModules: metadataModules },
  { exportPath: "./voice-note", maxModules: 1, maxRawBytes: 1250, maxGzipBytes: 530, forbiddenModules: metadataModules },
  { exportPath: "./code-block", maxModules: 1, maxRawBytes: 950, maxGzipBytes: 550, forbiddenModules: metadataModules },
  // Text annotation geometry is one pure module; renderer measurement stays outside contracts.
  { exportPath: "./text-annotation", maxModules: 1, maxRawBytes: 5800, maxGzipBytes: 1900, forbiddenModules: metadataModules },
  // Pure scroll ratio contract measured 567 raw / 333 gzip bytes.
  // Progressive blur composes the existing logical scroll boundary resolver.
  { exportPath: "./progressive-blur", maxModules: 2, maxRawBytes: 4000, maxGzipBytes: 1400, forbiddenModules: metadataModules },
  { exportPath: "./scroll-progress", maxModules: 1, maxRawBytes: 700, maxGzipBytes: 400, forbiddenModules: metadataModules },
  // Isolated integer duration and controlled reactions: measured 1289/610 and 1068/464 raw/gzip bytes.
  { exportPath: "./duration-field", maxModules: 1, maxRawBytes: 1500, maxGzipBytes: 710, forbiddenModules: metadataModules },
  // 2026-10-06: resolveReactionOptions (expanded catalog) measures 1373/565 after trimming its message.
  // Bytes are report-only since 2026-10-06; the baseline stays at the reviewed 1250/550.
  { exportPath: "./reactions", maxModules: 1, maxRawBytes: 1250, maxGzipBytes: 550, forbiddenModules: metadataModules },
  // Four bounded transform recipes; one pure module and no renderer dependency.
  { exportPath: "./content-transition", maxModules: 1, maxRawBytes: 1200, maxGzipBytes: 600, forbiddenModules: metadataModules },
  { exportPath: "./reference-controls", maxModules: 5, maxRawBytes: 14900, maxGzipBytes: 4600, forbiddenModules: metadataModules },
  // 2026-10-01 measured 526/317 B and 6136/2254 B: optional avatar validation
  // and deterministic effect geometry, no component catalog or renderer import.
  // Motion-option validation extends the same pure contract to 967 raw / 437 gzip bytes; still one module.
  { exportPath: "./avatar-fallback", maxModules: 1, maxRawBytes: 1150, maxGzipBytes: 550, forbiddenModules: metadataModules },
  // 2026-10-07: the fourth module is the generated static noise tile, with no imports.
  // Native SVG turbulence is unimplemented; sharing this asset avoids a new GPU peer.
  // The graph remains effect-surface -> color-references -> colors, plus internal/effect-noise.
  { exportPath: "./effect-surface", maxModules: 4, maxRawBytes: 7100, maxGzipBytes: 2650, forbiddenModules: metadataModules },
  // Pure optional intent validation; no renderer, engine or catalog imports.
  { exportPath: "./components/interaction-adapters", maxModules: 1, maxRawBytes: 3000, maxGzipBytes: 1300, forbiddenModules: metadataModules },
  // Pure sRGB, decorative-tile and sticky-offset contracts stay independent of renderer metadata.
  { exportPath: "./components/color-picker", maxModules: 1, maxRawBytes: 2_500, maxGzipBytes: 1_000, forbiddenModules: metadataModules },
  { exportPath: "./components/watermark", maxModules: 1, maxRawBytes: 1_600, maxGzipBytes: 900, forbiddenModules: metadataModules },
  { exportPath: "./components/affix", maxModules: 1, maxRawBytes: 700, maxGzipBytes: 500, forbiddenModules: metadataModules },
  {
    // Nine upstream modes share geometry and presets; isolated from the default entry.
    exportPath: "./components/thinking-orb", maxModules: 13, maxRawBytes: 48_000, maxGzipBytes: 13_000, forbiddenModules: metadataModules,
  },
  {
    exportPath: "./tokens",
    maxModules: 5,
    maxRawBytes: 15_000,
    maxGzipBytes: 5_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./foundations",
    maxModules: 1,
    maxRawBytes: 7_000,
    maxGzipBytes: 2_500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./colors",
    maxModules: 1,
    maxRawBytes: 3_000,
    // 1_200 -> 1_250: the `borderControl` semantic key (a control outline is a
    // border role, not `textSub`) adds one key per theme plus its rationale
    // comment. The module count and import edges are unchanged.
    // 1_250 -> 1_290: the dark theme moved onto light's neutral hue family, so
    // its hex values no longer repeat light's slate strings and compress worse
    // (docs/theme-palette.md). Values only — module count and import edges are
    // unchanged, and the long-form rationale stays out of dist on purpose.
    maxGzipBytes: 1_290,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./color-references",
    maxModules: 2,
    maxRawBytes: 7_000,
    maxGzipBytes: 2_500,
    forbiddenModules: metadataModules,
  },
  {
    // Contrast math plus the default palettes it merges a brandPalette over.
    exportPath: "./palette-contrast",
    maxModules: 2,
    maxRawBytes: 6_000,
    maxGzipBytes: 2_500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./responsive",
    maxModules: 2,
    maxRawBytes: 15_000,
    maxGzipBytes: 5_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./grid",
    maxModules: 3,
    maxRawBytes: 25_000,
    maxGzipBytes: 8_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./formatters",
    // Intl wrappers only: no recipe, no catalog, no other contract module.
    maxModules: 1,
    maxRawBytes: 9_000,
    maxGzipBytes: 3_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./recipes",
    // The public recipe facade fans out to deliberately small recipe modules;
    // byte budgets keep that split from becoming a size regression.
    // P1에서 Heading·ToggleGroup·TagsInput recipe가 이 facade에 붙었다.
    // 측정 81.6 kB raw / 18.6 kB gzip, module 12 -> 15. 새 의존성은 없다.
    maxModules: 15,
    // 1.0.3: raw 80_000 -> 81_000, gzip 18_000 -> 18_200. `largeTextThreshold`를
    // foundations에 선언하고 두 레시피가 그 이름을 읽게 하면서(#20) raw 79.8 -> 80.3 kB,
    // gzip 17.9 -> 18.0 kB가 됐다. module 수는 12로 그대로 — 새 import 경로가 아니라
    // 선언과 근거 주석의 바이트다. 다시 올릴 때는 module 수부터 확인한다.
    // 1.6.0: gzip 19_500 -> 19_700. AlertDialog `actions.stackedGap`·`stackedOrder` 두 값과
    // 한 줄 근거 주석으로 19.5 -> 19.6 kB. module 수는 12로 그대로 — 새 import 경로가 아니다.
    maxRawBytes: 86_000,
    // 1.11.0: Node 24 CI compresses the unchanged 13-module recipe graph just
    // over 19_700 bytes; allow 100 bytes for that runtime difference. The
    // alternative of relying on the local Node 26 pass would block publishing
    // an otherwise identical graph (CI run 36907493565).
    maxGzipBytes: 19_800,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./recipes/base",
    maxModules: 4,
    maxRawBytes: 20_000,
    maxGzipBytes: 6_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./contracts",
    maxModules: 5,
    maxRawBytes: 17_000,
    maxGzipBytes: 5_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./version",
    maxModules: 1,
    maxRawBytes: 1_000,
    maxGzipBytes: 500,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./components/toast",
    // Liquid adds one pure geometry/recipe module to the existing Toast contract,
    // not Skia or a new store. Reviewed graph: 25.3 kB raw / 5.7 kB gzip.
    maxModules: 2,
    maxRawBytes: 26_000,
    maxGzipBytes: 6_000,
    forbiddenModules: metadataModules,
  },
  {
    exportPath: "./components/form",
    maxModules: 2,
    maxRawBytes: 17_000,
    maxGzipBytes: 6_000,
    forbiddenModules: metadataModules,
  },
  {
    // 토큰 계약만 있는 진입점이다 — 렌더러가 없으므로 그래프가 색 상수와 foundations뿐이다.
    exportPath: "./dataviz",
    maxModules: 4,
    maxRawBytes: 16_000,
    maxGzipBytes: 6_200,
    forbiddenModules: metadataModules,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./recipes/all",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    // 1.6.0: raw 339_000 -> 340_000. AlertDialog stacked 순서·간격 두 값(339.1 kB). module 수 그대로.
    // 2026-10-01: Popover/Tooltip share internal/object-validation.js instead
    // of duplicating shape guards. One reviewed pure helper edge; forbidden-module limits remain unchanged.
    maxModules: 65,
    maxRawBytes: 340_000,
    // Node 24 measures 84.0 kB after factoring the guard; 100 gzip bytes
    // cover the split source graph, with the previous raw limit unchanged.
    // 1.12.0: Progress `defaults.max` and the Steps "complete" cursor status add
    // code, not modules (65 unchanged). Rationale comments were cut to one-line
    // doc pointers first; measured 84_129 gzip locally, plus the Node 24 CI margin
    // used for ./recipes in 1.11.0.
    maxGzipBytes: 84_250,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./behaviors",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P1-d(native-platform·date-range) 두 모듈 추가. 측정 319.0/79.3 kB.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    // Liquid Toast's pure geometry re-export adds one module; measured 343.8/87.2 kB.
    // Keep this shared with the Toast contract instead of duplicating renderer math.
    // 2026-10-01: Popover/Tooltip share internal/object-validation.js instead
    // of duplicating shape guards. One reviewed pure helper edge; byte and
    // forbidden-module limits remain unchanged.
    maxModules: 61,
    maxRawBytes: 345_000,
    maxGzipBytes: 88_000,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    // ColorPicker, Watermark and Affix add exactly three isolated recipe modules; byte ceilings stay unchanged.
    exportPath: "./catalog",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    // ThinkingOrb adds one recipe-only module; measured catalog/showcase/evidence 393.7/401.4/407.7 kB.
    // 2026-09-29 Select's stable claim and renderer proof rationale add catalog copy with no module increase.
    // Tabs/BottomNavigation/LoadMore proof mappings add 363 raw / 180 gzip bytes to the unchanged 69-module catalog graph.
    // Masonry/VirtualList geometry and QR recipe add three neutral modules; QR encoder stays opt-in.
    // 2026-10-01: Popover/Tooltip share internal/object-validation.js instead
    // of duplicating shape guards. One reviewed pure helper edge; byte and
    // forbidden-module limits remain unchanged.
    maxModules: 76,
    maxRawBytes: 394_812,
    maxGzipBytes: 98_307,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./showcase",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    // ThinkingOrb adds one recipe-only module; measured catalog/showcase/evidence 393.7/401.4/407.7 kB.
    // 2026-09-29 promotion metadata raises gzip 100.0 -> 100.2 kB with the same 70-module graph.
    // Rejected removing stable scenario wiring: each proof must stay linked to the component matrix.
    // Select's stable surface status is exposed here too; its rationale adds copy but no import edge.
    // Tabs/BottomNavigation/LoadMore proof mappings add 363 raw / 188 gzip bytes to the unchanged 70-module showcase graph.
    // Masonry/VirtualList geometry and QR recipe add three neutral modules; QR encoder stays opt-in.
    // 1.10.0 Toast refresh adds badge/action recipe fields and their rationale comments (dist keeps comments);
    // module count unchanged. Measured showcase/evidence/root 403.8/410.1/568.8 kB raw.
    // 2026-10-01: Popover/Tooltip share internal/object-validation.js instead
    // of duplicating shape guards. One reviewed pure helper edge; byte and
    // forbidden-module limits remain unchanged.
    maxModules: 77,
    // Capsule recipe + validation: measured 526 + 328 raw bytes; same module graph.
    maxRawBytes: 405_254,
    maxGzipBytes: 101_400,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: "./evidence",
    // Anchor adds one isolated contract module; no added library dependency.
    // 2026-09-18 P0: Agreement·Top·AuthProviderButton 세 계약 모듈이 그래프에 들어왔다.
    // 셋 다 기존 helper(selection-helpers·foundations·base-recipes)만 재사용하고 외부
    // 의존성은 없다. 모듈 증가분이 곧 새 계약 파일 수이고, 바이트 증가분은 그 파일들과
    // catalog 문구다.
    // 2026-09-18 P1: Heading·ToggleGroup·TagsInput 세 계약 모듈이 더해졌다. 셋 다
    // 기존 helper만 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 파일 수다.
    // P1-c(SkipNav·BottomInfo·Sidebar) 세 모듈 추가. 외부 의존성 없음.
    // P2(text-formats) 한 모듈 추가.
    // P2-b(collapsible·context-menu·menubar) 세 모듈 추가. 셋 다 기존 helper만
    // 재사용하고 외부 의존성은 없다 — 증가분이 곧 새 계약 파일 수와 catalog 문구다.
    // P2-c(asset) 한 모듈, dataviz 한 모듈 추가. 외부 의존성 없이 기존 foundations·
    // semantic-colors만 재사용한다 — 증가분이 곧 두 계약 파일과 catalog 문구다.
    // 2026-09-26 1.5.0: 모듈 수는 그대로(71). 13개 승격의 maturity 문자열, textless long-copy
    // 규칙, Provider 검증 주석 정정으로 101.0 kB gzip 경계를 넘어 0.3 kB 올렸다.
    // ThinkingOrb adds one recipe-only module; measured catalog/showcase/evidence 393.7/401.4/407.7 kB.
    // 2026-09-29 List/Timeline/BottomInfo long-copy and Link keyboard proofs add only renderer evidence references.
    // Evidence graph remains 72 modules, measured 407,480 raw / 101,433 gzip; keep the cap local at 101,500.
    // 2026-09-29 additional verified promotion claims, including TagsInput keyboard/host-action proof links,
    // take the unchanged 72-module evidence graph just beyond the prior 101.7 kB cap. Keep executable
    // proof-file/case links instead of dropping evidence; measured size remains below 102 kB.
    // Tabs/BottomNavigation/LoadMore proof links add 363 raw / 182 gzip bytes to the unchanged 72-module evidence graph.
    // Masonry/VirtualList geometry and QR recipe add three neutral modules; QR encoder stays opt-in.
    // 1.10.0 Toast refresh adds badge/action recipe fields and their rationale comments (dist keeps comments);
    // module count unchanged. Measured showcase/evidence/root 403.8/410.1/568.8 kB raw.
    // 2026-10-01: Popover/Tooltip share internal/object-validation.js instead
    // of duplicating shape guards. One reviewed pure helper edge; byte and
    // forbidden-module limits remain unchanged.
    maxModules: 79,
    // Same capsule recipe/validation delta; preserve previous byte headroom.
    maxRawBytes: 411_554,
    maxGzipBytes: 102_900,
  },
  {
    // 2026-09-19 AuthScreenLayout: 계약 모듈 한 개가 그래프에 들어왔다. 기존
    // helper(foundations·base-recipes·provider-button)만 재사용하고 외부 의존성은
    // 없다 — 증가분이 곧 새 계약 파일 하나와 catalog 문구다.
    exportPath: ".",
    // The compatibility root intentionally reaches every contract. Granular
    // consumers are guarded separately below, so module splitting may raise
    // this count without increasing the root byte graph.
    // Anchor adds one isolated contract module; no added library dependency.
    // P0 세 계약 모듈로 71 -> 74, P1 세 모듈로 77. 측정 506.4 kB raw / 121.2 kB gzip.
    // P1-c로 80, formatters로 81, P1-d로 83. 측정 530.2 kB raw / 128.4 kB gzip.
    // P2로 84. 측정 533.0 kB raw / 129.3 kB gzip.
    // P2-b(collapsible·context-menu·menubar)로 87. 측정 544.4 kB raw / 132.8 kB gzip —
    // gzip은 기존 한도(133 kB) 안이라 그대로 둔다.
    // P2-c(asset·dataviz)로 89. 측정 553.4 kB raw / 136.3 kB gzip.
    // Liquid Toast adds the same pure contract module; measured 565.5/140.6 kB.
    // ThinkingOrb adds one recipe-only module; measured catalog/showcase/evidence 393.7/401.4/407.7 kB.
    // Masonry/VirtualList geometry and QR recipe add three neutral modules; QR encoder stays opt-in.
    // 2026-10-01: Popover/Tooltip share internal/object-validation.js instead
    // of duplicating shape guards. One reviewed pure helper edge; byte and
    // forbidden-module limits remain unchanged.
    maxModules: 99,
    // 0.9.13에서 470_000/110_000을 올렸다. 증가분은 recipe의 근거 주석이며 tsc는
    // 주석을 dist에 그대로 싣는다. maxModules가 70으로 그대로라는 점이 import
    // 그래프가 늘지 않았다는 근거다. 이 한도를 다시 올릴 때는 module 수가 함께
    // 늘었는지 먼저 본다 — 그때는 주석이 아니라 새 의존 경로가 원인이다.
    // 1.0.3에서 472_000 -> 473_000. 위와 같은 선언·주석이고 maxModules는 70 그대로다.
    // 1.2 completion: Web screen-chrome maturity/rationale adds catalog text;
    // measured 473.1 kB with the same 70 modules. No new runtime dependency.
    // Anchor contract and navigation catalog updates: measured 476.4 kB raw / 111.8 kB gzip.
    // 2026-09-29 stable maturity metadata and evidence mappings exceed the prior 567 kB raw cap
    // with the same 92-module graph; retain the metadata and leave a narrow 1 kB measured allowance.
    // Tabs/BottomNavigation/LoadMore proof mappings add 363 raw / 182 gzip bytes to the unchanged 92-module root graph.
    // 1.10.0 Toast refresh recipe fields + rationale comments; measured 568.8 kB raw, module count unchanged.
    // Same capsule recipe/validation delta; see navigation reference evidence.
    maxRawBytes: 570_354,
    // Calendar/composition evidence adds catalog copy; the root remains 70 modules
    // (473.6 kB raw / 111.0 kB gzip). Keep granular runtime budgets unchanged.
    // Popover 묶음에서 111.8 -> 112.3 kB gzip. 모듈별로 재면 catalog.js +522 B(Popover·
    // ConfirmPopover maturity 문구), 나머지 190 B이고 maxModules는 Anchor 때의 71 그대로다.
    // 새 import 경로가 아니라 계약 데이터 문구 증가이므로 한도를 올린다(476.5 kB raw 측정).
    // 이후 SidePanel·Splitter·Tour·Tree·TransferList·Mentions·CommandPalette·DataTable의
    // maturity 문구가 더해져 113.1 kB gzip / 478.4 kB raw. 여전히 maxModules는 71이다 —
    // 계약 모듈은 전부 이미 그래프 안에 있었고 이번에 늘어난 것은 catalog 문구뿐이다.
    // Same 95-module graph measures 140.8 kB on local Node 26 and 141.4 kB on
    // CI Node 24/zlib. Keep raw/module caps; allow 1.1% compression headroom.
    maxGzipBytes: 143_000,
  },
];

/**
 * Runtime exports may be exempted only when measuring their graph would be
 * misleading. Keep this empty unless an exception has a durable explanation;
 * static JSON exports are not executable and therefore need no exemption.
 */
export const budgetExemptions = Object.freeze({});

function metadataModules() {
  return [
    "catalog.js",
    "component-definitions.js",
    "component-references.js",
    "index.js",
    "showcase.js",
  ];
}

function componentBoundaryModules() {
  return [
    ...metadataModules(),
    "behaviors.js",
    "component-recipes.js",
    "recipes.js",
  ];
}

function toDisplayBytes(value) {
  return `${(value / 1_000).toFixed(1)} kB`;
}

function getExportTarget(packageJson, exportPath) {
  const definition = packageJson.exports[exportPath];
  if (typeof definition?.import !== "string") {
    throw new Error(`package.json is missing the ${JSON.stringify(exportPath)} import export`);
  }
  return definition.import;
}

function getExecutableTarget(definition) {
  if (typeof definition === "string") return definition.endsWith(".js") ? definition : undefined;
  if (definition === null || typeof definition !== "object") return undefined;

  for (const condition of ["react-native", "import", "default"]) {
    const target = definition[condition];
    if (typeof target === "string" && target.endsWith(".js")) return target;
  }
  return undefined;
}

function hasOwn(record, key) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

/**
 * Makes budget coverage fail closed in both directions: every executable
 * package export is accounted for, and every declaration still points at an
 * executable export. An exemption must be exclusive and explain why it exists.
 */
export function getBudgetCoverageFailures(packageExports, budgetPaths, exemptions) {
  const failures = [];
  const executableExports = new Set(
    Object.entries(packageExports)
      .filter(([, definition]) => getExecutableTarget(definition) !== undefined)
      .map(([exportPath]) => exportPath),
  );
  const budgetCounts = new Map();
  for (const exportPath of budgetPaths) {
    budgetCounts.set(exportPath, (budgetCounts.get(exportPath) ?? 0) + 1);
  }

  for (const [exportPath, count] of budgetCounts) {
    if (count > 1) failures.push(`${exportPath}: duplicate budget declarations`);
  }

  for (const exportPath of executableExports) {
    const hasBudget = budgetCounts.has(exportPath);
    const hasExemption = hasOwn(exemptions, exportPath);
    if (!hasBudget && !hasExemption) {
      failures.push(`${exportPath}: missing explicit budget or justified exemption`);
    } else if (hasBudget && hasExemption) {
      failures.push(`${exportPath}: cannot have both a budget and an exemption`);
    }
  }

  for (const exportPath of budgetCounts.keys()) {
    if (!executableExports.has(exportPath)) {
      failures.push(`${exportPath}: budget has no executable package export`);
    }
  }

  for (const [exportPath, reason] of Object.entries(exemptions)) {
    if (!executableExports.has(exportPath)) {
      failures.push(`${exportPath}: exemption has no executable package export`);
    }
    if (typeof reason !== "string" || reason.trim().length === 0) {
      failures.push(`${exportPath}: exemption must include a justification`);
    }
  }

  return failures;
}

/** Builds the reviewed explicit and component-family budgets for one manifest. */
export function getCheckedBudgets(packageJson) {
  const explicitBudgetPaths = new Set(budgets.map(({ exportPath }) => exportPath));
  const componentBudgets = Object.keys(packageJson.exports)
    .filter(
      (exportPath) =>
        exportPath.startsWith("./components/") && !explicitBudgetPaths.has(exportPath),
    )
    .map((exportPath) => ({
      exportPath,
      // A component may compose foundations, semantic colors, and one or two
      // focused helpers. It must never reach the full behavior/recipe barrels.
      maxModules: 9,
      maxRawBytes: 50_000,
      maxGzipBytes: 12_000,
      forbiddenModules: componentBoundaryModules,
    }));
  const largeGraphBudgetIndex = budgets.findIndex(
    ({ exportPath }) => exportPath === "./recipes/all",
  );
  if (largeGraphBudgetIndex < 0) throw new Error("Missing ./recipes/all graph budget anchor");
  return [
    ...budgets.slice(0, largeGraphBudgetIndex),
    ...componentBudgets,
    ...budgets.slice(largeGraphBudgetIndex),
  ];
}

function getModuleDependencies(source) {
  const dependencies = [];
  const esmSpecifier =
    /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s*)?["'](\.\.?\/[^"']+)["']/g;

  for (const match of source.matchAll(esmSpecifier)) {
    const specifier = match[1];
    if (specifier !== undefined) dependencies.push(specifier);
  }
  return dependencies;
}

async function measureGraph(entryFile, availableModules) {
  const visited = new Set();

  async function visit(moduleName) {
    if (visited.has(moduleName)) return;
    if (!availableModules.has(moduleName)) {
      throw new Error(`${entryFile} references missing dist module ${moduleName}`);
    }

    visited.add(moduleName);
    const moduleUrl = new URL(moduleName, distDirectory);
    const source = await readFile(moduleUrl, "utf8");

    for (const specifier of getModuleDependencies(source)) {
      const dependentUrl = new URL(specifier, moduleUrl);
      const dependentName = posix.normalize(
        relative(fileURLToPath(distDirectory), fileURLToPath(dependentUrl)),
      );
      await visit(dependentName);
    }
  }

  await visit(entryFile);
  const modules = [...visited].sort();
  const sources = await Promise.all(
    modules.map((moduleName) => readFile(new URL(moduleName, distDirectory))),
  );
  const graphBytes = Buffer.concat(sources);

  return {
    modules,
    rawBytes: graphBytes.byteLength,
    gzipBytes: gzipSync(graphBytes, { level: 9 }).byteLength,
  };
}

async function assertExportTargetsExist(packageJson) {
  for (const [exportPath, definition] of Object.entries(packageJson.exports)) {
    for (const [condition, target] of Object.entries(definition)) {
      if (typeof target !== "string" || target.includes("*")) continue;
      try {
        await access(new URL(target, repositoryRoot));
      } catch {
        throw new Error(
          `${exportPath} (${condition}) references missing package target ${target}`,
        );
      }
    }
  }
}

// Bytes are measured and reported, not enforced (2026-10-06 user decision: "상한 없애").
// The 2026-10-02 alarm (+10% tolerance) still made comment-only growth fail CI and cap
// debates. `maxRawBytes`/`maxGzipBytes` remain as reviewed baselines only. Module counts
// and forbidden imports, which catch accidental dependency edges, still fail immediately.
export function classifyBytes(_measured, _baseline) {
  return "pass";
}

export function checkBudget(budget, measurement, warnings = []) {
  const failures = [];
  if (measurement.modules.length > budget.maxModules) {
    failures.push(`${measurement.modules.length} modules > ${budget.maxModules}`);
  }

  const forbidden = typeof budget.forbiddenModules === "function"
    ? budget.forbiddenModules()
    : budget.forbiddenModules ?? [];
  const leaked = forbidden.filter((moduleName) => measurement.modules.includes(moduleName));
  if (leaked.length > 0) failures.push(`metadata leak: ${leaked.join(", ")}`);

  return failures;
}

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8"));
  await assertExportTargetsExist(packageJson);
  // ThinkingOrb keeps vendored math internal; inspect nested emitted modules too.
  const distFiles = await readdir(distDirectory, { recursive: true });
  const availableModules = new Set(distFiles.filter((fileName) => fileName.endsWith(".js")));
  const failures = [];
  const checkedBudgets = getCheckedBudgets(packageJson);
  const coverageFailures = getBudgetCoverageFailures(
    packageJson.exports,
    checkedBudgets.map(({ exportPath }) => exportPath),
    budgetExemptions,
  );
  if (coverageFailures.length > 0) {
    throw new Error(
      `Bundle budget configuration is incomplete:\n- ${coverageFailures.join("\n- ")}`,
    );
  }

  console.log("Metro/Web import-graph budgets");
  for (const budget of checkedBudgets) {
    const target = getExportTarget(packageJson, budget.exportPath);
    const entryFile = target.replace(/^\.\/dist\//, "");
    const measurement = await measureGraph(entryFile, availableModules);
    const budgetWarnings = [];
    const budgetFailures = checkBudget(budget, measurement, budgetWarnings);
    const status = budgetFailures.length > 0 ? "FAIL" : "PASS";

    console.log(
      `${status.padEnd(4)} ${budget.exportPath.padEnd(20)} ` +
        `${String(measurement.modules.length).padStart(2)} modules  ` +
        `${toDisplayBytes(measurement.rawBytes).padStart(9)} raw  ` +
        `${toDisplayBytes(measurement.gzipBytes).padStart(8)} gzip`,
    );

    for (const failure of budgetFailures) {
      failures.push(`${budget.exportPath}: ${failure}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Bundle budget regression:\n- ${failures.join("\n- ")}\n` +
        `Inspect dist import edges before changing budgets (${fileURLToPath(repositoryRoot)}).`,
    );
  }
}

const isMainModule =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
