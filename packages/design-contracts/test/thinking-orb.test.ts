import { MODE_FRAMES } from "../src/internal/thinking-orb/registry.js";
import { resolvePreset } from "../src/internal/thinking-orb/presets.js";
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { buildThinkingOrbFrame, createThinkingOrbClock, validateThinkingOrb, type OrbState, type OrbSize } from "../src/thinking-orb.js";
const golden = JSON.parse(readFileSync(new URL("./fixtures/thinking-orb-golden.json", import.meta.url), "utf8")) as {
  tolerance: number; resolved: Record<string, { speed: number }>;
  cases: { key: string; state: OrbState; size: OrbSize; t: number; dots: number[]; lines: number[] }[];
};
describe("ThinkingOrb upstream geometry parity", () => {
  it.each(golden.cases)("$key", c => {
    // Compare at exact upstream engine time: dividing/multiplying time can reorder equal-depth dots.
    const preset = resolvePreset(c.state, c.size);
    const frame = MODE_FRAMES[preset.mode](c.size, c.t, preset.opts);
    const dots = frame.dots.flatMap(d => [d.x, d.y, d.z, d.r, d.white, d.a ?? 1]);
    const lines = frame.lines.flatMap(l => [l.x1, l.y1, l.x2, l.y2, l.white, l.a ?? 1, l.w]);
    expect(dots.length).toBe(c.dots.length); expect(lines.length).toBe(c.lines.length);
    expect(Math.max(0, ...dots.map((v, i) => Math.abs(v - c.dots[i]!)))).toBeLessThan(golden.tolerance);
    expect(Math.max(0, ...lines.map((v, i) => Math.abs(v - c.lines[i]!)))).toBeLessThan(golden.tolerance);
  });
  it("freezes through inactivity and caps a stalled frame", () => {
    const clock = createThinkingOrbClock(); clock.sample(100, 1); expect(clock.sample(116, 1)).toBe(0.016);
    clock.resetDelta(); expect(clock.sample(9000, 1)).toBe(0.016);
    expect(clock.sample(19000, 1)).toBe(0.08);
  });
  it("rejects unsafe animation parameters and empty labels", () => {
    for (const speed of [NaN, Infinity, -1, 0, 5]) expect(() => validateThinkingOrb({ label: "검색", speed })).toThrow();
    expect(() => validateThinkingOrb({ label: " " })).toThrow();
    expect(() => buildThinkingOrbFrame("working", 64, -1)).toThrow();
  });
});


describe("ThinkingOrb independent presentations", () => {
  it.each(["fluid", "matrix"] as const)("keeps %s geometry deterministic, bounded and animated", appearance => {
    for (const size of [20, 64] as const) {
      const first = buildThinkingOrbFrame("working", size, 0, appearance);
      expect(first).toEqual(buildThinkingOrbFrame("working", size, 0, appearance));
      expect(first).not.toEqual(buildThinkingOrbFrame("working", size, 1, appearance));
      expect(first.dots.length).toBe(appearance === "fluid" ? 192 : 49);
      for (const time of [0, 0.6, 1, 1000]) {
        for (const dot of buildThinkingOrbFrame("working", size, time, appearance).dots) {
          expect(Object.values(dot).every(Number.isFinite)).toBe(true);
          expect(dot.x - dot.r).toBeGreaterThanOrEqual(0);
          expect(dot.y - dot.r).toBeGreaterThanOrEqual(0);
          expect(dot.x + dot.r).toBeLessThanOrEqual(size);
          expect(dot.y + dot.r).toBeLessThanOrEqual(size);
          expect(dot.white).toBeGreaterThanOrEqual(0);
          expect(dot.white).toBeLessThanOrEqual(1);
        }
      }
    }
  });
  it("preserves the default state geometry", () => {
    expect(buildThinkingOrbFrame("working", 64, 1)).toEqual(buildThinkingOrbFrame("working", 64, 1, "state"));
  });
});
