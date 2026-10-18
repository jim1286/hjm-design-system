import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { CommentThreadRow, type CommentThreadItem } from "../src/screen-flows.js";

// 2026-10-18: Spint's flower body keeps the time with Reply under the body; Utilverse opens edit/report/block forms in-row.
const base: CommentThreadItem = { id: "c1", parentId: null, author: "서연", body: <span data-body>꽃</span>, timeLabel: "3분 전", likeCountLabel: "", likeIcon: "♥", likeLabel: "좋아요" };
const render = (item: CommentThreadItem) => renderToStaticMarkup(<HjmProvider><CommentThreadRow item={item} onLike={() => {}} onReply={() => {}} replyLabel="답글" /></HjmProvider>);

it("keeps the time beside the author by default and moves it under a rich body with timePlacement", () => {
  const auto = render(base);
  expect(auto.indexOf("3분 전")).toBeLessThan(auto.indexOf("data-body"));
  const moved = render({ ...base, timePlacement: "actions" });
  expect(moved.indexOf("3분 전")).toBeGreaterThan(moved.indexOf("data-body"));
  expect(moved.indexOf("3분 전")).toBeLessThan(moved.indexOf(">답글<"));
  expect(moved.match(/3분 전/g)).toHaveLength(1);
});

it("renders the inline panel under the reply line, outside the hold target", () => {
  const html = render({ ...base, panel: <form data-panel aria-label="신고" />, reactions: { label: "반응", closeLabel: "닫기", options: [{ id: "heart", emoji: "❤️", label: "하트" }], value: null, onValueChange: () => {} } });
  expect(html.indexOf("data-panel")).toBeGreaterThan(html.indexOf(">답글<"));
  expect(html).toContain('class="hjm-comment-row__panel"');
  const trigger = html.slice(html.indexOf("hjm-comment-row__reactions"), html.indexOf(">답글<"));
  expect(trigger).not.toContain("data-panel");
});
