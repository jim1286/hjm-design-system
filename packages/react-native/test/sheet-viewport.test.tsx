import { type ReactElement } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Keyboard, Platform, Pressable, ScrollView, Text as NativeText, StyleSheet, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sheetRecipe } from "@hjmds/design-contracts/recipes";
import { Dialog, Sheet, type DialogProps, type SheetProps } from "../src/overlays.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { Select } from "../src/forms.js";
import { BottomCTA } from "../src/actions.js";

// The evidence registry points to this test because it exercises Sheet viewport and dismissal actions directly.
// componentId: "sheet"
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const keyboard = Keyboard as typeof Keyboard & {
  __emit(event: string, height?: number, coordinates?: Record<string, number>): void;
};
let renderer: ReactTestRenderer | undefined;
// `title`/`accessibilityTitle` form a union pair; a Partial over the union would let the
// string-title fixture below merge into the element branch and fail to type-check.
function tree(props: Partial<Omit<SheetProps, "title">> & { title?: string } = {}, textScale: 1 | 2 = 1) {
  return <HjmNativeProvider reducedMotion textScale={textScale}>
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
  it("lets the Sheet own composed footer chrome and safe-area padding", () => {
    render(tree({ footer: <BottomCTA testID="sheet-cta" safeAreaBottom={24}
      primaryAction={{label: "Save", onPress: () => {}}} /> }));
    const cta = renderer!.root.findAllByType(View).find(node => node.props.testID === "sheet-cta")!;
    const ctaStyle = StyleSheet.flatten(cta.props.style);
    expect(ctaStyle.paddingHorizontal).toBeUndefined();
    expect(ctaStyle.borderTopWidth).toBeUndefined();
    expect(ctaStyle.paddingBottom).toBe(0);
    expect(style().paddingBottom).toBe(sheetRecipe.content.paddingBottom + 24);
  });
  it("reserves the notch outside the sheet and preserves its accessible string title", () => {
    render(tree());
    expect(positioner().props.style.paddingTop).toBe(40);
    expect(style().paddingTop).toBe(sheetRecipe.content.paddingTop);
    expect(dialog().props.accessibilityLabel).toBe("설정");
    // A default bottom sheet has no description and no ×, so no header row is drawn (2026-10-17).
    expect(renderer!.root.findAllByType(View).find((view) =>
      view.props.style?.minHeight === sheetRecipe.header.minHeight)).toBeUndefined();
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
    expect(renderer!.root.findByType(ScrollView).props.contentContainerStyle.flexGrow).toBe(1);
    const scroll = renderer!.root.findByType(ScrollView);
    expect(scroll.props).toMatchObject({ keyboardShouldPersistTaps: "handled", automaticallyAdjustKeyboardInsets: false });
    expect(scroll.findAllByType(Text).map((node) => node.props.children)).toEqual(["입력 본문"]);
    expect(dialog().findAllByType(Text).some((node) => node.props.children === "저장")).toBe(true);
  });

  // 2026-10-16: keyboard handling is on by default; an explicit opt-out still leaves the viewport alone.
  it("keeps an explicit keyboard opt-out and caps side sheets to the same usable viewport", () => {
    render(tree({ keyboardAvoidance: false }));
    act(() => keyboard.__emit("keyboardDidShow", 200));
    expect(positioner().props.style.paddingBottom).toBe(0);
    act(() => renderer!.update(tree({ keyboardAvoidance: true, placement: "end" })));
    expect(style()).toMatchObject({ height: 360, maxHeight: 360 });
  });

  it("exposes the close action and blocks it while busy", () => {
    const onOpenChange = vi.fn();
    render(tree({ onOpenChange }));
    // The handle's close action, inside the dialog (the backdrop shares closeLabel since 2026-10-17).
    const close = dialog().findAllByType(Pressable).find((node) =>
      node.props.accessibilityLabel === "닫기");
    expect(close?.props.accessibilityRole).toBe("button");
    expect(close?.props.disabled).toBe(false);
    act(() => close?.props.onPress());
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "close-action" });

    onOpenChange.mockClear();
    act(() => renderer!.update(tree({ busy: true, onOpenChange })));
    const busyClose = dialog().findAllByType(Pressable).find((node) =>
      node.props.accessibilityLabel === "닫기");
    expect(busyClose?.props.disabled).toBe(true);
    expect(busyClose?.props.accessibilityState.disabled).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("names the sheet by a long title and shows a long description without truncation", () => {
    const longCopy = "계정 설정을 확인하고 저장하기 전에 모든 변경 사항을 검토해 주세요. 이 문장은 큰 글자에서도 잘리면 안 됩니다.";
    render(tree({ title: longCopy, description: longCopy }));
    const visibleText = dialog().findAllByType(Text).map((node) => node.props.children);
    expect(visibleText).toContain(longCopy);
    // The title is the accessible name only (2026-10-17); the description is the one visible copy.
    expect(visibleText.filter((value) => value === longCopy)).toHaveLength(1);
    expect(dialog().props.accessibilityLabel).toBe(`${longCopy}, ${longCopy}`);
    expect(dialog().findAllByType(Text).every((node) => node.props.numberOfLines === undefined)).toBe(true);
  });
});

describe("Overlay element titles", () => {
  it("names the Sheet from accessibilityTitle and does not draw an element title (2026-10-17)", () => {
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
    expect(header.props.accessibilityLabel).toBe("필터 3개 적용");
    expect(dialog().findAllByType(Text).some((text) => text.props.tone === "muted" && text.props.children === "3")).toBe(false);
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


// 2026-10-07 user scope: maximum font simulations are excluded; retain historical cases without executing them.
it.skip.each(["sheet", "dialog"] as const)("keeps the %s close icon fixed while content scales to 200%%", kind => {
  const Overlay = kind === "sheet" ? Sheet : Dialog;
  const onOpenChange = vi.fn();
  render(<HjmNativeProvider reducedMotion textScale={2}>
    <Overlay open title="확대된 제목" closeLabel="닫기" onOpenChange={onOpenChange}><Text>확대된 본문</Text></Overlay>
  </HjmNativeProvider>);
  const texts = renderer!.root.findAllByType(NativeText);
  const icon = texts.find(node => node.props.children === "×")!;
  const body = texts.find(node => node.props.children === "확대된 본문")!;
  expect(icon.props.allowFontScaling).toBe(false);
  expect(icon.props.accessible).toBe(false);
  expect(StyleSheet.flatten(icon.props.style).fontSize).toBe(20);
  expect(StyleSheet.flatten(body.props.style).fontSize).toBeGreaterThan(20);
  const close = renderer!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "닫기")!;
  expect(close.props.accessibilityRole).toBe("button");
  act(() => close.props.onPress());
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "close-action" });
});

// 2026-10-17 user decisions: sheets show no visible title, and a backdrop press closes them.
describe("Sheet title and backdrop", () => {
  const visibleTexts = () => renderer!.root.findAllByType(NativeText).map((node) => node.props.children).flat();
  it("keeps the title as the accessible name and an off-layout header, never as visible text", () => {
    render(tree({ title: "필터" }));
    expect(dialog().props.accessibilityLabel).toBe("필터");
    expect(visibleTexts()).not.toContain("필터");
    const heading = renderer!.root.findAll((node) => node.props.accessibilityRole === "header" && node.props.accessibilityLabel === "필터");
    expect(heading.length).toBeGreaterThan(0);
    expect(StyleSheet.flatten(heading[0]!.props.style)).toMatchObject({ position: "absolute", width: 1, height: 1 });
  });

  it("keeps the × at the header end without a title when showClose is on", () => {
    render(tree({ title: "필터", showClose: true }));
    // The decorative handle also has a minimum touch height; identify the header by its close command.
    const header = renderer!.root.findAllByType(View).find((view) =>
      view.props.style?.minHeight === sheetRecipe.header.minHeight &&
      view.findAllByType(Pressable).some(node => node.props.accessibilityLabel === "닫기"))!;
    expect(header.props.style).toMatchObject({ alignItems: "center", flexShrink: 0, justifyContent: "flex-end" });
    expect(visibleTexts()).not.toContain("필터");
    // The backdrop is outside this dialog; only the × is a close command inside it.
    expect(dialog().findAllByType(Pressable).filter((node) => node.props.accessibilityLabel === "닫기")).toHaveLength(1);
    expect(header.findAll((node) => node.props.accessibilityLabel === "닫기" && node.props.accessibilityRole === "button").length).toBeGreaterThan(0);
  });

  function backdrop() {
    return renderer!.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === "닫기"
      && node.props.style?.position === "absolute");
  }
  it("closes a bottom sheet on a backdrop press with reason outside, named by closeLabel", () => {
    const onOpenChange = vi.fn();
    render(tree({ onOpenChange }));
    const press = backdrop()!;
    expect(press.props.accessibilityRole).toBe("button");
    act(() => press.props.onPress());
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "outside" });
  });

  it("does not close from the backdrop while busy, and leaves confirmation to the controlled owner", () => {
    const onOpenChange = vi.fn();
    render(tree({ onOpenChange, busy: true }));
    const press = backdrop()!;
    expect(press.props.disabled).toBe(true);
    act(() => press.props.onPress());
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => { renderer!.update(tree({ onOpenChange })); });
    act(() => backdrop()!.props.onPress());
    // The controlled owner kept `open` (a discard confirmation): the sheet is still rendered.
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "outside" });
    expect(dialog()).toBeDefined();
  });

  it("omits the backdrop dismiss target only for an explicit outsideDismiss: false policy", () => {
    render(tree({ dismissPolicy: { outsideDismiss: false, swipeDismiss: false } }));
    expect(backdrop()).toBeUndefined();
  });
});

describe("Native Select sheet title", () => {
  it("names the selection sheet without a visible title and keeps the × (2026-10-17)", () => {
    render(<HjmNativeProvider reducedMotion>
      <Select label="기간" placeholder="선택" open dismissLabel="닫기" optionsAccessibilityLabel="기간 선택"
        items={[{ id: "a", label: "오늘", textValue: "오늘" }]} />
    </HjmNativeProvider>);
    const sheet = renderer!.root.findAll((node) => node.props.accessibilityViewIsModal === true && node.props.accessibilityRole === "radiogroup")[0]!;
    expect(sheet.findAll((node) => node.props.accessibilityRole === "header" && node.props.accessibilityLabel === "기간").length).toBeGreaterThan(0);
    expect(sheet.findAllByType(NativeText).some((node) => node.props.children === "기간")).toBe(false);
    expect(sheet.findAll((node) => node.props.accessibilityRole === "button" && node.props.accessibilityLabel === "닫기").length).toBeGreaterThan(0);
  });
});


describe('side Sheet downward reading-panel dismissal', () => {
  it('opts into the shared handle and swipe lifecycle without changing side geometry', () => {
    const onOpenChange = vi.fn();
    render(tree({ placement: 'end', swipeDirection: 'down', showClose: false, onOpenChange }));
    expect(style().width).toBe('88%');
    const handle = renderer!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === '닫기' && StyleSheet.flatten(node.props.style)?.alignSelf === 'center')!;
    expect(StyleSheet.flatten(handle.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(StyleSheet.flatten(handle.props.style).minWidth).toBeGreaterThanOrEqual(44);
    const zone = renderer!.root.findAllByType(View).find(view => typeof view.props.onMoveShouldSetResponder === 'function')!;
    expect(zone).toBeDefined();
    expect(zone.props.onMoveShouldSetResponder({}, { dy: 100, dx: 0 })).toBe(true);
    expect(zone.props.onMoveShouldSetResponder({}, { dy: 10, dx: 100 })).toBe(false);
    act(() => dialog().props.onLayout({ nativeEvent: { layout: { height: 600 } } }));
    act(() => zone.props.onResponderRelease({}, { dy: 200, vy: 0.1 }));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'swipe' });
  });
  it('does not install a swipe responder on an ordinary or busy side Sheet', () => {
    render(tree({ placement: 'end' }));
    const zones = () => renderer!.root.findAllByType(View).filter(view => typeof view.props.onMoveShouldSetResponder === 'function');
    expect(zones()).toHaveLength(0);
    act(() => renderer!.update(tree({ placement: 'end', swipeDirection: 'down', busy: true })));
    expect(zones()).toHaveLength(0);
  });
});
