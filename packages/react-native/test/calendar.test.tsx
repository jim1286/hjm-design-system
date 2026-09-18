import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { DatePicker } from "../src/date-picker.js";
import { Calendar } from "../src/calendar.js";
import { HjmNativeProvider } from "../src/provider.js";
const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-0${index + 1}`, disabled: index === 1 })), weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const, todayDate: "2026-09-03" };
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer;
afterEach(() => { if (renderer) act(() => renderer.unmount()); });
it.each(["ltr", "rtl"] as const)("keeps each date accessible and pages independently of selection in %s", (direction) => {
  const select = vi.fn(); const month = vi.fn();
  act(() => { renderer = create(<HjmNativeProvider direction={direction} textScale={2}><Calendar descriptor={{ grid, monthLabel: "2026년 9월", defaultSelectedDate: "2026-09-01", onSelectionChange: select, onFocusedMonthChange: month }} nextMonth={{ month: "2026-10", label: "다음 달" }} composeAccessibleName={({ date }) => date} /></HjmNativeProvider>); });
  const target = (label: string) => renderer.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === label)!;
  expect(target("2026-09-02").props.accessibilityState).toMatchObject({ disabled: true });
  act(() => target("2026-09-02").props.onPress()); expect(select).not.toHaveBeenCalled();
  act(() => target("2026-09-04").props.onPress()); expect(select).toHaveBeenCalledWith("2026-09-04");
  expect(target("2026-09-04").props.accessibilityState.selected).toBe(true);
  act(() => target("다음 달").props.onPress()); expect(month).toHaveBeenCalledWith("2026-10", "next"); expect(select).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(target("2026-09-04").props.style)).toMatchObject({ minWidth: 44, minHeight: 44 });
  expect(renderer.root.findByType(ScrollView).props.horizontal).toBe(true);
});

it.each(["readOnly", "disabled"] as const)("blocks selection in an already-open DatePicker while %s", (state) => {
  const select = vi.fn();
  act(() => { renderer = create(<HjmNativeProvider><DatePicker descriptor={{ grid, label: "날짜", displayValue: null, placeholder: "선택", open: true, onOpenChange: () => {}, selectedDate: null, onSelectionChange: select, [state]: true }} monthLabel="September" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} /></HjmNativeProvider>); });
  const target = renderer.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === "2026-09-01")!;
  expect(target.props.accessibilityState.disabled).toBe(true);
  act(() => target.props.onPress()); expect(select).not.toHaveBeenCalled();
});
