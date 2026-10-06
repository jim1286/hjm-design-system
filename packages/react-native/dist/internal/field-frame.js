import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { View } from "react-native";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
export function FieldMessage({ error, supportText }) {
    const { colors } = useHjmNativeTheme();
    if (!error && !supportText)
        return null;
    return _jsx(Text, { accessibilityLiveRegion: error ? "assertive" : "none", style: { color: colors[error ? fieldRecipe.support.errorColor : fieldRecipe.support.hintColor] }, tone: error ? "danger" : "muted", variant: fieldRecipe.support.textVariant, children: error ?? supportText });
}
// Custom Field and built-in text inputs used separate label/support renderers.
// Keep the host control in a slot so its keyboard/ref behavior stays unchanged.
// `disabledOpacity` fades only the label here (fieldRecipe.disabledScope); the caller fades its
// control, and the hint/error message keeps full contrast.
export function NativeFieldFrame({ label, required = false, error, description, children, style, groupControl = true, disabledOpacity }) {
    const { colors } = useHjmNativeTheme();
    const message = _jsx(FieldMessage, { ...(error === undefined ? {} : { error }), ...(description === undefined ? {} : { supportText: description }) });
    return _jsxs(View, { style: [{ gap: fieldRecipe.label.gap }, style], children: [label ? _jsxs(Text, { tone: "body", variant: fieldRecipe.label.textVariant, style: { color: colors[fieldRecipe.label.color], fontWeight: fieldRecipe.label.fontWeight, ...(disabledOpacity === undefined ? {} : { opacity: disabledOpacity }) }, children: [label, required ? " *" : ""] }) : null, groupControl ? _jsxs(View, { style: { gap: fieldRecipe.support.gap }, children: [children, message] }) : _jsxs(_Fragment, { children: [children, message] })] });
}
//# sourceMappingURL=field-frame.js.map