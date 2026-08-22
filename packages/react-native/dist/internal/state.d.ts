export type ControllableStateOptions<Value> = Readonly<{
    value?: Value;
    defaultValue: Value;
    onChange?: (value: Value) => void;
}>;
/** A small renderer-local state bridge shared by every controlled/uncontrolled component. */
export declare function useControllableState<Value>({ value, defaultValue, onChange, }: ControllableStateOptions<Value>): readonly [Value, (next: Value) => void];
//# sourceMappingURL=state.d.ts.map