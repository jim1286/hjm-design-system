import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Platform, View, type TextInput } from "react-native";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { assertDistinctIds, changeColumnSettings, collectionEditingRecipe, focusAfterRemoval, recoverableFilters, snapshotSelection, type ColumnSetting, type FilterRecoveryOption, type FocusTarget, type SelectionAction } from "@hjmds/design-contracts/collection-editing";
import { Button } from "./actions.js";
import { TextField, Checkbox } from "./inputs.js";
import { Stack, Text } from "./primitives.js";
import { FieldGroup, type FieldGroupBinding, type FieldGroupProps } from "./field-group.js";


function ErrorMessage({ children }: { children: string }) {
  useEffect(() => {
    // Native live regions announce updates on Android; iOS needs an explicit announcement.
    if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(children);
  }, [children]);
  return <View style={{ alignItems: "center", justifyContent: "center" }}><Text tone="danger" align="center" accessibilityRole="alert" accessibilityLiveRegion="assertive">{children}</Text></View>;
}

export type InlineEditProps = Readonly<{
  id: string; value: string; label: string; editLabel: string; saveLabel: string; cancelLabel: string; errorLabel: string;
  disabled?: boolean; validate?: (draft: string) => string | undefined;
  onSave: (draft: string) => void | Promise<void>;
}>;
export function InlineEdit(props: InlineEditProps) { return <InlineEditBody key={props.id} {...props} />; }
function InlineEditBody(props: InlineEditProps) {
  const [editing, setEditing] = useState(false), [draft, setDraft] = useState(props.value);
  const action = useCompositionAction(props.disabled);
  const input = useRef<TextInput>(null), trigger = useRef<View>(null), restore = useRef(false);
  useLayoutEffect(() => {
    if (editing) input.current?.focus();
    else if (restore.current) { restore.current = false; trigger.current?.focus(); }
  }, [editing]);
  const error = props.validate?.(draft);
  const close = (restoreFocus = true) => { restore.current = restoreFocus; setEditing(false); };
  const save = async () => {
    if (props.disabled || error || action.pending || action.session.getSnapshot().status === "pending") return;
    const result = await action.run("save", () => props.onSave(draft));
    // An async response must not steal focus after the user moved to another input.
    if (result.status === "success") close(input.current?.isFocused() ?? false);
  };
  return <View accessible={false}>
    {!editing ? <Stack axis="inline" gap="sm" align="center" wrap><Text>{props.value}</Text><Button ref={trigger} disabled={props.disabled ?? false} tone="ghost" onPress={() => { setDraft(props.value); action.session.reset(null); setEditing(true); }}>{props.editLabel}</Button></Stack>
      : <Stack gap={collectionEditingRecipe.actionGap}>
        <TextField ref={input} label={props.label} value={draft} disabled={props.disabled === true || action.pending}
          {...(error ? { error, invalid: true } : {})} onValueChange={setDraft} onSubmitEditing={() => void save()} />
        <Stack axis="inline" gap="sm" wrap><Button tone="ghost" disabled={action.pending} onPress={() => close()}>{props.cancelLabel}</Button>
          <Button loading={action.pending} disabled={props.disabled === true || !!error} onPress={() => void save()}>{props.saveLabel}</Button></Stack>
        {action.failed ? <ErrorMessage>{props.errorLabel}</ErrorMessage> : null}
      </Stack>}
  </View>;
}

export type RepeatableFieldGroupProps = Omit<FieldGroupProps, "renderField"> & Readonly<{
  renderField: (binding: FieldGroupBinding & { focusRef: (target: FocusTarget | null) => void }) => ReactNode;
  addLabel: string; removeLabel: (id: string) => string; minFields?: number; maxFields?: number;
  onAdd: () => string | undefined; onRemove: (id: string) => void;
}>;
export function RepeatableFieldGroup({ renderField, addLabel, removeLabel, minFields = 0, maxFields = Infinity, onAdd, onRemove, ...props }: RepeatableFieldGroupProps) {
  const targets = useRef(new Map<string, FocusTarget>()), add = useRef<View>(null);
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
    <FieldGroup {...props} renderField={binding => <Stack gap="sm">
      {renderField({ ...binding, focusRef: target => { if (target) targets.current.set(binding.id, target); else targets.current.delete(binding.id); } })}
      <Button tone="ghost" disabled={binding.controlProps.disabled || fields.length <= minFields} onPress={binding.guardChange(() => {
        const current = policy.current;
        if (!live.current || current.disabled || current.fields.length <= current.minFields) return;
        focus.current = focusAfterRemoval(current.fields.map(field => field.id), binding.id, current.fields.filter(field => field.disabled).map(field => field.id)) ?? null;
        current.onRemove(binding.id);
      })}>{removeLabel(binding.id)}</Button>
    </Stack>} />
    <Button ref={add} tone="secondary" disabled={props.descriptor.disabled === true || fields.length >= maxFields} onPress={() => {
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
  recovery?: Readonly<{ label: string; onUndo: () => void | Promise<void> }>;
}>;
export function SelectionActionBar(props: SelectionActionBarProps) {
  const action = useCompositionAction(props.disabled);
  assertDistinctIds(props.actions); snapshotSelection(props.selectedIds);
  if (!props.selectedIds.length && !props.recovery && !action.pending && !action.failed) return null;
  return <View accessible={false}><Stack gap="sm">
    <Text accessibilityLiveRegion="polite">{props.selectionLabel(props.selectedIds.length)}</Text>
    <Stack axis="inline" gap="sm" wrap>
      {props.actions.map(item => <Button key={item.id} tone={item.destructive ? "danger" : "secondary"} loading={action.active === `action:${item.id}`} disabled={props.disabled === true || (action.pending && action.active !== `action:${item.id}`) || !props.selectedIds.length} onPress={() => {
        if (props.disabled) return;
        const scope = snapshotSelection(props.selectedIds);
        if (scope.length) void action.run(`action:${item.id}`, () => props.onAction(item.id, scope));
      }}>{item.label}</Button>)}
      <Button tone="ghost" disabled={props.disabled === true || action.pending || !props.selectedIds.length} onPress={props.onClear}>{props.clearLabel}</Button>
      {props.recovery ? <Button tone="ghost" loading={action.active === "undo"} disabled={props.disabled === true || (action.pending && action.active !== "undo")} onPress={() => {
        if (!props.disabled) void action.run("undo", () => props.recovery!.onUndo());
      }}>{props.recovery.label}</Button> : null}
    </Stack>
    {action.failed ? <ErrorMessage>{props.errorLabel}</ErrorMessage> : null}
  </Stack></View>;
}

export type FilterRecoveryProps = Readonly<{
  title: string; description?: string; options: readonly FilterRecoveryOption[];
  optionLabel: (option: FilterRecoveryOption) => string; onApply: (id: string) => void | Promise<void>;
  errorLabel: string; disabled?: boolean;
}>;
export function FilterRecovery(props: FilterRecoveryProps) {
  const action = useCompositionAction(props.disabled), options = recoverableFilters(props.options);
  return <View style={{ alignItems: "center", justifyContent: "center" }}><Stack gap="sm" align="center">
    <Text emphasis="strong" align="center">{props.title}</Text>{props.description ? <Text tone="muted" align="center">{props.description}</Text> : null}
    {options.map(option => <Button key={option.id} tone="secondary" loading={action.active === option.id} disabled={props.disabled === true || (action.pending && action.active !== option.id)}
      onPress={() => { if (!props.disabled) void action.run(option.id, () => props.onApply(option.id)); }}>{props.optionLabel(option)}</Button>)}
    {action.failed ? <ErrorMessage>{props.errorLabel}</ErrorMessage> : null}
  </Stack></View>;
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
  return <Stack gap="sm"><Text emphasis="strong">{props.label}</Text>
    {props.columns.map(column => <Stack key={column.id} gap="sm">
      <Checkbox label={column.label} checked={column.visible} disabled={props.disabled === true || column.locked === true || (column.visible && props.columns.filter(item => item.visible).length === 1)} onCheckedChange={() => change(column.id, "toggle")} />
      <Stack axis="inline" gap="sm" wrap><Button tone="ghost" disabled={props.disabled === true || changeColumnSettings(props.columns, column.id, "earlier") === props.columns} onPress={() => change(column.id, "earlier")}>{props.earlierLabel(column)}</Button>
        <Button tone="ghost" disabled={props.disabled === true || changeColumnSettings(props.columns, column.id, "later") === props.columns} onPress={() => change(column.id, "later")}>{props.laterLabel(column)}</Button></Stack>
    </Stack>)}
  </Stack>;
}
