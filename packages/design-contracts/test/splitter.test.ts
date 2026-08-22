import { describe, expect, it } from "vitest";
import {
  getNextSplitterValue,
  resolveSplitterBoundaryValue,
  resolveSplitterDragValue,
  resolveSplitterSeparatorOrientation,
  splitterBehavior,
  splitterDefaults,
  splitterRecipe,
  validateSplitterDescriptor,
  type SplitterDescriptor,
} from "../src/splitter.js";

function descriptor(overrides: Partial<SplitterDescriptor> = {}): SplitterDescriptor {
  return { value: 0.5, min: 0.2, max: 0.8, step: 0.05, label: "패널 크기 조절", ...overrides };
}

describe("Splitter descriptor validation", () => {
  it("reuses NumberField's range judgment for min/max/step", () => {
    expect(() => validateSplitterDescriptor(descriptor({ min: 0.8, max: 0.2 }))).toThrow();
    expect(() => validateSplitterDescriptor(descriptor({ step: 0 }))).toThrow();
  });

  it("rejects a value outside the range", () => {
    expect(() => validateSplitterDescriptor(descriptor({ value: 0.1 }))).toThrow(/within min and max/);
    expect(() => validateSplitterDescriptor(descriptor({ value: 0.9 }))).toThrow(/within min and max/);
  });

  it("rejects an unsupported axis and an empty label or valueText", () => {
    expect(() => validateSplitterDescriptor(descriptor({ axis: "diagonal" as never }))).toThrow(
      /axis/,
    );
    expect(() => validateSplitterDescriptor(descriptor({ label: " " }))).toThrow(/label/);
    expect(() => validateSplitterDescriptor(descriptor({ valueText: " " }))).toThrow(/valueText/);
  });

  it("defaults to a horizontal axis", () => {
    expect(splitterDefaults.axis).toBe("horizontal");
  });
});

describe("resolveSplitterSeparatorOrientation", () => {
  it("is perpendicular to the splitter axis, not equal to it", () => {
    expect(resolveSplitterSeparatorOrientation("horizontal")).toBe("vertical");
    expect(resolveSplitterSeparatorOrientation("vertical")).toBe("horizontal");
  });
});

describe("Splitter value resolution", () => {
  it("steps like NumberField's stepper and clamps at the boundary", () => {
    expect(getNextSplitterValue(descriptor(), "increment")).toBeCloseTo(0.55);
    expect(getNextSplitterValue(descriptor(), "decrement")).toBeCloseTo(0.45);
    expect(getNextSplitterValue(descriptor({ value: 0.8 }), "increment")).toBeCloseTo(0.8);
  });

  it("snaps a raw drag position to the same step grid keyboard uses", () => {
    expect(resolveSplitterDragValue(descriptor(), 0.53)).toBeCloseTo(0.55);
    expect(resolveSplitterDragValue(descriptor(), 0.9)).toBeCloseTo(0.8);
  });

  it("jumps to the exact boundary for Home/End", () => {
    expect(resolveSplitterBoundaryValue(descriptor(), "min")).toBe(0.2);
    expect(resolveSplitterBoundaryValue(descriptor(), "max")).toBe(0.8);
  });
});

describe("Splitter visual and behavior contract", () => {
  it("keeps a thin visible line but a touch-safe hit target", () => {
    expect(splitterRecipe.separator.thickness).toBeLessThan(splitterRecipe.separator.hitTarget);
    expect(splitterRecipe.separator.hitTarget).toBeGreaterThanOrEqual(44);
  });

  it("declares no native surface for this web-only component", () => {
    expect(splitterBehavior.native).toEqual({ roles: [], states: [], actions: [] });
  });

  it("exposes only single-separator keyboard steps, no page-jump keys", () => {
    expect(splitterBehavior.web.keyboard).toEqual([
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ]);
  });
});
