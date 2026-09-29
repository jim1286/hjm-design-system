import { componentCatalog, getComponentSurfaceStatus, } from "./catalog.js";
/**
 * A small, deliberate environment matrix catches the high-risk differences
 * without multiplying every story into an unreadable Cartesian product.
 */
export const showcaseEnvironmentMatrix = [
    {
        id: "default",
        label: "Light · LTR · 100%",
        theme: "light",
        direction: "ltr",
        textScale: 1,
        motion: "full",
    },
    {
        id: "dark",
        label: "Dark · LTR · 100%",
        theme: "dark",
        direction: "ltr",
        textScale: 1,
        motion: "full",
    },
    {
        id: "large-text",
        label: "Light · LTR · 200%",
        theme: "light",
        direction: "ltr",
        textScale: 2,
        motion: "full",
    },
    {
        id: "rtl",
        label: "Light · RTL · 100%",
        theme: "light",
        direction: "rtl",
        textScale: 1,
        motion: "full",
    },
    {
        id: "reduced-motion",
        label: "Light · LTR · Reduced motion",
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
        label: "Contract",
        description: "Anatomy, defaults, supported axes, platform and maturity are visible.",
    },
    {
        id: "default",
        label: "Default",
        description: "The normal state renders using recipe defaults without product overrides.",
    },
    {
        id: "dark",
        label: "Dark",
        description: "Semantic colors remain legible on the dark theme.",
    },
    {
        id: "long-copy",
        label: "Long copy",
        description: "Long Korean and English copy wraps without clipping or hiding meaning.",
    },
    {
        id: "large-text",
        label: "200% text",
        description: "Text can grow to 200% without truncating required information.",
    },
    {
        id: "rtl",
        label: "RTL",
        description: "Logical start/end layout and directional icons mirror correctly.",
    },
    {
        id: "reduced-motion",
        label: "Reduced motion",
        description: "Motion follows the recipe reduced-motion fallback.",
    },
    {
        id: "accessibility",
        label: "Accessibility",
        description: "Names, states, relationships, contrast and touch targets are inspectable.",
    },
    {
        id: "keyboard",
        label: "Keyboard",
        description: "Focus order and documented keyboard behavior run as interaction tests.",
    },
    {
        id: "native-actions",
        label: "Native actions",
        description: "Accessible host actions and their state transitions run against the Native renderer.",
    },
    {
        id: "platform-parity",
        label: "Web / Native parity",
        description: "Adaptive renderers preserve intent while using platform-native behavior.",
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
    "calendar", "carousel", "checkbox", "checkboxGroup", "chip", "collapsible", "combobox",
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
]);
function getRendererShowcaseScenarios(entry, surface) {
    const requirements = rendererRequirements.filter((scenario) => scenario !== "long-copy" || !textlessComponentNames.has(entry.name));
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