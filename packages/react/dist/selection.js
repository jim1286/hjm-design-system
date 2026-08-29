import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { chipRecipe, iconRecipe, segmentedControlRecipe, selectionControlRecipe, selectionGroupRecipe, } from "@hjmds/design-contracts/recipes";
import { resolveControlAccessibleName, reconcileCheckboxSelection, reconcileRadioSelection, resolveInitialRadioValue, toggleCheckboxSelection, validateCheckboxSelection, validateRadioSelection, } from "@hjmds/design-contracts/behaviors";
import { forwardRef, useEffect, useId, useRef, } from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";
/** Action/filter chip with explicit selection semantics and no hidden state. */
export const Chip = forwardRef(function Chip({ label, size = chipRecipe.defaults.size, leading, trailing, renderSelectionIndicator, selectionMode = "action", selected, onSelectedChange, onPress, disabled, className, ...props }, ref) {
    const selectable = selectionMode !== "action";
    const active = selectable && selected === true;
    return (_jsxs("button", { ...props, ref: ref, "aria-checked": selectable ? active : undefined, className: classNames("hjm-chip", className), "data-selected": active || undefined, "data-size": size, disabled: disabled, onClick: (event) => {
            onPress?.(event);
            if (!event.defaultPrevented && selectable)
                onSelectedChange?.(!active);
        }, role: selectionMode === "single" ? "radio" : selectionMode === "multiple" ? "checkbox" : undefined, type: "button", children: [active ? (_jsx("span", { "aria-hidden": "true", className: "hjm-chip__indicator", children: renderSelectionIndicator?.({
                    selected: true,
                    color: "currentColor",
                    size: iconRecipe.sizes[chipRecipe.selectionIndicator.glyph],
                }) ?? "✓" })) : null, leading === undefined ? null : _jsx("span", { "aria-hidden": "true", className: "hjm-chip__leading", children: leading }), _jsx("span", { className: "hjm-chip__label", children: label }), trailing === undefined ? null : _jsx("span", { "aria-hidden": "true", className: "hjm-chip__trailing", children: trailing })] }));
});
export const Checkbox = forwardRef(function Checkbox({ label, description, checked: checkedProp, defaultChecked = false, indeterminate = false, onCheckedChange, onChange, disabled, readOnly = false, presentation = selectionControlRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, renderLeading, className, onClick, ...props }, forwardedRef) {
    const [checked, setChecked] = useControllableState({
        ...(checkedProp === undefined ? {} : { value: checkedProp }),
        defaultValue: defaultChecked,
        ...(onCheckedChange === undefined ? {} : { onChange: onCheckedChange }),
    });
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current)
            inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const selected = checked || indeterminate;
    const leadingSize = iconRecipe.sizes[selectionControlRecipe.leading.size];
    return (_jsxs("label", { className: classNames("hjm-choice", className), "data-kind": "checkbox", "data-state": indeterminate ? "mixed" : checked ? "checked" : "unchecked", "data-disabled": disabled || undefined, "data-readonly": readOnly || undefined, "data-presentation": presentation, "data-size": size, children: [_jsx("input", { ...props, ref: composeRefs(inputRef, forwardedRef), className: "hjm-choice__input", type: "checkbox", checked: checked, disabled: disabled, "aria-readonly": readOnly || undefined, "aria-checked": indeterminate ? "mixed" : checked, onClick: (event) => {
                    onClick?.(event);
                    if (readOnly)
                        event.preventDefault();
                }, onChange: (event) => {
                    if (!readOnly)
                        setChecked(event.currentTarget.checked);
                    onChange?.(event);
                } }), _jsx("span", { className: "hjm-choice__indicator", "aria-hidden": "true" }), renderLeading ? (_jsx("span", { className: "hjm-choice__leading", "aria-hidden": "true", children: renderLeading({
                    selected,
                    color: "currentColor",
                    size: leadingSize,
                }) })) : null, _jsxs("span", { className: "hjm-choice__copy", children: [_jsx("span", { children: label }), description ? _jsx("span", { className: "hjm-choice__description", children: description }) : null] })] }));
});
/** Native radio item primitive. Use RadioGroup when the renderer owns group state. */
export const Radio = forwardRef(function Radio({ label, description, checked: checkedProp, defaultChecked = false, onCheckedChange, onChange, disabled, readOnly = false, presentation = selectionControlRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, renderLeading, className, onClick, ...props }, ref) {
    const [checked, setChecked] = useControllableState({
        ...(checkedProp === undefined ? {} : { value: checkedProp }),
        defaultValue: defaultChecked,
        ...(onCheckedChange === undefined
            ? {}
            : { onChange: (next) => next && onCheckedChange(true) }),
    });
    return (_jsxs("label", { className: classNames("hjm-choice", className), "data-kind": "radio", "data-state": checked ? "checked" : "unchecked", "data-disabled": disabled || undefined, "data-readonly": readOnly || undefined, "data-presentation": presentation, "data-size": size, children: [_jsx("input", { ...props, ref: ref, className: "hjm-choice__input", type: "radio", checked: checked, disabled: disabled, "aria-readonly": readOnly || undefined, onClick: (event) => {
                    onClick?.(event);
                    if (readOnly)
                        event.preventDefault();
                }, onChange: (event) => {
                    if (!readOnly && event.currentTarget.checked)
                        setChecked(true);
                    onChange?.(event);
                } }), _jsx("span", { className: "hjm-choice__indicator", "aria-hidden": "true" }), renderLeading ? (_jsx("span", { className: "hjm-choice__leading", "aria-hidden": "true", children: renderLeading({
                    selected: checked,
                    color: "currentColor",
                    size: iconRecipe.sizes[selectionControlRecipe.leading.size],
                }) })) : null, _jsxs("span", { className: "hjm-choice__copy", children: [_jsx("span", { children: label }), description ? _jsx("span", { className: "hjm-choice__description", children: description }) : null] })] }));
});
function CheckboxGroupInner({ items, label, accessibilityLabel, description, error, orientation = selectionGroupRecipe.defaults.orientation, presentation = selectionGroupRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, name, required = false, readOnly = false, renderLeading, value: valueProp, defaultValue, onValueChange, disabled, className, ...props }, ref) {
    const resolvedLabel = resolveControlAccessibleName(label, accessibilityLabel, "CheckboxGroup");
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue: defaultValue ?? new Set(),
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const controlled = valueProp !== undefined;
    if (controlled)
        validateCheckboxSelection(items, value);
    const reconciledValue = controlled
        ? value
        : reconcileCheckboxSelection(items, value);
    useEffect(() => {
        if (!controlled && reconciledValue !== value)
            setValue(reconciledValue);
    }, [controlled, reconciledValue, setValue, value]);
    const generatedId = useId().replaceAll(":", "");
    const descriptionId = `${generatedId}-checkbox-group-description`;
    const errorId = `${generatedId}-checkbox-group-error`;
    return (_jsxs("fieldset", { ...props, ref: ref, className: classNames("hjm-checkbox-group", className), "data-orientation": orientation, "data-presentation": presentation, "data-size": size, "data-state": error ? "invalid" : disabled ? "disabled" : "idle", disabled: disabled, "aria-label": accessibilityLabel, "aria-describedby": error ? errorId : description ? descriptionId : undefined, "aria-required": required || undefined, "aria-readonly": readOnly || undefined, children: [_jsx("legend", { className: label === undefined ? "hjm-visually-hidden" : undefined, children: label ?? resolvedLabel }), description && !error ? (_jsx("div", { id: descriptionId, className: "hjm-field__description", children: description })) : null, _jsx("div", { className: "hjm-checkbox-group__items", children: items.map((item) => {
                    const checked = reconciledValue.has(item.id);
                    return (_jsxs("label", { className: "hjm-choice", "data-kind": "checkbox", "data-state": checked ? "checked" : "unchecked", "data-disabled": item.disabled || undefined, "data-readonly": readOnly || undefined, "data-presentation": presentation, "data-size": size, children: [_jsx("input", { className: "hjm-choice__input", type: "checkbox", name: name, value: item.id, checked: checked, disabled: item.disabled, "aria-readonly": readOnly || undefined, onChange: () => {
                                    if (!readOnly) {
                                        setValue(toggleCheckboxSelection(items, reconciledValue, item.id));
                                    }
                                }, onClick: readOnly ? (event) => event.preventDefault() : undefined }), _jsx("span", { className: "hjm-choice__indicator", "aria-hidden": "true" }), renderLeading ? (_jsx("span", { className: "hjm-choice__leading", "aria-hidden": "true", children: renderLeading(item, {
                                    selected: checked,
                                    color: "currentColor",
                                    size: iconRecipe.sizes[selectionControlRecipe.leading.size],
                                }) })) : null, _jsxs("span", { className: "hjm-choice__copy", children: [_jsx("span", { children: item.label }), item.description ? (_jsx("span", { className: "hjm-choice__description", children: item.description })) : null] })] }, item.id));
                }) }), error ? _jsx("div", { id: errorId, className: "hjm-field__error", children: error }) : null] }));
}
export const CheckboxGroup = forwardRef(CheckboxGroupInner);
function validateItems(component, items) {
    if (items.length === 0) {
        throw new TypeError(`${component} requires at least one item`);
    }
    const values = new Set();
    for (const item of items) {
        if (item.value.trim().length === 0) {
            throw new TypeError(`${component} item value must not be empty`);
        }
        if (values.has(item.value)) {
            throw new TypeError(`Duplicate ${component} item value: ${item.value}`);
        }
        values.add(item.value);
    }
}
export const RadioGroup = forwardRef(function RadioGroup({ label, accessibilityLabel, items, value: valueProp, defaultValue = null, onValueChange, orientation = selectionGroupRecipe.defaults.orientation, presentation = selectionGroupRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, description, error, name, required = false, readOnly = false, renderLeading, disabled, className, ...props }, ref) {
    validateItems("RadioGroup", items);
    if (accessibilityLabel !== undefined &&
        accessibilityLabel.trim().length === 0)
        throw new TypeError("RadioGroup accessibilityLabel must not be empty");
    const resolvedLabel = label === undefined || label === null
        ? resolveControlAccessibleName(undefined, accessibilityLabel, "RadioGroup")
        : label;
    const descriptors = items.map((item) => ({
        id: item.value,
        label: typeof item.label === "string" ? item.label : item.value,
        ...(typeof item.description === "string"
            ? { description: item.description }
            : {}),
        ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
    }));
    const initialValueRef = useRef(null);
    if (initialValueRef.current === null) {
        initialValueRef.current = {
            value: resolveInitialRadioValue(descriptors, defaultValue, required),
        };
    }
    const generatedName = useId().replaceAll(":", "");
    const [storedValue, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue: initialValueRef.current.value,
        ...(onValueChange === undefined
            ? {}
            : {
                onChange: (next) => {
                    if (next !== null)
                        onValueChange(next);
                },
            }),
    });
    const controlled = valueProp !== undefined;
    if (controlled)
        validateRadioSelection(descriptors, storedValue);
    const value = controlled
        ? storedValue
        : reconcileRadioSelection(descriptors, storedValue, required);
    useEffect(() => {
        if (!controlled && value !== storedValue)
            setValue(value);
    }, [controlled, setValue, storedValue, value]);
    const descriptionId = `${generatedName}-radio-description`;
    const errorId = `${generatedName}-radio-error`;
    return (_jsxs("fieldset", { ...props, ref: ref, className: classNames("hjm-radio-group", className), "data-orientation": orientation, "data-presentation": presentation, "data-size": size, "data-state": error ? "invalid" : disabled ? "disabled" : "idle", disabled: disabled, "aria-label": accessibilityLabel, "aria-describedby": error ? errorId : description ? descriptionId : undefined, "aria-readonly": readOnly || undefined, children: [_jsx("legend", { className: label == null ? "hjm-visually-hidden" : undefined, children: resolvedLabel }), description && !error ? _jsx("div", { id: descriptionId, className: "hjm-field__description", children: description }) : null, _jsx("div", { className: "hjm-radio-group__items", children: items.map((item) => {
                    const selected = item.value === value;
                    return (_jsxs("label", { className: "hjm-choice", "data-kind": "radio", "data-state": selected ? "checked" : "unchecked", "data-disabled": item.disabled || undefined, "data-readonly": readOnly || undefined, "data-presentation": presentation, "data-size": size, children: [_jsx("input", { className: "hjm-choice__input", type: "radio", name: name ?? generatedName, value: item.value, checked: selected, disabled: item.disabled, required: required, "aria-readonly": readOnly || undefined, onClick: readOnly ? (event) => event.preventDefault() : undefined, onChange: () => {
                                    if (!readOnly)
                                        setValue(item.value);
                                } }), _jsx("span", { className: "hjm-choice__indicator", "aria-hidden": "true" }), renderLeading ? (_jsx("span", { className: "hjm-choice__leading", "aria-hidden": "true", children: renderLeading(item, {
                                    selected,
                                    color: "currentColor",
                                    size: iconRecipe.sizes[selectionControlRecipe.leading.size],
                                }) })) : null, _jsxs("span", { className: "hjm-choice__copy", children: [_jsx("span", { children: item.label }), item.description ? (_jsx("span", { className: "hjm-choice__description", children: item.description })) : null] })] }, item.value));
                }) }), error ? _jsx("div", { id: errorId, className: "hjm-field__error", children: error }) : null] }));
});
export const Switch = forwardRef(function Switch({ label, checked: checkedProp, defaultChecked = false, onCheckedChange, disabled, type = "button", className, onClick, ...props }, ref) {
    const [checked, setChecked] = useControllableState({
        ...(checkedProp === undefined ? {} : { value: checkedProp }),
        defaultValue: defaultChecked,
        ...(onCheckedChange === undefined ? {} : { onChange: onCheckedChange }),
    });
    return (_jsxs("button", { ...props, ref: ref, type: type, role: "switch", className: classNames("hjm-switch", className), "data-state": checked ? "checked" : "unchecked", "aria-checked": checked, disabled: disabled, onClick: (event) => {
            setChecked((current) => !current);
            onClick?.(event);
        }, children: [_jsx("span", { className: "hjm-switch__track", "aria-hidden": "true", children: _jsx("span", { className: "hjm-switch__thumb" }) }), _jsx("span", { children: label })] }));
});
export const SegmentedControl = forwardRef(function SegmentedControl({ label, items, value: valueProp, defaultValue, onValueChange, size = segmentedControlRecipe.defaults.size, name, className, ...props }, ref) {
    validateItems("SegmentedControl", items);
    const descriptors = items.map((item) => ({
        id: item.value,
        label: typeof item.label === "string" ? item.label : item.value,
        ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
    }));
    const initialValueRef = useRef(null);
    if (initialValueRef.current === null) {
        const initial = resolveInitialRadioValue(descriptors, defaultValue ?? null, true);
        if (initial === null) {
            throw new TypeError("SegmentedControl requires at least one enabled item");
        }
        initialValueRef.current = { value: initial };
    }
    const generatedName = useId();
    const [storedValue, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue: initialValueRef.current.value,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const controlled = valueProp !== undefined;
    if (controlled)
        validateRadioSelection(descriptors, storedValue);
    const value = controlled
        ? storedValue
        : reconcileRadioSelection(descriptors, storedValue, true);
    if (value === null) {
        throw new TypeError("SegmentedControl requires at least one enabled item");
    }
    useEffect(() => {
        if (!controlled && value !== storedValue)
            setValue(value);
    }, [controlled, setValue, storedValue, value]);
    return (_jsxs("fieldset", { ...props, ref: ref, className: classNames("hjm-segmented", className), "data-size": size, children: [_jsx("legend", { className: "hjm-visually-hidden", children: label }), _jsx("div", { className: "hjm-segmented__items", children: items.map((item) => (_jsxs("label", { className: "hjm-segmented__item", "data-state": item.value === value ? "checked" : "unchecked", "data-disabled": item.disabled || undefined, children: [_jsx("input", { type: "radio", name: name ?? generatedName, value: item.value, checked: item.value === value, disabled: item.disabled, required: true, onChange: () => setValue(item.value) }), _jsx("span", { children: item.label })] }, item.value))) })] }));
});
//# sourceMappingURL=selection.js.map