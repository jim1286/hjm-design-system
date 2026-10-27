import { expect, it } from 'vitest';
import { emptyDrawing, drawingHasContent, drawingReducer as reduce, drawingStrokeColor, DRAWING_PAPER, type DrawingStroke } from '../src/drawing-editor.js';
const ink: DrawingStroke = { color: '#333d4b', width: 12, points: [[10, 10], [20, 20]] };
const eraser: DrawingStroke = { erase: true, width: 24, points: [[10, 10]] };
it('preserves each stroke width and makes erasing and clearing reversible', () => {
  const first = reduce(emptyDrawing, { type: 'add', stroke: ink });
  const erased = reduce(first, { type: 'add', stroke: eraser });
  expect(erased.present.map(stroke => stroke.width)).toEqual([12, 24]);
  const cleared = reduce(erased, { type: 'clear' });
  expect(cleared.present).toEqual([]);
  expect(reduce(cleared, { type: 'undo' }).present).toEqual(erased.present);
  expect(reduce(reduce(cleared, { type: 'undo' }), { type: 'redo' }).present).toEqual([]);
});
it('discards the redo branch when drawing after undo', () => {
  const first = reduce(emptyDrawing, { type: 'add', stroke: ink });
  const undone = reduce(first, { type: 'undo' });
  const changed = reduce(undone, { type: 'add', stroke: { ...ink, color: '#f00' } });
  expect(changed.future).toEqual([]);
  expect(reduce(changed, { type: 'redo' })).toBe(changed);
});
it('paints erasers with the current background and counts a changed background as content', () => {
  expect(drawingStrokeColor(eraser, '#d0ebff')).toBe('#d0ebff');
  expect(drawingStrokeColor(ink, '#d0ebff')).toBe('#333d4b');
  expect(drawingHasContent([eraser], DRAWING_PAPER)).toBe(false);
  expect(drawingHasContent([eraser], '#d0ebff')).toBe(true);
  expect(drawingHasContent([ink], DRAWING_PAPER)).toBe(true);
});
