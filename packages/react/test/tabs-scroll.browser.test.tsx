import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Tabs } from "../src/navigation.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it.each(["ltr", "rtl"] as const)("keeps the selected tab visible after its viewport shrinks (%s)", async direction => {
  const host = document.createElement("div"); host.style.width = "1000px"; document.body.append(host);
  const root = createRoot(host), change = vi.fn();
  try {
    await act(async () => root.render(<HjmProvider><Tabs direction={direction} label="Topics" value="history" onValueChange={change} overflow="scroll" renderPanels={false} items={["about", "structure", "design", "operations", "quality", "products", "history", "contact"].map(id => ({ id, label: `Portfolio ${id}` }))} /></HjmProvider>));
    const selected = host.querySelector<HTMLButtonElement>('[aria-selected="true"]')!;
    const list = selected.parentElement!;
    const pageTop = window.scrollY;
    host.style.width = "260px";
    await expect.poll(() => {
      const tab = selected.getBoundingClientRect(), rail = list.getBoundingClientRect();
      return tab.left >= rail.left - 1 && tab.right <= rail.right + 1;
    }).toBe(true);
    expect(selected.id).toContain("history");
    expect(change).not.toHaveBeenCalled();
    expect(window.scrollY).toBe(pageTop);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
it("follows fractional pager position without committing selection or trapping page gestures", async () => {
  const host = document.createElement("div"); document.body.append(host); host.style.width = "360px";
  const root = createRoot(host), change = vi.fn();
  let position = 0, listener: ((value: number) => void) | undefined;
  const source = { get: () => position, subscribe: (next: (value: number) => void) => { listener = next; return () => { listener = undefined; }; } };
  try {
    await act(async () => root.render(<HjmProvider><Tabs label="Pages" value="a" onValueChange={change} swipePosition={source} items={[{ id: "a", label: "A", panel: "A panel" }, { id: "b", label: "Long B label", panel: "B panel" }]} /></HjmProvider>));
    const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const indicator = host.querySelector<HTMLSpanElement>(".hjm-tabs__indicator")!;
    position = .35; listener!(position);
    expect(parseFloat(indicator.style.left)).toBeCloseTo(tabs[0]!.offsetLeft * .65 + tabs[1]!.offsetLeft * .35);
    expect(parseFloat(indicator.style.width)).toBeCloseTo(tabs[0]!.offsetWidth * .65 + tabs[1]!.offsetWidth * .35);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(host.querySelector('[role="tabpanel"]')?.textContent).toBe("A panel");
    expect(change).not.toHaveBeenCalled();
    listener!(99); expect(parseFloat(indicator.style.left)).toBe(tabs[1]!.offsetLeft);
  } finally { await act(async () => root.unmount()); host.remove(); }
  expect(listener).toBeUndefined();
});
it("remeasures physical RTL underline position when only the list viewport grows", async () => {
  const host = document.createElement("div"); host.style.width = "260px"; document.body.append(host);
  const root = createRoot(host);
  const source = { get: () => .5, subscribe: (_listener: (position: number) => void) => () => undefined };
  try {
    await act(async () => root.render(<HjmProvider><Tabs direction="rtl" label="Pages" swipePosition={source} items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} /></HjmProvider>));
    const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')], indicator = host.querySelector<HTMLSpanElement>(".hjm-tabs__indicator")!;
    const initial = parseFloat(indicator.style.left);
    host.style.width = "420px";
    await expect.poll(() => parseFloat(indicator.style.left)).toBeCloseTo((tabs[0]!.offsetLeft + tabs[1]!.offsetLeft) / 2);
    expect(parseFloat(indicator.style.left)).not.toBe(initial);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
