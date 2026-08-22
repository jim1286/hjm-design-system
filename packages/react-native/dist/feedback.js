import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveColorReference } from "@hjm/design-contracts/color-references";
import { easing, glyph, radius, spacing } from "@hjm/design-contracts/foundations";
import { resolveControlAccessibleName, } from "@hjm/design-contracts/behaviors";
import { emptyStateRecipe, noticeRecipe, progressRecipe, toastRecipe, } from "@hjm/design-contracts/recipes";
import { resolveResultDescriptor, resultRecipe, } from "@hjm/design-contracts/components/result";
import { createToastSession, createToastStore, resolveToastDescriptor, toastBehaviorDefaults, } from "@hjm/design-contracts/components/toast";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, } from "react";
import { ActivityIndicator, AccessibilityInfo, Animated, AppState, Easing, Keyboard, Platform, View, } from "react-native";
import { Button, IconButton } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Notice({ title, description, tone = noticeRecipe.defaults.tone, announcement = "none", icon, renderIcon, action, style, ...props }) {
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
    return (_jsxs(View, { ...props, accessibilityLiveRegion: announcement, accessibilityRole: announcement === "assertive" ? "alert" : undefined, style: [
            {
                backgroundColor: resolveColorReference(toneContract.background, theme.palette),
                borderColor: resolveColorReference(toneContract.border, theme.palette),
                borderRadius: radius[noticeRecipe.radius],
                borderWidth: noticeRecipe.borderWidth,
                gap: noticeRecipe.gap,
                padding: noticeRecipe.padding,
            },
            style,
        ], children: [_jsxs(View, { style: {
                    alignItems: "flex-start",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    gap: noticeRecipe.gap,
                }, children: [resolvedIcon === undefined ? null : (_jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: {
                            alignItems: "center",
                            height: glyph[noticeRecipe.iconSize],
                            justifyContent: "center",
                            width: glyph[noticeRecipe.iconSize],
                        }, children: resolvedIcon })), _jsxs(View, { style: { flex: 1, gap: noticeRecipe.contentGap, minWidth: 0 }, children: [_jsx(Text, { style: { color: foreground, fontWeight: noticeRecipe.title.fontWeight }, variant: noticeRecipe.title.textVariant, children: title }), description ? (_jsx(Text, { style: { color: resolveColorReference(noticeRecipe.description.color, theme.palette) }, variant: noticeRecipe.description.textVariant, children: description })) : null] })] }), action] }));
}
export function EmptyState({ title, description, illustration, action, density = emptyStateRecipe.defaults.density, align = "center", announcement = "none", accessibilityLabel, titleRole = "header", style, illustrationStyle, titleStyle, descriptionStyle, actionStyle, ...props }) {
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
            style,
        ], children: [announcement === "none" || Platform.OS === "ios" ? null : (_jsx(Text, { accessibilityLabel: announcementText, accessibilityLiveRegion: announcement, accessibilityRole: announcement === "assertive" ? "alert" : undefined, accessible: true, style: { height: 1, opacity: 0, position: "absolute", width: 1 }, children: announcementText })), usesUpperSpacers ? _jsx(View, { accessible: false, style: { flexGrow: 1 } }) : null, illustration ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: [
                    {
                        alignItems: "center",
                        height: glyph[emptyStateRecipe.icon.size],
                        justifyContent: "center",
                        width: glyph[emptyStateRecipe.icon.size],
                    },
                    illustrationStyle,
                ], children: illustration })) : null, title === undefined ? null : _jsx(Text, { align: "center", accessibilityRole: titleRole, style: [
                    {
                        color: resolveColorReference(emptyStateRecipe.title.color, theme.palette),
                        fontWeight: emptyStateRecipe.title.fontWeight,
                    },
                    titleStyle,
                ], variant: emptyStateRecipe.title.textVariant, children: title }), description ? (_jsx(Text, { align: "center", style: [
                    {
                        color: resolveColorReference(emptyStateRecipe.description.color, theme.palette),
                    },
                    descriptionStyle,
                ], variant: emptyStateRecipe.description.textVariant, children: description })) : null, action ? _jsx(View, { style: actionStyle, children: action }) : null, usesUpperSpacers ? _jsx(View, { accessible: false, style: { flexGrow: 3 } }) : null] }));
}
/** Terminal flow outcome with platform announcement and canonical actions. */
export function Result({ status, title, description, actions, renderIcon, style, ...props }) {
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
            style,
        ], children: [_jsx(View, { accessible: false, style: {
                    alignItems: "center",
                    backgroundColor: iconBackgroundColor,
                    borderRadius: radius.full,
                    height: 56,
                    justifyContent: "center",
                    width: 56,
                }, children: renderIcon?.({
                    status: result.status,
                    color: iconColor,
                    backgroundColor: iconBackgroundColor,
                }) }), _jsx(Text, { accessibilityLiveRegion: result.status === "failure" ? "assertive" : "none", accessibilityRole: "header", align: "center", emphasis: "strong", style: {
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
                }, children: [result.primaryAction ? (_jsx(Button, { accessibilityLabel: result.primaryAction.accessibilityLabel, onPress: result.primaryAction.onAction, children: result.primaryAction.label })) : null, result.secondaryAction ? (_jsx(Button, { accessibilityLabel: result.secondaryAction.accessibilityLabel, onPress: result.secondaryAction.onAction, tone: "secondary", children: result.secondaryAction.label })) : null] })) : null] }));
}
export function Progress({ value, max = 1, label, accessibilityLabel, valueText, valueLabel, accessibilityHint, size = progressRecipe.defaults.size, tone = progressRecipe.defaults.tone, style, labelStyle, valueStyle, trackStyle, indicatorStyle, testID, }) {
    if (!Number.isFinite(max) || max <= 0) {
        throw new RangeError("Progress max must be a positive finite number");
    }
    if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > max)) {
        throw new RangeError("Progress value must be between zero and max");
    }
    const theme = useHjmNativeTheme();
    const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Progress");
    const percentage = value === undefined ? undefined : Math.round((value / max) * 100);
    const resolvedValueText = valueText ?? valueLabel ?? (percentage === undefined ? undefined : `${percentage}%`);
    return (_jsxs(View, { accessibilityHint: accessibilityHint, accessibilityLabel: accessibleName, accessibilityRole: "progressbar", accessibilityState: value === undefined ? { busy: true } : undefined, accessibilityValue: {
            min: 0,
            max: 100,
            ...(percentage === undefined ? {} : { now: percentage }),
            ...(resolvedValueText === undefined ? {} : { text: resolvedValueText }),
        }, testID: testID, style: [{ gap: spacing.xs }, style], children: [label === undefined ? null : (_jsxs(View, { accessible: false, style: {
                    alignItems: "center",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }, children: [_jsx(Text, { style: labelStyle, variant: "label", children: label }), resolvedValueText ? (_jsx(Text, { style: valueStyle, tone: "muted", variant: "caption", children: resolvedValueText })) : null] })), _jsx(View, { accessible: false, style: [
                    {
                        backgroundColor: resolveColorReference(progressRecipe.track, theme.palette),
                        borderRadius: radius[progressRecipe.radius],
                        height: progressRecipe.sizes[size],
                        overflow: "hidden",
                    },
                    trackStyle,
                ], children: _jsx(View, { style: [
                        {
                            backgroundColor: resolveColorReference(progressRecipe.tones[tone], theme.palette),
                            height: "100%",
                            width: `${percentage ?? 30}%`,
                        },
                        indicatorStyle,
                    ] }) })] }));
}
export function Spinner({ label, size = "small", style }) {
    const { colors } = useHjmNativeTheme();
    return (_jsxs(View, { accessibilityLabel: label, accessibilityRole: "progressbar", accessibilityState: { busy: true }, accessible: true, style: [{ alignItems: "center", gap: spacing.xs, justifyContent: "center" }, style], children: [_jsx(ActivityIndicator, { color: colors.contentBrand, size: size }), _jsx(Text, { accessible: false, align: "center", tone: "muted", variant: "caption", children: label })] }));
}
export function Skeleton({ width = "100%", height = 16, radius: radiusValue = radius.sm, accessibilityLabel, style, }) {
    const { colors } = useHjmNativeTheme();
    return (_jsx(View, { accessibilityLabel: accessibilityLabel, accessibilityState: accessibilityLabel ? { busy: true } : undefined, accessible: accessibilityLabel !== undefined, style: [
            {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radiusValue,
                height,
                width,
            },
            style,
        ] }));
}
function ToastSurface({ snapshot, onDismiss, onAction, onExitComplete, onPause, onResume, placement, renderToneIcon, style, }) {
    const resolved = snapshot.descriptor;
    const theme = useHjmNativeTheme();
    const [motionProgress] = useState(() => new Animated.Value(theme.environment.reducedMotion ? 1 : 0));
    const exitCompleteRef = useRef(onExitComplete);
    exitCompleteRef.current = onExitComplete;
    const tone = toastRecipe.tones[resolved.tone];
    const accent = resolveColorReference(tone.accent, theme.palette);
    const background = resolveColorReference(toastRecipe.surface.background, theme.palette);
    const border = resolveColorReference(toastRecipe.surface.border, theme.palette);
    const pauseFocus = () => onPause("focus");
    const resumeFocus = () => onResume("focus");
    const blockEdge = toastRecipe.placements[placement].blockEdge;
    const entryOffset = blockEdge === "top" ? -12 : 12;
    useEffect(() => {
        if (snapshot.phase === "queued" || snapshot.phase === "closed")
            return;
        const phase = snapshot.phase === "closing" ? "exit" : "enter";
        const transition = toastRecipe.transition.native[phase];
        const target = phase === "exit" ? 0 : 1;
        const duration = theme.environment.reducedMotion ? 0 : transition.duration;
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
    }, [motionProgress, snapshot.phase, theme.environment.reducedMotion]);
    useEffect(() => {
        if (Platform.OS !== "ios" || snapshot.phase !== "visible")
            return;
        AccessibilityInfo.announceForAccessibilityWithOptions(resolved.announcement, {
            queue: resolved.priority !== "high",
        });
    }, [resolved.announcement, resolved.id, resolved.priority, snapshot.phase, snapshot.revision]);
    if (snapshot.phase === "queued" || snapshot.phase === "closed")
        return null;
    const translateY = theme.environment.reducedMotion
        ? 0
        : motionProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOffset, 0] });
    const renderedToneIcon = renderToneIcon?.({
        color: accent,
        mark: tone.mark,
        size: glyph[toastRecipe.icon.glyph],
        tone: resolved.tone,
    });
    return (_jsxs(Animated.View, { accessible: false, onTouchEnd: () => onResume("pointer"), onTouchStart: () => onPause("pointer"), style: [
            {
                alignItems: "stretch",
                backgroundColor: background,
                borderColor: border,
                borderRadius: radius[toastRecipe.surface.radius],
                borderWidth: toastRecipe.surface.borderWidth,
                gap: toastRecipe.surface.gap,
                maxWidth: toastRecipe.surface.maxWidth,
                minHeight: toastRecipe.surface.minHeight,
                opacity: motionProgress,
                overflow: "hidden",
                padding: toastRecipe.surface.padding,
                shadowColor: toastRecipe.surface.shadow.color,
                shadowOffset: { width: 0, height: toastRecipe.surface.shadow.offsetY },
                shadowOpacity: toastRecipe.surface.shadow.opacity,
                shadowRadius: toastRecipe.surface.shadow.radius,
                transform: [{ translateY }],
                width: "100%",
            },
            style,
        ], children: [_jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: {
                    backgroundColor: accent,
                    borderRadius: radius[toastRecipe.toneMark.radius],
                    bottom: 0,
                    start: 0,
                    position: "absolute",
                    top: 0,
                    width: toastRecipe.toneMark.width,
                } }), Platform.OS === "ios" ? null : (_jsx(Text, { accessibilityLabel: resolved.announcement, accessibilityLiveRegion: resolved.priority === "high" ? "assertive" : "polite", accessibilityRole: resolved.priority === "high" ? "alert" : undefined, accessible: true, style: { height: 1, opacity: 0, position: "absolute", width: 1 }, children: resolved.announcement })), _jsxs(View, { style: {
                    alignItems: "center",
                    direction: theme.environment.direction,
                    flexDirection: "row",
                    gap: toastRecipe.surface.gap,
                }, children: [renderedToneIcon === undefined ? null : (_jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { alignItems: "center", flexShrink: 0, justifyContent: "center" }, children: renderedToneIcon })), _jsxs(View, { style: { flex: 1, gap: toastRecipe.content.gap, minWidth: 0 }, children: [resolved.title ? (_jsx(Text, { style: {
                                    color: resolveColorReference(toastRecipe.title.color, theme.palette),
                                    fontWeight: toastRecipe.title.fontWeight,
                                }, variant: toastRecipe.title.textVariant, children: resolved.title })) : null, _jsx(Text, { style: { color: resolveColorReference(toastRecipe.description.color, theme.palette) }, variant: toastRecipe.description.textVariant, children: resolved.description })] }), _jsx(IconButton, { label: resolved.closeLabel, onBlur: resumeFocus, onFocus: pauseFocus, onPress: () => onDismiss("close-action"), children: _jsx(Text, { accessible: false, tone: "muted", variant: "title", children: "\u00D7" }) })] }), resolved.action ? (_jsx(View, { style: { alignSelf: "flex-start" }, children: _jsx(Button, { accessibilityLabel: resolved.action.accessibilityLabel, onBlur: resumeFocus, onFocus: pauseFocus, onPress: onAction, tone: "ghost", children: resolved.action.label }) })) : null] }));
}
/** One Native toast driven by the same exactly-once session as a queued region. */
export function Toast({ descriptor, onDismiss, placement = toastRecipe.defaults.placement, renderToneIcon, style, }) {
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
    useEffect(() => {
        if (previousDescriptor.current !== descriptor) {
            session.update(decorate(descriptor));
            previousDescriptor.current = descriptor;
        }
    }, [decorate, descriptor, session]);
    useEffect(() => () => {
        session.interrupt();
    }, [session]);
    useEffect(() => {
        if (snapshot.timer.status !== "running" || snapshot.timer.remainingMs === null)
            return;
        const timeout = setTimeout(() => {
            session.advanceTime(snapshot.timer.remainingMs ?? 0);
        }, snapshot.timer.remainingMs);
        return () => clearTimeout(timeout);
    }, [session, snapshot.timer.remainingMs, snapshot.timer.status]);
    const completeDismiss = (reason) => {
        session.dismiss(reason);
    };
    return (_jsx(ToastSurface, { onAction: () => {
            session.invokeAction();
        }, onDismiss: completeDismiss, onExitComplete: () => session.completeExit(), onPause: (reason) => session.pause(reason), onResume: (reason) => session.resume(reason), placement: placement, ...(renderToneIcon === undefined ? {} : { renderToneIcon }), snapshot: snapshot, style: style }));
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
        closeLabel: descriptor.closeLabel,
        ...(descriptor.onDismiss === null ? {} : { onDismiss: descriptor.onDismiss }),
    };
}
function allToastSnapshots(snapshot) {
    return [...snapshot.visible, ...snapshot.queued];
}
/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export function ToastRegion({ children, accessibilityLabel, toasts, defaultToasts = [], onToastsChange, maxVisible = toastBehaviorDefaults.maxVisible, maxQueued = toastBehaviorDefaults.maxQueued, duplicatePolicy = toastBehaviorDefaults.duplicatePolicy, timerUpdatePolicy = toastBehaviorDefaults.timerUpdatePolicy, overflowPolicy = toastBehaviorDefaults.overflowPolicy, placement = toastRecipe.defaults.placement, safeAreaInsets = {}, avoidKeyboard = true, keyboardOffset = 0, renderToneIcon, style, toastStyle, }) {
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
        const changed = store.completeExit(id);
        if (changed) {
            pruneRaw();
            emitChange();
        }
        return changed;
    }, [emitChange, pruneRaw, store]);
    useEffect(() => {
        for (const descriptor of initialDescriptors.current) {
            rawDescriptors.current.set(descriptor.id, descriptor);
            store.publish(descriptor);
        }
        return () => {
            store.dispose();
        };
    }, [store]);
    useEffect(() => {
        if (toasts === undefined)
            return;
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
            if (state === "active")
                store.resumeAll("window");
            else
                store.pauseAll("window");
        };
        updateWindowPause(AppState.currentState);
        const subscription = AppState.addEventListener("change", updateWindowPause);
        return () => subscription.remove();
    }, [store]);
    useEffect(() => {
        const running = snapshot.visible
            .map((entry) => entry.timer)
            .filter((timer) => timer.status === "running" && timer.remainingMs !== null);
        if (running.length === 0)
            return;
        const remaining = Math.min(...running.map((timer) => timer.remainingMs ?? Infinity));
        const timeout = setTimeout(() => {
            store.advanceTime(remaining);
        }, remaining);
        return () => clearTimeout(timeout);
    }, [snapshot.visible, store]);
    const show = useCallback((descriptor) => {
        rawDescriptors.current.set(descriptor.id, descriptor);
        const result = store.publish(descriptor);
        pruneRaw();
        emitChange();
        return result;
    }, [emitChange, pruneRaw, store]);
    const dismiss = useCallback((id, reason = "programmatic") => {
        const changed = store.dismiss(id, reason);
        if (changed) {
            pruneRaw();
            emitChange();
        }
        return changed;
    }, [emitChange, pruneRaw, store]);
    const invokeAction = useCallback((id) => {
        return store.invokeAction(id);
    }, [store]);
    const controller = {
        show,
        dismiss,
        pause: (id, reason = "programmatic") => store.pause(id, reason),
        resume: (id, reason = "programmatic") => store.resume(id, reason),
    };
    const hasChildren = children !== undefined && children !== null;
    const inlineAlignment = placementContract.inlineEdge === "start"
        ? "flex-start"
        : placementContract.inlineEdge === "end"
            ? "flex-end"
            : "center";
    const blockOffset = toastRecipe.viewport.inset
        + (bottomPlacement ? safeBottom + keyboardHeight + keyboardOffset : safeTop);
    return (_jsx(ToastRegionContext.Provider, { value: controller, children: _jsxs(View, { style: [{ flex: hasChildren ? 1 : undefined }, style], children: [children, _jsx(View, { accessibilityLabel: accessibilityLabel, pointerEvents: "box-none", style: {
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
                    }, children: snapshot.visible.map((entry) => (_jsx(ToastSurface, { onAction: () => invokeAction(entry.descriptor.id), onDismiss: (reason) => dismiss(entry.descriptor.id, reason), onExitComplete: () => completeExit(entry.descriptor.id), onPause: (reason) => store.pause(entry.descriptor.id, reason), onResume: (reason) => store.resume(entry.descriptor.id, reason), placement: placement, ...(renderToneIcon === undefined ? {} : { renderToneIcon }), snapshot: entry, style: toastStyle }, entry.descriptor.id))) })] }) }));
}
export function useToastRegion() {
    const controller = useContext(ToastRegionContext);
    if (controller === null)
        throw new Error("useToastRegion must be used inside ToastRegion");
    return controller;
}
//# sourceMappingURL=feedback.js.map