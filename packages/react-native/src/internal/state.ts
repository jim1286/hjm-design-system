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
export function mixedCheckboxState(
  checked: boolean | "mixed",
  extra: Readonly<{ disabled?: boolean }> = {},
): Readonly<{ checked: boolean | "mixed"; busy: false; disabled?: boolean }> {
  return { checked, busy: false, ...extra };
}
