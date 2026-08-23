export const reactNativeRendererEvidenceSchemaVersion = 2;
function defaultClaim(componentId, exportNames, subpath) {
    return {
        componentId,
        exportNames,
        subpath,
        scenarios: ["default"],
        proofs: [{
                scenarios: ["default"],
                file: "test/default-render.test.tsx",
                caseId: componentId,
            }],
    };
}
/**
 * First-party Native renderer claims. These are automated component-level
 * smoke claims, not device, TalkBack, or VoiceOver certification. Scenario
 * axes are added only after their dedicated runtime evidence exists.
 */
export const reactNativeRendererEvidence = {
    schemaVersion: reactNativeRendererEvidenceSchemaVersion,
    packageName: "@hjm/react-native",
    packageVersion: "0.7.1",
    surface: "native",
    components: [
        defaultClaim("design-system-provider", ["HjmNativeProvider", "useHjmNativeTheme"], "./provider"),
        defaultClaim("text", ["Text"], "./primitives"),
        defaultClaim("surface", ["Surface"], "./primitives"),
        defaultClaim("stack", ["Stack"], "./primitives"),
        defaultClaim("grid", ["Grid"], "./primitives"),
        defaultClaim("layout", ["Layout"], "./primitives"),
        defaultClaim("icon", ["Icon"], "./primitives"),
        defaultClaim("section", ["Section"], "./primitives"),
        defaultClaim("button", ["Button"], "./actions"),
        defaultClaim("icon-button", ["IconButton"], "./actions"),
        defaultClaim("bottom-cta", ["BottomCTA"], "./actions"),
        defaultClaim("field", ["Field"], "./forms"),
        defaultClaim("search-field", ["SearchField"], "./inputs"),
        defaultClaim("text-area", ["TextArea"], "./inputs"),
        defaultClaim("password-field", ["PasswordField"], "./password-field"),
        defaultClaim("otp-field", ["OtpField"], "./otp-field"),
        defaultClaim("checkbox", ["Checkbox"], "./inputs"),
        defaultClaim("checkbox-group", ["CheckboxGroup"], "./inputs"),
        defaultClaim("radio-group", ["RadioGroup"], "./inputs"),
        defaultClaim("switch", ["Switch"], "./inputs"),
        defaultClaim("segmented-control", ["SegmentedControl"], "./inputs"),
        defaultClaim("select", ["Select"], "./forms"),
        defaultClaim("combobox", ["Combobox"], "./forms"),
        defaultClaim("chip", ["Chip"], "./inputs"),
        defaultClaim("tabs", ["Tabs"], "./navigation"),
        defaultClaim("top-bar", ["TopBar", "TopBarAction"], "./navigation"),
        defaultClaim("menu", ["Menu"], "./navigation"),
        defaultClaim("badge", ["Badge"], "./data-display"),
        defaultClaim("card", ["Card"], "./data-display"),
        defaultClaim("list-row", ["ListRow"], "./data-display"),
        defaultClaim("tag", ["Tag"], "./data-display"),
        defaultClaim("timeline", ["Timeline"], "./data-display"),
        defaultClaim("description-list", ["DescriptionList"], "./data-display"),
        defaultClaim("image", ["Image"], "./data-display"),
        defaultClaim("counter-badge", ["CounterBadge"], "./data-display"),
        defaultClaim("list", ["List"], "./data-display"),
        defaultClaim("statistic", ["Statistic", "StatisticGroup"], "./data-display"),
        defaultClaim("empty-state", ["EmptyState"], "./feedback"),
        defaultClaim("result", ["Result"], "./feedback"),
        defaultClaim("notice", ["Notice"], "./feedback"),
        defaultClaim("progress", ["Progress"], "./feedback"),
        defaultClaim("skeleton", ["Skeleton"], "./feedback"),
        defaultClaim("dialog", ["Dialog"], "./overlays"),
        defaultClaim("alert-dialog", ["AlertDialog"], "./overlays"),
        defaultClaim("sheet", ["Sheet"], "./overlays"),
        defaultClaim("bottom-navigation", ["BottomNavigation"], "./navigation"),
        defaultClaim("load-more", ["LoadMore"], "./navigation"),
        defaultClaim("accordion", ["Accordion"], "./data-display"),
        defaultClaim("divider", ["Divider"], "./data-display"),
        defaultClaim("toast", ["ToastRegion", "useToastRegion"], "./feedback"),
    ],
};
//# sourceMappingURL=evidence.js.map