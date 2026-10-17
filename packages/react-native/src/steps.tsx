import {
  resolveStepsDescriptor,
  stepsRecipe,
  type ComposeStepsAccessibleName,
  type StepStatus,
  type StepsDescriptor,
  type StepsStatusLabels,
} from "@hjmds/design-contracts/components/steps";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type StepsProps<Id extends string = string> = Readonly<{
  descriptor: StepsDescriptor<Id>;
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
  renderMark?: (status: StepStatus, position: number) => ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Non-interactive linear steps preserving one cursor and reading order. */
export function Steps<Id extends string>({
  descriptor,
  statusLabels,
  composeAccessibleName,
  renderMark,
  layoutStyle,
}: StepsProps<Id>) {
  const { colors, environment, palette } = useHjmNativeTheme();
  const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
  // Colors come from stepsRecipe so labels stay body-colored as on Web; one brand color for indicator and label
  // made every reached step read as selected (2026-10-17 review N3).
  const { indicator, connector, label } = stepsRecipe;
  const color = (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, palette);
  return (
    <View accessibilityRole="summary" style={[{ direction: environment.direction, flexDirection: "row", gap: stepsRecipe.gap }, layoutStyle]}>
      {steps.map((step, index) => (
        <View accessibilityHint={step.statusLabel} accessibilityLabel={step.accessibleName} accessible key={step.id} style={{ flex: 1, gap: stepsRecipe.gap, minWidth: 0 }}>
          <View accessible={false} style={{ alignItems: "center", flexDirection: "row" }}>
            <View style={{ alignItems: "center", backgroundColor: indicator.background[step.status] === null ? colors.bg : color(indicator.background[step.status]!), borderColor: color(indicator.border[step.status]), borderRadius: indicator.size / 2, borderWidth: step.status === "current" || step.status === "error" ? indicator.activeBorderWidth : indicator.borderWidth, height: indicator.size, justifyContent: "center", width: indicator.size }}>
              {renderMark?.(step.status, step.position) ?? <Text align="center" emphasis="strong" style={{ color: color(indicator.content[step.status]) }} variant="label">{step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position}</Text>}
            </View>
            {index === steps.length - 1 ? null : <View style={{ backgroundColor: color(step.status === "complete" ? connector.tone.reached : connector.tone.unreached), flex: 1, height: connector.height }} />}
          </View>
          <Text emphasis="medium" style={{ color: color(label.color[step.status]) }} variant={label.textVariant}>{step.label}</Text>
          {step.description === undefined ? null : <Text tone="muted" variant="caption">{step.description}</Text>}
        </View>
      ))}
    </View>
  );
}
