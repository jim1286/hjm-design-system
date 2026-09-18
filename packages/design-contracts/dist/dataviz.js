import { themeColor } from "./color-references.js";
import { stroke, typography } from "./foundations.js";
/**
 * 차트의 **토큰 계약만** 둔다. 렌더러는 만들지 않는다.
 *
 * 이유: 막대 하나를 그리는 일은 제품 라이브러리(Recharts·victory-native·d3)가 이미
 * 우리보다 잘한다. HJM이 대신 그리면 축·툴팁·애니메이션·접근성까지 전부 다시 만들어야
 * 하고, 그 순간 제품은 우리 차트와 자기 차트 두 벌을 갖게 된다. 반대로 **색이 제각각인
 * 것**은 실제로 일어난 문제다 — Spint 열지도와 Yajalal 통계가 각자 색을 골랐다.
 * 그래서 색·축·격자·범례만 고정하고 그리기는 위임한다. 이 판단의 근거는 docs/chart.md다.
 *
 * 상태색(info/success/warning/attention)을 계열색으로 쓰지 않는다. 상태색은 뜻을 가진
 * 색이라 "3번 계열"에 쓰면 사용자가 경고로 읽는다.
 */
export const datavizSeriesPalette = {
    light: ["#2563eb", "#db2777", "#0d9488", "#b45309", "#7c3aed", "#0369a1", "#9d174d", "#4d7c0f"],
    dark: ["#60a5fa", "#f472b6", "#2dd4bf", "#fbbf24", "#a78bfa", "#38bdf8", "#fb7185", "#a3e635"],
};
export const datavizSeriesCount = datavizSeriesPalette.light.length;
/**
 * 계열 수가 팔레트보다 많으면 **순환**한다. 색을 자동으로 더 만들지 않는다 — 생성한 색은
 * 대비를 보장할 수 없고, 9번째 계열이 필요한 화면은 대개 차트가 아니라 표가 맞다.
 */
export function resolveDatavizSeriesColor(theme, index) {
    if (!Number.isInteger(index) || index < 0) {
        throw new RangeError("Dataviz series index must be a non-negative integer");
    }
    const palette = datavizSeriesPalette[theme];
    return palette[index % palette.length];
}
/**
 * 축·격자·범례는 차트가 아니라 **화면의 부속**이라 본문 토큰을 그대로 쓴다. 차트 전용
 * 회색을 따로 두면 같은 화면의 표·캡션과 어긋난다.
 */
export const datavizChromeTokens = {
    axisLine: themeColor("border"),
    axisLabel: themeColor("textMuted"),
    gridLine: themeColor("border", 0.6),
    legendLabel: themeColor("textBody"),
    tooltipSurface: themeColor("surface"),
    tooltipBorder: themeColor("border"),
    tooltipContent: themeColor("textBody"),
    lineWidth: stroke.default,
    gridWidth: stroke.subtle,
    labelVariant: "caption",
    legendVariant: "label",
};
/**
 * 색만으로 계열을 구분하지 않는다(WCAG 1.4.1). 제품이 쓰는 라이브러리가 무엇이든 이
 * 셋 중 하나를 색과 **함께** 붙여야 한다 — 색각 이상과 흑백 인쇄에서 차트가 남는 조건이다.
 */
export const datavizRedundantEncodings = ["directLabel", "pattern", "markerShape"];
export function validateDatavizEncoding(encodings) {
    if (encodings.length === 0) {
        throw new RangeError("A dataviz series needs at least one non-color encoding: directLabel, pattern, or markerShape");
    }
}
//# sourceMappingURL=dataviz.js.map