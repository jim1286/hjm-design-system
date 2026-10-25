import type { DateRangeCellPaint } from "@hjmds/design-contracts/components/date-range";
export type CalendarPaint = Readonly<{
    paint: (date: string) => DateRangeCellPaint;
    /** Pointer preview of the not-yet-committed end. */
    onDayHover: (date: string) => void;
}>;
export declare const CalendarPaintContext: import("react").Context<Readonly<{
    paint: (date: string) => DateRangeCellPaint;
    /** Pointer preview of the not-yet-committed end. */
    onDayHover: (date: string) => void;
}> | null>;
//# sourceMappingURL=calendar-paint.d.ts.map