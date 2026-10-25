import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ColorPickerLabels = Readonly<{
    hex: string;
    hue: string;
    saturation: string;
    brightness: string;
    opacity: string;
    invalid: string;
    /** Group name of the preset swatches; required when `presets` is not empty. */
    presets?: string;
}>;
export type ColorPickerProps = Readonly<{
    label: string;
    labels: ColorPickerLabels;
    value: string;
    onValueChange: (value: string) => void;
    alpha?: boolean;
    disabled?: boolean;
    presets?: readonly string[];
    /** Accessible name of a preset swatch. Defaults to its HEX code; products pass a localized colour name when they have one. */
    getPresetLabel?: (color: string) => string;
    /** Canonical layout-only placement on the root `<fieldset>`. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Controlled sRGB HEX value edited as HSV: a saturation/brightness area, a hue bar, an optional opacity bar, HEX text
 * and preset swatches. Invalid text stays local until corrected or escaped.
 */
export declare function ColorPicker({ label, labels, value, onValueChange, alpha, disabled, presets, getPresetLabel, layoutStyle }: ColorPickerProps): import("react").JSX.Element;
export type ColorSwatchPickerProps = Readonly<{
    /** Group name. Visible by default; `labelVisibility="hidden"` keeps it for assistive technology only. */
    label: string;
    colors: readonly string[];
    /** Selected colour, or `null` when the current colour is not one of the swatches. */
    value: string | null;
    onValueChange: (value: string) => void;
    alpha?: boolean;
    disabled?: boolean;
    /** Accessible name of a swatch. Defaults to its HEX code. */
    getColorLabel?: (color: string) => string;
    /** `wrap` (default) flows into rows; `scroll` keeps one horizontally scrolling row for toolbars. */
    layout?: "wrap" | "scroll";
    labelVisibility?: "visible" | "hidden";
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * A single choice among colour swatches with native radio semantics (arrow keys move the selection). Shared by
 * ColorPicker presets and quick colour rows such as a drawing toolbar, so products do not rebuild swatch buttons.
 */
export declare function ColorSwatchPicker({ label, colors, value, onValueChange, alpha, disabled, getColorLabel, layout, labelVisibility, layoutStyle }: ColorSwatchPickerProps): import("react").JSX.Element;
//# sourceMappingURL=color-picker.d.ts.map