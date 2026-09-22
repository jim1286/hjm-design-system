import { type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Keyboard, Platform, ScrollView, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sheetRecipe } from "@hjmds/design-contracts/recipes";
import { Sheet, type SheetProps } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const keyboard = Keyboard as typeof Keyboard & {
  __emit(event: string, height?: number, coordinates?: Record<string, number>): void;
};
let renderer: ReactTestRenderer | undefined;
function tree(props: Partial<SheetProps> = {}) {
  return <HjmNativeProvider reducedMotion textScale={2}>
    <Sheet open title="설정" closeLabel="닫기" safeAreaInsets={{ top: 40, bottom: 24 }}
      footer={<Text>저장</Text>} {...props}>
      <Text>입력 본문</Text>
    </Sheet>
  </HjmNativeProvider>;
}
function render(node: ReactElement) {
  act(() => { renderer = create(node); });
  return renderer!;
}
function dialog() {
  return renderer!.root.findAllByType(Animated.View).filter((node) => node.props.role === "dialog")[0]!;
}
function positioner() {
  return renderer!.root.findAllByType(Animated.View).filter((node) => typeof node.props.onLayout === "function")[0]!;
}
function style() { return Object.assign({}, ...dialog().props.style); }
afterEach(() => {
  act(() => { renderer?.unmount(); });
  renderer = undefined;
  keyboard.__emit("keyboardDidHide");
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  vi.restoreAllMocks();
});

describe("Sheet input viewport", () => {
  it("reserves the notch outside the sheet and preserves its accessible string title", () => {
    render(tree());
    expect(positioner().props.style.paddingTop).toBe(40);
    expect(style().paddingTop).toBe(sheetRecipe.content.paddingTop);
    expect(dialog().props.accessibilityLabel).toBe("설정");
    const header = renderer!.root.findAllByType(View).find((view) =>
      view.props.style?.minHeight === sheetRecipe.header.minHeight);
    expect(header?.props.style).toMatchObject({ alignItems: "center", flexShrink: 0 });
  });

  it("moves the sheet above a docked keyboard without adding the home inset twice", () => {
    render(tree({ keyboardAvoidance: true, size: "full" }));
    act(() => keyboard.__emit("keyboardDidShow", 200));
    expect(positioner().props.style.paddingBottom).toBe(200);
    expect(style()).toMatchObject({ height: 360, maxHeight: 360, paddingBottom: sheetRecipe.content.paddingBottom });
    act(() => keyboard.__emit("keyboardDidHide"));
    expect(positioner().props.style.paddingBottom).toBe(0);
    expect(style().paddingBottom).toBe(sheetRecipe.content.paddingBottom + 24);
  });

  it("uses the modal's measured viewport when Android already resized it", () => {
    render(tree({ keyboardAvoidance: true }));
    act(() => {
      keyboard.__emit("keyboardDidShow", 200);
      positioner().props.onLayout({ nativeEvent: { layout: { height: 400 } } });
    });
    expect(positioner().props.style.paddingBottom).toBe(0);
    expect(style().maxHeight).toBe(360);
  });

  it("reads an already open keyboard and ignores a floating keyboard", () => {
    keyboard.__emit("keyboardDidShow", 200);
    render(tree({ keyboardAvoidance: true }));
    expect(positioner().props.style.paddingBottom).toBe(200);
    act(() => keyboard.__emit("keyboardDidShow", 200, { width: 300, screenX: 100 }));
    expect(positioner().props.style.paddingBottom).toBe(0);
  });

  it("responds to iOS keyboard frame changes and releases listeners on close", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    const removed = vi.fn();
    const subscribe = Keyboard.addListener.bind(Keyboard);
    vi.spyOn(Keyboard, "addListener").mockImplementation((...args) => {
      const subscription = subscribe(...args);
      const remove = subscription.remove.bind(subscription);
      vi.spyOn(subscription, "remove").mockImplementation(() => { removed(); remove(); });
      return subscription;
    });
    render(tree({ keyboardAvoidance: true }));
    act(() => keyboard.__emit("keyboardWillChangeFrame", 260));
    expect(style().maxHeight).toBe(300);
    act(() => renderer!.update(tree({ open: false, keyboardAvoidance: true })));
    expect(removed).toHaveBeenCalledTimes(4);
  });

  it("keeps header/footer outside the scrolling body and disables duplicate UIKit clearance", () => {
    render(tree({ keyboardAvoidance: true, scrollable: true }));
    const scroll = renderer!.root.findByType(ScrollView);
    expect(scroll.props).toMatchObject({ keyboardShouldPersistTaps: "handled", automaticallyAdjustKeyboardInsets: false });
    expect(scroll.findAllByType(Text).map((node) => node.props.children)).toEqual(["입력 본문"]);
    expect(dialog().findAllByType(Text).some((node) => node.props.children === "저장")).toBe(true);
  });

  it("keeps keyboard handling opt-in and caps side sheets to the same usable viewport", () => {
    render(tree());
    act(() => keyboard.__emit("keyboardDidShow", 200));
    expect(positioner().props.style.paddingBottom).toBe(0);
    act(() => renderer!.update(tree({ keyboardAvoidance: true, placement: "end" })));
    expect(style()).toMatchObject({ height: 360, maxHeight: 360 });
  });
});
