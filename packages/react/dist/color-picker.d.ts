import type { HjmCompositionStyleProp } from "./composition-style.js";
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
    /** Canonical layout-only placement on the root `<fieldset>`. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Controlled value; invalid text stays local until corrected or escaped. Native color UI supplies RGB only. */
export declare function ColorPicker({ label, labels, value, onValueChange, alpha, disabled, presets, layoutStyle }: ColorPickerProps): import("react").JSX.Element;
//# sourceMappingURL=color-picker.d.ts.map