import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ScrollView, View, TextInput } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionRail } from "../src/collection-rail.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";

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
const next = () => renderer!.root.findAllByType(Button).find(node => node.props.children === "다음")!;

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
    const first = renderer!.root.findAllByType(Button).find(node => node.props.children === "이전")!;
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
