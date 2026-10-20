import { expect, it } from "vitest";
import { resolveNativeMenuPosition } from "../src/internal/menu-position.js";

it("flips above a bottom row and clamps the trailing edge inside a narrow viewport", () => {
  const viewport = { width: 320, height: 600, top: 44, bottom: 34, left: 0, right: 0 };
  const result = resolveNativeMenuPosition({ x: 290, y: 510, width: 24, height: 32 }, viewport, 160, "ltr", 280);
  expect(result.placement).toBe("top");
  expect(result.top + 160).toBeLessThan(510);
  expect(result.left + result.width).toBeLessThanOrEqual(312);
  expect(result.top).toBeGreaterThanOrEqual(52);
});

it("uses logical end alignment in RTL and constrains long menus to the larger available side", () => {
  const viewport = { width: 600, height: 400, top: 20, bottom: 20, left: 0, right: 0 };
  const result = resolveNativeMenuPosition({ x: 36, y: 100, width: 44, height: 44 }, viewport, 700, "rtl", 280);
  expect(result.left).toBe(36);
  expect(result.placement).toBe("bottom");
  expect(result.top + result.maxHeight).toBeLessThanOrEqual(372);
});
