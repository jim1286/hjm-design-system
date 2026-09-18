import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text } from "../src/primitives.js";
import { FloatingActionButton, useFloatingActionButtonScroll } from "../src/floating-action-button.js";
import { Button } from "../src/actions.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
afterEach(() => { if (renderer) act(() => renderer.unmount()); });

describe("Native FloatingActionButton", () => {
  it.each(["ltr", "rtl"] as const)("positions at logical end and reports measured safe-area clearance in %s", (direction) => {
    const clearance = vi.fn(); const press = vi.fn();
    act(() => { renderer = create(<HjmNativeProvider direction={direction} textScale={2} reducedMotion>
      <FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" } }} renderIcon={() => <View />}
        onContentClearanceChange={clearance} onPress={press} safeAreaBottomInset={34} />
    </HjmNativeProvider>); });
    const button = renderer.root.findByType(Button);
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ position: "absolute", bottom: 50, [direction === "rtl" ? "left" : "right"]: 16 });
    act(() => button.props.onLayout({ nativeEvent: { layout: { height: 110 } } }));
    expect(clearance).toHaveBeenLastCalledWith(176);
    expect(button.props.accessibilityLabel).toBe("새 기록"); act(() => button.props.onPress()); expect(press).toHaveBeenCalledTimes(1);
  });
  it("uses accumulated scroll direction without remounting the action or losing its name", () => {
    function Fixture() {
      const { layoutMode, onScroll } = useFloatingActionButtonScroll();
      return <ScrollView onScroll={onScroll}><FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" }, layoutMode }}
        renderIcon={() => <View />} onContentClearanceChange={() => {}} /></ScrollView>;
    }
    act(() => { renderer = create(<HjmNativeProvider reducedMotion><Fixture /></HjmNativeProvider>); });
    const button = renderer.root.findByType(Button);
    const scroll = renderer.root.findByType(ScrollView);
    const move = (y: number) => act(() => scroll.props.onScroll({ nativeEvent: { contentOffset: { y } } }));
    move(3); expect(renderer.root.findAllByType(Text).length).toBeGreaterThan(0);
    move(12); expect(renderer.root.findAllByType(Text)).toHaveLength(0); expect(renderer.root.findByType(Button)).toBe(button);
    expect(button.props.accessibilityLabel).toBe("새 기록"); expect(StyleSheet.flatten(button.props.style).width).toBe(52);
    move(12); expect(renderer.root.findAllByType(Text)).toHaveLength(0); move(0); expect(renderer.root.findAllByType(Text).length).toBeGreaterThan(0);
  });
});
