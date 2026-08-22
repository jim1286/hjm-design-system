import { spacing } from "@hjm/design-contracts/foundations";
import type { TextStyle } from "react-native";
export type SpacingToken = keyof typeof spacing;
export declare const minimumTargetStyle: {
    readonly minHeight: 44;
    readonly minWidth: 44;
};
export declare const minimumTargetHitSlop: {
    readonly top: 4;
    readonly right: 4;
    readonly bottom: 4;
    readonly left: 4;
};
export declare const scalableTextDefaults: {
    readonly allowFontScaling: true;
    readonly maxFontSizeMultiplier: 2;
};
export declare function logicalTextAlign(direction: "ltr" | "rtl"): TextStyle["textAlign"];
//# sourceMappingURL=styles.d.ts.map