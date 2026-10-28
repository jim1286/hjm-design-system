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
 * 칸 하나를 어떻게 칠하는지. `edge`는 채운 원(시작·끝), `band`는 시작과 끝을 잇는 띠의 모양이다.
 * 띠는 시작 칸에서 끝 쪽 절반(`toEnd`), 끝 칸에서 시작 쪽 절반(`toStart`), 사이 칸 전체(`full`)를 덮는다.
 * 시작과 끝이 같은 날(하루 구간)이거나 끝이 아직 없으면 띠가 없다.
 *
 * 2026-10-25 개편(Spint 기간 시트 사용자 지적): 점 표시는 구간이 이어져 보이지 않았고, 점 줄 때문에 행이
 * 라벨 한 줄만큼 높아졌다. Material 3·Airbnb처럼 띠로 잇고 두 끝을 같은 채운 원으로 그린다.
 */
export type DateRangeCellPaint = Readonly<{
    edge: boolean;
    band: "none" | "full" | "toEnd" | "toStart";
}>;
export declare function resolveDateRangeCellPaint(value: DateRangeValue, date: string, hoveredDate?: string | null): DateRangeCellPaint;
/**
 * 요약 칸에서 강조할 끝. 비었으면 시작, 고르는 중이면 끝을 강조한다. 완성된 구간은 아무것도 강조하지 않는다 —
 * 다음 탭이 새 시작이 되긴 하지만, 완성 직후 시작 칸이 강조되면 시작일을 고치는 중으로 읽혔다(2026-10-25 실화면).
 */
export declare function resolveDateRangeActiveEdge(value: DateRangeValue): "start" | "end" | null;
/**
 * 프리셋 길이. `days`는 오늘 포함 n일, `months`는 n개월 전 다음 날부터 오늘까지, `all`은 날짜 제한 없음(빈 구간)이다.
 * `all`은 2026-10-28 사용자 요청("전체가 포함되게 하면 1일, 1주일, 1개월, 3개월, 전체로 하자")으로 생겼다. 필터의
 * [전체·오늘·기간 지정] 탭과 프리셋이 같은 일을 두 번 해 탭을 없애고, 전체를 프리셋 한 칸으로 옮겼다.
 */
export type DateRangePresetLength = Readonly<{
    days: number;
} | {
    months: number;
} | {
    all: true;
}>;
/**
 * 오늘로 끝나는 프리셋 구간(최근 7일·1개월 등). 날짜 계산은 UTC 달력 날짜로만 해 서머타임·시간대에 흔들리지 않는다.
 * 달 길이가 다르면 그 달의 마지막 날로 맞춘다(3/31의 1개월 전 = 2/28, 구간은 3/1부터).
 */
export declare function resolveDateRangePreset(today: string, length: DateRangePresetLength): DateRangeValue;
export declare const dateRangeRecipe: {
    readonly slots: readonly ["root", "summary", "summaryField", "summaryLabel", "summaryValue", "presets", "band", "edge"];
    readonly band: {
        readonly background: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
    };
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
    readonly summary: {
        readonly gap: 8;
        readonly field: {
            readonly paddingVertical: 8;
            readonly paddingHorizontal: 12;
            readonly radius: "md";
            readonly gap: 4;
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly activeBorder: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly activeBorderWidth: 2;
        };
        readonly label: {
            readonly textVariant: "label";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly value: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly placeholderColor: Readonly<{
                source: "theme";
                key: "textSub";
                alpha?: number;
            }>;
        };
    };
    readonly presets: {
        readonly gap: 8;
        readonly chipSize: "small";
        readonly standard: readonly [{
            readonly id: "day";
            readonly length: {
                readonly days: 1;
            };
        }, {
            readonly id: "week";
            readonly length: {
                readonly days: 7;
            };
        }, {
            readonly id: "month";
            readonly length: {
                readonly months: 1;
            };
        }, {
            readonly id: "quarter";
            readonly length: {
                readonly months: 3;
            };
        }, {
            readonly id: "all";
            readonly length: {
                readonly all: true;
            };
        }];
    };
    readonly gap: 16;
    readonly toggle: {
        readonly icon: {
            readonly collapsed: "chevronDown";
            readonly expanded: "chevronUp";
        };
        readonly glyph: "sm";
        readonly gap: 8;
    };
};
/**
 * 접히는 기간 선택에서 이번 선택 뒤에 달력을 계속 펼쳐 둘지. 프리셋은 언제나 접고, 날짜 탭은 구간을 완성할 때 접는다
 * (시작만 정한 첫 탭은 펼쳐 둔다). 처음에는 접힌 채 시작한다. 필터의 기본은 프리셋이고 달력은 직접 고를 때만 연다.
 *
 * 2026-10-28 사용자 "DateRangePicker도 접기 있게 해": 필터 영역에 둔 달력이 기간을 고른 뒤에도 늘 펼쳐져
 * 목록을 밀어냈다(다에리 만난 동물). Sheet·Popover 합성 없이 본문 안에서 쓰는 접힘이고, 요약 칸이 그 버튼이다.
 */
export declare function resolveDateRangeExpandedAfterSelection(next: DateRangeValue, source: "date" | "preset"): boolean;
/** 구간이 실제로 쓸 수 있는 값인지. 제품의 제출 버튼이 읽는다. */
export declare function isCompleteDateRange(value: DateRangeValue): boolean;
export declare const dateRangeBehavior: {
    readonly controlled: readonly ["value", "defaultValue", "onValueChange", "expanded", "defaultExpanded", "onExpandedChange"];
    readonly inputs: readonly ["grid", "monthLabel", "hoveredDate"];
    readonly stateAxes: {
        readonly value: readonly ["empty", "selecting", "complete", "expanded"];
        readonly availability: readonly ["enabled", "disabled"];
    };
    readonly web: {
        readonly roles: readonly ["grid", "gridcell", "button"];
        readonly keyboard: readonly ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", "Space"];
        readonly focus: "roving";
    };
    readonly native: {
        readonly roles: readonly ["button"];
        readonly states: readonly ["selected", "disabled", "expanded"];
        readonly actions: readonly ["select", "activate"];
    };
    readonly scenarios: readonly ["a-click-on-a-complete-range-starts-a-new-one-instead-of-guessing-which-end-to-move", "picking-an-earlier-date-while-selecting-swaps-the-two-instead-of-rejecting-it", "the-selecting-state-is-start-without-end-not-a-separate-flag", "a-hovered-date-previews-the-end-through-the-same-cell-state-function", "an-end-without-a-start-is-rejected-by-validation-not-rendered-as-something", "calendar-keeps-single-selection-this-module-never-adds-a-mode-axis-to-it", "the-range-is-one-band-between-two-filled-edges-and-a-one-day-range-has-no-band", "the-summary-marks-the-edge-being-picked-and-nothing-once-complete", "a-preset-ends-today-and-is-selected-only-while-the-value-equals-it", "a-collapsible-picker-starts-folded-and-folds-again-after-a-preset-or-a-completing-date", "collapsing-hides-only-the-grid-presets-stay-visible", "the-all-preset-is-the-empty-range", "the-summary-is-the-toggle-and-reports-its-expanded-state"];
};
export declare function dateRangeSpans(value: DateRangeValue, hoveredDate?: string | null): boolean;
//# sourceMappingURL=date-range.d.ts.map