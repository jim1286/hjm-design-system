import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ChatMessage } from "../src/screens.js";
import { CommentThreadRow, type CommentThreadItem } from "../src/screen-flows.js";
import "../src/styles.css";

// 2026-10-18 Utilverse: a paged album mounts only the shown photo so the product fetches one authorized image at a time.
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const album = (renderPage: (index: number) => React.ReactNode) => ({ count: 3, renderPage, pageLabel: (index: number, count: number) => `사진 ${index + 1}/${count}`, previousLabel: "이전 사진", nextLabel: "다음 사진" });
const button = (name: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;

it("ChatMessage renders only the shown page and pages with the counter buttons", async () => {
  const renderPage = vi.fn((index: number) => <img alt="" data-page={index} />);
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="서연" timestamp="14:32" mediaAlbum={album(renderPage)}>{null}</ChatMessage></HjmProvider>));
  expect(new Set(renderPage.mock.calls.map(([index]) => index))).toEqual(new Set([0]));
  expect(host.querySelectorAll("[data-page]")).toHaveLength(1);
  expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("사진 1/3");
  expect(button("이전 사진").disabled).toBe(true);
  // Photo-only: no bubble surface, like the eager media grid.
  expect(host.querySelector(".hjm-chat-message__bubble")?.hasAttribute("data-photo-only")).toBe(true);
  await act(async () => { button("다음 사진").click(); });
  expect(host.querySelector("[data-page]")?.getAttribute("data-page")).toBe("1");
  expect(host.textContent).toContain("2/3");
  expect(renderPage.mock.calls.some(([index]) => index === 2)).toBe(false);
});

it("a controlled album follows the product index and opens the shown page", async () => {
  const onIndexChange = vi.fn(), onPress = vi.fn();
  await act(async () => root.render(<HjmProvider><ChatMessage direction="outgoing" author="나" timestamp="14:32" mediaAlbum={{ ...album(index => <img alt="" data-page={index} />), index: 2, onIndexChange, onPress }}>{null}</ChatMessage></HjmProvider>));
  expect(button("다음 사진").disabled).toBe(true);
  button("사진 3/3").focus(); await act(async () => userEvent.keyboard("{Enter}"));
  expect(onPress).toHaveBeenCalledExactlyOnceWith(2);
  await act(async () => { button("이전 사진").click(); });
  expect(onIndexChange).toHaveBeenCalledExactlyOnceWith(1);
  expect(host.querySelector("[data-page]")?.getAttribute("data-page")).toBe("2");
});

it("CommentThreadRow places the album after the body, outside the hold target, and rejects two photo sets", async () => {
  const base: CommentThreadItem = { id: "c1", parentId: null, author: "서연", body: <span>본문</span>, timeLabel: "1분", likeCountLabel: "", likeIcon: "♥", likeLabel: "좋아요" };
  const renderPage = vi.fn((index: number) => <img alt="" data-page={index} />);
  await act(async () => root.render(<HjmProvider><CommentThreadRow item={{ ...base, mediaAlbum: album(renderPage), reactions: { label: "반응", closeLabel: "닫기", options: [{ id: "heart", emoji: "❤️", label: "하트" }], value: null, onValueChange: () => {} } }} onLike={() => {}} onReply={() => {}} replyLabel="답글" /></HjmProvider>));
  const albumNode = host.querySelector(".hjm-comment-row__album")!;
  expect(albumNode.closest(".hjm-comment-row__reactions")).toBeNull();
  expect(new Set(renderPage.mock.calls.map(([index]) => index))).toEqual(new Set([0]));
  expect(() => CommentThreadRow({ item: { ...base, media: <img alt="" />, mediaAlbum: album(renderPage) }, onLike() {}, onReply() {}, replyLabel: "답글" })).toThrow(TypeError);
});
