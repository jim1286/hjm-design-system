import { useState } from "react";
import { Calendar, CalendarFoldHeader } from "@hjmds/react/calendar";
import { calendarVisibleDateRange } from "@hjmds/design-contracts/components/calendar";
import { Stack, Section } from "@hjmds/react/layout";
import { List, ListRow } from "@hjmds/react/display";
import { calendarExampleGrid, calendarExampleName, calendarExampleOverflowDate, calendarFoldExampleGrid, shiftCalendarMonth } from "../../../shared/calendar-example.js";
export function CalendarPreview() {
  const [month, setMonth] = useState("2026-09"); const [selected, setSelected] = useState<string | null>("2026-09-16");
  return <Stack gap="md"><div className="hjm-showcase-calendar-copy"><Section title="날짜로 돌아봐요" description="기록을 남긴 날을 골라보세요.">{null}</Section></div>
    <Calendar descriptor={{ grid: calendarExampleGrid(month), monthLabel: `${month.slice(0, 4)}년 ${Number(month.slice(-2))}월`, focusedMonth: month, onFocusedMonthChange: setMonth, selectedDate: selected, onSelectionChange: setSelected }}
      previousMonth={{ month: shiftCalendarMonth(month, -1), label: "이전 달" }} nextMonth={{ month: shiftCalendarMonth(month, 1), label: "다음 달" }}
      composeAccessibleName={calendarExampleName} renderCellContent={(cell) => cell.content ? "·" : null}
      onNavigateBeyondGrid={({ date, intent }, focusDate) => { const next = calendarExampleOverflowDate(date, intent); setMonth(next.slice(0, 7)); focusDate(next); }} />
  <div className="hjm-showcase-calendar-copy"><List label="선택한 날의 기록"><ListRow title={selected ?? "날짜를 선택해 주세요"} description={selected ? "선택한 날짜의 기록을 여기에서 확인해요." : "달력에서 날짜를 선택하면 기록이 보여요."} /></List></div></Stack>;
}

/** Folding calendar: one week with ‹ month › stepping a week; the arrow under the grid unfolds the month in place. */
export function CalendarFoldPreview() {
  const [selected, setSelected] = useState("2026-09-30"); const [expanded, setExpanded] = useState(false); const [paged, setPaged] = useState<string | null>(null);
  const month = expanded && paged ? paged : selected.slice(0, 7);
  const grid = calendarFoldExampleGrid(month, expanded);
  const range = calendarVisibleDateRange(grid.cells, { expanded, selectedDate: selected, todayDate: grid.todayDate });
  const label = `${month.slice(0, 4)}년 ${Number(month.slice(-2))}월`;
  return <Stack gap="md">
    <CalendarFoldHeader monthLabel={label} expanded={expanded} selectedDate={selected} focusedMonth={month}
      labels={{ previousWeek: "이전 주", nextWeek: "다음 주", previousMonth: "이전 달", nextMonth: "다음 달" }} onSelectedDateChange={setSelected} onFocusedMonthChange={setPaged} />
    <Calendar monthLabelVisibility="hidden" fold={{ expanded, onExpandedChange: next => { setPaged(null); setExpanded(next); }, label: expanded ? "달력 접기" : "달력 펼치기" }}
      descriptor={{ grid, monthLabel: label, focusedMonth: month, onFocusedMonthChange: setPaged, selectedDate: selected, onSelectionChange: date => { if (date) { setSelected(date); setExpanded(false); } } }}
      composeAccessibleName={calendarExampleName} renderCellContent={(cell) => cell.content ? "·" : null} />
    <div className="hjm-showcase-calendar-copy"><List label="불러올 날짜"><ListRow title={range ? `${range.from} – ${range.to}` : "—"} description="화면에 그려진 날짜만 불러와요." /></List></div>
  </Stack>;
}
