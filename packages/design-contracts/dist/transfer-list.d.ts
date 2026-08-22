import type { CheckboxState, CollectionKey, SelectItemDescriptor } from "./behaviors.js";
/**
 * `docs/transfer-list.md`: two lists sharing one item set, split by whether
 * each id is in `targetKeys`. This is the same shape CheckboxGroup already
 * commits to (`ReadonlySet<Id>`, no third "which panel" enum to keep in
 * sync with membership) — one source of truth instead of two arrays that can
 * drift apart when an item is moved.
 */
export type TransferListPanel = "source" | "target";
export type TransferListDescriptor<Id extends CollectionKey = CollectionKey> = Readonly<{
    items: readonly SelectItemDescriptor<Id>[];
    targetKeys: ReadonlySet<Id>;
}>;
export type TransferListSelection<Id extends CollectionKey = CollectionKey> = Readonly<{
    source: ReadonlySet<Id>;
    target: ReadonlySet<Id>;
}>;
/** An item already sitting entirely inside one panel (including all-in-target
 * or all-in-source) is valid — nothing here requires either panel to be
 * non-empty, and a disabled item is valid in either panel even though it can
 * never be moved by the UI. */
export declare function validateTransferListDescriptor<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>): void;
export type TransferListPanels<Id extends CollectionKey = CollectionKey> = Readonly<{
    source: readonly SelectItemDescriptor<Id>[];
    target: readonly SelectItemDescriptor<Id>[];
}>;
/** Splits by `targetKeys` membership, preserving each item's relative order from `items`. */
export declare function resolveTransferListPanels<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>): TransferListPanels<Id>;
export declare function validateTransferListSelection<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>, selection: TransferListSelection<Id>): void;
/** Toggles one row's checkbox within its own panel; the other panel's selection is untouched. */
export declare function toggleTransferListSelection<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>, selection: TransferListSelection<Id>, panel: TransferListPanel, id: Id): TransferListSelection<Id>;
/**
 * Same tri-state `CheckboxState` `resolveDataTableSelectAllState` derives for
 * a table header — disabled rows excluded from both the denominator and the
 * count — generalized from "all rows" to "this one panel's rows".
 */
export declare function resolveTransferListSelectAllState<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>, selection: TransferListSelection<Id>, panel: TransferListPanel): CheckboxState;
/** Mixed-defaults-to-checked, matching `getCheckboxNextState`'s existing convention. */
export declare function toggleTransferListSelectAll<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>, selection: TransferListSelection<Id>, panel: TransferListPanel): TransferListSelection<Id>;
export type TransferListMoveDirection = "toTarget" | "toSource";
export type TransferListMoveResult<Id extends CollectionKey = CollectionKey> = Readonly<{
    targetKeys: ReadonlySet<Id>;
    selection: TransferListSelection<Id>;
    /** In origin-panel order — the product formats the announcement string from this. */
    movedIds: readonly Id[];
}>;
/**
 * Moves every enabled, currently-selected id out of its origin panel.
 * Disabled ids are skipped rather than rejected (a disabled row can never
 * enter a selection through `toggleTransferListSelection`, but a product
 * could hand one to `defaultSelectedKeys`, and skipping mirrors
 * `toggleTreeCheckedSelection`'s disabled guard rather than throwing on it).
 * Moved ids are cleared from the origin panel's selection and deliberately
 * left unselected in the destination panel — a move commits a value, it does
 * not also commit a new pending selection the user did not make.
 */
export declare function moveTransferListSelection<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>, selection: TransferListSelection<Id>, direction: TransferListMoveDirection): TransferListMoveResult<Id>;
/**
 * Where focus lands once the moved rows are gone from a panel: the item that
 * slid into the first removed row's position, so keyboard users keep moving
 * down the list without their focus jumping to the top or vanishing. `null`
 * means the panel is now empty — the renderer falls back to the panel's
 * empty-state message or the move button, never to the document body.
 */
export declare function resolveTransferListFocusAfterMove<Id extends CollectionKey>(remainingPanelItems: readonly SelectItemDescriptor<Id>[], removedIndex: number): Id | null;
/** Drops selected ids that left either panel (item removed from `items` entirely). */
export declare function reconcileTransferListSelection<Id extends CollectionKey>(descriptor: TransferListDescriptor<Id>, selection: TransferListSelection<Id>): TransferListSelection<Id>;
export declare const transferListRecipe: {
    readonly slots: readonly ["root", "panel", "panelHeader", "panelTitle", "panelCount", "list", "item", "itemCheckbox", "emptyState", "moveControls", "moveButton"];
    readonly panel: {
        readonly background: Readonly<{
            source: "theme";
            key: "surface";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly radius: "md";
    };
    readonly panelHeader: {
        readonly minHeight: 44;
        readonly paddingHorizontal: 12;
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly count: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
    };
    readonly item: {
        readonly minHeight: 44;
        readonly paddingHorizontal: 12;
        readonly gap: 12;
        readonly radius: "md";
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly highlightedBackground: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly selectedBackground: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly selectedIndicator: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly emptyState: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly textVariant: "label";
    };
    readonly moveControls: {
        readonly gap: 12;
    };
    readonly moveButton: {
        readonly minTarget: 44;
        readonly color: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly disabledOpacity: 0.4;
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
};
export declare const transferListBehavior: {
    readonly controlled: readonly ["targetKeys", "defaultTargetKeys", "onTargetKeysChange"];
    readonly inputs: readonly ["items"];
    readonly events: readonly ["onMove"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["empty", "filled", "selected", "mixed"];
    };
    readonly web: {
        readonly roles: readonly ["group", "listbox", "option", "checkbox", "button"];
        readonly keyboard: readonly ["Tab", "Space", "Enter", "ArrowUp", "ArrowDown", "Home", "End"];
        readonly focus: "roving";
    };
    readonly native: {
        readonly roles: readonly ["list", "checkbox", "button"];
        readonly states: readonly ["disabled", "selected", "checked"];
        readonly actions: readonly ["toggle", "toggleSelectAll", "moveSelection", "moveItem"];
    };
    readonly scenarios: readonly ["moving-is-reachable-entirely-by-keyboard-select-with-space-then-activate-the-move-button", "moving-a-single-focused-row-does-not-require-first-opening-multi-select", "focus-after-a-move-lands-on-the-item-that-slid-into-the-removed-rows-position", "focus-after-emptying-a-panel-falls-back-to-its-empty-state-never-lost-to-the-document", "every-move-emits-which-ids-moved-so-the-product-can-announce-a-formatted-sentence", "disabled-items-are-never-selectable-and-never-move", "moved-items-are-cleared-from-the-origin-panels-selection-and-left-unselected-at-the-destination", "select-all-in-a-panel-excludes-disabled-items-from-both-the-denominator-and-the-count", "an-item-with-nothing-selected-in-its-panel-still-supports-direct-single-item-move", "search-and-pagination-inside-a-panel-are-product-composition-not-this-contract"];
};
//# sourceMappingURL=transfer-list.d.ts.map