import { describe, expect, it } from "vitest";
import {
  emptyDateRange,
  isCompleteDateRange,
  resolveDateRangeCellState,
  resolveDateRangeSelection,
  validateDateRange,
} from "../src/date-range.js";

describe("DateRange", () => {
  it("starts a range, completes it, and starts over on the next click", () => {
    const first = resolveDateRangeSelection(emptyDateRange, "2026-09-10");
    expect(first).toEqual({ start: "2026-09-10", end: null });
    const complete = resolveDateRangeSelection(first, "2026-09-14");
    expect(complete).toEqual({ start: "2026-09-10", end: "2026-09-14" });
    // Clicking a finished range restarts instead of guessing which end to move.
    expect(resolveDateRangeSelection(complete, "2026-09-20")).toEqual({ start: "2026-09-20", end: null });
  });

  it("swaps instead of rejecting when the second pick is earlier", () => {
    const selecting = { start: "2026-09-14", end: null };
    expect(resolveDateRangeSelection(selecting, "2026-09-10")).toEqual({ start: "2026-09-10", end: "2026-09-14" });
  });

  it("treats start-without-end as the selecting state and rejects the impossible one", () => {
    expect(isCompleteDateRange({ start: "2026-09-10", end: null })).toBe(false);
    expect(isCompleteDateRange({ start: "2026-09-10", end: "2026-09-11" })).toBe(true);
    expect(() => validateDateRange({ start: null, end: "2026-09-11" })).toThrow(/end without a start/);
    expect(() => validateDateRange({ start: "2026-09-11", end: "2026-09-10" })).toThrow(RangeError);
  });

  it("paints cells and previews the hovered end through one function", () => {
    const range = { start: "2026-09-10", end: "2026-09-13" };
    expect(resolveDateRangeCellState(range, "2026-09-10")).toBe("start");
    expect(resolveDateRangeCellState(range, "2026-09-11")).toBe("between");
    expect(resolveDateRangeCellState(range, "2026-09-13")).toBe("end");
    expect(resolveDateRangeCellState(range, "2026-09-20")).toBe("none");

    const selecting = { start: "2026-09-10", end: null };
    expect(resolveDateRangeCellState(selecting, "2026-09-12", "2026-09-14")).toBe("between");
    expect(resolveDateRangeCellState(selecting, "2026-09-14", "2026-09-14")).toBe("end");
    // Hovering before the start previews nothing rather than an inverted range.
    expect(resolveDateRangeCellState(selecting, "2026-09-08", "2026-09-08")).toBe("none");
  });
});
