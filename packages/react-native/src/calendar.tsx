import { typography } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { isWebRenderer, webOnly } from "./internal/web-a11y.js";
import { useImperativeHandle, useRef, useEffect, useState, type ReactNode, type Ref } from "react";
import { AccessibilityInfo, Pressable, ScrollView, View, findNodeHandle } from "react-native";
import {
  calendarRecipe as recipe, assertIsoCalendarMonth, validateCalendarDescriptor, resolveCalendarGridDescriptor,
  type CalendarDescriptor, type CalendarSize, type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell,
} from "@hjmds/design-contracts/components/calendar";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type CalendarMonthAction = Readonly<{ month: string; label: string }>;
export type CalendarHandle = Readonly<{ focusDate(date: string): void }>;
export type CalendarProps<Content = unknown> = Readonly<{
  descriptor: CalendarDescriptor<Content>;
  composeAccessibleName: ComposeCalendarAccessibleName<Content>;
  previousMonth?: CalendarMonthAction;
  nextMonth?: CalendarMonthAction;
  renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
  size?: CalendarSize;
  ref?: Ref<CalendarHandle>;
}>;

/** Inline dates stay individually accessible; Native month paging uses explicit buttons. */
export function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth,
  renderCellContent, size = "medium", ref }: CalendarProps<Content>) {
  validateCalendarDescriptor(descriptor);
  for (const action of [previousMonth, nextMonth]) {
    if (!action) continue;
    assertIsoCalendarMonth(action.month, "month action");
    if (!action.label.trim()) throw new TypeError("Calendar month action label must not be empty");
  }
  const { colors, environment, palette } = useHjmNativeTheme();
  const [selected, setSelected] = useControllableState<string | null>({
    ...(descriptor.selectedDate === undefined ? {} : { value: descriptor.selectedDate }),
    defaultValue: descriptor.defaultSelectedDate ?? null,
    ...(descriptor.onSelectionChange ? { onChange: descriptor.onSelectionChange } : {}),
  });
  const cells = resolveCalendarGridDescriptor(descriptor.grid, selected, { composeAccessibleName });
  const targets = useRef(new Map<string, View>());
  const pending = useRef<string | undefined>(undefined);
  const [request, setRequest] = useState(0);
  useImperativeHandle(ref, () => ({ focusDate(date) { pending.current = date; setRequest((value) => value + 1); } }), []);
  const gridKey = descriptor.grid.cells.map((cell) => cell.date ?? "").join(",");
  useEffect(() => {
    if (!pending.current) return;
    const node = targets.current.get(pending.current);
    // RN Web refs are DOM nodes; the native accessibility bridge cannot focus them.
    if (node && isWebRenderer) { (node as unknown as { focus?: () => void }).focus?.(); pending.current = undefined; return; }
    const handle = node ? findNodeHandle(node) : null;
    if (handle != null) { AccessibilityInfo.setAccessibilityFocus(handle); pending.current = undefined; }
  }, [gridKey, request]);
  const diameter = recipe.sizes[size].cellDiameter;
  const nav = (action: CalendarMonthAction | undefined, reason: "previous" | "next") => action
    ? <Pressable accessibilityRole="button" accessibilityLabel={action.label} disabled={!descriptor.onFocusedMonthChange}
        accessibilityState={{ disabled: !descriptor.onFocusedMonthChange }}
        onPress={() => descriptor.onFocusedMonthChange?.(action.month, reason)}
        style={[minimumTargetStyle, { alignItems: "center", justifyContent: "center" }]}>
        <Text accessible={false}>{(reason === "previous") !== (environment.direction === "rtl") ? "‹" : "›"}</Text>
      </Pressable> : <View accessible={false} style={minimumTargetStyle} />;
  return <View style={{ gap: recipe.header.gap, direction: environment.direction }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: recipe.header.gap }}>
      {nav(previousMonth, "previous")}
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" variant={recipe.header.monthLabel.textVariant}
        emphasis="strong" align="center" style={{ flex: 1 }}>{descriptor.monthLabel}</Text>
      {nav(nextMonth, "next")}
    </View>
    {/* Horizontal overflow preserves all seven minimum-sized targets on narrow hosts. */}
    <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, minWidth: diameter * 7 }}>
        <View accessible={false} style={{ flexDirection: "row" }}>
          {descriptor.grid.weekdayLabels.map((label, index) => <Text key={index} accessible={false} align="center" tone="muted"
            variant={recipe.weekdayLabel.textVariant} style={{ flex: 1 }}>{label}</Text>)}
        </View>
        {Array.from({ length: cells.length / 7 }, (_, row) => <View key={row} style={{ flexDirection: "row" }}>
          {cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell
            ? <View accessible={false} key={`filler-${column}`} style={{ flex: 1, minHeight: diameter }} />
            : <Pressable key={cell.date} ref={(node) => { if (node) targets.current.set(cell.date, node); else targets.current.delete(cell.date); }}
              accessibilityRole="button" accessibilityLabel={cell.accessibleName}
              {...webOnly({ "aria-pressed": cell.isSelected, "aria-disabled": !cell.selectable })}
              accessibilityState={{ selected: cell.isSelected, disabled: !cell.selectable }}
              onPress={() => { if (cell.selectable) setSelected(cell.date); }}
              style={{ flex: 1, minWidth: diameter, minHeight: diameter, alignItems: "center", justifyContent: "flex-start",
                borderRadius: diameter / 2,
                opacity: !cell.selectable ? recipe.day.disabledOpacity : cell.outsideFocusedMonth ? recipe.day.outsideFocusedMonthOpacity : 1 }}>
              <View accessible={false} style={{ width: diameter, minHeight: diameter, alignItems: "center", justifyContent: "center", borderRadius: diameter / 2, borderWidth: recipe.day.today.borderWidth, borderColor: cell.isToday ? resolveColorReference(recipe.day.today.border, palette) : "transparent", backgroundColor: cell.isSelected ? colors.primary : "transparent" }}>
              <Text accessible={false} variant={recipe.sizes[size].textVariant} align="center"
                style={{ color: cell.isSelected ? colors.onPrimary : colors.textBody, fontVariant: ["tabular-nums"] }}>{Number(cell.date.slice(-2))}</Text></View>
              {renderCellContent ? <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ minHeight: typography.label.lineHeight * environment.textScale }}>{renderCellContent(cell)}</View> : null}
            </Pressable>)}
        </View>)}
      </View>
    </ScrollView>
  </View>;
}
