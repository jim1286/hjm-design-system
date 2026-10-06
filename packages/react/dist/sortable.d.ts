import { type ReactNode } from "react";
import { type SortableItem, type SortableLabels, type ReorderIntent } from "@hjmds/design-contracts/components/interaction-adapters";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type SortableCollectionProps = {
    items: readonly SortableItem[];
    label: string;
    labels: SortableLabels;
    renderItem(item: SortableItem): ReactNode;
    onCommit(intent: ReorderIntent): void;
    onCancel?(): void;
    disabled?: boolean;
    /** Canonical layout-only placement on the list (DragDropProvider has no box of its own). */
    layoutStyle?: HjmCompositionStyleProp;
};
/** Small controlled collections only; persistence and rollback belong to the host. */
export declare function SortableCollection(props: SortableCollectionProps): import("react").JSX.Element;
//# sourceMappingURL=sortable.d.ts.map