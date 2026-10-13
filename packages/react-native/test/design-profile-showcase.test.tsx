import { createRequire } from "node:module";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AccessibilityInfo, Platform } from "react-native";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { BottomCTA, Button, IconButton } from "@hjmds/react-native/actions";
import { TextField, SegmentedControl } from "@hjmds/react-native/inputs";
import { Text } from "@hjmds/react-native/primitives";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { Dialog, Sheet } from "@hjmds/react-native/overlays";
import { Toast } from "@hjmds/react-native/feedback";
import { FloatingActionButton } from "@hjmds/react-native/floating-action-button";
import { RecordSample, DesignProfileComparison, DesignProfileFloatingActionComparison } from "../../../showcase/native/src/design-profile-preview";
import { profileCopy as copy } from "../../../showcase/shared/design-profile";
vi.mock("expo", () => ({ requireOptionalNativeModule: () => null }));
vi.mock("../../../showcase/native/node_modules/expo", () => ({ requireOptionalNativeModule: () => null }));
// EffectSurface imports the SVG native drawing host even when only RecordSample is rendered.
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Circle: View, Defs: View, Ellipse: View, RadialGradient: View, Stop: View, Pattern: View, Rect: View, Mask: View, Image: View }; });
vi.mock("../../../showcase/native/src/toast-preview", () => ({ ToastPreview: () => null }));
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
const originalPlatform = Platform.OS;
const nodeRequire = createRequire(import.meta.url);
const assetPath = nodeRequire.resolve("../../../showcase/shared/assets/reference-icons/tick.png");
const previousPng = nodeRequire.extensions[".png"], previousAsset = nodeRequire.cache[assetPath];
// Metro supplies opaque image IDs; this harness exercises the comparison owners, not PNG decoding.

beforeEach(() => { nodeRequire.extensions[".png"] = module => { module.exports = 1; }; vi.useFakeTimers(); Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" }); });
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform }); vi.useRealTimers(); vi.restoreAllMocks(); if (previousPng) nodeRequire.extensions[".png"] = previousPng; else delete nodeRequire.extensions[".png"]; if (previousAsset) nodeRequire.cache[assetPath] = previousAsset; else delete nodeRequire.cache[assetPath]; });
const render = () => act(() => { tree = create(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.retro}><RecordSample /></HjmNativeProvider>); });
const text = () => tree!.root.findAllByType(Text).map(node => node.props.children).join(" ");
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(350); });
const save = () => act(() => tree!.root.findByType(BottomCTA).props.primaryAction.onPress());

it("keeps the first pending request outcome when queued save and failure callbacks arrive", async () => {
  render(); const actions = tree!.root.findByType(BottomCTA).props;
  act(() => { actions.primaryAction.onPress(); actions.secondaryAction.onPress(); actions.primaryAction.onPress(); });
  await tick(); expect(text()).toContain(copy.saved); expect(text()).not.toContain(copy.failed);
});

it("preserves edits and period through profile changes while reporting the saved snapshot accurately", async () => {
  render(); save();
  act(() => tree!.root.findByType(TextField).props.onValueChange("현재 초안"));
  act(() => tree!.root.findByType(SegmentedControl).props.onValueChange("week"));
  act(() => tree!.update(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.paper}><RecordSample /></HjmNativeProvider>));
  await tick(); expect(text()).toContain("현재 입력은 아직 저장하지 않았어요");
  expect(tree!.root.findByType(TextField).props.value).toBe("현재 초안");
  expect(tree!.root.findByType(SegmentedControl).props.value).toBe("week");
  save(); await tick(); expect(text()).not.toContain("현재 입력은 아직 저장하지 않았어요");
});

it("announces saving and its outcome on iOS without replaying them on a profile-only update", async () => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  render(); announce.mockClear(); save(); await tick();
  expect(announce).toHaveBeenCalledWith(copy.pending, { queue: true });
  expect(announce).toHaveBeenCalledWith(copy.saved, { queue: true });
  announce.mockClear(); act(() => tree!.update(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.paper}><RecordSample /></HjmNativeProvider>));
  expect(announce).not.toHaveBeenCalled();
});

const renderComparison = () => act(() => { tree = create(<HjmNativeProvider reducedMotion><DesignProfileComparison /></HjmNativeProvider>, { createNodeMock: () => ({ focus: vi.fn(), scrollTo: vi.fn() }) }); });
const button = (label: string) => tree!.root.findAllByType(Button).find(node => node.props.children === label)!;
const press = (label: string) => act(() => button(label).props.onPress());

it("preserves actual comparison overlay drafts and invoking return targets through profile changes", async () => {
  const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus"); renderComparison(); press(copy.dialog);
  const dialog = tree!.root.findByType(Dialog), target = dialog.props.returnFocusRef.current;
  expect(target).not.toBeNull();
  act(() => dialog.findByType(TextField).props.onValueChange("오버레이 초안 유지"));
  act(() => dialog.findAllByType(Button).find(node => node.props.children === copy.nextTheme)!.props.onPress());
  expect(tree!.root.findByType(Dialog)).toBe(dialog); expect(dialog.props.open).toBe(true);
  expect(dialog.findByType(TextField).props.value).toBe("오버레이 초안 유지");
  act(() => dialog.props.onOpenChange(false)); await tick(); expect(focus).toHaveBeenCalled();
  press(copy.sheet); const sheet = tree!.root.findByType(Sheet);
  expect(sheet.props.returnFocusRef.current).not.toBe(target); expect(sheet.findByType(TextField).props.value).toBe("오버레이 초안 유지");
  act(() => sheet.findAllByType(Button).find(node => node.props.children === copy.nextTheme)!.props.onPress());
  expect(tree!.root.findByType(Sheet)).toBe(sheet); expect(sheet.props.open).toBe(true);
  act(() => sheet.props.onOpenChange(false)); await tick(); press(copy.dialog);
  expect(tree!.root.findByType(Dialog).findByType(TextField).props.value).toBe("오버레이 초안 유지");
});

it("replays the actual comparison toast only on its explicit action after dismissal", async () => {
  renderComparison(); const first = tree!.root.findByType(Toast);
  act(() => first.findByType(IconButton).props.onPress()); await tick();
  expect(first.findAllByType(IconButton)).toHaveLength(0);
  const profile = tree!.root.findAllByType(SegmentedControl).find(node => node.props.label === copy.choose)!;
  act(() => profile.props.onValueChange("paper")); expect(tree!.root.findByType(Toast)).toBe(first);
  expect(first.findAllByType(IconButton)).toHaveLength(0); press(copy.showToast);
  expect(tree!.root.findByType(Toast)).not.toBe(first); expect(tree!.root.findByType(Toast).findAllByType(IconButton)).toHaveLength(1);
});

it("keeps native floating action count and host while changing profile and announces each committed count", () => {
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibilityWithOptions");
  act(() => { tree = create(<HjmNativeProvider reducedMotion><DesignProfileFloatingActionComparison /></HjmNativeProvider>, { createNodeMock: () => ({}) }); });
  const fab = tree!.root.findByType(FloatingActionButton); announce.mockClear();
  act(() => { fab.props.onPress(); fab.props.onPress(); });
  expect(text()).toContain(`${copy.floatingActivated}: 2`);
  expect(announce).toHaveBeenCalledWith(`${copy.floatingActivated}: 2`, { queue: true });
  announce.mockClear(); press(copy.nextTheme);
  expect(tree!.root.findByType(FloatingActionButton)).toBe(fab); expect(text()).toContain(`${copy.floatingActivated}: 2`);
  expect(announce).not.toHaveBeenCalled();
});
