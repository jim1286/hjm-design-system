import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, AppState, View, type AppStateStatus } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastRegion, useToastRegion, type ToastRegionController } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
import { createLiquidToastPresentation } from "../src/toast-liquid.js";

// Explicit completion controls exercise canceled/stale UI-thread callbacks without claiming device motion proof.
const animations = vi.hoisted(() => ({ callbacks: [] as ((finished: boolean) => void)[] }));
vi.mock("react-native-worklets", () => ({ scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args) }));
vi.mock("react-native-reanimated", async () => {
  const { useRef } = await import("react");
  const { View } = await import("react-native");
  return { default: { View }, cancelAnimation: () => {},
    useSharedValue: (value: number) => useRef({ value }).current,
    useDerivedValue: (fn: () => unknown) => ({ get value() { return fn(); } }),
    useAnimatedStyle: (fn: () => unknown) => fn(), interpolateColor: () => "#ffffff",
    withDelay: (_ms: number, value: number) => value,
    withSpring: (value: number, _config: unknown, callback?: (done: boolean) => void) => { if (callback) animations.callbacks.push(callback); return value; },
  };
});
vi.mock("@shopify/react-native-skia", async () => {
  const { View } = await import("react-native");
  return { Canvas: View, Group: View, Paint: View, Blur: View, ColorMatrix: View, RoundedRect: View, Shadow: View };
});

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
let controller: ToastRegionController;
function Capture() { controller = useToastRegion(); return null; }
const adapter = createLiquidToastPresentation();
function root(occluded = false) { return <HjmNativeProvider theme="light"><ToastRegion placement="top" presentationAdapter={adapter} occluded={occluded}><Capture /></ToastRegion></HjmNativeProvider>; }
async function mount() { await act(async () => { renderer = create(root()); }); }
const message = (id: string) => ({ id, description: id, closeLabel: `닫기 ${id}`, presentation: "liquid" as const });
function measure() {
  const views = renderer!.root.findAllByType(View).filter(n => n.props.onLayout && !n.props.accessibilityLabel);
  const body = views[views.length - 1]!;
  act(() => body.props.onLayout({ nativeEvent: { layout: { height: 112, width: 396, x: 0, y: 0 } } }));
}
function completeMotion() { const queue = animations.callbacks.splice(0); act(() => queue.forEach(fn => fn(true))); }
afterEach(() => { if (renderer) act(() => renderer!.unmount()); renderer = undefined; animations.callbacks = []; vi.useRealTimers(); vi.restoreAllMocks(); });

describe("Native Liquid Toast lifecycle", () => {
  it("holds the readable duration through entrance and ignores obsolete callbacks after FIFO promotion", async () => {
    vi.useFakeTimers(); await mount(); const a = vi.fn(), b = vi.fn();
    act(() => { controller.publish({ ...message("a"), onDismiss: a }); controller.publish({ ...message("b"), onDismiss: b }); });
    measure(); act(() => { vi.advanceTimersByTime(6000); }); expect(a).not.toHaveBeenCalled();
    completeMotion(); act(() => { vi.advanceTimersByTime(3000); });
    act(() => { controller.publish({ ...message("a"), description: "생성 완료", onDismiss: a }); });
    act(() => { vi.advanceTimersByTime(2000); }); expect(a).not.toHaveBeenCalled();
    const oldExit = animations.callbacks.slice(); completeMotion();
    expect(a).toHaveBeenCalledExactlyOnceWith("timeout");
    act(() => oldExit.forEach(fn => fn(true))); expect(b).not.toHaveBeenCalled();
  });

  it("settles a closing animation while backgrounded and does not start the next timer there", async () => {
    vi.useFakeTimers(); let stateListener: (state: AppStateStatus) => void = () => {};
    vi.spyOn(AppState, "addEventListener").mockImplementation((_event, listener) => { stateListener = listener; return { remove() {} }; });
    await mount(); const a = vi.fn(), b = vi.fn();
    act(() => { controller.publish({ ...message("a"), onDismiss: a }); controller.publish({ ...message("b"), onDismiss: b }); });
    measure(); completeMotion(); act(() => { controller.dismiss("a", "close-action"); });
    act(() => stateListener("background")); expect(a).toHaveBeenCalledExactlyOnceWith("close-action");
    act(() => { vi.advanceTimersByTime(20000); }); expect(b).not.toHaveBeenCalled();
    act(() => stateListener("active")); act(() => { vi.advanceTimersByTime(5000); }); completeMotion();
    expect(b).toHaveBeenCalledExactlyOnceWith("timeout");
  });

  it("does not release a modal pause when entry completes", async () => {
    vi.useFakeTimers(); await mount(); const dismiss = vi.fn();
    act(() => { controller.publish({ ...message("a"), onDismiss: dismiss }); }); measure();
    act(() => renderer!.update(root(true))); completeMotion();
    act(() => { vi.advanceTimersByTime(10000); }); expect(dismiss).not.toHaveBeenCalled();
    act(() => renderer!.update(root(false))); act(() => { vi.advanceTimersByTime(5000); }); completeMotion();
    expect(dismiss).toHaveBeenCalledExactlyOnceWith("timeout");
  });

  it("uses standard accessible controls for a screen reader and executes action only once", async () => {
    vi.spyOn(AccessibilityInfo, "isScreenReaderEnabled").mockResolvedValue(true);
    await mount(); const action = vi.fn(), dismiss = vi.fn();
    await act(async () => { controller.publish({ ...message("a"), action: { label: "열기", onAction: action }, onDismiss: dismiss }); });
    const control = renderer!.root.findAll(n => n.props.accessibilityLabel === "열기" && typeof n.props.onPress === "function").at(-1)!;
    act(() => { control.props.onPress(); control.props.onPress(); });
    expect(action).toHaveBeenCalledOnce(); expect(dismiss).toHaveBeenCalledExactlyOnceWith("action");
    expect(animations.callbacks).toHaveLength(0);
  });

  it("rejects incompatible placement and accepts liquid hints without an adapter", () => {
    expect(() => act(() => { create(<HjmNativeProvider><ToastRegion presentationAdapter={adapter} /></HjmNativeProvider>); })).toThrow(/top placement/);
    act(() => { renderer = create(<HjmNativeProvider><ToastRegion defaultToasts={[message("fallback")]} /></HjmNativeProvider>); });
    expect(renderer!.root.findAll(n => n.props.accessibilityLabel === "fallback").length).toBeGreaterThan(0);
  });
});
