import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveBreadcrumbDescriptor } from "@hjmds/design-contracts/components/breadcrumb";
import { forwardRef } from "react";
import { classNames } from "./internal.js";
function BreadcrumbInner({ label, items, separator, className, ...props }, ref) {
    if (label.trim().length === 0)
        throw new TypeError("Breadcrumb label must not be empty");
    const descriptor = resolveBreadcrumbDescriptor({ items });
    return (_jsx("nav", { ...props, ref: ref, className: classNames("hjm-breadcrumb", className), "aria-label": label, children: _jsx("ol", { className: "hjm-breadcrumb__list", children: descriptor.items.map((item, index) => (_jsxs("li", { className: "hjm-breadcrumb__item", children: [item.current ? (_jsx("span", { className: "hjm-breadcrumb__current", "aria-current": "page", children: item.label })) : (_jsx("a", { className: "hjm-breadcrumb__link", href: item.destination.href, "data-destination": item.destination.kind, children: item.label })), index < descriptor.items.length - 1 ? (_jsx("span", { className: "hjm-breadcrumb__separator", "aria-hidden": "true", "data-default": separator === undefined, children: separator === undefined ? "›" : separator })) : null] }, item.id))) }) }));
}
export const Breadcrumb = forwardRef(BreadcrumbInner);
//# sourceMappingURL=breadcrumb.js.map