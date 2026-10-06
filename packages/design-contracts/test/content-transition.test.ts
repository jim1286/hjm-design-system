import { expect, it } from "vitest";
import { resolveContentTransition, resolveOriginTransition, type TransitionRect } from "../src/content-transition.js";
it("mirrors only inline travel and preserves the final content geometry", () => {
  expect(resolveContentTransition("slide", "rtl").translateX).toBe(-resolveContentTransition("slide", "ltr").translateX);
  expect(resolveContentTransition("rise", "rtl")).toEqual(resolveContentTransition("rise", "ltr"));
  expect(resolveContentTransition().scale).toBe(1);
});

it("rejects unknown presets instead of silently changing presentation", () => {
  expect(() => resolveContentTransition("unknown" as never)).toThrow(TypeError);
});


it("maps the destination corners onto a measured trigger around the destination center", () => {
  const origin = { x: 28, y: 72, width: 120, height: 44 };
  const destination = { x: 400, y: 150, width: 480, height: 360 };
  const transform = resolveOriginTransition(origin, destination)!;
  const center = { x: destination.x + destination.width / 2, y: destination.y + destination.height / 2 };
  // Verify geometry, rather than reproducing the resolver's center-difference expression.
  for (const [u, v] of [[0, 0], [1, 1], [0.5, 0.5]]) {
    expect(center.x + (u! - 0.5) * destination.width * transform.scaleX + transform.translateX).toBeCloseTo(origin.x + u! * origin.width);
    expect(center.y + (v! - 0.5) * destination.height * transform.scaleY + transform.translateY).toBeCloseTo(origin.y + v! * origin.height);
  }
});

it("uses physical geometry without mirroring RTL twice and tolerates a shared viewport offset", () => {
  const origin = { x: 720.5, y: -12.25, width: 100.5, height: 40 };
  const destination = { x: 200, y: 100, width: 400, height: 300 };
  const shift = (rect: TransitionRect) => ({ ...rect, x: rect.x - 40, y: rect.y + 200 });
  expect(resolveOriginTransition(shift(origin), shift(destination))).toEqual(resolveOriginTransition(origin, destination));
  expect(resolveOriginTransition(origin, origin)).toEqual({ translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 });
});

it("falls back for reduced motion, absent, empty, invalid or overflowing measurements", () => {
  const rect = { x: 0, y: 0, width: 100, height: 100 };
  expect(resolveOriginTransition(rect, rect, true)).toBeNull();
  for (const invalid of [null, undefined, { ...rect, width: 0 }, { ...rect, height: -1 }, { ...rect, x: NaN }, { ...rect, y: Infinity }]) {
    expect(resolveOriginTransition(invalid, rect)).toBeNull();
    expect(resolveOriginTransition(rect, invalid)).toBeNull();
  }
  expect(resolveOriginTransition({ ...rect, width: Number.MAX_VALUE }, { ...rect, width: Number.MIN_VALUE })).toBeNull();
  expect(resolveOriginTransition({ ...rect, width: Number.MIN_VALUE }, { ...rect, width: Number.MAX_VALUE })).toBeNull();
});
