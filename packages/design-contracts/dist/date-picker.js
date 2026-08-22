import { assertIsoCalendarDate, validateCalendarGridDescriptor, resolveCalendarGridDescriptor, validateCalendarMonthNavigation, } from "./calendar.js";
import { fieldFrameContract, floatingSurfaceContract, focusIndicatorContract, formSupportContract } from "./component-contracts.js";
import { control, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`DatePicker ${field} must not be empty`);
    }
}
export function validateDatePickerSelection(selection) {
    const selected = selection.selectedDate ?? selection.defaultSelectedDate;
    if (selected != null)
        assertIsoCalendarDate(selected, "selectedDate");
}
export function validateDatePickerDescriptor(descriptor) {
    validateCalendarGridDescriptor(descriptor.grid);
    assertNonEmpty(descriptor.placeholder, "placeholder");
    if (descriptor.displayValue !== null) {
        assertNonEmpty(descriptor.displayValue, "displayValue");
    }
    const label = descriptor.label ?? descriptor.accessibilityLabel;
    assertNonEmpty(label, "label or accessibilityLabel");
    validateDatePickerSelection(descriptor);
    validateCalendarMonthNavigation(descriptor);
}
/** Trigger copy is the committed display value, or the placeholder when nothing is selected yet. */
export function resolveDatePickerTriggerText(descriptor) {
    if (descriptor.displayValue !== null)
        assertNonEmpty(descriptor.displayValue, "displayValue");
    assertNonEmpty(descriptor.placeholder, "placeholder");
    return descriptor.displayValue ?? descriptor.placeholder;
}
/**
 * Resolves the popover/sheet content: the exact same cell shape, today/
 * selected marks, and accessible names Calendar renders inline. DatePicker
 * adds no per-cell semantics of its own — only the surrounding field/overlay
 * lifecycle is new.
 */
export function resolveDatePickerGrid(descriptor, options) {
    validateDatePickerDescriptor(descriptor);
    const selectedDate = descriptor.selectedDate ?? descriptor.defaultSelectedDate ?? null;
    return resolveCalendarGridDescriptor(descriptor.grid, selectedDate, options);
}
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
    ],
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
    leading: { color: semanticColors.content.secondary, icon: "calendar" },
    indicator: { color: semanticColors.content.secondary },
    clear: {
        diameter: control.buttonHeight.small,
        hitSlop: control.buttonHitSlop.small,
        glyph: "xs",
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
};
//# sourceMappingURL=date-picker.js.map