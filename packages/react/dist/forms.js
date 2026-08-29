import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fieldRecipe, } from "@hjmds/design-contracts/recipes/base";
import { iconRecipe, searchFieldRecipe, } from "@hjmds/design-contracts/recipes";
import { passwordFieldRecipe, resolvePasswordFieldDescriptor, } from "@hjmds/design-contracts/components/password-field";
import { getOtpFieldSlotValues, otpFieldRecipe, resolveOtpFieldValue, } from "@hjmds/design-contracts/components/otp-field";
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { composeRefs, classNames, useControllableState } from "./internal.js";
function FieldFrame({ controlId, label, description, error, descriptionId, errorId, required = false, disabled = false, focused = false, variant = fieldRecipe.defaults.variant, shape = fieldRecipe.defaults.shape, className, children, ...props }) {
    const state = disabled ? "disabled" : error ? "invalid" : focused ? "focused" : "idle";
    return (_jsxs("div", { ...props, className: classNames("hjm-field", className), "data-state": state, "data-variant": variant, "data-shape": shape, children: [label !== undefined && label !== null ? (_jsxs("label", { className: "hjm-field__label", htmlFor: controlId, children: [label, required ? _jsx("span", { "aria-hidden": "true", children: " *" }) : null] })) : null, children, description && !error ? (_jsx("div", { id: descriptionId, className: "hjm-field__description", children: description })) : null, error ? (_jsx("div", { id: errorId, className: "hjm-field__error", children: error })) : null] }));
}
/** Generic frame for custom native controls; `controlId` keeps the label explicit. */
export function Field({ controlId, description, error, required = false, disabled = false, children, ...props }) {
    const descriptionId = `${controlId}-description`;
    const errorId = `${controlId}-error`;
    const controlProps = {
        id: controlId,
        required,
        disabled,
        ...(error ? { "aria-invalid": true } : {}),
        ...(error
            ? { "aria-describedby": errorId }
            : description
                ? { "aria-describedby": descriptionId }
                : {}),
    };
    return (_jsx(FieldFrame, { ...props, controlId: controlId, description: description, error: error, required: required, disabled: disabled, ...(description ? { descriptionId } : {}), ...(error ? { errorId } : {}), children: typeof children === "function" ? children(controlProps) : children }));
}
function useFieldIds(id) {
    const generatedId = useId();
    const controlId = id ?? `hjm-${generatedId.replaceAll(":", "")}`;
    return {
        controlId,
        descriptionId: `${controlId}-description`,
        errorId: `${controlId}-error`,
    };
}
function describedBy(own, description, error, descriptionId, errorId) {
    return [own, error ? errorId : description ? descriptionId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
}
function requireFieldAccessibleName(label, ariaLabel) {
    if ((label === undefined || label === null) && !ariaLabel?.trim()) {
        throw new TypeError("Field controls require either label or aria-label");
    }
}
export const TextField = forwardRef(function TextField({ id, label, description, error, required, disabled, variant, shape, leading, trailing, fieldClassName, className, onFocus, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, ...props }, ref) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    requireFieldAccessibleName(label, ariaLabel);
    const handleFocus = (event) => {
        setFocused(true);
        onFocus?.(event);
    };
    const handleBlur = (event) => {
        setFocused(false);
        onBlur?.(event);
    };
    return (_jsx(FieldFrame, { controlId: ids.controlId, label: label, description: description, error: error, required: required ?? false, disabled: disabled ?? false, focused: focused, variant: variant ?? fieldRecipe.defaults.variant, shape: shape ?? fieldRecipe.defaults.shape, className: fieldClassName, ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: _jsxs("div", { className: "hjm-field__control", children: [leading ? _jsx("span", { className: "hjm-field__affix", children: leading }) : null, _jsx("input", { ...props, ref: ref, id: ids.controlId, className: classNames("hjm-field__input", className), required: required, disabled: disabled, "aria-invalid": error ? true : ariaInvalid, "aria-label": ariaLabel, "aria-describedby": describedBy(ariaDescribedBy, description, error, ids.descriptionId, ids.errorId), onFocus: handleFocus, onBlur: handleBlur }), trailing ? _jsx("span", { className: "hjm-field__affix", children: trailing }) : null] }) }));
});
export const TextArea = forwardRef(function TextArea({ id, label, description, error, required, disabled, variant, shape, fieldClassName, className, onFocus, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, ...props }, ref) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    requireFieldAccessibleName(label, ariaLabel);
    return (_jsx(FieldFrame, { controlId: ids.controlId, label: label, description: description, error: error, required: required ?? false, disabled: disabled ?? false, focused: focused, variant: variant ?? fieldRecipe.defaults.variant, shape: shape ?? fieldRecipe.defaults.shape, className: fieldClassName, ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: _jsx("div", { className: "hjm-field__control hjm-field__control--multiline", children: _jsx("textarea", { ...props, ref: ref, id: ids.controlId, className: classNames("hjm-field__input", className), required: required, disabled: disabled, "aria-invalid": error ? true : ariaInvalid, "aria-label": ariaLabel, "aria-describedby": describedBy(ariaDescribedBy, description, error, ids.descriptionId, ids.errorId), onFocus: (event) => {
                    setFocused(true);
                    onFocus?.(event);
                }, onBlur: (event) => {
                    setFocused(false);
                    onBlur?.(event);
                } }) }) }));
});
export const SearchField = forwardRef(function SearchField({ value: valueProp, defaultValue = "", onValueChange, onChange, size = searchFieldRecipe.defaults.size, clearLabel, onClear, loading = false, renderSearchIcon, renderClearIcon, renderLoadingIndicator, leading, trailing, fieldClassName, disabled, "aria-busy": ariaBusy, ...props }, forwardedRef) {
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const inputRef = useRef(null);
    const iconAppearance = {
        color: "currentColor",
        size: iconRecipe.sizes[searchFieldRecipe.sizes[size].glyph],
    };
    const canClear = value.length > 0 && !disabled;
    return (_jsx(TextField, { ...props, ref: composeRefs(inputRef, forwardedRef), type: "search", value: value, "data-size": size, "data-loading": loading || undefined, disabled: disabled, "aria-busy": loading || ariaBusy || undefined, fieldClassName: classNames("hjm-search-field", fieldClassName), leading: leading ?? (renderSearchIcon ? renderSearchIcon(iconAppearance) : undefined), onChange: (event) => {
            setValue(event.currentTarget.value);
            onChange?.(event);
        }, trailing: loading ? (_jsx("span", { className: "hjm-search-field__spinner", "aria-hidden": "true", children: renderLoadingIndicator?.(iconAppearance) })) : canClear ? (_jsx("button", { type: "button", className: "hjm-search-field__clear", "aria-label": clearLabel, onMouseDown: (event) => event.preventDefault(), onClick: () => {
                setValue("");
                onClear?.();
                inputRef.current?.focus();
            }, children: renderClearIcon?.(iconAppearance) ?? "×" })) : trailing }));
});
/** Password input with an independently controlled, selection-safe reveal action. */
export const PasswordField = forwardRef(function PasswordField({ value: valueProp, defaultValue = "", onValueChange, onChange, revealed: revealedProp, defaultRevealed = false, onRevealedChange, autofillHint, revealLabel, concealLabel, size = passwordFieldRecipe.defaults.size, renderToggleIcon, fieldClassName, className, disabled, readOnly, ...props }, forwardedRef) {
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const [revealed, setRevealed] = useControllableState({
        ...(revealedProp === undefined ? {} : { value: revealedProp }),
        defaultValue: defaultRevealed,
        ...(onRevealedChange === undefined ? {} : { onChange: onRevealedChange }),
    });
    const resolved = resolvePasswordFieldDescriptor({ revealed, autofillHint }, {
        composeToggleAccessibleName: ({ willReveal }) => willReveal ? revealLabel : concealLabel,
    });
    const inputRef = useRef(null);
    const selectionRef = useRef(null);
    useLayoutEffect(() => {
        const selection = selectionRef.current;
        if (!selection || !inputRef.current)
            return;
        inputRef.current.setSelectionRange(selection.start, selection.end);
        selectionRef.current = null;
    }, [revealed]);
    const toggleAppearance = {
        name: revealed
            ? passwordFieldRecipe.toggle.icons.revealed
            : passwordFieldRecipe.toggle.icons.concealed,
        color: "currentColor",
        size: iconRecipe.sizes.sm,
        revealed,
        disabled: disabled ?? false,
    };
    return (_jsx(TextField, { ...props, ref: composeRefs(inputRef, forwardedRef), autoComplete: autofillHint === "current" ? "current-password" : "new-password", className: classNames("hjm-password-field__input", className), disabled: disabled, fieldClassName: classNames("hjm-password-field", `hjm-password-field--${size}`, fieldClassName), onChange: (event) => {
            setValue(event.currentTarget.value);
            onChange?.(event);
        }, readOnly: readOnly, trailing: (_jsx("button", { "aria-label": resolved.toggleAccessibleName, "aria-pressed": revealed, className: "hjm-password-field__toggle", "data-revealed": revealed || undefined, disabled: disabled, onClick: () => {
                const input = inputRef.current;
                if (input && input.selectionStart !== null && input.selectionEnd !== null) {
                    selectionRef.current = {
                        start: input.selectionStart,
                        end: input.selectionEnd,
                    };
                }
                setRevealed(!revealed);
            }, type: "button", children: renderToggleIcon?.(toggleAppearance) ?? _jsx("span", { "aria-hidden": "true" }) })), type: resolved.webInputType, value: value }));
});
/** One accessible numeric input rendered as decorative OTP slots. */
export const OtpField = forwardRef(function OtpField({ id, label, description, error, required, disabled, readOnly, busy = false, length, value: valueProp, defaultValue = "", onValueChange, onComplete, onChange, size = otpFieldRecipe.defaults.size, fieldClassName, className, onFocus, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, ...props }, ref) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    requireFieldAccessibleName(label, ariaLabel);
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue: resolveOtpFieldValue(length, defaultValue),
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const slots = getOtpFieldSlotValues({ length, value });
    const complete = value.length === length;
    const wasCompleteRef = useRef(complete);
    useEffect(() => {
        if (complete && !wasCompleteRef.current)
            onComplete?.(value);
        wasCompleteRef.current = complete;
    }, [complete, onComplete, value]);
    const activeIndex = Math.min(value.length, length - 1);
    return (_jsx(FieldFrame, { className: classNames("hjm-otp-field", fieldClassName), controlId: ids.controlId, description: description, disabled: (disabled ?? false) || busy, error: error, focused: focused, label: label, required: required ?? false, ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: _jsxs("div", { className: "hjm-otp-field__control", "data-complete": complete || undefined, "data-size": size, style: { "--hjm-otp-length": length }, children: [_jsx("input", { ...props, ref: ref, "aria-busy": busy || undefined, "aria-describedby": describedBy(ariaDescribedBy, description, error, ids.descriptionId, ids.errorId), "aria-invalid": error ? true : ariaInvalid, "aria-label": ariaLabel, autoComplete: "one-time-code", className: classNames("hjm-otp-field__input", className), disabled: disabled || busy, id: ids.controlId, inputMode: "numeric", maxLength: length, onBlur: (event) => {
                        setFocused(false);
                        onBlur?.(event);
                    }, onChange: (event) => {
                        setValue(resolveOtpFieldValue(length, event.currentTarget.value));
                        onChange?.(event);
                    }, onFocus: (event) => {
                        setFocused(true);
                        onFocus?.(event);
                    }, pattern: "[0-9]*", readOnly: readOnly, required: required, type: "text", value: value }), _jsx("div", { "aria-hidden": "true", className: "hjm-otp-field__slots", children: slots.map((digit, index) => (_jsx("span", { className: "hjm-otp-field__slot", "data-state": error
                            ? "invalid"
                            : focused && index === activeIndex
                                ? "focused"
                                : digit
                                    ? "filled"
                                    : "idle", children: digit }, index))) })] }) }));
});
//# sourceMappingURL=forms.js.map