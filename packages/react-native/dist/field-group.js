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
    // fieldGroupRecipe.inline.wrap "all-or-none": parts share one row (each up to maxWidth) only when all fit,
    // otherwise each takes the full row — the same breakpoint as Web's flex-basis rule.
    const [rowWidth, setRowWidth] = useState(null);
    const gap = spacing[recipe.gap];
    const count = resolved.fields.length;
    const minWidth = recipe.inline.minWidth * environment.textScale;
    const maxWidth = recipe.inline.maxWidth * environment.textScale;
    const partWidth = rowWidth === null ? null
        : rowWidth >= count * minWidth + (count - 1) * gap ? Math.min(maxWidth, (rowWidth - gap * (count - 1)) / count) : rowWidth;
    useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.suspend(); }, [resolved.fields]);
    useEffect(() => {
        // iOS does not announce live regions; one group announcement avoids repeating errors per input.
        if (resolved.error && Platform.OS === "ios")
            AccessibilityInfo.announceForAccessibility(resolved.error);
    }, [resolved.error]);
    // accessible=true on this container would combine and hide independently editable children.
    return _jsxs(View, { accessible: false, style: [layoutStyle, { gap: spacing[recipe.headingGap] }], children: [_jsx(Text, { variant: recipe.heading.textVariant, emphasis: recipe.heading.emphasis, children: resolved.label }), resolved.description ? _jsx(Text, { children: resolved.description }) : null, resolved.error ? _jsx(Text, { tone: "danger", accessibilityLiveRegion: "assertive", children: resolved.error }) : null, _jsx(View, { onLayout: layout === "inline" ? event => setRowWidth(event.nativeEvent.layout.width) : undefined, style: { gap, ...(layout === "inline" ? { flexDirection: "row", flexWrap: "wrap" } : {}) }, children: resolved.fields.map(field => {
                    const hint = field.support.map(message => message.text).join("\n");
                    return _jsxs(View, { accessible: false, style: { minWidth: 0, gap: spacing[recipe.supportGap], ...(layout === "inline" ? partWidth === null ? { flexGrow: 1, flexBasis: minWidth } : { width: partWidth } : {}) }, children: [renderField({ id: field.id, controlProps: { label: field.label, accessibilityLabel: `${field.groupLabel}, ${field.label}`,
                                    disabled: field.disabled, invalid: field.invalid, ...(hint ? { accessibilityHint: hint } : {}) },
                                guardChange: callback => session.current.guard(field.id, callback) }), field.support.filter(message => message.scope === "field").map(message => _jsx(Text, { ...(message.kind === "error" ? { tone: "danger", accessibilityLiveRegion: "assertive" } : {}), children: message.text }, message.kind))] }, field.id);
                }) })] });
}
//# sourceMappingURL=field-group.js.map