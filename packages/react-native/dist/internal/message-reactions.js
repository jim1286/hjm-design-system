import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Modal, Platform, Pressable, ScrollView, View, findNodeHandle, useWindowDimensions } from "react-native";
import { scrim } from "@hjmds/design-contracts/foundations";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "../provider.js";
import { Button, IconButton } from "../actions.js";
import { FixedGlyph } from "./fixed-glyph.js";
import { ReactionPicker } from "../reaction-picker.js";
/** Core RN composition: no optional context-menu/Expo dependency enters the screens subpath. */
export function MessageReactions({ children, closeLabel, replyAction, menuAction, interactiveContent = false, ...picker }) {
    const { colors, tokens, environment } = useHjmNativeTheme();
    const insets = useHjmNativeSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const [anchor, setAnchor] = useState();
    const trigger = useRef(null);
    const firstAction = useRef(null);
    const open = anchor !== undefined && !picker.disabled;
    // Android does not deliver Modal.onDismiss; restore after removing its native surface.
    const close = () => setAnchor(undefined);
    // iOS must dismiss this modal before the product opens its action sheet.
    const queuedAction = useRef(null);
    const runQueuedAction = () => { const action = queuedAction.current; queuedAction.current = null; action?.(); };
    useEffect(() => () => { queuedAction.current = null; }, []);
    useEffect(() => { if (picker.disabled)
        setAnchor(undefined); }, [picker.disabled]);
    const restore = () => { const handle = findNodeHandle(trigger.current); if (handle)
        AccessibilityInfo.setAccessibilityFocus(handle); };
    const focusPicker = () => { const handle = findNodeHandle(firstAction.current); if (handle)
        AccessibilityInfo.setAccessibilityFocus(handle); };
    const wasOpen = useRef(false);
    useEffect(() => {
        if (wasOpen.current && !open && Platform.OS !== "ios") {
            restore();
            runQueuedAction();
        }
        wasOpen.current = open;
    }, [open]);
    const top = Math.max((insets.top ?? 0) + tokens.spacing.sm, Math.min((anchor ?? height / 2) - 76, height - (insets.bottom ?? 0) - (picker.more ? 440 : 200)));
    return _jsxs(_Fragment, { children: [_jsx(Pressable, { ref: trigger, accessible: !interactiveContent, disabled: picker.disabled ?? false, accessibilityRole: "button", accessibilityHint: picker.label, accessibilityState: { disabled: picker.disabled ?? false }, delayLongPress: screenPatternRecipe.reactionHoldMs, onLongPress: event => setAnchor(event.nativeEvent.pageY), accessibilityActions: [{ name: "activate", label: picker.label }, ...(replyAction && !replyAction.disabled ? [{ name: "reply", label: replyAction.label }] : [])], onAccessibilityAction: event => { if (event.nativeEvent.actionName === "reply") {
                    if (replyAction && !replyAction.disabled)
                        replyAction.onPress();
                }
                else if (!picker.disabled)
                    setAnchor(height / 2); }, children: children }), interactiveContent ? _jsx(IconButton, { label: picker.label, tone: "ghost", size: "small", disabled: picker.disabled ?? false, onPress: () => setAnchor(height / 2), accessibilityActions: replyAction && !replyAction.disabled ? [{ name: "reply", label: replyAction.label }] : [], onAccessibilityAction: event => { if (event.nativeEvent.actionName === "reply" && replyAction && !replyAction.disabled)
                    replyAction.onPress(); }, children: _jsx(FixedGlyph, { children: "\u00B7\u00B7\u00B7" }) }) : null, _jsx(Modal, { visible: open, transparent: true, statusBarTranslucent: true, animationType: environment.reducedMotion ? "none" : "fade", onRequestClose: close, onDismiss: () => { restore(); runQueuedAction(); }, onShow: focusPicker, children: _jsxs(View, { style: { flex: 1 }, children: [_jsx(Pressable, { accessible: false, importantForAccessibility: "no-hide-descendants", onPress: close, style: { position: "absolute", inset: 0, backgroundColor: scrim } }), _jsxs(View, { accessibilityViewIsModal: true, onAccessibilityEscape: close, style: { position: "absolute", top, left: tokens.spacing.md, width: Math.min(width - tokens.spacing.md * 2, screenPatternRecipe.reactionMenuWidth), gap: tokens.spacing.sm, maxHeight: Math.max(0, height - top - (insets.bottom ?? 0) - tokens.spacing.sm) }, children: [_jsxs(ScrollView, { style: { flexShrink: 1 }, contentContainerStyle: { gap: tokens.spacing.sm }, keyboardShouldPersistTaps: "handled", showsVerticalScrollIndicator: false, children: [_jsx(View, { style: { backgroundColor: colors.bg, borderRadius: picker.more ? tokens.radius.lg : tokens.radius.full, padding: tokens.spacing.xs }, children: _jsx(ReactionPicker, { ...picker, layout: "strip", onValueChange: value => { picker.onValueChange(value); close(); } }) }), _jsx(View, { style: { backgroundColor: colors.bg, borderRadius: tokens.radius.lg, padding: tokens.spacing.sm }, children: children }), menuAction ? _jsx(Button, { tone: "secondary", disabled: menuAction.disabled ?? false, onPress: () => { queuedAction.current = menuAction.onPress; close(); }, children: menuAction.label }) : null] }), _jsx(View, { ref: firstAction, accessible: true, accessibilityRole: "button", accessibilityLabel: closeLabel, accessibilityActions: [{ name: "activate" }], onAccessibilityAction: event => { if (event.nativeEvent.actionName === "activate")
                                        close(); }, style: { alignSelf: "flex-start", backgroundColor: colors.bg, borderRadius: tokens.radius.full }, children: _jsx(IconButton, { label: closeLabel, tone: "ghost", onPress: close, children: _jsx(FixedGlyph, { children: "\u00D7" }) }) })] })] }) })] });
}
//# sourceMappingURL=message-reactions.js.map