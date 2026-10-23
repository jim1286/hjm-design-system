import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { afterEach, expect, it } from "vitest";
import { ListRow } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const byTestId = (id: string) => tree!.root.findAll(node => node.props.testID === id && typeof node.type !== "string");

it.each(["ltr", "rtl"] as const)("draws the disclosure chevron after trailing inside the row command (%s)", direction => {
  act(() => { tree = create(<HjmNativeProvider direction={direction}>
    <ListRow title="버전" trailingText="1.2" trailingAccessory="disclosure" onPress={() => {}} trailingAction={<Text>도구</Text>} />
  </HjmNativeProvider>); });
  const [accessory] = byTestId("hjm-list-row-accessory");
  expect(accessory).toBeDefined();
  expect(accessory!.props).toMatchObject({ accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" });
  // Trailing value → chevron at the 8 accessory gap (row gap 12 − 4).
  expect(flat(accessory!.props.style)).toMatchObject({ marginStart: -4, flexShrink: 0 });
  const command = tree!.root.findByType(Pressable);
  expect(command.findAll(node => node === accessory)).toHaveLength(1);
  // Order inside the command: trailing value, then the chevron.
  const json = JSON.stringify(tree!.toJSON());
  expect(json.indexOf("1.2")).toBeLessThan(json.indexOf("hjm-list-row-accessory"));
  // The spoken name stays the row text; the chevron adds nothing to it.
  expect(command.props.accessibilityLabel).toBe("버전, 1.2");
  // The separate action is a sibling of the command, not inside it.
  expect(command.findAll(node => node.props.children === "도구")).toHaveLength(0);
});

it("adds no chevron by default and keeps the loading row's accessory box", () => {
  act(() => { tree = create(<HjmNativeProvider><ListRow title="계정" onPress={() => {}} /></HjmNativeProvider>); });
  expect(byTestId("hjm-list-row-accessory")).toHaveLength(0);
  act(() => tree!.update(<HjmNativeProvider><ListRow title="계정" loading trailingAccessory="disclosure" /></HjmNativeProvider>));
  expect(flat(byTestId("hjm-list-row-accessory")[0]!.props.style)).toMatchObject({ width: 20, height: 20 });
});
