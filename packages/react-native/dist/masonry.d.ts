import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type MasonryProps<T> = {
    items: readonly T[];
    keyExtractor: (item: T) => string;
    renderItem: (item: T, index: number) => ReactNode;
    getItemHeight: (item: T, itemWidth: number) => number;
    width: number;
    columns?: number;
    gap?: number;
    label: string;
    empty?: ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
};
export declare function Masonry<T>({ items, keyExtractor, renderItem, getItemHeight, width, columns, gap, label, empty, layoutStyle }: MasonryProps<T>): import("react").JSX.Element;
//# sourceMappingURL=masonry.d.ts.map