import { type ReactElement } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Keyboard, Platform, Pressable, ScrollView, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sheetRecipe } from "@hjmds/design-contracts/recipes";
import { Dialog, Sheet, type DialogProps, type SheetProps } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";

// The evidence registry points to this test because it exercises Sheet viewport and dismissal actions directly.
// componentId: "sheet"
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const keyboard = Keyboard as typeof Keyboard & {
  __emit(event: string, height?: number, coordinates?: Record<string, number>): void;
};
let renderer: ReactTestRenderer | undefined;
// `title`/`accessibilityTitle` form a union pair; a Partial over the union would let the
// string-title fixture below merge into the element branch and fail to type-check.
function tree(props: Partial<Omit<SheetProps, "title">> & { title?: string } = {}) {
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

  it("accepts density-rounded full-width keyboard coordinates", () => {
    render(tree({ keyboardAvoidance: true }));
    act(() => keyboard.__emit("keyboardDidShow", 200, { width: 799.99998, screenX: 0.00001 }));
    expect(positioner().props.style.paddingBottom).toBe(200);
    act(() => keyboard.__emit("keyboardDidShow", 200, { width: 600, screenX: 100 }));
    expect(positioner().props.style.paddingBottom).toBe(0);
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

  it("exposes the close action and blocks it while busy", () => {
    const onOpenChange = vi.fn();
    render(tree({ onOpenChange }));
    const close = renderer!.root.findAllByType(Pressable).find((node) =>
      node.props.accessibilityLabel === "닫기");
    expect(close?.props.accessibilityRole).toBe("button");
    expect(close?.props.disabled).toBe(false);
    act(() => close?.props.onPress());
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "close-action" });

    onOpenChange.mockClear();
    act(() => renderer!.update(tree({ busy: true, onOpenChange })));
    const busyClose = renderer!.root.findAllByType(Pressable).find((node) =>
      node.props.accessibilityLabel === "닫기");
    expect(busyClose?.props.disabled).toBe(true);
    expect(busyClose?.props.accessibilityState.disabled).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("preserves long title and description without truncation at large text", () => {
    const longCopy = "계정 설정을 확인하고 저장하기 전에 모든 변경 사항을 검토해 주세요. 이 문장은 큰 글자에서도 잘리면 안 됩니다.";
    render(tree({ title: longCopy, description: longCopy }));
    const visibleText = dialog().findAllByType(Text).map((node) => node.props.children);
    expect(visibleText).toContain(longCopy);
    expect(visibleText.filter((value) => value === longCopy)).toHaveLength(2);
    expect(dialog().findAllByType(Text).every((node) => node.props.numberOfLines === undefined)).toBe(true);
  });
});

describe("Overlay element titles", () => {
  it("renders an element title in the Sheet header and names the modal from accessibilityTitle", () => {
    render(
      <HjmNativeProvider reducedMotion>
        <Sheet open closeLabel="닫기" title={<Text variant="title">필터 <Text tone="muted">3</Text></Text>}
          accessibilityTitle="필터 3개 적용" description="현재 조건">
          <Text>본문</Text>
        </Sheet>
      </HjmNativeProvider>,
    );
    expect(dialog().props.accessibilityLabel).toBe("필터 3개 적용, 현재 조건");
    const header = renderer!.root.findAll((node) => node.props.accessibilityRole === "header")[0]!;
    expect(header.findAllByType(Text).some((text) => text.props.tone === "muted")).toBe(true);
  });

  it("lets accessibilityTitle override a string title and keeps the string title as the default name", () => {
    render(tree({ accessibilityTitle: "설정 화면" }));
    expect(dialog().props.accessibilityLabel).toBe("설정 화면");
    act(() => { renderer?.unmount(); });
    render(
      <HjmNativeProvider reducedMotion>
        <Dialog open closeLabel="닫기" title={<Text variant="title">삭제할까요?</Text>} accessibilityTitle="삭제 확인" />
      </HjmNativeProvider>,
    );
    const boundary = renderer!.root.findAll((node) => node.props.role === "dialog")[0]!;
    expect(boundary.props.accessibilityLabel).toBe("삭제 확인");
  });

  it("requires accessibilityTitle at the type level only when the title is an element", () => {
    const stringTitle: SheetProps = { title: "설정", closeLabel: "닫기" };
    const elementTitle: DialogProps = { title: <Text>설정</Text>, accessibilityTitle: "설정", closeLabel: "닫기" };
    // @ts-expect-error -- an element title without an accessible name would leave the modal unnamed
    const unnamed: SheetProps = { title: <Text>설정</Text>, closeLabel: "닫기" };
    expect([stringTitle, elementTitle, unnamed].length).toBe(3);
  });
});
