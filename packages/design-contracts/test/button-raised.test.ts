import { expect, it } from "vitest";
import { resolveButtonDepth } from "../src/base-recipes.js";
import { defineHjmDesignProfile } from "../src/design-profile.js";
it('resolves one depth for both hosts while leaving frameless actions flat', () => {
  expect(resolveButtonDepth('raised', 'primary', 'medium')).toBe(4);
  expect(resolveButtonDepth('flat', 'primary', 'medium')).toBe(0);
  expect(resolveButtonDepth('raised', 'ghost', 'large')).toBe(0);
  expect(resolveButtonDepth('raised', 'link', 'small')).toBe(0);
  expect(() => resolveButtonDepth('unknown' as never, 'primary', 'medium')).toThrow();
});
it('normalizes brand button defaults without freezing or changing caller data', () => {
  const input = { controls: { button: { appearance: 'raised' as const } } };
  const profile = defineHjmDesignProfile(input);
  expect(profile.controls?.button).toEqual({ appearance: 'raised', shape: 'rounded' });
  expect(Object.isFrozen(input.controls.button)).toBe(false);
  expect(defineHjmDesignProfile().controls).toBeUndefined();
});
it('rejects unsupported control defaults', () => {
  expect(() => defineHjmDesignProfile({ controls: { button: { shape: 'square' as never } } })).toThrow();
  expect(() => defineHjmDesignProfile({ controls: { button: { appearance: 'paper' as never } } })).toThrow();
});
