export declare const progressRecipe: {
    readonly slots: readonly ["root", "track", "indicator", "label", "value"];
    readonly defaults: {
        readonly size: "medium";
        readonly tone: "brand";
        readonly shape: "linear";
    };
    readonly sizes: {
        readonly small: 4;
        readonly medium: 8;
        readonly large: 12;
    };
    readonly circular: {
        readonly sizes: {
            readonly small: 24;
            readonly medium: 40;
            readonly large: 64;
        };
        readonly strokeWidth: {
            readonly small: 3;
            readonly medium: 4;
            readonly large: 6;
        };
    };
    readonly tones: {
        readonly brand: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly success: Readonly<{
            source: "accent";
            key: "success";
            alpha?: number;
        }>;
        readonly warning: Readonly<{
            source: "accent";
            key: "warning";
            alpha?: number;
        }>;
        readonly danger: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
    };
    readonly track: Readonly<{
        source: "theme";
        key: "surfaceAlt";
        alpha?: number;
    }>;
    readonly radius: "full";
};
export type ProgressSize = keyof typeof progressRecipe.sizes;
export type ProgressTone = keyof typeof progressRecipe.tones;
export type ProgressShape = "linear" | "circular";
//# sourceMappingURL=progress-recipe.d.ts.map