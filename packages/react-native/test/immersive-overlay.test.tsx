// 1.31 gap 8 (utilverse display board, 2026-10-18): an edge-to-edge presentation on the HJM overlay stack.
// 1.31 gap 9 (BurnTok folder popup): Dialog's decorative layer outside the card frame.
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { dialogRecipe } from "@hjmds/design-contracts/recipes";
import { HjmNativeProvider } from "../src/provider.js";
import { TextField } from "../src/inputs.js";
import { ScreenLayout } from "../src/screens.js";
import { Dialog, ImmersiveOverlay } from "../src/overlays.js";
import { ScrollView, View } from "react-native";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const focused: string[] = [];
let tree: ReactTestRenderer | undefined;
beforeEach(() => { vi.useFakeTimers(); focused.length = 0; });
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.useRealTimers(); });
const wrap = (node: ReactNode) => <HjmNativeProvider reducedMotion>{node}</HjmNativeProvider>;
function render(node: ReactNode) {
  act(() => { tree = create(wrap(node), {
    createNodeMock: element => element.type === "TextInput" ? { focus: () => focused.push(String((element.props as { accessibilityLabel?: string }).accessibilityLabel)), isFocused: () => false } : {},
  }); });
  act(() => { vi.runAllTimers(); });
}
const settle = () => { for (let i = 0; i < 4; i++) act(() => { vi.runAllTimers(); }); };
const modal = () => tree!.root.find(node => String(node.type) === "Modal");

it("presents full screen with the status bar hidden, rotation allowed and reasoned exits", () => {
  const onOpenChange = vi.fn();
  render(<ImmersiveOverlay open onOpenChange={onOpenChange} label="Display" exitLabel="Close" tools={null}>{null}</ImmersiveOverlay>);
  expect(modal().props.presentationStyle).toBe("fullScreen");
  expect(modal().props.supportedOrientations).toEqual(dialogRecipe.immersive.orientations);
  expect(tree!.root.find(node => String(node.type) === "StatusBar").props.hidden).toBe(true);
  expect(tree!.root.findAll(node => node.props.role === "dialog" && node.props.accessibilityLabel === "Display").length).toBeGreaterThan(0);
  act(() => modal().props.onRequestClose());
  expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "back" });
  const exit = tree!.root.findAll(node => String(node.type) === "Pressable" && typeof node.props.onPress === "function").at(-1)!;
  act(() => exit.props.onPress());
  expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "exit-action" });
});

it("keeps a screen below from taking entry focus until the presentation has torn down", () => {
  const ui = (open: boolean) => <><ScreenLayout title="Board" initialFocus="first-input"><TextField label="Text" /></ScreenLayout>
    <ImmersiveOverlay open={open} onOpenChange={() => {}} label="Display" exitLabel="Close">{null}</ImmersiveOverlay></>;
  render(ui(true));
  act(() => modal().props.onShow?.({})); settle();
  expect(focused).toEqual([]);
  act(() => tree!.update(wrap(ui(false)))); settle();
  expect(focused).toEqual(["Text"]);
});

it("draws Dialog's overlay layer outside the card, untouchable and hidden from accessibility", () => {
  render(<Dialog open onOpenChange={() => {}} title="Folder" closeLabel="Close" overlayLayer={<View testID="ghost" />}>{null}</Dialog>);
  const layer = tree!.root.find(node => node.props.pointerEvents === "none" && node.findAll(child => child.props.testID === "ghost").length > 0
    && node.children.some(child => typeof child !== "string" && child.props.testID === "ghost"));
  expect(layer.props.importantForAccessibility).toBe("no-hide-descendants");
  expect(layer.props.style).toMatchObject({ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 });
  const card = tree!.root.find(node => node.props.role === "dialog");
  expect(card.findAll(node => node.props.testID === "ghost")).toHaveLength(0);
});

it("locks the Dialog body scroll while scrollEnabled is false", () => {
  const body = (scrollEnabled?: boolean) => <Dialog open onOpenChange={() => {}} title="Folder" closeLabel="Close" {...(scrollEnabled === undefined ? {} : { scrollEnabled })}><View testID="grid" /></Dialog>;
  const scrollOf = () => tree!.root.findAllByType(ScrollView).find(node => node.findAll(child => child.props.testID === "grid").length > 0)!;
  render(body());
  expect(scrollOf().props.scrollEnabled).toBe(true);
  act(() => tree!.update(wrap(body(false))));
  expect(scrollOf().props.scrollEnabled).toBe(false);
  act(() => tree!.update(wrap(body(true))));
  expect(scrollOf().props.scrollEnabled).toBe(true);
});
