/**
 * Chart geometry contract (2026-10-14, user request: "absorb the well-known chart libraries into our
 * system"). Until 1.20 HJM only shipped dataviz *tokens* and delegated drawing to product libraries
 * (see docs/chart.md for the earlier decision). Products then rebuilt the same scrubbing line chart,
 * bars, and stat tables separately (Yajalal's StockChart/RecordTable), so drawing moves into HJM.
 *
 * Everything here is renderer-neutral math: both the Web (SVG DOM) and Native (react-native-svg)
 * renderers receive the same coordinates, paths and accessibility summaries and only paint them.
 * The public shapes were studied from — not copied from — these MIT/ISC libraries:
 * - react-native-wagmi-charts: line + cursor crosshair, price/datetime text driven by the focused index
 * - victory-native (XL): CartesianChart x/y keys, chart press state, rounded bars, domain padding
 * - react-native-gifted-charts: bar/line/pie/radar props (focus on press, stacked bars, donut center)
 * - Recharts: series/category data model, stacking, nice ticks, radar polar grid
 * - d3-shape / d3-scale: monotone-X cubic curve (Fritsch–Carlson) and "nice" tick steps (algorithms
 *   re-derived here; no source is vendored)
 */
export type ChartValue = number | null;
export type ChartSeries = Readonly<{
    id: string;
    /** Visible legend text and the series' accessible name. Product-localized. */
    label: string;
    /** One value per category; `null` is a missing observation (drawn as a gap, never as zero). */
    values: readonly ChartValue[];
    /** Product-owned series color; renderers fall back to the dataviz series palette by index. */
    color?: string;
}>;
export type ChartInsets = Readonly<{
    top: number;
    right: number;
    bottom: number;
    left: number;
}>;
export type ChartCurve = "linear" | "monotone" | "step";
export type ChartOrientation = "vertical" | "horizontal";
export type ChartBarLayout = "grouped" | "stacked";
export type ChartPlot = Readonly<{
    index: number;
    seriesIndex: number;
    x: number;
    y: number;
    value: number;
}>;
export declare const chartRecipe: {
    readonly heights: {
        readonly sparkline: 28;
        readonly compact: 128;
        readonly regular: 180;
        readonly tall: 240;
    };
    readonly insets: {
        readonly plot: {
            readonly top: 20;
            readonly right: 8;
            readonly bottom: 8;
            readonly left: 8;
        };
        readonly axis: {
            readonly top: 16;
            readonly right: 8;
            readonly bottom: 20;
            readonly left: 36;
        };
    };
    readonly line: {
        readonly strokeWidth: 2.4;
        readonly pointRadius: 4.5;
        readonly focusHaloRadius: 9;
        readonly focusHaloOpacity: 0.25;
    };
    readonly area: {
        readonly topOpacity: 0.32;
        readonly bottomOpacity: 0;
    };
    readonly bar: {
        readonly radius: number;
        readonly maxWidth: 28;
        readonly bandPadding: 0.36;
        readonly groupGap: 2;
        readonly restOpacity: 0.4;
    };
    readonly pie: {
        readonly donutRatio: 0.62;
        readonly padAngle: 0.012;
        readonly minLabelPercent: 4;
    };
    readonly radar: {
        readonly levels: 4;
        readonly strokeWidth: 2;
        readonly fillOpacity: 0.22;
        readonly labelOffset: 12;
    };
    readonly scatter: {
        readonly radius: 5;
        readonly focusRadius: 8;
    };
    readonly sparkline: {
        readonly width: 72;
        readonly height: 28;
        readonly strokeWidth: 1.8;
        readonly padding: 2;
    };
    readonly cursor: {
        readonly strokeWidth: 1;
        readonly dash: readonly [2, 3];
    };
    readonly reference: {
        readonly dash: readonly [2, 4];
    };
    readonly chrome: {
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
        readonly lineWidth: 1;
        readonly gridWidth: 1;
        readonly labelVariant: "caption";
        readonly legendVariant: "label";
    };
};
export declare function validateChartSeries(categories: readonly string[], series: readonly ChartSeries[]): void;
export declare const isChartNumber: (value: ChartValue | undefined) => value is number;
/** "Nice" step (1, 2, 2.5, 5 × 10^n) so axis labels read like 0/25/50 rather than 0/23.7/47.4. */
export declare function niceStep(span: number, count: number): number;
export declare function niceTicks(min: number, max: number, count?: number): number[];
export type ChartDomainOptions = Readonly<{
    domain?: readonly [number, number] | undefined;
    includeZero?: boolean | undefined;
    nice?: boolean | undefined;
    padding?: number | undefined;
}>;
/**
 * Value domain. Lines zoom to the observed range (stock charts) unless `includeZero`; bars always
 * include zero so heights compare honestly. `padding` widens a flat series so it is not drawn on an edge.
 */
export declare function resolveChartDomain(values: readonly ChartValue[], { domain, includeZero, nice, padding }?: ChartDomainOptions): readonly [number, number];
/** Linear scale from value domain to pixel range; `invert` puts the minimum at the top (ranks, ERA). */
export declare function scaleLinear(domain: readonly [number, number], range: readonly [number, number], invert?: boolean): (value: number) => number;
export type ChartBand = Readonly<{
    step: number;
    bandwidth: number;
    start(index: number): number;
    center(index: number): number;
}>;
export declare function scaleBand(count: number, range: readonly [number, number], padding?: number): ChartBand;
/** Evenly spaced x positions for line/area categories (first and last on the plot edges). */
export declare function pointPositions(count: number, range: readonly [number, number]): number[];
type XY = Readonly<{
    x: number;
    y: number;
}>;
export declare function linePath(points: readonly XY[], curve?: ChartCurve): string;
/** Closed area under a line down to `floor` (or between two edges for stacked areas via `lower`). */
export declare function areaPath(points: readonly XY[], floor: number, curve?: ChartCurve, lower?: readonly XY[]): string;
/** Splits a series at missing values: a skipped month is a gap, never an interpolated trend. */
export declare function splitSegments<T extends {
    value: number;
} | null>(plots: readonly T[]): Exclude<T, null>[][];
export type LineGeometryInput = Readonly<{
    categories: readonly string[];
    series: readonly ChartSeries[];
    width: number;
    height: number;
    insets?: ChartInsets;
    invert?: boolean;
    stacked?: boolean;
} & ChartDomainOptions>;
export type LineGeometry = Readonly<{
    plot: Readonly<{
        left: number;
        right: number;
        top: number;
        bottom: number;
    }>;
    domain: readonly [number, number];
    ticks: readonly number[];
    xs: readonly number[];
    y(value: number): number;
    /** Per series, per category: the plotted point or null for a gap. */
    plots: readonly (readonly (ChartPlot | null)[])[];
    /** Stacked areas: the lower edge per series (previous cumulative). */
    lower: readonly (readonly (ChartPlot | null)[])[] | null;
}>;
export declare function resolveLineGeometry({ categories, series, width, height, insets, invert, stacked, ...domainOptions }: LineGeometryInput): LineGeometry;
/** Cumulative [lower, upper] per series per category; missing values do not add to the stack. */
export declare function stackValues(series: readonly ChartSeries[]): (readonly [number, number] | null)[][];
export type ChartBar = Readonly<{
    index: number;
    seriesIndex: number;
    value: number;
    x: number;
    y: number;
    width: number;
    height: number;
}>;
export type BarGeometryInput = Readonly<{
    categories: readonly string[];
    series: readonly ChartSeries[];
    width: number;
    height: number;
    insets?: ChartInsets;
    orientation?: ChartOrientation;
    layout?: ChartBarLayout;
} & ChartDomainOptions>;
export type BarGeometry = Readonly<{
    plot: Readonly<{
        left: number;
        right: number;
        top: number;
        bottom: number;
    }>;
    domain: readonly [number, number];
    ticks: readonly number[];
    bars: readonly ChartBar[];
    /** Category band centers along the category axis (x for vertical, y for horizontal). */
    centers: readonly number[];
    value(value: number): number;
}>;
export declare function resolveBarGeometry({ categories, series, width, height, insets, orientation, layout, ...domainOptions }: BarGeometryInput): BarGeometry;
export type PieSlice = Readonly<{
    index: number;
    value: number;
    percent: number;
    startAngle: number;
    endAngle: number;
    path: string;
    centroid: XY;
}>;
/** Annular sector from 12 o'clock clockwise. `innerRadius` 0 draws a pie wedge. */
export declare function arcPath(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number): string;
/** Negative and missing values are excluded: a share of a whole cannot be negative. */
export declare function resolvePieGeometry(values: readonly ChartValue[], { cx, cy, radius: outer, innerRadius, padAngle }: Readonly<{
    cx: number;
    cy: number;
    radius: number;
    innerRadius?: number;
    padAngle?: number;
}>): PieSlice[];
export type RadarAxis = Readonly<{
    index: number;
    label: string;
    angle: number;
    end: XY;
    labelAt: XY;
    anchor: "start" | "middle" | "end";
}>;
export type RadarGeometry = Readonly<{
    axes: readonly RadarAxis[];
    rings: readonly string[];
    polygons: readonly Readonly<{
        seriesIndex: number;
        path: string;
        points: readonly (XY & {
            index: number;
            value: number | null;
        })[];
    }>[];
}>;
/**
 * Radar (spider) chart. All axes share one domain (0..max by default) because the products'
 * ratings are on one 0–100 scale; per-axis scales would make the polygon area meaningless.
 */
export declare function resolveRadarGeometry({ categories, series, cx, cy, radius: outer, domain, levels, labelOffset }: Readonly<{
    categories: readonly string[];
    series: readonly ChartSeries[];
    cx: number;
    cy: number;
    radius: number;
    domain?: readonly [number, number];
    levels?: number;
    labelOffset?: number;
}>): RadarGeometry;
export type ScatterDatum = Readonly<{
    id: string;
    label: string;
    x: number;
    y: number;
    seriesIndex?: number;
}>;
export type ScatterGeometry = Readonly<{
    plot: Readonly<{
        left: number;
        right: number;
        top: number;
        bottom: number;
    }>;
    xDomain: readonly [number, number];
    yDomain: readonly [number, number];
    xTicks: readonly number[];
    yTicks: readonly number[];
    points: readonly (ScatterDatum & {
        px: number;
        py: number;
    })[];
}>;
export declare function resolveScatterGeometry({ points, width, height, insets, xDomain, yDomain }: Readonly<{
    points: readonly ScatterDatum[];
    width: number;
    height: number;
    insets?: ChartInsets;
    xDomain?: readonly [number, number];
    yDomain?: readonly [number, number];
}>): ScatterGeometry;
/** Category index whose x is closest to a pointer x, among categories that have any value. */
export declare function nearestChartIndex(xs: readonly number[], x: number, available?: readonly number[]): number | null;
export declare function nearestScatterPoint(points: readonly Readonly<{
    px: number;
    py: number;
}>[], x: number, y: number, maxDistance?: number): number | null;
/** Adjustable-role step (VoiceOver swipe, arrow keys) over observed indices only. */
export declare function stepChartIndex(available: readonly number[], current: number | null, direction: 1 | -1): number | null;
export declare function observedIndices(series: readonly ChartSeries[]): number[];
/** Index of the highest and lowest observation of one series (stock-chart high/low markers). */
export declare function seriesExtremes(values: readonly ChartValue[]): Readonly<{
    max: number;
    min: number;
}> | null;
/**
 * Text alternative for an image-like chart: every category's values in order, product-formatted.
 * Products pass localized `format`; HJM never formats numbers into a language itself.
 */
export declare function describeChart(categories: readonly string[], series: readonly ChartSeries[], format: (value: number) => string, missing: string): string;
export declare const chartBehavior: {
    readonly controlled: readonly ["focusIndex"];
    readonly inputs: readonly ["categories", "series", "kind", "orientation", "layout", "domain", "invert", "curve"];
    readonly events: readonly ["onFocusChange"];
    readonly configuration: {
        readonly curve: readonly ["linear", "monotone", "step"];
        readonly orientation: readonly ["vertical", "horizontal"];
        readonly layout: readonly ["grouped", "stacked"];
    };
    readonly defaults: {
        readonly curve: "linear";
        readonly orientation: "vertical";
        readonly layout: "grouped";
    };
    readonly stateAxes: {
        readonly value: readonly ["focused", "scrubbing"];
        readonly content: readonly ["idle", "empty"];
    };
    readonly web: {
        readonly roles: readonly ["img", "slider"];
        readonly keyboard: readonly ["ArrowLeft", "ArrowRight", "Home", "End"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["adjustable", "image"];
        readonly states: readonly [];
        readonly actions: readonly ["increment", "decrement"];
    };
    readonly scenarios: readonly ["missing-values-split-the-line-instead-of-drawing-zero", "bars-and-stacks-always-include-a-zero-baseline", "inverted-scale-puts-the-best-rank-on-top", "scrubbing-reports-the-focused-index-and-releasing-restores-the-latest", "the-focused-point-is-reachable-without-a-drag-via-adjustable-or-arrow-keys", "series-colors-come-from-the-product-or-the-dataviz-palette-never-status-colors", "every-chart-exposes-a-product-formatted-text-alternative", "radar-axes-share-one-domain", "pie-slices-ignore-negative-and-missing-values"];
};
/** Excluding a slice changes the denominator; selecting one only emphasizes it (Lucian 097). */
export declare function resolvePieVisibility(data: readonly Readonly<{
    id: string;
    value: number | null;
}>[], excludedIds?: readonly string[]): {
    values: (number | null)[];
    total: number;
    includedCount: number;
    observedCount: number;
};
export type PieVisibilitySummary = ReturnType<typeof resolvePieVisibility>;
export {};
//# sourceMappingURL=chart.d.ts.map