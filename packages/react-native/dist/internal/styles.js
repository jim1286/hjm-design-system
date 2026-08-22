import { control, spacing } from "@hjm/design-contracts/foundations";
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
export const scalableTextDefaults = {
    allowFontScaling: true,
    maxFontSizeMultiplier: 2,
};
export function logicalTextAlign(direction) {
    return direction === "rtl" ? "right" : "left";
}
//# sourceMappingURL=styles.js.map