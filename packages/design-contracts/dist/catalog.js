import { timePickerRecipe } from "./time-picker.js";
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
    { name: "Text", label: "본문 글자", companions: ["StatusText"], extensions: ["GravityLetters"], category: "foundation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "textRecipe" },
    // Web semantic element is stable; React Native has no equivalent semantic elements.
    { name: "TextFormat", label: "글자 서식", category: "foundation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["Kbd", "Code", "Blockquote"], recipe: "textFormatRecipe", behavior: "textFormat" },
    { name: "Heading", label: "제목", category: "foundation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "headingRecipe", behavior: "heading" },
    { name: "Icon", label: "아이콘", category: "foundation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "iconRecipe" },
    { name: "Surface", label: "배경 영역", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "surfaceRecipe" },
    // Display promotions use renderer evidence, not product adoption counts (docs/stable-core.md).
    { name: "Divider", label: "구분선", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "dividerRecipe" },
    { name: "Section", label: "섹션", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sectionRecipe" },
    { name: "Stack", label: "가로·세로 배치", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "stackRecipe", aliases: ["Flex", "Space", "Inline"] },
    { name: "Container", label: "컨테이너", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "containerRecipe" },
    // Both renderers now pass the required scenario matrix, including long child copy; the product keeps media semantics.
    { name: "AspectRatio", label: "화면 비율", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "aspectRatioRecipe", ...evidenceNeeded("Radix·Chakra·Mantine·Carbon에서 반복되는 media geometry 문제를 shared primitive로 채택했습니다. 제품이 object-fit을 소유하고 renderer는 비율만 보장합니다.") },
    // Both renderers now exercise long child content in addition to the responsive geometry contract.
    { name: "Grid", label: "격자", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "gridRecipe", ...evidenceNeeded("공통 window class·responsive value·row-major geometry 계약과 공식 Web/RN default renderer 증거가 연결됐습니다. 남은 환경 증거는 generated 보고서에서 추적합니다.") },
    // Interaction evidence belongs to its declared surface; inventing a Native skip-link only to mirror Web would add unsupported behavior.
    { name: "Layout", label: "화면 기본 구조", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["AppShell"], recipe: "layoutRecipe", behavior: "layout", ...evidenceNeeded("Web skip-link and renderer scenarios verified.") },
    { name: "Top", label: "화면 제목과 설명", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "topRecipe", behavior: "top" },
    { name: "Masonry", label: "높이가 다른 카드 배치", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "masonryRecipe" },
    // Stable after the real Web matrix and focused separator keyboard proof pass; collapse and N-pane stay out of the contract.
    { name: "Splitter", label: "분할 영역 조절", category: "layout", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["SplitPane"], recipe: "splitterRecipe", behavior: "splitter", ...evidenceNeeded("Web long-copy, environment, accessibility, drag and focused keyboard proofs pass.") },
    { name: "Button", label: "버튼", companions: ["ClipboardButton", "ButtonLink"], extensions: ["ReactionPicker", "InlineConfirm"], category: "action", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "buttonRecipe" },
    { name: "IconButton", label: "아이콘 버튼", companions: ["ClipboardIconButton", "IconButtonLink"], extensions: ["NotificationBell"], category: "action", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "iconButtonRecipe" },
    // Web anchor Enter activation and Native router activation are now asserted at the renderer boundary.
    { name: "Link", label: "링크", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "linkRecipe", behavior: "link" },
    { name: "BottomCTA", label: "하단 실행 버튼", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "bottomCtaRecipe" },
    { name: "FloatingActionButton", label: "플로팅 실행 버튼", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "floatingActionButtonRecipe", behavior: "floatingActionButton", aliases: ["FloatButton", "FAB"], ...evidenceNeeded("Web/RN의 고정 생성 행동, 스크롤 방향 hook, 실제 높이·safe area 여백을 제공합니다. docs/floating-action-button.md에서 전체 이름·focus 유지와 목록 가림을 검증합니다.") },
    // Product-owned auth copy stays in slots; both renderer matrices now exercise long hero text.
    { name: "AuthScreenLayout", label: "로그인 화면", id: "auth-screen", companions: ["AuthScreenHero", "AuthScreenFooter"], category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["SignInLayout"], recipe: "authScreenRecipe", behavior: "authScreen", ...evidenceNeeded("로그인 화면의 두 영역 골격입니다. 히어로와 주 행동을 세로 중앙에 한 덩어리로 두고 동의 고지·정책 링크를 바닥에 붙입니다. 문구·마크·제공자 목록·링크 목적지는 제품이 슬롯으로 넘기며, 인증 흐름은 이 계약에 없습니다.") },
    // Enter/Space and Native host press now invoke the explicit product-owned action.
    { name: "AuthProviderButton", label: "소셜 로그인 버튼", category: "action", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["SocialLoginButton"], recipe: "authProviderButtonRecipe", behavior: "authProviderButton", ...evidenceNeeded("Google·Kakao·Naver·Apple 로그인 버튼입니다. 색은 제공자 가이드라인 값이고 테마가 다시 칠하지 않으며, 로고 자산과 문구는 제품이 넘깁니다. 실제 제공자 심사 통과는 제품 소유입니다.") },
    { name: "Field", label: "입력 필드", companions: ["TextField"], extensions: ["FieldGroup", "DateEntry", "GestureSheetInput"], category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "fieldRecipe", behavior: "field" },
    // Long labels wrap and Web typing/clear plus Native input/clear actions are covered.
    { name: "SearchField", label: "검색 입력", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "searchFieldRecipe", behavior: "searchField" },
    { name: "TextArea", label: "여러 줄 입력", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "fieldRecipe" },
    // Web Enter/Space and Native host reveal actions are now verified on both renderers.
    { name: "PasswordField", label: "비밀번호 입력", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Input.Password"], recipe: "passwordFieldRecipe", behavior: "passwordField" },
    // One accessible text input, numeric sanitization, wrapping label, and input actions are covered per renderer.
    { name: "OtpField", label: "인증번호 입력", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Input.OTP"], recipe: "otpFieldRecipe", behavior: "otpField" },
    // Web Space and Native host press now verify the single checkbox state transition.
    { name: "Checkbox", label: "체크박스", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionControlRecipe", behavior: "checkbox" },
    // Long option labels now have matrix coverage on both renderers.
    { name: "Radio", label: "라디오 버튼", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionControlRecipe" },
    // Web Space and Native host press now prove the choice update on each renderer.
    { name: "CheckboxGroup", label: "체크박스 그룹", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionGroupRecipe", behavior: "checkboxGroup" },
    // Web Space and Native host press now verify the selected option transition.
    { name: "RadioGroup", label: "라디오 버튼 그룹", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectionGroupRecipe", behavior: "radioGroup" },
    // Web Space and Native host press now prove the checked state transition.
    { name: "Switch", label: "스위치", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "switchRecipe", behavior: "switch" },
    // Web Space and Native host press now verify selectable Chip state changes.
    { name: "Chip", label: "선택 칩", companions: ["ShortcutRail"], category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "chipRecipe", behavior: "chip" },
    // Image tile single/multiple selection (2026-10-17 registration: independent radio/checkbox semantics).
    // Beta until renderer behavior matrices cover it; unit tests cover toggle and validation only.
    { name: "ImageChoiceGroup", label: "이미지 선택", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "imageChoiceRecipe" },
    // Web arrow-key selection and Native host press now prove option changes.
    { name: "SegmentedControl", label: "버튼형 선택", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "segmentedControlRecipe", behavior: "segmentedControl" },
    // Web Space and Native host press now verify the pressed-id set transition.
    { name: "ToggleGroup", label: "토글 그룹", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "toggleGroupRecipe", behavior: "toggleGroup", ...evidenceNeeded("여러 개를 동시에 켜는 버튼 묶음입니다. 하나만 고르는 자리는 SegmentedControl이 그대로 갖습니다.") },
    // Both renderer matrices and the surface-specific commit/remove regressions pass; Native intentionally commits on Return, not blur.
    { name: "TagsInput", label: "태그 입력", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["TagField", "ChipsInput"], recipe: "tagsInputRecipe", behavior: "tagsInput", ...evidenceNeeded("자유 입력 다중값 계약입니다. 정책 판정은 공통이며 Web Enter와 Native Return 확정, 위치 기반 삭제 action을 각 renderer에서 검증합니다. Web-only 후보 키 탐색과 2단계 Backspace는 Native 동등 동작으로 주장하지 않습니다.") },
    // Web ArrowRight and Native adjustable increment now prove the same step transition.
    { name: "Slider", label: "슬라이더", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sliderRecipe", behavior: "slider", ...evidenceNeeded("Web range input과 Native adjustable renderer가 같은 범위·step 계약을 실행합니다.") },
    // Long labels, Web ArrowUp, and Native adjustable increment now have renderer proofs.
    { name: "NumberField", label: "숫자 입력", extensions: ["DurationField"], category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "numberFieldRecipe", behavior: "numberField" },
    // Long labels and Web arrow/Enter plus Native host option activation now have renderer proofs.
    { name: "Select", label: "목록에서 선택", companions: ["NativeSelect"], category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "selectRecipe", behavior: "select" },
    // Long labels and Web filter/ArrowDown/Enter plus Native option/after-dismiss actions now have renderer proofs.
    { name: "Combobox", label: "검색형 선택", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "comboboxRecipe", behavior: "combobox", ...evidenceNeeded("걸러진 목록에서 고르는 동작을 웹·앱 각각 검증했습니다. 앱은 시트가 닫힌 뒤 선택한 값을 확정하고, 웹 키보드 선택은 별도 상호작용 계약으로 남습니다.") },
    // Product adoption and device QA follow the consumer release; both renderer contracts now have complete required proofs.
    { name: "TimePicker", label: "시각 선택", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "timePickerRecipe", behavior: "timePicker" },
    { name: "DatePicker", label: "날짜 선택", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "datePickerRecipe", behavior: "datePicker" },
    { name: "DateRangePicker", label: "기간 선택", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["DateRange"], recipe: "calendarRecipe", behavior: "dateRange" },
    { name: "ColorPicker", label: "색상 선택기", category: "input", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "colorPickerRecipe" },
    { name: "FilePicker", label: "파일 선택", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "filePickerRecipe", behavior: "filePicker", aliases: ["Upload"], ...evidenceNeeded("Web은 native file input과 dropzone 선택을, Native는 제품 소유 picker adapter 연결을 제공하고 양쪽이 같은 accept·size·count resolver를 사용합니다. 실제 OS picker 동작은 소비 앱 QA에서 확인합니다.") },
    // Both renderers now focus the product-selected first invalid field; field ordering and validation stay product-owned (docs/form.md).
    { name: "Form", label: "입력 양식", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "formRecipe", behavior: "form" },
    { name: "Agreement", label: "약관 동의", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "agreementRecipe", behavior: "agreement", ...evidenceNeeded("전체 동의는 항목의 합에서 파생하고 필수 항목만 제출 가능 여부를 정합니다. 전문 열기는 동의와 분리된 별도 tab stop입니다. 제품의 문구·링크·법적 검토와 동의 기록은 제품 소유입니다.") },
    // Both renderer matrices now prove caret insertion, named candidate actions, and long-copy behavior; IME device certification stays consumer QA because this contract does not control composition.
    { name: "Mentions", label: "사용자 언급", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "comboboxRecipe", behavior: "combobox" },
    { name: "TransferList", label: "목록 간 항목 이동", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Transfer"], recipe: "transferListRecipe", behavior: "transferList" },
    // Upload/network lifecycle belongs to consuming products; both renderers verify the caller-owned status/action contract.
    { name: "UploadItem", label: "업로드 항목", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "uploadItemRecipe", behavior: "uploadItem" },
    { name: "Tabs", label: "탭", companions: ["TabPanel"], category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "tabsRecipe", behavior: "tabs", ...evidenceNeeded("웹은 화살표 키 이동이 비활성 탭을 건너뛰고 활성화 전까지 수동 선택을 유지하며 초점 탭을 보이게 스크롤합니다(동작 줄이기는 즉시 스크롤). 앱은 계약 이름의 activate 동작과 이름 붙은 패널을 노출합니다.") },
    // Public API/Web are stable; Native long-copy evidence remains open (docs/stable-core.md).
    // Native title text now passes the long-copy scenario matrix, completing its renderer maturity.
    { name: "TopBar", label: "상단 탐색 막대", companions: ["NavigationBar", "TopBarAction"], category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "topBarRecipe" },
    // Web keyboard and long-copy renderer proofs now pass; Native remains unsupported because its navigation pattern is product-owned.
    { name: "Sidebar", label: "사이드바", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["NavigationRail", "SideNav"], recipe: "sidebarRecipe", behavior: "sidebar" },
    { name: "BottomNavigation", label: "하단 탐색", companions: ["BottomNavigationInsetProvider"], category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "bottomNavigationRecipe", behavior: "bottomNavigation", ...evidenceNeeded("Web Tab·Enter link와 Native route/reselect host action이 navigator 소유 선택 상태를 보존하고, 긴 목적지 label을 보이는 문구와 접근성 이름에 유지합니다.") },
    // Product routes and device QA remain consumer-owned; the Web renderer and route-link proofs now pass.
    { name: "Breadcrumb", label: "이동 경로", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "breadcrumbRecipe", behavior: "breadcrumb" },
    // Numeric-only rendering has no visible prose slot; four-digit page layout remains in the 320px/2x/RTL proof.
    // Carousel's dot row on its own for a product-owned pager (Utilverse launcher, 2026-10-18); same recipe, no new visuals.
    { name: "PageIndicator", label: "페이지 위치 표시", category: "navigation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "carouselRecipe" },
    { name: "Pagination", label: "페이지 이동", category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "beta"), recipe: "paginationRecipe", behavior: "pagination" },
    { name: "LoadMore", label: "더 보기", category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "loadMoreRecipe", behavior: "loadMore", ...evidenceNeeded("Web keyboard fallback·viewport observer와 Native onEndReached·retry action에서 requestKey 중복 방지, busy/error/complete 상태와 긴 현지화 문구를 검증했습니다. Native FlatList/device 통합은 소비 앱 QA입니다.") },
    // This non-interactive progress summary now has long-label matrix coverage on both renderers.
    { name: "Steps", label: "단계 탐색", extensions: ["StepPlayer"], category: "navigation", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "stepsRecipe", ...evidenceNeeded("단일 cursor에서 상태를 파생하는 Web·Native renderer와 기본 실행 증거가 연결됐습니다. 실제 다단계 흐름과 보조기기 증거가 더 필요합니다.") },
    // The Web interaction, disabled-item handling, long labels, and environment matrix have executable evidence; Native is unsupported by design.
    { name: "Menubar", label: "메뉴 막대", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "menubarRecipe", behavior: "menubar" },
    { name: "ContextMenu", label: "상황별 메뉴", extensions: ["NativeContextMenu"], category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "menuRecipe", behavior: "contextMenu" },
    { name: "Menu", label: "메뉴", extensions: ["MorphingMenu"], category: "navigation", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "menuRecipe", behavior: "menu", aliases: ["Dropdown"] },
    { name: "Anchor", label: "문서 내 바로가기", category: "navigation", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "anchorRecipe", behavior: "anchor" },
    // Visible content is initials or media; accessible names and fallback states have dedicated proofs.
    { name: "Avatar", label: "아바타", companions: ["AvatarGroup"], category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "avatarRecipe" },
    { name: "Asset", label: "이미지·영상 표시", companions: ["AssetGroup"], extensions: ["VoiceNote"], category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Media", "Artwork"], recipe: "assetRecipe", behavior: "asset", ...evidenceNeeded("아이콘·이미지·Lottie·비디오를 한 액자 규칙으로 묶습니다. 재생기는 슬롯으로 받아 이 패키지가 의존하지 않습니다.") },
    { name: "Badge", label: "배지", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "badgeRecipe" },
    // This component renders a bounded number or dot, not arbitrary visible prose.
    { name: "CounterBadge", label: "숫자 배지", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "counterBadgeRecipe" },
    { name: "Card", label: "카드", companions: ["QuoteCard"], extensions: ["DocumentResource"], category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "cardRecipe" },
    // The list's visible rows own variable-length titles, now covered by each renderer's matrix.
    { name: "List", label: "목록", companions: ["CollectionRail", "ListSeparator"], extensions: ["TaskList"], category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "listRecipe" },
    { name: "ListRow", label: "목록 행", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "listRowRecipe" },
    { name: "VirtualList", label: "가상 목록", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Listy"], recipe: "virtualListRecipe" },
    { name: "Collapsible", label: "접기와 펼치기", companions: ["CollapsibleMarker"], extensions: ["FolderPreview"], category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["Disclosure"], recipe: "collapsibleRecipe", behavior: "collapsible" },
    { name: "Accordion", label: "아코디언", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "accordionRecipe", behavior: "disclosureGroup", ...evidenceNeeded("묶음 안의 펼침 상태와 제목·내용의 접근성 연결을 웹 키보드와 앱 누르기 회귀 검사로 확인했습니다.") },
    { name: "Statistic", label: "수치 표시", companions: ["StatisticGroup"], extensions: ["AnimatedStatistic"], category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "statisticRecipe" },
    // Timeline labels are visible prose and now have long-copy matrix coverage on both renderers.
    { name: "Timeline", label: "타임라인", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "timelineRecipe", ...evidenceNeeded("두 제품의 이력 화면이 같은 항목 설명과 웹·앱의 점·연결선 렌더러를 씁니다. 남은 렌더러 증거는 자동 생성 보고서에서 추적합니다.") },
    // 2026-10-14: Native DataTable renderer added (pinned columns, sortDescFirst, summary row); beta until device evidence.
    { name: "DataTable", label: "데이터 표", companions: ["Table", "LineScore", "MatrixTable", "ComparisonTable"], category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "beta"), recipe: "dataTableRecipe", behavior: "dataTable" },
    // 2026-10-14 user request: chart drawing absorbed from product libraries (docs/chart.md); one family for all chart types.
    { name: "Chart", label: "차트", companions: ["LineChart", "BarChart", "PieChart", "RadarChart", "ScatterChart", "Sparkline", "ChartLegend"], category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "chartRecipe", behavior: "chart" },
    { name: "Tree", label: "트리 목록", category: "data-display", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "treeRecipe", behavior: "tree" },
    { name: "Calendar", label: "달력", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "calendarRecipe", behavior: "calendar" },
    { name: "Carousel", label: "캐러셀", extensions: ["CarouselMotion"], category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "carouselRecipe", behavior: "carousel" },
    { name: "DescriptionList", label: "설명 목록", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "descriptionListRecipe", aliases: ["Descriptions"] },
    // Image alt is accessibility copy, not visible renderer text; load and fallback behavior remain covered.
    { name: "Image", label: "이미지", extensions: ["GridReveal", "ImageViewer"], category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "imageRecipe", ...evidenceNeeded("웹은 불러오기·실패·대체 표시와 프레임워크 연결, 앱은 대체 표시와 최적화 호스트 연결이 기본 실행 증거입니다. 남은 렌더러 증거는 자동 생성 보고서에서 추적합니다.") },
    { name: "QRCode", label: "큐알 코드", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "qrCodeRecipe" },
    { name: "Tag", label: "태그", category: "data-display", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "tagRecipe" },
    { name: "Tour", label: "사용 안내 둘러보기", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "tourRecipe", behavior: "tour", aliases: ["CoachMark"] },
    { name: "EmptyState", label: "빈 상태", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "emptyStateRecipe" },
    { name: "Notice", label: "안내 메시지", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "noticeRecipe" },
    { name: "Progress", label: "진행 표시", extensions: ["ScrollProgress"], category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "progressRecipe" },
    // Both renderer matrices and installed iOS/Android Skia smoke pass; optional host linkage remains explicit (docs/thinking-orb.md).
    { name: "ThinkingOrb", label: "생각 중 표시", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "thinkingOrbRecipe" },
    { name: "Spinner", companions: ["PendingContent"], label: "로딩 표시", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "spinnerRecipe" },
    { name: "Skeleton", label: "스켈레톤", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "skeletonRecipe" },
    // Product adoption is tracked separately from the complete renderer matrix (docs/stable-core.md).
    { name: "Result", label: "결과 안내", category: "feedback", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "resultRecipe" },
    // Product-owned notice copy is an intended visible text slot; both renderers now prove long-copy wrapping.
    { name: "BottomInfo", label: "하단 안내", category: "feedback", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "bottomInfoRecipe", behavior: "bottomInfo", ...evidenceNeeded("주 행동 아래의 상시 안내 문장입니다. 상태를 알리는 Notice와 달리 tone·아이콘이 없고 사라지지 않습니다.") },
    // Liquid is an opt-in presentation; Web close/Escape and Native close actions are covered separately.
    { name: "Toast", label: "토스트", companions: ["ToastProvider", "ToastRegion"], category: "feedback", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "toastRecipe", behavior: "toast", aliases: ["Notification"] },
    { name: "Watermark", label: "워터마크", category: "feedback", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "watermarkRecipe" },
    { name: "Dialog", label: "대화상자", companions: ["OverlayStackProvider", "ImmersiveOverlay"], category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "dialogRecipe", behavior: "dialog" },
    { name: "AlertDialog", label: "확인 대화상자", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "alertDialogRecipe", behavior: "alertDialog" },
    { name: "Sheet", label: "시트", extensions: ["GestureSheet", "GestureSheetProvider", "SheetPanel"], category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sheetRecipe", behavior: "sheet" },
    { name: "SidePanel", label: "측면 패널", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "sidePanelRecipe", behavior: "sidePanel" },
    { name: "Popover", label: "팝오버", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "popoverRecipe", behavior: "popover" },
    { name: "Tooltip", label: "툴팁", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "tooltipRecipe", behavior: "tooltip" },
    { name: "CommandPalette", label: "명령 검색", category: "overlay", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "commandPaletteRecipe", behavior: "commandPalette" },
    { name: "Affix", label: "고정 배치", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "affixRecipe" },
    { name: "DesignSystemProvider", label: "디자인 시스템 설정", category: "provider", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), aliases: ["ConfigProvider"], nonVisualEvidence: "provider-adapter" },
    { name: "SkipNav", label: "본문 바로가기", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), aliases: ["SkipLink"], recipe: "skipNavRecipe", behavior: "skipNav" },
    // Hidden copy is validated as an accessible node; visual long-copy overflow is inapplicable by design.
    { name: "VisuallyHidden", label: "화면 읽기 도구용 글자", category: "utility", platform: "web", status: "stable", ...surfaceMaturity("stable", "unsupported"), recipe: "visuallyHiddenRecipe", aliases: ["ScreenReaderOnly", "SrOnly"], ...evidenceNeeded("Chakra와 React Aria가 별도 접근성 primitive로 제공하는 문제를 Web에서 채택했습니다. Native는 중복 invisible node 대신 host accessibilityLabel/accessibilityHint를 사용하므로 의도적으로 지원하지 않습니다.") },
    /*
      2026-10-17 screen compositions registered. These screen compositions ship from the renderers' ./screens and ./screen-flows
      subpaths and products use them as the common screen structure (2026-10-15 user rule), but they were
      classified as supplemental to keep the catalog frozen. The consumer checker resolves imported symbols
      only against canonical catalog ids, so 606 of 690 unresolved-symbol findings across six products (88%)
      were these names (STANDARD_SCOPE_REVIEW_2026-10 §1.2). The freeze ended on 2026-10-17
      (docs/stable-promotion.md), so they register as canonical rows. On 2026-10-18 both renderer default
      proofs and applicable environment matrices passed after repairing the host harness, screen body naming
      and fixtures. Stable promises the public contract, not device QA or consumer adoption (docs/stable-core.md).
    */
    { name: "ScreenLayout", label: "화면 골격", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "CompositionLayout", label: "구성 골격", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "SettingsScreen", label: "설정 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "SearchScreen", label: "검색 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "searchScreenRecipe" },
    { name: "EditorScreen", label: "편집 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "PermissionScreen", label: "권한 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "OnboardingScreen", label: "온보딩 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "ModerationScreen", label: "신고 화면", companions: ["ModerationForm"], category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "ChatScreen", label: "채팅 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "NotificationInboxScreen", label: "알림함 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "CommentThreadScreen", label: "댓글 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "commentThreadRecipe" },
    { name: "ListDetailScreen", label: "목록 상세 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    // MediaSelectionCell (2026-10-18): the screen's own item cell, exported so virtualized hosts render the same cell.
    { name: "MediaSelectionScreen", label: "미디어 선택 화면", companions: ["MediaSelectionCell"], category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    { name: "ProfileScreen", label: "프로필 화면", category: "layout", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "screenPatternRecipe" },
    // MediaAlbumPageStatus (2026-10-18): loading/failed page of ChatMessage/CommentThreadRow `mediaAlbum`.
    { name: "ChatMessage", label: "채팅 말풍선", companions: ["MediaAlbumPageStatus"], category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "chatMessageRecipe" },
    // 2026-10-18 timeline pieces that products drew themselves (BurnTok DM typing row, Utilverse chat time row).
    // New public API, so beta until both renderer proofs pass (docs/stable-promotion.md).
    { name: "TypingIndicator", label: "입력 중 표시", category: "feedback", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "typingIndicatorRecipe" },
    { name: "ChatDateSeparator", label: "대화 날짜 구분", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "chatDateSeparatorRecipe" },
    { name: "NotificationRow", label: "알림 미리보기 행", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "notificationRowRecipe" },
    { name: "NotificationItem", label: "알림 목록 항목", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "listRowRecipe" },
    { name: "CommentThreadRow", label: "댓글 행", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "commentThreadRecipe" },
    { name: "ProfileSummary", label: "프로필 요약", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "profileSummaryRecipe" },
    { name: "IconTile", label: "아이콘 타일", category: "data-display", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "iconTileRecipe" },
    { name: "MessageComposer", label: "메시지 작성창", category: "input", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "composerQuickInsertRecipe" },
    { name: "PhotoSourceSheet", label: "사진 출처 시트", category: "overlay", platform: "adaptive", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "sheetRecipe" },
];
/**
 * Kebab id of a catalog row: the explicit `id` override, else the kebab form of `name`
 * (QRCode → qr-code, BottomCTA → bottom-cta). `component-definitions.ts` mirrors this at the type level.
 */
export function componentIdOf(entry) {
    return entry.id ?? entry.name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
}
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
import { screenPatternRecipe, searchScreenRecipe, chatMessageRecipe, commentThreadRecipe, notificationRowRecipe, profileSummaryRecipe, iconTileRecipe, composerQuickInsertRecipe, typingIndicatorRecipe, chatDateSeparatorRecipe } from "./screen-patterns.js";
/** One typed registry prevents catalog recipe names from drifting into strings. */
export const recipeRegistry = {
    timePickerRecipe,
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
    typingIndicatorRecipe,
    chatDateSeparatorRecipe,
};
//# sourceMappingURL=catalog.js.map