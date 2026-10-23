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

it("keeps a leading glyph on the value line so a long value wraps beside it", () => {
  // 2026-10-23 Unairplane: a wrapping row dropped "10월 9일 09:40" under a lone clock icon.
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><StatisticGroup label="Flight" arrangement="bar" availableWidth={300}
    descriptor={{ items: [{ id: "eta", label: "Arrival", value: "10월 9일 09:40" }, { id: "plain", label: "Plain", value: "1" }] }}
    renderLeading={(item, context) => item.id === "eta" ? <View testID="icon-eta" style={{ width: context.size }} /> : null} /></HjmNativeProvider>); });
  const icon = tree.root.findByProps({ testID: "icon-eta" });
  const ancestors: typeof icon[] = [];
  for (let node = icon.parent; node; node = node.parent) ancestors.push(node);
  expect(ancestors.some(node => flatten(node.props.style).flexShrink === 0)).toBe(true);
  const row = ancestors.find(node => flatten(node.props.style).flexDirection === "row")!;
  expect(flatten(row.props.style).flexWrap).toBe("nowrap");
  act(() => tree.unmount());
});

it("keeps the trend mark on the trend label's line so a long label wraps beside it", () => {
  // 2026-10-23: the trend row wrapped, so a long label in a narrow bar cell dropped under a lone arrow.
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider><StatisticGroup label="Weekly" arrangement="bar" availableWidth={300}
    descriptor={{ items: [{ id: "a", label: "Visits", value: "1,204", trend: { direction: "up", label: "지난주보다 크게 늘었어요 12%", tone: "success" } }, { id: "b", label: "Plain", value: "1" }] }} /></HjmNativeProvider>); });
  const label = tree.root.findAll(node => node.type === Text && node.props.children === "지난주보다 크게 늘었어요 12%")[0]!;
  let row = label.parent;
  while (row && flatten(row.props.style).flexDirection !== "row") row = row.parent;
  expect(flatten(row!.props.style).flexWrap).toBe("nowrap");
  const mark = tree.root.findAll(node => node.type === Text && node.props.children === "↑")[0]!;
  expect(flatten(mark.props.style).flexShrink).toBe(0);
  expect(flatten(label.props.style).flexShrink).toBe(1);
  act(() => tree.unmount());
});
