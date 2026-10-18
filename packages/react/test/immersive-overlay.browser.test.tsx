// 1.31 gap 8 (utilverse display board, 2026-10-18): an edge-to-edge presentation on the HJM modal stack.
// 1.31 gap 9 (BurnTok folder popup): Dialog's decorative layer outside the card frame.
import { act, useRef, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Dialog, ImmersiveOverlay, type ImmersiveOverlayOpenChangeReason } from "../src/overlays.js";
import "../src/styles.css";

let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: ReactNode) => act(async () => root.render(<HjmProvider>{node}</HjmProvider>));
const settle = (ms = 30) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });

function Board({ reasons }: { reasons: ImmersiveOverlayOpenChangeReason[] }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={opener} type="button" onClick={() => setOpen(true)}>Present</button>
    <ImmersiveOverlay open={open} onOpenChange={(next, { reason }) => { reasons.push(reason); setOpen(next); }} returnFocusRef={opener}
      label="Display" exitLabel="Close" tools={<button type="button">Pause</button>}>
      <p data-testid="stage">Hello</p>
    </ImmersiveOverlay>
  </>;
}

it("fills the viewport edge to edge, focuses the exit action, traps focus, and returns it on Escape and exit", async () => {
  const reasons: ImmersiveOverlayOpenChangeReason[] = [];
  await render(<Board reasons={reasons} />);
  const opener = host.querySelector("button")!;
  opener.focus(); await act(async () => opener.click()); await settle();
  const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Display"]')!;
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  const box = dialog.getBoundingClientRect();
  expect(box.left).toBe(0); expect(box.top).toBe(0);
  expect(box.width).toBe(window.innerWidth); expect(box.height).toBe(window.innerHeight);
  expect(document.activeElement?.textContent).toBe("Close");
  expect(host.inert).toBe(true);
  await act(async () => { document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); }); await settle();
  expect(reasons).toEqual(["escape"]);
  expect(document.querySelector('[aria-label="Display"]')).toBeNull();
  expect(document.activeElement).toBe(opener);
  await act(async () => opener.click()); await settle();
  await act(async () => (document.activeElement as HTMLButtonElement).click()); await settle();
  expect(reasons).toEqual(["escape", "exit-action"]);
  expect(document.activeElement).toBe(opener);
});

it("draws Dialog's overlay layer over the viewport, outside the card, inert and pointer-transparent", async () => {
  await render(<Dialog open onOpenChange={() => {}} title="Folder" closeLabel="Close"
    overlayLayer={<div data-testid="ghost" style={{ position: "absolute", left: 10, top: 10, width: 40, height: 40 }} />}>body</Dialog>);
  await settle();
  const ghost = document.querySelector<HTMLElement>('[data-testid="ghost"]')!;
  const layer = ghost.parentElement!;
  expect(layer.closest('[role="dialog"]')).toBeNull();
  expect(layer.getAttribute("aria-hidden")).toBe("true");
  expect(layer.inert).toBe(true);
  expect(getComputedStyle(layer).pointerEvents).toBe("none");
  const rect = layer.getBoundingClientRect();
  expect(rect.width).toBe(window.innerWidth); expect(rect.height).toBe(window.innerHeight);
  expect(ghost.getBoundingClientRect().left).toBe(10);
});
