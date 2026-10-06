import type { ReactNode } from "react";
import { type ListDetailScreenProps } from "./screen-flows.js";
import { type SavedItem, type SavedCollection, type SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type { SavedItem, SavedCollection, SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type SavedItemsScreenProps<T extends SavedItem> = Omit<ListDetailScreenProps, "list" | "detail" | "back" | "refresh" | "loadMore"> & {
    items: readonly T[];
    collections: readonly SavedCollection[];
    /** Omitted shows collections; null selects all saved items. */
    collectionId?: string | null;
    selectedItemId?: string | null;
    labels: SavedItemsLabels;
    onOpenCollection(id: string | null): void;
    onOpenItem(id: string): void;
    onBack(): void;
    onCreateCollection(): void;
    renderThumbnail(item: T): ReactNode;
    renderDetail(item: T): ReactNode;
};
/** Same controlled collection contract as Web, composed with the native screen and grid hosts. */
export declare function SavedItemsScreen<T extends SavedItem>({ items, collections, collectionId, selectedItemId, labels, onOpenCollection, onOpenItem, onBack, onCreateCollection, renderThumbnail, renderDetail, ...screen }: SavedItemsScreenProps<T>): import("react").JSX.Element;
//# sourceMappingURL=saved-items.d.ts.map