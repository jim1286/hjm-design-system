import { type ComponentCatalogEntry } from "./catalog.js";
import { type ComponentId } from "./component-definitions.js";
export type ReferenceRelationship = "direct" | "adapted" | "decomposed";
export type AntDesignCategory = "general" | "layout" | "navigation" | "data-entry" | "data-display" | "feedback" | "other";
export type AntDesignReferenceComponent = Readonly<{
    name: string;
    category: AntDesignCategory;
    targets: readonly ComponentId[];
    relationship: ReferenceRelationship;
    lifecycle?: "deprecated" | "new";
}>;
export declare const antDesignReferenceSystem: {
    readonly id: "ant-design";
    readonly name: "Ant Design";
    readonly version: "6.6.1";
    readonly capturedAt: "2026-08-20";
    readonly scope: "core";
    readonly source: "https://ant.design/components/overview/";
};
/**
 * Ant Design is a coverage benchmark, not a runtime or API dependency.
 * Every reference component maps to one or more stable HJM component IDs so broad
 * ecosystem coverage can be tracked without copying Ant Design's appearance,
 * prop names, or Web-only assumptions into the shared core.
 */
declare const antDesignReferenceSources: readonly [{
    readonly name: "Button";
    readonly category: "general";
    readonly targets: readonly ["Button"];
    readonly relationship: "direct";
}, {
    readonly name: "FloatButton";
    readonly category: "general";
    readonly targets: readonly ["FloatingActionButton"];
    readonly relationship: "adapted";
}, {
    readonly name: "Icon";
    readonly category: "general";
    readonly targets: readonly ["Icon"];
    readonly relationship: "direct";
}, {
    readonly name: "Typography";
    readonly category: "general";
    readonly targets: readonly ["Text", "Link"];
    readonly relationship: "decomposed";
}, {
    readonly name: "Divider";
    readonly category: "layout";
    readonly targets: readonly ["Divider"];
    readonly relationship: "direct";
}, {
    readonly name: "Flex";
    readonly category: "layout";
    readonly targets: readonly ["Stack"];
    readonly relationship: "adapted";
}, {
    readonly name: "Grid";
    readonly category: "layout";
    readonly targets: readonly ["Grid"];
    readonly relationship: "direct";
}, {
    readonly name: "Layout";
    readonly category: "layout";
    readonly targets: readonly ["Layout"];
    readonly relationship: "direct";
}, {
    readonly name: "Masonry";
    readonly category: "layout";
    readonly targets: readonly ["Masonry"];
    readonly relationship: "direct";
}, {
    readonly name: "Space";
    readonly category: "layout";
    readonly targets: readonly ["Stack"];
    readonly relationship: "adapted";
}, {
    readonly name: "Splitter";
    readonly category: "layout";
    readonly targets: readonly ["Splitter"];
    readonly relationship: "direct";
}, {
    readonly name: "Anchor";
    readonly category: "navigation";
    readonly targets: readonly ["Anchor"];
    readonly relationship: "direct";
}, {
    readonly name: "Breadcrumb";
    readonly category: "navigation";
    readonly targets: readonly ["Breadcrumb"];
    readonly relationship: "direct";
}, {
    readonly name: "Dropdown";
    readonly category: "navigation";
    readonly targets: readonly ["Menu"];
    readonly relationship: "adapted";
}, {
    readonly name: "Menu";
    readonly category: "navigation";
    readonly targets: readonly ["Menu"];
    readonly relationship: "direct";
}, {
    readonly name: "Pagination";
    readonly category: "navigation";
    readonly targets: readonly ["Pagination"];
    readonly relationship: "direct";
}, {
    readonly name: "Steps";
    readonly category: "navigation";
    readonly targets: readonly ["Steps"];
    readonly relationship: "direct";
}, {
    readonly name: "Tabs";
    readonly category: "navigation";
    readonly targets: readonly ["Tabs"];
    readonly relationship: "direct";
}, {
    readonly name: "AutoComplete";
    readonly category: "data-entry";
    readonly targets: readonly ["Combobox"];
    readonly relationship: "adapted";
}, {
    readonly name: "Cascader";
    readonly category: "data-entry";
    readonly targets: readonly ["Cascader"];
    readonly relationship: "direct";
}, {
    readonly name: "Checkbox";
    readonly category: "data-entry";
    readonly targets: readonly ["Checkbox", "CheckboxGroup"];
    readonly relationship: "decomposed";
}, {
    readonly name: "ColorPicker";
    readonly category: "data-entry";
    readonly targets: readonly ["ColorPicker"];
    readonly relationship: "direct";
}, {
    readonly name: "DatePicker";
    readonly category: "data-entry";
    readonly targets: readonly ["DatePicker"];
    readonly relationship: "direct";
}, {
    readonly name: "Form";
    readonly category: "data-entry";
    readonly targets: readonly ["Form", "Field"];
    readonly relationship: "decomposed";
}, {
    readonly name: "Input";
    readonly category: "data-entry";
    readonly targets: readonly ["Field", "TextArea", "SearchField", "PasswordField", "OtpField"];
    readonly relationship: "decomposed";
}, {
    readonly name: "InputNumber";
    readonly category: "data-entry";
    readonly targets: readonly ["NumberField"];
    readonly relationship: "adapted";
}, {
    readonly name: "Mentions";
    readonly category: "data-entry";
    readonly targets: readonly ["Mentions"];
    readonly relationship: "direct";
}, {
    readonly name: "Radio";
    readonly category: "data-entry";
    readonly targets: readonly ["Radio", "RadioGroup"];
    readonly relationship: "decomposed";
}, {
    readonly name: "Rate";
    readonly category: "data-entry";
    readonly targets: readonly ["Rating"];
    readonly relationship: "adapted";
}, {
    readonly name: "Select";
    readonly category: "data-entry";
    readonly targets: readonly ["Select"];
    readonly relationship: "direct";
}, {
    readonly name: "Slider";
    readonly category: "data-entry";
    readonly targets: readonly ["Slider"];
    readonly relationship: "direct";
}, {
    readonly name: "Switch";
    readonly category: "data-entry";
    readonly targets: readonly ["Switch"];
    readonly relationship: "direct";
}, {
    readonly name: "TimePicker";
    readonly category: "data-entry";
    readonly targets: readonly ["TimePicker"];
    readonly relationship: "direct";
}, {
    readonly name: "Transfer";
    readonly category: "data-entry";
    readonly targets: readonly ["TransferList"];
    readonly relationship: "adapted";
}, {
    readonly name: "TreeSelect";
    readonly category: "data-entry";
    readonly targets: readonly ["TreeSelect"];
    readonly relationship: "direct";
}, {
    readonly name: "Upload";
    readonly category: "data-entry";
    readonly targets: readonly ["FilePicker", "UploadItem"];
    readonly relationship: "decomposed";
}, {
    readonly name: "Avatar";
    readonly category: "data-display";
    readonly targets: readonly ["Avatar"];
    readonly relationship: "direct";
}, {
    readonly name: "Badge";
    readonly category: "data-display";
    readonly targets: readonly ["Badge", "CounterBadge"];
    readonly relationship: "decomposed";
}, {
    readonly name: "Calendar";
    readonly category: "data-display";
    readonly targets: readonly ["Calendar"];
    readonly relationship: "direct";
}, {
    readonly name: "Card";
    readonly category: "data-display";
    readonly targets: readonly ["Card"];
    readonly relationship: "direct";
}, {
    readonly name: "Carousel";
    readonly category: "data-display";
    readonly targets: readonly ["Carousel"];
    readonly relationship: "direct";
}, {
    readonly name: "Collapse";
    readonly category: "data-display";
    readonly targets: readonly ["Accordion"];
    readonly relationship: "adapted";
}, {
    readonly name: "Descriptions";
    readonly category: "data-display";
    readonly targets: readonly ["DescriptionList"];
    readonly relationship: "adapted";
}, {
    readonly name: "Empty";
    readonly category: "data-display";
    readonly targets: readonly ["EmptyState"];
    readonly relationship: "adapted";
}, {
    readonly name: "Image";
    readonly category: "data-display";
    readonly targets: readonly ["Image"];
    readonly relationship: "direct";
}, {
    readonly name: "List";
    readonly category: "data-display";
    readonly targets: readonly ["List", "ListRow"];
    readonly relationship: "decomposed";
    readonly lifecycle: "deprecated";
}, {
    readonly name: "Listy";
    readonly category: "data-display";
    readonly targets: readonly ["VirtualList"];
    readonly relationship: "adapted";
    readonly lifecycle: "new";
}, {
    readonly name: "Popover";
    readonly category: "data-display";
    readonly targets: readonly ["Popover"];
    readonly relationship: "direct";
}, {
    readonly name: "QRCode";
    readonly category: "data-display";
    readonly targets: readonly ["QRCode"];
    readonly relationship: "direct";
}, {
    readonly name: "Segmented";
    readonly category: "data-display";
    readonly targets: readonly ["SegmentedControl"];
    readonly relationship: "adapted";
}, {
    readonly name: "Statistic";
    readonly category: "data-display";
    readonly targets: readonly ["Statistic"];
    readonly relationship: "direct";
}, {
    readonly name: "Table";
    readonly category: "data-display";
    readonly targets: readonly ["DataTable"];
    readonly relationship: "adapted";
}, {
    readonly name: "Tag";
    readonly category: "data-display";
    readonly targets: readonly ["Tag"];
    readonly relationship: "direct";
}, {
    readonly name: "Timeline";
    readonly category: "data-display";
    readonly targets: readonly ["Timeline"];
    readonly relationship: "direct";
}, {
    readonly name: "Tooltip";
    readonly category: "data-display";
    readonly targets: readonly ["Tooltip"];
    readonly relationship: "direct";
}, {
    readonly name: "Tour";
    readonly category: "data-display";
    readonly targets: readonly ["Tour"];
    readonly relationship: "direct";
}, {
    readonly name: "Tree";
    readonly category: "data-display";
    readonly targets: readonly ["Tree"];
    readonly relationship: "direct";
}, {
    readonly name: "Alert";
    readonly category: "feedback";
    readonly targets: readonly ["Notice"];
    readonly relationship: "adapted";
}, {
    readonly name: "Drawer";
    readonly category: "feedback";
    readonly targets: readonly ["Sheet", "SidePanel"];
    readonly relationship: "decomposed";
}, {
    readonly name: "Message";
    readonly category: "feedback";
    readonly targets: readonly ["Toast"];
    readonly relationship: "adapted";
}, {
    readonly name: "Modal";
    readonly category: "feedback";
    readonly targets: readonly ["Dialog", "AlertDialog"];
    readonly relationship: "decomposed";
}, {
    readonly name: "Notification";
    readonly category: "feedback";
    readonly targets: readonly ["Toast"];
    readonly relationship: "adapted";
}, {
    readonly name: "Popconfirm";
    readonly category: "feedback";
    readonly targets: readonly ["ConfirmPopover"];
    readonly relationship: "adapted";
}, {
    readonly name: "Progress";
    readonly category: "feedback";
    readonly targets: readonly ["Progress"];
    readonly relationship: "direct";
}, {
    readonly name: "Result";
    readonly category: "feedback";
    readonly targets: readonly ["Result"];
    readonly relationship: "direct";
}, {
    readonly name: "Skeleton";
    readonly category: "feedback";
    readonly targets: readonly ["Skeleton"];
    readonly relationship: "direct";
}, {
    readonly name: "Spin";
    readonly category: "feedback";
    readonly targets: readonly ["Spinner"];
    readonly relationship: "adapted";
}, {
    readonly name: "Watermark";
    readonly category: "feedback";
    readonly targets: readonly ["Watermark"];
    readonly relationship: "direct";
}, {
    readonly name: "Affix";
    readonly category: "other";
    readonly targets: readonly ["Affix"];
    readonly relationship: "direct";
}, {
    readonly name: "App";
    readonly category: "other";
    readonly targets: readonly ["AppProvider"];
    readonly relationship: "adapted";
}, {
    readonly name: "BorderBeam";
    readonly category: "other";
    readonly targets: readonly ["BorderBeam"];
    readonly relationship: "direct";
}, {
    readonly name: "ConfigProvider";
    readonly category: "other";
    readonly targets: readonly ["DesignSystemProvider"];
    readonly relationship: "adapted";
}, {
    readonly name: "Util";
    readonly category: "other";
    readonly targets: readonly ["Utility"];
    readonly relationship: "adapted";
}];
export declare const antDesignReferenceComponents: readonly AntDesignReferenceComponent[];
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
export declare function getAntDesignReferencesFor(componentNameOrId: string): readonly AntDesignReferenceComponent[];
export declare function summarizeAntDesignCoverage(entries?: readonly ComponentCatalogEntry[]): ReferenceCoverageSummary;
export {};
//# sourceMappingURL=component-references.d.ts.map