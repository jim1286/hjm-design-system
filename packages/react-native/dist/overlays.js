import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createAlertDialogSession, getAlertDialogInitialFocus, validateAlertDialogRequest, } from "@hjmds/design-contracts/components/alert-dialog";
import { canDismissSheet, createSheetLifecycle, sheetBehaviorDefaults, } from "@hjmds/design-contracts/components/sheet";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { easing, overlay, radius, spacing } from "@hjmds/design-contracts/foundations";
import { alertDialogRecipe, dialogRecipe, sheetRecipe, } from "@hjmds/design-contracts/recipes";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, } from "react";
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, View, findNodeHandle, useWindowDimensions, } from "react-native";
import { Button, IconButton } from "./actions.js";
import { scheduleAfterNativeModalTeardown, shouldAwaitNativeModalDismiss, } from "./internal/modal-lifecycle.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function useReasonedOpenState({ open, defaultOpen = false, onOpenChange, }) {
    const controlledAtMount = useRef(open !== undefined);
    const controlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const pendingClose = useRef(false);
    if (controlledAtMount.current !== controlled) {
        throw new Error("HJM overlays cannot switch between controlled and uncontrolled state");
    }
    const visible = controlled ? open : internalOpen;
    const changeOpen = useCallback((next, detail) => {
        if (next === visible || (!next && pendingClose.current))
            return false;
        if (!next) {
            pendingClose.current = true;
            setTimeout(() => {
                pendingClose.current = false;
            }, 0);
        }
        if (!controlled)
            setInternalOpen(next);
        onOpenChange?.(next, detail);
        return true;
    }, [controlled, onOpenChange, visible]);
    return [visible, changeOpen];
}
function focusNativeTarget(target) {
    if (!target?.current)
        return;
    const handle = findNodeHandle(target.current);
    if (handle !== null)
        AccessibilityInfo.setAccessibilityFocus(handle);
}
function Scrim() {
    return (_jsx(View, { accessible: false, importantForAccessibility: "no-hide-descendants", style: {
            backgroundColor: "#000000",
            bottom: 0,
            left: 0,
            opacity: overlay.scrim,
            position: "absolute",
            right: 0,
            top: 0,
        } }));
}
function OverlayActions({ primaryAction, secondaryAction, busy, stacked = false, onActionComplete, }) {
    const { environment } = useHjmNativeTheme();
    if (!primaryAction && !secondaryAction)
        return null;
    const renderAction = (action, fallbackTone) => (_jsx(View, { style: { flex: stacked ? undefined : 1, width: stacked ? "100%" : undefined }, children: _jsx(Button, { ...(action.accessibilityHint === undefined
                ? {}
                : { accessibilityHint: action.accessibilityHint }), disabled: busy || action.disabled === true, onPress: () => {
                void action.onPress();
                onActionComplete();
            }, tone: action.tone ?? fallbackTone, children: action.label }) }));
    return (_jsxs(View, { style: {
            direction: environment.direction,
            flexDirection: stacked ? "column" : "row",
            gap: spacing.sm,
        }, children: [secondaryAction ? renderAction(secondaryAction, "secondary") : null, primaryAction ? renderAction(primaryAction, "primary") : null] }));
}
/** Native modal boundary with one reasoned close intent for each user attempt. */
export function Dialog({ open, defaultOpen, onOpenChange, title, description, children, primaryAction, secondaryAction, dismissible = true, busy = false, size = dialogRecipe.defaults.size, closeLabel, returnFocusRef, contentStyle, onShow, ...modalProps }) {
    const { environment, palette } = useHjmNativeTheme();
    const { width: windowWidth } = useWindowDimensions();
    const [visible, changeOpen] = useReasonedOpenState({
        ...(open === undefined ? {} : { open }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const previousVisible = useRef(visible);
    const visibleRef = useRef(visible);
    visibleRef.current = visible;
    const [nativeVisible, setNativeVisible] = useState(visible);
    const nativeVisibleRef = useRef(visible);
    nativeVisibleRef.current = nativeVisible;
    const nativeShownRef = useRef(false);
    const reopenAfterExitRef = useRef(false);
    const sequenceRef = useRef(0);
    const pendingExitRef = useRef(null);
    const [motionProgress] = useState(() => new Animated.Value(0));
    const reducedMotionRef = useRef(environment.reducedMotion);
    reducedMotionRef.current = environment.reducedMotion;
    const exitFallbackTask = useRef(null);
    const cancelExitFallback = useCallback(() => {
        exitFallbackTask.current?.cancel();
        exitFallbackTask.current = null;
    }, []);
    const startEnter = useCallback(() => {
        motionProgress.stopAnimation();
        Animated.timing(motionProgress, {
            toValue: 1,
            duration: dialogRecipe.transition.enter.duration,
            easing: Easing.bezier(...easing[dialogRecipe.transition.enter.easing]),
            useNativeDriver: true,
        }).start();
    }, [motionProgress]);
    const completeExit = useCallback((token) => {
        if (pendingExitRef.current?.token !== token)
            return;
        cancelExitFallback();
        pendingExitRef.current = null;
        if (visibleRef.current && reopenAfterExitRef.current) {
            reopenAfterExitRef.current = false;
            motionProgress.setValue(0);
            const keptNativeHost = nativeVisibleRef.current;
            nativeVisibleRef.current = true;
            setNativeVisible(true);
            if (keptNativeHost)
                startEnter();
            return;
        }
        if (!visibleRef.current)
            focusNativeTarget(returnFocusRef);
    }, [cancelExitFallback, motionProgress, returnFocusRef, startEnter]);
    const startExit = useCallback((token) => {
        motionProgress.stopAnimation();
        Animated.timing(motionProgress, {
            toValue: 0,
            duration: reducedMotionRef.current ? 0 : dialogRecipe.transition.exit.duration,
            easing: Easing.bezier(...easing[dialogRecipe.transition.exit.easing]),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished || pendingExitRef.current?.token !== token)
                return;
            if (visibleRef.current && reopenAfterExitRef.current) {
                completeExit(token);
                return;
            }
            pendingExitRef.current.awaitNativeDismiss = shouldAwaitNativeModalDismiss(nativeShownRef.current);
            nativeShownRef.current = false;
            nativeVisibleRef.current = false;
            setNativeVisible(false);
        });
    }, [completeExit, motionProgress]);
    useEffect(() => {
        if (!previousVisible.current && visible) {
            if (pendingExitRef.current) {
                reopenAfterExitRef.current = true;
            }
            else {
                motionProgress.setValue(0);
                nativeVisibleRef.current = true;
                setNativeVisible(true);
            }
        }
        else if (previousVisible.current && !visible) {
            const token = sequenceRef.current + 1;
            sequenceRef.current = token;
            pendingExitRef.current = { token, awaitNativeDismiss: false };
            startExit(token);
        }
        previousVisible.current = visible;
    }, [motionProgress, startExit, visible]);
    useEffect(() => {
        cancelExitFallback();
        if (nativeVisible)
            return undefined;
        const pending = pendingExitRef.current;
        if (!pending || pending.awaitNativeDismiss)
            return undefined;
        const task = scheduleAfterNativeModalTeardown(() => {
            exitFallbackTask.current = null;
            if (!nativeVisibleRef.current && pendingExitRef.current?.token === pending.token) {
                completeExit(pending.token);
            }
        });
        exitFallbackTask.current = task;
        return cancelExitFallback;
    }, [cancelExitFallback, completeExit, nativeVisible]);
    useEffect(() => () => {
        cancelExitFallback();
        motionProgress.stopAnimation();
    }, [cancelExitFallback, motionProgress]);
    const requestClose = (reason) => {
        if (dismissible && !busy)
            changeOpen(false, { reason });
    };
    const sizeRecipe = dialogRecipe.sizes[size];
    const contentBackground = resolveColorReference(dialogRecipe.content.background, palette);
    const contentBorder = resolveColorReference(dialogRecipe.content.border, palette);
    const stackActions = environment.textScale >= 1.6 || windowWidth < 480;
    return (_jsx(Modal, { ...modalProps, animationType: "none", onDismiss: () => {
            nativeShownRef.current = false;
            const pending = pendingExitRef.current;
            if (pending)
                completeExit(pending.token);
        }, onRequestClose: () => requestClose("back"), onShow: (event) => {
            nativeShownRef.current = true;
            startEnter();
            onShow?.(event);
        }, statusBarTranslucent: true, transparent: true, visible: nativeVisible, children: _jsxs(Animated.View, { accessibilityElementsHidden: !visible, importantForAccessibility: visible ? "auto" : "no-hide-descendants", pointerEvents: visible ? "auto" : "none", style: {
                flex: 1,
                justifyContent: "center",
                opacity: motionProgress,
                padding: spacing.md,
            }, children: [_jsx(Scrim, {}), dismissible ? (_jsx(Pressable, { accessible: false, importantForAccessibility: "no-hide-descendants", onPress: () => requestClose("outside"), style: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 } })) : null, _jsxs(View, { accessibilityLabel: [title, description].filter(Boolean).join(", "), accessibilityState: { busy }, accessibilityViewIsModal: true, importantForAccessibility: "yes", role: "dialog", style: [
                        {
                            alignSelf: "center",
                            backgroundColor: contentBackground,
                            borderColor: contentBorder,
                            borderRadius: radius[dialogRecipe.content.radius],
                            borderWidth: dialogRecipe.content.borderWidth,
                            elevation: 8,
                            gap: dialogRecipe.content.gap,
                            maxWidth: sizeRecipe.maxWidth,
                            padding: sizeRecipe.padding,
                            shadowColor: dialogRecipe.content.shadow.color,
                            shadowOffset: { width: 0, height: dialogRecipe.content.shadow.offsetY },
                            shadowOpacity: dialogRecipe.content.shadow.opacity,
                            shadowRadius: dialogRecipe.content.shadow.radius,
                            width: "100%",
                        },
                        contentStyle,
                    ], children: [_jsxs(View, { style: {
                                alignItems: "flex-start",
                                direction: environment.direction,
                                flexDirection: "row",
                                gap: spacing.sm,
                            }, children: [_jsxs(View, { style: { flex: 1, gap: spacing.xs }, children: [_jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "title", children: title }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), dismissible ? (_jsx(IconButton, { disabled: busy, label: closeLabel, onPress: () => requestClose("close-action"), children: _jsx(Text, { accessible: false, variant: "title", children: "\u00D7" }) })) : null] }), children, _jsx(OverlayActions, { busy: busy, onActionComplete: () => requestClose("close-action"), stacked: stackActions, ...(primaryAction === undefined ? {} : { primaryAction }), ...(secondaryAction === undefined ? {} : { secondaryAction }) })] })] }) }));
}
/** Contract session owns duplicate confirms, busy dismissal, error and settlement. */
export function AlertDialog({ open, defaultOpen, onOpenChange, request, returnFocusRef, onResult, contentStyle, onShow, ...modalProps }) {
    validateAlertDialogRequest(request);
    const { colors, environment, palette } = useHjmNativeTheme();
    const { width: windowWidth } = useWindowDimensions();
    const [visible, changeOpen] = useReasonedOpenState({
        ...(open === undefined ? {} : { open }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const requestRef = useRef(request);
    requestRef.current = request;
    const [session, setSession] = useState(() => createAlertDialogSession(request));
    const phase = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
    const previousVisible = useRef(visible);
    const visibleRef = useRef(visible);
    visibleRef.current = visible;
    const [nativeVisible, setNativeVisible] = useState(visible);
    const nativeVisibleRef = useRef(visible);
    nativeVisibleRef.current = nativeVisible;
    const nativeShownRef = useRef(false);
    const reopenAfterExitRef = useRef(false);
    const [motionProgress] = useState(() => new Animated.Value(0));
    const reducedMotionRef = useRef(environment.reducedMotion);
    reducedMotionRef.current = environment.reducedMotion;
    const sessionRef = useRef(session);
    sessionRef.current = session;
    const pendingExitSessions = useRef([]);
    const suppressedResults = useRef(new WeakSet());
    const rearmTimer = useRef(null);
    const exitFallbackTask = useRef(null);
    const onResultRef = useRef(onResult);
    onResultRef.current = onResult;
    const cancelRef = useRef(null);
    const confirmRef = useRef(null);
    const cancelExitFallback = useCallback(() => {
        exitFallbackTask.current?.cancel();
        exitFallbackTask.current = null;
    }, []);
    const ensurePendingExit = useCallback((target, awaitNativeDismiss = false) => {
        const pending = pendingExitSessions.current.find((candidate) => candidate.session === target);
        if (pending) {
            pending.awaitNativeDismiss ||= awaitNativeDismiss;
            return;
        }
        pendingExitSessions.current.push({ session: target, awaitNativeDismiss });
    }, []);
    const startEnter = useCallback(() => {
        motionProgress.stopAnimation();
        Animated.timing(motionProgress, {
            toValue: 1,
            duration: alertDialogRecipe.transition.enter.duration,
            easing: Easing.bezier(...easing[alertDialogRecipe.transition.enter.easing]),
            useNativeDriver: true,
        }).start();
    }, [motionProgress]);
    const completeExit = useCallback((target) => {
        cancelExitFallback();
        pendingExitSessions.current = pendingExitSessions.current.filter((candidate) => candidate.session !== target);
        if (!target.completeExit())
            return;
        if (visibleRef.current &&
            reopenAfterExitRef.current &&
            pendingExitSessions.current.length === 0) {
            reopenAfterExitRef.current = false;
            const nextSession = createAlertDialogSession(requestRef.current);
            setSession(nextSession);
            motionProgress.setValue(0);
            const keptNativeHost = nativeVisibleRef.current;
            nativeVisibleRef.current = true;
            setNativeVisible(true);
            if (keptNativeHost)
                startEnter();
            return;
        }
        if (!visibleRef.current)
            focusNativeTarget(returnFocusRef);
    }, [cancelExitFallback, motionProgress, returnFocusRef, startEnter]);
    const startExit = useCallback((target) => {
        motionProgress.stopAnimation();
        Animated.timing(motionProgress, {
            toValue: 0,
            duration: reducedMotionRef.current
                ? 0
                : alertDialogRecipe.transition.exit.duration,
            easing: Easing.bezier(...easing[alertDialogRecipe.transition.exit.easing]),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished ||
                !pendingExitSessions.current.some((candidate) => candidate.session === target)) {
                return;
            }
            if (visibleRef.current && reopenAfterExitRef.current) {
                completeExit(target);
                return;
            }
            const pending = pendingExitSessions.current.find((candidate) => candidate.session === target);
            if (!pending)
                return;
            pending.awaitNativeDismiss = shouldAwaitNativeModalDismiss(nativeShownRef.current);
            nativeShownRef.current = false;
            nativeVisibleRef.current = false;
            setNativeVisible(false);
        });
    }, [completeExit, motionProgress]);
    useEffect(() => {
        if (!previousVisible.current && visible) {
            if (pendingExitSessions.current.length > 0) {
                reopenAfterExitRef.current = true;
            }
            else {
                setSession(createAlertDialogSession(requestRef.current));
                motionProgress.setValue(0);
                nativeVisibleRef.current = true;
                setNativeVisible(true);
            }
        }
        else if (previousVisible.current && !visible) {
            const snapshot = session.getSnapshot();
            if (snapshot.status === "idle" || snapshot.status === "error") {
                session.cancel("programmatic");
            }
            ensurePendingExit(session);
            startExit(session);
        }
        previousVisible.current = visible;
    }, [ensurePendingExit, motionProgress, session, startExit, visible]);
    useEffect(() => {
        cancelExitFallback();
        if (nativeVisible)
            return undefined;
        const pending = pendingExitSessions.current[0];
        if (!pending || pending.awaitNativeDismiss)
            return undefined;
        const task = scheduleAfterNativeModalTeardown(() => {
            exitFallbackTask.current = null;
            if (!nativeVisibleRef.current &&
                pendingExitSessions.current.some((candidate) => candidate.session === pending.session)) {
                completeExit(pending.session);
            }
        });
        exitFallbackTask.current = task;
        return cancelExitFallback;
    }, [cancelExitFallback, completeExit, nativeVisible]);
    useEffect(() => {
        void session.result.then((result) => {
            if (!suppressedResults.current.has(session))
                onResultRef.current?.(result);
        });
    }, [session]);
    useEffect(() => () => {
        if (rearmTimer.current !== null)
            clearTimeout(rearmTimer.current);
        cancelExitFallback();
        motionProgress.stopAnimation();
        const pending = pendingExitSessions.current.map((entry) => entry.session);
        pendingExitSessions.current = [];
        for (const target of new Set([...pending, sessionRef.current])) {
            suppressedResults.current.add(target);
            target.interrupt();
        }
    }, [cancelExitFallback, motionProgress]);
    const requestClose = (target, reason) => {
        ensurePendingExit(target);
        changeOpen(false, { reason });
        if (open !== undefined) {
            if (rearmTimer.current !== null)
                clearTimeout(rearmTimer.current);
            rearmTimer.current = setTimeout(() => {
                rearmTimer.current = null;
                if (!visibleRef.current)
                    return;
                pendingExitSessions.current = pendingExitSessions.current.filter((candidate) => candidate.session !== target);
                suppressedResults.current.add(target);
                target.interrupt();
                setSession(createAlertDialogSession(requestRef.current));
            }, 0);
        }
    };
    const busy = phase.status === "busy";
    const error = phase.status === "error" ? phase.message : undefined;
    const cancel = (reason) => {
        if (!session.cancel(reason))
            return;
        requestClose(session, reason);
    };
    const confirm = () => {
        void session.confirm().then((closing) => {
            if (closing)
                requestClose(session, "confirm");
        });
    };
    const focusLeastDestructive = (event) => {
        nativeShownRef.current = true;
        startEnter();
        const focus = getAlertDialogInitialFocus(request.mode) === "cancel" ? cancelRef : confirmRef;
        focusNativeTarget(focus);
        onShow?.(event);
    };
    const resolvedTone = request.tone ?? alertDialogRecipe.defaults.tone;
    const toneRecipe = alertDialogRecipe.tones[resolvedTone];
    const sizeRecipe = alertDialogRecipe.sizes[alertDialogRecipe.defaults.size];
    const stackActions = windowWidth < alertDialogRecipe.actions.stackBelow ||
        environment.textScale >= 1.6;
    const contentBackground = resolveColorReference(alertDialogRecipe.content.background, palette);
    const contentBorder = resolveColorReference(alertDialogRecipe.content.border, palette);
    const confirmBackground = resolveColorReference(toneRecipe.confirm, palette);
    const confirmContent = resolveColorReference(toneRecipe.confirmContent, palette);
    const errorColor = resolveColorReference(alertDialogRecipe.error.color, palette);
    return (_jsx(Modal, { ...modalProps, animationType: "none", onDismiss: () => {
            nativeShownRef.current = false;
            const pending = pendingExitSessions.current[0];
            if (pending)
                completeExit(pending.session);
        }, onRequestClose: () => cancel("back"), onShow: focusLeastDestructive, statusBarTranslucent: true, transparent: true, visible: nativeVisible, children: _jsxs(Animated.View, { accessibilityElementsHidden: !visible, importantForAccessibility: visible ? "auto" : "no-hide-descendants", pointerEvents: visible ? "auto" : "none", style: {
                flex: 1,
                justifyContent: "center",
                opacity: motionProgress,
                padding: spacing.md,
            }, children: [_jsx(Scrim, {}), _jsxs(View, { accessibilityLabel: `${request.title}, ${request.description}`, accessibilityState: { busy }, accessibilityViewIsModal: true, importantForAccessibility: "yes", role: "alertdialog", style: [
                        {
                            alignSelf: "center",
                            backgroundColor: contentBackground,
                            borderColor: contentBorder,
                            borderRadius: radius[alertDialogRecipe.content.radius],
                            borderWidth: alertDialogRecipe.content.borderWidth,
                            elevation: 8,
                            gap: alertDialogRecipe.content.gap,
                            maxWidth: sizeRecipe.maxWidth,
                            padding: sizeRecipe.padding,
                            shadowColor: alertDialogRecipe.content.shadow.color,
                            shadowOffset: {
                                width: 0,
                                height: alertDialogRecipe.content.shadow.offsetY,
                            },
                            shadowOpacity: alertDialogRecipe.content.shadow.opacity,
                            shadowRadius: alertDialogRecipe.content.shadow.radius,
                            width: "100%",
                        },
                        contentStyle,
                    ], children: [_jsxs(View, { style: { gap: spacing.xs }, children: [_jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "title", children: request.title }), _jsx(Text, { tone: "muted", children: request.description }), error ? (_jsx(Text, { accessibilityLiveRegion: "assertive", accessibilityRole: "alert", style: { color: errorColor }, children: error })) : null] }), _jsxs(View, { style: {
                                direction: environment.direction,
                                flexDirection: stackActions ? "column" : "row",
                                gap: alertDialogRecipe.actions.gap,
                            }, children: [request.mode === "confirm" ? (_jsx(Pressable, { ref: cancelRef, accessibilityLabel: request.cancelLabel, accessibilityRole: "button", accessibilityState: { disabled: busy }, disabled: busy, onPress: () => cancel("cancel-action"), style: ({ pressed }) => [
                                        minimumTargetStyle,
                                        {
                                            alignItems: "center",
                                            backgroundColor: colors.surfaceAlt,
                                            borderColor: colors.border,
                                            borderRadius: radius.md,
                                            borderWidth: 1,
                                            flex: stackActions ? undefined : 1,
                                            justifyContent: "center",
                                            minWidth: alertDialogRecipe.actions.minButtonWidth,
                                            opacity: busy ? 0.5 : pressed ? 0.86 : 1,
                                            paddingHorizontal: spacing.md,
                                        },
                                    ], children: _jsx(Text, { variant: "label", children: request.cancelLabel }) })) : null, _jsx(Pressable, { ref: confirmRef, accessibilityLabel: request.confirmLabel, accessibilityRole: "button", accessibilityState: { busy, disabled: busy }, disabled: busy, onPress: confirm, style: ({ pressed }) => [
                                        minimumTargetStyle,
                                        {
                                            alignItems: "center",
                                            backgroundColor: confirmBackground,
                                            borderRadius: radius.md,
                                            flex: stackActions ? undefined : 1,
                                            justifyContent: "center",
                                            minWidth: alertDialogRecipe.actions.minButtonWidth,
                                            opacity: busy ? 0.5 : pressed ? 0.86 : 1,
                                            paddingHorizontal: spacing.md,
                                        },
                                    ], children: _jsx(Text, { style: { color: confirmContent }, variant: "label", children: request.confirmLabel }) })] })] })] }) }));
}
/** Native Sheet applies policy before emitting a concrete dismissal reason. */
export function Sheet({ open, defaultOpen, onOpenChange, title, description, children, footer, placement = "bottom", busy = false, dismissPolicy, closeLabel, returnFocusRef, safeAreaInsets = {}, onDismissComplete, contentStyle, onShow, ...modalProps }) {
    const { environment, palette } = useHjmNativeTheme();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const policy = { ...sheetBehaviorDefaults, ...dismissPolicy };
    const [visible, changeOpen] = useReasonedOpenState({
        ...(open === undefined ? {} : { open }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    const lifecycle = useRef(createSheetLifecycle(visible));
    const previousVisible = useRef(visible);
    const visibleRef = useRef(visible);
    visibleRef.current = visible;
    const [nativeVisible, setNativeVisible] = useState(visible);
    const nativeVisibleRef = useRef(visible);
    nativeVisibleRef.current = nativeVisible;
    const nativeShownRef = useRef(false);
    const reopenAfterDismissRef = useRef(false);
    const dismissingCycle = useRef(null);
    const [motionProgress] = useState(() => new Animated.Value(0));
    const reducedMotionRef = useRef(environment.reducedMotion);
    reducedMotionRef.current = environment.reducedMotion;
    const pendingDismissReason = useRef(null);
    const pendingDismissals = useRef([]);
    const rearmTimer = useRef(null);
    const dismissFallbackTask = useRef(null);
    const insets = {
        top: safeAreaInsets.top ?? 0,
        right: safeAreaInsets.right ?? 0,
        bottom: safeAreaInsets.bottom ?? 0,
        left: safeAreaInsets.left ?? 0,
    };
    for (const [edge, value] of Object.entries(insets)) {
        if (!Number.isFinite(value) || value < 0) {
            throw new RangeError(`Sheet safeAreaInsets.${edge} must be non-negative`);
        }
    }
    const cancelDismissFallback = useCallback(() => {
        dismissFallbackTask.current?.cancel();
        dismissFallbackTask.current = null;
    }, []);
    const startEnter = useCallback(() => {
        motionProgress.stopAnimation();
        Animated.timing(motionProgress, {
            toValue: 1,
            duration: sheetRecipe.transition.enter.duration,
            easing: Easing.bezier(...easing[sheetRecipe.transition.enter.easing]),
            useNativeDriver: true,
        }).start();
    }, [motionProgress]);
    const startExit = useCallback((cycle) => {
        motionProgress.stopAnimation();
        Animated.timing(motionProgress, {
            toValue: 0,
            duration: reducedMotionRef.current
                ? 0
                : sheetRecipe.transition.exit.duration,
            easing: Easing.bezier(...easing[sheetRecipe.transition.exit.easing]),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished ||
                visibleRef.current ||
                dismissingCycle.current !== cycle) {
                return;
            }
            const pending = pendingDismissals.current.find((candidate) => candidate.cycle === cycle);
            if (!pending)
                return;
            pending.awaitNativeDismiss = shouldAwaitNativeModalDismiss(nativeShownRef.current);
            nativeShownRef.current = false;
            nativeVisibleRef.current = false;
            setNativeVisible(false);
        });
    }, [motionProgress]);
    const completeDismiss = useCallback((cycle) => {
        cancelDismissFallback();
        const pending = pendingDismissals.current.find((candidate) => candidate.cycle === cycle);
        if (!pending || !lifecycle.current.completeDismiss(cycle))
            return;
        pendingDismissals.current = pendingDismissals.current.filter((candidate) => candidate.cycle !== cycle);
        if (dismissingCycle.current === cycle)
            dismissingCycle.current = null;
        if (visibleRef.current &&
            reopenAfterDismissRef.current &&
            pendingDismissals.current.length === 0) {
            reopenAfterDismissRef.current = false;
            lifecycle.current.open();
            motionProgress.setValue(0);
            nativeVisibleRef.current = true;
            setNativeVisible(true);
            return;
        }
        if (!visibleRef.current) {
            onDismissComplete?.({ reason: pending.reason });
            focusNativeTarget(returnFocusRef);
        }
    }, [cancelDismissFallback, motionProgress, onDismissComplete, returnFocusRef]);
    useEffect(() => {
        if (!previousVisible.current && visible) {
            const activeExit = dismissingCycle.current;
            if (activeExit !== null && nativeVisibleRef.current) {
                motionProgress.stopAnimation();
                lifecycle.current.completeDismiss(activeExit);
                pendingDismissals.current = pendingDismissals.current.filter((candidate) => candidate.cycle !== activeExit);
                dismissingCycle.current = null;
                reopenAfterDismissRef.current = false;
                lifecycle.current.open();
                startEnter();
            }
            else if (pendingDismissals.current.length > 0) {
                reopenAfterDismissRef.current = true;
            }
            else {
                lifecycle.current.open();
                motionProgress.setValue(0);
                nativeVisibleRef.current = true;
                setNativeVisible(true);
            }
        }
        if (previousVisible.current && !visible) {
            pendingDismissReason.current ??= "programmatic";
            const cycle = lifecycle.current.beginDismiss();
            if (cycle !== null) {
                dismissingCycle.current = cycle;
                pendingDismissals.current.push({
                    cycle,
                    reason: pendingDismissReason.current,
                    awaitNativeDismiss: false,
                });
                startExit(cycle);
            }
            pendingDismissReason.current = null;
        }
        previousVisible.current = visible;
    }, [motionProgress, startEnter, startExit, visible]);
    useEffect(() => {
        cancelDismissFallback();
        if (nativeVisible)
            return undefined;
        const pending = pendingDismissals.current[0];
        if (!pending || pending.awaitNativeDismiss)
            return undefined;
        const task = scheduleAfterNativeModalTeardown(() => {
            dismissFallbackTask.current = null;
            if (!nativeVisibleRef.current &&
                pendingDismissals.current.some((candidate) => candidate.cycle === pending.cycle)) {
                completeDismiss(pending.cycle);
            }
        });
        dismissFallbackTask.current = task;
        return cancelDismissFallback;
    }, [cancelDismissFallback, completeDismiss, nativeVisible]);
    useEffect(() => () => {
        if (rearmTimer.current !== null)
            clearTimeout(rearmTimer.current);
        cancelDismissFallback();
        motionProgress.stopAnimation();
    }, [cancelDismissFallback, motionProgress]);
    const requestClose = (reason) => {
        if (!canDismissSheet(reason, busy, policy))
            return;
        if (!lifecycle.current.requestClose(reason, busy, policy))
            return;
        pendingDismissReason.current = reason;
        changeOpen(false, { reason });
        if (open !== undefined) {
            if (rearmTimer.current !== null)
                clearTimeout(rearmTimer.current);
            rearmTimer.current = setTimeout(() => {
                rearmTimer.current = null;
                if (!visibleRef.current)
                    return;
                lifecycle.current = createSheetLifecycle(true);
                pendingDismissReason.current = null;
            }, 0);
        }
    };
    const physicalPlacement = placement === "bottom"
        ? "bottom"
        : placement === "start"
            ? environment.direction === "rtl" ? "right" : "left"
            : environment.direction === "rtl" ? "left" : "right";
    const side = physicalPlacement !== "bottom";
    const translationDistance = side ? windowWidth : windowHeight;
    const hiddenTranslation = physicalPlacement === "left"
        ? -translationDistance
        : translationDistance;
    const translate = motionProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [hiddenTranslation, 0],
    });
    const contentBackground = resolveColorReference(sheetRecipe.content.background, palette);
    const contentBorder = resolveColorReference(sheetRecipe.content.border, palette);
    return (_jsx(Modal, { ...modalProps, animationType: "none", onDismiss: () => {
            nativeShownRef.current = false;
            const pending = pendingDismissals.current[0];
            if (pending)
                completeDismiss(pending.cycle);
        }, onRequestClose: () => requestClose("back"), onShow: (event) => {
            nativeShownRef.current = true;
            startEnter();
            onShow?.(event);
        }, statusBarTranslucent: true, transparent: true, visible: nativeVisible, children: _jsxs(Animated.View, { accessibilityElementsHidden: !visible, importantForAccessibility: visible ? "auto" : "no-hide-descendants", pointerEvents: visible ? "auto" : "none", style: {
                alignItems: physicalPlacement === "right" ? "flex-end" : "flex-start",
                flex: 1,
                justifyContent: physicalPlacement === "bottom" ? "flex-end" : "flex-start",
                opacity: motionProgress,
            }, children: [_jsx(Scrim, {}), policy.dismissible && policy.outsideDismiss ? (_jsx(Pressable, { accessible: false, importantForAccessibility: "no-hide-descendants", onPress: () => requestClose("outside"), style: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 } })) : null, _jsxs(Animated.View, { accessibilityLabel: [title, description].filter(Boolean).join(", "), accessibilityState: { busy }, accessibilityViewIsModal: true, importantForAccessibility: "yes", role: "dialog", style: [
                        {
                            backgroundColor: contentBackground,
                            borderColor: contentBorder,
                            borderRadius: radius[sheetRecipe.content.radius],
                            borderBottomLeftRadius: physicalPlacement === "bottom" ? 0 : radius[sheetRecipe.content.radius],
                            borderBottomRightRadius: physicalPlacement === "bottom" ? 0 : radius[sheetRecipe.content.radius],
                            borderWidth: sheetRecipe.content.borderWidth,
                            elevation: 8,
                            gap: sheetRecipe.body.gap,
                            height: side ? "100%" : undefined,
                            maxWidth: side ? 420 : undefined,
                            maxHeight: side
                                ? undefined
                                : windowHeight * sheetRecipe.content.maxHeightRatio,
                            paddingBottom: sheetRecipe.content.paddingBottom + insets.bottom,
                            paddingLeft: sheetRecipe.content.paddingHorizontal + insets.left,
                            paddingRight: sheetRecipe.content.paddingHorizontal + insets.right,
                            paddingTop: sheetRecipe.content.paddingTop + insets.top,
                            shadowColor: sheetRecipe.content.shadow.color,
                            shadowOffset: {
                                width: 0,
                                height: sheetRecipe.content.shadow.offsetY,
                            },
                            shadowOpacity: sheetRecipe.content.shadow.opacity,
                            shadowRadius: sheetRecipe.content.shadow.radius,
                            transform: environment.reducedMotion
                                ? undefined
                                : side
                                    ? [{ translateX: translate }]
                                    : [{ translateY: translate }],
                            width: side ? "88%" : "100%",
                        },
                        contentStyle,
                    ], children: [_jsxs(View, { style: {
                                alignItems: "flex-start",
                                direction: environment.direction,
                                flexDirection: "row",
                                gap: spacing.sm,
                            }, children: [_jsxs(View, { style: { flex: 1, gap: spacing.xs }, children: [_jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "title", children: title }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), policy.dismissible ? (_jsx(IconButton, { disabled: busy && !policy.dismissWhileBusy, label: closeLabel, onPress: () => requestClose("close-action"), children: _jsx(Text, { accessible: false, variant: "title", children: "\u00D7" }) })) : null] }), _jsx(View, { style: { gap: sheetRecipe.body.gap }, children: children }), footer ? (_jsx(View, { style: {
                                gap: sheetRecipe.footer.gap,
                                paddingTop: sheetRecipe.footer.paddingTop,
                            }, children: footer })) : null] })] }) }));
}
//# sourceMappingURL=overlays.js.map