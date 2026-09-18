import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Calendar } from "@hjmds/react-native/calendar";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { calendarExampleGrid, calendarExampleName, shiftCalendarMonth } from "../../shared/calendar-example.js";
function CalendarPreview() {
  const [month, setMonth] = useState("2026-09"); const [selected, setSelected] = useState<string | null>("2026-09-16");
  return <Stack gap="md"><Text variant="title" emphasis="strong">날짜로 돌아봐요</Text><Text tone="muted">기록을 남긴 날을 골라보세요.</Text>
    <Calendar descriptor={{ grid: calendarExampleGrid(month), monthLabel: `${month.slice(0, 4)}년 ${Number(month.slice(-2))}월`, focusedMonth: month, onFocusedMonthChange: setMonth, selectedDate: selected, onSelectionChange: setSelected }}
      previousMonth={{ month: shiftCalendarMonth(month, -1), label: "이전 달" }} nextMonth={{ month: shiftCalendarMonth(month, 1), label: "다음 달" }}
      composeAccessibleName={calendarExampleName} renderCellContent={(cell) => cell.content ? <Text accessible={false} variant="label">·</Text> : null} />
    <Text emphasis="strong">{selected ?? "날짜를 선택해 주세요"}</Text><Text tone="muted">선택한 날짜의 기록을 여기에서 확인해요.</Text>
  </Stack>;
}
const meta = { title: "Patterns/Calendar", component: CalendarPreview } satisfies Meta<typeof CalendarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Records: Story = {};
