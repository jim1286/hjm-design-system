import { type TabsActivationMode, type TabsDirection, type TabsMountPolicy, type TabsOrientation, type TabsPanelMode } from "@hjm/design-contracts/behaviors";
import { type TabSize, type TabsLayout } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes, type ReactNode } from "react";
export type TabItem = Readonly<{
    id: string;
    label: ReactNode;
    panel: ReactNode;
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
}>;
export declare const Tabs: import("react").ForwardRefExoticComponent<TabsProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=navigation.d.ts.map