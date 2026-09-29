import type { CarouselSelection } from "@hjmds/design-contracts/components/carousel";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, View } from "react-native";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { Carousel, type CarouselProps } from "../src/carousel.js";
import { Button } from "../src/actions.js";
import { Text } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";

// The registered Native action proof is this focused test; the generic fixture omits adjustable navigation.
// componentId: "carousel"
const slides = [{ id: "a", label: "첫 소식" }, { id: "b", label: "다음 소식" }];
const base = { label: "새 소식", slides, labels: { previous: "이전", next: "다음", pause: "멈추기", resume: "재생하기", navigation: "소식 이동" },
  composeAccessibleName: ({ position, total, label }: { position: number; total: number; label: string }) => `${position}/${total} ${label}`,
  renderSlide: ({ label }: { label: string }) => <Text>{label}</Text>,
};
let renderer: ReactTestRenderer;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(() => { if (renderer) act(() => renderer.unmount()); vi.useRealTimers(); vi.restoreAllMocks(); });
async function render(props: Partial<Omit<CarouselProps, "currentKey" | "defaultCurrentKey" | "onCurrentKeyChange">> & CarouselSelection = {}, direction: "ltr" | "rtl" = "ltr", reducedMotion = false) {
  await act(async () => { renderer = create(<HjmNativeProvider direction={direction} reducedMotion={reducedMotion}><Carousel {...base} {...props} /></HjmNativeProvider>); });
}
const position = () => renderer.root.findAllByType(View).find((node) => node.props.accessibilityRole === "adjustable")!;
const next = () => renderer.root.findAllByType(Button).find((node) => node.props.children === "다음")!;

describe("Native Carousel", () => {
  it("keeps hidden content out of the accessibility tree and clamps adjustable actions", async () => {
    vi.spyOn(AccessibilityInfo, "isScreenReaderEnabled").mockResolvedValue(true);
    const announce = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    await render();
    const hidden = renderer.root.findAllByType(View).filter((node) => node.props.accessibilityElementsHidden);
    expect(hidden).toHaveLength(1); expect(hidden[0]!.props.importantForAccessibility).toBe("no-hide-descendants");
    act(() => position().props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
    expect(position().props.accessibilityValue.now).toBe(2);
    expect(announce).toHaveBeenCalledWith("2/2 다음 소식");
    act(() => position().props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
    expect(position().props.accessibilityValue.now).toBe(2);
    expect(announce).toHaveBeenCalledTimes(1);
  });
  it("publishes labeled adjustable and button actions for screen-reader navigation", async () => {
    vi.spyOn(AccessibilityInfo, "isScreenReaderEnabled").mockResolvedValue(true);
    await render();
    expect(position().props.accessibilityLabel).toBe("새 소식: 1/2 첫 소식");
    expect(position().props.accessibilityActions).toEqual([
      { name: "increment", label: "다음" },
      { name: "decrement", label: "이전" },
    ]);
    const dots = renderer.root.findAllByType(Button).filter((node) => node.props.accessibilityState?.selected !== undefined);
    expect(dots.map((dot) => [dot.props.accessibilityLabel, dot.props.accessibilityState.selected])).toEqual([
      ["1/2 첫 소식", true], ["2/2 다음 소식", false],
    ]);
    act(() => position().props.onAccessibilityAction({ nativeEvent: { actionName: "decrement" } }));
    expect(position().props.accessibilityValue.now).toBe(1);
    act(() => position().props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
    expect(position().props.accessibilityValue.now).toBe(2);
  });
  it("retains long localized copy in the slide, adjustable position, and navigation labels", async () => {
    const copy = "An unusually long product sentence with verylongunbrokenidentifierlikewordsthatmustwrap and a second clause that keeps going past one line.";
    await render({
      label: copy,
      labels: { previous: copy, next: copy, pause: copy, resume: copy, navigation: copy },
      slides: [{ id: "one", label: copy }, { id: "two", label: "다음 소식" }],
      renderSlide: ({ label }) => <Text>{label}</Text>,
    });
    expect(position().props.accessibilityLabel).toBe(`${copy}: 1/2 ${copy}`);
    expect(renderer.root.findAllByType(Text).some((node) => node.props.children === copy)).toBe(true);
    expect(renderer.root.findAllByType(View).some((node) => node.props.accessibilityLabel === copy)).toBe(true);
    const navButtons = renderer.root.findAllByType(Button);
    expect(navButtons.some((node) => node.props.children === copy)).toBe(true);
  });
  it.each(["ltr", "rtl"] as const)("moves one card for a deliberate horizontal swipe in %s", async (direction) => {
    await render({}, direction);
    const track = renderer.root.findAllByType(View).find((node) => node.props.onMoveShouldSetResponder)!;
    expect(track.props.onMoveShouldSetResponder({}, { dx: 5, dy: 70 })).toBe(false);
    expect(track.props.onMoveShouldSetResponder({}, { dx: 60, dy: 5 })).toBe(true);
    act(() => track.props.onResponderRelease({}, { dx: direction === "ltr" ? -60 : 60 }));
    expect(position().props.accessibilityValue.now).toBe(2);
  });
  it("reports controlled intent and retains the owner's current key", async () => {
    const change = vi.fn(); await render({ currentKey: "a", onCurrentKeyChange: change });
    act(() => next().props.onPress()); expect(change).toHaveBeenCalledWith("b"); expect(position().props.accessibilityValue.now).toBe(1);
  });
  it("advances only after the screen-reader check and stops after user interaction", async () => {
    vi.useFakeTimers(); await render({ autoplay: { intervalMs: 1000 } });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(position().props.accessibilityValue.now).toBe(2);
    act(() => position().props.onAccessibilityAction({ nativeEvent: { actionName: "decrement" } }));
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); }); expect(position().props.accessibilityValue.now).toBe(1);
  });
  it.each([[true, false], [false, true]])("never rotates with screenReader=%s and reducedMotion=%s", async (screenReader, reducedMotion) => {
    vi.useFakeTimers(); vi.spyOn(AccessibilityInfo, "isScreenReaderEnabled").mockResolvedValue(screenReader!);
    await render({ autoplay: { intervalMs: 1000 } }, "ltr", reducedMotion!);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); }); expect(position().props.accessibilityValue.now).toBe(1);
  });
});
