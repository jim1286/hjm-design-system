import type { BehaviorName } from "./behaviors.js";
export type ComponentCategory = "foundation" | "layout" | "action" | "input" | "navigation" | "data-display" | "feedback" | "overlay" | "provider" | "utility";
export type ComponentPlatform = "shared" | "adaptive" | "web" | "native";
export type ComponentStatus = "stable" | "beta" | "planned" | "deprecated";
export type ComponentSurface = "web" | "native";
export type ComponentSurfaceStatus = ComponentStatus | "unsupported";
export type ComponentSurfaceMaturity = Readonly<Record<ComponentSurface, ComponentSurfaceStatus>>;
export type ComponentRoadmapState = "contract-ready" | "composed" | "evidence-needed" | "prerequisite" | "declined";
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
     * Stable kebab-case id. Defaults to the kebab form of `name` (`componentIdOf`). Set it only when a row
     * was renamed after its id shipped, so documentation keys and consumer catalog snapshots survive.
     */
    id?: string;
    /** Purpose-based Korean item name used by both Storybooks (docs/STORYBOOK_NAVIGATION.md §1.3). */
    label?: string;
    /** Public renderer symbols that are named regions or variants of this contract, not rows of their own. */
    companions?: readonly string[];
    /** Optional extensions that reuse this contract without inheriting its maturity (public-component-map.md). */
    extensions?: readonly string[];
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
export declare const contractReady: (summary: string) => {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
};
export declare const prerequisite: (summary: string, targets: readonly string[]) => {
    readonly roadmap: {
        readonly state: "prerequisite";
        readonly summary: string;
        readonly targets: readonly string[];
    };
};
/**
 * Resolves renderer maturity without conflating it with contract maturity.
 * The fallback preserves custom catalog entries authored before
 * `surfaceStatus`; every built-in entry uses the explicit matrix.
 */
export declare function getComponentSurfaceStatus(entry: ComponentCatalogEntry, surface: ComponentSurface): ComponentSurfaceStatus;
/**
 * The catalog is a scope and maturity contract, not an implementation claim.
 * `shared` means API/visual parity. `adaptive` means shared intent with native
 * platform behavior. Web/native entries are intentionally platform-specific.
 */
export declare const componentCatalog: readonly [{
    readonly recipe: "textRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Text";
    readonly label: "본문 글자";
    readonly companions: readonly ["StatusText"];
    readonly extensions: readonly ["GravityLetters"];
    readonly category: "foundation";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["Kbd", "Code", "Blockquote"];
    readonly recipe: "textFormatRecipe";
    readonly behavior: "textFormat";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "TextFormat";
    readonly label: "글자 서식";
    readonly category: "foundation";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "headingRecipe";
    readonly behavior: "heading";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Heading";
    readonly label: "제목";
    readonly category: "foundation";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "iconRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Icon";
    readonly label: "아이콘";
    readonly category: "foundation";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "surfaceRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Surface";
    readonly label: "배경 영역";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "dividerRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Divider";
    readonly label: "구분선";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "sectionRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Section";
    readonly label: "섹션";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "stackRecipe";
    readonly aliases: readonly ["Flex", "Space", "Inline"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Stack";
    readonly label: "가로·세로 배치";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "containerRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Container";
    readonly label: "컨테이너";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "aspectRatioRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "AspectRatio";
    readonly label: "화면 비율";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "gridRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Grid";
    readonly label: "격자";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly aliases: readonly ["AppShell"];
    readonly recipe: "layoutRecipe";
    readonly behavior: "layout";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Layout";
    readonly label: "화면 기본 구조";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "topRecipe";
    readonly behavior: "top";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Top";
    readonly label: "화면 제목과 설명";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "masonryRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Masonry";
    readonly label: "높이가 다른 카드 배치";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly aliases: readonly ["SplitPane"];
    readonly recipe: "splitterRecipe";
    readonly behavior: "splitter";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Splitter";
    readonly label: "분할 영역 조절";
    readonly category: "layout";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "buttonRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Button";
    readonly label: "버튼";
    readonly companions: readonly ["ClipboardButton", "ButtonLink"];
    readonly extensions: readonly ["ReactionPicker", "InlineConfirm"];
    readonly category: "action";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "iconButtonRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "IconButton";
    readonly label: "아이콘 버튼";
    readonly companions: readonly ["ClipboardIconButton"];
    readonly extensions: readonly ["NotificationBell"];
    readonly category: "action";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "linkRecipe";
    readonly behavior: "link";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Link";
    readonly label: "링크";
    readonly category: "action";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "bottomCtaRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "BottomCTA";
    readonly label: "하단 실행 버튼";
    readonly category: "action";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "floatingActionButtonRecipe";
    readonly behavior: "floatingActionButton";
    readonly aliases: readonly ["FloatButton", "FAB"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "FloatingActionButton";
    readonly label: "플로팅 실행 버튼";
    readonly category: "action";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly aliases: readonly ["SignInLayout"];
    readonly recipe: "authScreenRecipe";
    readonly behavior: "authScreen";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "AuthScreenLayout";
    readonly label: "로그인 화면";
    readonly id: "auth-screen";
    readonly companions: readonly ["AuthScreenHero", "AuthScreenFooter"];
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly aliases: readonly ["SocialLoginButton"];
    readonly recipe: "authProviderButtonRecipe";
    readonly behavior: "authProviderButton";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "AuthProviderButton";
    readonly label: "소셜 로그인 버튼";
    readonly category: "action";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "fieldRecipe";
    readonly behavior: "field";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Field";
    readonly label: "입력 필드";
    readonly companions: readonly ["TextField"];
    readonly extensions: readonly ["FieldGroup", "DateEntry", "GestureSheetInput"];
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "searchFieldRecipe";
    readonly behavior: "searchField";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "SearchField";
    readonly label: "검색 입력";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "fieldRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "TextArea";
    readonly label: "여러 줄 입력";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["Input.Password"];
    readonly recipe: "passwordFieldRecipe";
    readonly behavior: "passwordField";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "PasswordField";
    readonly label: "비밀번호 입력";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["Input.OTP"];
    readonly recipe: "otpFieldRecipe";
    readonly behavior: "otpField";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "OtpField";
    readonly label: "인증번호 입력";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "selectionControlRecipe";
    readonly behavior: "checkbox";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Checkbox";
    readonly label: "체크박스";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "selectionControlRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Radio";
    readonly label: "라디오 버튼";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "selectionGroupRecipe";
    readonly behavior: "checkboxGroup";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "CheckboxGroup";
    readonly label: "체크박스 그룹";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "selectionGroupRecipe";
    readonly behavior: "radioGroup";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "RadioGroup";
    readonly label: "라디오 버튼 그룹";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "switchRecipe";
    readonly behavior: "switch";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Switch";
    readonly label: "스위치";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "chipRecipe";
    readonly behavior: "chip";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Chip";
    readonly label: "선택 칩";
    readonly companions: readonly ["ShortcutRail"];
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "imageChoiceRecipe";
    readonly surfaceStatus: {
        readonly web: "beta";
        readonly native: "beta";
    };
    readonly name: "ImageChoiceGroup";
    readonly label: "이미지 선택";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
}, {
    readonly recipe: "segmentedControlRecipe";
    readonly behavior: "segmentedControl";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "SegmentedControl";
    readonly label: "버튼형 선택";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "toggleGroupRecipe";
    readonly behavior: "toggleGroup";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ToggleGroup";
    readonly label: "토글 그룹";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly aliases: readonly ["TagField", "ChipsInput"];
    readonly recipe: "tagsInputRecipe";
    readonly behavior: "tagsInput";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "TagsInput";
    readonly label: "태그 입력";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "sliderRecipe";
    readonly behavior: "slider";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Slider";
    readonly label: "슬라이더";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "numberFieldRecipe";
    readonly behavior: "numberField";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "NumberField";
    readonly label: "숫자 입력";
    readonly extensions: readonly ["DurationField"];
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "selectRecipe";
    readonly behavior: "select";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Select";
    readonly label: "목록에서 선택";
    readonly companions: readonly ["NativeSelect"];
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "comboboxRecipe";
    readonly behavior: "combobox";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Combobox";
    readonly label: "검색형 선택";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "timePickerRecipe";
    readonly behavior: "timePicker";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "TimePicker";
    readonly label: "시각 선택";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "datePickerRecipe";
    readonly behavior: "datePicker";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "DatePicker";
    readonly label: "날짜 선택";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["DateRange"];
    readonly recipe: "calendarRecipe";
    readonly behavior: "dateRange";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "DateRangePicker";
    readonly label: "기간 선택";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "colorPickerRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "ColorPicker";
    readonly label: "색상 선택기";
    readonly category: "input";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "filePickerRecipe";
    readonly behavior: "filePicker";
    readonly aliases: readonly ["Upload"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "FilePicker";
    readonly label: "파일 선택";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "formRecipe";
    readonly behavior: "form";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Form";
    readonly label: "입력 양식";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "agreementRecipe";
    readonly behavior: "agreement";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Agreement";
    readonly label: "약관 동의";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "comboboxRecipe";
    readonly behavior: "combobox";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Mentions";
    readonly label: "사용자 언급";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["Transfer"];
    readonly recipe: "transferListRecipe";
    readonly behavior: "transferList";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "TransferList";
    readonly label: "목록 간 항목 이동";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "uploadItemRecipe";
    readonly behavior: "uploadItem";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "UploadItem";
    readonly label: "업로드 항목";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "tabsRecipe";
    readonly behavior: "tabs";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Tabs";
    readonly label: "탭";
    readonly companions: readonly ["TabPanel"];
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "topBarRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "TopBar";
    readonly label: "상단 탐색 막대";
    readonly companions: readonly ["NavigationBar", "TopBarAction"];
    readonly category: "navigation";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["NavigationRail", "SideNav"];
    readonly recipe: "sidebarRecipe";
    readonly behavior: "sidebar";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Sidebar";
    readonly label: "사이드바";
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "bottomNavigationRecipe";
    readonly behavior: "bottomNavigation";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "BottomNavigation";
    readonly label: "하단 탐색";
    readonly companions: readonly ["BottomNavigationInsetProvider"];
    readonly category: "navigation";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "breadcrumbRecipe";
    readonly behavior: "breadcrumb";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Breadcrumb";
    readonly label: "이동 경로";
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "carouselRecipe";
    readonly surfaceStatus: {
        readonly web: "beta";
        readonly native: "beta";
    };
    readonly name: "PageIndicator";
    readonly label: "페이지 위치 표시";
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "beta";
}, {
    readonly recipe: "paginationRecipe";
    readonly behavior: "pagination";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "beta";
    };
    readonly name: "Pagination";
    readonly label: "페이지 이동";
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "loadMoreRecipe";
    readonly behavior: "loadMore";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "LoadMore";
    readonly label: "더 보기";
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "stepsRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Steps";
    readonly label: "단계 탐색";
    readonly extensions: readonly ["StepPlayer"];
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "menubarRecipe";
    readonly behavior: "menubar";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Menubar";
    readonly label: "메뉴 막대";
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "menuRecipe";
    readonly behavior: "contextMenu";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "ContextMenu";
    readonly label: "상황별 메뉴";
    readonly extensions: readonly ["NativeContextMenu"];
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "menuRecipe";
    readonly behavior: "menu";
    readonly aliases: readonly ["Dropdown"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Menu";
    readonly label: "메뉴";
    readonly extensions: readonly ["MorphingMenu"];
    readonly category: "navigation";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "anchorRecipe";
    readonly behavior: "anchor";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Anchor";
    readonly label: "문서 내 바로가기";
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "avatarRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Avatar";
    readonly label: "아바타";
    readonly companions: readonly ["AvatarGroup"];
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly aliases: readonly ["Media", "Artwork"];
    readonly recipe: "assetRecipe";
    readonly behavior: "asset";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Asset";
    readonly label: "이미지·영상 표시";
    readonly companions: readonly ["AssetGroup"];
    readonly extensions: readonly ["VoiceNote"];
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "badgeRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Badge";
    readonly label: "배지";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "counterBadgeRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "CounterBadge";
    readonly label: "숫자 배지";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "cardRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Card";
    readonly label: "카드";
    readonly companions: readonly ["QuoteCard"];
    readonly extensions: readonly ["DocumentResource"];
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "listRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "List";
    readonly label: "목록";
    readonly companions: readonly ["CollectionRail", "ListSeparator"];
    readonly extensions: readonly ["TaskList"];
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "listRowRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ListRow";
    readonly label: "목록 행";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["Listy"];
    readonly recipe: "virtualListRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "VirtualList";
    readonly label: "가상 목록";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["Disclosure"];
    readonly recipe: "collapsibleRecipe";
    readonly behavior: "collapsible";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Collapsible";
    readonly label: "접기와 펼치기";
    readonly companions: readonly ["CollapsibleMarker"];
    readonly extensions: readonly ["FolderPreview"];
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "accordionRecipe";
    readonly behavior: "disclosureGroup";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Accordion";
    readonly label: "아코디언";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "statisticRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Statistic";
    readonly label: "수치 표시";
    readonly companions: readonly ["StatisticGroup"];
    readonly extensions: readonly ["AnimatedStatistic"];
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "timelineRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Timeline";
    readonly label: "타임라인";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "dataTableRecipe";
    readonly behavior: "dataTable";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "beta";
    };
    readonly name: "DataTable";
    readonly label: "데이터 표";
    readonly companions: readonly ["Table", "LineScore", "MatrixTable", "ComparisonTable"];
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "chartRecipe";
    readonly behavior: "chart";
    readonly surfaceStatus: {
        readonly web: "beta";
        readonly native: "beta";
    };
    readonly name: "Chart";
    readonly label: "차트";
    readonly companions: readonly ["LineChart", "BarChart", "PieChart", "RadarChart", "ScatterChart", "Sparkline", "ChartLegend"];
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
}, {
    readonly recipe: "treeRecipe";
    readonly behavior: "tree";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Tree";
    readonly label: "트리 목록";
    readonly category: "data-display";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "calendarRecipe";
    readonly behavior: "calendar";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Calendar";
    readonly label: "달력";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "carouselRecipe";
    readonly behavior: "carousel";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Carousel";
    readonly label: "캐러셀";
    readonly extensions: readonly ["CarouselMotion"];
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "descriptionListRecipe";
    readonly aliases: readonly ["Descriptions"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "DescriptionList";
    readonly label: "설명 목록";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "imageRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Image";
    readonly label: "이미지";
    readonly extensions: readonly ["GridReveal", "ImageViewer"];
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "qrCodeRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "QRCode";
    readonly label: "큐알 코드";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "tagRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Tag";
    readonly label: "태그";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "tourRecipe";
    readonly behavior: "tour";
    readonly aliases: readonly ["CoachMark"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Tour";
    readonly label: "사용 안내 둘러보기";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "emptyStateRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "EmptyState";
    readonly label: "빈 상태";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "noticeRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Notice";
    readonly label: "안내 메시지";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "progressRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Progress";
    readonly label: "진행 표시";
    readonly extensions: readonly ["ScrollProgress"];
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "thinkingOrbRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ThinkingOrb";
    readonly label: "생각 중 표시";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "spinnerRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Spinner";
    readonly companions: readonly ["PendingContent"];
    readonly label: "로딩 표시";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "skeletonRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Skeleton";
    readonly label: "스켈레톤";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly recipe: "resultRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Result";
    readonly label: "결과 안내";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "bottomInfoRecipe";
    readonly behavior: "bottomInfo";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "BottomInfo";
    readonly label: "하단 안내";
    readonly category: "feedback";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "toastRecipe";
    readonly behavior: "toast";
    readonly aliases: readonly ["Notification"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Toast";
    readonly label: "토스트";
    readonly companions: readonly ["ToastProvider", "ToastRegion"];
    readonly category: "feedback";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "watermarkRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Watermark";
    readonly label: "워터마크";
    readonly category: "feedback";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "dialogRecipe";
    readonly behavior: "dialog";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Dialog";
    readonly label: "대화상자";
    readonly companions: readonly ["OverlayStackProvider", "ImmersiveOverlay"];
    readonly category: "overlay";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "alertDialogRecipe";
    readonly behavior: "alertDialog";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "AlertDialog";
    readonly label: "확인 대화상자";
    readonly category: "overlay";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "sheetRecipe";
    readonly behavior: "sheet";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "Sheet";
    readonly label: "시트";
    readonly extensions: readonly ["GestureSheet", "GestureSheetProvider", "SheetPanel"];
    readonly category: "overlay";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "sidePanelRecipe";
    readonly behavior: "sidePanel";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "SidePanel";
    readonly label: "측면 패널";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "popoverRecipe";
    readonly behavior: "popover";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Popover";
    readonly label: "팝오버";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "tooltipRecipe";
    readonly behavior: "tooltip";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Tooltip";
    readonly label: "툴팁";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "commandPaletteRecipe";
    readonly behavior: "commandPalette";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "CommandPalette";
    readonly label: "명령 검색";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "affixRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "Affix";
    readonly label: "고정 배치";
    readonly category: "utility";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["ConfigProvider"];
    readonly nonVisualEvidence: "provider-adapter";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "DesignSystemProvider";
    readonly label: "디자인 시스템 설정";
    readonly category: "provider";
    readonly platform: "shared";
    readonly status: "stable";
}, {
    readonly aliases: readonly ["SkipLink"];
    readonly recipe: "skipNavRecipe";
    readonly behavior: "skipNav";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "SkipNav";
    readonly label: "본문 바로가기";
    readonly category: "utility";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly recipe: "visuallyHiddenRecipe";
    readonly aliases: readonly ["ScreenReaderOnly", "SrOnly"];
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "unsupported";
    };
    readonly name: "VisuallyHidden";
    readonly label: "화면 읽기 도구용 글자";
    readonly category: "utility";
    readonly platform: "web";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ScreenLayout";
    readonly label: "화면 골격";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "CompositionLayout";
    readonly label: "구성 골격";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "SettingsScreen";
    readonly label: "설정 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "searchScreenRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "SearchScreen";
    readonly label: "검색 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "EditorScreen";
    readonly label: "편집 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "PermissionScreen";
    readonly label: "권한 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "OnboardingScreen";
    readonly label: "온보딩 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ModerationScreen";
    readonly label: "신고 화면";
    readonly companions: readonly ["ModerationForm"];
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ChatScreen";
    readonly label: "채팅 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "NotificationInboxScreen";
    readonly label: "알림함 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "commentThreadRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "CommentThreadScreen";
    readonly label: "댓글 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ListDetailScreen";
    readonly label: "목록 상세 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "MediaSelectionScreen";
    readonly label: "미디어 선택 화면";
    readonly companions: readonly ["MediaSelectionCell"];
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "screenPatternRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ProfileScreen";
    readonly label: "프로필 화면";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "chatMessageRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ChatMessage";
    readonly label: "채팅 말풍선";
    readonly companions: readonly ["MediaAlbumPageStatus"];
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "typingIndicatorRecipe";
    readonly surfaceStatus: {
        readonly web: "beta";
        readonly native: "beta";
    };
    readonly name: "TypingIndicator";
    readonly label: "입력 중 표시";
    readonly category: "feedback";
    readonly platform: "adaptive";
    readonly status: "beta";
}, {
    readonly recipe: "chatDateSeparatorRecipe";
    readonly surfaceStatus: {
        readonly web: "beta";
        readonly native: "beta";
    };
    readonly name: "ChatDateSeparator";
    readonly label: "대화 날짜 구분";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "beta";
}, {
    readonly recipe: "notificationRowRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "NotificationRow";
    readonly label: "알림 미리보기 행";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "listRowRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "NotificationItem";
    readonly label: "알림 목록 항목";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "commentThreadRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "CommentThreadRow";
    readonly label: "댓글 행";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "profileSummaryRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "ProfileSummary";
    readonly label: "프로필 요약";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "iconTileRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "IconTile";
    readonly label: "아이콘 타일";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "composerQuickInsertRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "MessageComposer";
    readonly label: "메시지 작성창";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "stable";
}, {
    readonly recipe: "sheetRecipe";
    readonly surfaceStatus: {
        readonly web: "stable";
        readonly native: "stable";
    };
    readonly name: "PhotoSourceSheet";
    readonly label: "사진 출처 시트";
    readonly category: "overlay";
    readonly platform: "adaptive";
    readonly status: "stable";
}];
export type ComponentName = (typeof componentCatalog)[number]["name"];
/**
 * Kebab id of a catalog row: the explicit `id` override, else the kebab form of `name`
 * (QRCode → qr-code, BottomCTA → bottom-cta). `component-definitions.ts` mirrors this at the type level.
 */
export declare function componentIdOf(entry: Pick<ComponentCatalogEntry, "name" | "id">): string;
export declare function summarizeComponentRoadmap(entries?: readonly ComponentCatalogEntry[]): Readonly<Record<ComponentRoadmapState, number>>;
/** One typed registry prevents catalog recipe names from drifting into strings. */
export declare const recipeRegistry: {
    readonly timePickerRecipe: {
        readonly rowHeight: 44;
        readonly visibleRows: 5;
        readonly gap: 12;
        readonly sectionGap: 16;
        readonly radius: "md";
        readonly readoutSize: 20;
        readonly readoutLineHeight: 28;
        readonly panelWidth: 304;
        readonly selectionStroke: 1;
        readonly defaults: {
            readonly presentation: "field";
            readonly selectionStyle: "list";
            readonly minuteStep: 1;
        };
    };
    readonly imageChoiceRecipe: {
        readonly tileSize: 72;
        readonly gap: 8;
        readonly radius: 12;
        readonly ringWidth: 2;
        readonly ringOffset: 2;
        readonly checkSize: 20;
        readonly itemLabelGap: 4;
        readonly itemLabelVariant: "caption";
        readonly itemLabelLines: 1;
        readonly itemLabelMaxLines: 2;
        readonly itemDescriptionVariant: "caption";
        readonly itemDescriptionTone: "muted";
        readonly itemDescriptionLines: 1;
        readonly virtualViewportInset: 4;
    };
    readonly affixRecipe: {
        readonly edge: "top";
        readonly offset: 0;
        readonly position: "sticky";
        readonly oversize: "flow";
    };
    readonly watermarkRecipe: {
        readonly tileWidth: 240;
        readonly tileHeight: 160;
        readonly rotate: -22;
        readonly opacity: 0.12;
        readonly foreground: "textSub";
    };
    readonly colorPickerRecipe: {
        readonly colorSpace: "srgb";
        readonly background: "bg";
        readonly border: "border";
        readonly minTargetSize: 44;
    };
    readonly thinkingOrbRecipe: {
        readonly defaults: {
            readonly state: "working";
            readonly size: 64;
            readonly speed: 1;
        };
        readonly sizes: readonly [20, 64];
        readonly motion: {
            readonly reducedMotion: "static";
            readonly staticTime: 0.6;
            readonly maxDeltaMs: 64;
        };
        readonly maxPixelRatio: 2;
    };
    readonly masonryRecipe: {
        readonly layout: "shortest-column";
        readonly readingOrder: "source";
        readonly maxColumns: 12;
        readonly minItemWidth: 160;
    };
    readonly virtualListRecipe: {
        readonly layout: "fixed-row-window";
        readonly overscan: 3;
        readonly readingOrder: "source";
    };
    readonly qrCodeRecipe: {
        readonly quietZone: 4;
        readonly minModuleSize: 2;
        readonly foreground: "#000000";
        readonly background: "#ffffff";
        readonly fallbackGap: 12;
    };
    readonly accordionRecipe: {
        readonly slots: readonly ["root", "item", "header", "trigger", "title", "indicator", "panel", "divider"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly allowsMultipleExpanded: false;
        };
        readonly density: {
            readonly compact: {
                readonly triggerMinHeight: 44;
                readonly paddingVertical: 8;
            };
            readonly comfortable: {
                readonly triggerMinHeight: 56;
                readonly paddingVertical: 12;
            };
        };
        readonly paddingHorizontal: 8;
        readonly gap: 12;
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "bodyLarge";
            readonly fontWeight: "500";
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly panel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly paddingBottom: 16;
            readonly paddingInlineStart: 8;
        };
        readonly divider: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly states: {
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly duration: 200;
            readonly easing: "enter";
            readonly reducedMotion: "opacity";
        };
    };
    readonly alertDialogRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "icon", "title", "description", "status", "error", "actions", "cancel", "confirm"];
        readonly defaults: {
            readonly tone: "attention";
            readonly size: "small";
        };
        readonly sizes: {
            readonly small: {
                readonly maxWidth: 320;
                readonly padding: 20;
            };
            readonly medium: {
                readonly maxWidth: 420;
                readonly padding: 24;
            };
            readonly large: {
                readonly maxWidth: 640;
                readonly padding: 24;
            };
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly gap: 16;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
        };
        readonly tones: {
            readonly attention: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly confirm: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly confirmContent: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
            readonly danger: {
                readonly icon: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly confirm: Readonly<{
                    source: "theme";
                    key: "dangerFill";
                    alpha?: number;
                }>;
                readonly confirmContent: Readonly<{
                    source: "theme";
                    key: "onDanger";
                    alpha?: number;
                }>;
            };
            readonly info: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly confirm: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly confirmContent: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly confirm: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly confirmContent: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
        };
        readonly icon: {
            readonly containerSize: 44;
            readonly glyph: "md";
            readonly radius: "full";
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "title";
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly actions: {
            readonly gap: 8;
            readonly stackedGap: 8;
            readonly stackedOrder: "confirm-first";
            readonly stackBelow: 600;
            readonly minButtonWidth: 96;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly avatarRecipe: {
        readonly slots: readonly ["root", "image", "fallback", "badge", "group"];
        readonly overlapRatio: 0.3;
        readonly defaults: {
            readonly size: "medium";
            readonly shape: "circle";
        };
        readonly sizes: {
            readonly small: 32;
            readonly medium: 40;
            readonly large: 48;
            readonly xlarge: 64;
        };
        readonly shapes: {
            readonly rounded: "md";
            readonly circle: "full";
        };
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly content: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly initialsWeight: "strong";
    };
    readonly badgeRecipe: {
        readonly slots: readonly ["root", "icon", "label", "trailing"];
        readonly defaults: {
            readonly tone: "neutral";
            readonly size: "medium";
            readonly variant: "filled";
        };
        readonly variants: {
            readonly filled: {
                readonly usesToneBackground: true;
                readonly borderFallback: null;
            };
            readonly outline: {
                readonly usesToneBackground: false;
                readonly borderFallback: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
        };
        readonly tones: {
            readonly neutral: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onStatusFill";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "neutralFill";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly strong: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onStatusFill";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "strongFill";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly brand: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly info: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onStatusFill";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accentFill";
                    key: "info";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onStatusFill";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accentFill";
                    key: "success";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly warning: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onStatusFill";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accentFill";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
            };
            readonly attention: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onStatusFill";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accentFill";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
            };
            readonly danger: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onDanger";
                    alpha?: number;
                }>;
                readonly outlineContent: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "dangerFill";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly minHeight: 20;
                readonly paddingHorizontal: 8;
                readonly gap: 4;
                readonly iconSize: 14;
                readonly textVariant: "caption";
            };
            readonly medium: {
                readonly minHeight: 24;
                readonly paddingHorizontal: 8;
                readonly gap: 4;
                readonly iconSize: 14;
                readonly textVariant: "caption";
            };
        };
        readonly radius: "sm";
        readonly borderWidth: 1;
        readonly fontWeight: "700";
    };
    readonly bottomNavigationRecipe: {
        readonly slots: readonly ["root", "surface", "list", "item", "indicator", "icon", "label", "badge"];
        readonly defaults: {
            readonly presentation: "bar";
            readonly distribution: "equal";
            readonly density: "regular";
        };
        readonly selectionTile: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly selectedContent: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly padding: 4;
            readonly gap: 4;
            readonly radius: "lg";
        };
        readonly raisedSurface: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly depth: 4;
            readonly selectedDepth: 3;
            readonly selectedDepthColor: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly prominentDestination: {
            readonly diameter: number;
            readonly icon: "lg";
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
        };
        readonly iconSizes: {
            readonly large: 44;
            readonly xlarge: 52;
        };
        readonly shapes: {
            readonly rounded: {
                readonly radius: "xl";
                readonly surfacePadding: 8;
            };
            readonly pill: {
                readonly radius: "full";
                readonly surfacePadding: 8;
            };
            readonly compact: {
                readonly radius: "lg";
                readonly surfacePadding: 4;
            };
            readonly square: {
                readonly radius: "sm";
                readonly surfacePadding: 4;
            };
        };
        readonly adaptive: {
            readonly web: "fixed-compact-viewport";
            readonly native: "navigator-tab-bar";
        };
        readonly presentations: {
            readonly capsule: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surface";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly borderEdges: readonly ["all"];
                readonly radius: "full";
                readonly shadow: {
                    readonly color: "#000000";
                    readonly opacity: 0.12;
                    readonly radius: 12;
                    readonly offsetY: 4;
                };
                readonly maxWidth: 480;
                readonly contentMaxWidth: null;
                readonly outerPaddingHorizontal: 16;
                readonly outerPaddingTop: 8;
            };
            readonly bar: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly borderEdges: readonly ["block-start"];
                readonly radius: null;
                readonly shadow: null;
                readonly maxWidth: null;
                readonly contentMaxWidth: 480;
                readonly outerPaddingHorizontal: 0;
                readonly outerPaddingTop: 0;
            };
            readonly floating: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly borderEdges: readonly ["all"];
                readonly radius: "xl";
                readonly shadow: {
                    readonly color: "#000000";
                    readonly opacity: 0.12;
                    readonly radius: 12;
                    readonly offsetY: 4;
                };
                readonly maxWidth: 384;
                readonly contentMaxWidth: null;
                readonly outerPaddingHorizontal: 16;
                readonly outerPaddingTop: 8;
            };
        };
        readonly distributions: {
            readonly equal: {
                readonly centerGap: 0;
                readonly requiresEvenItemCount: false;
            };
            readonly "center-gap": {
                readonly centerGap: number;
                readonly requiresEvenItemCount: true;
            };
        };
        readonly density: {
            readonly compact: {
                readonly itemMinWidth: 52;
                readonly itemMinHeight: 52;
                readonly padding: 4;
                readonly gap: 2;
                readonly icon: "sm";
                readonly label: "caption";
            };
            readonly regular: {
                readonly itemMinWidth: 56;
                readonly itemMinHeight: 64;
                readonly padding: 8;
                readonly gap: 4;
                readonly icon: "md";
                readonly label: "caption";
            };
        };
        readonly colors: {
            readonly idle: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly selectedIcon: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly selectedLabel: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly indicator: {
            readonly minWidth: 40;
            readonly minHeight: 28;
            readonly radius: "full";
            readonly visual: "none";
            readonly background: null;
            readonly border: null;
            readonly borderWidth: 0;
        };
        readonly icon: {
            readonly selectedEmphasis: {
                readonly minimumAdaptations: 1;
                readonly strokeWidth: {
                    readonly idle: 2;
                    readonly selected: 3;
                };
                readonly scale: {
                    readonly idle: 1;
                    readonly selected: 1.06;
                };
            };
            readonly liftEmphasis: {
                readonly translateY: number;
                readonly idleOpacity: 0.82;
            };
        };
        readonly label: {
            readonly fontWeight: "500";
            readonly selectedFontWeight: "600";
            readonly textAlign: "center";
            readonly wrap: true;
            readonly fixedLines: null;
        };
        readonly badge: {
            readonly size: "small";
            readonly variant: "floating";
            readonly anchor: {
                readonly blockStart: number;
                readonly inlineEnd: number;
            };
            readonly subtreeHiddenFromAccessibility: true;
        };
        readonly safeArea: {
            readonly mode: "additive";
            readonly minimumBottomPadding: 8;
        };
        readonly keyboard: {
            readonly defaultBehavior: "hide";
            readonly movesAboveKeyboard: false;
        };
        readonly largeText: {
            readonly allowFontScaling: true;
            readonly maxFontSizeMultiplier: 1.4;
            readonly fixedItemHeight: false;
            readonly labelWraps: true;
        };
        readonly direction: {
            readonly itemOrder: "logical";
            readonly badgeAnchor: "inline-end";
        };
        readonly states: {
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
            readonly selectedNonColorEvidence: {
                readonly target: "icon-and-label";
                readonly label: "font-weight";
                readonly icon: "emphasis";
            };
            readonly selectedFocusSeparation: {
                readonly selectedTarget: "icon-and-label";
                readonly focusTarget: "item";
                readonly minimumGap: 2;
            };
        };
        readonly transition: {
            readonly duration: 120;
            readonly easing: "standard";
            readonly reducedMotion: "instant";
        };
    };
    readonly bottomCtaRecipe: {
        readonly slots: readonly ["root", "description", "secondaryAction", "primaryAction"];
        readonly minHeight: 64;
        readonly paddingHorizontal: 16;
        readonly paddingTop: 12;
        readonly paddingBottom: 12;
        readonly gap: 12;
        readonly contentMaxWidth: number;
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.08;
            readonly radius: 8;
            readonly offsetY: -2;
            readonly elevation: 8;
        };
    };
    readonly anchorRecipe: {
        readonly slots: readonly ["root", "list", "link", "leading", "indicator"];
        readonly gap: 4;
        readonly link: {
            readonly padding: 8;
            readonly minHeight: 44;
            readonly gap: 8;
            readonly leadingSize: 20;
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly current: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
        };
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
    readonly agreementRecipe: {
        readonly slots: readonly ["root", "all", "list", "item", "label", "detail"];
        readonly all: {
            readonly minHeight: 44;
            readonly gap: 12;
            readonly paddingHorizontal: 16;
            readonly paddingVertical: 12;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly textVariant: "bodyLarge";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly item: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly itemLayout: {
            readonly labelBasis: "70%";
            readonly paddingHorizontal: 16;
        };
        readonly detail: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly minHeight: 44;
        };
        readonly required: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly gap: 8;
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly topRecipe: {
        readonly slots: readonly ["root", "eyebrow", "title", "description", "trailing"];
        readonly defaults: {
            readonly size: "large";
        };
        readonly sizes: {
            readonly medium: {
                readonly title: {
                    readonly fontSize: 20;
                    readonly lineHeight: 28;
                    readonly fontWeight: "500";
                };
                readonly paddingTop: 16;
                readonly paddingBottom: 12;
            };
            readonly large: {
                readonly title: {
                    readonly fontSize: 24;
                    readonly lineHeight: 32;
                    readonly fontWeight: "500";
                };
                readonly paddingTop: 24;
                readonly paddingBottom: 16;
            };
        };
        readonly eyebrow: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly marginBottom: 4;
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly marginTop: 8;
        };
        readonly trailing: {
            readonly gap: 8;
        };
        readonly gap: 8;
    };
    readonly authProviderButtonRecipe: {
        readonly slots: readonly ["root", "logo", "label", "spinner"];
        readonly minHeight: 44;
        readonly minTouchTarget: 44;
        readonly radius: 12;
        readonly paddingHorizontal: 16;
        readonly gap: 12;
        readonly logoSize: 20;
        readonly label: {
            readonly fontSize: 14;
            readonly lineHeight: 20;
            readonly fontWeight: "400";
        };
        readonly borderWidth: 1;
        readonly focusOutlineOffset: 2;
    };
    readonly authScreenRecipe: {
        readonly slots: readonly ["root", "hero", "mark", "eyebrow", "title", "description", "main", "footer", "notice", "links"];
        readonly defaults: {
            readonly density: "regular";
            readonly hasFooter: true;
        };
        readonly maxWidth: 416;
        readonly markSize: 72;
        readonly markRadius: 16;
        readonly title: {
            readonly fontSize: 24;
            readonly lineHeight: 32;
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly fontSize: 14;
            readonly lineHeight: 20;
            readonly fontWeight: "400";
        };
        readonly hero: {
            readonly eyebrow: {
                readonly textVariant: "label";
                readonly tone: "brand";
                readonly gapBelow: 4;
            };
            readonly title: {
                readonly tone: "primary";
            };
            readonly description: {
                readonly textVariant: "body";
                readonly tone: "muted";
                readonly gapAbove: 8;
            };
        };
        readonly footerMinTouchTarget: 44;
        readonly footerText: {
            readonly fontSize: 11;
            readonly lineHeight: 16;
            readonly fontWeight: "400";
        };
        readonly footer: {
            readonly notice: {
                readonly textVariant: "caption";
                readonly tone: "muted";
            };
            readonly noticeGap: 4;
            readonly link: {
                readonly textVariant: "caption";
                readonly tone: "brand";
                readonly underline: true;
            };
            readonly linkGap: 8;
            readonly separator: "·";
        };
        readonly providerMinHeight: 44;
        readonly mainCard: {
            readonly padding: 16;
            readonly radius: 16;
        };
        readonly densities: {
            readonly regular: {
                readonly heroGap: 16;
                readonly mainGap: 24;
                readonly footerGap: 24;
                readonly paddingInline: 20;
                readonly paddingBlock: 40;
                readonly titleVariant: "heading";
            };
            readonly compact: {
                readonly heroGap: 8;
                readonly mainGap: 16;
                readonly footerGap: 16;
                readonly paddingInline: 16;
                readonly paddingBlock: 20;
                readonly titleVariant: "titleLarge";
            };
        };
    };
    readonly headingRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly level: import("./foundations.js").HeadingLevel;
        };
        readonly levels: {
            readonly level1: {
                readonly fontSize: 24;
                readonly lineHeight: 32;
                readonly fontWeight: "500";
            };
            readonly level2: {
                readonly fontSize: 24;
                readonly lineHeight: 32;
                readonly fontWeight: "500";
            };
            readonly level3: {
                readonly fontSize: 24;
                readonly lineHeight: 32;
                readonly fontWeight: "500";
            };
            readonly level4: {
                readonly fontSize: 20;
                readonly lineHeight: 28;
                readonly fontWeight: "500";
            };
            readonly level5: {
                readonly fontSize: 18;
                readonly lineHeight: 26;
                readonly fontWeight: "500";
            };
        };
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly marginBottom: 8;
    };
    readonly toggleGroupRecipe: {
        readonly slots: readonly ["root", "item", "label"];
        readonly defaults: {
            readonly size: import("./toggle-group.js").ToggleGroupSize;
        };
        readonly sizes: {
            readonly small: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly textVariant: "label";
            };
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
            };
        };
        readonly radius: 12;
        readonly gap: 4;
        readonly idle: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
        };
        readonly pressed: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly tagsInputRecipe: {
        readonly slots: readonly ["root", "frame", "tag", "remove", "input"];
        readonly defaults: {
            readonly commitKeys: readonly import("./tags-input.js").TagsInputCommitKey[];
        };
        readonly frame: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly paddingVertical: 4;
            readonly gap: 8;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
        };
        readonly tag: {
            readonly minHeight: 28;
            readonly paddingHorizontal: 8;
            readonly gap: 4;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
        };
        readonly remove: {
            readonly minTouchTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly selectedTagOutline: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly skipNavRecipe: {
        readonly slots: readonly ["root"];
        readonly minHeight: 44;
        readonly paddingHorizontal: 16;
        readonly radius: 12;
        readonly background: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
        readonly offset: 12;
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly bottomInfoRecipe: {
        readonly slots: readonly ["root", "item"];
        readonly defaults: {
            readonly tone: import("./bottom-info.js").BottomInfoTone;
        };
        readonly tones: {
            readonly muted: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly emphasis: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
        readonly textVariant: "caption";
        readonly gap: 4;
        readonly paddingTop: 12;
        readonly listMarkerFrom: 2;
    };
    readonly sidebarRecipe: {
        readonly slots: readonly ["root", "group", "groupLabel", "item", "label", "badge", "toggle"];
        readonly defaults: {
            readonly collapsed: false;
        };
        readonly widths: {
            readonly expanded: 260;
            readonly collapsed: 72;
        };
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly paddingVertical: 12;
        readonly paddingHorizontal: 8;
        readonly gap: 4;
        readonly groupGap: 16;
        readonly groupLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 4;
        };
        readonly item: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly itemRadius: 12;
        readonly itemMinHeight: 44;
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly textFormatRecipe: {
        readonly slots: readonly ["root"];
        readonly kbd: {
            readonly fontFamily: readonly ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Monaco", "Cascadia Mono", "Consolas", "Liberation Mono", "monospace"];
            readonly textVariant: "label";
            readonly paddingHorizontal: 4;
            readonly radius: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly code: {
            readonly fontFamily: readonly ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Monaco", "Cascadia Mono", "Consolas", "Liberation Mono", "monospace"];
            readonly textVariant: "body";
            readonly paddingHorizontal: 4;
            readonly radius: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly quote: {
            readonly textVariant: "body";
            readonly paddingInlineStart: 16;
            readonly borderWidth: 2;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
    };
    readonly collapsibleRecipe: {
        readonly slots: readonly ["root", "trigger", "content"];
        readonly gap: 8;
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly menubarRecipe: {
        readonly slots: readonly ["root", "menu", "label", "panel", "item"];
        readonly minHeight: 44;
        readonly gap: 4;
        readonly paddingHorizontal: 8;
        readonly label: {
            readonly paddingHorizontal: 12;
            readonly radius: 8;
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly openBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
        };
        readonly item: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly assetRecipe: {
        readonly slots: readonly ["root", "frame", "media", "accessory", "group"];
        readonly kinds: readonly ["icon", "image", "lottie", "video"];
        readonly defaults: {
            readonly size: "medium";
            readonly shape: "rounded";
        };
        readonly sizes: {
            readonly small: 32;
            readonly medium: 48;
            readonly large: 72;
            readonly xlarge: 120;
        };
        readonly shapes: {
            readonly square: 0;
            readonly rounded: 12;
            readonly circle: 999;
        };
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly overlapRatio: 0.3;
        readonly accessory: {
            readonly offset: 4;
            readonly gap: 4;
        };
    };
    readonly breadcrumbRecipe: {
        readonly slots: readonly ["root", "list", "item", "link", "current", "separator"];
        readonly gap: 4;
        readonly link: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
        readonly current: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "500";
        };
        readonly separator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly glyph: "xs";
            readonly icon: "chevronEnd";
            readonly decorative: true;
        };
    };
    readonly aspectRatioRecipe: {
        readonly slots: readonly ["root", "content"];
        readonly defaults: {
            readonly ratio: "wide";
        };
        readonly ratios: {
            readonly square: 1;
            readonly portrait: number;
            readonly landscape: number;
            readonly wide: number;
        };
        readonly sizing: {
            readonly inline: "fill";
            readonly block: "derive-from-ratio";
        };
    };
    readonly containerRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly size: "content";
            readonly gutter: "regular";
        };
        readonly maxWidths: {
            readonly reading: 720;
            readonly content: 1200;
            readonly full: null;
        };
        readonly gutters: {
            readonly none: 0;
            readonly compact: 16;
            readonly regular: 20;
            readonly spacious: 24;
        };
        readonly alignment: "inline-center";
    };
    readonly calendarRecipe: {
        readonly slots: readonly ["root", "header", "monthLabel", "previousMonth", "nextMonth", "weekdayRow", "weekdayLabel", "grid", "week", "day", "dayLabel", "content"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly maxWidth: number;
        readonly header: {
            readonly gap: 8;
            readonly monthLabel: {
                readonly textVariant: "title";
                readonly fontWeight: "500";
                readonly color: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
            };
            readonly navButton: {
                readonly diameter: 44;
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
            };
            readonly navIcon: {
                readonly previous: "chevronStart";
                readonly next: "chevronEnd";
            };
        };
        readonly weekdayLabel: {
            readonly textVariant: "label";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly sizes: {
            readonly compact: {
                readonly cellDiameter: 44;
                readonly indicatorDiameter: 28;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly medium: {
                readonly cellDiameter: 44;
                readonly indicatorDiameter: 44;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly cellDiameter: 44;
                readonly indicatorDiameter: 44;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly day: {
            readonly radius: "full";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly numericVariant: "tabular";
            };
            readonly outsideFocusedMonthOpacity: 0.72;
            readonly disabledOpacity: 0.5;
            readonly today: {
                readonly border: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
            };
            readonly selected: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly cardRecipe: {
        readonly slots: readonly ["root", "media", "backgroundMedia", "backgroundInteraction", "mediaBadges", "badges", "mediaAction", "body", "header", "leading", "title", "description", "content", "actions"];
        readonly defaults: {
            readonly tone: "raised";
            readonly selected: false;
            readonly bordered: true;
            readonly headingLevel: 3;
            readonly badgesAlign: "start";
            readonly padding: "md";
        };
        readonly selectedTone: "accent";
        readonly interaction: {
            readonly disabledOpacity: 0.5;
            readonly pressedOpacity: 0.86;
        };
        readonly mediaAction: {
            readonly inset: 12;
            readonly diameter: 44;
            readonly iconSize: 20;
        };
        readonly backgroundMedia: {
            readonly scrim: "rgba(0, 0, 0, 0.6)";
            readonly foreground: "#ffffff";
        };
        readonly quotation: {
            readonly gap: 8;
            readonly markSize: 24;
        };
        readonly body: {
            readonly padding: 16;
            readonly gap: 8;
        };
        readonly header: {
            readonly gap: 12;
            readonly alignItems: "center";
        };
        readonly title: {
            readonly variant: "title";
            readonly tone: "primary";
            readonly emphasis: "strong";
        };
        readonly description: {
            readonly variant: "body";
            readonly tone: "muted";
            readonly emphasis: "regular";
        };
        readonly actions: {
            readonly gap: 8;
            readonly paddingHorizontal: 16;
            readonly paddingBottom: 16;
        };
    };
    readonly buttonRecipe: {
        readonly slots: readonly ["root", "face", "side", "leading", "label", "trailing", "spinner"];
        readonly defaults: {
            readonly tone: "primary";
            readonly size: "medium";
            readonly shape: "rounded";
            readonly align: "center";
            readonly appearance: "flat";
        };
        readonly raised: {
            readonly depths: {
                readonly small: 3;
                readonly medium: 4;
                readonly large: 5;
            };
            readonly sideShade: 0.25;
            readonly settleDuration: 120;
        };
        readonly tones: {
            readonly primary: {
                readonly background: "primary";
                readonly content: "onPrimary";
                readonly border: null;
                readonly paddingHorizontal: null;
            };
            readonly secondary: {
                readonly background: "bg";
                readonly content: "text";
                readonly border: "borderControl";
                readonly paddingHorizontal: null;
            };
            readonly ghost: {
                readonly background: null;
                readonly content: "textMuted";
                readonly border: null;
                readonly paddingHorizontal: null;
            };
            readonly danger: {
                readonly background: "dangerFill";
                readonly content: "onDanger";
                readonly border: null;
                readonly paddingHorizontal: null;
            };
            readonly link: {
                readonly background: null;
                readonly content: "contentBrand";
                readonly border: null;
                readonly paddingHorizontal: 0;
            };
        };
        readonly states: {
            readonly selected: {
                readonly background: "bg";
                readonly content: "contentBrand";
                readonly border: null;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly height: 36;
                readonly hitSlop: 4;
                readonly paddingHorizontal: 12;
                readonly textVariant: "label";
            };
            readonly medium: {
                readonly height: 44;
                readonly hitSlop: 0;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
            };
            readonly large: {
                readonly height: 52;
                readonly hitSlop: 0;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
            };
        };
        readonly shapes: {
            readonly rounded: "md";
            readonly pill: "full";
        };
        readonly aligns: {
            readonly center: "center";
            readonly leading: "flex-start";
        };
        readonly opacity: {
            readonly disabled: 0.5;
            readonly pressed: 0.86;
        };
        readonly label: {
            readonly overflow: "wrap";
            readonly maxLines: 2;
            readonly liftCapOnLargeText: true;
        };
    };
    readonly carouselRecipe: {
        readonly slots: readonly ["root", "track", "slide", "dots", "dot", "previousControl", "nextControl"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly sizes: {
            readonly medium: {
                readonly gap: 12;
                readonly controlHitTarget: 44;
                readonly controlIcon: "sm";
            };
        };
        readonly dot: {
            readonly diameter: 8;
            readonly compactGap: 8;
            readonly hitTarget: 44;
            readonly color: {
                readonly inactive: Readonly<{
                    source: "theme";
                    key: "textWeak";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
            };
        };
        readonly control: {
            readonly icons: {
                readonly previous: "chevronStart";
                readonly next: "chevronEnd";
            };
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly draggedOpacity: 0.64;
        };
        readonly transition: {
            readonly duration: 320;
            readonly easing: "emphasized";
            readonly reducedMotion: "opacity";
        };
    };
    readonly chipRecipe: {
        readonly slots: readonly ["root", "leading", "indicator", "label", "trailing"];
        readonly defaults: {
            readonly size: "small";
            readonly selected: false;
        };
        readonly sizes: {
            readonly small: {
                readonly height: 36;
                readonly hitSlop: 4;
                readonly paddingHorizontal: 12;
                readonly gap: 4;
                readonly textVariant: "body";
            };
            readonly medium: {
                readonly height: 44;
                readonly hitSlop: 0;
                readonly paddingHorizontal: 16;
                readonly gap: 8;
                readonly textVariant: "body";
            };
        };
        readonly states: {
            readonly idle: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
            readonly selected: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceSelected";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "borderControl";
                    alpha?: number;
                }>;
            };
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
        readonly radius: "full";
        readonly borderWidth: 1;
        readonly label: {
            readonly fontWeight: "500";
            readonly selectedFontWeight: "600";
        };
        readonly selectionIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly glyph: "xs";
        };
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
    readonly comboboxRecipe: {
        readonly slots: readonly ["root", "label", "field", "leading", "input", "indicator", "clear", "loadingIndicator", "description", "error", "popover", "viewport", "section", "sectionLabel", "option", "optionLeading", "optionCopy", "optionLabel", "optionDescription", "selectionIndicator", "stateMessage"];
        readonly defaults: {
            readonly size: "medium";
            readonly density: "comfortable";
        };
        readonly adaptive: {
            readonly web: "popover";
            readonly native: "sheet";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "500";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly input: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly placeholderColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly gap: 12;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly clear: {
            readonly diameter: 36;
            readonly hitSlop: 4;
            readonly glyph: "xs";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly loadingIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly popover: {
            readonly minWidth: 220;
            readonly maxWidth: 420;
            readonly maxHeight: 360;
            readonly sideOffset: 8;
            readonly collisionPadding: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly density: {
            readonly compact: {
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly comfortable: {
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly minHeight: 56;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly optionLeading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly optionLabel: {
            readonly fontWeight: "500";
            readonly selectedFontWeight: "600";
        };
        readonly selectionIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly stateMessage: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 12;
        };
        readonly states: {
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly web: {
                readonly enter: {
                    readonly duration: 120;
                    readonly easing: "standard";
                    readonly reducedMotion: "instant";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
            readonly native: {
                readonly enter: {
                    readonly duration: 200;
                    readonly easing: "enter";
                    readonly reducedMotion: "opacity";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
        };
    };
    readonly descriptionListRecipe: {
        readonly slots: readonly ["root", "group", "item", "label", "value"];
        readonly defaults: {
            readonly columns: 2;
        };
        readonly group: {
            readonly gap: 12;
            readonly minItemWidth: 160;
            readonly columns: readonly [1, 2];
        };
        readonly item: {
            readonly gap: 4;
        };
        readonly label: {
            readonly textVariant: "label";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly value: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly maxLines: null;
        };
    };
    readonly counterBadgeRecipe: {
        readonly slots: readonly ["root", "label"];
        readonly dotSize: 8;
        readonly defaults: {
            readonly tone: "danger";
            readonly size: "medium";
            readonly variant: "inline";
            readonly max: 99;
        };
        readonly tones: {
            readonly danger: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "dangerFill";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onDanger";
                    alpha?: number;
                }>;
            };
            readonly brand: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
            readonly neutral: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly height: 16;
                readonly minWidth: 16;
                readonly paddingHorizontal: 4;
                readonly textVariant: "caption";
            };
            readonly medium: {
                readonly height: 20;
                readonly minWidth: 20;
                readonly paddingHorizontal: 8;
                readonly textVariant: "caption";
            };
        };
        readonly variants: {
            readonly inline: {
                readonly border: null;
                readonly borderWidth: 0;
            };
            readonly floating: {
                readonly border: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly borderWidth: 2;
            };
        };
        readonly radius: "full";
        readonly fontWeight: "500";
    };
    readonly dialogRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "header", "title", "description", "body", "footer", "close"];
        readonly defaults: {
            readonly size: "medium";
            readonly dismissible: true;
        };
        readonly sizes: {
            readonly small: {
                readonly maxWidth: 320;
                readonly padding: 20;
            };
            readonly medium: {
                readonly maxWidth: 420;
                readonly padding: 24;
            };
            readonly large: {
                readonly maxWidth: 640;
                readonly padding: 24;
            };
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly gap: 16;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
        readonly immersive: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly controls: {
                readonly padding: 16;
                readonly gap: 8;
                readonly actionGap: 8;
            };
            readonly orientations: readonly ["portrait", "landscape-left", "landscape-right"];
            readonly statusBarHidden: true;
        };
    };
    readonly dataTableRecipe: {
        readonly slots: readonly ["root", "header", "headerCell", "sortButton", "sortIcon", "row", "cell", "selectionCell", "emptyState", "errorState"];
        readonly defaults: {
            readonly density: "regular";
        };
        readonly density: {
            readonly compact: {
                readonly paddingVertical: 8;
                readonly paddingHorizontal: 12;
            };
            readonly regular: {
                readonly paddingVertical: 12;
                readonly paddingHorizontal: 16;
            };
        };
        readonly header: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "500";
            readonly borderBottom: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly row: {
            readonly borderBottom: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
        };
        readonly cell: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly sortButton: {
            readonly minTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly activeColor: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly selectionCell: {
            readonly width: 44;
        };
        readonly emptyState: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly errorState: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly chartRecipe: {
        readonly heights: {
            readonly sparkline: 28;
            readonly compact: 128;
            readonly regular: 180;
            readonly tall: 240;
        };
        readonly insets: {
            readonly plot: {
                readonly top: 20;
                readonly right: 8;
                readonly bottom: 8;
                readonly left: 8;
            };
            readonly axis: {
                readonly top: 16;
                readonly right: 8;
                readonly bottom: 20;
                readonly left: 36;
            };
        };
        readonly line: {
            readonly strokeWidth: 2.4;
            readonly pointRadius: 4.5;
            readonly focusHaloRadius: 9;
            readonly focusHaloOpacity: 0.25;
            readonly missingDash: readonly [1, 5];
            readonly missingOpacity: 0.55;
        };
        readonly area: {
            readonly topOpacity: 0.32;
            readonly bottomOpacity: 0;
        };
        readonly bar: {
            readonly radius: number;
            readonly maxWidth: 28;
            readonly bandPadding: 0.36;
            readonly groupGap: 2;
            readonly restOpacity: 0.4;
        };
        readonly pie: {
            readonly donutRatio: 0.62;
            readonly padAngle: 0.012;
            readonly minLabelPercent: 4;
        };
        readonly radar: {
            readonly levels: 4;
            readonly strokeWidth: 2;
            readonly fillOpacity: 0.22;
            readonly labelOffset: 12;
        };
        readonly scatter: {
            readonly radius: 5;
            readonly focusRadius: 8;
        };
        readonly sparkline: {
            readonly width: 72;
            readonly height: 28;
            readonly strokeWidth: 1.8;
            readonly padding: 2;
        };
        readonly cursor: {
            readonly strokeWidth: 1;
            readonly dash: readonly [2, 3];
        };
        readonly reference: {
            readonly dash: readonly [2, 4];
        };
        readonly chrome: {
            readonly axisLine: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly axisLabel: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly gridLine: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly legendLabel: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly tooltipSurface: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly tooltipBorder: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly tooltipContent: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly labelSurface: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly labelContent: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly lineWidth: 1;
            readonly gridWidth: 1;
            readonly labelVariant: "caption";
            readonly legendVariant: "label";
        };
    };
    readonly datePickerRecipe: {
        readonly slots: readonly ["root", "label", "trigger", "leading", "value", "placeholder", "clear", "indicator", "description", "error", "popover"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly adaptive: {
            readonly web: "popover";
            readonly native: "sheet";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "500";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly placeholderColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly icon: "calendar";
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly clear: {
            readonly diameter: 36;
            readonly hitSlop: 4;
            readonly glyph: "xs";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly popover: {
            readonly minWidth: 300;
            readonly maxWidth: 360;
            readonly sideOffset: 8;
            readonly collisionPadding: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly dividerRecipe: {
        readonly slots: readonly ["root", "label"];
        readonly defaults: {
            readonly orientation: "horizontal";
            readonly inset: "none";
        };
        readonly color: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly thickness: 1;
        readonly insets: {
            readonly none: 0;
            readonly start: 16;
            readonly both: 16;
        };
    };
    readonly formRecipe: {
        readonly slots: readonly ["root", "field", "formError", "actions"];
        readonly defaults: {
            readonly density: "comfortable";
        };
        readonly density: {
            readonly compact: {
                readonly fieldGap: 12;
            };
            readonly comfortable: {
                readonly fieldGap: 20;
            };
        };
        readonly formError: {
            readonly position: "beforeActions";
            readonly gap: 12;
        };
    };
    readonly gridRecipe: {
        readonly slots: readonly ["root", "item"];
        readonly defaults: {
            readonly gap: "md";
            readonly flow: "row-major";
        };
        readonly gaps: {
            readonly xxs: 4;
            readonly xs: 8;
            readonly sm: 12;
            readonly md: 16;
            readonly lg: 20;
            readonly xl: 24;
            readonly xxl: 32;
            readonly xxxl: 40;
            readonly none: 0;
        };
    };
    readonly emptyStateRecipe: {
        readonly slots: readonly ["root", "icon", "title", "description", "action"];
        readonly defaults: {
            readonly density: "regular";
        };
        readonly density: {
            readonly compact: {
                readonly paddingVertical: 24;
            };
            readonly regular: {
                readonly paddingVertical: 40;
            };
        };
        readonly paddingHorizontal: 24;
        readonly gap: 8;
        readonly icon: {
            readonly size: "lg";
            readonly color: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
        };
        readonly title: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
    };
    readonly fieldRecipe: {
        readonly slots: readonly ["root", "label", "control", "leading", "input", "trailing", "hint", "error"];
        readonly defaults: {
            readonly variant: "surface";
            readonly shape: "medium";
            readonly align: "start";
        };
        readonly variants: {
            readonly surface: {
                readonly background: "bg";
            };
            readonly inset: {
                readonly background: "bg";
            };
        };
        readonly shapes: {
            readonly medium: "md";
            readonly large: "lg";
            readonly full: "full";
        };
        readonly states: {
            readonly idle: {
                readonly border: "borderControl";
            };
            readonly focused: {
                readonly border: "contentBrand";
            };
            readonly invalid: {
                readonly border: "danger";
                readonly borderWidth: 2;
            };
        };
        readonly minHeight: 44;
        readonly multilineMinHeight: 80;
        readonly multilineMaxVisibleLines: number | null;
        readonly borderWidth: 1;
        readonly focusRingWidth: 2;
        readonly focusRingOffset: 2;
        readonly paddingHorizontal: 16;
        readonly paddingVertical: 12;
        readonly textVariant: "body";
        readonly label: {
            readonly color: "textBody";
            readonly textVariant: "body";
            readonly fontWeight: "500";
            readonly gap: 8;
        };
        readonly support: {
            readonly hintColor: "textMuted";
            readonly errorColor: "danger";
            readonly textVariant: "label";
            readonly gap: 6;
        };
        readonly placeholder: {
            readonly color: "textMuted";
        };
        readonly disabledOpacity: 0.6;
        readonly disabledScope: {
            readonly dimmed: readonly ["label", "control"];
            readonly unchanged: readonly ["hint", "error"];
        };
    };
    readonly filePickerRecipe: {
        readonly slots: readonly ["root", "trigger", "dropzone", "hint", "error"];
        readonly defaults: {
            readonly density: "regular";
        };
        readonly trigger: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly radius: "md";
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "500";
        };
        readonly dropzone: {
            readonly borderStyle: "dashed";
            readonly borderWidth: 1;
            readonly borderColor: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly activeBorderColor: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly activeBackground: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly radius: "lg";
            readonly padding: 24;
        };
        readonly hint: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly iconButtonRecipe: {
        readonly slots: readonly ["root", "icon", "spinner"];
        readonly defaults: {
            readonly tone: "ghost";
            readonly size: "medium";
            readonly shape: "rounded";
        };
        readonly tones: {
            readonly primary: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly secondary: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "borderControl";
                    alpha?: number;
                }>;
            };
            readonly ghost: {
                readonly background: null;
                readonly content: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly danger: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "dangerFill";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onDanger";
                    alpha?: number;
                }>;
                readonly border: null;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly diameter: 36;
                readonly hitSlop: 4;
                readonly glyph: "sm";
            };
            readonly medium: {
                readonly diameter: 44;
                readonly hitSlop: 0;
                readonly glyph: "md";
            };
            readonly large: {
                readonly diameter: 52;
                readonly hitSlop: 0;
                readonly glyph: "lg";
            };
        };
        readonly shapes: {
            readonly rounded: "md";
            readonly circle: "full";
        };
        readonly edge: {
            readonly tones: readonly ["ghost"];
        };
        readonly states: {
            readonly selected: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly iconRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly size: "md";
            readonly tone: "secondary";
            readonly weight: "regular";
            readonly decorative: true;
        };
        readonly sizes: {
            readonly xs: 14;
            readonly sm: 20;
            readonly md: 24;
            readonly lg: 28;
            readonly xl: 32;
            readonly xxl: 44;
            readonly xxxl: 48;
        };
        readonly tones: {
            readonly primary: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly secondary: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly decorative: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly info: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly success: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly warning: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly inverse: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly weights: {
            readonly regular: 2;
            readonly strong: 2.5;
        };
        readonly stroke: {
            readonly lineCap: "round";
            readonly lineJoin: "round";
            readonly scaling: "proportional";
        };
    };
    readonly imageRecipe: {
        readonly slots: readonly ["root", "image", "placeholder", "fallbackIcon"];
        readonly defaults: {
            readonly fit: "cover";
        };
        readonly fits: readonly import("./image.js").ImageFit[];
        readonly placeholder: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
        };
        readonly fallback: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly icon: {
                readonly name: "error";
                readonly tone: "secondary";
            };
        };
        readonly radius: "md";
    };
    readonly linkRecipe: {
        readonly slots: readonly ["root", "leading", "label", "trailing"];
        readonly defaults: {
            readonly tone: "brand";
            readonly variant: "inline";
        };
        readonly tones: {
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly neutral: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
        readonly variants: {
            readonly inline: {
                readonly textVariant: "body";
                readonly fontWeight: "500";
                readonly underline: "always";
                readonly minHeight: null;
                readonly minWidth: null;
            };
            readonly standalone: {
                readonly textVariant: "body";
                readonly fontWeight: "500";
                readonly underline: "hover";
                readonly minHeight: 44;
                readonly minWidth: 44;
            };
        };
        readonly gap: 4;
        readonly icon: {
            readonly glyph: "xs";
            readonly inheritsTone: true;
        };
        readonly states: {
            readonly pressedOpacity: 0.86;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly listRecipe: {
        readonly slots: readonly ["root", "item", "separator"];
        readonly defaults: {
            readonly separator: "indented";
        };
        readonly separators: {
            readonly none: null;
            readonly content: {
                readonly insetStart: 0;
                readonly leadingInsetStart: 0;
                readonly insetEnd: 0;
            };
            readonly full: {
                readonly insetStart: number;
                readonly leadingInsetStart: number;
                readonly insetEnd: number;
            };
            readonly indented: {
                readonly insetStart: 0;
                readonly leadingInsetStart: number;
                readonly insetEnd: 0;
            };
        };
        readonly grouped: {
            readonly paddingInline: 8;
        };
        readonly background: null;
    };
    readonly listRowRecipe: {
        readonly slots: readonly ["root", "leading", "content", "title", "description", "trailing"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly selected: false;
            readonly tone: "default";
        };
        readonly tones: {
            readonly default: {
                readonly titleColor: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
            };
            readonly danger: {
                readonly titleColor: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly density: {
            readonly compact: {
                readonly oneLineMinHeight: 44;
                readonly twoLineMinHeight: 60;
                readonly paddingHorizontal: 8;
                readonly paddingVertical: 4;
            };
            readonly comfortable: {
                readonly oneLineMinHeight: 56;
                readonly twoLineMinHeight: 68;
                readonly paddingHorizontal: 8;
                readonly paddingVertical: 8;
            };
            readonly relaxed: {
                readonly oneLineMinHeight: number;
                readonly twoLineMinHeight: number;
                readonly paddingHorizontal: 8;
                readonly paddingVertical: 12;
            };
            readonly spacious: {
                readonly oneLineMinHeight: number;
                readonly twoLineMinHeight: number;
                readonly paddingHorizontal: 8;
                readonly paddingVertical: 16;
            };
        };
        readonly loading: {
            readonly titleWidthPercent: 60;
            readonly descriptionWidthPercent: 40;
            readonly trailingWidth: 32;
        };
        readonly surfaceBleed: 8;
        readonly gap: 12;
        readonly leadingSize: 40;
        readonly leadingShapes: {
            readonly square: null;
            readonly circle: "full";
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "bodyLarge";
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly trailing: {
            readonly textColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly iconColor: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly glyph: "sm";
            readonly textVariant: "caption";
        };
        readonly states: {
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly loadMoreRecipe: {
        readonly slots: readonly ["root", "status", "spinner", "trigger", "error", "retry", "end"];
        readonly defaults: {
            readonly mode: "automatic";
            readonly density: "regular";
        };
        readonly density: {
            readonly compact: {
                readonly paddingVertical: 12;
                readonly gap: 8;
            };
            readonly regular: {
                readonly paddingVertical: 20;
                readonly gap: 12;
            };
        };
        readonly status: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly end: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "caption";
        };
        readonly trigger: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly radius: "md";
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "500";
        };
        readonly spinner: {
            readonly size: "small";
            readonly tone: "brand";
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly menuRecipe: {
        readonly slots: readonly ["trigger", "content", "viewport", "section", "sectionLabel", "item", "leading", "copy", "label", "description", "trailing", "shortcut", "indicator", "dangerIndicator", "separator"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly itemTone: "neutral";
        };
        readonly presentations: {
            readonly grouped: {
                readonly maxWidth: 288;
                readonly padding: 12;
                readonly gap: 8;
                readonly rowHeight: 52;
            };
            readonly anchored: {
                readonly maxWidth: 280;
                readonly padding: 8;
                readonly gap: 8;
                readonly rowHeight: 48;
            };
            readonly bottom: {
                readonly maxWidth: 420;
                readonly padding: 0;
                readonly gap: 8;
                readonly rowHeight: 56;
            };
        };
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly density: {
            readonly compact: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly comfortable: {
                readonly minHeight: 56;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly tones: {
            readonly neutral: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly shortcut: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "caption";
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly separator: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly dangerIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly glyph: "sm";
            readonly mark: "alert";
        };
        readonly minWidth: 220;
        readonly maxWidth: 320;
        readonly maxHeight: 360;
        readonly sideOffset: 8;
        readonly collisionPadding: 8;
        readonly states: {
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly noticeRecipe: {
        readonly slots: readonly ["root", "icon", "content", "title", "description", "action"];
        readonly defaults: {
            readonly tone: "info";
            readonly appearance: "panel";
        };
        readonly appearances: {
            readonly panel: {
                readonly padding: 16;
                readonly borderWidth: 1;
            };
            readonly status: {
                readonly padding: 0;
                readonly borderWidth: 0;
            };
        };
        readonly tones: {
            readonly info: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly warning: {
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
            };
            readonly attention: {
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
            };
            readonly danger: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly radius: "md";
        readonly padding: 16;
        readonly gap: 12;
        readonly contentGap: 4;
        readonly iconSize: "sm";
        readonly borderWidth: 1;
        readonly title: {
            readonly textVariant: "body";
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
    };
    readonly paginationRecipe: {
        readonly slots: readonly ["root", "item", "ellipsis", "previous", "next"];
        readonly gap: 4;
        readonly item: {
            readonly minSize: 44;
            readonly radius: "md";
            readonly color: {
                readonly default: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
            };
            readonly background: {
                readonly hover: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
            };
            readonly border: {
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
            };
        };
        readonly ellipsis: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly icon: "more";
        };
        readonly navIcon: {
            readonly previous: "chevronStart";
            readonly next: "chevronEnd";
        };
        readonly pageLabel: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 8;
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly states: {
            readonly disabledOpacity: 0.5;
        };
    };
    readonly popoverRecipe: {
        readonly slots: readonly ["trigger", "content", "arrow", "closeAction"];
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly arrow: {
            readonly size: 4;
            readonly offset: 4;
        };
        readonly sideOffset: 8;
        readonly collisionPadding: 8;
        readonly minWidth: 240;
        readonly maxWidth: 360;
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly numberFieldRecipe: {
        readonly slots: readonly ["root", "frame", "input", "decrement", "increment", "description", "error"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "500";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 4;
                readonly textVariant: "body";
                readonly stepperDiameter: 44;
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 8;
                readonly textVariant: "bodyLarge";
                readonly stepperDiameter: 44;
            };
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly numericVariant: "tabular";
        };
        readonly stepper: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly minTarget: 44;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly progressRecipe: {
        readonly slots: readonly ["root", "track", "indicator", "label", "value"];
        readonly defaults: {
            readonly size: "medium";
            readonly tone: "brand";
            readonly shape: "linear";
            readonly max: 100;
            readonly showValue: true;
        };
        readonly sizes: {
            readonly small: 4;
            readonly medium: 8;
            readonly large: 12;
        };
        readonly segmented: {
            readonly gap: 4;
        };
        readonly circular: {
            readonly sizes: {
                readonly small: 24;
                readonly medium: 40;
                readonly large: 64;
            };
            readonly strokeWidth: {
                readonly small: 3;
                readonly medium: 4;
                readonly large: 6;
            };
        };
        readonly tones: {
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly success: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly warning: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly track: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly radius: "full";
    };
    readonly resultRecipe: {
        readonly slots: readonly ["root", "icon", "title", "description", "primaryAction", "secondaryAction"];
        readonly defaults: {
            readonly status: "info";
        };
        readonly tones: {
            readonly success: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly failure: {
                readonly icon: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly info: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
        };
        readonly iconSize: "xl";
        readonly glyphs: {
            readonly success: "✓";
            readonly failure: "!";
            readonly info: "i";
        };
        readonly paddingVertical: 40;
        readonly paddingHorizontal: 24;
        readonly gap: 12;
        readonly title: {
            readonly textVariant: "titleLarge";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly actionsGap: 8;
    };
    readonly searchFieldRecipe: {
        readonly slots: readonly ["root", "leading", "input", "trailing", "clear", "spinner"];
        readonly defaults: {
            readonly size: "medium";
            readonly shape: "medium";
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 8;
                readonly glyph: "sm";
                readonly clearDiameter: 36;
                readonly clearHitSlop: 4;
                readonly textVariant: "body";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 16;
                readonly gap: 12;
                readonly glyph: "sm";
                readonly clearDiameter: 44;
                readonly clearHitSlop: 0;
                readonly textVariant: "bodyLarge";
            };
        };
        readonly colors: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly placeholder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly leading: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly clear: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly focus: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalid: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly shapes: {
            readonly medium: "md";
            readonly large: "lg";
            readonly full: "full";
        };
        readonly borderWidth: 1;
        readonly focusRingWidth: 2;
        readonly focusRingOffset: 2;
        readonly states: {
            readonly disabledOpacity: 0.5;
            readonly pressedOpacity: 0.86;
        };
    };
    readonly selectRecipe: {
        readonly slots: readonly ["root", "label", "trigger", "leading", "value", "placeholder", "busyIndicator", "indicator", "description", "error", "popover", "viewport", "section", "sectionLabel", "option", "optionLeading", "optionCopy", "optionLabel", "optionDescription", "selectionIndicator", "stateMessage"];
        readonly defaults: {
            readonly size: "medium";
            readonly density: "comfortable";
        };
        readonly adaptive: {
            readonly web: "popover";
            readonly native: "sheet";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "500";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly placeholderColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly gap: 12;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly busyIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly popover: {
            readonly minWidth: 220;
            readonly maxWidth: 420;
            readonly maxHeight: 360;
            readonly sideOffset: 8;
            readonly collisionPadding: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly density: {
            readonly compact: {
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly comfortable: {
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly minHeight: 56;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly optionLeading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly optionLabel: {
            readonly fontWeight: "500";
            readonly selectedFontWeight: "600";
        };
        readonly selectionIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly stateMessage: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 12;
        };
        readonly states: {
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly web: {
                readonly enter: {
                    readonly duration: 120;
                    readonly easing: "standard";
                    readonly reducedMotion: "instant";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
            readonly native: {
                readonly enter: {
                    readonly duration: 200;
                    readonly easing: "enter";
                    readonly reducedMotion: "opacity";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
        };
    };
    readonly selectionGroupRecipe: {
        readonly slots: readonly ["root", "label", "requiredIndicator", "description", "items", "itemLabel", "itemAction", "error"];
        readonly defaults: {
            readonly orientation: "vertical";
            readonly presentation: "card";
        };
        readonly orientations: {
            readonly vertical: {
                readonly direction: "column";
                readonly gap: {
                    readonly plain: 4;
                    readonly card: 8;
                    readonly grouped: 0;
                    readonly chips: 8;
                };
            };
            readonly horizontal: {
                readonly direction: "row";
                readonly gap: {
                    readonly plain: 12;
                    readonly card: 16;
                    readonly grouped: 0;
                    readonly chips: 8;
                };
            };
        };
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "500";
        };
        readonly requiredIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly supportGap: 8;
        readonly states: {
            readonly disabledOpacity: 0.5;
        };
    };
    readonly sectionRecipe: {
        readonly slots: readonly ["root", "header", "copy", "title", "description", "action", "content"];
        readonly gap: 8;
        readonly headerGap: 12;
        readonly copyGap: 4;
        readonly title: {
            readonly textVariant: "title";
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly textVariant: "caption";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
    };
    readonly segmentedControlRecipe: {
        readonly text: {
            readonly gap: 16;
            readonly indicatorWidth: 16;
            readonly indicatorHeight: 2;
            readonly indicatorRadius: 999;
            readonly minHeight: 44;
            readonly labelGap: 4;
            readonly regular: {
                readonly idle: "400";
                readonly selected: "600";
            };
            readonly strong: {
                readonly idle: "500";
                readonly selected: "700";
            };
        };
        readonly slots: readonly ["root", "item", "label", "indicator"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly selectedBrand: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly pills: {
            readonly textVariant: "label";
            readonly paddingHorizontal: {
                readonly small: 12;
                readonly medium: 16;
            };
            readonly gap: 8;
            readonly radius: 999;
            readonly inset: 4;
            readonly minHeight: 44;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "surfaceSelected";
                alpha?: number;
            }>;
            readonly selectedContent: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly largeTextLayout: "wrap";
        };
        readonly adaptive: {
            readonly largeTextLayout: "stacked";
            readonly stackAtFontScale: 1.6;
        };
        readonly container: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly padding: 4;
            readonly gap: 4;
        };
        readonly sizes: {
            readonly small: {
                readonly height: 36;
                readonly minHeight: number;
                readonly hitSlop: number;
                readonly paddingHorizontal: 12;
                readonly textVariant: "label";
            };
            readonly medium: {
                readonly height: 44;
                readonly minHeight: number;
                readonly hitSlop: number;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
            };
        };
        readonly item: {
            readonly radius: "md";
            readonly gap: 4;
            readonly idleContent: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "surfaceSelected";
                alpha?: number;
            }>;
            readonly selectedContent: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly selectedBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly selectedBorderWidth: 2;
            readonly selectedFontWeight: "600";
            readonly focusRing: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly selectionControlRecipe: {
        readonly slots: readonly ["root", "control", "indicator", "leading", "content", "label", "description"];
        readonly defaults: {
            readonly kind: "checkbox";
            readonly size: "medium";
            readonly presentation: "card";
        };
        readonly sizes: {
            readonly small: {
                readonly rowMinHeight: 44;
                readonly control: 20;
                readonly hitSlop: 12;
                readonly glyph: "xs";
                readonly gap: 8;
                readonly paddingHorizontal: 12;
                readonly paddingVertical: 8;
                readonly labelVariant: "label";
                readonly descriptionVariant: "caption";
            };
            readonly medium: {
                readonly rowMinHeight: 56;
                readonly control: 24;
                readonly hitSlop: 10;
                readonly glyph: "sm";
                readonly gap: 12;
                readonly paddingHorizontal: 16;
                readonly paddingVertical: 12;
                readonly labelVariant: "body";
                readonly descriptionVariant: "label";
            };
        };
        readonly shapes: {
            readonly checkbox: "sm";
            readonly radio: "full";
        };
        readonly indicatorBorderWidth: 2;
        readonly presentations: {
            readonly chips: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly radius: "full";
                readonly useSizePadding: true;
                readonly labelColor: null;
            };
            readonly plain: {
                readonly background: null;
                readonly border: null;
                readonly borderWidth: 0;
                readonly radius: "md";
                readonly useSizePadding: false;
                readonly labelColor: null;
            };
            readonly card: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly radius: "md";
                readonly useSizePadding: true;
                readonly labelColor: null;
            };
            readonly grouped: {
                readonly background: null;
                readonly border: null;
                readonly borderWidth: 0;
                readonly radius: "lg";
                readonly useSizePadding: true;
                readonly labelColor: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
            };
        };
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
            readonly checkedFontWeight: "600";
        };
        readonly leading: {
            readonly size: "md";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly indicators: {
            readonly checkbox: {
                readonly checked: "check";
                readonly mixed: "dash";
            };
            readonly radio: {
                readonly checked: "dot";
                readonly mixed: null;
            };
        };
        readonly radioDotRatio: 0.42;
        readonly states: {
            readonly idleBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly idleBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly checkedBackground: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly checkedBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly indicator: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly sheetRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "handle", "header", "title", "body", "footer", "close"];
        readonly defaults: {
            readonly placement: "bottom";
            readonly size: "auto";
        };
        readonly sizes: {
            readonly auto: null;
            readonly small: 0.4;
            readonly medium: 0.6;
            readonly large: 0.85;
            readonly full: 1;
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "xl";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly maxHeightRatio: 0.9;
            readonly paddingHorizontal: 20;
            readonly paddingTop: 12;
            readonly paddingBottom: 12;
        };
        readonly web: {
            readonly maxWidth: 640;
        };
        readonly safeArea: {
            readonly edge: "bottom";
            readonly mode: "additive";
            readonly minimumPadding: 12;
        };
        readonly handle: {
            readonly width: 36;
            readonly height: 4;
            readonly radius: "full";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly visibleByDefault: true;
            readonly showWhen: "swipe-dismiss-enabled";
        };
        readonly header: {
            readonly minHeight: 44;
            readonly gap: 12;
        };
        readonly body: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 16;
        };
        readonly footer: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 8;
            readonly paddingTop: 12;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly sidePanelRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "header", "title", "body", "footer", "close"];
        readonly defaults: {
            readonly edge: "end";
            readonly size: "regular";
        };
        readonly sizes: {
            readonly compact: 320;
            readonly regular: 400;
            readonly wide: 560;
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: null;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.16;
                readonly radius: 24;
                readonly offsetY: 8;
            };
            readonly paddingHorizontal: 20;
            readonly paddingTop: 12;
            readonly paddingBottom: 12;
        };
        readonly header: {
            readonly minHeight: 44;
            readonly gap: 12;
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "title";
            readonly fontWeight: "500";
        };
        readonly body: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 16;
        };
        readonly footer: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 12;
            readonly paddingTop: 12;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly commandPaletteRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "searchField", "viewport", "section", "sectionLabel", "item", "leading", "copy", "label", "description", "shortcut", "emptyState"];
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly maxWidth: 560;
            readonly maxHeight: 420;
        };
        readonly searchField: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly borderColor: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
        };
        readonly item: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly emptyState: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly paddingVertical: 24;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly layoutRecipe: {
        readonly slots: readonly ["root", "skipLink", "header", "sidebar", "main", "footer"];
        readonly defaults: {};
        readonly main: {
            readonly maxWidth: 1200;
            readonly paddingHorizontal: 20;
        };
        readonly sidebar: {
            readonly width: 280;
        };
        readonly skipLink: {
            readonly visibility: "focus-only";
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly paddingHorizontal: 16;
            readonly paddingVertical: 12;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly otpFieldRecipe: {
        readonly slots: readonly ["root", "input", "slot", "description", "error"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "500";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly sizes: {
            readonly medium: {
                readonly slotSize: 44;
                readonly gap: 8;
                readonly textVariant: "title";
            };
            readonly large: {
                readonly slotSize: 52;
                readonly gap: 12;
                readonly textVariant: "titleLarge";
            };
        };
        readonly slot: {
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly filledBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly passwordFieldRecipe: {
        readonly slots: readonly ["root", "frame", "input", "toggle", "description", "error"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "500";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly toggleDiameter: 44;
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly toggleDiameter: 44;
            };
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
        readonly toggle: {
            readonly icons: {
                readonly concealed: "visibility";
                readonly revealed: "visibilityOff";
            };
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly splitterRecipe: {
        readonly slots: readonly ["root", "pane", "separator", "handle"];
        readonly defaults: {
            readonly axis: "horizontal";
        };
        readonly separator: {
            readonly thickness: 1;
            readonly hitTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly hoverColor: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly activeColor: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly floatingActionButtonRecipe: {
        readonly slots: readonly ["root", "icon", "label"];
        readonly defaults: {
            readonly layoutMode: "expanded";
        };
        readonly circle: {
            readonly diameter: 52;
            readonly hitSlop: 0;
            readonly glyph: "lg";
        };
        readonly sizes: {
            readonly medium: {
                readonly diameter: 44;
                readonly hitSlop: 0;
                readonly glyph: "md";
            };
            readonly large: {
                readonly diameter: 52;
                readonly hitSlop: 0;
                readonly glyph: "lg";
            };
        };
        readonly tone: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly shape: "full";
        readonly expandedLabel: {
            readonly textVariant: "bodyLarge";
            readonly paddingHorizontal: 20;
        };
        readonly margin: 16;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
        readonly transition: {
            readonly duration: 120;
            readonly easing: "standard";
            readonly reducedMotion: "instant";
        };
    };
    readonly tourRecipe: {
        readonly slots: readonly ["backdrop", "card", "title", "description", "counter", "previousAction", "nextAction", "skipAction"];
        readonly card: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly maxWidth: 320;
        readonly gap: 12;
        readonly sideOffset: 8;
        readonly transition: {
            readonly enter: {
                readonly duration: 320;
                readonly easing: "emphasized";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly transferListRecipe: {
        readonly slots: readonly ["root", "panel", "panelHeader", "panelTitle", "panelCount", "list", "item", "itemCheckbox", "emptyState", "moveControls", "moveButton"];
        readonly panel: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
        };
        readonly panelHeader: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly title: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly count: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
        };
        readonly item: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly emptyState: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly moveControls: {
            readonly gap: 8;
        };
        readonly moveButton: {
            readonly minTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.4;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly skeletonRecipe: {
        readonly slots: readonly ["root", "line"];
        readonly defaults: {
            readonly shape: "block";
            readonly animated: true;
            readonly lines: 1;
        };
        readonly background: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly shapes: {
            readonly block: {
                readonly radius: "md";
                readonly defaultHeight: 32;
                readonly aspectRatio: null;
            };
            readonly text: {
                readonly radius: "sm";
                readonly defaultHeight: 16;
                readonly aspectRatio: null;
            };
            readonly circle: {
                readonly radius: "full";
                readonly defaultHeight: 44;
                readonly aspectRatio: null;
            };
            readonly media: {
                readonly radius: "md";
                readonly defaultHeight: null;
                readonly aspectRatio: number;
            };
            readonly button: {
                readonly radius: "md";
                readonly defaultHeight: 44;
                readonly aspectRatio: null;
            };
        };
        readonly lines: {
            readonly gap: 8;
            readonly lastLineWidthPercent: 60;
        };
        readonly animation: {
            readonly duration: number;
            readonly easing: "standard";
            readonly fromOpacity: 0.56;
            readonly toOpacity: 1;
            readonly reducedMotion: "static";
        };
    };
    readonly sliderRecipe: {
        readonly slots: readonly ["root", "track", "filledTrack", "thumb", "label", "valueLabel"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly sizes: {
            readonly medium: {
                readonly trackHeight: 4;
                readonly thumbDiameter: 20;
                readonly hitTarget: 44;
                readonly labelVariant: "body";
                readonly valueLabelVariant: "label";
            };
        };
        readonly colors: {
            readonly trackFilled: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly trackUnfilled: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly trackUnfilledBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly thumb: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly thumbBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly label: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly valueLabel: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
            readonly draggedOpacity: 0.64;
        };
        readonly radius: "full";
        readonly header: {
            readonly gap: 16;
            readonly trackGap: 8;
        };
    };
    readonly spinnerRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly size: "medium";
            readonly tone: "brand";
        };
        readonly sizes: {
            readonly small: 14;
            readonly medium: 20;
            readonly large: 28;
        };
        readonly tones: {
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly neutral: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly inverse: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly strokeWidth: 2;
        readonly animation: {
            readonly duration: 800;
            readonly easing: "standard";
            readonly reducedMotion: "static";
        };
    };
    readonly stackRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly axis: "block";
            readonly gap: "md";
            readonly align: "stretch";
            readonly justify: "start";
            readonly wrap: false;
        };
        readonly axes: {
            readonly block: "column";
            readonly inline: "row";
        };
        readonly gaps: {
            readonly xxs: 4;
            readonly xs: 8;
            readonly sm: 12;
            readonly md: 16;
            readonly lg: 20;
            readonly xl: 24;
            readonly xxl: 32;
            readonly xxxl: 40;
        };
        readonly align: readonly ["start", "center", "end", "stretch"];
        readonly justify: readonly ["start", "center", "end", "between"];
    };
    readonly statisticRecipe: {
        readonly slots: readonly ["group", "root", "label", "valueRow", "prefix", "value", "suffix", "trend", "trendMark", "hint"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly presentation: "plain";
            readonly columns: 3;
        };
        readonly density: {
            readonly compact: {
                readonly padding: 12;
                readonly gap: 4;
                readonly labelVariant: "caption";
                readonly valueVariant: "bodyLarge";
            };
            readonly comfortable: {
                readonly padding: 16;
                readonly gap: 8;
                readonly labelVariant: "label";
                readonly valueVariant: "heading";
            };
        };
        readonly presentations: {
            readonly plain: {
                readonly background: null;
                readonly border: null;
                readonly borderWidth: 0;
                readonly radius: "md";
            };
            readonly surface: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly radius: "md";
            };
        };
        readonly group: {
            readonly gap: 8;
            readonly minItemWidth: 120;
            readonly bar: {
                readonly cellPadding: 8;
                readonly valueGap: 4;
                readonly iconSize: 20;
            };
            readonly columns: readonly [1, 2, 3, 4];
        };
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "600";
            readonly numericVariant: "tabular";
            readonly maxLines: null;
        };
        readonly affix: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "500";
        };
        readonly hint: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "caption";
        };
        readonly trend: {
            readonly textVariant: "caption";
            readonly fontWeight: "500";
            readonly gap: 4;
            readonly marks: {
                readonly up: "trendUp";
                readonly down: "trendDown";
                readonly flat: "trendFlat";
            };
            readonly tones: {
                readonly neutral: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly success: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly warning: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
    };
    readonly stepsRecipe: {
        readonly slots: readonly ["root", "step", "indicator", "marker", "connector", "label", "description"];
        readonly gap: 8;
        readonly paddingInline: 16;
        readonly indicator: {
            readonly size: 44;
            readonly borderWidth: 1;
            readonly activeBorderWidth: 2;
            readonly marks: {
                readonly pending: null;
                readonly current: null;
                readonly complete: "check";
                readonly error: "error";
            };
            readonly border: {
                readonly pending: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly complete: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly background: {
                readonly pending: null;
                readonly current: null;
                readonly complete: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly content: {
                readonly pending: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly complete: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly connector: {
            readonly height: 1;
            readonly tone: {
                readonly reached: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly unreached: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
        };
        readonly label: {
            readonly textVariant: "label";
            readonly fontWeight: "500";
            readonly color: {
                readonly pending: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly complete: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly description: {
            readonly textVariant: "caption";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly press: {
            readonly minTouchTarget: 44;
        };
    };
    readonly surfaceRecipe: {
        readonly default: {
            readonly background: "bg";
            readonly border: "border";
            readonly borderAlpha: 1;
            readonly elevated: false;
            readonly borderAlways: true;
            readonly clipsContent: true;
        };
        readonly raised: {
            readonly background: "bg";
            readonly border: "border";
            readonly borderAlpha: 1;
            readonly elevated: true;
            readonly borderAlways: true;
            readonly clipsContent: false;
        };
        readonly sunken: {
            readonly background: "bg";
            readonly border: "border";
            readonly borderAlpha: 1;
            readonly elevated: false;
            readonly borderAlways: true;
            readonly clipsContent: true;
        };
        readonly accent: {
            readonly background: "bg";
            readonly border: "primary";
            readonly borderAlpha: 1;
            readonly elevated: false;
            readonly borderAlways: true;
            readonly clipsContent: true;
        };
        readonly subtle: {
            readonly background: "bg";
            readonly border: "border";
            readonly borderAlpha: 1;
            readonly elevated: false;
            readonly borderAlways: true;
            readonly clipsContent: true;
        };
    };
    readonly switchRecipe: {
        readonly rowLabelTextVariant: "body";
        readonly slots: readonly ["root", "track", "thumb", "label", "description"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly presentationDefaults: {
            readonly web: "row";
            readonly native: "row";
        };
        readonly stackedTextScale: 1.6;
        readonly sizes: {
            readonly small: {
                readonly width: 44;
                readonly height: 26;
                readonly thumb: 22;
                readonly inset: 2;
            };
            readonly medium: {
                readonly width: 52;
                readonly height: 32;
                readonly thumb: 28;
                readonly inset: 2;
            };
        };
        readonly colors: {
            readonly trackOff: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly trackOffBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly trackOn: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly trackOnBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly thumbOff: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly thumbOffBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly thumbOn: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly trackOffDisabled: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly trackOffBorderDisabled: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly trackOnDisabled: {
                readonly alpha: 0.38;
                readonly source: "theme";
                readonly key: "primary";
            };
            readonly trackOnBorderDisabled: {
                readonly alpha: 0.38;
                readonly source: "theme";
                readonly key: "primary";
            };
            readonly thumbDisabled: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly thumbDisabledBorder: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly disabledOpacity: 0.5;
            readonly pressedOpacity: 0.86;
        };
        readonly rowMinHeight: 44;
        readonly rowPaddingVertical: 8;
        readonly rowTwoLineMinHeight: number;
    };
    readonly tabsRecipe: {
        readonly slots: readonly ["root", "list", "tab", "label", "indicator", "panel"];
        readonly defaults: {
            readonly size: "medium";
            readonly layout: "content";
            readonly overflow: "scroll";
            readonly indicator: "underline";
        };
        readonly indicators: {
            readonly underline: {
                readonly listDivider: true;
                readonly background: null;
                readonly selectedContent: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly radius: null;
            };
            readonly filled: {
                readonly listDivider: false;
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAccent";
                    alpha?: number;
                }>;
                readonly selectedContent: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly radius: "full";
            };
            readonly solid: {
                readonly listDivider: false;
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly selectedContent: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
                readonly radius: "full";
            };
        };
        readonly sizes: {
            readonly small: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly textVariant: "label";
            };
            readonly medium: {
                readonly minHeight: 48;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
            };
        };
        readonly colors: {
            readonly idle: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly selected: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly indicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly divider: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly gap: 8;
        readonly icon: {
            readonly glyph: "xs";
        };
        readonly label: {
            readonly fontWeight: "500";
            readonly selectedFontWeight: "600";
        };
        readonly layouts: {
            readonly content: {
                readonly fitted: false;
            };
            readonly fitted: {
                readonly fitted: true;
            };
        };
        readonly overflow: {
            readonly scroll: {
                readonly scrollable: true;
                readonly wrap: false;
            };
            readonly clip: {
                readonly scrollable: false;
                readonly wrap: false;
            };
        };
        readonly indicatorHeight: 2;
        readonly states: {
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly tagRecipe: {
        readonly slots: readonly ["root", "label"];
        readonly defaults: {
            readonly tone: "neutral";
        };
        readonly tones: {
            readonly neutral: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
            readonly brand: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
            readonly info: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly background: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly attention: {
                readonly background: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
            };
        };
        readonly size: {
            readonly minHeight: 20;
            readonly paddingHorizontal: 4;
            readonly gap: 4;
            readonly textVariant: "caption";
            readonly fontWeight: "500";
        };
        readonly radius: "sm";
        readonly borderWidth: 1;
    };
    readonly textRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly variant: "body";
            readonly tone: "primary";
            readonly emphasis: "regular";
        };
        readonly tones: {
            readonly primary: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly body: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly muted: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly subtle: Readonly<{
                source: "theme";
                key: "textSub";
                alpha?: number;
            }>;
            readonly weak: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly inverse: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly emphasis: {
            readonly regular: "400";
            readonly medium: "500";
            readonly strong: "500";
        };
        readonly variantWeight: readonly ["label"];
    };
    readonly timelineRecipe: {
        readonly slots: readonly ["root", "item", "dot", "connector", "content", "timestamp", "label", "description"];
        readonly gap: 20;
        readonly item: {
            readonly padding: 12;
            readonly emphasisBackground: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
        };
        readonly dot: {
            readonly diameter: 10;
            readonly borderWidth: 1;
            readonly tones: {
                readonly neutral: {
                    readonly border: null;
                    readonly fill: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                };
                readonly info: {
                    readonly border: Readonly<{
                        source: "accent";
                        key: "info";
                        alpha?: number;
                    }>;
                    readonly fill: Readonly<{
                        source: "accent";
                        key: "info";
                        alpha?: number;
                    }>;
                };
                readonly success: {
                    readonly border: Readonly<{
                        source: "accent";
                        key: "success";
                        alpha?: number;
                    }>;
                    readonly fill: Readonly<{
                        source: "accent";
                        key: "success";
                        alpha?: number;
                    }>;
                };
                readonly attention: {
                    readonly border: Readonly<{
                        source: "accent";
                        key: "attention";
                        alpha?: number;
                    }>;
                    readonly fill: Readonly<{
                        source: "accent";
                        key: "attention";
                        alpha?: number;
                    }>;
                };
            };
        };
        readonly connector: {
            readonly width: 1;
            readonly tone: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly timestamp: {
            readonly textVariant: "caption";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly label: {
            readonly textVariant: "body";
            readonly fontWeight: "500";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly description: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
    };
    readonly toastRecipe: {
        readonly slots: readonly ["viewport", "root", "toneMark", "icon", "media", "content", "title", "description", "progress", "action", "close"];
        readonly defaults: {
            readonly tone: "neutral";
            readonly placement: "bottom";
            readonly durationMs: 3000;
        };
        readonly adaptive: {
            readonly web: "fixed-viewport";
            readonly native: "safe-area-overlay";
        };
        readonly viewport: {
            readonly layer: 1000;
            readonly gap: 12;
            readonly inset: 16;
            readonly maxWidth: 420;
            readonly safeAreaMode: "additive";
        };
        readonly placements: {
            readonly top: {
                readonly blockEdge: "top";
                readonly inlineEdge: "center";
                readonly stackFrom: "top";
            };
            readonly "top-start": {
                readonly blockEdge: "top";
                readonly inlineEdge: "start";
                readonly stackFrom: "top";
            };
            readonly "top-end": {
                readonly blockEdge: "top";
                readonly inlineEdge: "end";
                readonly stackFrom: "top";
            };
            readonly bottom: {
                readonly blockEdge: "bottom";
                readonly inlineEdge: "center";
                readonly stackFrom: "bottom";
            };
            readonly "bottom-start": {
                readonly blockEdge: "bottom";
                readonly inlineEdge: "start";
                readonly stackFrom: "bottom";
            };
            readonly "bottom-end": {
                readonly blockEdge: "bottom";
                readonly inlineEdge: "end";
                readonly stackFrom: "bottom";
            };
        };
        readonly tones: {
            readonly neutral: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly badge: Readonly<{
                    source: "theme";
                    key: "surfaceAlt";
                    alpha?: number;
                }>;
                readonly mark: "notifications";
            };
            readonly info: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly badge: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly mark: "info";
            };
            readonly success: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly badge: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly mark: "success";
            };
            readonly warning: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly badge: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly mark: "warning";
            };
            readonly danger: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly badge: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly mark: "alert";
            };
        };
        readonly material: {
            readonly radius: 24;
            readonly blur: 20;
            readonly opacity: 0.96;
            readonly light: {
                readonly background: "#FAFBFE";
                readonly border: "#E3E6EB";
                readonly foreground: "#202124";
                readonly secondary: "#626873";
                readonly close: "#696F79";
            };
            readonly dark: {
                readonly background: "#27282B";
                readonly border: "#4D4F54";
                readonly foreground: "#F6F7F9";
                readonly secondary: "#B4B8C0";
                readonly close: "#B4B8C0";
            };
        };
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "xl";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly minHeight: 56;
            readonly padding: {
                readonly block: 12;
                readonly inline: 16;
            };
            readonly gap: 12;
            readonly maxWidth: 420;
        };
        readonly anchor: {
            readonly blockSize: 32;
        };
        readonly toneMark: {
            readonly width: 0;
            readonly radius: "full";
        };
        readonly icon: {
            readonly glyph: "sm";
            readonly badgeDiameter: 32;
            readonly badgeRadius: "full";
        };
        readonly media: {
            readonly size: 44;
        };
        readonly content: {
            readonly gap: 4;
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "500";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly progress: {
            readonly gap: 12;
            readonly dotSize: 6;
            readonly currentScale: 1.4;
            readonly doneColor: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly upcomingColor: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly labelColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly currentLabelColor: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "caption";
        };
        readonly action: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
            readonly radius: "full";
            readonly align: "start";
            readonly textVariant: "body";
            readonly fontWeight: "500";
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly close: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly diameter: 44;
            readonly glyph: "xs";
            readonly blockOverhang: number;
            readonly inlineOverhang: number;
        };
        readonly states: {
            readonly pressedOpacity: 0.86;
            readonly draggedOpacity: 0.64;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
        readonly gesture: {
            readonly dismissThreshold: 50;
        };
        readonly transition: {
            readonly web: {
                readonly enter: {
                    readonly duration: 120;
                    readonly easing: "standard";
                    readonly reducedMotion: "instant";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
            readonly native: {
                readonly enter: {
                    readonly duration: 200;
                    readonly easing: "enter";
                    readonly reducedMotion: "opacity";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
        };
    };
    readonly tooltipRecipe: {
        readonly slots: readonly ["provider", "trigger", "content", "arrow"];
        readonly defaults: {
            readonly placement: "top";
            readonly align: "center";
        };
        readonly layer: 950;
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly radius: "sm";
            readonly padding: 8;
            readonly borderWidth: 1;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
        };
        readonly content: {
            readonly color: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly maxWidth: 280;
        };
        readonly arrow: {
            readonly width: 10;
            readonly height: 5;
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly padding: 8;
        };
        readonly positioning: {
            readonly sideOffset: 4;
            readonly collisionPadding: 12;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 120;
                readonly easing: "standard";
                readonly reducedMotion: "instant";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly topBarRecipe: {
        readonly slots: readonly ["root", "leading", "title", "titleLeading", "titleAction", "trailing", "action", "actionLabel"];
        readonly defaults: {
            readonly centered: true;
        };
        readonly minHeight: 52;
        readonly sideMinWidth: 36;
        readonly paddingHorizontal: 16;
        readonly gap: 4;
        readonly largeTextThreshold: 1.6;
        readonly title: {
            readonly textVariant: "bodyLarge";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly titleAction: {
            readonly minHeight: 44;
            readonly minWidth: 44;
            readonly gap: 8;
            readonly pressedOpacity: 0.86;
        };
        readonly action: {
            readonly size: "small";
            readonly hitSlop: 0;
            readonly minHeight: 36;
            readonly minWidth: 36;
            readonly gap: 4;
            readonly paddingHorizontal: 4;
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
        readonly actionLabel: {
            readonly textVariant: "caption";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "500";
        };
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
    };
    readonly treeRecipe: {
        readonly slots: readonly ["root", "node", "toggle", "indent", "label", "description"];
        readonly indentPerLevel: 20;
        readonly node: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly toggle: {
            readonly size: "sm";
            readonly icons: {
                readonly collapsed: "chevronEnd";
                readonly expanded: "chevronDown";
            };
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly hitTarget: 44;
        };
    };
    readonly uploadItemRecipe: {
        readonly slots: readonly ["root", "icon", "name", "meta", "progress", "statusText", "cancel", "retry"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly row: {
            readonly minHeight: 68;
            readonly paddingHorizontal: 16;
            readonly paddingVertical: 8;
            readonly gap: 12;
            readonly radius: "md";
        };
        readonly name: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly meta: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly statusTones: {
            readonly pending: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly uploading: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly success: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly error: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly progress: {
            readonly size: "medium";
            readonly tone: "brand";
            readonly errorTone: "danger";
        };
        readonly action: {
            readonly minTarget: 44;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly visuallyHiddenRecipe: {
        readonly slots: readonly ["root"];
        readonly geometry: {
            readonly width: 1;
            readonly height: 1;
            readonly margin: -1;
            readonly border: 0;
            readonly padding: 0;
        };
        readonly clipping: "inset(50%)";
        readonly overflow: "hidden";
        readonly position: "absolute";
        readonly whiteSpace: "nowrap";
    };
    readonly screenPatternRecipe: {
        readonly pullDismiss: {
            readonly activationDistance: 6;
            readonly distance: 80;
            readonly flickDistance: 32;
            readonly flickVelocity: 0.65;
            readonly maxOffset: 160;
            readonly settleDuration: 140;
            readonly topTolerance: 1;
        };
        readonly maxWidth: 720;
        readonly padding: 16;
        readonly sectionGap: 24;
        readonly itemGap: 12;
        readonly stateGap: 16;
        readonly headerMinWidth: number;
        readonly messageMaxWidth: "84%";
        readonly attachmentSize: 80;
        readonly attachmentRemoveSize: 24;
        readonly reactionHoldMs: 450;
        readonly reactionMoveTolerance: 10;
        readonly reactionMenuWidth: 320;
        readonly replySwipeDistance: 60;
        readonly composerMinLines: 1;
        readonly composerMaxLines: 5;
    };
    readonly searchScreenRecipe: {
        readonly debounceMs: 300;
        readonly recentVisible: 5;
        readonly suggestionVisible: 6;
        readonly loadingRows: 4;
        readonly sectionGap: 24;
        readonly headerGap: 12;
        readonly chipGap: 8;
    };
    readonly chatMessageRecipe: {
        readonly avatarSize: 32;
        readonly avatarGap: 8;
        readonly authorGap: 4;
        readonly metaGap: 4;
        readonly bubbleRadius: 14;
        readonly bubblePaddingInline: 10;
        readonly bubblePaddingBlock: 6;
        readonly runGap: 6;
        readonly groupGap: 12;
        readonly tailWidth: 7;
        readonly tailHeight: 10;
        readonly tailCornerRadius: 4;
        readonly jumpToLatestGap: 8;
        readonly timelineInset: 10;
        readonly mediaWidth: 210;
        readonly mediaGap: 2;
        readonly reactionSummary: {
            readonly minHeight: 24;
            readonly paddingInline: 8;
            readonly itemGap: 4;
            readonly emojiGap: 2;
            readonly minCount: 2;
        };
    };
    readonly commentThreadRecipe: {
        readonly avatarSize: 32;
        readonly replyAvatarSize: 24;
        readonly avatarGap: 8;
        readonly lineGap: 4;
        readonly rowGap: 20;
        readonly replyIndent: number;
        readonly likeColumnWidth: 44;
        readonly mediaMaxWidth: 160;
        readonly mediaRadius: 12;
        readonly panelGap: 8;
        readonly menuGlyphSize: 20;
        readonly actionAnchor: {
            readonly authorTextVariant: "caption";
            readonly inlineTextVariant: "body";
        };
    };
    readonly notificationRowRecipe: {
        readonly separatorInsetStart: number;
        readonly interaction: {
            readonly disabledOpacity: 0.5;
            readonly pressedOpacity: 0.86;
        };
        readonly gap: 12;
        readonly contentGap: 4;
        readonly avatarSize: 44;
        readonly avatarBadgeSize: 20;
        readonly thumbnailSize: 44;
        readonly unreadSize: 6;
        readonly previewLines: 2;
        readonly paddingBlock: 12;
        readonly paddingInline: 16;
    };
    readonly profileSummaryRecipe: Readonly<{
        avatarSize: 72;
        avatarGlyphSize: 44;
        actionsLayouts: Readonly<{
            inline: Readonly<{
                readonly axis: "inline";
                readonly gap: "xs";
            }>;
            stacked: Readonly<{
                readonly axis: "block";
                readonly gap: "xs";
            }>;
        }>;
        editAction: Readonly<{
            readonly tone: "secondary";
            readonly size: "small";
        }>;
    }>;
    readonly iconTileRecipe: Readonly<{
        iconSize: 64;
        labelMaxWidth: 72;
        multilineLabelMaxWidth: 84;
        multilineLabelMinHeight: 44;
        ghostOpacity: 0.55;
        gap: 6;
        iconRadius: "22%";
        shapes: Readonly<Record<import("./screen-patterns.js").IconTileShape, number>>;
        activation: Readonly<{
            minimumTarget: 44;
            pressedOpacity: 0.86;
            disabledOpacity: 0.5;
        }>;
        fillMinSize: 48;
        fillMaxSize: 68;
        defaults: Readonly<{
            frame: import("./screen-patterns.js").IconTileFrame;
            shape: import("./screen-patterns.js").IconTileShape;
            size: import("./screen-patterns.js").IconTileSize;
        }>;
    }>;
    readonly composerQuickInsertRecipe: {
        readonly itemSize: 44;
        readonly emojiSize: 26;
        readonly gap: 8;
    };
    readonly typingIndicatorRecipe: {
        readonly dotSize: 6;
        readonly dotGap: 4;
        readonly cycleMs: 1200;
        readonly staggerMs: 160;
        readonly restOpacity: 0.35;
    };
    readonly chatDateSeparatorRecipe: {
        readonly paddingTop: 12;
        readonly paddingBottom: 4;
        readonly textVariant: "caption";
        readonly tone: "muted";
    };
};
export type RecipeName = keyof typeof recipeRegistry;
//# sourceMappingURL=catalog.d.ts.map