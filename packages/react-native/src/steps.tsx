import {
  resolveStepsDescriptor, stepsDefaults, stepsRecipe, validateStepsPresentation,
  type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor,
  type StepsPresentation, type StepsStatusLabels,
} from "@hjmds/design-contracts/components/steps";
import { opacity as controlOpacity } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, View, type ViewStyle } from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type StepsProps<Id extends string = string> = Readonly<{
  descriptor: StepsDescriptor<Id>;
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
  presentation?: StepsPresentation;
  /** Required localized toggle label for compact presentation. */
  overviewLabel?: string;
  /** Vertical-only slot. Keep drafts in the product's controlled state. */
  renderStepContent?: (id: Id) => ReactNode;
  renderMark?: (status: StepStatus, position: number) => ReactNode;
  onStepPress?: (id: Id) => void;
  layoutStyle?: HjmCompositionStyleProp;
}>;

function StepMark({ status, position, renderMark }: { status: StepStatus; position: number; renderMark?: StepsProps["renderMark"] }) {
  const { colors, environment, palette } = useHjmNativeTheme();
  const [opacity] = useState(() => new Animated.Value(1));
  const previous = useRef(status);
  useEffect(() => {
    opacity.stopAnimation();
    if (previous.current !== status && !environment.reducedMotion) {
      opacity.setValue(0.5);
      Animated.timing(opacity, { toValue: 1, duration: stepsRecipe.transitionDuration, useNativeDriver: true }).start();
    } else opacity.setValue(1);
    previous.current = status;
    return () => opacity.stopAnimation();
  }, [status, environment.reducedMotion, opacity]);
  const { indicator } = stepsRecipe;
  const color = (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, palette);
  const size = renderMark ? indicator.customSize : indicator.size;
  return <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ opacity, width: size, height: size, alignItems: "center", justifyContent: "center",
    borderRadius: size / 2, borderWidth: status === "error" ? indicator.activeBorderWidth : indicator.borderWidth,
    borderColor: color(indicator.border[status]), backgroundColor: renderMark || indicator.background[status] === null ? colors.bg : color(indicator.background[status]!) }}>
    {status === "current" ? <View pointerEvents="none" style={{ position: "absolute", top: -4, bottom: -4, left: -4, right: -4, borderWidth: 1, borderColor: colors.border, borderRadius: size }} /> : null}
    {renderMark?.(status, position) ?? <Text align="center" emphasis="medium" style={{ color: renderMark ? colors.text : color(indicator.content[status]) }} variant="label">{status === "complete" ? "✓" : status === "error" ? "!" : position}</Text>}
  </Animated.View>;
}

/** All presentations share one resolver: changing the layout never skips form validation. */
export function Steps<Id extends string>({ descriptor, statusLabels, composeAccessibleName, presentation = stepsDefaults.presentation,
  overviewLabel, renderStepContent, renderMark, onStepPress, layoutStyle }: StepsProps<Id>) {
  const { colors, environment, palette, tokens } = useHjmNativeTheme();
  const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
  validateStepsPresentation(presentation, overviewLabel);
  if (renderStepContent && presentation !== "vertical") throw new TypeError("Steps renderStepContent requires vertical presentation");
  const [expanded, setExpanded] = useState(false);
  const compact = presentation === "compact";
  const collapsed = compact && !expanded;
  const vertical = presentation === "vertical" || (compact && expanded);
  const current = steps.find(step => step.id === descriptor.currentStepId)!;
  const size = renderMark ? stepsRecipe.indicator.customSize : stepsRecipe.indicator.size;
  const color = (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, palette);
  const rail = <View accessibilityRole="summary" style={{ flexDirection: vertical ? "column" : "row", gap: collapsed ? tokens.spacing.xxs : 0, paddingHorizontal: collapsed ? 0 : stepsRecipe.paddingInline }}>
    {steps.map((step, index) => {
      const terminal = index === steps.length - 1;
      const cursor = step.id === descriptor.currentStepId;
      const selected = step.status === "current" || step.status === "error";
      if (collapsed) return <View accessible accessibilityLabel={step.accessibleName} accessibilityHint={step.statusLabel} key={step.id}
        style={{ flex: 1, height: stepsRecipe.segmentHeight, borderRadius: tokens.radius.full, backgroundColor: step.status === "error" ? colors.danger : step.status === "pending" ? colors.border : colors.text }} />;
      const cell: ViewStyle = vertical ? { paddingBottom: terminal ? 0 : tokens.spacing.md } : { flexGrow: terminal ? 0 : 1, flexBasis: terminal ? "auto" : 0, flexShrink: 1, minWidth: size, ...(terminal ? { maxWidth: `${100 / steps.length}%` } : {}) };
      const segment = (reached: boolean) => <View style={{ flex: 1, height: stepsRecipe.connector.height, backgroundColor: color(reached ? stepsRecipe.connector.tone.reached : stepsRecipe.connector.tone.unreached) }} />;
      const copy = <View style={{ flexShrink: 1, ...(vertical ? { flex: 1 } : {}), gap: tokens.spacing.xxs }}>
        <Text align={!vertical && terminal ? "end" : "start"} emphasis={selected ? "medium" : "regular"} variant="label" style={{ color: color(stepsRecipe.label.color[step.status]), ...(!vertical && !terminal ? { paddingEnd: stepsRecipe.gap } : {}) }}>{step.label}</Text>
        {step.description !== undefined && (!vertical || cursor) ? <Text variant="caption" tone="muted" align={!vertical && terminal ? "end" : "start"}>{step.description}</Text> : null}
        {vertical ? <Text variant="caption" tone="muted" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{step.statusLabel}</Text> : null}
      </View>;
      const mark = <StepMark status={step.status} position={step.position} {...(renderMark ? { renderMark } : {})} />;
      const content = vertical ? <>{mark}{copy}</> : <><View accessible={false} style={{ flexDirection: "row", alignItems: "center" }}>{terminal ? segment(steps[index - 1]?.status === "complete") : null}{mark}{terminal ? null : segment(step.status === "complete")}</View>{copy}</>;
      const headerStyle: ViewStyle = { minHeight: stepsRecipe.press.minTouchTarget, gap: vertical ? tokens.spacing.md : stepsRecipe.gap, ...(vertical ? { flexDirection: "row", alignItems: "center" } : {}) };
      const canPress = (descriptor.navigationMode === "free" || step.revisitable) && onStepPress;
      return <View key={step.id} style={cell}>
        {vertical && !terminal ? <View pointerEvents="none" style={{ position: "absolute", start: size / 2, top: size, bottom: 0, width: 1, backgroundColor: colors.border }} /> : null}
        {canPress ? <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={step.accessibleName} accessibilityHint={step.statusLabel}
          onPress={() => onStepPress(step.id)} style={({ pressed }) => [headerStyle, { opacity: pressed ? controlOpacity.pressed : 1 }]}>{content}</Pressable>
          : <View accessible accessibilityLabel={step.accessibleName} accessibilityHint={step.statusLabel} style={headerStyle}>{content}</View>}
        {presentation === "vertical" && cursor && renderStepContent ? <View style={{ marginStart: size + tokens.spacing.md, paddingVertical: tokens.spacing.sm }}>{renderStepContent(step.id)}</View> : null}
      </View>;
    })}
  </View>;
  return <View style={[{ direction: environment.direction }, layoutStyle]}>
    {compact ? <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing.sm, marginBottom: tokens.spacing.xs }}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flex: 1 }}><Text variant="label">{current.position} / {current.total} · {current.label}</Text><Text variant="caption" tone="muted">{current.statusLabel}</Text></View>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={overviewLabel} onPress={() => setExpanded(value => !value)}
        style={({ pressed }) => ({ minHeight: stepsRecipe.press.minTouchTarget, justifyContent: "center", opacity: pressed ? controlOpacity.pressed : 1 })}>
        <Text variant="label" tone="muted">{overviewLabel} {expanded ? "⌃" : "⌄"}</Text>
      </Pressable>
    </View> : null}{rail}
  </View>;
}
