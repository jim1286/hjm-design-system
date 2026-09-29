/** sRGB hex is the interchange format; HSV/RGB editors can be added without changing stored values. */
export declare function normalizePickerColor(value: string, alpha?: boolean): string;
export declare function pickerOpacity(value: string): number;
export declare function withPickerOpacity(value: string, opacity: number): string;
export declare const colorPickerRecipe: {
    readonly colorSpace: "srgb";
    readonly background: "bg";
    readonly border: "border";
    readonly minTargetSize: 44;
};
//# sourceMappingURL=color-picker.d.ts.map