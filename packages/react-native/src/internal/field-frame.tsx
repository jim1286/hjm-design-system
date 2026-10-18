import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { useEffect, type ReactNode } from "react";
import { AccessibilityInfo, Platform, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";

/**
 * The shared Field error announcement (Web: internal/field-error.tsx). Android announces the assertive
 * live region; iOS ignores live regions, so each new or changed error is announced once. Before 1.31
 * only MessageComposer and FieldGroup announced on iOS (2026-10-18), so other field errors were silent.
 */
export function useFieldErrorAnnouncement(error: string | undefined) {
  useEffect(() => { if (error && Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(error); }, [error]);
}

/** Error line for controls that draw their own caption (Select, Combobox) with the same announcement. */
export function FieldErrorText({ error }: Readonly<{ error: string }>) {
  useFieldErrorAnnouncement(error);
  return <Text accessibilityLiveRegion="assertive" tone="danger" variant="caption">{error}</Text>;
}

export function FieldMessage({ error, supportText }: Readonly<{ error?: string; supportText?: string }>) {
  const { colors } = useHjmNativeTheme();
  useFieldErrorAnnouncement(error);
  if (!error && !supportText) return null;
  return <Text accessibilityLiveRegion={error ? "assertive" : "none"}
    style={{ color: colors[error ? fieldRecipe.support.errorColor : fieldRecipe.support.hintColor] }}
    tone={error ? "danger" : "muted"} variant={fieldRecipe.support.textVariant}>
    {error ?? supportText}
  </Text>;
}

// Custom Field and built-in text inputs used separate label/support renderers.
// Keep the host control in a slot so its keyboard/ref behavior stays unchanged.
// `disabledOpacity` fades only the label here (fieldRecipe.disabledScope); the caller fades its
// control, and the hint/error message keeps full contrast.
export function NativeFieldFrame({ label, required = false, error, description, children, style, groupControl = true, disabledOpacity }: Readonly<{
  label?: string; required?: boolean; error?: string; description?: string;
  children: ReactNode; style?: StyleProp<ViewStyle>; groupControl?: boolean; disabledOpacity?: number;
}>) {
  const { colors } = useHjmNativeTheme();
  const message = <FieldMessage {...(error === undefined ? {} : { error })}
    {...(description === undefined ? {} : { supportText: description })} />;
  return <View style={[{ gap: fieldRecipe.label.gap }, style]}>
    {label ? <Text tone="body" variant={fieldRecipe.label.textVariant}
      style={{ color: colors[fieldRecipe.label.color], fontWeight: fieldRecipe.label.fontWeight, ...(disabledOpacity === undefined ? {} : { opacity: disabledOpacity }) }}>
      {label}{required ? " *" : ""}
    </Text> : null}
    {/* Custom Field keeps its direct control children: another View would change
        existing flex placement. Built-in fields retain their grouped support gap. */}
    {groupControl ? <View style={{ gap: fieldRecipe.support.gap }}>{children}{message}</View> : <>{children}{message}</>}
  </View>;
}
