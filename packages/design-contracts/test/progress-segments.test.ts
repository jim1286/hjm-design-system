import { expect, it } from 'vitest';
import { resolveProgressSegments } from '../src/progress-recipe.js';
it('fills real fractional units, including zero and completion, without rounding up', () => {
  expect(resolveProgressSegments(0, 5, 5, 'linear')).toEqual([0,0,0,0,0]);
  expect(resolveProgressSegments(2.5, 5, 5, 'linear')).toEqual([1,1,.5,0,0]);
  expect(resolveProgressSegments(5, 5, 5, 'linear')).toEqual([1,1,1,1,1]);
  expect(resolveProgressSegments(undefined, 5, undefined, 'linear')).toBeUndefined();
});
it('rejects ambiguous, invalid and non-linear segment inputs', () => {
  for (const count of [0, 1, 2.5, Infinity, NaN]) expect(() => resolveProgressSegments(1,5,count,'linear')).toThrow(RangeError);
  expect(() => resolveProgressSegments(undefined,5,5,'linear')).toThrow(TypeError);
  expect(() => resolveProgressSegments(1,5,5,'circular')).toThrow(TypeError);
  expect(() => resolveProgressSegments(6,5,5,'linear')).toThrow(RangeError);
});
