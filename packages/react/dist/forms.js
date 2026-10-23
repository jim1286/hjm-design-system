"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { fieldRecipe, } from "@hjmds/design-contracts/recipes/base";
import { iconRecipe, searchFieldRecipe, } from "@hjmds/design-contracts/recipes";
import { passwordFieldRecipe, resolvePasswordFieldDescriptor, } from "@hjmds/design-contracts/components/password-field";
import { getOtpFieldSlotValues, otpFieldRecipe, resolveOtpFieldValue, } from "@hjmds/design-contracts/components/otp-field";
import { resolveCharacterCount, resolveCharacterCountMaxLength, shouldAnnounceCharacterCount, } from "@hjmds/design-contracts/character-count";
import { createContext, forwardRef, useContext, useEffect, useId, useLayoutEffect, useRef, useState, } from "react";
import { composeRefs, classNames, isAriaInvalid, useControllableState } from "./internal.js";
import { useInitialFocusTarget } from "./internal/initial-focus.js";
import { Icon } from "./supplemental-display.js";
import { FieldError } from "./internal/field-error.js";
/*
  How far a disabled field fades its label and control (fieldRecipe.disabledScope). The
  frame defaults to fieldRecipe.disabledOpacity; SearchField and PasswordField render
  through the public TextField, so they hand their own recipe value down this
  module-private context instead of widening TextField's public props.
*/
const FieldDisabledOpacityContext = createContext(undefined);
function FieldFrame({ controlId, label, description, error, descriptionId, errorId, required = false, disabled = false, focused = false, invalid = false, variant = fieldRecipe.defaults.variant, shape = fieldRecipe.defaults.shape, align = fieldRecipe.defaults.align, disabledOpacity, className, children, layoutStyle, style, ...props }) {
    // A grouped field may reference one external error; aria-invalid must still
    // use the invalid recipe even when no inline error copy is repeated.
    const state = disabled ? "disabled" : error || invalid ? "invalid" : focused ? "focused" : "idle";
    const inheritedOpacity = useContext(FieldDisabledOpacityContext);
    const recipeOpacity = disabledOpacity ?? inheritedOpacity;
    return (_jsxs("div", { ...props, 
        // The stylesheet fades the label and control with --hjm-field-disabled-opacity
        // (theme value: fieldRecipe.disabledOpacity); a component recipe value is set
        // here, only while disabled, so enabled roots keep their old inline style.
        style: {
            ...style,
            ...layoutStyle,
            ...(disabled && recipeOpacity !== undefined
                ? { "--hjm-field-disabled-opacity": recipeOpacity }
                : {}),
        }, className: classNames("hjm-field", className), "data-state": state, "data-invalid": Boolean(error || invalid) || undefined, "data-variant": variant, "data-shape": shape, "data-align": align, children: [label !== undefined && label !== null ? (_jsxs("label", { className: "hjm-field__label", htmlFor: controlId, children: [label, required ? _jsx("span", { "aria-hidden": "true", children: " *" }) : null] })) : null, children, description ? (_jsx("div", { id: descriptionId, className: "hjm-field__description", children: description })) : null, _jsx(FieldError, { id: errorId, error: error })] }));
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
        // Same merge as the built-in fields: support text stays referenced once an
        // error appears, so a custom control does not have to re-derive the ids.
        ...(description || error
            ? {
                "aria-describedby": [description ? descriptionId : undefined, error ? errorId : undefined]
                    .filter(Boolean)
                    .join(" "),
            }
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
/*
  Support text and the error are both referenced when both exist, in DOM reading
  order, and the consumer's own `aria-describedby` is kept in front of them.
  Announcing only the error (the earlier behaviour) dropped the guidance that
  explains how to fix it — exactly the text a product then duplicated into the
  error string by hand.
*/
function describedBy(own, description, error, descriptionId, errorId) {
    return [own, description ? descriptionId : undefined, error ? errorId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
}
function requireFieldAccessibleName(label, ariaLabel) {
    if ((label === undefined || label === null) && !ariaLabel?.trim()) {
        throw new TypeError("Field controls require either label or aria-label");
    }
}
/*
  Character count (characterCountRecipe, 2026-10-23 BurnTok ComposerCount/TextLengthHint). The row sits under the
  control and before the description, and `aria-describedby` references it, so the counter and sentence are read on
  focus. A separate polite live region announces only on entering near/short/over: announcing each keystroke
  would talk over the typed text.
*/
function useCharacterCount(options, value, ownMaxLength) {
    if (options && ownMaxLength !== undefined) {
        throw new TypeError("Pass the limit through characterCount.max instead of maxLength");
    }
    const state = options ? resolveCharacterCount(value, options) : undefined;
    const previous = useRef(undefined);
    const [announcement, setAnnouncement] = useState("");
    const status = state?.status;
    useEffect(() => {
        if (state && shouldAnnounceCharacterCount(previous.current, state))
            setAnnouncement(state.message ?? "");
        previous.current = status;
        // Only a status change announces; the message inside one status changes with every keystroke.
    }, [status]);
    const maxLength = options ? resolveCharacterCountMaxLength(options) : ownMaxLength;
    return { ...(state ? { state } : {}), announcement, ...(maxLength === undefined ? {} : { maxLength }) };
}
function CharacterCountRow({ id, state, announcement }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { id: id, className: "hjm-field__count", "data-status": state.status, "data-invalid": state.invalid || undefined, children: [state.message ? _jsx("span", { className: "hjm-field__count-message", children: state.message }) : null, _jsx("span", { className: "hjm-field__counter", children: state.counter })] }), _jsx("span", { className: "hjm-visually-hidden", "aria-live": "polite", "data-hjm-field-count-announcement": "", children: announcement })] }));
}
function useDraftValue(value, defaultValue) {
    const [draft, setDraft] = useState(() => (defaultValue === undefined || defaultValue === null ? "" : String(defaultValue)));
    return [value === undefined || value === null ? draft : String(value), setDraft];
}
export const TextField = forwardRef(function TextField({ id, label, description, error, required, disabled, variant, shape, align, leading, trailing, fieldClassName, className, onFocus, onBlur, onChange, onValueChange, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, layoutStyle, initialFocusTarget, characterCount, maxLength: ownMaxLength, ...props }, ref) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    requireFieldAccessibleName(label, ariaLabel);
    const [countedValue, setDraft] = useDraftValue(props.value, props.defaultValue);
    const count = useCharacterCount(characterCount, countedValue, ownMaxLength);
    const countId = `${ids.controlId}-count`;
    const control = useRef(null);
    useInitialFocusTarget(control, initialFocusTarget);
    const handleFocus = (event) => {
        setFocused(true);
        onFocus?.(event);
    };
    const handleBlur = (event) => {
        setFocused(false);
        onBlur?.(event);
    };
    return (_jsxs(FieldFrame, { controlId: ids.controlId, label: label, description: description, error: error, required: required ?? false, disabled: disabled ?? false, focused: focused, invalid: isAriaInvalid(ariaInvalid) || count.state?.status === "over", variant: variant ?? fieldRecipe.defaults.variant, shape: shape ?? fieldRecipe.defaults.shape, align: align ?? fieldRecipe.defaults.align, className: fieldClassName, ...(layoutStyle === undefined ? {} : { layoutStyle }), ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: [_jsxs("div", { className: "hjm-field__control", children: [leading ? _jsx("span", { className: "hjm-field__affix", children: leading }) : null, _jsx("input", { ...props, ref: composeRefs(control, ref), id: ids.controlId, className: classNames("hjm-field__input", className), required: required, disabled: disabled, ...(count.maxLength === undefined ? {} : { maxLength: count.maxLength }), "aria-invalid": error || count.state?.status === "over" ? true : ariaInvalid, "aria-label": ariaLabel, "aria-describedby": describedBy([ariaDescribedBy, count.state ? countId : undefined].filter(Boolean).join(" ") || undefined, description, error, ids.descriptionId, ids.errorId), onFocus: handleFocus, onBlur: handleBlur, onChange: (event) => {
                            setDraft(event.currentTarget.value);
                            onChange?.(event);
                            onValueChange?.(event.currentTarget.value);
                        } }), trailing ? _jsx("span", { className: "hjm-field__affix", children: trailing }) : null] }), count.state ? _jsx(CharacterCountRow, { id: countId, state: count.state, announcement: count.announcement }) : null] }));
});
export const TextArea = forwardRef(function TextArea({ id, label, description, error, required, disabled, variant, shape, trailing, leadingAction, align, fieldClassName, className, onFocus, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, minVisibleLines, maxVisibleLines, style, layoutStyle, initialFocusTarget, characterCount, maxLength: ownMaxLength, onChange, ...props }, ref) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    requireFieldAccessibleName(label, ariaLabel);
    const [countedValue, setDraft] = useDraftValue(props.value, props.defaultValue);
    const count = useCharacterCount(characterCount, countedValue, ownMaxLength);
    const countId = `${ids.controlId}-count`;
    const control = useRef(null);
    useInitialFocusTarget(control, initialFocusTarget);
    // Bounds are expressed in lines so the recipe keeps line height and padding.
    const lineBounds = {
        ...(minVisibleLines === undefined
            ? {}
            : { "--hjm-field-min-visible-lines": minVisibleLines }),
        ...(maxVisibleLines === undefined
            ? {}
            : { "--hjm-field-max-visible-lines": maxVisibleLines }),
    };
    return (_jsxs(FieldFrame, { controlId: ids.controlId, label: label, description: description, error: error, required: required ?? false, disabled: disabled ?? false, focused: focused, invalid: isAriaInvalid(ariaInvalid) || count.state?.status === "over", variant: variant ?? fieldRecipe.defaults.variant, shape: shape ?? fieldRecipe.defaults.shape, align: align ?? fieldRecipe.defaults.align, className: fieldClassName, ...(layoutStyle === undefined ? {} : { layoutStyle }), ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: [_jsxs("div", { className: "hjm-field__control hjm-field__control--multiline", children: [leadingAction ? _jsx("span", { className: "hjm-field__leading", children: leadingAction }) : null, _jsx("textarea", { ...props, ref: composeRefs(control, ref), id: ids.controlId, className: classNames("hjm-field__input", className), style: { ...style, ...lineBounds }, required: required, disabled: disabled, ...(count.maxLength === undefined ? {} : { maxLength: count.maxLength }), "aria-invalid": error || count.state?.status === "over" ? true : ariaInvalid, "aria-label": ariaLabel, "aria-describedby": describedBy([ariaDescribedBy, count.state ? countId : undefined].filter(Boolean).join(" ") || undefined, description, error, ids.descriptionId, ids.errorId), onChange: (event) => {
                            setDraft(event.currentTarget.value);
                            onChange?.(event);
                        }, onFocus: (event) => {
                            setFocused(true);
                            onFocus?.(event);
                        }, onBlur: (event) => {
                            setFocused(false);
                            onBlur?.(event);
                        } }), trailing ? _jsx("span", { className: "hjm-field__trailing", children: trailing }) : null] }), count.state ? _jsx(CharacterCountRow, { id: countId, state: count.state, announcement: count.announcement }) : null] }));
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
    const canClear = value.length > 0 && !disabled && !props.readOnly;
    return (_jsx(FieldDisabledOpacityContext.Provider, { value: searchFieldRecipe.states.disabledOpacity, children: _jsx(TextField, { ...props, ref: composeRefs(inputRef, forwardedRef), type: "search", value: value, "data-size": size, "data-loading": loading || undefined, disabled: disabled, "aria-busy": loading || ariaBusy || undefined, fieldClassName: classNames("hjm-search-field", fieldClassName), leading: leading ?? (renderSearchIcon ? renderSearchIcon(iconAppearance) : undefined), onChange: (event) => {
                setValue(event.currentTarget.value);
                onChange?.(event);
            }, trailing: loading ? (_jsx("span", { className: "hjm-search-field__spinner", "aria-hidden": "true", children: renderLoadingIndicator?.(iconAppearance) })) : canClear ? (_jsx("button", { type: "button", className: "hjm-search-field__clear", "aria-label": clearLabel, onMouseDown: (event) => event.preventDefault(), onClick: () => {
                    setValue("");
                    onClear?.();
                    inputRef.current?.focus();
                }, children: renderClearIcon?.(iconAppearance) ?? "×" })) : trailing }) }));
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
    return (_jsx(FieldDisabledOpacityContext.Provider, { value: passwordFieldRecipe.states.disabledOpacity, children: _jsx(TextField, { ...props, ref: composeRefs(inputRef, forwardedRef), autoComplete: autofillHint === "none" ? "off" : autofillHint === "current" ? "current-password" : "new-password", className: classNames("hjm-password-field__input", className), disabled: disabled, fieldClassName: classNames("hjm-password-field", `hjm-password-field--${size}`, fieldClassName), onChange: (event) => {
                setValue(event.currentTarget.value);
                onChange?.(event);
            }, readOnly: readOnly, trailing: (_jsx("button", { "aria-label": resolved.toggleAccessibleName, className: "hjm-password-field__toggle", "data-revealed": revealed || undefined, disabled: disabled, onClick: () => {
                    const input = inputRef.current;
                    if (input && input.selectionStart !== null && input.selectionEnd !== null) {
                        selectionRef.current = {
                            start: input.selectionStart,
                            end: input.selectionEnd,
                        };
                    }
                    setRevealed(!revealed);
                }, type: "button", children: renderToggleIcon?.(toggleAppearance) ?? _jsx(Icon, { name: toggleAppearance.name, size: "sm" }) })), type: resolved.webInputType, value: value }) }));
});
/** One accessible numeric input rendered as decorative OTP slots. */
export const OtpField = forwardRef(function OtpField({ id, label, description, error, required, disabled, readOnly, busy = false, length, value: valueProp, defaultValue = "", onValueChange, onComplete, onChange, size = otpFieldRecipe.defaults.size, presentation = "boxes", fieldClassName, className, onFocus, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, layoutStyle, ...props }, ref) {
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
    return (_jsx(FieldFrame, { className: classNames("hjm-otp-field", fieldClassName), disabledOpacity: otpFieldRecipe.states.disabledOpacity, ...(layoutStyle === undefined ? {} : { layoutStyle }), controlId: ids.controlId, description: description, disabled: (disabled ?? false) || busy, error: error, focused: focused, label: label, required: required ?? false, ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: _jsxs("div", { className: "hjm-otp-field__control", "data-presentation": presentation, "data-complete": complete || undefined, "data-size": size, style: { "--hjm-otp-length": length }, children: [_jsx("input", { ...props, ref: ref, "aria-busy": busy || undefined, "aria-describedby": describedBy(ariaDescribedBy, description, error, ids.descriptionId, ids.errorId), "aria-invalid": error ? true : ariaInvalid, "aria-label": ariaLabel, autoComplete: "one-time-code", className: classNames("hjm-otp-field__input", className), 
                    // busy stays focusable (read-only); see otp-field.md.
                    disabled: disabled, id: ids.controlId, inputMode: "numeric", maxLength: length, onBlur: (event) => {
                        setFocused(false);
                        onBlur?.(event);
                    }, onChange: (event) => {
                        setValue(resolveOtpFieldValue(length, event.currentTarget.value));
                        onChange?.(event);
                    }, onFocus: (event) => {
                        setFocused(true);
                        onFocus?.(event);
                    }, pattern: "[0-9]*", readOnly: readOnly || busy, required: required, type: "text", value: value }), _jsx("div", { "aria-hidden": "true", className: "hjm-otp-field__slots", children: slots.map((digit, index) => (_jsx("span", { className: "hjm-otp-field__slot", "data-state": error
                            ? "invalid"
                            : focused && index === activeIndex
                                ? "focused"
                                : digit
                                    ? "filled"
                                    : "idle", children: digit }, index))) })] }) }));
});
//# sourceMappingURL=forms.js.map