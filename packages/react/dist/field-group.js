import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useLayoutEffect, useRef } from "react";
import { createFieldGroupEditSession, resolveFieldGroup } from "@hjmds/design-contracts/field-group";
/** Named related fields inside an existing form; never creates a submission boundary. */
export function FieldGroup({ descriptor, renderField, layoutStyle }) {
    const groupId = useId();
    const resolved = resolveFieldGroup(descriptor);
    const session = useRef(createFieldGroupEditSession(resolved.fields));
    useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.suspend(); }, [resolved.fields]);
    const groupSupport = [resolved.description ? `${groupId}-description` : undefined, resolved.error ? `${groupId}-error` : undefined].filter(Boolean).join(" ") || undefined;
    return _jsxs("fieldset", { disabled: resolved.disabled, "aria-describedby": groupSupport, style: { border: 0, margin: 0, padding: 0, minInlineSize: 0, ...layoutStyle }, children: [_jsx("legend", { style: { maxInlineSize: "100%", overflowWrap: "anywhere", marginBlockEnd: "var(--hjm-space-sm)" }, children: resolved.label }), resolved.description ? _jsx("p", { id: `${groupId}-description`, children: resolved.description }) : null, resolved.error ? _jsx("p", { id: `${groupId}-error`, role: "alert", style: { color: "var(--hjm-color-danger)" }, children: resolved.error }) : null, _jsx("div", { style: { display: "grid", gap: "var(--hjm-space-md)", minInlineSize: 0 }, children: resolved.fields.map(field => {
                    // Encode product ids rather than indexes: reordering must preserve control identity and focus.
                    const id = `${groupId}-field-${encodeURIComponent(field.id)}`;
                    const supportId = (message) => message.scope === "group" ? `${groupId}-${message.kind}` : `${id}-${message.kind}`;
                    const support = field.support.map(supportId).join(" ");
                    return _jsxs("div", { style: { minInlineSize: 0 }, children: [renderField({ id: field.id, controlProps: { id, label: field.label, disabled: field.disabled, "aria-invalid": field.invalid,
                                    ...(support ? { "aria-describedby": support } : {}) }, guardChange: callback => session.current.guard(field.id, callback) }), field.support.filter(message => message.scope === "field").map(message => _jsx("p", { id: supportId(message), ...(message.kind === "error" ? { role: "alert", style: { color: "var(--hjm-color-danger)" } } : {}), children: message.text }, message.kind))] }, field.id);
                }) })] });
}
//# sourceMappingURL=field-group.js.map