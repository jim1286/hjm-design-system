import { act, create } from "react-test-renderer";
import * as Native from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { AlertDialog } from "../src/overlays.js";
import { Select } from "../src/forms.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const originalOS = Native.Platform.OS;
const originalMetrics = Native.Keyboard.metrics;
afterEach(() => {
  Object.defineProperty(Native.Platform, "OS", { configurable: true, value: originalOS });
  Object.defineProperty(Native.Keyboard, "metrics", { configurable: true, value: originalMetrics });
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it("focuses a Select option and restores its trigger without native handles on web", async () => {
  vi.useFakeTimers();
  Object.defineProperty(Native.Platform, "OS", { configurable: true, value: "web" });
  const handle = vi.spyOn(Native, "findNodeHandle").mockImplementation(() => { throw new Error("web handle"); });
  const focus = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<HjmNativeProvider reducedMotion><Select label="시즌" placeholder="선택" dismissLabel="닫기" defaultOpen defaultSelectedKey="2025" items={[{ id: "2025", label: "2025", textValue: "2025" }]} /></HjmNativeProvider>, { createNodeMock: () => ({ focus }) });
  });
  act(() => tree.root.findByType(Native.Modal).props.onShow({}));
  expect(focus).toHaveBeenCalledOnce();
  act(() => tree.root.findByType(Native.Modal).props.onRequestClose());
  await act(async () => { await vi.runAllTimersAsync(); });
  expect(focus).toHaveBeenCalledTimes(2);
  expect(handle).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it("focuses the least destructive DOM action without native handles in an Expo web dialog", () => {
  Object.defineProperty(Native.Platform, "OS", { configurable: true, value: "web" });
  Object.defineProperty(Native.Keyboard, "metrics", { configurable: true, value: undefined });
  const nativeHandle = vi.spyOn(Native, "findNodeHandle").mockImplementation(() => { throw new Error("findNodeHandle is not supported on web"); });
  const nativeFocus = vi.spyOn(Native.AccessibilityInfo, "setAccessibilityFocus");
  const cancelFocus = vi.fn(), confirmFocus = vi.fn();
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<HjmNativeProvider reducedMotion><AlertDialog open request={{ mode: "confirm", title: "변경을 버릴까요?", description: "초안", confirmLabel: "버리기", cancelLabel: "계속 편집", onConfirm: () => undefined, fallbackErrorMessage: "오류" }} /></HjmNativeProvider>, {
      createNodeMock: element => ({ focus: (element.props as { accessibilityLabel?: string }).accessibilityLabel === "계속 편집" ? cancelFocus : confirmFocus }),
    });
  });
  act(() => tree.root.findByType(Native.Modal).props.onShow({}));
  expect(cancelFocus).toHaveBeenCalledOnce();
  expect(confirmFocus).not.toHaveBeenCalled();
  expect(nativeHandle).not.toHaveBeenCalled();
  expect(nativeFocus).not.toHaveBeenCalled();
  act(() => tree.unmount());
});
