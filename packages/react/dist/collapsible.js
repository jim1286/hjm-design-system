import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { collapsibleRecipe, validateCollapsibleOpenState, } from "@hjmds/design-contracts/components/collapsible";
import { forwardRef, useId, useLayoutEffect, useRef, useState } from "react";
import { assignRef, classNames } from "./internal.js";
import { Icon } from "./supplemental-display.js";
export const Collapsible = forwardRef(function Collapsible({ trigger, children, disabled = false, presentation = "disclosure", keepMounted = false, marker = "end", className, layoutStyle, ...openState }, forwardedRef) {
    validateCollapsibleOpenState(openState);
    const controlled = openState.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
    const open = presentation === "inline" || (openState.open ?? internalOpen);
    const host = useRef(null);
    const button = useRef(null);
    const content = useRef(null);
    const focusedContent = useRef(false);
    const wasOpen = useRef(open);
    useLayoutEffect(() => {
        // A controlled close can remove or hide the currently focused input without
        // activating the trigger. Recover only that focus, never an outside control.
        const active = host.current?.ownerDocument.activeElement;
        if (wasOpen.current && !open && focusedContent.current &&
            (content.current?.contains(active ?? null) || active === host.current?.ownerDocument.body)) {
            (disabled ? host.current : button.current)?.focus();
        }
        if (!open)
            focusedContent.current = false;
        wasOpen.current = open;
    }, [open, disabled]);
    const id = `${useId().replaceAll(":", "")}-collapsible`;
    return (_jsxs("div", { ref: node => { host.current = node; assignRef(forwardedRef, node); }, tabIndex: -1, className: classNames("hjm-collapsible", className), "data-state": open ? "open" : "closed", style: { ...layoutStyle, "--hjm-collapsible-gap": `${collapsibleRecipe.gap}px` }, children: [_jsxs("button", { ref: button, hidden: presentation === "inline", type: "button", className: "hjm-collapsible__trigger", "aria-expanded": open, "aria-controls": `${id}-content`, disabled: disabled, onClick: event => {
                    if (disabled || presentation === "inline")
                        return;
                    // Safari does not focus buttons on pointer activation; keep the closing
                    // disclosure as the keyboard origin before its focused content disappears.
                    if (open)
                        event.currentTarget.focus();
                    const next = !open;
                    if (!controlled)
                        setInternalOpen(next);
                    openState.onOpenChange?.(next);
                }, children: [trigger, marker === "end" ? _jsx(CollapsibleMarker, { open: open }) : null] }), open || keepMounted ? (_jsx("div", { ref: content, onFocusCapture: () => { focusedContent.current = true; }, onBlurCapture: event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget))
                    focusedContent.current = false; }, hidden: !open, id: `${id}-content`, role: "region", className: "hjm-collapsible__content", children: children })) : null] }));
});
/** The decorative open/closed mark; the expanded state itself travels through the trigger's aria-expanded. */
export function CollapsibleMarker({ open }) {
    // The shared chevron at glyph.sm: the text "▸" rendered about 8px and read as static text (2026-10-17 review).
    // `chevronEnd` is a logical icon, so Icon mirrors it in RTL.
    return _jsx("span", { "aria-hidden": "true", className: "hjm-collapsible__marker", "data-state": open ? "open" : "closed", children: _jsx(Icon, { name: open ? "chevronDown" : "chevronEnd", size: "sm", tone: "secondary", decorative: true }) });
}
//# sourceMappingURL=collapsible.js.map