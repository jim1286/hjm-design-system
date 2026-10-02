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
//# sourceMappingURL=content-transition.d.ts.map