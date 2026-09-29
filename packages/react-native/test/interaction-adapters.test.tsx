import { createElement, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { SortableCollection } from "../src/sortable.js";
import { SwipeActions } from "../src/swipe-actions.js";
import { CarouselMotion } from "../src/carousel-motion.js";
import { ContentTransition, TextTransition } from "../src/content-transition.js";
import { Celebration } from "../src/celebration.js";
import { SharedTransitionElement, SharedTransitionScreen, useSharedTransitionOptions } from "../src/screen-transition.js";
const navigation = vi.hoisted(() => ({ focused: true }));
vi.mock("@react-navigation/native", () => ({ useIsFocused: () => navigation.focused }));
vi.mock("react-native-sortables", () => ({ default: { Handle: "Handle", Grid: (p: { data: unknown[]; renderItem(i: { item: unknown; index: number }): ReactNode }) => createElement("Grid", p, p.data.map((item, index) => createElement("Cell", { key: index }, p.renderItem({ item, index })))) } }));
vi.mock("react-native-gesture-handler/ReanimatedSwipeable", () => ({ default: "Swipeable" }));
vi.mock("react-native-reanimated-carousel", () => ({ Carousel: "Carousel" }));
vi.mock("react-native-fast-confetti", () => ({ Confetti: "Confetti" }));
vi.mock("react-native-screen-transitions", () => ({ default: { Boundary: "Boundary" } }));
vi.mock("react-native-screen-transitions/react-navigation", () => ({ createBlankStackNavigator: vi.fn() }));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const items = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }];
const labels = { instructions: "이동 안내", dragStart: (i: { label: string }) => `${i.label} 이동 시작`, dragCancel: "이동 취소", handle: (i: { label: string }) => i.label, previous: () => "Previous", next: () => "Next", position: (i: { label: string }) => i.label };
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.restoreAllMocks(); });
async function render(child: ReactNode, reduced = true) { await act(async () => { const view = <HjmNativeProvider reducedMotion={reduced}>{child}</HjmNativeProvider>; if (tree) tree.update(view); else tree = create(view); }); }
const find = (type: string) => tree!.root.find(n => n.type === type);
it("offers accessible reorder and disables reduced-motion dragging", async () => {
  const commit = vi.fn();
  await render(<SortableCollection items={items} label="Items" labels={labels} renderItem={i => i.label} onCommit={commit} />);
  expect(find("Grid").props.sortEnabled).toBe(false);
  const handle = tree!.root.findAll(n => n.props.accessibilityRole === "adjustable")[0]!;
  expect(handle.props.accessibilityValue).toEqual({ text: "Alpha" });
  act(() => handle.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  expect(commit.mock.calls[0]![0].orderedIds).toEqual(["b", "a"]);
});
it("ignores a stale native drag after the host changes items", async () => {
  const commit = vi.fn(); const cancel = vi.fn();
  const view = (data: typeof items) => <SortableCollection items={data} label="Items" labels={labels} renderItem={i => i.label} onCommit={commit} onCancel={cancel} />;
  await render(view(items), false); const stale = find("Grid").props;
  act(() => stale.onDragStart()); await render(view([...items].reverse()), false);
  act(() => stale.onDragEnd({ key: "a", toIndex: 1 }));
  expect(commit).not.toHaveBeenCalled(); expect(cancel).toHaveBeenCalledOnce();
});
it("maps RTL actions to the leading physical side without full-swipe mutation", async () => {
  const action = vi.fn();
  await render(<HjmNativeProvider direction="rtl"><SwipeActions rowId="row" label="Row" actionsLabel="Actions" openRowId={null} onOpenRowChange={() => {}}
    actions={[{ id: "save", label: "Save" }]} onAction={action} onError={() => {}}>content</SwipeActions></HjmNativeProvider>, false);
  expect(find("Swipeable").props.renderLeftActions).toBeTypeOf("function");
  expect(find("Swipeable").props.overshootLeft).toBe(false);
  act(() => find("Swipeable").props.onSwipeableWillOpen()); expect(action).not.toHaveBeenCalled();
});
it("keeps native carousel non-looping and maps snap indices to IDs", async () => {
  const change = vi.fn();
  await render(<CarouselMotion slides={items} currentKey="a" onCurrentKeyChange={change} label="Places" previousLabel="Previous" nextLabel="Next" width={300} height={160} renderSlide={i => i.label} />);
  const p = find("Carousel").props;
  expect(p.loop).toBe(false); expect(p.autoplay).toBe(false); expect(p.animation.duration).toBe(0);
  act(() => { p.onSnapToItem(1); p.onSnapToItem(99); }); expect(change).toHaveBeenCalledExactlyOnceWith("b");
});
it("has one current text value and no reduced-motion particles", async () => {
  await render(<ContentTransition stateKey="a"><TextTransition text="가족 👨‍👩‍👧‍👦" /></ContentTransition>);
  expect(JSON.stringify(tree!.toJSON())).toContain("가족 👨‍👩‍👧‍👦");
  const complete = vi.fn(); await render(<Celebration eventId="one" onComplete={complete} />);
  expect(tree!.root.findAll(n => String(n.type) === "Confetti")).toHaveLength(0); expect(complete).toHaveBeenCalledOnce();
  await render(<Celebration eventId="one" onComplete={complete} />); expect(complete).toHaveBeenCalledOnce();
});
it("uses paired boundary geometry and disables navigation motion when requested", async () => {
  let options: ReturnType<typeof useSharedTransitionOptions> | undefined;
  function Demo() { options = useSharedTransitionOptions("photo"); return <SharedTransitionElement id="photo">photo</SharedTransitionElement>; }
  await render(<Demo />); expect(options!.gestureEnabled).toBe(false); expect(options!.transitionSpec!.open).toEqual({ duration: 0 });
  expect(find("Boundary").props.handoff).toBe(false); expect(find("Boundary").props.enabled).toBe(false);
  await render(<Demo />, false); expect(options!.gestureEnabled).toBe(true); expect(find("Boundary").props.enabled).toBe(true);
});

it("hides retained route content from accessibility and restores it on return", async () => {
  navigation.focused = false;
  await render(<SharedTransitionScreen>detail</SharedTransitionScreen>);
  expect(tree!.root.findAll(n => n.props.accessibilityElementsHidden === true).length).toBeGreaterThan(0);
  navigation.focused = true;
  await render(<SharedTransitionScreen>detail</SharedTransitionScreen>);
  expect(tree!.root.findAll(n => n.props.accessibilityElementsHidden === true)).toHaveLength(0);
});
it("hides closed swipe actions even when the engine keeps them mounted", async () => {
  const view = (openRowId: string | null) => <SwipeActions rowId="row" label="Row" actionsLabel="Actions" openRowId={openRowId} onOpenRowChange={() => {}}
    actions={[{ id: "save", label: "Save" }]} onAction={() => {}} onError={() => {}}>content</SwipeActions>;
  await render(view(null), false);
  expect(find("Swipeable").props.renderRightActions().props.accessibilityElementsHidden).toBe(true);
  await render(view("row"), false);
  expect(find("Swipeable").props.renderRightActions().props.accessibilityElementsHidden).toBe(false);
});

it("gives confetti its playback window after native atlas startup and bounds a stalled start", async () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    await render(<Celebration eventId="late-start" onComplete={complete} />, false);
    await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
    act(() => find("Confetti").props.onAnimationStart());
    await act(async () => { await vi.advanceTimersByTimeAsync(1599); });
    expect(complete).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(complete).toHaveBeenCalledOnce();
    expect(tree!.root.findAll(n => String(n.type) === "Confetti")).toHaveLength(0);
    await render(<Celebration eventId="stalled" onComplete={complete} />, false);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(complete).toHaveBeenCalledTimes(2);
  } finally { vi.useRealTimers(); }
});
