import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getCollectionNavigationIntent, getCollectionNavigationTarget, getCollectionTypeaheadMatch, reconcileSelectSelection, resolveCollectionItem, resolveSelectSelectedItem, validateCollection, } from "@hjmds/design-contracts/components/collection";
import { resolveControlAccessibleName, selectBehaviorDefaults, } from "@hjmds/design-contracts/behaviors";
import { iconRecipe, selectRecipe, } from "@hjmds/design-contracts/recipes";
import { forwardRef, useCallback, useEffect, useId, useRef, useState, } from "react";
import { classNames, useControllableState } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup, } from "./portal.js";
const emptySelectionKey = Symbol("hjm-select-empty-selection");
function SelectInner(props, forwardedRef) {
    const { items, sections, label, accessibilityLabel, description, error, placeholder, emptySelectionLabel, asyncState = { status: "idle" }, selectedItem, disallowEmptySelection = selectBehaviorDefaults.disallowEmptySelection, loop = selectBehaviorDefaults.loop, busy = false, readOnly = false, size = selectRecipe.defaults.size, density = selectRecipe.defaults.density, align = "start", fieldClassName, portalContainer, locale, renderLeading, renderOptionLeading, className, id: idProp, name, disabled = false, required = false, selectedKey: selectedKeyProp, defaultSelectedKey, onSelectionChange, open: openProp, defaultOpen = false, onOpenChange, onClick, onFocus, onBlur, onKeyDown, ...buttonProps } = props;
    const source = sections === undefined
        ? { items: items ?? [] }
        : { sections };
    validateCollection(source);
    const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Select");
    if (placeholder.trim().length === 0)
        throw new TypeError("Select placeholder must not be empty");
    if (emptySelectionLabel.trim().length === 0) {
        throw new TypeError("Select emptySelectionLabel must not be empty");
    }
    const flatItems = source.sections
        ? source.sections.flatMap((section) => section.items)
        : source.items;
    if (flatItems.length === 0 &&
        (asyncState.status === "idle" || asyncState.status === "loadingMore")) {
        throw new TypeError("Select requires options unless its async state is transient or empty");
    }
    const initialSelectionRef = useRef(null);
    if (initialSelectionRef.current === null) {
        initialSelectionRef.current = {
            value: reconcileSelectSelection(source, selectedKeyProp ?? defaultSelectedKey ?? null, {
                disallowEmptySelection,
                asyncState,
                ...(selectedItem === undefined ? {} : { selectedItem }),
            }),
        };
    }
    const [storedSelectedKey, setSelectedKey] = useControllableState({
        ...(selectedKeyProp === undefined ? {} : { value: selectedKeyProp }),
        defaultValue: initialSelectionRef.current.value,
        ...(onSelectionChange === undefined ? {} : { onChange: onSelectionChange }),
    });
    const reconciledSelectedKey = reconcileSelectSelection(source, storedSelectedKey, {
        disallowEmptySelection,
        asyncState,
        ...(selectedItem === undefined ? {} : { selectedItem }),
    });
    const reconciliationRequestRef = useRef(undefined);
    useEffect(() => {
        if (storedSelectedKey === reconciledSelectedKey) {
            reconciliationRequestRef.current = undefined;
            return;
        }
        const token = `${storedSelectedKey ?? "<empty>"}->${reconciledSelectedKey ?? "<empty>"}`;
        if (reconciliationRequestRef.current === token)
            return;
        reconciliationRequestRef.current = token;
        setSelectedKey(reconciledSelectedKey);
    }, [reconciledSelectedKey, setSelectedKey, storedSelectedKey]);
    const resolvedSelectedItem = resolveSelectSelectedItem(source, reconciledSelectedKey, selectedItem !== undefined && selectedItem.id === reconciledSelectedKey
        ? selectedItem
        : undefined);
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const openControlled = openProp !== undefined;
    const open = openControlled ? openProp : internalOpen;
    const pendingOpenRequestRef = useRef(undefined);
    useEffect(() => {
        if (pendingOpenRequestRef.current === open)
            pendingOpenRequestRef.current = undefined;
    }, [open]);
    const changeOpen = useCallback((nextOpen, reason) => {
        if (nextOpen === open || pendingOpenRequestRef.current === nextOpen)
            return;
        pendingOpenRequestRef.current = nextOpen;
        if (!openControlled)
            setInternalOpen(nextOpen);
        onOpenChange?.(nextOpen, reason);
        if (openControlled && nextOpen) {
            queueMicrotask(() => {
                if (pendingOpenRequestRef.current === true) {
                    pendingOpenRequestRef.current = undefined;
                }
            });
        }
    }, [onOpenChange, open, openControlled]);
    const generatedId = useId().replaceAll(":", "");
    const controlId = idProp ?? `hjm-select-${generatedId}`;
    const listboxId = `${controlId}-listbox`;
    const descriptionId = `${controlId}-description`;
    const errorId = `${controlId}-error`;
    const optionId = (key) => `${controlId}-option-${flatItems.findIndex((item) => item.id === key)}`;
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const listboxRef = useRef(null);
    const [listboxNode, setListboxNode] = useState(null);
    const optionRefs = useRef(new Map());
    const typeaheadRef = useRef({ value: "", time: 0 });
    const restoreFocusRef = useRef(false);
    const showOptions = asyncState.status === "idle" || asyncState.status === "loadingMore";
    const emptySelectionAvailable = !disallowEmptySelection && showOptions;
    const selectionItemInSource = resolveCollectionItem(source, reconciledSelectedKey);
    const initialHighlight = selectionItemInSource && !selectionItemInSource.disabled
        ? selectionItemInSource.id
        : reconciledSelectedKey === null && emptySelectionAvailable
            ? emptySelectionKey
            : getCollectionNavigationTarget(source, null, "first", loop) ?? null;
    const [highlightedKey, setHighlightedKey] = useState(initialHighlight);
    const highlightedItem = showOptions && highlightedKey !== emptySelectionKey
        ? resolveCollectionItem(source, highlightedKey)
        : null;
    const activeKey = highlightedItem && !highlightedItem.disabled
        ? highlightedItem.id
        : highlightedKey === emptySelectionKey && emptySelectionAvailable
            ? emptySelectionKey
            : null;
    const activeOptionId = activeKey === emptySelectionKey
        ? `${controlId}-option-empty`
        : activeKey === null
            ? undefined
            : optionId(activeKey);
    const popupPosition = useAnchoredPopup(triggerRef, listboxNode, {
        align,
        matchAnchorWidth: true,
        zIndex: 800,
    });
    const setListboxRef = useCallback((node) => {
        listboxRef.current = node;
        setListboxNode(node);
    }, []);
    useEffect(() => {
        if (!open) {
            if (restoreFocusRef.current) {
                restoreFocusRef.current = false;
                queueMicrotask(() => triggerRef.current?.focus());
            }
            return;
        }
        if (activeKey === null && showOptions)
            setHighlightedKey(initialHighlight);
    }, [activeKey, initialHighlight, open, showOptions]);
    useEffect(() => {
        if (open && activeKey !== null) {
            optionRefs.current.get(activeKey)?.scrollIntoView({ block: "nearest" });
        }
    }, [activeKey, open]);
    useEffect(() => {
        if (!open)
            return;
        const handlePointerDown = (event) => {
            if (event.target instanceof Node &&
                !rootRef.current?.contains(event.target) &&
                !listboxRef.current?.contains(event.target)) {
                changeOpen(false, "outside");
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [changeOpen, open]);
    const openWithIntent = (intent = "first") => {
        if (disabled || busy || readOnly)
            return;
        const selectedInSource = resolveCollectionItem(source, reconciledSelectedKey);
        const target = selectedInSource && !selectedInSource.disabled
            ? selectedInSource.id
            : reconciledSelectedKey === null && emptySelectionAvailable
                ? emptySelectionKey
                : intent === "last" && emptySelectionAvailable
                    ? emptySelectionKey
                    : getCollectionNavigationTarget(source, null, intent, loop) ?? null;
        setHighlightedKey(target);
        changeOpen(true, "keyboard");
    };
    const moveHighlight = (intent) => {
        const enabledKeys = flatItems
            .filter((item) => !item.disabled)
            .map((item) => item.id);
        const firstKey = enabledKeys[0];
        const lastKey = enabledKeys.at(-1);
        if (emptySelectionAvailable) {
            if (intent === "last") {
                setHighlightedKey(emptySelectionKey);
                return;
            }
            if (activeKey === emptySelectionKey) {
                if (intent === "previous" && lastKey !== undefined)
                    setHighlightedKey(lastKey);
                else if (((intent === "next" && loop) || intent === "first") &&
                    firstKey !== undefined) {
                    setHighlightedKey(firstKey);
                }
                return;
            }
            if (intent === "next" && activeKey === lastKey) {
                setHighlightedKey(emptySelectionKey);
                return;
            }
            if (intent === "previous" && activeKey === firstKey && loop) {
                setHighlightedKey(emptySelectionKey);
                return;
            }
        }
        const target = getCollectionNavigationTarget(source, activeKey === emptySelectionKey ? null : activeKey, intent, loop);
        if (target !== undefined)
            setHighlightedKey(target);
    };
    const commit = (key) => {
        if (key === emptySelectionKey) {
            if (disabled || readOnly || !emptySelectionAvailable)
                return;
            setSelectedKey(null);
            restoreFocusRef.current = true;
            changeOpen(false, "selection");
            return;
        }
        const item = resolveCollectionItem(source, key);
        if (!item ||
            item.disabled ||
            disabled ||
            busy ||
            readOnly ||
            asyncState.status === "loading")
            return;
        setSelectedKey(key);
        restoreFocusRef.current = true;
        changeOpen(false, "selection");
    };
    const runTypeahead = (key) => {
        const now = Date.now();
        const previous = now - typeaheadRef.current.time < 500
            ? typeaheadRef.current.value
            : "";
        const combined = `${previous}${key}`;
        const query = new Set(combined.toLocaleLowerCase()).size === 1 ? key : combined;
        typeaheadRef.current = { value: combined, time: now };
        const match = getCollectionTypeaheadMatch(source, query, {
            startsAfterKey: activeKey === emptySelectionKey
                ? reconciledSelectedKey
                : activeKey ?? reconciledSelectedKey,
            ...(locale === undefined ? {} : { locale }),
        });
        if (match !== undefined) {
            setHighlightedKey(match);
            if (!open)
                changeOpen(true, "keyboard");
        }
    };
    const handleKeyDown = (event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled || busy || readOnly)
            return;
        const navigationIntent = getCollectionNavigationIntent(event.key);
        if (navigationIntent !== undefined) {
            event.preventDefault();
            if (!open) {
                openWithIntent(navigationIntent === "previous" || navigationIntent === "last"
                    ? "last"
                    : "first");
            }
            else
                moveHighlight(navigationIntent);
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open)
                openWithIntent();
            else if (activeKey !== null)
                commit(activeKey);
        }
        else if (event.key === "Escape" && open) {
            event.preventDefault();
            restoreFocusRef.current = true;
            changeOpen(false, "escape");
        }
        else if (event.key === "Tab" && open) {
            changeOpen(false, "blur");
        }
        else if (event.key.length === 1 &&
            event.key !== " " &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey) {
            event.preventDefault();
            runTypeahead(event.key);
        }
    };
    const handleBlur = (event) => {
        onBlur?.(event);
        if (event.defaultPrevented)
            return;
        queueMicrotask(() => {
            if (open &&
                document.activeElement instanceof Node &&
                !rootRef.current?.contains(document.activeElement) &&
                !listboxRef.current?.contains(document.activeElement))
                changeOpen(false, "blur");
        });
    };
    const describedBy = error ? errorId : description ? descriptionId : undefined;
    const renderOption = (item) => {
        const selected = item.id === reconciledSelectedKey;
        const active = item.id === activeKey;
        const leadingSize = iconRecipe.sizes[selectRecipe.optionLeading.glyph];
        const leading = renderOptionLeading?.(item, {
            selected,
            highlighted: active,
            disabled: item.disabled ?? false,
            color: "currentColor",
            size: leadingSize,
            glyphSize: leadingSize,
        });
        return (_jsxs("div", { ref: (node) => {
                if (node)
                    optionRefs.current.set(item.id, node);
                else
                    optionRefs.current.delete(item.id);
            }, id: optionId(item.id), role: "option", className: "hjm-select__option", "aria-selected": selected, "aria-disabled": item.disabled || undefined, "data-state": item.disabled ? "disabled" : selected ? "selected" : "idle", "data-active": active || undefined, onMouseDown: (event) => event.preventDefault(), onMouseMove: () => {
                if (!item.disabled)
                    setHighlightedKey(item.id);
            }, onClick: () => commit(item.id), children: [leading ? (_jsx("span", { className: "hjm-select__option-leading", "aria-hidden": "true", children: leading })) : null, _jsxs("span", { className: "hjm-select__option-copy", children: [_jsx("span", { children: item.label }), item.description ? (_jsx("span", { className: "hjm-select__option-description", children: item.description })) : null] }), selected ? _jsx("span", { className: "hjm-select__check", "aria-hidden": "true", children: "\u2713" }) : null] }, item.id));
    };
    const triggerLeadingSize = iconRecipe.sizes[selectRecipe.sizes[size].glyph];
    const triggerLeading = renderLeading?.(resolvedSelectedItem, {
        color: "currentColor",
        size: triggerLeadingSize,
        glyphSize: triggerLeadingSize,
    });
    return (_jsxs("div", { ref: rootRef, className: classNames("hjm-field hjm-select", fieldClassName), "data-state": disabled ? "disabled" : error ? "invalid" : open ? "focused" : "idle", "data-size": size, "data-density": density, "data-async-state": asyncState.status, "data-busy": busy || undefined, children: [label !== undefined ? (_jsxs("label", { className: "hjm-field__label", htmlFor: controlId, children: [label, required ? _jsx("span", { "aria-hidden": "true", children: " *" }) : null] })) : null, _jsxs("div", { className: "hjm-select__anchor", children: [_jsxs("button", { ...buttonProps, ref: (node) => {
                            triggerRef.current = node;
                            if (typeof forwardedRef === "function")
                                forwardedRef(node);
                            else if (forwardedRef)
                                forwardedRef.current = node;
                        }, id: controlId, type: "button", role: "combobox", className: classNames("hjm-field__control hjm-select__trigger", className), disabled: disabled, "aria-disabled": busy || undefined, "aria-label": accessibilityLabel ?? (label === undefined ? accessibleName : undefined), "aria-haspopup": "listbox", "aria-expanded": open, "aria-controls": open ? listboxId : undefined, "aria-activedescendant": open ? activeOptionId : undefined, "aria-busy": busy || asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, "aria-readonly": readOnly || undefined, "aria-required": required || undefined, onFocus: onFocus, onBlur: handleBlur, onKeyDown: handleKeyDown, onClick: (event) => {
                            onClick?.(event);
                            if (event.defaultPrevented || disabled || busy || readOnly)
                                return;
                            if (open)
                                changeOpen(false, "trigger");
                            else
                                openWithIntent();
                        }, children: [triggerLeading ? (_jsx("span", { className: "hjm-select__leading", "aria-hidden": "true", children: triggerLeading })) : null, _jsx("span", { className: "hjm-select__value", "data-state": resolvedSelectedItem ? "selected" : "placeholder", children: resolvedSelectedItem?.label ?? placeholder }), busy ? (_jsx("span", { className: "hjm-select__busy-indicator", "aria-hidden": "true" })) : (_jsx("span", { className: "hjm-select__indicator", "aria-hidden": "true", children: "\u2304" }))] }), open ? (_jsx(AnchoredPortal, { anchorRef: triggerRef, ssrFallback: "inline", ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsxs("div", { ref: setListboxRef, id: listboxId, role: "listbox", "aria-label": accessibleName, className: "hjm-select__listbox", "data-density": density, "data-placement": popupPosition.placement, "data-align": popupPosition.align, style: popupPosition.style, children: [asyncState.status !== "idle" ? (_jsx("div", { className: "hjm-select__message", role: asyncState.status === "error" ? "alert" : "status", children: asyncState.message })) : null, showOptions ? (source.sections ? source.sections.map((section) => {
                                    const sectionLabelId = `${controlId}-section-${section.id}`;
                                    return (_jsxs("div", { role: "group", "aria-labelledby": section.label ? sectionLabelId : undefined, "aria-label": section.label ? undefined : section.accessibilityLabel, className: "hjm-select__section", children: [section.label ? (_jsx("div", { id: sectionLabelId, className: "hjm-select__section-label", children: section.label })) : null, section.items.map(renderOption)] }, section.id));
                                }) : source.items.map(renderOption)) : null, !disallowEmptySelection && showOptions ? (_jsx("div", { ref: (node) => {
                                        if (node)
                                            optionRefs.current.set(emptySelectionKey, node);
                                        else
                                            optionRefs.current.delete(emptySelectionKey);
                                    }, id: `${controlId}-option-empty`, role: "option", className: "hjm-select__option hjm-select__option--empty", "aria-selected": reconciledSelectedKey === null, "data-state": reconciledSelectedKey === null ? "selected" : "idle", "data-active": activeKey === emptySelectionKey || undefined, onMouseDown: (event) => event.preventDefault(), onMouseMove: () => setHighlightedKey(emptySelectionKey), onClick: () => commit(emptySelectionKey), children: emptySelectionLabel })) : null] }) })) : null] }), description && !error ? (_jsx("div", { id: descriptionId, className: "hjm-field__description", children: description })) : null, error ? _jsx("div", { id: errorId, className: "hjm-field__error", children: error }) : null, name ? _jsx("input", { type: "hidden", name: name, value: reconciledSelectedKey ?? "" }) : null] }));
}
export const Select = forwardRef(SelectInner);
//# sourceMappingURL=select.js.map