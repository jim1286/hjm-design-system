import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { easing, glyph, spacing } from "@hjmds/design-contracts/foundations";
import { resolveControlAccessibleName, } from "@hjmds/design-contracts/behaviors";
import { emptyStateRecipe, noticeRecipe, progressRecipe, skeletonRecipe, textRecipe, toastRecipe, } from "@hjmds/design-contracts/recipes";
import { resolveResultDescriptor, resultRecipe, } from "@hjmds/design-contracts/components/result";
import { liquidToastRecipe, createToastSession, createToastStore, resolveToastDescriptor, toastBehaviorDefaults, } from "@hjmds/design-contracts/components/toast";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, } from "react";
import { Text as NativeText, AccessibilityInfo, Animated, AppState, Easing, Keyboard, Platform, Pressable, View, useWindowDimensions, } from "react-native";
import { buttonRecipe } from "@hjmds/design-contracts/recipes/base";
import { Button, IconButton } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Notice({ title, description, tone = noticeRecipe.defaults.tone, announcement = "none", icon, renderIcon, action, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Notice", props, ["style"]);
    const theme = useHjmNativeTheme();
    const toneContract = noticeRecipe.tones[tone];
    const foreground = resolveColorReference(toneContract.foreground, theme.palette);
    const announcementText = [title, description].filter(Boolean).join(". ");
    useEffect(() => {
        if (Platform.OS !== "ios" || announcement === "none")
            return;
        AccessibilityInfo.announceForAccessibilityWithOptions(announcementText, {
            queue: announcement === "polite",
        });
    }, [announcement, announcementText]);
    const resolvedIcon = icon ?? renderIcon?.({
        tone,
        color: foreground,
        size: glyph[noticeRecipe.iconSize],
    });
    // The icon box spans the title's rendered first line (token × text scale) so the glyph centers on it at any text
    // scale, like Web's 1lh anchor (2026-10-17 measured audit). The action stays under the copy on Native.
    const titleLineHeight = theme.tokens.typography[noticeRecipe.title.textVariant].lineHeight * theme.textScaling.scale;
    return (_jsxs(View, { ...props, accessibilityLiveRegion: announcement, accessibilityRole: announcement === "assertive" ? "alert" : undefined, style: [
            {
                backgroundColor: resolveColorReference(toneContract.background, theme.palette),
                borderColor: resolveColorReference(toneContract.border, theme.palette),
                borderRadius: theme.tokens.radius[noticeRecipe.radius],
                borderWidth: noticeRecipe.borderWidth,
                gap: noticeRecipe.gap,
                padding: noticeRecipe.padding,
            },
            layoutStyle,
        ], children: [_jsxs(View, { style: {
                    alignItems: "flex-start",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    gap: noticeRecipe.gap,
                }, children: [resolvedIcon === undefined ? null : (_jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: {
                            alignItems: "center",
                            height: Math.max(glyph[noticeRecipe.iconSize], titleLineHeight),
                            justifyContent: "center",
                            width: glyph[noticeRecipe.iconSize],
                        }, children: resolvedIcon })), _jsxs(View, { style: { flex: 1, gap: noticeRecipe.contentGap, minWidth: 0 }, children: [_jsx(Text, { style: { color: foreground, fontWeight: noticeRecipe.title.fontWeight }, variant: noticeRecipe.title.textVariant, children: title }), description ? (_jsx(Text, { style: { color: resolveColorReference(noticeRecipe.description.color, theme.palette) }, variant: noticeRecipe.description.textVariant, children: description })) : null] })] }), action] }));
}
export function EmptyState({ title, description, illustration, action, density = emptyStateRecipe.defaults.density, align = "center", announcement = "none", accessibilityLabel, titleRole = "header", layoutStyle, ...props }) {
    assertNoRemovedStyleProps("EmptyState", props, ["style", "illustrationStyle", "titleStyle", "descriptionStyle", "actionStyle"]);
    const theme = useHjmNativeTheme();
    const contentLabel = [title, description].filter(Boolean).join(", ");
    const announcementText = accessibilityLabel ?? [title, description].filter(Boolean).join(". ");
    if (!announcementText) {
        throw new TypeError("EmptyState requires title, description, or accessibilityLabel");
    }
    useEffect(() => {
        if (Platform.OS !== "ios" || announcement === "none")
            return;
        AccessibilityInfo.announceForAccessibilityWithOptions(announcementText, {
            queue: announcement === "polite",
        });
    }, [announcement, announcementText]);
    const usesUpperSpacers = align === "upper" && density !== "compact";
    return (_jsxs(View, { ...props, accessibilityLabel: accessibilityLabel ?? contentLabel, accessible: false, style: [
            {
                alignItems: "center",
                flexGrow: density === "compact" ? 0 : 1,
                gap: emptyStateRecipe.gap,
                justifyContent: align === "center" ? "center" : "flex-start",
                paddingHorizontal: emptyStateRecipe.paddingHorizontal,
                paddingVertical: emptyStateRecipe.density[density].paddingVertical,
            },
            layoutStyle,
        ], children: [announcement === "none" || Platform.OS === "ios" ? null : (_jsx(Text, { accessibilityLabel: announcementText, accessibilityLiveRegion: announcement, accessibilityRole: announcement === "assertive" ? "alert" : undefined, accessible: true, style: { height: 1, opacity: 0, position: "absolute", width: 1 }, children: announcementText })), usesUpperSpacers ? _jsx(View, { accessible: false, style: { flexGrow: 1 } }) : null, illustration ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: [
                    {
                        alignItems: "center",
                        // Larger illustrations own their intrinsic size; icons retain a minimum frame.
                        minHeight: glyph[emptyStateRecipe.icon.size],
                        justifyContent: "center",
                        minWidth: glyph[emptyStateRecipe.icon.size],
                    },
                ], children: illustration })) : null, title === undefined ? null : _jsx(Text, { align: "center", accessibilityRole: titleRole, style: [
                    {
                        color: resolveColorReference(emptyStateRecipe.title.color, theme.palette),
                        fontWeight: emptyStateRecipe.title.fontWeight,
                    },
                ], variant: emptyStateRecipe.title.textVariant, children: title }), description ? (_jsx(Text, { align: "center", style: [
                    {
                        color: resolveColorReference(emptyStateRecipe.description.color, theme.palette),
                    },
                ], variant: emptyStateRecipe.description.textVariant, children: description })) : null, action ? _jsx(View, { children: action }) : null, usesUpperSpacers ? _jsx(View, { accessible: false, style: { flexGrow: 3 } }) : null] }));
}
/** Terminal flow outcome with platform announcement and canonical actions. */
export function Result({ status, title, description, actions, renderIcon, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Result", props, ["style"]);
    const theme = useHjmNativeTheme();
    const result = resolveResultDescriptor({
        status,
        title,
        ...(description === undefined ? {} : { description }),
        ...(actions === undefined ? {} : { actions }),
    });
    const tone = resultRecipe.tones[result.status];
    const iconColor = resolveColorReference(tone.icon, theme.palette);
    const iconBackgroundColor = resolveColorReference(tone.iconBackground, theme.palette);
    const failureAnnouncement = [result.title, result.description]
        .filter(Boolean)
        .join(". ");
    useEffect(() => {
        if (result.status !== "failure" ||
            failureAnnouncement.length === 0 ||
            Platform.OS !== "ios") {
            return undefined;
        }
        const frame = requestAnimationFrame(() => {
            AccessibilityInfo.announceForAccessibilityWithOptions(failureAnnouncement, { queue: false });
        });
        return () => cancelAnimationFrame(frame);
    }, [failureAnnouncement, result.status]);
    return (_jsxs(View, { ...props, style: [
            {
                alignItems: "center",
                gap: resultRecipe.gap,
                paddingHorizontal: resultRecipe.paddingHorizontal,
                paddingVertical: resultRecipe.paddingVertical,
            },
            layoutStyle,
        ], children: [_jsx(View, { accessible: false, style: {
                    alignItems: "center",
                    backgroundColor: iconBackgroundColor,
                    borderRadius: theme.tokens.radius.full,
                    height: 56,
                    justifyContent: "center",
                    width: 56,
                }, children: renderIcon ? renderIcon({
                    status: result.status,
                    color: iconColor,
                    backgroundColor: iconBackgroundColor,
                }) : (_jsx(Text, { emphasis: "strong", style: { color: iconColor }, variant: "heading", children: resultRecipe.glyphs[result.status] })) }), _jsx(Text, { accessibilityLiveRegion: result.status === "failure" ? "assertive" : "none", accessibilityRole: "header", align: "center", emphasis: "strong", style: {
                    color: resolveColorReference(resultRecipe.title.color, theme.palette),
                    maxWidth: 520,
                }, variant: resultRecipe.title.textVariant, children: result.title }), result.description ? (_jsx(Text, { align: "center", style: {
                    color: resolveColorReference(resultRecipe.description.color, theme.palette),
                    maxWidth: 520,
                }, variant: resultRecipe.description.textVariant, children: result.description })) : null, result.primaryAction || result.secondaryAction ? (_jsxs(View, { style: {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: resultRecipe.actionsGap,
                    justifyContent: "center",
                    marginTop: spacing.xs,
                }, children: [result.secondaryAction ? (_jsx(Button, { accessibilityLabel: result.secondaryAction.accessibilityLabel, onPress: result.secondaryAction.onAction, tone: "secondary", children: result.secondaryAction.label })) : null, result.primaryAction ? (_jsx(Button, { accessibilityLabel: result.primaryAction.accessibilityLabel, onPress: result.primaryAction.onAction, children: result.primaryAction.label })) : null] })) : null] }));
}
export function Progress({ value, max = progressRecipe.defaults.max, label, accessibilityLabel, valueText, accessibilityHint, size = progressRecipe.defaults.size, tone = progressRecipe.defaults.tone, shape = progressRecipe.defaults.shape, children, layoutStyle, testID, }) {
    if (!Number.isFinite(max) || max <= 0) {
        throw new RangeError("Progress max must be a positive finite number");
    }
    if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > max)) {
        throw new RangeError("Progress value must be between zero and max");
    }
    const theme = useHjmNativeTheme();
    const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Progress");
    const percentage = value === undefined ? undefined : Math.round((value / max) * 100);
    const resolvedValueText = valueText ?? (percentage === undefined ? undefined : `${percentage}%`);
    return (_jsxs(View, { accessibilityHint: accessibilityHint, accessibilityLabel: accessibleName, accessibilityRole: "progressbar", accessibilityState: value === undefined ? { busy: true } : undefined, accessibilityValue: {
            min: 0,
            max: 100,
            ...(percentage === undefined ? {} : { now: percentage }),
            ...(resolvedValueText === undefined ? {} : { text: resolvedValueText }),
        }, testID: testID, style: [{ gap: spacing.xs }, layoutStyle], children: [label === undefined ? null : (_jsxs(View, { accessible: false, style: {
                    alignItems: "center",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }, children: [_jsx(Text, { variant: "label", children: label }), resolvedValueText ? (_jsx(Text, { tone: "muted", variant: "caption", children: resolvedValueText })) : null] })), shape === "circular" ? (_jsxs(View, { accessible: false, style: [
                    {
                        alignItems: "center",
                        borderColor: resolveColorReference(progressRecipe.track, theme.palette),
                        borderRadius: progressRecipe.circular.sizes[size] / 2,
                        borderWidth: progressRecipe.circular.strokeWidth[size],
                        height: progressRecipe.circular.sizes[size],
                        justifyContent: "center",
                        width: progressRecipe.circular.sizes[size],
                    },
                ], children: [[0, 1].map(half => {
                        const diameter = progressRecipe.circular.sizes[size];
                        const fraction = (percentage ?? 25) / 100;
                        const sweep = Math.max(0, Math.min(1, fraction * 2 - half));
                        if (sweep === 0)
                            return null;
                        const left = half === 0 ? diameter / 2 : 0;
                        return _jsx(View, { pointerEvents: "none", style: { position: "absolute", top: -progressRecipe.circular.strokeWidth[size], left: left - progressRecipe.circular.strokeWidth[size], width: diameter / 2, height: diameter, overflow: "hidden" }, children: _jsx(View, { style: { position: "absolute", left: -left, width: diameter, height: diameter, transform: [{ rotate: `${(sweep - 1) * 180}deg` }] }, children: _jsx(View, { style: { position: "absolute", left, width: diameter / 2, height: diameter, overflow: "hidden" }, children: _jsx(View, { style: [{ position: "absolute", left: -left, width: diameter, height: diameter, borderRadius: diameter / 2, borderWidth: progressRecipe.circular.strokeWidth[size], borderColor: resolveColorReference(progressRecipe.tones[tone], theme.palette) }] }) }) }) }, half);
                    }), children] })) : (_jsx(View, { accessible: false, style: [
                    {
                        backgroundColor: resolveColorReference(progressRecipe.track, theme.palette),
                        borderRadius: theme.tokens.radius[progressRecipe.radius],
                        height: progressRecipe.sizes[size],
                        overflow: "hidden",
                    },
                ], children: _jsx(View, { style: [
                        {
                            backgroundColor: resolveColorReference(progressRecipe.tones[tone], theme.palette),
                            height: "100%",
                            width: `${percentage ?? 30}%`,
                        },
                    ] }) }))] }));
}
export { Spinner } from "./internal/spinner.js";
/**
 * Consumes the same skeletonRecipe as the web renderer. Until 0.10.0 this drew a
 * static View at a fixed height of 16, reading neither the recipe shapes nor its
 * animation, so the two surfaces sharing one contract looked different.
 *
 * width/height/radius stay for callers already on the 0.9 train and win over
 * `shape`. Migration: .changeset/skeleton-pulse-by-default.md
 */
export function Skeleton({ shape = skeletonRecipe.defaults.shape, animated = skeletonRecipe.defaults.animated, lines = skeletonRecipe.defaults.lines, buttonShape = buttonRecipe.defaults.shape, width, height, radius: radiusValue, accessibilityLabel, layoutStyle, }) {
    const { environment, palette, tokens } = useHjmNativeTheme();
    const shapeSpec = skeletonRecipe.shapes[shape];
    const { duration, easing: easingName, fromOpacity, toOpacity } = skeletonRecipe.animation;
    // The recipe declares reducedMotion: "static". Rather than running the pulse
    // at a 0ms duration, pin the progress value to the opaque end of the range.
    const shouldAnimate = animated && !environment.reducedMotion;
    const [pulse] = useState(() => new Animated.Value(shouldAnimate ? 0 : 1));
    useEffect(() => {
        if (!shouldAnimate) {
            pulse.stopAnimation();
            pulse.setValue(1);
            return undefined;
        }
        const curve = easing[easingName];
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(pulse, {
                duration,
                easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(pulse, {
                duration,
                easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
                toValue: 0,
                useNativeDriver: true,
            }),
        ]));
        loop.start();
        return () => loop.stop();
    }, [duration, easingName, pulse, shouldAnimate]);
    const opacity = shouldAnimate
        ? pulse.interpolate({ inputRange: [0, 1], outputRange: [fromOpacity, toOpacity] })
        : toOpacity;
    // Filled placeholder, no outline: canvas + hairline was invisible on white (2026-10-17, skeleton.md rationale).
    const fill = {
        backgroundColor: resolveColorReference(skeletonRecipe.background, palette),
        // A button placeholder takes the corner from the same Button shape axis and theme radius as Button itself.
        borderRadius: radiusValue ?? tokens.radius[shape === "button" ? buttonRecipe.shapes[buttonShape] : shapeSpec.radius],
    };
    // A labelled skeleton is the region's single busy announcement; an unlabelled one is hidden on both platforms.
    const accessibility = {
        accessibilityLabel,
        accessibilityState: accessibilityLabel ? { busy: true } : undefined,
        accessible: accessibilityLabel !== undefined,
        importantForAccessibility: accessibilityLabel ? "yes" : "no-hide-descendants",
    };
    const lineCount = shape === "text" ? Math.max(1, Math.floor(lines)) : 1;
    if (lineCount > 1) {
        const lineHeight = height ?? shapeSpec.defaultHeight;
        // One pulse on the group keeps the lines in phase.
        return (_jsx(Animated.View, { ...accessibility, style: [{ gap: skeletonRecipe.lines.gap, opacity, width: width ?? "100%" }, layoutStyle], children: Array.from({ length: lineCount }, (_, index) => (_jsx(View, { style: [fill, {
                        height: lineHeight,
                        width: index === lineCount - 1 ? `${skeletonRecipe.lines.lastLineWidthPercent}%` : "100%",
                    }] }, index))) }));
    }
    const resolvedWidth = width ?? (shape === "circle" ? shapeSpec.defaultHeight ?? undefined : "100%");
    const resolvedHeight = height ?? shapeSpec.defaultHeight ?? undefined;
    return (_jsx(Animated.View, { ...accessibility, style: [
            {
                ...fill,
                ...(resolvedHeight === undefined && shapeSpec.aspectRatio !== null
                    ? { aspectRatio: shapeSpec.aspectRatio }
                    : { height: resolvedHeight }),
                // An avatar beside text lines keeps its diameter in a row (Web: flex: none).
                ...(shape === "circle" ? { flexShrink: 0 } : {}),
                opacity,
                width: resolvedWidth,
            },
            layoutStyle,
        ] }));
}
const toastActionAlign = { start: "flex-start", end: "flex-end" };
// Step dots beside their labels so state never depends on colour alone (WCAG 1.4.1). The spoken message
// already names the running step (resolveToastDescriptor), so the dots are hidden from assistive technology.
function ToastProgressRow({ progress }) {
    const theme = useHjmNativeTheme();
    const contract = toastRecipe.progress;
    return (_jsx(View, { style: { alignItems: "center", columnGap: contract.gap, direction: theme.environment.direction, flexDirection: "row", flexWrap: "wrap", marginTop: spacing.xxs, rowGap: spacing.xxs }, children: progress.steps.map((step, index) => {
            const state = index < progress.current ? "done" : index === progress.current ? "current" : "upcoming";
            return (_jsxs(View, { style: { alignItems: "center", flexDirection: "row", gap: spacing.xxs }, children: [_jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: {
                            backgroundColor: resolveColorReference(state === "upcoming" ? contract.upcomingColor : contract.doneColor, theme.palette),
                            borderRadius: contract.dotSize / 2,
                            height: contract.dotSize,
                            transform: [{ scale: state === "current" ? contract.currentScale : 1 }],
                            width: contract.dotSize,
                        } }), _jsx(Text, { style: {
                            color: resolveColorReference(state === "current" ? contract.currentLabelColor : contract.labelColor, theme.palette),
                            ...(state === "current" ? { fontWeight: textRecipe.emphasis.strong } : {}),
                        }, variant: contract.textVariant, children: step })] }, `${index}-${step}`));
        }) }));
}
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
function ToastSurface({ snapshot, managedMotion = false, announces = true, suspended = false, onDismiss, onAction, onPress, onExitComplete, onPause, onResume, placement, renderToneIcon, style, }) {
    const resolved = snapshot.descriptor;
    const [pressFocused, setPressFocused] = useState(false);
    const theme = useHjmNativeTheme();
    // Managed liquid presentation owns its shadow; ordinary toast chrome follows
    // the profile floating role, preserving the recipe for consumers without one.
    const surfaceShadow = theme.designProfile?.tokens.shadow.floating ?? toastRecipe.surface.shadow;
    // RN content clipping and the optional Skia card must resolve the same corner;
    // preserve the liquid recipe for existing consumers without a profile.
    const surfaceRadius = managedMotion ? theme.designProfile?.tokens.radius[toastRecipe.surface.radius] ?? liquidToastRecipe.radius : theme.tokens.radius[toastRecipe.surface.radius];
    const [motionProgress] = useState(() => new Animated.Value(theme.environment.reducedMotion ? 1 : 0));
    const exitCompleteRef = useRef(onExitComplete);
    exitCompleteRef.current = onExitComplete;
    const tone = toastRecipe.tones[resolved.tone];
    const accent = resolveColorReference(tone.accent, theme.palette);
    const badge = resolveColorReference(tone.badge, theme.palette);
    const background = resolveColorReference(toastRecipe.surface.background, theme.palette);
    const border = resolveColorReference(toastRecipe.surface.border, theme.palette);
    const pauseFocus = () => onPause("focus");
    const resumeFocus = () => onResume("focus");
    const blockEdge = toastRecipe.placements[placement].blockEdge;
    const entryOffset = blockEdge === "top" ? -12 : 12;
    useEffect(() => {
        if (managedMotion || snapshot.phase === "queued" || snapshot.phase === "closed")
            return;
        const phase = snapshot.phase === "closing" ? "exit" : "enter";
        const transition = toastRecipe.transition.native[phase];
        const target = phase === "exit" ? 0 : 1;
        const duration = theme.environment.reducedMotion || suspended ? 0 : transition.duration;
        motionProgress.stopAnimation();
        if (duration === 0) {
            motionProgress.setValue(target);
            if (phase === "exit")
                exitCompleteRef.current();
            return;
        }
        const curve = easing[transition.easing];
        const animation = Animated.timing(motionProgress, {
            duration,
            easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
            toValue: target,
            useNativeDriver: true,
        });
        animation.start(({ finished }) => {
            if (finished && phase === "exit")
                exitCompleteRef.current();
        });
        return () => animation.stop();
    }, [managedMotion, suspended, motionProgress, snapshot.phase, theme.environment.reducedMotion]);
    useEffect(() => {
        if (!announces || suspended || Platform.OS !== "ios" || snapshot.phase !== "visible")
            return;
        AccessibilityInfo.announceForAccessibilityWithOptions(resolved.announcement, {
            queue: resolved.priority !== "high",
        });
    }, [resolved.announcement, resolved.id, resolved.priority, snapshot.phase, suspended, announces]);
    if (snapshot.phase === "queued" || snapshot.phase === "closed")
        return null;
    const translateY = managedMotion || theme.environment.reducedMotion
        ? 0
        : motionProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOffset, 0] });
    const renderedToneIcon = renderToneIcon?.({
        color: accent,
        mark: tone.mark,
        size: glyph[toastRecipe.icon.glyph],
        tone: resolved.tone,
    });
    // First-line anchor (toastRecipe.anchor, 2026-10-17): centre the first copy line on the badge box using the line
    // height Text actually renders (token × the Provider's controlled or OS text scale), so badge/media column, first
    // line and close share one centre and extra lines grow downward. Negative when a large line exceeds the box.
    const firstLineVariant = resolved.title ? toastRecipe.title.textVariant : toastRecipe.description.textVariant;
    const firstLineHeight = theme.tokens.typography[firstLineVariant].lineHeight * theme.textScaling.scale;
    const firstLineInset = (toastRecipe.anchor.blockSize - firstLineHeight) / 2;
    const closeControl = _jsx(IconButton, { label: resolved.closeLabel, onBlur: resumeFocus, onFocus: pauseFocus, onPress: () => onDismiss("close-action"), 
        // The 44 target overhangs: block so it centres on the anchor without stretching the row, inline-end so the glyph
        // (not the hit area) ends at the md padding edge like the badge's start inset (toastRecipe.close).
        layoutStyle: { marginVertical: -toastRecipe.close.blockOverhang, marginEnd: -toastRecipe.close.inlineOverhang }, children: _jsx(NativeText, { accessible: false, allowFontScaling: false, style: { color: theme.colors.textMuted, fontSize: glyph[toastRecipe.close.glyph] }, children: "\u00D7" }) });
    return (_jsxs(Animated.View, { accessible: false, onTouchCancel: () => onResume("pointer"), onTouchEnd: () => onResume("pointer"), onTouchStart: () => onPause("pointer"), style: [
            {
                alignItems: "stretch",
                // Liquid owns the surface; a second RN fill/border/shadow produced a double rim on iPhone (2026-10-01).
                backgroundColor: managedMotion ? "transparent" : background,
                borderColor: border,
                borderRadius: surfaceRadius,
                borderWidth: managedMotion ? 0 : toastRecipe.surface.borderWidth,
                gap: toastRecipe.surface.gap,
                maxWidth: toastRecipe.surface.maxWidth,
                minHeight: managedMotion ? liquidToastRecipe.minHeight : toastRecipe.surface.minHeight,
                opacity: managedMotion ? 1 : motionProgress,
                overflow: "hidden",
                paddingHorizontal: toastRecipe.surface.padding.inline,
                paddingVertical: toastRecipe.surface.padding.block,
                shadowColor: surfaceShadow.color,
                shadowOffset: { width: 0, height: surfaceShadow.offsetY },
                shadowOpacity: managedMotion ? 0 : surfaceShadow.opacity,
                shadowRadius: surfaceShadow.radius,
                transform: [{ translateY }],
                width: "100%",
            },
            style,
        ], children: [resolved.press ? (
            // A sibling hit surface lets text/media/padding activate the card while the
            // explicit controls stay separate accessibility targets. Liquid's parent
            // PanResponder can cancel this Pressable when it claims an upward swipe.
            _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: resolved.press.accessibilityLabel, accessibilityHint: resolved.announcement, disabled: snapshot.phase !== "visible" || suspended, onPress: onPress, onFocus: () => { setPressFocused(true); pauseFocus(); }, onBlur: () => { setPressFocused(false); resumeFocus(); }, style: ({ pressed }) => ({
                    position: "absolute", top: 0, bottom: 0, start: 0, end: 0,
                    borderRadius: surfaceRadius,
                    borderWidth: pressFocused || pressed ? toastRecipe.states.focus.width : 0,
                    borderColor: resolveColorReference(toastRecipe.states.focus.color, theme.palette),
                }) })) : null, !announces || Platform.OS === "ios" ? null : (_jsx(Text, { accessibilityLabel: resolved.announcement, accessibilityLiveRegion: resolved.priority === "high" ? "assertive" : "polite", accessibilityRole: resolved.priority === "high" ? "alert" : undefined, accessible: true, style: { height: 1, opacity: 0, position: "absolute", width: 1 }, children: resolved.announcement })), _jsxs(View, { pointerEvents: resolved.press ? "box-none" : "auto", style: {
                    // Start-aligned so a multi-line or large-text toast keeps its badge beside the title (Web does the same).
                    alignItems: "flex-start",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    gap: toastRecipe.surface.gap,
                }, children: [resolved.media !== null ? (
                    // Product media replaces the tone badge in the same column; it is decorative, the copy carries meaning.
                    _jsx(View, { pointerEvents: resolved.press ? "none" : "auto", accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: {
                            alignItems: "center",
                            borderRadius: theme.tokens.radius.full,
                            flexShrink: 0,
                            height: toastRecipe.media.size,
                            justifyContent: "center",
                            overflow: "hidden",
                            width: toastRecipe.media.size,
                        }, children: resolved.media })) : renderedToneIcon === undefined ? null : (_jsx(View, { pointerEvents: resolved.press ? "none" : "auto", accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: {
                            alignItems: "center",
                            backgroundColor: badge,
                            borderRadius: theme.tokens.radius[toastRecipe.icon.badgeRadius],
                            flexShrink: 0,
                            height: toastRecipe.icon.badgeDiameter,
                            justifyContent: "center",
                            width: toastRecipe.icon.badgeDiameter,
                        }, children: renderedToneIcon })), _jsxs(View, { pointerEvents: resolved.press ? "box-none" : "auto", style: { flex: 1, gap: toastRecipe.content.gap, minHeight: toastRecipe.anchor.blockSize, minWidth: 0 }, children: [_jsxs(View, { pointerEvents: resolved.press ? "none" : "auto", style: { gap: toastRecipe.content.gap, marginTop: firstLineInset }, children: [resolved.title ? (_jsx(Text, { style: {
                                            color: resolveColorReference(toastRecipe.title.color, theme.palette),
                                            fontWeight: toastRecipe.title.fontWeight,
                                        }, variant: toastRecipe.title.textVariant, children: resolved.title })) : null, _jsx(Text, { style: { color: resolveColorReference(toastRecipe.description.color, theme.palette) }, variant: toastRecipe.description.textVariant, children: resolved.description }), resolved.progress ? _jsx(ToastProgressRow, { progress: resolved.progress }) : null] }), resolved.action ? (
                            // 1.10.0 tinted pill; 1.20 panel: under the copy at the start edge (toastRecipe.action.align).
                            _jsx(Pressable, { accessibilityLabel: resolved.action.accessibilityLabel, accessibilityRole: "button", onBlur: resumeFocus, onFocus: pauseFocus, onPress: onAction, style: ({ pressed }) => ({
                                    alignItems: "center",
                                    alignSelf: toastActionAlign[toastRecipe.action.align],
                                    backgroundColor: resolveColorReference(toastRecipe.action.background, theme.palette),
                                    borderRadius: theme.tokens.radius[toastRecipe.action.radius],
                                    justifyContent: "center",
                                    marginTop: spacing.xs,
                                    minHeight: toastRecipe.action.minHeight,
                                    opacity: pressed ? toastRecipe.states.pressedOpacity : 1,
                                    paddingHorizontal: toastRecipe.action.paddingHorizontal,
                                }), children: _jsx(Text, { fontRole: "ui", style: {
                                        color: resolveColorReference(toastRecipe.action.color, theme.palette),
                                        fontWeight: toastRecipe.action.fontWeight,
                                    }, variant: toastRecipe.action.textVariant, children: resolved.action.label }) })) : null] }), closeControl] })] }));
}
/** One Native toast driven by the same exactly-once session as a queued region. */
export function Toast({ descriptor, onDismiss, placement = toastRecipe.defaults.placement, renderToneIcon, layoutStyle, }) {
    const descriptorRef = useRef(descriptor);
    const additionalDismissRef = useRef(onDismiss);
    descriptorRef.current = descriptor;
    additionalDismissRef.current = onDismiss;
    const decorate = useCallback((next) => ({
        ...next,
        onDismiss: (reason) => {
            descriptorRef.current.onDismiss?.(reason);
            additionalDismissRef.current?.(reason);
        },
    }), []);
    const [session] = useState(() => {
        const created = createToastSession(decorate(descriptor));
        created.show();
        return created;
    });
    const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
    const previousDescriptor = useRef(descriptor);
    const lastTime = useRef(performance.now());
    const flushTime = useCallback(() => {
        const now = performance.now();
        const elapsed = Math.max(0, now - lastTime.current);
        lastTime.current = now;
        session.advanceTime(elapsed);
    }, [session]);
    useEffect(() => {
        if (previousDescriptor.current !== descriptor) {
            flushTime();
            session.update(decorate(descriptor));
            previousDescriptor.current = descriptor;
        }
    }, [decorate, descriptor, session, flushTime]);
    const mountGeneration = useRef(0);
    useEffect(() => {
        const generation = ++mountGeneration.current;
        // StrictMode replays cleanup before reattaching the same session. Interrupt
        // only a real unmount, like ToastRegion's store disposal lifecycle.
        return () => { queueMicrotask(() => { if (mountGeneration.current === generation)
            session.interrupt(); }); };
    }, [session]);
    useEffect(() => {
        if (snapshot.timer.status !== "running" || snapshot.timer.remainingMs === null)
            return;
        lastTime.current = performance.now();
        const timeout = setTimeout(flushTime, snapshot.timer.remainingMs);
        return () => clearTimeout(timeout);
    }, [flushTime, snapshot.timer.remainingMs, snapshot.timer.status]);
    const completeDismiss = (reason) => {
        session.dismiss(reason);
    };
    return (_jsx(ToastSurface, { onAction: () => {
            session.invokeAction();
        }, onPress: () => { session.invokePress(); }, onDismiss: completeDismiss, onExitComplete: () => session.completeExit(), onPause: (reason) => { flushTime(); session.pause(reason); }, onResume: (reason) => { flushTime(); session.resume(reason); }, placement: placement, ...(renderToneIcon === undefined ? {} : { renderToneIcon }), snapshot: snapshot, style: [layoutStyle] }));
}
const ToastRegionContext = createContext(null);
function useToastKeyboardHeight(enabled) {
    const [height, setHeight] = useState(0);
    useEffect(() => {
        if (!enabled) {
            setHeight(0);
            return;
        }
        const shown = Keyboard.addListener("keyboardDidShow", (event) => {
            setHeight(Math.max(0, event.endCoordinates.height));
        });
        const hidden = Keyboard.addListener("keyboardDidHide", () => setHeight(0));
        return () => {
            shown.remove();
            hidden.remove();
        };
    }, [enabled]);
    return enabled ? height : 0;
}
function assertNonNegativeOffset(value, field) {
    if (!Number.isFinite(value) || value < 0) {
        throw new RangeError(`ToastRegion ${field} must be non-negative`);
    }
}
function snapshotDescriptor(snapshot) {
    const descriptor = snapshot.descriptor;
    return {
        id: descriptor.id,
        ...(descriptor.title === null ? {} : { title: descriptor.title }),
        description: descriptor.description,
        tone: descriptor.tone,
        presentation: descriptor.presentation,
        priority: descriptor.priority,
        announcement: descriptor.announcement,
        durationMs: descriptor.durationMs,
        ...(descriptor.action === null
            ? {}
            : {
                action: {
                    label: descriptor.action.label,
                    accessibilityLabel: descriptor.action.accessibilityLabel,
                    onAction: descriptor.action.onAction,
                    dismissOnAction: descriptor.action.dismissOnAction,
                },
            }),
        ...(descriptor.press === null ? {} : { press: descriptor.press }),
        // Panel fields must survive the controlled-collection round trip, or `onToastsChange` would drop them.
        ...(descriptor.media === null ? {} : { media: descriptor.media }),
        ...(descriptor.progress === null ? {} : { progress: descriptor.progress }),
        closeLabel: descriptor.closeLabel,
        ...(descriptor.onDismiss === null ? {} : { onDismiss: descriptor.onDismiss }),
    };
}
function allToastSnapshots(snapshot) {
    return [...snapshot.visible, ...snapshot.queued];
}
function PresentedToast({ adapter, width, availableHeight, windowOrigin, ...props }) {
    // Updating a job's copy must not replay its entrance or replace its presentation mid-session.
    const [enhanced] = useState(() => props.snapshot.descriptor.presentation === "liquid");
    const selected = enhanced ? adapter : undefined;
    const enabled = selected !== undefined;
    const callbacks = useRef(props);
    callbacks.current = props;
    useLayoutEffect(() => {
        if (enabled)
            callbacks.current.onPause("presentation");
        else
            callbacks.current.onResume("presentation");
    }, [enabled]);
    const announcement = props.snapshot.descriptor;
    const lastAnnouncement = useRef(undefined);
    useEffect(() => {
        if (props.suspended || props.snapshot.phase !== "visible" || Platform.OS !== "ios")
            return;
        const key = `${announcement.id}:${announcement.priority}:${announcement.announcement}`;
        if (lastAnnouncement.current === key)
            return;
        lastAnnouncement.current = key;
        AccessibilityInfo.announceForAccessibilityWithOptions(announcement.announcement, { queue: announcement.priority !== "high" });
    }, [announcement.announcement, announcement.priority, props.snapshot.phase, props.suspended]);
    const announcer = Platform.OS === "ios" || props.suspended ? null : _jsx(Text, { accessibilityLabel: announcement.announcement, accessibilityLiveRegion: announcement.priority === "high" ? "assertive" : "polite", accessible: true, style: { height: 1, opacity: 0, position: "absolute", width: 1 }, children: announcement.announcement });
    const fallback = _jsx(ToastSurface, { ...props, announces: false });
    if (!selected)
        return _jsxs(_Fragment, { children: [announcer, fallback] });
    const Surface = selected.Surface;
    return _jsxs(_Fragment, { children: [announcer, _jsx(Surface, { anchor: selected.anchor, snapshot: props.snapshot, width: width, availableHeight: availableHeight, ...(windowOrigin === undefined ? {} : { windowOrigin }), suspended: props.suspended ?? false, body: _jsx(ToastSurface, { ...props, announces: false, managedMotion: true }), fallback: fallback, onPause: props.onPause, onResume: props.onResume, onDismiss: props.onDismiss, onExitComplete: props.onExitComplete })] });
}
/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export function ToastRegion({ presentationAdapter, occluded = false, children, accessibilityLabel, toasts, defaultToasts = [], onToastsChange, maxVisible = toastBehaviorDefaults.maxVisible, maxQueued = toastBehaviorDefaults.maxQueued, duplicatePolicy = toastBehaviorDefaults.duplicatePolicy, timerUpdatePolicy = toastBehaviorDefaults.timerUpdatePolicy, overflowPolicy = toastBehaviorDefaults.overflowPolicy, placement = toastRecipe.defaults.placement, safeAreaInsets = {}, avoidKeyboard = true, keyboardOffset = 0, renderToneIcon, layoutStyle, }) {
    if (presentationAdapter && (presentationAdapter.kind !== "liquid" || placement !== "top" || maxVisible !== 1)) {
        throw new TypeError("Liquid Toast requires top placement and maxVisible=1");
    }
    defaultToasts.forEach(resolveToastDescriptor);
    toasts?.forEach(resolveToastDescriptor);
    const [store] = useState(() => createToastStore({
        maxVisible,
        maxQueued,
        duplicatePolicy,
        timerUpdatePolicy,
        overflowPolicy,
    }));
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const lastTime = useRef(performance.now());
    const disposed = useRef(false);
    const flushTime = useCallback(() => {
        if (disposed.current)
            return;
        const now = performance.now();
        const elapsed = Math.max(0, now - lastTime.current);
        lastTime.current = now;
        // Settle before publish/pause/resume, otherwise frequent updates reset the deadline.
        if (elapsed > 0)
            store.advanceTime(elapsed);
    }, [store]);
    const [appActive, setAppActive] = useState(AppState.currentState === "active");
    const dimensions = useWindowDimensions();
    const viewportRef = useRef(null);
    const [viewportWidth, setViewportWidth] = useState(null);
    const [windowOrigin, setWindowOrigin] = useState();
    const rawDescriptors = useRef(new Map());
    const initialDescriptors = useRef(toasts ?? defaultToasts);
    const onToastsChangeRef = useRef(onToastsChange);
    onToastsChangeRef.current = onToastsChange;
    const theme = useHjmNativeTheme();
    const placementContract = toastRecipe.placements[placement];
    const bottomPlacement = placementContract.blockEdge === "bottom";
    const keyboardHeight = useToastKeyboardHeight(avoidKeyboard && bottomPlacement);
    const safeTop = safeAreaInsets.top ?? 0;
    const safeBottom = safeAreaInsets.bottom ?? 0;
    const safeLeft = safeAreaInsets.left ?? 0;
    const safeRight = safeAreaInsets.right ?? 0;
    const safeStart = safeAreaInsets.start
        ?? (theme.environment.direction === "rtl" ? safeRight : safeLeft);
    const safeEnd = safeAreaInsets.end
        ?? (theme.environment.direction === "rtl" ? safeLeft : safeRight);
    assertNonNegativeOffset(keyboardOffset, "keyboardOffset");
    assertNonNegativeOffset(safeTop, "safeAreaInsets.top");
    assertNonNegativeOffset(safeBottom, "safeAreaInsets.bottom");
    assertNonNegativeOffset(safeLeft, "safeAreaInsets.left");
    assertNonNegativeOffset(safeRight, "safeAreaInsets.right");
    assertNonNegativeOffset(safeStart, "safeAreaInsets.start");
    assertNonNegativeOffset(safeEnd, "safeAreaInsets.end");
    const pruneRaw = useCallback(() => {
        const ids = new Set(allToastSnapshots(store.getSnapshot()).map((entry) => entry.descriptor.id));
        for (const id of rawDescriptors.current.keys()) {
            if (!ids.has(id))
                rawDescriptors.current.delete(id);
        }
    }, [store]);
    const emitChange = useCallback(() => {
        pruneRaw();
        const next = allToastSnapshots(store.getSnapshot()).map((entry) => rawDescriptors.current.get(entry.descriptor.id) ?? snapshotDescriptor(entry));
        onToastsChangeRef.current?.(next);
    }, [pruneRaw, store]);
    const completeExit = useCallback((id) => {
        if (disposed.current)
            return false;
        flushTime();
        const changed = store.completeExit(id);
        if (changed) {
            pruneRaw();
            emitChange();
        }
        return changed;
    }, [emitChange, pruneRaw, store, flushTime]);
    const storeLifetime = useRef(0);
    const hasSeededDefaults = useRef(false);
    useEffect(() => {
        storeLifetime.current += 1;
        disposed.current = false;
        lastTime.current = performance.now();
        if (!hasSeededDefaults.current) {
            hasSeededDefaults.current = true;
            for (const descriptor of initialDescriptors.current) {
                rawDescriptors.current.set(descriptor.id, descriptor);
                store.publish(descriptor);
            }
        }
        return () => {
            disposed.current = true;
            // Strict Effects/Fast Refresh replay setup with the same store; only a real
            // unmount may destroy it. A microtask lets synchronous replay cancel disposal.
            const ending = ++storeLifetime.current;
            queueMicrotask(() => { if (storeLifetime.current === ending)
                store.dispose(); });
        };
    }, [store]);
    useEffect(() => {
        if (toasts === undefined)
            return;
        flushTime();
        const nextIds = new Set(toasts.map((descriptor) => descriptor.id));
        for (const descriptor of toasts) {
            if (rawDescriptors.current.get(descriptor.id) !== descriptor) {
                rawDescriptors.current.set(descriptor.id, descriptor);
                store.publish(descriptor);
            }
        }
        for (const entry of allToastSnapshots(store.getSnapshot())) {
            if (!nextIds.has(entry.descriptor.id)) {
                store.dismiss(entry.descriptor.id, "programmatic");
            }
        }
        pruneRaw();
    }, [pruneRaw, store, toasts]);
    useEffect(() => {
        const updateWindowPause = (state) => {
            flushTime();
            setAppActive(state === "active");
            if (state === "active")
                store.resumeAll("window");
            else
                store.pauseAll("window");
        };
        updateWindowPause(AppState.currentState);
        const subscription = AppState.addEventListener("change", updateWindowPause);
        return () => subscription.remove();
    }, [store, flushTime]);
    useLayoutEffect(() => {
        flushTime();
        if (occluded)
            store.pauseAll("occlusion");
        else
            store.resumeAll("occlusion");
    }, [occluded, store, flushTime]);
    useEffect(() => {
        const running = snapshot.visible
            .map((entry) => entry.timer)
            .filter((timer) => timer.status === "running" && timer.remainingMs !== null);
        if (running.length === 0)
            return;
        const remaining = Math.min(...running.map((timer) => timer.remainingMs ?? Infinity));
        const timeout = setTimeout(() => {
            flushTime();
        }, remaining);
        return () => clearTimeout(timeout);
    }, [snapshot.visible, store, flushTime]);
    const publish = useCallback((descriptor) => {
        flushTime();
        rawDescriptors.current.set(descriptor.id, descriptor);
        const result = store.publish(descriptor);
        pruneRaw();
        emitChange();
        return result;
    }, [emitChange, pruneRaw, store]);
    const dismiss = useCallback((id, reason = "programmatic") => {
        flushTime();
        const changed = store.dismiss(id, reason);
        if (changed) {
            pruneRaw();
            emitChange();
        }
        return changed;
    }, [emitChange, pruneRaw, store]);
    const invokePress = useCallback((id) => {
        flushTime();
        return store.invokePress(id);
    }, [store]);
    const invokeAction = useCallback((id) => {
        flushTime();
        return store.invokeAction(id);
    }, [store]);
    const controller = {
        publish,
        dismiss,
        pause: (id, reason = "programmatic") => { flushTime(); return !disposed.current && store.pause(id, reason); },
        resume: (id, reason = "programmatic") => { flushTime(); return !disposed.current && store.resume(id, reason); },
    };
    const suspended = occluded || !appActive;
    const width = viewportWidth ?? Math.max(0, dimensions.width - safeLeft - safeRight - toastRecipe.viewport.inset * 2);
    const availableHeight = Math.max(0, dimensions.height - (windowOrigin?.y ?? safeTop + toastRecipe.viewport.inset) - safeBottom - toastRecipe.viewport.inset);
    const hasChildren = children !== undefined && children !== null;
    const inlineAlignment = placementContract.inlineEdge === "start"
        ? "flex-start"
        : placementContract.inlineEdge === "end"
            ? "flex-end"
            : "center";
    const blockOffset = toastRecipe.viewport.inset
        + (bottomPlacement ? safeBottom + keyboardHeight + keyboardOffset : safeTop);
    return (_jsx(ToastRegionContext.Provider, { value: controller, children: _jsxs(View, { style: [{ flex: hasChildren ? 1 : undefined }, layoutStyle], children: [children, _jsx(View, { ref: viewportRef, onLayout: event => {
                        setViewportWidth(event.nativeEvent.layout.width);
                        viewportRef.current?.measureInWindow?.((x, y) => setWindowOrigin(previous => previous?.x === x && previous?.y === y ? previous : { x, y }));
                    }, accessibilityLabel: accessibilityLabel, accessibilityElementsHidden: suspended, importantForAccessibility: suspended ? "no-hide-descendants" : "auto", pointerEvents: suspended ? "none" : "box-none", style: {
                        opacity: suspended ? 0 : 1,
                        alignItems: inlineAlignment,
                        direction: theme.environment.direction,
                        elevation: toastRecipe.viewport.layer,
                        end: toastRecipe.viewport.inset + safeEnd,
                        flexDirection: placementContract.stackFrom === "bottom" ? "column-reverse" : "column",
                        gap: toastRecipe.viewport.gap,
                        position: hasChildren ? "absolute" : "relative",
                        start: toastRecipe.viewport.inset + safeStart,
                        zIndex: toastRecipe.viewport.layer,
                        ...(bottomPlacement ? { bottom: blockOffset } : { top: blockOffset }),
                    }, children: snapshot.visible.map((entry) => (_jsx(PresentedToast, { adapter: presentationAdapter, width: width, availableHeight: availableHeight, windowOrigin: windowOrigin, suspended: suspended, onAction: () => invokeAction(entry.descriptor.id), onPress: () => invokePress(entry.descriptor.id), onDismiss: (reason) => dismiss(entry.descriptor.id, reason), onExitComplete: () => completeExit(entry.descriptor.id), onPause: (reason) => { controller.pause(entry.descriptor.id, reason); }, onResume: (reason) => { controller.resume(entry.descriptor.id, reason); }, placement: placement, ...(renderToneIcon === undefined ? {} : { renderToneIcon }), snapshot: entry }, entry.descriptor.id))) })] }) }));
}
export function useToastRegion() {
    const controller = useContext(ToastRegionContext);
    if (controller === null)
        throw new Error("useToastRegion must be used inside ToastRegion");
    return controller;
}
// ActivityChip is a feedback-category status trigger (its panel is the Toast in this module). Also exported here so
// apps can import it from an existing subpath: Next dev with HJM_LOCAL_SOURCE rejected the new ./activity-chip
// subpath before aliasing because the installed release lacks it (BurnTok 2026-10-10).
export { ActivityChip } from "./activity-chip.js";
//# sourceMappingURL=feedback.js.map