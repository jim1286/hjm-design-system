import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveBreadcrumbDescriptor, } from "@hjm/design-contracts/components/breadcrumb";
import { resolvePaginationDescriptor, } from "@hjm/design-contracts/components/pagination";
import { forwardRef, } from "react";
import { classNames } from "./internal.js";
function BreadcrumbInner({ label, items, separator = "›", className, ...props }, ref) {
    if (label.trim().length === 0)
        throw new TypeError("Breadcrumb label must not be empty");
    const descriptor = resolveBreadcrumbDescriptor({ items });
    return (_jsx("nav", { ...props, ref: ref, className: classNames("hjm-breadcrumb", className), "aria-label": label, children: _jsx("ol", { className: "hjm-breadcrumb__list", children: descriptor.items.map((item, index) => (_jsxs("li", { className: "hjm-breadcrumb__item", children: [item.current ? (_jsx("span", { className: "hjm-breadcrumb__current", "aria-current": "page", children: item.label })) : (_jsx("a", { className: "hjm-breadcrumb__link", href: item.destination.href, "data-destination": item.destination.kind, children: item.label })), index < descriptor.items.length - 1 ? (_jsx("span", { className: "hjm-breadcrumb__separator", "aria-hidden": "true", children: separator })) : null] }, item.id))) }) }));
}
export const Breadcrumb = forwardRef(BreadcrumbInner);
export const Pagination = forwardRef(function Pagination({ label, descriptor, labels, composeAccessibleName, onPageChange, className, ...props }, ref) {
    if (label.trim().length === 0)
        throw new TypeError("Pagination label must not be empty");
    const resolved = resolvePaginationDescriptor(descriptor, {
        labels,
        composeAccessibleName,
    });
    return (_jsx("nav", { ...props, ref: ref, className: classNames("hjm-pagination", className), "aria-label": label, children: _jsxs("ul", { className: "hjm-pagination__list", children: [_jsx("li", { children: _jsx("button", { type: "button", className: "hjm-pagination__item hjm-pagination__previous", "aria-label": resolved.labels.previous, disabled: !resolved.hasPrevious, onClick: () => onPageChange(resolved.currentPage - 1, "previous"), children: _jsx("span", { "aria-hidden": "true", children: "\u2039" }) }) }), resolved.items.map((item, index) => item.type === "ellipsis" ? (_jsx("li", { children: _jsx("span", { className: "hjm-pagination__ellipsis", "aria-hidden": "true", children: "\u2026" }) }, `ellipsis-${index}`)) : (_jsx("li", { children: _jsx("button", { type: "button", className: "hjm-pagination__item", "data-state": item.current ? "current" : "idle", "aria-current": item.current ? "page" : undefined, "aria-label": item.accessibleName, onClick: () => {
                            if (!item.current)
                                onPageChange(item.page, "page");
                        }, children: item.page }) }, item.page))), _jsx("li", { children: _jsx("button", { type: "button", className: "hjm-pagination__item hjm-pagination__next", "aria-label": resolved.labels.next, disabled: !resolved.hasNext, onClick: () => onPageChange(resolved.currentPage + 1, "next"), children: _jsx("span", { "aria-hidden": "true", children: "\u203A" }) }) })] }) }));
});
//# sourceMappingURL=advanced-navigation.js.map