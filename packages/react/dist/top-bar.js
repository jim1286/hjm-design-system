import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { topBarRecipe } from "@hjmds/design-contracts/recipes";
import { forwardRef } from "react";
import { Button } from "./actions.js";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
/** Screen chrome stays composable inside pages and dialogs, without adding a second banner landmark. */
export const TopBar = forwardRef(function TopBar({ title, titleLeading, onTitleClick, titleAccessibilityLabel, headingLevel = 1, leading, trailing, actions, centered = topBarRecipe.defaults.centered, safeAreaTop = 0, className, style, ...props }, ref) {
    const theme = useOptionalHjmTheme();
    if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0)
        throw new RangeError("TopBar safeAreaTop must be non-negative");
    if (title !== undefined && !title.trim())
        throw new TypeError("TopBar title must not be empty");
    if (titleAccessibilityLabel !== undefined && !titleAccessibilityLabel.trim())
        throw new TypeError("TopBar titleAccessibilityLabel must not be empty");
    if (actions !== undefined && trailing !== undefined)
        throw new TypeError("TopBar accepts either trailing or actions");
    if (title === undefined && (titleLeading !== undefined || onTitleClick !== undefined || titleAccessibilityLabel !== undefined)) {
        throw new TypeError("TopBar title affordances require a title");
    }
    const Heading = `h${headingLevel}`;
    return _jsxs("div", { ...props, ref: ref, className: classNames("hjm-top-bar", className), "data-centered": centered, "data-large-text": (theme?.environment.textScale ?? 1) >= topBarRecipe.largeTextThreshold, style: {
            "--hjm-top-bar-min-height": `${topBarRecipe.minHeight}px`,
            "--hjm-top-bar-padding": `${topBarRecipe.paddingHorizontal}px`,
            "--hjm-top-bar-gap": `${topBarRecipe.gap}px`,
            "--hjm-top-bar-safe-area": `${safeAreaTop}px`, ...style,
        }, children: [_jsx("div", { className: "hjm-top-bar__leading", children: leading }), _jsx("div", { className: "hjm-top-bar__title", children: title === undefined ? null : _jsx(Heading, { className: "hjm-top-bar__heading", children: onTitleClick ? _jsx(Button, { tone: "ghost", onClick: onTitleClick, "aria-label": titleAccessibilityLabel, leading: titleLeading, children: title })
                        : _jsxs("span", { "aria-label": titleAccessibilityLabel, children: [titleLeading, title] }) }) }), _jsx("div", { className: "hjm-top-bar__trailing", children: actions ?? trailing })] });
});
//# sourceMappingURL=top-bar.js.map