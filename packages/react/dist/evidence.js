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
    "masonry", "virtual-list", "qr-code", "color-picker", "watermark", "affix",
    "design-system-provider",
    "text-format",
    "aspect-ratio",
    "grid",
    "splitter",
    "layout",
    "steps",
    "breadcrumb",
    "auth-screen",
    "radio",
    "list",
    "timeline",
    "bottom-info",
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
    "accordion",
    "file-picker",
    "agreement",
    "bottom-navigation",
    "load-more",
    "tabs",
    "badge",
    "chip",
    "link",
    "select",
    "combobox",
    "heading",
    "empty-state",
    "top",
    "section",
    "segmented-control",
    "top-bar",
    "mentions",
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
    "search-field",
    "number-field",
    "floating-action-button",
    "checkbox",
    "switch",
    "toggle-group",
    "slider",
    "otp-field",
    "date-picker",
    "menubar",
    "sidebar",
    "transfer-list",
    "upload-item",
    "tags-input",
    "data-table",
    "collapsible",
    "anchor",
    "tree",
    "carousel",
    "calendar",
    "dialog",
    "tooltip",
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
function keyboardClaim(componentId, exportNames, subpath, proofFile = "test/stable-core.browser.test.tsx") {
    const base = defaultClaim(componentId, exportNames, subpath);
    return {
        ...base,
        scenarios: [...base.scenarios, "keyboard"],
        proofs: [
            ...base.proofs,
            {
                scenarios: ["keyboard"],
                file: proofFile,
                caseId: componentId,
            },
        ],
    };
}
function keyboardAndLongCopyClaim(componentId, exportNames, subpath, proofFile) {
    const base = defaultClaim(componentId, exportNames, subpath);
    return {
        ...base,
        scenarios: [...base.scenarios, "keyboard", "long-copy"],
        proofs: [...base.proofs, { scenarios: ["keyboard", "long-copy"], file: proofFile, caseId: componentId }],
    };
}
function toastClaim() {
    const base = defaultClaim("toast", ["Toast", "ToastProvider", "useToast"], "./toast");
    return {
        ...base,
        scenarios: [...base.scenarios, "keyboard"],
        // SSR proves semantics but cannot catch the close-only row seen in BurnTok.
        // Keep real geometry evidence attached without promoting catalog maturity.
        proofs: [...base.proofs,
            { scenarios: ["keyboard"], file: "test/stable-core.browser.test.tsx", caseId: "toast" },
            { scenarios: ["dark", "long-copy", "large-text", "rtl"], file: "test/toast-layout.browser.test.tsx", caseId: "toast" },
        ],
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
    packageVersion: "1.17.2",
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
        keyboardClaim("layout", ["Layout"], "./layout"),
        defaultClaim("button", ["Button"], "./actions"),
        defaultClaim("icon-button", ["IconButton"], "./actions"),
        keyboardClaim("link", ["Link"], "./actions"),
        keyboardClaim("field", ["Field", "TextField"], "./forms"),
        keyboardClaim("search-field", ["SearchField"], "./forms"),
        defaultClaim("text-area", ["TextArea"], "./forms"),
        keyboardClaim("password-field", ["PasswordField"], "./password-field"),
        keyboardClaim("otp-field", ["OtpField"], "./otp-field"),
        keyboardClaim("number-field", ["NumberField"], "./number-field"),
        keyboardClaim("slider", ["Slider"], "./slider"),
        keyboardClaim("form", ["Form"], "./forms", "test/form.keyboard.browser.test.tsx"),
        keyboardClaim("date-picker", ["DatePicker"], "./date-picker"),
        keyboardClaim("calendar", ["Calendar"], "./calendar", "test/calendar.browser.test.tsx"),
        keyboardClaim("file-picker", ["FilePicker"], "./file-picker", "test/file-picker.keyboard.browser.test.tsx"),
        keyboardClaim("checkbox", ["Checkbox"], "./selection"),
        defaultClaim("radio", ["Radio"], "./selection"),
        keyboardClaim("checkbox-group", ["CheckboxGroup"], "./selection"),
        keyboardClaim("radio-group", ["RadioGroup"], "./selection"),
        keyboardClaim("switch", ["Switch"], "./selection"),
        keyboardClaim("segmented-control", ["SegmentedControl"], "./selection"),
        keyboardClaim("chip", ["Chip"], "./selection"),
        keyboardClaim("tabs", ["Tabs"], "./navigation", "test/tabs.keyboard.browser.test.tsx"),
        keyboardClaim("breadcrumb", ["Breadcrumb"], "./breadcrumb", "test/page-navigation.browser.test.tsx"),
        keyboardClaim("pagination", ["Pagination"], "./pagination", "test/pagination.keyboard.browser.test.tsx"),
        keyboardAndLongCopyClaim("popover", ["Popover"], "./popover", "test/popover.browser.test.tsx"),
        keyboardAndLongCopyClaim("side-panel", ["SidePanel"], "./side-panel", "test/side-panel.browser.test.tsx"),
        keyboardClaim("splitter", ["Splitter"], "./splitter", "test/splitter.browser.test.tsx"),
        keyboardAndLongCopyClaim("tour", ["Tour"], "./tour", "test/tour.browser.test.tsx"),
        keyboardClaim("tree", ["Tree"], "./tree", "test/tree.browser.test.tsx"),
        keyboardClaim("transfer-list", ["TransferList"], "./transfer-list", "test/transfer-list.browser.test.tsx"),
        keyboardClaim("mentions", ["Mentions"], "./mentions", "test/mentions.browser.test.tsx"),
        keyboardAndLongCopyClaim("command-palette", ["CommandPalette"], "./command-palette", "test/command-palette.browser.test.tsx"),
        keyboardClaim("agreement", ["Agreement"], "./agreement", "test/agreement.keyboard.browser.test.tsx"),
        defaultClaim("top", ["Top"], "./top"),
        defaultClaim("heading", ["Heading"], "./heading"),
        defaultClaim("text-format", ["TextFormat"], "./text-formats"),
        keyboardClaim("toggle-group", ["ToggleGroup"], "./toggle-group"),
        keyboardClaim("tags-input", ["TagsInput"], "./tags-input"),
        keyboardAndLongCopyClaim("skip-nav", ["SkipNav"], "./skip-nav", "test/skip-nav.browser.test.tsx"),
        defaultClaim("bottom-info", ["BottomInfo"], "./bottom-info"),
        keyboardClaim("sidebar", ["Sidebar"], "./sidebar", "test/sidebar.browser.test.tsx"),
        keyboardClaim("date-range-picker", ["DateRangePicker"], "./date-range", "test/date-range.keyboard.browser.test.tsx"),
        keyboardClaim("auth-provider-button", ["AuthProviderButton"], "./provider-button"),
        defaultClaim("auth-screen", ["AuthScreenLayout"], "./auth-screen"),
        keyboardClaim("data-table", ["DataTable"], "./data-table", "test/data-table.keyboard.browser.test.tsx"),
        keyboardClaim("collapsible", ["Collapsible"], "./collapsible", "test/collapsible.keyboard.browser.test.tsx"),
        keyboardAndLongCopyClaim("context-menu", ["ContextMenu"], "./context-menu", "test/context-menu.interactions.browser.test.tsx"),
        keyboardClaim("menubar", ["Menubar"], "./menubar", "test/menubar.keyboard.browser.test.tsx"),
        defaultClaim("asset", ["Asset", "AssetGroup"], "./asset"),
        keyboardClaim("anchor", ["Anchor"], "./anchor", "test/anchor.browser.test.tsx"),
        keyboardClaim("bottom-navigation", ["BottomNavigation"], "./navigation", "test/bottom-navigation.keyboard.browser.test.tsx"),
        keyboardClaim("load-more", ["LoadMore"], "./navigation", "test/load-more.interactions.browser.test.tsx"),
        keyboardClaim("carousel", ["Carousel"], "./carousel", "test/carousel.browser.test.tsx"),
        keyboardClaim("floating-action-button", ["FloatingActionButton"], "./floating-action-button"),
        defaultClaim("steps", ["Steps"], "./steps"),
        defaultClaim("badge", ["Badge"], "./display"),
        defaultClaim("avatar", ["Avatar"], "./display"),
        defaultClaim("counter-badge", ["CounterBadge"], "./display"),
        defaultClaim("card", ["Card"], "./display"),
        defaultClaim("list", ["List"], "./display"),
        defaultClaim("list-row", ["ListRow"], "./display"),
        defaultClaim("tag", ["Tag"], "./display"),
        keyboardClaim("accordion", ["Accordion"], "./display", "test/accordion.keyboard.browser.test.tsx"),
        defaultClaim("divider", ["Divider"], "./display"),
        defaultClaim("statistic", ["Statistic", "StatisticGroup"], "./display"),
        defaultClaim("section", ["Section"], "./layout"),
        keyboardClaim("upload-item", ["UploadItem"], "./upload-item", "test/upload-item.browser.test.tsx"),
        defaultClaim("timeline", ["Timeline"], "./display"),
        defaultClaim("description-list", ["DescriptionList"], "./display"),
        defaultClaim("image", ["Image"], "./display"),
        defaultClaim("empty-state", ["EmptyState"], "./feedback"),
        defaultClaim("notice", ["Notice"], "./feedback"),
        defaultClaim("progress", ["Progress"], "./feedback"),
        {
            componentId: "thinking-orb",
            exportNames: ["ThinkingOrb"],
            subpath: "./thinking-orb",
            scenarios: ["default", "dark", "large-text", "rtl", "reduced-motion", "accessibility"],
            proofs: [
                { scenarios: ["default"], file: defaultProofFile, caseId: "thinking-orb" },
                {
                    scenarios: ["dark", "large-text", "rtl", "reduced-motion", "accessibility"],
                    file: "test/thinking-orb.browser.test.tsx",
                    caseId: "thinking-orb",
                },
            ],
        },
        keyboardClaim("color-picker", ["ColorPicker"], "./color-picker", "test/web-additions.browser.test.tsx"),
        defaultClaim("watermark", ["Watermark"], "./watermark"),
        defaultClaim("affix", ["Affix"], "./affix"),
        defaultClaim("masonry", ["Masonry"], "./masonry"),
        defaultClaim("virtual-list", ["VirtualList"], "./virtual-list"),
        defaultClaim("qr-code", ["QRCode"], "./qr-code"),
        defaultClaim("spinner", ["Spinner"], "./feedback"),
        defaultClaim("skeleton", ["Skeleton"], "./feedback"),
        defaultClaim("result", ["Result"], "./feedback"),
        toastClaim(),
        keyboardClaim("select", ["Select"], "./forms"),
        keyboardClaim("combobox", ["Combobox"], "./forms"),
        keyboardClaim("dialog", ["Dialog"], "./overlays", "test/advanced.browser.test.tsx"),
        keyboardAndLongCopyClaim("alert-dialog", ["AlertDialog"], "./overlays", "test/alert-dialog.keyboard.browser.test.tsx"),
        keyboardAndLongCopyClaim("sheet", ["Sheet"], "./overlays", "test/sheet-layout.browser.test.tsx"),
        keyboardClaim("tooltip", ["Tooltip"], "./overlays", "test/tooltip.browser.test.tsx"),
        defaultClaim("visually-hidden", ["VisuallyHidden"], "./layout"),
        keyboardAndLongCopyClaim("menu", ["Menu"], "./overlays", "test/menu.keyboard.browser.test.tsx"),
    ],
};
//# sourceMappingURL=evidence.js.map