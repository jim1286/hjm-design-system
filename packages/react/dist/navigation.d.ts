import { type TabsAppearance } from "@hjmds/design-contracts/gooey-navigation";
export type { TabsAppearance };
import { type TabsActivationMode, type TabsDirection, type TabsMountPolicy, type TabsOrientation, type TabsPanelMode } from "@hjmds/design-contracts/behaviors";
import { type TabSize, type TabsLayout, type TabsOverflow } from "@hjmds/design-contracts/recipes";
import { type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TabLeadingRenderProps = Readonly<{
    selected: boolean;
    disabled: boolean;
    color: "currentColor";
    /** Pixel size resolved from `tabsRecipe.icon.glyph`. */
    size: number;
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
    appearance?: TabsAppearance;
    orientation?: TabsOrientation;
    direction?: TabsDirection;
    loop?: boolean;
    size?: TabSize;
    layout?: TabsLayout;
    overflow?: TabsOverflow;
    /** Set false when panels are rendered separately with `TabPanel`. */
    renderPanels?: boolean;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function getTabId(tabsId: string, value: string): string;
export declare function getTabPanelId(tabsId: string, value: string, mode?: TabsPanelMode): string;
export declare function getDynamicTabPanelId(tabsId: string): string;
type ExternalTabPanelBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "id"> & Readonly<{
    tabsId: string;
    activeValue: string;
    children: ReactNode;
    /** Canonical layout-only placement on the panel element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
//# sourceMappingURL=navigation.d.ts.map