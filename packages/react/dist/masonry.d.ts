import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type MasonryProps<T> = {
    items: readonly T[];
    keyExtractor: (item: T) => string;
    renderItem: (item: T, index: number) => ReactNode;
    getItemHeight: (item: T, itemWidth: number) => number;
    /** Slot width. Omit it and Masonry measures its own slot; before the first measurement nothing is drawn. */
    width?: number;
    /** Fixed column count. Omit it and the count follows the width (`masonryRecipe.minItemWidth`). */
    columns?: number;
    gap?: number;
    label: string;
    empty?: ReactNode;
    /** Canonical layout-only placement on the root. The measured `width`/height still win: absolute item frames depend on them. */
    layoutStyle?: HjmCompositionStyleProp;
};
export declare function Masonry<T>(props: MasonryProps<T>): import("react").JSX.Element;
//# sourceMappingURL=masonry.d.ts.map