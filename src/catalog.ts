import type { BehaviorName } from "./behaviors.js";

export type ComponentCategory =
  | "foundation"
  | "layout"
  | "action"
  | "input"
  | "navigation"
  | "data-display"
  | "feedback"
  | "overlay";

export type ComponentPlatform = "shared" | "adaptive" | "web" | "native";
export type ComponentStatus = "stable" | "beta" | "planned";

export type ComponentCatalogEntry = Readonly<{
  name: string;
  category: ComponentCategory;
  platform: ComponentPlatform;
  status: ComponentStatus;
  recipe?: RecipeName;
  behavior?: BehaviorName;
}>;

/**
 * The catalog is a scope and maturity contract, not an implementation claim.
 * `shared` means API/visual parity. `adaptive` means shared intent with native
 * platform behavior. Web/native entries are intentionally platform-specific.
 */
export const componentCatalog = [
  { name: "Text", category: "foundation", platform: "shared", status: "beta", recipe: "textRecipe" },
  { name: "Icon", category: "foundation", platform: "shared", status: "beta", recipe: "iconRecipe" },
  { name: "Surface", category: "layout", platform: "shared", status: "stable", recipe: "surfaceRecipe" },
  { name: "Divider", category: "layout", platform: "shared", status: "beta", recipe: "dividerRecipe" },
  { name: "Section", category: "layout", platform: "shared", status: "beta", recipe: "sectionRecipe" },
  { name: "Stack", category: "layout", platform: "shared", status: "planned", recipe: "stackRecipe" },
  { name: "Grid", category: "layout", platform: "adaptive", status: "planned" },
  { name: "Button", category: "action", platform: "shared", status: "stable", recipe: "buttonRecipe" },
  { name: "IconButton", category: "action", platform: "shared", status: "beta", recipe: "iconButtonRecipe" },
  { name: "Link", category: "action", platform: "adaptive", status: "beta", recipe: "linkRecipe", behavior: "link" },
  { name: "BottomCTA", category: "action", platform: "native", status: "beta", recipe: "bottomCtaRecipe" },
  { name: "Field", category: "input", platform: "shared", status: "stable", recipe: "fieldRecipe", behavior: "field" },
  { name: "SearchField", category: "input", platform: "shared", status: "beta", recipe: "searchFieldRecipe", behavior: "searchField" },
  { name: "TextArea", category: "input", platform: "shared", status: "stable", recipe: "fieldRecipe" },
  { name: "Checkbox", category: "input", platform: "shared", status: "beta", recipe: "selectionControlRecipe", behavior: "checkbox" },
  { name: "Radio", category: "input", platform: "shared", status: "beta", recipe: "selectionControlRecipe" },
  { name: "CheckboxGroup", category: "input", platform: "shared", status: "beta", recipe: "selectionGroupRecipe", behavior: "checkboxGroup" },
  { name: "RadioGroup", category: "input", platform: "shared", status: "beta", recipe: "selectionGroupRecipe", behavior: "radioGroup" },
  { name: "Switch", category: "input", platform: "shared", status: "beta", recipe: "switchRecipe", behavior: "switch" },
  { name: "Chip", category: "input", platform: "shared", status: "beta", recipe: "chipRecipe", behavior: "chip" },
  { name: "SegmentedControl", category: "input", platform: "shared", status: "beta", recipe: "segmentedControlRecipe", behavior: "segmentedControl" },
  { name: "Slider", category: "input", platform: "shared", status: "planned" },
  { name: "NumberField", category: "input", platform: "shared", status: "planned" },
  { name: "Select", category: "input", platform: "adaptive", status: "beta", recipe: "selectRecipe", behavior: "select" },
  { name: "Combobox", category: "input", platform: "adaptive", status: "beta", recipe: "comboboxRecipe", behavior: "combobox" },
  { name: "DatePicker", category: "input", platform: "adaptive", status: "planned" },
  { name: "TimePicker", category: "input", platform: "adaptive", status: "planned" },
  { name: "ColorPicker", category: "input", platform: "web", status: "planned" },
  { name: "FilePicker", category: "input", platform: "adaptive", status: "planned" },
  { name: "UploadItem", category: "data-display", platform: "shared", status: "planned" },
  { name: "Tabs", category: "navigation", platform: "shared", status: "beta", recipe: "tabsRecipe", behavior: "tabs" },
  { name: "TopBar", category: "navigation", platform: "native", status: "beta", recipe: "topBarRecipe" },
  { name: "BottomNavigation", category: "navigation", platform: "adaptive", status: "beta", recipe: "bottomNavigationRecipe", behavior: "bottomNavigation" },
  { name: "Breadcrumb", category: "navigation", platform: "web", status: "planned" },
  { name: "Pagination", category: "navigation", platform: "web", status: "planned" },
  { name: "LoadMore", category: "navigation", platform: "shared", status: "beta", recipe: "loadMoreRecipe", behavior: "loadMore" },
  { name: "Steps", category: "navigation", platform: "shared", status: "planned" },
  { name: "Menu", category: "navigation", platform: "adaptive", status: "beta", recipe: "menuRecipe", behavior: "menu" },
  { name: "Avatar", category: "data-display", platform: "shared", status: "beta", recipe: "avatarRecipe" },
  { name: "Badge", category: "data-display", platform: "shared", status: "beta", recipe: "badgeRecipe" },
  { name: "CounterBadge", category: "data-display", platform: "shared", status: "beta", recipe: "counterBadgeRecipe" },
  { name: "Card", category: "data-display", platform: "shared", status: "beta", recipe: "surfaceRecipe" },
  { name: "List", category: "data-display", platform: "shared", status: "beta", recipe: "listRecipe" },
  { name: "ListRow", category: "data-display", platform: "shared", status: "beta", recipe: "listRowRecipe" },
  { name: "Accordion", category: "data-display", platform: "shared", status: "beta", recipe: "accordionRecipe", behavior: "disclosureGroup" },
  { name: "Statistic", category: "data-display", platform: "shared", status: "beta", recipe: "statisticRecipe" },
  { name: "Timeline", category: "data-display", platform: "shared", status: "planned" },
  { name: "DataTable", category: "data-display", platform: "web", status: "planned" },
  { name: "Tree", category: "data-display", platform: "web", status: "planned" },
  { name: "EmptyState", category: "feedback", platform: "shared", status: "beta", recipe: "emptyStateRecipe" },
  { name: "Notice", category: "feedback", platform: "shared", status: "beta", recipe: "noticeRecipe" },
  { name: "Progress", category: "feedback", platform: "shared", status: "beta", recipe: "progressRecipe" },
  { name: "Spinner", category: "feedback", platform: "shared", status: "beta", recipe: "spinnerRecipe" },
  { name: "Skeleton", category: "feedback", platform: "shared", status: "beta", recipe: "skeletonRecipe" },
  { name: "Result", category: "feedback", platform: "shared", status: "planned" },
  { name: "Toast", category: "feedback", platform: "adaptive", status: "beta", recipe: "toastRecipe", behavior: "toast" },
  { name: "Dialog", category: "overlay", platform: "adaptive", status: "beta", recipe: "dialogRecipe", behavior: "dialog" },
  { name: "AlertDialog", category: "overlay", platform: "adaptive", status: "beta", recipe: "alertDialogRecipe", behavior: "alertDialog" },
  { name: "Sheet", category: "overlay", platform: "adaptive", status: "beta", recipe: "sheetRecipe", behavior: "sheet" },
  { name: "SidePanel", category: "overlay", platform: "web", status: "planned" },
  { name: "ContextPanel", category: "overlay", platform: "adaptive", status: "planned" },
  { name: "Popover", category: "overlay", platform: "web", status: "planned" },
  { name: "Tooltip", category: "overlay", platform: "web", status: "beta", recipe: "tooltipRecipe", behavior: "tooltip" },
  { name: "CommandPalette", category: "overlay", platform: "web", status: "planned" },
] as const satisfies readonly ComponentCatalogEntry[];
import {
  accordionRecipe,
  alertDialogRecipe,
  avatarRecipe,
  badgeRecipe,
  bottomNavigationRecipe,
  bottomCtaRecipe,
  buttonRecipe,
  chipRecipe,
  comboboxRecipe,
  counterBadgeRecipe,
  dialogRecipe,
  dividerRecipe,
  emptyStateRecipe,
  fieldRecipe,
  iconButtonRecipe,
  iconRecipe,
  linkRecipe,
  listRecipe,
  listRowRecipe,
  loadMoreRecipe,
  menuRecipe,
  noticeRecipe,
  progressRecipe,
  searchFieldRecipe,
  selectRecipe,
  selectionGroupRecipe,
  sectionRecipe,
  segmentedControlRecipe,
  selectionControlRecipe,
  sheetRecipe,
  skeletonRecipe,
  spinnerRecipe,
  stackRecipe,
  statisticRecipe,
  surfaceRecipe,
  switchRecipe,
  tabsRecipe,
  textRecipe,
  toastRecipe,
  tooltipRecipe,
  topBarRecipe,
} from "./recipes.js";

/** One typed registry prevents catalog recipe names from drifting into strings. */
export const recipeRegistry = {
  accordionRecipe,
  alertDialogRecipe,
  avatarRecipe,
  badgeRecipe,
  bottomNavigationRecipe,
  bottomCtaRecipe,
  buttonRecipe,
  chipRecipe,
  comboboxRecipe,
  counterBadgeRecipe,
  dialogRecipe,
  dividerRecipe,
  emptyStateRecipe,
  fieldRecipe,
  iconButtonRecipe,
  iconRecipe,
  linkRecipe,
  listRecipe,
  listRowRecipe,
  loadMoreRecipe,
  menuRecipe,
  noticeRecipe,
  progressRecipe,
  searchFieldRecipe,
  selectRecipe,
  selectionGroupRecipe,
  sectionRecipe,
  segmentedControlRecipe,
  selectionControlRecipe,
  sheetRecipe,
  skeletonRecipe,
  spinnerRecipe,
  stackRecipe,
  statisticRecipe,
  surfaceRecipe,
  switchRecipe,
  tabsRecipe,
  textRecipe,
  toastRecipe,
  tooltipRecipe,
  topBarRecipe,
} as const;

export type RecipeName = keyof typeof recipeRegistry;
