import type { ComponentRef } from "react";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, validateTimePicker, timePickerRecipe, type TimePickerOptions, type TimePickerPart } from "@hjmds/design-contracts/components/time-picker";
import { Button } from "./actions.js";
import { Sheet, type SheetProps } from "./overlays.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type TimePickerProps = TimePickerOptions & Readonly<{ layoutStyle?: HjmCompositionStyleProp; safeAreaInsets?: SheetProps["safeAreaInsets"] }>;

export function TimePicker(props: TimePickerProps) {
  validateTimePicker(props);
  const { value, onValueChange, labels, disabled, readOnly, description, error, presentation = "field", layoutStyle, safeAreaInsets } = props;
  const { colors, tokens, environment } = useHjmNativeTheme();
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(() => timePickerDraft(value));
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const locked = !!(disabled || readOnly);
  const emitted = useRef<{ value: string | null } | null>(null);
  useEffect(() => {
    // Preserve an incomplete inline draft when the parent echoes its null validity value.
    if (presentation === "inline" && emitted.current?.value === value) { emitted.current = null; return; }
    emitted.current = null; setDraft(timePickerDraft(value));
  }, [value, open, presentation]);
  useEffect(() => { if (locked) setOpen(false); }, [locked]);
  const resolved = resolveTimePickerValue(draft, props);
  function select(part: TimePickerPart, next: string) {
    if (locked) return;
    const updated = { ...draft, [part]: next }; setDraft(updated);
    const result = resolveTimePickerValue(updated, props);
    if (presentation === "inline") { emitted.current = { value: result }; onValueChange(result); }
  }
  const confirm = <Button disabled={locked || resolved === null} onPress={() => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) { onValueChange(current); setOpen(false); } }}>{labels.confirm}</Button>;
  const panel = <View style={{ gap: timePickerRecipe.sectionGap, direction: environment.direction }}>
    <Text fontRole="ui" accessibilityLiveRegion="polite" accessibilityLabel={`${draft.hour ?? "--"}:${draft.minute ?? "--"}`} style={{ textAlign: "center", fontSize: timePickerRecipe.readoutSize, lineHeight: timePickerRecipe.readoutLineHeight, fontVariant: ["tabular-nums"], fontWeight: "500" }}>{draft.hour ?? "--"}:{draft.minute ?? "--"}</Text>
    <View style={{ flexDirection: "row", gap: timePickerRecipe.gap }}>
      {(["hour", "minute"] as const).map(part => <TimeColumn key={part} part={part} label={labels[part]} draft={draft} options={props} locked={locked} onSelect={next => select(part, next)} />)}
    </View>
  </View>;
  return <View style={[{ gap: tokens.spacing.xs, opacity: disabled ? 0.5 : 1 }, layoutStyle]}>
    {presentation === "inline" ? panel : <>
      <Text variant="label" emphasis="strong">{labels.label}</Text>
      <Pressable ref={triggerRef} accessibilityRole="button" accessibilityLabel={`${labels.label}, ${value ?? labels.placeholder}`} accessibilityState={{ disabled: locked, expanded: open }} disabled={locked} onPress={() => setOpen(true)}
        style={({ pressed }) => ({ minHeight: timePickerRecipe.rowHeight, justifyContent: "center", borderWidth: 1, borderColor: error ? colors.danger : colors.borderControl, borderRadius: tokens.radius[timePickerRecipe.radius], paddingHorizontal: tokens.spacing.sm, backgroundColor: colors.bg, opacity: pressed ? 0.72 : 1 })}>
        <Text fontRole="ui" style={{ color: value === null ? colors.textMuted : colors.textBody, fontVariant: ["tabular-nums"] }}>{value ?? labels.placeholder}</Text>
      </Pressable>
      <Sheet open={open} onOpenChange={setOpen} title={labels.label} closeLabel={labels.cancel} showClose returnFocusRef={triggerRef} footer={confirm} {...(safeAreaInsets ? { safeAreaInsets } : {})}>{panel}</Sheet>
    </>}
    {description ? <Text variant="label" tone="muted">{description}</Text> : null}
    {error ? <Text variant="label" accessibilityLiveRegion="assertive" style={{ color: colors.danger }}>{error}</Text> : null}
  </View>;
}

function TimeColumn({ part, label, draft, options, locked, onSelect }: {
  part: TimePickerPart; label: string; draft: ReturnType<typeof timePickerDraft>; options: TimePickerOptions; locked: boolean; onSelect(value: string): void;
}) {
  const { colors, tokens } = useHjmNativeTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const items = timePickerItems(part, draft, options);
  const rowHeight = timePickerRecipe.rowHeight, height = rowHeight * timePickerRecipe.visibleRows;
  const index = items.findIndex(item => item.value === draft[part]);
  const reveal = () => { if (index >= 0) scroll.current?.scrollTo({ y: Math.max(0, (index - 2) * rowHeight), animated: false }); };
  useEffect(reveal, [index]);
  return <View style={{ flex: 1, minWidth: 0, gap: tokens.spacing.xs }}>
    <Text variant="label" tone="muted" style={{ textAlign: "center" }}>{label}</Text>
    <ScrollView ref={scroll} onLayout={reveal} nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ height, flexGrow: 0 }}>
      {items.map(item => <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={`${item.value} ${label}`} accessibilityState={{ checked: draft[part] === item.value, disabled: locked || item.disabled }} disabled={locked || item.disabled}
        onPress={() => { if (!locked && !item.disabled) onSelect(item.value); }}
        style={({ pressed }) => ({ height: rowHeight, alignItems: "center", justifyContent: "center", borderRadius: tokens.radius[timePickerRecipe.radius], backgroundColor: draft[part] === item.value ? colors.surfaceAccent : "transparent", opacity: locked || item.disabled ? 0.4 : pressed ? 0.72 : 1 })}>
        <Text fontRole="ui" style={{ color: draft[part] === item.value ? colors.contentBrand : colors.textBody, fontVariant: ["tabular-nums"] }}>{item.value}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
}
