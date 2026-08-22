import type { ColorReference } from "./color-references.js";
import type { BehaviorContract } from "./behaviors.js";
import {
  assertIsoCalendarDate,
  validateCalendarGridDescriptor,
  type CalendarGridDescriptor,
  type CalendarMonthNavigation,
  type ComposeCalendarAccessibleName,
  type ResolvedCalendarGridCell,
  resolveCalendarGridDescriptor,
  validateCalendarMonthNavigation,
} from "./calendar.js";
import { fieldFrameContract, floatingSurfaceContract, focusIndicatorContract, formSupportContract } from "./component-contracts.js";
import { control, spacing, type GlyphSize, type TextVariant } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`DatePicker ${field} must not be empty`);
  }
}

/**
 * Mirrors `SelectLabel` by shape rather than importing it: Select's type
 * lives in `collection.ts` for Select/Combobox/Menu's shared collection
 * story, and DatePicker's date grid deliberately does not adopt that
 * collection contract (see docs/calendar.md). Repeating the small, obvious
 * "visible label or accessibility label" shape here keeps this module
 * self-sufficient while staying consistent with the rest of the system.
 */
export type DatePickerLabel =
  | Readonly<{ label: string; accessibilityLabel?: string }>
  | Readonly<{ label?: never; accessibilityLabel: string }>;

export type DatePickerOpenChangeReason =
  | "trigger"
  | "keyboard"
  | "selection"
  | "clear"
  | "escape"
  | "outside"
  | "blur"
  | "programmatic";

export type DatePickerOpenState =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange(open: boolean, reason: DatePickerOpenChangeReason): void;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean, reason: DatePickerOpenChangeReason) => void;
    }>;

/**
 * A committed date closes the popover/sheet the same way Select's
 * `selection-requests-close-and-restores-trigger-focus` scenario works.
 * `clear` commits `null` without reopening — this is the field's only
 * "empty" affordance; there is no separate disallow-empty configuration
 * because an optional date field is the common case (unlike Select, which
 * more often names a required option).
 */
export type DatePickerSelection =
  | Readonly<{
      selectedDate: string | null;
      defaultSelectedDate?: never;
      onSelectionChange(date: string | null, reason: "activate" | "clear"): void;
    }>
  | Readonly<{
      selectedDate?: never;
      defaultSelectedDate?: string | null;
      onSelectionChange?: (date: string | null, reason: "activate" | "clear") => void;
    }>;

export function validateDatePickerSelection(selection: DatePickerSelection): void {
  const selected = selection.selectedDate ?? selection.defaultSelectedDate;
  if (selected != null) assertIsoCalendarDate(selected, "selectedDate");
}

/**
 * Field + grid + adaptive overlay. The grid itself is the exact
 * `CalendarGridDescriptor` from `calendar.ts` — Web renders it inside an
 * anchored popover, Native inside a Sheet (the `Select` adaptive split:
 * `adaptive: { web: "popover", native: "sheet" }`), but neither renderer
 * reinterprets the grid's cells, navigation, or accessible-name contract.
 */
export type DatePickerDescriptor<Content = unknown> = Readonly<{
  grid: CalendarGridDescriptor<Content>;
  /** Product-formatted trigger copy for the committed date ("2026년 8월 19일"); DatePicker never formats a date itself. */
  displayValue: string | null;
  placeholder: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}> &
  DatePickerLabel &
  DatePickerOpenState &
  DatePickerSelection &
  CalendarMonthNavigation;

export function validateDatePickerDescriptor<Content>(
  descriptor: DatePickerDescriptor<Content>,
): void {
  validateCalendarGridDescriptor(descriptor.grid);
  assertNonEmpty(descriptor.placeholder, "placeholder");
  if (descriptor.displayValue !== null) {
    assertNonEmpty(descriptor.displayValue, "displayValue");
  }
  const label = descriptor.label ?? descriptor.accessibilityLabel;
  assertNonEmpty(label as string, "label or accessibilityLabel");
  validateDatePickerSelection(descriptor);
  validateCalendarMonthNavigation(descriptor);
}

/** Trigger copy is the committed display value, or the placeholder when nothing is selected yet. */
export function resolveDatePickerTriggerText(
  descriptor: Pick<DatePickerDescriptor, "displayValue" | "placeholder">,
): string {
  if (descriptor.displayValue !== null) assertNonEmpty(descriptor.displayValue, "displayValue");
  assertNonEmpty(descriptor.placeholder, "placeholder");
  return descriptor.displayValue ?? descriptor.placeholder;
}

/**
 * Resolves the popover/sheet content: the exact same cell shape, today/
 * selected marks, and accessible names Calendar renders inline. DatePicker
 * adds no per-cell semantics of its own — only the surrounding field/overlay
 * lifecycle is new.
 */
export function resolveDatePickerGrid<Content>(
  descriptor: DatePickerDescriptor<Content>,
  options: Readonly<{ composeAccessibleName: ComposeCalendarAccessibleName<Content> }>,
): readonly ResolvedCalendarGridCell<Content>[] {
  validateDatePickerDescriptor(descriptor);
  const selectedDate = descriptor.selectedDate ?? descriptor.defaultSelectedDate ?? null;
  return resolveCalendarGridDescriptor(descriptor.grid, selectedDate, options);
}

export type DatePickerSize = "medium" | "large";

/**
 * Reuses `fieldFrameContract`/`formSupportContract` verbatim, exactly like
 * NumberField and Select each do independently — a second field frame would
 * drift the first time either one's border or height changes. `calendar`
 * anatomy is intentionally not re-declared here: the popover/sheet mounts
 * `calendarRecipe` unchanged, so this recipe only owns the field/trigger and
 * the overlay frame around it.
 */
export const datePickerRecipe = {
  slots: [
    "root",
    "label",
    "trigger",
    "leading",
    "value",
    "placeholder",
    "clear",
    "indicator",
    "description",
    "error",
    "popover",
  ] as const,
  defaults: { size: "medium" },
  adaptive: { web: "popover", native: "sheet" },
  frame: fieldFrameContract,
  sizes: {
    medium: {
      minHeight: fieldFrameContract.minHeight,
      paddingHorizontal: fieldFrameContract.paddingHorizontal,
      textVariant: "body",
      glyph: "sm",
    },
    large: {
      minHeight: control.buttonHeight.large,
      paddingHorizontal: spacing.lg,
      textVariant: "bodyLarge",
      glyph: "md",
    },
  },
  support: formSupportContract,
  value: {
    color: semanticColors.content.body,
    placeholderColor: semanticColors.content.secondary,
  },
  leading: { color: semanticColors.content.secondary, icon: "calendar" as const },
  indicator: { color: semanticColors.content.secondary },
  clear: {
    diameter: control.buttonHeight.small,
    hitSlop: control.buttonHitSlop.small,
    glyph: "xs" as const,
    color: semanticColors.content.secondary,
  },
  popover: {
    ...floatingSurfaceContract,
    minWidth: 300,
    maxWidth: 360,
    sideOffset: spacing.xs,
    collisionPadding: spacing.xs,
  },
  states: {
    focus: focusIndicatorContract,
    invalidBorder: semanticColors.border.danger,
  },
} as const satisfies {
  slots: readonly string[];
  defaults: { size: DatePickerSize };
  adaptive: { web: "popover"; native: "sheet" };
  frame: typeof fieldFrameContract;
  sizes: Record<
    DatePickerSize,
    { minHeight: number; paddingHorizontal: number; textVariant: TextVariant; glyph: GlyphSize }
  >;
  support: typeof formSupportContract;
  value: { color: ColorReference; placeholderColor: ColorReference };
  leading: { color: ColorReference; icon: "calendar" };
  indicator: { color: ColorReference };
  clear: { diameter: number; hitSlop: number; glyph: GlyphSize; color: ColorReference };
  popover: typeof floatingSurfaceContract & {
    minWidth: number;
    maxWidth: number;
    sideOffset: number;
    collisionPadding: number;
  };
  states: { focus: typeof focusIndicatorContract; invalidBorder: ColorReference };
};

/**
 * Web mounts the grid as a real focus-bearing `dialog` (APG's Date Picker
 * Dialog pattern moves actual DOM focus through gridcells via roving
 * tabindex, unlike Select's `activeDescendant` listbox where focus stays on
 * the trigger). Native mounts the same grid inside a Sheet. Both close on a
 * committed selection or `clear` and restore trigger focus, matching
 * Select's own dismiss-and-restore scenario.
 */
export const datePickerBehavior = {
  controlled: [
    "selectedDate",
    "defaultSelectedDate",
    "onSelectionChange",
    "open",
    "defaultOpen",
    "onOpenChange",
  ],
  inputs: ["grid", "displayValue", "focusedMonth", "defaultFocusedMonth"],
  stateAxes: {
    availability: ["enabled", "disabled", "readOnly", "busy"],
    value: ["empty", "selected", "open"],
    validation: ["valid", "invalid"],
  },
  web: {
    roles: ["button", "dialog", "grid", "row", "gridcell"],
    keyboard: [
      "Tab",
      "Enter",
      "Space",
      "Escape",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ],
    focus: "roving",
    dismiss: ["selection", "escape", "outside", "blur"],
  },
  native: {
    roles: ["button", "dialog"],
    states: ["disabled", "expanded"],
    actions: ["activate", "dismiss"],
    dismiss: ["selection", "back", "outside"],
  },
  scenarios: [
    "visible-label-or-accessibility-label-names-trigger",
    "trigger-shows-the-product-formatted-display-value-or-placeholder",
    "popover-and-sheet-content-reuse-the-calendar-grid-contract-unchanged",
    "activating-an-enabled-date-commits-selection-and-closes",
    "disabled-dates-remain-focusable-but-never-commit-or-close",
    "clear-commits-null-and-closes-without-reopening",
    "escape-closes-without-commit-and-restores-trigger-focus",
    "outside-press-closes-without-commit",
    "controlled-owner-may-defer-a-selection-close-request",
    "changing-the-focused-month-never-changes-or-clears-the-selection",
    "range-selection-is-not-part-of-the-contract",
  ],
} as const satisfies BehaviorContract;
