import { useDesignProfileDefaults } from "./internal.js";
import { headingRecipe, resolveHeadingSemanticLevel, validateHeadingDescriptor, } from "@hjmds/design-contracts/components/heading";
import { createElement, forwardRef, } from "react";
import { classNames } from "./internal.js";
export const Heading = forwardRef(function Heading({ level, semanticLevel, children, className, layoutStyle, style, ...props }, forwardedRef) {
    const descriptor = {
        level,
        ...(semanticLevel === undefined ? {} : { semanticLevel }),
    };
    validateHeadingDescriptor(descriptor);
    const profile = useDesignProfileDefaults();
    const metrics = profile?.tokens.heading[level] ?? headingRecipe.levels[level];
    // Visual size and document level are separate axes: the element comes from
    // the semantic level, the type comes from the visual one.
    return createElement(`h${resolveHeadingSemanticLevel(descriptor)}`, {
        ...props,
        ref: forwardedRef,
        className: classNames("hjm-heading", className),
        "data-level": level,
        // The caller's `style` used to be replaced wholesale by the recipe object,
        // so a placement margin vanished without a type error. Merge it instead, and
        // spread the recipe variables last: the level still owns size, line height
        // and weight, which is why the variables are not caller-overridable here
        // (unlike Native's caller-last array; Web has `layoutStyle` for placement).
        style: {
            ...style,
            ...layoutStyle,
            "--hjm-heading-size": `${metrics.fontSize}px`,
            "--hjm-heading-line-height": `${metrics.lineHeight}px`,
            "--hjm-heading-weight": metrics.fontWeight,
        },
    }, children);
});
//# sourceMappingURL=heading.js.map