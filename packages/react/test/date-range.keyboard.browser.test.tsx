import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import type { DateRangeValue } from "@hjmds/design-contracts/components/date-range";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { DateRangePicker } from "../src/date-range.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;

export const dateRangeKeyboardCases = [{ componentId: "date-range-picker" }] as const;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

const grid = {
  cells: Array.from({ length: 28 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, "0")}` })),
  weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const,
  todayDate: "2026-09-10",
};

function Fixture() {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });
  return (
    <HjmProvider systemTheme="light">
      <DateRangePicker
        descriptor={{ grid, monthLabel: "September 2026" }}
        composeAccessibleName={({ date }) => date}
        rangeLabels={{ start: "range start", end: "range end", between: "in range" }}
        value={value}
        onValueChange={setValue}
      />
      <p role="status">{value.start ?? "-"} to {value.end ?? "-"}</p>
    </HjmProvider>
  );
}

it("selects both range edges with calendar keyboard navigation", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/date-range.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
  await act(async () => root.render(<Fixture />));

  await act(async () => userEvent.tab());
  const start = host.querySelector<HTMLButtonElement>('[data-date="2026-09-10"]')!;
  expect(document.activeElement).toBe(start);

  await act(async () => userEvent.keyboard("{Enter}"));
  expect(host.querySelector('[role="status"]')?.textContent).toBe("2026-09-10 to -");
  expect(start.getAttribute("aria-label")).toBe("2026-09-10, range start");

  await act(async () => userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}"));
  const end = host.querySelector<HTMLButtonElement>('[data-date="2026-09-14"]')!;
  expect(document.activeElement).toBe(end);
  await act(async () => userEvent.keyboard("{Enter}"));

  expect(host.querySelector('[role="status"]')?.textContent).toBe("2026-09-10 to 2026-09-14");
  expect(start.getAttribute("aria-label")).toBe("2026-09-10, range start");
  expect(host.querySelector('[data-date="2026-09-12"]')?.getAttribute("aria-label")).toBe("2026-09-12, in range");
  expect(end.getAttribute("aria-label")).toBe("2026-09-14, range end");
});
