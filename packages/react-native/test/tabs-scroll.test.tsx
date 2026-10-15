import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Pressable } from "react-native";
import { expect, it, vi } from "vitest";
import { Tabs } from "../src/navigation.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("updates measured underline from pager frames without changing selection", () => {
  let listener: ((position: number) => void) | undefined;
  const source = { get: () => .25, subscribe: (next: (position: number) => void) => { listener = next; return () => { listener = undefined; }; } };
  const change = vi.fn(); let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><Tabs label="Pages" value="a" onValueChange={change} swipePosition={source} items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} /></HjmNativeProvider>); });
  try {
    const tabs = tree.root.findAllByType(Pressable).filter(node => node.props.onLayout);
    act(() => { tabs[0]!.props.onLayout({ nativeEvent: { layout: { x: 0, width: 80 } } }); tabs[1]!.props.onLayout({ nativeEvent: { layout: { x: 80, width: 120 } } }); });
    const indicator = tree.root.findAllByType(Animated.View).find(node => node.props.style.position === "absolute")!;
    expect(indicator.props.style.left.current).toBe(20);
    expect(indicator.props.style.width.current).toBe(90);
    act(() => listener!(.75));
    expect(indicator.props.style.left.current).toBe(60);
    expect(indicator.props.style.width.current).toBe(110);
    expect(tabs[0]!.props.accessibilityState.selected).toBe(true);
    expect(change).not.toHaveBeenCalled();
  } finally { act(() => tree.unmount()); }
  expect(listener).toBeUndefined();
});
