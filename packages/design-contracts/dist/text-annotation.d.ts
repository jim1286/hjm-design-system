/**
 * Experimental drawing geometry, not a public TextFormat variant. A renderer
 * supplies measured visual line rectangles; estimating widths from character
 * counts would break proportional fonts, Korean wrapping, and bidirectional text.
 * See docs/text-annotation.md for the unfinished renderer boundary.
 */
export declare const textAnnotationActions: readonly ["highlight", "underline", "box", "circle", "strike-through", "crossed-off", "bracket"];
export type TextAnnotationAction = typeof textAnnotationActions[number];
export type TextAnnotationRect = Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
}>;
export type TextAnnotationPath = Readonly<{
    d: string;
    /** Filled marker strokes belong behind the text; outlines are unfilled. */
    paint: 'fill' | 'stroke';
    strokeWidth: number;
    lineIndex: number;
}>;
export type TextAnnotationGeometry = Readonly<{
    paths: readonly TextAnnotationPath[];
    bounds: TextAnnotationRect | null;
}>;
/**
 * Small deterministic offsets give the two passes a hand-drawn character.
 * Random-per-render geometry was rejected: unrelated state updates must not
 * make the annotation jump or create server/client output differences.
 */
export declare function resolveTextAnnotationGeometry(lines: readonly TextAnnotationRect[], action: TextAnnotationAction, options?: Readonly<{
    strokeWidth?: number;
    padding?: number;
}>): TextAnnotationGeometry;
//# sourceMappingURL=text-annotation.d.ts.map