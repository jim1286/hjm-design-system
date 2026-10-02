import { View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { changeDurationUnit, resolveDuration, type DurationFieldLabels, type DurationRange } from "@hjmds/design-contracts/duration-field";
import { NumberField } from "./number-field.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export type DurationFieldProps = DurationRange & Readonly<{ value: number; onValueChange: (seconds: number) => void; labels: DurationFieldLabels; disabled?: boolean }>;
export function DurationField({ value, onValueChange, labels, min = 0, max, disabled = false }: DurationFieldProps) {
  const parts = resolveDuration(value, { min, max });
  const { environment } = useHjmNativeTheme();
  // Scale the field's wrapping basis with its text: two narrow columns clipped minute values at 200%.
  const fieldBasis = spacing.xxxl * 3 * environment.textScale;
  return <View style={{ gap: spacing.sm }}><Text variant="label">{labels.label}</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
      {(["hours", "minutes", "seconds"] as const).map(unit => <View key={unit} style={{ flexGrow: 1, flexBasis: fieldBasis }}><NumberField label={`${labels.label}, ${labels[unit]}`} min={0} max={unit === "hours" ? Math.max(1, Math.floor(max / 3600)) : 59}
        value={parts[unit]} disabled={disabled || (unit === "hours" && max < 3600)} step={1}
        incrementLabel={labels.increment(unit)} decrementLabel={labels.decrement(unit)}
        onValueChange={next => onValueChange(changeDurationUnit(value, unit, next, { min, max }))} /></View>)}
    </View>
  </View>;
}
