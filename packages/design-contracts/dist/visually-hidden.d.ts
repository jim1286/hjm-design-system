/**
 * A Web accessibility primitive. Native renderers should prefer the host
 * control's `accessibilityLabel`/`accessibilityHint` rather than mounting a
 * second invisible text node that can be announced out of order.
 */
export declare const visuallyHiddenRecipe: {
    readonly slots: readonly ["root"];
    readonly geometry: {
        readonly width: 1;
        readonly height: 1;
        readonly margin: -1;
        readonly border: 0;
        readonly padding: 0;
    };
    readonly clipping: "inset(50%)";
    readonly overflow: "hidden";
    readonly position: "absolute";
    readonly whiteSpace: "nowrap";
};
export type VisuallyHiddenContract = typeof visuallyHiddenRecipe;
//# sourceMappingURL=visually-hidden.d.ts.map