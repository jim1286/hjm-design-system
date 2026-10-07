import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ClipboardButton } from "../src/clipboard.js";
import { HjmProvider } from "../src/provider.js";

let host: HTMLDivElement, root: Root;
let original: PropertyDescriptor | undefined, mounted: boolean;
const labels = { idle: "원문 복사", copied: "복사했어요" };
function deferred() {
  let resolve!: () => void, reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  host = document.createElement("div"); document.body.append(host); root = createRoot(host); mounted = true;
});
afterEach(async () => {
  if (mounted) await act(async () => root.unmount());
  host.remove();
  if (original) Object.defineProperty(navigator, "clipboard", original);
  else Reflect.deleteProperty(navigator, "clipboard");
});

it("makes a clipboard request single flight and clears its busy state after denial", async () => {
  const request = deferred(), onCopyError = vi.fn();
  const writeText = vi.fn(() => request.promise);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  await act(async () => root.render(<HjmProvider><ClipboardButton value="first" labels={labels} onCopyError={onCopyError} /></HjmProvider>));
  const button = host.querySelector("button")!;
  button.focus();
  await act(async () => { button.click(); button.click(); });
  expect(writeText).toHaveBeenCalledTimes(1);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-busy")).toBe("true");
  await act(async () => request.reject(new Error("denied")));
  expect(button.hasAttribute("aria-disabled")).toBe(false);
  expect(button.textContent).toBe(labels.idle);
  expect(onCopyError).toHaveBeenCalledTimes(1);
  expect(host.querySelector("[role=status]")!.textContent).toBe("");
});

it.each(["resolve", "reject"] as const)("ignores an obsolete %s before allowing the current source to be copied", async (outcome) => {
  const first = deferred(), second = deferred(), onCopy = vi.fn(), onCopyError = vi.fn();
  const writeText = vi.fn().mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  const render = (value: string) => root.render(<HjmProvider><ClipboardButton value={value} labels={labels} onCopy={onCopy} onCopyError={onCopyError} /></HjmProvider>);
  await act(async () => render("first"));
  await act(async () => host.querySelector("button")!.click());
  await act(async () => render("second"));
  expect(host.querySelector("button")!.getAttribute("aria-disabled")).toBe("true");
  await act(async () => host.querySelector("button")!.click());
  expect(writeText).toHaveBeenCalledTimes(1);
  await act(async () => outcome === "resolve" ? first.resolve() : first.reject(new Error("old denial")));
  expect(onCopy).not.toHaveBeenCalled(); expect(onCopyError).not.toHaveBeenCalled();
  expect(host.querySelector("button")!.hasAttribute("aria-disabled")).toBe(false);
  expect(host.querySelector("[role=status]")!.textContent).toBe("");
  await act(async () => host.querySelector("button")!.click());
  expect(writeText).toHaveBeenCalledTimes(2);
  expect(writeText).toHaveBeenLastCalledWith("second");
  await act(async () => second.resolve());
  expect(onCopy).toHaveBeenCalledExactlyOnceWith("second");
  expect(host.querySelector("button")!.disabled).toBe(false);
  expect(host.querySelector("[role=status]")!.textContent).toBe(labels.copied);
});

it("does not call product callbacks after unmount, even if the OS finishes copying", async () => {
  const request = deferred(), onCopy = vi.fn();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => request.promise } });
  await act(async () => root.render(<HjmProvider><ClipboardButton value="first" labels={labels} onCopy={onCopy} /></HjmProvider>));
  await act(async () => host.querySelector("button")!.click());
  await act(async () => root.unmount()); mounted = false;
  await act(async () => request.resolve());
  expect(onCopy).not.toHaveBeenCalled();
});

it("invalidates an old request even when the source changes away and back", async () => {
  const request = deferred(), onCopy = vi.fn();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => request.promise } });
  const render = (value: string) => root.render(<HjmProvider><ClipboardButton value={value} labels={labels} onCopy={onCopy} /></HjmProvider>);
  await act(async () => render("first"));
  await act(async () => host.querySelector("button")!.click());
  await act(async () => render("second"));
  await act(async () => render("first"));
  await act(async () => request.resolve());
  expect(onCopy).not.toHaveBeenCalled();
  expect(host.querySelector("[role=status]")!.textContent).toBe("");
  expect(host.querySelector("button")!.disabled).toBe(false);
});
