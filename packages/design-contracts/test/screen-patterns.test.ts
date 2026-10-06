import { describe, expect, it } from "vitest";
import { canSubmitMessage, validateMessageAttachments, resolveScreenContentState, type ScreenContentState } from "../src/screen-patterns.js";

describe("screen content and composer ownership", () => {
  it("only replaces content for explicit initial states", () => {
    expect(resolveScreenContentState().replacesContent).toBe(false);
    for (const kind of ["loading", "empty", "error", "restricted"] as const) {
      const state = resolveScreenContentState({ kind, title: "Localized title" });
      expect(state.replacesContent).toBe(true);
      expect(state.busy).toBe(kind === "loading");
      expect(state.announcement).toBe(kind === "error" ? "assertive" : "polite");
      expect(() => resolveScreenContentState({ kind, title: "  " })).toThrow();
    }
    expect(() => resolveScreenContentState({ kind: "unknown" } as unknown as ScreenContentState)).toThrow();
  });
  it("does not submit empty, disabled or pending drafts", () => {
    const draft = { value: " 안녕하세요\n두 번째 줄 ", label: "메시지", sendLabel: "보내기" };
    expect(canSubmitMessage(draft)).toBe(true);
    expect(canSubmitMessage({ ...draft, value: " \n\t" })).toBe(false);
    expect(canSubmitMessage({ ...draft, disabled: true })).toBe(false);
    expect(canSubmitMessage({ ...draft, pending: true })).toBe(false);
  });
});

it("allows photo-only messages while rejecting invalid attachment counts", () => {
  const draft = { value: "", label: "메시지", sendLabel: "전송", attachmentCount: 2 };
  expect(canSubmitMessage(draft)).toBe(true);
  expect(canSubmitMessage({...draft,pending:true})).toBe(false);
  expect(canSubmitMessage({...draft,disabled:true})).toBe(false);
  for (const attachmentCount of [-1, 1.5, NaN]) expect(() => canSubmitMessage({...draft,attachmentCount})).toThrow();
});

it("rejects ambiguous photo removal targets and missing localized names", () => {
  const photo = {id:"photo",removeLabel:"사진 삭제"};
  expect(() => validateMessageAttachments([photo,photo])).toThrow();
  expect(() => validateMessageAttachments([{...photo,id:" "}])).toThrow();
  expect(() => validateMessageAttachments([{...photo,removeLabel:" "}])).toThrow();
  expect(() => validateMessageAttachments([photo,{...photo,id:"other"}])).not.toThrow();
});
