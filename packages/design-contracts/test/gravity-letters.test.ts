import { expect, it } from "vitest";
import { resolveGravityLetters } from "../src/gravity-letters.js";
it("preserves host graphemes and bounds decorative cost", () => {
  expect(resolveGravityLetters(["👨‍👩‍👦", "한", " "]).map(unit => unit.glyph)).toEqual(["👨‍👩‍👦", "한", " "]);
  expect(() => resolveGravityLetters(Array(33).fill("A"))).toThrow(RangeError);
  expect(() => resolveGravityLetters([""])).toThrow(RangeError);
  expect(resolveGravityLetters([])).toEqual([]);
});
