import { masonryRecipe } from "./masonry.js";
import { virtualListRecipe } from "./virtual-list.js";
import { qrCodeRecipe } from "./qr-code-recipe.js";
import { thinkingOrbRecipe } from "./thinking-orb-recipe.js";
import type { BehaviorName } from "./behaviors.js";

export type ComponentCategory =
  | "foundation"
  | "layout"
  | "action"
  | "input"
  | "navigation"
  | "data-display"
  | "feedback"
  | "overlay"
  | "provider"
  | "utility";

export type ComponentPlatform = "shared" | "adaptive" | "web" | "native";
export type ComponentStatus = "stable" | "beta" | "planned" | "deprecated";
export type ComponentSurface = "web" | "native";
export type ComponentSurfaceStatus = ComponentStatus | "unsupported";
export type ComponentSurfaceMaturity = Readonly<
  Record<ComponentSurface, ComponentSurfaceStatus>
>;
export type ComponentRoadmapState =
  | "contract-ready"
  | "composed"
  | "evidence-needed"
  | "prerequisite"
  | "declined";

export type ComponentRoadmap = Readonly<{
  state: ComponentRoadmapState;
  summary: string;
  /** Canonical components that solve this reference problem together. */
  targets?: readonly string[];
}>;

export type ComponentNonVisualEvidence = "provider-adapter";

export type ComponentCatalogEntry = Readonly<{
  name: string;
  category: ComponentCategory;
  platform: ComponentPlatform;
  /** Contract maturity. Renderer maturity is tracked independently per surface. */
  status: ComponentStatus;
  /**
   * Renderer evidence for each surface. Built-in entries always provide this
   * matrix. It stays optional so catalog entries authored against the pre-0.6
   * shape can still be passed to public helpers during migration.
   */
  surfaceStatus?: ComponentSurfaceMaturity;
  /** Search terms and familiar ecosystem names; never an API compatibility promise. */
  aliases?: readonly string[];
  recipe?: RecipeName;
  behavior?: BehaviorName;
  /** Explicit evidence for a mature contract whose value is not a visual recipe. */
  nonVisualEvidence?: ComponentNonVisualEvidence;
  /** Why the row exists at its current maturity and what event moves it forward. */
  roadmap?: ComponentRoadmap;
  /**
   * 만들지 않기로 **확정한** 항목의 사유. `status`는 구현 성숙도 축이고 이것은
   * "만들 것인가"라는 다른 질문이라 직교 필드로 둔다.
   *
   * 이 필드가 필요한 이유: crosswalk의 `targets`가 이 항목들을 가리키고
   * `targets.length > 0`이 테스트로 강제되므로, 흡수할 다른 이름이 없으면 행을 지울 수
   * 없다. 그렇다고 `planned`로 두면 "아직 안 만들었지만 만들 것"이라는 거짓을 말한다.
   * 근거는 `docs/<id>.md`에 있고, 그 문서의 존재를 테스트가 강제한다.
   */
  declinedReason?: string;
}>;

/*
  2026-09-18 현재 이 상태를 쓰는 행이 없다 — 계약만 준비돼 있던 항목이 모두 renderer나
  조합으로 닫혔다. `prerequisite`와 같은 이유로 helper는 남긴다: 다음에 계약만 먼저
  들어오는 컴포넌트가 생기면 바로 쓴다.
*/
export const contractReady = (summary: string) => ({
  roadmap: { state: "contract-ready", summary },
} as const);
const composed = (summary: string, targets: readonly string[]) => ({
  roadmap: { state: "composed", summary, targets },
} as const);
// Promotion uses renderer requirements; adoption notes are not gates (docs/stable-promotion.md).
const evidenceNeeded = (summary: string) => ({
  roadmap: { state: "evidence-needed", summary },
} as const);
/*
  2026-09-18 현재 사용하는 행이 없다(Cascader가 마지막이었고 조합으로 풀렸다). 상태 값
  자체는 타입과 문서에 남아 있으므로 helper도 함께 둔다 — 다음에 선행 조건이 실제로 생기면
  다시 쓰고, 지금은 export로 미사용 오류만 피한다. 상태 값을 지우는 결정은 별도 판단이다.
*/
export const prerequisite = (summary: string, targets: readonly string[]) => ({
  roadmap: { state: "prerequisite", summary, targets },
} as const);

const surfaceMaturity = <
  const Web extends ComponentSurfaceStatus,
  const Native extends ComponentSurfaceStatus,
>(web: Web, native: Native) => ({ surfaceStatus: { web, native } } as const);

/**
 * Resolves renderer maturity without conflating it with contract maturity.
 * The fallback preserves custom catalog entries authored before
 * `surfaceStatus`; every built-in entry uses the explicit matrix.
 */
export function getComponentSurfaceStatus(
  entry: ComponentCatalogEntry,
  surface: ComponentSurface,
): ComponentSurfaceStatus {
  if (entry.surfaceStatus) return entry.surfaceStatus[surface];
  if (entry.platform === "shared" || entry.platform === "adaptive") return entry.status;
  if (entry.platform === surface) return entry.status;
  return "unsupported";
}

/**
 * The catalog is a scope and maturity contract, not an implementation claim.
 * `shared` means API/visual parity. `adaptive` means shared intent with native
 * platform behavior. Web/native entries are intentionally platform-specific.
 */
export const componentCatalog = [
  { name: "Text", category: "foundation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "textRecipe" },
  // Web semantic element is stable; React Native has no equivalent semantic elements.
  { name: "TextFormat", category: "foundation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["Kbd", "Code", "Blockquote"], recipe: "textFormatRecipe", behavior: "textFormat" },
  { name: "Heading", category: "foundation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "headingRecipe", behavior: "heading" },
  { name: "Icon", category: "foundation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "iconRecipe" },
  { name: "Surface", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "surfaceRecipe" },
  // Display promotions use renderer evidence, not product adoption counts (docs/stable-core.md).
  { name: "Divider", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "dividerRecipe" },
  { name: "Section", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sectionRecipe" },
  { name: "Stack", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "stackRecipe", aliases: ["Flex", "Space", "Inline"] },
  { name: "Container", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "containerRecipe" },
  // Both renderers now pass the required scenario matrix, including long child copy; the product keeps media semantics.
  { name: "AspectRatio", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "aspectRatioRecipe", ...evidenceNeeded("Radix·Chakra·Mantine·Carbon에서 반복되는 media geometry 문제를 shared primitive로 채택했습니다. 제품이 object-fit을 소유하고 renderer는 비율만 보장합니다.") },
  // Both renderers now exercise long child content in addition to the responsive geometry contract.
  { name: "Grid", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "gridRecipe", ...evidenceNeeded("공통 window class·responsive value·row-major geometry 계약과 공식 Web/RN default renderer 증거가 연결됐습니다. 남은 환경 증거는 generated 보고서에서 추적합니다.") },
  // Interaction evidence belongs to its declared surface; inventing a Native skip-link only to mirror Web would add unsupported behavior.
  { name: "Layout", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["AppShell"], recipe: "layoutRecipe", behavior: "layout", ...evidenceNeeded("Web skip-link and renderer scenarios verified.") },
  { name: "Top", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "topRecipe", behavior: "top" },
  { name: "Masonry", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "masonryRecipe" },
  // Stable after the real Web matrix and focused separator keyboard proof pass; collapse and N-pane stay out of the contract.
  { name: "Splitter", category: "layout", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["SplitPane"], recipe: "splitterRecipe", behavior: "splitter", ...evidenceNeeded("Web long-copy, environment, accessibility, drag and focused keyboard proofs pass.") },
  { name: "Button", category: "action", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "buttonRecipe" },
  { name: "IconButton", category: "action", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "iconButtonRecipe" },
  // Web anchor Enter activation and Native router activation are now asserted at the renderer boundary.
  { name: "Link", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "linkRecipe", behavior: "link" },
  { name: "BottomCTA", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "bottomCtaRecipe" },
  { name: "FloatingActionButton", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "floatingActionButtonRecipe", behavior: "floatingActionButton", aliases: ["FloatButton", "FAB"], ...evidenceNeeded("Web/RN의 고정 생성 행동, 스크롤 방향 hook, 실제 높이·safe area 여백을 제공합니다. docs/floating-action-button.md에서 전체 이름·focus 유지와 목록 가림을 검증합니다.") },
  // Product-owned auth copy stays in slots; both renderer matrices now exercise long hero text.
  { name: "AuthScreenLayout", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["SignInLayout"], recipe: "authScreenRecipe", behavior: "authScreen", ...evidenceNeeded("로그인 화면의 두 영역 골격입니다. 히어로와 주 행동을 세로 중앙에 한 덩어리로 두고 동의 고지·정책 링크를 바닥에 붙입니다. 문구·마크·제공자 목록·링크 목적지는 제품이 슬롯으로 넘기며, 인증 흐름은 이 계약에 없습니다.") },
  // Enter/Space and Native host press now invoke the explicit product-owned action.
  { name: "AuthProviderButton", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["SocialLoginButton"], recipe: "authProviderButtonRecipe", behavior: "authProviderButton", ...evidenceNeeded("Google·Kakao·Naver·Apple 로그인 버튼입니다. 색은 제공자 가이드라인 값이고 테마가 다시 칠하지 않으며, 로고 자산과 문구는 제품이 넘깁니다. 실제 제공자 심사 통과는 제품 소유입니다.") },
  { name: "Field", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "fieldRecipe", behavior: "field" },
  // Long labels wrap and Web typing/clear plus Native input/clear actions are covered.
  { name: "SearchField", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "searchFieldRecipe", behavior: "searchField" },
  { name: "TextArea", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "fieldRecipe" },
  // Web Enter/Space and Native host reveal actions are now verified on both renderers.
  { name: "PasswordField", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Input.Password"], recipe: "passwordFieldRecipe", behavior: "passwordField" },
  // One accessible text input, numeric sanitization, wrapping label, and input actions are covered per renderer.
  { name: "OtpField", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Input.OTP"], recipe: "otpFieldRecipe", behavior: "otpField" },
  // Web Space and Native host press now verify the single checkbox state transition.
  { name: "Checkbox", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionControlRecipe", behavior: "checkbox" },
  // Long option labels now have matrix coverage on both renderers.
  { name: "Radio", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionControlRecipe" },
  // Web Space and Native host press now prove the choice update on each renderer.
  { name: "CheckboxGroup", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionGroupRecipe", behavior: "checkboxGroup" },
  // Web Space and Native host press now verify the selected option transition.
  { name: "RadioGroup", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionGroupRecipe", behavior: "radioGroup" },
  // Web Space and Native host press now prove the checked state transition.
  { name: "Switch", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "switchRecipe", behavior: "switch" },
  // Web Space and Native host press now verify selectable Chip state changes.
  { name: "Chip", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "chipRecipe", behavior: "chip" },
  // Web arrow-key selection and Native host press now prove option changes.
  { name: "SegmentedControl", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "segmentedControlRecipe", behavior: "segmentedControl" },
  // Web Space and Native host press now verify the pressed-id set transition.
  { name: "ToggleGroup", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "toggleGroupRecipe", behavior: "toggleGroup", ...evidenceNeeded("여러 개를 동시에 켜는 버튼 묶음입니다. 하나만 고르는 자리는 SegmentedControl이 그대로 갖습니다.") },
  // Both renderer matrices and the surface-specific commit/remove regressions pass; Native intentionally commits on Return, not blur.
  { name: "TagsInput", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["TagField", "ChipsInput"], recipe: "tagsInputRecipe", behavior: "tagsInput", ...evidenceNeeded("자유 입력 다중값 계약입니다. 정책 판정은 공통이며 Web Enter와 Native Return 확정, 위치 기반 삭제 action을 각 renderer에서 검증합니다. Web-only 후보 키 탐색과 2단계 Backspace는 Native 동등 동작으로 주장하지 않습니다.") },
  // Web ArrowRight and Native adjustable increment now prove the same step transition.
  { name: "Slider", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sliderRecipe", behavior: "slider", ...evidenceNeeded("Web range input과 Native adjustable renderer가 같은 범위·step 계약을 실행합니다.") },
  // Long labels, Web ArrowUp, and Native adjustable increment now have renderer proofs.
  { name: "NumberField", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "numberFieldRecipe", behavior: "numberField" },
  // Long labels and Web arrow/Enter plus Native host option activation now have renderer proofs.
  { name: "Select", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectRecipe", behavior: "select" },
  // Long labels and Web filter/ArrowDown/Enter plus Native option/after-dismiss actions now have renderer proofs.
  { name: "Combobox", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "comboboxRecipe", behavior: "combobox", ...evidenceNeeded("Filtered collection selection is covered per renderer. Native commits the selected key after its host sheet dismisses; Web keyboard selection remains its own interaction contract.") },
  // Product adoption and device QA follow the consumer release; both renderer contracts now have complete required proofs.
  { name: "DatePicker", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "datePickerRecipe", behavior: "datePicker" },
  { name: "DateRangePicker", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["DateRange"], recipe: "calendarRecipe", behavior: "dateRange" },
  { name: "TimePicker", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...composed("시·분 Select와 확정·초기화를 조합한 Web/RN 예제를 제공합니다. docs/time-picker.md.", ["Select"]) },
  { name: "ColorPicker", category: "input", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("임의 색 선택이 실제 제품 요구로 확인될 때 색공간·키보드 계약을 엽니다.") },
  { name: "FilePicker", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "filePickerRecipe", behavior: "filePicker", aliases: ["Upload"], ...evidenceNeeded("Web은 native file input과 dropzone 선택을, Native는 제품 소유 picker adapter 연결을 제공하고 양쪽이 같은 accept·size·count resolver를 사용합니다. 실제 OS picker 동작은 소비 앱 QA에서 확인합니다.") },
  { name: "Cascader", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...composed("Tree renderer가 들어오면서 경로는 resolve 결과에서 파생되고 중간 단계 확정은 그 노드를 고르는 것으로 끝납니다. 열 방식 화면을 베끼는 대신 Patterns/Tree의 Cascader 조합 예제로 제공합니다.", ["Popover", "Tree"]) },
  // Both renderers now focus the product-selected first invalid field; field ordering and validation stay product-owned (docs/form.md).
  { name: "Form", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "formRecipe", behavior: "form" },
  { name: "Agreement", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "agreementRecipe", behavior: "agreement", ...evidenceNeeded("전체 동의는 항목의 합에서 파생하고 필수 항목만 제출 가능 여부를 정합니다. 전문 열기는 동의와 분리된 별도 tab stop입니다. 제품의 문구·링크·법적 검토와 동의 기록은 제품 소유입니다.") },
  // Both renderer matrices now prove caret insertion, named candidate actions, and long-copy behavior; IME device certification stays consumer QA because this contract does not control composition.
  { name: "Mentions", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "comboboxRecipe", behavior: "combobox" },
  { name: "Rating", category: "input", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Rate"], ...composed("정수/반점 Slider 입력·저장과 Statistic 평균 표시의 Web/RN 예제를 제공합니다. docs/rating.md.", ["Slider", "Statistic"]) },
  { name: "TransferList", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Transfer"], recipe: "transferListRecipe", behavior: "transferList" },
  { name: "TreeSelect", category: "input", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...composed("새 primitive가 아니라 Popover 표면·Tree collection·tri-state 판정 모듈의 조합입니다. 작동 예제는 Patterns/Tree의 TreeSelect 화면입니다. docs/tree-select.md.", ["Popover", "Tree"]) },
  // Upload/network lifecycle belongs to consuming products; both renderers verify the caller-owned status/action contract.
  { name: "UploadItem", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "uploadItemRecipe", behavior: "uploadItem" },
  { name: "Tabs", category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "tabsRecipe", behavior: "tabs", ...evidenceNeeded("Web Arrow-key roving focus skips disabled tabs, keeps manual selection until activation, and scrolls a focused tab into view; reduced motion uses instant scrolling. Native exposes a contract-named activate action and labelled panel.") },
  // Public API/Web are stable; Native long-copy evidence remains open (docs/stable-core.md).
  // Native title text now passes the long-copy scenario matrix, completing its renderer maturity.
  { name: "TopBar", category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "topBarRecipe" },
  // Web keyboard and long-copy renderer proofs now pass; Native remains unsupported because its navigation pattern is product-owned.
  { name: "Sidebar", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["NavigationRail", "SideNav"], recipe: "sidebarRecipe", behavior: "sidebar" },
  { name: "BottomNavigation", category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "bottomNavigationRecipe", behavior: "bottomNavigation", ...evidenceNeeded("Web Tab·Enter link와 Native route/reselect host action이 navigator 소유 선택 상태를 보존하고, 긴 목적지 label을 보이는 문구와 접근성 이름에 유지합니다.") },
  // Product routes and device QA remain consumer-owned; the Web renderer and route-link proofs now pass.
  { name: "Breadcrumb", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "breadcrumbRecipe", behavior: "breadcrumb" },
  // Numeric-only rendering has no visible prose slot; four-digit page layout remains in the 320px/2x/RTL proof.
  { name: "Pagination", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "paginationRecipe", behavior: "pagination" },
  { name: "LoadMore", category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "loadMoreRecipe", behavior: "loadMore", ...evidenceNeeded("Web keyboard fallback·viewport observer와 Native onEndReached·retry action에서 requestKey 중복 방지, busy/error/complete 상태와 긴 현지화 문구를 검증했습니다. Native FlatList/device 통합은 소비 앱 QA입니다.") },
  // This non-interactive progress summary now has long-label matrix coverage on both renderers.
  { name: "Steps", category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "stepsRecipe", ...evidenceNeeded("단일 cursor에서 상태를 파생하는 Web·Native renderer와 기본 실행 증거가 연결됐습니다. 실제 다단계 흐름과 보조기기 증거가 더 필요합니다.") },
  // The Web interaction, disabled-item handling, long labels, and environment matrix have executable evidence; Native is unsupported by design.
  { name: "Menubar", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "menubarRecipe", behavior: "menubar" },
  { name: "ContextMenu", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "menuRecipe", behavior: "contextMenu" },
  { name: "Menu", category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "menuRecipe", behavior: "menu", aliases: ["Dropdown"] },
  { name: "Anchor", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "anchorRecipe", behavior: "anchor" },
  // Visible content is initials or media; accessible names and fallback states have dedicated proofs.
  { name: "Avatar", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "avatarRecipe" },
  { name: "Asset", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Media", "Artwork"], recipe: "assetRecipe", behavior: "asset", ...evidenceNeeded("아이콘·이미지·Lottie·비디오를 한 액자 규칙으로 묶습니다. 재생기는 슬롯으로 받아 이 패키지가 의존하지 않습니다.") },
  { name: "Badge", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "badgeRecipe" },
  // This component renders a bounded number or dot, not arbitrary visible prose.
  { name: "CounterBadge", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "counterBadgeRecipe" },
  { name: "Card", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "cardRecipe" },
  // The list's visible rows own variable-length titles, now covered by each renderer's matrix.
  { name: "List", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "listRecipe" },
  { name: "ListRow", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "listRowRecipe" },
  { name: "VirtualList", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Listy"], recipe: "virtualListRecipe" },
  { name: "Collapsible", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Disclosure"], recipe: "collapsibleRecipe", behavior: "collapsible" },
  { name: "Accordion", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "accordionRecipe", behavior: "disclosureGroup", ...evidenceNeeded("그룹 내 disclosure 상태와 trigger·panel 접근성 관계를 Web 키보드와 Native press 회귀로 확인했습니다.") },
  { name: "Statistic", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "statisticRecipe" },
  // Timeline labels are visible prose and now have long-copy matrix coverage on both renderers.
  { name: "Timeline", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "timelineRecipe", ...evidenceNeeded("두 제품의 이력 UI가 공통 descriptor와 Web/RN dot·connector renderer를 소비합니다. 남은 renderer 증거는 generated 보고서에서 추적합니다.") },
  { name: "DataTable", category: "data-display", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "dataTableRecipe", behavior: "dataTable" },
  { name: "Tree", category: "data-display", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "treeRecipe", behavior: "tree" },
  { name: "Calendar", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "calendarRecipe", behavior: "calendar" },
  { name: "Carousel", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "carouselRecipe", behavior: "carousel" },
  { name: "DescriptionList", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "descriptionListRecipe", aliases: ["Descriptions"] },
  // Image alt is accessibility copy, not visible renderer text; load and fallback behavior remain covered.
  { name: "Image", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "imageRecipe", ...evidenceNeeded("Web load/error/fallback·framework adapter와 Native fallback·optimized-host adapter가 기본 실행 증거를 제공합니다. 남은 renderer 증거는 generated 보고서에서 추적합니다.") },
  { name: "QRCode", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "qrCodeRecipe" },
  { name: "Tag", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "tagRecipe" },
  { name: "Tour", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "tourRecipe", behavior: "tour", aliases: ["CoachMark"] },
  { name: "EmptyState", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "emptyStateRecipe" },
  { name: "Notice", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "noticeRecipe" },
  { name: "Progress", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "progressRecipe" },
  // Both renderer matrices and installed iOS/Android Skia smoke pass; optional host linkage remains explicit (docs/thinking-orb.md).
  { name: "ThinkingOrb", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "thinkingOrbRecipe" },
  { name: "Spinner", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "spinnerRecipe" },
  { name: "Skeleton", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "skeletonRecipe" },
  // Product adoption is tracked separately from the complete renderer matrix (docs/stable-core.md).
  { name: "Result", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "resultRecipe" },
  // Product-owned notice copy is an intended visible text slot; both renderers now prove long-copy wrapping.
  { name: "BottomInfo", category: "feedback", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "bottomInfoRecipe", behavior: "bottomInfo", ...evidenceNeeded("주 행동 아래의 상시 안내 문장입니다. 상태를 알리는 Notice와 달리 tone·아이콘이 없고 사라지지 않습니다.") },
  // Liquid is an opt-in presentation; Web close/Escape and Native close actions are covered separately.
  { name: "Toast", category: "feedback", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "toastRecipe", behavior: "toast", aliases: ["Notification"] },
  { name: "Watermark", category: "feedback", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("화면 위 반복 표식이 필요한 제품 요구가 확인되면 의미·인쇄·접근성 경계를 엽니다.") },
  { name: "Dialog", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "dialogRecipe", behavior: "dialog" },
  { name: "AlertDialog", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "alertDialogRecipe", behavior: "alertDialog" },
  { name: "Sheet", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sheetRecipe", behavior: "sheet" },
  { name: "SidePanel", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "sidePanelRecipe", behavior: "sidePanel" },
  { name: "Popover", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "popoverRecipe", behavior: "popover" },
  { name: "ConfirmPopover", category: "overlay", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), aliases: ["Popconfirm"], ...composed("되돌릴 수 있는 보관은 Popover의 확인/취소 조합으로 제공합니다. 파괴적 동작은 AlertDialog를 사용합니다.", ["Popover", "AlertDialog"]) },
  { name: "Tooltip", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "tooltipRecipe", behavior: "tooltip" },
  { name: "CommandPalette", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "commandPaletteRecipe", behavior: "commandPalette" },
  { name: "Affix", category: "utility", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("임의 콘텐츠의 scroll threshold 고정 요구가 확인되면 Web 전용 계약을 엽니다.") },
  { name: "DesignSystemProvider", category: "provider", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["ConfigProvider"], nonVisualEvidence: "provider-adapter" },
  { name: "SkipNav", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["SkipLink"], recipe: "skipNavRecipe", behavior: "skipNav" },
  // Hidden copy is validated as an accessible node; visual long-copy overflow is inapplicable by design.
  { name: "VisuallyHidden", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "visuallyHiddenRecipe", aliases: ["ScreenReaderOnly", "SrOnly"], ...evidenceNeeded("Chakra와 React Aria가 별도 접근성 primitive로 제공하는 문제를 Web에서 채택했습니다. Native는 중복 invisible node 대신 host accessibilityLabel/accessibilityHint를 사용하므로 의도적으로 지원하지 않습니다.") },
] as const satisfies readonly ComponentCatalogEntry[];

export type ComponentName = (typeof componentCatalog)[number]["name"];

export function summarizeComponentRoadmap(
  entries: readonly ComponentCatalogEntry[] = componentCatalog,
): Readonly<Record<ComponentRoadmapState, number>> {
  return entries.reduce<Record<ComponentRoadmapState, number>>(
    (summary, entry) => {
      if (entry.roadmap) summary[entry.roadmap.state] += 1;
      return summary;
    },
    {
      "contract-ready": 0,
      composed: 0,
      "evidence-needed": 0,
      prerequisite: 0,
      declined: 0,
    },
  );
}
import {
  accordionRecipe,
  alertDialogRecipe,
  avatarRecipe,
  badgeRecipe,
  bottomNavigationRecipe,
  bottomCtaRecipe,
  anchorRecipe,
  agreementRecipe,
  topRecipe,
  authProviderButtonRecipe,
  authScreenRecipe,
  headingRecipe,
  toggleGroupRecipe,
  tagsInputRecipe,
  skipNavRecipe,
  bottomInfoRecipe,
  sidebarRecipe,
  textFormatRecipe,
  collapsibleRecipe,
  menubarRecipe,
  assetRecipe,
  breadcrumbRecipe,
  aspectRatioRecipe,
  containerRecipe,
  calendarRecipe,
  cardRecipe,
  buttonRecipe,
  carouselRecipe,
  chipRecipe,
  comboboxRecipe,
  descriptionListRecipe,
  counterBadgeRecipe,
  dialogRecipe,
  dataTableRecipe,
  datePickerRecipe,
  dividerRecipe,
  formRecipe,
  emptyStateRecipe,
  fieldRecipe,
  filePickerRecipe,
  iconButtonRecipe,
  iconRecipe,
  imageRecipe,
  linkRecipe,
  listRecipe,
  listRowRecipe,
  loadMoreRecipe,
  menuRecipe,
  noticeRecipe,
  paginationRecipe,
  popoverRecipe,
  numberFieldRecipe,
  progressRecipe,
  resultRecipe,
  searchFieldRecipe,
  selectRecipe,
  selectionGroupRecipe,
  sectionRecipe,
  segmentedControlRecipe,
  selectionControlRecipe,
  sheetRecipe,
  sidePanelRecipe,
  commandPaletteRecipe,
  layoutRecipe,
  otpFieldRecipe,
  passwordFieldRecipe,
  splitterRecipe,
  tourRecipe,
  transferListRecipe,
  skeletonRecipe,
  sliderRecipe,
  spinnerRecipe,
  stackRecipe,
  statisticRecipe,
  stepsRecipe,
  surfaceRecipe,
  switchRecipe,
  tabsRecipe,
  tagRecipe,
  textRecipe,
  timelineRecipe,
  toastRecipe,
  tooltipRecipe,
  topBarRecipe,
  treeRecipe,
  uploadItemRecipe,
  visuallyHiddenRecipe,
} from "./recipes.js";
import { floatingActionButtonRecipe } from "./floating-action-button.js";
import { gridRecipe } from "./grid.js";

/** One typed registry prevents catalog recipe names from drifting into strings. */
export const recipeRegistry = {
  thinkingOrbRecipe,
  masonryRecipe,
  virtualListRecipe,
  qrCodeRecipe,
  accordionRecipe,
  alertDialogRecipe,
  avatarRecipe,
  badgeRecipe,
  bottomNavigationRecipe,
  bottomCtaRecipe,
  anchorRecipe,
  agreementRecipe,
  topRecipe,
  authProviderButtonRecipe,
  authScreenRecipe,
  headingRecipe,
  toggleGroupRecipe,
  tagsInputRecipe,
  skipNavRecipe,
  bottomInfoRecipe,
  sidebarRecipe,
  textFormatRecipe,
  collapsibleRecipe,
  menubarRecipe,
  assetRecipe,
  breadcrumbRecipe,
  aspectRatioRecipe,
  containerRecipe,
  calendarRecipe,
  cardRecipe,
  buttonRecipe,
  carouselRecipe,
  chipRecipe,
  comboboxRecipe,
  descriptionListRecipe,
  counterBadgeRecipe,
  dialogRecipe,
  dataTableRecipe,
  datePickerRecipe,
  dividerRecipe,
  formRecipe,
  gridRecipe,
  emptyStateRecipe,
  fieldRecipe,
  filePickerRecipe,
  iconButtonRecipe,
  iconRecipe,
  imageRecipe,
  linkRecipe,
  listRecipe,
  listRowRecipe,
  loadMoreRecipe,
  menuRecipe,
  noticeRecipe,
  paginationRecipe,
  popoverRecipe,
  numberFieldRecipe,
  progressRecipe,
  resultRecipe,
  searchFieldRecipe,
  selectRecipe,
  selectionGroupRecipe,
  sectionRecipe,
  segmentedControlRecipe,
  selectionControlRecipe,
  sheetRecipe,
  sidePanelRecipe,
  commandPaletteRecipe,
  layoutRecipe,
  otpFieldRecipe,
  passwordFieldRecipe,
  splitterRecipe,
  floatingActionButtonRecipe,
  tourRecipe,
  transferListRecipe,
  skeletonRecipe,
  sliderRecipe,
  spinnerRecipe,
  stackRecipe,
  statisticRecipe,
  stepsRecipe,
  surfaceRecipe,
  switchRecipe,
  tabsRecipe,
  tagRecipe,
  textRecipe,
  timelineRecipe,
  toastRecipe,
  tooltipRecipe,
  topBarRecipe,
  treeRecipe,
  uploadItemRecipe,
  visuallyHiddenRecipe,
} as const;

export type RecipeName = keyof typeof recipeRegistry;
