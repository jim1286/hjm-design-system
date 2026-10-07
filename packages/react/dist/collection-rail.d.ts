import { type HTMLAttributes, type ReactNode } from "react";
import { type CollectionRailItem, type CollectionRailDensity } from "@hjmds/design-contracts/collection-rail";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CollectionRailLabels = Readonly<{
    previous: string;
    next: string;
    navigation: string;
}>;
export type CollectionRailProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    label: string;
    items: readonly CollectionRailItem[];
    renderItem: (item: CollectionRailItem) => ReactNode;
    labels: CollectionRailLabels;
    density?: CollectionRailDensity;
    emptyContent?: ReactNode;
    /** Initial scroll anchor, not selection. Later collection changes reconcile by stable ID. */
    defaultStartKey?: string;
    /** Observed leading item, independent of product selection/detail state. Empty lists report null. */
    onStartKeyChange?: (key: string | null) => void;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Finite all-mounted list placement; Card, inputs and Dialog keep their own state. */
export declare function CollectionRail({ label, items, renderItem, labels, density, emptyContent, defaultStartKey, onStartKeyChange, layoutStyle, ...props }: CollectionRailProps): import("react").JSX.Element;
//# sourceMappingURL=collection-rail.d.ts.map