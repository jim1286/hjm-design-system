import { createContext } from "react";
import type { DateRangeCellPaint } from "@hjmds/design-contracts/components/date-range";

// DateRangePicker paints its band and two filled edges through Calendar's own day cells instead of
// renderCellContent: the content slot adds a label line to every row and an absolutely positioned layer inside
// it could not reach the date circle (2026-10-25 range redesign). Internal so Calendar's public API is unchanged.
export type CalendarPaint = Readonly<{
  paint: (date: string) => DateRangeCellPaint;
  /** Pointer preview of the not-yet-committed end. */
  onDayHover: (date: string) => void;
}>;

export const CalendarPaintContext = createContext<CalendarPaint | null>(null);
