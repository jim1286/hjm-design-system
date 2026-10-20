import { control, spacing, typography } from "./foundations.js";
// A single two-column session replaces independently closing Select overlays (2026-10-19).
// Keep the five 44px selection rows, but use a compact readout: the 40px summary exceeded the shared
// 24px cap and dominated the mobile departure Sheet (2026-10-20 review; APP_VISUAL_QUALITY_STANDARD §4).
export const timePickerRecipe = {
    rowHeight: control.minTouchTarget, visibleRows: 5, gap: spacing.sm, sectionGap: spacing.md,
    radius: "md", readoutSize: typography.titleLarge.fontSize, readoutLineHeight: typography.titleLarge.lineHeight, panelWidth: 304,
    defaults: { presentation: "field", minuteStep: 1 },
};
export function validateTimePicker(options) {
    if (options.value !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(options.value))
        throw new TypeError("TimePicker value must be HH:mm or null");
    const step = options.minuteStep ?? 1;
    if (!Number.isInteger(step) || step < 1 || step > 60 || 60 % step !== 0)
        throw new RangeError("TimePicker minuteStep must divide 60");
    for (const label of Object.values(options.labels))
        if (!label.trim())
            throw new TypeError("TimePicker labels must not be empty");
    if (options.presentation !== undefined && options.presentation !== "field" && options.presentation !== "inline")
        throw new TypeError("Invalid TimePicker presentation");
}
export function timePickerDraft(value) {
    return { hour: value?.slice(0, 2) ?? null, minute: value?.slice(3, 5) ?? null };
}
export function resolveTimePickerValue(draft, options) {
    if (draft.hour === null || draft.minute === null)
        return null;
    const value = `${draft.hour}:${draft.minute}`;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value) || Number(draft.minute) % (options.minuteStep ?? 1) !== 0 || options.isTimeUnavailable?.(value))
        return null;
    return value;
}
export function timePickerItems(part, draft, options) {
    const step = options.minuteStep ?? 1;
    return Array.from({ length: part === "hour" ? 24 : 60 / step }, (_, index) => {
        const value = String(part === "hour" ? index : index * step).padStart(2, "0");
        // An hour remains available if any of its minute slots is valid. Never silently replace the minute.
        const disabled = part === "hour"
            ? !Array.from({ length: 60 / step }, (_, i) => `${value}:${String(i * step).padStart(2, "0")}`).some(time => !options.isTimeUnavailable?.(time))
            : draft.hour !== null && !!options.isTimeUnavailable?.(`${draft.hour}:${value}`);
        return { value, disabled };
    });
}
export const timePickerBehavior = {
    controlled: ["value", "onValueChange"], inputs: ["labels", "minuteStep", "isTimeUnavailable", "presentation"],
    stateAxes: { availability: ["enabled", "disabled", "readOnly"], value: ["empty", "partial", "selected"], interaction: ["closed", "editing"] },
    web: { roles: ["button", "dialog", "listbox", "option"], keyboard: ["Tab", "Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "Home", "End"], focus: "roving", dismiss: ["action", "escape", "outside", "blur"] },
    native: { roles: ["button", "dialog", "radio"], states: ["disabled", "expanded", "checked"], actions: ["activate", "dismiss"], dismiss: ["action", "back", "outside"] },
    scenarios: ["two-columns-share-one-draft-and-overlay", "column-selection-never-dismisses", "confirm-commits-a-complete-available-HH:mm", "cancel-discards-edits", "external-value-reconciles-draft", "inline-parent-owns-confirmation", "unavailable-options-never-activate", "midnight-is-a-valid-value"],
};
//# sourceMappingURL=time-picker.js.map