import { useId } from "react";
import { resolveDateEntryControl, updateDateEntryDraft, type DateEntryControlProps } from "@hjmds/design-contracts/date-entry";
import { TextField } from "./forms.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DateEntryProps = DateEntryControlProps & Readonly<{ className?: string; layoutStyle?: HjmCompositionStyleProp }>;
/** Direct date drafts reuse TextField; Calendar/DatePicker continue to own calendar selection. */
export function DateEntry(props: DateEntryProps) {
  const id = useId();
  const resolved = resolveDateEntryControl(props);
  const support = props.description ? `${id}-hint` : undefined;
  return <fieldset className={props.className} disabled={props.disabled}
    aria-describedby={support} style={{ border: 0, margin: 0, padding: 0, minWidth: 0, ...props.layoutStyle }}>
    <legend style={{ marginBlockEnd: "var(--hjm-space-sm)" }}>{props.labels.label}</legend>
    {props.description ? <p id={`${id}-hint`}>{props.description}</p> : null}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10ch), 1fr))", gap: "var(--hjm-space-md)" }}>
      {resolved.fields.map(field => <TextField key={field.part} id={`${id}-${field.part}`}
        label={props.labels[field.part]} value={field.value} type="text"
        inputMode={field.part === "month" && props.monthInput !== "numeric" ? "text" : "numeric"}
        autoComplete={props.purpose === "birthdate" ? `bday-${field.part}` : "off"}
        required={props.required ?? false} disabled={props.disabled ?? false} readOnly={props.readOnly ?? false}
        aria-describedby={support} {...(resolved.error && field.invalid ? { error: resolved.error } : {})}
        onBlur={() => props.onBlur?.(field.part)}
        onValueChange={value => { if (!props.disabled && !props.readOnly) props.onValueChange(updateDateEntryDraft(props.value, field.part, value)); }} />)}
    </div>
  </fieldset>;
}
