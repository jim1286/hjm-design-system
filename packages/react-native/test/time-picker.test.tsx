import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { TimePicker, type TimePickerProps } from "../src/time-picker.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Sheet } from "../src/overlays.js";
import { Button } from "../src/actions.js";
import { createHostNodeMock } from "./host-node-mock.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const labels = { label: "Time", hour: "Hour", minute: "Minute", placeholder: "Choose time", confirm: "Confirm", cancel: "Cancel" };
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.useRealTimers(); });
const render = (props: Partial<TimePickerProps> = {}) => act(() => {
  const ui = <HjmNativeProvider><TimePicker value="14:30" labels={labels} onValueChange={() => {}} {...props} /></HjmNativeProvider>;
  if (tree) tree.update(ui); else tree = create(ui, { createNodeMock: createHostNodeMock });
});
const option = (label: string) => tree!.root.findAllByType(Pressable).find(n => n.props.accessibilityLabel === label)!;
const press = (label: string) => act(() => option(label).props.onPress());
it("time-picker keeps one sheet open for both columns and commits midnight only on confirmation", () => {
  const changed = vi.fn(); render({ onValueChange: changed }); press("Time, 14:30");
  press("00 Hour"); press("00 Minute"); expect(changed).not.toHaveBeenCalled();
  expect(tree!.root.findByType(Sheet).props.open).toBe(true);
  act(() => tree!.root.findAllByType(Button).find(n => n.props.children === "Confirm")!.props.onPress());
  expect(changed).toHaveBeenLastCalledWith("00:00"); expect(tree!.root.findByType(Sheet).props.open).toBe(false);
});
it("time-picker discards edits on dismissal and resets to the latest external value", () => {
  vi.useFakeTimers(); const changed = vi.fn(); render({ onValueChange: changed }); press("Time, 14:30"); press("23 Hour");
  act(() => tree!.root.findByType(Sheet).props.onOpenChange(false)); act(() => { vi.runAllTimers(); }); press("Time, 14:30"); act(() => { vi.runAllTimers(); });
  expect(option("14 Hour").props.accessibilityState.checked).toBe(true); expect(changed).not.toHaveBeenCalled();
  render({ value: "09:15", onValueChange: changed }); expect(option("09 Hour").props.accessibilityState.checked).toBe(true);
});
it("time-picker exposes radio checked/disabled state and preserves partial inline edits", () => {
  const changed = vi.fn();
  function Consumer() { const [value, setValue] = useState<string | null>(null); return <TimePicker presentation="inline" value={value} labels={labels} minuteStep={15} isTimeUnavailable={v => v === "00:15"} onValueChange={v => { changed(v); setValue(v); }} />; }
  act(() => { tree = create(<HjmNativeProvider><Consumer /></HjmNativeProvider>, { createNodeMock: createHostNodeMock }); });
  press("00 Hour"); expect(changed).toHaveBeenLastCalledWith(null);
  expect(option("15 Minute").props.accessibilityState.disabled).toBe(true); press("15 Minute"); expect(changed).toHaveBeenCalledTimes(1);
  press("00 Minute"); expect(changed).toHaveBeenLastCalledWith("00:00");
  expect(option("00 Minute").props.accessibilityRole).toBe("radio"); expect(option("00 Minute").props.accessibilityState.checked).toBe(true);
  expect(tree!.root.findAllByType(ScrollView).every(n => n.props.nestedScrollEnabled)).toBe(true);
});
it.each(["disabled", "readOnly"] as const)("time-picker dismisses an open field when %s changes", state => {
  const changed = vi.fn(); render({ onValueChange: changed }); press("Time, 14:30");
  render({ [state]: true, onValueChange: changed }); expect(tree!.root.findByType(Sheet).props.open).toBe(false); expect(changed).not.toHaveBeenCalled();
});
it.each(["light", "dark"] as const)("time-picker renders inline in %s RTL without adding a nested sheet", theme => {
  act(() => { tree = create(<HjmNativeProvider theme={theme} direction="rtl" reducedMotion><TimePicker presentation="inline" value="14:30" labels={labels} onValueChange={() => {}} /></HjmNativeProvider>, { createNodeMock: createHostNodeMock }); });
  expect(tree!.root.findAllByType(Sheet)).toHaveLength(0); expect(option("14 Hour").props.accessibilityState.checked).toBe(true);
});

it("wheel exposes adjustable columns and skips unavailable values without confirming", () => {
  const changed = vi.fn();
  render({ selectionStyle: "wheel", presentation: "inline", minuteStep: 15, isTimeUnavailable: value => value.endsWith(":15"), onValueChange: changed });
  const minute = () => tree!.root.findAllByType(View).find(node => node.props.accessibilityRole === "adjustable" && node.props.accessibilityLabel === "Minute")!;
  expect(changed).not.toHaveBeenCalled();
  act(() => minute().props.onAccessibilityAction({ nativeEvent: { actionName: "decrement" } }));
  expect(changed).toHaveBeenLastCalledWith("14:00");
  expect(minute().props.accessibilityValue.text).toBe("00 Minute");
  act(() => minute().props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  expect(changed).toHaveBeenLastCalledWith("14:30");
  expect(tree!.root.findAllByType(ScrollView)[1]!.props.snapToOffsets).toEqual([0, 88, 132]);
  render({ selectionStyle: "wheel", presentation: "inline", readOnly: true, onValueChange: changed });
  changed.mockClear();
  act(() => minute().props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  expect(changed).not.toHaveBeenCalled();
  expect(tree!.root.findAllByType(ScrollView)[1]!.props.scrollEnabled).toBe(false);
});

it("wheel preserves an empty draft and ignores initial scroll callbacks", () => {
  const changed = vi.fn();
  render({ value: null, presentation: "inline", selectionStyle: "wheel", onValueChange: changed });
  const scroll = tree!.root.findAllByType(ScrollView)[0]!;
  act(() => scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 0 } } }));
  act(() => scroll.props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { y: 0 } } }));
  expect(changed).not.toHaveBeenCalled();
  press("00 Hour");
  expect(changed).toHaveBeenLastCalledWith(null);
  expect(option("00 Hour").props.accessibilityState.checked).toBe(true);
});

it("wheel keeps native momentum active through draft echoes and settles before confirmation", () => {
  const changed = vi.fn();
  render({ selectionStyle: "wheel", minuteStep: 15, onValueChange: changed });
  press("Time, 14:30");
  const hours = () => tree!.root.findAllByType(ScrollView)[0]!;
  act(() => hours().props.onScrollBeginDrag());
  act(() => hours().props.onScroll({ nativeEvent: { contentOffset: { y: 23 * 44 } } }));
  expect(option("23 Hour").props.accessibilityState.checked).toBe(true);
  expect(tree!.root.findAllByType(Button).find(node => node.props.children === "Confirm")!.props.disabled).toBe(true);
  act(() => hours().props.onScrollEndDrag({ nativeEvent: { contentOffset: { y: 23 * 44 }, velocity: { y: 1 } } }));
  expect(changed).not.toHaveBeenCalled();
  act(() => hours().props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { y: 23 * 44 } } }));
  const confirm = tree!.root.findAllByType(Button).find(node => node.props.children === "Confirm")!;
  expect(confirm.props.disabled).toBe(false);
  act(() => confirm.props.onPress());
  expect(changed).toHaveBeenLastCalledWith("23:30");
});
