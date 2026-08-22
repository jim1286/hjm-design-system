import type { AsyncCollectionState, ComboboxCommitReason, ComboboxFiltering, ComboboxInput, CollectionItemDescriptor, CollectionKey, CollectionSectionDescriptor, SelectItemDescriptor, SelectSelection, WebKeyboardKey } from "./behaviors.js";
export type CollectionSource<Key extends CollectionKey = CollectionKey, SectionKey extends CollectionKey = CollectionKey> = Readonly<{
    items: readonly CollectionItemDescriptor<Key>[];
    sections?: never;
}> | Readonly<{
    items?: never;
    sections: readonly CollectionSectionDescriptor<Key, SectionKey>[];
}>;
export type SelectCollectionSectionDescriptor<Key extends CollectionKey = CollectionKey, SectionKey extends CollectionKey = CollectionKey> = Readonly<{
    id: SectionKey;
    items: readonly SelectItemDescriptor<Key>[];
}> & (Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: string;
    accessibilityLabel: string;
}>);
/** Select/Combobox source excludes Menu-only danger tone and shortcut. */
export type SelectCollectionSource<Key extends CollectionKey = CollectionKey, SectionKey extends CollectionKey = CollectionKey> = Readonly<{
    items: readonly SelectItemDescriptor<Key>[];
    sections?: never;
}> | Readonly<{
    items?: never;
    sections: readonly SelectCollectionSectionDescriptor<Key, SectionKey>[];
}>;
export type CollectionValidationOptions = Readonly<{
    requireItemLabel?: boolean;
    requireTextValue?: boolean;
    requireSectionName?: boolean;
}>;
export declare const collectionValidationDefaults: {
    readonly requireItemLabel: true;
    readonly requireTextValue: true;
    readonly requireSectionName: true;
};
/**
 * Validates renderer-neutral collection identity before focus or selection state
 * is derived. Item IDs are global across sections because selection APIs expose
 * one key namespace.
 */
export declare function validateCollection<Key extends CollectionKey, SectionKey extends CollectionKey>(source: CollectionSource<Key, SectionKey>, options?: CollectionValidationOptions): void;
export declare function flattenCollectionItems<Key extends CollectionKey, SectionKey extends CollectionKey>(source: CollectionSource<Key, SectionKey>): readonly CollectionItemDescriptor<Key>[];
export declare function resolveCollectionItem<Key extends CollectionKey, SectionKey extends CollectionKey>(source: CollectionSource<Key, SectionKey>, key: Key | null | undefined): CollectionItemDescriptor<Key> | null;
export type ReconcileSelectOptions<Key extends CollectionKey = CollectionKey> = Readonly<{
    disallowEmptySelection?: boolean;
    /** Retains a committed key while an async collection is transient. */
    asyncState?: AsyncCollectionState;
    /** Preserves committed copy when the current result page omits the item. */
    selectedItem?: SelectItemDescriptor<Key>;
}>;
export type CollectionNavigationIntent = "next" | "previous" | "first" | "last";
export declare function getCollectionNavigationIntent(key: WebKeyboardKey): CollectionNavigationIntent | undefined;
/** Navigation math shared by Menu, Select, Combobox and future listboxes. */
export declare function getCollectionNavigationTarget<Key extends CollectionKey, SectionKey extends CollectionKey>(source: CollectionSource<Key, SectionKey>, currentKey: Key | null | undefined, intent: CollectionNavigationIntent, loop?: boolean): Key | undefined;
export type CollectionTypeaheadOptions<Key extends CollectionKey = CollectionKey> = Readonly<{
    locale?: string | readonly string[];
    startsAfterKey?: Key | null;
}>;
/** Products own buffering; this helper owns matching order and disabled skip. */
export declare function getCollectionTypeaheadMatch<Key extends CollectionKey, SectionKey extends CollectionKey>(source: CollectionSource<Key, SectionKey>, query: string, options?: CollectionTypeaheadOptions<Key>): Key | undefined;
/** Missing keys clear; disabled-but-still-present selections are retained. */
export declare function reconcileSelectSelection<Key extends CollectionKey, SectionKey extends CollectionKey>(source: SelectCollectionSource<Key, SectionKey>, selectedKey: Key | null, options?: ReconcileSelectOptions<Key>): Key | null;
/** Resolves visible Select copy independently from a transient result page. */
export declare function resolveSelectSelectedItem<Key extends CollectionKey, SectionKey extends CollectionKey>(source: SelectCollectionSource<Key, SectionKey>, selectedKey: Key | null, selectedItem?: SelectItemDescriptor<Key>): SelectItemDescriptor<Key> | null;
export type SelectOpenChangeReason = "trigger" | "keyboard" | "selection" | "escape" | "outside" | "blur" | "programmatic";
export type SelectOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, reason: SelectOpenChangeReason): void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: SelectOpenChangeReason) => void;
}>;
export type SelectLabel = Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: never;
    accessibilityLabel: string;
}>;
export type SelectConfiguration = Readonly<{
    disallowEmptySelection?: boolean;
    loop?: boolean;
}>;
export type SelectCollectionState<Key extends CollectionKey = CollectionKey> = Readonly<{
    asyncState?: AsyncCollectionState;
    selectedItem?: SelectItemDescriptor<Key>;
}>;
export type SelectState<Key extends CollectionKey = CollectionKey> = SelectSelection<Key> & SelectOpenState & SelectLabel & SelectConfiguration & SelectCollectionState<Key>;
export type ComboboxCollectionState = Readonly<{
    filtering?: Extract<ComboboxFiltering, "local">;
    asyncState?: AsyncCollectionState;
    queryValue?: never;
    resultQuery?: never;
}> | Readonly<{
    filtering: Extract<ComboboxFiltering, "external">;
    asyncState: AsyncCollectionState;
    /** Canonical query currently requested by the product search adapter. */
    queryValue: string;
    /** Exact canonical query that produced the supplied external items. */
    resultQuery: string;
}>;
/**
 * The future adaptive Combobox keeps selection, editable input and popup state
 * independently controlled. External results carry their originating query so
 * a renderer can reject responses that arrived after the input changed.
 */
export type ComboboxState<Key extends CollectionKey = CollectionKey> = SelectSelection<Key> & ComboboxInput & SelectOpenState & SelectLabel & ComboboxCollectionState & Readonly<{
    loop?: boolean;
}> & Readonly<{
    /** Preserves committed copy when transient external results omit it. */
    selectedItem?: SelectItemDescriptor<Key>;
    onCommit?: (key: Key | null, reason: ComboboxCommitReason) => void;
}>;
export declare function isComboboxResultCurrent(queryValue: string, resultQuery: string): boolean;
/**
 * External result pages are not the source of truth for a committed value.
 * A product may supply the committed descriptor while a different query is
 */
export declare function resolveComboboxSelectedItem<Key extends CollectionKey, SectionKey extends CollectionKey>(source: SelectCollectionSource<Key, SectionKey>, selectedKey: Key | null, selectedItem?: SelectItemDescriptor<Key>): SelectItemDescriptor<Key> | null;
//# sourceMappingURL=collection.d.ts.map