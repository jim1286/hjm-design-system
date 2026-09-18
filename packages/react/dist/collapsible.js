import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { collapsibleRecipe, validateCollapsibleOpenState, } from "@hjmds/design-contracts/components/collapsible";
import { forwardRef, useId, useState } from "react";
import { classNames } from "./internal.js";
export const Collapsible = forwardRef(function Collapsible({ trigger, children, disabled = false, className, ...openState }, forwardedRef) {
    validateCollapsibleOpenState(openState);
    const controlled = openState.open !== undefined;
    const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
    const open = openState.open ?? internalOpen;
    const id = `${useId().replaceAll(":", "")}-collapsible`;
    return (_jsxs("div", { ref: forwardedRef, className: classNames("hjm-collapsible", className), "data-state": open ? "open" : "closed", style: { "--hjm-collapsible-gap": `${collapsibleRecipe.gap}px` }, children: [_jsxs("button", { type: "button", className: "hjm-collapsible__trigger", "aria-expanded": open, "aria-controls": `${id}-content`, disabled: disabled, onClick: () => {
                    const next = !open;
                    if (!controlled)
                        setInternalOpen(next);
                    openState.onOpenChange?.(next);
                }, children: [trigger, _jsx("span", { "aria-hidden": "true", className: "hjm-collapsible__marker", children: open ? "▾" : "▸" })] }), open ? (_jsx("div", { id: `${id}-content`, role: "region", className: "hjm-collapsible__content", children: children })) : null] }));
});
//# sourceMappingURL=collapsible.js.map