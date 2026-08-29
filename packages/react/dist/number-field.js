import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { commitNumberFieldInput, parseNumberFieldInput, resolveNumberFieldDescriptor, resolveNumberFieldInputStepperState, stepNumberFieldInput, } from "@hjmds/design-contracts/components/number-field";
import { forwardRef, useEffect, useId, useRef, useState, } from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";
function valueToInput(value) {
    return value === null ? "" : String(value);
}
function defaultInputMode(min, step) {
    if (min < 0)
        return "text";
    return Number.isInteger(step) ? "numeric" : "decimal";
}
/**
 * Exact numeric entry with a nullable draft and explicit single-step actions.
 * Typing commits on blur; steppers and ArrowUp/ArrowDown commit immediately.
 */
export const NumberField = forwardRef(function NumberField({ id, label, min, max, step, value, defaultValue = null, onValueChange, description, error, required = false, disabled = false, readOnly = false, size = "medium", decrementLabel, incrementLabel, getValueText, className, inputClassName, inputMode, onBlur, onFocus, onKeyDown, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...inputProps }, forwardedRef) {
    const generatedId = useId();
    const controlId = id ?? `hjm-number-${generatedId.replaceAll(":", "")}`;
    const descriptionId = `${controlId}-description`;
    const errorId = `${controlId}-error`;
    const inputRef = useRef(null);
    const controlled = value !== undefined;
    const controlledAtMount = useRef(controlled);
    if (controlledAtMount.current !== controlled) {
        throw new Error("HJM components cannot switch between controlled and uncontrolled state");
    }
    const [currentValue, setCurrentValue] = useControllableState({
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
    const restoreOrDisplay = (next) => {
        setDraft(valueToInput(controlled ? currentValue : next));
    };
    const commitDraft = () => {
        const next = commitNumberFieldInput(draft, descriptor);
        if (next === undefined) {
            setDraft(valueToInput(currentValue));
            return;
        }
        if (!Object.is(next, currentValue))
            setCurrentValue(next);
        restoreOrDisplay(next);
    };
    const stepValue = (direction) => {
        if (disabled || readOnly)
            return;
        const next = stepNumberFieldInput(draft, descriptor, direction);
        if (!Object.is(next, currentValue))
            setCurrentValue(next);
        restoreOrDisplay(next);
        inputRef.current?.focus({ preventScroll: true });
    };
    const handleFocus = (event) => {
        setFocused(true);
        onFocus?.(event);
    };
    const handleBlur = (event) => {
        setFocused(false);
        commitDraft();
        onBlur?.(event);
    };
    const handleKeyDown = (event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled || readOnly)
            return;
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            stepValue(event.key === "ArrowUp" ? "increment" : "decrement");
        }
        else if (event.key === "Enter") {
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
    const announcedValue = typeof parsedDraft === "number" && parsedDraft >= min && parsedDraft <= max
        ? parsedDraft
        : currentValue;
    const valueText = announcedValue === null ? undefined : getValueText?.(announcedValue);
    return (_jsxs("div", { className: classNames("hjm-field", "hjm-number-field", className), "data-availability": disabled ? "disabled" : readOnly ? "readOnly" : "enabled", "data-size": size, "data-state": state, "data-value": currentValue === null ? "empty" : "filled", children: [_jsxs("label", { className: "hjm-field__label", htmlFor: controlId, children: [label, required ? _jsx("span", { "aria-hidden": "true", children: " *" }) : null] }), _jsxs("div", { className: "hjm-field__control hjm-number-field__control", children: [_jsx("button", { type: "button", "aria-controls": controlId, "aria-label": decrementLabel, className: "hjm-number-field__stepper", "data-direction": "decrement", disabled: unavailable || stepper.decrementDisabled, onClick: () => stepValue("decrement"), onMouseDown: (event) => event.preventDefault(), tabIndex: -1, children: _jsx("span", { "aria-hidden": "true", children: "\u2212" }) }), _jsx("input", { ...inputProps, ref: composeRefs(inputRef, forwardedRef), id: controlId, type: "text", role: "spinbutton", className: classNames("hjm-field__input", "hjm-number-field__input", inputClassName), value: draft, inputMode: inputMode ?? defaultInputMode(min, descriptor.step), required: required, disabled: disabled, readOnly: readOnly, "aria-invalid": error ? true : ariaInvalid, "aria-describedby": describedBy, ...(error ? { "aria-errormessage": errorId } : {}), "aria-valuemin": min, "aria-valuemax": max, ...(announcedValue === null ? {} : { "aria-valuenow": announcedValue }), ...(valueText === undefined ? {} : { "aria-valuetext": valueText }), onChange: (event) => setDraft(event.currentTarget.value), onFocus: handleFocus, onBlur: handleBlur, onKeyDown: handleKeyDown }), _jsx("button", { type: "button", "aria-controls": controlId, "aria-label": incrementLabel, className: "hjm-number-field__stepper", "data-direction": "increment", disabled: unavailable || stepper.incrementDisabled, onClick: () => stepValue("increment"), onMouseDown: (event) => event.preventDefault(), tabIndex: -1, children: _jsx("span", { "aria-hidden": "true", children: "+" }) })] }), description && !error ? (_jsx("div", { id: descriptionId, className: "hjm-field__description", children: description })) : null, error ? (_jsx("div", { id: errorId, className: "hjm-field__error", children: error })) : null] }));
});
//# sourceMappingURL=number-field.js.map