import type { ShowcaseScenarioId } from "@hjmds/design-contracts/showcase";

export const reactNativeRendererEvidenceSchemaVersion = 2 as const;

export type ReactNativeRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract" | "keyboard">;

export type ReactNativeRendererEvidenceComponent = Readonly<{
  /** Canonical component id from the design-contracts catalog. */
  componentId: string;
  /** Public symbols that implement this contract on the declared subpath. */
  exportNames: readonly string[];
  /** Granular @hjmds/react-native export used by consumers. */
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
  packageName: "@hjmds/react-native";
  packageVersion: string;
  surface: "native";
  components: readonly ReactNativeRendererEvidenceComponent[];
}>;

const defaultProofFile = "test/default-render.test.tsx" as const;
const matrixProofFile = "test/scenario-matrix.test.tsx" as const;

/**
 * Environment scenarios proven by scenario-matrix.test against the resolved
 * styles in the rendered host tree. Until 1.5.0 every component claimed all
 * seven scenarios from a test that only checked that rendering did not throw.
 * The test renderer cannot lay out text, so long-copy here proves the copy sits
 * in a wrapping Text (no single-line truncation), not measured overflow.
 */
const matrixScenarios = ["accessibility", "dark", "large-text", "rtl", "reduced-motion"] as const;

/** Scenarios a component does not pass yet; reported as promotion debt. */
const nativeScenarioGaps: Readonly<Record<string, readonly ReactNativeRendererEvidenceScenario[]>> = {};

/** Cases that render long copy inside the component (renderLongCopy). */
const nativeLongCopyCases: ReadonlySet<string> = new Set<string>([
  "masonry", "virtual-list", "qr-code",
  "design-system-provider",
  "aspect-ratio",
  "grid",
  "layout",
  "steps",
  "auth-screen",
  "radio",
  "list",
  "timeline",
  "bottom-info",
  "top-bar",
  "stack",
  "container",
  "text",
  "surface",
  "button",
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
  "select",
  "combobox",
  "link",
  "heading",
  "empty-state",
  "top",
  "section",
  "segmented-control",
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
  "field",
  "floating-action-button",
  "checkbox",
  "switch",
  "toggle-group",
  "slider",
  "otp-field",
  "date-picker",
  "tags-input",
  "mentions",
  "transfer-list",
  "upload-item",
  "collapsible",
  "calendar",
  "carousel",
  "dialog",
  "alert-dialog",
]);

function defaultClaim(
  componentId: string,
  exportNames: readonly string[],
  subpath: `./${string}`,
): ReactNativeRendererEvidenceComponent {
  const gaps = nativeScenarioGaps[componentId] ?? [];
  const matrix: ReactNativeRendererEvidenceScenario[] = [
    ...matrixScenarios.filter((scenario) => !gaps.includes(scenario)),
    ...(nativeLongCopyCases.has(componentId) && !gaps.includes("long-copy") ? ["long-copy" as const] : []),
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

function nativeActionClaim(
  componentId: string,
  exportNames: readonly string[],
  subpath: `./${string}`,
  proofFile: `test/${string}.test.tsx` = "test/stable-core.test.tsx",
): ReactNativeRendererEvidenceComponent {
  const base = defaultClaim(componentId, exportNames, subpath);
  return {
    ...base,
    scenarios: [...base.scenarios, "native-actions"],
    proofs: [
      ...base.proofs,
      {
        scenarios: ["native-actions"],
        file: proofFile,
        caseId: componentId,
      },
    ],
  };
}

function nativeActionAndLongCopyClaim(
  componentId: string,
  exportNames: readonly string[],
  subpath: `./${string}`,
  proofFile: `test/${string}.test.tsx`,
): ReactNativeRendererEvidenceComponent {
  const base = defaultClaim(componentId, exportNames, subpath);
  return {
    ...base,
    scenarios: [...base.scenarios, "native-actions", "long-copy"],
    proofs: [...base.proofs, { scenarios: ["native-actions", "long-copy"], file: proofFile, caseId: componentId }],
  };
}

/**
 * First-party Native renderer claims. These are automated component-level
 * smoke claims, not device, TalkBack, or VoiceOver certification. Scenario
 * axes are added only after their dedicated runtime evidence exists.
 */
export const reactNativeRendererEvidence = {
  schemaVersion: reactNativeRendererEvidenceSchemaVersion,
  packageName: "@hjmds/react-native",
  packageVersion: "1.11.0",
  surface: "native",
  components: [
    defaultClaim("design-system-provider", ["HjmNativeProvider", "useHjmNativeTheme"], "./provider"),
    defaultClaim("text", ["Text"], "./primitives"),
    defaultClaim("surface", ["Surface"], "./primitives"),
    defaultClaim("stack", ["Stack"], "./primitives"),
    defaultClaim("container", ["Container"], "./primitives"),
    defaultClaim("aspect-ratio", ["AspectRatio"], "./primitives"),
    defaultClaim("grid", ["Grid"], "./primitives"),
    defaultClaim("layout", ["Layout"], "./primitives"),
    defaultClaim("icon", ["Icon"], "./primitives"),
    defaultClaim("section", ["Section"], "./primitives"),
    defaultClaim("button", ["Button"], "./actions"),
    defaultClaim("icon-button", ["IconButton"], "./actions"),
    nativeActionClaim("link", ["Link"], "./actions"),
    defaultClaim("bottom-cta", ["BottomCTA"], "./actions"),
    nativeActionClaim("field", ["Field"], "./forms"),
    nativeActionClaim("search-field", ["SearchField"], "./inputs"),
    defaultClaim("text-area", ["TextArea"], "./inputs"),
    nativeActionClaim("password-field", ["PasswordField"], "./password-field"),
    nativeActionClaim("otp-field", ["OtpField"], "./otp-field"),
    nativeActionClaim("number-field", ["NumberField"], "./number-field"),
    nativeActionClaim("slider", ["Slider"], "./slider"),
    nativeActionClaim("form", ["Form"], "./forms", "test/form.interaction.test.tsx"),
    nativeActionClaim("date-picker", ["DatePicker"], "./date-picker"),
    nativeActionClaim("calendar", ["Calendar"], "./calendar", "test/calendar.test.tsx"),
    nativeActionClaim("agreement", ["Agreement"], "./agreement", "test/agreement.interaction.test.tsx"),
    defaultClaim("top", ["Top"], "./top"),
    defaultClaim("heading", ["Heading"], "./heading"),
    nativeActionClaim("toggle-group", ["ToggleGroup"], "./toggle-group"),
    defaultClaim("bottom-info", ["BottomInfo"], "./bottom-info"),
    nativeActionClaim("collapsible", ["Collapsible"], "./collapsible", "test/collapsible-actions.test.tsx"),
    defaultClaim("asset", ["Asset", "AssetGroup"], "./asset"),
    nativeActionClaim("tags-input", ["TagsInput"], "./tags-input"),
    nativeActionClaim("date-range-picker", ["DateRangePicker"], "./date-range", "test/date-range-actions.test.tsx"),
    nativeActionClaim("mentions", ["Mentions"], "./mentions", "test/mentions-actions.test.tsx"),
    nativeActionClaim("transfer-list", ["TransferList"], "./transfer-list", "test/transfer-list-actions.test.tsx"),
    nativeActionClaim("auth-provider-button", ["AuthProviderButton"], "./provider-button"),
    defaultClaim("auth-screen", ["AuthScreenLayout"], "./auth-screen"),
    nativeActionClaim("file-picker", ["FilePicker"], "./file-picker", "test/file-picker-host-action.test.tsx"),
    nativeActionClaim("checkbox", ["Checkbox"], "./inputs"),
    defaultClaim("radio", ["Radio"], "./inputs"),
    nativeActionClaim("checkbox-group", ["CheckboxGroup"], "./inputs"),
    nativeActionClaim("radio-group", ["RadioGroup"], "./inputs"),
    nativeActionClaim("switch", ["Switch"], "./inputs"),
    nativeActionClaim("segmented-control", ["SegmentedControl"], "./inputs"),
    nativeActionClaim("select", ["Select"], "./forms"),
    nativeActionClaim("combobox", ["Combobox"], "./forms"),
    nativeActionClaim("chip", ["Chip"], "./inputs"),
    nativeActionClaim("tabs", ["Tabs"], "./navigation", "test/tabs-actions.test.tsx"),
    nativeActionClaim("carousel", ["Carousel"], "./carousel", "test/carousel.test.tsx"),
    nativeActionClaim("floating-action-button", ["FloatingActionButton"], "./floating-action-button"),
    defaultClaim("steps", ["Steps"], "./steps"),
    defaultClaim("top-bar", ["TopBar", "TopBarAction"], "./navigation"),
    nativeActionAndLongCopyClaim("menu", ["Menu"], "./navigation", "test/menu-actions.test.tsx"),
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
    nativeActionClaim("upload-item", ["UploadItem"], "./upload-item", "test/upload-item.test.tsx"),
    defaultClaim("empty-state", ["EmptyState"], "./feedback"),
    defaultClaim("result", ["Result"], "./feedback"),
    defaultClaim("notice", ["Notice"], "./feedback"),
    defaultClaim("progress", ["Progress"], "./feedback"),
    defaultClaim("skeleton", ["Skeleton"], "./feedback"),
    {
      componentId: "thinking-orb", exportNames: ["ThinkingOrb"], subpath: "./thinking-orb",
      scenarios: ["default", "dark", "large-text", "rtl", "reduced-motion", "accessibility"],
      proofs: [
        { scenarios: ["default"], file: defaultProofFile, caseId: "thinking-orb" },
        { scenarios: ["dark", "large-text", "rtl", "reduced-motion", "accessibility"], file: "test/thinking-orb.test.tsx", caseId: "thinking-orb" },
      ],
    },
    defaultClaim("masonry", ["Masonry"], "./masonry"),
    defaultClaim("virtual-list", ["VirtualList"], "./virtual-list"),
    defaultClaim("qr-code", ["QRCode"], "./qr-code"),
    defaultClaim("spinner", ["Spinner"], "./feedback"),
    nativeActionClaim("dialog", ["Dialog"], "./overlays", "test/dialog-actions.test.tsx"),
    nativeActionClaim("alert-dialog", ["AlertDialog"], "./overlays", "test/alert-dialog-actions.test.tsx"),
    nativeActionAndLongCopyClaim("sheet", ["Sheet"], "./overlays", "test/sheet-viewport.test.tsx"),
    nativeActionClaim("bottom-navigation", ["BottomNavigation"], "./navigation", "test/bottom-navigation.interaction.test.tsx"),
    nativeActionClaim("load-more", ["LoadMore"], "./navigation", "test/load-more.interactions.test.tsx"),
    nativeActionClaim("accordion", ["Accordion"], "./data-display", "test/accordion-actions.test.tsx"),
    defaultClaim("divider", ["Divider"], "./data-display"),
    // This claim covers standard chrome. Liquid's mock lifecycle tests and showcase do not
    // certify device motion, VoiceOver/TalkBack, or the optional runtime support matrix.
    nativeActionClaim("toast", ["ToastRegion", "useToastRegion"], "./feedback"),
  ],
} as const satisfies ReactNativeRendererEvidenceManifest;
