import { affixRecipe } from "./affix.js";
import { watermarkRecipe } from "./watermark.js";
import { colorPickerRecipe } from "./color-picker.js";
import { masonryRecipe } from "./masonry.js";
import { imageChoiceRecipe } from "./image-choice.js";
import { virtualListRecipe } from "./virtual-list.js";
import { qrCodeRecipe } from "./qr-code-recipe.js";
import { thinkingOrbRecipe } from "./thinking-orb-recipe.js";
/*
  2026-09-18 현재 이 상태를 쓰는 행이 없다 — 계약만 준비돼 있던 항목이 모두 renderer나
  조합으로 닫혔다. `prerequisite`와 같은 이유로 helper는 남긴다: 다음에 계약만 먼저
  들어오는 컴포넌트가 생기면 바로 쓴다.
*/
export const contractReady = (summary) => ({
    roadmap: { state: "contract-ready", summary },
});
// Compositions live in Showcase patterns and map to their implemented primitives in the
// reference crosswalk; reserving Planned rows incorrectly counted them as missing work.
// Promotion uses renderer requirements; adoption notes are not gates (docs/stable-promotion.md).
const evidenceNeeded = (summary) => ({
    roadmap: { state: "evidence-needed", summary },
});
/*
  2026-09-18 현재 사용하는 행이 없다(Cascader가 마지막이었고 조합으로 풀렸다). 상태 값
  자체는 타입과 문서에 남아 있으므로 helper도 함께 둔다 — 다음에 선행 조건이 실제로 생기면
  다시 쓰고, 지금은 export로 미사용 오류만 피한다. 상태 값을 지우는 결정은 별도 판단이다.
*/
export const prerequisite = (summary, targets) => ({
    roadmap: { state: "prerequisite", summary, targets },
});
const surfaceMaturity = (web, native) => ({ surfaceStatus: { web, native } });
/**
 * Resolves renderer maturity without conflating it with contract maturity.
 * The fallback preserves custom catalog entries authored before
 * `surfaceStatus`; every built-in entry uses the explicit matrix.
 */
export function getComponentSurfaceStatus(entry, surface) {
    if (entry.surfaceStatus)
        return entry.surfaceStatus[surface];
    if (entry.platform === "shared" || entry.platform === "adaptive")
        return entry.status;
    if (entry.platform === surface)
        return entry.status;
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
    // Image tile single/multiple selection (2026-10-17 registration: independent radio/checkbox semantics).
    // Beta until renderer behavior matrices cover it; unit tests cover toggle and validation only.
    { name: "ImageChoiceGroup", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "imageChoiceRecipe" },
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
    { name: "Combobox", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "comboboxRecipe", behavior: "combobox", ...evidenceNeeded("걸러진 목록에서 고르는 동작을 웹·앱 각각 검증했습니다. 앱은 시트가 닫힌 뒤 선택한 값을 확정하고, 웹 키보드 선택은 별도 상호작용 계약으로 남습니다.") },
    // Product adoption and device QA follow the consumer release; both renderer contracts now have complete required proofs.
    { name: "DatePicker", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "datePickerRecipe", behavior: "datePicker" },
    { name: "DateRangePicker", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["DateRange"], recipe: "calendarRecipe", behavior: "dateRange" },
    { name: "ColorPicker", category: "input", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "colorPickerRecipe" },
    { name: "FilePicker", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "filePickerRecipe", behavior: "filePicker", aliases: ["Upload"], ...evidenceNeeded("Web은 native file input과 dropzone 선택을, Native는 제품 소유 picker adapter 연결을 제공하고 양쪽이 같은 accept·size·count resolver를 사용합니다. 실제 OS picker 동작은 소비 앱 QA에서 확인합니다.") },
    // Both renderers now focus the product-selected first invalid field; field ordering and validation stay product-owned (docs/form.md).
    { name: "Form", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "formRecipe", behavior: "form" },
    { name: "Agreement", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "agreementRecipe", behavior: "agreement", ...evidenceNeeded("전체 동의는 항목의 합에서 파생하고 필수 항목만 제출 가능 여부를 정합니다. 전문 열기는 동의와 분리된 별도 tab stop입니다. 제품의 문구·링크·법적 검토와 동의 기록은 제품 소유입니다.") },
    // Both renderer matrices now prove caret insertion, named candidate actions, and long-copy behavior; IME device certification stays consumer QA because this contract does not control composition.
    { name: "Mentions", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "comboboxRecipe", behavior: "combobox" },
    { name: "TransferList", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Transfer"], recipe: "transferListRecipe", behavior: "transferList" },
    // Upload/network lifecycle belongs to consuming products; both renderers verify the caller-owned status/action contract.
    { name: "UploadItem", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "uploadItemRecipe", behavior: "uploadItem" },
    { name: "Tabs", category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "tabsRecipe", behavior: "tabs", ...evidenceNeeded("웹은 화살표 키 이동이 비활성 탭을 건너뛰고 활성화 전까지 수동 선택을 유지하며 초점 탭을 보이게 스크롤합니다(동작 줄이기는 즉시 스크롤). 앱은 계약 이름의 activate 동작과 이름 붙은 패널을 노출합니다.") },
    // Public API/Web are stable; Native long-copy evidence remains open (docs/stable-core.md).
    // Native title text now passes the long-copy scenario matrix, completing its renderer maturity.
    { name: "TopBar", category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "topBarRecipe" },
    // Web keyboard and long-copy renderer proofs now pass; Native remains unsupported because its navigation pattern is product-owned.
    { name: "Sidebar", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["NavigationRail", "SideNav"], recipe: "sidebarRecipe", behavior: "sidebar" },
    { name: "BottomNavigation", category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "bottomNavigationRecipe", behavior: "bottomNavigation", ...evidenceNeeded("Web Tab·Enter link와 Native route/reselect host action이 navigator 소유 선택 상태를 보존하고, 긴 목적지 label을 보이는 문구와 접근성 이름에 유지합니다.") },
    // Product routes and device QA remain consumer-owned; the Web renderer and route-link proofs now pass.
    { name: "Breadcrumb", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "breadcrumbRecipe", behavior: "breadcrumb" },
    // Numeric-only rendering has no visible prose slot; four-digit page layout remains in the 320px/2x/RTL proof.
    { name: "Pagination", category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "beta"), recipe: "paginationRecipe", behavior: "pagination" },
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
    { name: "Accordion", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "accordionRecipe", behavior: "disclosureGroup", ...evidenceNeeded("묶음 안의 펼침 상태와 제목·내용의 접근성 연결을 웹 키보드와 앱 누르기 회귀 검사로 확인했습니다.") },
    { name: "Statistic", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "statisticRecipe" },
    // Timeline labels are visible prose and now have long-copy matrix coverage on both renderers.
    { name: "Timeline", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "timelineRecipe", ...evidenceNeeded("두 제품의 이력 화면이 같은 항목 설명과 웹·앱의 점·연결선 렌더러를 씁니다. 남은 렌더러 증거는 자동 생성 보고서에서 추적합니다.") },
    // 2026-10-14: Native DataTable renderer added (pinned columns, sortDescFirst, summary row); beta until device evidence.
    { name: "DataTable", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "beta"), recipe: "dataTableRecipe", behavior: "dataTable" },
    // 2026-10-14 user request: chart drawing absorbed from product libraries (docs/chart.md); one family for all chart types.
    { name: "Chart", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "chartRecipe", behavior: "chart" },
    { name: "Tree", category: "data-display", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "treeRecipe", behavior: "tree" },
    { name: "Calendar", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "calendarRecipe", behavior: "calendar" },
    { name: "Carousel", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "carouselRecipe", behavior: "carousel" },
    { name: "DescriptionList", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "descriptionListRecipe", aliases: ["Descriptions"] },
    // Image alt is accessibility copy, not visible renderer text; load and fallback behavior remain covered.
    { name: "Image", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "imageRecipe", ...evidenceNeeded("웹은 불러오기·실패·대체 표시와 프레임워크 연결, 앱은 대체 표시와 최적화 호스트 연결이 기본 실행 증거입니다. 남은 렌더러 증거는 자동 생성 보고서에서 추적합니다.") },
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
    { name: "Watermark", category: "feedback", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "watermarkRecipe" },
    { name: "Dialog", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "dialogRecipe", behavior: "dialog" },
    { name: "AlertDialog", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "alertDialogRecipe", behavior: "alertDialog" },
    { name: "Sheet", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sheetRecipe", behavior: "sheet" },
    { name: "SidePanel", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "sidePanelRecipe", behavior: "sidePanel" },
    { name: "Popover", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "popoverRecipe", behavior: "popover" },
    { name: "Tooltip", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "tooltipRecipe", behavior: "tooltip" },
    { name: "CommandPalette", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "commandPaletteRecipe", behavior: "commandPalette" },
    { name: "Affix", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "affixRecipe" },
    { name: "DesignSystemProvider", category: "provider", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["ConfigProvider"], nonVisualEvidence: "provider-adapter" },
    { name: "SkipNav", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["SkipLink"], recipe: "skipNavRecipe", behavior: "skipNav" },
    // Hidden copy is validated as an accessible node; visual long-copy overflow is inapplicable by design.
    { name: "VisuallyHidden", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "visuallyHiddenRecipe", aliases: ["ScreenReaderOnly", "SrOnly"], ...evidenceNeeded("Chakra와 React Aria가 별도 접근성 primitive로 제공하는 문제를 Web에서 채택했습니다. Native는 중복 invisible node 대신 host accessibilityLabel/accessibilityHint를 사용하므로 의도적으로 지원하지 않습니다.") },
    /*
      2026-10-17 screen compositions registered. These screen compositions ship from the renderers' ./screens and ./screen-flows
      subpaths and products use them as the common screen structure (2026-10-15 user rule), but they were
      classified as supplemental to keep the catalog frozen. The consumer checker resolves imported symbols
      only against canonical catalog ids, so 606 of 690 unresolved-symbol findings across six products (88%)
      were these names (STANDARD_SCOPE_REVIEW_2026-10 §1.2). The freeze ended on 2026-10-17
      (docs/stable-promotion.md), so they register as canonical rows. They start as beta on both surfaces:
      the default proof and the claimed environment scenarios live in the renderer evidence manifests, and
      any scenario still missing there is beta promotion debt, not a stable claim.
    */
    { name: "ScreenLayout", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "CompositionLayout", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "SettingsScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "SearchScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "searchScreenRecipe" },
    { name: "EditorScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "PermissionScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "OnboardingScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "ModerationScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "ChatScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "NotificationInboxScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "CommentThreadScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "commentThreadRecipe" },
    { name: "ListDetailScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "MediaSelectionScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "ProfileScreen", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "screenPatternRecipe" },
    { name: "ChatMessage", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "chatMessageRecipe" },
    { name: "NotificationRow", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "notificationRowRecipe" },
    { name: "NotificationItem", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "listRowRecipe" },
    { name: "CommentThreadRow", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "commentThreadRecipe" },
    { name: "ProfileSummary", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "profileSummaryRecipe" },
    { name: "IconTile", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "iconTileRecipe" },
    { name: "MessageComposer", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "composerQuickInsertRecipe" },
    { name: "PhotoSourceSheet", category: "overlay", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "sheetRecipe" },
];
export function summarizeComponentRoadmap(entries = componentCatalog) {
    return entries.reduce((summary, entry) => {
        if (entry.roadmap)
            summary[entry.roadmap.state] += 1;
        return summary;
    }, {
        "contract-ready": 0,
        composed: 0,
        "evidence-needed": 0,
        prerequisite: 0,
        declined: 0,
    });
}
import { accordionRecipe, alertDialogRecipe, avatarRecipe, badgeRecipe, bottomNavigationRecipe, bottomCtaRecipe, anchorRecipe, agreementRecipe, topRecipe, authProviderButtonRecipe, authScreenRecipe, headingRecipe, toggleGroupRecipe, tagsInputRecipe, skipNavRecipe, bottomInfoRecipe, sidebarRecipe, textFormatRecipe, collapsibleRecipe, menubarRecipe, assetRecipe, breadcrumbRecipe, aspectRatioRecipe, containerRecipe, calendarRecipe, cardRecipe, buttonRecipe, carouselRecipe, chipRecipe, comboboxRecipe, descriptionListRecipe, counterBadgeRecipe, dialogRecipe, dataTableRecipe, chartRecipe, datePickerRecipe, dividerRecipe, formRecipe, emptyStateRecipe, fieldRecipe, filePickerRecipe, iconButtonRecipe, iconRecipe, imageRecipe, linkRecipe, listRecipe, listRowRecipe, loadMoreRecipe, menuRecipe, noticeRecipe, paginationRecipe, popoverRecipe, numberFieldRecipe, progressRecipe, resultRecipe, searchFieldRecipe, selectRecipe, selectionGroupRecipe, sectionRecipe, segmentedControlRecipe, selectionControlRecipe, sheetRecipe, sidePanelRecipe, commandPaletteRecipe, layoutRecipe, otpFieldRecipe, passwordFieldRecipe, splitterRecipe, tourRecipe, transferListRecipe, skeletonRecipe, sliderRecipe, spinnerRecipe, stackRecipe, statisticRecipe, stepsRecipe, surfaceRecipe, switchRecipe, tabsRecipe, tagRecipe, textRecipe, timelineRecipe, toastRecipe, tooltipRecipe, topBarRecipe, treeRecipe, uploadItemRecipe, visuallyHiddenRecipe, } from "./recipes.js";
import { floatingActionButtonRecipe } from "./floating-action-button.js";
import { gridRecipe } from "./grid.js";
import { screenPatternRecipe, searchScreenRecipe, chatMessageRecipe, commentThreadRecipe, notificationRowRecipe, profileSummaryRecipe, iconTileRecipe, composerQuickInsertRecipe } from "./screen-patterns.js";
/** One typed registry prevents catalog recipe names from drifting into strings. */
export const recipeRegistry = {
    imageChoiceRecipe,
    affixRecipe,
    watermarkRecipe,
    colorPickerRecipe,
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
    chartRecipe,
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
    // Screen composition recipes (2026-10-17): registered so the screen catalog rows can bind their own values.
    screenPatternRecipe,
    searchScreenRecipe,
    chatMessageRecipe,
    commentThreadRecipe,
    notificationRowRecipe,
    profileSummaryRecipe,
    iconTileRecipe,
    composerQuickInsertRecipe,
};
//# sourceMappingURL=catalog.js.map