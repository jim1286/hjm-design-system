import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { reconcileAgreementSelection, resolveAgreementState, toggleAgreementAll, toggleAgreementItem, validateAgreementDescriptor, } from "@hjmds/design-contracts/components/agreement";
import { forwardRef, useId, useMemo } from "react";
import { classNames, useControllableState } from "./internal.js";
function Mark({ state }) {
    return (_jsx("span", { "aria-hidden": "true", className: "hjm-agreement__mark", "data-state": String(state), children: state === true ? "✓" : state === "mixed" ? "–" : "" }));
}
export const Agreement = forwardRef(function Agreement({ descriptor, checkedIds: controlledChecked, defaultCheckedIds, onCheckedIdsChange, onStateChange, onDetail, requiredLabel, optionalLabel, className, }, forwardedRef) {
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
    const commit = (next) => {
        setChecked(next);
        onStateChange?.(resolveAgreementState(descriptor, next));
    };
    return (_jsxs("div", { ref: forwardedRef, role: "group", "aria-label": descriptor.accessibilityLabel, className: classNames("hjm-agreement", className), children: [_jsxs("button", { type: "button", role: "checkbox", "aria-checked": state.all === "mixed" ? "mixed" : String(state.all === true), className: "hjm-agreement__all", onClick: () => commit(toggleAgreementAll(descriptor, checked)), children: [_jsx(Mark, { state: state.all }), _jsx("span", { children: descriptor.allLabel })] }), _jsx("div", { className: "hjm-agreement__list", children: descriptor.items.map((item) => {
                    const itemChecked = checked.has(item.id);
                    return (_jsxs("div", { className: "hjm-agreement__item", "data-disabled": item.disabled || undefined, children: [_jsxs("button", { type: "button", role: "checkbox", id: `${id}-${item.id}`, "aria-checked": itemChecked, "aria-disabled": item.disabled || undefined, "aria-describedby": item.description ? `${id}-${item.id}-description` : undefined, className: "hjm-agreement__toggle", onClick: () => { if (!item.disabled)
                                    commit(toggleAgreementItem(descriptor, checked, item.id)); }, children: [_jsx(Mark, { state: itemChecked }), _jsxs("span", { className: "hjm-agreement__copy", children: [_jsx("span", { children: item.label }), _jsx("span", { className: "hjm-agreement__required", "data-required": item.required || undefined, children: item.required ? requiredLabel : optionalLabel })] })] }), item.description ? (_jsx("p", { id: `${id}-${item.id}-description`, className: "hjm-agreement__description", children: item.description })) : null, item.detail ? (item.detail.href ? (_jsx("a", { className: "hjm-agreement__detail", href: item.detail.href, children: item.detail.label })) : (_jsx("button", { type: "button", className: "hjm-agreement__detail", onClick: () => onDetail?.(item.id), children: item.detail.label }))) : null] }, item.id));
                }) })] }));
});
//# sourceMappingURL=agreement.js.map