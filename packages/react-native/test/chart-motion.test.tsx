import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => {
  const React = await import("react");
  const { View } = await import("react-native");
  const Path = React.forwardRef((props: Record<string, unknown>, ref) => {
    React.useImperativeHandle(ref, () => ({ setNativeProps: (next: unknown) => updates.push(next) }), []);
    return React.createElement(View, props);
  });
  return { default: View, Circle: View, ClipPath: View, Defs: View, G: View, Line: View, LinearGradient: View, Path, Rect: Path, Stop: View, Text: View };
});
const updates: unknown[] = [];
import { BarChart, LineChart } from "../src/chart.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => { act(() => tree?.unmount()); vi.unstubAllGlobals(); updates.length = 0; });
const props = { accessibilityLabel: "Actual", formatValue: String, missingLabel: "—" };
const data = (values: number[]) => [{ id: "s", label: "S", values }];
const chart = () => tree.root.findByType(View);
const layout = () => act(() => tree.root.find(node => node.props.accessibilityRole === "adjustable" && node.props.onLayout).props.onLayout({ nativeEvent: { layout: { width: 320 } } }));
it("morphs period paths through native host updates and preserves exact latest data", () => {
  let next = 0, now = 0; const frames = new Map<number, ((time: number) => void)>();
  vi.stubGlobal("requestAnimationFrame", (callback: ((time: number) => void)) => { frames.set(++next, callback); return next; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const render = (values: number[]) => <HjmNativeProvider reducedMotion={false}><LineChart {...props} animateChanges area={false} categories={values.map((_, i) => String(i))} series={data(values)} /></HjmNativeProvider>;
  act(() => { tree = create(render([1, 5, 2])); }); layout();
  act(() => tree.update(render([5, 2, 3, 7, 1])));
  expect(frames.size).toBe(1);
  const initial = updates.at(-1);
  for (let i = 0; i < 3; i++) { now += 110; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); }
  expect(updates.at(-1)).not.toEqual(initial);
  expect(frames.size).toBe(0);
  expect(chart().props.accessibilityValue.text).toBe("4 1");
});
it("retains observed category on reorder and snaps under reduced motion", () => {
  const raf = vi.fn(); vi.stubGlobal("requestAnimationFrame", raf);
  const render = (categories: string[], values: number[]) => <HjmNativeProvider reducedMotion><BarChart {...props} animateChanges defaultFocusIndex={1} categories={categories} series={data(values)} /></HjmNativeProvider>;
  act(() => { tree = create(render(["A", "B"], [2, 5])); }); layout();
  act(() => tree.update(render(["B", "A"], [9, 3])));
  expect(chart().props.accessibilityValue.text).toBe("B 9");
  expect(raf).not.toHaveBeenCalled();
});
it("uses a measured clipping boundary for split emphasis", () => {
  act(() => { tree = create(<HjmNativeProvider><LineChart {...props} categories={["A", "B", "C"]} series={data([1, 5, 2])} focusIndex={1} scrubEmphasis="before" /></HjmNativeProvider>); }); layout();
  expect(tree.root.findAll(node => typeof node.type === "string" && node.props.clipPath)).toHaveLength(1);
});
