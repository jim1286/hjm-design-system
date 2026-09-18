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
const cellState = (date: string) => day(date).querySelector<HTMLElement>(".hjm-date-range__cell")?.dataset.range;

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
  expect(cellState("2026-09-10")).toBe("start");
  expect(cellState("2026-09-12")).toBe("between");
  expect(cellState("2026-09-14")).toBe("end");
  expect(cellState("2026-09-20")).toBe("none");
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
