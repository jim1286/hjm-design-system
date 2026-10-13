import { StrictMode, type ComponentProps } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, AppState, Platform } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { StatusText } from "../src/status-text.js";
import { HjmNativeProvider } from "../src/provider.js";

function PatternStatus(props: ComponentProps<typeof StatusText>) {
  return <HjmNativeProvider reducedMotion><StatusText {...props} /></HjmNativeProvider>;
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
const originalPlatform = Platform.OS;
const originalState = AppState.currentState;
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: originalState });
  vi.restoreAllMocks();
});

it("announces changed iOS status once, suppressing initial copy, duplicates and background changes", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<PatternStatus>처음 상태</PatternStatus>); });
  expect(announce).not.toHaveBeenCalled();
  act(() => renderer!.update(<PatternStatus>준비됐어요</PatternStatus>));
  expect(announce).toHaveBeenCalledExactlyOnceWith("준비됐어요", { queue: true });
  act(() => renderer!.update(<PatternStatus>준비됐어요</PatternStatus>));
  expect(announce).toHaveBeenCalledTimes(1);
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "background" });
  act(() => renderer!.update(<PatternStatus>숨겨진 변경</PatternStatus>));
  expect(announce).toHaveBeenCalledTimes(1);
});

it("announces a newly mounted success once under Strict Effects and preserves Android live regions", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<StrictMode><PatternStatus announceOnMount>저장했어요</PatternStatus></StrictMode>); });
  expect(announce).toHaveBeenCalledExactlyOnceWith("저장했어요", { queue: true });
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  act(() => renderer!.update(<PatternStatus>다른 결과</PatternStatus>));
  expect(announce).toHaveBeenCalledTimes(1);
  expect(renderer!.toJSON()).toMatchObject({ props: { accessibilityLiveRegion: "polite" }, children: ["다른 결과"] });
});

it("skips empty iOS messages but announces a later nonempty result, including a repeated result after clearing", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<PatternStatus announceOnMount>{"  "}</PatternStatus>); });
  expect(announce).not.toHaveBeenCalled();
  act(() => renderer!.update(<PatternStatus>저장됐어요</PatternStatus>));
  act(() => renderer!.update(<PatternStatus tone="muted">저장됐어요</PatternStatus>));
  expect(announce).toHaveBeenCalledTimes(1);
  act(() => renderer!.update(<PatternStatus>{""}</PatternStatus>));
  expect(announce).toHaveBeenCalledTimes(1);
  act(() => renderer!.update(<PatternStatus>저장됐어요</PatternStatus>));
  expect(announce).toHaveBeenCalledTimes(2);
});

it("does not replay a background result on foreground rerender, but announces the next actual change", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "background" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<PatternStatus announceOnMount>백그라운드 결과</PatternStatus>); });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" });
  act(() => renderer!.update(<PatternStatus tone="muted">백그라운드 결과</PatternStatus>));
  expect(announce).not.toHaveBeenCalled();
  act(() => renderer!.update(<PatternStatus>새 결과</PatternStatus>));
  expect(announce).toHaveBeenCalledExactlyOnceWith("새 결과", { queue: true });
});

it("uses only Android live-region updates for initial, changed, repeated and empty messages", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<PatternStatus announceOnMount>첫 결과</PatternStatus>); });
  for (const value of ["다음 결과", "다음 결과", ""]) {
    act(() => renderer!.update(<PatternStatus>{value}</PatternStatus>));
    expect(renderer!.toJSON()).toMatchObject({ props: { accessibilityLiveRegion: "polite" } });
  }
  expect(announce).not.toHaveBeenCalled();
});

it("uses assertive iOS priority and never announces none or mode-only rerenders", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<PatternStatus announceOnMount announcement="none">숨김 상태</PatternStatus>); });
  act(() => renderer!.update(<PatternStatus announcement="assertive">숨김 상태</PatternStatus>));
  expect(announce).not.toHaveBeenCalled();
  act(() => renderer!.update(<PatternStatus announcement="assertive">저장 실패</PatternStatus>));
  expect(announce).toHaveBeenCalledExactlyOnceWith("저장 실패", { queue: false });
  act(() => renderer!.update(<PatternStatus announcement="none">다음 상태</PatternStatus>));
  act(() => renderer!.update(<PatternStatus announcement="polite">다음 상태</PatternStatus>));
  expect(announce).toHaveBeenCalledTimes(1);
});

it("maps each Android announcement mode without calling the iOS bridge", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<PatternStatus>결과</PatternStatus>); });
  for (const announcement of ["assertive", "none", "polite"] as const) {
    act(() => renderer!.update(<PatternStatus announcement={announcement} tone="muted" variant="caption">결과</PatternStatus>));
    expect(renderer!.toJSON()).toMatchObject({ props: { accessibilityLiveRegion: announcement }, children: ["결과"] });
  }
  expect(announce).not.toHaveBeenCalled();
});

it("does not retroactively announce an initial hint when announceOnMount changes", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { renderer = create(<PatternStatus>초기 안내</PatternStatus>); });
  act(() => renderer!.update(<PatternStatus announceOnMount>초기 안내</PatternStatus>));
  expect(announce).not.toHaveBeenCalled();
});
