import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import { resolveAvatarInitials } from "@hjmds/design-contracts/avatar-fallback";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { fontWeight, glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import { resolveDescriptionListColumnCount, resolveDescriptionListDescriptor, } from "@hjmds/design-contracts/components/description-list";
import { resolveStatisticDescriptor, validateStatisticGroup, } from "@hjmds/design-contracts/components/statistic";
import { resolveTagDescriptor, resolveTagPresentation, tagRecipe, } from "@hjmds/design-contracts/components/tag";
import { cardRecipe } from "@hjmds/design-contracts/components/card";
import { imageRecipe, nativeResizeModes, resolveImageAspectRatio, resolveImageDescriptor, resolveImageFallbackAccessibilityLabel, } from "@hjmds/design-contracts/components/image";
import { resolveTimelineDescriptor, timelineRecipe, } from "@hjmds/design-contracts/components/timeline";
import { surfaceDefaults, surfaceGeometry } from "@hjmds/design-contracts/recipes/base";
import { avatarRecipe, resolveAvatarInitialsTextVariant } from "@hjmds/design-contracts/recipes";
import { accordionRecipe, counterBadgeRecipe, badgeRecipe, listRecipe, formatCounterBadgeCount, listRowRecipe, statisticRecipe, } from "@hjmds/design-contracts/recipes";
import { Children, isValidElement, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { Image as NativeImage, LayoutAnimation, Pressable, StyleSheet, View, useWindowDimensions, } from "react-native";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { webDisclosureProps, webOnly } from "./internal/web-a11y.js";
import { Surface, Text, } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Badge({ label, tone = badgeRecipe.defaults.tone, size = badgeRecipe.defaults.size, variant = badgeRecipe.defaults.variant, leading, accessibilityLabel, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Badge", props, ["style", "labelStyle"]);
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
                borderRadius: theme.tokens.radius[badgeRecipe.radius],
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
            layoutStyle,
        ], children: [leading === undefined ? null : (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })), _jsx(Text, { accessible: false, align: "center", emphasis: "strong", style: [
                    {
                        color: resolveColorReference(outlined ? presentation.outlineContent : presentation.content, theme.palette),
                    },
                ], variant: metrics.textVariant, children: label })] }));
}
export function Tag({ children, tone, accessibilityLabel, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Tag", props, ["style", "labelStyle"]);
    const theme = useHjmNativeTheme();
    const resolvedLabel = children;
    if (resolvedLabel === undefined) {
        throw new TypeError("Tag requires children");
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
                borderRadius: theme.tokens.radius[tagRecipe.radius],
                borderWidth: tagRecipe.borderWidth,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: tagRecipe.size.gap,
                minHeight: tagRecipe.size.minHeight,
                paddingHorizontal: tagRecipe.size.paddingHorizontal,
            },
            layoutStyle,
        ], children: _jsx(Text, { align: "center", emphasis: "medium", style: [{ color: presentation.content }], variant: tagRecipe.size.textVariant, children: descriptor.label }) }));
}
export function Card({ children, title, description, leading, media, actions, selected = cardRecipe.defaults.selected, onActivate, disabled = false, accessibilityLabel, accessibilityHint, tone = cardRecipe.defaults.tone, bordered = cardRecipe.defaults.bordered, padding = cardRecipe.defaults.padding, layoutStyle, radius: cornerRadius = surfaceDefaults.radius, ...props }) {
    const { environment, tokens } = useHjmNativeTheme();
    if (onActivate && (!accessibilityLabel?.trim() || actions !== undefined)) {
        throw new TypeError("Interactive Card requires accessibilityLabel and no actions");
    }
    const bodyPadding = surfaceGeometry.paddings[padding];
    const hasHeader = leading !== undefined || title !== undefined || description !== undefined;
    const frame = (_jsx(Surface, { ...props, bordered: bordered, padding: "none", radius: cornerRadius, ...(onActivate ? {} : { accessibilityLabel, accessibilityHint }), ...(layoutStyle === undefined || onActivate ? {} : { layoutStyle }), tone: selected ? cardRecipe.selectedTone : tone, children: _jsxs(View, { style: {
                overflow: "hidden",
                borderRadius: tokens.radius[cornerRadius],
            }, children: [media === undefined ? null : _jsx(View, { children: media }), _jsxs(View, { style: { gap: cardRecipe.body.gap, padding: bodyPadding }, children: [hasHeader ? (_jsxs(View, { style: {
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
                    }, children: actions }))] }) }));
    if (!onActivate)
        return frame;
    // Keep Surface's material/clip inside one native action host. App-owned wrappers
    // previously had to reinvent disabled/selected naming and press feedback.
    return _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: accessibilityLabel, accessibilityHint: accessibilityHint, accessibilityState: { selected, disabled }, disabled: disabled, onPress: () => { if (!disabled)
            onActivate(); }, style: ({ pressed }) => [minimumTargetStyle, {
                opacity: disabled ? cardRecipe.interaction.disabledOpacity : pressed ? cardRecipe.interaction.pressedOpacity : 1,
            }, layoutStyle], children: frame });
}
export function ListRow({ title, tone = listRowRecipe.defaults.tone, description, leading, trailing, titleMetadata, trailingAction, trailingText, metadataLabel, trailingLabel, onPress, accessibilityLabel, accessibilityHint, disabled = false, density = listRowRecipe.defaults.density, loading = false, loadingLabel, selected: selectedProp, leadingShape = "square", layoutStyle, leadingStyle, contentStyle, titleRowStyle, trailingStyle, trailingActionStyle, containerProps, accessibilityState, ...forwarded }) {
    assertNoRemovedStyleProps("ListRow", forwarded, ["titleStyle", "descriptionStyle"]);
    const { hjmTitleEmphasis, hjmMeta, ...props } = forwarded;
    const theme = useHjmNativeTheme();
    const metrics = listRowRecipe.density[density];
    const interactive = onPress !== undefined;
    const selected = selectedProp ?? listRowRecipe.defaults.selected;
    const resolvedMetadata = titleMetadata;
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
        minHeight: description || hjmMeta ? metrics.twoLineMinHeight : metrics.oneLineMinHeight,
        opacity: disabled ? listRowRecipe.states.disabledOpacity : 1,
    };
    // `leadingSize` was declared by the recipe but unbound, so consumers rebuilt
    // the avatar box themselves. The frame belongs here; `leadingStyle` keeps
    // only composition keys.
    const leadingRadius = listRowRecipe.leadingShapes[leadingShape];
    const leadingFrameStyle = {
        alignItems: "center",
        height: listRowRecipe.leadingSize,
        justifyContent: "center",
        overflow: "hidden",
        width: listRowRecipe.leadingSize,
        ...(leadingRadius === null ? {} : { borderRadius: theme.tokens.radius[leadingRadius] }),
    };
    if (loading) {
        // Search and other collections share ListRow geometry instead of approximating it with
        // loose Skeletons. Never mount placeholder actions or forward touch handlers while loading.
        const placeholder = { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.tokens.radius.sm };
        return _jsxs(View, { testID: props.testID, onLayout: props.onLayout, accessible: Boolean(loadingLabel), accessibilityRole: "progressbar", accessibilityLabel: loadingLabel, accessibilityState: { busy: true }, importantForAccessibility: loadingLabel ? "yes" : "no-hide-descendants", style: [{ alignItems: "center", flexDirection: "row", direction: theme.environment.direction,
                    gap: listRowRecipe.gap, minHeight: visualState.minHeight,
                    paddingHorizontal: metrics.paddingHorizontal, paddingVertical: metrics.paddingVertical,
                    borderWidth: 1, borderColor: "transparent" }, layoutStyle], children: [leading ? _jsx(View, { style: [placeholder, leadingFrameStyle] }) : null, _jsxs(View, { style: { flex: 1, minWidth: 0, gap: spacing.xxs }, children: [_jsx(View, { style: [placeholder, { width: `${listRowRecipe.loading.titleWidthPercent}%`, height: theme.tokens.typography[listRowRecipe.title.textVariant].lineHeight }] }), description ? _jsx(View, { style: [placeholder, { width: `${listRowRecipe.loading.descriptionWidthPercent}%`, height: theme.tokens.typography[listRowRecipe.description.textVariant].lineHeight }] }) : null] }), trailing || trailingText ? _jsx(View, { style: [placeholder, { width: listRowRecipe.loading.trailingWidth, height: theme.tokens.typography[listRowRecipe.trailing.textVariant].lineHeight }] }) : null] });
    }
    const rowContent = (_jsxs(_Fragment, { children: [leading ? (_jsx(View, { accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", style: [leadingFrameStyle, leadingStyle], children: leading })) : null, _jsxs(View, { style: [{ flex: 1, gap: spacing.xxs, minWidth: 0 }, contentStyle], children: [_jsxs(View, { style: [
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
                                        color: resolveColorReference(listRowRecipe.tones[tone].titleColor, theme.palette),
                                        flexShrink: 1,
                                        fontWeight: hjmTitleEmphasis === "regular" ? fontWeight.regular : listRowRecipe.title.fontWeight,
                                    },
                                ], variant: listRowRecipe.title.textVariant, children: title }), resolvedMetadata === undefined ? null : (_jsx(View, { accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", children: resolvedMetadata }))] }), description ? (_jsx(Text, { style: [
                            { color: resolveColorReference(listRowRecipe.description.color, theme.palette) },
                        ], variant: listRowRecipe.description.textVariant, children: description })) : null, hjmMeta ? _jsx(Text, { variant: "caption", tone: "muted", children: hjmMeta }) : null] }), trailingText || trailing ? (_jsx(View, { accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", style: [{ flexShrink: 0 }, trailingStyle], children: trailingText ? (_jsx(Text, { style: { color: resolveColorReference(listRowRecipe.trailing.textColor, theme.palette) }, variant: listRowRecipe.trailing.textVariant, children: trailingText })) : trailing })) : null] }));
    const contentStyleFor = (pressed) => [
        minimumTargetStyle,
        {
            alignItems: "center",
            backgroundColor: pressed
                ? resolveColorReference(listRowRecipe.states.pressedBackground, theme.palette)
                : trailingAction
                    ? "transparent"
                    : visualState.backgroundColor,
            borderColor: selected && !trailingAction ? theme.colors.contentBrand : "transparent",
            borderWidth: trailingAction ? 0 : 1,
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
        trailingAction ? undefined : layoutStyle,
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
                borderColor: selected ? theme.colors.contentBrand : "transparent",
                borderWidth: 1,
                direction: visualState.direction,
                flexDirection: "row",
                minHeight: visualState.minHeight,
                opacity: visualState.opacity,
            },
            layoutStyle,
        ], children: [main, _jsx(View, { style: [
                    { flexShrink: 0, paddingEnd: metrics.paddingHorizontal },
                    trailingActionStyle,
                ], children: trailingAction })] }));
}
export function Avatar({ source, renderImage, name, initials, renderFallback, size = 44, decorative = false, accessibilityLabel, layoutStyle, }) {
    if (!Number.isFinite(size) || size < 24)
        throw new RangeError("Avatar size must be at least 24");
    const { palette } = useHjmNativeTheme();
    // Same colors and initials step as Web (avatarRecipe); Native previously used brand 12pt initials.
    const initialsColor = resolveColorReference(avatarRecipe.content, palette);
    const initialsVariant = resolveAvatarInitialsTextVariant(size);
    const sourceKey = source === undefined ? "none" : resolveImageSourceKey(source);
    const [failedSource, setFailedSource] = useState(null);
    // URI equality alone cannot reject an old A callback after A→B→A. A source
    // generation token preserves product cache/display hosts without stale failures.
    const sourceGeneration = useMemo(() => ({ key: sourceKey }), [sourceKey]);
    const currentGeneration = useRef(sourceGeneration);
    currentGeneration.current = sourceGeneration;
    const failImage = () => {
        if (currentGeneration.current === sourceGeneration)
            setFailedSource(sourceKey);
    };
    // A replacement photo must retry even when the previous URI failed. Key by
    // content rather than object identity, since hosts commonly inline { uri }.
    const failed = failedSource === sourceKey;
    useEffect(() => setFailedSource(null), [sourceKey]);
    const fallback = resolveAvatarInitials(name, initials);
    const mediaAccessibility = decorative
        ? { accessible: false }
        : { accessible: true, accessibilityLabel, accessibilityRole: "image" };
    return (_jsx(View, { ...mediaAccessibility, style: [
            {
                alignItems: "center",
                backgroundColor: resolveColorReference(avatarRecipe.background, palette),
                borderColor: resolveColorReference(avatarRecipe.border, palette),
                borderWidth: 1,
                borderRadius: radius.full,
                height: size,
                justifyContent: "center",
                overflow: "hidden",
                width: size,
            },
            layoutStyle,
        ], children: source !== undefined && !failed ? (renderImage ? (_jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { height: size, width: size }, children: renderImage({ source, size, onError: failImage,
                fallback: renderFallback?.({ size, decorative: true }) ?? _jsx(Text, { align: "center", style: { color: initialsColor }, variant: initialsVariant, emphasis: avatarRecipe.initialsWeight, children: fallback }) }) })) : (_jsx(NativeImage, { accessible: false, onError: failImage, source: source, style: [{ height: size, width: size }] }))) : (_jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: renderFallback?.({ size, decorative: true }) ?? _jsx(Text, { align: "center", style: { color: initialsColor }, variant: initialsVariant, emphasis: avatarRecipe.initialsWeight, children: fallback }) })) }));
}
export function Divider({ orientation = "horizontal", inset = 0, layoutStyle }) {
    if (!Number.isFinite(inset) || inset < 0)
        throw new RangeError("Divider inset must be non-negative");
    const { colors } = useHjmNativeTheme();
    return (_jsx(View, { accessible: false, style: [
            orientation === "horizontal"
                ? { backgroundColor: colors.border, height: 1, marginHorizontal: inset, width: "auto" }
                : { alignSelf: "stretch", backgroundColor: colors.border, marginVertical: inset, width: 1 },
            layoutStyle,
        ] }));
}
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Accordion({ label, items, expandedValues, defaultExpandedValues = [], onExpandedValuesChange, multiple = accordionRecipe.defaults.allowsMultipleExpanded, density = accordionRecipe.defaults.density, renderIndicator, layoutStyle, }) {
    if (items.length === 0)
        throw new Error("Accordion requires at least one item");
    const itemValues = new Set(items.map((item) => item.value));
    if (itemValues.size !== items.length)
        throw new TypeError("Accordion values must be unique");
    const theme = useHjmNativeTheme();
    const metrics = accordionRecipe.density[density];
    const indicatorColor = resolveColorReference(accordionRecipe.indicator.color, theme.palette);
    const [storedExpanded, setExpanded] = useControllableState({
        ...(expandedValues === undefined ? {} : { value: expandedValues }),
        defaultValue: defaultExpandedValues,
        ...(onExpandedValuesChange === undefined ? {} : { onChange: onExpandedValuesChange }),
    });
    const committed = useRef(false);
    const expanded = expandedValues === undefined && committed.current ? storedExpanded.filter(value => itemValues.has(value)) : storedExpanded;
    if (expanded.some(value => !itemValues.has(value)))
        throw new RangeError("Accordion expanded values must match items");
    if (!multiple && expanded.length > 1)
        throw new RangeError("Accordion only accepts one expanded value unless multiple is true");
    useLayoutEffect(() => {
        committed.current = true;
        // Retire expansion with the deleted item instead of reopening it when its key returns.
        if (expanded.length !== storedExpanded.length)
            setExpanded(expanded);
    }, [expanded, storedExpanded, setExpanded]);
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "list", style: [layoutStyle], children: items.map((item) => {
            const isExpanded = expanded.includes(item.value);
            return (_jsxs(View, { style: [
                    {
                        borderBottomColor: resolveColorReference(accordionRecipe.divider, theme.palette),
                        borderBottomWidth: 1,
                    },
                ], children: [_jsxs(Pressable, { accessibilityHint: item.accessibilityHint, accessibilityLabel: item.accessibilityLabel ?? item.title, accessibilityRole: "button", accessibilityState: { disabled: item.disabled === true, expanded: isExpanded }, ...webOnly(webDisclosureProps(isExpanded, item.disabled === true)), disabled: item.disabled, onPress: () => {
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
                        ], children: [_jsxs(View, { style: { flex: 1, gap: spacing.xxs }, children: [_jsx(Text, { fontRole: "ui", style: [
                                            {
                                                color: resolveColorReference(accordionRecipe.title.color, theme.palette),
                                                fontWeight: accordionRecipe.title.fontWeight,
                                            },
                                        ], variant: accordionRecipe.title.textVariant, children: item.title }), item.description ? _jsx(Text, { tone: "muted", variant: "caption", children: item.description }) : null] }), _jsx(View, { accessible: false, children: renderIndicator ? (renderIndicator({
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
                        ], children: item.content })) : null] }, item.value));
        }) }));
}
export function DescriptionList({ label, descriptor, availableWidth, layoutStyle, onLayout, ...props }) {
    assertNoRemovedStyleProps("DescriptionList", props, ["style", "itemStyle"]);
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
            layoutStyle,
        ], children: resolved.items.map((item) => (_jsxs(View, { accessibilityLabel: `${item.label}, ${item.value}`, accessible: true, style: [{ gap: spacing.xxs, width: itemWidth }], children: [_jsx(Text, { accessible: false, tone: "muted", variant: "label", children: item.label }), _jsx(Text, { accessible: false, tone: "primary", children: item.value })] }, item.id))) }));
}
function resolveImageSourceKey(source) {
    if (typeof source === "number")
        return `asset:${source}`;
    try {
        return `source:${JSON.stringify(source)}`;
    }
    catch {
        return `source:${String(source)}`;
    }
}
/** Intrinsic-size Native image with canonical fit, accessibility, and fallback semantics. */
export function Image(imageProps) {
    const { src, width, height, fit, decorative, accessibilityLabel, sourceAdapter, fallback, onError, onLoad, onLoadStatusChange, renderImage, resizeMode, style, layoutStyle, ...nativeProps } = imageProps;
    const theme = useHjmNativeTheme();
    const descriptor = resolveImageDescriptor({
        src, width, height,
        ...(fit === undefined ? {} : { fit }),
        ...(decorative === undefined ? {} : { decorative }),
        ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
    });
    const resolvedDecorative = descriptor.decorative;
    const resolvedAccessibilityLabel = descriptor.decorative ? undefined : descriptor.accessibilityLabel;
    const resolvedResizeMode = nativeResizeModes[descriptor.fit];
    const source = useMemo(() => sourceAdapter?.(descriptor) ?? { uri: descriptor.src }, [descriptor.accessibilityLabel, descriptor.decorative, descriptor.fit,
        descriptor.height, descriptor.src, descriptor.width, sourceAdapter]);
    // Auth/cache changes can create a new request at the same URL. Compare the
    // resolved source contents, not the inline adapter function's identity.
    const sourceKey = JSON.stringify([descriptor.src, resolveImageSourceKey(source)]);
    // Match the Web image lifecycle: a replaced/unmounted host cannot publish
    // results, including an old A request after the product changes A→B→A.
    const generation = useMemo(() => ({}), [sourceKey]);
    const activeGeneration = useRef(generation);
    useLayoutEffect(() => {
        activeGeneration.current = generation;
        return () => { activeGeneration.current = null; };
    }, [generation]);
    const [state, setState] = useState({ generation, status: "loading" });
    const status = state.generation === generation ? state.status : "loading";
    const reportLoad = (event) => {
        if (activeGeneration.current !== generation)
            return;
        setState({ generation, status: "loaded" });
        onLoadStatusChange?.("loaded");
        onLoad?.(event);
    };
    const reportError = (event) => {
        if (activeGeneration.current !== generation)
            return;
        setState({ generation, status: "error" });
        onLoadStatusChange?.("error");
        onError?.(event);
    };
    const handleLoad = reportLoad;
    const handleError = reportError;
    const assetStyle = [StyleSheet.absoluteFill, style];
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
            ...(resolvedResizeMode === undefined ? {} : { resizeMode: resolvedResizeMode }),
        },
    };
    const placeholderBackground = resolveColorReference(imageRecipe.placeholder.background, theme.palette);
    const fallbackLabel = resolveImageFallbackAccessibilityLabel(descriptor);
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
    else {
        visual = renderImage({
            ...adapterBase,
            descriptor,
            src: descriptor.src,
            width: descriptor.width,
            height: descriptor.height,
            fit: descriptor.fit,
        });
    }
    return (_jsx(View, { style: [
            {
                alignItems: "center",
                backgroundColor: placeholderBackground,
                borderRadius: theme.tokens.radius[imageRecipe.radius],
                justifyContent: "center",
                overflow: "hidden",
                aspectRatio: resolveImageAspectRatio(descriptor.width, descriptor.height),
                width: descriptor.width,
            },
            layoutStyle,
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
export function CounterBadge({ count, accessibilityLabel, max = counterBadgeRecipe.defaults.max, tone = counterBadgeRecipe.defaults.tone, size = counterBadgeRecipe.defaults.size, variant = counterBadgeRecipe.defaults.variant, layoutStyle, }) {
    if (accessibilityLabel !== undefined && !accessibilityLabel.trim()) {
        throw new TypeError("CounterBadge accessibilityLabel must not be empty");
    }
    // A zero count hides the badge, but must not change its Hook call order.
    const { colors } = useHjmNativeTheme();
    const visibleLabel = formatCounterBadgeCount(count, max);
    if (visibleLabel === null)
        return null;
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
            layoutStyle,
        ], children: _jsx(Text, { accessible: false, align: "center", style: { color: presentation[tone].content, fontWeight: "700" }, variant: "caption", children: visibleLabel }) }));
}
/** Semantic list container that owns separator rhythm around composed rows. */
export function List({ label, children, separator = listRecipe.defaults.separator, appearance = "plain", layoutStyle, ...props }) {
    assertNoRemovedStyleProps("List", props, ["style"]);
    const { colors, environment, tokens } = useHjmNativeTheme();
    const items = Children.toArray(children);
    const separatorContract = listRecipe.separators[separator];
    if (!label.trim())
        throw new TypeError("List label must not be empty");
    return (_jsx(View, { ...props, accessibilityLabel: label, accessibilityRole: "list", style: [
            {
                direction: environment.direction,
                ...(appearance === "grouped"
                    ? {
                        backgroundColor: colors.bg,
                        borderRadius: tokens.radius.lg,
                        overflow: "hidden",
                    }
                    : {}),
            },
            layoutStyle,
        ], children: items.map((item, index) => (_jsxs(View, { children: [item, separatorContract && index < items.length - 1 ? (_jsx(View, { accessible: false, style: {
                        backgroundColor: colors.border,
                        height: 1,
                        marginEnd: separatorContract.insetEnd,
                        marginStart: separatorContract.insetStart,
                    } })) : null] }, isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`))) }));
}
export function Statistic(props) {
    return renderStatistic(props);
}
// StatisticGroup reuses this renderer with its calculated layout width.
function renderStatistic({ descriptor, density = "comfortable", presentation = "plain", contextLabel, accessibilityLabel, composeAccessibilityLabel, renderTrendMark, layoutStyle, }) {
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
                borderRadius: theme.tokens.radius[presentationContract.radius],
                borderWidth: presentationContract.borderWidth,
                gap: densityContract.gap,
                minWidth: 0,
                // Plain statistics align with surrounding text; only the surface plate is inset (Web keys on data-presentation).
                padding: presentation === "surface" ? densityContract.padding : 0,
            },
            layoutStyle,
        ], children: [_jsx(Text, { accessible: false, style: [
                    {
                        color: resolveColorReference(statisticRecipe.label.color, theme.palette),
                        fontWeight: statisticRecipe.label.fontWeight,
                    },
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
                        ], variant: statisticRecipe.affix.textVariant, children: resolved.prefix })) : null, _jsx(Text, { accessible: false, style: [
                            {
                                color: resolveColorReference(statisticRecipe.value.color, theme.palette),
                                flexShrink: 1,
                                fontVariant: ["tabular-nums"],
                                fontWeight: statisticRecipe.value.fontWeight,
                            },
                        ], variant: densityContract.valueVariant, children: resolved.value }), resolved.suffix ? (_jsx(Text, { accessible: false, style: [
                            {
                                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                                fontWeight: statisticRecipe.affix.fontWeight,
                            },
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
                        ], variant: statisticRecipe.trend.textVariant, children: resolved.trend.label })] })) : null, resolved.hint ? (_jsx(Text, { accessible: false, style: [
                    { color: resolveColorReference(statisticRecipe.hint.color, theme.palette) },
                ], variant: statisticRecipe.hint.textVariant, children: resolved.hint })) : null] }));
}
export function StatisticGroup({ label, descriptor, availableWidth, density, presentation, composeAccessibilityLabel, renderTrendMark, layoutStyle, onLayout, ...props }) {
    assertNoRemovedStyleProps("StatisticGroup", props, ["style", "itemStyle"]);
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
            layoutStyle,
        ], children: descriptor.items.map((item, index) => (_jsx(StatisticGroupItem, { contextLabel: label, descriptor: item, ...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel }), ...(density === undefined ? {} : { density }), ...(presentation === undefined ? {} : { presentation }), ...(renderTrendMark === undefined ? {} : { renderTrendMark }), layoutStyle: { width: index >= finalRowStart ? finalRowItemWidth : itemWidth } }, item.id))) }));
}
/** Group cell: same render as Statistic without attributing the group's styles to the caller. */
function StatisticGroupItem(props) {
    return renderStatistic(props);
}
/** Ordered record of completed events; unlike Steps it has no current cursor. */
export function Timeline({ items, composeAccessibleName, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Timeline", props, ["style"]);
    const theme = useHjmNativeTheme();
    const resolved = resolveTimelineDescriptor({ items }, { composeAccessibleName });
    return (_jsx(View, { ...props, style: [{ gap: timelineRecipe.gap }, layoutStyle], children: resolved.map((item, index) => {
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