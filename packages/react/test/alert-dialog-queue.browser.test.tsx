import { act, StrictMode, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import type { AlertDialogRequest, AlertDialogResult } from "@hjmds/design-contracts/components/alert-dialog";
import { AlertDialogQueueProvider, useAlertDialogQueue, type AlertDialogQueueApi } from "../src/alert-dialog-queue.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const ask = (title: string, extra: Partial<AlertDialogRequest> = {}) =>
  ({ mode: "confirm", title, description: "설명", confirmLabel: "확인", cancelLabel: "취소", ...extra }) as AlertDialogRequest;
let api!: AlertDialogQueueApi;
function Capture() { api = useAlertDialogQueue(); return <button type="button" id="trigger">삭제</button>; }
const tree = (scope: string, children: ReactNode = <Capture />) => <StrictMode><HjmProvider><AlertDialogQueueProvider scope={scope}>{children}</AlertDialogQueueProvider></HjmProvider></StrictMode>;
const dialog = () => document.querySelector<HTMLElement>(".hjm-alert-dialog");
const button = (label: string) => [...dialog()!.querySelectorAll("button")].find((node) => node.textContent === label)!;
const track = (promise: Promise<AlertDialogResult>) => { const box: { result?: AlertDialogResult } = {}; void promise.then((result) => { box.result = result; }); return box; };

it("shows queued questions one at a time in order, resolves each with its outcome and returns focus to the trigger", async () => {
  await act(async () => root.render(tree("/a")));
  document.querySelector<HTMLButtonElement>("#trigger")!.focus();
  let first!: ReturnType<typeof track>; let second!: ReturnType<typeof track>;
  await act(async () => { first = track(api.open(ask("첫째"))); second = track(api.open(ask("둘째"))); });
  expect(document.querySelectorAll(".hjm-alert-dialog")).toHaveLength(1);
  expect(dialog()!.textContent).toContain("첫째");
  await act(async () => button("확인").click());
  expect(first.result).toEqual({ outcome: "confirmed" });
  expect(dialog()!.textContent).toContain("둘째");
  await act(async () => { document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
  expect(second.result).toEqual({ outcome: "cancelled", reason: "escape" });
  expect(dialog()).toBeNull();
  await act(async () => { await Promise.resolve(); });
  expect(document.activeElement?.id).toBe("trigger");
});

it("keeps an async confirmation open and busy, then open with its error, and resolves only when it succeeds", async () => {
  await act(async () => root.render(tree("/a")));
  let attempt = 0;
  let finish!: () => void;
  const request = ask("결제 취소", { onConfirm: () => new Promise<void>((resolve, reject) => { attempt += 1; if (attempt === 1) reject(new Error("offline")); else finish = resolve; }), fallbackErrorMessage: "취소하지 못했어요" });
  let pending!: ReturnType<typeof track>;
  await act(async () => { pending = track(api.open(request)); });
  await act(async () => button("확인").click());
  expect(dialog()!.textContent).toContain("취소하지 못했어요");
  expect(pending.result).toBeUndefined();
  await act(async () => button("확인").click());
  expect(dialog()!.getAttribute("aria-busy")).toBe("true");
  await act(async () => finish());
  expect(pending.result).toEqual({ outcome: "confirmed" });
  expect(dialog()).toBeNull();
});

it("interrupts the questions of a departed scope and a late call made from it", async () => {
  await act(async () => root.render(tree("/a")));
  let asked!: ReturnType<typeof track>;
  await act(async () => { asked = track(api.open(ask("이전 화면"))); });
  const stale = api;
  await act(async () => root.render(tree("/b")));
  expect(asked.result).toEqual({ outcome: "cancelled", reason: "interrupted" });
  expect(dialog()).toBeNull();
  let late!: ReturnType<typeof track>;
  await act(async () => { late = track(stale.open(ask("늦은 호출"))); });
  expect(late.result).toEqual({ outcome: "cancelled", reason: "interrupted" });
  expect(dialog()).toBeNull();
  let current!: ReturnType<typeof track>;
  await act(async () => { current = track(api.open({ mode: "alert", title: "현재 화면", description: "설명", confirmLabel: "확인" })); });
  expect(dialog()!.textContent).toContain("현재 화면");
  await act(async () => root.unmount());
  root = createRoot(host);
  expect(current.result).toEqual({ outcome: "cancelled", reason: "interrupted" });
});
