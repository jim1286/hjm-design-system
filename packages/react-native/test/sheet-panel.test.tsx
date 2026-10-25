import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "../src/provider.js";
import { SheetPanel } from "../src/sheet-panel.js";
import { sheetRecipe } from "@hjmds/design-contracts/recipes";

const state = vi.hoisted(() => ({ values: [] as { value: unknown; get(): unknown; set(next: unknown): void }[] }));

// Native drawing/scheduling hosts are replaced; the panel owns all real layout,
// measurement and toggle callbacks. This does not prove native gesture dispatch.
vi.mock("react-native-gesture-handler", () => {
  const chain = () => {
    const gesture: Record<string, unknown> = {};
    for (const method of ["maxPointers", "manualActivation", "onStart", "onUpdate", "onEnd", "onFinalize", "onTouchesDown", "onTouchesMove", "onTouchesUp"]) gesture[method] = () => gesture;
    return gesture;
  };
  return { Gesture: { Pan: chain, Native: chain, Exclusive: chain }, GestureDetector: ({ children }: { children: React.ReactNode }) => children };
});
vi.mock("react-native-reanimated", async () => {
  const { useState } = await import("react");
  const { View, ScrollView } = await import("react-native");
  return {
    default: { View, ScrollView }, cancelAnimation: () => {},
    clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
    useSharedValue(initial: unknown) {
      const [value] = useState(() => {
        const port = { value: initial, get() { return this.value; }, set(next: unknown) { this.value = next; } };
        state.values.push(port); return port;
      });
      return value;
    },
    useAnimatedStyle: (resolve: () => unknown) => resolve(),
    useAnimatedScrollHandler: (callback: unknown) => callback,
    withSpring: (value: unknown) => value, withTiming: (value: unknown) => value,
  };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("folds to its handle, keeps the map nonmodal, and preserves the snap when height changes", () => {
  const profile = defineHjmDesignProfile({ extends: "paper", tokens: { radius: { xl: 31 } } });
  const measured = vi.fn(), mapAction = vi.fn(), next = vi.fn();
  let tree!: ReactTestRenderer;
  try {
    for (const theme of ["light", "dark"] as const) {
      state.values = [];
      act(() => { tree = create(<HjmNativeProvider theme={theme} designProfile={profile} reducedMotion>
        <Pressable accessibilityLabel="Map marker" onPress={mapAction} />
        <SheetPanel testID="panel" handleLabel="Journey panel" maximumHeight={320} height={260} onHeightChange={measured}
          handleActions={[{ name: "increment", label: "Next letter" }]} onHandleAction={next} overlay={<View testID="stamp" />}>
          <Pressable accessibilityLabel="Open letter" />
        </SheetPanel>
      </HjmNativeProvider>); });
      const shell = () => tree.root.findAllByType(View).find(node => node.props.testID === "panel")!;
      const handle = () => tree.root.findAllByType(Pressable).find(node => node.props.testID === "panel-handle")!;
      const scroll = () => tree.root.findAll(node => node.props.testID === "panel-scroll" && node.props.onScroll)[0]!;
      expect(tree.root.findAllByType(Modal)).toHaveLength(0);
      expect(StyleSheet.flatten(shell().props.style)).toMatchObject({ borderTopLeftRadius: 31, borderTopRightRadius: 31 });
      expect(StyleSheet.flatten(shell().props.style).borderBottomLeftRadius).toBeUndefined();
      act(() => shell().props.onLayout({ nativeEvent: { layout: { height: 260 } } }));
      expect(measured).toHaveBeenLastCalledWith(260);
      expect(handle().props.accessibilityState.expanded).toBe(true);
      act(() => handle().props.onPress());
      expect(handle().props.accessibilityState.expanded).toBe(false);
      expect(scroll().props.accessibilityElementsHidden).toBe(true);
      expect(tree.root.findByProps({ testID: "stamp" }).parent!.props.accessibilityElementsHidden).toBe(true);
      const artwork = tree.root.findByProps({ testID: "stamp" }).parent!;
      expect(StyleSheet.flatten(artwork.props.style)).toMatchObject({ position: "absolute", top: 0, bottom: 0, opacity: 0 });
      expect(artwork.props.pointerEvents).toBe("none");
      expect(StyleSheet.flatten(shell().props.style).transform).toEqual([{ translateY: 216 }]);
      act(() => shell().props.onLayout({ nativeEvent: { layout: { height: 320 } } }));
      // The native animated style subscribes to this value; the drawing mock does not.
      expect(state.values[0]!.get()).toBe(276);
      act(() => handle().props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
      expect(next).toHaveBeenCalled();
      act(() => handle().props.onAccessibilityAction({ nativeEvent: { actionName: "activate" } }));
      expect(handle().props.accessibilityState.expanded).toBe(true);
      expect(scroll().props.accessibilityElementsHidden).toBe(false);
      expect(StyleSheet.flatten(artwork.props.style).opacity).toBe(1);
      act(() => tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "Map marker")!.props.onPress());
      expect(mapAction).toHaveBeenCalled();
      act(() => tree.unmount());
    }
  } finally { if (tree) act(() => tree.unmount()); }
});

it("keeps its body and folded handle above a covered bottom edge while the surface reaches it", () => {
  let tree!: ReactTestRenderer;
  state.values = [];
  act(() => { tree = create(<HjmNativeProvider reducedMotion>
    <SheetPanel testID="panel" handleLabel="Journey panel" safeAreaBottom={20}><Pressable accessibilityLabel="Open letter" /></SheetPanel>
  </HjmNativeProvider>); });
  const shell = tree.root.findAllByType(View).find(node => node.props.testID === "panel")!;
  const scroll = tree.root.findAll(node => node.props.testID === "panel-scroll" && node.props.onScroll)[0]!;
  act(() => shell.props.onLayout({ nativeEvent: { layout: { height: 260 } } }));
  act(() => tree.root.findAllByType(Pressable).find(node => node.props.testID === "panel-handle")!.props.onPress());
  // Folded, the 44pt handle and the 20pt covered strip stay visible: 260 - 44 - 20.
  expect(StyleSheet.flatten(shell.props.style).transform).toEqual([{ translateY: 196 }]);
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(sheetRecipe.content.paddingBottom + 20);
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => act(() => { create(<HjmNativeProvider><SheetPanel handleLabel="x" safeAreaBottom={-1}>{null}</SheetPanel></HjmNativeProvider>); })).toThrow(RangeError);
  act(() => tree.unmount());
});
