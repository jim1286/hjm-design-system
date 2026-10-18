// HJM 1.32.0 on Native: IconTile hands its rendered edge to icon artwork, ScreenLayout contentInset="body-bleed", and
// ScreenLayout as the single owner of the BottomNavigation inset (a scroll="content" list does not add it again).
import { ScrollView, View } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { iconTileRecipe, screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { HjmNativeProvider } from "../src/provider.js";
import { IconTile, NotificationInboxScreen, ScreenLayout } from "../src/screens.js";
import { BottomNavigation, BottomNavigationInsetProvider } from "../src/navigation.js";
import { Text } from "../src/primitives.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let tree: ReactTestRenderer | undefined;
function render(child: ReactNode) {
  act(() => { tree = create(<HjmNativeProvider reducedMotion theme="light">{child}</HjmNativeProvider>); });
  return tree!;
}
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
const gutter = screenPatternRecipe.padding;

describe("IconTile icon edge", () => {
  const frameOf = (view: ReactTestRenderer) => view.root.findAllByType(View).find(node => node.props.style?.position === "relative" && node.props.style?.justifyContent === "center")!;
  it("passes the fixed edge to a render-function icon", () => {
    const edges: number[] = [];
    render(<IconTile label="Tool" icon={({ edge }) => { edges.push(edge); return <Text>A</Text>; }} />);
    expect(edges.at(-1)).toBe(iconTileRecipe.iconSize);
  });
  it("passes the measured filling edge so fixed-size artwork follows the cell", () => {
    const edges: number[] = [];
    const view = render(<IconTile label="Tool" size="fill" frame="none" icon={({ edge }) => { edges.push(edge); return <View testID="art" style={{ width: edge, height: edge }} />; }} />);
    expect(edges.at(-1)).toBe(iconTileRecipe.fillMinSize);
    act(() => frameOf(view).props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 57.5, height: 57.5 } } }));
    expect(edges.at(-1)).toBe(57.5);
    expect(view.root.findByProps({ testID: "art" }).props.style).toEqual({ width: 57.5, height: 57.5 });
  });
});

describe("ScreenLayout contentInset=\"body-bleed\"", () => {
  const regions = (view: ReactTestRenderer) => view.root.findAllByType(View).filter(node => node.props.style && typeof node.props.style === "object" && !Array.isArray(node.props.style) && "paddingHorizontal" in node.props.style);
  it("drops every body padding before a footer while the header, notice and footer keep the gutter", () => {
    const view = render(<ScreenLayout title="Map" scroll="content" contentInset="body-bleed" safeAreaBottom={34} notice={<Text>notice</Text>} footer={<Text>cta</Text>}><View testID="map" /></ScreenLayout>);
    const body = view.root.findByProps({ testID: "map" }).parent!;
    expect(body.props.style).toMatchObject({ paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0 });
    expect(regions(view).find(node => node.props.style.paddingHorizontal === gutter && node.findAllByProps({ children: "notice" }).length)).toBeDefined();
    const footer = view.root.findAllByType(View).find(node => node.props.style?.borderTopWidth === 1)!;
    expect(footer.props.style).toMatchObject({ padding: gutter, paddingBottom: 34 });
  });
  it("clears the safe area and an overlay bar without the gutter when the body is the last region", () => {
    const view = render(<ScreenLayout title="Map" contentInset="body-bleed" safeAreaBottom={34}><View testID="map" /></ScreenLayout>);
    expect(view.root.findByType(ScrollView).props.contentContainerStyle).toMatchObject({ paddingTop: 0, paddingBottom: 34, paddingHorizontal: 0 });
  });
  it("keeps the gutter around the shared state group, which has no inset of its own", () => {
    for (const contentInset of ["body-bleed", "body-edge"] as const) {
      const view = render(<ScreenLayout title="Map" contentInset={contentInset} state={{ kind: "empty", title: "No route" }} />);
      const group = view.root.findAllByType(View).find(node => node.props.style?.marginVertical === "auto" && "paddingHorizontal" in node.props.style)!;
      expect(group.props.style.paddingHorizontal).toBe(gutter);
    }
  });
});

describe("BottomNavigation inset owner", () => {
  const bar = <BottomNavigation placement="overlay" descriptor={{ accessibilityLabel: "Main", selectedKey: "home", items: [{ id: "home", label: "Home", icon: { name: "home" } }, { id: "me", label: "Me", icon: { name: "person" } }] }} onActivate={() => {}} renderIcon={() => null} />;
  const publish = (view: ReactTestRenderer, height: number) => {
    const root = view.root.findAll(node => node.type === View && node.props.pointerEvents === "box-none" && typeof node.props.onLayout === "function")[0]!;
    act(() => root.props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height } } }));
  };
  it("pads a scroll=\"content\" body once, so the product list adds nothing", () => {
    const view = render(<BottomNavigationInsetProvider><ScreenLayout title="Feed" scroll="content"><View testID="list" /></ScreenLayout>{bar}</BottomNavigationInsetProvider>);
    publish(view, 96);
    expect(view.root.findByProps({ testID: "list" }).parent!.props.style.paddingBottom).toBe(gutter + 96);
  });
  it("applies it once through a composed screen (NotificationInboxScreen) and once with body-bleed", () => {
    const view = render(<BottomNavigationInsetProvider><NotificationInboxScreen title="Inbox" scroll="content"><View testID="list" /></NotificationInboxScreen>{bar}</BottomNavigationInsetProvider>);
    publish(view, 96);
    const paddings: unknown[] = [];
    for (let node = view.root.findByProps({ testID: "list" }).parent; node; node = node.parent) {
      // Host nodes only: the mocked View component and the host element it renders carry the same style.
      const style = typeof node.type === "string" ? node.props.style : undefined;
      if (style && !Array.isArray(style) && typeof style === "object" && typeof style.paddingBottom === "number" && style.paddingBottom > 0) paddings.push(style.paddingBottom);
    }
    expect(paddings).toEqual([gutter + 96]);
    act(() => view.update(<HjmNativeProvider reducedMotion theme="light"><BottomNavigationInsetProvider><ScreenLayout title="Map" scroll="content" contentInset="body-bleed"><View testID="map" /></ScreenLayout>{bar}</BottomNavigationInsetProvider></HjmNativeProvider>));
    publish(view, 96);
    expect(view.root.findByProps({ testID: "map" }).parent!.props.style.paddingBottom).toBe(96);
  });
});
