import {
  resolveStepsDescriptor,
  stepsRecipe,
  type ComposeStepsAccessibleName,
  type StepStatus,
  type StepsDescriptor,
  type StepsStatusLabels,
} from "@hjmds/design-contracts/components/steps";
import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type StepsProps<Id extends string = string> = Readonly<{
  descriptor: StepsDescriptor<Id>;
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
  renderMark?: (status: StepStatus, position: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

/** Non-interactive linear steps preserving one cursor and reading order. */
export function Steps<Id extends string>({
  descriptor,
  statusLabels,
  composeAccessibleName,
  renderMark,
  style,
}: StepsProps<Id>) {
  const { colors, environment } = useHjmNativeTheme();
  const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
  const statusColor = (status: StepStatus) =>
    status === "error" ? colors.danger : status === "pending" ? colors.textMuted : colors.contentBrand;
  return (
    <View accessibilityRole="summary" style={[{ direction: environment.direction, flexDirection: "row", gap: stepsRecipe.gap }, style]}>
      {steps.map((step, index) => (
        <View accessibilityHint={step.statusLabel} accessibilityLabel={step.accessibleName} accessible key={step.id} style={{ flex: 1, gap: stepsRecipe.gap, minWidth: 0 }}>
          <View accessible={false} style={{ alignItems: "center", flexDirection: "row" }}>
            <View style={{ alignItems: "center", backgroundColor: colors.surface, borderColor: statusColor(step.status), borderRadius: stepsRecipe.indicator.size / 2, borderWidth: step.status === "current" || step.status === "error" ? stepsRecipe.indicator.activeBorderWidth : stepsRecipe.indicator.borderWidth, height: stepsRecipe.indicator.size, justifyContent: "center", width: stepsRecipe.indicator.size }}>
              {renderMark?.(step.status, step.position) ?? <Text align="center" emphasis="strong" style={{ color: statusColor(step.status) }} variant="label">{step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position}</Text>}
            </View>
            {index === steps.length - 1 ? null : <View style={{ backgroundColor: step.status === "complete" ? colors.contentBrand : colors.border, flex: 1, height: stepsRecipe.connector.height }} />}
          </View>
          <Text emphasis="strong" style={{ color: statusColor(step.status) }} variant="label">{step.label}</Text>
          {step.description === undefined ? null : <Text tone="muted" variant="caption">{step.description}</Text>}
        </View>
      ))}
    </View>
  );
}
