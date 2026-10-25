import type { ComponentRef } from "react";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { isWebRenderer, webOnly } from "./web-a11y.js";
import { useImperativeHandle, useRef, useEffect, useState, type ReactNode, type Ref } from "react";
import { AccessibilityInfo, Pressable, ScrollView, View, findNodeHandle } from "react-native";
import {
  calendarRecipe as recipe, assertIsoCalendarMonth, validateCalendarDescriptor, resolveCalendarGridDescriptor,
  type CalendarDescriptor, type CalendarSize, type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell,
} from "@hjmds/design-contracts/components/calendar";
import { dateRangeRecipe, type DateRangeCellState } from "@hjmds/design-contracts/components/date-range";
import { glyph } from "@hjmds/design-contracts/foundations";
import { useControllableState } from "./state.js";
import { minimumTargetStyle } from "./styles.js";
import { DrawnChevron } from "./drawn-glyphs.js";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";

import type { HjmCompositionStyleProp } from "../composition-style.js";

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
  layoutStyle?: HjmCompositionStyleProp;
}>;

/**
 * DateRangePicker's paint over the same grid. Calendar's public props stay single-selection
 * (date-range.ts explains why there is no mode axis); only this internal grid knows ranges.
 */
export type CalendarRangePaint = Readonly<{
  stateOf(date: string): DateRangeCellState;
  spans: boolean;
  /** False for a date past the maximum range while selecting; drawn like a product-disabled date. */
  allows(date: string): boolean;
}>;

/** Inline dates stay individually accessible; Native month paging uses explicit buttons. */

// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function CalendarGrid<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth,
  renderCellContent, size = "medium", ref, layoutStyle, range }: CalendarProps<Content> & Readonly<{ range?: CalendarRangePaint }>) {
  validateCalendarDescriptor(descriptor);
  for (const action of [previousMonth, nextMonth]) {
    if (!action) continue;
    assertIsoCalendarMonth(action.month, "month action");
    if (!action.label.trim()) throw new TypeError("Calendar month action label must not be empty");
  }
  const { colors, environment, palette, tokens } = useHjmNativeTheme();
  const [selected, setSelected] = useControllableState<string | null>({
    ...(descriptor.selectedDate === undefined ? {} : { value: descriptor.selectedDate }),
    defaultValue: descriptor.defaultSelectedDate ?? null,
    ...(descriptor.onSelectionChange ? { onChange: descriptor.onSelectionChange } : {}),
  });
  const cells = resolveCalendarGridDescriptor(descriptor.grid, selected, { composeAccessibleName });
  const targets = useRef(new Map<string, ComponentRef<typeof View>>());
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
  const indicatorDiameter = recipe.sizes[size].indicatorDiameter;
  // Yoga distributes remaining space after minimum widths: omitting the minimum on
  // fillers collapses them and shifts partial weeks away from the weekday columns.
  const columnStyle = { flex: 1, minWidth: diameter };
  const navColor = resolveColorReference(recipe.header.navButton.color, palette);
  const nav = (action: CalendarMonthAction | undefined, reason: "previous" | "next") => action
    ? <Pressable accessibilityRole="button" accessibilityLabel={action.label} disabled={!descriptor.onFocusedMonthChange}
        accessibilityState={{ disabled: !descriptor.onFocusedMonthChange }}
        onPress={() => descriptor.onFocusedMonthChange?.(action.month, reason)}
        style={[minimumTargetStyle, { alignItems: "center", justifyContent: "center", borderRadius: recipe.header.navButton.diameter / 2 }]}>
        {/* The recipe names chevronStart/End; a text "‹" rendered as a small caret beside the title. */}
        <DrawnChevron direction={reason === "previous" ? "start" : "end"} size={glyph[recipe.sizes[size].glyph]} color={navColor} />
      </Pressable> : <View accessible={false} style={minimumTargetStyle} />;
  const edgeFill = resolveColorReference(dateRangeRecipe.edge.background, palette);
  const edgeText = resolveColorReference(dateRangeRecipe.edge.content, palette);
  const bandFill = resolveColorReference(dateRangeRecipe.band.background, palette);
  return <View style={[{ maxWidth: recipe.maxWidth, width: "100%" }, layoutStyle, { gap: recipe.header.gap, direction: environment.direction }]}>
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
            variant={recipe.weekdayLabel.textVariant} style={columnStyle}>{label}</Text>)}
        </View>
        {Array.from({ length: cells.length / 7 }, (_, row) => <View key={row} style={{ flexDirection: "row" }}>
          {cells.slice(row * 7, row * 7 + 7).map((cell, column) => {
            if ("filler" in cell) return <View accessible={false} key={`filler-${column}`} style={{ ...columnStyle, minHeight: diameter }} />;
            const rangeState = range?.stateOf(cell.date) ?? "none";
            const selected = range ? rangeState === "start" || rangeState === "end" : cell.isSelected;
            // The band runs from the start's centre to the end's centre so the two circles read as one span.
            const band = range?.spans && rangeState !== "none"
              ? { start: rangeState === "start" ? "50%" : 0, end: rangeState === "end" ? "50%" : 0 } as const : null;
            const radius = indicatorDiameter / 2;
            const selectable = cell.selectable && (range?.allows(cell.date) ?? true);
            return <Pressable key={cell.date} ref={(node) => { if (node) targets.current.set(cell.date, node); else targets.current.delete(cell.date); }}
              accessibilityRole="button" accessibilityLabel={cell.accessibleName}
              {...webOnly({ "aria-pressed": selected, "aria-disabled": !selectable })}
              accessibilityState={{ selected, disabled: !selectable }}
              onPress={() => { if (selectable) setSelected(cell.date); }}
              style={{ ...columnStyle, minHeight: diameter, alignItems: "center", justifyContent: "flex-start",
                borderRadius: diameter / 2,
                opacity: !selectable ? recipe.day.disabledOpacity : cell.outsideFocusedMonth ? recipe.day.outsideFocusedMonthOpacity : 1 }}>
              {band ? <View accessible={false} style={{ position: "absolute", top: 0, height: indicatorDiameter, ...band, backgroundColor: bandFill,
                // A week row ends the band: round it there instead of cutting it at the grid edge.
                ...(column === 0 ? { borderTopStartRadius: radius, borderBottomStartRadius: radius } : {}),
                ...(column === 6 ? { borderTopEndRadius: radius, borderBottomEndRadius: radius } : {}) }} /> : null}
              <View accessible={false} style={{ width: indicatorDiameter, minHeight: indicatorDiameter, alignItems: "center", justifyContent: "center", borderRadius: radius, borderWidth: recipe.day.today.borderWidth, borderColor: cell.isToday && !selected ? resolveColorReference(recipe.day.today.border, palette) : "transparent", backgroundColor: selected ? (range ? edgeFill : colors.primary) : "transparent" }}>
              <Text
              fontRole="ui" accessible={false} variant={recipe.sizes[size].textVariant} align="center"
                style={{ color: selected ? (range ? edgeText : colors.onPrimary) : colors.textBody, fontVariant: ["tabular-nums"] }}>{Number(cell.date.slice(-2))}</Text></View>
              {renderCellContent ? <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ minHeight: tokens.typography.label.lineHeight * environment.textScale }}>{renderCellContent(cell)}</View> : null}
            </Pressable>;
          })}
        </View>)}
      </View>
    </ScrollView>
  </View>;
}
