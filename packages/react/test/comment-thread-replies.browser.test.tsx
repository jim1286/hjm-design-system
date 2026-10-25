import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { CommentThreadRow, CommentThreadScreen, type CommentThreadItem } from "../src/screen-flows.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("owns reply branch count, notice, and footer without mixing them into the root body", async () => {
  const host = document.createElement("div"); document.body.append(host); const reactRoot = createRoot(host);
  const root: CommentThreadItem = { id: "root", parentId: null, author: "Author", timeLabel: "Now", body: <div data-root-body>Root body</div>,
    likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false, repliesCount: 4,
    repliesNotice: <p>Reply refresh failed</p>, repliesFooter: <button>Load more replies</button> };
  function Example() {
    const [expanded, setExpanded] = useState(true);
    return <HjmProvider><CommentThreadScreen title="Comments" items={[root,
      { id: "reply", parentId: "root", author: "Author", timeLabel: "Now", body: <p>Preview reply</p>, likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false }]}
      expandedIds={expanded ? ["root"] : []} onExpandedChange={() => setExpanded(value => !value)} onLike={() => {}} onReply={() => {}}
      replyLabel="Reply" repliesLabel={(count, open) => `${open ? "Hide" : "Show"} ${count} replies`} /></HjmProvider>;
  }
  try {
    await act(async () => reactRoot.render(<Example />));
    const text = host.textContent!;
    expect(text.indexOf("Reply refresh failed")).toBeLessThan(text.indexOf("Preview reply"));
    expect(text.indexOf("Preview reply")).toBeLessThan(text.indexOf("Load more replies"));
    expect(host.querySelector("[data-root-body]")!.textContent).toBe("Root body");
    const toggle = [...host.querySelectorAll("button")].find(button => button.textContent === "Hide 4 replies")!;
    toggle.focus(); await act(async () => toggle.click());
    expect(host.textContent).not.toContain("Reply refresh failed"); expect(host.textContent).not.toContain("Load more replies");
    expect(document.activeElement).toBe(toggle); expect(toggle.textContent).toBe("Show 4 replies");
  } finally { await act(async () => reactRoot.unmount()); host.remove(); }
});

it("bounds percentage media inside the shared comment column without cropping its ratio", async () => {
  const host = document.createElement("div"); host.style.width = "400px"; document.body.append(host);
  const reactRoot = createRoot(host);
  const item: CommentThreadItem = { id: "photo", parentId: null, author: "Author", timeLabel: "Now", body: <p>Caption</p>,
    media: <div data-photo style={{ width: "100%", aspectRatio: "4 / 3" }} />,
    likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false };
  try {
    await act(async () => reactRoot.render(<HjmProvider><CommentThreadRow item={item} onLike={() => {}} onReply={() => {}} replyLabel="Reply" /></HjmProvider>));
    const photo = host.querySelector<HTMLElement>("[data-photo]")!;
    expect(photo.getBoundingClientRect().width).toBe(160);
    host.style.width = "140px";
    const bounds = photo.getBoundingClientRect();
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.width).toBeLessThan(140);
    expect(bounds.right).toBeLessThanOrEqual(host.getBoundingClientRect().right);
    expect(bounds.width / bounds.height).toBeCloseTo(4 / 3, 1);
  } finally { await act(async () => reactRoot.unmount()); host.remove(); }
});

it("opens a branch five replies at a time, then asks the product for its next server page", async () => {
  const host = document.createElement("div"); document.body.append(host); const reactRoot = createRoot(host);
  const reply = (index: number): CommentThreadItem => ({ id: `reply-${index}`, parentId: "root", author: "Author", timeLabel: "Now", body: <p>{`Reply ${index}`}</p>,
    likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false });
  const requests: string[] = [];
  function Example({ loaded, revealed }: { loaded: number; revealed?: string }) {
    return <HjmProvider><CommentThreadScreen title="Comments" items={[{ id: "root", parentId: null, author: "Author", timeLabel: "Now", body: <p>Root</p>,
      likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false, repliesCount: 12, repliesPage: { onLoadMore: () => requests.push("next") } },
      ...Array.from({ length: loaded }, (_, index) => reply(index))]}
      expandedIds={["root"]} onExpandedChange={() => {}} onLike={() => {}} onReply={() => {}} replyLabel="Reply"
      repliesLabel={(count, open) => `${open ? "Hide" : "Show"} ${count} replies`} moreRepliesLabel={count => `View ${count} more`}
      {...(revealed ? { revealedReplyId: revealed } : {})} /></HjmProvider>;
  }
  const more = () => [...host.querySelectorAll("button")].find(button => button.textContent?.startsWith("View "));
  try {
    await act(async () => reactRoot.render(<Example loaded={7} />));
    expect(host.textContent).toContain("Reply 4"); expect(host.textContent).not.toContain("Reply 5");
    expect(more()!.textContent).toBe("View 7 more");
    await act(async () => more()!.click());
    expect(host.textContent).toContain("Reply 6"); expect(requests).toEqual([]);
    expect(more()!.textContent).toBe("View 5 more");
    await act(async () => more()!.click());
    expect(requests).toEqual(["next"]);
    await act(async () => reactRoot.render(<Example loaded={12} />));
    expect(host.textContent).toContain("Reply 11"); expect(more()).toBeUndefined();
    await act(async () => reactRoot.unmount());
    const second = createRoot(host);
    await act(async () => second.render(<Example loaded={12} revealed="reply-9" />));
    expect(host.textContent).toContain("Reply 9"); expect(host.textContent).not.toContain("Reply 10");
    await act(async () => second.unmount());
  } finally { host.remove(); }
});
