import { act } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { AlertDialog } from "../src/overlays.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
import { tabThroughControls } from "./tab-through-controls.js";

export const alertDialogKeyboardCases = [{ componentId: "alert-dialog" }] as const;
export const alertDialogLongCopyCases = [{ componentId: "alert-dialog" }] as const;

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

it("focuses the least destructive action, traps Tab, and cancels on Escape", async () => {
  const onOpenChange = vi.fn();
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <AlertDialog
        trigger={<button type="button">Delete record</button>}
        onOpenChange={onOpenChange}
        request={{
          mode: "confirm",
          tone: "danger",
          title: "Delete record?",
          description: "This cannot be undone.",
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
        }}
      />
    </HjmProvider>,
  ));

  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  await act(async () => trigger.click());
  const alert = document.body.querySelector<HTMLElement>('[role="alertdialog"]')!;
  const [cancel, confirm] = [...alert.querySelectorAll<HTMLButtonElement>("button")];
  expect(alert.getAttribute("aria-modal")).toBe("true");
  expect(document.activeElement).toBe(cancel);

  await act(async () => tabThroughControls());
  expect(document.activeElement).toBe(confirm);
  await act(async () => tabThroughControls());
  expect(document.activeElement).toBe(cancel);
  await act(async () => tabThroughControls(true));
  expect(document.activeElement).toBe(confirm);
  await act(async () => userEvent.keyboard("{Escape}"));

  expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });
});

it("wraps long title and description inside a narrow viewport", async () => {
  const longCopy = "A long confirmation sentence with an unbroken identifier abcdefghijklmnopqrstuvwxyz0123456789 that must wrap instead of widening the viewport.";
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <AlertDialog
        open
        onOpenChange={() => undefined}
        request={{
          mode: "confirm",
          title: longCopy,
          description: longCopy,
          confirmLabel: "Confirm",
          cancelLabel: "Cancel",
        }}
      />
    </HjmProvider>,
  ));
  const dialog = document.body.querySelector<HTMLElement>('[role="alertdialog"]')!;
  const title = dialog.querySelector<HTMLElement>(".hjm-alert-dialog__title")!;
  const description = dialog.querySelector<HTMLElement>(".hjm-alert-dialog__description")!;
  expect(title.textContent).toBe(longCopy);
  expect(description.textContent).toBe(longCopy);
  expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 2);
  expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth + 2);
  expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth + 1);
});


it("locks only external confirmation without resetting an error session or blocking cancel", async () => {
  const run=vi.fn().mockRejectedValue(new Error('temporary failure')), close=vi.fn();
  const request={mode:'confirm' as const,title:'Locked choice',description:'Keep this request',confirmLabel:'Confirm',cancelLabel:'Cancel',onConfirm:run,fallbackErrorMessage:'Try again'};
  const node=(locked:boolean)=><HjmProvider reducedMotion><AlertDialog open request={request} confirmDisabled={locked} onOpenChange={close}/></HjmProvider>;
  const action=(label:string)=>document.body.querySelector<HTMLButtonElement>(`[role="alertdialog"] button[aria-label="${label}"]`)??[...document.body.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')].find(n=>n.textContent===label)!;
  await act(async()=>root.render(node(true)));
  expect(action('Confirm').disabled).toBe(true);await act(async()=>action('Confirm').click());expect(run).not.toHaveBeenCalled();
  await act(async()=>root.render(node(false)));await act(async()=>action('Confirm').click());expect(run).toHaveBeenCalledOnce();
  expect(document.body.textContent).toContain('Try again');
  await act(async()=>root.render(node(true)));expect(document.body.textContent).toContain('Try again');
  expect(action('Cancel').disabled).toBe(false);await act(async()=>action('Cancel').click());expect(close).toHaveBeenCalledWith(false,expect.anything());
});
