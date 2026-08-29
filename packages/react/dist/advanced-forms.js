import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { comboboxRecipe, selectRecipe, } from "@hjmds/design-contracts/recipes";
import { formRecipe, } from "@hjmds/design-contracts/components/form";
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, } from "react";
import { Field } from "./forms.js";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup } from "./portal.js";
function useControlId(id, prefix) {
    const generated = useId().replaceAll(":", "");
    return id ?? `hjm-${prefix}-${generated}`;
}
function validateOptions(options, component) {
    if (options.length === 0)
        throw new TypeError(`${component} requires at least one option`);
    const values = new Set();
    for (const option of options) {
        if (option.value.trim().length === 0) {
            throw new TypeError(`${component} option value must not be empty`);
        }
        if (option.label.trim().length === 0) {
            throw new TypeError(`${component} option label must not be empty`);
        }
        if (values.has(option.value)) {
            throw new TypeError(`Duplicate ${component} option value: ${option.value}`);
        }
        values.add(option.value);
    }
}
/** A native select keeps browser keyboard, form, autofill, and mobile picker behavior. */
export const NativeSelect = forwardRef(function NativeSelect({ id, label, description, error, options, placeholder, value: valueProp, defaultValue = "", onValueChange, size = selectRecipe.defaults.size, density = selectRecipe.defaults.density, fieldClassName, className, disabled = false, required = false, ...props }, ref) {
    validateOptions(options, "Select");
    const controlId = useControlId(id, "select");
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    if (value !== "" &&
        !options.some((option) => option.value === value && !option.disabled)) {
        throw new RangeError(`Select value must identify an enabled option: ${value}`);
    }
    return (_jsx(Field, { controlId: controlId, label: label, description: description, error: error, required: required, disabled: disabled, className: classNames("hjm-select", fieldClassName), "data-size": size, "data-density": density, children: (controlProps) => (_jsxs("div", { className: "hjm-field__control hjm-select__control", children: [_jsxs("select", { ...props, ...controlProps, ref: ref, value: value, className: classNames("hjm-field__input hjm-select__native", className), onChange: (event) => setValue(event.target.value), children: [placeholder !== undefined ? (_jsx("option", { value: "", disabled: required, children: placeholder })) : null, options.map((option) => (_jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value)))] }), _jsx("span", { className: "hjm-select__indicator", "aria-hidden": "true", children: "\u2304" })] })) }));
});
function nextEnabled(items, current, direction) {
    if (items.length === 0)
        return -1;
    for (let offset = 1; offset <= items.length; offset += 1) {
        const candidate = (current + direction * offset + items.length) % items.length;
        if (!items[candidate]?.disabled)
            return candidate;
    }
    return -1;
}
export const Combobox = forwardRef(function Combobox({ id, name, label, description, error, items, value: valueProp, defaultValue = "", onValueChange, inputValue: inputValueProp, defaultInputValue, onInputValueChange, open: openProp, defaultOpen = false, onOpenChange, emptyMessage, loading = false, loadingMessage, selectionRequiredMessage, openOnFocus = true, size = comboboxRecipe.defaults.size, density = comboboxRecipe.defaults.density, align = "start", fieldClassName, portalContainer, className, disabled = false, required = false, autoComplete = "off", onFocus, onBlur, onKeyDown, ...props }, forwardedRef) {
    validateOptions(items, "Combobox");
    const controlId = useControlId(id, "combobox");
    const listboxId = `${controlId}-listbox`;
    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const suppressFocusOpenRef = useRef(false);
    const listboxRef = useRef(null);
    const [listboxNode, setListboxNode] = useState(null);
    const popupPosition = useAnchoredPopup(inputRef, listboxNode, {
        align,
        matchAnchorWidth: true,
        zIndex: 800,
    });
    const setListboxRef = useCallback((node) => {
        listboxRef.current = node;
        setListboxNode(node);
    }, []);
    const [selectedValue, setSelectedValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const selectedItem = items.find((item) => item.value === selectedValue);
    if (selectedValue !== "" && (!selectedItem || selectedItem.disabled)) {
        throw new RangeError(`Combobox value must identify an enabled option: ${selectedValue}`);
    }
    if (required && selectionRequiredMessage.trim().length === 0) {
        throw new TypeError("Combobox selectionRequiredMessage must not be empty");
    }
    const [query, setQuery] = useControllableState({
        ...(inputValueProp === undefined ? {} : { value: inputValueProp }),
        defaultValue: defaultInputValue ?? selectedItem?.label ?? "",
        ...(onInputValueChange === undefined ? {} : { onChange: onInputValueChange }),
    });
    const [open, setOpenState] = useControllableState({
        ...(openProp === undefined ? {} : { value: openProp }),
        defaultValue: defaultOpen,
    });
    const [activeIndex, setActiveIndex] = useState(-1);
    useEffect(() => {
        inputRef.current?.setCustomValidity(required && selectedValue === "" ? selectionRequiredMessage : "");
    }, [required, selectedValue, selectionRequiredMessage]);
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredItems = useMemo(() => items.filter((item) => {
        if (normalizedQuery.length === 0)
            return true;
        const searchable = [item.label, ...(item.keywords ?? [])]
            .join(" ")
            .toLocaleLowerCase();
        return searchable.includes(normalizedQuery);
    }), [items, normalizedQuery]);
    const setOpen = (next, reason) => {
        if (next === open)
            return;
        setOpenState(next);
        onOpenChange?.(next, reason);
        if (!next)
            setActiveIndex(-1);
    };
    const firstEnabled = () => filteredItems.findIndex((item) => !item.disabled);
    const lastEnabled = () => {
        for (let index = filteredItems.length - 1; index >= 0; index -= 1) {
            if (!filteredItems[index]?.disabled)
                return index;
        }
        return -1;
    };
    const selectItem = (item) => {
        if (item.disabled)
            return;
        setSelectedValue(item.value);
        setQuery(item.label);
        setOpen(false, "selection");
        queueMicrotask(() => {
            const input = inputRef.current;
            if (!input || document.activeElement === input)
                return;
            suppressFocusOpenRef.current = true;
            input.focus();
            queueMicrotask(() => {
                suppressFocusOpenRef.current = false;
            });
        });
    };
    const handleKeyDown = (event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented)
            return;
        if (loading &&
            ["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) {
            event.preventDefault();
            return;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
                setOpen(true, "keyboard");
                setActiveIndex(event.key === "ArrowDown" ? firstEnabled() : lastEnabled());
                return;
            }
            setActiveIndex((current) => nextEnabled(filteredItems, current, event.key === "ArrowDown" ? 1 : -1));
        }
        else if (open && event.key === "Home") {
            event.preventDefault();
            setActiveIndex(firstEnabled());
        }
        else if (open && event.key === "End") {
            event.preventDefault();
            setActiveIndex(lastEnabled());
        }
        else if (open && event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            const item = filteredItems[activeIndex];
            if (item)
                selectItem(item);
        }
        else if (open && event.key === "Escape") {
            event.preventDefault();
            setOpen(false, "escape");
        }
        else if (open && event.key === "Tab") {
            setOpen(false, "blur");
        }
    };
    const activeItem = activeIndex >= 0 ? filteredItems[activeIndex] : undefined;
    return (_jsx(Field, { controlId: controlId, label: label, description: description, error: error, required: required, disabled: disabled, className: classNames("hjm-combobox", fieldClassName), "data-size": size, "data-density": density, "data-state": disabled ? "disabled" : open ? "open" : "closed", children: (controlProps) => (_jsxs("div", { ref: rootRef, className: "hjm-combobox__anchor", onBlur: (event) => {
                if (!event.currentTarget.contains(event.relatedTarget) &&
                    !listboxRef.current?.contains(event.relatedTarget))
                    setOpen(false, "blur");
            }, children: [_jsxs("div", { className: "hjm-field__control hjm-combobox__control", children: [_jsx("input", { ...props, ...controlProps, ref: composeRefs(forwardedRef, inputRef), className: classNames("hjm-field__input hjm-combobox__input", className), value: query, role: "combobox", autoComplete: autoComplete, "aria-autocomplete": "list", "aria-controls": listboxId, "aria-expanded": open, "aria-activedescendant": open && activeItem ? `${controlId}-option-${activeIndex}` : undefined, onFocus: (event) => {
                                onFocus?.(event);
                                if (!event.defaultPrevented &&
                                    openOnFocus &&
                                    !suppressFocusOpenRef.current)
                                    setOpen(true, "focus");
                            }, onBlur: onBlur, onChange: (event) => {
                                setQuery(event.target.value);
                                setSelectedValue("");
                                setOpen(true, "input");
                                setActiveIndex(-1);
                            }, onKeyDown: handleKeyDown }), loading ? _jsx("span", { className: "hjm-combobox__spinner", "aria-hidden": "true" }) : null, _jsx("span", { className: "hjm-select__indicator", "aria-hidden": "true", children: "\u2304" })] }), name ? _jsx("input", { type: "hidden", name: name, value: selectedValue }) : null, open ? (_jsx(AnchoredPortal, { anchorRef: inputRef, ssrFallback: "inline", ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { ref: setListboxRef, id: listboxId, role: "listbox", className: "hjm-combobox__listbox", "data-density": density, "aria-label": typeof label === "string" ? label : undefined, "aria-busy": loading || undefined, "data-placement": popupPosition.placement, "data-align": popupPosition.align, style: popupPosition.style, children: loading ? (_jsx("div", { className: "hjm-combobox__message", role: "status", children: loadingMessage })) : filteredItems.length === 0 ? (_jsx("div", { className: "hjm-combobox__message", children: emptyMessage })) : (filteredItems.map((item, index) => (_jsx("div", { id: `${controlId}-option-${index}`, role: "option", "aria-selected": item.value === selectedValue, "aria-disabled": item.disabled || undefined, className: "hjm-combobox__option", "data-state": item.disabled
                                ? "disabled"
                                : index === activeIndex
                                    ? "active"
                                    : item.value === selectedValue
                                        ? "selected"
                                        : "idle", onMouseDown: (event) => event.preventDefault(), onMouseMove: () => {
                                if (!item.disabled)
                                    setActiveIndex(index);
                            }, onClick: () => selectItem(item), children: item.label }, item.value)))) }) })) : null] })) }));
});
export const Form = forwardRef(function Form({ onSubmit, busy = false, formError, actions, density = formRecipe.defaults.density, className, children, ...props }, ref) {
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const effectiveBusy = busy || submitting;
    const handleSubmit = (event) => {
        event.preventDefault();
        if (effectiveBusy || submittingRef.current)
            return;
        let result;
        try {
            result = onSubmit(event);
        }
        catch (error) {
            throw error;
        }
        if (result && typeof result.then === "function") {
            submittingRef.current = true;
            setSubmitting(true);
            void Promise.resolve(result)
                .catch(() => undefined)
                .finally(() => {
                submittingRef.current = false;
                setSubmitting(false);
            });
        }
    };
    return (_jsx("form", { ...props, ref: ref, className: classNames("hjm-form", className), "data-density": density, "data-state": effectiveBusy ? "busy" : formError ? "error" : "idle", "aria-busy": effectiveBusy || undefined, onSubmit: handleSubmit, children: _jsxs("fieldset", { className: "hjm-form__fieldset", disabled: effectiveBusy, children: [_jsx("div", { className: "hjm-form__fields", children: children }), formError ? (_jsx("div", { className: "hjm-form__error", role: "alert", children: formError })) : null, actions ? _jsx("div", { className: "hjm-form__actions", children: actions }) : null] }) }));
});
//# sourceMappingURL=advanced-forms.js.map