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
    /**
     * Scroll to the screen edges from inside the default inset ScreenLayout body: the viewport reaches past the body
     * gutter and pads it back, so the first and last items rest on the gutter (no `body-edge` + per-section gutter).
     * Place the rail directly in the body; inside overlays or `body-edge`/`none` bodies there is no gutter to cross.
     */
    bleed?: boolean;
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
}>;
export declare function CollectionRail({ label, items, renderItem, labels, density, emptyContent, defaultStartKey, onStartKeyChange, bleed, layoutStyle, testID }: CollectionRailProps): import("react").JSX.Element;
//# sourceMappingURL=collection-rail.d.ts.map