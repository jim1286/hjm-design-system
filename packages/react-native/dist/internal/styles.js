import { control, spacing } from "@hjm/design-contracts/foundations";
import { StyleSheet, } from "react-native";
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
//# sourceMappingURL=styles.js.map