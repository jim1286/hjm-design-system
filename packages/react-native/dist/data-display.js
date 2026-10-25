import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IdentityAction } from "./internal/identity-action.js";
import { resolveDensityDefault } from "@hjmds/design-contracts/components/design-system-provider";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import { resolveAvatarInitials } from "@hjmds/design-contracts/avatar-fallback";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { notificationRowRecipe } from "@hjmds/design-contracts/screen-patterns";
import { fontWeight, glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import { resolveDescriptionListColumnCount, resolveDescriptionListDescriptor, } from "@hjmds/design-contracts/components/description-list";
import { resolveStatisticDescriptor, validateStatisticGroup, } from "@hjmds/design-contracts/components/statistic";
import { resolveTagDescriptor, resolveTagPresentation, tagRecipe, } from "@hjmds/design-contracts/components/tag";
import { cardRecipe } from "@hjmds/design-contracts/components/card";
import { imageRecipe, nativeResizeModes, resolveImageAspectRatio, resolveImageDescriptor, resolveImageFallbackAccessibilityLabel, } from "@hjmds/design-contracts/components/image";
import { resolveTimelineDescriptor, timelineRecipe, validateTimelineSelection, } from "@hjmds/design-contracts/components/timeline";
import { surfaceDefaults, surfaceGeometry } from "@hjmds/design-contracts/recipes/base";
import { avatarRecipe, resolveAvatarInitialsTextVariant, resolveAvatarSize, skeletonRecipe, validateAvatarPresentation } from "@hjmds/design-contracts/recipes";
import { accordionRecipe, counterBadgeRecipe, badgeRecipe, listRecipe, formatCounterBadgeCount, iconRecipe, listRowRecipe, statisticRecipe, resolveBadgeCategoryColor, validateListRowTrailingAccessory, dividerRecipe, validateDividerLineStyle, } from "@hjmds/design-contracts/recipes";
import { Children, createContext, isValidElement, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { Image as NativeImage, LayoutAnimation, Pressable, StyleSheet, View, useWindowDimensions, } from "react-native";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { webDisclosureProps, webOnly } from "./internal/web-a11y.js";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import { Surface, Text, } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Badge({ label, tone: toneProp, categoryColor, size = badgeRecipe.defaults.size, variant = badgeRecipe.defaults.variant, leading, trailing, accessibilityLabel, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Badge", props, ["style", "labelStyle"]);
    if (categoryColor !== undefined && toneProp !== undefined)
        throw new TypeError("Badge takes either tone or categoryColor, not both");
    const tone = toneProp ?? badgeRecipe.defaults.tone;
    const theme = useHjmNativeTheme();
    const presentation = badgeRecipe.tones[tone];
    const metrics = badgeRecipe.sizes[size];
    const variantPresentation = badgeRecipe.variants[variant];
    const outlined = !variantPresentation.usesToneBackground;
    const category = categoryColor === undefined ? null : resolveBadgeCategoryColor(categoryColor, {
        theme: theme.environment.theme,
        variant,
        palette: theme.palette.theme,
    });
    const contentColor = category?.content ?? resolveColorReference(outlined ? presentation.outlineContent : presentation.content, theme.palette);
    const iconContext = { color: contentColor, size: metrics.iconSize, strokeWidth: badgeRecipe.iconStrokeWidth };
    const borderReference = outlined ? presentation.border ?? variantPresentation.borderFallback : null;
    const borderColor = category
        ? category.border ?? "transparent"
        : borderReference === null ? "transparent" : resolveColorReference(borderReference, theme.palette);
    const hasBorder = category ? category.border !== null : borderReference !== null;
    return (_jsxs(View, { ...props, accessibilityLabel: accessibilityLabel ?? String(label), accessible: true, style: [
            {
                alignSelf: "flex-start",
                alignItems: "center",
                backgroundColor: outlined
                    ? "transparent"
                    : category?.background ?? resolveColorReference(presentation.background, theme.palette),
                borderColor,
                borderRadius: theme.tokens.radius[badgeRecipe.radius],
                borderWidth: hasBorder ? badgeRecipe.borderWidth : 0,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: metrics.gap,
                justifyContent: "center",
                minHeight: metrics.minHeight,
                paddingHorizontal: metrics.paddingHorizontal,
            },
            layoutStyle,
        ], children: [leading === undefined ? null : (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: typeof leading === "function" ? leading(iconContext) : leading })), _jsx(Text, { accessible: false, align: "center", emphasis: "strong", 
                // Shrink beside a leading/trailing glyph so a long label wraps inside the pill (badge.md: labels wrap). At its
                // natural width the label plus the glyph overran the pill and its parent (2026-10-23 flex audit).
                style: [
                    {
                        fontWeight: badgeRecipe.fontWeight,
                        color: contentColor,
                        flexShrink: 1,
                    },
                ], variant: metrics.textVariant, children: label }), trailing === undefined ? null : (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: typeof trailing === "function" ? trailing(iconContext) : trailing }))] }));
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
export function Card({ children, title, description, leading, leadingAction, media, backgroundMedia, backgroundInteraction, mediaBadges, badges, badgesAlign = cardRecipe.defaults.badgesAlign, mediaAction, actions, headerActions, selected = cardRecipe.defaults.selected, onActivate, disabled = false, accessibilityLabel, accessibilityHint, tone = cardRecipe.defaults.tone, bordered = cardRecipe.defaults.bordered, padding = cardRecipe.defaults.padding, layoutStyle, radius: cornerRadius = surfaceDefaults.radius, ...props }) {
    const { environment, tokens, colors } = useHjmNativeTheme();
    if (onActivate && !accessibilityLabel?.trim()) {
        throw new TypeError("Interactive Card requires accessibilityLabel");
    }
    if (mediaAction && (onActivate || !media || !mediaAction.label.trim()))
        throw new TypeError("Card mediaAction requires passive media, a label, and no whole-card onActivate");
    if (backgroundMedia && (media || mediaAction || onActivate))
        throw new TypeError("Card backgroundMedia is decorative and cannot combine with media, mediaAction or onActivate");
    if ((backgroundInteraction !== undefined || mediaBadges !== undefined) && !backgroundMedia)
        throw new TypeError("Card backgroundInteraction/mediaBadges require backgroundMedia");
    const [headerActionSize, setHeaderActionSize] = useState({ width: 0, height: 0 });
    const [headerBodyTop, setHeaderBodyTop] = useState(0);
    const [headerRow, setHeaderRow] = useState(null);
    const bodyPadding = surfaceGeometry.paddings[padding];
    const [leadingActionSize, setLeadingActionSize] = useState({ width: 0, height: 0 });
    const hasHeader = leading !== undefined || title !== undefined || description !== undefined || headerActions !== undefined;
    // Whole-card open plus separate commands (2026-10-18 unairplane journey card: open + delete); see `onActivate`.
    const split = onActivate !== undefined && Boolean(actions || headerActions || leadingAction);
    const activate = () => { if (!disabled)
        onActivate?.(); };
    const activationA11y = {
        accessibilityRole: "button",
        accessibilityLabel,
        accessibilityHint,
        accessibilityState: { selected, disabled },
    };
    const feedbackOpacity = (pressed) => disabled ? cardRecipe.interaction.disabledOpacity : pressed ? cardRecipe.interaction.pressedOpacity : 1;
    // The activation host owns placement; its inner frame/body fill a stretched collection slot.
    const frame = (_jsx(Surface, { ...props, bordered: bordered, padding: "none", radius: cornerRadius, ...(onActivate ? {} : { accessibilityLabel, accessibilityHint }), ...(onActivate && !split ? { layoutStyle: { flexGrow: 1 } } : layoutStyle === undefined ? {} : { layoutStyle }), tone: selected ? cardRecipe.selectedTone : tone, children: _jsxs(View, { pointerEvents: backgroundMedia ? "box-none" : "auto", style: {
                overflow: "hidden",
                flexGrow: 1,
                borderRadius: tokens.radius[cornerRadius],
                ...(backgroundMedia ? { flex: 1, justifyContent: "flex-end" } : {}),
            }, children: [backgroundMedia ? _jsxs(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: StyleSheet.absoluteFill, children: [backgroundMedia, _jsx(View, { style: [StyleSheet.absoluteFill, { backgroundColor: cardRecipe.backgroundMedia.scrim }] })] }) : null, backgroundInteraction === undefined ? null : _jsx(View, { pointerEvents: "box-none", style: StyleSheet.absoluteFill, children: backgroundInteraction }), mediaBadges === undefined ? null : _jsx(View, { pointerEvents: "box-none", style: { position: "absolute", top: cardRecipe.mediaAction.inset, end: cardRecipe.mediaAction.inset, flexDirection: "row", flexWrap: "wrap", gap: cardRecipe.body.gap, zIndex: 1 }, children: mediaBadges }), _jsxs(CardActivationRegion, { split: split, activation: activationA11y, disabled: disabled, onPress: activate, feedbackOpacity: feedbackOpacity, children: [media === undefined ? null : mediaAction ? _jsxs(Pressable, { accessibilityRole: "button", accessibilityLabel: mediaAction.label, accessibilityState: { disabled }, disabled: disabled, onPress: () => { if (!disabled)
                                mediaAction.onActivate(); }, style: ({ pressed }) => [minimumTargetStyle, { opacity: feedbackOpacity(pressed) }], children: [media, mediaAction.icon ? _jsx(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", end: cardRecipe.mediaAction.inset, bottom: cardRecipe.mediaAction.inset, width: cardRecipe.mediaAction.diameter, height: cardRecipe.mediaAction.diameter, alignItems: "center", justifyContent: "center", borderRadius: tokens.radius.full, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }, children: mediaAction.icon({ color: colors.text, size: cardRecipe.mediaAction.iconSize }) }) : null] }) : _jsx(View, { children: media }), _jsxs(View, { onLayout: ({ nativeEvent: { layout } }) => setHeaderBodyTop(layout.y), style: { gap: cardRecipe.body.gap, padding: bodyPadding, flexGrow: backgroundMedia ? 0 : 1 }, children: [badges === undefined ? null : _jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", justifyContent: badgesAlign === "center" ? "center" : "flex-start", gap: cardRecipe.body.gap }, children: badges }), hasHeader ? (_jsxs(View, { onLayout: ({ nativeEvent: { layout } }) => setHeaderRow(current => current?.top === layout.y && current.height === layout.height ? current : { top: layout.y, height: layout.height }), style: {
                                        alignItems: cardRecipe.header.alignItems,
                                        direction: environment.direction,
                                        flexDirection: "row",
                                        gap: cardRecipe.header.gap,
                                        ...(headerActionSize.width > 0 ? { marginEnd: headerActionSize.width + cardRecipe.header.gap, minHeight: headerActionSize.height } : {}),
                                    }, children: [leading === undefined ? null : (_jsx(View, { style: { flexShrink: 0, ...(leadingAction ? { width: leadingActionSize.width, height: leadingActionSize.height } : {}) }, children: leadingAction ? null : leading })), _jsxs(View, { style: { flex: 1, gap: cardRecipe.body.gap, minWidth: 0 }, children: [title === undefined ? null : (_jsx(Text, { accessibilityRole: "header", emphasis: cardRecipe.title.emphasis, tone: "primary", ...(backgroundMedia ? { color: cardRecipe.backgroundMedia.foreground } : {}), variant: cardRecipe.title.variant, children: title })), description === undefined ? null : (_jsx(Text, { emphasis: "regular", tone: "muted", ...(backgroundMedia ? { color: cardRecipe.backgroundMedia.foreground } : {}), variant: "body", children: description }))] })] })) : null, children === undefined ? null : _jsx(View, { style: { flexGrow: 1 }, children: children })] })] }), leadingAction && leading !== undefined ? _jsx(View, { onLayout: ({ nativeEvent: { layout } }) => setLeadingActionSize(current => current.width === layout.width && current.height === layout.height ? current : { width: layout.width, height: layout.height }), style: { position: "absolute", top: headerBodyTop + (headerRow?.top ?? bodyPadding) + Math.max(0, ((headerRow?.height ?? leadingActionSize.height) - leadingActionSize.height) / 2), start: bodyPadding, zIndex: 1 }, children: _jsx(IdentityAction, { action: leadingAction, children: leading }) }) : null, headerActions === undefined ? null : _jsx(View, { onLayout: ({ nativeEvent: { layout } }) => setHeaderActionSize(current => current.width === layout.width && current.height === layout.height ? current : { width: layout.width, height: layout.height }), 
                    // Commands stay outside the accessible card target; measured row height also centers wrapped copy.
                    style: { position: "absolute", top: headerBodyTop + (headerRow?.top ?? bodyPadding) + Math.max(0, ((headerRow?.height ?? headerActionSize.height) - headerActionSize.height) / 2), end: bodyPadding, flexDirection: "row", alignItems: cardRecipe.header.alignItems, gap: cardRecipe.body.gap, zIndex: 1 }, children: headerActions }), actions === undefined ? null : (_jsx(View, { style: {
                        direction: environment.direction,
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: cardRecipe.actions.gap,
                        paddingBottom: cardRecipe.actions.paddingBottom,
                        paddingHorizontal: cardRecipe.actions.paddingHorizontal,
                    }, children: actions }))] }) }));
    if (!onActivate || split)
        return frame;
    // Keep Surface's material/clip inside one native action host. App-owned wrappers
    // previously had to reinvent disabled/selected naming and press feedback.
    return _jsx(Pressable, { ...activationA11y, disabled: disabled, onPress: activate, style: ({ pressed }) => [minimumTargetStyle, { opacity: feedbackOpacity(pressed) }, layoutStyle], children: frame });
}
/** Media and body as the card's own target when actions sit beside it; otherwise a transparent passthrough. */
function CardActivationRegion({ split, activation, disabled, onPress, feedbackOpacity, children }) {
    if (!split)
        return _jsx(_Fragment, { children: children });
    return _jsx(Pressable, { ...activation, disabled: disabled, onPress: onPress, style: ({ pressed }) => [minimumTargetStyle, { flexGrow: 1, opacity: feedbackOpacity(pressed) }], children: children });
}
/** The quotation and caption stay one visual unit; nested disclosures remain independently accessible. */
export function QuoteCard({ children, attribution, renderMark, ...props }) {
    const { colors } = useHjmNativeTheme();
    return _jsx(Card, { ...props, leading: _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: renderMark?.({ color: colors.contentBrand, size: cardRecipe.quotation.markSize }) ?? _jsx(Text, { variant: "heading", tone: "brand", children: "\u201C" }) }), children: _jsxs(View, { style: { gap: cardRecipe.quotation.gap }, children: [children, attribution === undefined ? null : _jsx(Text, { variant: "caption", tone: "muted", children: attribution })] }) });
}
/**
 * A List item hands its rows this reporter so the indented separator drawn after the item follows the row's text
 * column: measured leading width + gap when the row has a leading frame, the content edge when it has none (2026-10-17 user
 * report: a fixed 52 cut the line off midway under rows without leading). Web reads the same fact from the ListRow
 * root's `data-leading` attribute in CSS.
 */
const ListItemLeadingContext = createContext(null);
export function ListRow({ title, tone = listRowRecipe.defaults.tone, description, leading, leadingAction, trailing, trailingAccessory = listRowRecipe.defaults.trailingAccessory, titleMetadata, trailingAction, trailingText, metadataLabel, trailingLabel, onPress, accessibilityLabel, accessibilityHint, disabled = false, density: suppliedDensity, loading = false, loadingLabel, selected: selectedProp, leadingShape = "square", leadingSize = leadingShape === "circle" ? "large" : "default", layoutStyle, leadingStyle, contentStyle, titleRowStyle, trailingStyle, trailingActionStyle, containerProps, accessibilityState, ...forwarded }) {
    assertNoRemovedStyleProps("ListRow", forwarded, ["titleStyle", "descriptionStyle"]);
    const { hjmTitleEmphasis, hjmMeta, hjmUnreadLabel, ...props } = forwarded;
    const theme = useHjmNativeTheme();
    const density = suppliedDensity ?? resolveDensityDefault(theme.environment.density, { comfortable: listRowRecipe.defaults.density, compact: "compact" });
    // Tell the enclosing List item whether this row has a leading frame, so the indented separator after it starts at
    // this row's text column (listRecipe.separators). Runs before the loading early return to keep hook order.
    const reportLeading = useContext(ListItemLeadingContext);
    const hasLeading = Boolean(leading);
    const [leadingWidth, setLeadingWidth] = useState(listRowRecipe.leadingSize);
    const measureLeading = (event) => {
        if (!reportLeading)
            return;
        const width = event.nativeEvent.layout.width;
        if (Number.isFinite(width) && width >= 0)
            setLeadingWidth(current => current === width ? current : width);
    };
    useLayoutEffect(() => {
        if (!reportLeading)
            return undefined;
        // Ranking rows may compose rank + portrait in a wider public leading slot (2026-10-19).
        reportLeading(hasLeading ? leadingWidth + listRowRecipe.gap : 0);
        return () => reportLeading(0);
    }, [reportLeading, hasLeading, leadingWidth]);
    const metrics = listRowRecipe.density[density];
    validateListRowTrailingAccessory(trailingAccessory);
    const accessory = trailingAccessory === "none" ? null : listRowRecipe.accessories[trailingAccessory];
    const separateActions = Boolean(trailingAction || leadingAction);
    const interactive = onPress !== undefined;
    const selected = selectedProp ?? listRowRecipe.defaults.selected;
    const resolvedMetadata = titleMetadata;
    const resolvedTrailingLabel = trailingLabel ?? trailingText;
    // The NotificationItem status·time caption and unread mark are row content; a pressable row announces only this
    // composed name, so omitting them hid the read state from screen readers (found 2026-10-23).
    const composedLabel = accessibilityLabel ?? [
        title,
        hjmUnreadLabel,
        metadataLabel,
        description,
        hjmMeta,
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
    // Inline placement (listRowRecipe.surfaceBleed, 2026-10-17 user decision): the row content sits on the container's
    // content edge and the pressable surface (pressed/selected fill, border, hit area) bleeds outward by
    // `paddingHorizontal` through the same negative margin. The selection border is part of that padding, not added to
    // it: the always-present 1pt border used to push content 1pt further than Web's inset ring (text at 25, not 24).
    const rowBorder = 1;
    const leadingRadius = listRowRecipe.leadingShapes[leadingShape];
    const leadingFrameStyle = {
        alignItems: "center",
        height: leadingSize === "large" ? avatarRecipe.sizes.large : listRowRecipe.leadingSize,
        justifyContent: "center",
        overflow: "hidden",
        width: leadingSize === "large" ? avatarRecipe.sizes.large : listRowRecipe.leadingSize,
        ...(leadingRadius === null ? {} : { borderRadius: theme.tokens.radius[leadingRadius] }),
    };
    if (loading) {
        // Search and other collections share ListRow geometry instead of approximating it with
        // loose Skeletons. Never mount placeholder actions or forward touch handlers while loading.
        // Same placeholder fill as Skeleton so a loading screen mixing both reads as one state (2026-10-17).
        const placeholder = { backgroundColor: resolveColorReference(skeletonRecipe.background, theme.palette), borderRadius: theme.tokens.radius.sm };
        return _jsxs(View, { testID: props.testID, onLayout: props.onLayout, accessible: Boolean(loadingLabel), accessibilityRole: "progressbar", accessibilityLabel: loadingLabel, accessibilityState: { busy: true }, importantForAccessibility: loadingLabel ? "yes" : "no-hide-descendants", style: [{ alignItems: "center", flexDirection: "row", direction: theme.environment.direction,
                    gap: listRowRecipe.gap, minHeight: visualState.minHeight, marginHorizontal: -metrics.paddingHorizontal,
                    paddingHorizontal: metrics.paddingHorizontal - rowBorder, paddingVertical: metrics.paddingVertical - rowBorder,
                    borderWidth: rowBorder, borderColor: "transparent" }, layoutStyle], children: [leading ? _jsx(View, { onLayout: measureLeading, style: [placeholder, leadingFrameStyle, leadingStyle] }) : null, _jsxs(View, { style: { flex: 1, minWidth: 0, gap: spacing.xxs }, children: [_jsx(View, { style: [placeholder, { width: `${listRowRecipe.loading.titleWidthPercent}%`, height: theme.tokens.typography[listRowRecipe.title.textVariant].lineHeight }] }), description ? _jsx(View, { style: [placeholder, { width: `${listRowRecipe.loading.descriptionWidthPercent}%`, height: theme.tokens.typography[listRowRecipe.description.textVariant].lineHeight }] }) : null] }), trailing || trailingText ? _jsx(View, { style: [placeholder, { width: listRowRecipe.loading.trailingWidth, height: theme.tokens.typography[listRowRecipe.trailing.textVariant].lineHeight }] }) : null, accessory ? _jsx(View, { testID: "hjm-list-row-accessory", style: { width: glyph[accessory.glyph], height: glyph[accessory.glyph],
                        ...(trailing || trailingText ? { marginStart: accessory.gap - listRowRecipe.gap } : {}) } }) : null] });
    }
    const rowContent = (_jsxs(_Fragment, { children: [leading && !leadingAction ? (_jsx(View, { onLayout: measureLeading, accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", style: [leadingFrameStyle, leadingStyle], children: leading })) : null, _jsxs(View, { style: [{ flex: 1, gap: spacing.xxs, minWidth: 0 }, contentStyle], children: [_jsxs(View, { style: [
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
                        ], variant: listRowRecipe.description.textVariant, children: description })) : null, hjmMeta ? (hjmUnreadLabel ? (_jsxs(View, { style: { alignItems: "center", flexDirection: "row", gap: notificationRowRecipe.contentGap }, children: [_jsx(Text, { variant: "caption", tone: "muted", children: hjmMeta }), _jsx(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: hjmUnreadLabel, testID: "hjm-unread-dot", style: { backgroundColor: theme.colors.contentBrand, borderRadius: notificationRowRecipe.unreadSize / 2, flexShrink: 0,
                                    height: notificationRowRecipe.unreadSize, width: notificationRowRecipe.unreadSize } })] })) : _jsx(Text, { variant: "caption", tone: "muted", children: hjmMeta })) : null] }), trailingText || trailing ? (_jsx(View, { accessible: interactive ? false : undefined, importantForAccessibility: interactive ? "no-hide-descendants" : "auto", style: [{ flexShrink: 0 }, trailingStyle], children: trailingText ? (_jsx(Text, { style: { color: resolveColorReference(listRowRecipe.trailing.textColor, theme.palette) }, variant: listRowRecipe.trailing.textVariant, children: trailingText })) : trailing })) : null, accessory ? (_jsx(View, { testID: "hjm-list-row-accessory", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", 
                // A preceding trailing value pulls the chevron to the tighter accessory gap (iOS detail → chevron).
                style: { flexShrink: 0, ...(trailing || trailingText ? { marginStart: accessory.gap - listRowRecipe.gap } : {}) }, children: _jsx(DrawnChevron, { direction: "end", size: glyph[accessory.glyph], color: resolveColorReference(accessory.color, theme.palette), strokeWidth: iconRecipe.weights[accessory.weight] }) })) : null] }));
    const contentStyleFor = (pressed) => [
        minimumTargetStyle,
        {
            alignItems: "center",
            backgroundColor: pressed
                ? resolveColorReference(listRowRecipe.states.pressedBackground, theme.palette)
                : separateActions
                    ? "transparent"
                    : visualState.backgroundColor,
            borderColor: selected && !separateActions ? theme.colors.borderControl : "transparent",
            borderWidth: separateActions ? 0 : rowBorder,
            direction: visualState.direction,
            flex: separateActions ? 1 : undefined,
            flexDirection: "row",
            gap: listRowRecipe.gap,
            minHeight: visualState.minHeight,
            opacity: separateActions ? 1 : visualState.opacity,
            // With trailingAction the outer frame owns the bleed and border; the command keeps the start padding.
            ...(separateActions
                ? { paddingStart: leadingAction ? 0 : metrics.paddingHorizontal - rowBorder, ...(trailingAction ? {} : { paddingEnd: metrics.paddingHorizontal - rowBorder }), paddingVertical: metrics.paddingVertical - rowBorder }
                : { marginHorizontal: -metrics.paddingHorizontal, paddingHorizontal: metrics.paddingHorizontal - rowBorder,
                    paddingVertical: metrics.paddingVertical - rowBorder }),
        },
        separateActions ? undefined : layoutStyle,
    ];
    const main = interactive ? (_jsx(Pressable, { ...props, accessibilityHint: accessibilityHint, accessibilityLabel: composedLabel, accessibilityRole: "button", accessibilityState: {
            ...accessibilityState,
            disabled,
            ...(selectedProp === undefined ? {} : { selected: selectedProp }),
        }, disabled: disabled, onPress: onPress, style: ({ pressed }) => contentStyleFor(pressed), children: rowContent })) : (_jsx(View, { ...props, accessibilityHint: accessibilityHint, accessibilityLabel: accessibilityLabel, accessible: accessibilityLabel === undefined ? undefined : true, style: contentStyleFor(false), children: rowContent }));
    if (!separateActions)
        return main;
    return (_jsxs(View, { ...containerProps, style: [
            {
                alignItems: "center",
                backgroundColor: visualState.backgroundColor,
                borderColor: selected ? theme.colors.borderControl : "transparent",
                borderWidth: rowBorder,
                direction: visualState.direction,
                flexDirection: "row",
                // Command and action sit listRowRecipe.gap apart, as Web's frame.
                gap: listRowRecipe.gap,
                marginHorizontal: -metrics.paddingHorizontal,
                minHeight: visualState.minHeight,
                opacity: visualState.opacity,
            },
            layoutStyle,
        ], children: [leadingAction && leading ? _jsx(View, { style: { paddingStart: metrics.paddingHorizontal - rowBorder, flexShrink: 0 }, children: _jsx(View, { onLayout: measureLeading, children: _jsx(IdentityAction, { action: leadingAction, children: leading }) }) }) : null, main, trailingAction ? _jsx(View, { style: [
                    // The action box ends on the content edge, so an `edge="end"` IconButton puts its glyph on that line.
                    { flexShrink: 0, paddingEnd: metrics.paddingHorizontal - rowBorder },
                    trailingActionStyle,
                ], children: trailingAction }) : null] }));
}
export function Avatar({ action, source, renderImage, name, initials, renderFallback, size: sizeProp = avatarRecipe.defaults.size, shape = avatarRecipe.defaults.shape, frame = avatarRecipe.defaults.frame, accessory, accessoryPlacement = avatarRecipe.defaults.accessoryPlacement, decorative = false, accessibilityLabel, layoutStyle, }) {
    const size = resolveAvatarSize(sizeProp);
    validateAvatarPresentation({ shape, frame, accessoryPlacement });
    const { palette, tokens } = useHjmNativeTheme();
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
    // A decorative avatar without a name or initials shows only its frame (or the product fallback).
    const fallback = decorative && !name?.trim() && !initials?.trim() ? null : resolveAvatarInitials(name ?? "", initials);
    const mediaAccessibility = decorative
        ? { accessible: false }
        : { accessible: true, accessibilityLabel, accessibilityRole: "image" };
    const frameRecipe = avatarRecipe.frames[frame];
    // Rounded follows the nearest design profile like Asset; circle keeps its geometry.
    const cornerRadius = shape === "rounded" ? tokens.radius.md : radius.full;
    const fallbackNode = renderFallback?.({ size, decorative: true }) ?? (fallback === null ? null
        : _jsx(Text, { align: "center", style: { color: initialsColor }, variant: initialsVariant, emphasis: avatarRecipe.initialsWeight, children: fallback }));
    // Outward overhang, as Asset/IconTile; `0 -` keeps a zero offset positive.
    const offset = 0 - avatarRecipe.accessory.offset;
    const avatarNode = (_jsxs(View, { ...mediaAccessibility, style: [{ height: size, position: "relative", width: size }, action ? undefined : layoutStyle], children: [_jsx(View, { style: {
                    alignItems: "center",
                    backgroundColor: frameRecipe.background ? resolveColorReference(frameRecipe.background, palette) : "transparent",
                    borderColor: frameRecipe.border ? resolveColorReference(frameRecipe.border, palette) : "transparent",
                    borderWidth: frameRecipe.borderWidth,
                    borderRadius: cornerRadius,
                    height: size,
                    justifyContent: "center",
                    overflow: "hidden",
                    width: size,
                }, children: source !== undefined && !failed ? (renderImage ? (_jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { height: size, width: size }, children: renderImage({ source, size, onError: failImage, fallback: fallbackNode }) })) : (_jsx(NativeImage, { accessible: false, onError: failImage, source: source, style: [{ height: size, width: size }] }))) : (_jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: fallbackNode })) }), accessory ? (_jsx(View, { style: [{ position: "absolute", end: offset }, accessoryPlacement === "top-end" ? { top: offset } : { bottom: offset }], children: accessory })) : null] }));
    return action ? _jsx(IdentityAction, { action: action, ...(layoutStyle ? { layoutStyle } : {}), children: avatarNode }) : avatarNode;
}
export function Divider({ orientation = "horizontal", inset = 0, lineStyle = dividerRecipe.defaults.lineStyle, layoutStyle }) {
    if (!Number.isFinite(inset) || inset < 0)
        throw new RangeError("Divider inset must be non-negative");
    validateDividerLineStyle(lineStyle);
    const { colors } = useHjmNativeTheme();
    const horizontal = orientation === "horizontal";
    const thickness = dividerRecipe.thickness;
    // RN `borderStyle: "dashed"` on a single side renders solid on iOS (Diairy 2026-09-19 simulator), so the dashed
    // line is drawn as recipe-sized segments across the measured length — no optional SVG peer in this entry.
    const [length, setLength] = useState(0);
    const dashed = lineStyle === "dashed" ? dividerRecipe.lineStyles.dashed : null;
    const segments = dashed && length > 0 ? Math.ceil(length / (dashed.dash + dashed.gap)) : 0;
    return (_jsx(View, { accessible: false, ...(dashed ? { onLayout: (event) => {
                const next = horizontal ? event.nativeEvent.layout.width : event.nativeEvent.layout.height;
                setLength(current => current === next ? current : next);
            } } : {}), style: [
            horizontal
                ? { backgroundColor: dashed ? undefined : colors.border, height: thickness, marginHorizontal: inset, width: "auto" }
                : { alignSelf: "stretch", backgroundColor: dashed ? undefined : colors.border, marginVertical: inset, width: thickness },
            dashed ? { flexDirection: horizontal ? "row" : "column", gap: dashed.gap, overflow: "hidden" } : null,
            layoutStyle,
        ], children: Array.from({ length: segments }, (_, index) => _jsx(View, { style: horizontal
                ? { width: dashed.dash, height: thickness, backgroundColor: colors.border }
                : { height: dashed.dash, width: thickness, backgroundColor: colors.border } }, index)) }));
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
    const { environment, colors } = useHjmNativeTheme();
    const inline = resolved.layout === "inline";
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
                gap: inline ? 0 : spacing.sm,
            },
            layoutStyle,
        ], children: resolved.items.map((item, index) => (_jsxs(View, { accessibilityLabel: `${item.label}, ${item.value}`, accessible: true, style: [{ gap: spacing.xxs, width: itemWidth }, inline && {
                    flexDirection: "row", alignItems: "flex-start", gap: spacing.sm,
                    paddingVertical: spacing.sm, borderTopWidth: index === 0 ? 0 : 1, borderColor: colors.border,
                }], children: [_jsx(Text, { accessible: false, tone: "muted", variant: "label", layoutStyle: inline ? { width: "24%" } : undefined, children: item.label }), _jsx(Text, { accessible: false, tone: "primary", layoutStyle: inline ? { flex: 1, minWidth: 0 } : undefined, children: item.value })] }, item.id))) }));
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
        ], children: _jsx(Text, { accessible: false, align: "center", style: { color: presentation[tone].content, fontWeight: counterBadgeRecipe.fontWeight }, variant: "caption", children: visibleLabel }) }));
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
                // A grouped list clips to its rounded surface, so it keeps the row surface bleed as inline padding
                // (listRecipe.grouped); a plain list lets rows bleed into the host's inset (2026-10-17).
                ...(appearance === "grouped"
                    ? {
                        backgroundColor: colors.bg,
                        borderRadius: tokens.radius.lg,
                        overflow: "hidden",
                        paddingHorizontal: listRecipe.grouped.paddingInline,
                    }
                    : {}),
            },
            layoutStyle,
        ], children: items.map((item, index) => (_jsx(ListItem, { borderColor: colors.border, separator: index < items.length - 1 ? separatorContract : null, children: item }, isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`))) }));
}
/** Decorative separator for a product-owned virtual collection; never replaces its accessible row. */
export function ListSeparator({ separator = "content", leading = false, layoutStyle }) {
    const { colors } = useHjmNativeTheme();
    const insets = listRecipe.separators[separator];
    return insets ? _jsx(ListSeparatorFrame, { color: colors.border, start: leading ? insets.leadingInsetStart : insets.insetStart, end: insets.insetEnd, layoutStyle: layoutStyle }) : null;
}
// List and virtual hosts share the actual line. List keeps its measured leading width for custom row slots.
function ListSeparatorFrame({ color, start, end, layoutStyle }) {
    // Keep host placement outside the line: Yoga's explicit logical marginStart/End would otherwise override
    // a caller's marginHorizontal even when the content-edge inset is zero.
    return _jsx(View, { accessible: false, importantForAccessibility: "no", style: layoutStyle, children: _jsx(View, { accessible: false, importantForAccessibility: "no", style: { backgroundColor: color, height: 1, marginStart: start, marginEnd: end } }) });
}
/** One list item and the separator that belongs to it (drawn after it, as an iOS cell separator). */
function ListItem({ borderColor, children, separator, }) {
    const [contentInset, setContentInset] = useState(0);
    return (_jsxs(View, { children: [_jsx(ListItemLeadingContext.Provider, { value: setContentInset, children: children }), separator ? _jsx(ListSeparatorFrame, { color: borderColor, start: separator.leadingInsetStart === separator.insetStart ? separator.insetStart : contentInset, end: separator.insetEnd }) : null] }));
}
export function Statistic(props) {
    return renderStatistic(props);
}
// StatisticGroup reuses this renderer with its calculated layout width.
function renderStatistic({ descriptor, density = "comfortable", presentation = "plain", contextLabel, accessibilityLabel, composeAccessibilityLabel, leading, valueColor, renderTrendMark, layoutStyle, }, bar = false, barDivider = false) {
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
    const labelNode = (_jsx(Text, { accessible: false, style: [
            {
                color: resolveColorReference(statisticRecipe.label.color, theme.palette),
                fontWeight: statisticRecipe.label.fontWeight,
                ...(bar ? { textAlign: "center" } : {}),
            },
        ], variant: densityContract.labelVariant, children: resolved.label }));
    return (_jsxs(View, { accessibilityLabel: announcement, accessible: true, style: [
            {
                backgroundColor: presentationContract.background
                    ? resolveColorReference(presentationContract.background, theme.palette)
                    : "transparent",
                borderColor: presentationContract.border
                    ? resolveColorReference(presentationContract.border, theme.palette)
                    : "transparent",
                borderRadius: bar ? 0 : theme.tokens.radius[presentationContract.radius],
                borderWidth: presentationContract.borderWidth,
                gap: bar ? statisticRecipe.group.bar.valueGap : densityContract.gap,
                ...(bar ? { alignItems: "center", paddingHorizontal: statisticRecipe.group.bar.cellPadding, borderStartWidth: barDivider ? 1 : 0, borderStartColor: theme.colors.border } : {}),
                minWidth: 0,
                // Plain statistics align with surrounding text; only the surface plate is inset (Web keys on data-presentation).
                padding: presentation === "surface" ? densityContract.padding : 0,
            },
            layoutStyle,
        ], children: [!bar && labelNode, _jsxs(View, { accessible: false, style: {
                    alignItems: leading ? "center" : "baseline",
                    ...(bar ? { justifyContent: "center" } : {}),
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    // A leading glyph labels its value: keep them on one line so a long value wraps beside the
                    // icon instead of dropping under a lone icon (2026-10-23 Unairplane arrival time).
                    flexWrap: leading === undefined ? "wrap" : "nowrap",
                    gap: spacing.xxs,
                    minWidth: 0,
                }, children: [leading === undefined ? null : _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flexShrink: 0 }, children: leading }), resolved.prefix ? (_jsx(Text, { accessible: false, style: [
                            {
                                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                                fontWeight: statisticRecipe.affix.fontWeight,
                            },
                        ], variant: statisticRecipe.affix.textVariant, children: resolved.prefix })) : null, _jsx(Text, { accessible: false, style: [
                            {
                                color: valueColor ?? resolveColorReference(statisticRecipe.value.color, theme.palette),
                                flexShrink: 1,
                                fontVariant: ["tabular-nums"],
                                fontWeight: statisticRecipe.value.fontWeight,
                            },
                        ], variant: densityContract.valueVariant, children: resolved.value }), resolved.suffix ? (_jsx(Text, { accessible: false, style: [
                            {
                                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                                fontWeight: statisticRecipe.affix.fontWeight,
                            },
                        ], variant: statisticRecipe.affix.textVariant, children: resolved.suffix })) : null] }), bar && labelNode, resolved.trend ? (_jsxs(View, { accessible: false, style: {
                    alignItems: "center",
                    flexDirection: "row",
                    // The mark labels its trend: one line whose label wraps beside the mark. A wrapping row dropped a long
                    // label under a lone arrow in a narrow bar cell (2026-10-23, same fault as the value row; Web is nowrap).
                    flexWrap: "nowrap",
                    gap: statisticRecipe.trend.gap,
                    minWidth: 0,
                }, children: [renderTrendMark && trendMark && trendColor ? (_jsx(View, { accessible: false, style: { flexShrink: 0 }, children: renderTrendMark({ name: trendMark, color: trendColor, size: glyph.sm }) })) : (_jsx(Text, { accessible: false, style: { color: trendColor, flexShrink: 0 }, variant: "caption", children: resolved.trend.direction === "up" ? "↑" : resolved.trend.direction === "down" ? "↓" : "—" })), _jsx(Text, { accessible: false, style: [
                            {
                                color: trendColor,
                                flexShrink: 1,
                                fontWeight: statisticRecipe.trend.fontWeight,
                            },
                        ], variant: statisticRecipe.trend.textVariant, children: resolved.trend.label })] })) : null, resolved.hint ? (_jsx(Text, { accessible: false, style: [
                    { color: resolveColorReference(statisticRecipe.hint.color, theme.palette) },
                ], variant: statisticRecipe.hint.textVariant, children: resolved.hint })) : null] }));
}
export function StatisticGroup({ label, descriptor, availableWidth, density, presentation, composeAccessibilityLabel, arrangement = "grid", renderLeading, getValueColor, renderTrendMark, layoutStyle, onLayout, ...props }) {
    assertNoRemovedStyleProps("StatisticGroup", props, ["style", "itemStyle"]);
    validateStatisticGroup(descriptor);
    const { width: windowWidth } = useWindowDimensions();
    const { environment, colors } = useHjmNativeTheme();
    const [measuredWidth, setMeasuredWidth] = useState(null);
    const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
    if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
        throw new RangeError("StatisticGroup availableWidth must be positive");
    }
    const requested = descriptor.columns ?? statisticRecipe.defaults.columns;
    const minItemWidth = statisticRecipe.group.minItemWidth * Math.max(1, environment.textScale);
    let columns = arrangement === "bar" ? descriptor.items.length : requested;
    const gap = arrangement === "bar" ? 0 : statisticRecipe.group.gap;
    while (arrangement !== "bar" && columns > 1 &&
        (innerWidth - gap * (columns - 1)) / columns < minItemWidth) {
        columns -= 1;
    }
    const itemWidth = (innerWidth - gap * (columns - 1)) / columns;
    const remainder = descriptor.items.length % columns;
    const finalRowCount = remainder === 0 ? columns : remainder;
    const finalRowStart = descriptor.items.length - finalRowCount;
    const finalRowItemWidth = finalRowCount === columns
        ? itemWidth
        : (innerWidth - gap * (finalRowCount - 1)) / finalRowCount;
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
                gap,
            },
            layoutStyle,
        ], children: descriptor.items.map((item, index) => {
            const valueColor = getValueColor?.(item);
            return (_jsx(StatisticGroupItem, { bar: arrangement === "bar", barDivider: index > 0, ...(valueColor ? { valueColor } : {}), ...(renderLeading ? { leading: renderLeading(item, { color: valueColor ?? colors.text, size: statisticRecipe.group.bar.iconSize }) } : {}), contextLabel: label, descriptor: item, ...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel }), ...(density === undefined ? {} : { density }), ...(presentation === undefined ? {} : { presentation }), ...(renderTrendMark === undefined ? {} : { renderTrendMark }), layoutStyle: { width: index >= finalRowStart ? finalRowItemWidth : itemWidth } }, item.id));
        }) }));
}
/** Group cell: same render as Statistic without attributing the group's styles to the caller. */
function StatisticGroupItem({ bar, barDivider, ...props }) {
    return renderStatistic(props, bar, barDivider);
}
/** Ordered record of completed events; unlike Steps it has no current cursor. */
export function Timeline({ items, composeAccessibleName, renderMetadata, renderActions, renderList, selectedId, onSelectedIdChange, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Timeline", props, ["style"]);
    const theme = useHjmNativeTheme();
    validateTimelineSelection(selectedId, onSelectedIdChange, { hasActions: renderActions !== undefined });
    const selectable = onSelectedIdChange !== undefined;
    const resolved = resolveTimelineDescriptor(selectable ? { items, selectedId: selectedId ?? null } : { items }, { composeAccessibleName });
    // Dot, label first line and timestamp share the label's rendered first line box (token × text scale), matching
    // Web's 1lh anchor (2026-10-17 measured audit: the dot sat at the top and the caption rode the baseline).
    const labelLineHeight = theme.tokens.typography[timelineRecipe.label.textVariant].lineHeight * theme.textScaling.scale;
    const renderRecord = (item, index) => {
        const actions = renderActions?.(item);
        const tone = timelineRecipe.dot.tones[item.tone];
        const accessibilityLabel = [
            item.accessibleName,
            item.description,
            item.timestamp,
        ]
            .filter(Boolean)
            .join(", ");
        const selectedStyle = timelineRecipe.item.selected;
        // A selectable record always carries its 1pt ring (transparent until selected) inside the recipe padding, so
        // selecting never shifts the text — the same rule as ListRow's selection border.
        const recordStyle = {
            flexDirection: "row",
            gap: spacing.sm,
            padding: selectable ? timelineRecipe.item.padding - selectedStyle.borderWidth : timelineRecipe.item.padding,
            borderRadius: radius.md,
            backgroundColor: item.selected
                ? resolveColorReference(selectedStyle.background, theme.palette)
                : item.emphasized ? resolveColorReference(timelineRecipe.item.emphasisBackground, theme.palette) : undefined,
            ...(selectable ? {
                borderWidth: selectedStyle.borderWidth,
                borderColor: item.selected ? resolveColorReference(selectedStyle.border, theme.palette) : "transparent",
            } : {}),
        };
        const Record = selectable ? Pressable : View;
        return (_jsxs(Record, { accessible: !actions, accessibilityLabel: actions ? undefined : accessibilityLabel, ...(selectable ? {
                accessibilityRole: "button",
                accessibilityState: { selected: item.selected },
                onPress: () => { if (item.id !== selectedId)
                    onSelectedIdChange?.(item.id); },
            } : {}), style: recordStyle, children: [_jsxs(View, { importantForAccessibility: "no-hide-descendants", style: { alignItems: "center", width: 16 }, children: [_jsx(View, { style: {
                                backgroundColor: resolveColorReference(tone.fill, theme.palette),
                                borderColor: tone.border
                                    ? resolveColorReference(tone.border, theme.palette)
                                    : "transparent",
                                borderRadius: radius.full,
                                borderWidth: tone.border
                                    ? timelineRecipe.dot.borderWidth
                                    : 0,
                                height: timelineRecipe.dot.diameter,
                                marginTop: (labelLineHeight - timelineRecipe.dot.diameter) / 2,
                                width: timelineRecipe.dot.diameter,
                            } }), index < resolved.length - 1 ? (_jsx(View, { style: {
                                backgroundColor: resolveColorReference(timelineRecipe.connector.tone, theme.palette),
                                position: "absolute",
                                top: (labelLineHeight + timelineRecipe.dot.diameter) / 2,
                                bottom: -timelineRecipe.gap - 2 * timelineRecipe.item.padding - labelLineHeight / 2,
                                width: timelineRecipe.connector.width,
                            } })) : null] }), _jsxs(View, { accessible: !!actions, accessibilityLabel: actions ? accessibilityLabel : undefined, importantForAccessibility: actions ? "auto" : "no-hide-descendants", style: { flex: 1, gap: spacing.xxs, minWidth: 0, paddingBottom: spacing.xxs }, children: [_jsxs(View, { style: {
                                alignItems: "flex-start",
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: spacing.xs,
                            }, children: [_jsx(Text, { emphasis: "medium", style: {
                                        color: resolveColorReference(timelineRecipe.label.color, theme.palette),
                                    }, variant: timelineRecipe.label.textVariant, children: item.label }), renderMetadata?.(item)] }), item.description ? (_jsx(Text, { style: {
                                color: resolveColorReference(timelineRecipe.description.color, theme.palette),
                            }, variant: timelineRecipe.description.textVariant, children: item.description })) : null, item.timestamp ? _jsx(Text, { tone: "muted", variant: timelineRecipe.timestamp.textVariant, children: item.timestamp }) : null] }), actions ? _jsx(View, { style: { flexDirection: "row", alignSelf: "center", alignItems: "center", gap: spacing.xs }, children: actions }) : null] }, item.id));
    };
    return _jsx(View, { ...props, style: [renderList ? {} : { gap: timelineRecipe.gap }, layoutStyle], children: renderList ? renderList({ items: resolved, renderItem: renderRecord, separator: _jsx(View, { style: { height: timelineRecipe.gap } }) }) : resolved.map(renderRecord) });
}
//# sourceMappingURL=data-display.js.map