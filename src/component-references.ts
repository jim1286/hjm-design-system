import {
  componentCatalog,
  type ComponentCatalogEntry,
  type ComponentName,
  type ComponentStatus,
} from "./catalog.js";
import {
  componentDefinitions,
  componentIds,
  type ComponentId,
} from "./component-definitions.js";

export type ReferenceRelationship = "direct" | "adapted" | "decomposed";

export type AntDesignCategory =
  | "general"
  | "layout"
  | "navigation"
  | "data-entry"
  | "data-display"
  | "feedback"
  | "other";

export type AntDesignReferenceComponent = Readonly<{
  name: string;
  category: AntDesignCategory;
  targets: readonly ComponentId[];
  relationship: ReferenceRelationship;
  lifecycle?: "deprecated" | "new";
}>;

type AntDesignReferenceSourceComponent = Omit<AntDesignReferenceComponent, "targets"> &
  Readonly<{ targets: readonly ComponentName[] }>;

export const antDesignReferenceSystem = {
  id: "ant-design",
  name: "Ant Design",
  version: "6.6.1",
  capturedAt: "2026-08-20",
  scope: "core",
  source: "https://ant.design/components/overview/",
} as const;

/**
 * Ant Design is a coverage benchmark, not a runtime or API dependency.
 * Every reference component maps to one or more stable HJM component IDs so broad
 * ecosystem coverage can be tracked without copying Ant Design's appearance,
 * prop names, or Web-only assumptions into the shared core.
 */
const antDesignReferenceSources = [
  { name: "Button", category: "general", targets: ["Button"], relationship: "direct" },
  { name: "FloatButton", category: "general", targets: ["FloatingActionButton"], relationship: "adapted" },
  { name: "Icon", category: "general", targets: ["Icon"], relationship: "direct" },
  { name: "Typography", category: "general", targets: ["Text", "Link"], relationship: "decomposed" },

  { name: "Divider", category: "layout", targets: ["Divider"], relationship: "direct" },
  { name: "Flex", category: "layout", targets: ["Stack"], relationship: "adapted" },
  { name: "Grid", category: "layout", targets: ["Grid"], relationship: "direct" },
  { name: "Layout", category: "layout", targets: ["Layout"], relationship: "direct" },
  { name: "Masonry", category: "layout", targets: ["Masonry"], relationship: "direct" },
  { name: "Space", category: "layout", targets: ["Stack"], relationship: "adapted" },
  { name: "Splitter", category: "layout", targets: ["Splitter"], relationship: "direct" },

  { name: "Anchor", category: "navigation", targets: ["Anchor"], relationship: "direct" },
  { name: "Breadcrumb", category: "navigation", targets: ["Breadcrumb"], relationship: "direct" },
  { name: "Dropdown", category: "navigation", targets: ["Menu"], relationship: "adapted" },
  { name: "Menu", category: "navigation", targets: ["Menu"], relationship: "direct" },
  { name: "Pagination", category: "navigation", targets: ["Pagination"], relationship: "direct" },
  { name: "Steps", category: "navigation", targets: ["Steps"], relationship: "direct" },
  { name: "Tabs", category: "navigation", targets: ["Tabs"], relationship: "direct" },

  { name: "AutoComplete", category: "data-entry", targets: ["Combobox"], relationship: "adapted" },
  { name: "Cascader", category: "data-entry", targets: ["Cascader"], relationship: "direct" },
  { name: "Checkbox", category: "data-entry", targets: ["Checkbox", "CheckboxGroup"], relationship: "decomposed" },
  { name: "ColorPicker", category: "data-entry", targets: ["ColorPicker"], relationship: "direct" },
  { name: "DatePicker", category: "data-entry", targets: ["DatePicker"], relationship: "direct" },
  { name: "Form", category: "data-entry", targets: ["Form", "Field"], relationship: "decomposed" },
  { name: "Input", category: "data-entry", targets: ["Field", "TextArea", "SearchField", "PasswordField", "OtpField"], relationship: "decomposed" },
  { name: "InputNumber", category: "data-entry", targets: ["NumberField"], relationship: "adapted" },
  { name: "Mentions", category: "data-entry", targets: ["Mentions"], relationship: "direct" },
  { name: "Radio", category: "data-entry", targets: ["Radio", "RadioGroup"], relationship: "decomposed" },
  { name: "Rate", category: "data-entry", targets: ["Rating"], relationship: "adapted" },
  { name: "Select", category: "data-entry", targets: ["Select"], relationship: "direct" },
  { name: "Slider", category: "data-entry", targets: ["Slider"], relationship: "direct" },
  { name: "Switch", category: "data-entry", targets: ["Switch"], relationship: "direct" },
  { name: "TimePicker", category: "data-entry", targets: ["TimePicker"], relationship: "direct" },
  { name: "Transfer", category: "data-entry", targets: ["TransferList"], relationship: "adapted" },
  { name: "TreeSelect", category: "data-entry", targets: ["TreeSelect"], relationship: "direct" },
  { name: "Upload", category: "data-entry", targets: ["FilePicker", "UploadItem"], relationship: "decomposed" },

  { name: "Avatar", category: "data-display", targets: ["Avatar"], relationship: "direct" },
  { name: "Badge", category: "data-display", targets: ["Badge", "CounterBadge"], relationship: "decomposed" },
  { name: "Calendar", category: "data-display", targets: ["Calendar"], relationship: "direct" },
  { name: "Card", category: "data-display", targets: ["Card"], relationship: "direct" },
  { name: "Carousel", category: "data-display", targets: ["Carousel"], relationship: "direct" },
  { name: "Collapse", category: "data-display", targets: ["Accordion"], relationship: "adapted" },
  { name: "Descriptions", category: "data-display", targets: ["DescriptionList"], relationship: "adapted" },
  { name: "Empty", category: "data-display", targets: ["EmptyState"], relationship: "adapted" },
  { name: "Image", category: "data-display", targets: ["Image"], relationship: "direct" },
  { name: "List", category: "data-display", targets: ["List", "ListRow"], relationship: "decomposed", lifecycle: "deprecated" },
  { name: "Listy", category: "data-display", targets: ["VirtualList"], relationship: "adapted", lifecycle: "new" },
  { name: "Popover", category: "data-display", targets: ["Popover"], relationship: "direct" },
  { name: "QRCode", category: "data-display", targets: ["QRCode"], relationship: "direct" },
  { name: "Segmented", category: "data-display", targets: ["SegmentedControl"], relationship: "adapted" },
  { name: "Statistic", category: "data-display", targets: ["Statistic"], relationship: "direct" },
  { name: "Table", category: "data-display", targets: ["DataTable"], relationship: "adapted" },
  { name: "Tag", category: "data-display", targets: ["Tag"], relationship: "direct" },
  { name: "Timeline", category: "data-display", targets: ["Timeline"], relationship: "direct" },
  { name: "Tooltip", category: "data-display", targets: ["Tooltip"], relationship: "direct" },
  { name: "Tour", category: "data-display", targets: ["Tour"], relationship: "direct" },
  { name: "Tree", category: "data-display", targets: ["Tree"], relationship: "direct" },

  { name: "Alert", category: "feedback", targets: ["Notice"], relationship: "adapted" },
  { name: "Drawer", category: "feedback", targets: ["Sheet", "SidePanel"], relationship: "decomposed" },
  { name: "Message", category: "feedback", targets: ["Toast"], relationship: "adapted" },
  { name: "Modal", category: "feedback", targets: ["Dialog", "AlertDialog"], relationship: "decomposed" },
  { name: "Notification", category: "feedback", targets: ["Toast"], relationship: "adapted" },
  { name: "Popconfirm", category: "feedback", targets: ["ConfirmPopover"], relationship: "adapted" },
  { name: "Progress", category: "feedback", targets: ["Progress"], relationship: "direct" },
  { name: "Result", category: "feedback", targets: ["Result"], relationship: "direct" },
  { name: "Skeleton", category: "feedback", targets: ["Skeleton"], relationship: "direct" },
  { name: "Spin", category: "feedback", targets: ["Spinner"], relationship: "adapted" },
  { name: "Watermark", category: "feedback", targets: ["Watermark"], relationship: "direct" },

  { name: "Affix", category: "other", targets: ["Affix"], relationship: "direct" },
  { name: "App", category: "other", targets: ["AppProvider"], relationship: "adapted" },
  { name: "BorderBeam", category: "other", targets: ["BorderBeam"], relationship: "direct" },
  { name: "ConfigProvider", category: "other", targets: ["DesignSystemProvider"], relationship: "adapted" },
  { name: "Util", category: "other", targets: ["Utility"], relationship: "adapted" },
] as const satisfies readonly AntDesignReferenceSourceComponent[];

export const antDesignReferenceComponents: readonly AntDesignReferenceComponent[] =
  antDesignReferenceSources.map((reference) => ({
    ...reference,
    targets: reference.targets.map((target) => componentIds[target]),
  }));

export type AntDesignComponentName = (typeof antDesignReferenceSources)[number]["name"];

export type ReferenceCoverageSummary = Readonly<{
  total: number;
  tracked: number;
  /** Every HJM target has reached stable or beta maturity. */
  fullyMature: number;
  /** At least one, but not every, HJM target has reached stable or beta maturity. */
  partiallyMature: number;
  /** No HJM target has moved beyond planned maturity. */
  plannedOnly: number;
  /** @deprecated Status maturity is not proof that a preview renderer exists. */
  fullyPreviewable: number;
  /** @deprecated Status maturity is not proof that a preview renderer exists. */
  partiallyPreviewable: number;
  /** @deprecated Use `plannedOnly`. */
  contractOnly: number;
  relationships: Readonly<Record<ReferenceRelationship, number>>;
}>;

export function getAntDesignReferencesFor(
  componentNameOrId: string,
): readonly AntDesignReferenceComponent[] {
  const definition = componentDefinitions.find(
    ({ id, name }) => id === componentNameOrId || name === componentNameOrId,
  );
  if (!definition) return [];
  return antDesignReferenceComponents.filter(({ targets }) =>
    targets.includes(definition.id),
  );
}

export function summarizeAntDesignCoverage(
  entries: readonly ComponentCatalogEntry[] = componentCatalog,
): ReferenceCoverageSummary {
  const statusById = new Map(
    entries.map((entry) => [componentIds[entry.name as ComponentName], entry.status]),
  );
  const relationships: Record<ReferenceRelationship, number> = {
    direct: 0,
    adapted: 0,
    decomposed: 0,
  };
  let tracked = 0;
  let fullyMature = 0;
  let partiallyMature = 0;

  for (const reference of antDesignReferenceComponents) {
    relationships[reference.relationship] += 1;
    const targetStatuses = reference.targets
      .map((target) => statusById.get(target))
      .filter((status): status is ComponentStatus => status !== undefined);
    if (targetStatuses.length === reference.targets.length) tracked += 1;
    const matureTargets = targetStatuses.filter(
      (status) => status === "stable" || status === "beta",
    ).length;
    if (matureTargets === reference.targets.length) fullyMature += 1;
    else if (matureTargets > 0) partiallyMature += 1;
  }

  const plannedOnly = antDesignReferenceComponents.length - fullyMature - partiallyMature;

  return {
    total: antDesignReferenceComponents.length,
    tracked,
    fullyMature,
    partiallyMature,
    plannedOnly,
    // Backward-compatible aliases. These names predate the evidence registry
    // and must not be used as renderer or preview counts in new UI.
    fullyPreviewable: fullyMature,
    partiallyPreviewable: partiallyMature,
    contractOnly: plannedOnly,
    relationships,
  };
}
