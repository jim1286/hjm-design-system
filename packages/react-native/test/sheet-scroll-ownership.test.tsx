import type { ReactNode } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Platform, ScrollView, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { Sheet, SheetScrollView } from "../src/overlays.js";
import { Select, Combobox } from "../src/forms.js";
import { ScreenLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => tree?.unmount()); tree = undefined;
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
});
function render(children: ReactNode) {
  act(() => { tree = create(<HjmNativeProvider reducedMotion>{children}</HjmNativeProvider>); });
}
const event = (y: number, velocity = 0) => ({ nativeEvent: { contentOffset: { y }, velocity: { y: velocity } } });
const scroll = () => tree!.root.findByType(Animated.ScrollView);
const capture = (node: ReactTestInstance) => node.props.onMoveShouldSetResponderCapture({}, { dy: 30, dx: 0 });
const wrapper = (child: ReactTestInstance) => tree!.root.findAllByType(View).filter(node =>
  typeof node.props.onTouchStartCapture === "function" && node.findAllByType(child.type).includes(child),
).at(-1)!;
function touch(child: ReactTestInstance) { act(() => wrapper(child).props.onTouchStartCapture()); }
const close = vi.fn();
const sheet = (children: ReactNode, scrollable = false) => <Sheet open title="List" closeLabel="Close" onOpenChange={close} scrollable={scrollable}>{children}</Sheet>;
const items = [{ id: "a", label: "A", textValue: "A" }, { id: "b", label: "B", textValue: "B" }];

it.each(["Select", "Combobox"])("%s gives a mid-list downward drag to the list and a fresh top drag to the Sheet", kind => {
  render(kind === "Select"
    ? <Select open label="Metric" items={items} placeholder="Pick" dismissLabel="Close" />
    : <Combobox open label="Unit" items={items} inputValue="" onInputValueChange={() => {}} emptyMessage="No results" loadingMessage="Loading" clearLabel="Clear" placeholder="Search" dismissLabel="Close" />);
  act(() => scroll().props.onScroll(event(120)));
  touch(scroll());
  expect(capture(wrapper(scroll()))).toBe(false);
  act(() => scroll().props.onScroll(event(0)));
  expect(capture(wrapper(scroll()))).toBe(false); // The same gesture still belongs to the list.
  touch(scroll());
  expect(capture(wrapper(scroll()))).toBe(true);
});

it("ScreenLayout inside a plain Sheet shares its offset without swallowing the product scroll listener", () => {
  const tracked = vi.fn();
  render(sheet(<ScreenLayout title="Settings" scrollProps={{ onScroll: tracked }}><View /></ScreenLayout>));
  act(() => scroll().props.onScroll(event(90)));
  expect(tracked).toHaveBeenCalledOnce();
  touch(scroll());
  expect(capture(wrapper(scroll()))).toBe(false);
});

it("a scrollable Sheet keeps a gesture that started mid-list even after reaching the top", () => {
  render(sheet(<View />, true));
  act(() => scroll().props.onScroll(event(120)));
  touch(scroll());
  expect(capture(wrapper(scroll()))).toBe(false);
  act(() => scroll().props.onScroll(event(0)));
  expect(capture(wrapper(scroll()))).toBe(false);
  touch(scroll());
  expect(capture(wrapper(scroll()))).toBe(true);
});

it("an upward or sideways body gesture cannot reverse into Sheet dismissal", () => {
  render(sheet(<SheetScrollView><View /></SheetScrollView>));
  touch(scroll());
  const body = wrapper(scroll());
  expect(body.props.onMoveShouldSetResponderCapture({}, { dy: -30, dx: 0 })).toBe(false);
  expect(capture(body)).toBe(false);
  touch(scroll());
  expect(body.props.onMoveShouldSetResponderCapture({}, { dy: 0, dx: 30 })).toBe(false);
  expect(capture(body)).toBe(false);
});

it("an input wheel keeps its drag and a later handle touch still dismisses", () => {
  close.mockClear();
  render(sheet(<SheetScrollView gestureRole="input"><View /></SheetScrollView>));
  const input = tree!.root.findByType(ScrollView);
  touch(input);
  const zone = tree!.root.findAllByType(View).find(node => typeof node.props.onMoveShouldSetResponder === "function")!;
  expect(zone.props.onMoveShouldSetResponder({}, { dy: 200, dx: 0 })).toBe(false);
  const dialog = tree!.root.findAllByType(Animated.View).find(node => node.props.role === "dialog")!;
  act(() => { dialog.props.onTouchStartCapture(); dialog.props.onLayout({ nativeEvent: { layout: { height: 600 } } }); });
  expect(zone.props.onMoveShouldSetResponder({}, { dy: 200, dx: 0 })).toBe(true);
  act(() => zone.props.onResponderRelease({}, { dy: 200, vy: 0.1 }));
  expect(close).toHaveBeenCalledWith(false, { reason: "swipe" });
});

it("a deeper code scroller prevents the outer scrollable Sheet from claiming its touch", () => {
  render(sheet(<SheetScrollView gestureRole="input" testID="code"><View /></SheetScrollView>, true));
  const outer = scroll();
  touch(outer);
  const input = tree!.root.findByType(ScrollView);
  touch(input);
  expect(capture(wrapper(outer))).toBe(false);
});

it("a nested body scroller claims ownership after the outer body captures the touch", () => {
  render(sheet(<SheetScrollView><SheetScrollView testID="inner"><View /></SheetScrollView></SheetScrollView>));
  const outer = scroll(); touch(outer);
  touch(tree!.root.findByType(ScrollView));
  expect(capture(wrapper(outer))).toBe(false);
});

it("iOS allows a new top pull, but never a drag that started mid-list or first scrolled upward", () => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  close.mockClear();
  render(sheet(<SheetScrollView><View /></SheetScrollView>));
  const dialog = tree!.root.findAllByType(Animated.View).find(node => node.props.role === "dialog")!;
  act(() => { dialog.props.onLayout({ nativeEvent: { layout: { height: 600 } } }); scroll().props.onLayout({ nativeEvent: { layout: { height: 500 } } }); });
  act(() => scroll().props.onScroll(event(100))); touch(scroll());
  act(() => { scroll().props.onScrollBeginDrag(event(100)); scroll().props.onScrollEndDrag(event(-100, -2)); });
  expect(close).not.toHaveBeenCalled();
  act(() => scroll().props.onScroll(event(0))); touch(scroll());
  act(() => { scroll().props.onScrollBeginDrag(event(0)); scroll().props.onScroll(event(50)); scroll().props.onScrollEndDrag(event(-100, -2)); });
  expect(close).not.toHaveBeenCalled();
  act(() => scroll().props.onScroll(event(0))); touch(scroll());
  act(() => { scroll().props.onScrollBeginDrag(event(0)); scroll().props.onScrollEndDrag(event(-100, -2)); });
  expect(close).toHaveBeenCalledWith(false, { reason: "swipe" });
});

it("keeps the activating move when RN resets displacement on responder grant", () => {
  close.mockClear();
  render(sheet(<View />));
  const dialog = tree!.root.findAllByType(Animated.View).find(node => node.props.role === "dialog")!;
  const zone = tree!.root.findAllByType(View).find(node => typeof node.props.onMoveShouldSetResponder === "function")!;
  act(() => dialog.props.onLayout({ nativeEvent: { layout: { height: 600 } } }));
  expect(zone.props.onMoveShouldSetResponder({}, { dy: 200, dx: 0 })).toBe(true);
  act(() => { zone.props.onResponderGrant(); zone.props.onResponderRelease({}, { dy: 0, vy: 0 }); });
  expect(close).toHaveBeenCalledWith(false, { reason: "swipe" });
});
