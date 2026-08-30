export type AspectRatioPreset = "square" | "portrait" | "landscape" | "wide";
export type AspectRatioValue = AspectRatioPreset | number;
export type AspectRatioDescriptor = Readonly<{
    ratio?: AspectRatioValue;
}>;
export type ResolvedAspectRatioDescriptor = Readonly<{
    ratio: number;
    source: AspectRatioPreset | "custom";
}>;
export declare const aspectRatioDefaults: {
    readonly ratio: "wide";
};
export declare const aspectRatioRecipe: {
    readonly slots: readonly ["root", "content"];
    readonly defaults: {
        readonly ratio: "wide";
    };
    readonly ratios: {
        readonly square: 1;
        readonly portrait: number;
        readonly landscape: number;
        readonly wide: number;
    };
    readonly sizing: {
        readonly inline: "fill";
        readonly block: "derive-from-ratio";
    };
};
export declare function validateAspectRatioValue(value: AspectRatioValue): void;
export declare function resolveAspectRatioDescriptor(descriptor?: AspectRatioDescriptor): ResolvedAspectRatioDescriptor;
//# sourceMappingURL=aspect-ratio.d.ts.map