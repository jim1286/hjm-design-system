import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
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

/** Component-scoped proof links the real browser keyboard path to renderer evidence. */
export const uploadItemKeyboardCases = [{ componentId: "upload-item" }] as const;

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

  it("keeps long localized file details readable and its cancel action keyboard-operable", async () => {
    const onCancel = vi.fn();
    const longName = "여행_사진_원본_최종_수정본_".repeat(8) + "photo.png";
    const longSize = "압축 전 원본 파일 · 약 1.2 MB (네트워크 상태에 따라 시간이 더 걸릴 수 있음)";
    await render(
      <UploadItem
        descriptor={{
          id: "photo",
          name: longName,
          sizeLabel: longSize,
          state: { status: "uploading", progress: 0.64, progressLabel: "업로드 중 · 서버에서 파일을 확인하고 있습니다" },
        }}
        labels={labels}
        onCancel={onCancel}
      />,
    );

    const item = container.querySelector<HTMLElement>(".hjm-upload-item")!;
    const action = item.querySelector<HTMLButtonElement>('[data-action="cancel"]')!;
    expect(item.querySelector(".hjm-upload-item__name")?.textContent).toBe(longName);
    expect(item.querySelector(".hjm-upload-item__meta")?.textContent).toBe(longSize);
    expect(item.querySelector(".hjm-progress__copy")?.textContent).toContain("서버에서 파일을 확인하고 있습니다");
    expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth);

    await act(async () => userEvent.tab());
    expect(document.activeElement).toBe(action);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledWith("photo");
  });
});
