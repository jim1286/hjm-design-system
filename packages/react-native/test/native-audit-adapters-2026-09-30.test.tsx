import { createElement, type ReactNode } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { BackHandler, Platform, Switch as NativeSwitch } from "react-native";
import { afterEach, expect, it, vi } from "vitest";

import { CarouselMotion } from "../src/carousel-motion.js";
import { ImageViewer } from "../src/image-viewer.js";
import { Switch } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
import { GestureSheet, GestureSheetInput, dismissTopGestureSheet } from "../src/sheet-gesture.js";
import { SortableCollection } from "../src/sortable.js";
import { SwipeActions } from "../src/swipe-actions.js";

/**
 * Mock regressions for the optional/experimental adapter findings of the
 * 2026-09-30 installed iOS/Android audit, plus the Switch row alignment.
 */
vi.mock("react-native-sortables", () => ({ default: { Handle: "Handle", Grid: (p: { data: unknown[]; renderItem(i: { item: unknown; index: number }): ReactNode }) => createElement("Grid", p, p.data.map((item, index) => createElement("Cell", { key: index }, p.renderItem({ item, index })))) } }));
vi.mock("react-native-gesture-handler/ReanimatedSwipeable", () => ({ default: "Swipeable" }));
vi.mock("react-native-reanimated-carousel", () => ({ Carousel: "Carousel" }));
vi.mock("react-native-gesture-handler", () => ({ GestureHandlerRootView: "GestureRoot" }));
vi.mock("react-native-reanimated", () => ({ ReduceMotion: { Always: "always", System: "system" } }));
vi.mock("react-native-zoom-toolkit", () => ({ Gallery: (props: { data: unknown[]; renderItem: (item: unknown, index: number) => ReactNode; initialIndex: number }) => createElement("Gallery", props, props.renderItem(props.data[props.initialIndex], props.initialIndex)) }));
vi.mock("@gorhom/bottom-sheet", async () => {
  const { forwardRef, useImperativeHandle, createElement: h } = await import("react");
  return {
    BottomSheetModal: forwardRef((props: { children?: ReactNode }, ref) => { useImperativeHandle(ref, () => ({ present: () => {}, dismiss: () => {} })); return h("SheetModal", props, props.children); }),
    BottomSheetModalProvider: "SheetProvider", BottomSheetScrollView: "SheetScroll", BottomSheetBackdrop: "Backdrop", BottomSheetHandle: "SheetHandle",
    BottomSheetTextInput: forwardRef((props: Record<string, unknown>, ref) => h("SheetInput", { ...props, ref })),
  };
});
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; vi.restoreAllMocks(); });
async function render(child: ReactNode, direction: "ltr" | "rtl" = "ltr") {
  await act(async () => { tree = create(<HjmNativeProvider reducedMotion direction={direction} safeAreaInsets={{ top: 47, bottom: 34 }}>{child}</HjmNativeProvider>, { createNodeMock: () => ({ reset() {}, getCurrentIndex: () => 0, scrollTo() {}, blur() {} }) }); });
}
const flat = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : ((style ?? {}) as Record<string, unknown>);
const rowOf = (node: ReactTestInstance) => {
  let at: ReactTestInstance | null = node;
  while (at && flat(at.props.style).flexDirection !== "row") at = at.parent;
  return at!;
};

it("Sortable and SwipeActions rows mirror under HJM RTL", async () => {
  const labels = { instructions: "Move", dragStart: () => "Start", dragCancel: "Cancel", handle: (i: { label: string }) => i.label, previous: (i: { label: string }) => `${i.label} earlier`, next: (i: { label: string }) => `${i.label} later`, position: (i: { label: string }) => i.label };
  await render(<SortableCollection items={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]} label="Items" labels={labels} renderItem={(i) => i.label} onCommit={() => {}} />, "rtl");
  const buttons = tree!.root.findAll((n) => n.props.children === "Alpha earlier" && typeof n.type === "string");
  expect(flat(rowOf(buttons[0]!).props.style).direction).toBe("rtl");
  const handle = tree!.root.find((n) => n.props.accessibilityRole === "adjustable" && n.props.accessibilityLabel === "Alpha");
  expect(flat(handle.props.style)).toMatchObject({ direction: "rtl", flexDirection: "row" });
  act(() => tree!.unmount()); tree = undefined;

  await render(<SwipeActions rowId="row" label="Row" actionsLabel="Actions" openRowId={null} onOpenRowChange={() => {}}
    actions={[{ id: "archive", label: "Archive" }, { id: "delete", label: "Delete", intent: "danger" }]} onAction={() => {}} onError={() => {}}>content</SwipeActions>, "rtl");
  const archive = tree!.root.findAll((n) => n.props.children === "Archive" && typeof n.type === "string");
  expect(flat(rowOf(archive[archive.length - 1]!).props.style).direction).toBe("rtl");
});

it("CarouselMotion pages a slow release past half a slide and leaves short or flung-back drags alone", async () => {
  const change = vi.fn();
  const slides = [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }];
  await render(<CarouselMotion slides={slides} currentKey="a" onCurrentKeyChange={change} label="Places" previousLabel="Prev" nextLabel="Next" width={400} height={160} renderSlide={(i) => i.label} />);
  let onEnd: ((event: { translationX: number; velocityX: number }) => void) | undefined;
  const gesture = { activeOffsetX: () => gesture, failOffsetY: () => gesture, onEnd: (cb: typeof onEnd) => { onEnd = cb; return gesture; } };
  tree!.root.find((n) => String(n.type) === "Carousel").props.onConfigurePanGesture(gesture);
  act(() => onEnd!({ translationX: -296, velocityX: 0 })); // 74% and stopped: the audit case
  expect(change).toHaveBeenLastCalledWith("b");
  change.mockClear();
  act(() => onEnd!({ translationX: -120, velocityX: 0 })); // under half: snap back
  act(() => onEnd!({ translationX: -300, velocityX: -900 })); // library pages this itself
  act(() => onEnd!({ translationX: -300, velocityX: 1200 })); // flung back: cancel
  act(() => onEnd!({ translationX: 300, velocityX: 0 })); // before the first slide: clamp
  expect(change).not.toHaveBeenCalled();
});

it("GestureSheet: separate accessible children, localized chrome, safe-area insets, framed input and Modal back routing", async () => {
  const change = vi.fn();
  vi.spyOn(BackHandler, "addEventListener").mockReturnValue({ remove: () => {} } as never);
  await render(<GestureSheet open onOpenChange={change} title="Details" closeLabel="Close"><GestureSheetInput accessibilityLabel="Memo" /></GestureSheet>);
  const modal = tree!.root.find((n) => String(n.type) === "SheetModal");
  expect(modal.props).toMatchObject({ accessible: false, accessibilityLabel: "Details", topInset: 47 });
  const backdrop = modal.props.backdropComponent({ animatedIndex: {}, animatedPosition: {} });
  expect(backdrop.props).toMatchObject({ accessibilityLabel: "Close", accessibilityHint: "" });
  expect(modal.props.handleComponent({}).props.accessible).toBe(false);
  const background = modal.props.backgroundComponent({ style: {} });
  expect(background.props.accessible).toBe(false);
  const body = tree!.root.find((n) => n.props.accessibilityViewIsModal === true);
  expect(flat(body.props.style).paddingBottom).toBeGreaterThanOrEqual(34);
  const input = tree!.root.find((n) => String(n.type) === "SheetInput");
  expect(flat(input.props.style)).toMatchObject({ borderWidth: 1 });
  // The common field recipe owns geometry; require an accessible target instead
  // of pinning the adapter's former 48pt override over the 44pt base input.
  expect(flat(input.props.style).minHeight).toBeGreaterThanOrEqual(44);
  // A host Modal's onRequestClose routes Android back to the sheet first.
  expect(dismissTopGestureSheet()).toBe(true);
  expect(change).toHaveBeenCalledWith(false);
  act(() => tree!.unmount()); tree = undefined;
  expect(dismissTopGestureSheet()).toBe(false);
});

it("ImageViewer: caption and controls sit inside the page gutter", async () => {
  await render(<ImageViewer open onClose={() => {}} safeAreaInsets={{ top: 47, bottom: 34 }} items={[{ id: "one", uri: "https://example.com/a.png", label: "Deer" }]}
    closeLabel="Close" previousLabel="Previous" nextLabel="Next" loadingLabel="Loading" errorLabel="Error" retryLabel="Retry" />);
  const caption = tree!.root.find((n) => n.props.children === "Deer" && n.props.accessibilityLiveRegion === "polite");
  let at: ReactTestInstance | null = caption.parent;
  while (at && typeof flat(at.props.style).paddingLeft !== "number") at = at.parent;
  expect(flat(at!.props.style).paddingLeft).toBeGreaterThan(0);
  expect(flat(at!.props.style).paddingRight).toBe(flat(at!.props.style).paddingLeft);
});

it("Switch: on iOS the track restates centre alignment over RN's alignSelf flex-start", async () => {
  const os = Platform.OS;
  (Platform as { OS: string }).OS = "ios";
  try {
    await render(<Switch label="Notifications" defaultChecked />);
    expect(flat(tree!.root.findByType(NativeSwitch).props.style).alignSelf).toBe("center");
  } finally {
    (Platform as { OS: string }).OS = os;
  }
});
