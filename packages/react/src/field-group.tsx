import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { createFieldGroupEditSession, resolveFieldGroup, fieldGroupRecipe, type FieldGroupLayout, type FieldGroupDescriptor } from "@hjmds/design-contracts/field-group";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { Text } from "./layout.js";

export type FieldGroupBinding = Readonly<{
  id: string;
  controlProps: Readonly<{ id: string; label: string; disabled: boolean; "aria-invalid": boolean; "aria-describedby"?: string }>;
  guardChange: <Args extends unknown[]>(callback: (...args: Args) => void) => (...args: Args) => void;
}>;
export type FieldGroupProps = Readonly<{
  descriptor: FieldGroupDescriptor;
  renderField: (field: FieldGroupBinding) => ReactNode;
  layout?: FieldGroupLayout;
  className?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Named related fields inside an existing form; never creates a submission boundary. */
export function FieldGroup({ descriptor, renderField, layout = fieldGroupRecipe.defaults.layout, className, layoutStyle }: FieldGroupProps) {
  const groupId = useId();
  const resolved = resolveFieldGroup(descriptor);
  const recipe = fieldGroupRecipe;
  const session = useRef(createFieldGroupEditSession(resolved.fields));
  useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.suspend(); }, [resolved.fields]);
  // fieldGroupRecipe.inline.wrap "all-or-none" without measuring: below the width that fits every part, the
  // flex-basis turns huge and each part takes a full row; above it, parts share the row up to maxWidth.
  const scaled = (px: number) => `(${px}px * var(--hjm-text-scale, 1))`;
  const gapCss = `var(--hjm-space-${recipe.gap})`;
  const fitsAll = `(${resolved.fields.length} * ${scaled(recipe.inline.minWidth)} + ${Math.max(0, resolved.fields.length - 1)} * ${gapCss})`;
  const inlinePart = { flexGrow: 1, flexBasis: `calc((${fitsAll} - 100%) * 999)`, maxInlineSize: `max(calc${scaled(recipe.inline.maxWidth)}, calc((100% - ${fitsAll}) * -999))` };
  const groupSupport = [resolved.description ? `${groupId}-description` : undefined, resolved.error ? `${groupId}-error` : undefined].filter(Boolean).join(" ") || undefined;
  return <fieldset className={className} disabled={resolved.disabled} aria-describedby={groupSupport}
    style={{ border: 0, margin: 0, padding: 0, minInlineSize: 0, ...layoutStyle }}>
    <legend style={{ maxInlineSize: "100%", overflowWrap: "anywhere", paddingInline: 0, marginBlockEnd: `var(--hjm-space-${recipe.headingGap})` }}><Text variant={recipe.heading.textVariant} emphasis={recipe.heading.emphasis}>{resolved.label}</Text></legend>
    {/* Same rhythm as Native's View gap: legend→description→error→fields at headingGap, support under a field at
        supportGap. Raw <p> carried browser margins that made Web gaps about 1.5x Native's (2026-10-17 review). */}
    <div style={{ display: "grid", gap: `var(--hjm-space-${recipe.headingGap})`, minInlineSize: 0 }}>
    {resolved.description ? <Text as="p" id={`${groupId}-description`}>{resolved.description}</Text> : null}
    {resolved.error ? <Text as="p" id={`${groupId}-error`} role="alert" tone="danger">{resolved.error}</Text> : null}
    <div style={{ display: layout === "inline" ? "flex" : "grid", ...(layout === "inline" ? { flexWrap: "wrap" } : {}), gap: `var(--hjm-space-${recipe.gap})`, minInlineSize: 0 }}>
      {resolved.fields.map(field => {
        // Encode product ids rather than indexes: reordering must preserve control identity and focus.
        const id = `${groupId}-field-${encodeURIComponent(field.id)}`;
        const supportId = (message: typeof field.support[number]) => message.scope === "group" ? `${groupId}-${message.kind}` : `${id}-${message.kind}`;
        const support = field.support.map(supportId).join(" ");
        return <div key={field.id} style={{ display: "grid", gap: `var(--hjm-space-${recipe.supportGap})`, alignContent: "start", minInlineSize: 0, ...(layout === "inline" ? inlinePart : {}) }}>
          {renderField({ id: field.id, controlProps: { id, label: field.label, disabled: field.disabled, "aria-invalid": field.invalid,
            ...(support ? { "aria-describedby": support } : {}) }, guardChange: callback => session.current.guard(field.id, callback) })}
          {field.support.filter(message => message.scope === "field").map(message => <Text as="p" key={message.kind} id={supportId(message)}
            {...(message.kind === "error" ? { role: "alert", tone: "danger" as const } : {})}>{message.text}</Text>)}
        </div>;
      })}
    </div>
    </div>
  </fieldset>;
}
