import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { CompositionLayout, ScreenLayout } from "../src/screens.js";
import { CommentThreadRow, CommentThreadScreen } from "../src/screen-flows.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it("preserves an edited input on nonblocking failure and replaces only content on access loss", async () => {
  const render = (restricted: boolean, failed: boolean) => root.render(<HjmProvider><CompositionLayout
    title="설정" badge={<span>2</span>} notice={failed ? <span>저장 실패</span> : null}
    state={restricted ? {kind: "restricted", title: "접근 제한"} : {kind: "ready"}}
    stateAction={<button>다시 확인</button>} footer={<button>닫기</button>}>
    <input aria-label="초안" defaultValue="원본" />
  </CompositionLayout></HjmProvider>);
  await act(async () => render(false, false));
  const input = host.querySelector("input")!; input.value = "아직 저장하지 않은 값"; input.focus();
  await act(async () => render(false, true));
  expect(host.querySelector("input")).toBe(input); expect(input.value).toBe("아직 저장하지 않은 값");
  await act(async () => render(true, true));
  expect(host.querySelector("input")).toBeNull();
  expect(host.textContent).toContain("접근 제한"); expect(host.textContent).toContain("닫기");
});
it("uses one comment row for both the built-in list and a virtualized host", async () => {
  const like = vi.fn(), reply = vi.fn();
  const item = {id: "one", parentId: null, author: "작성자", body: "내용", timeLabel: "방금", likeCountLabel: "3", likeIcon: "♡", likeLabel: "좋아요"};
  await act(async () => root.render(<HjmProvider><CommentThreadRow item={item} onLike={like} onReply={reply} replyLabel="답글" /></HjmProvider>));
  const rowText = host.textContent;
  await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="좋아요"]')!.click());
  expect(like).toHaveBeenCalledWith("one");
  await act(async () => [...host.querySelectorAll("button")].find(b => b.textContent === "답글")!.click());
  expect(reply).toHaveBeenCalledWith("one");
  await act(async () => root.render(<HjmProvider><CommentThreadScreen title="댓글" titleVisibility="hidden" items={[item]} expandedIds={[]} onExpandedChange={() => {}} onLike={like} onReply={reply} replyLabel="답글" repliesLabel={() => "펼침"}/></HjmProvider>));
  expect(host.textContent).toBe(rowText);
});
it("owns title badge placement and omits it with a replaced or hidden header", async () => {
  await act(async () => root.render(<HjmProvider><ScreenLayout title="목록" titleBadge={<span>12</span>}>내용</ScreenLayout></HjmProvider>));
  expect(host.querySelector("h1")?.parentElement?.textContent).toBe("목록12");
  await act(async () => root.render(<HjmProvider><ScreenLayout title="목록" titleVisibility="hidden" titleBadge={<span>12</span>}>내용</ScreenLayout></HjmProvider>));
  expect(host.textContent).not.toContain("12");
});
