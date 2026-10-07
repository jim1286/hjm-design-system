import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveGridLayout, } from "@hjmds/design-contracts/grid";
import { resolveAspectRatioDescriptor, } from "@hjmds/design-contracts/components/aspect-ratio";
import { resolveContainerDescriptor, } from "@hjmds/design-contracts/components/container";
import { getIconTransform, resolveIconDescriptor, } from "@hjmds/design-contracts/components/icon";
import { validateLayoutRegions, } from "@hjmds/design-contracts/components/layout";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { withAlpha } from "@hjmds/design-contracts/colors";
import { glyph, resolveTextFontRole, resolveFontFamilyStack, } from "@hjmds/design-contracts/foundations";
import { surfaceDefaults, surfaceGeometry, surfaceRecipe, } from "@hjmds/design-contracts/recipes/base";
import { sectionRecipe, stackRecipe, textRecipe, } from "@hjmds/design-contracts/recipes";
import { Children, Component, Fragment, forwardRef, isValidElement, useEffect, useMemo, useState, } from "react";
import { PixelRatio, Text as NativeText, View, useWindowDimensions, } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
import { logicalTextAlign, resolveNativeFontStyle, resolveNativeShadowElevation, resolveNativeTextScaleProps, } from "./internal/styles.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
/** Native shell translation: ordered regions without inventing Web landmark roles. */
export const Layout = forwardRef(function Layout({ children, header, footer, sidebar, headerProps, mainProps, footerProps, mainRef, style, ...props }, ref) {
    const hasHeader = header !== undefined && header !== null && header !== false;
    const hasFooter = footer !== undefined && footer !== null && footer !== false;
    validateLayoutRegions({
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
    });
    const sidebarNode = sidebar === undefined
        ? null
        : (_jsx(View, { ...sidebar.containerProps, accessibilityLabel: sidebar.label, children: sidebar.children }));
    return (_jsxs(View, { ...props, ref: ref, style: [{ flex: 1 }, style], children: [hasHeader ? _jsx(View, { ...headerProps, children: header }) : null, sidebar?.mode === "overlay" ? sidebar.renderOverlay(sidebarNode) : sidebarNode, _jsx(View, { ...mainProps, ref: mainRef, style: [{ flex: 1 }, mainProps?.style], children: children }), hasFooter ? _jsx(View, { ...footerProps, children: footer }) : null] }));
});
export const Text = forwardRef(function Text({ children, variant = textRecipe.defaults.variant, fontRole, tone = textRecipe.defaults.tone, emphasis: suppliedEmphasis, align, allowFontScaling, layoutStyle, style, ...props }, ref) {
    const { colors, environment, textScaling, tokens, designProfile } = useHjmNativeTheme();
    const emphasis = suppliedEmphasis ?? textRecipe.defaults.emphasis;
    const familyRole = resolveTextFontRole(variant, fontRole ?? (props.accessibilityRole === "header" || props.role === "heading" ? "display" : undefined));
    const toneColors = {
        primary: colors.text,
        body: colors.textBody,
        muted: colors.textMuted,
        subtle: colors.textSub,
        weak: colors.textWeak,
        danger: colors.danger,
        brand: colors.contentBrand,
        inverse: colors.onPrimary,
    };
    const resolvedText = resolveNativeTextScaleProps(textScaling, [
        tokens.typography[variant],
        {
            color: toneColors[tone],
            fontWeight: designProfile && suppliedEmphasis === undefined ? tokens.typography[variant].fontWeight : textRecipe.emphasis[emphasis],
            ...resolveNativeFontStyle(resolveFontFamilyStack(tokens.fontFamily, familyRole), familyRole === "code" ? "code" : "ui"),
            textAlign: align ?? logicalTextAlign(environment.direction),
        },
        style,
        layoutStyle,
    ], allowFontScaling);
    return (_jsx(NativeText, { ...props, allowFontScaling: resolvedText.allowFontScaling, ref: ref, style: resolvedText.style, children: children }));
});
function resolveThemeColor(colors, key) {
    return colors[key];
}
export function Surface({ tone = surfaceDefaults.tone, padding = surfaceDefaults.padding, radius: radiusValue = surfaceDefaults.radius, bordered, layoutStyle, children, ...props }) {
    const { colors, tokens, designProfile, environment, surfaceEffects, reducedTransparency, surfaceMaterial: material } = useHjmNativeTheme();
    const renderBackdrop = !reducedTransparency && material?.blurStrength ? surfaceEffects?.renderBackdrop : undefined;
    // The core supports RN 0.81's old architecture too: inset boxShadow must be
    // explicitly confirmed by the product host, never inferred from a theme name.
    const insetStyle = surfaceEffects?.insetShadows && material?.insetShadows.length
        ? { boxShadow: material.insetShadows.map(token => ({ inset: true, offsetX: token.offsetX, offsetY: token.offsetY, blurRadius: token.radius, color: withAlpha(token.color, token.opacity) })) }
        : undefined;
    const normalizedTone = tone;
    const contract = surfaceRecipe[normalizedTone];
    const shouldDrawBorder = bordered ?? (surfaceDefaults.bordered || contract.borderAlways);
    const borderColor = resolveThemeColor(colors, contract.border);
    const elevatedStyle = contract.elevated
        ? {
            ...resolveNativeShadowElevation(tokens.shadow.floating, designProfile !== undefined, 4),
            // Use the same floating surface token as Web instead of a separate blur.
            shadowColor: tokens.shadow.floating.color,
            shadowOffset: { width: 0, height: tokens.shadow.floating.offsetY },
            shadowOpacity: tokens.shadow.floating.opacity,
            shadowRadius: tokens.shadow.floating.radius,
        }
        : undefined;
    return (_jsxs(View, { ...props, style: [
            {
                backgroundColor: renderBackdrop ? "transparent" : resolveThemeColor(colors, contract.background),
                borderColor: shouldDrawBorder
                    ? contract.borderAlpha === 1
                        ? borderColor
                        : withAlpha(borderColor, contract.borderAlpha)
                    : "transparent",
                borderRadius: tokens.radius[radiusValue],
                borderWidth: 1,
                // A child image would otherwise spill past the rounded corner. An
                // elevated tone opts out because clipping cuts off its own shadow.
                overflow: contract.clipsContent ? "hidden" : "visible",
                padding: surfaceGeometry.paddings[padding],
            },
            elevatedStyle,
            insetStyle,
            layoutStyle,
        ], children: [renderBackdrop && material ? _jsx(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: tokens.radius[radiusValue], overflow: "hidden" }, children: _jsx(SurfaceBackdropBoundary, { renderBackdrop: renderBackdrop, background: colors.bg, children: _jsx(SurfaceBackdrop, { renderBackdrop: renderBackdrop, strength: material.blurStrength, theme: environment.theme, opacity: material.fillOpacity, background: colors.bg }) }, `${designProfile?.id}:${material.blurStrength}:${material.fillOpacity}`) }, "material") : null, _jsx(Fragment, { children: children }, "content")] }));
}
const surfaceBackdropFill = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 };
// A whole-surface backdrop differs from EffectSurface/ProgressiveBlur's null
// failure fallback: opaque fill is required before displaying readable content.
class SurfaceBackdropBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidUpdate(previous) {
        // Retry only after a host replacement; content renders cannot loop a failure.
        if (this.state.failed && previous.renderBackdrop !== this.props.renderBackdrop)
            this.setState({ failed: false });
    }
    render() { return this.state.failed ? _jsx(View, { style: { ...surfaceBackdropFill, backgroundColor: this.props.background } }) : this.props.children; }
}
function SurfaceBackdrop({ renderBackdrop, strength, theme, opacity, background }) {
    const layer = renderBackdrop({ strength, theme });
    if (!isValidElement(layer))
        return _jsx(View, { style: { ...surfaceBackdropFill, backgroundColor: background } });
    return _jsxs(_Fragment, { children: [layer, _jsx(View, { style: { ...surfaceBackdropFill, backgroundColor: withAlpha(background, opacity) } })] });
}
const alignValues = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
};
const justifyValues = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
};
export function Stack({ axis, gap = stackRecipe.defaults.gap, align = stackRecipe.defaults.align, justify = stackRecipe.defaults.justify, wrap = stackRecipe.defaults.wrap, layoutStyle, style, ...props }) {
    const { environment } = useHjmNativeTheme();
    const resolvedAxis = axis ?? "block";
    const flexDirection = stackRecipe.axes[resolvedAxis];
    return (_jsx(View, { ...props, style: [
            {
                alignItems: alignValues[align],
                direction: environment.direction,
                flexDirection,
                flexWrap: wrap ? "wrap" : "nowrap",
                gap: typeof gap === "number" ? gap : stackRecipe.gaps[gap],
                justifyContent: justifyValues[justify],
            },
            style,
            layoutStyle,
        ] }));
}
/** Shared centered content boundary for phones, tablets, and desktop-sized Native windows. */
export function Container({ size, gutter, layoutStyle, style, ...props }) {
    warnDeprecatedStyleProps("Container", { style }, "layoutStyle for placement and size/gutter for width and padding");
    const resolved = resolveContainerDescriptor({
        ...(size === undefined ? {} : { size }),
        ...(gutter === undefined ? {} : { gutter }),
    });
    return (_jsx(View, { ...props, style: [
            {
                alignSelf: "center",
                maxWidth: resolved.maxWidth ?? undefined,
                paddingHorizontal: resolved.paddingInline,
                width: "100%",
            },
            style,
            layoutStyle,
        ] }));
}
/** Native translation of the same width/height contract used by Web media frames. */
export function AspectRatio({ ratio, style, ...props }) {
    const resolved = resolveAspectRatioDescriptor(ratio === undefined ? {} : { ratio });
    return (_jsx(View, { ...props, style: [{ aspectRatio: resolved.ratio, width: "100%" }, style] }));
}
export function Grid({ children, columns, gap, minColumnWidth, availableWidth, onLayoutResolved, itemStyle, style, onLayout, ...props }) {
    const { width: windowWidth } = useWindowDimensions();
    const { environment } = useHjmNativeTheme();
    const [measuredWidth, setMeasuredWidth] = useState(null);
    const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
    const resolvedDescriptor = useMemo(() => ({
        columns: columns,
        ...(gap === undefined ? {} : { gap }),
        ...(minColumnWidth === undefined ? {} : { minColumnWidth }),
    }), [columns, gap, minColumnWidth]);
    const layout = useMemo(() => resolveGridLayout(resolvedDescriptor, { windowWidth, availableWidth: innerWidth }), [innerWidth, resolvedDescriptor, windowWidth]);
    const handleLayout = (event) => {
        onLayout?.(event);
        if (availableWidth !== undefined)
            return;
        const nextWidth = event.nativeEvent.layout.width;
        if (Number.isFinite(nextWidth) && nextWidth > 0) {
            setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
        }
    };
    useEffect(() => onLayoutResolved?.(layout), [
        layout.columnGap,
        layout.columns,
        layout.columnWidth,
        layout.requestedColumns,
        layout.rowGap,
        layout.windowClass,
        onLayoutResolved,
    ]);
    // Floor to a device pixel so fractional widths never wrap the last column.
    const scale = PixelRatio.get();
    const cellWidth = Math.floor(layout.columnWidth * scale) / scale;
    return (_jsx(View, { ...props, onLayout: handleLayout, style: [
            {
                direction: environment.direction,
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: layout.columnGap,
                rowGap: layout.rowGap,
            },
            style,
        ], children: Children.toArray(children).map((child, index) => (_jsx(View, { style: [{ width: cellWidth }, itemStyle], children: child }, isValidElement(child) && child.key !== null ? child.key : `hjm-grid-${index}`))) }));
}
/** Semantic Native icon frame without an Expo or third-party icon dependency. */
export function Icon({ descriptor, renderGlyph, layoutStyle, style, }) {
    warnDeprecatedStyleProps("Icon", { style }, "layoutStyle for placement and the icon descriptor for appearance");
    const resolved = resolveIconDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const colors = {
        primary: theme.colors.text,
        secondary: theme.colors.textMuted,
        decorative: theme.colors.textWeak,
        brand: theme.colors.contentBrand,
        info: theme.palette.statusAccents.info,
        success: theme.palette.statusAccents.success,
        warning: theme.palette.statusAccents.warning,
        danger: theme.colors.danger,
        inverse: theme.colors.onPrimary,
    };
    const size = glyph[resolved.size];
    const mirror = getIconTransform(resolved.directionality, theme.environment.direction) === "mirror-inline";
    return (_jsx(View, { ...(resolved.decorative
            ? { accessible: false }
            : {
                accessibilityLabel: resolved.accessibilityLabel,
                accessibilityRole: "image",
                accessible: true,
            }), style: [
            {
                alignItems: "center",
                height: size,
                justifyContent: "center",
                transform: mirror ? [{ scaleX: -1 }] : undefined,
                width: size,
            },
            style,
            layoutStyle,
        ], children: _jsx(View, { accessible: false, children: renderGlyph({
                name: resolved.name,
                size,
                color: colors[resolved.tone],
                strokeWidth: resolved.weight === "strong" ? 2.5 : 2,
            }) }) }));
}
/** A large-text-safe content section with a logical header action slot. */
export function Section({ title, description, action, children, headerStyle, copyStyle, actionStyle, contentStyle, layoutStyle, style, ...props }) {
    const theme = useHjmNativeTheme();
    warnDeprecatedStyleProps("Section", { style }, "layoutStyle for placement; sectionRecipe owns appearance");
    const stackHeader = theme.environment.textScale >= 1.6;
    const hasHeader = title !== undefined || description !== undefined || action !== undefined;
    return (_jsxs(View, { ...props, style: [{ gap: sectionRecipe.gap }, style, layoutStyle], children: [hasHeader ? _jsxs(View, { style: [
                    {
                        alignItems: stackHeader ? "stretch" : "center",
                        direction: theme.environment.direction,
                        flexDirection: stackHeader ? "column" : "row",
                        gap: sectionRecipe.headerGap,
                    },
                    headerStyle,
                ], children: [_jsxs(View, { style: [{ flex: 1, gap: sectionRecipe.copyGap }, copyStyle], children: [title === undefined ? null : _jsx(Text, { accessibilityRole: "header", style: [
                                    {
                                        color: resolveColorReference(sectionRecipe.title.color, theme.palette),
                                        fontWeight: sectionRecipe.title.fontWeight,
                                    },
                                ], variant: sectionRecipe.title.textVariant, children: title }), description ? (_jsx(Text, { style: [
                                    {
                                        color: resolveColorReference(sectionRecipe.description.color, theme.palette),
                                    },
                                ], variant: sectionRecipe.description.textVariant, children: description })) : null] }), action ? _jsx(View, { style: actionStyle, children: action }) : null] }) : null, _jsx(View, { style: contentStyle, children: children })] }));
}
//# sourceMappingURL=primitives.js.map