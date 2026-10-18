import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isPaginationOpenEndedDescriptor, resolvePaginationDescriptor, resolvePaginationOpenEndedDescriptor, } from "@hjmds/design-contracts/components/pagination";
import { forwardRef, useLayoutEffect, useRef } from "react";
import { classNames } from "./internal.js";
export const Pagination = forwardRef(function Pagination({ label, descriptor, labels, composeAccessibleName, composeCurrentPageLabel, onPageChange, className, layoutStyle, onFocusCapture, onBlurCapture, ...props }, ref) {
    if (label.trim().length === 0)
        throw new TypeError("Pagination label must not be empty");
    // The resolvers validate that the matching composer is a function, so a mismatched pair fails loudly.
    const openEnded = isPaginationOpenEndedDescriptor(descriptor)
        ? resolvePaginationOpenEndedDescriptor(descriptor, {
            labels,
            composeCurrentPageLabel: composeCurrentPageLabel,
        })
        : null;
    const resolved = openEnded ?? resolvePaginationDescriptor(descriptor, {
        labels,
        composeAccessibleName: composeAccessibleName,
    });
    const focusedButton = useRef(null);
    const currentButton = useRef(null);
    useLayoutEffect(() => {
        // A smaller result set or moved page window can remove the focused numbered button.
        if (focusedButton.current && !focusedButton.current.isConnected && document.activeElement === document.body) {
            currentButton.current?.focus();
        }
    });
    // Preserve focus when a page change reaches a boundary; aria-disabled buttons
    // remain reachable but their activation is guarded below.
    return (_jsx("nav", { ...props, style: { ...props.style, ...layoutStyle }, ref: ref, className: classNames("hjm-pagination", className), "aria-label": label, onFocusCapture: (event) => { focusedButton.current = event.target; onFocusCapture?.(event); }, onBlurCapture: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
                focusedButton.current = null;
            onBlurCapture?.(event);
        }, children: _jsxs("ul", { className: "hjm-pagination__list", children: [_jsx("li", { children: _jsx("button", { type: "button", className: "hjm-pagination__item hjm-pagination__previous", "aria-label": resolved.labels.previous, "aria-disabled": !resolved.hasPrevious || undefined, onClick: () => { if (resolved.hasPrevious)
                            onPageChange(resolved.currentPage - 1, "previous"); }, children: _jsx("span", { "aria-hidden": "true", children: "\u2039" }) }) }), openEnded ? (_jsx("li", { children: _jsx("span", { className: "hjm-pagination__page-label", "aria-current": "page", children: openEnded.currentPageLabel }) })) : null, "items" in resolved && resolved.items.map((item, index) => item.type === "ellipsis" ? (_jsx("li", { children: _jsx("span", { className: "hjm-pagination__ellipsis", "aria-hidden": "true", children: "\u2026" }) }, `ellipsis-${index}`)) : (_jsx("li", { children: _jsx("button", { type: "button", className: "hjm-pagination__item", ref: item.current ? currentButton : undefined, "data-state": item.current ? "current" : "idle", "aria-current": item.current ? "page" : undefined, "aria-label": item.accessibleName, onClick: () => {
                            if (!item.current)
                                onPageChange(item.page, "page");
                        }, children: item.page }) }, item.page))), _jsx("li", { children: _jsx("button", { type: "button", className: "hjm-pagination__item hjm-pagination__next", "aria-label": resolved.labels.next, "aria-disabled": !resolved.hasNext || undefined, onClick: () => { if (resolved.hasNext)
                            onPageChange(resolved.currentPage + 1, "next"); }, children: _jsx("span", { "aria-hidden": "true", children: "\u203A" }) }) })] }) }));
});
//# sourceMappingURL=pagination.js.map