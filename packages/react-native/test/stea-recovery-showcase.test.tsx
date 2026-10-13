import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AccessibilityInfo, Platform } from "react-native";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { OtpField, Switch } from "@hjmds/react-native/inputs";
import { Notice, Result } from "@hjmds/react-native/feedback";
import { Steps } from "@hjmds/react-native/steps";
import { OrderProgressRetry, OtpVerifyRecover } from "../../../showcase/native/src/stea-composition-previews";
import { orderCopy, otpCopy, otpExpectedCode, steaSimulatedLatencyMs } from "../../../showcase/shared/stea-compositions";
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
vi.mock("lucide-react-native", () => ({ Check: () => null }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
const inputFocus = vi.fn();
const originalPlatform = Platform.OS;
beforeEach(() => { vi.useFakeTimers(); inputFocus.mockClear(); Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" }); });
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform }); vi.useRealTimers(); vi.restoreAllMocks(); });
const render = (kind: "order" | "otp") => act(() => { tree = create(<HjmNativeProvider reducedMotion>{kind === "order" ? <OrderProgressRetry /> : <OtpVerifyRecover />}</HjmNativeProvider>, { createNodeMock: () => ({ focus: inputFocus }) }); });
const button = (label: string) => tree!.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());
const tick = (ms = steaSimulatedLatencyMs) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const cooldown = async () => { for (let i = 0; i < 10; i++) await tick(1000); };

it("locks the order failure setting and ignores queued changes until the request settles", async () => {
  render("order"); const toggle = tree!.root.findByType(Switch).props.onCheckedChange;
  const request = button(orderCopy.request).props.onPress;
  act(() => { request(); toggle(); request(); });
  expect(tree!.root.findByType(Switch).props.disabled).toBe(true);
  await tick();
  expect(tree!.root.findAllByType(Notice)).toHaveLength(0);
  expect(tree!.root.findByType(Steps).props.descriptor.currentStepId).toBe("packed");
  act(() => toggle()); press(orderCopy.request); await tick();
  expect(tree!.root.findByType(Notice).props.title).toBe(orderCopy.failed);
  press(orderCopy.retry); await tick();
  expect(tree!.root.findByType(Steps).props.descriptor.currentStepId).toBe("shipped");
});

it("announces confirmed OTP success and returns a fresh attempt to its input", async () => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  render("otp"); act(() => tree!.root.findByType(OtpField).props.onValueChange(otpExpectedCode));
  expect(tree!.root.findByType(OtpField).props.busy).toBe(true);
  expect(tree!.root.findAllByType(Result)).toHaveLength(0);
  await tick(); await tick(20);
  expect(tree!.root.findByType(Result).props.title).toBe(otpCopy.successTitle);
  expect(announce).toHaveBeenCalledWith(`${otpCopy.successTitle}. ${otpCopy.successBody}`, { queue: true });
  act(() => tree!.root.findByType(Result).props.actions[0].onAction()); await tick(20);
  expect(tree!.root.findByType(OtpField).props.value).toBe("");
  expect(inputFocus).toHaveBeenCalledTimes(1);
});

it("restores the OTP input after lock and both first and subsequent resends", async () => {
  render("otp"); act(() => tree!.root.findByType(OtpField).props.onValueChange("111111")); await tick();
  for (let i = 0; i < 2; i++) { press(otpCopy.submit); await tick(); }
  expect(tree!.root.findByType(OtpField).props.error).toBe(otpCopy.locked);
  await cooldown(); press(otpCopy.resend); await tick(20);
  expect(tree!.root.findByType(OtpField).props.value).toBe("");
  expect(inputFocus).toHaveBeenCalledTimes(1);
  await cooldown(); press(otpCopy.resend); await tick(20);
  expect(inputFocus).toHaveBeenCalledTimes(2);
});

it("releases pending verification and cooldown timers when the preview is removed", async () => {
  render("otp"); act(() => tree!.root.findByType(OtpField).props.onValueChange(otpExpectedCode));
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  act(() => tree!.unmount()); tree = undefined;
  await tick(20);
  expect(vi.getTimerCount()).toBe(0);
});
