import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { createFieldGroupEditSession, resolveFieldGroup, type FieldGroupDescriptor } from "@hjmds/design-contracts/field-group";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type FieldGroupBinding = Readonly<{
  id: string;
  controlProps: Readonly<{ id: string; label: string; disabled: boolean; "aria-invalid": boolean; "aria-describedby"?: string }>;
  guardChange: <Args extends unknown[]>(callback: (...args: Args) => void) => (...args: Args) => void;
}>;
export type FieldGroupProps = Readonly<{
  descriptor: FieldGroupDescriptor;
  renderField: (field: FieldGroupBinding) => ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Named related fields inside an existing form; never creates a submission boundary. */
export function FieldGroup({ descriptor, renderField, layoutStyle }: FieldGroupProps) {
  const groupId = useId();
  const resolved = resolveFieldGroup(descriptor);
  const session = useRef(createFieldGroupEditSession(resolved.fields));
  useLayoutEffect(() => { session.current.update(resolved.fields); return () => session.current.suspend(); }, [resolved.fields]);
  const groupSupport = [resolved.description ? `${groupId}-description` : undefined, resolved.error ? `${groupId}-error` : undefined].filter(Boolean).join(" ") || undefined;
  return <fieldset disabled={resolved.disabled} aria-describedby={groupSupport}
    style={{ border: 0, margin: 0, padding: 0, minInlineSize: 0, ...layoutStyle }}>
    <legend style={{ maxInlineSize: "100%", overflowWrap: "anywhere", marginBlockEnd: "var(--hjm-space-sm)" }}>{resolved.label}</legend>
    {resolved.description ? <p id={`${groupId}-description`}>{resolved.description}</p> : null}
    {resolved.error ? <p id={`${groupId}-error`} role="alert" style={{ color: "var(--hjm-color-danger)" }}>{resolved.error}</p> : null}
    <div style={{ display: "grid", gap: "var(--hjm-space-md)", minInlineSize: 0 }}>
      {resolved.fields.map(field => {
        // Encode product ids rather than indexes: reordering must preserve control identity and focus.
        const id = `${groupId}-field-${encodeURIComponent(field.id)}`;
        const supportId = (message: typeof field.support[number]) => message.scope === "group" ? `${groupId}-${message.kind}` : `${id}-${message.kind}`;
        const support = field.support.map(supportId).join(" ");
        return <div key={field.id} style={{ minInlineSize: 0 }}>
          {renderField({ id: field.id, controlProps: { id, label: field.label, disabled: field.disabled, "aria-invalid": field.invalid,
            ...(support ? { "aria-describedby": support } : {}) }, guardChange: callback => session.current.guard(field.id, callback) })}
          {field.support.filter(message => message.scope === "field").map(message => <p key={message.kind} id={supportId(message)}
            {...(message.kind === "error" ? { role: "alert", style: { color: "var(--hjm-color-danger)" } } : {})}>{message.text}</p>)}
        </div>;
      })}
    </div>
  </fieldset>;
}
