import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HjmProvider } from "../src/provider.js";
import { UploadItem } from "../src/upload-item.js";
import "../src/styles.css";

const labels = {
  pending: "대기 중",
  uploading: "업로드 중",
  success: "완료",
  cancel: "취소",
  retry: "다시 시도",
} as const;

let container: HTMLDivElement;
let root: Root;

async function render(node: React.ReactNode) {
  await act(async () => root.render(
    <HjmProvider direction="rtl" systemTheme="dark" textScale={2}>
      {node}
    </HjmProvider>,
  ));
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  container.style.inlineSize = "320px";
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("UploadItem responsive progress copy", () => {
  it("shows one detailed value and preserves a non-breaking 44px action at RTL 200%", async () => {
    const onCancel = vi.fn();
    const detail = "1.2 MB 중 64% 업로드";
    await render(
      <UploadItem
        descriptor={{
          id: "photo",
          name: "profile-photo.png",
          sizeLabel: "1.2 MB",
          state: { status: "uploading", progress: 0.64, progressLabel: detail },
        }}
        labels={labels}
        onCancel={onCancel}
      />,
    );

    const item = container.querySelector<HTMLElement>(".hjm-upload-item")!;
    const body = item.querySelector<HTMLElement>(".hjm-upload-item__body")!;
    const liveStatus = item.querySelector<HTMLElement>(".hjm-upload-item__status")!;
    const progressCopy = item.querySelector<HTMLElement>(".hjm-progress__copy")!;
    const progress = item.querySelector<HTMLProgressElement>("progress")!;
    const action = item.querySelector<HTMLButtonElement>('[data-action="cancel"]')!;

    expect(liveStatus.classList.contains("hjm-visually-hidden")).toBe(true);
    expect(liveStatus.textContent).toBe(labels.uploading);
    expect(Array.from(progressCopy.children, (child) => child.textContent)).toEqual([
      labels.uploading,
      detail,
    ]);
    expect(progress.getAttribute("aria-label")).toBe(labels.uploading);
    expect(progress.getAttribute("aria-valuetext")).toBe(detail);
    expect(progress.value).toBe(64);

    expect(getComputedStyle(item).flexWrap).toBe("wrap");
    expect(getComputedStyle(progressCopy).flexWrap).toBe("wrap");
    expect(getComputedStyle(action).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(action).wordBreak).toBe("keep-all");
    expect(Number.parseFloat(getComputedStyle(action).minBlockSize)).toBeGreaterThanOrEqual(44);
    expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth);
    expect(progressCopy.scrollWidth).toBeLessThanOrEqual(progressCopy.clientWidth);
    expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth);
    expect(action.getBoundingClientRect().top).toBeGreaterThan(body.getBoundingClientRect().top);

    await act(async () => action.click());
    expect(onCancel).toHaveBeenCalledWith("photo");
  });

  it("does not repeat the uploading label when progress is indeterminate", async () => {
    await render(
      <UploadItem
        descriptor={{
          id: "photo",
          name: "profile-photo.png",
          state: { status: "uploading", progress: null },
        }}
        labels={labels}
        onCancel={() => undefined}
      />,
    );

    const progressCopy = container.querySelector<HTMLElement>(".hjm-progress__copy")!;
    const progress = container.querySelector<HTMLProgressElement>("progress")!;
    expect(Array.from(progressCopy.children, (child) => child.textContent)).toEqual([
      labels.uploading,
    ]);
    expect(progress.hasAttribute("aria-valuetext")).toBe(false);
    expect(progress.hasAttribute("value")).toBe(false);
  });
});
