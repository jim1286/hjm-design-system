import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveGridLayout, } from "@hjmds/design-contracts/grid";
import { resolveAspectRatioDescriptor, } from "@hjmds/design-contracts/components/aspect-ratio";
import { resolveContainerDescriptor, } from "@hjmds/design-contracts/components/container";
import { layoutRecipe, validateLayoutWebDescriptor, } from "@hjmds/design-contracts/components/layout";
import { surfaceDefaults, surfaceGeometry, surfaceRecipe, } from "@hjmds/design-contracts/recipes/base";
import { stackRecipe, textRecipe, } from "@hjmds/design-contracts/recipes";
import { createElement, forwardRef, useId, useRef, } from "react";
import { classNames, composeRefs, useElementWidth, useWindowWidth, } from "./internal.js";
function hasRegionContent(content) {
    return content !== undefined && content !== null && content !== false;
}
function assertMainId(id) {
    if (id.trim().length === 0) {
        throw new TypeError("Layout mainId must not be empty");
    }
    if (/\s/u.test(id)) {
        throw new TypeError("Layout mainId must not contain whitespace");
    }
}
/** Accessible Web app shell with real landmarks and bypass navigation. */
export const Layout = forwardRef(function Layout({ children, header, footer, sidebar, skipLinkLabel, mainId: mainIdProp, mainRef: forwardedMainRef, headerProps, mainProps, footerProps, skipLinkProps, className, ...props }, ref) {
    const generatedId = `hjm-main-${useId().replaceAll(":", "")}`;
    const internalMainRef = useRef(null);
    const mainId = mainIdProp ?? generatedId;
    assertMainId(mainId);
    const hasHeader = hasRegionContent(header);
    const hasFooter = hasRegionContent(footer);
    const descriptor = {
        ...(hasHeader ? { hasHeader: true } : {}),
        ...(hasFooter ? { hasFooter: true } : {}),
        ...(sidebar === undefined
            ? {}
            : {
                sidebar: {
                    role: sidebar.role,
                    mode: sidebar.mode,
                    label: sidebar.label,
                },
            }),
        ...(skipLinkLabel === undefined ? {} : { skipLinkLabel }),
    };
    validateLayoutWebDescriptor(descriptor);
    if (sidebar?.mode === "overlay" &&
        typeof sidebar.renderOverlay !== "function") {
        throw new TypeError("Layout overlay sidebar requires renderOverlay so SidePanel owns its lifecycle");
    }
    const { className: headerClassName, ...restHeaderProps } = headerProps ?? {};
    const { className: mainClassName, style: mainStyle, ...restMainProps } = mainProps ?? {};
    const { className: footerClassName, ...restFooterProps } = footerProps ?? {};
    const { className: skipLinkClassName, onClick: onSkipLinkClick, ...restSkipLinkProps } = skipLinkProps ?? {};
    let sidebarNode;
    if (sidebar !== undefined) {
        const { className: sidebarClassName, style: sidebarStyle, ...restSidebarProps } = sidebar.landmarkProps ?? {};
        const sidebarLandmark = createElement(sidebar.role === "navigation" ? "nav" : "aside", {
            ...restSidebarProps,
            ref: sidebar.landmarkRef,
            className: classNames("hjm-layout__sidebar", sidebarClassName),
            "aria-label": sidebar.label,
            "data-mode": sidebar.mode,
            style: {
                ...(sidebar.mode === "persistent"
                    ? { inlineSize: layoutRecipe.sidebar.width }
                    : {}),
                ...sidebarStyle,
            },
        }, sidebar.children);
        sidebarNode = sidebar.mode === "overlay"
            ? sidebar.renderOverlay(sidebarLandmark)
            : sidebarLandmark;
    }
    const moveFocusToMain = (event) => {
        onSkipLinkClick?.(event);
        if (event.defaultPrevented)
            return;
        const main = internalMainRef.current;
        if (main === null)
            return;
        event.preventDefault();
        const url = new URL(window.location.href);
        url.hash = mainId;
        window.history.replaceState(window.history.state, "", url);
        main.focus({ preventScroll: true });
        main.scrollIntoView?.({ block: "start" });
    };
    return (_jsxs("div", { ...props, ref: ref, className: classNames("hjm-layout", className), "data-hjm-component": "Layout", "data-sidebar-mode": sidebar?.mode ?? "none", children: [skipLinkLabel === undefined ? null : (_jsx("a", { ...restSkipLinkProps, href: `#${mainId}`, className: classNames("hjm-layout__skip-link", skipLinkClassName), onClick: moveFocusToMain, children: skipLinkLabel })), hasHeader ? (_jsx("header", { ...restHeaderProps, className: classNames("hjm-layout__header", headerClassName), children: header })) : null, sidebarNode, _jsx("main", { ...restMainProps, ref: composeRefs(internalMainRef, forwardedMainRef), id: mainId, className: classNames("hjm-layout__main", mainClassName), tabIndex: -1, style: {
                    maxInlineSize: layoutRecipe.main.maxWidth,
                    paddingInline: layoutRecipe.main.paddingHorizontal,
                    ...mainStyle,
                }, children: children }), hasFooter ? (_jsx("footer", { ...restFooterProps, className: classNames("hjm-layout__footer", footerClassName), children: footer })) : null] }));
});
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
/** A centered, token-guttered content boundary shared with Native large screens. */
export const Container = forwardRef(function Container({ size, gutter, className, style, ...props }, ref) {
    const resolved = resolveContainerDescriptor({
        ...(size === undefined ? {} : { size }),
        ...(gutter === undefined ? {} : { gutter }),
    });
    return (_jsx("div", { ...props, ref: ref, className: classNames("hjm-container", className), "data-size": resolved.size, "data-gutter": resolved.gutter, style: {
            maxInlineSize: resolved.maxWidth ?? undefined,
            paddingInline: resolved.paddingInline,
            ...style,
        } }));
});
/** Responsive media frame. Products retain object-fit, crop, and content semantics. */
export const AspectRatio = forwardRef(function AspectRatio({ ratio, className, style, ...props }, ref) {
    const resolved = resolveAspectRatioDescriptor(ratio === undefined ? {} : { ratio });
    return (_jsx("div", { ...props, ref: ref, className: classNames("hjm-aspect-ratio", className), "data-ratio": resolved.source, style: { aspectRatio: resolved.ratio, ...style } }));
});
/** Keeps meaningful copy available to assistive technology without visible layout. */
export const VisuallyHidden = forwardRef(function VisuallyHidden({ className, ...props }, ref) {
    return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-visually-hidden", className) }));
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
/** Large-text-safe semantic content section with an optional header action. */
export const Section = forwardRef(function Section({ title, description, action, children, headingLevel = 2, className, ...props }, ref) {
    const hasHeader = title !== undefined || description !== undefined || action !== undefined;
    return (_jsxs("section", { ...props, ref: ref, className: classNames("hjm-section", className), children: [hasHeader ? (_jsxs("header", { className: "hjm-section__header", children: [_jsxs("div", { className: "hjm-section__copy", children: [title === undefined ? null : createElement(`h${headingLevel}`, { className: "hjm-section__title" }, title), description === undefined ? null : (_jsx("div", { className: "hjm-section__description", children: description }))] }), action === undefined ? null : _jsx("div", { className: "hjm-section__action", children: action })] })) : null, _jsx("div", { className: "hjm-section__content", children: children })] }));
});
//# sourceMappingURL=layout.js.map