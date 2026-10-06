import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Dialog, Sheet } from "../src/overlays.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

function Fixture({ kind, busy = false, changed }: {
  kind: "dialog" | "sheet";
  busy?: boolean;
  changed: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const Modal = kind === "dialog" ? Dialog : Sheet;
  return <HjmProvider reducedMotion>
    <button type="button">First control</button>
    <button type="button" onClick={() => setOpen(true)}>Open modal</button>
    <Modal open={open} onOpenChange={(next) => { changed(next); setOpen(next); }}
      title="Public fixture" closeLabel="Close" busy={busy}>
      <button type="button">Inside modal</button>
    </Modal>
    <button type="button">Next control</button>
  </HjmProvider>;
}

// Diairy QA W16: synthetic mousedown dispatch misses Chrome's default blur after
// React closes the portal. Real pointer activation must preserve the return-focus contract.
it.each(["dialog", "sheet"] as const)("returns focus after a real outside click (%s)", async (kind) => {
  const changed = vi.fn();
  await act(async () => root.render(<Fixture kind={kind} changed={changed} />));
  const trigger = page.getByRole("button", { name: "Open modal", exact: true });
  await act(async () => userEvent.click(trigger));
  await expect.poll(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement)).toBe(true);
  const backdrop = document.querySelector<HTMLElement>(`[data-kind="${kind}"]`)!;
  await act(async () => page.elementLocator(backdrop).click({ position: { x: 8, y: 8 } }));
  await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  await expect.poll(() => document.activeElement?.textContent).toBe("Open modal");
  await act(async () => userEvent.tab());
  expect(document.activeElement?.textContent).toBe("Next control");
  expect(changed).toHaveBeenCalledExactlyOnceWith(false);
});

it.each(["dialog", "sheet"] as const)("keeps a busy modal focused on an outside click (%s)", async (kind) => {
  const changed = vi.fn();
  await act(async () => root.render(<Fixture kind={kind} busy changed={changed} />));
  await act(async () => userEvent.click(page.getByRole("button", { name: "Open modal", exact: true })));
  await expect.poll(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement)).toBe(true);
  const backdrop = document.querySelector<HTMLElement>(`[data-kind="${kind}"]`)!;
  await act(async () => page.elementLocator(backdrop).click({ position: { x: 8, y: 8 } }));
  expect(document.querySelector('[role="dialog"]')?.contains(document.activeElement)).toBe(true);
  expect(changed).not.toHaveBeenCalled();
});
