import { headingRecipe, resolveHeadingSemanticLevel, validateHeadingDescriptor, } from "@hjmds/design-contracts/components/heading";
import { createElement, forwardRef, } from "react";
import { classNames } from "./internal.js";
export const Heading = forwardRef(function Heading({ level, semanticLevel, children, className, ...props }, forwardedRef) {
    const descriptor = {
        level,
        ...(semanticLevel === undefined ? {} : { semanticLevel }),
    };
    validateHeadingDescriptor(descriptor);
    const metrics = headingRecipe.levels[level];
    // Visual size and document level are separate axes: the element comes from
    // the semantic level, the type comes from the visual one.
    return createElement(`h${resolveHeadingSemanticLevel(descriptor)}`, {
        ...props,
        ref: forwardedRef,
        className: classNames("hjm-heading", className),
        "data-level": level,
        style: {
            "--hjm-heading-size": `${metrics.fontSize}px`,
            "--hjm-heading-line-height": `${metrics.lineHeight}px`,
            "--hjm-heading-weight": metrics.fontWeight,
        },
    }, children);
});
//# sourceMappingURL=heading.js.map