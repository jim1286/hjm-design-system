import { componentCatalog, getComponentSurfaceStatus, } from "./catalog.js";
/**
 * A small, deliberate environment matrix catches the high-risk differences
 * without multiplying every story into an unreadable Cartesian product.
 */
export const showcaseEnvironmentMatrix = [
    {
        id: "default",
        label: "밝게 · 왼쪽→오른쪽 · 100%",
        theme: "light",
        direction: "ltr",
        textScale: 1,
        motion: "full",
    },
    {
        id: "dark",
        label: "어둡게 · 왼쪽→오른쪽 · 100%",
        theme: "dark",
        direction: "ltr",
        textScale: 1,
        motion: "full",
    },
    {
        id: "large-text",
        label: "밝게 · 왼쪽→오른쪽 · 200%",
        theme: "light",
        direction: "ltr",
        textScale: 2,
        motion: "full",
    },
    {
        id: "rtl",
        label: "밝게 · 오른쪽→왼쪽 · 100%",
        theme: "light",
        direction: "rtl",
        textScale: 1,
        motion: "full",
    },
    {
        id: "reduced-motion",
        label: "밝게 · 왼쪽→오른쪽 · 동작 줄이기",
        theme: "light",
        direction: "ltr",
        textScale: 1,
        motion: "reduced",
    },
];
/** Bridges documentation fixtures to the same environment contract products consume. */
export function getShowcaseEnvironmentInput(environment) {
    const textScale = environment.textScale;
    return {
        theme: environment.theme,
        direction: environment.direction,
        textScale,
        reducedMotion: environment.motion === "reduced",
    };
}
export const showcaseScenarios = [
    {
        id: "contract",
        label: "계약",
        description: "구조·기본값·지원 축·플랫폼과 성숙도가 보인다.",
    },
    {
        id: "default",
        label: "기본",
        description: "제품 설정을 덮어쓰지 않고 recipe 기본값으로 보통 상태를 그린다.",
    },
    {
        id: "dark",
        label: "어두운 테마",
        description: "어두운 테마에서도 의미 색이 읽힌다.",
    },
    {
        id: "long-copy",
        label: "긴 문구",
        description: "긴 한국어·영어 문구가 잘리거나 의미를 숨기지 않고 줄바꿈된다.",
    },
    {
        id: "large-text",
        label: "200% 글자",
        description: "글자를 200%까지 키워도 필요한 정보가 잘리지 않는다.",
    },
    {
        id: "rtl",
        label: "오른쪽→왼쪽",
        description: "논리적 시작·끝 배치와 방향 아이콘이 올바르게 뒤집힌다.",
    },
    {
        id: "reduced-motion",
        label: "동작 줄이기",
        description: "움직임이 recipe의 동작 줄이기 대체 표현을 따른다.",
    },
    {
        id: "accessibility",
        label: "접근성",
        description: "이름·상태·관계·대비·터치 영역을 확인할 수 있다.",
    },
    {
        id: "keyboard",
        label: "키보드",
        description: "포커스 순서와 문서화한 키보드 동작을 상호작용 테스트로 실행한다.",
    },
    {
        id: "native-actions",
        label: "앱 동작",
        description: "접근성 동작과 그 상태 변화를 Native renderer에서 실행한다.",
    },
    {
        id: "platform-parity",
        label: "웹·앱 동등성",
        description: "각 renderer가 플랫폼 고유 동작을 쓰면서 같은 의도를 유지한다.",
    },
];
const plannedRequirements = ["contract"];
const rendererRequirements = [
    "default",
    "dark",
    "long-copy",
    "large-text",
    "rtl",
    "reduced-motion",
    "accessibility",
];
export function getShowcaseStoryId(entry) {
    const slug = entry.name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
    return `${entry.category}/${slug}`;
}
export function getRequiredShowcaseScenarios(entry) {
    const activeSurfaces = ["web", "native"].filter((surface) => isRendererMaturity(getComponentSurfaceStatus(entry, surface)));
    if (activeSurfaces.length === 0)
        return plannedRequirements;
    const rendererScenarios = [...new Set(activeSurfaces.flatMap((surface) => getRendererShowcaseScenarios(entry, surface)))];
    return [
        "contract",
        ...rendererScenarios,
    ];
}
function isRendererMaturity(status) {
    return status === "stable" || status === "beta";
}
// These outputs expose no consumer-authored visible prose; default and accessibility proofs remain required.
const textlessComponentNames = new Set([
    "Icon", "IconButton", "Skeleton", "Spinner", "ThinkingOrb", "Divider",
    "Avatar", "Asset", "CounterBadge", "Image", "VisuallyHidden", "Pagination",
    // These own form/range behavior but no long-form text slot; their child fields
    // and calendar cells own their copy, so duplicating that proof here misattributes it.
    "Form", "DateRangePicker",
    // 2026-10-18: Chart's category/series labels are short identifiers and its text alternative is a hidden
    // description for assistive technology; ImageChoiceGroup tiles carry accessible names, not visible copy.
    // Neither has a long-form text slot, so the long-copy proof would measure a product caption, not the component.
    "Chart", "ImageChoiceGroup",
    // 1.31: TypingIndicator's label is announced only (the bubble shows dots) and PageIndicator's names are the
    // group and dot accessible names, like Pagination; neither draws product prose to wrap.
    "TypingIndicator", "PageIndicator",
]);
// These behaviors expose no interaction on either rendered surface.
const semanticOnlyBehaviors = new Set([
    "top", "authScreen", "heading", "bottomInfo", "nativePlatform", "textFormat", "asset",
]);
// Keep surface capability lookup local: importing behaviorRegistry here would pull every
// behavior contract into the lightweight showcase/evidence entry points. The alternative was
// importing that registry; showcase.test.ts cross-checks these names against it to prevent drift.
const webKeyboardBehaviors = new Set([
    "agreement", "alertDialog", "anchor", "authProviderButton", "bottomNavigation", "breadcrumb",
    "calendar", "carousel", "chart", "checkbox", "checkboxGroup", "chip", "collapsible", "combobox",
    "commandPalette", "contextMenu", "dataTable", "datePicker", "dateRange", "dialog",
    "disclosureGroup", "field", "filePicker", "floatingActionButton", "form", "layout", "link",
    "loadMore", "menu", "menubar", "numberField", "otpField", "pagination", "passwordField",
    "popover", "radioGroup", "searchField", "segmentedControl", "select", "sheet", "sidePanel",
    "sidebar", "skipNav", "slider", "splitter", "switch", "tabs", "tagsInput", "toast",
    "toggleGroup", "tooltip", "tour", "transferList", "tree", "uploadItem",
]);
const nativeActionBehaviors = new Set([
    "agreement", "alertDialog", "authProviderButton", "bottomNavigation", "calendar", "carousel",
    "checkbox", "checkboxGroup", "chip", "collapsible", "combobox", "datePicker", "dateRange",
    "dialog", "disclosureGroup", "field", "filePicker", "floatingActionButton", "form", "link",
    "loadMore", "menu", "numberField", "otpField", "passwordField", "radioGroup", "searchField",
    "segmentedControl", "select", "sheet", "slider", "switch", "tabs", "tagsInput", "toast",
    "toggleGroup", "transferList", "uploadItem",
    // 2026-10-14: Native DataTable sort/row actions and chart adjustable stepping.
    "dataTable", "chart",
    // 2026-10-18: Pagination became shared with a Native beta renderer (1bae9c1a); its page buttons declare the
    // activate action, so the Native surface owns a native-actions requirement like every other action behavior.
    "pagination",
]);
function getRendererShowcaseScenarios(entry, surface) {
    const requirements = rendererRequirements.filter((scenario) => scenario !== "long-copy" || !textlessComponentNames.has(entry.name));
    // ColorPicker composes native form controls; its text commit/escape behavior still needs real keyboard proof.
    if (entry.name === "ColorPicker" && surface === "web")
        requirements.push("keyboard");
    if (entry.behavior && !semanticOnlyBehaviors.has(entry.behavior)) {
        // Web owns DOM key bindings; Native declares host accessibility actions instead, so Pressable tests must not claim physical keyboard proof.
        if (surface === "web" && webKeyboardBehaviors.has(entry.behavior))
            requirements.push("keyboard");
        if (surface === "native" && nativeActionBehaviors.has(entry.behavior))
            requirements.push("native-actions");
    }
    return requirements;
}
export function getRequiredShowcaseSurfaces(entry) {
    return getRequiredShowcaseEvidence(entry).map(({ surface }) => surface);
}
export function getRequiredShowcaseEvidence(entry) {
    const requirements = [
        { surface: "contract", scenarios: ["contract"] },
    ];
    const activeSurfaces = ["web", "native"].filter((surface) => isRendererMaturity(getComponentSurfaceStatus(entry, surface)));
    for (const surface of activeSurfaces) {
        requirements.push({ surface, scenarios: getRendererShowcaseScenarios(entry, surface) });
    }
    return requirements;
}
export function createShowcaseManifest(entries = componentCatalog) {
    return entries.map((component) => ({
        storyId: getShowcaseStoryId(component),
        component,
        surfaceMaturity: {
            web: getComponentSurfaceStatus(component, "web"),
            native: getComponentSurfaceStatus(component, "native"),
        },
        requirements: getRequiredShowcaseEvidence(component),
        requiredScenarios: getRequiredShowcaseScenarios(component),
        requiredSurfaces: getRequiredShowcaseSurfaces(component),
    }));
}
export const showcaseManifest = createShowcaseManifest();
export function createShowcaseCoverage(evidence, manifest = showcaseManifest) {
    return manifest.map(({ storyId, component, requirements }) => {
        const componentEvidence = evidence.filter((entry) => entry.storyId === storyId);
        const missingEvidence = requirements.flatMap(({ surface, scenarios }) => scenarios
            .filter((scenario) => !componentEvidence.some((entry) => entry.surface === surface && entry.scenarios.includes(scenario)))
            .map((scenario) => ({ surface, scenario })));
        const missingSurfaces = [...new Set(missingEvidence.map(({ surface }) => surface))];
        const missingScenarios = [...new Set(missingEvidence.map(({ scenario }) => scenario))];
        return {
            storyId,
            component,
            missingEvidence,
            missingSurfaces,
            missingScenarios,
            complete: missingSurfaces.length === 0 && missingScenarios.length === 0,
        };
    });
}
export function assertShowcaseCoverage(evidence, manifest = showcaseManifest) {
    const missing = createShowcaseCoverage(evidence, manifest).filter(({ complete }) => !complete);
    if (missing.length === 0)
        return;
    const details = missing
        .map(({ storyId, missingEvidence }) => `${storyId} (${missingEvidence.map(({ surface, scenario }) => `${surface}/${scenario}`).join(", ") || "none"})`)
        .join("\n");
    throw new Error(`Showcase evidence is incomplete:\n${details}`);
}
export function summarizeShowcaseMaturity(entries = componentCatalog) {
    return entries.reduce((summary, entry) => {
        summary[entry.status] += 1;
        return summary;
    }, { stable: 0, beta: 0, planned: 0, deprecated: 0 });
}
//# sourceMappingURL=showcase.js.map