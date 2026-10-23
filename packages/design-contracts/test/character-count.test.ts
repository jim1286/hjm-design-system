import { expect, it } from "vitest";
import {
  characterCountRecipe,
  resolveCharacterCount,
  resolveCharacterCountMaxLength,
  shouldAnnounceCharacterCount,
  type CharacterCountOptions,
} from "../src/character-count.js";

// BurnTok's composer rule (ComposerCount.tsx / TextLengthHint.tsx): trimmed length, 5–500, near at 40 remaining.
const burntok: CharacterCountOptions = {
  min: 5, max: 500, nearLimit: 40, measure: "trimmed", overflow: "allow", locale: "ko-KR",
  messages: {
    range: ({ min, max }) => `${min}–${max}자`,
    remaining: ({ count }) => `${count}자 더 쓸 수 있어요`,
    needed: ({ count }) => `${count}자만 더 적어주세요`,
    over: ({ count }) => `${count}자를 줄여주세요`,
  },
};

it("chooses over, then short, then near, then the range sentence like BurnTok", () => {
  expect(resolveCharacterCount("", burntok)).toMatchObject({ status: "within", invalid: false, counter: "0/500", message: "5–500자" });
  expect(resolveCharacterCount("  ab  ", burntok)).toMatchObject({ length: 2, status: "short", invalid: true, message: "3자만 더 적어주세요" });
  expect(resolveCharacterCount("가".repeat(460), burntok)).toMatchObject({ status: "near", remaining: 40, message: "40자 더 쓸 수 있어요" });
  expect(resolveCharacterCount("가".repeat(459), burntok).status).toBe("within");
  expect(resolveCharacterCount("가".repeat(1024), { ...burntok, max: 1000 })).toMatchObject({
    status: "over", remaining: -24, invalid: true, counter: "1,024/1,000", message: "24자를 줄여주세요",
  });
});

it("defaults to raw UTF-16 length, min 0, a tenth of max as near and the native block", () => {
  const options: CharacterCountOptions = { max: 20, locale: "en" };
  expect(resolveCharacterCount("  ", options)).toMatchObject({ length: 2, status: "within" });
  expect(resolveCharacterCount("x".repeat(18), options).status).toBe("near");
  expect(resolveCharacterCount("x", options).message).toBeUndefined();
  expect(resolveCharacterCountMaxLength(options)).toBe(20);
  expect(resolveCharacterCountMaxLength({ ...options, overflow: "allow" })).toBeUndefined();
  expect(characterCountRecipe.defaults).toEqual({ min: 0, overflow: "block", measure: "length" });
});

it("announces only on entering an announced status that has a sentence", () => {
  const near = resolveCharacterCount("가".repeat(470), burntok);
  expect(shouldAnnounceCharacterCount(undefined, near)).toBe(false);
  expect(shouldAnnounceCharacterCount("within", near)).toBe(true);
  expect(shouldAnnounceCharacterCount("near", near)).toBe(false);
  expect(shouldAnnounceCharacterCount("near", resolveCharacterCount("가".repeat(100), burntok))).toBe(false);
  expect(shouldAnnounceCharacterCount("within", resolveCharacterCount("가".repeat(470), { max: 500, locale: "ko" }))).toBe(false);
});

it("rejects limits that cannot be counted", () => {
  expect(() => resolveCharacterCount("", { max: 0, locale: "ko" })).toThrow(RangeError);
  expect(() => resolveCharacterCount("", { max: 5, min: 6, locale: "ko" })).toThrow(RangeError);
  expect(() => resolveCharacterCount("", { max: 5.5, locale: "ko" })).toThrow(RangeError);
  expect(() => resolveCharacterCount("", { max: 5, locale: "" })).toThrow(TypeError);
});
