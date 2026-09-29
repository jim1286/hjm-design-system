import type { ReactNode } from "react";
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
};
export declare function Masonry<T>({ items, keyExtractor, renderItem, getItemHeight, width, columns, gap, label, empty }: MasonryProps<T>): import("react").JSX.Element;
//# sourceMappingURL=masonry.d.ts.map