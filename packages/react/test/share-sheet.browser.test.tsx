import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ShareSheet, type ShareSheetProps, type ShareSheetSendResult } from "../src/share-sheet.js";

// 2026-10-26: BurnTok's share sheet behaviours, now owned by HJM (batch send once, partial retry, honest feedback).
let host: HTMLDivElement, root: Root;
const labels = { close: "닫기", copyLink: "링크 복사", systemShare: "공유하기", linkCopied: "링크를 복사했어요", actionFailed: "공유하지 못했어요" };
const recipientLabels = {
  group: "보낼 사람", search: "이름 검색", clearSearch: "검색어 지우기", loading: "불러오는 중", loadFailed: "목록을 불러오지 못했어요", retry: "다시 시도",
  empty: "보낼 사람이 없어요", noResults: "검색 결과가 없어요", sent: "보냄", sendFailed: "보내지 못했어요", send: (count: number) => `${count}명에게 보내기`,
};
const items = [{ id: "a", label: "하나", image: <span /> }, { id: "b", label: "두리", image: <span /> }];

function render(props: Partial<ShareSheetProps> & { onSend?: (ids: readonly string[]) => Promise<ShareSheetSendResult> } = {}) {
  const { onSend = async (ids: readonly string[]) => ({ sentIds: ids }), ...rest } = props;
  return act(async () => root.render(<HjmProvider><ShareSheet open onOpenChange={() => {}} title="공유" labels={labels} link="https://example.test/c/1"
    copyLink={async () => {}} recipients={{ items, labels: recipientLabels, onSend }} {...rest} /></HjmProvider>));
}
const checkbox = (name: string) => [...document.querySelectorAll<HTMLButtonElement>("[role=checkbox]")].find(node => node.getAttribute("aria-label") === name);
const button = (name: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find(node => node.getAttribute("aria-label") === name || node.textContent === name);
const search = () => document.querySelector<HTMLInputElement>(`input[aria-label="${recipientLabels.search}"]`)!;
async function type(value: string) {
  const input = search();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  Reflect.deleteProperty(navigator, "share");
});

it("keeps a selection across searches and sends the batch once on a double tap", async () => {
  const onSend = vi.fn(async (ids: readonly string[]) => ({ sentIds: ids }));
  await render({ onSend });
  await act(async () => checkbox("하나")!.click());
  await type("두리");
  expect(checkbox("하나")).toBeUndefined();
  await act(async () => checkbox("두리")!.click());
  expect(onSend).not.toHaveBeenCalled();
  const send = button("2명에게 보내기")!;
  await act(async () => { send.click(); send.click(); });
  expect(onSend).toHaveBeenCalledExactlyOnceWith(["a", "b"]);
  await type("");
  // Delivered recipients stay checked, locked and described as sent; the send button leaves with the selection.
  for (const name of ["하나", "두리"]) {
    const tile = checkbox(name)!;
    expect(tile.getAttribute("aria-checked")).toBe("true");
    expect(tile.disabled).toBe(true);
    expect(document.getElementById(tile.getAttribute("aria-describedby")!)?.textContent).toBe(recipientLabels.sent);
  }
  expect(button("2명에게 보내기")).toBeUndefined();
});

it("keeps only failed recipients selected and shows the product's reason", async () => {
  const onSend = vi.fn().mockResolvedValueOnce({ sentIds: ["a"], error: "볼 수 없는 사람이에요" }).mockResolvedValueOnce({ sentIds: ["b"] });
  await render({ onSend });
  await act(async () => { checkbox("하나")!.click(); });
  await act(async () => { checkbox("두리")!.click(); });
  await act(async () => button("2명에게 보내기")!.click());
  expect(document.querySelector(".hjm-notice[role=alert]")!.textContent).toContain("볼 수 없는 사람이에요");
  await act(async () => button("1명에게 보내기")!.click());
  expect(onSend.mock.calls).toEqual([[["a", "b"]], [["b"]]]);
  expect(document.querySelector(".hjm-notice[role=alert]")).toBeNull();
});

it("locks sentIds from before the sheet opened", async () => {
  await act(async () => root.render(<HjmProvider><ShareSheet open onOpenChange={() => {}} title="공유" labels={labels} link="https://example.test/c/1"
    recipients={{ items, labels: recipientLabels, sentIds: ["a"], onSend: async ids => ({ sentIds: ids }) }} /></HjmProvider>));
  expect(checkbox("하나")!.disabled).toBe(true);
  expect(checkbox("하나")!.getAttribute("aria-checked")).toBe("true");
  expect(button("1명에게 보내기")).toBeUndefined();
});

it("announces a copied link and reports a copy failure", async () => {
  const copy = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("denied"));
  const onLinkCopied = vi.fn();
  await render({ copyLink: copy, onLinkCopied });
  await act(async () => button(labels.copyLink)!.click());
  expect(copy).toHaveBeenCalledWith("https://example.test/c/1");
  expect(onLinkCopied).toHaveBeenCalledOnce();
  expect([...document.querySelectorAll("[role=status]")].some(node => node.textContent?.includes(labels.linkCopied))).toBe(true);
  await act(async () => button(labels.copyLink)!.click());
  expect(document.querySelector(".hjm-notice[role=alert]")!.textContent).toContain(labels.actionFailed);
});

it("hides system share without navigator.share and keeps a dismissed share silent", async () => {
  await render();
  expect(button(labels.systemShare)).toBeUndefined();
  await act(async () => root.unmount());
  root = createRoot(host);
  const share = vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError"));
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
  const onSystemShare = vi.fn();
  await render({ shareTitle: "점심 룰렛", onSystemShare });
  await act(async () => button(labels.systemShare)!.click());
  expect(share).toHaveBeenCalledWith({ url: "https://example.test/c/1", title: "점심 룰렛" });
  expect(onSystemShare).toHaveBeenCalledWith("dismissed");
  expect(document.querySelector(".hjm-notice[role=alert]")).toBeNull();
});

it("shows the load error with retry and the empty search state", async () => {
  const onRetry = vi.fn();
  await act(async () => root.render(<HjmProvider><ShareSheet open onOpenChange={() => {}} title="공유" labels={labels} link="https://example.test/c/1" copyLink={false}
    recipients={{ items: [], labels: recipientLabels, status: "error", onRetry, onSend: async () => ({ sentIds: [] }) }} /></HjmProvider>));
  expect(document.body.textContent).toContain(recipientLabels.loadFailed);
  await act(async () => button(recipientLabels.retry)!.click());
  expect(onRetry).toHaveBeenCalledOnce();
  expect(button(labels.copyLink)).toBeUndefined();
  await render();
  await type("없는 이름");
  expect(document.body.textContent).toContain(recipientLabels.noResults);
});
