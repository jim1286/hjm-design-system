import { type Dispatch, type Ref, type SetStateAction } from "react";
export declare function classNames(...values: readonly (string | false | null | undefined)[]): string | undefined;
export declare function assignRef<Element>(ref: Ref<Element> | undefined, value: Element | null): void;
export declare function composeRefs<Element>(...refs: readonly (Ref<Element> | undefined)[]): (value: Element | null) => void;
type ControllableStateOptions<Value> = Readonly<{
    value?: Value;
    defaultValue: Value;
    onChange?: (value: Value) => void;
}>;
export declare function useControllableState<Value>({ value, defaultValue, onChange, }: ControllableStateOptions<Value>): readonly [
    Value,
    Dispatch<SetStateAction<Value>>
];
export declare function useWindowWidth(): number;
export declare function useElementWidth<Element extends HTMLElement>(externalRef?: Ref<Element>): readonly [number | undefined, (node: Element | null) => void];
export {};
//# sourceMappingURL=internal.d.ts.map