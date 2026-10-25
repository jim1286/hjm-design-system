import { assertIsoCalendarDate } from "./calendar.js";
import { accentTint } from "./colors.js";
import { themeColor } from "./color-references.js";
import { semanticColors } from "./semantic-colors.js";
export const emptyDateRange = { start: null, end: null };
export const defaultDateRangeLimit = { years: 1 };
function assertDateRangeLimit(limit) {
    const parts = [limit.years ?? 0, limit.months ?? 0, limit.days ?? 0];
    if (parts.some((part) => !Number.isInteger(part) || part < 0) || parts.every((part) => part === 0)) {
        throw new RangeError("Date range limit must be non-negative whole years/months/days and not empty");
    }
}
function toUtc(date) {
    return new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))));
}
function toIso(date) {
    return date.toISOString().slice(0, 10);
}
/** 달을 옮기면 그 달에 없는 날(1월 31일 + 1개월)은 말일로 맞춘다. 넘겨서 다음 달로 새지 않게 한다. */
function shiftIsoDate(date, limit, sign) {
    const base = toUtc(date);
    const months = base.getUTCFullYear() * 12 + base.getUTCMonth() + sign * ((limit.years ?? 0) * 12 + (limit.months ?? 0));
    const year = Math.floor(months / 12);
    const month = months - year * 12;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const shifted = new Date(Date.UTC(year, month, Math.min(base.getUTCDate(), lastDay)));
    shifted.setUTCDate(shifted.getUTCDate() + sign * (limit.days ?? 0));
    return toIso(shifted);
}
/** `start`를 한쪽 끝으로 둘 때 다른 끝이 올 수 있는 가장 이른·늦은 날(둘 다 포함). */
export function resolveDateRangeLimitBounds(start, limit) {
    assertIsoCalendarDate(start, "range start");
    assertDateRangeLimit(limit);
    const latest = toUtc(shiftIsoDate(start, limit, 1));
    latest.setUTCDate(latest.getUTCDate() - 1);
    const earliest = toUtc(shiftIsoDate(start, limit, -1));
    earliest.setUTCDate(earliest.getUTCDate() + 1);
    return { earliest: toIso(earliest), latest: toIso(latest) };
}
export function validateDateRange(value, limit = null) {
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
    if (limit !== null && value.start !== null && value.end !== null
        && value.end > resolveDateRangeLimitBounds(value.start, limit).latest) {
        throw new RangeError("Date range exceeds its maximum length");
    }
}
/**
 * 고르는 중에 이 날짜를 끝으로 고를 수 있는지. 비었거나 완성된 구간에서는 누르면 새로 시작하므로
 * 언제나 고를 수 있다. 막힌 날은 renderer가 비활성으로 그린다 — 눌렀다가 거절하면 이유를 알 수 없다.
 */
export function isDateWithinRangeLimit(value, date, limit) {
    assertIsoCalendarDate(date, "date");
    validateDateRange(value, limit);
    if (limit === null || value.start === null || value.end !== null)
        return true;
    const { earliest, latest } = resolveDateRangeLimitBounds(value.start, limit);
    return date >= earliest && date <= latest;
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
export function resolveDateRangeSelection(current, date, limit = null) {
    assertIsoCalendarDate(date, "selected date");
    validateDateRange(current, limit);
    // 최대 길이를 넘는 날은 renderer가 막지만, 그래도 들어오면 넘는 구간을 만들지 않고 거기서 새로 시작한다.
    if (current.start === null || current.end !== null || !isDateWithinRangeLimit(current, date, limit)) {
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
/**
 * 구간 칠하기. 시작·끝은 Calendar 단일 선택과 같은 채운 원이고, 그 사이는 원 높이의 띠가 칸을 이어
 * 하나의 구간으로 읽힌다. 2026-10-25 기기 화면에서 날짜 아래 점만으로는 구간이 보이지 않고(시작일은 점뿐,
 * 끝은 원과 점이 겹침) 점 자리 때문에 행 높이가 늘어 이 방식으로 바꿨다.
 *
 * 띠는 `primary`를 옅게 깐다. `surfaceAccent`는 프로필에 따라 바탕과 거의 같아(interaction-adapters.ts
 * 2026-09-30 기기 확인) 구간이 사라진다. 고르는 중의 미리보기 끝(Web hover)은 아직 확정이 아니므로 채우지
 * 않고 테두리만 둔다.
 */
export const dateRangeRecipe = {
    edge: {
        background: semanticColors.action.brand.background,
        content: semanticColors.action.brand.content,
    },
    band: { background: themeColor("primary", accentTint.base) },
    previewEdge: { border: semanticColors.border.focus },
};
/**
 * 띠를 그릴지. 시작과 (확정 또는 미리보기) 끝이 서로 다른 날일 때만 칸 사이를 잇는다 — 하루 구간이나
 * 시작만 고른 상태에 띠 반쪽을 그리면 없는 구간이 있는 것처럼 보인다.
 */
export function dateRangeSpans(value, hoveredDate) {
    validateDateRange(value);
    if (value.start === null)
        return false;
    const end = value.end ?? (hoveredDate != null && hoveredDate >= value.start ? hoveredDate : null);
    return end !== null && end !== value.start;
}
/** 구간이 실제로 쓸 수 있는 값인지. 제품의 제출 버튼이 읽는다. */
export function isCompleteDateRange(value) {
    validateDateRange(value);
    return value.start !== null && value.end !== null;
}
export const dateRangeBehavior = {
    controlled: ["value", "defaultValue", "onValueChange"],
    inputs: ["grid", "monthLabel", "hoveredDate", "maxRange"],
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
        "while-selecting-dates-beyond-the-maximum-range-are-disabled-not-rejected-after-a-press",
    ],
};
//# sourceMappingURL=date-range.js.map