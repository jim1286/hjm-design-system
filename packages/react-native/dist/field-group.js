import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { createFieldGroupEditSession, resolveFieldGroup, fieldGroupRecipe } from "@hjmds/design-contracts/field-group";
import { useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";
export function FieldGroup({ descriptor, renderField, layout = fieldGroupRecipe.defaults.layout, layoutStyle }) {
    const resolved = resolveFieldGroup(descriptor);
    const recipe = fieldGroupRecipe;
    const { environment } = useHjmNativeTheme();
    const session = useRef(createFieldGroupEditSession(resolved.fields));
    // Inline parts split each row evenly like Web's auto-fit grid: flexGrow let a wrapped last part (seconds) take the
    // whole next row while hours and minutes shared one (2026-10-17 review).
    const [rowWidth, setRowWidth] = useState(null);
    const gap = spacing[recipe.gap];
    const minWidth = recipe.inline.minWidth * environment.textScale;
    const columns = rowWidth === null ? null : Math.max(1, Math.min(resolved.fields.length, Math.floor((rowWidth + gap) / (minWidth + gap))));
    const partWidth = rowWidth === null || columns === null ? null : (rowWidth - gap * (columns - 1)) / columns;
    useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.suspend(); }, [resolved.fields]);
    useEffect(() => {
        // iOS does not announce live regions; one group announcement avoids repeating errors per input.
        if (resolved.error && Platform.OS === "ios")
            AccessibilityInfo.announceForAccessibility(resolved.error);
    }, [resolved.error]);
    // accessible=true on this container would combine and hide independently editable children.
    return _jsxs(View, { accessible: false, style: [layoutStyle, { gap: spacing[recipe.headingGap] }], children: [_jsx(Text, { variant: "label", children: resolved.label }), resolved.description ? _jsx(Text, { children: resolved.description }) : null, resolved.error ? _jsx(Text, { tone: "danger", accessibilityLiveRegion: "assertive", children: resolved.error }) : null, _jsx(View, { onLayout: layout === "inline" ? event => setRowWidth(event.nativeEvent.layout.width) : undefined, style: { gap, ...(layout === "inline" ? { flexDirection: "row", flexWrap: "wrap" } : {}) }, children: resolved.fields.map(field => {
                    const hint = field.support.map(message => message.text).join("\n");
                    return _jsxs(View, { accessible: false, style: { minWidth: 0, gap: spacing[recipe.supportGap], ...(layout === "inline" ? partWidth === null ? { flexGrow: 1, flexBasis: minWidth } : { width: partWidth } : {}) }, children: [renderField({ id: field.id, controlProps: { label: field.label, accessibilityLabel: `${field.groupLabel}, ${field.label}`,
                                    disabled: field.disabled, invalid: field.invalid, ...(hint ? { accessibilityHint: hint } : {}) },
                                guardChange: callback => session.current.guard(field.id, callback) }), field.support.filter(message => message.scope === "field").map(message => _jsx(Text, { ...(message.kind === "error" ? { tone: "danger", accessibilityLiveRegion: "assertive" } : {}), children: message.text }, message.kind))] }, field.id);
                }) })] });
}
//# sourceMappingURL=field-group.js.map