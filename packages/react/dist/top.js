import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { topDefaults, topRecipe, validateTopDescriptor, } from "@hjmds/design-contracts/components/top";
import { forwardRef, createElement } from "react";
import { classNames } from "./internal.js";
export const Top = forwardRef(function Top({ descriptor, trailing, className }, forwardedRef) {
    validateTopDescriptor(descriptor);
    const size = descriptor.size ?? topDefaults.size;
    const level = descriptor.headingLevel ?? topDefaults.headingLevel;
    const metrics = topRecipe.sizes[size];
    return (_jsxs("header", { ref: forwardedRef, className: classNames("hjm-top", className), "data-size": size, style: {
            "--hjm-top-title-size": `${metrics.title.fontSize}px`,
            "--hjm-top-title-line-height": `${metrics.title.lineHeight}px`,
            "--hjm-top-title-weight": metrics.title.fontWeight,
            "--hjm-top-padding-top": `${metrics.paddingTop}px`,
            "--hjm-top-padding-bottom": `${metrics.paddingBottom}px`,
        }, children: [descriptor.eyebrow ? _jsx("p", { className: "hjm-top__eyebrow", children: descriptor.eyebrow }) : null, _jsxs("div", { className: "hjm-top__row", children: [createElement(`h${level}`, { className: "hjm-top__title" }, descriptor.title), trailing ? _jsx("div", { className: "hjm-top__trailing", children: trailing }) : null] }), descriptor.description ? _jsx("p", { className: "hjm-top__description", children: descriptor.description }) : null] }));
});
//# sourceMappingURL=top.js.map