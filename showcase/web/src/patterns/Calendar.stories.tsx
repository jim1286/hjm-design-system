import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "@hjmds/react/calendar";
import { Stack, Section } from "@hjmds/react/layout";
import { List, ListRow } from "@hjmds/react/display";
import { calendarExampleGrid, calendarExampleName, calendarExampleOverflowDate, shiftCalendarMonth } from "../../../shared/calendar-example.js";
export function CalendarPreview() {
  const [month, setMonth] = useState("2026-09"); const [selected, setSelected] = useState<string | null>("2026-09-16");
  return <Stack gap="md"><div className="hjm-showcase-calendar-copy"><Section title="날짜로 돌아봐요" description="기록을 남긴 날을 골라보세요.">{null}</Section></div>
    <Calendar descriptor={{ grid: calendarExampleGrid(month), monthLabel: `${month.slice(0, 4)}년 ${Number(month.slice(-2))}월`, focusedMonth: month, onFocusedMonthChange: setMonth, selectedDate: selected, onSelectionChange: setSelected }}
      previousMonth={{ month: shiftCalendarMonth(month, -1), label: "이전 달" }} nextMonth={{ month: shiftCalendarMonth(month, 1), label: "다음 달" }}
      composeAccessibleName={calendarExampleName} renderCellContent={(cell) => cell.content ? "·" : null}
      onNavigateBeyondGrid={({ date, intent }, focusDate) => { const next = calendarExampleOverflowDate(date, intent); setMonth(next.slice(0, 7)); focusDate(next); }} />
  <div className="hjm-showcase-calendar-copy"><List label="선택한 날의 기록"><ListRow title={selected ?? "날짜를 선택해 주세요"} description={selected ? "선택한 날짜의 기록을 여기에서 확인해요." : "달력에서 날짜를 선택하면 기록이 보여요."} /></List></div></Stack>;
}
const meta = { title: "Patterns/Calendar", component: CalendarPreview, parameters: { hjm: { edgeToEdge: true } } } satisfies Meta<typeof CalendarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Records: Story = {};
export const LargeText: Story = { globals: { textScale: "2" } };
