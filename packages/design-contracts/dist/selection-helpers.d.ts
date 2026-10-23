export type CheckboxState = boolean | "mixed";
export type MixedCheckboxActivation = "check" | "uncheck";
/** Minimum collection shape needed by checkbox selection algorithms. */
export type CheckboxSelectionItem<Key extends string = string> = Readonly<{
    id: Key;
    label: string;
    description?: string;
    disabled?: boolean;
}>;
export declare const checkboxBehaviorDefaults: {
    readonly mixedActivation: "check";
};
export declare function getCheckboxNextState(current: CheckboxState, mixedActivation?: MixedCheckboxActivation): boolean;
export declare function toggleCheckboxSelection<Key extends string>(items: readonly CheckboxSelectionItem<Key>[], current: ReadonlySet<Key>, id: Key): ReadonlySet<Key>;
export declare function reconcileCheckboxSelection<Key extends string>(items: readonly CheckboxSelectionItem<Key>[], current: ReadonlySet<Key>): ReadonlySet<Key>;
/**
 * Smallest scroll offset that shows an item inside a horizontal rail (SegmentedControl / CheckboxGroup
 * `overflow="scroll"`). `start`/`size` are the item's position and width in content coordinates; `inset` keeps
 * that much room around the item (focus ring, hit slop). Returns the current offset when the item is already shown.
 */
export declare function resolveScrollRevealOffset(offset: number, viewport: number, start: number, size: number, inset?: number): number;
//# sourceMappingURL=selection-helpers.d.ts.map