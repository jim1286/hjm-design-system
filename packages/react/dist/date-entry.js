import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { resolveDateEntryControl, updateDateEntryDraft } from "@hjmds/design-contracts/date-entry";
import { TextField } from "./forms.js";
/** Direct date drafts reuse TextField; Calendar/DatePicker continue to own calendar selection. */
export function DateEntry(props) {
    const id = useId();
    const resolved = resolveDateEntryControl(props);
    const support = [props.description ? `${id}-hint` : undefined, resolved.error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined;
    return _jsxs("fieldset", { className: props.className, disabled: props.disabled, "aria-describedby": support, style: { border: 0, margin: 0, padding: 0, minWidth: 0, ...props.layoutStyle }, children: [_jsx("legend", { style: { marginBlockEnd: "var(--hjm-space-sm)" }, children: props.labels.label }), props.description ? _jsx("p", { id: `${id}-hint`, children: props.description }) : null, resolved.error ? _jsx("p", { id: `${id}-error`, role: "alert", style: { color: "var(--hjm-color-danger)" }, children: resolved.error }) : null, _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10ch), 1fr))", gap: "var(--hjm-space-md)" }, children: resolved.fields.map(field => _jsx(TextField, { id: `${id}-${field.part}`, label: props.labels[field.part], value: field.value, type: "text", inputMode: field.part === "month" && props.monthInput !== "numeric" ? "text" : "numeric", autoComplete: props.purpose === "birthdate" ? `bday-${field.part}` : "off", required: props.required ?? false, disabled: props.disabled ?? false, readOnly: props.readOnly ?? false, "aria-describedby": support, "aria-invalid": Boolean(resolved.error && field.invalid), onBlur: () => props.onBlur?.(field.part), onValueChange: value => { if (!props.disabled && !props.readOnly)
                        props.onValueChange(updateDateEntryDraft(props.value, field.part, value)); } }, field.part)) })] });
}
//# sourceMappingURL=date-entry.js.map