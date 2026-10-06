import { createElement, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Image, Modal, StyleSheet, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { ImageViewer, type ImageViewerImageRenderProps, type ImageViewerProps } from "../src/image-viewer.js";

vi.mock("react-native-gesture-handler", () => ({ GestureHandlerRootView: "GestureRoot" }));
vi.mock("react-native-zoom-toolkit", () => ({
  Gallery: (props: { data: unknown[]; renderItem: (item: unknown) => ReactNode; initialIndex: number }) =>
    createElement("Gallery", props, props.renderItem(props.data[props.initialIndex])),
}));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const base = {
  open: true, items: [{ id: "photo", uri: "file:///A.png", label: "결과 사진" }],
  onClose: () => undefined, safeAreaInsets: { top: 0, bottom: 0 },
  closeLabel: "닫기", previousLabel: "이전", nextLabel: "다음",
  loadingLabel: "불러오는 중", errorLabel: "표시 실패", retryLabel: "재시도",
} satisfies ImageViewerProps;
function render(props: Partial<ImageViewerProps> = {}) {
  act(() => {
    const element = <HjmNativeProvider><ImageViewer {...base} {...props} /></HjmNativeProvider>;
    if (tree) tree.update(element); else tree = create(element);
  });
}

it("waits for the product display callback and delivers the host's item and viewport", () => {
  let host!: ImageViewerImageRenderProps;
  const notify = vi.fn();
  render({ onImageStatusChange: notify, renderImage: props => { host = props; return <View testID="expo-host" />; } });
  expect(tree!.root.findAllByType(Image)).toHaveLength(0);
  expect(host.item).toEqual(base.items[0]);
  expect(host.width).toBeGreaterThan(0);
  expect(host.height).toBeGreaterThan(0);
  expect(notify.mock.calls.map(([event]) => event.status)).toEqual(["loading"]);
  act(() => host.onReady());
  expect(notify.mock.calls.map(([event]) => event.status)).toEqual(["loading", "ready"]);
  expect(notify.mock.lastCall![0].item.uri).toBe("file:///A.png");
  act(() => host.onReady());
  expect(notify).toHaveBeenCalledTimes(2);
});

it("keeps failure terminal and ignores old display/error callbacks after retry", () => {
  let host!: ImageViewerImageRenderProps;
  const notify = vi.fn();
  render({ onImageStatusChange: notify, renderImage: props => { host = props; return <View />; } });
  const failed = host;
  act(() => { failed.onError(); failed.onReady(); });
  expect(notify.mock.calls.map(([event]) => event.status)).toEqual(["loading", "error"]);
  act(() => tree!.root.findAllByType(Button).find(node => node.props.children === "재시도")!.props.onPress());
  const replacement = host;
  act(() => { failed.onReady(); failed.onError(); });
  expect(notify.mock.calls.map(([event]) => event.status)).toEqual(["loading", "error", "loading"]);
  act(() => replacement.onReady());
  expect(notify.mock.calls.map(([event]) => event.status)).toEqual(["loading", "error", "loading", "ready"]);
});

it("rejects callbacks from replaced A→B→A sessions and from a closed viewer", () => {
  let host!: ImageViewerImageRenderProps;
  const notify = vi.fn();
  const renderImage = (props: ImageViewerImageRenderProps) => { host = props; return <View />; };
  render({ renderImage, onImageStatusChange: notify });
  const oldA = host;
  render({ renderImage, onImageStatusChange: notify, items: [{ ...base.items[0]!, uri: "file:///B.png" }] });
  const oldB = host;
  render({ renderImage, onImageStatusChange: notify });
  const newA = host;
  notify.mockClear();
  act(() => { oldA.onReady(); oldB.onError(); });
  expect(notify).not.toHaveBeenCalled();
  act(() => newA.onReady());
  expect(notify).toHaveBeenCalledExactlyOnceWith({ item: base.items[0], status: "ready" });
  render({ open: false, renderImage, onImageStatusChange: notify });
  notify.mockClear();
  act(() => { newA.onReady(); newA.onError(); });
  expect(notify).not.toHaveBeenCalled();
});

it("retains RN Image load semantics when no custom host is supplied", () => {
  const notify = vi.fn();
  render({ onImageStatusChange: notify });
  act(() => tree!.root.findByType(Image).props.onLoad());
  expect(notify.mock.calls.map(([event]) => event.status)).toEqual(["loading", "ready"]);
  act(() => tree!.root.findByType(Image).props.onError());
  expect(notify.mock.lastCall![0].status).toBe("error");
});

it("resets the session when collection IDs and URIs collide under delimiter joining", () => {
  let host!: ImageViewerImageRenderProps;
  const notify = vi.fn();
  const renderImage = (props: ImageViewerImageRenderProps) => { host = props; return <View />; };
  // Both collections previously had the same session key: a:x|b:y|c:z.
  const first = [{ id: "a", uri: "x|b:y", label: "A" }, { id: "c", uri: "z", label: "C" }];
  const second = [{ id: "a", uri: "x", label: "A" }, { id: "b:y|c", uri: "z", label: "C" }];
  render({ renderImage, onImageStatusChange: notify, items: first, initialIndex: 1 });
  const old = host;
  act(() => old.onReady());
  notify.mockClear();
  render({ renderImage, onImageStatusChange: notify, items: second, initialIndex: 1 });
  expect(notify).toHaveBeenCalledExactlyOnceWith({ item: second[1], status: "loading" });
  act(() => old.onError());
  expect(notify).toHaveBeenCalledTimes(1);
});

it("forwards product orientation and keeps controls and feedback inside asymmetric cutouts", () => {
  render({ safeAreaInsets: { top: 0, bottom: 21, left: 59, right: 0 }, supportedOrientations: ["portrait", "landscape"] });
  const modal = tree!.root.findByType(Modal);
  expect(modal.props.presentationStyle).toBe("fullScreen");
  expect(modal.props.supportedOrientations).toEqual(["portrait", "landscape"]);
  const close = tree!.root.findAllByType(Button).find(node => node.props.children === "닫기")!;
  const next = tree!.root.findAllByType(Button).find(node => node.props.children === "다음")!;
  for (const node of [close, next]) {
    const style = StyleSheet.flatten(node.parent!.props.style);
    expect(style.paddingLeft - style.paddingRight).toBe(59);
    expect(style.paddingRight).toBeGreaterThan(0);
    expect(node.props.growWithContent).toBe(true);
  }
  const feedback = tree!.root.find(node => node.props.pointerEvents === "box-none");
  const style = StyleSheet.flatten(feedback.props.style);
  expect(style.paddingLeft - style.paddingRight).toBe(59);
});

it("re-measures the image viewport after a rotation layout without using screen aspect ratios", () => {
  let host!: ImageViewerImageRenderProps;
  render({ renderImage: props => { host = props; return <View />; } });
  const layout = tree!.root.find(node => typeof node.props.onLayout === "function");
  act(() => layout.props.onLayout({ nativeEvent: { layout: { width: 874, height: 218 } } }));
  expect({ width: host.width, height: host.height }).toEqual({ width: 874, height: 218 });
  act(() => layout.props.onLayout({ nativeEvent: { layout: { width: 402, height: 590 } } }));
  expect({ width: host.width, height: host.height }).toEqual({ width: 402, height: 590 });
});
