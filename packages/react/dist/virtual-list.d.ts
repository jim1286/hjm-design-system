import { type ReactNode } from "react";
export type VirtualListProps<T> = {
    items: readonly T[];
    keyExtractor: (item: T) => string;
    renderItem: (item: T, index: number) => ReactNode;
    rowHeight: number;
    height: number;
    label: string;
    empty?: ReactNode;
    overscan?: number;
};
/** Fixed-height rows are an explicit host contract; use List for unconstrained flowing copy. */
export declare function VirtualList<T>({ items, keyExtractor, renderItem, rowHeight, height, label, empty, overscan }: VirtualListProps<T>): import("react").JSX.Element;
//# sourceMappingURL=virtual-list.d.ts.map