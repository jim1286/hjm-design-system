/** sRGB hex is the interchange format; the HSV editor below converts at the edge without changing stored values. */
export declare function normalizePickerColor(value: string, alpha?: boolean): string;
export declare function pickerOpacity(value: string): number;
export declare function withPickerOpacity(value: string, opacity: number): string;
/** Hue 0–360, saturation and brightness 0–100. Values stay unrounded so a drag never drifts through hex rounding. */
export type PickerHsv = Readonly<{
    hue: number;
    saturation: number;
    brightness: number;
}>;
/**
 * HSV of the opaque part of `value`. Black has no saturation and greys have no hue; those channels keep `previous`
 * so dragging the area into a corner does not snap the hue slider back to red (2026-10-25 ColorPicker redesign,
 * the same behavior as Figma's and React Aria's colour areas).
 */
export declare function pickerHsv(value: string, previous?: PickerHsv): PickerHsv;
/** Opaque `#rrggbb` for an HSV triple; out-of-range channels are clamped. */
export declare function pickerHexFromHsv({ hue, saturation, brightness }: PickerHsv): string;
/** Fully saturated colour at `hue`: the area's base and the hue thumb fill. */
export declare function pickerHueColor(hue: number): string;
/** Stops for the hue track gradient, red to red. */
export declare const pickerHueStops: {
    offset: number;
    color: string;
}[];
/**
 * 2026-10-25 redesign (Diairy hand-drawn profile request): a saturation/brightness area with hue and opacity bars
 * replaces the browser colour popup (Web) and RGB channel sliders (Native). People pick colour by hue and shade, as
 * in Figma, Procreate Classic and iOS Spectrum; RGB channels made "a lighter pink" a three-slider puzzle, and the
 * browser popup looked different on every OS. Swatches are round 44pt targets with a ring for the selection.
 */
export declare const colorPickerRecipe: {
    readonly colorSpace: "srgb";
    readonly background: "bg";
    readonly border: "border";
    readonly minTargetSize: 44;
    readonly area: {
        readonly aspectRatio: number;
        readonly thumbDiameter: 24;
        readonly thumbBorder: 3;
        readonly radius: "md";
    };
    readonly bar: {
        readonly height: 24;
        readonly thumbDiameter: 28;
        readonly thumbBorder: 3;
    };
    /** Area keyboard / accessibility step in percent. */
    readonly step: 1;
    readonly largeStep: 10;
    readonly swatch: {
        readonly target: 44;
        readonly diameter: 32;
        readonly ringWidth: 2;
        readonly ringGap: 2;
    };
    readonly preview: {
        readonly size: 44;
    };
};
//# sourceMappingURL=color-picker.d.ts.map