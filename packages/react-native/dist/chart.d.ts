import { type ReactNode } from "react";
import { type PieVisibilitySummary, type ChartBarLayout, type ChartCurve, type ChartOrientation, type ChartSeries, type ScatterDatum } from "@hjmds/design-contracts/components/chart";
type FocusProps = Readonly<{
    focusIndex?: number | null;
    defaultFocusIndex?: number | null;
    onFocusChange?: (index: number | null, detail: Readonly<{
        scrubbing: boolean;
    }>) => void;
    /**
     * Keep the scrubbed point selected after the finger lifts (2026-10-14, Yajalal QA: snapping back to
     * the latest point on release read as the chart "moving by itself"). Default false = wagmi-style reset.
     */
    holdOnRelease?: boolean;
}>;
export type LineChartProps = Readonly<{
    categories: readonly string[];
    series: readonly ChartSeries[];
    accessibilityLabel: string;
    formatValue: (value: number) => string;
    missingLabel: string;
    height?: number;
    curve?: ChartCurve;
    /** Separate dotted vertical drops at the observed edges of missing periods; no bridge or invented values. */
    missingConnection?: "none" | "dotted";
    area?: boolean;
    stacked?: boolean;
    invert?: boolean;
    domain?: readonly [number, number];
    includeZero?: boolean;
    referenceValue?: number | "first";
    extremes?: Readonly<{
        high: string;
        low: string;
    }>;
    showAxis?: boolean;
    /** Value labels only (no category labels), e.g. rank charts that must show "1위" at the top. */
    valueAxis?: boolean;
    /** Overrides grid/label ticks (rank charts: [1, 5, 10]). */
    ticks?: readonly number[];
    cursorLabel?: (index: number) => string;
    /** Morph actual data changes; reduced motion snaps immediately. */
    animateChanges?: boolean;
    /** Keep the chosen side in series color; mute the other side. */
    scrubEmphasis?: "before" | "after";
} & FocusProps>;
export declare function LineChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height, curve, missingConnection, area, stacked, invert, domain, includeZero, referenceValue, extremes, showAxis, valueAxis, ticks: tickOverride, cursorLabel, animateChanges, scrubEmphasis, ...focusProps }: LineChartProps): import("react").JSX.Element;
export type BarChartProps = Readonly<{
    categories: readonly string[];
    series: readonly ChartSeries[];
    accessibilityLabel: string;
    formatValue: (value: number) => string;
    missingLabel: string;
    height?: number;
    orientation?: ChartOrientation;
    layout?: ChartBarLayout;
    domain?: readonly [number, number];
    showAxis?: boolean;
    showValues?: boolean;
    animateChanges?: boolean;
} & FocusProps>;
export declare function BarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height, orientation, layout, domain, showAxis, showValues, animateChanges, ...focusProps }: BarChartProps): import("react").JSX.Element;
export type ChartLegendItem = Readonly<{
    id: string;
    label: string;
    color: string;
    value?: string;
}>;
export declare function ChartLegend({ items, selectedId, onSelect, exclusion }: Readonly<{
    items: readonly ChartLegendItem[];
    exclusion?: Readonly<{
        excludedIds: readonly string[];
        onToggle: (id: string) => void;
        label: (item: ChartLegendItem, included: boolean) => string;
    }>;
    selectedId?: string | null;
    onSelect?: (id: string | null) => void;
}>): import("react").JSX.Element;
export type PieDatum = Readonly<{
    id: string;
    label: string;
    value: number | null;
    color?: string;
}>;
export type PieChartProps = Readonly<{
    data: readonly PieDatum[];
    accessibilityLabel: string;
    formatValue: (value: number) => string;
    donut?: boolean;
    size?: number;
    centerContent?: ReactNode | ((summary: PieVisibilitySummary) => ReactNode);
    /** Controlled denominator filtering, independent of selectedId emphasis. */
    exclusion?: Readonly<{
        excludedIds: readonly string[];
        onExcludedIdsChange: (ids: readonly string[]) => void;
        label: (datum: PieDatum, included: boolean) => string;
    }>;
    selectedId?: string | null;
    defaultSelectedId?: string | null;
    onSelect?: (id: string | null) => void;
    showLegend?: boolean;
}>;
export declare function PieChart({ data, accessibilityLabel, formatValue, donut, size, centerContent, selectedId, defaultSelectedId, onSelect, showLegend, exclusion }: PieChartProps): import("react").JSX.Element;
export type RadarChartProps = Readonly<{
    categories: readonly string[];
    series: readonly ChartSeries[];
    accessibilityLabel: string;
    formatValue: (value: number) => string;
    missingLabel: string;
    domain?: readonly [number, number];
    levels?: number;
    size?: number;
    showLegend?: boolean;
}>;
export declare function RadarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, domain, levels, size, showLegend }: RadarChartProps): import("react").JSX.Element;
export type ScatterChartProps = Readonly<{
    points: readonly ScatterDatum[];
    accessibilityLabel: string;
    xLabel: string;
    yLabel: string;
    formatX: (value: number) => string;
    formatY: (value: number) => string;
    height?: number;
    seriesLabels?: readonly string[];
    focusId?: string | null;
    onFocusChange?: (id: string | null) => void;
}>;
export declare function ScatterChart({ points, accessibilityLabel, xLabel, yLabel, formatX, formatY, height, seriesLabels, focusId, onFocusChange }: ScatterChartProps): import("react").JSX.Element;
export type SparklineProps = Readonly<{
    values: readonly (number | null)[];
    color?: string;
    invert?: boolean;
    domain?: readonly [number, number];
    width?: number;
    height?: number;
    /** Omit when the adjacent text already states the value; the sparkline is then decorative. */
    accessibilityLabel?: string;
}>;
export declare function Sparkline({ values, color, invert, domain, width, height, accessibilityLabel }: SparklineProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=chart.d.ts.map