import { createElement, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Platform, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { ImageViewer, type ImageViewerImageRenderProps, type ImageViewerInspection } from "../src/image-viewer.js";

const engine = vi.hoisted(() => ({ state: { translateX: 0, translateY: 0, scale: 1 }, set: vi.fn(), reset: vi.fn() }));
vi.mock("react-native-gesture-handler", () => ({ GestureHandlerRootView: "GestureRoot" }));
vi.mock("react-native-zoom-toolkit", async () => {
  const { forwardRef, useImperativeHandle } = await import("react");
  return {
    Gallery: "Gallery",
    ResumableZoom: forwardRef((props: { children?: ReactNode }, ref) => {
      useImperativeHandle(ref, () => ({
        getState: () => engine.state,
        setTransformState: (state: typeof engine.state, animate: boolean) => { engine.state = state; engine.set(state, animate); },
        reset: (animate: boolean) => { engine.state = { translateX: 0, translateY: 0, scale: 1 }; engine.reset(animate); },
      }));
      return createElement("ResumableZoom", props, props.children);
    }),
  };
});
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
let host: ImageViewerImageRenderProps;
const notify = vi.fn();
const config: ImageViewerInspection = {
  mode: "double", onModeChange: () => undefined,
  labels: { mode: "보기", fit: "맞춤", double: "2배", pixels: "출력", left: "왼쪽", right: "오른쪽", up: "위", down: "아래", center: "중앙" },
  getPositionText: p => `${p.x}, ${p.y}`,
};
function render(mode: ImageViewerInspection["mode"] = "double") {
  const element = <HjmNativeProvider><ImageViewer open onClose={() => undefined}
    items={[{ id: "result", uri: "file:///result.png", label: "결과", width: 600, height: 600 }]}
    safeAreaInsets={{ top: 0, bottom: 0 }} inspection={{ ...config, mode }}
    closeLabel="닫기" previousLabel="이전" nextLabel="다음" loadingLabel="로딩" errorLabel="오류" retryLabel="재시도"
    renderImage={props => { host = props; return <View testID="image-host" />; }} onImageStatusChange={notify} /></HjmNativeProvider>;
  act(() => { if (tree) tree.update(element); else tree = create(element); });
}
function layout(width = 402, height = 454) {
  act(() => tree!.root.find(node => typeof node.props.onLayout === "function" && node.props.style?.overflow === "hidden").props.onLayout({ nativeEvent: { layout: { width, height } } }));
}
function press(label: string) {
  act(() => tree!.root.findAllByType(Button).find(node => node.props.children === label)!.props.onPress());
}
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; notify.mockClear(); engine.set.mockClear(); engine.reset.mockClear(); engine.state = { translateX: 0, translateY: 0, scale: 1 }; });

it("renders exact dimensions and lets buttons inspect both boundaries without dragging", () => {
  render(); layout();
  expect([host.width, host.height]).toEqual([804, 804]);
  expect(tree!.root.findAll(node => String(node.type) === "Gallery")).toHaveLength(0);
  press("오른쪽"); expect(engine.set).not.toHaveBeenCalled();
  act(() => host.onReady());
  press("오른쪽"); expect(engine.state.translateX).toBe(-201);
  press("왼쪽"); press("왼쪽"); expect(engine.state.translateX).toBe(201);
  press("아래"); expect(engine.state.translateY).toBe(-175);
  press("위"); expect(engine.state.translateY).toBe(175);
  press("중앙"); expect(engine.reset).toHaveBeenCalledWith(false);
  expect(engine.state).toEqual({ translateX: 0, translateY: 0, scale: 1 });
});

it("invalidates display state and old callbacks when mode or measured viewport changes", () => {
  render(); layout(); act(() => host.onReady());
  const old = host;
  render("pixels"); layout();
  expect([host.width, host.height]).toEqual([600, 600]);
  const pixels = host;
  notify.mockClear();
  act(() => { old.onReady(); old.onError(); });
  expect(notify).not.toHaveBeenCalled();
  act(() => pixels.onReady());
  layout(874, 218);
  expect(notify.mock.lastCall![0].status).toBe("loading");
  notify.mockClear(); act(() => pixels.onError());
  expect(notify).not.toHaveBeenCalled();
});

it("retries a failed custom host and disables pan where the fitted image has no overflow", () => {
  render("fit"); layout();
  const failed = host;
  act(() => failed.onError()); press("재시도");
  notify.mockClear(); act(() => failed.onReady());
  expect(notify).not.toHaveBeenCalled();
  act(() => host.onReady());
  for (const label of ["왼쪽", "오른쪽", "위", "아래"]) {
    expect(tree!.root.findAllByType(Button).find(node => node.props.children === label)!.props.disabled).toBe(true);
  }
});

it("announces completed iOS movement and ignores a retired gesture after resize or close", () => {
  const originalOS = Platform.OS;
  Object.assign(Platform, { OS: "ios" });
  const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
  try {
    render(); layout(); act(() => host.onReady());
    expect(announce).not.toHaveBeenCalled();
    const oldGesture = tree!.root.find(node => String(node.type) === "ResumableZoom").props.onGestureEnd;
    press("오른쪽"); expect(announce).toHaveBeenLastCalledWith("201, 0");
    layout(874, 218);
    announce.mockClear(); act(() => oldGesture());
    expect(announce).not.toHaveBeenCalled();
    act(() => host.onReady());
    const currentGesture = tree!.root.find(node => String(node.type) === "ResumableZoom").props.onGestureEnd;
    act(() => tree!.unmount()); tree = undefined;
    act(() => currentGesture());
    expect(announce).not.toHaveBeenCalled();
  } finally {
    announce.mockRestore(); Object.assign(Platform, { OS: originalOS });
  }
});
