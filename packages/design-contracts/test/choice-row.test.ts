import { expect, it } from "vitest";
import { resolveChoiceRow } from "../src/choice-row.js";

const items = [{ value: "system", label: "기기 설정" }, { value: "ko", label: "한국어" }] as const;

it("shows the confirmed choice or the placeholder before the first load", () => {
  expect(resolveChoiceRow({ title: "언어", items, value: "ko" }).valueLabel).toBe("한국어");
  expect(resolveChoiceRow({ title: "언어", items, value: null, placeholder: "불러오는 중" }).valueLabel).toBe("불러오는 중");
});

it("rejects values and choices that cannot be shown truthfully", () => {
  expect(() => resolveChoiceRow({ title: "언어", items, value: null })).toThrow(/placeholder/);
  expect(() => resolveChoiceRow({ title: "언어", items: items as never, value: "en" as never })).toThrow(/not one of/);
  expect(() => resolveChoiceRow({ title: "언어", items: [items[0], items[0]], value: "system" })).toThrow(/unique/);
  expect(() => resolveChoiceRow({ title: "언어", items: [items[0]], value: "system" })).toThrow(/two choices/);
});
