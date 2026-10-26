import { expect, it } from "vitest";
import { filterShareSheetRecipients, resolveShareSheetPickerValue, resolveShareSheetSendOutcome, validateShareSheet } from "../src/share-sheet.js";

// 2026-10-26 ShareSheet: a partial batch keeps failures selected; a product must not report ids it was not asked to send.
it("splits a send attempt into delivered and failed ids", () => {
  expect(resolveShareSheetSendOutcome(["a", "b", "c"], { sentIds: ["c", "a"] })).toEqual({ sent: ["a", "c"], failed: ["b"] });
  expect(() => resolveShareSheetSendOutcome(["a"], { sentIds: ["z"] })).toThrow(TypeError);
});

it("filters by label and keeps sent recipients checked", () => {
  const items = [{ id: "a", label: "Hana" }, { id: "b", label: "Duri" }];
  expect(filterShareSheetRecipients(items, "  ")).toBe(items);
  expect(filterShareSheetRecipients(items, " hA ").map(item => item.id)).toEqual(["a"]);
  expect(resolveShareSheetPickerValue(["b", "a"], new Set(["a", "c"]), ["a", "b"])).toEqual(["b", "a"]);
});

it("requires localized copy", () => {
  const labels = { close: "Close", copyLink: "Copy link", systemShare: "Share", linkCopied: "Copied", actionFailed: "Failed" };
  expect(() => validateShareSheet({ title: "Share", link: "https://example.test", labels })).not.toThrow();
  expect(() => validateShareSheet({ title: "Share", link: "https://example.test", labels: { ...labels, close: " " } })).toThrow(TypeError);
});
