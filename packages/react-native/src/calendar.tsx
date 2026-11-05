import type { ComponentRef } from "react";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { isWebRenderer, webOnly } from "./internal/web-a11y.js";
import { useContext, useImperativeHandle, useRef, useEffect, useState, type ReactNode, type Ref } from "react";
import { AccessibilityInfo, Pressable, ScrollView, View, findNodeHandle } from "react-native";
import {
  calendarRecipe as recipe, assertIsoCalendarMonth, validateCalendarDescriptor, resolveCalendarGridDescriptor,
  resolveCalendarVisibleRows, calendarFoldStep, type CalendarDescriptor, type CalendarFold, type CalendarSize, type ComposeCalendarAccessibleName, type ResolvedCalendarDateCell,
} from "@hjmds/design-contracts/components/calendar";
import { dateRangeRecipe } from "@hjmds/design-contracts/components/date-range";
import { glyph } from "@hjmds/design-contracts/foundations";
import { CalendarPaintContext } from "./internal/calendar-paint.js";
import { ChevronGlyph } from "./internal/lucide-glyph.js";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CalendarMonthAction = Readonly<{ month: string; label: string }>;
export type CalendarHandle = Readonly<{ focusDate(date: string): void }>;
export type CalendarProps<Content = unknown> = Readonly<{
  descriptor: CalendarDescriptor<Content>;
  composeAccessibleName: ComposeCalendarAccessibleName<Content>;
  previousMonth?: CalendarMonthAction;
  nextMonth?: CalendarMonthAction;
  renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
  size?: CalendarSize;
  /** Shows one week with a handle that unfolds the month in place (see `CalendarFold`). */
  fold?: CalendarFold;
  /**
   * `hidden` keeps the month label as the grid's accessible name but does not draw it, for hosts that already show the
   * month in their own header (2026-11-04 오늘야구 games screen). Month buttons still draw when provided.
   */
  monthLabelVisibility?: "visible" | "hidden";
  ref?: Ref<CalendarHandle>;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Inline dates stay individually accessible; Native month paging uses explicit buttons. */

// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Calendar<Content>({ descriptor, composeAccessibleName, previousMonth, nextMonth,
  renderCellContent, size = "medium", fold, monthLabelVisibility = "visible", ref, layoutStyle }: CalendarProps<Content>) {
  validateCalendarDescriptor(descriptor);
  for (const action of [previousMonth, nextMonth]) {
    if (!action) continue;
    assertIsoCalendarMonth(action.month, "month action");
    if (!action.label.trim()) throw new TypeError("Calendar month action label must not be empty");
  }
  const { colors, environment, palette, tokens } = useHjmNativeTheme();
  const paint = useContext(CalendarPaintContext);
  const [selected, setSelected] = useControllableState<string | null>({
    ...(descriptor.selectedDate === undefined ? {} : { value: descriptor.selectedDate }),
    defaultValue: descriptor.defaultSelectedDate ?? null,
    ...(descriptor.onSelectionChange ? { onChange: descriptor.onSelectionChange } : {}),
  });
  const cells = resolveCalendarGridDescriptor(descriptor.grid, selected, { composeAccessibleName });
  if (fold && !fold.label.trim()) throw new TypeError("Calendar fold label must not be empty");
  const visibleRows = resolveCalendarVisibleRows(cells, fold?.expanded ?? true);
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
  const nav = (action: CalendarMonthAction | undefined, reason: "previous" | "next") => action
    ? <Pressable accessibilityRole="button" accessibilityLabel={action.label} disabled={!descriptor.onFocusedMonthChange}
        accessibilityState={{ disabled: !descriptor.onFocusedMonthChange }}
        onPress={() => descriptor.onFocusedMonthChange?.(action.month, reason)}
        style={[minimumTargetStyle, { alignItems: "center", justifyContent: "center" }]}>
        {/* recipe navIcon chevrons, not the ‹ › text that rendered about 8pt (2026-10-25 range redesign). */}
        <ChevronGlyph direction={reason === "previous" ? "start" : "end"} size={glyph[recipe.sizes[size].glyph]}
          color={resolveColorReference(recipe.header.navButton.color, palette)} />
      </Pressable> : <View accessible={false} style={minimumTargetStyle} />;
  return <View style={[{ maxWidth: recipe.maxWidth, width: "100%" }, layoutStyle, { gap: recipe.header.gap, direction: environment.direction }]}>
    {monthLabelVisibility === "visible" || previousMonth || nextMonth ? <View style={{ flexDirection: "row", alignItems: "center", gap: recipe.header.gap }}>
      {nav(previousMonth, "previous")}
      {monthLabelVisibility === "visible" ? <Text accessibilityRole="header" accessibilityLiveRegion="polite" variant={recipe.header.monthLabel.textVariant}
        emphasis="strong" align="center" style={{ flex: 1 }}>{descriptor.monthLabel}</Text>
        : <View accessible accessibilityLabel={descriptor.monthLabel} accessibilityLiveRegion="polite" style={{ flex: 1 }} />}
      {nav(nextMonth, "next")}
    </View> : null}
    {/* Horizontal overflow preserves all seven minimum-sized targets on narrow hosts. */}
    <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, minWidth: diameter * 7 }}>
        <View accessible={false} style={{ flexDirection: "row" }}>
          {descriptor.grid.weekdayLabels.map((label, index) => <Text key={index} accessible={false} align="center" tone="muted"
            variant={recipe.weekdayLabel.textVariant} style={columnStyle}>{label}</Text>)}
        </View>
        {visibleRows.map((row) => <View key={row} style={{ flexDirection: "row" }}>
          {cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell
            ? <View accessible={false} key={`filler-${column}`} style={{ ...columnStyle, minHeight: diameter }} />
            : (() => {
              const range = paint?.(cell.date);
              const filled = range ? range.edge : cell.isSelected;
              const cap = indicatorDiameter / 2;
              return <Pressable key={cell.date} ref={(node) => { if (node) targets.current.set(cell.date, node); else targets.current.delete(cell.date); }}
              accessibilityRole="button" accessibilityLabel={cell.accessibleName}
              {...webOnly({ "aria-pressed": filled, "aria-disabled": !cell.selectable })}
              accessibilityState={{ selected: filled, disabled: !cell.selectable }}
              onPress={() => { if (cell.selectable) setSelected(cell.date); }}
              style={{ ...columnStyle, minHeight: diameter, alignItems: "center", justifyContent: "flex-start", gap: recipe.day.contentGap,
                borderRadius: diameter / 2,
                opacity: !cell.selectable ? recipe.day.disabledOpacity : cell.outsideFocusedMonth ? recipe.day.outsideFocusedMonthOpacity : 1 }}>
              {range && range.band !== "none" ? <View accessible={false} pointerEvents="none" style={{
                position: "absolute", top: 0, height: indicatorDiameter,
                start: range.band === "toEnd" ? "50%" : 0, end: range.band === "toStart" ? "50%" : 0,
                backgroundColor: resolveColorReference(dateRangeRecipe.band.background, palette),
                // The band rounds off where a week row starts or ends, so a range across weeks reads as one run.
                ...(column === 0 && range.band !== "toEnd" ? { borderTopStartRadius: cap, borderBottomStartRadius: cap } : {}),
                ...(column === 6 && range.band !== "toStart" ? { borderTopEndRadius: cap, borderBottomEndRadius: cap } : {}),
              }} /> : null}
              <View accessible={false} style={{ width: indicatorDiameter, minHeight: indicatorDiameter, alignItems: "center", justifyContent: "center", borderRadius: indicatorDiameter / 2, borderWidth: recipe.day.today.borderWidth, borderColor: cell.isToday && !filled ? resolveColorReference(recipe.day.today.border, palette) : "transparent", backgroundColor: filled ? colors.primary : "transparent" }}>
              <Text
              fontRole="ui" accessible={false} variant={recipe.sizes[size].textVariant} align="center"
                style={{ color: filled ? colors.onPrimary : colors.textBody, fontVariant: ["tabular-nums"] }}>{Number(cell.date.slice(-2))}</Text></View>
              {renderCellContent ? <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ minHeight: tokens.typography.label.lineHeight * environment.textScale }}>{renderCellContent(cell)}</View> : null}
            </Pressable>;
            })())}
        </View>)}
      </View>
    </ScrollView>
    {fold ? <Pressable accessibilityRole="button" accessibilityLabel={fold.label} accessibilityState={{ expanded: fold.expanded }}
      {...webOnly({ "aria-expanded": fold.expanded })} onPress={() => fold.onExpandedChange(!fold.expanded)}
      style={{ alignSelf: "center", minWidth: recipe.fold.handle.touchTarget, minHeight: recipe.fold.handle.touchTarget / 2, alignItems: "center", justifyContent: "center" }}>
      <ChevronGlyph direction={fold.expanded ? "up" : "down"} size={glyph[recipe.fold.handle.glyph]} color={resolveColorReference(recipe.fold.handle.color, palette)} />
    </Pressable> : null}
  </View>;
}

export type CalendarFoldHeaderProps = Readonly<{
  monthLabel: string;
  expanded: boolean;
  selectedDate: string;
  focusedMonth: string;
  labels: Readonly<{ previousWeek: string; nextWeek: string; previousMonth: string; nextMonth: string }>;
  onSelectedDateChange(date: string): void;
  onFocusedMonthChange(month: string): void;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/**
 * ‹ month › for a folding Calendar that a host places in its own header line (2026-11-04 오늘야구 games screen keeps
 * it in the top bar). The arrows step a week while folded and a month while unfolded (`calendarFoldStep`).
 */
export function CalendarFoldHeader({ monthLabel, expanded, selectedDate, focusedMonth, labels, onSelectedDateChange, onFocusedMonthChange, layoutStyle }: CalendarFoldHeaderProps) {
  const { palette, environment } = useHjmNativeTheme();
  const step = (direction: -1 | 1) => {
    const next = calendarFoldStep({ expanded, selectedDate, focusedMonth }, direction);
    if ("selectedDate" in next) onSelectedDateChange(next.selectedDate); else onFocusedMonthChange(next.focusedMonth);
  };
  const arrow = (direction: -1 | 1) => <Pressable accessibilityRole="button"
    accessibilityLabel={expanded ? direction < 0 ? labels.previousMonth : labels.nextMonth : direction < 0 ? labels.previousWeek : labels.nextWeek}
    onPress={() => step(direction)} style={[minimumTargetStyle, { alignItems: "center", justifyContent: "center" }]}>
    <ChevronGlyph direction={direction < 0 ? "start" : "end"} size={glyph[recipe.sizes.medium.glyph]} color={resolveColorReference(recipe.header.navButton.color, palette)} />
  </Pressable>;
  return <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: recipe.header.gap, direction: environment.direction }, layoutStyle]}>
    {arrow(-1)}
    <Text accessibilityRole="header" accessibilityLiveRegion="polite" variant={recipe.header.monthLabel.textVariant} emphasis="strong" align="center">{monthLabel}</Text>
    {arrow(1)}
  </View>;
}
