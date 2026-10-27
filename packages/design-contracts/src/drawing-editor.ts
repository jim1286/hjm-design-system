export const DRAWING_INK_COLORS = ['#333d4b', '#ffffff', '#e03131', '#f08c00', '#ffd43b', '#087f5b', '#3f66a5', '#7048e8', '#9c4668', '#f783ac', '#8d6e63', '#868e96'] as const;
/** Default background. The person can change it; the chosen background is part of the saved photo. */
export const DRAWING_PAPER = '#fffaf2';
/** Background presets: the default paper, light tints that keep ink readable, and one dark ground for light ink. */
export const DRAWING_BACKGROUND_COLORS = ['#fffaf2', '#ffffff', '#f1f3f5', '#ffe3e3', '#ffdeeb', '#fff3bf', '#d3f9d8', '#c5f6fa', '#d0ebff', '#e5dbff', '#333d4b'] as const;
/**
 * An eraser stroke has no colour of its own: it paints whatever the background is when drawn, so changing the
 * background after erasing never leaves old-paper stripes (2026-10-25, background colour added).
 */
export type DrawingStroke = Readonly<{ width: number; points: readonly [number, number][] } & ({ color: string; erase?: never } | { erase: true; color?: never })>;
export function drawingStrokeColor(stroke: DrawingStroke, background: string): string {
  return stroke.erase ? background : stroke.color;
}
/** Something worth saving: an ink stroke, or a background other than the default paper. */
export function drawingHasContent(strokes: readonly DrawingStroke[], background: string): boolean {
  return background !== DRAWING_PAPER || strokes.some(stroke => !stroke.erase);
}
export function drawingInkPath(stroke: DrawingStroke): string {
  return stroke.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + (stroke.points.length === 1 ? ' l0.1,0.1' : '');
}

export type DrawingHistory = Readonly<{
  past: readonly (readonly DrawingStroke[])[];
  present: readonly DrawingStroke[];
  future: readonly (readonly DrawingStroke[])[];
}>;
export type DrawingAction = Readonly<{ type: 'add'; stroke: DrawingStroke }> | Readonly<{ type: 'undo' | 'redo' | 'clear' }>;
export const emptyDrawing: DrawingHistory = { past: [], present: [], future: [] };
/** A stroke, including an eraser, is one undo step. Clearing can also be undone. */
export function drawingReducer(state: DrawingHistory, action: DrawingAction): DrawingHistory {
  if (action.type === 'undo') {
    const previous = state.past.at(-1);
    return previous ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] } : state;
  }
  if (action.type === 'redo') {
    const next = state.future[0];
    return next ? { past: [...state.past, state.present], present: next, future: state.future.slice(1) } : state;
  }
  if (action.type === 'clear' && !state.present.length) return state;
  return { past: [...state.past, state.present], present: action.type === 'add' ? [...state.present, action.stroke] : [], future: [] };
}

/**
 * One-row colour strip for the drawing toolbar: colours the person picked from the full picker this session come
 * first (newest first, at most four), then the presets. Recent colours are not stored; the drawing itself is.
 */
export function drawingQuickColors(recent: readonly string[]): readonly string[] {
  return [...new Set([...recent.slice(0, 4), ...DRAWING_INK_COLORS])];
}

/** Shared editor geometry; the 400px cap leaves tools visible on phone-sized hosts. */
export const drawingEditorRecipe = {
  maxCanvas: 400, minCanvas: 160, gap: 12, radius: 16, sizePreviewMs: 700,
  brush: { min: 2, max: 32, step: 2, initial: 12 },
} as const;
export type DrawingImage = Readonly<{ base64: string; mimeType: 'image/png' | 'image/jpeg' }>;
export type DrawingEditorLabels = Readonly<{
  title: string; save: string; close: string; cancel: string; failed: string;
  pen: string; eraser: string; undo: string; redo: string; clear: string; width: string;
  moreColors: string; penColor: string; background: string; backgroundPresets: string;
  hex: string; hue: string; saturation: string; brightness: string; opacity: string; invalidColor: string;
  discardTitle: string; discardBody: string; discardConfirm: string;
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
