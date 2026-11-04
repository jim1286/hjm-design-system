import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Calendar } from "../src/calendar.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let renderer: ReactTestRenderer | undefined;
afterEach(() => { act(() => renderer?.unmount()); renderer = undefined; });
const grid = { cells: [{}, ...Array.from({ length: 13 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, "0")}` }))], weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const, todayDate: "2026-09-03" };

describe("Native Calendar fold", () => {
  it("shows the selected week folded and the whole month after the handle", () => {
    function Fixture() {
      const [expanded, setExpanded] = useState(false);
      return <HjmNativeProvider reducedMotion><Calendar fold={{ expanded, onExpandedChange: setExpanded, label: expanded ? "달력 접기" : "달력 펼치기" }}
        descriptor={{ grid, monthLabel: "2026년 9월", selectedDate: "2026-09-09", onSelectionChange: () => {} }} composeAccessibleName={({ date }) => date} /></HjmNativeProvider>;
    }
    act(() => { renderer = create(<Fixture />); });
    const days = () => [...new Set(renderer!.root.findAll((node) => typeof node.props.accessibilityLabel === "string" && /^2026-09-\d\d$/.test(node.props.accessibilityLabel) && typeof node.props.onPress === "function").map((node) => node.props.accessibilityLabel as string))];
    expect(days()).toEqual(["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"]);
    const handle = () => renderer!.root.findAll((node) => node.props.accessibilityState?.expanded !== undefined && typeof node.props.onPress === "function")[0]!;
    expect(handle().props.accessibilityLabel).toBe("달력 펼치기");
    act(() => handle().props.onPress());
    expect(days()).toHaveLength(13);
    expect(handle().props.accessibilityState.expanded).toBe(true);
  });
});
