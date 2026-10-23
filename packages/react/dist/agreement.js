"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { reconcileAgreementSelection, resolveAgreementState, toggleAgreementAll, toggleAgreementItem, validateAgreementDescriptor, } from "@hjmds/design-contracts/components/agreement";
import { forwardRef, useEffect, useId, useMemo, useRef } from "react";
import { classNames, useControllableState } from "./internal.js";
// Consent rows are multi-select, so they draw Checkbox's indicator; a 16px box with radius sm read as a radio dot.
function Mark({ state }) {
    return _jsx("span", { "aria-hidden": "true", className: "hjm-choice__indicator", "data-kind": "checkbox", "data-state": state === "mixed" ? "mixed" : state ? "checked" : "unchecked" });
}
export const Agreement = forwardRef(function Agreement({ descriptor, checkedIds: controlledChecked, defaultCheckedIds, onCheckedIdsChange, onStateChange, onDetail, requiredLabel, optionalLabel, className, layoutStyle, }, forwardedRef) {
    validateAgreementDescriptor(descriptor);
    const [rawChecked, setChecked] = useControllableState({
        ...(controlledChecked === undefined ? {} : { value: controlledChecked }),
        defaultValue: defaultCheckedIds ?? new Set(),
        ...(onCheckedIdsChange === undefined ? {} : { onChange: onCheckedIdsChange }),
    });
    // An item that left the list must not keep an orphan consent behind it.
    const checked = useMemo(() => reconcileAgreementSelection(descriptor, rawChecked), [descriptor, rawChecked]);
    const state = resolveAgreementState(descriptor, checked);
    const id = `${useId().replaceAll(":", "")}-agreement`;
    // Persist removed consent IDs so reinserting a row cannot silently consent again.
    useEffect(() => {
        if (controlledChecked === undefined && checked !== rawChecked)
            setChecked(checked);
    }, [checked, controlledChecked, rawChecked, setChecked]);
    // Report accepted state, including external value/required-item changes. A rejected
    // controlled request must not enable the product's submit button optimistically.
    const reported = useRef(undefined);
    useEffect(() => {
        const previous = reported.current;
        if (previous && previous.state.all === state.all && previous.state.satisfied === state.satisfied
            && previous.state.missingRequiredIds.length === state.missingRequiredIds.length
            && previous.state.missingRequiredIds.every((id, index) => id === state.missingRequiredIds[index])
            && previous.checked.size === checked.size && [...checked].every(id => previous.checked.has(id)))
            return;
        reported.current = { checked, state };
        onStateChange?.(state);
    });
    const commit = (next) => {
        if (descriptor.disabled)
            return;
        setChecked(next);
    };
    return (_jsxs("div", { ref: forwardedRef, role: "group", "aria-label": descriptor.accessibilityLabel, style: layoutStyle, className: classNames("hjm-agreement", className), children: [_jsxs("button", { type: "button", role: "checkbox", "aria-checked": state.all === "mixed" ? "mixed" : String(state.all === true), "aria-disabled": descriptor.disabled || undefined, className: "hjm-agreement__all", onClick: () => commit(toggleAgreementAll(descriptor, checked)), children: [_jsx(Mark, { state: state.all }), _jsx("span", { children: descriptor.allLabel })] }), _jsx("div", { className: "hjm-agreement__list", children: descriptor.items.map((item) => {
                    const itemChecked = checked.has(item.id);
                    return (_jsxs("div", { className: "hjm-agreement__item", "data-disabled": item.disabled || undefined, children: [_jsxs("button", { type: "button", role: "checkbox", id: `${id}-${item.id}`, "aria-checked": itemChecked, "aria-disabled": descriptor.disabled || item.disabled || undefined, "aria-describedby": item.description ? `${id}-${item.id}-description` : undefined, className: "hjm-agreement__toggle", onClick: () => { if (!descriptor.disabled && !item.disabled)
                                    commit(toggleAgreementItem(descriptor, checked, item.id)); }, children: [_jsx(Mark, { state: itemChecked }), _jsxs("span", { className: "hjm-agreement__copy", children: [_jsx("span", { children: item.label }), _jsx("span", { className: "hjm-agreement__required", "data-required": item.required || undefined, children: item.required ? requiredLabel : optionalLabel })] })] }), item.description ? (_jsx("p", { id: `${id}-${item.id}-description`, className: "hjm-agreement__description", children: item.description })) : null, item.detail ? (item.detail.href ? (_jsx("a", { className: "hjm-agreement__detail", href: item.detail.href, children: item.detail.label })) : (_jsx("button", { type: "button", className: "hjm-agreement__detail", onClick: () => onDetail?.(item.id), children: item.detail.label }))) : null] }, item.id));
                }) })] }));
});
//# sourceMappingURL=agreement.js.map