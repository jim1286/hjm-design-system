export type ControllableStateOptions<Value> = Readonly<{
    value?: Value;
    defaultValue: Value;
    onChange?: (value: Value) => void;
}>;
/** A small renderer-local state bridge shared by every controlled/uncontrolled component. */
export declare function useControllableState<Value>({ value, defaultValue, onChange, }: ControllableStateOptions<Value>): readonly [Value, (next: Value) => void];
/**
 * accessibilityState for a checkbox that can be mixed.
 *
 * RN 0.81 Android (BaseViewManager.setViewState) rebuilds the content description
 * only while `checked` is the string "mixed" or a `busy`/`expanded` key is present.
 * Going from mixed back to true/false therefore left ", mixed" (or a bare "mixed"
 * when the label came from children) in the name (2026-09-30 audit: Agreement,
 * TransferList). An explicit `busy: false` makes every update rebuild it; it has no
 * announcement of its own on either platform. Rejected: remounting the row by key,
 * which drops TalkBack focus on the very press that changes the state.
 * TODO(remove when RN Android rebuilds the description on every checked change).
 */
export declare function mixedCheckboxState(checked: boolean | "mixed", extra?: Readonly<{
    disabled?: boolean;
}>): Readonly<{
    checked: boolean | "mixed";
    busy: false;
    disabled?: boolean;
}>;
//# sourceMappingURL=state.d.ts.map