import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ContextMenu } from "../src/context-menu.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); });
const items = [{ id: "a", label: "Alpha", textValue: "Alpha" }, { id: "b", label: "Beta", textValue: "Beta" }];
const view = (disabled = false, onAction = vi.fn()) => <HjmProvider reducedMotion><ContextMenu accessibilityLabel="작업" items={items.map(item => item.id === "b" ? { ...item, disabled } : item)} onAction={onAction}><button>대상</button></ContextMenu></HjmProvider>;
const region = () => host.querySelector<HTMLElement>(".hjm-context-menu-host")!;
const touch = async (type: string, x = 20, pointerId = 1) => act(async () => region().dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: "touch", pointerId, clientX: x, clientY: 20 })));
const advance = () => act(async () => { vi.advanceTimersByTime(510); });

it.each(["pointerup", "pointercancel", "pointermove"])("cancels long press on %s and permits a fresh press after cancellation", async kind => {
  vi.useFakeTimers();
  await act(async () => root.render(view()));
  await touch("pointerdown"); await touch(kind, kind === "pointermove" ? 60 : 20); await advance();
  expect(document.querySelector('[role="menu"]')).toBeNull();
  await touch("pointerdown"); await advance();
  expect(document.querySelector('[role="menu"]')).not.toBeNull();
  await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(document.querySelector('[role="menu"]')).toBeNull();
  await touch("pointerdown"); await advance();
  expect(document.querySelector('[role="menu"]')).not.toBeNull();
});

it("cancels every pending press on replacement and unmount", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(view()));
  await touch("pointerdown", 20, 1); await touch("pointerdown", 30, 2); await touch("pointercancel", 30, 2); await advance();
  expect(document.querySelector('[role="menu"]')).toBeNull();
  await touch("pointerdown");
  await act(async () => root.render(null));
  expect(vi.getTimerCount()).toBe(0);
  await advance();
  expect(document.querySelector('[role="menu"]')).toBeNull();
});

it("keeps an enabled keyboard target when the active item becomes disabled", async () => {
  const action = vi.fn();
  await act(async () => root.render(view(false, action)));
  await act(async () => region().dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 20, clientY: 20 })));
  await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })));
  await act(async () => root.render(view(true, action)));
  expect(document.querySelector('[role="menu"] [data-active]')?.textContent).toBe("Alpha");
  await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(action).toHaveBeenCalledExactlyOnceWith("a");
});
