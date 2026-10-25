"use client";

import type { CalendarProps } from "./internal/calendar-grid.js";
import { CalendarGrid } from "./internal/calendar-grid.js";

export type { CalendarHandle, CalendarMonthAction, CalendarOverflow, CalendarProps } from "./internal/calendar-grid.js";

/** Inline single-date grid shared with DatePicker; month data remains product-owned. */
export function Calendar<Content>(props: CalendarProps<Content>) {
  return <CalendarGrid<Content> {...props} />;
}
