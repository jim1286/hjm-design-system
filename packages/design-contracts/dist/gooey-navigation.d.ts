export type TabsAppearance = "standard" | "gooey";
export type GooeyIndicatorRect = Readonly<{
    x: number;
    width: number;
}>;
/** Stretch only the selected indicator; tab hit targets and text never move. */
export declare function resolveGooeyIndicator(from: GooeyIndicatorRect, to: GooeyIndicatorRect): {
    readonly duration: 320;
    readonly input: readonly [0, 0.45, 1];
    readonly x: readonly [number, number, number];
    readonly width: readonly [number, number, number];
};
//# sourceMappingURL=gooey-navigation.d.ts.map