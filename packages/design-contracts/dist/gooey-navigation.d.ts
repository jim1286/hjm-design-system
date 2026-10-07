export type TabsAppearance = "standard" | "slide" | "gooey";
export type GooeyIndicatorRect = Readonly<{
    x: number;
    width: number;
}>;
/** A product's explicit appearance wins; vertical tabs keep the canonical line.
 * Plain profile sliding is not an implicit request for elastic gooey stretching. */
export declare function resolveTabsAppearance(appearance: TabsAppearance | undefined, selectionMotion?: "none" | "slide", orientation?: "horizontal" | "vertical"): TabsAppearance;
/** Both renderers interpolate measured bounds without changing selection or panels. */
export declare function resolveTabIndicator(from: GooeyIndicatorRect, to: GooeyIndicatorRect, appearance: "slide" | "gooey"): {
    readonly duration: 320;
    readonly input: readonly [0, 0.45, 1];
    readonly x: readonly [number, number, number];
    readonly width: readonly [number, number, number];
} | {
    readonly duration: 200;
    readonly input: readonly [0, 1];
    readonly x: readonly [number, number];
    readonly width: readonly [number, number];
};
/** Capture the current JS-driver frame before cancellation so rapid input starts
 * where the indicator is visible, rather than jumping to the abandoned target. */
export declare function sampleTabIndicator(recipe: ReturnType<typeof resolveTabIndicator>, progress: number): GooeyIndicatorRect;
/** Stretch only the selected indicator; tab hit targets and text never move. */
export declare function resolveGooeyIndicator(from: GooeyIndicatorRect, to: GooeyIndicatorRect): {
    readonly duration: 320;
    readonly input: readonly [0, 0.45, 1];
    readonly x: readonly [number, number, number];
    readonly width: readonly [number, number, number];
};
//# sourceMappingURL=gooey-navigation.d.ts.map