import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ScrollView, View, TextInput } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionRail } from "../src/collection-rail.js";
import { HjmNativeProvider } from "../src/provider.js";
import { IconButton } from "../src/actions.js";

const items = Array.from({ length: 5 }, (_, index) => ({ id: `item-${index}`, label: `기록 ${index + 1}` }));
let renderer: ReactTestRenderer | undefined;
const scrollTo = vi.fn();
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  renderer = undefined;
  // This host mock acknowledges each command through the real public scroll
  // event boundary. A separate delayed-host case proves requests are not arrival.
  scrollTo.mockReset().mockImplementation(({ x }: { x: number }) => {
    if (renderer) track().props.onScroll({ nativeEvent: { contentOffset: { x } } });
  });
});
afterEach(() => { if (renderer) { const active = renderer; act(() => active.unmount()); } });
async function render(direction: "ltr" | "rtl", collection = items) {
  const element = <HjmNativeProvider direction={direction} reducedMotion>
    <CollectionRail label="기록 모음" items={collection} labels={{ previous: "이전", next: "다음", navigation: "기록 탐색" }}
      renderItem={item => <TextInput accessibilityLabel={item.label} defaultValue="초안" />} />
  </HjmNativeProvider>;
  await act(async () => { if (renderer) renderer.update(element); else renderer = create(element, { createNodeMock: node => node.type === "ScrollView" ? { scrollTo } : null }); });
}
const track = () => renderer!.root.findByType(ScrollView);
const next = () => renderer!.root.findAllByType(IconButton).find(node => node.props.label === "다음")!;

describe("Native finite collection host translation", () => {
  it("waits for host observation before changing end state", async () => {
    scrollTo.mockImplementation(() => undefined);
    await render("ltr");
    act(() => track().props.onLayout({ nativeEvent: { layout: { width: 1000 } } }));
    act(() => next().props.onPress());
    expect(next().props.disabled).toBe(false);
    act(() => track().props.onScroll({ nativeEvent: { contentOffset: { x: 864 } } }));
    expect(next().props.disabled).toBe(true);
  });
  it.each(["ltr", "rtl"] as const)("uses explicit physical coordinates and finite navigation in %s", async direction => {
    await render(direction);
    act(() => track().props.onLayout({ nativeEvent: { layout: { width: 1000 } } }));
    expect(track().props.style.direction).toBe("ltr");
    expect(track().props.removeClippedSubviews).toBe(false);
    expect(renderer!.root.findAllByType(TextInput)).toHaveLength(5);
    for (let i = 0; i < 10; i++) act(() => next().props.onPress());
    expect(next().props.disabled).toBe(true);
    expect(scrollTo.mock.lastCall?.[0]).toEqual({ x: direction === "rtl" ? 0 : 864, animated: false });
    const first = renderer!.root.findAllByType(IconButton).find(node => node.props.label === "이전")!;
    act(() => first.props.onPress()); expect(next().props.disabled).toBe(false);
  });
  it("maps touch offsets, yields card height changes, and reveals independent focus", async () => {
    await render("rtl");
    act(() => track().props.onLayout({ nativeEvent: { layout: { width: 1000 } } }));
    act(() => track().props.onContentSizeChange(1864, 300));
    act(() => track().props.onScroll({ nativeEvent: { contentOffset: { x: 0 } } }));
    expect(next().props.disabled).toBe(true);
    scrollTo.mockClear(); act(() => track().props.onContentSizeChange(1864, 500));
    expect(scrollTo).not.toHaveBeenCalled();
    const wrappers = renderer!.root.findAllByType(View).filter(node => node.props.onFocus);
    act(() => wrappers[0]!.props.onFocus());
    expect(scrollTo.mock.lastCall?.[0]).toEqual({ x: 864, animated: false });
    await render("rtl", []); expect(next().props.disabled).toBe(true);
    expect(renderer!.root.findAllByType(TextInput)).toHaveLength(0);
  });
});

describe("CollectionRail bleed", () => {
  // 2026-10-17 spint home: an edge-to-edge rail inside the default inset body, first/last items on the gutter.
  it("crosses the ScreenLayout body gutter and keeps item geometry on the gutter box", async () => {
    const { ScreenLayout } = await import("../src/screens.js");
    const element = (bleed: boolean) => <HjmNativeProvider reducedMotion><ScreenLayout title="홈">
      <CollectionRail bleed={bleed} label="더 보기" items={items} labels={{ previous: "이전", next: "다음", navigation: "탐색" }}
        renderItem={item => <View accessibilityLabel={item.label} />} /></ScreenLayout></HjmNativeProvider>;
    await act(async () => { renderer = create(element(true), { createNodeMock: node => node.type === "ScrollView" ? { scrollTo } : null }); });
    const rail = () => renderer!.root.findAllByType(ScrollView).find(node => node.props.horizontal)!;
    expect(rail().props.style).toMatchObject({ marginHorizontal: -16 });
    expect(rail().props.contentContainerStyle).toMatchObject({ paddingHorizontal: 16 });
    act(() => rail().props.onLayout({ nativeEvent: { layout: { width: 432 } } }));
    // Viewport 432 - 2*16 = 400 gutter box: item width min(360, 400 - 32) = 360; content = 5*360 + 4*16 + 2*16.
    expect(rail().props.contentContainerStyle.width).toBe(5 * 360 + 4 * 16 + 32);
    await act(async () => { renderer!.update(element(false)); });
    expect(rail().props.style.marginHorizontal).toBe(-0);
  });
  it("does not bleed outside a screen body", async () => {
    await act(async () => { renderer = create(<HjmNativeProvider><CollectionRail bleed label="더 보기" items={items}
      labels={{ previous: "이전", next: "다음", navigation: "탐색" }} renderItem={() => null} /></HjmNativeProvider>,
    { createNodeMock: () => ({ scrollTo }) }); });
    expect(track().props.contentContainerStyle.paddingHorizontal).toBe(0);
  });
});

describe("useScreenBodyScrollRoom", () => {
  it("moves a content scroller's clip to the screen edges and keeps items on the gutter", async () => {
    const { ScreenLayout, useScreenBodyScrollRoom } = await import("../src/screens.js");
    let room: ReturnType<typeof useScreenBodyScrollRoom> | undefined;
    function Probe() { room = useScreenBodyScrollRoom(); return null; }
    await act(async () => { renderer = create(<HjmNativeProvider><ScreenLayout title="홈" scroll="content"><Probe /></ScreenLayout></HjmNativeProvider>); });
    expect(room).toEqual({ style: { marginHorizontal: -16 }, contentContainerStyle: { paddingHorizontal: 16 } });
    await act(async () => { renderer!.update(<HjmNativeProvider><ScreenLayout title="홈" scroll="content" contentInset="body-edge"><Probe /></ScreenLayout></HjmNativeProvider>); });
    expect(room!.contentContainerStyle.paddingHorizontal).toBe(0);
  });
});

it("preserves product payload types through the public item renderer", () => {
 act(() => { renderer = create(<HjmNativeProvider><CollectionRail label="Drafts"
  items={[{ id: "draft", label: "Draft", note: "Product-owned draft" }]}
  labels={{ previous: "Previous", next: "Next", navigation: "Browse" }}
  renderItem={item => <TextInput accessibilityLabel={item.label} defaultValue={item.note} />} /></HjmNativeProvider>); });
 expect(renderer!.root.findByType(TextInput).props.defaultValue).toBe("Product-owned draft");
});
