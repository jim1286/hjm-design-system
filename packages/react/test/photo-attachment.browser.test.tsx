import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PhotoAttachmentField, type PhotoAttachmentFieldProps } from "../src/image-viewer.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const labels: PhotoAttachmentFieldProps["labels"] = {
  add: "사진", remove: "사진 빼기", preview: "붙인 사진 크게 보기",
  source: { title: "사진 고르기", library: "앨범", camera: "촬영", cancel: "닫기" },
};
const viewerLabels = { closeLabel: "닫기", previousLabel: "이전", nextLabel: "다음", loadingLabel: "불러오는 중", errorLabel: "표시 실패", retryLabel: "재시도" };
const photo = { uri: "data:image/gif;base64,R0lGODlhAQABAAAAACw=", width: 600, height: 2000 };
const render = (props: Partial<PhotoAttachmentFieldProps> = {}) => act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion>
  <div style={{ width: 300 }}><PhotoAttachmentField photo={null} labels={labels} viewerLabels={viewerLabels}
    onSelectSource={() => {}} onRemove={() => {}} {...props} /></div></HjmProvider>));
const button = (name: string) => [...document.querySelectorAll("button")].find(node => (node.getAttribute("aria-label") ?? node.textContent?.trim()) === name);

it("opens the source sheet from the small choose action and chooses inside the click", async () => {
  const select = vi.fn();
  await render({ onSelectSource: select });
  expect(button("사진 빼기")).toBeUndefined();
  expect(button("사진")!.getBoundingClientRect().width).toBeLessThan(300);
  await act(async () => button("사진")!.click());
  await act(async () => button("앨범")!.click());
  expect(select).toHaveBeenCalledExactlyOnceWith("library");
});

it("shows a 3:4 preview with the remove button in its top-end corner, and opens the viewer", async () => {
  const onRemove = vi.fn();
  await render({ photo, onRemove });
  expect(button("사진")).toBeUndefined();
  const preview = button("붙인 사진 크게 보기")!.getBoundingClientRect();
  const remove = button("사진 빼기")!;
  const corner = remove.getBoundingClientRect();
  expect(Math.round(preview.height)).toBe(400);
  expect(corner.right).toBeLessThanOrEqual(preview.right);
  expect(corner.right).toBeGreaterThan(preview.right - 24);
  expect(corner.top).toBeLessThan(preview.top + 24);
  await act(async () => remove.click());
  expect(onRemove).toHaveBeenCalledOnce();
  await act(async () => button("붙인 사진 크게 보기")!.click());
  expect(document.querySelector("[role=dialog]")).not.toBeNull();
});

it("locks remove while the host submits", async () => {
  await render({ photo, disabled: true });
  expect(button("사진 빼기")!.disabled).toBe(true);
});

it("lets the host control the source sheet and decorate the preview", async () => {
  const onSourceOpenChange = vi.fn();
  await render({ chooseAction: 'none', sourceOpen: true, onSourceOpenChange });
  expect(button('사진')).toBeUndefined();
  expect(button('앨범')).toBeDefined();
  await act(async () => button('닫기')!.click());
  expect(onSourceOpenChange).toHaveBeenCalledWith(false);
  await render({ photo, decoratePreview: image => <div data-testid="postcard-frame">{image}</div> });
  expect(host.querySelector('[data-testid="postcard-frame"] img')).not.toBeNull();
  expect(button('사진 빼기')).toBeDefined();
});
