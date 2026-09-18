import {
  emptyDateRange,
  isCompleteDateRange,
  resolveDateRangeCellState,
  resolveDateRangeSelection,
  validateDateRange,
  type DateRangeValue,
} from "@hjmds/design-contracts/components/date-range";
import type {
  CalendarDescriptor,
  ComposeCalendarAccessibleName,
} from "@hjmds/design-contracts/components/calendar";
import { spacing } from "@hjmds/design-contracts/foundations";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Calendar, type CalendarMonthAction } from "./calendar.js";
import { useControllableState } from "./internal/state.js";
import { useHjmNativeTheme } from "./provider.js";

export type DateRangePickerProps<Content = unknown> = Readonly<{
  /** The same grid Calendar renders; the product still owns month data. */
  descriptor: Omit<CalendarDescriptor<Content>, "selectedDate" | "defaultSelectedDate" | "onSelectionChange">;
  composeAccessibleName: ComposeCalendarAccessibleName<Content>;
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  previousMonth?: CalendarMonthAction;
  nextMonth?: CalendarMonthAction;
  /** Localized suffixes appended to a day's name when it is a range edge. */
  rangeLabels: Readonly<{ start: string; end: string; between: string }>;
  renderCellContent?: (date: string) => ReactNode;
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
  renderCellContent,
}: DateRangePickerProps<Content>) {
  const [value, setValue] = useControllableState<DateRangeValue>({
    ...(controlledValue === undefined ? {} : { value: controlledValue }),
    defaultValue: defaultValue ?? emptyDateRange,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  validateDateRange(value);
  const { colors } = useHjmNativeTheme();
  const edge = colors.contentBrand;
  return (
    <Calendar<Content>
      descriptor={{
        ...descriptor,
        // Calendar keeps single selection. There is no hover on a phone, so the
        // range's edges live only in each day's name — the one channel a screen
        // reader and a sighted user both get here.
        selectedDate: value.end ?? value.start,
        onSelectionChange: (date) => { if (date !== null) setValue(resolveDateRangeSelection(value, date)); },
      } as CalendarDescriptor<Content>}
      composeAccessibleName={(info) => {
        const state = resolveDateRangeCellState(value, info.date, null);
        const base = composeAccessibleName(info);
        return state === "none" ? base : `${base}, ${rangeLabels[state]}`;
      }}
      {...(previousMonth === undefined ? {} : { previousMonth })}
      {...(nextMonth === undefined ? {} : { nextMonth })}
      renderCellContent={(cell) => {
        const state = resolveDateRangeCellState(value, cell.date, null);
        if (state === "none") return renderCellContent?.(cell.date) ?? null;
        // No CSS band on native, and no hover to preview one. A dot under the
        // day is the visual channel that survives; the name carries the rest.
        return (
          <View style={{ alignItems: "center", gap: spacing.xxs }}>
            {renderCellContent?.(cell.date) ?? null}
            <View
              style={{
                width: state === "between" ? 4 : 6,
                height: state === "between" ? 4 : 6,
                borderRadius: 999,
                backgroundColor: edge,
                // A half-built range is not the same as a chosen one.
                opacity: isCompleteDateRange(value) ? 1 : 0.5,
              }}
            />
          </View>
        );
      }}
    />
  );
}
