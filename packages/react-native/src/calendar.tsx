import type { CalendarProps } from "./internal/calendar-grid.js";
import { CalendarGrid } from "./internal/calendar-grid.js";

export type { CalendarHandle, CalendarMonthAction, CalendarProps } from "./internal/calendar-grid.js";

/** Inline dates stay individually accessible; Native month paging uses explicit buttons. */
export function Calendar<Content>(props: CalendarProps<Content>) {
  return <CalendarGrid<Content> {...props} />;
}
