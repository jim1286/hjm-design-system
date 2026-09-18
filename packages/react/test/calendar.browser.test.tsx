import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { DatePicker } from "../src/date-picker.js";
import { Calendar, type CalendarHandle } from "../src/calendar.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
const grid = { cells: [{}, ...Array.from({ length: 13 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, "0")}`, disabled: index === 1 }))], weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const, todayDate: "2026-09-03" };
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });
const date = (day: string) => host.querySelector<HTMLButtonElement>(`[data-date='${day}']`)!;
const key = async (day: string, value: string) => act(async () => date(day).dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true })));
it("keeps disabled dates in roving focus, blocks activation and separates today from selection", async () => {
  const change = vi.fn();
  await act(async () => root.render(<Calendar descriptor={{ grid, monthLabel: "2026년 9월", defaultSelectedDate: "2026-09-01", onSelectionChange: change }} composeAccessibleName={({ date }) => date} />));
  await key("2026-09-01", "ArrowRight"); expect(document.activeElement).toBe(date("2026-09-02"));
  expect(date("2026-09-02").getAttribute("aria-disabled")).toBe("true");
  await act(async () => date("2026-09-02").click()); expect(change).not.toHaveBeenCalled();
  await key("2026-09-02", "ArrowDown"); expect(document.activeElement).toBe(date("2026-09-09"));
  await act(async () => date("2026-09-09").click()); expect(change).toHaveBeenCalledWith("2026-09-09");
  expect(date("2026-09-09").getAttribute("aria-selected")).toBe("true");
  expect(date("2026-09-03").getAttribute("aria-current")).toBe("date");
  expect(host.querySelectorAll('[data-date][tabindex="0"]')).toHaveLength(1);
  await key("2026-09-09", "Home"); expect(document.activeElement).toBe(date("2026-09-07"));
  await key("2026-09-07", "End"); expect(document.activeElement).toBe(date("2026-09-13"));
});
it("allows a product to page and restore exact overflow focus without changing controlled selection", async () => {
  const change = vi.fn();
  function Fixture() {
    const [next, setNext] = useState(false);
    const shown = next ? { ...grid, cells: Array.from({ length: 14 }, (_, index) => ({ date: `2026-10-${String(index + 1).padStart(2, "0")}` })) } : grid;
    return <Calendar descriptor={{ grid: shown, monthLabel: next ? "October" : "September", selectedDate: "2026-09-01", onSelectionChange: change }} composeAccessibleName={({ date }) => date}
      onNavigateBeyondGrid={(detail, focusDate) => { expect(detail).toMatchObject({ date: "2026-09-13", overflow: "after" }); setNext(true); focusDate("2026-10-01"); }} />;
  }
  await act(async () => root.render(<Fixture />)); await key("2026-09-13", "ArrowRight");
  expect(document.activeElement).toBe(date("2026-10-01")); expect(change).not.toHaveBeenCalled();
  expect(host.querySelectorAll('[aria-selected="true"]')).toHaveLength(0);
});
it.each(["ltr", "rtl"] as const)("preserves 7 target columns and one tab stop under 2x text in %s", async (direction) => {
  await page.viewport(320, 720); const ref = createRef<CalendarHandle>();
  await act(async () => root.render(<HjmProvider textScale={2} direction={direction}><Calendar ref={ref} descriptor={{ grid, monthLabel: "아주 길게 표시한 2026년 9월 달력" }} composeAccessibleName={({ date }) => date} renderCellContent={(cell) => cell.date.endsWith("03") ? "·" : null} /></HjmProvider>));
  await act(async () => ref.current?.focusDate("2026-09-03"));
  await key("2026-09-03", direction === "rtl" ? "ArrowLeft" : "ArrowRight"); expect(document.activeElement).toBe(date("2026-09-04"));
  expect(date("2026-09-04").getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
  expect(date("2026-09-04").getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  expect(host.querySelectorAll('[role="columnheader"]')).toHaveLength(7);
  expect(date("2026-09-02").querySelector(".hjm-calendar__day-label")!.getBoundingClientRect().top).toBe(date("2026-09-03").querySelector(".hjm-calendar__day-label")!.getBoundingClientRect().top);
});

it.each(["readOnly", "disabled"] as const)("does not commit a controlled-open DatePicker while %s", async (state) => {
  const change = vi.fn();
  await act(async () => root.render(<DatePicker descriptor={{ grid, label: "날짜", displayValue: null, placeholder: "선택", open: true, onOpenChange: () => {}, selectedDate: null, onSelectionChange: change, [state]: true }} monthLabel="September" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} />));
  expect(date("2026-09-01").getAttribute("aria-disabled")).toBe("true");
  await act(async () => date("2026-09-01").click()); expect(change).not.toHaveBeenCalled();
});

it("uses the large typography tier without shrinking date targets", async () => {
  const render = async (size: "medium" | "large") => act(async () => root.render(<HjmProvider><Calendar descriptor={{ grid, monthLabel: "September" }} size={size} composeAccessibleName={({ date }) => date} /></HjmProvider>));
  await render("medium"); const label = () => date("2026-09-01").querySelector<HTMLElement>(".hjm-calendar__day-label")!;
  const mediumFont = parseFloat(getComputedStyle(label()).fontSize); const mediumWidth = label().getBoundingClientRect().width;
  // Both tiers keep a 44px minimum target; large changes the typography tier.
  await render("large"); expect(parseFloat(getComputedStyle(label()).fontSize)).toBeGreaterThan(mediumFont); expect(label().getBoundingClientRect().width).toBeGreaterThanOrEqual(mediumWidth);
});
