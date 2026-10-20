import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { useEffect } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
/**
 * The shared Field error announcement (Web: internal/field-error.tsx). Android announces the assertive
 * live region; iOS ignores live regions, so each new or changed error is announced once. Before 1.31
 * only MessageComposer and FieldGroup announced on iOS (2026-10-18), so other field errors were silent.
 */
export function useFieldErrorAnnouncement(error) {
    useEffect(() => { if (error && Platform.OS === "ios")
        AccessibilityInfo.announceForAccessibility(error); }, [error]);
}
/** Error line for controls that draw their own caption (Select, Combobox) with the same announcement. */
export function FieldErrorText({ error }) {
    useFieldErrorAnnouncement(error);
    return _jsx(Text, { accessibilityLiveRegion: "assertive", tone: "danger", variant: "caption", children: error });
}
export function FieldMessage({ error, supportText, descriptionAlign = "start" }) {
    const { colors, environment } = useHjmNativeTheme();
    useFieldErrorAnnouncement(error);
    if (!error && !supportText)
        return null;
    return _jsx(Text, { accessibilityLiveRegion: error ? "assertive" : "none", style: { color: colors[error ? fieldRecipe.support.errorColor : fieldRecipe.support.hintColor], ...(!error && descriptionAlign === "end" ? { textAlign: environment.direction === "rtl" ? "left" : "right", alignSelf: "stretch" } : {}) }, tone: error ? "danger" : "muted", variant: fieldRecipe.support.textVariant, children: error ?? supportText });
}
// Custom Field and built-in text inputs used separate label/support renderers.
// Keep the host control in a slot so its keyboard/ref behavior stays unchanged.
// `disabledOpacity` fades only the label here (fieldRecipe.disabledScope); the caller fades its
// control, and the hint/error message keeps full contrast.
export function NativeFieldFrame({ label, required = false, error, description, descriptionAlign = "start", children, style, groupControl = true, disabledOpacity, frameRef }) {
    const { colors } = useHjmNativeTheme();
    const message = _jsx(FieldMessage, { descriptionAlign: descriptionAlign, ...(error === undefined ? {} : { error }), ...(description === undefined ? {} : { supportText: description }) });
    return _jsxs(View, { ref: frameRef, collapsable: frameRef ? false : undefined, style: [{ gap: fieldRecipe.label.gap }, style], children: [label ? _jsxs(Text, { tone: "body", variant: fieldRecipe.label.textVariant, style: { color: colors[fieldRecipe.label.color], fontWeight: fieldRecipe.label.fontWeight, ...(disabledOpacity === undefined ? {} : { opacity: disabledOpacity }) }, children: [label, required ? " *" : ""] }) : null, groupControl ? _jsxs(View, { style: { gap: fieldRecipe.support.gap }, children: [children, message] }) : _jsxs(_Fragment, { children: [children, message] })] });
}
//# sourceMappingURL=field-frame.js.map