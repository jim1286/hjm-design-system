import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { afterEach, expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { CheckboxGroup, RadioGroup } from "../src/inputs.js";
import { Grid } from "../src/primitives.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => act(() => tree?.unmount()));
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
it("uses measured equal columns and keeps the same radio choice when narrow space stacks the cards", () => {
  act(() => { tree = create(<HjmNativeProvider><RadioGroup label="Scope" defaultValue="public" size="small"
    grid={{ columns: { compact: 2 }, gap: { compact: "xs" }, minColumnWidth: { compact: 152 } }}
    items={[{ value: "public", label: "Public", description: "Longer explanation" }, { value: "private", label: "Private" }]} /></HjmNativeProvider>); });
  const body = tree.root.findByType(Grid).findAllByType(View)[0]!;
  const widths = () => body.findAll(node => node.type === View && typeof flatten(node.props.style).width === "number" && node.findAllByType(Pressable).some(control => control.props.accessibilityRole === "radio")).map(node => Number(flatten(node.props.style).width));
  act(() => body.props.onLayout({ nativeEvent: { layout: { width: 360, height: 100 } } }));
  expect(widths()).toEqual([176, 176]);
  const radios = () => tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "radio");
  act(() => radios()[1]!.props.onPress());
  expect(radios().map(node => node.props.accessibilityState.checked)).toEqual([false, true]);
  act(() => body.props.onLayout({ nativeEvent: { layout: { width: 280, height: 200 } } }));
  expect(widths()).toEqual([280, 280]);
  expect(radios().map(node => node.props.accessibilityState.checked)).toEqual([false, true]);
});

it("keeps several checkbox choices selected inside grid cells", () => {
  act(() => { tree = create(<HjmNativeProvider><CheckboxGroup label="Options" defaultValue={new Set<string>()}
    grid={{ columns: { compact: 2 }, gap: { compact: "xs" } }}
    items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} /></HjmNativeProvider>); });
  const checks = () => tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "checkbox");
  act(() => checks()[0]!.props.onPress());
  act(() => checks()[1]!.props.onPress());
  expect(checks().map(node => node.props.accessibilityState.checked)).toEqual([true, true]);
});
