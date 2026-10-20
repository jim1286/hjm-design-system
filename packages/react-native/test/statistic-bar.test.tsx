import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View, Text } from "react-native";
import { expect, it } from "vitest";
import { StatisticGroup } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (value: unknown): Record<string, unknown> => Array.isArray(value) ? Object.assign({}, ...value.map(flatten)) : (value ?? {}) as Record<string, unknown>;
it("keeps zero counts, equal narrow bar widths and value-first order without exposing decorative icons", () => {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><StatisticGroup label="Counts" arrangement="bar" availableWidth={300}
    descriptor={{ items: [{ id: "a", label: "A", value: "0" }, { id: "b", label: "B", value: "2" }, { id: "c", label: "C", value: "3" }] }}
    getValueColor={() => "#ff4458"} renderLeading={(item, context) => <View testID={`icon-${item.id}`} style={{ width: context.size, backgroundColor: context.color }} />} /></HjmNativeProvider>); });
  const cells = tree.root.findAll(node => node.type === View && node.props.accessible === true);
  expect(cells.map(node => node.props.accessibilityLabel)).toEqual(["Counts, A, 0", "Counts, B, 2", "Counts, C, 3"]);
  expect(cells.map(node => flatten(node.props.style).width)).toEqual([100, 100, 100]);
  expect(cells.map(node => flatten(node.props.style).borderStartWidth)).toEqual([0, 1, 1]);
  expect(cells.map(node => flatten(node.props.style).borderRadius)).toEqual([0, 0, 0]);
  const copy = cells[0]!.findAllByType(Text).map(node => node.props.children).filter(value => typeof value === "string");
  expect(copy).toEqual(["0", "A"]);
  const icon = tree.root.findByProps({ testID: "icon-a" });
  expect(icon.parent!.props.accessibilityElementsHidden).toBe(true);
  expect(flatten(icon.props.style).backgroundColor).toBe("#ff4458");
  act(() => tree.unmount());
});
