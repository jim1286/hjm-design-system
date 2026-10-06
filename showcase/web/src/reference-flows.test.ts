import { describe, expect, it } from "vitest";
import { emptyFilters, filterRecords, initialDraft, draftError, sameDraft } from "../../shared/reference-flows";

describe("reference flow shared rules", () => {
  it("combines categories with OR and saved state with AND", () => {
    expect(filterRecords("", { categories: ["독서", "여행"], savedOnly: false }).map(x => x.id)).toEqual(["book", "trip"]);
    expect(filterRecords("", { categories: ["독서", "여행"], savedOnly: true }).map(x => x.id)).toEqual(["trip"]);
  });
  it("matches all query terms across title and body, including whitespace", () => {
    expect(filterRecords("  책에서  문장  ", emptyFilters()).map(x => x.id)).toEqual(["book"]);
    expect(filterRecords("산책 바다", emptyFilters())).toEqual([]);
    expect(filterRecords("", emptyFilters())).toHaveLength(3);
  });
  it("rejects blank submissions and detects all editable settings", () => {
    const saved = initialDraft("settings");
    expect(draftError({ ...saved, title: "　 " })).toBeTruthy();
    expect(draftError(saved)).toBeUndefined();
    expect(sameDraft(saved, { ...saved })).toBe(true);
    for (const patch of [{ title: "다른 이름" }, { category: "여행" }, { enabled: false }]) {
      expect(sameDraft(saved, { ...saved, ...patch })).toBe(false);
    }
  });
});
