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
    /**
     * One level up, from either the item detail or a collection grid. The shell does not know the
     * host's history, so the host pops a single level: clear `selectedItemId` when an item is open,
     * otherwise clear `collectionId` (back to the collection home).
     */
    onBack(): void;
    onCreateCollection(): void;
    /**
     * Product-supplied glyph for the create-collection header action, rendered as an IconButton named
     * by `labels.createCollection`. Required because header tool actions are icons (2026-10-17 usage
     * rule in docs/usage/components/icon-button.md); a text-button fallback let screens drift from it.
     */
    createCollectionIcon: ReactNode;
    renderThumbnail(item: T): ReactNode;
    renderDetail(item: T): ReactNode;
};
/**
 * Collection membership and persistence belong to the app; the shell preserves the grid on detail visits.
 *
 * Header slots per level: on the collection home the shell owns `actions` (the create-collection
 * button) and the product's `exit`; inside a collection it owns `exit` (back) and keeps the
 * product's `actions`. A product `actions` passed for the home is therefore not rendered there —
 * Native ships the same rule, so changing it is a cross-platform API decision, not a Web fix.
 */
export declare function SavedItemsScreen<T extends SavedItem>({ items, collections, collectionId, selectedItemId, labels, onOpenCollection, onOpenItem, onBack, onCreateCollection, createCollectionIcon, renderThumbnail, renderDetail, ...screen }: SavedItemsScreenProps<T>): import("react").JSX.Element;
//# sourceMappingURL=saved-items.d.ts.map