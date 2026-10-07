import { selectedTime } from "./time-example";
export type DateTimeSelectionProps = { initialStatus?: "idle" | "pending" | "failed"; disabled?: boolean };
export const dateTimeCopy = {
  title: "날짜와 시각 선택", description: "날짜와 하루 안의 시각을 함께 골라요. 이 예제는 선택값만 확인해요.",
  date: "기록 날짜", placeholder: "날짜 선택", clear: "날짜 지우기", close: "달력 닫기",
  hour: "시", minute: "분", hourPlaceholder: "시 선택", minutePlaceholder: "분 선택",
  hourClear: "시 선택 해제", minuteClear: "분 선택 해제", hourClose: "시 선택 닫기", minuteClose: "분 선택 닫기",
  previousMonth: "이전 달", nextMonth: "다음 달", confirm: "선택 확인", retry: "다시 확인", pending: "확인 중",
  missing: "날짜·시·분을 모두 골라주세요.", reset: "다시 고르기", failed: "확인하지 못했어요. 고른 값은 남아 있어요.",
  saved: "선택한 값을 확인했어요", tools: "검증 도구", respond: "미리보기 응답 받기", fail: "다음 확인 실패", armed: "다음 확인은 실패해요",
  timezone: "날짜와 시각은 별도 선택값이에요. 시간대·실제 예약·서버 저장은 제품에서 정해요.",
} as const;

export type DateTimeSelectionState = { date: string | null; hour: string | null; minute: string | null; month: string;
  status: "idle" | "pending" | "failed" | "saved"; saved: string | null; failNext: boolean;
  request: { value: string; failed: boolean } | null };
export type DateTimeSelectionAction = { type: "date" | "hour" | "minute"; value: string | null }
  | { type: "month"; value: string } | { type: "confirm" | "respond" | "reset" | "armFailure" };
export function initialDateTimeSelection(initialStatus: DateTimeSelectionProps["initialStatus"] = "idle"): DateTimeSelectionState {
  const prepared = initialStatus !== "idle";
  return { date: prepared ? "2026-09-16" : null, hour: prepared ? "09" : null, minute: prepared ? "30" : null,
    month: "2026-09", status: initialStatus, saved: null, failNext: false,
    request: initialStatus === "pending" ? { value: "2026-09-16 09:30", failed: false } : null };
}
export function dateTimeSelectionValue(model: DateTimeSelectionState): string | null {
  const time = selectedTime(model.hour, model.minute); return model.date && time ? `${model.date} ${time}` : null;
}
// Keep the ISO date→time groups together in RTL; changing the stored civil value
// or making the entire product screen LTR would hide the actual environment.
export function dateTimeSelectionDisplay(value: string): string { return `\u2066${value}\u2069`; }

// Showcase-only service controls keep pending/recovery deterministic without a timer,
// network request or new scheduling engine. Products supply their mutation result.
// A pure fixture reducer lets both hosts exercise identical values without importing React
// into the renderer-neutral shared folder (each Showcase owns its React installation).
export function dateTimeSelectionReducer(model: DateTimeSelectionState, action: DateTimeSelectionAction, disabled = false): DateTimeSelectionState {
  if (action.type === "respond") {
    if (model.status !== "pending" || !model.request) return model;
    return { ...model, status: model.request.failed ? "failed" : "saved", saved: model.request.failed ? null : model.request.value, request: null };
  }
  if (disabled || model.status === "pending") return model;
  switch (action.type) {
    case "date": case "hour": case "minute": return { ...model, [action.type]: action.value, status: "idle", saved: null };
    case "month": return { ...model, month: action.value };
    case "confirm": {
      const value = dateTimeSelectionValue(model); if (!value) return model;
      return { ...model, status: "pending", saved: null, failNext: false, request: { value, failed: model.failNext } };
    }
    case "reset": return initialDateTimeSelection();
    case "armFailure": return { ...model, failNext: true };
  }
}
