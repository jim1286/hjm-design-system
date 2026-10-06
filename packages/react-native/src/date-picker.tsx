import {
  type ComposeCalendarAccessibleName,
  type ResolvedCalendarDateCell,
} from "@hjmds/design-contracts/components/calendar";
import {
  datePickerRecipe,
  resolveDatePickerTriggerText,
  validateDatePickerDescriptor,
  type DatePickerDescriptor,
  type DatePickerOpenChangeReason,
  type DatePickerSize,
} from "@hjmds/design-contracts/components/date-picker";
import { radius } from "@hjmds/design-contracts/foundations";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { useRef, useState, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { Calendar } from "./calendar.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Sheet, type SheetProps } from "./overlays.js";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
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
  /**
   * Forwarded to the picker's Sheet. Without it the calendar's last row sat under
   * the Android navigation bar and the call site had no way to fix it
   * (2026-09-30 audit). Defaults to the HjmNativeProvider insets like Sheet.
   */
  safeAreaInsets?: SheetProps["safeAreaInsets"];
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * the field recipe (`size`) owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
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
  safeAreaInsets,
  layoutStyle,
  style,
}: DatePickerProps<Content>) {
  warnDeprecatedStyleProps("DatePicker", { style }, "layoutStyle for placement; size owns appearance");
  validateDatePickerDescriptor(descriptor);
  const { colors, environment } = useHjmNativeTheme();
  const controlledOpen = descriptor.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(descriptor.defaultOpen ?? false);
  const open = controlledOpen ? descriptor.open === true : internalOpen;
  const controlledSelection = descriptor.selectedDate !== undefined;
  const [internalSelection, setInternalSelection] = useState(descriptor.defaultSelectedDate ?? null);
  const selectedDate = controlledSelection ? descriptor.selectedDate ?? null : internalSelection;
  const returnFocusRef = useRef<View>(null);
  const requestOpen = (next: boolean, reason: DatePickerOpenChangeReason) => {
    if (!controlledOpen) setInternalOpen(next);
    descriptor.onOpenChange?.(next, reason);
  };
  const commit = (date: string | null, reason: "activate" | "clear") => {
    // A controlled open field can become read-only while its grid remains mounted.
    if (descriptor.disabled || descriptor.readOnly) return;
    if (!controlledSelection) setInternalSelection(date);
    descriptor.onSelectionChange?.(date, reason);
    requestOpen(false, reason === "activate" ? "selection" : "clear");
  };
  // The outer field owns selection; the shared grid receives only its resolved controlled value.
  const { defaultSelectedDate: _defaultSelectedDate, ...calendarDescriptor } = descriptor;
  const calendarGrid = descriptor.disabled || descriptor.readOnly
    ? { ...descriptor.grid, cells: descriptor.grid.cells.map((cell) => cell.date ? { ...cell, disabled: true } : cell) }
    : descriptor.grid;
  const label = descriptor.label ?? descriptor.accessibilityLabel;
  const triggerText = resolveDatePickerTriggerText(descriptor);
  return (
    <View style={[{ gap: 6 }, style, layoutStyle]}>
      {/* fieldRecipe.disabledScope: label and trigger row fade, description and error keep full contrast.
          datePickerRecipe has no amount, so the field default applies; before 2026-10-06 nothing dimmed. */}
      {descriptor.label === undefined ? null : <Text emphasis="strong" variant="label" style={descriptor.disabled ? { opacity: fieldRecipe.disabledOpacity } : undefined}>{descriptor.label}</Text>}
      <View style={{ alignItems: "center", direction: environment.direction, flexDirection: "row", opacity: descriptor.disabled ? fieldRecipe.disabledOpacity : 1 }}>
        <Pressable
          accessibilityLabel={descriptor.accessibilityLabel ?? `${label}, ${triggerText}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: descriptor.disabled, expanded: open }}
          disabled={descriptor.disabled}
          onPress={() => !descriptor.readOnly && requestOpen(!open, "trigger")}
          ref={returnFocusRef}
          // Trigger height and inset come from datePickerRecipe.sizes (medium 44 · 16, large 52 · 20), the field frame
          // Select and NumberField share. Until 2026-10-06 Native drew 48/56 and Web 44/56, three different heights.
          style={({ pressed }) => ({ alignItems: "center", backgroundColor: colors.bg, borderColor: descriptor.invalid || error ? colors.danger : colors.borderControl, borderRadius: radius[datePickerRecipe.frame.radius], borderWidth: datePickerRecipe.frame.borderWidth, flex: 1, flexDirection: "row", gap: 8, minHeight: datePickerRecipe.sizes[size].minHeight, opacity: pressed ? 0.72 : 1, paddingHorizontal: datePickerRecipe.sizes[size].paddingHorizontal })}
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
        {...(safeAreaInsets === undefined ? {} : { safeAreaInsets })}
        title={label}
      >
        <Calendar descriptor={{ ...calendarDescriptor, grid: calendarGrid, monthLabel, selectedDate, onSelectionChange: (date) => commit(date, "activate") }}
          composeAccessibleName={composeAccessibleName} size={size}
          {...(previousMonth ? { previousMonth } : {})} {...(nextMonth ? { nextMonth } : {})}
          {...(renderCellContent ? { renderCellContent } : {})} />
      </Sheet>
    </View>
  );
}
