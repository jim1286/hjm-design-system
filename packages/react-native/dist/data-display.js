import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { withAlpha } from "@hjm/design-contracts/colors";
import { layout, radius, spacing } from "@hjm/design-contracts/foundations";
import { resolveDescriptionListColumnCount, resolveDescriptionListDescriptor, } from "@hjm/design-contracts/components/description-list";
import { resolveStatisticDescriptor, validateStatisticGroup, } from "@hjm/design-contracts/components/statistic";
import { resolveTagDescriptor, resolveTagPresentation, tagRecipe, } from "@hjm/design-contracts/components/tag";
import { cardRecipe } from "@hjm/design-contracts/components/card";
import { surfaceGeometry } from "@hjm/design-contracts/recipes/base";
import { counterBadgeRecipe, formatCounterBadgeCount, } from "@hjm/design-contracts/recipes";
import { Children, isValidElement, useState } from "react";
import { Image as NativeImage, Pressable, View, useWindowDimensions, } from "react-native";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Surface, Text, } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function resolveStatusTone(tone, theme) {
    if (tone === "neutral") {
        return { foreground: theme.colors.textMuted, background: theme.colors.surfaceAlt };
    }
    if (tone === "danger") {
        return {
            foreground: theme.colors.danger,
            background: withAlpha(theme.colors.danger, 0.1),
        };
    }
    const foreground = theme.palette.statusAccents[tone];
    return { foreground, background: withAlpha(foreground, 0.1) };
}
export function Badge({ label, tone = "neutral", accessibilityLabel, style }) {
    const theme = useHjmNativeTheme();
    const presentation = resolveStatusTone(tone, theme);
    return (_jsx(View, { accessibilityLabel: accessibilityLabel ?? label, style: [
            {
                alignSelf: "flex-start",
                backgroundColor: presentation.background,
                borderRadius: radius.full,
                paddingHorizontal: spacing.xs,
                paddingVertical: spacing.xxs,
            },
            style,
        ], children: _jsx(Text, { align: "center", style: { color: presentation.foreground }, variant: "caption", children: label }) }));
}
export function Tag({ children, label, tone, accessibilityLabel, style, }) {
    const theme = useHjmNativeTheme();
    const resolvedLabel = children ?? label;
    if (resolvedLabel === undefined) {
        throw new TypeError("Tag requires children (or the deprecated label prop)");
    }
    const descriptor = resolveTagDescriptor({
        label: resolvedLabel,
        ...(tone === undefined ? {} : { tone }),
    });
    const presentation = resolveTagPresentation(descriptor.tone, theme.palette);
    return (_jsx(View, { accessibilityLabel: accessibilityLabel ?? descriptor.label, style: [
            {
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: presentation.background,
                borderColor: presentation.border ?? "transparent",
                borderRadius: radius[tagRecipe.radius],
                borderWidth: tagRecipe.borderWidth,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: tagRecipe.size.gap,
                minHeight: tagRecipe.size.minHeight,
                paddingHorizontal: tagRecipe.size.paddingHorizontal,
            },
            style,
        ], children: _jsx(Text, { align: "center", emphasis: "medium", style: { color: presentation.content }, variant: tagRecipe.size.textVariant, children: descriptor.label }) }));
}
export function Card({ children, title, description, media, actions, selected = cardRecipe.defaults.selected, tone = cardRecipe.defaults.tone, bordered = cardRecipe.defaults.bordered, padding = cardRecipe.defaults.padding, style, ...props }) {
    const { environment } = useHjmNativeTheme();
    const bodyPadding = typeof padding === "number" ? padding : surfaceGeometry.paddings[padding];
    return (_jsxs(Surface, { ...props, bordered: bordered, padding: "none", style: [{ overflow: "hidden" }, style], tone: selected ? cardRecipe.selectedTone : tone, children: [media === undefined ? null : _jsx(View, { children: media }), _jsxs(View, { style: { gap: cardRecipe.body.gap, padding: bodyPadding }, children: [title === undefined ? null : (_jsx(Text, { accessibilityRole: "header", emphasis: "strong", tone: "primary", variant: "title", children: title })), description === undefined ? null : (_jsx(Text, { emphasis: "regular", tone: "muted", variant: "body", children: description })), _jsx(View, { children: children })] }), actions === undefined ? null : (_jsx(View, { style: {
                    direction: environment.direction,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: cardRecipe.actions.gap,
                    paddingBottom: cardRecipe.actions.paddingBottom,
                    paddingHorizontal: cardRecipe.actions.paddingHorizontal,
                }, children: actions }))] }));
}
export function ListRow({ title, description, leading, trailing, onPress, accessibilityLabel, accessibilityHint, disabled = false, style, ...props }) {
    const { colors, environment } = useHjmNativeTheme();
    const interactive = onPress !== undefined;
    return (_jsxs(Pressable, { ...props, accessibilityHint: accessibilityHint, accessibilityLabel: interactive ? accessibilityLabel ?? [title, description].filter(Boolean).join(", ") : undefined, accessibilityRole: interactive ? "button" : undefined, accessibilityState: interactive ? { disabled } : undefined, disabled: !interactive || disabled, onPress: onPress, style: ({ pressed }) => [
            minimumTargetStyle,
            {
                alignItems: "center",
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
                direction: environment.direction,
                flexDirection: "row",
                gap: spacing.sm,
                minHeight: description ? layout.rowHeight.twoLine : layout.rowHeight.singleLine,
                opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
            },
            style,
        ], children: [leading ? _jsx(View, { accessible: false, children: leading }) : null, _jsxs(View, { style: { flex: 1, gap: spacing.xxs }, children: [_jsx(Text, { tone: "primary", variant: "bodyLarge", children: title }), description ? _jsx(Text, { tone: "muted", variant: "caption", children: description }) : null] }), trailing ? _jsx(View, { accessible: false, children: trailing }) : null] }));
}
function resolveInitials(name, provided) {
    if (provided?.trim())
        return provided.trim().slice(0, 3).toLocaleUpperCase();
    const parts = name.trim().split(/\s+/u).filter(Boolean);
    if (parts.length === 0)
        throw new TypeError("Avatar name must not be empty");
    return `${parts[0][0] ?? ""}${parts.length > 1 ? parts.at(-1)[0] ?? "" : ""}`
        .toLocaleUpperCase();
}
export function Avatar({ source, name, initials, size = 44, decorative = false, accessibilityLabel, style, imageStyle, }) {
    if (!Number.isFinite(size) || size < 24)
        throw new RangeError("Avatar size must be at least 24");
    const { colors } = useHjmNativeTheme();
    const [failed, setFailed] = useState(false);
    const fallback = resolveInitials(name, initials);
    const mediaAccessibility = decorative
        ? { accessible: false }
        : { accessible: true, accessibilityLabel, accessibilityRole: "image" };
    return (_jsx(View, { ...mediaAccessibility, style: [
            {
                alignItems: "center",
                backgroundColor: colors.surfaceAccent,
                borderRadius: radius.full,
                height: size,
                justifyContent: "center",
                overflow: "hidden",
                width: size,
            },
            style,
        ], children: source !== undefined && !failed ? (_jsx(NativeImage, { accessible: false, onError: () => setFailed(true), source: source, style: [{ height: size, width: size }, imageStyle] })) : (_jsx(Text, { align: "center", style: { color: colors.contentBrand }, variant: "label", children: fallback })) }));
}
export function Divider({ orientation = "horizontal", inset = 0, style }) {
    if (!Number.isFinite(inset) || inset < 0)
        throw new RangeError("Divider inset must be non-negative");
    const { colors } = useHjmNativeTheme();
    return (_jsx(View, { accessible: false, style: [
            orientation === "horizontal"
                ? { backgroundColor: colors.border, height: 1, marginHorizontal: inset, width: "auto" }
                : { alignSelf: "stretch", backgroundColor: colors.border, marginVertical: inset, width: 1 },
            style,
        ] }));
}
export function Accordion({ label, items, expandedValues, defaultExpandedValues = [], onExpandedValuesChange, multiple = false, style, }) {
    if (items.length === 0)
        throw new Error("Accordion requires at least one item");
    const itemValues = new Set(items.map((item) => item.value));
    if (itemValues.size !== items.length)
        throw new TypeError("Accordion values must be unique");
    const initial = expandedValues ?? defaultExpandedValues;
    if (initial.some((value) => !itemValues.has(value))) {
        throw new RangeError("Accordion expanded values must match items");
    }
    if (!multiple && initial.length > 1) {
        throw new RangeError("Accordion only accepts one expanded value unless multiple is true");
    }
    const { colors, environment } = useHjmNativeTheme();
    const [expanded, setExpanded] = useControllableState({
        ...(expandedValues === undefined ? {} : { value: expandedValues }),
        defaultValue: defaultExpandedValues,
        ...(onExpandedValuesChange === undefined ? {} : { onChange: onExpandedValuesChange }),
    });
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "list", style: [{ gap: spacing.xxs }, style], children: items.map((item) => {
            const isExpanded = expanded.includes(item.value);
            return (_jsxs(View, { style: { borderBottomColor: colors.border, borderBottomWidth: 1 }, children: [_jsxs(Pressable, { accessibilityHint: item.accessibilityHint, accessibilityLabel: item.title, accessibilityRole: "button", accessibilityState: { disabled: item.disabled === true, expanded: isExpanded }, disabled: item.disabled, onPress: () => {
                            if (isExpanded) {
                                setExpanded(expanded.filter((value) => value !== item.value));
                            }
                            else {
                                setExpanded(multiple ? [...expanded, item.value] : [item.value]);
                            }
                        }, style: ({ pressed }) => [
                            minimumTargetStyle,
                            {
                                alignItems: "center",
                                direction: environment.direction,
                                flexDirection: "row",
                                gap: spacing.sm,
                                opacity: item.disabled ? 0.5 : pressed ? 0.86 : 1,
                                paddingVertical: spacing.sm,
                            },
                        ], children: [_jsxs(View, { style: { flex: 1, gap: spacing.xxs }, children: [_jsx(Text, { tone: "primary", variant: "bodyLarge", children: item.title }), item.description ? _jsx(Text, { tone: "muted", variant: "caption", children: item.description }) : null] }), _jsx(Text, { accessible: false, tone: "muted", children: isExpanded ? "−" : "+" })] }), isExpanded ? (_jsx(View, { accessibilityLabel: item.contentAccessibilityLabel, style: { paddingBottom: spacing.md }, children: item.content })) : null] }, item.value));
        }) }));
}
export function DescriptionList({ label, descriptor, availableWidth, style, itemStyle, }) {
    const resolved = resolveDescriptionListDescriptor(descriptor);
    const { width } = useWindowDimensions();
    const { environment } = useHjmNativeTheme();
    const innerWidth = availableWidth ?? width;
    if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
        throw new RangeError("DescriptionList availableWidth must be positive");
    }
    const columns = resolveDescriptionListColumnCount(innerWidth, resolved.columns, environment.textScale);
    const itemWidth = (innerWidth - spacing.sm * (columns - 1)) / columns;
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "list", style: [
            {
                direction: environment.direction,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.sm,
            },
            style,
        ], children: resolved.items.map((item) => (_jsxs(View, { accessibilityLabel: `${item.label}, ${item.value}`, accessible: true, style: [{ gap: spacing.xxs, width: itemWidth }, itemStyle], children: [_jsx(Text, { accessible: false, tone: "muted", variant: "label", children: item.label }), _jsx(Text, { accessible: false, tone: "primary", children: item.value })] }, item.id))) }));
}
/** Native image with an explicit decorative/label contract and error fallback. */
export function Image({ source, fallback, decorative = false, accessibilityLabel, onError, style, containerStyle, ...props }) {
    const { colors } = useHjmNativeTheme();
    const [failed, setFailed] = useState(false);
    if (failed && fallback) {
        return (_jsx(View, { ...(decorative
                ? { accessible: false }
                : { accessible: true, accessibilityLabel, accessibilityRole: "image" }), style: [{ alignItems: "center", backgroundColor: colors.surfaceAlt, justifyContent: "center" }, containerStyle], children: fallback }));
    }
    return (_jsx(NativeImage, { ...props, ...(decorative
            ? { accessible: false }
            : { accessible: true, accessibilityLabel, accessibilityRole: "image" }), onError: (event) => {
            setFailed(true);
            onError?.(event);
        }, source: source, style: style }));
}
export function CounterBadge({ count, accessibilityLabel, max = counterBadgeRecipe.defaults.max, tone = counterBadgeRecipe.defaults.tone, size = counterBadgeRecipe.defaults.size, variant = counterBadgeRecipe.defaults.variant, style, }) {
    if (!accessibilityLabel.trim())
        throw new TypeError("CounterBadge accessibilityLabel must not be empty");
    const visibleLabel = formatCounterBadgeCount(count, max);
    if (visibleLabel === null)
        return null;
    const { colors } = useHjmNativeTheme();
    const presentation = {
        danger: { background: colors.dangerFill, content: colors.onDanger },
        brand: { background: colors.primary, content: colors.onPrimary },
        neutral: { background: colors.textBody, content: colors.bg },
    };
    const metrics = counterBadgeRecipe.sizes[size];
    return (_jsx(View, { accessibilityLabel: accessibilityLabel, accessibilityRole: "text", accessible: true, style: [
            {
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: presentation[tone].background,
                borderColor: variant === "floating" ? colors.bg : "transparent",
                borderRadius: radius.full,
                borderWidth: variant === "floating" ? 2 : 0,
                justifyContent: "center",
                minHeight: metrics.height,
                minWidth: metrics.minWidth,
                paddingHorizontal: metrics.paddingHorizontal,
            },
            style,
        ], children: _jsx(Text, { accessible: false, align: "center", style: { color: presentation[tone].content, fontWeight: "700" }, variant: "caption", children: visibleLabel }) }));
}
/** Semantic list container that owns separator rhythm around composed rows. */
export function List({ label, children, separator = "indented", style, }) {
    const { colors, environment } = useHjmNativeTheme();
    const items = Children.toArray(children);
    const inset = separator === "indented" ? 52 : 0;
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "list", style: style, children: items.map((item, index) => (_jsxs(View, { children: [item, separator !== "none" && index < items.length - 1 ? (_jsx(View, { accessible: false, style: {
                        backgroundColor: colors.border,
                        height: 1,
                        marginEnd: 0,
                        marginStart: environment.direction === "rtl" && separator === "indented" ? 0 : inset,
                        ...(environment.direction === "rtl" && separator === "indented" ? { marginEnd: inset } : {}),
                    } })) : null] }, isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`))) }));
}
function statisticTrendColor(tone, theme) {
    if (tone === "success")
        return theme.palette.statusAccents.success;
    if (tone === "warning")
        return theme.palette.statusAccents.warning;
    if (tone === "danger")
        return theme.colors.danger;
    return theme.colors.textMuted;
}
export function Statistic({ descriptor, density = "comfortable", presentation = "plain", style, }) {
    const resolved = resolveStatisticDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const compact = density === "compact";
    const valueCopy = `${resolved.prefix ?? ""}${resolved.value}${resolved.suffix ?? ""}`;
    const announcement = [resolved.label, valueCopy, resolved.trend?.label, resolved.hint]
        .filter(Boolean)
        .join(", ");
    const trendMark = resolved.trend?.direction === "up" ? "↑" : resolved.trend?.direction === "down" ? "↓" : "—";
    return (_jsxs(View, { accessibilityLabel: announcement, accessible: true, style: [
            {
                backgroundColor: presentation === "surface" ? theme.colors.surface : "transparent",
                borderColor: presentation === "surface" ? theme.colors.border : "transparent",
                borderRadius: radius.md,
                borderWidth: presentation === "surface" ? 1 : 0,
                gap: compact ? spacing.xxs : spacing.xs,
                padding: compact ? spacing.sm : spacing.md,
            },
            style,
        ], children: [_jsx(Text, { accessible: false, tone: "muted", variant: compact ? "caption" : "label", children: resolved.label }), _jsxs(View, { accessible: false, style: {
                    alignItems: "baseline",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    gap: spacing.xxs,
                }, children: [resolved.prefix ? _jsx(Text, { tone: "muted", children: resolved.prefix }) : null, _jsx(Text, { tone: "primary", variant: compact ? "title" : "heading", children: resolved.value }), resolved.suffix ? _jsx(Text, { tone: "muted", children: resolved.suffix }) : null] }), resolved.trend ? (_jsxs(Text, { accessible: false, style: { color: statisticTrendColor(resolved.trend.tone, theme) }, variant: "caption", children: [trendMark, " ", resolved.trend.label] })) : null, resolved.hint ? _jsx(Text, { accessible: false, tone: "muted", variant: "caption", children: resolved.hint }) : null] }));
}
export function StatisticGroup({ label, descriptor, availableWidth, density, presentation, style, }) {
    validateStatisticGroup(descriptor);
    const { width } = useWindowDimensions();
    const { environment } = useHjmNativeTheme();
    const innerWidth = availableWidth ?? width;
    if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
        throw new RangeError("StatisticGroup availableWidth must be positive");
    }
    const requested = descriptor.columns ?? 3;
    const minItemWidth = 120 * Math.max(1, environment.textScale);
    let columns = requested;
    while (columns > 1 && (innerWidth - spacing.xs * (columns - 1)) / columns < minItemWidth) {
        columns -= 1;
    }
    const itemWidth = (innerWidth - spacing.xs * (columns - 1)) / columns;
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "list", style: [
            {
                direction: environment.direction,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.xs,
            },
            style,
        ], children: descriptor.items.map((item) => (_jsx(Statistic, { descriptor: item, ...(density === undefined ? {} : { density }), ...(presentation === undefined ? {} : { presentation }), style: { width: itemWidth } }, item.id))) }));
}
//# sourceMappingURL=data-display.js.map