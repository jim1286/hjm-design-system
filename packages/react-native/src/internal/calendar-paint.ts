import { createContext } from "react";
import type { DateRangeCellPaint } from "@hjmds/design-contracts/components/date-range";

// DateRangePicker paints its band and two filled edges through Calendar's own day cells instead of
// renderCellContent: the content slot adds a label line to every row and cannot reach the date circle
// (2026-10-25 range redesign). Internal so Calendar's public single-selection API stays unchanged.
export const CalendarPaintContext = createContext<((date: string) => DateRangeCellPaint) | null>(null);
