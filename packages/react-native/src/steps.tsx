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
import { Pressable, View } from "react-native";

import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type StepsProps<Id extends string = string> = Readonly<{
  descriptor: StepsDescriptor<Id>;
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
  renderMark?: (status: StepStatus, position: number) => ReactNode;
  /**
   * Return to a step before the cursor (2026-10-18, spint compose). Only those steps become buttons; the cursor and
   * later steps stay static in default linear mode. Free reading mode makes every step selectable.
   * Omit the handler while the flow is locked.
   */
  onStepPress?: (id: Id) => void;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Linear steps preserving one cursor and reading order; steps before the cursor can be pressed to go back. */
export function Steps<Id extends string>({
  descriptor,
  statusLabels,
  composeAccessibleName,
  renderMark,
  onStepPress,
  layoutStyle,
}: StepsProps<Id>) {
  const { colors, environment, palette } = useHjmNativeTheme();
  const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
  // Colors come from stepsRecipe so labels stay body-colored as on Web; one brand color for indicator and label
  // made every reached step read as selected (2026-10-17 review N3).
  const { indicator, connector, label } = stepsRecipe;
  const color = (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, palette);
  return (
    <View accessibilityRole="summary" style={[{ direction: environment.direction, flexDirection: "row", paddingHorizontal: stepsRecipe.paddingInline }, layoutStyle]}>
      {steps.map((step, index) => {
        const terminal = index === steps.length - 1;
        // The final step reserves only its copy/marker width; connectors own all remaining rail width.
        const cell = { flexGrow: terminal ? 0 : 1, flexBasis: terminal ? "auto" as const : 0, flexShrink: 1, gap: stepsRecipe.gap, minWidth: indicator.size, ...(terminal ? { maxWidth: `${100 / steps.length}%` as const } : {}) };
        const segment = (reached: boolean) => <View style={{ backgroundColor: color(reached ? connector.tone.reached : connector.tone.unreached), flex: 1, height: connector.height }} />;
        const content = <>
          <View accessible={false} style={{ alignItems: "center", flexDirection: "row" }}>
            {terminal ? segment(steps[index - 1]?.status === "complete") : null}
            <View style={{ alignItems: "center", backgroundColor: indicator.background[step.status] === null ? colors.bg : color(indicator.background[step.status]!), borderColor: color(indicator.border[step.status]), borderRadius: indicator.size / 2, borderWidth: step.status === "current" || step.status === "error" ? indicator.activeBorderWidth : indicator.borderWidth, height: indicator.size, justifyContent: "center", width: indicator.size }}>
              {renderMark?.(step.status, step.position) ?? <Text align="center" emphasis="strong" style={{ color: color(indicator.content[step.status]) }} variant="label">{step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position}</Text>}
            </View>
            {terminal ? null : segment(step.status === "complete")}
          </View>
          <Text emphasis="medium" align={terminal ? "end" : "start"} style={{ color: color(label.color[step.status]), ...(terminal ? {} : { paddingEnd: stepsRecipe.gap }) }} variant={label.textVariant}>{step.label}</Text>
          {step.description === undefined ? null : <Text tone="muted" align={terminal ? "end" : "start"} variant="caption">{step.description}</Text>}
        </>;
        // A pressable step is one named button over marker and label; the status stays the hint, as on static steps.
        return (descriptor.navigationMode === "free" || step.revisitable) && onStepPress
          ? <Pressable accessibilityRole="button" accessibilityState={{ selected: step.status === "current" || step.status === "error" }} accessibilityHint={step.statusLabel} accessibilityLabel={step.accessibleName} key={step.id}
              onPress={() => onStepPress(step.id)} style={{ ...cell, minHeight: stepsRecipe.press.minTouchTarget }}>{content}</Pressable>
          : <View accessibilityHint={step.statusLabel} accessibilityLabel={step.accessibleName} accessible key={step.id} style={cell}>{content}</View>;
      })}
    </View>
  );
}
