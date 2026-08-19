import { type CalendarGridDescriptor, type CalendarMonthNavigation, type ComposeCalendarAccessibleName, type ResolvedCalendarGridCell } from "./calendar.js";
/**
 * Mirrors `SelectLabel` by shape rather than importing it: Select's type
 * lives in `collection.ts` for Select/Combobox/Menu's shared collection
 * story, and DatePicker's date grid deliberately does not adopt that
 * collection contract (see docs/calendar.md). Repeating the small, obvious
 * "visible label or accessibility label" shape here keeps this module
 * self-sufficient while staying consistent with the rest of the system.
 */
export type DatePickerLabel = Readonly<{
    label: string;
    accessibilityLabel?: string;
}> | Readonly<{
    label?: never;
    accessibilityLabel: string;
}>;
export type DatePickerOpenChangeReason = "trigger" | "keyboard" | "selection" | "clear" | "escape" | "outside" | "blur" | "programmatic";
export type DatePickerOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, reason: DatePickerOpenChangeReason): void;
}> | Readonly<{
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
export type DatePickerSelection = Readonly<{
    selectedDate: string | null;
    defaultSelectedDate?: never;
    onSelectionChange(date: string | null, reason: "activate" | "clear"): void;
}> | Readonly<{
    selectedDate?: never;
    defaultSelectedDate?: string | null;
    onSelectionChange?: (date: string | null, reason: "activate" | "clear") => void;
}>;
export declare function validateDatePickerSelection(selection: DatePickerSelection): void;
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
}> & DatePickerLabel & DatePickerOpenState & DatePickerSelection & CalendarMonthNavigation;
export declare function validateDatePickerDescriptor<Content>(descriptor: DatePickerDescriptor<Content>): void;
/** Trigger copy is the committed display value, or the placeholder when nothing is selected yet. */
export declare function resolveDatePickerTriggerText(descriptor: Pick<DatePickerDescriptor, "displayValue" | "placeholder">): string;
/**
 * Resolves the popover/sheet content: the exact same cell shape, today/
 * selected marks, and accessible names Calendar renders inline. DatePicker
 * adds no per-cell semantics of its own — only the surrounding field/overlay
 * lifecycle is new.
 */
export declare function resolveDatePickerGrid<Content>(descriptor: DatePickerDescriptor<Content>, options: Readonly<{
    composeAccessibleName: ComposeCalendarAccessibleName<Content>;
}>): readonly ResolvedCalendarGridCell<Content>[];
export type DatePickerSize = "medium" | "large";
/**
 * Reuses `fieldFrameContract`/`formSupportContract` verbatim, exactly like
 * NumberField and Select each do independently — a second field frame would
 * drift the first time either one's border or height changes. `calendar`
 * anatomy is intentionally not re-declared here: the popover/sheet mounts
 * `calendarRecipe` unchanged, so this recipe only owns the field/trigger and
 * the overlay frame around it.
 */
export declare const datePickerRecipe: {
    readonly slots: readonly ["root", "label", "trigger", "leading", "value", "placeholder", "clear", "indicator", "description", "error", "popover"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly adaptive: {
        readonly web: "popover";
        readonly native: "sheet";
    };
    readonly frame: {
        readonly background: Readonly<{
            source: "theme";
            key: "surface";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly focusBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly radius: "md";
        readonly borderWidth: 1;
        readonly minHeight: 44;
        readonly paddingHorizontal: 16;
    };
    readonly sizes: {
        readonly medium: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
            readonly glyph: "sm";
        };
        readonly large: {
            readonly minHeight: 52;
            readonly paddingHorizontal: 20;
            readonly textVariant: "bodyLarge";
            readonly glyph: "md";
        };
    };
    readonly support: {
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "600";
        };
        readonly hint: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly gap: 8;
    };
    readonly value: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly placeholderColor: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly leading: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly icon: "calendar";
    };
    readonly indicator: {
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly clear: {
        readonly diameter: 36;
        readonly hitSlop: 4;
        readonly glyph: "xs";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
    readonly popover: {
        readonly minWidth: 300;
        readonly maxWidth: 360;
        readonly sideOffset: 8;
        readonly collisionPadding: 8;
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly radius: "md";
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
        readonly padding: 8;
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
};
/**
 * Web mounts the grid as a real focus-bearing `dialog` (APG's Date Picker
 * Dialog pattern moves actual DOM focus through gridcells via roving
 * tabindex, unlike Select's `activeDescendant` listbox where focus stays on
 * the trigger). Native mounts the same grid inside a Sheet. Both close on a
 * committed selection or `clear` and restore trigger focus, matching
 * Select's own dismiss-and-restore scenario.
 */
export declare const datePickerBehavior: {
    readonly controlled: readonly ["selectedDate", "defaultSelectedDate", "onSelectionChange", "open", "defaultOpen", "onOpenChange"];
    readonly inputs: readonly ["grid", "displayValue", "focusedMonth", "defaultFocusedMonth"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled", "readOnly", "busy"];
        readonly value: readonly ["empty", "selected", "open"];
        readonly validation: readonly ["valid", "invalid"];
    };
    readonly web: {
        readonly roles: readonly ["button", "dialog", "grid", "row", "gridcell"];
        readonly keyboard: readonly ["Tab", "Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
        readonly focus: "roving";
        readonly dismiss: readonly ["selection", "escape", "outside", "blur"];
    };
    readonly native: {
        readonly roles: readonly ["button", "dialog"];
        readonly states: readonly ["disabled", "expanded"];
        readonly actions: readonly ["activate", "dismiss"];
        readonly dismiss: readonly ["selection", "back", "outside"];
    };
    readonly scenarios: readonly ["visible-label-or-accessibility-label-names-trigger", "trigger-shows-the-product-formatted-display-value-or-placeholder", "popover-and-sheet-content-reuse-the-calendar-grid-contract-unchanged", "activating-an-enabled-date-commits-selection-and-closes", "disabled-dates-remain-focusable-but-never-commit-or-close", "clear-commits-null-and-closes-without-reopening", "escape-closes-without-commit-and-restores-trigger-focus", "outside-press-closes-without-commit", "controlled-owner-may-defer-a-selection-close-request", "changing-the-focused-month-never-changes-or-clears-the-selection", "range-selection-is-not-part-of-the-contract"];
};
//# sourceMappingURL=date-picker.d.ts.map