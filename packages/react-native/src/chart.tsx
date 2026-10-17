import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState, Platform, PanResponder, Pressable, Text as NativeText, View, type GestureResponderEvent, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { resolveDatavizSeriesColor } from "@hjmds/design-contracts/dataviz";
import {
  prepareChartLineMorph,
  areaPath, chartRecipe, describeChart, isChartNumber, linePath, nearestChartIndex, nearestScatterPoint, observedIndices,
  resolveBarGeometry, resolveLineGeometry, resolvePieGeometry, resolvePieVisibility, type PieVisibilitySummary, resolveRadarGeometry, resolveScatterGeometry, seriesExtremes,
  splitSegments, stepChartIndex, validateChartSeries,
  type ChartBar, type ChartBarLayout, type ChartCurve, type ChartOrientation, type ChartSeries, type ScatterDatum,
} from "@hjmds/design-contracts/components/chart";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

// react-native-svg forwards native-only props to SVG DOM on Expo Web. Keep the
// decorative drawing hidden with the host platform's accessibility property.
const decorativeSvgAccessibility = Platform.OS === "web" ? { "aria-hidden": true as const } : { accessible: false };

/*
 * Native chart renderers (2026-10-14). Geometry, domains, stacking, gaps and accessibility text come
 * from `@hjmds/design-contracts/components/chart`; this file only paints with react-native-svg and
 * translates touch into the contract's focus index. The interaction model follows
 * react-native-wagmi-charts (press-and-drag cursor, release returns to the latest value) and
 * victory-native's chart press state, implemented with PanResponder so no gesture-handler root is needed.
 */

type FocusProps = Readonly<{
  focusIndex?: number | null;
  defaultFocusIndex?: number | null;
  onFocusChange?: (index: number | null, detail: Readonly<{ scrubbing: boolean }>) => void;
  /**
   * Keep the scrubbed point selected after the finger lifts (2026-10-14, Yajalal QA: snapping back to
   * the latest point on release read as the chart "moving by itself"). Default false = wagmi-style reset.
   */
  holdOnRelease?: boolean;
}>;

function useChartPalette() {
  const theme = useHjmNativeTheme();
  const resolved = theme.environment.theme;
  return {
    theme,
    seriesColor: (series: Readonly<{ color?: string | undefined }>, index: number) => series.color ?? resolveDatavizSeriesColor(resolved, index),
    grid: resolveColorReference(chartRecipe.chrome.gridLine, theme.palette),
    axis: resolveColorReference(chartRecipe.chrome.axisLine, theme.palette),
    label: resolveColorReference(chartRecipe.chrome.axisLabel, theme.palette),
    legend: resolveColorReference(chartRecipe.chrome.legendLabel, theme.palette),
    surface: resolveColorReference(chartRecipe.chrome.tooltipSurface, theme.palette),
    background: theme.colors.bg,
  };
}

function useWidth(initial = 0): [number, (event: LayoutChangeEvent) => void] {
  const [width, setWidth] = useState(initial);
  return [width, useCallback((event: LayoutChangeEvent) => setWidth(Math.round(event.nativeEvent.layout.width)), [])];
}

/** Controlled/uncontrolled focus with a separate transient scrub index. */
function useFocus({ focusIndex, defaultFocusIndex = null, onFocusChange, holdOnRelease = false }: FocusProps, fallback: number | null, categories?: readonly string[]) {
  const categoryKey = (index: number | null) => index === null || categories?.[index] === undefined ? null : JSON.stringify([categories[index], categories.slice(0, index).filter(value => value === categories[index]).length]);
  const selectedKey = useRef<string | null>(categoryKey(defaultFocusIndex));
  const [own, setOwn] = useState<number | null>(defaultFocusIndex);
  const [scrub, setScrub] = useState<number | null>(null);
  const last = useRef<number | null>(null);
  const mapped = categories && selectedKey.current !== null ? categories.findIndex((_, index) => categoryKey(index) === selectedKey.current) : own;
  const ownSelection = mapped === -1 ? null : mapped;
  const settled = focusIndex !== undefined ? (categories && (focusIndex === null || categories[focusIndex] === undefined) ? null : focusIndex) : ownSelection;
  const focus = scrub ?? settled ?? fallback;
  const set = useCallback((index: number | null, scrubbing: boolean) => {
    if (scrubbing) { setScrub(index); last.current = index; } else { setScrub(null); if (focusIndex === undefined) { selectedKey.current = categoryKey(index); setOwn(index); } }
    onFocusChange?.(index, { scrubbing });
  }, [focusIndex, onFocusChange, categories]);
  const release = useCallback(() => set(holdOnRelease ? last.current : null, false), [set, holdOnRelease]);
  return { focus, scrubbing: scrub !== null, set, release };
}

/**
 * Horizontal press-and-drag scrubbing. Vertical drags are released to the parent ScrollView so a
 * chart inside a scrolling screen never traps the page.
 */
function useScrub(pick: (x: number, y: number) => number | null, onScrub: (index: number | null) => void, onEnd: () => void) {
  const pickRef = useRef(pick); pickRef.current = pick;
  const scrubRef = useRef(onScrub); scrubRef.current = onScrub;
  const endRef = useRef(onEnd); endRef.current = onEnd;
  return useMemo(() => {
    const at = (event: GestureResponderEvent) => scrubRef.current(pickRef.current(event.nativeEvent.locationX, event.nativeEvent.locationY));
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderTerminationRequest: (_, g) => Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: at,
      onPanResponderMove: at,
      onPanResponderRelease: () => endRef.current(),
      onPanResponderTerminate: () => endRef.current(),
    }).panHandlers;
  }, []);
}

function CursorBubble({ x, width, text, surface, color }: { x: number; width: number; text: string; surface: string; color: string }) {
  const box = 88, left = Math.min(width - box, Math.max(0, x - box / 2));
  return <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ position: "absolute", top: 0, left, width: box, alignItems: "center" }}>
    <View style={{ paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: 8, backgroundColor: surface }}>
      <NativeText numberOfLines={1} style={{ color, fontSize: 11, fontWeight: "700" }}>{text}</NativeText>
    </View>
  </View>;
}

function AxisLabels({ ticks, y, x, color, format }: { ticks: readonly number[]; y: (value: number) => number; x: number; color: string; format: (value: number) => string }) {
  return <>{ticks.map(tick => <SvgText key={tick} x={x} y={y(tick) + 4} fontSize={10} fill={color} textAnchor="end">{format(tick)}</SvgText>)}</>;
}

// Paths/rectangles update their host attributes directly; values, axes and accessibility
// always come from the latest real data. No per-frame React reconciliation.
function MotionLinePath({ points, lower, floor, curve, animate, ...rest }: React.ComponentProps<typeof Path> & { points: readonly { x: number; y: number }[]; lower?: readonly { x: number; y: number }[] | undefined; floor?: number | undefined; curve: ChartCurve; animate: boolean }) {
  const reducedMotion = useHjmNativeTheme().environment.reducedMotion;
  const node = useRef<Readonly<{ setNativeProps(props: Readonly<Record<string, unknown>>): void }> | null>(null);
  const previous = useRef<{ points: readonly { x: number; y: number }[]; lower?: readonly { x: number; y: number }[] | undefined; floor?: number | undefined } | null>(null);
  const path = (p: readonly { x: number; y: number }[], base?: number, edge?: readonly { x: number; y: number }[]) => base === undefined ? linePath(p, curve) : areaPath(p, base, curve, edge);
  const signature = JSON.stringify([points, lower, floor, curve]);
  useLayoutEffect(() => {
    const before = previous.current;
    const target = { points, lower, floor };
    previous.current = target;
    // A bounded morph avoids multiplying frame work for dense historical datasets.
    const morph = animate && !reducedMotion && AppState.currentState === "active" && before && points.length + before.points.length <= 1024 ? prepareChartLineMorph(before.points, points) : null;
    if (!morph) { node.current?.setNativeProps({ d: path(points, floor, lower) }); return; }
    const lowerMorph = before?.lower && lower ? prepareChartLineMorph(before.lower, lower) : null;
    let frame = 0, start: number | undefined;
    const paint = (t: number) => {
      const current = t === 1 ? target : { points: morph(t), lower: lowerMorph?.(t) ?? lower, floor: floor === undefined ? undefined : (before?.floor ?? floor) + (floor - (before?.floor ?? floor)) * t };
      previous.current = current;
      const d = path(current.points, current.floor, current.lower); node.current?.setNativeProps({ d });
    };
    const tick = (now: number) => { start ??= now; const t = Math.min(1, (now - start) / 220); paint(1 - (1 - t) ** 3); if (t < 1) frame = requestAnimationFrame(tick); };
    paint(0); frame = requestAnimationFrame(tick);
    const subscription = AppState.addEventListener("change", state => { if (state !== "active") { cancelAnimationFrame(frame); paint(1); } });
    return () => { cancelAnimationFrame(frame); subscription.remove(); };
  }, [signature, animate, reducedMotion]);
  return <Path {...rest} ref={node as React.Ref<React.ComponentRef<typeof Path>>} d={path(points, floor, lower)} />;
}
function MotionBar({ bar, animate, ...rest }: React.ComponentProps<typeof Rect> & { bar: ChartBar; animate: boolean; vertical?: boolean; rounded?: boolean }) {
  const reducedMotion = useHjmNativeTheme().environment.reducedMotion;
  const node = useRef<Readonly<{ setNativeProps(props: Readonly<Record<string, unknown>>): void }> | null>(null), previous = useRef<ChartBar | null>(null);
  const signature = JSON.stringify(bar);
  useLayoutEffect(() => {
    const before = previous.current; previous.current = bar;
    if (!animate || reducedMotion || !before || AppState.currentState !== "active") { node.current?.setNativeProps({ x: bar.x, y: bar.y, width: bar.width, height: bar.height }); return; }
    let frame = 0, start: number | undefined;
    const paint = (t: number) => {
      const value = { ...bar, x: before.x + (bar.x - before.x) * t, y: before.y + (bar.y - before.y) * t, width: before.width + (bar.width - before.width) * t, height: before.height + (bar.height - before.height) * t };
      previous.current = value; node.current?.setNativeProps({ x: value.x, y: value.y, width: value.width, height: value.height });
    };
    const tick = (now: number) => { start ??= now; const t = Math.min(1, (now - start) / 220); paint(1 - (1 - t) ** 3); if (t < 1) frame = requestAnimationFrame(tick); };
    paint(0); frame = requestAnimationFrame(tick);
    const subscription = AppState.addEventListener("change", state => { if (state !== "active") { cancelAnimationFrame(frame); paint(1); } });
    return () => { cancelAnimationFrame(frame); subscription.remove(); };
  }, [signature, animate, reducedMotion]);
  return <Rect {...rest} ref={node as React.Ref<React.ComponentRef<typeof Rect>>} x={bar.x} y={bar.y} width={bar.width} height={bar.height} />;
}

// ---------------------------------------------------------------------------------------------
// LineChart
// ---------------------------------------------------------------------------------------------

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
  extremes?: Readonly<{ high: string; low: string }>;
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

export function LineChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height = chartRecipe.heights.regular, curve = "linear", missingConnection = "none", area, stacked = false, invert = false, domain, includeZero, referenceValue, extremes, showAxis = false, valueAxis = false, ticks: tickOverride, cursorLabel, animateChanges = false, scrubEmphasis, ...focusProps }: LineChartProps) {
  const palette = useChartPalette(), id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [width, onLayout] = useWidth();
  const available = useMemo(() => observedIndices(series), [series]);
  const { focus, scrubbing, set, release } = useFocus(focusProps, available.at(-1) ?? null, categories);
  const insets = showAxis || valueAxis ? chartRecipe.insets.axis : chartRecipe.insets.plot;
  const g = useMemo(() => width > 0 ? resolveLineGeometry({ categories, series, width, height, insets, invert, stacked, domain, includeZero }) : null, [categories, series, width, height, insets, invert, stacked, domain, includeZero]);
  const handlers = useScrub(x => g ? nearestChartIndex(g.xs, x, available) : null, index => set(index, true), release);
  const showArea = area ?? series.length === 1;
  const reference = referenceValue === "first" ? series[0]?.values.find(isChartNumber) : referenceValue;
  const marks = extremes && !scrubbing ? seriesExtremes(series[0]?.values ?? []) : null;
  return <View accessible accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel} accessibilityHint={describeChart(categories, series, formatValue, missingLabel)}
    accessibilityValue={{ text: focus === null ? missingLabel : `${categories[focus]} ${series.map(item => { const v = item.values[focus]; return isChartNumber(v) ? formatValue(v) : missingLabel; }).join(", ")}` }}
    accessibilityActions={[{ name: "increment" }, { name: "decrement" }]} onAccessibilityAction={event => set(stepChartIndex(available, focus, event.nativeEvent.actionName === "increment" ? 1 : -1), false)}
    onLayout={onLayout} style={{ height }} {...handlers}>
    {g && <Svg width={width} height={height} {...decorativeSvgAccessibility}>
      <Defs>{scrubEmphasis && <ClipPath id={`hjmScrub${id}`}><Rect x={scrubEmphasis === "after" && focus !== null ? g.xs[focus] ?? g.plot.left : g.plot.left} y={0} width={focus === null ? width : scrubEmphasis === "after" ? g.plot.right - (g.xs[focus] ?? g.plot.left) : (g.xs[focus] ?? g.plot.right) - g.plot.left} height={height} /></ClipPath>}{series.map((item, s) => <LinearGradient key={item.id} id={`hjmArea${id}${s}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={palette.seriesColor(item, s)} stopOpacity={chartRecipe.area.topOpacity} /><Stop offset="1" stopColor={palette.seriesColor(item, s)} stopOpacity={chartRecipe.area.bottomOpacity} /></LinearGradient>)}</Defs>
      {(tickOverride ?? g.ticks).map(tick => <Line key={tick} x1={g.plot.left} x2={g.plot.right} y1={g.y(tick)} y2={g.y(tick)} stroke={palette.grid} strokeWidth={chartRecipe.chrome.gridWidth} />)}
      {(showAxis || valueAxis) && <AxisLabels ticks={tickOverride ?? g.ticks} y={g.y} x={g.plot.left - 6} color={palette.label} format={formatValue} />}
      {isChartNumber(reference) && <Line x1={g.plot.left} x2={g.plot.right} y1={g.y(reference)} y2={g.y(reference)} stroke={palette.label} strokeDasharray={[...chartRecipe.reference.dash]} strokeWidth={1} />}
      {series.map((item, s) => {
        const color = palette.seriesColor(item, s), segments = splitSegments(g.plots[s]!);
        const lowerSegments = g.lower ? splitSegments(g.lower[s]!) : null;
        return <G key={item.id}>
          {/* Each observed edge drops at its own x-position. Leave the missing seasons
              entirely disconnected; the floor is a visual absence marker, never zero. */}
          {missingConnection === "dotted" && segments.slice(1).map((segment, index) => {
            const before = segments[index]!.at(-1)!, after = segment[0]!;
            return <G key={`gap${index}`}>{[before, after].map(point => <Line key={point.index} x1={point.x} y1={point.y} x2={point.x} y2={g.plot.bottom} stroke={color} strokeWidth={chartRecipe.line.strokeWidth} strokeDasharray={[...chartRecipe.line.missingDash]} strokeLinecap="round" opacity={chartRecipe.line.missingOpacity} />)}</G>;
          })}
          {(showArea || stacked) && segments.map((segment, i) => <MotionLinePath animate={animateChanges} points={segment} floor={g.plot.bottom} curve={curve} lower={lowerSegments?.[i]} key={`a${i}`} fill={`url(#hjmArea${id}${s})`} />)}
          {segments.map((segment, i) => <G key={`l${i}`}>
            <MotionLinePath animate={animateChanges} points={segment} curve={curve} stroke={scrubEmphasis && focus !== null ? palette.label : color} strokeWidth={chartRecipe.line.strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {scrubEmphasis && focus !== null && <G clipPath={`url(#hjmScrub${id})`}><MotionLinePath animate={animateChanges} points={segment} curve={curve} stroke={color} strokeWidth={chartRecipe.line.strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" /></G>}
          </G>)}
          {segments.filter(segment => segment.length === 1).map(segment => <Circle key={`d${segment[0]!.index}`} cx={segment[0]!.x} cy={segment[0]!.y} r={3} fill={color} />)}
        </G>;
      })}
      {focus !== null && <>
        <Line x1={g.xs[focus]!} x2={g.xs[focus]!} y1={g.plot.top - 4} y2={g.plot.bottom} stroke={palette.label} strokeWidth={chartRecipe.cursor.strokeWidth} {...(scrubbing ? {} : { strokeDasharray: [...chartRecipe.cursor.dash] })} />
        {series.map((item, s) => { const p = g.plots[s]![focus]; const color = palette.seriesColor(item, s); return p ? <G key={item.id}><Circle cx={p.x} cy={p.y} r={chartRecipe.line.focusHaloRadius} fill={color} opacity={chartRecipe.line.focusHaloOpacity} /><Circle cx={p.x} cy={p.y} r={chartRecipe.line.pointRadius} fill={color} stroke={palette.background} strokeWidth={2} /></G> : null; })}
      </>}
      {marks && extremes && ([[marks.max, extremes.high], [marks.min, extremes.low]] as const).filter(([index], i) => i === 0 || index !== marks.max).map(([index, label]) => {
        const p = g.plots[0]![index];
        // Opposite sides of the extrema keep labels apart even when a fixed rank domain packs
        // both points into the top of the plot. Inversion swaps which numeric extreme is higher.
        const above = index === (invert ? marks.min : marks.max);
        return p ? <SvgText key={label} x={Math.min(g.plot.right - 4, Math.max(g.plot.left + 4, p.x))} y={Math.max(10, Math.min(height - 2, p.y + (above ? -10 : 16)))} fontSize={11} fontWeight="600" fill={palette.label} textAnchor={p.x < width * 0.2 ? "start" : p.x > width * 0.8 ? "end" : "middle"}>{`${label} ${formatValue(p.value)}`}</SvgText> : null;
      })}
      {showAxis && categories.length > 0 && <>
        <SvgText x={g.xs[0]!} y={height - 4} fontSize={10} fill={palette.label} textAnchor="start">{categories[0]}</SvgText>
        <SvgText x={g.xs.at(-1)!} y={height - 4} fontSize={10} fill={palette.label} textAnchor="end">{categories.at(-1)}</SvgText>
      </>}
    </Svg>}
    {g && scrubbing && focus !== null && <CursorBubble x={g.xs[focus]!} width={width} text={cursorLabel?.(focus) ?? categories[focus]!} surface={palette.surface} color={palette.legend} />}
  </View>;
}

// ---------------------------------------------------------------------------------------------
// BarChart
// ---------------------------------------------------------------------------------------------

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

export function BarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height, orientation = "vertical", layout = "grouped", domain, showAxis = false, showValues = false, animateChanges = false, ...focusProps }: BarChartProps) {
  const palette = useChartPalette();
  const [width, onLayout] = useWidth();
  const vertical = orientation === "vertical";
  // Horizontal bars grow with the category count so labels never overlap (gifted-charts horizontal mode).
  const resolvedHeight = height ?? (vertical ? chartRecipe.heights.regular : Math.max(chartRecipe.heights.compact, categories.length * 36 + spacing.lg));
  const available = useMemo(() => observedIndices(series), [series]);
  const { focus, scrubbing, set } = useFocus(focusProps, null, categories);
  const insets = vertical
    ? (showAxis ? chartRecipe.insets.axis : { ...chartRecipe.insets.plot, bottom: spacing.lg })
    : { top: spacing.xs, right: showValues ? 48 : spacing.sm, bottom: spacing.xs, left: 72 };
  const g = useMemo(() => width > 0 ? resolveBarGeometry({ categories, series, width, height: resolvedHeight, insets, orientation, layout, domain }) : null, [categories, series, width, resolvedHeight, insets, orientation, layout, domain]);
  const categoryKeys = useMemo(() => {
    const occurrences = new Map<string, number>();
    return categories.map(label => { const occurrence = occurrences.get(label) ?? 0; occurrences.set(label, occurrence + 1); return JSON.stringify([label, occurrence]); });
  }, [categories]);
  const handlers = useScrub((x, y) => g ? nearestChartIndex(g.centers, vertical ? x : y, available) : null, index => set(index, true), () => set(focus, false));
  return <View accessible accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel} accessibilityHint={describeChart(categories, series, formatValue, missingLabel)}
    accessibilityValue={{ text: focus === null ? "" : `${categories[focus]} ${series.map(item => { const v = item.values[focus]; return isChartNumber(v) ? formatValue(v) : missingLabel; }).join(", ")}` }}
    accessibilityActions={[{ name: "increment" }, { name: "decrement" }]} onAccessibilityAction={event => set(stepChartIndex(available, focus, event.nativeEvent.actionName === "increment" ? 1 : -1), false)}
    onLayout={onLayout} style={{ height: resolvedHeight }} {...handlers}>
    {g && <Svg width={width} height={resolvedHeight} {...decorativeSvgAccessibility}>
      {g.ticks.map(tick => vertical
        ? <Line key={tick} x1={g.plot.left} x2={g.plot.right} y1={g.value(tick)} y2={g.value(tick)} stroke={palette.grid} strokeWidth={chartRecipe.chrome.gridWidth} />
        : <Line key={tick} y1={g.plot.top} y2={g.plot.bottom} x1={g.value(tick)} x2={g.value(tick)} stroke={palette.grid} strokeWidth={chartRecipe.chrome.gridWidth} />)}
      {showAxis && vertical && <AxisLabels ticks={g.ticks} y={g.value} x={g.plot.left - 6} color={palette.label} format={formatValue} />}
      {g.bars.map(bar => <MotionBar key={`${series[bar.seriesIndex]!.id}-${categoryKeys[bar.index]}`} bar={bar} animate={animateChanges && g.bars.length <= 200} rx={chartRecipe.bar.radius} fill={palette.seriesColor(series[bar.seriesIndex]!, bar.seriesIndex)} opacity={focus === null || focus === bar.index ? 1 : chartRecipe.bar.restOpacity} />)}
      {showValues && layout === "grouped" && g.bars.map(bar => <SvgText key={`v${bar.seriesIndex}-${bar.index}`} x={vertical ? bar.x + bar.width / 2 : bar.x + bar.width + 4} y={vertical ? bar.y - 4 : bar.y + bar.height / 2 + 4} fontSize={10} fontWeight="600" fill={palette.legend} textAnchor={vertical ? "middle" : "start"}>{formatValue(bar.value)}</SvgText>)}
      {categories.map((category, i) => vertical
        ? (categories.length <= 12 || i % Math.ceil(categories.length / 12) === 0) && <SvgText key={category + i} x={g.centers[i]!} y={resolvedHeight - 4} fontSize={10} fill={focus === i ? palette.legend : palette.label} textAnchor="middle">{category}</SvgText>
        : <SvgText key={category + i} x={g.plot.left - 8} y={g.centers[i]! + 4} fontSize={11} fill={focus === i ? palette.legend : palette.label} textAnchor="end">{category}</SvgText>)}
    </Svg>}
    {g && scrubbing && focus !== null && vertical && <CursorBubble x={g.centers[focus]!} width={width} text={`${categories[focus]} ${series.map(item => { const v = item.values[focus]; return isChartNumber(v) ? formatValue(v) : missingLabel; }).join(" · ")}`} surface={palette.surface} color={palette.legend} />}
  </View>;
}

// ---------------------------------------------------------------------------------------------
// Legend, Pie, Radar, Scatter, Sparkline
// ---------------------------------------------------------------------------------------------

export type ChartLegendItem = Readonly<{ id: string; label: string; color: string; value?: string }>;
export function ChartLegend({ items, selectedId, onSelect, exclusion }: Readonly<{ items: readonly ChartLegendItem[]; exclusion?: Readonly<{ excludedIds: readonly string[]; onToggle: (id: string) => void; label: (item: ChartLegendItem, included: boolean) => string }>; selectedId?: string | null; onSelect?: (id: string | null) => void }>) {
  const palette = useChartPalette();
  return <View style={{ gap: spacing.xxs }}>{items.map(item => {
    const content = <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, minHeight: 32, opacity: selectedId && selectedId !== item.id ? 0.5 : 1 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.color }} />
      <Text variant="body" layoutStyle={{ flex: 1 }} numberOfLines={1}>{item.label}</Text>
      {item.value !== undefined && <NativeText style={{ color: palette.legend, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{item.value}</NativeText>}
    </View>;
    const selection = onSelect ? <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: selectedId === item.id }} accessibilityLabel={`${item.label}${item.value ? ` ${item.value}` : ""}`} onPress={() => onSelect(selectedId === item.id ? null : item.id)}>{content}</Pressable>
      : <View key={item.id} accessible accessibilityLabel={`${item.label}${item.value ? ` ${item.value}` : ""}`}>{content}</View>;
    return exclusion ? <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}><Pressable style={{ minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center" }} accessibilityRole="checkbox" accessibilityState={{ checked: !exclusion.excludedIds.includes(item.id) }} accessibilityLabel={exclusion.label(item, !exclusion.excludedIds.includes(item.id))} onPress={() => exclusion.onToggle(item.id)}><Text>{exclusion.excludedIds.includes(item.id) ? "□" : "✓"}</Text></Pressable><View style={{ flex: 1 }}>{selection}</View></View> : selection;
  })}</View>;
}

export type PieDatum = Readonly<{ id: string; label: string; value: number | null; color?: string }>;
export type PieChartProps = Readonly<{
  data: readonly PieDatum[];
  accessibilityLabel: string;
  formatValue: (value: number) => string;
  donut?: boolean;
  size?: number;
  centerContent?: ReactNode | ((summary: PieVisibilitySummary) => ReactNode);
  /** Controlled denominator filtering, independent of selectedId emphasis. */
  exclusion?: Readonly<{ excludedIds: readonly string[]; onExcludedIdsChange: (ids: readonly string[]) => void; label: (datum: PieDatum, included: boolean) => string }>;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string | null) => void;
  showLegend?: boolean;
}>;
export function PieChart({ data, accessibilityLabel, formatValue, donut = true, size = 180, centerContent, selectedId, defaultSelectedId = null, onSelect, showLegend = true, exclusion }: PieChartProps) {
  const palette = useChartPalette();
  const [own, setOwn] = useState<string | null>(defaultSelectedId);
  const candidate = selectedId !== undefined ? selectedId : own;
  const selected = candidate !== null && exclusion?.excludedIds.includes(candidate) ? null : candidate;
  const select = (id: string | null) => { if (selectedId === undefined) setOwn(id); onSelect?.(id); };
  const radius = size / 2 - 6, inner = donut ? radius * chartRecipe.pie.donutRatio : 0;
  const visibility = resolvePieVisibility(data, exclusion?.excludedIds);
  const slices = resolvePieGeometry(visibility.values, { cx: size / 2, cy: size / 2, radius, innerRadius: inner });
  const center = typeof centerContent === "function" ? centerContent(visibility) : centerContent;
  const legendExclusion = exclusion ? { excludedIds: exclusion.excludedIds, label: (item: ChartLegendItem, included: boolean) => exclusion.label(data.find(datum => datum.id === item.id)!, included),
    onToggle: (id: string) => exclusion.onExcludedIdsChange(exclusion.excludedIds.includes(id) ? exclusion.excludedIds.filter(key => key !== id) : [...exclusion.excludedIds, id]) } : undefined;
  const colorOf = (index: number) => data[index]!.color ?? palette.seriesColor({}, index);
  const percent = (index: number): number | undefined => slices.find(slice => slice.index === index)?.percent;
  const summary = data.map((d, i) => exclusion?.excludedIds.includes(d.id) ? "" : `${d.label} ${isChartNumber(d.value) ? formatValue(d.value) : ""}${percent(i) !== undefined ? ` (${Math.round(percent(i)!)}%)` : ""}`).filter(Boolean).join(", ");
  return <View style={{ gap: spacing.md }}>
    <View accessible accessibilityRole="image" accessibilityLabel={`${accessibilityLabel}. ${summary}`} style={{ width: size, height: size, alignSelf: "center" }}>
      <Svg width={size} height={size} {...decorativeSvgAccessibility}>
        {slices.map(slice => <Path key={slice.index} d={slice.path} fill={colorOf(slice.index)} opacity={selected && data[slice.index]!.id !== selected ? 0.35 : 1} {...(onSelect || selectedId !== undefined ? { onPress: () => select(data[slice.index]!.id === selected ? null : data[slice.index]!.id) } : {})} />)}
        {slices.filter(slice => !donut && slice.percent >= chartRecipe.pie.minLabelPercent * 2).map(slice => <SvgText key={`t${slice.index}`} x={slice.centroid.x} y={slice.centroid.y + 4} fontSize={11} fontWeight="700" fill="#FFFFFF" textAnchor="middle">{`${Math.round(slice.percent)}%`}</SvgText>)}
      </Svg>
      {donut && center != null && <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>{center}</View>}
    </View>
    {showLegend && <ChartLegend items={data.map((d, i) => ({ id: d.id, label: d.label, color: colorOf(i), value: isChartNumber(d.value) ? `${formatValue(d.value)}${percent(i) !== undefined ? ` · ${Math.round(percent(i)!)}%` : ""}` : "—" }))} selectedId={selected} {...(legendExclusion ? { exclusion: legendExclusion } : {})} {...(onSelect || selectedId !== undefined ? { onSelect: select } : {})} />}
  </View>;
}

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
export function RadarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, domain, levels = chartRecipe.radar.levels, size = 240, showLegend }: RadarChartProps) {
  const palette = useChartPalette();
  validateChartSeries(categories, series);
  // Reserve room around the polygon for axis labels.
  const pad = 44, radius = size / 2 - pad;
  const g = resolveRadarGeometry({ categories, series, cx: size / 2, cy: size / 2, radius, levels, ...(domain ? { domain } : {}) });
  return <View style={{ gap: spacing.sm }}>
    <View accessible accessibilityRole="image" accessibilityLabel={`${accessibilityLabel}. ${describeChart(categories, series, formatValue, missingLabel)}`} style={{ width: size, height: size, alignSelf: "center" }}>
      <Svg width={size} height={size} {...decorativeSvgAccessibility}>
        {g.rings.map((ring, i) => <Path key={i} d={ring} fill="none" stroke={palette.grid} strokeWidth={chartRecipe.chrome.gridWidth} />)}
        {g.axes.map(axis => <Line key={axis.index} x1={size / 2} y1={size / 2} x2={axis.end.x} y2={axis.end.y} stroke={palette.grid} strokeWidth={chartRecipe.chrome.gridWidth} />)}
        {g.polygons.map(polygon => { const color = palette.seriesColor(series[polygon.seriesIndex]!, polygon.seriesIndex); return <G key={polygon.seriesIndex}>
          <Path d={polygon.path} fill={color} fillOpacity={chartRecipe.radar.fillOpacity} stroke={color} strokeWidth={chartRecipe.radar.strokeWidth} strokeLinejoin="round" />
          {polygon.points.map(p => p.value !== null && <Circle key={p.index} cx={p.x} cy={p.y} r={3} fill={color} />)}
        </G>; })}
        {g.axes.map(axis => { const first = series[0]?.values[axis.index]; return <G key={`l${axis.index}`}>
          <SvgText x={axis.labelAt.x} y={axis.labelAt.y} fontSize={11} fontWeight="600" fill={palette.legend} textAnchor={axis.anchor}>{axis.label}</SvgText>
          {series.length === 1 && <SvgText x={axis.labelAt.x} y={axis.labelAt.y + 14} fontSize={11} fill={palette.label} textAnchor={axis.anchor}>{isChartNumber(first) ? formatValue(first) : missingLabel}</SvgText>}
        </G>; })}
      </Svg>
    </View>
    {(showLegend ?? series.length > 1) && <ChartLegend items={series.map((item, s) => ({ id: item.id, label: item.label, color: palette.seriesColor(item, s) }))} />}
  </View>;
}

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
export function ScatterChart({ points, accessibilityLabel, xLabel, yLabel, formatX, formatY, height = chartRecipe.heights.tall, seriesLabels, focusId, onFocusChange }: ScatterChartProps) {
  const palette = useChartPalette();
  const [width, onLayout] = useWidth();
  const [own, setOwn] = useState<string | null>(null);
  const focused = focusId !== undefined ? focusId : own;
  const choose = (id: string | null) => { if (focusId === undefined) setOwn(id); onFocusChange?.(id); };
  const g = useMemo(() => width > 0 ? resolveScatterGeometry({ points, width, height }) : null, [points, width, height]);
  const ordered = useMemo(() => [...points].sort((a, b) => a.x - b.x || a.y - b.y), [points]);
  const handlers = useScrub((x, y) => { const index = g ? nearestScatterPoint(g.points, x, y) : null; return index; }, index => { if (index !== null) choose(points[index]!.id); }, () => undefined);
  const focusPoint = g?.points.find(p => p.id === focused);
  return <View style={{ gap: spacing.sm }}>
    <View accessible accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: focusPoint ? `${focusPoint.label}, ${xLabel} ${formatX(focusPoint.x)}, ${yLabel} ${formatY(focusPoint.y)}` : `${points.length}` }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]} onAccessibilityAction={event => {
        const at = ordered.findIndex(p => p.id === focused), next = ordered[Math.min(ordered.length - 1, Math.max(0, (at < 0 ? -1 : at) + (event.nativeEvent.actionName === "increment" ? 1 : -1)))];
        if (next) choose(next.id);
      }} onLayout={onLayout} style={{ height }} {...handlers}>
      {g && <Svg width={width} height={height} {...decorativeSvgAccessibility}>
        {g.yTicks.map(tick => { const y = g.plot.bottom - (tick - g.yDomain[0]) / ((g.yDomain[1] - g.yDomain[0]) || 1) * (g.plot.bottom - g.plot.top); return <G key={`y${tick}`}><Line x1={g.plot.left} x2={g.plot.right} y1={y} y2={y} stroke={palette.grid} strokeWidth={chartRecipe.chrome.gridWidth} /><SvgText x={g.plot.left - 6} y={y + 4} fontSize={10} fill={palette.label} textAnchor="end">{formatY(tick)}</SvgText></G>; })}
        {g.xTicks.map(tick => { const x = g.plot.left + (tick - g.xDomain[0]) / ((g.xDomain[1] - g.xDomain[0]) || 1) * (g.plot.right - g.plot.left); return <SvgText key={`x${tick}`} x={x} y={height - 4} fontSize={10} fill={palette.label} textAnchor="middle">{formatX(tick)}</SvgText>; })}
        {g.points.map(p => <Circle key={p.id} cx={p.px} cy={p.py} r={p.id === focused ? chartRecipe.scatter.focusRadius : chartRecipe.scatter.radius} fill={palette.seriesColor({}, p.seriesIndex ?? 0)} opacity={focused && p.id !== focused ? 0.45 : 0.9} stroke={p.id === focused ? palette.background : "none"} strokeWidth={2} />)}
      </Svg>}
      {g && focusPoint && <CursorBubble x={focusPoint.px} width={width} text={`${focusPoint.label} · ${formatX(focusPoint.x)} / ${formatY(focusPoint.y)}`} surface={palette.surface} color={palette.legend} />}
    </View>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text variant="caption" tone="muted">{yLabel} ↑</Text><Text variant="caption" tone="muted">{xLabel} →</Text></View>
    {seriesLabels && seriesLabels.length > 1 && <ChartLegend items={seriesLabels.map((label, i) => ({ id: String(i), label, color: palette.seriesColor({}, i) }))} />}
  </View>;
}

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
export function Sparkline({ values, color, invert = false, domain, width = chartRecipe.sparkline.width, height = chartRecipe.sparkline.height, accessibilityLabel }: SparklineProps) {
  const palette = useChartPalette(), id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const stroke = color ?? palette.seriesColor({}, 0);
  const pad = chartRecipe.sparkline.padding;
  const g = resolveLineGeometry({ categories: values.map((_, i) => String(i)), series: [{ id: "s", label: "s", values }], width, height, insets: { top: pad, right: pad, bottom: pad, left: pad }, invert, domain });
  const segments = splitSegments(g.plots[0]!);
  const svg = <Svg width={width} height={height} {...decorativeSvgAccessibility}>
    <Defs><LinearGradient id={`hjmSpark${id}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={stroke} stopOpacity={0.28} /><Stop offset="1" stopColor={stroke} stopOpacity={0} /></LinearGradient></Defs>
    {segments.map((segment, i) => <Path key={`a${i}`} d={areaPath(segment, height)} fill={`url(#hjmSpark${id})`} />)}
    {segments.map((segment, i) => <Path key={`l${i}`} d={linePath(segment)} stroke={stroke} strokeWidth={chartRecipe.sparkline.strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />)}
  </Svg>;
  return accessibilityLabel
    ? <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>{svg}</View>
    : <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{svg}</View>;
}
