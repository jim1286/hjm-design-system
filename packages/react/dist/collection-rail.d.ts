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
    /**
     * Scroll to the screen edges from inside the default inset ScreenLayout body: the viewport reaches past the body
     * gutter (`--hjm-screen-body-inline`) and pads it back, so the first and last items rest on the gutter (no
     * `body-edge` + per-section gutter, spint home 2026-10-17). Place the rail directly in the body.
     */
    bleed?: boolean;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Finite all-mounted list placement; Card, inputs and Dialog keep their own state. */
export declare function CollectionRail({ label, items, renderItem, labels, density, emptyContent, defaultStartKey, onStartKeyChange, bleed, layoutStyle, ...props }: CollectionRailProps): import("react").JSX.Element;
//# sourceMappingURL=collection-rail.d.ts.map