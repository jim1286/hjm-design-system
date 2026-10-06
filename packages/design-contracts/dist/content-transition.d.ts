export type ContentTransitionPreset = "fade" | "rise" | "slide" | "scale";
/** Small local travel preserves context; these are presentation values, never
 * gesture activation thresholds. Retain the existing geometry for compatibility. */
export declare const contentTransitionMotion: {
    readonly rise: 12;
    readonly slide: 16;
    readonly scale: 0.96;
};
/** Bounded travel keeps decorative motion close to the destination.
 * Single-subtree recipes: preserve wrapping, focus and accessible content. */
export declare function resolveContentTransition(preset?: ContentTransitionPreset, direction?: "ltr" | "rtl"): {
    opacity: number;
    translateX: number;
    translateY: number;
    scale: number;
};
/** Both rectangles must be measured in the same physical viewport coordinates.
 * Router shared-element IDs are not a substitute for a local overlay's geometry. */
export type TransitionRect = Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
}>;
/** Invert the destination around its center so it starts at the trigger bounds.
 * A renderer interpolates this transform to identity and owns cancellation,
 * measurement freshness, presence and focus; this resolver never clones content. */
export declare function resolveOriginTransition(origin: TransitionRect | null | undefined, destination: TransitionRect | null | undefined, reducedMotion?: boolean): Readonly<{
    translateX: number;
    translateY: number;
    scaleX: number;
    scaleY: number;
}> | null;
//# sourceMappingURL=content-transition.d.ts.map