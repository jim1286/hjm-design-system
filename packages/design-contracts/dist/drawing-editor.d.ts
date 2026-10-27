export declare const DRAWING_INK_COLORS: readonly ["#333d4b", "#ffffff", "#e03131", "#f08c00", "#ffd43b", "#087f5b", "#3f66a5", "#7048e8", "#9c4668", "#f783ac", "#8d6e63", "#868e96"];
/** Default background. The person can change it; the chosen background is part of the saved photo. */
export declare const DRAWING_PAPER = "#fffaf2";
/** Background presets: the default paper, light tints that keep ink readable, and one dark ground for light ink. */
export declare const DRAWING_BACKGROUND_COLORS: readonly ["#fffaf2", "#ffffff", "#f1f3f5", "#ffe3e3", "#ffdeeb", "#fff3bf", "#d3f9d8", "#c5f6fa", "#d0ebff", "#e5dbff", "#333d4b"];
/**
 * An eraser stroke has no colour of its own: it paints whatever the background is when drawn, so changing the
 * background after erasing never leaves old-paper stripes (2026-10-25, background colour added).
 */
export type DrawingStroke = Readonly<{
    width: number;
    points: readonly [number, number][];
} & ({
    color: string;
    erase?: never;
} | {
    erase: true;
    color?: never;
})>;
export declare function drawingStrokeColor(stroke: DrawingStroke, background: string): string;
/** Something worth saving: an ink stroke, or a background other than the default paper. */
export declare function drawingHasContent(strokes: readonly DrawingStroke[], background: string): boolean;
export declare function drawingInkPath(stroke: DrawingStroke): string;
export type DrawingHistory = Readonly<{
    past: readonly (readonly DrawingStroke[])[];
    present: readonly DrawingStroke[];
    future: readonly (readonly DrawingStroke[])[];
}>;
export type DrawingAction = Readonly<{
    type: 'add';
    stroke: DrawingStroke;
}> | Readonly<{
    type: 'undo' | 'redo' | 'clear';
}>;
export declare const emptyDrawing: DrawingHistory;
/** A stroke, including an eraser, is one undo step. Clearing can also be undone. */
export declare function drawingReducer(state: DrawingHistory, action: DrawingAction): DrawingHistory;
/**
 * One-row colour strip for the drawing toolbar: colours the person picked from the full picker this session come
 * first (newest first, at most four), then the presets. Recent colours are not stored; the drawing itself is.
 */
export declare function drawingQuickColors(recent: readonly string[]): readonly string[];
/** Shared editor geometry; the 400px cap leaves tools visible on phone-sized hosts. */
export declare const drawingEditorRecipe: {
    readonly maxCanvas: 400;
    readonly minCanvas: 160;
    readonly gap: 12;
    readonly radius: 16;
    readonly sizePreviewMs: 700;
    readonly brush: {
        readonly min: 2;
        readonly max: 32;
        readonly step: 2;
        readonly initial: 12;
    };
};
export type DrawingImage = Readonly<{
    base64: string;
    mimeType: 'image/png' | 'image/jpeg';
}>;
export type DrawingEditorLabels = Readonly<{
    title: string;
    save: string;
    close: string;
    cancel: string;
    failed: string;
    pen: string;
    eraser: string;
    undo: string;
    redo: string;
    clear: string;
    width: string;
    moreColors: string;
    penColor: string;
    background: string;
    backgroundPresets: string;
    hex: string;
    hue: string;
    saturation: string;
    brightness: string;
    opacity: string;
    invalidColor: string;
    discardTitle: string;
    discardBody: string;
    discardConfirm: string;
}>;
/** Upload, account identity and navigation stay in the product. Reject on failure to retain the drawing. */
export type DrawingEditorProps = Readonly<{
    labels: DrawingEditorLabels;
    onSave(image: DrawingImage): Promise<void>;
    onCancel(): void;
    cropPreview?: 'circle' | 'none';
    safeAreaBottom?: number;
    testID?: string;
}>;
//# sourceMappingURL=drawing-editor.d.ts.map