import { control, spacing } from "@hjm/design-contracts/foundations";
import {
  StyleSheet,
  type Insets,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

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

export type NativeTextScaling = Readonly<{
  mode: "native" | "controlled";
  scale: number;
}>;

export type NativeTextScaleProps = Readonly<{
  allowFontScaling: boolean;
  style: StyleProp<TextStyle>;
}>;

function flattenTextStyle(style: StyleProp<TextStyle>): TextStyle {
  if (Array.isArray(style)) {
    return Object.assign(
      {},
      ...style.map((entry) => flattenTextStyle(entry as StyleProp<TextStyle>)),
    ) as TextStyle;
  }
  return StyleSheet.flatten(style) ?? {};
}

/**
 * Keeps the OS font-scale path untouched until a Provider explicitly owns the
 * value. Controlled scales disable Native multiplication and bake fontSize and
 * lineHeight into the final style exactly once. No accessibility cap is added.
 */
export function resolveNativeTextScaleProps(
  textScaling: NativeTextScaling,
  style: StyleProp<TextStyle>,
  requestedAllowFontScaling?: boolean,
): NativeTextScaleProps {
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

export function logicalTextAlign(direction: "ltr" | "rtl"): TextStyle["textAlign"] {
  return direction === "rtl" ? "right" : "left";
}
