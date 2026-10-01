/**
 * Geometry adapted from rit3zh/expo-dynamic-notifications, commit 5de059a5cbef.
 * The MIT notice is shipped in THIRD_PARTY_NOTICES.md. See docs/plans/liquid-toast.md.
 * Kept separate from the lifecycle: animation must never own a second queue.
 */
export declare const liquidToastRecipe: {
    readonly capsule: {
        readonly width: 32;
        readonly height: 32;
    };
    readonly gap: 26;
    readonly minHeight: 74;
    readonly maxWidth: 396;
    readonly radius: 12;
    readonly dropSize: 52;
    readonly neckWidth: 60;
    readonly blur: 14.3;
    readonly gain: 22;
    readonly threshold: 0.43;
    readonly spring: {
        readonly drop: {
            readonly duration: 1150;
            readonly dampingRatio: 0.82;
        };
        readonly expand: {
            readonly duration: 1000;
            readonly dampingRatio: 0.8;
        };
        readonly reveal: {
            readonly duration: 700;
            readonly dampingRatio: 1;
        };
        readonly tint: {
            readonly duration: 700;
            readonly dampingRatio: 1;
        };
        readonly collapse: {
            readonly duration: 660;
            readonly dampingRatio: 0.92;
            readonly velocity: 2;
        };
        readonly return: {
            readonly duration: 1150;
            readonly dampingRatio: 0.9;
        };
        readonly fade: {
            readonly duration: 360;
            readonly dampingRatio: 1;
        };
        readonly drag: {
            readonly duration: 560;
            readonly dampingRatio: 0.7;
        };
    };
    readonly delay: {
        readonly tint: 420;
        readonly expand: 340;
        readonly reveal: 560;
        readonly collapse: 100;
        readonly return: 280;
    };
    readonly swipe: {
        readonly distance: -18;
        readonly velocity: -420;
    };
};
/** Island frames are explicitly verified window coordinates, never inferred from insets. */
export type LiquidToastAnchor = Readonly<{
    kind: "capsule";
}> | Readonly<{
    kind: "island";
    frame: Readonly<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
}>;
export declare function validateLiquidToastAnchor(anchor: LiquidToastAnchor): void;
export type LiquidToastLayout = Readonly<{
    width: number;
    height: number;
    cardWidth: number;
    cardTop: number;
    cardLeft: number;
    anchorX: number;
    anchorY: number;
    anchorWidth: number;
    anchorHeight: number;
    canvasTop: number;
    canvasHeight: number;
    fits: boolean;
}>;
export declare function resolveLiquidToastLayout(input: Readonly<{
    width: number;
    height: number;
    availableHeight: number;
    anchor: LiquidToastAnchor;
    windowOrigin?: Readonly<{
        x: number;
        y: number;
    }>;
}>): LiquidToastLayout;
export declare function buildLiquidToastGeometry(drop: number, expand: number, layout: LiquidToastLayout): {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    neckX: number;
    neckY: number;
    neckWidth: number;
    neckHeight: number;
    offsetY: number;
};
//# sourceMappingURL=toast-liquid.d.ts.map