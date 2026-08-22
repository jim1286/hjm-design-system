const contractReady = (summary) => ({
    roadmap: { state: "contract-ready", summary },
});
const composed = (summary, targets) => ({
    roadmap: { state: "composed", summary, targets },
});
const evidenceNeeded = (summary) => ({
    roadmap: { state: "evidence-needed", summary },
});
const prerequisite = (summary, targets) => ({
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
    { name: "Icon", category: "foundation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "iconRecipe" },
    { name: "Surface", category: "layout", platform: "shared", status: "stable", ...surfaceMaturity("beta", "beta"), recipe: "surfaceRecipe" },
    { name: "Divider", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "dividerRecipe" },
    { name: "Section", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "sectionRecipe" },
    { name: "Stack", category: "layout", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "stackRecipe", aliases: ["Flex", "Space", "Inline"] },
    { name: "Grid", category: "layout", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "gridRecipe", ...evidenceNeeded("공통 window class·responsive value·row-major geometry 계약과 공식 Web/RN default renderer 증거가 연결됐습니다. 안정화에는 환경별·제품 사용 증거가 더 필요합니다.") },
    { name: "Layout", category: "layout", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["AppShell"], recipe: "layoutRecipe", behavior: "layout", ...evidenceNeeded("랜드마크·skip link·adaptive sidebar를 함께 쓰는 실제 product shell 증거를 기다립니다.") },
    { name: "Masonry", category: "layout", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...evidenceNeeded("실제 waterfall 피드가 생기면 측정·패킹의 renderer 경계를 검증합니다.") },
    { name: "Splitter", category: "layout", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), aliases: ["SplitPane"], recipe: "splitterRecipe", behavior: "splitter", ...contractReady("분할 크기·키보드 조절 계약은 준비됐고 Web vertical slice를 기다립니다.") },
    { name: "Button", category: "action", platform: "shared", status: "stable", ...surfaceMaturity("beta", "beta"), recipe: "buttonRecipe" },
    { name: "IconButton", category: "action", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "iconButtonRecipe" },
    { name: "Link", category: "action", platform: "adaptive", status: "beta", ...surfaceMaturity("planned", "planned"), recipe: "linkRecipe", behavior: "link" },
    { name: "BottomCTA", category: "action", platform: "native", status: "beta", ...surfaceMaturity("unsupported", "beta"), recipe: "bottomCtaRecipe" },
    { name: "FloatingActionButton", category: "action", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "floatingActionButtonRecipe", behavior: "floatingActionButton", aliases: ["FloatButton", "FAB"], ...contractReady("배치·확장 action·안전 영역 계약은 준비됐고 제품 적용을 기다립니다.") },
    { name: "Field", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("beta", "beta"), recipe: "fieldRecipe", behavior: "field" },
    { name: "SearchField", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "searchFieldRecipe", behavior: "searchField" },
    { name: "TextArea", category: "input", platform: "shared", status: "stable", ...surfaceMaturity("beta", "beta"), recipe: "fieldRecipe" },
    { name: "PasswordField", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Input.Password"], recipe: "passwordFieldRecipe", behavior: "passwordField", ...contractReady("표시 전환·자동완성·selection 보존 계약은 준비됐고 인증 화면을 기다립니다.") },
    { name: "OtpField", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Input.OTP"], recipe: "otpFieldRecipe", behavior: "otpField", ...contractReady("자리 이동·붙여넣기·오류 계약은 준비됐고 인증번호 화면을 기다립니다.") },
    { name: "Checkbox", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "planned"), recipe: "selectionControlRecipe", behavior: "checkbox" },
    { name: "Radio", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "planned"), recipe: "selectionControlRecipe" },
    { name: "CheckboxGroup", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "planned"), recipe: "selectionGroupRecipe", behavior: "checkboxGroup" },
    { name: "RadioGroup", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "selectionGroupRecipe", behavior: "radioGroup" },
    { name: "Switch", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "switchRecipe", behavior: "switch" },
    { name: "Chip", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "chipRecipe", behavior: "chip" },
    { name: "SegmentedControl", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "segmentedControlRecipe", behavior: "segmentedControl" },
    { name: "Slider", category: "input", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "sliderRecipe", behavior: "slider", ...contractReady("범위·step·키보드/조정 action 계약은 준비됐고 제품 입력 흐름을 기다립니다.") },
    { name: "NumberField", category: "input", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "numberFieldRecipe", behavior: "numberField", ...contractReady("숫자 파싱·clamp·증감 계약은 준비됐고 제품 입력 흐름을 기다립니다.") },
    { name: "Select", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "planned"), recipe: "selectRecipe", behavior: "select" },
    { name: "Combobox", category: "input", platform: "adaptive", status: "beta", ...surfaceMaturity("planned", "planned"), recipe: "comboboxRecipe", behavior: "combobox" },
    { name: "DatePicker", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "datePickerRecipe", behavior: "datePicker", ...contractReady("달력 선택·범위 제한·포커스 월 계약은 준비됐고 제품 날짜 선택 흐름을 기다립니다.") },
    { name: "TimePicker", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...composed("시 Select와 분 Select 조합으로 같은 문제를 완결합니다.", ["Select"]) },
    { name: "ColorPicker", category: "input", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("임의 색 선택이 실제 제품 요구로 확인될 때 색공간·키보드 계약을 엽니다.") },
    { name: "FilePicker", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "filePickerRecipe", behavior: "filePicker", aliases: ["Upload"], ...contractReady("파일 선택 intent·제약·취소 계약은 준비됐고 실제 업로드 흐름을 기다립니다.") },
    { name: "Cascader", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), ...prerequisite("TreeSelect에 path value와 중간 단계 commit 축을 먼저 추가해야 흡수할 수 있습니다.", ["TreeSelect"]) },
    { name: "Form", category: "input", platform: "shared", status: "beta", ...surfaceMaturity("planned", "planned"), recipe: "formRecipe", behavior: "form", ...evidenceNeeded("Web 2필드 생성 폼은 계약을 소비하지만 canonical product story가 없어 Web renderer는 planned입니다. Web story와 Native 제품 renderer 증거가 쌓이면 surface 승격을 검토합니다.") },
    { name: "Mentions", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "comboboxRecipe", behavior: "combobox", ...contractReady("trigger 탐색·삽입 범위 계약은 준비됐고 메시지 작성 화면을 기다립니다.") },
    { name: "Rating", category: "input", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Rate"], ...composed("입력은 Slider, 읽기 전용 표시는 Statistic 조합으로 해결합니다.", ["Slider", "Statistic"]) },
    { name: "TransferList", category: "input", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Transfer"], recipe: "transferListRecipe", behavior: "transferList", ...contractReady("양쪽 collection·이동·선택 보존 계약은 준비됐고 제품 흐름을 기다립니다.") },
    { name: "TreeSelect", category: "input", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...contractReady("Select·Tree·Checkbox 계약을 합성한 tri-state selection 로직이 준비됐습니다.") },
    { name: "UploadItem", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "uploadItemRecipe", behavior: "uploadItem", ...contractReady("진행·성공·오류·취소 표시 계약은 준비됐고 업로드 renderer를 기다립니다.") },
    { name: "Tabs", category: "navigation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "tabsRecipe", behavior: "tabs" },
    { name: "TopBar", category: "navigation", platform: "native", status: "beta", ...surfaceMaturity("unsupported", "beta"), recipe: "topBarRecipe" },
    { name: "BottomNavigation", category: "navigation", platform: "adaptive", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "bottomNavigationRecipe", behavior: "bottomNavigation" },
    { name: "Breadcrumb", category: "navigation", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "breadcrumbRecipe", behavior: "breadcrumb", ...contractReady("현재 위치·축약·링크 의미 계약은 준비됐고 Web 계층 탐색을 기다립니다.") },
    { name: "Pagination", category: "navigation", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "paginationRecipe", behavior: "pagination", ...contractReady("페이지 범위·현재 페이지·키보드 계약은 준비됐고 페이지 탐색 화면을 기다립니다.") },
    { name: "LoadMore", category: "navigation", platform: "shared", status: "beta", ...surfaceMaturity("beta", "planned"), recipe: "loadMoreRecipe", behavior: "loadMore" },
    { name: "Steps", category: "navigation", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "stepsRecipe", ...contractReady("현재·완료·예정 단계의 시각/접근성 계약은 준비됐고 다단계 흐름을 기다립니다.") },
    { name: "Menu", category: "navigation", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "planned"), recipe: "menuRecipe", behavior: "menu", aliases: ["Dropdown"] },
    { name: "Anchor", category: "navigation", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("긴 문서 목차와 scroll spy가 실제 제품에 생기면 Web 계약을 엽니다.") },
    { name: "Avatar", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("planned", "planned"), recipe: "avatarRecipe" },
    { name: "Badge", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "badgeRecipe" },
    { name: "CounterBadge", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "counterBadgeRecipe" },
    { name: "Card", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "cardRecipe" },
    { name: "List", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "listRecipe" },
    { name: "ListRow", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "listRowRecipe" },
    { name: "VirtualList", category: "data-display", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["Listy"], ...evidenceNeeded("가상화는 renderer 최적화라 공개 semantic이 필요한 실측 사례를 기다립니다.") },
    { name: "Accordion", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "accordionRecipe", behavior: "disclosureGroup" },
    { name: "Statistic", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "statisticRecipe" },
    { name: "Timeline", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "timelineRecipe", ...evidenceNeeded("현재 play log는 ListRow를 사용하므로 dot/connector Timeline vertical slice를 기다립니다.") },
    { name: "DataTable", category: "data-display", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "dataTableRecipe", behavior: "dataTable", ...contractReady("정렬·선택·grid semantics 계약은 준비됐고 상호작용 표를 기다립니다.") },
    { name: "Tree", category: "data-display", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "treeRecipe", behavior: "tree", ...contractReady("계층 flatten·확장·키보드 계약은 준비됐고 Web tree 화면을 기다립니다.") },
    { name: "Calendar", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "calendarRecipe", behavior: "calendar", ...contractReady("월 격자·날짜 의미·경계 계약은 준비됐고 실제 달력 화면을 기다립니다.") },
    { name: "Carousel", category: "data-display", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "carouselRecipe", behavior: "carousel", ...contractReady("현재 slide·이전/다음·접근성 action 계약은 준비됐고 제품 renderer 보완을 기다립니다.") },
    { name: "DescriptionList", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "descriptionListRecipe", aliases: ["Descriptions"], ...evidenceNeeded("responsive 1/2-column label-value grid와 200% text product evidence를 기다립니다.") },
    { name: "Image", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "imageRecipe", ...evidenceNeeded("실제 network asset의 load/error/fallback/accessibility evidence를 기다립니다.") },
    { name: "QRCode", category: "data-display", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), ...evidenceNeeded("스캔 가능한 코드 생성 요구가 실제 제품에서 확인되면 전용 계약을 엽니다.") },
    { name: "Tag", category: "data-display", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "tagRecipe" },
    { name: "Tour", category: "overlay", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "tourRecipe", behavior: "tour", aliases: ["CoachMark"], ...contractReady("단계·초점 복귀·건너뛰기 계약은 준비됐고 onboarding tour를 기다립니다.") },
    { name: "EmptyState", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "emptyStateRecipe" },
    { name: "Notice", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "noticeRecipe" },
    { name: "Progress", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "progressRecipe" },
    { name: "Spinner", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("planned", "planned"), recipe: "spinnerRecipe" },
    { name: "Skeleton", category: "feedback", platform: "shared", status: "beta", ...surfaceMaturity("planned", "beta"), recipe: "skeletonRecipe" },
    { name: "Result", category: "feedback", platform: "shared", status: "planned", ...surfaceMaturity("planned", "planned"), recipe: "resultRecipe", ...evidenceNeeded("데이터 load state가 아닌 사용자 행동 뒤 flow terminus product evidence를 기다립니다.") },
    { name: "Toast", category: "feedback", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "toastRecipe", behavior: "toast", aliases: ["Notification"] },
    { name: "Watermark", category: "feedback", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("화면 위 반복 표식이 필요한 제품 요구가 확인되면 의미·인쇄·접근성 경계를 엽니다.") },
    { name: "Dialog", category: "overlay", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "dialogRecipe", behavior: "dialog" },
    { name: "AlertDialog", category: "overlay", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "alertDialogRecipe", behavior: "alertDialog" },
    { name: "Sheet", category: "overlay", platform: "adaptive", status: "beta", ...surfaceMaturity("beta", "beta"), recipe: "sheetRecipe", behavior: "sheet" },
    { name: "SidePanel", category: "overlay", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "sidePanelRecipe", behavior: "sidePanel", ...contractReady("비모달 보조 패널·폭·dismiss 계약은 준비됐고 데스크톱 화면을 기다립니다.") },
    { name: "Popover", category: "overlay", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "popoverRecipe", behavior: "popover", ...contractReady("비모달 contextual surface·초점·dismiss 계약은 준비됐고 제품 적용을 기다립니다.") },
    { name: "ConfirmPopover", category: "overlay", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), aliases: ["Popconfirm"], ...composed("Popover 표면과 AlertDialog 확인 session 조합으로 해결합니다.", ["Popover", "AlertDialog"]) },
    { name: "Tooltip", category: "overlay", platform: "web", status: "beta", ...surfaceMaturity("beta", "unsupported"), recipe: "tooltipRecipe", behavior: "tooltip" },
    { name: "CommandPalette", category: "overlay", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), recipe: "commandPaletteRecipe", behavior: "commandPalette", ...contractReady("검색·action commit·초점 복귀 계약은 준비됐고 power-user 화면을 기다립니다.") },
    { name: "Affix", category: "utility", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...evidenceNeeded("임의 콘텐츠의 scroll threshold 고정 요구가 확인되면 Web 전용 계약을 엽니다.") },
    { name: "AppProvider", category: "provider", platform: "adaptive", status: "planned", ...surfaceMaturity("planned", "planned"), aliases: ["App"], ...declined("message·notification·modal 세 표면이 이미 Toast·Dialog·AlertDialog에 있고, 남는 것은 Context 배선뿐이라 값 계약이 없다") },
    { name: "BorderBeam", category: "utility", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), ...declined("장식으로 브랜드를 증명하지 않는다는 정체성과 충돌하고, reduced motion에서 남는 것이 없으며, 없어도 화면의 뜻이 같다") },
    { name: "DesignSystemProvider", category: "provider", platform: "shared", status: "beta", ...surfaceMaturity("beta", "beta"), aliases: ["ConfigProvider"], nonVisualEvidence: "provider-adapter", ...evidenceNeeded("두 실제 제품의 Web/RN Context adapter가 environment+palette와 parent axis 상속을 소비합니다. 추가 제품 릴리스 증거가 쌓이면 stable을 검토합니다.") },
    { name: "Utility", category: "utility", platform: "web", status: "planned", ...surfaceMaturity("planned", "unsupported"), aliases: ["Util"], ...declined("antd Util은 theme.useToken()으로 토큰을 읽는 법을 설명하는 문서 페이지다. 이 패키지는 토큰을 정적 export로 주므로 그 문제가 발생하지 않는다") },
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
import { accordionRecipe, alertDialogRecipe, avatarRecipe, badgeRecipe, bottomNavigationRecipe, bottomCtaRecipe, breadcrumbRecipe, calendarRecipe, cardRecipe, buttonRecipe, carouselRecipe, chipRecipe, comboboxRecipe, descriptionListRecipe, counterBadgeRecipe, dialogRecipe, dataTableRecipe, datePickerRecipe, dividerRecipe, formRecipe, emptyStateRecipe, fieldRecipe, filePickerRecipe, iconButtonRecipe, iconRecipe, imageRecipe, linkRecipe, listRecipe, listRowRecipe, loadMoreRecipe, menuRecipe, noticeRecipe, paginationRecipe, popoverRecipe, numberFieldRecipe, progressRecipe, resultRecipe, searchFieldRecipe, selectRecipe, selectionGroupRecipe, sectionRecipe, segmentedControlRecipe, selectionControlRecipe, sheetRecipe, sidePanelRecipe, commandPaletteRecipe, layoutRecipe, otpFieldRecipe, passwordFieldRecipe, splitterRecipe, tourRecipe, transferListRecipe, skeletonRecipe, sliderRecipe, spinnerRecipe, stackRecipe, statisticRecipe, stepsRecipe, surfaceRecipe, switchRecipe, tabsRecipe, tagRecipe, textRecipe, timelineRecipe, toastRecipe, tooltipRecipe, topBarRecipe, treeRecipe, uploadItemRecipe, } from "./recipes.js";
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
    breadcrumbRecipe,
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
};
//# sourceMappingURL=catalog.js.map