export type ColorPickerLabels = Readonly<{
    color: string;
    hex: string;
    opacity: string;
    invalid: string;
}>;
export type ColorPickerProps = Readonly<{
    label: string;
    labels: ColorPickerLabels;
    value: string;
    onValueChange: (value: string) => void;
    alpha?: boolean;
    disabled?: boolean;
    presets?: readonly string[];
}>;
/** Controlled value; invalid text stays local until corrected or escaped. Native color UI supplies RGB only. */
export declare function ColorPicker({ label, labels, value, onValueChange, alpha, disabled, presets }: ColorPickerProps): import("react").JSX.Element;
//# sourceMappingURL=color-picker.d.ts.map