import { useRef } from "react";
import { Platform } from "react-native";
import { resolveDateEntryControl, updateDateEntryDraft, type DateEntryControlProps } from "@hjmds/design-contracts/date-entry";
import { FieldGroup } from "./field-group.js";
import { TextField } from "./inputs.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DateEntryProps = DateEntryControlProps & Readonly<{ layoutStyle?: HjmCompositionStyleProp }>;
// Explicit iOS content types keep birthdate autocomplete on supported RN peer versions.
const birthdateContentTypes = { year: "birthdateYear", month: "birthdateMonth", day: "birthdateDay" } as const;
/** Date policy stays here; FieldGroup owns related-input semantics, feedback and edit lifetime. */
export function DateEntry(props: DateEntryProps) {
  const resolved = resolveDateEntryControl(props);
  const current = useRef(props);
  current.current = props;
  return <FieldGroup layout="inline" layoutStyle={props.layoutStyle}
    descriptor={{ label: props.labels.label, disabled: props.disabled ?? false,
      ...(props.description ? { description: props.description } : {}),
      ...(resolved.error ? { error: { message: resolved.error, fieldIds: resolved.fields.filter(field => field.invalid).map(field => field.part) } } : {}),
      fields: resolved.fields.map(field => ({ id: field.part, label: props.labels[field.part] })) }}
    renderField={({ id, controlProps, guardChange }) => {
      const field = resolved.fields.find(field => field.part === id);
      if (!field) return null;
      return <TextField {...controlProps} value={field.value}
        inputMode={field.part === "month" && props.monthInput !== "numeric" ? "text" : "numeric"}
        autoComplete={props.purpose === "birthdate" ? `birthdate-${field.part}` : "off"}
        {...(Platform.OS === "ios" ? { textContentType: props.purpose === "birthdate" ? birthdateContentTypes[field.part] : "none" } : {})}
        autoCorrect={false} autoCapitalize="none"
        required={props.required ?? false} readOnly={props.readOnly ?? false}
        onBlur={() => current.current.onBlur?.(field.part)}
        onValueChange={guardChange((value: string) => {
          // Retained host callbacks must not edit an old draft or bypass a new read-only policy.
          const latest = current.current;
          if (!latest.readOnly) latest.onValueChange(updateDateEntryDraft(latest.value, field.part, value));
        })} />;
    }} />;
}
