import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "@hjmds/react/provider";
import { OrderProgressRetry, OtpVerifyRecover } from "./stea-composition-previews";
import { orderCopy, otpCopy, otpExpectedCode, steaSimulatedLatencyMs } from "../../../shared/stea-compositions";
import "../../../../packages/react/src/styles.css";
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); });
const render = (kind: "order" | "otp") => act(async () => root.render(<HjmProvider reducedMotion>{kind === "order" ? <OrderProgressRetry /> : <OtpVerifyRecover />}</HjmProvider>));
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent === label)!;
const click = (label: string) => act(async () => { const node = button(label); node.focus(); node.click(); });
const tick = (ms = steaSimulatedLatencyMs) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const fill = (value: string) => act(async () => {
  const input = host.querySelector("input")!; input.focus();
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
const cooldown = async () => { for (let i = 0; i < 10; i++) await tick(1000); };

it("freezes the requested order outcome, retries its failed step and preserves the action through completion", async () => {
  await render("order");
  const fail = host.querySelector<HTMLButtonElement>('[role="switch"]')!;
  await click(orderCopy.request);
  expect(fail.disabled).toBe(true);
  await act(async () => fail.click()); await tick();
  expect(host.textContent).not.toContain(orderCopy.failed);
  await act(async () => fail.click()); await click(orderCopy.request); await tick();
  expect(host.textContent).toContain(orderCopy.failed);
  const action = button(orderCopy.retry);
  await click(orderCopy.retry); await tick();
  expect(host.textContent).not.toContain(orderCopy.failed);
  for (let i = 0; i < 2; i++) { await click(orderCopy.request); await tick(); }
  expect(host.textContent).toContain(orderCopy.done);
  expect(button(orderCopy.restart)).toBe(action);
  expect(document.activeElement).toBe(action);
  await click(orderCopy.restart);
  expect(host.textContent).not.toContain(orderCopy.done);
  expect(button(orderCopy.request)).toBe(action);
});

it("returns to the OTP input after confirmed success and a fresh attempt", async () => {
  await render("otp"); await fill(otpExpectedCode); await click(otpCopy.submit);
  expect(host.querySelector("input")!.readOnly).toBe(true);
  expect(host.textContent).not.toContain(otpCopy.successTitle);
  await tick();
  expect(document.activeElement?.textContent).toContain(otpCopy.successTitle);
  await click(otpCopy.again);
  expect(host.querySelector("input")!.value).toBe("");
  expect(document.activeElement).toBe(host.querySelector("input"));
});

it("locks after three wrong responses and restores entry on each permitted resend", async () => {
  await render("otp"); await fill("111111");
  for (let i = 0; i < 3; i++) { await click(otpCopy.submit); await tick(); }
  expect(host.textContent).toContain(otpCopy.locked);
  expect(host.querySelector("input")!.disabled).toBe(true);
  await cooldown(); await click(otpCopy.resend);
  expect(host.querySelector("input")!.disabled).toBe(false);
  expect(host.querySelector("input")!.value).toBe("");
  expect(document.activeElement).toBe(host.querySelector("input"));
  expect(host.textContent).toContain(otpCopy.resent);
  await fill("222222"); await cooldown(); await click(otpCopy.resend);
  expect(host.querySelector("input")!.value).toBe("");
  expect(document.activeElement).toBe(host.querySelector("input"));
});

it("keeps intentional outside focus when OTP verification completes", async () => {
  await render("otp"); await fill(otpExpectedCode); await click(otpCopy.submit);
  const outside = document.createElement("button"); outside.textContent = "다른 작업"; host.append(outside);
  await act(async () => outside.focus()); await tick();
  expect(host.textContent).toContain(otpCopy.successTitle);
  expect(document.activeElement).toBe(outside);
});
