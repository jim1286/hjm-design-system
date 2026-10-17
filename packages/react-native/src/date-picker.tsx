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
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { glyph } from "@hjmds/design-contracts/foundations";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, findNodeHandle, Pressable, View } from "react-native";

import { IconButton } from "./actions.js";
import { Calendar } from "./calendar.js";
import { DrawnCalendar } from "./internal/drawn-glyphs.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { Sheet, type SheetProps } from "./overlays.js";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
}>;

/** Native single-date trigger backed by the canonical Sheet overlay. */

// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
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
}: DatePickerProps<Content>) {

  validateDatePickerDescriptor(descriptor);
  const { colors, environment, tokens } = useHjmNativeTheme();
  const controlledOpen = descriptor.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(descriptor.defaultOpen ?? false);
  const open = controlledOpen ? descriptor.open === true : internalOpen;
  const controlledSelection = descriptor.selectedDate !== undefined;
  const [internalSelection, setInternalSelection] = useState(descriptor.defaultSelectedDate ?? null);
  const selectedDate = controlledSelection ? descriptor.selectedDate ?? null : internalSelection;
  const returnFocusRef = useRef<View>(null);
  const requestOpen = useCallback((next: boolean, reason: DatePickerOpenChangeReason) => {
    if (!controlledOpen) setInternalOpen(next);
    descriptor.onOpenChange?.(next, reason);
  }, [controlledOpen, descriptor.onOpenChange]);
  useEffect(() => {
    // Locking an open field must dismiss its now-unavailable calendar actions.
    if (open && (descriptor.disabled || descriptor.readOnly)) requestOpen(false, "programmatic");
  }, [descriptor.disabled, descriptor.readOnly, open, requestOpen]);
  const commit = (date: string | null, reason: "activate" | "clear") => {
    // A controlled open field can become read-only while its grid remains mounted.
    if (descriptor.disabled || descriptor.readOnly) return;
    if (!controlledSelection) setInternalSelection(date);
    descriptor.onSelectionChange?.(date, reason);
    requestOpen(false, reason === "activate" ? "selection" : "clear");
    // No Sheet dismissal occurs when the already-closed field loses its clear action.
    if (reason === "clear" && !open && returnFocusRef.current) {
      const handle = findNodeHandle(returnFocusRef.current);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };
  // The outer field owns selection; the shared grid receives only its resolved controlled value.
  const { defaultSelectedDate: _defaultSelectedDate, ...calendarDescriptor } = descriptor;
  const calendarGrid = descriptor.disabled || descriptor.readOnly
    ? { ...descriptor.grid, cells: descriptor.grid.cells.map((cell) => cell.date ? { ...cell, disabled: true } : cell) }
    : descriptor.grid;
  const label = descriptor.label ?? descriptor.accessibilityLabel;
  const triggerText = resolveDatePickerTriggerText(descriptor);
  // Trigger height and inset use the shared datePickerRecipe instead of the old
  // divergent Web/Native dimensions (2026-10-06 alignment).
  return (
    <View style={[{ gap: 6 }, layoutStyle]}>
      {/* fieldRecipe.disabledScope: label and trigger row fade, description and error keep full contrast.
          datePickerRecipe has no amount, so the field default applies; before 2026-10-06 nothing dimmed. */}
      {descriptor.label === undefined ? null : <Text emphasis="strong" variant="label" style={descriptor.disabled ? { opacity: fieldRecipe.disabledOpacity } : undefined}>{descriptor.label}</Text>}
      <View style={{ alignItems: "center", direction: environment.direction, flexDirection: "row", opacity: descriptor.disabled ? fieldRecipe.disabledOpacity : 1 }}>
        <Pressable
          accessibilityLabel={descriptor.accessibilityLabel ?? `${label}, ${triggerText}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: descriptor.disabled || descriptor.readOnly, expanded: open }}
          disabled={descriptor.disabled || descriptor.readOnly}
          onPress={() => !descriptor.readOnly && requestOpen(!open, "trigger")}
          ref={returnFocusRef}
          style={({ pressed }) => ({ alignItems: "center", backgroundColor: colors.bg, borderColor: descriptor.invalid || error ? colors.danger : colors.borderControl, borderRadius: tokens.radius[datePickerRecipe.frame.radius], borderWidth: datePickerRecipe.frame.borderWidth, flex: 1, flexDirection: "row", gap: 8, minHeight: datePickerRecipe.sizes[size].minHeight, opacity: pressed ? 0.72 : 1, paddingHorizontal: datePickerRecipe.sizes[size].paddingHorizontal })}
        >
          <DrawnCalendar size={glyph[datePickerRecipe.sizes[size].glyph]} color={colors.textMuted} />
          <Text
              fontRole="ui" style={{ color: descriptor.displayValue === null ? colors.textMuted : colors.textBody }}>{triggerText}</Text>
        </Pressable>
        {selectedDate === null ? null : (
          <IconButton label={clearLabel} tone="ghost" disabled={descriptor.disabled === true || descriptor.readOnly === true} onPress={() => commit(null, "clear")}>
            <FixedGlyph tone="muted" fontSize={glyph.sm}>×</FixedGlyph>
          </IconButton>
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
