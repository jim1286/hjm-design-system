// Shared by feedback and screen shells without pulling unrelated feedback UI
// into the lightweight screens entry. The public import remains /feedback.
import { ActivityIndicator, View } from "react-native";
import { useHjmNativeTheme } from "../provider.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";

export type SpinnerProps = Readonly<{
  label: string;
  size?: "small" | "large";
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Spinner({ label, size = "small", layoutStyle }: SpinnerProps) {
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessible
      style={[{ alignItems: "center", justifyContent: "center" }, layoutStyle]}
    >
      <ActivityIndicator color={colors.contentBrand} size={size} />
    </View>
  );
}

