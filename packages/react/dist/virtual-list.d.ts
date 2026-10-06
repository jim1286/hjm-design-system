import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type VirtualListProps<T> = {
    items: readonly T[];
    keyExtractor: (item: T) => string;
    renderItem: (item: T, index: number) => ReactNode;
    rowHeight: number;
    height: number;
    label: string;
    empty?: ReactNode;
    overscan?: number;
    /** Canonical layout-only placement on the scroll viewport. `height` stays the prop's: the window math reads it. */
    layoutStyle?: HjmCompositionStyleProp;
};
/** Fixed-height rows are an explicit host contract; use List for unconstrained flowing copy. */
export declare function VirtualList<T>({ items, keyExtractor, renderItem, rowHeight, height, label, empty, overscan, layoutStyle }: VirtualListProps<T>): import("react").JSX.Element;
//# sourceMappingURL=virtual-list.d.ts.map