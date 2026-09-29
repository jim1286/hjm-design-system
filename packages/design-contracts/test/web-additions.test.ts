import { expect, it } from "vitest";
import { normalizePickerColor, pickerOpacity, withPickerOpacity } from "../src/color-picker.js";
import { resolveWatermark } from "../src/watermark.js";
import { validateAffixOffset } from "../src/affix.js";
it("normalizes shorthand sRGB without silently dropping transparency", () => {
  expect(normalizePickerColor(" #ABC ")).toBe("#aabbcc");
  expect(normalizePickerColor("#abc8", true)).toBe("#aabbcc88");
  expect(normalizePickerColor("aabbccff")).toBe("#aabbcc");
  expect(normalizePickerColor("#123456", true)).toBe("#123456ff");
  for (const value of ["red", "#12", "#12345", "#ggg", "#11223380"]) expect(() => normalizePickerColor(value)).toThrow();
});
it("round-trips integer opacity percentages without changing RGB", () => {
  for (let percent = 0; percent <= 100; percent++) {
    const color = withPickerOpacity("#c45a21", percent);
    expect(color.slice(0, 7)).toBe("#c45a21");
    expect(pickerOpacity(color)).toBe(percent);
  }
  for (const value of [NaN, Infinity, -1, 101]) expect(() => withPickerOpacity("#fff", value)).toThrow();
});
it("bounds decorative geometry and rejects empty or unbounded watermark input", () => {
  expect(resolveWatermark(["DRAFT", "2026"])).toMatchObject({ lines: ["DRAFT", "2026"], width: 240, opacity: 0.12 });
  for (const value of [[], [""], ["x".repeat(121)], ["a", "b", "c", "d"]]) expect(() => resolveWatermark(value)).toThrow();
  expect(() => resolveWatermark("DRAFT", 0)).toThrow();
  expect(() => resolveWatermark("DRAFT", 240, 160, NaN)).toThrow();
  expect(() => resolveWatermark("DRAFT", 240, 160, 0, 1.1)).toThrow();
});
it("rejects invalid sticky offsets instead of emitting unusable CSS", () => {
  expect(validateAffixOffset(12.5)).toBe(12.5);
  for (const value of [-1, NaN, Infinity]) expect(() => validateAffixOffset(value)).toThrow();
});
