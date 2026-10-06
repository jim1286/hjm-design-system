import type { DateEntryDraft, DateEntryParseResult, DateEntryIssue } from "../../packages/design-contracts/src/date-entry.js";
export const dateEntryLabels = { label: "기록 날짜", year: "연도", month: "월", day: "일" };
// Showcase fixture, not an HJM calendar default: demonstrate Gregorian dates and
// an explicit product policy for ASCII/full-width digits and English month names.
export function parseExampleDate(draft: DateEntryDraft): DateEntryParseResult {
  const year = draft.year.normalize("NFKC").trim();
  const day = draft.day.normalize("NFKC").trim();
  const month = draft.month.normalize("NFKC").trim().toLowerCase();
  if (!/^\d{4}$/.test(year)) return { status: "incomplete", code: "year", fields: ["year"] };
  const names = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const monthNumber = /^\d{1,2}$/.test(month) ? Number(month) : names.findIndex(name => month === name || month === name.slice(0, 3)) + 1;
  if (monthNumber < 1 || monthNumber > 12) return { status: "invalid", code: "month", fields: ["month"] };
  if (!/^\d{1,2}$/.test(day) || Number(day) < 1 || Number(day) > 31) return { status: "invalid", code: "day", fields: ["day"] };
  const y = Number(year), d = Number(day);
  const date = new Date(0); date.setUTCFullYear(y, monthNumber - 1, d); date.setUTCHours(0, 0, 0, 0);
  if (y < 1 || date.getUTCFullYear() !== y || date.getUTCMonth() !== monthNumber - 1 || date.getUTCDate() !== d)
    return { status: "invalid", code: "calendar", fields: ["year", "month", "day"] };
  return { status: "valid", value: `${year}-${String(monthNumber).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
}
export function dateEntryIssueText(issue: DateEntryIssue): string {
  if (issue.kind === "missing") return `${issue.fields.map(part => dateEntryLabels[part]).join("·")}을 입력해 주세요.`;
  const messages: Record<string, string> = { year: "연도는 네 자리로 입력해 주세요.", month: "1~12 또는 영어 월 이름을 입력해 주세요.", day: "1~31 사이의 일을 입력해 주세요.", calendar: "실제로 존재하는 날짜를 입력해 주세요." };
  return messages[issue.code] ?? "날짜를 확인해 주세요.";
}
