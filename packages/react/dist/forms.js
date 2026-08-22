import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fieldRecipe, } from "@hjm/design-contracts/recipes/base";
import { searchFieldRecipe, } from "@hjm/design-contracts/recipes";
import { forwardRef, useId, useRef, useState, } from "react";
import { composeRefs, classNames, useControllableState } from "./internal.js";
function FieldFrame({ controlId, label, description, error, descriptionId, errorId, required = false, disabled = false, focused = false, variant = fieldRecipe.defaults.variant, shape = fieldRecipe.defaults.shape, className, children, ...props }) {
    const state = disabled ? "disabled" : error ? "invalid" : focused ? "focused" : "idle";
    return (_jsxs("div", { ...props, className: classNames("hjm-field", className), "data-state": state, "data-variant": variant, "data-shape": shape, children: [_jsxs("label", { className: "hjm-field__label", htmlFor: controlId, children: [label, required ? _jsx("span", { "aria-hidden": "true", children: " *" }) : null] }), children, description && !error ? (_jsx("div", { id: descriptionId, className: "hjm-field__description", children: description })) : null, error ? (_jsx("div", { id: errorId, className: "hjm-field__error", children: error })) : null] }));
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
export const TextField = forwardRef(function TextField({ id, label, description, error, required, disabled, variant, shape, leading, trailing, fieldClassName, className, onFocus, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...props }, ref) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    const handleFocus = (event) => {
        setFocused(true);
        onFocus?.(event);
    };
    const handleBlur = (event) => {
        setFocused(false);
        onBlur?.(event);
    };
    return (_jsx(FieldFrame, { controlId: ids.controlId, label: label, description: description, error: error, required: required ?? false, disabled: disabled ?? false, focused: focused, variant: variant ?? fieldRecipe.defaults.variant, shape: shape ?? fieldRecipe.defaults.shape, className: fieldClassName, ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: _jsxs("div", { className: "hjm-field__control", children: [leading ? _jsx("span", { className: "hjm-field__affix", children: leading }) : null, _jsx("input", { ...props, ref: ref, id: ids.controlId, className: classNames("hjm-field__input", className), required: required, disabled: disabled, "aria-invalid": error ? true : ariaInvalid, "aria-describedby": describedBy(ariaDescribedBy, description, error, ids.descriptionId, ids.errorId), onFocus: handleFocus, onBlur: handleBlur }), trailing ? _jsx("span", { className: "hjm-field__affix", children: trailing }) : null] }) }));
});
export const TextArea = forwardRef(function TextArea({ id, label, description, error, required, disabled, variant, shape, fieldClassName, className, onFocus, onBlur, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...props }, ref) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    return (_jsx(FieldFrame, { controlId: ids.controlId, label: label, description: description, error: error, required: required ?? false, disabled: disabled ?? false, focused: focused, variant: variant ?? fieldRecipe.defaults.variant, shape: shape ?? fieldRecipe.defaults.shape, className: fieldClassName, ...(description ? { descriptionId: ids.descriptionId } : {}), ...(error ? { errorId: ids.errorId } : {}), children: _jsx("div", { className: "hjm-field__control hjm-field__control--multiline", children: _jsx("textarea", { ...props, ref: ref, id: ids.controlId, className: classNames("hjm-field__input", className), required: required, disabled: disabled, "aria-invalid": error ? true : ariaInvalid, "aria-describedby": describedBy(ariaDescribedBy, description, error, ids.descriptionId, ids.errorId), onFocus: (event) => {
                    setFocused(true);
                    onFocus?.(event);
                }, onBlur: (event) => {
                    setFocused(false);
                    onBlur?.(event);
                } }) }) }));
});
export const SearchField = forwardRef(function SearchField({ value: valueProp, defaultValue = "", onValueChange, onChange, size = searchFieldRecipe.defaults.size, clearLabel, trailing, ...props }, forwardedRef) {
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const inputRef = useRef(null);
    return (_jsx(TextField, { ...props, ref: composeRefs(inputRef, forwardedRef), type: "search", value: value, "data-size": size, onChange: (event) => {
            setValue(event.currentTarget.value);
            onChange?.(event);
        }, trailing: value.length > 0 ? (_jsx("button", { type: "button", className: "hjm-search-field__clear", "aria-label": clearLabel, onClick: () => {
                setValue("");
                inputRef.current?.focus();
            }, children: "\u00D7" })) : trailing }));
});
//# sourceMappingURL=forms.js.map