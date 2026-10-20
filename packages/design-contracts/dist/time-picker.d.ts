export type TimePickerPart = "hour" | "minute";
export type TimePickerDraft = Readonly<{
    hour: string | null;
    minute: string | null;
}>;
export type TimePickerLabels = Readonly<{
    label: string;
    hour: string;
    minute: string;
    placeholder: string;
    confirm: string;
    cancel: string;
}>;
export type TimePickerOptions = Readonly<{
    value: string | null;
    onValueChange(value: string | null): void;
    labels: TimePickerLabels;
    /** Inline changes update the parent's draft; its enclosing form owns confirmation. */
    presentation?: "field" | "inline";
    minuteStep?: number;
    isTimeUnavailable?: (value: string) => boolean;
    disabled?: boolean;
    readOnly?: boolean;
    description?: string;
    error?: string;
}>;
export declare const timePickerRecipe: {
    readonly rowHeight: 44;
    readonly visibleRows: 5;
    readonly gap: 12;
    readonly sectionGap: 16;
    readonly radius: "md";
    readonly readoutSize: 20;
    readonly readoutLineHeight: 28;
    readonly panelWidth: 304;
    readonly defaults: {
        readonly presentation: "field";
        readonly minuteStep: 1;
    };
};
export declare function validateTimePicker(options: TimePickerOptions): void;
export declare function timePickerDraft(value: string | null): TimePickerDraft;
export declare function resolveTimePickerValue(draft: TimePickerDraft, options: Pick<TimePickerOptions, "minuteStep" | "isTimeUnavailable">): string | null;
export declare function timePickerItems(part: TimePickerPart, draft: TimePickerDraft, options: Pick<TimePickerOptions, "minuteStep" | "isTimeUnavailable">): {
    value: string;
    disabled: boolean;
}[];
export declare const timePickerBehavior: {
    readonly controlled: readonly ["value", "onValueChange"];
    readonly inputs: readonly ["labels", "minuteStep", "isTimeUnavailable", "presentation"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled", "readOnly"];
        readonly value: readonly ["empty", "partial", "selected"];
        readonly interaction: readonly ["closed", "editing"];
    };
    readonly web: {
        readonly roles: readonly ["button", "dialog", "listbox", "option"];
        readonly keyboard: readonly ["Tab", "Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "Home", "End"];
        readonly focus: "roving";
        readonly dismiss: readonly ["action", "escape", "outside", "blur"];
    };
    readonly native: {
        readonly roles: readonly ["button", "dialog", "radio"];
        readonly states: readonly ["disabled", "expanded", "checked"];
        readonly actions: readonly ["activate", "dismiss"];
        readonly dismiss: readonly ["action", "back", "outside"];
    };
    readonly scenarios: readonly ["two-columns-share-one-draft-and-overlay", "column-selection-never-dismisses", "confirm-commits-a-complete-available-HH:mm", "cancel-discards-edits", "external-value-reconciles-draft", "inline-parent-owns-confirmation", "unavailable-options-never-activate", "midnight-is-a-valid-value"];
};
//# sourceMappingURL=time-picker.d.ts.map