import { expect, it } from "vitest";
import { resolveImageInspectionGeometry, type ImageInspectionMode } from "../src/image.js";

const image = { width: 600, height: 600 };
const viewport = { width: 402, height: 454 };
it("matches measured iOS fit, double and output-size pan boundaries", () => {
  expect(resolveImageInspectionGeometry(image, viewport, "fit")).toEqual({ scale: 0.67, width: 402, height: 402, panBounds: { x: 0, y: 0 } });
  expect(resolveImageInspectionGeometry(image, viewport, "double")).toEqual({ scale: 1.34, width: 804, height: 804, panBounds: { x: 201, y: 175 } });
  expect(resolveImageInspectionGeometry(image, viewport, "pixels")).toEqual({ scale: 1, width: 600, height: 600, panBounds: { x: 99, y: 73 } });
});
it("fits landscape and tall images using the remaining viewport, preserving aspect ratio", () => {
  const landscape = resolveImageInspectionGeometry(image, { width: 874, height: 218 }, "double");
  expect(landscape.height).toBe(436);
  expect(landscape.panBounds).toEqual({ x: 0, y: 109 });
  const tall = resolveImageInspectionGeometry({ width: 200, height: 1200 }, viewport, "double");
  expect(tall.height).toBe(908);
  expect(tall.width / tall.height).toBeCloseTo(1 / 6);
  expect(tall.panBounds).toEqual({ x: 0, y: 227 });
});
it("distinguishes fit upscaling from one output pixel per layout unit", () => {
  const small = { width: 100, height: 50 };
  expect(resolveImageInspectionGeometry(small, viewport, "fit").width).toBeCloseTo(402);
  expect(resolveImageInspectionGeometry(small, viewport, "pixels")).toEqual({ scale: 1, width: 100, height: 50, panBounds: { x: 0, y: 0 } });
});
it("rejects unmeasured, invalid and overflowed geometry instead of passing it to native layout", () => {
  for (const bad of [0, -1, NaN, Infinity]) {
    expect(() => resolveImageInspectionGeometry({ ...image, width: bad }, viewport, "fit")).toThrow(RangeError);
    expect(() => resolveImageInspectionGeometry(image, { ...viewport, height: bad }, "fit")).toThrow(RangeError);
  }
  expect(() => resolveImageInspectionGeometry(image, viewport, "unknown" as ImageInspectionMode)).toThrow(TypeError);
  expect(() => resolveImageInspectionGeometry({ width: 1, height: 1 }, { width: Number.MAX_VALUE, height: Number.MAX_VALUE }, "double")).toThrow(RangeError);
});
