import type { ShowcaseScenarioId } from "@hjm/design-contracts/showcase";

export const reactRendererEvidenceSchemaVersion = 2 as const;

export type ReactRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract">;

export type ReactRendererEvidenceComponent = Readonly<{
  /** Canonical component id from the design-contracts catalog. */
  componentId: string;
  /** Public symbols that implement this contract on the declared subpath. */
  exportNames: readonly string[];
  /** Granular @hjm/react export used by consumers. */
  subpath: `./${string}`;
  /** Scenarios supported by automated first-party renderer evidence. */
  scenarios: readonly ReactRendererEvidenceScenario[];
  /** Repository-local executable proof for every claimed scenario. */
  proofs: readonly Readonly<{
    scenarios: readonly ReactRendererEvidenceScenario[];
    file: `test/${string}.test.tsx`;
    caseId: string;
  }>[];
}>;

export type ReactRendererEvidenceManifest = Readonly<{
  schemaVersion: typeof reactRendererEvidenceSchemaVersion;
  packageName: "@hjm/react";
  packageVersion: string;
  surface: "web";
  components: readonly ReactRendererEvidenceComponent[];
}>;

function defaultClaim(
  componentId: string,
  exportNames: readonly string[],
  subpath: `./${string}`,
): ReactRendererEvidenceComponent {
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
  packageVersion: "0.7.0",
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
} as const satisfies ReactRendererEvidenceManifest;
