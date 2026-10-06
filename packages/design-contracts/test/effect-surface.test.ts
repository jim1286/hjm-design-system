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

it("keeps the raster mask opt-in and deterministic while all four layers compose", () => {
  expect(resolveEffectSurface().noise).toBeUndefined();
  const a = resolveEffectSurface({ layers: ["mesh", "glow", "grain", "noise"], seed: "a" }).noise!;
  const b = resolveEffectSurface({ layers: ["noise"], seed: "b" }).noise!;
  expect(a.uri).toBe(b.uri);
  expect(a.offset).not.toBe(b.offset);
  const png = Buffer.from(a.uri.split(",")[1]!, "base64");
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect(png.readUInt32BE(16)).toBe(64);
  expect(png.readUInt32BE(20)).toBe(64);
});
