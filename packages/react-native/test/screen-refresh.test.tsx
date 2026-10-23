import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { ScreenLayout, ScreenRefreshControl } from "../src/screens.js";
import { HjmNativeProvider, useHjmNativeTheme } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
// The ScrollView mock keeps `refreshControl` as a prop, as the native host would clone it; render it to read its props.
const control = () => {
  const element = tree!.root.findByType(ScrollView).props.refreshControl as React.ReactElement;
  let rendered!: ReactTestRenderer;
  act(() => { rendered = create(<HjmNativeProvider>{element}</HjmNativeProvider>); });
  const props = rendered.root.findByType(RefreshControl).props as Record<string, unknown>;
  act(() => rendered.unmount());
  return props;
};
const indicator = () => tree!.root.findAll((node) => node.props.testID === "hjm-screen-refresh-indicator" && typeof node.type === "string");

it("attaches a brand-tinted system control to the screen body without a product indicator", () => {
  const refresh = vi.fn();
  let palette!: ReturnType<typeof useHjmNativeTheme>["palette"];
  function Palette() { palette = useHjmNativeTheme().palette; return null; }
  act(() => { tree = create(<HjmNativeProvider><Palette /><ScreenLayout title="알림" onRefresh={refresh} refreshing refreshLabel="새 알림을 불러오는 중"><Text>본문</Text></ScreenLayout></HjmNativeProvider>); });
  const tint = resolveColorReference(screenPatternRecipe.refresh.tint, palette);
  expect(control()).toMatchObject({ refreshing: true, tintColor: tint, colors: [tint], progressBackgroundColor: resolveColorReference(screenPatternRecipe.refresh.background, palette) });
  (control().onRefresh as () => void)();
  expect(refresh).toHaveBeenCalledOnce();
  expect(indicator()).toHaveLength(0);
});

it("hides the system spinner and shows the product indicator, named and busy, below the body top while refreshing", () => {
  const screen = (refreshing: boolean) => <HjmNativeProvider><ScreenLayout title="들판" onRefresh={() => {}} refreshing={refreshing} refreshLabel="새 글을 불러오는 중" loadingIndicator={<View testID="flower" />}><Text>본문</Text></ScreenLayout></HjmNativeProvider>;
  act(() => { tree = create(screen(true)); });
  expect(control()).toMatchObject({ tintColor: "transparent", colors: ["transparent"], progressBackgroundColor: "transparent" });
  act(() => tree!.root.findByType(ScrollView).props.onLayout({ nativeEvent: { layout: { x: 0, y: 60, width: 390, height: 700 } } }));
  const [shown] = indicator();
  expect(shown!.props).toMatchObject({ accessibilityRole: "progressbar", accessibilityLabel: "새 글을 불러오는 중", accessibilityState: { busy: true }, pointerEvents: "none" });
  expect(shown!.props.style).toMatchObject({ position: "absolute", top: 60 + screenPatternRecipe.refresh.indicatorOffset, alignItems: "center" });
  expect(shown!.findAll((node) => node.props.testID === "flower")).not.toHaveLength(0);
  act(() => tree!.update(screen(false)));
  expect(indicator()).toHaveLength(0);
});

it("hands the same control to a scroll=\"content\" list through ScreenRefreshControl", () => {
  const refresh = vi.fn();
  // A product list renders its refreshControl inside the ScreenLayout tree, as FlatList does.
  function List({ refreshControl }: { refreshControl: React.ReactElement }) { return <View>{refreshControl}</View>; }
  act(() => { tree = create(<HjmNativeProvider><ScreenLayout title="홈" scroll="content" onRefresh={refresh} refreshing refreshLabel="새로고침 중" loadingIndicator={<View />}>
    <List refreshControl={<ScreenRefreshControl />} />
  </ScreenLayout></HjmNativeProvider>); });
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(0);
  const props = tree!.root.findByType(RefreshControl).props;
  expect(props).toMatchObject({ refreshing: true, tintColor: "transparent" });
  props.onRefresh();
  expect(refresh).toHaveBeenCalledOnce();
  act(() => tree!.unmount()); tree = undefined;
  expect(() => act(() => { tree = create(<HjmNativeProvider><ScreenRefreshControl /></HjmNativeProvider>); })).toThrow(TypeError);
});

it("requires a label and a single owner of the pull gesture", () => {
  const render = (props: Record<string, unknown>) => act(() => { tree = create(<HjmNativeProvider><ScreenLayout title="t" onRefresh={() => {}} {...props} /></HjmNativeProvider>); });
  expect(() => render({})).toThrow(/refreshLabel/);
  expect(() => render({ refreshLabel: "r", scrollProps: { refreshControl: <RefreshControl refreshing={false} /> } })).toThrow(TypeError);
  expect(() => render({ refreshLabel: "r", pullToDismiss: true, exit: { kind: "close", label: "닫기", onPress: () => {} } })).toThrow(/pullToDismiss/);
});
