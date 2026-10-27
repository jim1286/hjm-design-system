export const DRAWING_INK_COLORS = ['#333d4b', '#ffffff', '#e03131', '#f08c00', '#ffd43b', '#087f5b', '#3f66a5', '#7048e8', '#9c4668', '#f783ac', '#8d6e63', '#868e96'];
/** Default background. The person can change it; the chosen background is part of the saved photo. */
export const DRAWING_PAPER = '#fffaf2';
/** Background presets: the default paper, light tints that keep ink readable, and one dark ground for light ink. */
export const DRAWING_BACKGROUND_COLORS = ['#fffaf2', '#ffffff', '#f1f3f5', '#ffe3e3', '#ffdeeb', '#fff3bf', '#d3f9d8', '#c5f6fa', '#d0ebff', '#e5dbff', '#333d4b'];
export function drawingStrokeColor(stroke, background) {
    return stroke.erase ? background : stroke.color;
}
/** Something worth saving: an ink stroke, or a background other than the default paper. */
export function drawingHasContent(strokes, background) {
    return background !== DRAWING_PAPER || strokes.some(stroke => !stroke.erase);
}
export function drawingInkPath(stroke) {
    return stroke.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + (stroke.points.length === 1 ? ' l0.1,0.1' : '');
}
export const emptyDrawing = { past: [], present: [], future: [] };
/** A stroke, including an eraser, is one undo step. Clearing can also be undone. */
export function drawingReducer(state, action) {
    if (action.type === 'undo') {
        const previous = state.past.at(-1);
        return previous ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] } : state;
    }
    if (action.type === 'redo') {
        const next = state.future[0];
        return next ? { past: [...state.past, state.present], present: next, future: state.future.slice(1) } : state;
    }
    if (action.type === 'clear' && !state.present.length)
        return state;
    return { past: [...state.past, state.present], present: action.type === 'add' ? [...state.present, action.stroke] : [], future: [] };
}
/**
 * One-row colour strip for the drawing toolbar: colours the person picked from the full picker this session come
 * first (newest first, at most four), then the presets. Recent colours are not stored; the drawing itself is.
 */
export function drawingQuickColors(recent) {
    return [...new Set([...recent.slice(0, 4), ...DRAWING_INK_COLORS])];
}
/** Shared editor geometry; the 400px cap leaves tools visible on phone-sized hosts. */
export const drawingEditorRecipe = {
    maxCanvas: 400, minCanvas: 160, gap: 12, radius: 16, sizePreviewMs: 700,
    brush: { min: 2, max: 32, step: 2, initial: 12 },
};
//# sourceMappingURL=drawing-editor.js.map