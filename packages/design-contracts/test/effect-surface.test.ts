import { expect, it } from "vitest";
import { resolveEffectSurface } from "../src/effect-surface.js";
it("produces stable geometry per seed and keeps motion opt-in", () => {
  expect(resolveEffectSurface({ seed: "a" })).toEqual(resolveEffectSurface({ seed: "a" }));
  expect(resolveEffectSurface({ seed: "b" }).anchors).not.toEqual(resolveEffectSurface({ seed: "a" }).anchors);
  expect(resolveEffectSurface().active).toBe(false);
});
it("rejects duplicate layers and unbounded animation inputs", () => {
  for (const descriptor of [{ layers: ["mesh", "mesh"] as const }, { period: 0 }, { period: Infinity }, { intensity: -1 }, { seed: "" }]) expect(() => resolveEffectSurface(descriptor)).toThrow();
});
