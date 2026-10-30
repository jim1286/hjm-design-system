import { getRequiredShowcaseEvidence } from "@hjmds/design-contracts/showcase";
import { componentCatalog, componentIdOf, getComponentSurfaceStatus } from "@hjmds/design-contracts/catalog";
import { publicExportEntries } from "./public-exports.generated.js";
export const reactRendererEvidenceSchemaVersion = 2;
const defaultProofFile = "test/default-render.ssr.test.tsx";
const matrixProofFile = "test/scenario-matrix.browser.test.tsx";
const stableCoreProofFile = "test/stable-core.browser.test.tsx";
/**
 * Scenarios a component does not pass yet. Each entry is promotion debt that
 * the generated evidence projection reports; remove it when the component is
 * fixed and the matrix case passes. Stable surfaces cannot carry a gap
 * (scripts/check-workspace-sync.mjs).
 */
const webScenarioGaps = {};
const keyboard = (file = stableCoreProofFile) => ({ proofs: [{ scenarios: ["keyboard"], file }] });
const keyboardAndLongCopy = (file) => ({ proofs: [{ scenarios: ["keyboard", "long-copy"], file }] });
const claimExtras = {
    "time-picker": keyboard("test/time-picker.browser.test.tsx"),
    "design-system-provider": { exportNames: ["useHjmTheme"] },
    layout: keyboard(),
    link: keyboard(),
    field: keyboard(),
    "search-field": keyboard(),
    "password-field": keyboard(),
    "otp-field": keyboard(),
    "number-field": keyboard(),
    slider: keyboard(),
    form: keyboard("test/form.keyboard.browser.test.tsx"),
    "date-picker": keyboard(),
    calendar: keyboard("test/calendar.browser.test.tsx"),
    "file-picker": keyboard("test/file-picker.keyboard.browser.test.tsx"),
    checkbox: keyboard(),
    "checkbox-group": keyboard(),
    "radio-group": keyboard(),
    switch: keyboard(),
    "segmented-control": keyboard(),
    chip: keyboard(),
    tabs: keyboard("test/tabs.keyboard.browser.test.tsx"),
    breadcrumb: keyboard("test/page-navigation.browser.test.tsx"),
    pagination: keyboard("test/pagination.keyboard.browser.test.tsx"),
    popover: keyboardAndLongCopy("test/popover.browser.test.tsx"),
    "side-panel": keyboardAndLongCopy("test/side-panel.browser.test.tsx"),
    splitter: keyboard("test/splitter.browser.test.tsx"),
    tour: keyboardAndLongCopy("test/tour.browser.test.tsx"),
    tree: keyboard("test/tree.browser.test.tsx"),
    "transfer-list": keyboard("test/transfer-list.browser.test.tsx"),
    mentions: keyboard("test/mentions.browser.test.tsx"),
    "command-palette": keyboardAndLongCopy("test/command-palette.browser.test.tsx"),
    agreement: keyboard("test/agreement.keyboard.browser.test.tsx"),
    "toggle-group": keyboard(),
    "tags-input": keyboard(),
    "skip-nav": keyboardAndLongCopy("test/skip-nav.browser.test.tsx"),
    sidebar: keyboard("test/sidebar.browser.test.tsx"),
    "date-range-picker": keyboard("test/date-range.keyboard.browser.test.tsx"),
    "auth-provider-button": keyboard(),
    "data-table": keyboard("test/data-table.keyboard.browser.test.tsx"),
    collapsible: keyboard("test/collapsible.keyboard.browser.test.tsx"),
    "context-menu": keyboardAndLongCopy("test/context-menu.interactions.browser.test.tsx"),
    menubar: keyboard("test/menubar.keyboard.browser.test.tsx"),
    anchor: keyboard("test/anchor.browser.test.tsx"),
    "bottom-navigation": keyboard("test/bottom-navigation.keyboard.browser.test.tsx"),
    "load-more": keyboard("test/load-more.interactions.browser.test.tsx"),
    carousel: keyboard("test/carousel.browser.test.tsx"),
    "floating-action-button": keyboard(),
    accordion: keyboard("test/accordion.keyboard.browser.test.tsx"),
    "upload-item": keyboard("test/upload-item.browser.test.tsx"),
    // ThinkingOrb runs its whole environment matrix in its own file (canvas timing), not in scenario-matrix.
    "thinking-orb": { proofs: [{ scenarios: ["dark", "large-text", "rtl", "reduced-motion", "accessibility"], file: "test/thinking-orb.browser.test.tsx" }] },
    "color-picker": keyboard("test/web-additions.browser.test.tsx"),
    // SSR proves semantics but cannot catch the close-only row seen in BurnTok.
    // Keep real geometry evidence attached without promoting catalog maturity.
    toast: {
        exportNames: ["useToast"],
        proofs: [
            { scenarios: ["keyboard"], file: stableCoreProofFile },
            { scenarios: ["dark", "long-copy", "large-text", "rtl"], file: "test/toast-layout.browser.test.tsx" },
        ],
    },
    select: keyboard(),
    combobox: keyboard(),
    dialog: keyboard("test/advanced.browser.test.tsx"),
    "alert-dialog": keyboardAndLongCopy("test/alert-dialog.keyboard.browser.test.tsx"),
    sheet: keyboardAndLongCopy("test/sheet-layout.browser.test.tsx"),
    tooltip: keyboard("test/tooltip.browser.test.tsx"),
    menu: keyboardAndLongCopy("test/menu.keyboard.browser.test.tsx"),
};
const exportEntries = publicExportEntries;
/**
 * One claim per active Web row of the catalog. The subpath is the symbol's canonical granular entry, the export
 * names are the row's own symbol plus the companions published on that entry, and the scenarios are the row's
 * required Web evidence minus recorded gaps. Keyboard is never implied: it comes only from a dedicated proof.
 */
function derivedClaim(entry) {
    const componentId = componentIdOf(entry);
    const extras = claimExtras[componentId] ?? {};
    const symbols = entry.name === "DesignSystemProvider" ? ["HjmProvider"] : [entry.name, ...(entry.companions ?? [])];
    // A row whose own name is not a symbol (Chart) claims through its first published companion.
    const subpath = symbols.map((symbol) => exportEntries[symbol]?.[0]).find((entry) => entry !== undefined);
    if (!subpath)
        throw new Error(`${entry.name} has no granular @hjmds/react export to claim evidence on`);
    const exportNames = [
        ...symbols.filter((symbol) => exportEntries[symbol]?.includes(subpath)),
        ...(extras.exportNames ?? []),
    ];
    const required = getRequiredShowcaseEvidence(entry).find((evidence) => evidence.surface === "web")?.scenarios ?? [];
    const gaps = webScenarioGaps[componentId] ?? [];
    const extraProofs = extras.proofs ?? [];
    const proven = new Set(extraProofs.flatMap((proof) => proof.scenarios));
    const matrix = required.filter((scenario) => scenario !== "default" && scenario !== "keyboard" && scenario !== "native-actions" && scenario !== "contract"
        && !gaps.includes(scenario) && !proven.has(scenario));
    const proofs = [
        { scenarios: ["default"], file: defaultProofFile, caseId: componentId },
        ...(matrix.length === 0 ? [] : [{ scenarios: matrix, file: matrixProofFile, caseId: componentId }]),
        ...extraProofs.map((proof) => ({ ...proof, caseId: componentId })),
    ];
    return {
        componentId,
        exportNames,
        subpath,
        scenarios: proofs.flatMap((proof) => proof.scenarios),
        proofs,
    };
}
const activeWebEntries = componentCatalog.filter((entry) => {
    const status = getComponentSurfaceStatus(entry, "web");
    return status === "stable" || status === "beta";
});
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
    packageVersion: "2.2.0",
    surface: "web",
    components: activeWebEntries.map(derivedClaim),
};
//# sourceMappingURL=evidence.js.map