import { createRef } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { DatePicker } from "../src/date-picker.js";
import { Calendar } from "../src/calendar.js";
import { HjmNativeProvider } from "../src/provider.js";
// This focused Calendar host-action test is the proof source registered by evidence.ts; the generic fixture omits paging and selection.
// componentId: "calendar"
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

it("keeps long month headings untruncated and disables paging without a month-change handler", () => {
  const longMonth = "An unusually long month heading that remains available to assistive technology";
  act(() => { renderer = create(<HjmNativeProvider><Calendar descriptor={{ grid, monthLabel: longMonth }} previousMonth={{ month: "2026-08", label: "Previous month" }} nextMonth={{ month: "2026-10", label: "Next month" }} composeAccessibleName={({ date }) => date} /></HjmNativeProvider>); });
  const heading = renderer.root.findAllByType(Text).find((node) => String(node.props.children) === longMonth)!;
  expect(heading.props.children).toBe(longMonth);
  expect(heading.props.numberOfLines).toBeUndefined();
  const paging = renderer.root.findAllByType(Pressable).filter((node) => ["Previous month", "Next month"].includes(node.props.accessibilityLabel));
  expect(paging).toHaveLength(2);
  expect(paging.every((node) => node.props.accessibilityState.disabled)).toBe(true);
  act(() => paging.forEach((node) => node.props.onPress()));
});

it("routes explicit focusDate requests through native accessibility focus", () => {
  const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
  const ref = createRef<import("../src/calendar.js").CalendarHandle>();
  act(() => { renderer = create(<HjmNativeProvider><Calendar ref={ref} descriptor={{ grid, monthLabel: "September" }} composeAccessibleName={({ date }) => date} /></HjmNativeProvider>, { createNodeMock: () => ({}) }); });
  act(() => ref.current?.focusDate("2026-09-04"));
  expect(focus).toHaveBeenCalledWith(1);
  focus.mockRestore();
});

it.each(["readOnly", "disabled"] as const)("blocks selection in an already-open DatePicker while %s", (state) => {
  const select = vi.fn();
  act(() => { renderer = create(<HjmNativeProvider><DatePicker descriptor={{ grid, label: "날짜", displayValue: null, placeholder: "선택", open: true, onOpenChange: () => {}, selectedDate: null, onSelectionChange: select, [state]: true }} monthLabel="September" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} /></HjmNativeProvider>); });
  const target = renderer.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === "2026-09-01")!;
  expect(target.props.accessibilityState.disabled).toBe(true);
  act(() => target.props.onPress()); expect(select).not.toHaveBeenCalled();
});

it.each(["ltr", "rtl"] as const)("reserves equal columns for leading and trailing fillers in %s", (direction) => {
  const partial = { ...grid, cells: [{}, {}, ...Array.from({ length: 9 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, "0")}` })), {}, {}, {}] };
  act(() => { renderer = create(<HjmNativeProvider direction={direction}><Calendar descriptor={{ grid: partial, monthLabel: "September" }} composeAccessibleName={({ date }) => date} /></HjmNativeProvider>); });
  const rows = renderer.root.findByType(ScrollView).findAll((node) => String(node.type) === "View" && StyleSheet.flatten(node.props.style)?.flexDirection === "row");
  expect(rows).toHaveLength(3);
  for (const row of rows) {
    const columns = row.children.filter((child) => typeof child !== "string");
    expect(columns).toHaveLength(7);
    for (const column of columns) expect(StyleSheet.flatten(column.props.style)).toMatchObject({ flex: 1, minWidth: 44 });
  }
});
