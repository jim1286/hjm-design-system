import { useEffect } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveDateEntryControl, updateDateEntryDraft, type DateEntryControlProps } from "@hjmds/design-contracts/date-entry";
import { TextField } from "./inputs.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DateEntryProps = DateEntryControlProps & Readonly<{ layoutStyle?: HjmCompositionStyleProp }>;
// Older supported RN typings exclude web bday tokens. Explicit iOS content types
// and Android hints preserve autocomplete on both peer versions.
const birthdateContentTypes = { year: "birthdateYear", month: "birthdateMonth", day: "birthdateDay" } as const;
export function DateEntry(props: DateEntryProps) {
  const resolved = resolveDateEntryControl(props);
  useEffect(() => {
    // iOS does not announce live regions; report one group error instead of
    // repeating it for every affected date part. Empty/hidden errors stay silent.
    if (resolved.error && Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(resolved.error);
  }, [resolved.error]);
  const { environment } = useHjmNativeTheme();
  // Match DurationField's scale-aware wrapping; a fixed three-column row clips
  // localized labels and prevents editing under large text settings.
  const fieldBasis = spacing.xxxl * 3 * environment.textScale;
  return <View style={[props.layoutStyle, { gap: spacing.sm }]}>
    <Text variant="label">{props.labels.label}</Text>
    {props.description ? <Text>{props.description}</Text> : null}
    {resolved.error ? <Text tone="danger" accessibilityLiveRegion="assertive">{resolved.error}</Text> : null}
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
      {resolved.fields.map(field => <View key={field.part} style={{ flexGrow: 1, flexBasis: fieldBasis }}>
        <TextField label={props.labels[field.part]} accessibilityLabel={`${props.labels.label}, ${props.labels[field.part]}`}
          value={field.value} required={props.required ?? false} disabled={props.disabled ?? false} readOnly={props.readOnly ?? false}
          inputMode={field.part === "month" && props.monthInput !== "numeric" ? "text" : "numeric"}
          autoComplete={props.purpose === "birthdate" ? `birthdate-${field.part}` : "off"}
          {...(Platform.OS === "ios" ? { textContentType: props.purpose === "birthdate" ? birthdateContentTypes[field.part] : "none" } : {})}
          autoCorrect={false} autoCapitalize="none"
          invalid={Boolean(resolved.error && field.invalid)}
          {...(resolved.error && field.invalid ? { accessibilityHint: resolved.error } : props.description ? { accessibilityHint: props.description } : {})}
          onBlur={() => props.onBlur?.(field.part)}
          onValueChange={value => { if (!props.disabled && !props.readOnly) props.onValueChange(updateDateEntryDraft(props.value, field.part, value)); }} />
      </View>)}
    </View>
  </View>;
}
