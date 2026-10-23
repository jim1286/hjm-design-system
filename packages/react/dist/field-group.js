"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useLayoutEffect, useRef } from "react";
import { createFieldGroupEditSession, resolveFieldGroup, fieldGroupRecipe } from "@hjmds/design-contracts/field-group";
import { Text } from "./layout.js";
/** Named related fields inside an existing form; never creates a submission boundary. */
export function FieldGroup({ descriptor, renderField, layout = fieldGroupRecipe.defaults.layout, className, layoutStyle }) {
    const groupId = useId();
    const resolved = resolveFieldGroup(descriptor);
    const recipe = fieldGroupRecipe;
    const session = useRef(createFieldGroupEditSession(resolved.fields));
    useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.suspend(); }, [resolved.fields]);
    // fieldGroupRecipe.inline.wrap "all-or-none" without measuring: below the width that fits every part, the
    // flex-basis turns huge and each part takes a full row; above it, parts share the row up to maxWidth.
    const scaled = (px) => `(${px}px * var(--hjm-text-scale, 1))`;
    const gapCss = `var(--hjm-space-${recipe.gap})`;
    const fitsAll = `(${resolved.fields.length} * ${scaled(recipe.inline.minWidth)} + ${Math.max(0, resolved.fields.length - 1)} * ${gapCss})`;
    const inlinePart = { flexGrow: 1, flexBasis: `calc((${fitsAll} - 100%) * 999)`, maxInlineSize: `max(calc${scaled(recipe.inline.maxWidth)}, calc((100% - ${fitsAll}) * -999))` };
    const groupSupport = [resolved.description ? `${groupId}-description` : undefined, resolved.error ? `${groupId}-error` : undefined].filter(Boolean).join(" ") || undefined;
    return _jsxs("fieldset", { className: className, disabled: resolved.disabled, "aria-describedby": groupSupport, style: { border: 0, margin: 0, padding: 0, minInlineSize: 0, ...layoutStyle }, children: [_jsx("legend", { style: { maxInlineSize: "100%", overflowWrap: "anywhere", paddingInline: 0, marginBlockEnd: `var(--hjm-space-${recipe.headingGap})` }, children: _jsx(Text, { variant: recipe.heading.textVariant, emphasis: recipe.heading.emphasis, children: resolved.label }) }), _jsxs("div", { style: { display: "grid", gap: `var(--hjm-space-${recipe.headingGap})`, minInlineSize: 0 }, children: [resolved.description ? _jsx(Text, { as: "p", id: `${groupId}-description`, children: resolved.description }) : null, resolved.error ? _jsx(Text, { as: "p", id: `${groupId}-error`, role: "alert", tone: "danger", children: resolved.error }) : null, _jsx("div", { style: { display: layout === "inline" ? "flex" : "grid", ...(layout === "inline" ? { flexWrap: "wrap" } : {}), gap: `var(--hjm-space-${recipe.gap})`, minInlineSize: 0 }, children: resolved.fields.map(field => {
                            // Encode product ids rather than indexes: reordering must preserve control identity and focus.
                            const id = `${groupId}-field-${encodeURIComponent(field.id)}`;
                            const supportId = (message) => message.scope === "group" ? `${groupId}-${message.kind}` : `${id}-${message.kind}`;
                            const support = field.support.map(supportId).join(" ");
                            return _jsxs("div", { style: { display: "grid", gap: `var(--hjm-space-${recipe.supportGap})`, alignContent: "start", minInlineSize: 0, ...(layout === "inline" ? inlinePart : {}) }, children: [renderField({ id: field.id, controlProps: { id, label: field.label, disabled: field.disabled, "aria-invalid": field.invalid,
                                            ...(support ? { "aria-describedby": support } : {}) }, guardChange: callback => session.current.guard(field.id, callback) }), field.support.filter(message => message.scope === "field").map(message => _jsx(Text, { as: "p", id: supportId(message), ...(message.kind === "error" ? { role: "alert", tone: "danger" } : {}), children: message.text }, message.kind))] }, field.id);
                        }) })] })] });
}
//# sourceMappingURL=field-group.js.map