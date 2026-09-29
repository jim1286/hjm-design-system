export declare const watermarkRecipe: {
    readonly tileWidth: 240;
    readonly tileHeight: 160;
    readonly rotate: -22;
    readonly opacity: 0.12;
    readonly foreground: "textSub";
};
export declare function resolveWatermark(text: string | readonly string[], width?: number, height?: number, rotate?: number, opacity?: number): {
    lines: string[];
    width: number;
    height: number;
    rotate: number;
    opacity: number;
};
//# sourceMappingURL=watermark.d.ts.map