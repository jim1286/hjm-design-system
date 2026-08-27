import {
  calendarRecipe,
  type ComposeCalendarAccessibleName,
  type ResolvedCalendarDateCell,
} from "@hjm/design-contracts/components/calendar";
import {
  resolveDatePickerGrid,
  resolveDatePickerTriggerText,
  validateDatePickerDescriptor,
  type DatePickerDescriptor,
  type DatePickerOpenChangeReason,
  type DatePickerSize,
} from "@hjm/design-contracts/components/date-picker";
import { useRef, useState, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { minimumTargetStyle } from "./internal/styles.js";
import { Sheet } from "./overlays.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type DatePickerMonthAction = Readonly<{ month: string; label: string }>;

export type DatePickerProps<Content = unknown> = Readonly<{
  descriptor: DatePickerDescriptor<Content>;
  monthLabel: string;
  composeAccessibleName: ComposeCalendarAccessibleName<Content>;
  previousMonth?: DatePickerMonthAction;
  nextMonth?: DatePickerMonthAction;
  clearLabel: string;
  closeLabel: string;
  size?: DatePickerSize;
  description?: string;
  error?: string;
  renderCellContent?: (cell: ResolvedCalendarDateCell<Content>) => ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

/** Native single-date trigger backed by the canonical Sheet overlay. */
export function DatePicker<Content>({
  descriptor,
  monthLabel,
  composeAccessibleName,
  previousMonth,
  nextMonth,
  clearLabel,
  closeLabel,
  size = "medium",
  description,
  error,
  renderCellContent,
  style,
}: DatePickerProps<Content>) {
  validateDatePickerDescriptor(descriptor);
  const { colors, environment } = useHjmNativeTheme();
  const controlledOpen = descriptor.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(descriptor.defaultOpen ?? false);
  const open = controlledOpen ? descriptor.open === true : internalOpen;
  const controlledSelection = descriptor.selectedDate !== undefined;
  const [internalSelection, setInternalSelection] = useState(descriptor.defaultSelectedDate ?? null);
  const selectedDate = controlledSelection ? descriptor.selectedDate ?? null : internalSelection;
  const cells = resolveDatePickerGrid(
    { ...descriptor, selectedDate } as DatePickerDescriptor<Content>,
    { composeAccessibleName },
  );
  const returnFocusRef = useRef<View>(null);
  const requestOpen = (next: boolean, reason: DatePickerOpenChangeReason) => {
    if (!controlledOpen) setInternalOpen(next);
    descriptor.onOpenChange?.(next, reason);
  };
  const commit = (date: string | null, reason: "activate" | "clear") => {
    if (!controlledSelection) setInternalSelection(date);
    descriptor.onSelectionChange?.(date, reason);
    requestOpen(false, reason === "activate" ? "selection" : "clear");
  };
  const label = descriptor.label ?? descriptor.accessibilityLabel;
  const triggerText = resolveDatePickerTriggerText(descriptor);
  const sizeMetrics = calendarRecipe.sizes[size];
  return (
    <View style={[{ gap: 6 }, style]}>
      {descriptor.label === undefined ? null : <Text emphasis="strong" variant="label">{descriptor.label}</Text>}
      <View style={{ alignItems: "center", direction: environment.direction, flexDirection: "row" }}>
        <Pressable
          accessibilityLabel={descriptor.accessibilityLabel ?? `${label}, ${triggerText}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: descriptor.disabled, expanded: open }}
          disabled={descriptor.disabled}
          onPress={() => !descriptor.readOnly && requestOpen(!open, "trigger")}
          ref={returnFocusRef}
          style={({ pressed }) => ({ alignItems: "center", backgroundColor: colors.surface, borderColor: descriptor.invalid || error ? colors.danger : colors.border, borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: "row", gap: 8, minHeight: size === "large" ? 56 : 48, opacity: pressed ? 0.72 : 1, paddingHorizontal: size === "large" ? 20 : 16 })}
        >
          <Text accessible={false}>▣</Text>
          <Text style={{ color: descriptor.displayValue === null ? colors.textMuted : colors.textBody }}>{triggerText}</Text>
        </Pressable>
        {selectedDate === null ? null : (
          <Pressable accessibilityLabel={clearLabel} accessibilityRole="button" disabled={descriptor.disabled || descriptor.readOnly} onPress={() => commit(null, "clear")} style={({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }]}>
            <Text tone="muted">×</Text>
          </Pressable>
        )}
      </View>
      {description === undefined ? null : <Text tone="muted" variant="label">{description}</Text>}
      {error === undefined ? null : <Text accessibilityLiveRegion="assertive" style={{ color: colors.danger }} variant="label">{error}</Text>}
      <Sheet
        closeLabel={closeLabel}
        onOpenChange={(next) => { if (!next) requestOpen(false, "outside"); }}
        open={open}
        returnFocusRef={returnFocusRef}
        title={monthLabel}
      >
        <View style={{ gap: 8 }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 4 }}>
            {previousMonth === undefined ? <View accessible={false} style={minimumTargetStyle} /> : <Pressable accessibilityLabel={previousMonth.label} accessibilityRole="button" onPress={() => descriptor.onFocusedMonthChange?.(previousMonth.month, "previous")} style={({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }]}><Text>‹</Text></Pressable>}
            <Text align="center" emphasis="strong" style={{ flex: 1 }} variant="title">{monthLabel}</Text>
            {nextMonth === undefined ? <View accessible={false} style={minimumTargetStyle} /> : <Pressable accessibilityLabel={nextMonth.label} accessibilityRole="button" onPress={() => descriptor.onFocusedMonthChange?.(nextMonth.month, "next")} style={({ pressed }) => [minimumTargetStyle, { alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 }]}><Text>›</Text></Pressable>}
          </View>
          <View accessible={false} style={{ flexDirection: "row" }}>
            {descriptor.grid.weekdayLabels.map((weekday, index) => <Text align="center" key={`${weekday}-${index}`} style={{ flex: 1 }} tone="muted" variant="label">{weekday}</Text>)}
          </View>
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <View key={row} style={{ flexDirection: "row" }}>
              {cells.slice(row * 7, row * 7 + 7).map((cell, column) => "filler" in cell ? (
                <View accessible={false} key={`filler-${row}-${column}`} style={{ flex: 1, height: sizeMetrics.cellDiameter }} />
              ) : (
                <View key={cell.date} style={{ alignItems: "center", flex: 1 }}>
                  <Pressable
                    accessibilityLabel={cell.accessibleName}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !cell.selectable, selected: cell.isSelected }}
                    onPress={() => cell.selectable && commit(cell.date, "activate")}
                    style={({ pressed }) => ({ alignItems: "center", backgroundColor: cell.isSelected ? colors.primary : "transparent", borderColor: cell.isToday ? colors.contentBrand : "transparent", borderRadius: sizeMetrics.cellDiameter / 2, borderWidth: cell.isToday ? 1 : 0, height: sizeMetrics.cellDiameter, justifyContent: "center", opacity: !cell.selectable ? 0.4 : cell.outsideFocusedMonth ? 0.56 : pressed ? 0.72 : 1, width: sizeMetrics.cellDiameter })}
                  >
                    <Text align="center" style={{ color: cell.isSelected ? colors.onPrimary : colors.textBody }}>{Number(cell.date.slice(-2))}</Text>
                    {renderCellContent?.(cell)}
                  </Pressable>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Sheet>
    </View>
  );
}
