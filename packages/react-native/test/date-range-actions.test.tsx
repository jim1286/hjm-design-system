import { act, create } from "react-test-renderer";
import { Pressable } from "react-native";
import { beforeEach, expect, it, vi } from "vitest";
import type { DateRangeValue } from "@hjmds/design-contracts/components/date-range";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { DateRangePicker } from "../src/date-range.js";
import { HjmNativeProvider } from "../src/provider.js";

export const dateRangePickerActionCases = [{ componentId: "date-range-picker" }] as const;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

it("completes an accessible date range through the named native date actions", () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/date-range-actions.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
  const onValueChange = vi.fn<(value: DateRangeValue) => void>();
  const grid = {
    cells: Array.from({ length: 14 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, "0")}` })),
    weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const,
    todayDate: "2026-09-10",
  };
  let renderer: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider>
        <DateRangePicker
          descriptor={{ grid, monthLabel: "September 2026" }}
          composeAccessibleName={({ date }) => date}
          rangeLabels={{ start: "시작일", end: "종료일", between: "기간 안" }}
          onValueChange={onValueChange}
        />
      </HjmNativeProvider>,
    );
  });

  const dateAction = (date: string) => renderer!.root.findAllByType(Pressable)
    .find((node) => (node.props.accessibilityLabel as string).startsWith(date))!;
  act(() => dateAction("2026-09-10").props.onPress());
  expect(onValueChange).toHaveBeenLastCalledWith({ start: "2026-09-10", end: null });
  expect(dateAction("2026-09-10").props.accessibilityLabel).toBe("2026-09-10, 시작일");

  act(() => dateAction("2026-09-14").props.onPress());
  expect(onValueChange).toHaveBeenLastCalledWith({ start: "2026-09-10", end: "2026-09-14" });
  expect(dateAction("2026-09-10").props.accessibilityLabel).toBe("2026-09-10, 시작일");
  expect(dateAction("2026-09-12").props.accessibilityLabel).toBe("2026-09-12, 기간 안");
  expect(dateAction("2026-09-14").props.accessibilityLabel).toBe("2026-09-14, 종료일");
});
