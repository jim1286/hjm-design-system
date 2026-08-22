import {
  commitNumberFieldInput,
  parseNumberFieldInput,
  resolveNumberFieldDescriptor,
  resolveNumberFieldInputStepperState,
  stepNumberFieldInput,
  type NumberFieldSize,
  type NumberFieldValue,
} from "@hjm/design-contracts/components/number-field";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { classNames, composeRefs, useControllableState } from "./internal.js";

type NativeNumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "aria-errormessage"
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "aria-valuetext"
  | "children"
  | "className"
  | "defaultValue"
  | "disabled"
  | "max"
  | "min"
  | "onChange"
  | "readOnly"
  | "required"
  | "role"
  | "size"
  | "step"
  | "type"
  | "value"
>;

export type NumberFieldProps = NativeNumberInputProps &
  Readonly<{
    label: ReactNode;
    min: number;
    max: number;
    step?: number;
    value?: NumberFieldValue;
    defaultValue?: NumberFieldValue;
    onValueChange?: (value: NumberFieldValue) => void;
    description?: ReactNode;
    error?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    size?: NumberFieldSize;
    /** Product-localized accessible name for the decrement action. */
    decrementLabel: string;
    /** Product-localized accessible name for the increment action. */
    incrementLabel: string;
    /** Optional product formatting for assistive output, never the editable text. */
    getValueText?: (value: number) => string;
    className?: string;
    inputClassName?: string;
  }>;

function valueToInput(value: NumberFieldValue): string {
  return value === null ? "" : String(value);
}

function defaultInputMode(min: number, step: number): "decimal" | "numeric" | "text" {
  if (min < 0) return "text";
  return Number.isInteger(step) ? "numeric" : "decimal";
}

/**
 * Exact numeric entry with a nullable draft and explicit single-step actions.
 * Typing commits on blur; steppers and ArrowUp/ArrowDown commit immediately.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    {
      id,
      label,
      min,
      max,
      step,
      value,
      defaultValue = null,
      onValueChange,
      description,
      error,
      required = false,
      disabled = false,
      readOnly = false,
      size = "medium",
      decrementLabel,
      incrementLabel,
      getValueText,
      className,
      inputClassName,
      inputMode,
      onBlur,
      onFocus,
      onKeyDown,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...inputProps
    },
    forwardedRef,
  ) {
    const generatedId = useId();
    const controlId = id ?? `hjm-number-${generatedId.replaceAll(":", "")}`;
    const descriptionId = `${controlId}-description`;
    const errorId = `${controlId}-error`;
    const inputRef = useRef<HTMLInputElement>(null);
    const controlled = value !== undefined;
    const controlledAtMount = useRef(controlled);
    if (controlledAtMount.current !== controlled) {
      throw new Error("HJM components cannot switch between controlled and uncontrolled state");
    }
    const [currentValue, setCurrentValue] = useControllableState<NumberFieldValue>({
      ...(controlled ? { value } : {}),
      defaultValue,
      ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const descriptor = resolveNumberFieldDescriptor({
      value: currentValue,
      min,
      max,
      ...(step === undefined ? {} : { step }),
    });
    const [draft, setDraft] = useState(() => valueToInput(currentValue));
    const [focused, setFocused] = useState(false);
    const stepper = resolveNumberFieldInputStepperState(draft, descriptor);

    useEffect(() => {
      setDraft(valueToInput(currentValue));
    }, [currentValue]);

    const restoreOrDisplay = (next: NumberFieldValue) => {
      setDraft(valueToInput(controlled ? currentValue : next));
    };

    const commitDraft = () => {
      const next = commitNumberFieldInput(draft, descriptor);
      if (next === undefined) {
        setDraft(valueToInput(currentValue));
        return;
      }
      if (!Object.is(next, currentValue)) setCurrentValue(next);
      restoreOrDisplay(next);
    };

    const stepValue = (direction: "increment" | "decrement") => {
      if (disabled || readOnly) return;
      const next = stepNumberFieldInput(draft, descriptor, direction);
      if (!Object.is(next, currentValue)) setCurrentValue(next);
      restoreOrDisplay(next);
      inputRef.current?.focus({ preventScroll: true });
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(event);
    };
    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      commitDraft();
      onBlur?.(event);
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        stepValue(event.key === "ArrowUp" ? "increment" : "decrement");
      } else if (event.key === "Enter") {
        commitDraft();
      }
    };

    const unavailable = disabled || readOnly;
    const state = disabled
      ? "disabled"
      : error || ariaInvalid
        ? "invalid"
        : focused
          ? "focused"
          : "idle";
    const describedBy = [
      ariaDescribedBy,
      error ? errorId : description ? descriptionId : undefined,
    ].filter(Boolean).join(" ") || undefined;
    const parsedDraft = parseNumberFieldInput(draft);
    const announcedValue =
      typeof parsedDraft === "number" && parsedDraft >= min && parsedDraft <= max
        ? parsedDraft
        : currentValue;
    const valueText = announcedValue === null ? undefined : getValueText?.(announcedValue);

    return (
      <div
        className={classNames("hjm-field", "hjm-number-field", className)}
        data-availability={disabled ? "disabled" : readOnly ? "readOnly" : "enabled"}
        data-size={size}
        data-state={state}
        data-value={currentValue === null ? "empty" : "filled"}
      >
        <label className="hjm-field__label" htmlFor={controlId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
        <div className="hjm-field__control hjm-number-field__control">
          <button
            type="button"
            aria-controls={controlId}
            aria-label={decrementLabel}
            className="hjm-number-field__stepper"
            data-direction="decrement"
            disabled={unavailable || stepper.decrementDisabled}
            onClick={() => stepValue("decrement")}
            onMouseDown={(event) => event.preventDefault()}
            tabIndex={-1}
          >
            <span aria-hidden="true">−</span>
          </button>
          <input
            {...inputProps}
            ref={composeRefs(inputRef, forwardedRef)}
            id={controlId}
            type="text"
            role="spinbutton"
            className={classNames(
              "hjm-field__input",
              "hjm-number-field__input",
              inputClassName,
            )}
            value={draft}
            inputMode={inputMode ?? defaultInputMode(min, descriptor.step)}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={describedBy}
            {...(error ? { "aria-errormessage": errorId } : {})}
            aria-valuemin={min}
            aria-valuemax={max}
            {...(announcedValue === null ? {} : { "aria-valuenow": announcedValue })}
            {...(valueText === undefined ? {} : { "aria-valuetext": valueText })}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            aria-controls={controlId}
            aria-label={incrementLabel}
            className="hjm-number-field__stepper"
            data-direction="increment"
            disabled={unavailable || stepper.incrementDisabled}
            onClick={() => stepValue("increment")}
            onMouseDown={(event) => event.preventDefault()}
            tabIndex={-1}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
        {description && !error ? (
          <div id={descriptionId} className="hjm-field__description">{description}</div>
        ) : null}
        {error ? (
          <div id={errorId} className="hjm-field__error">{error}</div>
        ) : null}
      </div>
    );
  },
);
