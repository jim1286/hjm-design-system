import { expect, it } from "vitest";
import { resolveTopTitle, validateTopDescriptor } from "../src/top.js";

it("keeps intended breaks only when asked and always speaks one sentence", () => {
  const title = "아이디어를 제품으로,\n 제품을 오래 쓰이는 구조로.";
  expect(resolveTopTitle({ title, titleLineBreaks: "preserve" })).toEqual({
    text: "아이디어를 제품으로,\n제품을 오래 쓰이는 구조로.",
    accessibleName: "아이디어를 제품으로, 제품을 오래 쓰이는 구조로.",
    lines: ["아이디어를 제품으로,", "제품을 오래 쓰이는 구조로."],
  });
  expect(resolveTopTitle({ title }).text).toBe("아이디어를 제품으로, 제품을 오래 쓰이는 구조로.");
  expect(resolveTopTitle({ title: "한 줄", titleLineBreaks: "preserve" }).lines).toEqual(["한 줄"]);
  expect(() => validateTopDescriptor({ title, titleLineBreaks: "pre-line" as "preserve" })).toThrow(TypeError);
});
