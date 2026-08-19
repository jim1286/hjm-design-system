import { type ComponentCategory, type ComponentName, type ComponentPlatform, type ComponentStatus, type RecipeName } from "./catalog.js";
import type { BehaviorName } from "./behaviors.js";
export type ComponentKind = "primitive" | "component" | "pattern" | "provider" | "utility";
export type ComponentSurface = "web" | "native";
export type ComponentSurfaceStatus = ComponentStatus | "unsupported";
/** Stable IDs survive display-name and category changes. */
export declare const componentIds: {
    readonly Text: "text";
    readonly Icon: "icon";
    readonly Surface: "surface";
    readonly Divider: "divider";
    readonly Section: "section";
    readonly Stack: "stack";
    readonly Grid: "grid";
    readonly Layout: "layout";
    readonly Masonry: "masonry";
    readonly Splitter: "splitter";
    readonly Button: "button";
    readonly IconButton: "icon-button";
    readonly Link: "link";
    readonly BottomCTA: "bottom-cta";
    readonly FloatingActionButton: "floating-action-button";
    readonly Field: "field";
    readonly SearchField: "search-field";
    readonly TextArea: "text-area";
    readonly PasswordField: "password-field";
    readonly OtpField: "otp-field";
    readonly Checkbox: "checkbox";
    readonly Radio: "radio";
    readonly CheckboxGroup: "checkbox-group";
    readonly RadioGroup: "radio-group";
    readonly Switch: "switch";
    readonly Chip: "chip";
    readonly SegmentedControl: "segmented-control";
    readonly Slider: "slider";
    readonly NumberField: "number-field";
    readonly Select: "select";
    readonly Combobox: "combobox";
    readonly DatePicker: "date-picker";
    readonly TimePicker: "time-picker";
    readonly ColorPicker: "color-picker";
    readonly FilePicker: "file-picker";
    readonly Cascader: "cascader";
    readonly Form: "form";
    readonly Mentions: "mentions";
    readonly Rating: "rating";
    readonly TransferList: "transfer-list";
    readonly TreeSelect: "tree-select";
    readonly UploadItem: "upload-item";
    readonly Tabs: "tabs";
    readonly TopBar: "top-bar";
    readonly BottomNavigation: "bottom-navigation";
    readonly Breadcrumb: "breadcrumb";
    readonly Pagination: "pagination";
    readonly LoadMore: "load-more";
    readonly Steps: "steps";
    readonly Menu: "menu";
    readonly Anchor: "anchor";
    readonly Avatar: "avatar";
    readonly Badge: "badge";
    readonly CounterBadge: "counter-badge";
    readonly Card: "card";
    readonly List: "list";
    readonly ListRow: "list-row";
    readonly VirtualList: "virtual-list";
    readonly Accordion: "accordion";
    readonly Statistic: "statistic";
    readonly Timeline: "timeline";
    readonly DataTable: "data-table";
    readonly Tree: "tree";
    readonly Calendar: "calendar";
    readonly Carousel: "carousel";
    readonly DescriptionList: "description-list";
    readonly Image: "image";
    readonly QRCode: "qr-code";
    readonly Tag: "tag";
    readonly Tour: "tour";
    readonly EmptyState: "empty-state";
    readonly Notice: "notice";
    readonly Progress: "progress";
    readonly Spinner: "spinner";
    readonly Skeleton: "skeleton";
    readonly Result: "result";
    readonly Toast: "toast";
    readonly Watermark: "watermark";
    readonly Dialog: "dialog";
    readonly AlertDialog: "alert-dialog";
    readonly Sheet: "sheet";
    readonly SidePanel: "side-panel";
    readonly Popover: "popover";
    readonly ConfirmPopover: "confirm-popover";
    readonly Tooltip: "tooltip";
    readonly CommandPalette: "command-palette";
    readonly Affix: "affix";
    readonly AppProvider: "app-provider";
    readonly BorderBeam: "border-beam";
    readonly DesignSystemProvider: "design-system-provider";
    readonly Utility: "utility";
};
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
        web: Readonly<{
            status: ComponentSurfaceStatus;
        }>;
        native: Readonly<{
            status: ComponentSurfaceStatus;
        }>;
    }>;
    docs: Readonly<{
        /** New stable documentation key. Legacy Showcase IDs remain supported during migration. */
        storyId: `components/${ComponentId}`;
        aliases: readonly string[];
    }>;
}>;
/**
 * Backward-compatible normalized view over the v0.2 catalog. New consumers
 * should prefer this shape so a component can evolve to multiple recipes,
 * behaviors, and different Web/Native maturity without another API rewrite.
 */
export declare const componentDefinitions: readonly ComponentDefinition[];
export declare function getComponentDefinition(idOrName: ComponentId | ComponentName): ComponentDefinition | undefined;
//# sourceMappingURL=component-definitions.d.ts.map