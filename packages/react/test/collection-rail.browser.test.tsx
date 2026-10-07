import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionRail } from "../src/collection-rail.js";
import { HjmProvider } from "../src/provider.js";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import "../src/styles.css";

const items = Array.from({ length: 5 }, (_, index) => ({ id: `item-${index}`, label: `기록 ${index + 1}` }));
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "1000px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const viewport = () => host.querySelector<HTMLElement>("[data-collection-rail-viewport]")!;
const button = (text: string) => [...host.querySelectorAll("button")].find(node => node.textContent === text)!;
async function render(direction: "ltr" | "rtl" = "ltr", profile: "paper" | "forest" = "paper", collection = items, reducedMotion = true) {
  await act(async () => root.render(<HjmProvider direction={direction} reducedMotion={reducedMotion} designProfile={hjmDesignPresets[profile]}>
    <CollectionRail label="기록 모음" items={collection} labels={{ previous: "이전", next: "다음", navigation: "기록 탐색" }}
      renderItem={item => <div><button>{item.label}</button><input aria-label={`${item.id} 메모`} /></div>} />
  </HjmProvider>));
}

describe("CollectionRail real scroll host", () => {
  it("does not report a requested smooth destination as an observed viewport", async () => {
    await render("ltr", "paper", items, false);
    // Delay host movement to distinguish command delivery from viewport arrival.
    const delayedHost = vi.spyOn(viewport(), "scrollTo").mockImplementation(() => undefined);
    try {
      await act(async () => viewport().dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })));
      expect(viewport().scrollLeft).toBe(0);
      expect(host.querySelector('[data-collection-rail]')!.getAttribute('data-start-key')).toBe("item-0");
      expect(button("다음").getAttribute("aria-disabled")).not.toBe("true");
    } finally { delayedHost.mockRestore(); }
  });
  it.each(["ltr", "rtl"] as const)("exposes every interactive item and clamps physical end in %s", async direction => {
    await render(direction);
    expect(host.querySelectorAll('[role=listitem]')).toHaveLength(5);
    expect(host.querySelector('[hidden], [inert], [aria-hidden=true] input')).toBeNull();
    expect(button("이전").getAttribute("aria-disabled")).toBe("true");
    const cards = [...host.querySelectorAll<HTMLElement>('[role=listitem]')];
    const rect = viewport().getBoundingClientRect();
    expect(cards.filter(card => { const box = card.getBoundingClientRect(); return box.left >= rect.left && box.right <= rect.right; }).length).toBeGreaterThanOrEqual(2);
    await act(async () => {
      viewport().focus(); viewport().dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    });
    await vi.waitFor(() => expect(button("다음").getAttribute("aria-disabled")).toBe("true"));
    expect(Math.abs(viewport().scrollLeft)).toBe(viewport().scrollWidth - viewport().clientWidth);
    const atEnd = viewport().scrollLeft;
    await act(async () => button("다음").click()); expect(viewport().scrollLeft).toBe(atEnd);
    await act(async () => viewport().dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true })));
    expect(Math.abs(viewport().scrollLeft)).toBe(0);
  });
  it("reveals focus, yields editing arrows, and keeps keyed drafts across theme/direction/width changes", async () => {
    await render();
    const input = host.querySelectorAll<HTMLInputElement>("input")[3]!; input.value = "수정 중 기록";
    await act(async () => input.focus());
    expect(viewport().scrollLeft).toBeGreaterThan(0);
    const bounds = input.closest('[role=listitem]')!.getBoundingClientRect(), clip = viewport().getBoundingClientRect();
    expect(bounds.right).toBeLessThanOrEqual(clip.right + 1);
    const offset = viewport().scrollLeft;
    await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true })));
    expect(viewport().scrollLeft).toBe(offset);
    const anchor = host.querySelector('[data-collection-rail]')!.getAttribute('data-start-key');
    await render("rtl", "forest");
    expect(host.querySelectorAll("input")[3]).toBe(input); expect(input.value).toBe("수정 중 기록");
    expect(host.querySelector('[data-collection-rail]')!.getAttribute('data-start-key')).toBe(anchor);
    await act(async () => {
      host.style.width = "358px";
      // Observer delivery follows layout; allow two render frames, then act
      // flushes React's scheduled width update before reading the new card box.
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    expect(viewport().clientWidth).toBe(358);
    expect(input.closest('[role=listitem]')!.getBoundingClientRect().width).toBe(334);
    const focusedBounds = input.closest('[role=listitem]')!.getBoundingClientRect(), narrowBounds = viewport().getBoundingClientRect();
    expect(focusedBounds.left).toBeGreaterThanOrEqual(narrowBounds.left - 1);
    expect(focusedBounds.right).toBeLessThanOrEqual(narrowBounds.right + 1);
    expect(host.querySelectorAll("input")[3]).toBe(input);
  });
  it("reconciles removed anchors and empty collections without stale navigation", async () => {
    await render();
    await act(async () => viewport().dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })));
    await render("ltr", "paper", items.slice(0, 1));
    expect(button("이전").getAttribute("aria-disabled")).toBe("true");
    expect(button("다음").getAttribute("aria-disabled")).toBe("true");
    await render("ltr", "paper", []);
    expect(host.querySelectorAll('[role=listitem]')).toHaveLength(0);
    expect(button("다음").getAttribute("aria-disabled")).toBe("true");
  });
});
