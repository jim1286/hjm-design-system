import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";

export function FieldMessage({ error, supportText }: Readonly<{ error?: string; supportText?: string }>) {
  const { colors } = useHjmNativeTheme();
  if (!error && !supportText) return null;
  return <Text accessibilityLiveRegion={error ? "assertive" : "none"}
    style={{ color: colors[error ? fieldRecipe.support.errorColor : fieldRecipe.support.hintColor] }}
    tone={error ? "danger" : "muted"} variant={fieldRecipe.support.textVariant}>
    {error ?? supportText}
  </Text>;
}

// Custom Field and built-in text inputs used separate label/support renderers.
// Keep the host control in a slot so its keyboard/ref behavior stays unchanged.
export function NativeFieldFrame({ label, required = false, error, description, children, style, groupControl = true }: Readonly<{
  label?: string; required?: boolean; error?: string; description?: string;
  children: ReactNode; style?: StyleProp<ViewStyle>; groupControl?: boolean;
}>) {
  const { colors } = useHjmNativeTheme();
  const message = <FieldMessage {...(error === undefined ? {} : { error })}
    {...(description === undefined ? {} : { supportText: description })} />;
  return <View style={[{ gap: fieldRecipe.label.gap }, style]}>
    {label ? <Text tone="body" variant={fieldRecipe.label.textVariant}
      style={{ color: colors[fieldRecipe.label.color], fontWeight: fieldRecipe.label.fontWeight }}>
      {label}{required ? " *" : ""}
    </Text> : null}
    {/* Custom Field keeps its direct control children: another View would change
        existing flex placement. Built-in fields retain their grouped support gap. */}
    {groupControl ? <View style={{ gap: fieldRecipe.support.gap }}>{children}{message}</View> : <>{children}{message}</>}
  </View>;
}
