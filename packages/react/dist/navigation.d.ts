import { type TabsActivationMode, type TabsDirection, type TabsMountPolicy, type TabsOrientation, type TabsPanelMode } from "@hjm/design-contracts/behaviors";
import { type TabSize, type TabsLayout, type TabsOverflow } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes, type ReactNode } from "react";
export type TabLeadingRenderProps = Readonly<{
    selected: boolean;
    disabled: boolean;
    color: "currentColor";
    /** Pixel size resolved from `tabsRecipe.icon.glyph`. */
    size: number;
    /** Compatibility alias for product icon libraries that name this value explicitly. */
    glyphSize: number;
}>;
export type TabItem = Readonly<{
    id: string;
    label: ReactNode;
    panel?: ReactNode;
    renderLeading?: (state: TabLeadingRenderProps) => ReactNode;
    disabled?: boolean;
}>;
type TabsSelection = Readonly<{
    value: string;
    defaultValue?: never;
    onValueChange(value: string): void;
}> | Readonly<{
    value?: never;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}>;
export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "dir" | "onChange"> & TabsSelection & Readonly<{
    label: string;
    items: readonly TabItem[];
    activationMode?: TabsActivationMode;
    mountPolicy?: TabsMountPolicy;
    panelMode?: TabsPanelMode;
    orientation?: TabsOrientation;
    direction?: TabsDirection;
    loop?: boolean;
    size?: TabSize;
    layout?: TabsLayout;
    overflow?: TabsOverflow;
    /** Set false when panels are rendered separately with `TabPanel`. */
    renderPanels?: boolean;
}>;
export declare function getTabId(tabsId: string, value: string): string;
export declare function getTabPanelId(tabsId: string, value: string, mode?: TabsPanelMode): string;
export declare function getDynamicTabPanelId(tabsId: string): string;
type ExternalTabPanelBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "id"> & Readonly<{
    tabsId: string;
    activeValue: string;
    children: ReactNode;
}>;
export type TabPanelProps = ExternalTabPanelBaseProps & (Readonly<{
    mode: "dynamic";
    value?: never;
    mountPolicy?: never;
}> | Readonly<{
    mode?: "keyed";
    value: string;
    mountPolicy?: TabsMountPolicy;
}>);
/** External panel host for products that keep routing, query, or scroll state outside Tabs. */
export declare function TabPanel(props: TabPanelProps): import("react").JSX.Element | null;
export declare const Tabs: import("react").ForwardRefExoticComponent<TabsProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=navigation.d.ts.map