import { spacing } from "@hjmds/design-contracts/foundations";
import { type StyleProp, type TextStyle } from "react-native";
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
export type NativeTextScaling = Readonly<{
    mode: "native" | "controlled";
    scale: number;
}>;
export type NativeTextScaleProps = Readonly<{
    allowFontScaling: boolean;
    style: StyleProp<TextStyle>;
}>;
/**
 * Keeps the OS font-scale path untouched until a Provider explicitly owns the
 * value. Controlled scales disable Native multiplication and bake fontSize and
 * lineHeight into the final style exactly once. No accessibility cap is added.
 */
export declare function resolveNativeTextScaleProps(textScaling: NativeTextScaling, style: StyleProp<TextStyle>, requestedAllowFontScaling?: boolean): NativeTextScaleProps;
export declare function logicalTextAlign(direction: "ltr" | "rtl"): TextStyle["textAlign"];
//# sourceMappingURL=styles.d.ts.map