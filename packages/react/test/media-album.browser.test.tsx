import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ChatMessage, MediaAlbumPageStatus } from "../src/screens.js";
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

// 2026-10-18 Utilverse: the frame was one accessible image, so loading text and the retry button inside it were unreachable.
it("a page status replaces the image and open semantics while keeping the product page mounted", async () => {
  const onPress = vi.fn(), retry = vi.fn();
  let mounts = 0, setPhase: (phase: "loading" | "error" | "ready") => void = () => {};
  function Page() {
    const [phase, set] = useState<"loading" | "error" | "ready">("loading");
    setPhase = set;
    useEffect(() => { mounts += 1; }, []);
    if (phase === "ready") return <img alt="" data-page="0" />;
    return phase === "loading" ? <MediaAlbumPageStatus kind="loading" label="사진 불러오는 중" />
      : <MediaAlbumPageStatus kind="error" label="사진을 불러오지 못했어요" retry={{ label: "다시 시도", onPress: retry }} />;
  }
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="서연" timestamp="14:32" mediaAlbum={{ ...album(() => <Page />), onPress }}>{null}</ChatMessage></HjmProvider>));
  const frame = host.querySelector(".hjm-media-album__page")!;
  expect(button("사진 1/3")).toBeNull();
  expect(frame.hasAttribute("role")).toBe(false);
  expect(frame.querySelector(".hjm-media-album__content")!.hasAttribute("aria-hidden")).toBe(false);
  expect(frame.querySelector('[aria-label="사진 불러오는 중"]')).not.toBeNull();
  await act(async () => setPhase("error"));
  expect(frame.querySelector('[role="alert"]')?.textContent).toBe("사진을 불러오지 못했어요");
  await act(async () => { [...frame.querySelectorAll("button")].find(node => node.textContent === "다시 시도")!.click(); });
  expect(retry).toHaveBeenCalledTimes(1);
  expect(onPress).not.toHaveBeenCalled();
  await act(async () => setPhase("ready"));
  // Ready again: the overlay opens the page and hides the image beneath; the product page was never remounted.
  expect(frame.querySelector(".hjm-media-album__content")!.getAttribute("aria-hidden")).toBe("true");
  await act(async () => { button("사진 1/3").click(); });
  expect(onPress).toHaveBeenCalledExactlyOnceWith(0);
  expect(mounts).toBe(1);
});

it("a static page drops its image role while its status is shown", async () => {
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="서연" timestamp="14:32" mediaAlbum={album(() => <MediaAlbumPageStatus kind="loading" label="사진 불러오는 중" />)}>{null}</ChatMessage></HjmProvider>));
  expect(host.querySelector('[role="img"]')).toBeNull();
  expect(() => MediaAlbumPageStatus({ kind: "loading", label: " " })).toThrow(TypeError);
});
