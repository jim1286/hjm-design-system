import { type ReactNode } from "react";
import { type ChartLegendLayout, type PieVisibilitySummary, type ChartBarLayout, type ChartCurve, type ChartOrientation, type ChartSeries, type ScatterDatum } from "@hjmds/design-contracts/components/chart";
import type { HjmCompositionStyleProp } from "./composition-style.js";
type FocusDetail = Readonly<{
    scrubbing: boolean;
}>;
type FocusProps = Readonly<{
    /** Keep the selected-point tooltip visible after release, including tap selection. */
    showFocusLabel?: boolean;
    /** Controlled focused category; `null` shows no focus. */
    focusIndex?: number | null;
    defaultFocusIndex?: number | null;
    onFocusChange?: (index: number | null, detail: FocusDetail) => void;
    /** Keep the scrubbed point after release instead of returning to the default (Native parity, 2026-10-14). */
    holdOnRelease?: boolean;
}>;
type ChartRootProps = Readonly<{
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
type CartesianCommon = ChartRootProps & Readonly<{
    categories: readonly string[];
    series: readonly ChartSeries[];
    /** Accessible name (Web `aria-label`). Product-localized. */
    accessibilityLabel: string;
    formatValue: (value: number) => string;
    /** Spoken/written for a missing observation in the text alternative. */
    missingLabel: string;
    height?: number;
    /** Width used on the server and before the first ResizeObserver measurement. */
    width?: number;
    domain?: readonly [number, number];
    showAxis?: boolean;
}>;
export type LineChartProps = CartesianCommon & FocusProps & Readonly<{
    curve?: ChartCurve;
    /** dotted: separate vertical drops; bridge: faint edge-to-edge visual guide. Neither creates missing values. */
    missingConnection?: "none" | "dotted" | "bridge";
    /** Gradient area under each line. Defaults to on for a single series. */
    area?: boolean;
    stacked?: boolean;
    /** Smallest value on top (ranks, ERA). */
    invert?: boolean;
    includeZero?: boolean;
    /** Dashed horizontal reference line; `"first"` uses the first observation (previous close). */
    referenceValue?: number | "first";
    /** Labels for the first series' high/low markers, shown while not scrubbing. */
    extremes?: Readonly<{
        high: string;
        low: string;
    }>;
    /** Bubble text above the cursor while scrubbing; defaults to the category. */
    cursorLabel?: (index: number) => string;
    /** Morph actual data changes; reduced motion snaps immediately. */
    animateChanges?: boolean;
    /** Keep the chosen side in series color; mute the other side. */
    scrubEmphasis?: "before" | "after";
    /** Value labels only (rank charts: "#1" at the top). */
    valueAxis?: boolean;
    /** Overrides grid/label ticks. */
    ticks?: readonly number[];
}>;
export declare function LineChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height, width: fallbackWidth, curve, missingConnection, area, stacked, invert, domain, includeZero, referenceValue, extremes, showAxis, valueAxis, ticks: tickOverride, cursorLabel, animateChanges, scrubEmphasis, className, layoutStyle, ...focusProps }: LineChartProps): import("react").JSX.Element;
export type BarChartProps = CartesianCommon & FocusProps & Readonly<{
    orientation?: ChartOrientation;
    layout?: ChartBarLayout;
    /** Value label at each bar end (the stack total for stacked bars). */
    showValues?: boolean;
    animateChanges?: boolean;
}>;
export declare function BarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height, width: fallbackWidth, orientation, layout, domain, showAxis, showValues, animateChanges, className, layoutStyle, ...focusProps }: BarChartProps): import("react").JSX.Element;
export type ChartLegendItem = Readonly<{
    id: string;
    label: string;
    color: string;
    value?: string;
}>;
export type ChartLegendProps = ChartRootProps & Readonly<{
    items: readonly ChartLegendItem[];
    exclusion?: Readonly<{
        excludedIds: readonly string[];
        onToggle: (id: string) => void;
        label: (item: ChartLegendItem, included: boolean) => string;
    }>;
    selectedId?: string | null;
    /** When given, rows are toggle buttons; pressing the selected row clears the selection. */
    onSelect?: (id: string | null) => void;
    /**
     * `stack`: one row per series. `inline`: entries flow on a line and wrap (chartRecipe.legend.layouts). Web default:
     * `inline` without `onSelect`, `stack` once rows are selection buttons — the 1.41 behavior.
     */
    layout?: ChartLegendLayout;
}>;
/** Swatch + label (+ value). Color is never the only encoding: every row carries its label. */
export declare function ChartLegend({ items, selectedId, onSelect, exclusion, layout: layoutProp, className, layoutStyle }: ChartLegendProps): import("react").JSX.Element;
export type PieDatum = Readonly<{
    id: string;
    label: string;
    value: number | null;
    color?: string;
}>;
export type PieChartProps = ChartRootProps & Readonly<{
    data: readonly PieDatum[];
    accessibilityLabel: string;
    formatValue: (value: number) => string;
    donut?: boolean;
    size?: number;
    /** Rendered in the donut hole (ignored for a full pie). */
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
export declare function PieChart({ data, accessibilityLabel, formatValue, donut, size, centerContent, selectedId, defaultSelectedId, onSelect, showLegend, exclusion, className, layoutStyle, }: PieChartProps): import("react").JSX.Element;
export type RadarChartProps = ChartRootProps & Readonly<{
    /** At least three axes. */
    categories: readonly string[];
    series: readonly ChartSeries[];
    accessibilityLabel: string;
    formatValue: (value: number) => string;
    missingLabel: string;
    /** One shared domain for every axis; defaults to 0..max. */
    domain?: readonly [number, number];
    levels?: number;
    size?: number;
    /** Defaults to on for more than one series. */
    showLegend?: boolean;
}>;
export declare function RadarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, domain, levels, size, showLegend, className, layoutStyle, }: RadarChartProps): import("react").JSX.Element;
export type ScatterChartProps = ChartRootProps & Readonly<{
    points: readonly ScatterDatum[];
    accessibilityLabel: string;
    xLabel: string;
    yLabel: string;
    formatX: (value: number) => string;
    formatY: (value: number) => string;
    height?: number;
    /** Width used on the server and before the first ResizeObserver measurement. */
    width?: number;
    /** Legend labels by `seriesIndex`; the legend shows for two or more. */
    seriesLabels?: readonly string[];
    focusId?: string | null;
    onFocusChange?: (id: string | null) => void;
}>;
export declare function ScatterChart({ points, accessibilityLabel, xLabel, yLabel, formatX, formatY, height, width: fallbackWidth, seriesLabels, focusId, onFocusChange, className, layoutStyle, }: ScatterChartProps): import("react").JSX.Element;
export type SparklineProps = ChartRootProps & Readonly<{
    values: readonly (number | null)[];
    color?: string;
    invert?: boolean;
    domain?: readonly [number, number];
    width?: number;
    height?: number;
    /** Omit when the adjacent text already states the value; the sparkline is then decorative. */
    accessibilityLabel?: string;
}>;
export declare function Sparkline({ values, color, invert, domain, width, height, accessibilityLabel, className, layoutStyle, }: SparklineProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=chart.d.ts.map