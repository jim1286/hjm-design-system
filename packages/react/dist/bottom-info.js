import { jsx as _jsx } from "react/jsx-runtime";
import { bottomInfoRecipe, validateBottomInfoDescriptor, } from "@hjmds/design-contracts/components/bottom-info";
import { forwardRef } from "react";
import { classNames } from "./internal.js";
export const BottomInfo = forwardRef(function BottomInfo({ items, tone = bottomInfoRecipe.defaults.tone, renderItem, className, ...props }, forwardedRef) {
    validateBottomInfoDescriptor({ items, tone });
    // A single line reads as a sentence; several read as a list. Marking one line
    // with a bullet is noise, which is why the recipe carries the threshold.
    const asList = items.length >= bottomInfoRecipe.listMarkerFrom;
    return (_jsx("aside", { ...props, ref: forwardedRef, className: classNames("hjm-bottom-info", className), "data-tone": tone, "data-list": asList || undefined, children: asList ? (_jsx("ul", { className: "hjm-bottom-info__list", children: items.map((item, index) => (_jsx("li", { className: "hjm-bottom-info__item", children: renderItem?.(item, index) ?? item }, item))) })) : (_jsx("p", { className: "hjm-bottom-info__item", children: renderItem?.(items[0], 0) ?? items[0] })) }));
});
//# sourceMappingURL=bottom-info.js.map