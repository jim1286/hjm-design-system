import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Platform, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveDateEntryControl, updateDateEntryDraft } from "@hjmds/design-contracts/date-entry";
import { TextField } from "./inputs.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
const birthdateContentTypes = { year: "birthdateYear", month: "birthdateMonth", day: "birthdateDay" };
export function DateEntry(props) {
    const resolved = resolveDateEntryControl(props);
    const { environment } = useHjmNativeTheme();
    // Match DurationField's scale-aware wrapping; a fixed three-column row clips
    // localized labels and prevents editing under large text settings.
    const fieldBasis = spacing.xxxl * 3 * environment.textScale;
    return _jsxs(View, { style: [props.layoutStyle, { gap: spacing.sm }], children: [_jsx(Text, { variant: "label", children: props.labels.label }), props.description ? _jsx(Text, { children: props.description }) : null, _jsx(View, { style: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md }, children: resolved.fields.map(field => _jsx(View, { style: { flexGrow: 1, flexBasis: fieldBasis }, children: _jsx(TextField, { label: props.labels[field.part], accessibilityLabel: `${props.labels.label}, ${props.labels[field.part]}`, value: field.value, required: props.required ?? false, disabled: props.disabled ?? false, readOnly: props.readOnly ?? false, inputMode: field.part === "month" && props.monthInput !== "numeric" ? "text" : "numeric", 
                        // Older supported RN typings exclude web bday tokens. Explicit iOS
                        // content types and Android hints preserve autocomplete on both peer versions.
                        autoComplete: props.purpose === "birthdate" ? `birthdate-${field.part}` : "off", ...(Platform.OS === "ios" ? { textContentType: props.purpose === "birthdate" ? birthdateContentTypes[field.part] : "none" } : {}), autoCorrect: false, autoCapitalize: "none", ...(resolved.error && field.invalid ? { error: resolved.error } : {}), onBlur: () => props.onBlur?.(field.part), onValueChange: value => { if (!props.disabled && !props.readOnly)
                            props.onValueChange(updateDateEntryDraft(props.value, field.part, value)); } }) }, field.part)) })] });
}
//# sourceMappingURL=date-entry.js.map