import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { radius, typography } from "@hjmds/design-contracts/foundations";
import { resolveNativeTextScaleProps } from "./internal/styles.js";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { BackHandler, View } from "react-native";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView, BottomSheetBackdrop, BottomSheetHandle, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ReduceMotion } from "react-native-reanimated";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "./provider.js";
/**
 * The keyboard-aware input with the HJM field frame. The raw library input had no
 * border or padding, so it read as plain text (2026-09-30 audit).
 */
export const GestureSheetInput = forwardRef(function GestureSheetInput({ style, ...props }, ref) {
    const { colors, textScaling } = useHjmNativeTheme();
    const metrics = typography[fieldRecipe.textVariant];
    // Preserve the sheet's keyboard-tracking host, but derive its presentation
    // and font scaling from the same recipe as TextField instead of a third style.
    const scaled = resolveNativeTextScaleProps(textScaling, [{
            borderColor: colors[fieldRecipe.states.idle.border],
            borderRadius: radius[fieldRecipe.shapes[fieldRecipe.defaults.shape]],
            borderWidth: fieldRecipe.borderWidth,
            backgroundColor: colors[fieldRecipe.variants[fieldRecipe.defaults.variant].background],
            color: colors.text, fontSize: metrics.fontSize, fontWeight: metrics.fontWeight,
            lineHeight: metrics.lineHeight, minHeight: fieldRecipe.minHeight,
            paddingHorizontal: fieldRecipe.paddingHorizontal, paddingVertical: fieldRecipe.paddingVertical,
        }, style], props.allowFontScaling);
    return _jsx(BottomSheetTextInput, { ref: ref, placeholderTextColor: colors[fieldRecipe.placeholder.color], ...props, ...scaled });
});
/**
 * Open sheets, newest last. Android back inside an RN Modal goes to the Modal's
 * onRequestClose and never reaches BackHandler, so the host closed instead of the
 * sheet (2026-09-30 audit). A host that renders GestureSheet inside a Modal calls
 * `dismissTopGestureSheet()` from onRequestClose first; BackHandler still covers
 * sheets outside a Modal. Rejected: patching the Modal, which the host owns.
 */
const openSheets = [];
/** Closes the newest open GestureSheet. Returns false when none is open (let the host close). */
export function dismissTopGestureSheet() {
    const close = openSheets[openSheets.length - 1];
    if (!close)
        return false;
    close();
    return true;
}
export function GestureSheetProvider({ children }) {
    // Fixed points keep public index semantics stable; dynamic sizing inserts another point.
    return _jsx(BottomSheetModalProvider, { children: children });
}
/** Explicit gesture variant: it does not silently change the canonical Sheet. */
export function GestureSheet({ open, onOpenChange, title, closeLabel, children, snapPoints = ["50%", "90%"], initialIndex = 0, busy = false, safeAreaInsets }) {
    const theme = useHjmNativeTheme();
    const providerInsets = useHjmNativeSafeAreaInsets();
    const topInset = safeAreaInsets?.top ?? providerInsets.top ?? 0;
    const bottomInset = safeAreaInsets?.bottom ?? providerInsets.bottom ?? 0;
    const modal = useRef(null);
    const presented = useRef(false);
    const openRef = useRef(open);
    openRef.current = open;
    if (!title.trim() || !closeLabel.trim() || !snapPoints.length || !Number.isInteger(initialIndex) || initialIndex < 0 || initialIndex >= snapPoints.length ||
        snapPoints.some(point => typeof point === "number" ? !Number.isFinite(point) || point <= 0 : !/^\d+(\.\d+)?%$/.test(point) || parseFloat(point) <= 0 || parseFloat(point) > 100)) {
        throw new TypeError("GestureSheet needs labels, positive snap points and a valid index");
    }
    useEffect(() => {
        if (open) {
            presented.current = true;
            modal.current?.present();
        }
        else if (presented.current) {
            // Gorhom 5.2 dismisses an unmounted modal into DISMISSING; its later portal
            // mount is then rejected. Only dismiss sessions this adapter has presented.
            presented.current = false;
            modal.current?.dismiss();
        }
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        // Busy keeps the sheet but still consumes back, as before.
        const close = () => { if (!busy)
            onOpenChange(false); };
        openSheets.push(close);
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => { close(); return true; });
        return () => {
            subscription.remove();
            const at = openSheets.lastIndexOf(close);
            if (at >= 0)
                openSheets.splice(at, 1);
        };
    }, [open, busy, onOpenChange]);
    // The library's backdrop and handle announce English defaults ("Bottom sheet
    // backdrop", "Bottom sheet handle"; 2026-09-30 audit). The backdrop becomes a
    // localized dismiss button like the canonical Sheet's, and only while it can
    // dismiss; the handle leaves the tree because the close button is the
    // accessible route between snap points' end states.
    const backdrop = useCallback((props) => _jsx(BottomSheetBackdrop, { ...props, accessible: !busy, accessibilityLabel: closeLabel, accessibilityHint: "", accessibilityRole: "button", appearsOnIndex: 0, disappearsOnIndex: -1, pressBehavior: busy ? "none" : "close" }), [busy, closeLabel]);
    const handle = useCallback((props) => _jsx(BottomSheetHandle, { ...props, accessible: false, indicatorStyle: { backgroundColor: theme.colors.text } }), [theme.colors.text]);
    // The library background is itself an accessible "Bottom Sheet" adjustable element
    // (hardcoded, no prop), so it is replaced with a plain surface.
    const background = useCallback(({ style, pointerEvents }) => _jsx(View, { accessible: false, pointerEvents: pointerEvents, style: [{ borderTopLeftRadius: theme.tokens.radius.lg, borderTopRightRadius: theme.tokens.radius.lg }, style] }), [theme.tokens.radius.lg]);
    // Fixed points keep public index semantics stable; dynamic sizing inserts another point.
    // accessible={false}: the container defaulted to one "Bottom Sheet" element that
    // swallowed the title, input and close button; the localized title replaces the
    // English default name wherever the container is still listed. topInset keeps the 90% snap below
    // the status bar, where the title used to sit (2026-09-30 audit).
    return _jsx(BottomSheetModal, { ref: modal, index: initialIndex, snapPoints: [...snapPoints], accessible: false, accessibilityLabel: title, accessibilityRole: "none", topInset: topInset, handleComponent: handle, backgroundComponent: background, enableDynamicSizing: false, enablePanDownToClose: !busy, backdropComponent: backdrop, overrideReduceMotion: theme.environment.reducedMotion ? ReduceMotion.Always : ReduceMotion.System, backgroundStyle: { backgroundColor: theme.colors.bg }, onDismiss: () => { presented.current = false; if (openRef.current)
            onOpenChange(false); }, children: _jsx(BottomSheetScrollView, { keyboardShouldPersistTaps: "handled", children: _jsxs(View, { accessibilityViewIsModal: true, style: { gap: theme.tokens.spacing.sm, padding: theme.tokens.spacing.lg, paddingBottom: theme.tokens.spacing.lg + bottomInset }, children: [_jsx(Text, { accessibilityRole: "header", children: title }), children, _jsx(Button, { disabled: busy, onPress: () => onOpenChange(false), children: closeLabel })] }) }) });
}
//# sourceMappingURL=sheet-gesture.js.map