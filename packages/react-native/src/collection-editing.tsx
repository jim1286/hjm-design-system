import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Platform, View, type TextInput } from "react-native";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { assertDistinctIds, changeColumnSettings, collectionEditingRecipe, focusAfterRemoval, recoverableFilters, snapshotSelection, type ColumnSetting, type FilterRecoveryOption, type FocusTarget, type SelectionAction } from "@hjmds/design-contracts/collection-editing";
import { Button, IconButton } from "./actions.js";
import { glyph } from "@hjmds/design-contracts/foundations";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnChevron, DrawnPencil, DrawnTrash } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
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
  const { palette } = useHjmNativeTheme();
  const toolColor = (disabled: boolean) => resolveIconButtonPresentation("ghost", palette, disabled).content;
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
    {/* Read state names the value with its label and edits through a pencil tool at the row end, as on Web; a bare value
        beside a text "제목 수정" button lost the label (2026-10-17 review). */}
    {!editing ? <Stack axis="inline" gap="sm" align="center">
      <Stack gap="xxs" layoutStyle={{ flex: 1, minWidth: 0 }}><Text variant="caption" tone="muted">{props.label}</Text><Text emphasis="strong">{props.value}</Text></Stack>
      <IconButton ref={trigger} label={props.editLabel} tone="ghost" edge="end" disabled={props.disabled ?? false} onPress={() => { setDraft(props.value); action.session.reset(null); setEditing(true); }}><DrawnPencil size={glyph.sm} color={toolColor(props.disabled === true)} /></IconButton>
    </Stack>
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
  const { palette } = useHjmNativeTheme();
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
      <View style={{ flex: 1, minWidth: 0 }}>{renderField({ ...binding, focusRef: target => { if (target) targets.current.set(binding.id, target); else targets.current.delete(binding.id); } })}</View>
      <IconButton label={removeLabel(binding.id)} tone="ghost" edge="end" disabled={binding.controlProps.disabled || fields.length <= minFields} onPress={binding.guardChange(() => {
        const current = policy.current;
        if (!live.current || current.disabled || current.fields.length <= current.minFields) return;
        focus.current = focusAfterRemoval(current.fields.map(field => field.id), binding.id, current.fields.filter(field => field.disabled).map(field => field.id)) ?? null;
        current.onRemove(binding.id);
      })}><DrawnTrash size={glyph.sm} color={resolveIconButtonPresentation("ghost", palette, binding.controlProps.disabled || fields.length <= minFields).content} /></IconButton>
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
  // Fills the result area its host gives it and centers there; a content-high host keeps it content-high.
  return <View style={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}><Stack gap="sm" align="center">
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
  const chevronColor = resolveIconButtonPresentation("ghost", useHjmNativeTheme().palette, false).content;
  // One row per column: visibility checkbox, then reorder as icon tools (labels stay the accessible names); the last
  // tool takes edge="end" so its glyph slot ends on the group's edge like the checkbox starts on it (2026-10-17 audit), as on Web.
  return <Stack gap="sm"><Text emphasis="strong">{props.label}</Text>
    {props.columns.map(column => <Stack key={column.id} axis="inline" gap="xs" align="center">
      <Checkbox label={column.label} checked={column.visible} layoutStyle={{ flex: 1, minWidth: 0 }} disabled={props.disabled === true || column.locked === true || (column.visible && props.columns.filter(item => item.visible).length === 1)} onCheckedChange={() => change(column.id, "toggle")} />
      <IconButton label={props.earlierLabel(column)} tone="ghost" disabled={props.disabled === true || changeColumnSettings(props.columns, column.id, "earlier") === props.columns} onPress={() => change(column.id, "earlier")}><DrawnChevron direction="up" size={glyph.sm} color={chevronColor} /></IconButton>
      <IconButton label={props.laterLabel(column)} tone="ghost" edge="end" disabled={props.disabled === true || changeColumnSettings(props.columns, column.id, "later") === props.columns} onPress={() => change(column.id, "later")}><DrawnChevron direction="down" size={glyph.sm} color={chevronColor} /></IconButton>
    </Stack>)}
  </Stack>;
}
