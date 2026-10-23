import { spacing, type ElevationStep } from "@hjmds/design-contracts/foundations";
import { type StyleProp, type TextStyle, type ViewStyle } from "react-native";
export type SpacingToken = keyof typeof spacing;
/** Native font inheritance stops at Text subtrees (reactnative.dev/docs/text).
 * Resolve the same profile at every editor/raw text host rather than styling a
 * parent View. Keep the neutral UI on its OS default; apps register custom fonts. */
export declare function resolveNativeFontStyle(stack: readonly string[], role?: "ui" | "code"): Pick<TextStyle, "fontFamily">;
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
/** Android elevation draws its own shadow and also affects sibling stacking.
 * Keep the legacy host elevation without a profile; a zero-opacity profile must
 * explicitly remove the platform shadow as well as the iOS shadow properties.
 * Modals retain their separate host/positioning order (docs/design-profile.md). */
export declare function resolveNativeShadowElevation(token: Readonly<{
    opacity: number;
    radius: number;
    offsetY: number;
}>, profiled: boolean, fallbackElevation: number): Pick<ViewStyle, "elevation">;
type ShadowToken = Readonly<{
    color: string;
    opacity: number;
    radius: number;
    offsetY: number;
}>;
/** Public `elevation` step → iOS shadow + Android elevation from the (profile-aware) shadow tokens; `none` → no style. */
export declare function resolveNativeElevationStyle(step: ElevationStep, shadows: Readonly<Record<Exclude<ElevationStep, "none">, ShadowToken>>, profiled: boolean): ViewStyle | undefined;
export {};
//# sourceMappingURL=styles.d.ts.map