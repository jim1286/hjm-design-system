import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { createFieldGroupEditSession, resolveFieldGroup, fieldGroupRecipe, type FieldGroupLayout, type FieldGroupDescriptor } from "@hjmds/design-contracts/field-group";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type FieldGroupBinding = Readonly<{
  id: string;
  controlProps: Readonly<{ label: string; accessibilityLabel: string; accessibilityHint?: string; disabled: boolean; invalid: boolean }>;
  guardChange: <Args extends unknown[]>(callback: (...args: Args) => void) => (...args: Args) => void;
}>;
export type FieldGroupProps = Readonly<{
  descriptor: FieldGroupDescriptor;
  renderField: (field: FieldGroupBinding) => ReactNode;
  layout?: FieldGroupLayout;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function FieldGroup({ descriptor, renderField, layout = fieldGroupRecipe.defaults.layout, layoutStyle }: FieldGroupProps) {
  const resolved = resolveFieldGroup(descriptor);
  const recipe = fieldGroupRecipe;
  const { environment } = useHjmNativeTheme();
  const session = useRef(createFieldGroupEditSession(resolved.fields));
  useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.suspend(); }, [resolved.fields]);
  useEffect(() => {
    // iOS does not announce live regions; one group announcement avoids repeating errors per input.
    if (resolved.error && Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(resolved.error);
  }, [resolved.error]);
  // accessible=true on this container would combine and hide independently editable children.
  return <View accessible={false} style={[layoutStyle, { gap: spacing[recipe.headingGap] }]}>
    <Text variant="label">{resolved.label}</Text>
    {resolved.description ? <Text>{resolved.description}</Text> : null}
    {resolved.error ? <Text tone="danger" accessibilityLiveRegion="assertive">{resolved.error}</Text> : null}
    <View style={{ gap: spacing[recipe.gap], ...(layout === "inline" ? { flexDirection: "row", flexWrap: "wrap" } as const : {}) }}>
      {resolved.fields.map(field => {
        const hint = field.support.map(message => message.text).join("\n");
        return <View key={field.id} accessible={false} style={{ minWidth: 0, gap: spacing[recipe.supportGap], ...(layout === "inline" ? { flexGrow: 1, flexBasis: recipe.inline.minWidth * environment.textScale } : {}) }}>
          {renderField({ id: field.id, controlProps: { label: field.label, accessibilityLabel: `${field.groupLabel}, ${field.label}`,
            disabled: field.disabled, invalid: field.invalid, ...(hint ? { accessibilityHint: hint } : {}) },
            guardChange: callback => session.current.guard(field.id, callback) })}
          {field.support.filter(message => message.scope === "field").map(message => <Text key={message.kind}
            {...(message.kind === "error" ? { tone: "danger" as const, accessibilityLiveRegion: "assertive" as const } : {})}>{message.text}</Text>)}
        </View>;
      })}
    </View>
  </View>;
}
