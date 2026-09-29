import { createElement, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Image, BackHandler } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ImageViewer } from "../src/image-viewer.js";
import { GestureSheet } from "../src/sheet-gesture.js";
import { KeyboardDock, KeyboardMotionProvider } from "../src/keyboard-controller.js";
import { NativeContextMenu } from "../src/context-menu-native.js";
const methods = vi.hoisted(() => ({ present: vi.fn(), dismiss: vi.fn() }));
vi.mock("react-native-gesture-handler", () => ({ GestureHandlerRootView: "GestureRoot" }));
vi.mock("react-native-reanimated", () => ({ ReduceMotion: { Always: "always", System: "system" } }));
vi.mock("react-native-zoom-toolkit", () => ({ Gallery: (props: { data: unknown[]; renderItem: (item: unknown, index: number) => ReactNode; initialIndex: number }) => createElement("Gallery", props, props.renderItem(props.data[props.initialIndex], props.initialIndex)) }));
vi.mock("react-native-keyboard-controller", () => ({ KeyboardProvider: "KeyboardProvider", KeyboardStickyView: "Sticky", KeyboardAwareScrollView: "Aware" }));
vi.mock("zeego/context-menu", () => ({ Root: "ContextRoot", Trigger: "ContextTrigger", Content: "ContextContent", Item: "ContextItem", ItemTitle: "ContextTitle" }));
vi.mock("@gorhom/bottom-sheet", async () => {
  const { forwardRef, useImperativeHandle, createElement } = await import("react");
  return { BottomSheetModal: forwardRef((props: { children?: ReactNode }, ref) => { useImperativeHandle(ref, () => methods); return createElement("SheetModal", props, props.children); }), BottomSheetModalProvider: "SheetProvider", BottomSheetScrollView: "SheetScroll", BottomSheetBackdrop: "Backdrop", BottomSheetTextInput: "SheetInput" };
});
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
afterEach(() => { if (renderer) act(() => renderer!.unmount()); renderer = undefined; vi.clearAllMocks(); vi.restoreAllMocks(); });
async function render(child: ReactNode) { await act(async () => { renderer = create(<HjmNativeProvider reducedMotion>{child}</HjmNativeProvider>); }); }
const find = (name: string) => renderer!.root.find(node => node.type === name);
it("preserves keyboard clearance and does not preload the OS keyboard", async () => {
  await render(<KeyboardMotionProvider><KeyboardDock clearance={24} enabled={false}>body</KeyboardDock></KeyboardMotionProvider>);
  expect(find("KeyboardProvider").props.preload).toBe(false);
  expect(find("Sticky").props.offset).toEqual({ closed: 0, opened: -24 });
  expect(find("Sticky").props.enabled).toBe(false);
});
it("maps native actions, destructive intent and disabled guards", async () => {
  const action = vi.fn();
  await render(<NativeContextMenu items={[{ id: "delete", label: "삭제", tone: "danger" }, { id: "locked", label: "잠김", disabled: true }]} onAction={action}><span>host</span></NativeContextMenu>);
  const items = renderer!.root.findAll(node => String(node.type) === "ContextItem");
  expect(items[0]!.props.destructive).toBe(true);
  act(() => { items[0]!.props.onSelect(); items[1]!.props.onSelect(); });
  expect(action).toHaveBeenCalledExactlyOnceWith("delete");
});
it("opens the gesture sheet, respects motion/busy and cleans up BackHandler", async () => {
  let back = () => false; const remove = vi.fn(); const change = vi.fn();
  vi.spyOn(BackHandler, "addEventListener").mockImplementation((_event, fn) => { back = () => Boolean(fn()); return { remove }; });
  await render(<GestureSheet open busy onOpenChange={change} title="제목" closeLabel="닫기" snapPoints={["35%", "80%"]} initialIndex={1}>body</GestureSheet>);
  expect(methods.present).toHaveBeenCalledOnce();
  expect(find("SheetModal").props.snapPoints).toEqual(["35%", "80%"]);
  expect(find("SheetModal").props.overrideReduceMotion).toBe("always");
  expect(find("SheetModal").props.enablePanDownToClose).toBe(false);
  expect(back()).toBe(true); expect(change).not.toHaveBeenCalled();
  act(() => renderer!.unmount()); renderer = undefined; expect(remove).toHaveBeenCalled();
});
it("opens an initially closed gesture sheet without poisoning the native modal lifecycle", async () => {
  const change = vi.fn();
  const tree = (open: boolean) => <HjmNativeProvider reducedMotion><GestureSheet open={open} onOpenChange={change} title="제목" closeLabel="닫기">body</GestureSheet></HjmNativeProvider>;
  await act(async () => { renderer = create(tree(false)); });
  expect(methods.dismiss).not.toHaveBeenCalled();
  await act(async () => renderer!.update(tree(true)));
  expect(methods.present).toHaveBeenCalledTimes(1);
  // A native swipe has already dismissed the modal. Reflecting that callback
  // into controlled state must not dismiss it a second time before reopening.
  act(() => find("SheetModal").props.onDismiss());
  expect(change).toHaveBeenCalledWith(false);
  await act(async () => renderer!.update(tree(false)));
  expect(methods.dismiss).not.toHaveBeenCalled();
  await act(async () => renderer!.update(tree(true)));
  expect(methods.present).toHaveBeenCalledTimes(2);
  await act(async () => renderer!.update(tree(false)));
  expect(methods.dismiss).toHaveBeenCalledTimes(1);
});
it("shows image load failure and lets the user retry without closing", async () => {
  const close = vi.fn();
  await render(<ImageViewer safeAreaInsets={{ top: 0, bottom: 0 }} open onClose={close} items={[{ id: "one", uri: "https://example.test/photo", label: "사진" }]}
    closeLabel="닫기" previousLabel="이전" nextLabel="다음" loadingLabel="로딩" errorLabel="실패" retryLabel="재시도" />);
  const before = renderer!.root.findByType(Image);
  act(() => before.props.onError());
  expect(JSON.stringify(renderer!.toJSON())).toContain("실패");
  const retry = renderer!.root.findAll(node => typeof node.props.onPress === "function" && node.props.accessibilityLabel === "재시도")[0];
  expect(retry).toBeDefined(); act(() => retry!.props.onPress());
  expect(JSON.stringify(renderer!.toJSON())).toContain("로딩"); expect(close).not.toHaveBeenCalled();
});
