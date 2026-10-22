import type { ComponentRef } from "react";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, resolveTimePickerWheelIndex, moveTimePickerWheelIndex, validateTimePicker, timePickerRecipe, type TimePickerOptions, type TimePickerPart } from "@hjmds/design-contracts/components/time-picker";
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
  const [moving, setMoving] = useState({ hour: false, minute: false });
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
  const confirm = <Button disabled={locked || resolved === null || moving.hour || moving.minute} onPress={() => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) { onValueChange(current); setOpen(false); } }}>{labels.confirm}</Button>;
  const panel = <View style={{ gap: timePickerRecipe.sectionGap, direction: environment.direction }}>
    <Text fontRole="ui" accessibilityLiveRegion="polite" accessibilityLabel={`${draft.hour ?? "--"}:${draft.minute ?? "--"}`} style={{ textAlign: "center", fontSize: timePickerRecipe.readoutSize, lineHeight: timePickerRecipe.readoutLineHeight, fontVariant: ["tabular-nums"], fontWeight: "500" }}>{draft.hour ?? "--"}:{draft.minute ?? "--"}</Text>
    <View style={{ flexDirection: "row", gap: timePickerRecipe.gap }}>
      {(["hour", "minute"] as const).map(part => <TimeColumn key={part} part={part} label={labels[part]} draft={draft} options={props} locked={locked} onSelect={next => select(part, next)}
        onMoving={next => setMoving(current => current[part] === next ? current : { ...current, [part]: next })} />)}
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

function TimeColumn({ part, label, draft, options, locked, onSelect, onMoving }: {
  part: TimePickerPart; label: string; draft: ReturnType<typeof timePickerDraft>; options: TimePickerOptions; locked: boolean; onSelect(value: string): void; onMoving(moving: boolean): void;
}) {
  const { colors, tokens, environment } = useHjmNativeTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const interacting = useRef(false);
  const emitted = useRef<string | null>(null);
  const wheel = options.selectionStyle === "wheel";
  const items = timePickerItems(part, draft, options);
  const rowHeight = timePickerRecipe.rowHeight, height = rowHeight * timePickerRecipe.visibleRows;
  const index = items.findIndex(item => item.value === draft[part]);
  const reveal = () => { if (index >= 0 || wheel) scroll.current?.scrollTo({ y: Math.max(0, wheel ? index : index - 2) * rowHeight, animated: false }); };
  useEffect(() => {
    // Parent echoes of scroll edits must not stop native deceleration.
    if (wheel && emitted.current === draft[part] && draft[part] !== null) { emitted.current = null; return; }
    interacting.current = false;
    onMoving(false);
    reveal();
  }, [index, wheel, locked, options.minuteStep]);
  function emit(target: number) {
    const item = items[target];
    if (locked || !item || item.disabled || (wheel && item.value === draft[part])) return;
    emitted.current = wheel ? item.value : null;
    onSelect(item.value);
  }
  function choose(target: number) {
    interacting.current = false;
    onMoving(false);
    emit(target);
    if (wheel) scroll.current?.scrollTo({ y: target * rowHeight, animated: !environment.reducedMotion });
  }
  function settle(offset: number) {
    if (!interacting.current || locked) return;
    const target = resolveTimePickerWheelIndex(items, offset);
    interacting.current = false;
    onMoving(false);
    if (target !== null) choose(target);
  }
  return <View style={{ flex: 1, minWidth: 0, gap: tokens.spacing.xs }}>
    <Text variant="label" tone="muted" style={{ textAlign: "center" }}>{label}</Text>
    <View accessible={wheel} {...(wheel ? {
      accessibilityRole: "adjustable" as const,
      accessibilityLabel: label,
      accessibilityValue: { text: draft[part] === null ? options.labels.placeholder : `${draft[part]} ${label}` },
      accessibilityState: { disabled: locked || items.every(item => item.disabled) },
      accessibilityActions: [{ name: "increment" as const }, { name: "decrement" as const }],
      onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
        if (locked || !["increment", "decrement"].includes(event.nativeEvent.actionName)) return;
        const target = moveTimePickerWheelIndex(items, index, event.nativeEvent.actionName === "increment" ? 1 : -1);
        if (target !== null) choose(target);
      },
    } : {})} style={{ height }}>
    {wheel && <View pointerEvents="none" style={{ position: "absolute", top: (height - rowHeight) / 2, left: 0, right: 0, height: rowHeight, borderWidth: timePickerRecipe.selectionStroke, borderColor: colors.borderControl, borderRadius: tokens.radius[timePickerRecipe.radius], zIndex: 1 }} />}
    <ScrollView ref={scroll} onLayout={reveal} nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ height, flexGrow: 0 }}
      {...(wheel ? {
        contentContainerStyle: { paddingVertical: (height - rowHeight) / 2 },
        snapToOffsets: items.flatMap((item, index) => item.disabled ? [] : [index * rowHeight]),
        snapToStart: false, snapToEnd: false, bounces: false,
        decelerationRate: environment.reducedMotion ? 0 : "fast" as const,
        scrollEnabled: !locked && items.some(item => !item.disabled),
        showsVerticalScrollIndicator: false,
        accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const,
        onScrollBeginDrag: () => { if (!locked) { interacting.current = true; onMoving(true); } },
        onMomentumScrollBegin: () => { if (interacting.current) onMoving(true); },
        onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          if (!interacting.current || locked) return;
          const target = resolveTimePickerWheelIndex(items, event.nativeEvent.contentOffset.y);
          if (target !== null) emit(target);
        },
        scrollEventThrottle: 16,
        // Zero velocity ends a drag without momentum. Otherwise native snapping owns the glide.
        // https://reactnative.dev/docs/scrollview#onscrollenddrag
        onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          if (event.nativeEvent.velocity?.y === 0) settle(event.nativeEvent.contentOffset.y);
        },
        onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => settle(event.nativeEvent.contentOffset.y),
      } : {})}>
      {items.map((item, itemIndex) => <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={`${item.value} ${label}`} accessibilityState={{ checked: draft[part] === item.value, disabled: locked || item.disabled }} disabled={locked || item.disabled}
        onPress={() => { if (!locked && !item.disabled) choose(itemIndex); }}
        style={({ pressed }) => ({ height: rowHeight, alignItems: "center", justifyContent: "center", borderRadius: tokens.radius[timePickerRecipe.radius], backgroundColor: draft[part] === item.value ? colors.surfaceSelected : "transparent", opacity: locked || item.disabled ? 0.4 : pressed ? 0.72 : 1 })}>
        <Text fontRole="ui" style={{ color: draft[part] === item.value ? colors.text : colors.textBody, fontWeight: draft[part] === item.value ? "500" : "400", fontVariant: ["tabular-nums"] }}>{item.value}</Text>
      </Pressable>)}
    </ScrollView>
    </View>
  </View>;
}
