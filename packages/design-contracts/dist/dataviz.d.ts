import type { ResolvedTheme } from "./colors.js";
/**
 * 차트의 **색·축·격자·범례 토큰 계약**이다. 그리기는 `src/chart.ts`와 두 renderer가 맡는다.
 *
 * 2026-10-14 번복: 처음에는 렌더러를 만들지 않고 그리기를 제품 라이브러리(Recharts·
 * victory-native·d3)에 맡겼다. 실제로는 제품(Yajalal)이 같은 스크럽 선 차트·막대·정렬 표를
 * 직접 다시 만들었고, 사용자가 차트·표 라이브러리 흡수를 요청해 그리기를 HJM으로 옮겼다.
 * 색이 제각각이던 문제(Spint 열지도·Yajalal 통계)를 막는 이 토큰의 값과 규칙은 그대로이며,
 * HJM 차트와 계약 밖 종류를 그리는 제품 라이브러리가 함께 소비한다. 이전 결정과 번복의
 * 근거는 docs/chart.md다.
 *
 * 상태색(info/success/warning/attention)을 계열색으로 쓰지 않는다. 상태색은 뜻을 가진
 * 색이라 "3번 계열"에 쓰면 사용자가 경고로 읽는다.
 */
export declare const datavizSeriesPalette: {
    readonly light: readonly ["#2563eb", "#db2777", "#0d9488", "#b45309", "#7c3aed", "#0369a1", "#9d174d", "#4d7c0f"];
    readonly dark: readonly ["#60a5fa", "#f472b6", "#2dd4bf", "#fbbf24", "#a78bfa", "#38bdf8", "#fb7185", "#a3e635"];
};
export declare const datavizSeriesCount: 8;
/**
 * 계열 수가 팔레트보다 많으면 **순환**한다. 색을 자동으로 더 만들지 않는다 — 생성한 색은
 * 대비를 보장할 수 없고, 9번째 계열이 필요한 화면은 대개 차트가 아니라 표가 맞다.
 */
export declare function resolveDatavizSeriesColor(theme: ResolvedTheme, index: number): string;
/**
 * 축·격자·범례는 차트가 아니라 **화면의 부속**이라 본문 토큰을 그대로 쓴다. 차트 전용
 * 회색을 따로 두면 같은 화면의 표·캡션과 어긋난다.
 */
export declare const datavizChromeTokens: {
    readonly axisLine: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly axisLabel: Readonly<{
        source: "theme";
        key: "textMuted";
        alpha?: number;
    }>;
    readonly gridLine: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly legendLabel: Readonly<{
        source: "theme";
        key: "textBody";
        alpha?: number;
    }>;
    readonly tooltipSurface: Readonly<{
        source: "theme";
        key: "surface";
        alpha?: number;
    }>;
    readonly tooltipBorder: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    readonly tooltipContent: Readonly<{
        source: "theme";
        key: "textBody";
        alpha?: number;
    }>;
    readonly labelSurface: Readonly<{
        source: "theme";
        key: "bg";
        alpha?: number;
    }>;
    readonly labelContent: Readonly<{
        source: "theme";
        key: "text";
        alpha?: number;
    }>;
    readonly lineWidth: 1;
    readonly gridWidth: 1;
    readonly labelVariant: "caption";
    readonly legendVariant: "label";
};
/**
 * 색만으로 계열을 구분하지 않는다(WCAG 1.4.1). 제품이 쓰는 라이브러리가 무엇이든 이
 * 셋 중 하나를 색과 **함께** 붙여야 한다 — 색각 이상과 흑백 인쇄에서 차트가 남는 조건이다.
 */
export declare const datavizRedundantEncodings: readonly ["directLabel", "pattern", "markerShape"];
export type DatavizRedundantEncoding = (typeof datavizRedundantEncodings)[number];
export declare function validateDatavizEncoding(encodings: readonly DatavizRedundantEncoding[]): void;
//# sourceMappingURL=dataviz.d.ts.map