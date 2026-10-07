import { type ReactNode } from "react";
import { type CollectionRailItem, type CollectionRailDensity } from "@hjmds/design-contracts/collection-rail";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CollectionRailLabels = Readonly<{
    previous: string;
    next: string;
    navigation: string;
}>;
export type CollectionRailProps = Readonly<{
    label: string;
    items: readonly CollectionRailItem[];
    renderItem: (item: CollectionRailItem) => ReactNode;
    labels: CollectionRailLabels;
    density?: CollectionRailDensity;
    emptyContent?: ReactNode;
    /** Initial scroll anchor, not a selected item or an open detail target. */
    defaultStartKey?: string;
    onStartKeyChange?: (key: string | null) => void;
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
}>;
export declare function CollectionRail({ label, items, renderItem, labels, density, emptyContent, defaultStartKey, onStartKeyChange, layoutStyle, testID }: CollectionRailProps): import("react").JSX.Element;
//# sourceMappingURL=collection-rail.d.ts.map