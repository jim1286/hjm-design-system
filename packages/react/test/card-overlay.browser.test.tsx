import "../src/styles.css";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Card } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";

let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: ReactNode) => act(async () => root.render(<HjmProvider>{node}</HjmProvider>));
const hit = (element: Element, xRatio = 0.5, yRatio = 0.5) => {
  const box = element.getBoundingClientRect();
  return document.elementFromPoint(box.left + box.width * xRatio, box.top + box.height * yRatio);
};

it("opens the card from its body and action gaps while the action button stays independent", async () => {
  const open = vi.fn(), remove = vi.fn();
  await render(<Card aria-label="KE123 Seoul to Tokyo" title="ICN → NRT" description="KE123" onActivate={open}
    actions={<button type="button" aria-label="Delete KE123" onClick={remove}>Delete</button>}>Departs 09:10</Card>);
  const card = host.querySelector(".hjm-card")!;
  const activator = host.querySelector<HTMLButtonElement>(".hjm-card__activator")!;
  const action = host.querySelector<HTMLButtonElement>('[aria-label="Delete KE123"]')!;
  // Pointer hit testing proves the layering: body text and the empty end of the actions row reach the activator.
  expect(hit(host.querySelector(".hjm-card__title")!)).toBe(activator);
  expect(hit(host.querySelector(".hjm-card__actions")!, 0.95)).toBe(activator);
  expect(hit(action)).toBe(action);
  await act(async () => { (hit(host.querySelector(".hjm-card__title")!) as HTMLElement).click(); action.click(); });
  expect(open).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledOnce();
  // Keyboard order: card first, then its action.
  const focusable = [...card.querySelectorAll<HTMLElement>("button")];
  expect(focusable).toEqual([activator, action]);
});
