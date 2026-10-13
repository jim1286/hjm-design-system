import { act, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { Confirm, Notifications, Reactions, Duration } from "./compound-previews";
import { compoundCopy as copy, socialCopy, durationLabels } from "../../../shared/compound-controls";
import "../../../../packages/react/src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (Component: ComponentType) => act(async () => root.render(<HjmProvider reducedMotion><Component /></HjmProvider>));
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent === label || node.getAttribute("aria-label") === label)!;
const click = (label: string) => act(async () => userEvent.click(button(label)));
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 650)); });
const toggleFailure = () => act(async () => userEvent.click(host.querySelector('[role="switch"]')!));

it("captures the failure choice at confirmation, then allows failure retry and reset", async () => {
  await render(Confirm); await click(copy.confirm.label); await click(copy.confirm.confirmLabel);
  await toggleFailure(); await settle(); expect(host.textContent).toContain(copy.confirm.successLabel);
  await click(copy.reset); await click(copy.confirm.label); await click(copy.confirm.confirmLabel);
  await toggleFailure(); await settle(); expect(host.textContent).toContain(copy.confirm.errorLabel);
  await click(copy.confirm.confirmLabel); await settle(); expect(host.textContent).toContain(copy.confirm.successLabel);
});

it("keeps keyboard focus through pending and moves successful confirmation to the result", async () => {
  await render(Confirm); await click(copy.confirm.label);
  await act(async () => button(copy.confirm.confirmLabel).focus());
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(document.activeElement === button(copy.confirm.pendingLabel)).toBe(true);
  await act(async () => userEvent.keyboard("{Enter}")); await settle();
  expect(document.activeElement).toBe(host.querySelector('[role="status"]'));
});

it("preserves outside focus at completion and detaches an old attempt after reset", async () => {
  await render(Confirm); await click(copy.confirm.label); await click(copy.confirm.confirmLabel);
  const reset = button(copy.reset); await act(async () => reset.focus()); await settle();
  expect(document.activeElement).toBe(reset);
  await click(copy.reset); await click(copy.confirm.label); await click(copy.confirm.confirmLabel);
  await click(copy.reset); await settle();
  expect(button(copy.confirm.label)).toBeDefined(); expect(host.textContent).not.toContain(copy.confirm.successLabel);
});

it("accumulates batched notifications and reads the current count without losing the next arrival", async () => {
  await render(Notifications);
  await act(async () => { button(socialCopy.add).click(); button(socialCopy.add).click(); });
  expect(button(socialCopy.notifications(5))).toBeDefined();
  await act(async () => { button(socialCopy.notifications(5)).click(); button(socialCopy.add).click(); });
  expect(button(socialCopy.notifications(1))).toBeDefined();
});

it("keeps the actual duration total and single reaction in sync with their controls", async () => {
  await render(Duration); await click(durationLabels.increment("minutes")); expect(host.textContent).toContain(copy.total(1560));
  await render(Reactions); await click(socialCopy.like); expect(button(socialCopy.like).getAttribute("aria-pressed")).toBe("true");
  await click(socialCopy.love); expect(button(socialCopy.like).getAttribute("aria-pressed")).toBe("false");
  await click(socialCopy.love); expect(button(socialCopy.love).getAttribute("aria-pressed")).toBe("false");
});
