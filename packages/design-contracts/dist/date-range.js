import { assertIsoCalendarDate } from "./calendar.js";
export const emptyDateRange = { start: null, end: null };
export function validateDateRange(value) {
    if (value.start !== null)
        assertIsoCalendarDate(value.start, "range start");
    if (value.end !== null)
        assertIsoCalendarDate(value.end, "range end");
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
export function resolveDateRangeSelection(current, date) {
    assertIsoCalendarDate(date, "selected date");
    validateDateRange(current);
    if (current.start === null || current.end !== null) {
        return { start: date, end: null };
    }
    return date < current.start
        ? { start: date, end: current.start }
        : { start: current.start, end: date };
}
/**
 * 한 칸이 구간 안에서 어떤 자리인지. 미리보기(`hoveredDate`)는 아직 확정되지 않은 끝을
 * 가리키므로 같은 함수가 처리한다 — renderer가 두 벌의 칠하기 규칙을 만들지 않게 한다.
 */
export function resolveDateRangeCellState(value, date, hoveredDate) {
    validateDateRange(value);
    if (value.start === null)
        return "none";
    const provisionalEnd = value.end
        ?? (hoveredDate != null && hoveredDate >= value.start ? hoveredDate : null);
    if (date === value.start && (provisionalEnd === null || date !== provisionalEnd))
        return "start";
    if (provisionalEnd !== null && date === provisionalEnd)
        return "end";
    if (provisionalEnd !== null && date > value.start && date < provisionalEnd)
        return "between";
    return "none";
}
/** 구간이 실제로 쓸 수 있는 값인지. 제품의 제출 버튼이 읽는다. */
export function isCompleteDateRange(value) {
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
};
//# sourceMappingURL=date-range.js.map