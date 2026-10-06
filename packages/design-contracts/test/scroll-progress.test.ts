import {expect,it} from 'vitest';
import {resolveScrollProgress as progress} from '../src/scroll-progress.js';
it('clamps overscroll and distinguishes fitting content from an unmeasured viewport',()=>{
 expect(progress({offset:50,contentSize:200,viewportSize:100})).toBe(.5);
 expect(progress({offset:-20,contentSize:200,viewportSize:100})).toBe(0);
 expect(progress({offset:500,contentSize:200,viewportSize:100})).toBe(1);
 expect(progress({offset:0,contentSize:20,viewportSize:100})).toBe(1);
 expect(progress({offset:0,contentSize:0,viewportSize:0})).toBe(0);
 expect(()=>progress({offset:NaN,contentSize:20,viewportSize:10})).toThrow();
});

import { resolveScrollEdges as edges } from '../src/scroll-progress.js';
it('removes the end hint for the observed final-row occlusion and fractional scroll offsets', () => {
 const metrics = { offset: 0, contentSize: 1784, viewportSize: 400 };
 expect(edges(metrics)).toEqual({ before: false, after: true });
 expect(edges({ ...metrics, offset: 692 })).toEqual({ before: true, after: true });
 expect(edges({ ...metrics, offset: 1384 })).toEqual({ before: true, after: false });
 expect(edges({ ...metrics, offset: 1383.5 })).toEqual({ before: true, after: false });
 expect(edges({ ...metrics, offset: 1382 })).toEqual({ before: true, after: true });
});
it('handles elastic overscroll without inventing content beyond either boundary', () => {
 expect(edges({ offset: -40, contentSize: 600, viewportSize: 400 })).toEqual({ before: false, after: true });
 expect(edges({ offset: 260, contentSize: 600, viewportSize: 400 })).toEqual({ before: true, after: false });
});
it('hides both hints before measurement and after fitting content replaces an overflowing list', () => {
 expect(edges({ offset: 0, contentSize: 1000, viewportSize: 0 })).toEqual({ before: false, after: false });
 expect(edges({ offset: 300, contentSize: 200, viewportSize: 400 })).toEqual({ before: false, after: false });
 expect(edges({ offset: 0, contentSize: 400.5, viewportSize: 400 })).toEqual({ before: false, after: false });
 expect(edges({ offset: 300, contentSize: 1200, viewportSize: 400 })).toEqual({ before: true, after: true });
});
it('rejects invalid host measurements for both progress and edge hints', () => {
 for (const metrics of [
  { offset: Infinity, contentSize: 100, viewportSize: 50 },
  { offset: 0, contentSize: -1, viewportSize: 50 },
  { offset: 0, contentSize: 100, viewportSize: -1 },
  { offset: 0, contentSize: 100, viewportSize: NaN },
 ]) {
  expect(() => edges(metrics)).toThrow(RangeError);
  expect(() => progress(metrics)).toThrow(RangeError);
 }
});
