import { assertIsoCalendarDate } from "./calendar.js";
import type { BehaviorContract } from "./behaviors.js";

/**
 * 날짜 **구간** 선택. Calendar의 단일 선택과 같은 격자를 쓰되, "지금 무엇을 고르는
 * 중인가"라는 축이 하나 더 있다.
 *
 * Calendar에 `mode: "single" | "range"`를 넣지 않은 이유: 단일 선택의 값은
 * `string | null`이고 구간의 값은 `{start, end}`다. 한 컴포넌트가 두 값 모양을 가지면
 * 모든 소비자가 매번 좁히기(narrowing)를 해야 하고, "range 모드인데 selectedDate를 준"
 * 조합이 타입에 남는다. 대신 이 모듈이 **구간 판정만** 갖고 격자는 그대로 재사용한다.
 *
 * 값은 제품이 저장한다 — 이 모듈은 다음 클릭이 시작을 바꾸는지 끝을 정하는지만 답한다.
 */
export type DateRangeValue = Readonly<{
  start: string | null;
  /** `start`만 있고 `end`가 없는 상태가 "고르는 중"이다. 별도 플래그를 두지 않는다. */
  end: string | null;
}>;

export const emptyDateRange: DateRangeValue = { start: null, end: null };

export function validateDateRange(value: DateRangeValue): void {
  if (value.start !== null) assertIsoCalendarDate(value.start, "range start");
  if (value.end !== null) assertIsoCalendarDate(value.end, "range end");
  if (value.start === null && value.end !== null) {
    throw new TypeError("Date range cannot have an end without a start");
  }
  if (value.start !== null && value.end !== null && value.end < value.start) {
    throw new RangeError("Date range end must not precede start");
  }
}

/**
 * 날짜 하나를 눌렀을 때의 다음 값.
 *
 * - 비어 있거나 이미 완성된 구간이면 새 구간을 **시작**한다. (완성된 구간을 다시 눌렀을
 *   때 끝을 옮기는 동작은 "어느 쪽 끝인가"를 추측해야 해서 넣지 않았다 — 다시 시작하는
 *   쪽이 예측 가능하다.)
 * - 고르는 중이면 **끝**을 정한다. 시작보다 앞선 날짜를 누르면 두 값을 바꿔 담는다 —
 *   거절하면 사용자가 왜 안 되는지 알 수 없다.
 */
export function resolveDateRangeSelection(
  current: DateRangeValue,
  date: string,
): DateRangeValue {
  assertIsoCalendarDate(date, "selected date");
  validateDateRange(current);
  if (current.start === null || current.end !== null) {
    return { start: date, end: null };
  }
  return date < current.start
    ? { start: date, end: current.start }
    : { start: current.start, end: date };
}

export type DateRangeCellState = "start" | "end" | "between" | "none";

/**
 * 한 칸이 구간 안에서 어떤 자리인지. 미리보기(`hoveredDate`)는 아직 확정되지 않은 끝을
 * 가리키므로 같은 함수가 처리한다 — renderer가 두 벌의 칠하기 규칙을 만들지 않게 한다.
 */
export function resolveDateRangeCellState(
  value: DateRangeValue,
  date: string,
  hoveredDate?: string | null,
): DateRangeCellState {
  validateDateRange(value);
  if (value.start === null) return "none";
  const provisionalEnd = value.end
    ?? (hoveredDate != null && hoveredDate >= value.start ? hoveredDate : null);
  if (date === value.start && (provisionalEnd === null || date !== provisionalEnd)) return "start";
  if (provisionalEnd !== null && date === provisionalEnd) return "end";
  if (provisionalEnd !== null && date > value.start && date < provisionalEnd) return "between";
  return "none";
}

/** 구간이 실제로 쓸 수 있는 값인지. 제품의 제출 버튼이 읽는다. */
export function isCompleteDateRange(value: DateRangeValue): boolean {
  validateDateRange(value);
  return value.start !== null && value.end !== null;
}

export const dateRangeBehavior = {
  controlled: ["value", "defaultValue", "onValueChange"],
  inputs: ["grid", "monthLabel", "hoveredDate"],
  stateAxes: {
    value: ["empty", "selecting", "complete"],
    availability: ["enabled", "disabled"],
  },
  web: {
    roles: ["grid", "gridcell"],
    keyboard: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", "Space"],
    focus: "roving",
  },
  native: { roles: [], states: ["selected", "disabled"], actions: ["select"] },
  scenarios: [
    "a-click-on-a-complete-range-starts-a-new-one-instead-of-guessing-which-end-to-move",
    "picking-an-earlier-date-while-selecting-swaps-the-two-instead-of-rejecting-it",
    "the-selecting-state-is-start-without-end-not-a-separate-flag",
    "a-hovered-date-previews-the-end-through-the-same-cell-state-function",
    "an-end-without-a-start-is-rejected-by-validation-not-rendered-as-something",
    "calendar-keeps-single-selection-this-module-never-adds-a-mode-axis-to-it",
  ],
} as const satisfies BehaviorContract;
