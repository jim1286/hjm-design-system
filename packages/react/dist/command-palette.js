import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { canDismissCommandPalette, commandPaletteBehaviorDefaults, commandPaletteRecipe, validateCommandPaletteDescriptor, } from "@hjmds/design-contracts/components/command-palette";
import { flattenCollectionItems, getCollectionNavigationIntent, getCollectionNavigationTarget, } from "@hjmds/design-contracts/components/collection";
import { forwardRef, useEffect, useId, useMemo, useRef, useState, } from "react";
import { classNames, composeRefs } from "./internal.js";
import { getModalLayer, HjmPortal, renderTrigger, useModalFocus } from "./modal.js";
export const CommandPalette = forwardRef(function CommandPalette({ descriptor, source, query, onQueryChange, onActivate, onActivateAfterDismiss, queryState, dismissPolicy, open: openProp, defaultOpen, onOpenChange, trigger, renderLeading, portalContainer, className, }, forwardedRef) {
    validateCommandPaletteDescriptor(descriptor);
    const policy = { ...commandPaletteBehaviorDefaults, ...dismissPolicy };
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const open = openProp ?? internalOpen;
    const items = useMemo(() => flattenCollectionItems(source), [source]);
    const enabled = items.filter((item) => !item.disabled);
    // The query state is Combobox's, so the message to show is its async slice —
    // the palette adds no second loading vocabulary of its own.
    const asyncState = queryState?.asyncState ?? { status: "idle" };
    const [activeId, setActiveId] = useState(null);
    const contentRef = useRef(null);
    const triggerRef = useRef(null);
    const inputRef = useRef(null);
    const id = `${useId().replaceAll(":", "")}-command-palette`;
    const active = enabled.find((item) => item.id === activeId) ?? enabled[0] ?? null;
    useEffect(() => {
        // A new query builds a new result list; the first enabled row becomes active
        // so Enter always has an unambiguous target.
        setActiveId(null);
    }, [query, source]);
    const change = (next, reason) => {
        if (openProp === undefined)
            setInternalOpen(next);
        onOpenChange?.(next, { reason });
    };
    const requestClose = (reason) => {
        if (!canDismissCommandPalette(reason, policy))
            return;
        change(false, reason);
    };
    const activate = (itemId, reason) => {
        onActivate(itemId, reason);
        // Running a command always closes the palette — `activation` is a dismiss
        // reason no policy can veto — and the follow-up surface opens after that.
        change(false, "activation");
        if (onActivateAfterDismiss)
            queueMicrotask(() => onActivateAfterDismiss(itemId, reason));
    };
    useModalFocus({
        active: open,
        contentRef,
        initialFocusRef: inputRef,
        ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
        onEscape: () => requestClose("escape"),
    });
    const onKeyDown = (event) => {
        const intent = getCollectionNavigationIntent(event.key);
        if (intent) {
            const target = getCollectionNavigationTarget({ items: enabled }, active?.id ?? null, intent, true);
            if (target === undefined)
                return;
            event.preventDefault();
            setActiveId(target);
            return;
        }
        if (event.key === "Enter" && active) {
            event.preventDefault();
            activate(active.id, "keyboard");
        }
    };
    const renderedTrigger = trigger === undefined
        ? null
        : renderTrigger(trigger, triggerRef, open, id, "dialog", () => change(true, "trigger"));
    if (!open)
        return renderedTrigger;
    const rows = (source.sections ?? [{ id: "__all", label: undefined, items: source.items ?? [] }]);
    return (_jsxs(_Fragment, { children: [renderedTrigger, _jsx(HjmPortal, { ...(portalContainer === undefined ? {} : { container: portalContainer }), children: _jsx("div", { className: "hjm-overlay hjm-command-palette-positioner", "data-kind": "command-palette", style: { zIndex: getModalLayer(0) }, onMouseDown: (event) => { if (event.target === event.currentTarget)
                        requestClose("outside"); }, children: _jsxs("div", { ref: composeRefs(contentRef, forwardedRef), id: id, role: "dialog", "aria-modal": "true", "aria-label": descriptor.accessibilityLabel, "data-hjm-modal-content": "", className: classNames("hjm-command-palette", className), style: { maxInlineSize: commandPaletteRecipe.content.maxWidth, maxBlockSize: commandPaletteRecipe.content.maxHeight }, children: [_jsx("input", { ref: inputRef, type: "text", role: "combobox", "aria-expanded": true, "aria-controls": `${id}-results`, "aria-activedescendant": active ? `${id}-${active.id}` : undefined, "aria-label": descriptor.accessibilityLabel, placeholder: descriptor.searchPlaceholder, className: "hjm-command-palette__search", value: query, onChange: (event) => onQueryChange(event.target.value), onKeyDown: onKeyDown }), _jsxs("div", { id: `${id}-results`, role: "listbox", "aria-label": descriptor.accessibilityLabel, className: "hjm-command-palette__viewport", children: [asyncState.status === "idle" ? null : (_jsx("p", { className: "hjm-command-palette__state", role: asyncState.status === "error" ? "alert" : "status", children: asyncState.message })), rows.map((section) => (_jsxs("div", { className: "hjm-command-palette__section", role: "group", "aria-label": section.label, children: [section.label ? _jsx("p", { className: "hjm-command-palette__section-label", children: section.label }) : null, section.items.map((item) => (_jsxs("div", { id: `${id}-${item.id}`, role: "option", "aria-selected": item.id === active?.id, "aria-disabled": item.disabled || undefined, className: "hjm-command-palette__item", "data-tone": item.tone, onMouseDown: (event) => {
                                                    event.preventDefault();
                                                    if (!item.disabled)
                                                        activate(item.id, "pointer");
                                                }, onMouseEnter: () => { if (!item.disabled)
                                                    setActiveId(item.id); }, children: [renderLeading?.(item.id), _jsxs("span", { className: "hjm-command-palette__copy", children: [_jsx("span", { children: item.label }), item.description ? _jsx("span", { className: "hjm-command-palette__description", children: item.description }) : null] }), item.shortcut ? _jsx("kbd", { className: "hjm-command-palette__shortcut", children: item.shortcut }) : null] }, item.id)))] }, section.id)))] })] }) }) })] }));
});
//# sourceMappingURL=command-palette.js.map