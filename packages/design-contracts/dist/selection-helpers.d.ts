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
//# sourceMappingURL=selection-helpers.d.ts.map