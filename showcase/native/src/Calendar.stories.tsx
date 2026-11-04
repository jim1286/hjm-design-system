import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Calendar, CalendarFoldHeader } from "@hjmds/react-native/calendar";
import { calendarVisibleDateRange } from "@hjmds/design-contracts/components/calendar";
import { Stack, Text } from "@hjmds/react-native/primitives";
// Metro resolves the shared TypeScript source by extension; a literal .js path has no file.
import { calendarExampleGrid, calendarExampleName, calendarFoldExampleGrid, shiftCalendarMonth } from "../../shared/calendar-example";
function CalendarPreview() {
  const [month, setMonth] = useState("2026-09"); const [selected, setSelected] = useState<string | null>("2026-09-16");
  return <Stack gap="md"><Text variant="title" emphasis="strong">날짜로 돌아봐요</Text><Text tone="muted">기록을 남긴 날을 골라보세요.</Text>
    <Calendar descriptor={{ grid: calendarExampleGrid(month), monthLabel: `${month.slice(0, 4)}년 ${Number(month.slice(-2))}월`, focusedMonth: month, onFocusedMonthChange: setMonth, selectedDate: selected, onSelectionChange: setSelected }}
      previousMonth={{ month: shiftCalendarMonth(month, -1), label: "이전 달" }} nextMonth={{ month: shiftCalendarMonth(month, 1), label: "다음 달" }}
      composeAccessibleName={calendarExampleName} renderCellContent={(cell) => cell.content ? <Text accessible={false} variant="label">·</Text> : null} />
    <Text emphasis="strong">{selected ?? "날짜를 선택해 주세요"}</Text><Text tone="muted">선택한 날짜의 기록을 여기에서 확인해요.</Text>
  </Stack>;
}
/** Folding calendar: ‹ month › steps a week while folded; the arrow under the grid unfolds the month in place. */
function CalendarFoldPreview() {
  const [selected, setSelected] = useState("2026-09-30"); const [expanded, setExpanded] = useState(false); const [paged, setPaged] = useState<string | null>(null);
  const month = expanded && paged ? paged : selected.slice(0, 7);
  const grid = calendarFoldExampleGrid(month, expanded);
  const range = calendarVisibleDateRange(grid.cells, { expanded, selectedDate: selected, todayDate: grid.todayDate });
  const label = `${month.slice(0, 4)}년 ${Number(month.slice(-2))}월`;
  return <Stack gap="md">
    <CalendarFoldHeader monthLabel={label} expanded={expanded} selectedDate={selected} focusedMonth={month}
      labels={{ previousWeek: "이전 주", nextWeek: "다음 주", previousMonth: "이전 달", nextMonth: "다음 달" }} onSelectedDateChange={setSelected} onFocusedMonthChange={setPaged} />
    <Calendar monthLabelVisibility="hidden" fold={{ expanded, onExpandedChange: (next) => { setPaged(null); setExpanded(next); }, label: expanded ? "달력 접기" : "달력 펼치기" }}
      descriptor={{ grid, monthLabel: label, focusedMonth: month, onFocusedMonthChange: setPaged, selectedDate: selected, onSelectionChange: (date) => { if (date) { setSelected(date); setExpanded(false); } } }}
      composeAccessibleName={calendarExampleName} renderCellContent={(cell) => cell.content ? <Text accessible={false} variant="label">·</Text> : null} />
    <Text tone="muted">불러올 날짜 {range ? `${range.from} – ${range.to}` : "—"}</Text>
  </Stack>;
}
const meta = { title: "배포/컴포넌트/데이터 표시/달력", parameters: { hjm: { componentIds: ["calendar"] } }, component: CalendarPreview } satisfies Meta<typeof CalendarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "기본",};
export const Records: Story = { name: "기록",};
export const Fold: Story = { name: "접기", render: () => <CalendarFoldPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
