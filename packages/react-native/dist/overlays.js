import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createAlertDialogSession, getAlertDialogInitialFocus, validateAlertDialogRequest, } from "@hjm/design-contracts/components/alert-dialog";
import { canDismissSheet, createSheetLifecycle, sheetBehaviorDefaults, } from "@hjm/design-contracts/components/sheet";
import { overlay, radius, spacing } from "@hjm/design-contracts/foundations";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, } from "react";
import { AccessibilityInfo, Modal, Pressable, View, findNodeHandle, } from "react-native";
import { Button, IconButton } from "./actions.js";
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
function useRestoreFocus(visible, returnFocusRef) {
    const previouslyVisible = useRef(visible);
    useEffect(() => {
        if (previouslyVisible.current && !visible)
            focusNativeTarget(returnFocusRef);
        previouslyVisible.current = visible;
    }, [returnFocusRef, visible]);
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
function OverlayActions({ primaryAction, secondaryAction, busy, onActionComplete, }) {
    const { environment } = useHjmNativeTheme();
    if (!primaryAction && !secondaryAction)
        return null;
    const renderAction = (action, fallbackTone) => (_jsx(View, { style: { flex: 1 }, children: _jsx(Button, { ...(action.accessibilityHint === undefined
                ? {}
                : { accessibilityHint: action.accessibilityHint }), disabled: busy || action.disabled === true, onPress: () => {
                void action.onPress();
                onActionComplete();
            }, tone: action.tone ?? fallbackTone, children: action.label }) }));
    return (_jsxs(View, { style: {
            flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
            gap: spacing.sm,
        }, children: [secondaryAction ? renderAction(secondaryAction, "secondary") : null, primaryAction ? renderAction(primaryAction, "primary") : null] }));
}
/** Native modal boundary with one reasoned close intent for each user attempt. */
export function Dialog({ open, defaultOpen, onOpenChange, title, description, children, primaryAction, secondaryAction, dismissible = true, busy = false, closeLabel, returnFocusRef, contentStyle, onShow, ...modalProps }) {
    const { colors, environment } = useHjmNativeTheme();
    const [visible, changeOpen] = useReasonedOpenState({
        ...(open === undefined ? {} : { open }),
        ...(defaultOpen === undefined ? {} : { defaultOpen }),
        ...(onOpenChange === undefined ? {} : { onOpenChange }),
    });
    useRestoreFocus(visible, returnFocusRef);
    const requestClose = (reason) => {
        if (dismissible && !busy)
            changeOpen(false, { reason });
    };
    return (_jsx(Modal, { ...modalProps, animationType: environment.reducedMotion ? "none" : "fade", onRequestClose: () => requestClose("back"), onShow: onShow, statusBarTranslucent: true, transparent: true, visible: visible, children: _jsxs(View, { style: { flex: 1, justifyContent: "center", padding: spacing.md }, children: [_jsx(Scrim, {}), dismissible ? (_jsx(Pressable, { accessible: false, importantForAccessibility: "no-hide-descendants", onPress: () => requestClose("outside"), style: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 } })) : null, _jsxs(View, { accessibilityLabel: [title, description].filter(Boolean).join(", "), accessibilityState: { busy }, accessibilityViewIsModal: true, importantForAccessibility: "yes", role: "dialog", style: [
                        {
                            alignSelf: "center",
                            backgroundColor: colors.bg,
                            borderRadius: radius.md,
                            gap: spacing.md,
                            maxWidth: 520,
                            padding: spacing.lg,
                            width: "100%",
                        },
                        contentStyle,
                    ], children: [_jsxs(View, { style: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }, children: [_jsxs(View, { style: { flex: 1, gap: spacing.xs }, children: [_jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "title", children: title }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), dismissible ? (_jsx(IconButton, { disabled: busy, label: closeLabel, onPress: () => requestClose("close-action"), children: _jsx(Text, { accessible: false, variant: "title", children: "\u00D7" }) })) : null] }), children, _jsx(OverlayActions, { busy: busy, onActionComplete: () => requestClose("close-action"), ...(primaryAction === undefined ? {} : { primaryAction }), ...(secondaryAction === undefined ? {} : { secondaryAction }) })] })] }) }));
}
/** Contract session owns duplicate confirms, busy dismissal, error and settlement. */
export function AlertDialog({ open, defaultOpen, onOpenChange, request, returnFocusRef, onResult, contentStyle, onShow, ...modalProps }) {
    validateAlertDialogRequest(request);
    const { colors, environment } = useHjmNativeTheme();
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
    const sessionRef = useRef(session);
    sessionRef.current = session;
    const pendingExitSessions = useRef([]);
    const suppressedResults = useRef(new WeakSet());
    const rearmTimer = useRef(null);
    const onResultRef = useRef(onResult);
    onResultRef.current = onResult;
    const cancelRef = useRef(null);
    const confirmRef = useRef(null);
    useEffect(() => {
        if (!previousVisible.current && visible) {
            setSession(createAlertDialogSession(requestRef.current));
        }
        else if (previousVisible.current && !visible) {
            const snapshot = session.getSnapshot();
            if (snapshot.status === "idle" || snapshot.status === "error") {
                session.cancel("programmatic");
            }
            if (!pendingExitSessions.current.includes(session)) {
                pendingExitSessions.current.push(session);
            }
        }
        previousVisible.current = visible;
    }, [session, visible]);
    useEffect(() => {
        void session.result.then((result) => {
            if (!suppressedResults.current.has(session))
                onResultRef.current?.(result);
        });
    }, [session]);
    useEffect(() => () => {
        if (rearmTimer.current !== null)
            clearTimeout(rearmTimer.current);
        sessionRef.current.interrupt();
    }, []);
    const requestClose = (target, reason) => {
        if (!pendingExitSessions.current.includes(target)) {
            pendingExitSessions.current.push(target);
        }
        changeOpen(false, { reason });
        if (open !== undefined) {
            if (rearmTimer.current !== null)
                clearTimeout(rearmTimer.current);
            rearmTimer.current = setTimeout(() => {
                rearmTimer.current = null;
                if (!visibleRef.current)
                    return;
                pendingExitSessions.current = pendingExitSessions.current.filter((candidate) => candidate !== target);
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
        const focus = getAlertDialogInitialFocus(request.mode) === "cancel" ? cancelRef : confirmRef;
        focusNativeTarget(focus);
        onShow?.(event);
    };
    return (_jsx(Modal, { ...modalProps, animationType: environment.reducedMotion ? "none" : "fade", onDismiss: () => {
            const completed = pendingExitSessions.current.shift();
            completed?.completeExit();
            focusNativeTarget(returnFocusRef);
        }, onRequestClose: () => cancel("back"), onShow: focusLeastDestructive, statusBarTranslucent: true, transparent: true, visible: visible, children: _jsxs(View, { style: { flex: 1, justifyContent: "center", padding: spacing.md }, children: [_jsx(Scrim, {}), _jsxs(View, { accessibilityLabel: `${request.title}, ${request.description}`, accessibilityState: { busy }, accessibilityViewIsModal: true, importantForAccessibility: "yes", role: "alertdialog", style: [
                        {
                            alignSelf: "center",
                            backgroundColor: colors.bg,
                            borderRadius: radius.md,
                            gap: spacing.md,
                            maxWidth: 520,
                            padding: spacing.lg,
                            width: "100%",
                        },
                        contentStyle,
                    ], children: [_jsxs(View, { style: { gap: spacing.xs }, children: [_jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "title", children: request.title }), _jsx(Text, { tone: "muted", children: request.description }), error ? (_jsx(Text, { accessibilityLiveRegion: "assertive", accessibilityRole: "alert", style: { color: colors.danger }, children: error })) : null] }), _jsxs(View, { style: {
                                flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
                                gap: spacing.sm,
                            }, children: [request.mode === "confirm" ? (_jsx(Pressable, { ref: cancelRef, accessibilityLabel: request.cancelLabel, accessibilityRole: "button", accessibilityState: { disabled: busy }, disabled: busy, onPress: () => cancel("cancel-action"), style: ({ pressed }) => [
                                        minimumTargetStyle,
                                        {
                                            alignItems: "center",
                                            backgroundColor: colors.surfaceAlt,
                                            borderColor: colors.border,
                                            borderRadius: radius.md,
                                            borderWidth: 1,
                                            flex: 1,
                                            justifyContent: "center",
                                            opacity: busy ? 0.5 : pressed ? 0.86 : 1,
                                            paddingHorizontal: spacing.md,
                                        },
                                    ], children: _jsx(Text, { variant: "label", children: request.cancelLabel }) })) : null, _jsx(Pressable, { ref: confirmRef, accessibilityLabel: request.confirmLabel, accessibilityRole: "button", accessibilityState: { busy, disabled: busy }, disabled: busy, onPress: confirm, style: ({ pressed }) => [
                                        minimumTargetStyle,
                                        {
                                            alignItems: "center",
                                            backgroundColor: request.tone === "danger" ? colors.dangerFill : colors.primary,
                                            borderRadius: radius.md,
                                            flex: 1,
                                            justifyContent: "center",
                                            opacity: busy ? 0.5 : pressed ? 0.86 : 1,
                                            paddingHorizontal: spacing.md,
                                        },
                                    ], children: _jsx(Text, { style: { color: request.tone === "danger" ? colors.onDanger : colors.onPrimary }, variant: "label", children: request.confirmLabel }) })] })] })] }) }));
}
/** Native Sheet applies policy before emitting a concrete dismissal reason. */
export function Sheet({ open, defaultOpen, onOpenChange, title, description, children, footer, placement = "bottom", busy = false, dismissPolicy, closeLabel, returnFocusRef, safeAreaInsets = {}, onDismissComplete, contentStyle, onShow, ...modalProps }) {
    const { colors, environment } = useHjmNativeTheme();
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
    const dismissingCycle = useRef(null);
    const pendingDismissReason = useRef(null);
    const rearmTimer = useRef(null);
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
    useEffect(() => {
        if (!previousVisible.current && visible)
            lifecycle.current.open();
        if (previousVisible.current && !visible) {
            pendingDismissReason.current ??= "programmatic";
            dismissingCycle.current = lifecycle.current.beginDismiss();
        }
        previousVisible.current = visible;
    }, [visible]);
    useEffect(() => () => {
        if (rearmTimer.current !== null)
            clearTimeout(rearmTimer.current);
    }, []);
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
    return (_jsx(Modal, { ...modalProps, animationType: environment.reducedMotion ? "none" : "slide", onDismiss: () => {
            if (dismissingCycle.current !== null) {
                lifecycle.current.completeDismiss(dismissingCycle.current);
                dismissingCycle.current = null;
            }
            const reason = pendingDismissReason.current;
            pendingDismissReason.current = null;
            if (reason !== null)
                onDismissComplete?.({ reason });
            focusNativeTarget(returnFocusRef);
        }, onRequestClose: () => requestClose("back"), onShow: onShow, statusBarTranslucent: true, transparent: true, visible: visible, children: _jsxs(View, { style: {
                alignItems: physicalPlacement === "right" ? "flex-end" : "flex-start",
                flex: 1,
                justifyContent: physicalPlacement === "bottom" ? "flex-end" : "flex-start",
            }, children: [_jsx(Scrim, {}), policy.dismissible && policy.outsideDismiss ? (_jsx(Pressable, { accessible: false, importantForAccessibility: "no-hide-descendants", onPress: () => requestClose("outside"), style: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 } })) : null, _jsxs(View, { accessibilityLabel: [title, description].filter(Boolean).join(", "), accessibilityState: { busy }, accessibilityViewIsModal: true, importantForAccessibility: "yes", role: "dialog", style: [
                        {
                            backgroundColor: colors.bg,
                            borderRadius: radius.lg,
                            borderBottomLeftRadius: physicalPlacement === "bottom" ? 0 : radius.lg,
                            borderBottomRightRadius: physicalPlacement === "bottom" ? 0 : radius.lg,
                            gap: spacing.md,
                            height: side ? "100%" : undefined,
                            maxWidth: side ? 420 : undefined,
                            paddingBottom: spacing.lg + insets.bottom,
                            paddingLeft: spacing.lg + insets.left,
                            paddingRight: spacing.lg + insets.right,
                            paddingTop: spacing.lg + insets.top,
                            width: side ? "88%" : "100%",
                        },
                        contentStyle,
                    ], children: [_jsxs(View, { style: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }, children: [_jsxs(View, { style: { flex: 1, gap: spacing.xs }, children: [_jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "title", children: title }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), policy.dismissible ? (_jsx(IconButton, { disabled: busy && !policy.dismissWhileBusy, label: closeLabel, onPress: () => requestClose("close-action"), children: _jsx(Text, { accessible: false, variant: "title", children: "\u00D7" }) })) : null] }), children, footer] })] }) }));
}
//# sourceMappingURL=overlays.js.map