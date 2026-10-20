import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { NotificationRow } from "../src/screens.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("owns one named command, guards disabled navigation, and aligns the separator with preview text", async () => {
  const host = document.createElement("div"); host.style.width = "360px"; document.body.append(host);
  const root = createRoot(host), open = vi.fn();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const frame = (disabled: boolean, interactive = true) => <HjmProvider><NotificationRow
    avatar={<span>🌱</span>} preview="A friend followed you" metadata="1 minute ago" separator unread
    {...(interactive ? { action: { label: "A friend followed you. 1 minute ago", onActivate: open, disabled } } : {})} /></HjmProvider>;
  try {
    await act(async () => root.render(frame(false)));
    const button = host.querySelector("button")!;
    expect(host.querySelectorAll("button")).toHaveLength(1);
    expect(button.getAttribute("aria-label")).toBe("A friend followed you. 1 minute ago");
    expect(host.querySelector('[data-hjm-notification-row]')?.getAttribute('aria-hidden')).toBe('true');
    const divider = host.querySelector('[data-hjm-notification-separator]')!.getBoundingClientRect();
    const copy = host.querySelector('[data-hjm-notification-copy]')!.getBoundingClientRect();
    expect(Math.abs(divider.left - copy.left)).toBeLessThan(1);
    await act(async () => button.click()); expect(open).toHaveBeenCalledOnce();
    button.focus(); expect(document.activeElement).toBe(button);
    await act(async () => root.render(frame(true)));
    await act(async () => button.click()); expect(open).toHaveBeenCalledOnce(); expect(button.disabled).toBe(true);
    await act(async () => root.render(frame(false, false)));
    expect(host.querySelectorAll("button")).toHaveLength(0);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
