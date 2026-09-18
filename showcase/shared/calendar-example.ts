// Example product owns Gregorian UTC arithmetic. The renderer receives date keys
// and localized copy so neither device time zone nor its clock changes this demo.
export function shiftCalendarMonth(month: string, delta: number): string {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year!, number! - 1 + delta, 1)).toISOString().slice(0, 7);
}
export function calendarExampleGrid(month: string) {
  const [year, number] = month.split("-").map(Number);
  const leading = new Date(Date.UTC(year!, number! - 1, 1)).getUTCDay();
  const length = new Date(Date.UTC(year!, number!, 0)).getUTCDate();
  return {
    todayDate: "2026-09-16",
    weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const,
    cells: Array.from({ length: Math.ceil((leading + length) / 7) * 7 }, (_, index) => {
      const day = index - leading + 1;
      return day < 1 || day > length ? {} : { date: `${month}-${String(day).padStart(2, "0")}`, disabled: day === 20, content: day % 3 === 0 ? "기록 있음" : "" };
    }),
  };
}
export function calendarExampleName(info: { date: string; isToday: boolean; disabled: boolean; content?: string }) {
  return `${info.date}${info.isToday ? ", 오늘" : ""}${info.disabled ? ", 선택 불가" : ""}${info.content ? `, ${info.content}` : ""}`;
}
export function calendarExampleOverflowDate(date: string, intent: string): string {
  const offset = intent === "next-week" ? 7 : intent === "previous-week" ? -7 : intent === "previous-day" || intent === "first-of-week" ? -1 : 1;
  const day = new Date(`${date}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
}
