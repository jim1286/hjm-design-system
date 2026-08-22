import { useCallback, useRef, useState } from "react";
/** A small renderer-local state bridge shared by every controlled/uncontrolled component. */
export function useControllableState({ value, defaultValue, onChange, }) {
    const controlledAtMount = useRef(value !== undefined);
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    if (controlledAtMount.current !== isControlled) {
        throw new Error("HJM components cannot switch between controlled and uncontrolled state");
    }
    const resolved = isControlled ? value : internalValue;
    const setValue = useCallback((next) => {
        if (!isControlled)
            setInternalValue(next);
        onChange?.(next);
    }, [isControlled, onChange]);
    return [resolved, setValue];
}
//# sourceMappingURL=state.js.map