import { StrictMode, createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, AppState, Platform } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
// Reuse the renderer's Native host harness instead of adding another runtime to the showcase.
vi.mock("@hjmds/react-native/primitives", () => ({ Text: (props: object) => createElement("StatusText", props) }));
import { PatternStatus } from "../../../showcase/native/src/pattern-status.js";

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
