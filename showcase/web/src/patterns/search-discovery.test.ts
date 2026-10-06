import { describe, expect, it } from "vitest";
import {
  appliedFilterChips, appliedFilterCount, commitRecentSearch, countDiscovery, dateLabel, defaultDiscoveryFilters,
  discoverySeed, isDiscoveryFilterDefault, matchesPeriod, removeDiscoveryFilter, resetDiscoveryFilters,
  searchDiscovery, suggestDiscovery, toggleDiscoveryKind,
} from "../../../shared/search-discovery";

describe("search discovery fixture", () => {
  it("records only committed searches, newest first, deduped and capped", () => {
    expect(commitRecentSearch(["카페"], "  ")).toEqual(["카페"]);
    expect(commitRecentSearch(["카페", "산책"], " 산책 ")).toEqual(["산책", "카페"]);
    expect(commitRecentSearch(Array.from({ length: 10 }, (_, index) => `검색 ${index}`), "새 검색")).toHaveLength(10);
  });

  it("suggests prefix matches first with a highlight range and never echoes the exact query", () => {
    const suggestions = suggestDiscovery("산");
    expect(suggestions.length).toBeLessThanOrEqual(6);
    expect(suggestions[0]).toEqual({ text: "산책", start: 0, end: 1 });
    expect(suggestions.every(item => item.text.slice(item.start, item.end) === "산")).toBe(true);
    expect(suggestDiscovery("산책").map(item => item.text)).not.toContain("산책");
    expect(suggestDiscovery("  ")).toEqual([]);
  });

  it("matches the sheet CTA count to the result count after applying the draft", () => {
    const draft = toggleDiscoveryKind({ ...defaultDiscoveryFilters, period: "year" }, "photo", true);
    expect(countDiscovery("산책", draft)).toBe(searchDiscovery("산책", draft, "newest").length);
    expect(countDiscovery("산책", draft)).toBeGreaterThan(0);
  });

  it("sorts by calendar date, not by id", () => {
    const newest = searchDiscovery("산책", defaultDiscoveryFilters, "newest").map(entry => entry.createdAt);
    expect(newest).toEqual([...newest].sort().reverse());
    const oldest = searchDiscovery("산책", defaultDiscoveryFilters, "oldest").map(entry => entry.createdAt);
    expect(oldest).toEqual([...newest].reverse());
  });

  it("uses a Monday-based week, the calendar month and year for periods", () => {
    expect(matchesPeriod("2026-10-05", "week")).toBe(true);
    expect(matchesPeriod("2026-10-04", "week")).toBe(false);
    expect(matchesPeriod("2026-10-01", "month")).toBe(true);
    expect(matchesPeriod("2025-12-21", "year")).toBe(false);
    expect(dateLabel("2026-10-05")).toBe("10월 5일");
    expect(dateLabel("2025-12-21")).toBe("2025년 12월 21일");
  });

  it("removes one applied condition at a time and resets only the opened section", () => {
    const filters = { kinds: ["photo", "place"] as const, period: "month" as const, photoOnly: true, savedOnly: false };
    expect(appliedFilterChips(filters).map(chip => chip.key)).toEqual(["photoOnly", "period", "kind:photo", "kind:place"]);
    expect(appliedFilterCount(removeDiscoveryFilter(filters, "kind:photo"))).toBe(3);
    expect(resetDiscoveryFilters(filters, "period")).toEqual({ ...filters, period: "all" });
    expect(isDiscoveryFilterDefault(resetDiscoveryFilters(filters, "all"), "all")).toBe(true);
    expect(toggleDiscoveryKind({ ...defaultDiscoveryFilters, kinds: ["place"] }, "note", true).kinds).toEqual(["note", "place"]);
  });

  it("seeds each story state with the data it claims to show", () => {
    const results = discoverySeed("results");
    expect(searchDiscovery(results.committed, results.filters, "relevance").length).toBeGreaterThan(8);
    const filtered = discoverySeed("filtered");
    expect(appliedFilterCount(filtered.filters)).toBe(2);
    expect(countDiscovery(filtered.committed, filtered.filters)).toBeGreaterThan(0);
    const empty = discoverySeed("empty");
    expect(countDiscovery(empty.committed, empty.filters)).toBe(0);
    expect(countDiscovery(empty.committed, defaultDiscoveryFilters)).toBeGreaterThan(0);
  });
});
