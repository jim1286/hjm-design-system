import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { DateRangeValue } from "@hjmds/design-contracts/components/date-range";
import { DateRangePicker } from "../src/date-range.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const grid = {
  cells: Array.from({ length: 28 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, "0")}` })),
  weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const,
  todayDate: "2026-09-01",
};

const day = (date: string) => [...document.querySelectorAll<HTMLElement>("[role='gridcell'] button, button[data-date]")]
  .find((node) => node.getAttribute("aria-label")?.startsWith(date) || node.textContent === String(Number(date.slice(-2))))!;
// Two filled edges joined by one band (dateRangeRecipe 2026-10-25).
const cellPaint = (date: string) => ({ edge: day(date).dataset.selected !== undefined, band: day(date).dataset.rangeBand ?? "none" });

function Fixture() {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });
  return (
    <HjmProvider reducedMotion>
      <DateRangePicker
        descriptor={{ grid, monthLabel: "2026년 9월" }}
        composeAccessibleName={({ date }) => date}
        value={value}
        onValueChange={setValue}
        rangeLabels={{ start: "시작일", end: "종료일", between: "기간 안" }}
      />
      <p role="status">{value.start ?? "-"} ~ {value.end ?? "-"}</p>
    </HjmProvider>
  );
}

const status = () => document.querySelector("[role='status']")!.textContent;

it("builds a range across two clicks and paints the days between", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => day("2026-09-10").click());
  expect(status()).toBe("2026-09-10 ~ -");
  await act(async () => day("2026-09-14").click());
  expect(status()).toBe("2026-09-10 ~ 2026-09-14");
  expect(cellPaint("2026-09-10")).toEqual({ edge: true, band: "toEnd" });
  expect(cellPaint("2026-09-12")).toEqual({ edge: false, band: "full" });
  expect(cellPaint("2026-09-14")).toEqual({ edge: true, band: "toStart" });
  expect(cellPaint("2026-09-20")).toEqual({ edge: false, band: "none" });
});

it("swaps when the second pick is earlier and restarts on a complete range", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => day("2026-09-14").click());
  await act(async () => day("2026-09-10").click());
  expect(status()).toBe("2026-09-10 ~ 2026-09-14");
  // Clicking a finished range starts a new one instead of guessing an edge.
  await act(async () => day("2026-09-20").click());
  expect(status()).toBe("2026-09-20 ~ -");
});

it("names the range edges for assistive technology, not only in color", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => day("2026-09-10").click());
  await act(async () => day("2026-09-12").click());
  expect(day("2026-09-10").getAttribute("aria-label")).toContain("시작일");
  expect(day("2026-09-11").getAttribute("aria-label")).toContain("기간 안");
  expect(day("2026-09-12").getAttribute("aria-label")).toContain("종료일");
});

// DOM .click() bypasses browser hit testing and did not catch range layers
// spanning sibling days. Use real pointer actions for this regression.
it("selects the intended range through real pointer hit testing", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => page.getByRole("gridcell", { name: "2026-09-03", exact: true }).click());
  await act(async () => page.getByRole("gridcell", { name: "2026-09-07", exact: true }).click());
  expect(status()).toBe("2026-09-03 ~ 2026-09-07");
  const label = day("2026-09-03").querySelector<HTMLElement>(".hjm-calendar__day-label")!;
  expect(getComputedStyle(label).zIndex).toBe("1");
});


it("completes a same-day range and restarts by activating its selected edge", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => day("2026-09-10").click());
  await act(async () => day("2026-09-10").click());
  expect(status()).toBe("2026-09-10 ~ 2026-09-10");
  await act(async () => day("2026-09-10").click());
  expect(status()).toBe("2026-09-10 ~ -");
});

it("folds a collapsible picker behind its summary once the range completes", async () => {
  function Collapsible() {
    const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });
    return (
      <HjmProvider reducedMotion>
        <DateRangePicker descriptor={{ grid, monthLabel: "2026년 9월" }} composeAccessibleName={({ date }) => date}
          value={value} onValueChange={setValue} rangeLabels={{ start: "시작일", end: "종료일", between: "기간 안" }}
          summary={{ startLabel: "시작일", endLabel: "종료일", placeholder: "날짜 선택", formatDate: (date) => date }} collapsible={{}}
          presets={[{ id: "week", label: "1주일", length: { days: 7 } }, { id: "all", label: "전체", length: { all: true } }]} />
      </HjmProvider>
    );
  }
  await act(async () => root.render(<Collapsible />));
  const toggle = () => document.querySelector<HTMLButtonElement>(".hjm-date-range__summary")!;
  const chip = (label: string) => [...document.querySelectorAll<HTMLElement>(".hjm-date-range__presets button")].find((node) => node.textContent?.includes(label))!;
  // Starts folded with the presets visible; the empty value is the selected "all" preset.
  expect(toggle().getAttribute("aria-expanded")).toBe("false");
  expect(document.querySelector("[role='grid']")).toBeNull();
  expect(chip("전체").getAttribute("aria-checked")).toBe("true");
  await act(async () => toggle().click());
  await act(async () => day("2026-09-03").click());
  expect(document.querySelector("[role='grid']")).not.toBeNull();
  await act(async () => day("2026-09-07").click());
  expect(toggle().getAttribute("aria-expanded")).toBe("false");
  expect(document.querySelector("[role='grid']")).toBeNull();
  expect(toggle().textContent).toContain("2026-09-07");
  await act(async () => toggle().click());
  expect(document.querySelector("[role='grid']")).not.toBeNull();
  await act(async () => chip("전체").click());
  expect(document.querySelector("[role='grid']")).toBeNull();
  expect(toggle().textContent).toContain("날짜 선택");
});
