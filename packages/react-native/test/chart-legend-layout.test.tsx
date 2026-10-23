import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("react-native-svg", async () => {
  const { View } = await import("react-native");
  return { default: View, Circle: View, ClipPath: View, Defs: View, G: View, Line: View, LinearGradient: View, Path: View, Rect: View, Stop: View, Text: View };
});
import { chartRecipe } from "@hjmds/design-contracts/components/chart";
import { ChartLegend } from "../src/chart.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const items = [{ id: "l", label: "왼쪽", color: "#f59e0b" }, { id: "r", label: "오른쪽", color: "#3b82f6", value: "40%" }];
const rootStyle = () => flat(tree!.root.findAllByType(View)[0]!.props.style);

it("wraps inline entries in a row with the recipe gaps and no stacked row height", () => {
  act(() => { tree = create(<HjmNativeProvider><ChartLegend layout="inline" items={items} /></HjmNativeProvider>); });
  expect(rootStyle()).toMatchObject({ flexDirection: "row", flexWrap: "wrap", columnGap: chartRecipe.legend.layouts.inline.columnGap, rowGap: chartRecipe.legend.layouts.inline.rowGap });
  const rows = tree!.root.findAllByType(View).filter(node => flat(node.props.style).gap === chartRecipe.legend.itemGap);
  expect(rows).toHaveLength(2);
  expect(rows.every(row => flat(row.props.style).minHeight === undefined)).toBe(true);
  expect(tree!.root.findAll(node => node.props.accessibilityLabel === "오른쪽 40%" && node.props.accessible)).not.toHaveLength(0);
});

it("stacks by default with the 32 row minimum and rejects unknown layouts", () => {
  act(() => { tree = create(<HjmNativeProvider><ChartLegend items={items} /></HjmNativeProvider>); });
  expect(rootStyle()).toEqual({ gap: chartRecipe.legend.layouts.stack.rowGap });
  const rows = tree!.root.findAllByType(View).filter(node => flat(node.props.style).minHeight === chartRecipe.legend.layouts.stack.rowMinHeight);
  expect(rows).toHaveLength(2);
  expect(() => act(() => tree!.update(<HjmNativeProvider><ChartLegend layout={"grid" as "inline"} items={items} /></HjmNativeProvider>))).toThrow(/Unsupported ChartLegend layout/);
});
