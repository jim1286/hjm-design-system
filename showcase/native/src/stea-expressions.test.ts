import { describe, expect, it } from "vitest";
import { pixelFrameRuns, pixelFrames, pixelGridSize, pixelRuns, pixelStillFrame } from "../../shared/stea-expressions";

describe("pixel character frames", () => {
  it("keeps every frame on the square grid", () => {
    for (const frame of pixelFrames) {
      expect(frame).toHaveLength(pixelGridSize);
      for (const row of frame) expect(row).toHaveLength(pixelGridSize);
    }
    expect(pixelFrames[pixelStillFrame]).toBeDefined();
  });

  it("merges runs without losing or inventing pixels", () => {
    pixelFrames.forEach((frame, index) => {
      const painted = frame.join("").replaceAll(".", "").length;
      const covered = pixelFrameRuns[index]!.reduce((sum, run) => sum + run.width, 0);
      expect(covered).toBe(painted);
    });
    expect(pixelRuns(["obbo"])).toEqual([
      { x: 0, y: 0, width: 1, ink: "outline" },
      { x: 1, y: 0, width: 2, ink: "body" },
      { x: 3, y: 0, width: 1, ink: "outline" },
    ]);
  });

  it("actually moves between frames so the loop is not a static image", () => {
    const distinct = new Set(pixelFrames.map(frame => frame.join("\n")));
    expect(distinct.size).toBeGreaterThan(1);
  });
});
