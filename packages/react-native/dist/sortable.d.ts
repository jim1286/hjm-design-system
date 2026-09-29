import { type ReactNode } from "react";
import { type SortableItem, type SortableLabels, type ReorderIntent } from "@hjmds/design-contracts/components/interaction-adapters";
export type SortableCollectionProps = {
    items: readonly SortableItem[];
    label: string;
    labels: SortableLabels;
    renderItem(item: SortableItem): ReactNode;
    onCommit(intent: ReorderIntent): void;
    onCancel?(): void;
    disabled?: boolean;
    /** Pass route focus when screens remain mounted across tabs; resets GH2 drag state. */
    active?: boolean;
};
export declare function SortableCollection(props: SortableCollectionProps): import("react").JSX.Element;
//# sourceMappingURL=sortable.d.ts.map