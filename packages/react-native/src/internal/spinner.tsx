// Shared by feedback and screen shells without pulling unrelated feedback UI
// into the lightweight screens entry. The public import remains /feedback.
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from "react-native";
import { useHjmNativeTheme } from "../provider.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { warnDeprecatedStyleProps } from "./deprecated-style.js";

export type SpinnerProps = Readonly<{
  label: string;
  size?: "small" | "large";
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and `size` for appearance.
   * Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Spinner({ label, size = "small", style, layoutStyle }: SpinnerProps) {
  warnDeprecatedStyleProps("Spinner", { style }, "layoutStyle for placement and size for appearance");
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessible
      style={[{ alignItems: "center", justifyContent: "center" }, style, layoutStyle]}
    >
      <ActivityIndicator color={colors.contentBrand} size={size} />
    </View>
  );
}

