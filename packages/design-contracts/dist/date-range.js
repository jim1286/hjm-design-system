import { assertIsoCalendarDate, calendarRecipe } from "./calendar.js";
import { semanticColors } from "./semantic-colors.js";
import { accentTint } from "./colors.js";
import { themeColor } from "./color-references.js";
import { spacing, stroke } from "./foundations.js";
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
const unpainted = { edge: false, band: "none" };
export function resolveDateRangeCellPaint(value, date, hoveredDate) {
    const state = resolveDateRangeCellState(value, date, hoveredDate);
    if (state === "none")
        return unpainted;
    if (state === "between")
        return { edge: false, band: "full" };
    const provisionalEnd = value.end
        ?? (hoveredDate != null && value.start !== null && hoveredDate >= value.start ? hoveredDate : null);
    const spans = provisionalEnd !== null && provisionalEnd !== value.start;
    if (state === "start")
        return { edge: true, band: spans ? "toEnd" : "none" };
    return { edge: true, band: spans ? "toStart" : "none" };
}
/**
 * 요약 칸에서 강조할 끝. 비었으면 시작, 고르는 중이면 끝을 강조한다. 완성된 구간은 아무것도 강조하지 않는다 —
 * 다음 탭이 새 시작이 되긴 하지만, 완성 직후 시작 칸이 강조되면 시작일을 고치는 중으로 읽혔다(2026-10-25 실화면).
 */
export function resolveDateRangeActiveEdge(value) {
    validateDateRange(value);
    if (value.start === null)
        return "start";
    return value.end === null ? "end" : null;
}
const isoOf = (date) => date.toISOString().slice(0, 10);
/**
 * 오늘로 끝나는 프리셋 구간(최근 7일·1개월 등). 날짜 계산은 UTC 달력 날짜로만 해 서머타임·시간대에 흔들리지 않는다.
 * 달 길이가 다르면 그 달의 마지막 날로 맞춘다(3/31의 1개월 전 = 2/28, 구간은 3/1부터).
 */
export function resolveDateRangePreset(today, length) {
    assertIsoCalendarDate(today, "preset today");
    const [year, month, day] = today.split("-").map(Number);
    const count = "days" in length ? length.days : length.months;
    if (!Number.isInteger(count) || count < 1)
        throw new RangeError("Date range preset length must be a positive integer");
    if ("days" in length)
        return { start: isoOf(new Date(Date.UTC(year, month - 1, day - (count - 1)))), end: today };
    const lastDay = new Date(Date.UTC(year, month - 1 - count + 1, 0)).getUTCDate();
    const anchor = new Date(Date.UTC(year, month - 1 - count, Math.min(day, lastDay)));
    anchor.setUTCDate(anchor.getUTCDate() + 1);
    return { start: isoOf(anchor), end: today };
}
export const dateRangeRecipe = {
    slots: ["root", "summary", "summaryField", "summaryLabel", "summaryValue", "presets", "band", "edge"],
    // 띠는 두 끝 원과 같은 브랜드색의 tint다. 처음 쓴 `interaction.selected`(surfaceSelected)는 기본 팔레트에서
    // #f0f1f3 회색이라 시트 바탕 위에서 구간이 거의 보이지 않았다(2026-10-25 Spint 실화면). 높이는 날짜 원과 같다.
    band: { background: themeColor("primary", accentTint.base) },
    edge: calendarRecipe.day.selected,
    // 시작일·종료일 요약. 안내 문장 대신 "다음에 고를 쪽"을 강조해 지금 무엇을 누르는지 보여 준다
    // (Material 3 기간 선택 머리·Airbnb 체크인/체크아웃 칸 모티브). 값이 없으면 제품 placeholder를 쓴다.
    summary: {
        gap: spacing.xs,
        field: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            radius: "md",
            gap: spacing.xxs,
            background: semanticColors.surface.sunken,
            activeBorder: semanticColors.action.brand.background,
            activeBorderWidth: stroke.strong,
        },
        label: { textVariant: "label", color: semanticColors.content.secondary },
        value: { textVariant: "body", color: semanticColors.content.primary, placeholderColor: semanticColors.content.tertiary },
    },
    // 프리셋 칩 줄(Chip 단일 선택, 작은 크기). 요약 아래·달력 위에서 줄바꿈한다.
    presets: { gap: spacing.xs, chipSize: "small" },
    // 요약·프리셋·달력 사이.
    gap: spacing.md,
};
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
        "the-range-is-one-band-between-two-filled-edges-and-a-one-day-range-has-no-band",
        "the-summary-marks-the-edge-being-picked-and-nothing-once-complete",
        "a-preset-ends-today-and-is-selected-only-while-the-value-equals-it",
    ],
};
export function dateRangeSpans(value, hoveredDate) {
    validateDateRange(value);
    if (value.start === null)
        return false;
    const end = value.end ?? (hoveredDate != null && hoveredDate >= value.start ? hoveredDate : null);
    return end !== null && end !== value.start;
}
//# sourceMappingURL=date-range.js.map