import { control, spacing } from "@hjm/design-contracts/foundations";
import type { Insets, TextStyle, ViewStyle } from "react-native";

export type SpacingToken = keyof typeof spacing;

export const minimumTargetStyle = {
  minHeight: control.minTouchTarget,
  minWidth: control.minTouchTarget,
} as const satisfies ViewStyle;

export const minimumTargetHitSlop = {
  top: 4,
  right: 4,
  bottom: 4,
  left: 4,
} as const satisfies Insets;

export const scalableTextDefaults = {
  allowFontScaling: true,
  maxFontSizeMultiplier: 2,
} as const;

export function logicalTextAlign(direction: "ltr" | "rtl"): TextStyle["textAlign"] {
  return direction === "rtl" ? "right" : "left";
}
