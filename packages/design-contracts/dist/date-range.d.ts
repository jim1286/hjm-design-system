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
export declare const emptyDateRange: DateRangeValue;
/**
 * 구간이 덮을 수 있는 최대 길이. 일수가 아니라 달력 단위로 센다 — "1년"을 365일로 두면 윤년을 낀
 * 1월 1일~12월 31일이 막힌다. 끝은 포함이라 `{ years: 1 }`은 2026-01-01부터 2026-12-31까지다.
 * 2026-10-25 사용자 요청으로 DateRangePicker 기본값은 1년이고, `null`이면 제한하지 않는다.
 */
export type DateRangeLimit = Readonly<{
    years?: number;
    months?: number;
    days?: number;
}>;
export declare const defaultDateRangeLimit: DateRangeLimit;
/** `start`를 한쪽 끝으로 둘 때 다른 끝이 올 수 있는 가장 이른·늦은 날(둘 다 포함). */
export declare function resolveDateRangeLimitBounds(start: string, limit: DateRangeLimit): Readonly<{
    earliest: string;
    latest: string;
}>;
export declare function validateDateRange(value: DateRangeValue, limit?: DateRangeLimit | null): void;
/**
 * 고르는 중에 이 날짜를 끝으로 고를 수 있는지. 비었거나 완성된 구간에서는 누르면 새로 시작하므로
 * 언제나 고를 수 있다. 막힌 날은 renderer가 비활성으로 그린다 — 눌렀다가 거절하면 이유를 알 수 없다.
 */
export declare function isDateWithinRangeLimit(value: DateRangeValue, date: string, limit: DateRangeLimit | null): boolean;
/**
 * 날짜 하나를 눌렀을 때의 다음 값.
 *
 * - 비어 있거나 이미 완성된 구간이면 새 구간을 **시작**한다. (완성된 구간을 다시 눌렀을
 *   때 끝을 옮기는 동작은 "어느 쪽 끝인가"를 추측해야 해서 넣지 않았다 — 다시 시작하는
 *   쪽이 예측 가능하다.)
 * - 고르는 중이면 **끝**을 정한다. 시작보다 앞선 날짜를 누르면 두 값을 바꿔 담는다 —
 *   거절하면 사용자가 왜 안 되는지 알 수 없다.
 */
export declare function resolveDateRangeSelection(current: DateRangeValue, date: string, limit?: DateRangeLimit | null): DateRangeValue;
export type DateRangeCellState = "start" | "end" | "between" | "none";
/**
 * 한 칸이 구간 안에서 어떤 자리인지. 미리보기(`hoveredDate`)는 아직 확정되지 않은 끝을
 * 가리키므로 같은 함수가 처리한다 — renderer가 두 벌의 칠하기 규칙을 만들지 않게 한다.
 */
export declare function resolveDateRangeCellState(value: DateRangeValue, date: string, hoveredDate?: string | null): DateRangeCellState;
/**
 * 구간 칠하기. 시작·끝은 Calendar 단일 선택과 같은 채운 원이고, 그 사이는 원 높이의 띠가 칸을 이어
 * 하나의 구간으로 읽힌다. 2026-10-25 기기 화면에서 날짜 아래 점만으로는 구간이 보이지 않고(시작일은 점뿐,
 * 끝은 원과 점이 겹침) 점 자리 때문에 행 높이가 늘어 이 방식으로 바꿨다.
 *
 * 띠는 `primary`를 옅게 깐다. `surfaceAccent`는 프로필에 따라 바탕과 거의 같아(interaction-adapters.ts
 * 2026-09-30 기기 확인) 구간이 사라진다. 고르는 중의 미리보기 끝(Web hover)은 아직 확정이 아니므로 채우지
 * 않고 테두리만 둔다.
 */
export declare const dateRangeRecipe: {
    readonly edge: {
        readonly background: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly content: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
    };
    readonly band: {
        readonly background: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
    };
    readonly previewEdge: {
        readonly border: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
    };
};
/**
 * 띠를 그릴지. 시작과 (확정 또는 미리보기) 끝이 서로 다른 날일 때만 칸 사이를 잇는다 — 하루 구간이나
 * 시작만 고른 상태에 띠 반쪽을 그리면 없는 구간이 있는 것처럼 보인다.
 */
export declare function dateRangeSpans(value: DateRangeValue, hoveredDate?: string | null): boolean;
/** 구간이 실제로 쓸 수 있는 값인지. 제품의 제출 버튼이 읽는다. */
export declare function isCompleteDateRange(value: DateRangeValue): boolean;
export declare const dateRangeBehavior: {
    readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
    readonly inputs: readonly ["grid", "monthLabel", "hoveredDate", "maxRange"];
    readonly stateAxes: {
        readonly value: readonly ["empty", "selecting", "complete"];
        readonly availability: readonly ["enabled", "disabled"];
    };
    readonly web: {
        readonly roles: readonly ["grid", "gridcell"];
        readonly keyboard: readonly ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", "Space"];
        readonly focus: "roving";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly ["selected", "disabled"];
        readonly actions: readonly ["select"];
    };
    readonly scenarios: readonly ["a-click-on-a-complete-range-starts-a-new-one-instead-of-guessing-which-end-to-move", "picking-an-earlier-date-while-selecting-swaps-the-two-instead-of-rejecting-it", "the-selecting-state-is-start-without-end-not-a-separate-flag", "a-hovered-date-previews-the-end-through-the-same-cell-state-function", "an-end-without-a-start-is-rejected-by-validation-not-rendered-as-something", "calendar-keeps-single-selection-this-module-never-adds-a-mode-axis-to-it", "while-selecting-dates-beyond-the-maximum-range-are-disabled-not-rejected-after-a-press"];
};
//# sourceMappingURL=date-range.d.ts.map