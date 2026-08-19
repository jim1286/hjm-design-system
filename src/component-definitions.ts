import {
  componentCatalog,
  type ComponentCatalogEntry,
  type ComponentCategory,
  type ComponentName,
  type ComponentPlatform,
  type ComponentStatus,
  type RecipeName,
} from "./catalog.js";
import type { BehaviorName } from "./behaviors.js";

export type ComponentKind = "primitive" | "component" | "pattern" | "provider" | "utility";
export type ComponentSurface = "web" | "native";
export type ComponentSurfaceStatus = ComponentStatus | "unsupported";

/** Stable IDs survive display-name and category changes. */
export const componentIds = {
  Text: "text",
  Icon: "icon",
  Surface: "surface",
  Divider: "divider",
  Section: "section",
  Stack: "stack",
  Grid: "grid",
  Layout: "layout",
  Masonry: "masonry",
  Splitter: "splitter",
  Button: "button",
  IconButton: "icon-button",
  Link: "link",
  BottomCTA: "bottom-cta",
  FloatingActionButton: "floating-action-button",
  Field: "field",
  SearchField: "search-field",
  TextArea: "text-area",
  PasswordField: "password-field",
  OtpField: "otp-field",
  Checkbox: "checkbox",
  Radio: "radio",
  CheckboxGroup: "checkbox-group",
  RadioGroup: "radio-group",
  Switch: "switch",
  Chip: "chip",
  SegmentedControl: "segmented-control",
  Slider: "slider",
  NumberField: "number-field",
  Select: "select",
  Combobox: "combobox",
  DatePicker: "date-picker",
  TimePicker: "time-picker",
  ColorPicker: "color-picker",
  FilePicker: "file-picker",
  Cascader: "cascader",
  Form: "form",
  Mentions: "mentions",
  Rating: "rating",
  TransferList: "transfer-list",
  TreeSelect: "tree-select",
  UploadItem: "upload-item",
  Tabs: "tabs",
  TopBar: "top-bar",
  BottomNavigation: "bottom-navigation",
  Breadcrumb: "breadcrumb",
  Pagination: "pagination",
  LoadMore: "load-more",
  Steps: "steps",
  Menu: "menu",
  Anchor: "anchor",
  Avatar: "avatar",
  Badge: "badge",
  CounterBadge: "counter-badge",
  Card: "card",
  List: "list",
  ListRow: "list-row",
  VirtualList: "virtual-list",
  Accordion: "accordion",
  Statistic: "statistic",
  Timeline: "timeline",
  DataTable: "data-table",
  Tree: "tree",
  Calendar: "calendar",
  Carousel: "carousel",
  DescriptionList: "description-list",
  Image: "image",
  QRCode: "qr-code",
  Tag: "tag",
  Tour: "tour",
  EmptyState: "empty-state",
  Notice: "notice",
  Progress: "progress",
  Spinner: "spinner",
  Skeleton: "skeleton",
  Result: "result",
  Toast: "toast",
  Watermark: "watermark",
  Dialog: "dialog",
  AlertDialog: "alert-dialog",
  Sheet: "sheet",
  SidePanel: "side-panel",
  Popover: "popover",
  ConfirmPopover: "confirm-popover",
  Tooltip: "tooltip",
  CommandPalette: "command-palette",
  Affix: "affix",
  AppProvider: "app-provider",
  BorderBeam: "border-beam",
  DesignSystemProvider: "design-system-provider",
  Utility: "utility",
} as const satisfies Readonly<Record<ComponentName, string>>;

export type ComponentId = (typeof componentIds)[ComponentName];

export type ComponentDefinition = Readonly<{
  id: ComponentId;
  name: ComponentName;
  category: ComponentCategory;
  kind: ComponentKind;
  contract: Readonly<{
    status: ComponentStatus;
    recipes: readonly RecipeName[];
    behaviors: readonly BehaviorName[];
  }>;
  surfaces: Readonly<{
    parity: ComponentPlatform;
    web: Readonly<{ status: ComponentSurfaceStatus }>;
    native: Readonly<{ status: ComponentSurfaceStatus }>;
  }>;
  docs: Readonly<{
    /** New stable documentation key. Legacy Showcase IDs remain supported during migration. */
    storyId: `components/${ComponentId}`;
    aliases: readonly string[];
  }>;
}>;

const kindByCategory: Readonly<Record<ComponentCategory, ComponentKind>> = {
  foundation: "primitive",
  layout: "primitive",
  action: "component",
  input: "component",
  navigation: "component",
  "data-display": "component",
  feedback: "component",
  overlay: "component",
  provider: "provider",
  utility: "utility",
};

function getSurfaceStatus(
  entry: ComponentCatalogEntry,
  surface: ComponentSurface,
): ComponentSurfaceStatus {
  if (entry.platform === "shared" || entry.platform === "adaptive") return entry.status;
  if (entry.platform === surface) return entry.status;
  return "unsupported";
}

/**
 * Backward-compatible normalized view over the v0.2 catalog. New consumers
 * should prefer this shape so a component can evolve to multiple recipes,
 * behaviors, and different Web/Native maturity without another API rewrite.
 */
export const componentDefinitions: readonly ComponentDefinition[] = componentCatalog.map((rawEntry) => {
  const entry: ComponentCatalogEntry = rawEntry;
  const name = entry.name as ComponentName;
  const id = componentIds[name];
  return {
    id,
    name,
    category: entry.category,
    kind: kindByCategory[entry.category],
    contract: {
      status: entry.status,
      recipes: entry.recipe ? [entry.recipe] : [],
      behaviors: entry.behavior ? [entry.behavior] : [],
    },
    surfaces: {
      parity: entry.platform,
      web: { status: getSurfaceStatus(entry, "web") },
      native: { status: getSurfaceStatus(entry, "native") },
    },
    docs: {
      storyId: `components/${id}`,
      aliases: entry.aliases ?? [],
    },
  };
});

export function getComponentDefinition(
  idOrName: ComponentId | ComponentName,
): ComponentDefinition | undefined {
  return componentDefinitions.find(
    (definition) => definition.id === idOrName || definition.name === idOrName,
  );
}
