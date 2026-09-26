export const reactRendererEvidenceSchemaVersion = 2;
const defaultProofFile = "test/default-render.ssr.test.tsx";
const matrixProofFile = "test/scenario-matrix.browser.test.tsx";
/**
 * Environment scenarios proven in a real browser by scenario-matrix.browser.
 * Until 1.5.0 every component claimed all seven scenarios from one SSR test
 * that only checked the provider wrapper's attributes. A component now claims
 * a matrix scenario only if the matrix assertion for it passes.
 */
const matrixScenarios = ["accessibility", "dark", "large-text", "rtl", "reduced-motion"];
/**
 * Scenarios a component does not pass yet. Each entry is promotion debt that
 * the generated evidence projection reports; remove it when the component is
 * fixed and the matrix case passes.
 */
const webScenarioGaps = {};
/** Fixtures that render long copy inside the component (renderLongCopy). */
const webLongCopyFixtures = new Set([
    "design-system-provider",
    "stack",
    "container",
    "text",
    "surface",
    "button",
    "field",
    "text-area",
    "card",
    "notice",
    "list-row",
    "tag",
    "badge",
    "chip",
    "link",
    "heading",
    "empty-state",
    "top",
    "section",
    "segmented-control",
    "top-bar",
    "bottom-cta",
    "result",
    "progress",
    "description-list",
    "toast",
    "statistic",
    "radio-group",
    "checkbox-group",
    "auth-provider-button",
    "password-field",
]);
function defaultClaim(componentId, exportNames, subpath) {
    const gaps = webScenarioGaps[componentId] ?? [];
    const matrix = [
        ...matrixScenarios.filter((scenario) => !gaps.includes(scenario)),
        ...(webLongCopyFixtures.has(componentId) && !gaps.includes("long-copy") ? ["long-copy"] : []),
    ];
    return {
        componentId,
        exportNames,
        subpath,
        scenarios: ["default", ...matrix],
        proofs: [
            { scenarios: ["default"], file: defaultProofFile, caseId: componentId },
            ...(matrix.length === 0 ? [] : [{ scenarios: matrix, file: matrixProofFile, caseId: componentId }]),
        ],
    };
}
function stableFieldClaim(exportNames, subpath) {
    const base = defaultClaim("field", exportNames, subpath);
    return {
        ...base,
        scenarios: [...base.scenarios, "keyboard"],
        proofs: [
            ...base.proofs,
            {
                scenarios: ["keyboard"],
                file: "test/stable-core.browser.test.tsx",
                caseId: "field",
            },
        ],
    };
}
function toastClaim() {
    const base = defaultClaim("toast", ["Toast", "ToastProvider", "useToast"], "./toast");
    return {
        ...base,
        // SSR proves semantics but cannot catch the close-only row seen in BurnTok.
        // Keep real geometry evidence attached without promoting catalog maturity.
        proofs: [...base.proofs, {
                scenarios: ["dark", "long-copy", "large-text", "rtl"],
                file: "test/toast-layout.browser.test.tsx",
                caseId: "toast",
            }],
    };
}
/**
 * First-party Web renderer claims. Scenario axes remain fail-closed: the
 * default scenario is an SSR render, the environment and accessibility
 * scenarios are computed-style assertions in scenario-matrix.browser.
 * Keyboard and cross-platform parity remain fail-closed until dedicated
 * interaction or paired-renderer proofs are mapped one-to-one.
 */
export const reactRendererEvidence = {
    schemaVersion: reactRendererEvidenceSchemaVersion,
    packageName: "@hjmds/react",
    packageVersion: "1.6.0",
    surface: "web",
    components: [
        defaultClaim("top-bar", ["TopBar"], "./top-bar"),
        defaultClaim("bottom-cta", ["BottomCTA"], "./bottom-cta"),
        defaultClaim("design-system-provider", ["HjmProvider", "useHjmTheme"], "./provider"),
        defaultClaim("text", ["Text"], "./layout"),
        defaultClaim("surface", ["Surface"], "./layout"),
        defaultClaim("icon", ["Icon"], "./display"),
        defaultClaim("stack", ["Stack"], "./layout"),
        defaultClaim("container", ["Container"], "./layout"),
        defaultClaim("aspect-ratio", ["AspectRatio"], "./layout"),
        defaultClaim("grid", ["Grid"], "./layout"),
        defaultClaim("layout", ["Layout"], "./layout"),
        defaultClaim("button", ["Button"], "./actions"),
        defaultClaim("icon-button", ["IconButton"], "./actions"),
        defaultClaim("link", ["Link"], "./actions"),
        stableFieldClaim(["Field", "TextField"], "./forms"),
        defaultClaim("search-field", ["SearchField"], "./forms"),
        defaultClaim("text-area", ["TextArea"], "./forms"),
        defaultClaim("password-field", ["PasswordField"], "./password-field"),
        defaultClaim("otp-field", ["OtpField"], "./otp-field"),
        defaultClaim("number-field", ["NumberField"], "./number-field"),
        defaultClaim("slider", ["Slider"], "./slider"),
        defaultClaim("form", ["Form"], "./forms"),
        defaultClaim("date-picker", ["DatePicker"], "./date-picker"),
        defaultClaim("calendar", ["Calendar"], "./calendar"),
        defaultClaim("file-picker", ["FilePicker"], "./file-picker"),
        defaultClaim("checkbox", ["Checkbox"], "./selection"),
        defaultClaim("radio", ["Radio"], "./selection"),
        defaultClaim("checkbox-group", ["CheckboxGroup"], "./selection"),
        defaultClaim("radio-group", ["RadioGroup"], "./selection"),
        defaultClaim("switch", ["Switch"], "./selection"),
        defaultClaim("segmented-control", ["SegmentedControl"], "./selection"),
        defaultClaim("chip", ["Chip"], "./selection"),
        defaultClaim("tabs", ["Tabs"], "./navigation"),
        defaultClaim("breadcrumb", ["Breadcrumb"], "./breadcrumb"),
        defaultClaim("pagination", ["Pagination"], "./pagination"),
        defaultClaim("popover", ["Popover"], "./popover"),
        defaultClaim("side-panel", ["SidePanel"], "./side-panel"),
        defaultClaim("splitter", ["Splitter"], "./splitter"),
        defaultClaim("tour", ["Tour"], "./tour"),
        defaultClaim("tree", ["Tree"], "./tree"),
        defaultClaim("transfer-list", ["TransferList"], "./transfer-list"),
        defaultClaim("mentions", ["Mentions"], "./mentions"),
        defaultClaim("command-palette", ["CommandPalette"], "./command-palette"),
        defaultClaim("agreement", ["Agreement"], "./agreement"),
        defaultClaim("top", ["Top"], "./top"),
        defaultClaim("heading", ["Heading"], "./heading"),
        defaultClaim("text-format", ["TextFormat"], "./text-formats"),
        defaultClaim("toggle-group", ["ToggleGroup"], "./toggle-group"),
        defaultClaim("tags-input", ["TagsInput"], "./tags-input"),
        defaultClaim("skip-nav", ["SkipNav"], "./skip-nav"),
        defaultClaim("bottom-info", ["BottomInfo"], "./bottom-info"),
        defaultClaim("sidebar", ["Sidebar"], "./sidebar"),
        defaultClaim("date-range-picker", ["DateRangePicker"], "./date-range"),
        defaultClaim("auth-provider-button", ["AuthProviderButton"], "./provider-button"),
        defaultClaim("auth-screen", ["AuthScreenLayout"], "./auth-screen"),
        defaultClaim("data-table", ["DataTable"], "./data-table"),
        defaultClaim("collapsible", ["Collapsible"], "./collapsible"),
        defaultClaim("context-menu", ["ContextMenu"], "./context-menu"),
        defaultClaim("menubar", ["Menubar"], "./menubar"),
        defaultClaim("asset", ["Asset", "AssetGroup"], "./asset"),
        defaultClaim("anchor", ["Anchor"], "./anchor"),
        defaultClaim("bottom-navigation", ["BottomNavigation"], "./navigation"),
        defaultClaim("load-more", ["LoadMore"], "./navigation"),
        defaultClaim("carousel", ["Carousel"], "./carousel"),
        defaultClaim("floating-action-button", ["FloatingActionButton"], "./floating-action-button"),
        defaultClaim("steps", ["Steps"], "./steps"),
        defaultClaim("badge", ["Badge"], "./display"),
        defaultClaim("avatar", ["Avatar"], "./display"),
        defaultClaim("counter-badge", ["CounterBadge"], "./display"),
        defaultClaim("card", ["Card"], "./display"),
        defaultClaim("list", ["List"], "./display"),
        defaultClaim("list-row", ["ListRow"], "./display"),
        defaultClaim("tag", ["Tag"], "./display"),
        defaultClaim("accordion", ["Accordion"], "./display"),
        defaultClaim("divider", ["Divider"], "./display"),
        defaultClaim("statistic", ["Statistic", "StatisticGroup"], "./display"),
        defaultClaim("section", ["Section"], "./layout"),
        defaultClaim("upload-item", ["UploadItem"], "./upload-item"),
        defaultClaim("timeline", ["Timeline"], "./display"),
        defaultClaim("description-list", ["DescriptionList"], "./display"),
        defaultClaim("image", ["Image"], "./display"),
        defaultClaim("empty-state", ["EmptyState"], "./feedback"),
        defaultClaim("notice", ["Notice"], "./feedback"),
        defaultClaim("progress", ["Progress"], "./feedback"),
        defaultClaim("spinner", ["Spinner"], "./feedback"),
        defaultClaim("skeleton", ["Skeleton"], "./feedback"),
        defaultClaim("result", ["Result"], "./feedback"),
        toastClaim(),
        defaultClaim("select", ["Select"], "./forms"),
        defaultClaim("combobox", ["Combobox"], "./forms"),
        defaultClaim("dialog", ["Dialog"], "./overlays"),
        defaultClaim("alert-dialog", ["AlertDialog"], "./overlays"),
        defaultClaim("sheet", ["Sheet"], "./overlays"),
        defaultClaim("tooltip", ["Tooltip"], "./overlays"),
        defaultClaim("visually-hidden", ["VisuallyHidden"], "./layout"),
        defaultClaim("menu", ["Menu"], "./overlays"),
    ],
};
//# sourceMappingURL=evidence.js.map