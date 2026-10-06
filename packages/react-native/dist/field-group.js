import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { createFieldGroupEditSession, resolveFieldGroup } from "@hjmds/design-contracts/field-group";
import { Text } from "./primitives.js";
export function FieldGroup({ descriptor, renderField, layoutStyle }) {
    const resolved = resolveFieldGroup(descriptor);
    const session = useRef(createFieldGroupEditSession(resolved.fields));
    useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.update([]); }, [resolved.fields]);
    useEffect(() => {
        // iOS does not announce live regions; one group announcement avoids repeating errors per input.
        if (resolved.error && Platform.OS === "ios")
            AccessibilityInfo.announceForAccessibility(resolved.error);
    }, [resolved.error]);
    // accessible=true on this container would combine and hide independently editable children.
    return _jsxs(View, { accessible: false, style: [layoutStyle, { gap: spacing.sm }], children: [_jsx(Text, { variant: "label", children: resolved.label }), resolved.description ? _jsx(Text, { children: resolved.description }) : null, resolved.error ? _jsx(Text, { tone: "danger", accessibilityLiveRegion: "assertive", children: resolved.error }) : null, _jsx(View, { style: { gap: spacing.md }, children: resolved.fields.map(field => {
                    const hint = field.support.map(message => message.text).join("\n");
                    return _jsxs(View, { accessible: false, style: { gap: spacing.xs }, children: [renderField({ id: field.id, controlProps: { label: field.label, accessibilityLabel: `${field.groupLabel}, ${field.label}`,
                                    disabled: field.disabled, invalid: field.invalid, ...(hint ? { accessibilityHint: hint } : {}) },
                                guardChange: callback => session.current.guard(field.id, callback) }), field.support.filter(message => message.scope === "field").map(message => _jsx(Text, { ...(message.kind === "error" ? { tone: "danger", accessibilityLiveRegion: "assertive" } : {}), children: message.text }, message.kind))] }, field.id);
                }) })] });
}
//# sourceMappingURL=field-group.js.map