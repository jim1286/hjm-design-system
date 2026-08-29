import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import { resolveDescriptionListColumnCount, resolveDescriptionListDescriptor, } from "@hjmds/design-contracts/components/description-list";
import { resolveStatisticDescriptor, validateStatisticGroup, } from "@hjmds/design-contracts/components/statistic";
import { resolveTagDescriptor, resolveTagPresentation, tagRecipe, } from "@hjmds/design-contracts/components/tag";
import { cardRecipe } from "@hjmds/design-contracts/components/card";
import { imageRecipe, nativeResizeModes, resolveImageAspectRatio, resolveImageDescriptor, resolveImageFallbackAccessibilityLabel, } from "@hjmds/design-contracts/components/image";
import { resolveTimelineDescriptor, timelineRecipe, } from "@hjmds/design-contracts/components/timeline";
import { surfaceGeometry } from "@hjmds/design-contracts/recipes/base";
import { accordionRecipe, counterBadgeRecipe, badgeRecipe, listRecipe, formatCounterBadgeCount, listRowRecipe, statisticRecipe, } from "@hjmds/design-contracts/recipes";
import { Children, isValidElement, useEffect, useMemo, useState, } from "react";
import { Image as NativeImage, LayoutAnimation, Pressable, StyleSheet, View, useWindowDimensions, } from "react-native";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Surface, Text, } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Badge({ label, tone = badgeRecipe.defaults.tone, size = badgeRecipe.defaults.size, variant = badgeRecipe.defaults.variant, leading, accessibilityLabel, style, labelStyle, ...props }) {
    const theme = useHjmNativeTheme();
    const presentation = badgeRecipe.tones[tone];
    const metrics = badgeRecipe.sizes[size];
    const variantPresentation = badgeRecipe.variants[variant];
    const outlined = !variantPresentation.usesToneBackground;
    const borderColor = presentation.border
        ? resolveColorReference(presentation.border, theme.palette)
        : variantPresentation.borderFallback === null
            ? "transparent"
            : resolveColorReference(variantPresentation.borderFallback, theme.palette);
    return (_jsxs(View, { ...props, accessibilityLabel: accessibilityLabel ?? String(label), accessible: true, style: [
            {
                alignSelf: "flex-start",
                alignItems: "center",
                backgroundColor: outlined
                    ? "transparent"
                    : resolveColorReference(presentation.background, theme.palette),
                borderColor,
                borderRadius: radius[badgeRecipe.radius],
                borderWidth: presentation.border || variantPresentation.borderFallback
                    ? badgeRecipe.borderWidth
                    : 0,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: metrics.gap,
                justifyContent: "center",
                minHeight: metrics.minHeight,
                paddingHorizontal: metrics.paddingHorizontal,
            },
            style,
        ], children: [leading === undefined ? null : (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })), _jsx(Text, { accessible: false, align: "center", emphasis: "strong", style: [
                    {
                        color: resolveColorReference(outlined ? presentation.outlineContent : presentation.content, theme.palette),
                    },
                    labelStyle,
                ], variant: metrics.textVariant, children: label })] }));
}
export function Tag({ children, label, tone, accessibilityLabel, style, labelStyle, ...props }) {
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
    return (_jsx(View, { ...props, accessibilityLabel: accessibilityLabel ?? descriptor.label, accessible: true, style: [
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
        ], children: _jsx(Text, { align: "center", emphasis: "medium", style: [{ color: presentation.content }, labelStyle], variant: tagRecipe.size.textVariant, children: descriptor.label }) }));
}
export function Card({ children, title, description, leading, media, actions, selected = cardRecipe.defaults.selected, tone = cardRecipe.defaults.tone, bordered = cardRecipe.defaults.bordered, padding = cardRecipe.defaults.padding, style, ...props }) {
    const { environment } = useHjmNativeTheme();
    const bodyPadding = typeof padding === "number" ? padding : surfaceGeometry.paddings[padding];
    const hasHeader = leading !== undefined || title !== undefined || description !== undefined;
    return (_jsxs(Surface, { ...props, bordered: bordered, padding: "none", style: [{ overflow: "hidden" }, style], tone: selected ? cardRecipe.selectedTone : tone, children: [media === undefined ? null : _jsx(View, { children: media }), _jsxs(View, { style: { gap: cardRecipe.body.gap, padding: bodyPadding }, children: [hasHeader ? (_jsxs(View, { style: {
                            alignItems: "flex-start",
                            direction: environment.direction,
                            flexDirection: "row",
                            gap: cardRecipe.header.gap,
                        }, children: [leading === undefined ? null : (_jsx(View, { style: { flexShrink: 0 }, children: leading })), _jsxs(View, { style: { flex: 1, gap: cardRecipe.body.gap, minWidth: 0 }, children: [title === undefined ? null : (_jsx(Text, { accessibilityRole: "header", emphasis: "strong", tone: "primary", variant: "title", children: title })), description === undefined ? null : (_jsx(Text, { emphasis: "regular", tone: "muted", variant: "body", children: description }))] })] })) : null, children === undefined ? null : _jsx(View, { children: children })] }), actions === undefined ? null : (_jsx(View, { style: {
                    direction: environment.direction,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: cardRecipe.actions.gap,
                    paddingBottom: cardRecipe.actions.paddingBottom,
                    paddingHorizontal: cardRecipe.actions.paddingHorizontal,
                }, children: actions }))] }));
}
export function ListRow({ title, description, leading, trailing, titleMetadata, badge, trailingAction, trailingText, metadataLabel, trailingLabel, onPress, accessibilityLabel, accessibilityHint, disabled = false, density = listRowRecipe.defaults.density, selected: selectedProp, style, leadingStyle, contentStyle, titleStyle, titleRowStyle, descriptionStyle, trailingStyle, trailingActionStyle, containerProps, accessibilityState, ...props }) {
    const theme = useHjmNativeTheme();
    const metrics = listRowRecipe.density[density];
    const interactive = onPress !== undefined;
    const selected = selectedProp ?? listRowRecipe.defaults.selected;
    const resolvedMetadata = titleMetadata ?? badge;
    const resolvedTrailingLabel = trailingLabel ?? trailingText;
    const composedLabel = accessibilityLabel ?? [
        title,
        metadataLabel,
        description,
        resolvedTrailingLabel,
    ].filter(Boolean).join(", ");
    const visualState = {
        backgroundColor: selected
            ? resolveColorReference(listRowRecipe.states.selectedBackground, theme.palette)
            : "transparent",
        direction: theme.environment.direction,
        minHeight: description ? metrics.twoLineMinHeight : metrics.oneLineMinHeight,
        opacity: disabled ? listRowRecipe.states.disabledOpacity : 1,
    };
    const rowContent = (_jsxs(_Fragment, { children: [leading ? (_jsx(View, { accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", style: leadingStyle, children: leading })) : null, _jsxs(View, { style: [{ flex: 1, gap: spacing.xxs, minWidth: 0 }, contentStyle], children: [_jsxs(View, { style: [
                            {
                                alignItems: "center",
                                direction: theme.environment.direction,
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: spacing.xxs,
                            },
                            titleRowStyle,
                        ], children: [_jsx(Text, { style: [
                                    {
                                        color: resolveColorReference(listRowRecipe.title.color, theme.palette),
                                        flexShrink: 1,
                                        fontWeight: listRowRecipe.title.fontWeight,
                                    },
                                    titleStyle,
                                ], variant: listRowRecipe.title.textVariant, children: title }), resolvedMetadata === undefined ? null : (_jsx(View, { accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", children: resolvedMetadata }))] }), description ? (_jsx(Text, { style: [
                            { color: resolveColorReference(listRowRecipe.description.color, theme.palette) },
                            descriptionStyle,
                        ], variant: listRowRecipe.description.textVariant, children: description })) : null] }), trailingText || trailing ? (_jsx(View, { accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", style: [{ flexShrink: 0 }, trailingStyle], children: trailingText ? (_jsx(Text, { style: { color: resolveColorReference(listRowRecipe.trailing.textColor, theme.palette) }, variant: listRowRecipe.trailing.textVariant, children: trailingText })) : trailing })) : null] }));
    const contentStyleFor = (pressed) => [
        minimumTargetStyle,
        {
            alignItems: "center",
            backgroundColor: pressed
                ? resolveColorReference(listRowRecipe.states.pressedBackground, theme.palette)
                : trailingAction
                    ? "transparent"
                    : visualState.backgroundColor,
            direction: visualState.direction,
            flex: trailingAction ? 1 : undefined,
            flexDirection: "row",
            gap: listRowRecipe.gap,
            minHeight: visualState.minHeight,
            opacity: trailingAction ? 1 : visualState.opacity,
            ...(trailingAction
                ? { paddingStart: metrics.paddingHorizontal }
                : { paddingHorizontal: metrics.paddingHorizontal }),
            paddingVertical: metrics.paddingVertical,
        },
        trailingAction ? undefined : style,
    ];
    const main = interactive ? (_jsx(Pressable, { ...props, accessibilityHint: accessibilityHint, accessibilityLabel: composedLabel, accessibilityRole: "button", accessibilityState: {
            ...accessibilityState,
            disabled,
            ...(selectedProp === undefined ? {} : { selected: selectedProp }),
        }, disabled: disabled, onPress: onPress, style: ({ pressed }) => contentStyleFor(pressed), children: rowContent })) : (_jsx(View, { ...props, accessibilityHint: accessibilityHint, accessibilityLabel: accessibilityLabel, accessible: accessibilityLabel === undefined ? undefined : true, style: contentStyleFor(false), children: rowContent }));
    if (trailingAction === undefined || trailingAction === null)
        return main;
    return (_jsxs(View, { ...containerProps, style: [
            {
                alignItems: "center",
                backgroundColor: visualState.backgroundColor,
                direction: visualState.direction,
                flexDirection: "row",
                minHeight: visualState.minHeight,
                opacity: visualState.opacity,
            },
            style,
        ], children: [main, _jsx(View, { style: [
                    { flexShrink: 0, paddingEnd: metrics.paddingHorizontal },
                    trailingActionStyle,
                ], children: trailingAction })] }));
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
export function Accordion({ label, items, expandedValues, defaultExpandedValues = [], onExpandedValuesChange, multiple = accordionRecipe.defaults.allowsMultipleExpanded, density = accordionRecipe.defaults.density, renderIndicator, style, itemStyle, triggerStyle, titleStyle, indicatorStyle, panelStyle, }) {
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
    const theme = useHjmNativeTheme();
    const metrics = accordionRecipe.density[density];
    const indicatorColor = resolveColorReference(accordionRecipe.indicator.color, theme.palette);
    const [expanded, setExpanded] = useControllableState({
        ...(expandedValues === undefined ? {} : { value: expandedValues }),
        defaultValue: defaultExpandedValues,
        ...(onExpandedValuesChange === undefined ? {} : { onChange: onExpandedValuesChange }),
    });
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "list", style: style, children: items.map((item) => {
            const isExpanded = expanded.includes(item.value);
            return (_jsxs(View, { style: [
                    {
                        borderBottomColor: resolveColorReference(accordionRecipe.divider, theme.palette),
                        borderBottomWidth: 1,
                    },
                    itemStyle,
                ], children: [_jsxs(Pressable, { accessibilityHint: item.accessibilityHint, accessibilityLabel: item.accessibilityLabel ?? item.title, accessibilityRole: "button", accessibilityState: { disabled: item.disabled === true, expanded: isExpanded }, disabled: item.disabled, onPress: () => {
                            if (!theme.environment.reducedMotion) {
                                LayoutAnimation.configureNext({
                                    duration: accordionRecipe.transition.duration,
                                    update: { type: LayoutAnimation.Types.easeInEaseOut },
                                });
                            }
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
                                backgroundColor: pressed
                                    ? resolveColorReference(accordionRecipe.states.pressedBackground, theme.palette)
                                    : "transparent",
                                direction: theme.environment.direction,
                                flexDirection: "row",
                                gap: accordionRecipe.gap,
                                minHeight: metrics.triggerMinHeight,
                                opacity: item.disabled
                                    ? accordionRecipe.states.disabledOpacity
                                    : 1,
                                paddingHorizontal: accordionRecipe.paddingHorizontal,
                                paddingVertical: metrics.paddingVertical,
                            },
                            triggerStyle,
                        ], children: [_jsxs(View, { style: { flex: 1, gap: spacing.xxs }, children: [_jsx(Text, { style: [
                                            {
                                                color: resolveColorReference(accordionRecipe.title.color, theme.palette),
                                                fontWeight: accordionRecipe.title.fontWeight,
                                            },
                                            titleStyle,
                                        ], variant: accordionRecipe.title.textVariant, children: item.title }), item.description ? _jsx(Text, { tone: "muted", variant: "caption", children: item.description }) : null] }), _jsx(View, { accessible: false, style: indicatorStyle, children: renderIndicator ? (renderIndicator({
                                    value: item.value,
                                    expanded: isExpanded,
                                    disabled: item.disabled === true,
                                    color: indicatorColor,
                                    size: glyph[accordionRecipe.indicator.glyph],
                                })) : (_jsx(Text, { style: { color: indicatorColor }, children: isExpanded ? "−" : "+" })) })] }), isExpanded ? (_jsx(View, { accessibilityLabel: item.contentAccessibilityLabel, style: [
                            {
                                paddingBottom: accordionRecipe.panel.paddingBottom,
                                paddingStart: accordionRecipe.panel.paddingInlineStart,
                            },
                            panelStyle,
                        ], children: item.content })) : null] }, item.value));
        }) }));
}
export function DescriptionList({ label, descriptor, availableWidth, style, itemStyle, onLayout, ...props }) {
    const resolved = resolveDescriptionListDescriptor(descriptor);
    const { width: windowWidth } = useWindowDimensions();
    const { environment } = useHjmNativeTheme();
    const [measuredWidth, setMeasuredWidth] = useState(null);
    const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
    if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
        throw new RangeError("DescriptionList availableWidth must be positive");
    }
    const columns = resolveDescriptionListColumnCount(innerWidth, resolved.columns, environment.textScale);
    const itemWidth = (innerWidth - spacing.sm * (columns - 1)) / columns;
    const handleLayout = (event) => {
        onLayout?.(event);
        if (availableWidth !== undefined)
            return;
        const nextWidth = event.nativeEvent.layout.width;
        if (Number.isFinite(nextWidth) && nextWidth > 0) {
            setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
        }
    };
    return (_jsx(View, { ...props, accessibilityLabel: label, accessibilityRole: "list", onLayout: handleLayout, style: [
            {
                direction: environment.direction,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.sm,
            },
            style,
        ], children: resolved.items.map((item) => (_jsxs(View, { accessibilityLabel: `${item.label}, ${item.value}`, accessible: true, style: [{ gap: spacing.xxs, width: itemWidth }, itemStyle], children: [_jsx(Text, { accessible: false, tone: "muted", variant: "label", children: item.label }), _jsx(Text, { accessible: false, tone: "primary", children: item.value })] }, item.id))) }));
}
function resolveLegacyImageSourceKey(source) {
    if (typeof source === "number")
        return `asset:${source}`;
    try {
        return `source:${JSON.stringify(source)}`;
    }
    catch {
        return `source:${String(source)}`;
    }
}
function resolveLegacyMedia(decorative, accessibilityLabel) {
    const resolvedDecorative = decorative ?? accessibilityLabel === undefined;
    if (resolvedDecorative) {
        if (accessibilityLabel !== undefined) {
            throw new TypeError("Decorative Image must not provide accessibilityLabel");
        }
        return { decorative: true };
    }
    if (accessibilityLabel === undefined || accessibilityLabel.trim().length === 0) {
        throw new TypeError("Informative Image accessibilityLabel must not be empty");
    }
    return { decorative: false, accessibilityLabel };
}
/** Intrinsic-size Native image with canonical fit, accessibility, and fallback semantics. */
export function Image(imageProps) {
    const { source: legacySource, src, width, height, fit, decorative, accessibilityLabel, sourceAdapter, fallback, onError, onLoad, onLoadStatusChange, renderImage, resizeMode, style, containerStyle, ...nativeProps } = imageProps;
    const theme = useHjmNativeTheme();
    if (src !== undefined && legacySource !== undefined) {
        throw new TypeError("Image accepts either canonical src or legacy source, not both");
    }
    if (src === undefined && legacySource === undefined) {
        throw new TypeError("Image requires src or legacy source");
    }
    const descriptor = src === undefined
        ? undefined
        : resolveImageDescriptor({
            src,
            width: width,
            height: height,
            ...(fit === undefined ? {} : { fit }),
            ...(decorative === undefined ? {} : { decorative }),
            ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
        });
    const legacyMedia = descriptor === undefined
        ? resolveLegacyMedia(decorative, accessibilityLabel)
        : undefined;
    const resolvedDecorative = descriptor?.decorative ?? legacyMedia.decorative;
    const resolvedAccessibilityLabel = descriptor?.decorative === false
        ? descriptor.accessibilityLabel
        : legacyMedia?.accessibilityLabel;
    const resolvedFit = descriptor?.fit ?? fit;
    const resolvedResizeMode = descriptor === undefined
        ? resizeMode ?? (resolvedFit === undefined ? undefined : nativeResizeModes[resolvedFit])
        : nativeResizeModes[descriptor.fit];
    const sourceKey = descriptor === undefined
        ? resolveLegacyImageSourceKey(legacySource)
        : `src:${descriptor.src}`;
    const source = useMemo(() => descriptor === undefined
        ? legacySource
        : sourceAdapter?.(descriptor) ?? { uri: descriptor.src }, [
        descriptor?.accessibilityLabel,
        descriptor?.decorative,
        descriptor?.fit,
        descriptor?.height,
        descriptor?.src,
        descriptor?.width,
        legacySource,
        sourceAdapter,
    ]);
    const [state, setState] = useState({ sourceKey, status: "loading" });
    const status = state.sourceKey === sourceKey ? state.status : "loading";
    useEffect(() => {
        setState((current) => current.sourceKey === sourceKey
            ? current
            : { sourceKey, status: "loading" });
    }, [sourceKey]);
    const reportLoad = (event) => {
        setState((current) => current.sourceKey === sourceKey
            ? { sourceKey, status: "loaded" }
            : current);
        onLoadStatusChange?.("loaded");
        onLoad?.(event);
    };
    const reportError = (event) => {
        setState((current) => current.sourceKey === sourceKey
            ? { sourceKey, status: "error" }
            : current);
        onLoadStatusChange?.("error");
        onError?.(event);
    };
    const handleLoad = reportLoad;
    const handleError = reportError;
    const assetStyle = descriptor === undefined
        ? style
        : [StyleSheet.absoluteFill, style];
    const adapterBase = {
        source,
        accessible: !resolvedDecorative,
        ...(!resolvedDecorative && resolvedAccessibilityLabel !== undefined
            ? {
                accessibilityRole: "image",
                accessibilityLabel: resolvedAccessibilityLabel,
            }
            : {}),
        onError: handleError,
        onLoad: handleLoad,
        reportError,
        reportLoad,
        ...(resolvedResizeMode === undefined ? {} : { resizeMode: resolvedResizeMode }),
        status: status === "loaded" ? "loaded" : "loading",
        ...(assetStyle === undefined ? {} : { style: assetStyle }),
        nativeProps: {
            ...nativeProps,
            ...(descriptor === undefined && width !== undefined ? { width } : {}),
            ...(descriptor === undefined && height !== undefined ? { height } : {}),
            ...(resolvedResizeMode === undefined ? {} : { resizeMode: resolvedResizeMode }),
        },
    };
    const placeholderBackground = resolveColorReference(imageRecipe.placeholder.background, theme.palette);
    const fallbackLabel = descriptor === undefined
        ? resolvedAccessibilityLabel
        : resolveImageFallbackAccessibilityLabel(descriptor);
    let visual;
    if (status === "error") {
        visual = (_jsx(View, { ...(resolvedDecorative
                ? {
                    accessibilityElementsHidden: true,
                    accessible: false,
                    importantForAccessibility: "no-hide-descendants",
                }
                : {
                    accessible: true,
                    accessibilityLabel: fallbackLabel,
                    accessibilityRole: "image",
                }), style: StyleSheet.absoluteFill, children: _jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: styles.imageFallbackContent, children: fallback ?? (_jsx(View, { accessible: false, style: [
                        styles.imageFallbackIcon,
                        { borderColor: theme.colors.textMuted },
                    ], children: _jsx(Text, { accessible: false, emphasis: "strong", style: { color: theme.colors.textMuted }, variant: "label", children: "!" }) })) }) }));
    }
    else if (renderImage === undefined) {
        visual = (_jsx(NativeImage, { ...adapterBase.nativeProps, ...(resolvedDecorative
                ? { accessible: false }
                : {
                    accessible: true,
                    accessibilityLabel: resolvedAccessibilityLabel,
                    accessibilityRole: "image",
                }), onError: handleError, onLoad: handleLoad, resizeMode: resolvedResizeMode, source: source, style: assetStyle }));
    }
    else if (descriptor === undefined) {
        visual = renderImage({
            ...adapterBase,
            ...(resolvedFit === undefined ? {} : { fit: resolvedFit }),
            ...(width === undefined ? {} : { width }),
            ...(height === undefined ? {} : { height }),
            legacySource: true,
        });
    }
    else {
        visual = renderImage({
            ...adapterBase,
            descriptor,
            src: descriptor.src,
            width: descriptor.width,
            height: descriptor.height,
            fit: descriptor.fit,
            legacySource: false,
        });
    }
    return (_jsx(View, { style: [
            {
                alignItems: "center",
                backgroundColor: placeholderBackground,
                borderRadius: radius[imageRecipe.radius],
                justifyContent: "center",
                overflow: "hidden",
                ...(descriptor === undefined
                    ? {}
                    : {
                        aspectRatio: resolveImageAspectRatio(descriptor.width, descriptor.height),
                        width: descriptor.width,
                    }),
            },
            containerStyle,
        ], children: visual }));
}
const styles = StyleSheet.create({
    imageFallbackContent: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    imageFallbackIcon: {
        alignItems: "center",
        borderRadius: radius.full,
        borderWidth: 2,
        height: glyph.lg,
        justifyContent: "center",
        width: glyph.lg,
    },
});
export function CounterBadge({ count, accessibilityLabel, max = counterBadgeRecipe.defaults.max, tone = counterBadgeRecipe.defaults.tone, size = counterBadgeRecipe.defaults.size, variant = counterBadgeRecipe.defaults.variant, style, }) {
    if (accessibilityLabel !== undefined && !accessibilityLabel.trim()) {
        throw new TypeError("CounterBadge accessibilityLabel must not be empty");
    }
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
    return (_jsx(View, { accessibilityLabel: accessibilityLabel, accessibilityRole: accessibilityLabel === undefined ? undefined : "text", accessible: accessibilityLabel !== undefined, importantForAccessibility: accessibilityLabel === undefined ? "no-hide-descendants" : "yes", style: [
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
export function List({ label, children, separator = listRecipe.defaults.separator, appearance = "plain", style, ...props }) {
    const { colors, environment } = useHjmNativeTheme();
    const items = Children.toArray(children);
    const separatorContract = listRecipe.separators[separator];
    if (!label.trim())
        throw new TypeError("List label must not be empty");
    return (_jsx(View, { ...props, accessibilityLabel: label, accessibilityRole: "list", style: [
            {
                direction: environment.direction,
                ...(appearance === "grouped"
                    ? {
                        backgroundColor: colors.surface,
                        borderRadius: radius.lg,
                        overflow: "hidden",
                    }
                    : {}),
            },
            style,
        ], children: items.map((item, index) => (_jsxs(View, { children: [item, separatorContract && index < items.length - 1 ? (_jsx(View, { accessible: false, style: {
                        backgroundColor: colors.border,
                        height: 1,
                        marginEnd: separatorContract.insetEnd,
                        marginStart: separatorContract.insetStart,
                    } })) : null] }, isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`))) }));
}
export function Statistic({ descriptor, density = "comfortable", presentation = "plain", contextLabel, accessibilityLabel, composeAccessibilityLabel, renderTrendMark, style, labelStyle, valueStyle, affixStyle, trendStyle, hintStyle, }) {
    const resolved = resolveStatisticDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const densityContract = statisticRecipe.density[density];
    const presentationContract = statisticRecipe.presentations[presentation];
    const valueCopy = `${resolved.prefix ?? ""}${resolved.value}${resolved.suffix ?? ""}`;
    if (contextLabel !== undefined && !contextLabel.trim()) {
        throw new TypeError("Statistic contextLabel must not be empty");
    }
    const announcement = accessibilityLabel ?? composeAccessibilityLabel?.({
        ...(contextLabel === undefined ? {} : { contextLabel }),
        descriptor: resolved,
        valueText: valueCopy,
    }) ?? [contextLabel, resolved.label, valueCopy, resolved.trend?.label, resolved.hint]
        .filter(Boolean)
        .join(", ");
    if (!announcement.trim()) {
        throw new TypeError("Statistic accessibility label must not be empty");
    }
    const trendMark = resolved.trend
        ? statisticRecipe.trend.marks[resolved.trend.direction]
        : undefined;
    const trendColor = resolved.trend
        ? resolveColorReference(statisticRecipe.trend.tones[resolved.trend.tone], theme.palette)
        : undefined;
    return (_jsxs(View, { accessibilityLabel: announcement, accessible: true, style: [
            {
                backgroundColor: presentationContract.background
                    ? resolveColorReference(presentationContract.background, theme.palette)
                    : "transparent",
                borderColor: presentationContract.border
                    ? resolveColorReference(presentationContract.border, theme.palette)
                    : "transparent",
                borderRadius: radius[presentationContract.radius],
                borderWidth: presentationContract.borderWidth,
                gap: densityContract.gap,
                minWidth: 0,
                padding: densityContract.padding,
            },
            style,
        ], children: [_jsx(Text, { accessible: false, style: [
                    {
                        color: resolveColorReference(statisticRecipe.label.color, theme.palette),
                        fontWeight: statisticRecipe.label.fontWeight,
                    },
                    labelStyle,
                ], variant: densityContract.labelVariant, children: resolved.label }), _jsxs(View, { accessible: false, style: {
                    alignItems: "baseline",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: spacing.xxs,
                    minWidth: 0,
                }, children: [resolved.prefix ? (_jsx(Text, { accessible: false, style: [
                            {
                                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                                fontWeight: statisticRecipe.affix.fontWeight,
                            },
                            affixStyle,
                        ], variant: statisticRecipe.affix.textVariant, children: resolved.prefix })) : null, _jsx(Text, { accessible: false, style: [
                            {
                                color: resolveColorReference(statisticRecipe.value.color, theme.palette),
                                flexShrink: 1,
                                fontVariant: ["tabular-nums"],
                                fontWeight: statisticRecipe.value.fontWeight,
                            },
                            valueStyle,
                        ], variant: densityContract.valueVariant, children: resolved.value }), resolved.suffix ? (_jsx(Text, { accessible: false, style: [
                            {
                                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                                fontWeight: statisticRecipe.affix.fontWeight,
                            },
                            affixStyle,
                        ], variant: statisticRecipe.affix.textVariant, children: resolved.suffix })) : null] }), resolved.trend ? (_jsxs(View, { accessible: false, style: {
                    alignItems: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: statisticRecipe.trend.gap,
                    minWidth: 0,
                }, children: [renderTrendMark && trendMark && trendColor ? (_jsx(View, { accessible: false, children: renderTrendMark({ name: trendMark, color: trendColor, size: glyph.sm }) })) : (_jsx(Text, { accessible: false, style: { color: trendColor }, variant: "caption", children: resolved.trend.direction === "up" ? "↑" : resolved.trend.direction === "down" ? "↓" : "—" })), _jsx(Text, { accessible: false, style: [
                            {
                                color: trendColor,
                                flexShrink: 1,
                                fontWeight: statisticRecipe.trend.fontWeight,
                            },
                            trendStyle,
                        ], variant: statisticRecipe.trend.textVariant, children: resolved.trend.label })] })) : null, resolved.hint ? (_jsx(Text, { accessible: false, style: [
                    { color: resolveColorReference(statisticRecipe.hint.color, theme.palette) },
                    hintStyle,
                ], variant: statisticRecipe.hint.textVariant, children: resolved.hint })) : null] }));
}
export function StatisticGroup({ label, descriptor, availableWidth, density, presentation, composeAccessibilityLabel, renderTrendMark, style, itemStyle, onLayout, ...props }) {
    validateStatisticGroup(descriptor);
    const { width: windowWidth } = useWindowDimensions();
    const { environment } = useHjmNativeTheme();
    const [measuredWidth, setMeasuredWidth] = useState(null);
    const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
    if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
        throw new RangeError("StatisticGroup availableWidth must be positive");
    }
    const requested = descriptor.columns ?? statisticRecipe.defaults.columns;
    const minItemWidth = statisticRecipe.group.minItemWidth * Math.max(1, environment.textScale);
    let columns = requested;
    while (columns > 1 &&
        (innerWidth - statisticRecipe.group.gap * (columns - 1)) / columns < minItemWidth) {
        columns -= 1;
    }
    const itemWidth = (innerWidth - statisticRecipe.group.gap * (columns - 1)) / columns;
    const remainder = descriptor.items.length % columns;
    const finalRowCount = remainder === 0 ? columns : remainder;
    const finalRowStart = descriptor.items.length - finalRowCount;
    const finalRowItemWidth = finalRowCount === columns
        ? itemWidth
        : (innerWidth - statisticRecipe.group.gap * (finalRowCount - 1)) / finalRowCount;
    const handleLayout = (event) => {
        onLayout?.(event);
        if (availableWidth !== undefined)
            return;
        const nextWidth = event.nativeEvent.layout.width;
        if (Number.isFinite(nextWidth) && nextWidth > 0) {
            setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
        }
    };
    return (_jsx(View, { ...props, accessibilityLabel: label, accessibilityRole: "list", onLayout: handleLayout, style: [
            {
                direction: environment.direction,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: statisticRecipe.group.gap,
            },
            style,
        ], children: descriptor.items.map((item, index) => (_jsx(Statistic, { contextLabel: label, descriptor: item, ...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel }), ...(density === undefined ? {} : { density }), ...(presentation === undefined ? {} : { presentation }), ...(renderTrendMark === undefined ? {} : { renderTrendMark }), style: [
                { width: index >= finalRowStart ? finalRowItemWidth : itemWidth },
                itemStyle,
            ] }, item.id))) }));
}
/** Ordered record of completed events; unlike Steps it has no current cursor. */
export function Timeline({ items, composeAccessibleName, style, ...props }) {
    const theme = useHjmNativeTheme();
    const resolved = resolveTimelineDescriptor({ items }, { composeAccessibleName });
    return (_jsx(View, { ...props, style: [{ gap: timelineRecipe.gap }, style], children: resolved.map((item, index) => {
            const tone = timelineRecipe.dot.tones[item.tone];
            const accessibilityLabel = [
                item.accessibleName,
                item.timestamp,
                item.description,
            ]
                .filter(Boolean)
                .join(", ");
            return (_jsxs(View, { accessible: true, accessibilityLabel: accessibilityLabel, style: { flexDirection: "row", gap: spacing.sm }, children: [_jsxs(View, { importantForAccessibility: "no-hide-descendants", style: { alignItems: "center", width: 16 }, children: [_jsx(View, { style: {
                                    backgroundColor: resolveColorReference(tone.fill, theme.palette),
                                    borderColor: tone.border
                                        ? resolveColorReference(tone.border, theme.palette)
                                        : "transparent",
                                    borderRadius: radius.full,
                                    borderWidth: tone.border
                                        ? timelineRecipe.dot.borderWidth
                                        : 0,
                                    height: timelineRecipe.dot.diameter,
                                    width: timelineRecipe.dot.diameter,
                                } }), index < resolved.length - 1 ? (_jsx(View, { style: {
                                    backgroundColor: resolveColorReference(timelineRecipe.connector.tone, theme.palette),
                                    flex: 1,
                                    width: timelineRecipe.connector.width,
                                } })) : null] }), _jsxs(View, { importantForAccessibility: "no-hide-descendants", style: { flex: 1, gap: spacing.xxs, minWidth: 0, paddingBottom: spacing.xxs }, children: [_jsxs(View, { style: {
                                    alignItems: "baseline",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: spacing.xs,
                                    justifyContent: "space-between",
                                }, children: [_jsx(Text, { emphasis: "medium", style: {
                                            color: resolveColorReference(timelineRecipe.label.color, theme.palette),
                                        }, variant: timelineRecipe.label.textVariant, children: item.label }), item.timestamp ? (_jsx(Text, { style: {
                                            color: resolveColorReference(timelineRecipe.timestamp.color, theme.palette),
                                        }, variant: timelineRecipe.timestamp.textVariant, children: item.timestamp })) : null] }), item.description ? (_jsx(Text, { style: {
                                    color: resolveColorReference(timelineRecipe.description.color, theme.palette),
                                }, variant: timelineRecipe.description.textVariant, children: item.description })) : null] })] }, item.id));
        }) }));
}
//# sourceMappingURL=data-display.js.map