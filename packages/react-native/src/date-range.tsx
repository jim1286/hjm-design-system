import {
  dateRangeRecipe,
  emptyDateRange,
  defaultDateRangeLimit,
  isDateWithinRangeLimit,
  type DateRangeLimit,
  resolveDateRangeActiveEdge,
  resolveDateRangeCellPaint,
  resolveDateRangeCellState,
  resolveDateRangeExpanded,
  resolveDateRangePreset,
  type DateRangePresetLength,
  resolveDateRangeSelection,
  validateDateRange,
  type DateRangeValue,
} from "@hjmds/design-contracts/components/date-range";
import type {
  CalendarDescriptor,
  ComposeCalendarAccessibleName,
} from "@hjmds/design-contracts/components/calendar";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { glyph } from "@hjmds/design-contracts/foundations";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import { Calendar, type CalendarMonthAction } from "./calendar.js";
import { CalendarPaintContext } from "./internal/calendar-paint.js";
import { Chip } from "./inputs.js";
import { useControllableState } from "./internal/state.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type DateRangeSummary = Readonly<{
  startLabel: string;
  endLabel: string;
  /** Shown in a field whose date is not chosen yet. */
  placeholder: string;
  formatDate: (date: string) => string;
}>;

/** Fold the presets and grid behind `summary`, which becomes the toggle. */
export type DateRangeCollapsible = Readonly<{
  /** Controlled open state. Without it the picker opens while the range is incomplete and folds once it completes. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}>;

/** A shortcut such as "최근 7일" or "1개월" that ends on the grid's `todayDate`. */
export type DateRangePresetOption = Readonly<{ id: string; label: string; length: DateRangePresetLength }>;

// Preserve Calendar's controlled/uncontrolled month union when removing its single-date selection props.
type RangeCalendarDescriptor<T> = T extends unknown ? Omit<T, "selectedDate" | "defaultSelectedDate" | "onSelectionChange"> : never;

export type DateRangePickerProps<Content = unknown> = Readonly<{
  /** The same grid Calendar renders; the product still owns month data. */
  descriptor: RangeCalendarDescriptor<CalendarDescriptor<Content>>;
  composeAccessibleName: ComposeCalendarAccessibleName<Content>;
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  previousMonth?: CalendarMonthAction;
  nextMonth?: CalendarMonthAction;
  /** Localized suffixes appended to a day's name when it is a range edge. */
  rangeLabels: Readonly<{ start: string; end: string; between: string }>;
  /** Inclusive calendar span; one year by default, null removes the limit. */
  maxRange?: DateRangeLimit | null;
  renderCellContent?: (date: string) => ReactNode;
  /** Start/end fields above the grid; the edge the next tap sets is marked (replaces a hint sentence). */
  summary?: DateRangeSummary;
  /** Shortcut chips between the summary and the grid; each ends on `descriptor.grid.todayDate`. */
  presets?: readonly DateRangePresetOption[];
  /**
   * Fold the presets and grid behind `summary` (required), which becomes a toggle button. A selection that completes
   * the range folds it again (`resolveDateRangeExpanded`).
   */
  collapsible?: DateRangeCollapsible;
}>;

export function DateRangePicker<Content = unknown>({
  descriptor,
  composeAccessibleName,
  value: controlledValue,
  defaultValue,
  onValueChange,
  previousMonth,
  nextMonth,
  rangeLabels,
  maxRange = defaultDateRangeLimit,
  renderCellContent,
  summary,
  presets,
  collapsible,
}: DateRangePickerProps<Content>) {
  if (collapsible && !summary) throw new TypeError("DateRangePicker collapsible needs summary to act as its toggle");
  const [value, setValue] = useControllableState<DateRangeValue>({
    ...(controlledValue === undefined ? {} : { value: controlledValue }),
    defaultValue: defaultValue ?? emptyDateRange,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  validateDateRange(value, maxRange);
  const [expanded, setExpanded] = useControllableState<boolean>({
    ...(collapsible?.expanded === undefined ? {} : { value: collapsible.expanded }),
    defaultValue: collapsible?.defaultExpanded ?? resolveDateRangeExpanded(value),
    ...(collapsible?.onExpandedChange === undefined ? {} : { onChange: collapsible.onExpandedChange }),
  });
  const open = collapsible === undefined || expanded;
  const select = (next: DateRangeValue) => {
    setValue(next);
    if (collapsible && !resolveDateRangeExpanded(next)) setExpanded(false);
  };
  const { palette, tokens } = useHjmNativeTheme();
  const color = (reference: Parameters<typeof resolveColorReference>[0]) => resolveColorReference(reference, palette);
  const activeEdge = resolveDateRangeActiveEdge(value);
  const field = (edge: "start" | "end") => {
    const date = value[edge];
    const label = edge === "start" ? summary!.startLabel : summary!.endLabel;
    const text = date === null ? summary!.placeholder : summary!.formatDate(date);
    const recipe = dateRangeRecipe.summary;
    return (
      <View key={edge} accessible={!collapsible} {...(collapsible ? {} : { accessibilityLabel: `${label}, ${text}` })}
        style={{ flex: 1, minWidth: 0, gap: recipe.field.gap, paddingVertical: recipe.field.paddingVertical,
          paddingHorizontal: recipe.field.paddingHorizontal, borderRadius: tokens.radius[recipe.field.radius],
          backgroundColor: color(recipe.field.background), borderWidth: recipe.field.activeBorderWidth,
          borderColor: activeEdge === edge ? color(recipe.field.activeBorder) : "transparent" }}>
        <Text accessible={false} variant={recipe.label.textVariant} style={{ color: color(recipe.label.color) }}>{label}</Text>
        <Text accessible={false} variant={recipe.value.textVariant} numberOfLines={1}
          style={{ color: color(date === null ? recipe.value.placeholderColor : recipe.value.color), fontVariant: ["tabular-nums"] }}>{text}</Text>
      </View>
    );
  };
  return (
    <View style={{ gap: dateRangeRecipe.gap }}>
      {summary && collapsible ? (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }}
          accessibilityLabel={[["start", summary.startLabel], ["end", summary.endLabel]].map(([edge, label]) => {
            const date = value[edge as "start" | "end"];
            return `${label}, ${date === null ? summary.placeholder : summary.formatDate(date)}`;
          }).join(", ")}
          onPress={() => setExpanded(!open)}
          style={{ flexDirection: "row", alignItems: "center", gap: dateRangeRecipe.toggle.gap }}>
          <View style={{ flex: 1, flexDirection: "row", gap: dateRangeRecipe.summary.gap }}>{field("start")}{field("end")}</View>
          <DrawnChevron direction={open ? "up" : "down"} size={glyph[dateRangeRecipe.toggle.glyph]} color={color(dateRangeRecipe.summary.label.color)} />
        </Pressable>
      ) : summary ? <View style={{ flexDirection: "row", gap: dateRangeRecipe.summary.gap }}>{field("start")}{field("end")}</View> : null}
      {open && presets?.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: dateRangeRecipe.presets.gap }}>
          {presets.map((preset) => {
            const range = resolveDateRangePreset(descriptor.grid.todayDate, preset.length);
            return (
              <Chip key={preset.id} label={preset.label} size={dateRangeRecipe.presets.chipSize} selectionMode="single"
                selected={range.start === value.start && range.end === value.end}
                onPress={() => {
                  validateDateRange(range, maxRange);
                  select(range);
                  // A preset ends today; bring its end month into view like a jump, so the band is visible.
                  const month = range.end!.slice(0, 7);
                  if (descriptor.focusedMonth !== month) descriptor.onFocusedMonthChange?.(month, "jump");
                }} />
            );
          })}
        </View>
      ) : null}
      {open ? <CalendarPaintContext.Provider value={(date) => resolveDateRangeCellPaint(value, date, null)}>
        <Calendar<Content>
          descriptor={{
            ...descriptor,
            // The range owns eligibility; Calendar keeps the same disabled-day interaction contract.
            grid: { ...descriptor.grid, cells: descriptor.grid.cells.map(cell => cell.date === undefined ? cell :
              { ...cell, disabled: cell.disabled === true || !isDateWithinRangeLimit(value, cell.date, maxRange) }) },
            // Calendar keeps single selection; the two edges and the band are painted through the internal
            // paint context, and each day's name carries the range position for assistive tech.
            selectedDate: value.end ?? value.start,
            onSelectionChange: (date) => { if (date !== null) select(resolveDateRangeSelection(value, date, maxRange)); },
          } as CalendarDescriptor<Content>}
          composeAccessibleName={(info) => {
            const state = resolveDateRangeCellState(value, info.date, null);
            const base = composeAccessibleName(info);
            return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
          }}
          {...(previousMonth === undefined ? {} : { previousMonth })}
          {...(nextMonth === undefined ? {} : { nextMonth })}
          {...(renderCellContent === undefined ? {} : { renderCellContent: (cell: { date: string }) => renderCellContent(cell.date) })}
        />
      </CalendarPaintContext.Provider> : null}
    </View>
  );
}
