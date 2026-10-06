import { describe, expect, it, vi } from "vitest";
import { resolveDateEntryDraft, updateDateEntryDraft, type DateEntryDraft, type DateEntryOrder, type DateEntryParseResult } from "../src/date-entry.js";

const order: DateEntryOrder = ["year", "month", "day"];
const blank: DateEntryDraft = { year: "", month: "", day: "" };
const draft: DateEntryDraft = { year: "2024", month: "Feb", day: "29" };
const parse = vi.fn<(_: DateEntryDraft) => DateEntryParseResult>(() => ({ status: "valid", value: "2024-02-29" }));
const resolve = (value: DateEntryDraft, required = true) => resolveDateEntryDraft({ draft: value, order, required, parse });

describe("direct date entry draft contract", () => {
  it("retains exact edits and never mutates or normalizes the old draft", () => {
    const before = Object.freeze({ ...draft });
    const edited = updateDateEntryDraft(before, "year", " ２０ ");
    expect(edited).toEqual({ ...draft, year: " ２０ " });
    expect(before.year).toBe("2024");
    expect(updateDateEntryDraft(edited, "month", "二月").month).toBe("二月");
  });
  it("distinguishes required empty, optional empty and optional partial dates without calling the parser", () => {
    parse.mockClear();
    expect(resolve(blank)).toMatchObject({ status: "empty", value: null, issue: { kind: "missing", fields: order } });
    expect(resolve(blank, false)).toMatchObject({ status: "empty", value: null, issue: null });
    const partial = resolve({ year: "\u2003", month: "13", day: "29" }, false);
    expect(partial).toMatchObject({ status: "incomplete", issue: { kind: "missing", fields: ["year"] } });
    expect(partial.fields.map(field => field.invalid)).toEqual([true, false, false]);
    expect(parse).not.toHaveBeenCalled();
  });
  it("leaves month names, calendar validity and output representation to the product adapter", () => {
    parse.mockClear();
    const resolved = resolve(draft);
    expect(parse).toHaveBeenCalledWith(draft);
    expect(Object.isFrozen(parse.mock.calls[0]![0])).toBe(true);
    expect(resolved).toMatchObject({ status: "valid", value: "2024-02-29", issue: null, draft });
    const incomplete = resolveDateEntryDraft({ draft: { ...draft, year: "20" }, order, required: true,
      parse: () => ({ status: "incomplete", code: "year-four-digits", fields: ["year"] }) });
    expect(incomplete.value).toBeNull();
    expect(incomplete.fields.filter(field => field.invalid).map(field => field.part)).toEqual(["year"]);
  });
  it("keeps failed drafts for correction and clears obsolete errors only from a fresh parse", () => {
    const invalidDraft = { ...draft, year: "2023" };
    const invalid = resolveDateEntryDraft({ draft: invalidDraft, order, required: true,
      parse: () => ({ status: "invalid", code: "not-a-real-date", fields: ["day", "month", "year"] }) });
    expect(invalid.draft).toEqual(invalidDraft);
    expect(invalid.issue?.fields).toEqual(order);
    expect(invalid.value).toBeNull();
    const corrected = resolve(updateDateEntryDraft(invalid.draft, "year", "2024"));
    expect(corrected.issue).toBeNull();
    expect(corrected.fields.every(field => !field.invalid)).toBe(true);
  });
  it("resolves all six locale orders without inferring order from direction or rearranging errors", () => {
    const orders: DateEntryOrder[] = [["year", "month", "day"], ["year", "day", "month"], ["month", "year", "day"],
      ["month", "day", "year"], ["day", "year", "month"], ["day", "month", "year"]];
    for (const currentOrder of orders) {
      const resolved = resolveDateEntryDraft({ draft, order: currentOrder, required: true,
        parse: () => ({ status: "invalid", code: "range", fields: ["day", "year"] }) });
      expect(resolved.fields.map(field => field.part)).toEqual(currentOrder);
      expect(resolved.issue?.fields).toEqual(currentOrder.filter(part => part !== "month"));
    }
  });
  it("rejects malformed integration policy rather than silently committing a draft", () => {
    for (const result of [undefined, { status: "valid", value: " " }, { status: "invalid", code: "", fields: ["day"] },
      { status: "invalid", code: "bad", fields: [] }, { status: "invalid", code: "bad", fields: ["day", "day"] },
      { status: "invalid", code: "bad", fields: ["era"] }]) {
      expect(() => resolveDateEntryDraft({ draft, order, required: true, parse: () => result as DateEntryParseResult })).toThrow(TypeError);
    }
    expect(() => resolveDateEntryDraft({ draft, order: ["day", "day", "year"], required: true, parse })).toThrow(TypeError);
    expect(() => updateDateEntryDraft(draft, "era" as "day", "1")).toThrow(TypeError);
    expect(() => resolve({ ...draft, year: 2024 } as unknown as DateEntryDraft)).toThrow(TypeError);
  });
});
