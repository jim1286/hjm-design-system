export declare function FixedGlyph({ children, tone, color, fontSize, lineHeight }: Readonly<{
    children: string;
    /** Same colors as HJM Text's primary/muted tones. */
    tone?: "primary" | "muted";
    /** Internal recipe-resolved color for tag states; never a public style escape hatch. */
    color?: string;
    /** Defaults to the 1x body size HJM Text used, so the glyph looks unchanged at 1x. */
    fontSize?: number;
    lineHeight?: number;
}>): import("react").JSX.Element;
//# sourceMappingURL=fixed-glyph.d.ts.map