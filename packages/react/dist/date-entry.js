import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from "react";
import { resolveDateEntryControl, updateDateEntryDraft } from "@hjmds/design-contracts/date-entry";
import { FieldGroup } from "./field-group.js";
import { TextField } from "./forms.js";
/** Date policy stays here; FieldGroup owns related-input semantics, feedback and edit lifetime. */
export function DateEntry(props) {
    const resolved = resolveDateEntryControl(props);
    const current = useRef(props);
    current.current = props;
    return _jsx(FieldGroup, { layout: "inline", ...(props.className === undefined ? {} : { className: props.className }), ...(props.layoutStyle === undefined ? {} : { layoutStyle: props.layoutStyle }), descriptor: { label: props.labels.label, disabled: props.disabled ?? false,
            ...(props.description ? { description: props.description } : {}),
            ...(resolved.error ? { error: { message: resolved.error, fieldIds: resolved.fields.filter(field => field.invalid).map(field => field.part) } } : {}),
            fields: resolved.fields.map(field => ({ id: field.part, label: props.labels[field.part] })) }, renderField: ({ id, controlProps, guardChange }) => {
            const field = resolved.fields.find(field => field.part === id);
            if (!field)
                return null;
            return _jsx(TextField, { ...controlProps, value: field.value, type: "text", inputMode: field.part === "month" && props.monthInput !== "numeric" ? "text" : "numeric", autoComplete: props.purpose === "birthdate" ? `bday-${field.part}` : "off", required: props.required ?? false, readOnly: props.readOnly ?? false, onBlur: () => current.current.onBlur?.(field.part), onValueChange: guardChange((value) => {
                    // Retained host callbacks must not edit an old draft or bypass a new read-only policy.
                    const latest = current.current;
                    if (!latest.readOnly)
                        latest.onValueChange(updateDateEntryDraft(latest.value, field.part, value));
                }) });
        } });
}
//# sourceMappingURL=date-entry.js.map