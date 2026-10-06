import { expect, it } from 'vitest';
import { resolveProgressiveBlur as resolve, type ProgressiveBlurDescriptor } from '../src/progressive-blur.js';
const base: ProgressiveBlurDescriptor = { edge: 'bottom', extent: 64, strength: 0.5, content: { kind: 'scroll', metrics: { offset: 0, contentSize: 1784, viewportSize: 400 }, focused: false } };
it('uncovers the last row at the actual end and suppresses decoration around focused content', () => {
 expect(resolve(base).visible).toBe(true);
 expect(resolve({ ...base, content: { kind: 'scroll', metrics: { offset: 1384, contentSize: 1784, viewportSize: 400 }, focused: false } }).visible).toBe(false);
 expect(resolve({ ...base, content: { ...base.content, kind: 'scroll', metrics: { offset: 300, contentSize: 1784, viewportSize: 400 }, focused: true } }).visible).toBe(false);
});
it('maps logical edges without changing scroll-direction ownership in RTL', () => {
 expect(resolve({ ...base, edge: 'start', content: { kind: 'decoration' } }, 'rtl').side).toBe('right');
 expect(resolve({ ...base, edge: 'end', content: { kind: 'decoration' } }, 'rtl').side).toBe('left');
 expect(resolve({ ...base, edge: 'start', content: { kind: 'decoration' } }, 'ltr').side).toBe('left');
});
it('keeps zero strength and an unmeasured or fitting list clear', () => {
 expect(resolve({ ...base, strength: 0 }).visible).toBe(false);
 for (const viewportSize of [0, 2000]) expect(resolve({ ...base, content: { kind: 'scroll', metrics: { offset: 0, contentSize: 1784, viewportSize }, focused: false } }).visible).toBe(false);
});
it('bounds the expensive layer host and rejects invalid geometry before rendering', () => {
 for (const patch of [{ layers: 1 }, { layers: 9 }, { layers: 2.5 }, { extent: Infinity }, { extent: 0 }, { strength: NaN }, { strength: 2 }]) expect(() => resolve({ ...base, ...patch })).toThrow(RangeError);
 expect(resolve({ ...base, layers: 2 }).layers).toHaveLength(2);
 expect(resolve({ ...base, layers: 8 }).layers).toHaveLength(8);
});
