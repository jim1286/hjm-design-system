import { describe, expect, it } from "vitest";
import {
  dateRangeSpans,
  defaultDateRangeLimit,
  emptyDateRange,
  isDateWithinRangeLimit,
  resolveDateRangeLimitBounds,
  isCompleteDateRange,
  resolveDateRangeCellState,
  resolveDateRangeSelection,
  validateDateRange,
} from "../src/date-range.js";

describe("DateRange", () => {
  it("limits a range by calendar units, end inclusive, through leap years and short months", () => {
    expect(resolveDateRangeLimitBounds("2028-01-01", defaultDateRangeLimit)).toEqual({ earliest: "2027-01-02", latest: "2028-12-31" });
    expect(resolveDateRangeLimitBounds("2026-01-31", { months: 1 }).latest).toBe("2026-02-27");
    const selecting = { start: "2026-10-12", end: null };
    expect(isDateWithinRangeLimit(selecting, "2027-10-11", defaultDateRangeLimit)).toBe(true);
    expect(isDateWithinRangeLimit(selecting, "2027-10-12", defaultDateRangeLimit)).toBe(false);
    expect(isDateWithinRangeLimit(selecting, "2030-01-01", null)).toBe(true);
    // A press past the limit starts over there instead of building an oversized range.
    expect(resolveDateRangeSelection(selecting, "2027-12-01", defaultDateRangeLimit)).toEqual({ start: "2027-12-01", end: null });
    expect(() => validateDateRange({ start: "2026-01-01", end: "2027-01-01" }, defaultDateRangeLimit)).toThrow(/maximum length/);
  });

  it("joins days with a band only when the range spans more than one day", () => {
    expect(dateRangeSpans({ start: "2026-09-10", end: null })).toBe(false);
    expect(dateRangeSpans({ start: "2026-09-10", end: "2026-09-10" })).toBe(false);
    expect(dateRangeSpans({ start: "2026-09-10", end: null }, "2026-09-12")).toBe(true);
  });

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
