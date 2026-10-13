import { StrictMode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import type { ToastDescriptor } from "@hjmds/design-contracts/components/toast";
import { Toast, ToastRegion, useToastRegion, type ToastRegionController } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined, controller: ToastRegionController;
function Capture() { controller = useToastRegion(); return null; }
afterEach(() => { if (renderer) act(() => renderer!.unmount()); renderer = undefined; });
const message = (overrides: Partial<ToastDescriptor> = {}): ToastDescriptor => ({ id: "reply", description: "답장이 도착했어요", closeLabel: "알림 닫기", ...overrides });
function control(label: string) {
  return renderer!.root.findAll(node => node.props.accessibilityLabel === label && typeof node.props.onPress === "function").at(-1)!;
}

it.each(["single", "region"])("activates %s card once and keeps explicit action independent", kind => {
  const onPress = vi.fn(), onAction = vi.fn(), onDismiss = vi.fn();
  const descriptor = message({ press: { accessibilityLabel: "답장 열기", onPress }, action: { label: "읽음 표시", onAction, dismissOnAction: false }, onDismiss });
  act(() => { renderer = create(<HjmNativeProvider reducedMotion>{kind === "single" ? <Toast descriptor={descriptor} /> : <ToastRegion defaultToasts={[descriptor]}><Capture /></ToastRegion>}</HjmNativeProvider>); });
  const press = control("답장 열기"), action = control("읽음 표시");
  expect(press.props.accessibilityRole).toBe("button");
  expect(press.props.accessibilityHint).toBe(descriptor.description);
  // Sibling targets, never a Pressable around the action or close button.
  expect(press.findAll(node => node.props.accessibilityLabel === "읽음 표시")).toHaveLength(0);
  act(() => { action.props.onPress(); });
  expect(onAction).toHaveBeenCalledOnce(); expect(onPress).not.toHaveBeenCalled(); expect(onDismiss).not.toHaveBeenCalled();
  act(() => { press.props.onPress(); press.props.onPress(); });
  expect(onPress).toHaveBeenCalledOnce(); expect(onDismiss).toHaveBeenCalledExactlyOnceWith("press");
});

it("preserves a press callback through controlled collection updates and close stays independent", () => {
  const onPress = vi.fn(), onChange = vi.fn(), onDismiss = vi.fn();
  const descriptor = message({ press: { accessibilityLabel: "답장 열기", onPress }, onDismiss });
  act(() => { renderer = create(<HjmNativeProvider reducedMotion><ToastRegion toasts={[descriptor]} onToastsChange={onChange}><Capture /></ToastRegion></HjmNativeProvider>); });
  act(() => { controller.publish(message({ id: "next" })); });
  expect(onChange.mock.calls.at(-1)?.[0][0].press.onPress).toBe(onPress);
  act(() => control("알림 닫기").props.onPress());
  expect(onPress).not.toHaveBeenCalled(); expect(onDismiss).toHaveBeenCalledExactlyOnceWith("close-action");
});

it("pauses while the card is focused and leaves passive cards unchanged", () => {
  act(() => { renderer = create(<HjmNativeProvider reducedMotion><ToastRegion><Capture /></ToastRegion></HjmNativeProvider>); });
  act(() => { controller.publish(message({ durationMs: 3000, press: { accessibilityLabel: "답장 열기", onPress() {} } })); });
  act(() => control("답장 열기").props.onFocus());
  const snapshot = renderer!.root.findAll(node => node.props.snapshot?.descriptor.id === "reply")[0]!.props.snapshot;
  expect(snapshot.timer.pausedBy).toContain("focus");
  act(() => control("답장 열기").props.onBlur());
  act(() => { controller.dismiss("reply"); controller.publish(message({ id: "passive" })); });
  expect(renderer!.root.findAll(node => node.props.accessibilityLabel === "답장 열기")).toHaveLength(0);
});

it("keeps a standalone toast active across StrictMode effect replay", async () => {
  const onPress = vi.fn(), onDismiss = vi.fn();
  await act(async () => { renderer = create(<StrictMode><HjmNativeProvider reducedMotion><Toast descriptor={message({ press: { accessibilityLabel: "Open", onPress }, onDismiss })} /></HjmNativeProvider></StrictMode>); });
  expect(onDismiss).not.toHaveBeenCalled();
  act(() => control("Open").props.onPress());
  expect(onPress).toHaveBeenCalledOnce();
  expect(onDismiss).toHaveBeenCalledExactlyOnceWith("press");
});

it("preserves elapsed visible time when a standalone toast is paused", async () => {
  vi.useFakeTimers();
  try {
    const onDismiss = vi.fn();
    await act(async () => { renderer = create(<HjmNativeProvider reducedMotion><Toast descriptor={message({ durationMs: 3000, onDismiss })} /></HjmNativeProvider>); });
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    act(() => control("알림 닫기").props.onFocus());
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => control("알림 닫기").props.onBlur());
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(onDismiss).toHaveBeenCalledExactlyOnceWith("timeout");
  } finally { vi.useRealTimers(); }
});
