import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createToastStore, type ToastDescriptor } from "@hjmds/design-contracts/components/toast";
import { Toast, ToastProvider } from "../src/toast.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const message = (overrides: Partial<ToastDescriptor> = {}): ToastDescriptor => ({
  id: "reply", title: "새 답장", description: "답장 내용을 확인해 보세요", closeLabel: "알림 닫기", ...overrides,
});

it.each(["light", "dark"] as const)("keeps full-card hit area and sibling controls independent in %s", async theme => {
  const onPress = vi.fn(), onAction = vi.fn(), onDismiss = vi.fn();
  const descriptor = message({ press: { accessibilityLabel: "답장 열기", onPress }, action: { label: "읽음 표시", onAction, dismissOnAction: false } });
  await act(async () => root.render(<HjmProvider theme={theme}><div style={{ width: 320 }}><Toast descriptor={descriptor} onDismissRequest={onDismiss} /></div></HjmProvider>));
  const card = host.querySelector<HTMLElement>(".hjm-toast")!, button = host.querySelector<HTMLButtonElement>(".hjm-toast__press")!;
  expect(button.querySelector("button")).toBeNull();
  for (const selector of [".hjm-toast__content", ".hjm-toast__icon"]) {
    const rect = card.querySelector(selector)!.getBoundingClientRect();
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(button);
  }
  const rect = card.getBoundingClientRect();
  expect(document.elementFromPoint(rect.left + 6, rect.top + rect.height / 2)).toBe(button);
  const evidenceDir = (import.meta as ImportMeta & { env: { VITE_TOAST_PRESS_EVIDENCE_DIR?: string } }).env.VITE_TOAST_PRESS_EVIDENCE_DIR;
  if (evidenceDir) {
    button.focus();
    await page.screenshot({ path: `${evidenceDir}/${theme}.png` });
  }
  await page.getByRole("button", { name: "읽음 표시", exact: true }).click();
  expect(onAction).toHaveBeenCalledOnce(); expect(onPress).not.toHaveBeenCalled(); expect(onDismiss).not.toHaveBeenCalled();
  await page.getByRole("button", { name: "답장 열기", exact: true }).click();
  await page.getByRole("button", { name: "답장 열기", exact: true }).click();
  expect(onPress).toHaveBeenCalledOnce(); expect(onDismiss).toHaveBeenCalledExactlyOnceWith("press");
});

it.each(["{Enter}", " "])("activates via %s and pauses a provider timer while focused", async key => {
  const store = createToastStore(), onPress = vi.fn(), onDismiss = vi.fn();
  store.publish(message({ durationMs: 3000, presentation: "liquid", press: { accessibilityLabel: "답장 열기", onPress }, onDismiss }));
  await act(async () => root.render(<HjmProvider reducedMotion><ToastProvider label="알림" store={store}>{null}</ToastProvider></HjmProvider>));
  await act(async () => { document.querySelector<HTMLButtonElement>(".hjm-toast__press")!.focus(); });
  expect(store.getSnapshot().visible[0]!.timer.pausedBy).toContain("focus");
  await act(async () => userEvent.keyboard(key));
  expect(onPress).toHaveBeenCalledOnce();
  await expect.poll(() => onDismiss.mock.calls[0]?.[0]).toBe("press");
  expect(document.querySelector(".hjm-toast")).toBeNull();
});

it.each(["close", "escape"])("dismisses by %s without opening the card", async control => {
  const onPress = vi.fn(), onDismiss = vi.fn();
  await act(async () => root.render(<HjmProvider><Toast descriptor={message({ press: { accessibilityLabel: "답장 열기", onPress } })} onDismissRequest={onDismiss} /></HjmProvider>));
  if (control === "close") await page.getByRole("button", { name: "알림 닫기", exact: true }).click();
  else {
    host.querySelector<HTMLButtonElement>(".hjm-toast__press")!.focus();
    await userEvent.keyboard("{Escape}");
  }
  expect(onPress).not.toHaveBeenCalled(); expect(onDismiss).toHaveBeenCalledExactlyOnceWith(control === "close" ? "close-action" : "escape");
});

it("leaves a passive toast without a card button", async () => {
  await act(async () => root.render(<HjmProvider><Toast descriptor={message()} onDismissRequest={() => {}} /></HjmProvider>));
  expect(host.querySelector(".hjm-toast__press")).toBeNull();
});

it("pauses an initially hidden document before its first visibility event", async () => {
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  try {
    const store = createToastStore(); store.publish(message());
    await act(async () => root.render(<HjmProvider><ToastProvider label="알림" store={store}>{null}</ToastProvider></HjmProvider>));
    expect(store.getSnapshot().visible[0]!.timer.pausedBy).toContain("window");
    hidden.mockReturnValue(false);
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(store.getSnapshot().visible[0]!.timer.pausedBy).not.toContain("window");
  } finally { hidden.mockRestore(); }
});
