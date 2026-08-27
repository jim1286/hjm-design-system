import type { ShowcaseScenarioId } from "@hjm/design-contracts/showcase";

export const reactNativeRendererEvidenceSchemaVersion = 2 as const;

export type ReactNativeRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract">;

export type ReactNativeRendererEvidenceComponent = Readonly<{
  /** Canonical component id from the design-contracts catalog. */
  componentId: string;
  /** Public symbols that implement this contract on the declared subpath. */
  exportNames: readonly string[];
  /** Granular @hjm/react-native export used by consumers. */
  subpath: `./${string}`;
  /** Scenarios supported by automated first-party renderer evidence. */
  scenarios: readonly ReactNativeRendererEvidenceScenario[];
  /** Repository-local executable proof for every claimed scenario. */
  proofs: readonly Readonly<{
    scenarios: readonly ReactNativeRendererEvidenceScenario[];
    file: `test/${string}.test.tsx`;
    caseId: string;
  }>[];
}>;

export type ReactNativeRendererEvidenceManifest = Readonly<{
  schemaVersion: typeof reactNativeRendererEvidenceSchemaVersion;
  packageName: "@hjm/react-native";
  packageVersion: string;
  surface: "native";
  components: readonly ReactNativeRendererEvidenceComponent[];
}>;

function defaultClaim(
  componentId: string,
  exportNames: readonly string[],
  subpath: `./${string}`,
): ReactNativeRendererEvidenceComponent {
  const scenarios = [
    "default",
    "dark",
    "long-copy",
    "large-text",
    "rtl",
    "reduced-motion",
    "accessibility",
  ] as const;
  return {
    componentId,
    exportNames,
    subpath,
    scenarios,
    proofs: [{
      scenarios,
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
  packageVersion: "0.8.0",
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
    defaultClaim("link", ["Link"], "./actions"),
    defaultClaim("bottom-cta", ["BottomCTA"], "./actions"),
    defaultClaim("field", ["Field"], "./forms"),
    defaultClaim("search-field", ["SearchField"], "./inputs"),
    defaultClaim("text-area", ["TextArea"], "./inputs"),
    defaultClaim("password-field", ["PasswordField"], "./password-field"),
    defaultClaim("otp-field", ["OtpField"], "./otp-field"),
    defaultClaim("number-field", ["NumberField"], "./number-field"),
    defaultClaim("slider", ["Slider"], "./slider"),
    defaultClaim("form", ["Form"], "./forms"),
    defaultClaim("date-picker", ["DatePicker"], "./date-picker"),
    defaultClaim("file-picker", ["FilePicker"], "./file-picker"),
    defaultClaim("checkbox", ["Checkbox"], "./inputs"),
    defaultClaim("radio", ["Radio"], "./inputs"),
    defaultClaim("checkbox-group", ["CheckboxGroup"], "./inputs"),
    defaultClaim("radio-group", ["RadioGroup"], "./inputs"),
    defaultClaim("switch", ["Switch"], "./inputs"),
    defaultClaim("segmented-control", ["SegmentedControl"], "./inputs"),
    defaultClaim("select", ["Select"], "./forms"),
    defaultClaim("combobox", ["Combobox"], "./forms"),
    defaultClaim("chip", ["Chip"], "./inputs"),
    defaultClaim("tabs", ["Tabs"], "./navigation"),
    defaultClaim("steps", ["Steps"], "./steps"),
    defaultClaim("top-bar", ["TopBar", "TopBarAction"], "./navigation"),
    defaultClaim("menu", ["Menu"], "./navigation"),
    defaultClaim("badge", ["Badge"], "./data-display"),
    defaultClaim("avatar", ["Avatar"], "./data-display"),
    defaultClaim("card", ["Card"], "./data-display"),
    defaultClaim("list-row", ["ListRow"], "./data-display"),
    defaultClaim("tag", ["Tag"], "./data-display"),
    defaultClaim("timeline", ["Timeline"], "./data-display"),
    defaultClaim("description-list", ["DescriptionList"], "./data-display"),
    defaultClaim("image", ["Image"], "./data-display"),
    defaultClaim("counter-badge", ["CounterBadge"], "./data-display"),
    defaultClaim("list", ["List"], "./data-display"),
    defaultClaim("statistic", ["Statistic", "StatisticGroup"], "./data-display"),
    defaultClaim("upload-item", ["UploadItem"], "./upload-item"),
    defaultClaim("empty-state", ["EmptyState"], "./feedback"),
    defaultClaim("result", ["Result"], "./feedback"),
    defaultClaim("notice", ["Notice"], "./feedback"),
    defaultClaim("progress", ["Progress"], "./feedback"),
    defaultClaim("skeleton", ["Skeleton"], "./feedback"),
    defaultClaim("spinner", ["Spinner"], "./feedback"),
    defaultClaim("dialog", ["Dialog"], "./overlays"),
    defaultClaim("alert-dialog", ["AlertDialog"], "./overlays"),
    defaultClaim("sheet", ["Sheet"], "./overlays"),
    defaultClaim("bottom-navigation", ["BottomNavigation"], "./navigation"),
    defaultClaim("load-more", ["LoadMore"], "./navigation"),
    defaultClaim("accordion", ["Accordion"], "./data-display"),
    defaultClaim("divider", ["Divider"], "./data-display"),
    defaultClaim("toast", ["ToastRegion", "useToastRegion"], "./feedback"),
  ],
} as const satisfies ReactNativeRendererEvidenceManifest;
