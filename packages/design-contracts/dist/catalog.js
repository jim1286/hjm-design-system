/*
  2026-09-18 현재 이 상태를 쓰는 행이 없다 — 계약만 준비돼 있던 항목이 모두 renderer나
  조합으로 닫혔다. `prerequisite`와 같은 이유로 helper는 남긴다: 다음에 계약만 먼저
  들어오는 컴포넌트가 생기면 바로 쓴다.
*/
export const contractReady = (summary) => ({
    roadmap: { state: "contract-ready", summary },
});
const composed = (summary, targets) => ({
    roadmap: { state: "composed", summary, targets },
});
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
const declined = (reason) => ({
    declinedReason: reason,
    roadmap: { state: "declined", summary: reason },
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
    { name: "Text", category: "foundation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "textRecipe" },
    { name: "TextFormat", category: "foundation", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), aliases: ["Kbd", "Code", "Blockquote"], recipe: "textFormatRecipe", behavior: "textFormat", ...evidenceNeeded("단축키·코드·인용처럼 의미를 가진 글자 조각입니다. 크기가 아니라 요소라서 Text variant로 두지 않았습니다. Native는 해당 요소 의미가 없어 미지원입니다.") },
    { name: "Heading", category: "foundation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "headingRecipe", behavior: "heading", ...evidenceNeeded("이미 있던 heading 스케일(40/32/24/20/18)을 실제 heading 요소로 노출합니다. 시각 크기와 문서 단계를 분리해 지정할 수 있습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "Icon", category: "foundation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "iconRecipe" },
    { name: "Surface", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "surfaceRecipe" },
    { name: "Divider", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "dividerRecipe" },
    { name: "Section", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "sectionRecipe" },
    { name: "Stack", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "stackRecipe", aliases: ["Flex", "Space", "Inline"] },
    { name: "Container", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "containerRecipe", ...evidenceNeeded("Radix·Chakra·MUI·Mantine의 layout inventory를 비교해 공통 content-width primitive로 채택했습니다. Web/RN renderer와 환경 행렬 증거를 연결했고 실제 제품의 넓은 화면 채택 뒤 stable을 검토합니다.") },
    { name: "AspectRatio", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "aspectRatioRecipe", ...evidenceNeeded("Radix·Chakra·Mantine·Carbon에서 반복되는 media geometry 문제를 shared primitive로 채택했습니다. 제품이 object-fit을 소유하고 renderer는 비율만 보장합니다.") },
    { name: "Grid", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "gridRecipe", ...evidenceNeeded("공통 window class·responsive value·row-major geometry 계약과 공식 Web/RN default renderer 증거가 연결됐습니다. 안정화에는 환경별·제품 사용 증거가 더 필요합니다.") },
    { name: "Layout", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["AppShell"], recipe: "layoutRecipe", behavior: "layout", ...evidenceNeeded("공통 descriptor를 소비하는 Web landmark·skip-link renderer와 Native ordered-region renderer가 기본 실행 증거를 제공합니다. 실제 product shell·보조기기 증거가 쌓이면 stable을 검토합니다.") },
    { name: "Top", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "topRecipe", behavior: "top", ...evidenceNeeded("화면 본문의 첫 제목 블록입니다. 고정 크롬인 TopBar와 달리 스크롤과 함께 움직이고 실제 heading 요소를 냅니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "Masonry", category: "layout", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...evidenceNeeded("실제 waterfall 피드가 생기면 측정·패킹의 renderer 경계를 검증합니다.") },
    { name: "Splitter", category: "layout", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), aliases: ["SplitPane"], recipe: "splitterRecipe", behavior: "splitter", ...evidenceNeeded("Web separator의 드래그·키보드 조절이 같은 step 격자를 사용하고 RTL에서 논리 방향으로 뒤집힙니다. collapse·N-pane은 계약 밖이며 제품 채택·보조기기 증거는 남아 있습니다.") },
    { name: "Button", category: "action", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "buttonRecipe" },
    { name: "IconButton", category: "action", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "iconButtonRecipe" },
    { name: "Link", category: "action", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "linkRecipe", behavior: "link" },
    { name: "BottomCTA", category: "action", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "bottomCtaRecipe", ...evidenceNeeded("토스 UI 모티브의 주/보조 행동과 safe area를 Web/RN에서 제공합니다. Web은 본문을 가리지 않는 flow/sticky, Native는 제품 화면 배치를 사용합니다. docs/screen-chrome.md 참고.") },
    { name: "FloatingActionButton", category: "action", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "floatingActionButtonRecipe", behavior: "floatingActionButton", aliases: ["FloatButton", "FAB"], ...evidenceNeeded("Web/RN의 고정 생성 행동, 스크롤 방향 hook, 실제 높이·safe area 여백을 제공합니다. docs/floating-action-button.md에서 전체 이름·focus 유지와 목록 가림을 검증합니다.") },
    { name: "AuthScreenLayout", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["SignInLayout"], recipe: "authScreenRecipe", behavior: "authScreen", ...evidenceNeeded("로그인 화면의 두 영역 골격입니다. 히어로와 주 행동을 세로 중앙에 한 덩어리로 두고 동의 고지·정책 링크를 바닥에 붙입니다. 문구·마크·제공자 목록·링크 목적지는 제품이 슬롯으로 넘기며, 인증 흐름은 이 계약에 없습니다.") },
    { name: "AuthProviderButton", category: "action", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["SocialLoginButton"], recipe: "authProviderButtonRecipe", behavior: "authProviderButton", ...evidenceNeeded("Google·Kakao·Naver·Apple 로그인 버튼입니다. 색은 제공자 가이드라인 값이고 테마가 다시 칠하지 않으며, 로고 자산과 문구는 제품이 넘깁니다. 실제 제공자 심사 통과는 제품 소유입니다.") },
    { name: "Field", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "fieldRecipe", behavior: "field" },
    { name: "SearchField", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "searchFieldRecipe", behavior: "searchField" },
    { name: "TextArea", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("stable", "stable"), recipe: "fieldRecipe" },
    { name: "PasswordField", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["Input.Password"], recipe: "passwordFieldRecipe", behavior: "passwordField", ...evidenceNeeded("Web·Native renderer와 기본 실행·Storybook 증거가 연결됐습니다. 실제 로그인·가입 흐름과 암호 관리자 증거가 쌓이면 stable을 검토합니다.") },
    { name: "OtpField", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["Input.OTP"], recipe: "otpFieldRecipe", behavior: "otpField", ...evidenceNeeded("하나의 접근 가능한 입력을 유지하는 Web·Native renderer와 기본 실행·Storybook 증거가 연결됐습니다. 실제 인증 흐름과 보조기기 증거가 더 필요합니다.") },
    { name: "Checkbox", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "selectionControlRecipe", behavior: "checkbox" },
    { name: "Radio", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "selectionControlRecipe" },
    { name: "CheckboxGroup", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "selectionGroupRecipe", behavior: "checkboxGroup" },
    { name: "RadioGroup", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "selectionGroupRecipe", behavior: "radioGroup" },
    { name: "Switch", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "switchRecipe", behavior: "switch" },
    { name: "Chip", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "chipRecipe", behavior: "chip" },
    { name: "SegmentedControl", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "segmentedControlRecipe", behavior: "segmentedControl" },
    { name: "ToggleGroup", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "toggleGroupRecipe", behavior: "toggleGroup", ...evidenceNeeded("여러 개를 동시에 켜는 버튼 묶음입니다. 하나만 고르는 자리는 SegmentedControl이 그대로 갖습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "TagsInput", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["TagField", "ChipsInput"], recipe: "tagsInputRecipe", behavior: "tagsInput", ...evidenceNeeded("목록 밖의 값을 직접 만드는 다중 입력입니다. 중복·개수·글자 규칙은 제품 정책이고 계약은 확정 시점과 삭제 동작을 갖습니다. Native는 확정 키 어휘가 return 하나뿐이라 Comma/Space/Blur는 Web 전용입니다. 제품 채택은 남아 있습니다.") },
    { name: "Slider", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "sliderRecipe", behavior: "slider", ...evidenceNeeded("Web range input과 Native adjustable renderer가 같은 범위·step 계약을 실행합니다. 실제 제품 입력과 보조기기 증거가 쌓이면 stable을 검토합니다.") },
    { name: "NumberField", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "numberFieldRecipe", behavior: "numberField", ...evidenceNeeded("Web·Native renderer가 동일한 파싱·clamp·증감 계약을 실행합니다. 실제 수량 입력 흐름과 보조기기 증거가 쌓이면 stable을 검토합니다.") },
    { name: "Select", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "selectRecipe", behavior: "select" },
    { name: "Combobox", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "comboboxRecipe", behavior: "combobox" },
    { name: "DatePicker", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "datePickerRecipe", behavior: "datePicker", ...evidenceNeeded("공통 Calendar grid 계약을 사용하는 Web dialog·Native Sheet renderer와 기본 실행 증거가 연결됐습니다. 실제 날짜 입력 흐름과 보조기기 증거가 더 필요합니다.") },
    { name: "DateRangePicker", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["DateRange"], recipe: "calendarRecipe", behavior: "dateRange", ...evidenceNeeded("Calendar 격자를 그대로 쓰는 구간 선택입니다. 값 모양이 달라 Calendar에 mode 축을 붙이지 않았습니다. Native에는 hover 미리보기가 없어 구간은 날짜 이름과 점으로만 드러납니다. 제품 채택은 남아 있습니다.") },
    { name: "TimePicker", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...composed("시·분 Select와 확정·초기화를 조합한 Web/RN 예제를 제공합니다. docs/time-picker.md.", ["Select"]) },
    { name: "ColorPicker", category: "input", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("임의 색 선택이 실제 제품 요구로 확인될 때 색공간·키보드 계약을 엽니다.") },
    { name: "FilePicker", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "filePickerRecipe", behavior: "filePicker", aliases: ["Upload"], ...evidenceNeeded("Web native input·dropzone과 Native picker adapter가 같은 accept·size·count 판정 계약을 사용합니다. 실제 업로드 흐름과 플랫폼 picker 증거가 더 필요합니다.") },
    { name: "Cascader", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...composed("Tree renderer가 들어오면서 경로는 resolve 결과에서 파생되고 중간 단계 확정은 그 노드를 고르는 것으로 끝납니다. 열 방식 화면을 베끼는 대신 Patterns/Tree의 Cascader 조합 예제로 제공합니다.", ["Popover", "Tree"]) },
    { name: "Form", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "formRecipe", behavior: "form", ...evidenceNeeded("Web·Native form session renderer와 canonical Storybook 증거가 연결됐습니다. 실제 제출·서버 오류 흐름이 더 쌓이면 stable을 검토합니다.") },
    { name: "Agreement", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "agreementRecipe", behavior: "agreement", ...evidenceNeeded("전체 동의는 항목의 합에서 파생하고 필수 항목만 제출 가능 여부를 정합니다. 전문 열기는 동의와 분리된 별도 tab stop입니다. 제품 채택·법적 문구 검토는 제품 소유입니다.") },
    { name: "Mentions", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "comboboxRecipe", behavior: "combobox", ...evidenceNeeded("TextArea에 Combobox 목록 계약을 얹어 trigger 탐색·삽입 범위를 제공합니다. Native는 캐럿을 onSelectionChange로만 알 수 있어 그 값을 따로 추적합니다. 실제 IME·제품 채택 증거는 남아 있습니다.") },
    { name: "Rating", category: "input", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Rate"], ...composed("정수/반점 Slider 입력·저장과 Statistic 평균 표시의 Web/RN 예제를 제공합니다. docs/rating.md.", ["Slider", "Statistic"]) },
    { name: "TransferList", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["Transfer"], recipe: "transferListRecipe", behavior: "transferList", ...evidenceNeeded("Web 양쪽 패널 이동을 키보드만으로 끝낼 수 있고 이동 후 초점이 미끄러져 들어온 행에 남습니다. Native는 두 칸을 나란히 놓을 폭이 없어 세로로 쌓습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "TreeSelect", category: "input", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...composed("새 primitive가 아니라 Popover 표면·Tree collection·tri-state 판정 모듈의 조합입니다. 작동 예제는 Patterns/Tree의 TreeSelect 화면입니다. docs/tree-select.md.", ["Popover", "Tree"]) },
    { name: "UploadItem", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "uploadItemRecipe", behavior: "uploadItem", ...evidenceNeeded("Web·Native renderer가 동일한 진행·성공·오류·cancel/retry 계약을 실행합니다. 실제 전송 lifecycle 증거가 더 필요합니다.") },
    { name: "Tabs", category: "navigation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "tabsRecipe", behavior: "tabs" },
    { name: "TopBar", category: "navigation", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "topBarRecipe", ...evidenceNeeded("같은 leading/title/trailing 구조와 recipe를 Web/RN에서 제공합니다. Web heading/link와 Native 접근성 의미를 따로 검증합니다. docs/screen-chrome.md 참고.") },
    { name: "Sidebar", category: "navigation", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), aliases: ["NavigationRail", "SideNav"], recipe: "sidebarRecipe", behavior: "sidebar", ...evidenceNeeded("그룹이 있는 데스크톱 세로 내비게이션입니다. 접으면 라벨만 숨고 항목과 접근성 이름은 남습니다. 3~5개 모바일 목적지는 BottomNavigation이 그대로 갖습니다.") },
    { name: "BottomNavigation", category: "navigation", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "bottomNavigationRecipe", behavior: "bottomNavigation", ...evidenceNeeded("Web link landmark와 Native controlled-navigation renderer가 공통 route intent를 소비합니다. 실제 브라우저·기기 릴리스 증거가 쌓이면 stable을 검토합니다.") },
    { name: "Breadcrumb", category: "navigation", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "breadcrumbRecipe", behavior: "breadcrumb", ...evidenceNeeded("Web 링크·현재 위치·RTL·큰 글자와 보관함 경로 예제를 제공합니다. 제품 채택·보조기기 검증은 아직입니다.") },
    { name: "Pagination", category: "navigation", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "paginationRecipe", behavior: "pagination", ...evidenceNeeded("Web 페이지 이동·경계 focus 유지와 실제 목록 교체 예제를 제공합니다. 제품 채택 증거가 더 필요합니다.") },
    { name: "LoadMore", category: "navigation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "loadMoreRecipe", behavior: "loadMore", ...evidenceNeeded("Web observer와 Native FlatList onEndReached adapter가 같은 requestKey gate를 소비합니다. 실제 장시간 목록·보조기기 릴리스 증거가 쌓이면 stable을 검토합니다.") },
    { name: "Steps", category: "navigation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "stepsRecipe", ...evidenceNeeded("단일 cursor에서 상태를 파생하는 Web·Native renderer와 기본 실행 증거가 연결됐습니다. 실제 다단계 흐름과 보조기기 증거가 더 필요합니다.") },
    { name: "Menubar", category: "navigation", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "menubarRecipe", behavior: "menubar", ...evidenceNeeded("데스크톱 가로 메뉴 막대입니다. 열린 상태에서 좌우로 메뉴를 넘기는 단일 키보드 단위라 Menu 여러 개로 대체되지 않습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "ContextMenu", category: "navigation", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "menuRecipe", behavior: "contextMenu", ...evidenceNeeded("포인터 좌표에서 열리는 메뉴입니다. 키보드로도 열 수 있어야 하고 그때는 초점 요소 상자를 앵커로 씁니다. 항목 어휘는 Menu 그대로입니다.") },
    { name: "Menu", category: "navigation", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "menuRecipe", behavior: "menu", aliases: ["Dropdown"] },
    { name: "Anchor", category: "navigation", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "anchorRecipe", behavior: "anchor", ...evidenceNeeded("문서·별도 스크롤 영역의 목차 동기화, 제목 focus와 fragment 복구를 구현했습니다. 제품 문서 채택과 보조기기 증거가 더 필요합니다.") },
    { name: "Avatar", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "avatarRecipe" },
    { name: "Asset", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["Media", "Artwork"], recipe: "assetRecipe", behavior: "asset", ...evidenceNeeded("아이콘·이미지·Lottie·비디오를 한 액자 규칙으로 묶습니다. 재생기는 슬롯으로 받아 이 패키지가 의존하지 않습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "Chart", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["BarChart", "Dataviz"], ...declined("그리는 일은 제품 라이브러리가 이미 더 잘하고, 실제로 어긋난 것은 색이었다. 계열 팔레트·축·격자·범례 토큰(dataviz)만 고정하고 렌더러는 만들지 않는다. docs/chart.md") },
    { name: "Badge", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "badgeRecipe" },
    { name: "CounterBadge", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "counterBadgeRecipe" },
    { name: "Card", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "cardRecipe" },
    { name: "List", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "listRecipe" },
    { name: "ListRow", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "listRowRecipe" },
    { name: "VirtualList", category: "data-display", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Listy"], ...evidenceNeeded("가상화는 renderer 최적화라 공개 semantic이 필요한 실측 사례를 기다립니다.") },
    { name: "Collapsible", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["Disclosure"], recipe: "collapsibleRecipe", behavior: "collapsible", ...evidenceNeeded("이웃이 없는 단일 disclosure입니다. 여러 항목이 서로를 아는 경우는 Accordion이 그대로 갖습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "Accordion", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "accordionRecipe", behavior: "disclosureGroup" },
    { name: "Statistic", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "statisticRecipe" },
    { name: "Timeline", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "timelineRecipe", ...evidenceNeeded("두 제품의 이력 UI가 공통 descriptor와 Web/RN dot·connector renderer를 소비합니다. 실제 릴리스·보조기기 증거가 쌓이면 stable을 검토합니다.") },
    { name: "DataTable", category: "data-display", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "dataTableRecipe", behavior: "dataTable", ...evidenceNeeded("Web 정렬 버튼·tri-state 선택·async 상태를 제공합니다. 값 정렬과 페이지네이션은 제품 소유이며, 단순 표시는 기존 Table이 그대로 담당합니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "Tree", category: "data-display", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "treeRecipe", behavior: "tree", ...evidenceNeeded("Web 계층 탐색과 깊이·형제 위치 발표, 보이는 노드만의 이동·타이핑 검색, 노드 자체에 실리는 tri-state 체크를 제공합니다. 제품 채택·보조기기 증거는 남아 있습니다.") },
    { name: "Calendar", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "calendarRecipe", behavior: "calendar", ...evidenceNeeded("Web/RN Calendar와 DatePicker가 동일한 격자를 사용합니다. 제품 소유 월 계산·경계 focus, disabled 활성화 방지와 큰 글자 검증은 docs/calendar.md에서 추적합니다.") },
    { name: "Carousel", category: "data-display", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "carouselRecipe", behavior: "carousel", ...evidenceNeeded("Web 키보드·숨긴 카드 격리와 Native swipe·adjustable 조작을 제공합니다. 유한 이동과 명시적 자동재생 정지 계약은 docs/carousel.md에서 추적합니다.") },
    { name: "DescriptionList", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "descriptionListRecipe", aliases: ["Descriptions"], ...evidenceNeeded("Web/RN renderer가 공통 descriptor와 responsive column resolver를 소비하고 기본 실행 증거를 제공합니다. 200% text product·기기 증거가 쌓이면 stable을 검토합니다.") },
    { name: "Image", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "imageRecipe", ...evidenceNeeded("Web load/error/fallback·framework adapter와 Native fallback·optimized-host adapter가 기본 실행 증거를 제공합니다. 실제 network asset·보조기기 증거가 쌓이면 stable을 검토합니다.") },
    { name: "QRCode", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), ...evidenceNeeded("스캔 가능한 코드 생성 요구가 실제 제품에서 확인되면 전용 계약을 엽니다.") },
    { name: "Tag", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "tagRecipe" },
    { name: "Tour", category: "overlay", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "tourRecipe", behavior: "tour", aliases: ["CoachMark"], ...evidenceNeeded("Web 단계 카드가 제품 소유 anchor를 가리키고 단계마다 초점과 안내 문구를 옮깁니다. 바깥 pointer로는 끝나지 않으며 Escape·건너뛰기·중단 사유를 구분합니다. 제품 채택·보조기기 증거는 남아 있습니다.") },
    { name: "EmptyState", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "emptyStateRecipe" },
    { name: "Notice", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "noticeRecipe" },
    { name: "Progress", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "progressRecipe" },
    { name: "Spinner", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "spinnerRecipe" },
    { name: "Skeleton", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "skeletonRecipe" },
    { name: "Result", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "resultRecipe", ...evidenceNeeded("두 제품의 terminal flow UI가 공통 descriptor와 Web/RN renderer를 소비합니다. 실제 릴리스·보조기기 증거가 쌓이면 stable을 검토합니다.") },
    { name: "BottomInfo", category: "feedback", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "bottomInfoRecipe", behavior: "bottomInfo", ...evidenceNeeded("주 행동 아래의 상시 안내 문장입니다. 상태를 알리는 Notice와 달리 tone·아이콘이 없고 사라지지 않습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "Toast", category: "feedback", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "toastRecipe", behavior: "toast", aliases: ["Notification"] },
    { name: "Watermark", category: "feedback", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("화면 위 반복 표식이 필요한 제품 요구가 확인되면 의미·인쇄·접근성 경계를 엽니다.") },
    { name: "Dialog", category: "overlay", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "dialogRecipe", behavior: "dialog" },
    { name: "AlertDialog", category: "overlay", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "alertDialogRecipe", behavior: "alertDialog" },
    { name: "Sheet", category: "overlay", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "sheetRecipe", behavior: "sheet" },
    { name: "SidePanel", category: "overlay", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "sidePanelRecipe", behavior: "sidePanel", ...evidenceNeeded("Web 모달/비모달 도킹 패널을 제공합니다. 모달만 초점을 가두고 스크롤을 잠그며 비모달은 페이지를 살려 둡니다. 논리 edge·크기·dismiss 사유는 docs/side-panel.md에서 추적하고 제품 채택·보조기기 증거는 남아 있습니다.") },
    { name: "Popover", category: "overlay", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "popoverRecipe", behavior: "popover", ...evidenceNeeded("Web contextual form과 중첩 portal·focus·dismiss·큰 글자 검증을 제공합니다. 제품 채택과 보조기기 증거는 남아 있습니다.") },
    { name: "ConfirmPopover", category: "overlay", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), aliases: ["Popconfirm"], ...composed("되돌릴 수 있는 보관은 Popover의 확인/취소 조합으로 제공합니다. 파괴적 동작은 AlertDialog를 사용합니다.", ["Popover", "AlertDialog"]) },
    { name: "Tooltip", category: "overlay", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "tooltipRecipe", behavior: "tooltip" },
    { name: "CommandPalette", category: "overlay", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "commandPaletteRecipe", behavior: "commandPalette", ...evidenceNeeded("Web 모달 검색 표면과 결과 실행·초점 복귀를 제공합니다. 전역 단축키는 제품 소유로 남습니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "Affix", category: "utility", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("임의 콘텐츠의 scroll threshold 고정 요구가 확인되면 Web 전용 계약을 엽니다.") },
    { name: "AppProvider", category: "provider", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["App"], ...declined("message·notification·modal 세 표면이 이미 Toast·Dialog·AlertDialog에 있고, 남는 것은 Context 배선뿐이라 값 계약이 없다") },
    { name: "BorderBeam", category: "utility", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...declined("장식으로 브랜드를 증명하지 않는다는 정체성과 충돌하고, reduced motion에서 남는 것이 없으며, 없어도 화면의 뜻이 같다") },
    { name: "DesignSystemProvider", category: "provider", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["ConfigProvider"], nonVisualEvidence: "provider-adapter", ...evidenceNeeded("두 실제 제품의 Web/RN Context adapter가 environment+palette와 parent axis 상속을 소비합니다. 추가 제품 릴리스 증거가 쌓이면 stable을 검토합니다.") },
    { name: "Utility", category: "utility", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), aliases: ["Util"], ...declined("antd Util은 theme.useToken()으로 토큰을 읽는 법을 설명하는 문서 페이지다. 이 패키지는 토큰을 정적 export로 주므로 그 문제가 발생하지 않는다") },
    { name: "SkipNav", category: "utility", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), aliases: ["SkipLink"], recipe: "skipNavRecipe", behavior: "skipNav", ...evidenceNeeded("WCAG 2.4.1의 건너뛰기 링크입니다. 숨어 있다가 포커스를 받으면 반드시 보이고 활성화하면 본문으로 초점을 옮깁니다. 제품 채택 증거는 남아 있습니다.") },
    { name: "VisuallyHidden", category: "utility", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "visuallyHiddenRecipe", aliases: ["ScreenReaderOnly", "SrOnly"], ...evidenceNeeded("Chakra와 React Aria가 별도 접근성 primitive로 제공하는 문제를 Web에서 채택했습니다. Native는 중복 invisible node 대신 host accessibilityLabel/accessibilityHint를 사용하므로 의도적으로 지원하지 않습니다.") },
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
import { accordionRecipe, alertDialogRecipe, avatarRecipe, badgeRecipe, bottomNavigationRecipe, bottomCtaRecipe, anchorRecipe, agreementRecipe, topRecipe, authProviderButtonRecipe, authScreenRecipe, headingRecipe, toggleGroupRecipe, tagsInputRecipe, skipNavRecipe, bottomInfoRecipe, sidebarRecipe, textFormatRecipe, collapsibleRecipe, menubarRecipe, assetRecipe, breadcrumbRecipe, aspectRatioRecipe, containerRecipe, calendarRecipe, cardRecipe, buttonRecipe, carouselRecipe, chipRecipe, comboboxRecipe, descriptionListRecipe, counterBadgeRecipe, dialogRecipe, dataTableRecipe, datePickerRecipe, dividerRecipe, formRecipe, emptyStateRecipe, fieldRecipe, filePickerRecipe, iconButtonRecipe, iconRecipe, imageRecipe, linkRecipe, listRecipe, listRowRecipe, loadMoreRecipe, menuRecipe, noticeRecipe, paginationRecipe, popoverRecipe, numberFieldRecipe, progressRecipe, resultRecipe, searchFieldRecipe, selectRecipe, selectionGroupRecipe, sectionRecipe, segmentedControlRecipe, selectionControlRecipe, sheetRecipe, sidePanelRecipe, commandPaletteRecipe, layoutRecipe, otpFieldRecipe, passwordFieldRecipe, splitterRecipe, tourRecipe, transferListRecipe, skeletonRecipe, sliderRecipe, spinnerRecipe, stackRecipe, statisticRecipe, stepsRecipe, surfaceRecipe, switchRecipe, tabsRecipe, tagRecipe, textRecipe, timelineRecipe, toastRecipe, tooltipRecipe, topBarRecipe, treeRecipe, uploadItemRecipe, visuallyHiddenRecipe, } from "./recipes.js";
import { floatingActionButtonRecipe } from "./floating-action-button.js";
import { gridRecipe } from "./grid.js";
/** One typed registry prevents catalog recipe names from drifting into strings. */
export const recipeRegistry = {
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
};
//# sourceMappingURL=catalog.js.map