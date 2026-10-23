import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { PermissionScreen } from "../src/screen-flows.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "360px"; host.style.height = "640px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

it("puts recheck and the alternative path in the footer between the settings action and skip", async () => {
  const recheck = vi.fn(), photo = vi.fn();
  const screen = (status: "denied" | "prompt") => <HjmProvider><PermissionScreen title="카메라" status={status} explanation="탑승권을 비추면 읽어요"
    request={{ label: "허용", onAction: vi.fn() }} settings={{ label: "설정 열기", onAction: vi.fn() }} continueAction={{ label: "계속", onAction: vi.fn() }}
    recheck={{ label: "다시 확인", onAction: recheck }} alternative={{ label: "사진에서 선택", onAction: photo, pending: false }} skip={{ label: "편명으로 등록", onAction: vi.fn() }} /></HjmProvider>;
  await act(async () => root.render(screen("denied")));
  const footer = host.querySelector(".hjm-screen__footer")!;
  const buttons = [...footer.querySelectorAll<HTMLButtonElement>("button")];
  expect(buttons.map(button => button.textContent)).toEqual(["설정 열기", "다시 확인", "사진에서 선택", "편명으로 등록"]);
  expect(buttons.map(button => button.dataset.tone)).toEqual(["primary", "secondary", "secondary", "ghost"]);
  // Same-width stacked secondaries under the primary.
  expect(new Set(buttons.slice(0, 3).map(button => Math.round(button.getBoundingClientRect().width))).size).toBe(1);
  expect(host.querySelector(".hjm-screen__body")!.querySelector("button")).toBeNull();
  await act(async () => buttons[1]!.click());
  await act(async () => buttons[2]!.click());
  expect(recheck).toHaveBeenCalledOnce();
  expect(photo).toHaveBeenCalledOnce();
  await act(async () => root.render(screen("prompt")));
  expect([...host.querySelectorAll(".hjm-screen__footer button")].map(button => button.textContent)).toEqual(["허용", "사진에서 선택", "편명으로 등록"]);
});
