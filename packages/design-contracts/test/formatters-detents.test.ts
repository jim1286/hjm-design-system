import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../src/formatters.js";
import {
  resolveNextSheetDetent,
  sheetDetentOrder,
  validateSheetDetents,
} from "../src/sheet.js";

describe("formatters", () => {
  it("requires a locale instead of leaking the environment default", () => {
    expect(() => formatNumber(1234, { locale: "" })).toThrow(/BCP 47/);
    expect(() => formatNumber(1234, { locale: [] })).toThrow(/BCP 47/);
    expect(formatNumber(1234.5, { locale: "ko-KR" })).toBe("1,234.5");
  });

  it("formats currency with the locale's own placement and digits", () => {
    expect(formatCurrency(12000, { locale: "ko-KR", currency: "KRW" })).toContain("12,000");
    expect(formatCurrency(12, { locale: "en-US", currency: "USD" })).toBe("$12.00");
    expect(() => formatCurrency(1, { locale: "ko-KR", currency: "won" })).toThrow(/ISO 4217/);
  });

  it("treats a percent input as a ratio, not an already-multiplied number", () => {
    expect(formatPercent(0.35, { locale: "en-US" })).toBe("35%");
  });

  it("scales bytes on the 1000 base the OS file managers use", () => {
    expect(formatBytes(999, { locale: "en-US" })).toBe("999 B");
    expect(formatBytes(1000, { locale: "en-US" })).toBe("1 KB");
    expect(formatBytes(1_500_000, { locale: "en-US" })).toBe("1.5 MB");
    expect(() => formatBytes(-1, { locale: "en-US" })).toThrow(RangeError);
  });

  it("rejects non-finite values everywhere", () => {
    expect(() => formatNumber(Number.NaN, { locale: "ko-KR" })).toThrow(TypeError);
    expect(() => formatPercent(Number.POSITIVE_INFINITY, { locale: "ko-KR" })).toThrow(TypeError);
  });
});

describe("Sheet detents", () => {
  it("requires an ordered, unique, known list", () => {
    expect(() => validateSheetDetents([])).toThrow(RangeError);
    expect(() => validateSheetDetents(["large", "medium"])).toThrow(/smallest to largest/);
    expect(() => validateSheetDetents(["medium", "medium"])).toThrow(/Duplicate/);
    expect(() => validateSheetDetents(["auto" as never])).toThrow(/Unsupported Sheet detent/);
    expect(() => validateSheetDetents([...sheetDetentOrder])).not.toThrow();
  });

  it("returns null at the ends so a renderer can disable the control", () => {
    const detents = ["medium", "full"] as const;
    expect(resolveNextSheetDetent(detents, "medium", "expand")).toBe("full");
    expect(resolveNextSheetDetent(detents, "full", "expand")).toBeNull();
    expect(resolveNextSheetDetent(detents, "medium", "collapse")).toBeNull();
    expect(() => resolveNextSheetDetent(detents, "large", "expand")).toThrow(/not in the list/);
  });
});
