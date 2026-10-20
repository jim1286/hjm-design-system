"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef } from "react";
import { chipRecipe } from "@hjmds/design-contracts/recipes";
import { shortcutRailRecipe, validateShortcutRail } from "@hjmds/design-contracts/shortcut-rail";
import { classNames } from "./internal.js";
export function ShortcutRail({ label, items, onAction, onRemove, removeLabel, removeIcon, isRemovable, leading, layout = shortcutRailRecipe.defaults.layout, size = chipRecipe.defaults.size, renderLeading, layoutStyle, className, style, ...props }) {
    validateShortcutRail(items, label, layout);
    const root = useRef(null), leadingRoot = useRef(null), buttons = useRef(new Map());
    const pending = useRef(null);
    const hasLeading = leading != null && leading !== false;
    const removable = (item) => !!onRemove && isRemovable?.(item) !== false;
    const identity = JSON.stringify(items.map(item => [item.id, removable(item)]));
    useLayoutEffect(() => {
        const request = pending.current;
        if (!request)
            return;
        const retained = items.find(item => item.id === request.removed);
        if (retained && removable(retained))
            return; // A refused clear must leave its focused remove button retryable.
        pending.current = null;
        // Clearing may keep the same stable item as a non-removable default (for example the current season).
        const next = retained && !retained.disabled ? retained : items.slice(request.index).find(item => !item.disabled) ?? [...items.slice(0, request.index)].reverse().find(item => !item.disabled);
        const control = leadingRoot.current?.querySelector('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]');
        (next ? buttons.current.get(next.id) : control ?? root.current)?.focus({ preventScroll: true });
    }, [identity]);
    return _jsxs("ul", { ...props, ref: root, "aria-label": label, tabIndex: -1, className: classNames("hjm-shortcut-rail", className), "data-layout": layout, "data-size": size, "data-empty": !items.length && !hasLeading || undefined, style: { ...style, ...layoutStyle, gap: shortcutRailRecipe.gap }, children: [hasLeading ? _jsx("li", { ref: leadingRoot, style: { display: "inline-flex", flex: "0 0 auto", alignItems: "center" }, onFocusCapture: event => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" }), children: leading }) : null, items.map((item, index) => _jsxs("li", { className: "hjm-shortcut-rail__item", "data-disabled": item.disabled || undefined, children: [_jsxs("button", { ref: node => { if (node)
                            buttons.current.set(item.id, node);
                        else
                            buttons.current.delete(item.id); }, type: "button", disabled: item.disabled, "aria-label": item.label, "aria-description": item.description, className: "hjm-shortcut-rail__action", onFocus: event => event.currentTarget.closest("li")?.scrollIntoView({ block: "nearest", inline: "nearest" }), onClick: () => onAction(item), children: [renderLeading ? _jsx("span", { "aria-hidden": "true", children: renderLeading(item) }) : null, _jsx("span", { children: item.label })] }), onRemove && removable(item) ? _jsx("button", { type: "button", disabled: item.disabled, "aria-label": removeLabel(item), className: "hjm-shortcut-rail__remove", onClick: event => {
                            // Reconcile only a focused removal after the product actually removes its stable ID.
                            if (event.currentTarget === document.activeElement)
                                pending.current = { removed: item.id, index };
                            onRemove(item);
                        }, children: _jsx("span", { "aria-hidden": "true", children: removeIcon ?? "×" }) }) : null] }, item.id))] });
}
//# sourceMappingURL=shortcut-rail.js.map