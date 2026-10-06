import { Pressable, View } from "react-native";
import { resolveRating, type RatingDescriptor } from "@hjmds/design-contracts/reference-controls";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { Text } from "./primitives.js";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
export type RatingProps = RatingDescriptor & Readonly<{ getValueLabel: (value: number | null) => string; disabled?: boolean; clearLabel?: string }> &
  (Readonly<{ readOnly: true; onValueChange?: never }> | Readonly<{ readOnly?: false; onValueChange: (value: number | null) => void }>);
function Star({ fraction }: { fraction: number }) {
  const { colors } = useHjmNativeTheme();
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "relative" }}>
    <Text style={{ fontSize: 28, lineHeight: 36, color: colors.contentBrand }}>☆</Text>
    <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fraction * 100}%`, overflow: "hidden" }}><Text style={{ fontSize: 28, lineHeight: 36, color: colors.contentBrand }}>★</Text></View>
  </View>;
}
export function Rating(props: RatingProps) {
  const { label, value, readOnly = false, disabled = false, getValueLabel, clearLabel } = props;
  const { max, fractions } = resolveRating(props);
  const { environment, colors } = useHjmNativeTheme();
  const valueLabel = getValueLabel(value);
  if (!valueLabel.trim() || (clearLabel !== undefined && !clearLabel.trim())) throw new TypeError("Rating text must not be empty");
  const row = { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.xs, direction: environment.direction };
  if (readOnly) return <View accessible accessibilityRole="image" accessibilityLabel={`${label}: ${valueLabel}`} style={row}>{fractions.map((fraction, index) => <Star key={index} fraction={fraction} />)}<Text accessible={false}>{valueLabel}</Text></View>;
  return <View style={{ gap: spacing.xs }}><Text variant="label">{label}</Text><View accessibilityRole="radiogroup" accessibilityLabel={label} style={row}>
    {Array.from({ length: max }, (_, index) => {
      const score = index + 1; const optionLabel = getValueLabel(score);
      if (!optionLabel.trim()) throw new TypeError("Rating option text must not be empty");
      return <Pressable key={score} accessibilityRole="radio" accessibilityLabel={optionLabel} accessibilityState={{ checked: value === score, disabled }} disabled={disabled}
        onPress={() => { if (!disabled) props.onValueChange?.(score); }}
        style={({ pressed }) => ({ minWidth: control.minTouchTarget, minHeight: control.minTouchTarget, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: value === score ? colors.contentBrand : colors.border, opacity: disabled ? 0.5 : pressed ? 0.7 : 1 })}><Star fraction={fractions[index]!} /></Pressable>;
    })}
  </View><Text accessibilityLiveRegion="polite">{valueLabel}</Text>{clearLabel ? <Button tone="ghost" disabled={disabled || value === null} onPress={() => props.onValueChange?.(null)}>{clearLabel}</Button> : null}</View>;
}
