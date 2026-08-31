import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveGridLayout, } from "@hjmds/design-contracts/grid";
import { resolveAspectRatioDescriptor, } from "@hjmds/design-contracts/components/aspect-ratio";
import { resolveContainerDescriptor, } from "@hjmds/design-contracts/components/container";
import { getIconTransform, resolveIconDescriptor, } from "@hjmds/design-contracts/components/icon";
import { validateLayoutRegions, } from "@hjmds/design-contracts/components/layout";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { withAlpha } from "@hjmds/design-contracts/colors";
import { glyph, typography, } from "@hjmds/design-contracts/foundations";
import { surfaceDefaults, surfaceGeometry, surfaceRecipe, } from "@hjmds/design-contracts/recipes/base";
import { sectionRecipe, stackRecipe, textRecipe, } from "@hjmds/design-contracts/recipes";
import { Children, forwardRef, isValidElement, useEffect, useMemo, useState, } from "react";
import { Text as NativeText, View, useWindowDimensions, } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
import { logicalTextAlign, resolveNativeTextScaleProps, } from "./internal/styles.js";
/** Native shell translation: ordered regions without inventing Web landmark roles. */
export const Layout = forwardRef(function Layout({ children, header, footer, sidebar, skipLinkLabel, headerProps, mainProps, footerProps, mainRef, style, ...props }, ref) {
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
        ...(skipLinkLabel === undefined ? {} : { skipLinkLabel }),
    });
    const sidebarNode = sidebar === undefined
        ? null
        : (_jsx(View, { ...sidebar.containerProps, accessibilityLabel: sidebar.label, children: sidebar.children }));
    return (_jsxs(View, { ...props, ref: ref, style: [{ flex: 1 }, style], children: [hasHeader ? _jsx(View, { ...headerProps, children: header }) : null, sidebar?.mode === "overlay" ? sidebar.renderOverlay(sidebarNode) : sidebarNode, _jsx(View, { ...mainProps, ref: mainRef, style: [{ flex: 1 }, mainProps?.style], children: children }), hasFooter ? _jsx(View, { ...footerProps, children: footer }) : null] }));
});
export const Text = forwardRef(function Text({ children, variant = textRecipe.defaults.variant, tone = textRecipe.defaults.tone, emphasis = textRecipe.defaults.emphasis, align, allowFontScaling, style, ...props }, ref) {
    const { colors, environment, textScaling } = useHjmNativeTheme();
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
        typography[variant],
        {
            color: toneColors[tone],
            fontWeight: textRecipe.emphasis[emphasis],
            textAlign: align ?? logicalTextAlign(environment.direction),
        },
        style,
    ], allowFontScaling);
    return (_jsx(NativeText, { ...props, allowFontScaling: resolvedText.allowFontScaling, ref: ref, style: resolvedText.style, children: children }));
});
function normalizeSurfaceTone(tone) {
    if (tone === "sunken")
        return "subtle";
    if (tone === "brand")
        return "accent";
    return tone;
}
function resolveThemeColor(colors, key) {
    return colors[key];
}
export function Surface({ tone = surfaceDefaults.tone, padding = surfaceDefaults.padding, radius: radiusValue = surfaceDefaults.radius, bordered = surfaceDefaults.bordered, layoutStyle, style, ...props }) {
    const { colors } = useHjmNativeTheme();
    const normalizedTone = normalizeSurfaceTone(tone);
    const contract = surfaceRecipe[normalizedTone];
    const shouldDrawBorder = bordered || contract.borderAlways;
    const borderColor = resolveThemeColor(colors, contract.border);
    const elevatedStyle = contract.elevated
        ? {
            elevation: 4,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
        }
        : undefined;
    return (_jsx(View, { ...props, style: [
            {
                backgroundColor: resolveThemeColor(colors, contract.background),
                borderColor: shouldDrawBorder
                    ? contract.borderAlpha === 1
                        ? borderColor
                        : withAlpha(borderColor, contract.borderAlpha)
                    : "transparent",
                borderRadius: typeof radiusValue === "number"
                    ? radiusValue
                    : surfaceGeometry.radii[radiusValue],
                borderWidth: 1,
                padding: typeof padding === "number"
                    ? padding
                    : surfaceGeometry.paddings[padding],
            },
            elevatedStyle,
            style,
            layoutStyle,
        ] }));
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
export function Stack({ axis, direction, gap = stackRecipe.defaults.gap, align = stackRecipe.defaults.align, justify = stackRecipe.defaults.justify, wrap = stackRecipe.defaults.wrap, style, ...props }) {
    const { environment } = useHjmNativeTheme();
    const resolvedAxis = axis ?? (direction === "row" ? "inline" : "block");
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
        ] }));
}
/** Shared centered content boundary for phones, tablets, and desktop-sized Native windows. */
export function Container({ size, gutter, style, ...props }) {
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
        ] }));
}
/** Native translation of the same width/height contract used by Web media frames. */
export function AspectRatio({ ratio, style, ...props }) {
    const resolved = resolveAspectRatioDescriptor(ratio === undefined ? {} : { ratio });
    return (_jsx(View, { ...props, style: [{ aspectRatio: resolved.ratio, width: "100%" }, style] }));
}
export function Grid({ children, descriptor, columns, gap, minColumnWidth, availableWidth, onLayoutResolved, itemStyle, style, onLayout, ...props }) {
    const { width: windowWidth } = useWindowDimensions();
    const { environment } = useHjmNativeTheme();
    const [measuredWidth, setMeasuredWidth] = useState(null);
    const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
    const resolvedDescriptor = useMemo(() => descriptor ?? {
        columns: columns,
        ...(gap === undefined ? {} : { gap }),
        ...(minColumnWidth === undefined ? {} : { minColumnWidth }),
    }, [columns, descriptor, gap, minColumnWidth]);
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
    return (_jsx(View, { ...props, onLayout: handleLayout, style: [
            {
                direction: environment.direction,
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: layout.columnGap,
                rowGap: layout.rowGap,
            },
            style,
        ], children: Children.toArray(children).map((child, index) => (_jsx(View, { style: [{ width: layout.columnWidth }, itemStyle], children: child }, isValidElement(child) && child.key !== null ? child.key : `hjm-grid-${index}`))) }));
}
/** Semantic Native icon frame without an Expo or third-party icon dependency. */
export function Icon({ descriptor, renderGlyph, style, }) {
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
        ], children: _jsx(View, { accessible: false, children: renderGlyph({
                name: resolved.name,
                size,
                color: colors[resolved.tone],
                strokeWidth: resolved.weight === "strong" ? 2.5 : 2,
            }) }) }));
}
/** A large-text-safe content section with a logical header action slot. */
export function Section({ title, description, action, children, headerStyle, copyStyle, titleStyle, descriptionStyle, actionStyle, contentStyle, style, ...props }) {
    const theme = useHjmNativeTheme();
    const stackHeader = theme.environment.textScale >= 1.6;
    const hasHeader = title !== undefined || description !== undefined || action !== undefined;
    return (_jsxs(View, { ...props, style: [{ gap: sectionRecipe.gap }, style], children: [hasHeader ? _jsxs(View, { style: [
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
                                    titleStyle,
                                ], variant: sectionRecipe.title.textVariant, children: title }), description ? (_jsx(Text, { style: [
                                    {
                                        color: resolveColorReference(sectionRecipe.description.color, theme.palette),
                                    },
                                    descriptionStyle,
                                ], variant: sectionRecipe.description.textVariant, children: description })) : null] }), action ? _jsx(View, { style: actionStyle, children: action }) : null] }) : null, _jsx(View, { style: contentStyle, children: children })] }));
}
//# sourceMappingURL=primitives.js.map