import { jsx as _jsx } from "react/jsx-runtime";
import { resolveGridLayout, } from "@hjm/design-contracts/grid";
import { surfaceDefaults, surfaceGeometry, surfaceRecipe, } from "@hjm/design-contracts/recipes/base";
import { stackRecipe, textRecipe, } from "@hjm/design-contracts/recipes";
import { createElement, forwardRef, } from "react";
import { classNames, useElementWidth, useWindowWidth } from "./internal.js";
export const Text = forwardRef(function Text({ as = "span", variant = textRecipe.defaults.variant, tone = textRecipe.defaults.tone, emphasis = textRecipe.defaults.emphasis, className, ...props }, ref) {
    return createElement(as, {
        ...props,
        ref,
        className: classNames("hjm-text", className),
        "data-variant": variant,
        "data-tone": tone,
        "data-emphasis": emphasis,
    });
});
export const Surface = forwardRef(function Surface({ as = "div", tone = surfaceDefaults.tone, bordered = surfaceDefaults.bordered, padding = surfaceDefaults.padding, radius = surfaceDefaults.radius, className, style, ...props }, ref) {
    const contract = surfaceRecipe[tone];
    return createElement(as, {
        ...props,
        ref,
        className: classNames("hjm-surface", className),
        "data-tone": tone,
        "data-bordered": bordered || contract.borderAlways,
        "data-elevated": contract.elevated,
        "data-padding": padding,
        "data-radius": radius,
        style: {
            padding: surfaceGeometry.paddings[padding],
            borderRadius: surfaceGeometry.radii[radius],
            ...style,
        },
    });
});
const justifyValues = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
};
export const Stack = forwardRef(function Stack({ axis = stackRecipe.defaults.axis, gap = stackRecipe.defaults.gap, align = stackRecipe.defaults.align, justify = stackRecipe.defaults.justify, wrap = stackRecipe.defaults.wrap, className, style, ...props }, ref) {
    return (_jsx("div", { ...props, ref: ref, className: classNames("hjm-stack", className), "data-axis": axis, "data-gap": gap, style: {
            display: "flex",
            flexDirection: stackRecipe.axes[axis],
            gap: stackRecipe.gaps[gap],
            alignItems: align === "start" || align === "end" ? `flex-${align}` : align,
            justifyContent: justifyValues[justify],
            flexWrap: wrap ? "wrap" : "nowrap",
            ...style,
        } }));
});
export const Grid = forwardRef(function Grid({ columns, gap, minColumnWidth, windowWidth, availableWidth, className, style, ...props }, forwardedRef) {
    const browserWindowWidth = useWindowWidth();
    const [measuredWidth, gridRef] = useElementWidth(forwardedRef);
    const compactSsrWidth = 320;
    const effectiveWindowWidth = windowWidth ??
        (browserWindowWidth > 0 ? browserWindowWidth : compactSsrWidth);
    const effectiveAvailableWidth = availableWidth ??
        (measuredWidth !== undefined && measuredWidth > 0
            ? measuredWidth
            : effectiveWindowWidth);
    const descriptor = {
        columns,
        ...(gap === undefined ? {} : { gap }),
        ...(minColumnWidth === undefined ? {} : { minColumnWidth }),
    };
    const layout = resolveGridLayout(descriptor, {
        windowWidth: effectiveWindowWidth,
        availableWidth: effectiveAvailableWidth,
    });
    return (_jsx("div", { ...props, ref: gridRef, className: classNames("hjm-grid", className), "data-window-class": layout.windowClass, "data-columns": layout.columns, "data-requested-columns": layout.requestedColumns, "data-state": layout.columns < layout.requestedColumns ? "collapsed" : "resolved", style: {
            display: "grid",
            gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
            rowGap: layout.rowGap,
            columnGap: layout.columnGap,
            ...style,
        } }));
});
//# sourceMappingURL=layout.js.map