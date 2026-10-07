import { control, fontFamily, spacing } from "@hjmds/design-contracts/foundations";
import { Platform, StyleSheet, } from "react-native";
/** Native font inheritance stops at Text subtrees (reactnative.dev/docs/text).
 * Resolve the same profile at every editor/raw text host rather than styling a
 * parent View. Keep the neutral UI on its OS default; apps register custom fonts. */
export function resolveNativeFontStyle(stack, role = "ui") {
    const first = stack[0];
    if (first === "ui-monospace" || first === "monospace") {
        return { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" };
    }
    const neutralUI = role === "ui" && stack.length === fontFamily.ui.length &&
        stack.every((family, index) => family === fontFamily.ui[index]);
    return first === undefined || neutralUI
        ? {}
        : { fontFamily: first };
}
export const minimumTargetStyle = {
    minHeight: control.minTouchTarget,
    minWidth: control.minTouchTarget,
};
export const minimumTargetHitSlop = {
    top: 4,
    right: 4,
    bottom: 4,
    left: 4,
};
function flattenTextStyle(style) {
    if (Array.isArray(style)) {
        return Object.assign({}, ...style.map((entry) => flattenTextStyle(entry)));
    }
    return StyleSheet.flatten(style) ?? {};
}
/**
 * Keeps the OS font-scale path untouched until a Provider explicitly owns the
 * value. Controlled scales disable Native multiplication and bake fontSize and
 * lineHeight into the final style exactly once. No accessibility cap is added.
 */
export function resolveNativeTextScaleProps(textScaling, style, requestedAllowFontScaling) {
    if (textScaling.mode === "native") {
        return {
            allowFontScaling: requestedAllowFontScaling ?? true,
            style,
        };
    }
    if (textScaling.scale === 1) {
        return { allowFontScaling: false, style };
    }
    const flattened = flattenTextStyle(style);
    return {
        allowFontScaling: false,
        style: {
            ...flattened,
            ...(typeof flattened.fontSize === "number"
                ? { fontSize: flattened.fontSize * textScaling.scale }
                : {}),
            ...(typeof flattened.lineHeight === "number"
                ? { lineHeight: flattened.lineHeight * textScaling.scale }
                : {}),
        },
    };
}
export function logicalTextAlign(direction) {
    return direction === "rtl" ? "right" : "left";
}
/** Android elevation draws its own shadow and also affects sibling stacking.
 * Keep the legacy host elevation without a profile; a zero-opacity profile must
 * explicitly remove the platform shadow as well as the iOS shadow properties.
 * Modals retain their separate host/positioning order (docs/design-profile.md). */
export function resolveNativeShadowElevation(token, profiled, fallbackElevation) {
    return { elevation: profiled
            ? token.opacity === 0 ? 0 : Math.max(token.radius, Math.abs(token.offsetY))
            : fallbackElevation };
}
//# sourceMappingURL=styles.js.map