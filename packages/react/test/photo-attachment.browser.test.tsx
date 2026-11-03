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
  add: "사진 붙이기", replace: "사진 바꾸기", remove: "사진 빼기", preview: "붙인 사진 크게 보기",
  source: { title: "사진 고르기", library: "앨범", camera: "촬영", cancel: "닫기" },
  upload: { pending: "대기", uploading: "올리는 중", success: "올림", cancel: "올리기 취소", retry: "다시 올리기" },
};
const viewerLabels = { closeLabel: "닫기", previousLabel: "이전", nextLabel: "다음", loadingLabel: "불러오는 중", errorLabel: "표시 실패", retryLabel: "재시도" };
const photo = { uri: "data:image/gif;base64,R0lGODlhAQABAAAAACw=", width: 600, height: 2000 };
const render = (props: Partial<PhotoAttachmentFieldProps> = {}) => act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion>
  <div style={{ width: 300 }}><PhotoAttachmentField photo={null} labels={labels} viewerLabels={viewerLabels}
    onSelectSource={() => {}} onRemove={() => {}} {...props} /></div></HjmProvider>));
const button = (name: string) => [...document.querySelectorAll("button")].find(node => (node.getAttribute("aria-label") ?? node.textContent) === name)!;

it("chooses a source inside the click and closes the sheet", async () => {
  const select = vi.fn();
  await render({ onSelectSource: select });
  await act(async () => button("사진 붙이기").click());
  await act(async () => button("앨범").click());
  expect(select).toHaveBeenCalledExactlyOnceWith("library");
});

it("crops a tall preview to 3:4, opens the viewer and locks editing during upload", async () => {
  await render({ photo, upload: { status: "uploading", progress: 0.5 }, onCancelUpload: () => {} });
  const preview = button("붙인 사진 크게 보기");
  const box = preview.getBoundingClientRect();
  expect(Math.round(box.height)).toBe(400);
  expect([button("사진 바꾸기").disabled, button("사진 빼기").disabled]).toEqual([true, true]);
  await act(async () => preview.click());
  expect(document.querySelector("[role=dialog]")).not.toBeNull();
});
