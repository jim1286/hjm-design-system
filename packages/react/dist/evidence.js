export const reactRendererEvidenceSchemaVersion = 2;
function defaultClaim(componentId, exportNames, subpath) {
    return {
        componentId,
        exportNames,
        subpath,
        scenarios: ["default"],
        proofs: [{
                scenarios: ["default"],
                file: "test/default-render.ssr.test.tsx",
                caseId: componentId,
            }],
    };
}
/**
 * First-party Web renderer claims. Scenario axes remain fail-closed: this
 * manifest claims only table-driven default renders. Dedicated interaction
 * suites exercise richer behavior without promoting those axes until each has
 * a stable, one-to-one executable proof entry.
 */
export const reactRendererEvidence = {
    schemaVersion: reactRendererEvidenceSchemaVersion,
    packageName: "@hjm/react",
    packageVersion: "0.6.0",
    surface: "web",
    components: [
        defaultClaim("design-system-provider", ["HjmProvider", "useHjmTheme"], "./provider"),
        defaultClaim("text", ["Text"], "./layout"),
        defaultClaim("surface", ["Surface"], "./layout"),
        defaultClaim("icon", ["Icon"], "./display"),
        defaultClaim("stack", ["Stack"], "./layout"),
        defaultClaim("grid", ["Grid"], "./layout"),
        defaultClaim("layout", ["Layout"], "./layout"),
        defaultClaim("button", ["Button"], "./actions"),
        defaultClaim("icon-button", ["IconButton"], "./actions"),
        defaultClaim("field", ["Field", "TextField"], "./forms"),
        defaultClaim("search-field", ["SearchField"], "./forms"),
        defaultClaim("text-area", ["TextArea"], "./forms"),
        defaultClaim("checkbox", ["Checkbox"], "./selection"),
        defaultClaim("radio", ["Radio"], "./selection"),
        defaultClaim("checkbox-group", ["CheckboxGroup"], "./selection"),
        defaultClaim("radio-group", ["RadioGroup"], "./selection"),
        defaultClaim("switch", ["Switch"], "./selection"),
        defaultClaim("segmented-control", ["SegmentedControl"], "./selection"),
        defaultClaim("tabs", ["Tabs"], "./navigation"),
        defaultClaim("bottom-navigation", ["BottomNavigation"], "./navigation"),
        defaultClaim("load-more", ["LoadMore"], "./navigation"),
        defaultClaim("badge", ["Badge"], "./display"),
        defaultClaim("counter-badge", ["CounterBadge"], "./display"),
        defaultClaim("card", ["Card"], "./display"),
        defaultClaim("list-row", ["ListRow"], "./display"),
        defaultClaim("tag", ["Tag"], "./display"),
        defaultClaim("timeline", ["Timeline"], "./display"),
        defaultClaim("description-list", ["DescriptionList"], "./display"),
        defaultClaim("image", ["Image"], "./display"),
        defaultClaim("empty-state", ["EmptyState"], "./feedback"),
        defaultClaim("result", ["Result"], "./feedback"),
        defaultClaim("toast", ["Toast", "ToastProvider", "useToast"], "./toast"),
        defaultClaim("select", ["Select"], "./forms"),
        defaultClaim("dialog", ["Dialog"], "./overlays"),
        defaultClaim("alert-dialog", ["AlertDialog"], "./overlays"),
        defaultClaim("sheet", ["Sheet"], "./overlays"),
        defaultClaim("tooltip", ["Tooltip"], "./overlays"),
        defaultClaim("menu", ["Menu"], "./overlays"),
    ],
};
//# sourceMappingURL=evidence.js.map