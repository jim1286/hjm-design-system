import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it } from "vitest";
import { Text, View } from "react-native";
import { CompositionLayout, ScreenLayout } from "../src/screens.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const render = (node: React.ReactElement) => { act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>); }); return tree!; };

it.each(["composition", "screen"] as const)("draws the %s loading placeholder in place, announced once as busy", kind => {
  const loading = { kind: "loading" as const, title: "기록을 불러오는 중" };
  const placeholder = <View testID="shape" />;
  const t = render(kind === "composition"
    ? <CompositionLayout title="공격" state={loading} loadingPlaceholder={placeholder}><Text>본문</Text></CompositionLayout>
    : <ScreenLayout title="선수" state={loading} loadingPlaceholder={placeholder}><Text>본문</Text></ScreenLayout>);
  const busy = t.root.findAll(node => node.props.accessibilityRole === "progressbar" && node.props.accessibilityState?.busy === true && typeof node.type !== "string");
  expect(busy.length).toBeGreaterThan(0);
  expect(busy[0]!.props.accessibilityLabel).toBe("기록을 불러오는 중");
  expect(t.root.findByProps({ testID: "shape" })).toBeTruthy();
  expect(t.root.findAll(node => node.props.children === "본문")).toHaveLength(0);
});

it("keeps the shared state group for empty and error even with a placeholder", () => {
  const t = render(<CompositionLayout title="공격" state={{ kind: "empty", title: "기록이 없어요" }} loadingPlaceholder={<View testID="shape" />}><Text>본문</Text></CompositionLayout>);
  expect(t.root.findAll(node => node.props.testID === "shape")).toHaveLength(0);
  expect(t.root.findAll(node => node.props.children === "기록이 없어요").length).toBeGreaterThan(0);
});
