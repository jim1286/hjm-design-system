import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { LoadMoreDescriptor, LoadMoreRequest } from "@hjmds/design-contracts/components/load-more";
import { LoadMore } from "../src/supplemental-navigation.js";
import { HjmProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import "../src/styles.css";

export const loadMoreKeyboardCases = [{ componentId: "load-more" }] as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

const labels = {
  loadMore: "더 많은 항목을 불러오기",
  loading: "요청한 다음 페이지의 항목을 불러오는 중입니다",
  retry: "페이지를 다시 불러오기",
  complete: "이 목록의 항목을 모두 불러왔습니다",
};

it("uses the keyboard fallback and announces the controlled loading state", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/load-more.interactions.browser.test.tsx")?.scenarios.map(({ id }) => id)).toEqual(expect.arrayContaining(["keyboard", "long-copy"]));
  // Keep the automatic observer from racing this manual keyboard path; its
  // browser-specific viewport behavior is exercised in the next case.
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() { return []; }
    readonly root = null;
    readonly rootMargin = "200px 0px";
    readonly thresholds = [0];
  });
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => { finish = resolve; });
  const onLoadMore = vi.fn<(request: LoadMoreRequest) => Promise<void>>();

  function Harness() {
    const [state, setState] = useState<LoadMoreDescriptor["state"]>({ status: "ready", requestKey: "cursor-2" });
    return <LoadMore descriptor={{ state, labels }} mode="automatic" onLoadMore={async (request) => {
      onLoadMore(request);
      setState({ status: "loading", requestKey: request.requestKey });
      await pending;
      setState({ status: "ready", requestKey: "cursor-3" });
    }} />;
  }

  await act(async () => root.render(<HjmProvider systemTheme="light"><Harness /></HjmProvider>));
  const button = host.querySelector<HTMLButtonElement>(".hjm-load-more__trigger")!;
  button.focus();
  expect(document.activeElement).toBe(button);
  await act(async () => { await userEvent.keyboard("{Enter}"); });
  expect(onLoadMore).toHaveBeenCalledWith({ requestKey: "cursor-2", reason: "manual" });
  expect(host.querySelector("[aria-busy='true']")?.getAttribute("data-state")).toBe("loading");
  expect(host.querySelector('[role="status"]')?.textContent).toBe(labels.loading);
  expect(host.querySelectorAll(".hjm-load-more__sentinel")).toHaveLength(1);

  await act(async () => { finish(); await pending; });
  expect(host.querySelector("[data-state='ready']")?.querySelector(".hjm-load-more__trigger")?.textContent).toBe(labels.loadMore);
  expect(host.querySelector("[data-state='ready']")?.getAttribute("data-mode")).toBe("automatic");
});

it("starts automatic loading only after the browser viewport observer reports intersection", async () => {
  const onLoadMore = vi.fn(async () => undefined);
  let observed: Element | null = null;
  let notify!: IntersectionObserverCallback;
  class TestIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe(target: Element) { observed = target; }
    disconnect() {}
    unobserve() {}
    takeRecords() { return []; }
    readonly root = null;
    readonly rootMargin = "200px 0px";
    readonly thresholds = [0];
  }
  vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);

  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <LoadMore descriptor={{ state: { status: "ready", requestKey: "cursor-auto" }, labels }} onLoadMore={onLoadMore} />
    </HjmProvider>,
  ));
  expect(onLoadMore).not.toHaveBeenCalled();
  expect(observed).toBe(host.querySelector(".hjm-load-more__sentinel"));
  await act(async () => {
    notify([{ isIntersecting: true, target: observed! } as IntersectionObserverEntry], {} as IntersectionObserver);
    await Promise.resolve();
  });
  expect(onLoadMore).toHaveBeenCalledWith({ requestKey: "cursor-auto", reason: "viewport" });
});

it("renders long localized text in the retry, error, and complete states", async () => {
  const longLabels = {
    loadMore: "더 보기 — 현재 목록 다음 부분의 기록을 이어서 불러옵니다",
    loading: "목록의 다음 항목을 서버에서 가져오는 중입니다. 잠시 기다려 주세요",
    retry: "연결 상태를 확인한 뒤 다음 목록 페이지를 다시 요청합니다",
    complete: "현재 조건에 해당하는 목록 항목을 모두 확인했습니다",
  };
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <LoadMore descriptor={{ state: { status: "error", requestKey: "cursor-failed", message: "요청을 완료하지 못했습니다. 연결을 확인하고 다시 시도해 주세요." }, labels: longLabels }} onLoadMore={async () => undefined} />
    </HjmProvider>,
  ));
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("연결을 확인하고 다시 시도해 주세요");
  expect(host.querySelector(".hjm-load-more__trigger")?.textContent).toBe(longLabels.retry);

  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <LoadMore descriptor={{ state: { status: "complete" }, labels: longLabels }} onLoadMore={async () => undefined} />
    </HjmProvider>,
  ));
  expect(host.querySelector(".hjm-load-more__end")?.textContent).toBe(longLabels.complete);
});
