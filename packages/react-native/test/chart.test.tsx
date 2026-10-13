import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => {
  const { View } = await import("react-native");
  return { default: View, Circle: View, Defs: View, G: View, Line: View, LinearGradient: View, Path: View, Rect: View, Stop: View, Text: View };
});
import { BarChart, LineChart, PieChart, RadarChart, Sparkline } from "../src/chart.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const categories = ["3월", "4월", "5월"];
const series = [{ id: "ops", label: "OPS", values: [0.8, null, 0.9] }];
const fmt = (v: number) => v.toFixed(3);

function render(node: React.ReactNode) {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>); });
  return tree;
}
const adjustable = (tree: ReactTestRenderer) => tree.root.find(n => n.props.accessibilityRole === "adjustable" && typeof n.props.onLayout === "function");
const layout = (tree: ReactTestRenderer, width = 300) => act(() => adjustable(tree).props.onLayout({ nativeEvent: { layout: { width, height: 180 } } }));

it("LineChart exposes a text alternative, steps over gaps and scrubs", () => {
  const changes: [number | null, boolean][] = [];
  const tree = render(<LineChart categories={categories} series={series} accessibilityLabel="월별 OPS" formatValue={fmt} missingLabel="기록 없음" onFocusChange={(i, d) => changes.push([i, d.scrubbing])} />);
  try {
    layout(tree);
    const chart = adjustable(tree);
    expect(chart.props.accessibilityHint).toBe("OPS: 3월 0.800, 4월 기록 없음, 5월 0.900");
    expect(chart.props.accessibilityValue.text).toBe("5월 0.900");
    act(() => chart.props.onAccessibilityAction({ nativeEvent: { actionName: "decrement" } }));
    expect(adjustable(tree).props.accessibilityValue.text).toBe("3월 0.800");
    act(() => adjustable(tree).props.onResponderGrant({ nativeEvent: { locationX: 290, locationY: 50 } }));
    expect(changes.at(-1)).toEqual([2, true]);
    act(() => adjustable(tree).props.onResponderRelease({ nativeEvent: {} }));
    expect(changes.at(-1)).toEqual([null, false]);
  } finally { act(() => tree.unmount()); }
});

it("BarChart draws one bar per observed value and keeps a tapped focus", () => {
  const tree = render(<BarChart categories={categories} series={[{ id: "hr", label: "홈런", values: [3, null, 5] }]} accessibilityLabel="월별 홈런" formatValue={v => String(v)} missingLabel="—" />);
  try {
    layout(tree);
    expect(tree.root.findAll(n => typeof n.type === "string" && n.props.rx !== undefined && n.props.height !== undefined && n.props.fill)).toHaveLength(2);
    act(() => adjustable(tree).props.onResponderGrant({ nativeEvent: { locationX: 10, locationY: 50 } }));
    act(() => adjustable(tree).props.onResponderRelease({ nativeEvent: {} }));
    expect(adjustable(tree).props.accessibilityValue.text).toBe("3월 3");
  } finally { act(() => tree.unmount()); }
});

it("PieChart reports shares and toggles selection from the legend", () => {
  const selected: (string | null)[] = [];
  const tree = render(<PieChart data={[{ id: "a", label: "직구", value: 3 }, { id: "b", label: "변화구", value: 1 }]} accessibilityLabel="구종" formatValue={v => `${v}개`} onSelect={id => selected.push(id)} />);
  try {
    expect(tree.root.find(n => n.props.accessibilityRole === "image").props.accessibilityLabel).toBe("구종. 직구 3개 (75%), 변화구 1개 (25%)");
    act(() => tree.root.find(n => n.props.accessibilityLabel === "직구 3개 · 75%" && n.props.onPress).props.onPress());
    expect(selected).toEqual(["a"]);
  } finally { act(() => tree.unmount()); }
});

it("RadarChart needs three axes and Sparkline is decorative without a label", () => {
  expect(() => render(<RadarChart categories={["a", "b"]} series={[{ id: "p", label: "P", values: [1, 2] }]} accessibilityLabel="r" formatValue={String} missingLabel="—" />)).toThrow(RangeError);
  const tree = render(<Sparkline values={[1, 2, null, 3]} />);
  try { expect(tree.root.find(n => n.props.accessibilityElementsHidden === true)).toBeTruthy(); } finally { act(() => tree.unmount()); }
});
