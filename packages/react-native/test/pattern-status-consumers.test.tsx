import { AccessibilityInfo, AppState, Platform } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { SegmentedControl, TextField } from "@hjmds/react-native/inputs";
import { CommandRecordsPreview } from "../../../showcase/native/src/command-records-preview.js";
import { ServiceIntroduction } from "../../../showcase/native/src/reference-flow-previews.js";
// reference-flow-previews imports a lucide search glyph (react-native-svg), which the node host cannot load.
vi.mock("lucide-react-native", () => ({ Search: () => null }));
import { commandCopy } from "../../../showcase/shared/command-records.js";
import { profileCopy, profileOptions } from "../../../showcase/shared/design-profile.js";
let tree: ReactTestRenderer;
const originalPlatform = Platform.OS, originalState = AppState.currentState;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => { vi.useFakeTimers(); Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" }); Object.defineProperty(AppState, "currentState", { configurable: true, value: "active" }); });
afterEach(() => { act(() => tree?.unmount()); vi.useRealTimers(); Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform }); Object.defineProperty(AppState, "currentState", { configurable: true, value: originalState }); vi.restoreAllMocks(); });
const press = (label: string) => act(() => tree.root.findAllByType(Button).find(node => node.props.children === label)!.props.onPress());
const nextTheme = () => act(() => { const control = tree.root.findAllByType(SegmentedControl).find(node => node.props.label === profileCopy.choose)!; const index = profileOptions.findIndex(option => option.id === control.props.value); control.props.onValueChange(profileOptions[(index + 1) % profileOptions.length]!.id); });
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(420); });

it("announces an injected copy-error fixture once and does not replay it after dismissal", async () => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  await act(async () => { tree = create(<HjmNativeProvider reducedMotion><CommandRecordsPreview copyFailed /></HjmNativeProvider>); });
  expect(announce).toHaveBeenCalledExactlyOnceWith(commandCopy.copyError, { queue: false });
  nextTheme(); expect(announce).toHaveBeenCalledTimes(1);
  press(commandCopy.dismiss); nextTheme(); expect(announce).toHaveBeenCalledTimes(1);
});

it("announces each command request once, keeps theme rerenders quiet, and announces failure with Notice", async () => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  await act(async () => { tree = create(<HjmNativeProvider reducedMotion><CommandRecordsPreview /></HjmNativeProvider>); });
  announce.mockClear(); press(commandCopy.fail); press(commandCopy.refresh);
  expect(announce).toHaveBeenCalledExactlyOnceWith(commandCopy.pending, { queue: true });
  nextTheme(); expect(announce).toHaveBeenCalledTimes(1);
  press(commandCopy.respond); expect(announce).toHaveBeenLastCalledWith(commandCopy.failed, { queue: false });
  expect(announce).toHaveBeenCalledTimes(2);
  press(commandCopy.retry); expect(announce).toHaveBeenLastCalledWith(commandCopy.pending, { queue: true }); expect(announce).toHaveBeenCalledTimes(3);
});

it("announces the first newly mounted service result and subsequent changed results once", async () => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  await act(async () => { tree = create(<HjmNativeProvider reducedMotion><ServiceIntroduction /></HjmNativeProvider>, { createNodeMock: () => ({}) }); });
  press("첫 장면 남기기"); await settle();
  act(() => tree.root.findByType(TextField).props.onValueChange("새 장면")); announce.mockClear();
  press("미리보기에 저장"); await settle();
  expect(announce).toHaveBeenCalledExactlyOnceWith("저장한 장면: 새 장면", { queue: true });
  press("한 줄 써보기"); await settle();
  act(() => tree.root.findByType(TextField).props.onValueChange("다른 장면")); announce.mockClear();
  press("미리보기에 저장"); await settle();
  expect(announce).toHaveBeenCalledExactlyOnceWith("저장한 장면: 다른 장면", { queue: true });
});
