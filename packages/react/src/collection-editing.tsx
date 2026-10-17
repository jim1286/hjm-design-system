"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { assertDistinctIds, changeColumnSettings, collectionEditingRecipe, focusAfterRemoval, recoverableFilters, snapshotSelection, type ColumnSetting, type FilterRecoveryOption, type FocusTarget, type SelectionAction } from "@hjmds/design-contracts/collection-editing";
import { Button, IconButton } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { TextField } from "./forms.js";
import { Checkbox } from "./selection.js";
import { Stack, Text } from "./layout.js";
import { FieldGroup, type FieldGroupBinding, type FieldGroupProps } from "./field-group.js";


function ErrorMessage({ children }: { children: ReactNode }) {
  return <div role="alert" style={{ display: "grid", placeItems: "center", textAlign: "center" }}><Text tone="danger">{children}</Text></div>;
}

export type InlineEditProps = Readonly<{
  id: string; value: string; label: string; editLabel: string; saveLabel: string; cancelLabel: string; errorLabel: string;
  disabled?: boolean; validate?: (draft: string) => string | undefined;
  /** Resolve only after confirming and updating the product value; reject to preserve the draft. */
  onSave: (draft: string) => void | Promise<void>;
}>;
export function InlineEdit(props: InlineEditProps) { return <InlineEditBody key={props.id} {...props} />; }
function InlineEditBody(props: InlineEditProps) {
  const [editing, setEditing] = useState(false), [draft, setDraft] = useState(props.value);
  const action = useCompositionAction(props.disabled);
  const input = useRef<HTMLInputElement>(null), trigger = useRef<HTMLButtonElement>(null), group = useRef<HTMLDivElement>(null);
  const restore = useRef(false);
  useLayoutEffect(() => {
    if (editing) input.current?.focus();
    else if (restore.current) { restore.current = false; trigger.current?.focus(); }
  }, [editing]);
  const error = props.validate?.(draft);
  const close = () => {
    restore.current = group.current?.contains(document.activeElement) ?? false;
    setEditing(false);
  };
  const save = async () => {
    if (props.disabled || error || action.pending || action.session.getSnapshot().status === "pending") return;
    const result = await action.run("save", () => props.onSave(draft));
    if (result.status === "success") close();
  };
  return <div ref={group} role="group" aria-label={props.label}>
    {/* Read state names the value with its label and edits through a pencil tool at the row end; a bare value beside a
        text "제목 수정" button lost the label (2026-10-17 review). */}
    {!editing ? <Stack axis="inline" gap="sm" align="center">
      <Stack gap="xxs" layoutStyle={{ flex: 1, minInlineSize: 0 }}><Text variant="caption" tone="muted">{props.label}</Text><Text emphasis="strong">{props.value}</Text></Stack>
      <IconButton ref={trigger} label={props.editLabel} tone="ghost" edge="end" disabled={props.disabled ?? false} onClick={() => { setDraft(props.value); action.session.reset(null); setEditing(true); }}><Icon name="edit" /></IconButton>
    </Stack>
      : <Stack gap={collectionEditingRecipe.actionGap}>
        <TextField ref={input} label={props.label} value={draft} disabled={props.disabled ?? false} readOnly={action.pending}
          {...(error ? { error, "aria-invalid": true } : {})} onValueChange={setDraft}
          onKeyDown={event => {
            // Enter during IME composition confirms a character, not the title.
            if (event.nativeEvent.isComposing || event.keyCode === 229) return;
            if (event.key === "Enter") { event.preventDefault(); void save(); }
            if (event.key === "Escape" && !action.pending) { event.preventDefault(); event.stopPropagation(); close(); }
          }} />
        <Stack axis="inline" gap="sm" wrap><Button tone="ghost" disabled={action.pending} onClick={close}>{props.cancelLabel}</Button>
          <Button loading={action.pending} disabled={props.disabled === true || !!error} onClick={() => void save()}>{props.saveLabel}</Button></Stack>
        {action.failed ? <ErrorMessage>{props.errorLabel}</ErrorMessage> : null}
      </Stack>}
  </div>;
}

export type RepeatableFieldGroupProps = Omit<FieldGroupProps, "renderField"> & Readonly<{
  renderField: (binding: FieldGroupBinding & { focusRef: (target: FocusTarget | null) => void }) => ReactNode;
  addLabel: string; removeLabel: (id: string) => string; minFields?: number; maxFields?: number;
  /** Return the new stable id to focus after the controlled descriptor includes it. */
  onAdd: () => string | undefined; onRemove: (id: string) => void;
}>;
export function RepeatableFieldGroup({ renderField, addLabel, removeLabel, minFields = 0, maxFields = Infinity, onAdd, onRemove, ...props }: RepeatableFieldGroupProps) {
  const targets = useRef(new Map<string, FocusTarget>()), add = useRef<HTMLButtonElement>(null);
  const focus = useRef<string | null | undefined>(undefined);
  useLayoutEffect(() => {
    if (focus.current === undefined) return;
    if (focus.current === null) { add.current?.focus(); focus.current = undefined; }
    else if (targets.current.has(focus.current)) { targets.current.get(focus.current)?.focus(); focus.current = undefined; }
  });
  const fields = props.descriptor.fields;
  const live = useRef(true), policy = useRef({ fields, minFields, maxFields, onAdd, onRemove, disabled: props.descriptor.disabled });
  policy.current = { fields, minFields, maxFields, onAdd, onRemove, disabled: props.descriptor.disabled };
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  return <Stack gap={collectionEditingRecipe.gap}>
    {/* Remove is a row tool: a trash IconButton at the field's end whose label names the row (icon-button.md), not a
        full-width ghost text button under the field (2026-10-17 review). End-aligned so it sits beside the input. */}
    <FieldGroup {...props} renderField={binding => <Stack axis="inline" gap="xs" align="end">
      <div style={{ flex: 1, minInlineSize: 0 }}>{renderField({ ...binding, focusRef: target => { if (target) targets.current.set(binding.id, target); else targets.current.delete(binding.id); } })}</div>
      <IconButton label={removeLabel(binding.id)} tone="ghost" edge="end" disabled={binding.controlProps.disabled || fields.length <= minFields} onClick={binding.guardChange(() => {
        const current = policy.current;
        if (!live.current || current.disabled || current.fields.length <= current.minFields) return;
        focus.current = focusAfterRemoval(current.fields.map(field => field.id), binding.id, current.fields.filter(field => field.disabled).map(field => field.id)) ?? null;
        current.onRemove(binding.id);
      })}><Icon name="delete" /></IconButton>
    </Stack>} />
    <Button ref={add} tone="secondary" disabled={props.descriptor.disabled === true || fields.length >= maxFields} onClick={() => {
      const current = policy.current;
      if (!live.current || current.disabled || current.fields.length >= current.maxFields) return;
      const id = current.onAdd(); if (id !== undefined) focus.current = id;
    }}>{addLabel}</Button>
  </Stack>;
}

export type SelectionActionBarProps = Readonly<{
  selectedIds: readonly string[]; selectionLabel: (count: number) => string;
  clearLabel: string; onClear: () => void; actions: readonly SelectionAction[];
  onAction: (actionId: string, selectedIds: readonly string[]) => void | Promise<void>; errorLabel: string; disabled?: boolean;
  /** Product supplies the exact confirmed operation to undo; never restore an entire collection. */
  recovery?: Readonly<{ label: string; onUndo: () => void | Promise<void> }>;
}>;
export function SelectionActionBar(props: SelectionActionBarProps) {
  const action = useCompositionAction(props.disabled);
  assertDistinctIds(props.actions); snapshotSelection(props.selectedIds);
  if (!props.selectedIds.length && !props.recovery && !action.pending && !action.failed) return null;
  return <div role="group" aria-label={props.selectionLabel(props.selectedIds.length)}><Stack gap="sm">
    <Text role="status">{props.selectionLabel(props.selectedIds.length)}</Text>
    <Stack axis="inline" gap="sm" wrap>
      {props.actions.map(item => <Button key={item.id} tone={item.destructive ? "danger" : "secondary"} loading={action.active === `action:${item.id}`} disabled={props.disabled === true || (action.pending && action.active !== `action:${item.id}`) || !props.selectedIds.length} onClick={() => {
        if (props.disabled) return;
        const scope = snapshotSelection(props.selectedIds);
        if (scope.length) void action.run(`action:${item.id}`, () => props.onAction(item.id, scope));
      }}>{item.label}</Button>)}
      <Button tone="ghost" disabled={props.disabled === true || action.pending || !props.selectedIds.length} onClick={props.onClear}>{props.clearLabel}</Button>
      {props.recovery ? <Button tone="ghost" loading={action.active === "undo"} disabled={props.disabled === true || (action.pending && action.active !== "undo")} onClick={() => {
        if (!props.disabled) void action.run("undo", () => props.recovery!.onUndo());
      }}>{props.recovery.label}</Button> : null}
    </Stack>
    {action.failed ? <ErrorMessage>{props.errorLabel}</ErrorMessage> : null}
  </Stack></div>;
}

export type FilterRecoveryProps = Readonly<{
  title: string; description?: string; options: readonly FilterRecoveryOption[];
  optionLabel: (option: FilterRecoveryOption) => string; onApply: (id: string) => void | Promise<void>;
  errorLabel: string; disabled?: boolean;
}>;
export function FilterRecovery(props: FilterRecoveryProps) {
  const action = useCompositionAction(props.disabled), options = recoverableFilters(props.options);
  // Fills the result area its host gives it (flex parent) and centers there, like Native.
  return <div role="group" aria-label={props.title} style={{ display: "grid", placeItems: "center", flexGrow: 1, textAlign: "center" }}><Stack gap="sm" align="center">
    <Text emphasis="strong">{props.title}</Text>{props.description ? <Text tone="muted">{props.description}</Text> : null}
    {options.map(option => <Button key={option.id} tone="secondary" loading={action.active === option.id} disabled={props.disabled === true || (action.pending && action.active !== option.id)}
      onClick={() => { if (!props.disabled) void action.run(option.id, () => props.onApply(option.id)); }}>{props.optionLabel(option)}</Button>)}
    {action.failed ? <ErrorMessage>{props.errorLabel}</ErrorMessage> : null}
  </Stack></div>;
}

export type TableColumnSettingsProps = Readonly<{
  label: string; columns: readonly ColumnSetting[]; disabled?: boolean;
  earlierLabel: (column: ColumnSetting) => string; laterLabel: (column: ColumnSetting) => string;
  onColumnsChange: (columns: readonly ColumnSetting[]) => void;
}>;
export function TableColumnSettings(props: TableColumnSettingsProps) {
  assertDistinctIds(props.columns);
  const change = (id: string, kind: "toggle" | "earlier" | "later") => {
    if (props.disabled) return;
    const next = changeColumnSettings(props.columns, id, kind); if (next !== props.columns) props.onColumnsChange(next);
  };
  const labelId = useId(), disabled = props.disabled === true;
  // One row per column: visibility checkbox, then reorder as icon tools (labels stay the accessible names); the last
  // tool takes edge="end" so its glyph slot ends on the group's edge like the checkbox starts on it (2026-10-17 audit).
  // The group label is HJM Text like Native; a browser-default <legend> rendered differently (2026-10-17 review).
  return <Stack gap="sm" role="group" aria-labelledby={labelId}><Text id={labelId} emphasis="strong">{props.label}</Text>
    {props.columns.map(column => <Stack key={column.id} axis="inline" gap="xs" align="center">
      <Checkbox label={column.label} checked={column.visible} layoutStyle={{ flex: 1, minInlineSize: 0 }} disabled={disabled || column.locked === true || (column.visible && props.columns.filter(item => item.visible).length === 1)} onCheckedChange={() => change(column.id, "toggle")} />
      <IconButton label={props.earlierLabel(column)} tone="ghost" disabled={disabled || changeColumnSettings(props.columns, column.id, "earlier") === props.columns} onClick={() => change(column.id, "earlier")}><Icon name="chevronUp" /></IconButton>
      <IconButton label={props.laterLabel(column)} tone="ghost" edge="end" disabled={disabled || changeColumnSettings(props.columns, column.id, "later") === props.columns} onClick={() => change(column.id, "later")}><Icon name="chevronDown" /></IconButton>
    </Stack>)}
  </Stack>;
}
