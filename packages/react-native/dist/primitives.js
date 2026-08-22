import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveGridLayout, } from "@hjm/design-contracts/grid";
import { getIconTransform, resolveIconDescriptor, } from "@hjm/design-contracts/components/icon";
import { withAlpha } from "@hjm/design-contracts/colors";
import { glyph, spacing, typography, } from "@hjm/design-contracts/foundations";
import { surfaceDefaults, surfaceGeometry, surfaceRecipe, } from "@hjm/design-contracts/recipes/base";
import { stackRecipe, textRecipe, } from "@hjm/design-contracts/recipes";
import { Children, forwardRef, isValidElement, useEffect, useMemo, } from "react";
import { Text as NativeText, View, useWindowDimensions, } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
import { logicalTextAlign, scalableTextDefaults } from "./internal/styles.js";
export const Text = forwardRef(function Text({ children, variant = textRecipe.defaults.variant, tone = textRecipe.defaults.tone, emphasis = textRecipe.defaults.emphasis, align, style, ...props }, ref) {
    const { colors, environment } = useHjmNativeTheme();
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
    const typeStyle = typography[variant];
    return (_jsx(NativeText, { ...scalableTextDefaults, ...props, ref: ref, style: [
            typeStyle,
            {
                color: toneColors[tone],
                fontWeight: textRecipe.emphasis[emphasis],
                textAlign: align ?? logicalTextAlign(environment.direction),
            },
            style,
        ], children: children }));
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
export function Surface({ tone = surfaceDefaults.tone, padding = surfaceDefaults.padding, radius: radiusValue = surfaceDefaults.radius, bordered = surfaceDefaults.bordered, style, ...props }) {
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
export function Grid({ children, descriptor, columns, gap, minColumnWidth, availableWidth, onLayoutResolved, itemStyle, style, ...props }) {
    const { width: windowWidth } = useWindowDimensions();
    const { environment } = useHjmNativeTheme();
    const innerWidth = availableWidth ?? windowWidth;
    const resolvedDescriptor = useMemo(() => descriptor ?? {
        columns: columns,
        ...(gap === undefined ? {} : { gap }),
        ...(minColumnWidth === undefined ? {} : { minColumnWidth }),
    }, [columns, descriptor, gap, minColumnWidth]);
    const layout = useMemo(() => resolveGridLayout(resolvedDescriptor, { windowWidth, availableWidth: innerWidth }), [innerWidth, resolvedDescriptor, windowWidth]);
    useEffect(() => onLayoutResolved?.(layout), [
        layout.columnGap,
        layout.columns,
        layout.columnWidth,
        layout.requestedColumns,
        layout.rowGap,
        layout.windowClass,
        onLayoutResolved,
    ]);
    return (_jsx(View, { ...props, style: [
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
export function Section({ title, description, action, children, contentStyle, style, ...props }) {
    const { environment } = useHjmNativeTheme();
    const stackHeader = environment.textScale >= 1.6;
    return (_jsxs(View, { ...props, style: [{ gap: spacing.xs }, style], children: [_jsxs(View, { style: {
                    alignItems: stackHeader ? "stretch" : "center",
                    direction: environment.direction,
                    flexDirection: stackHeader ? "column" : "row",
                    gap: spacing.sm,
                }, children: [_jsxs(View, { style: { flex: 1, gap: spacing.xxs }, children: [_jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "title", children: title }), description ? _jsx(Text, { tone: "muted", variant: "caption", children: description }) : null] }), action ? _jsx(View, { children: action }) : null] }), _jsx(View, { style: contentStyle, children: children })] }));
}
//# sourceMappingURL=primitives.js.map