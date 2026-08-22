import { useCallback, useRef, useState } from "react";

export type ControllableStateOptions<Value> = Readonly<{
  value?: Value;
  defaultValue: Value;
  onChange?: (value: Value) => void;
}>;

/** A small renderer-local state bridge shared by every controlled/uncontrolled component. */
export function useControllableState<Value>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<Value>): readonly [Value, (next: Value) => void] {
  const controlledAtMount = useRef(value !== undefined);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);

  if (controlledAtMount.current !== isControlled) {
    throw new Error("HJM components cannot switch between controlled and uncontrolled state");
  }

  const resolved = isControlled ? value : internalValue;
  const setValue = useCallback(
    (next: Value) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [resolved, setValue] as const;
}
