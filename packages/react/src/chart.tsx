import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { ColorReference } from "@hjmds/design-contracts/color-references";
import { resolveDatavizSeriesColor } from "@hjmds/design-contracts/dataviz";
import {
  prepareChartLineMorph,
  areaPath,
  chartRecipe,
  describeChart,
  isChartNumber,
  linePath,
  nearestChartIndex,
  nearestScatterPoint,
  observedIndices,
  resolveBarGeometry,
  resolveLineGeometry,
  resolvePieGeometry, resolvePieVisibility, type PieVisibilitySummary,
  resolveRadarGeometry,
  resolveScatterGeometry,
  scaleLinear,
  seriesExtremes,
  splitSegments,
  stackValues,
  stepChartIndex,
  validateChartSeries,
  type ChartBar,
  type ChartBarLayout,
  type ChartCurve,
  type ChartInsets,
  type ChartOrientation,
  type ChartSeries,
  type ScatterDatum,
} from "@hjmds/design-contracts/components/chart";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useOptionalHjmTheme } from "./provider.js";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

/*
 * Web chart renderers (2026-10-14). Geometry, domains, stacking, gaps and the text alternative come
 * from `@hjmds/design-contracts/components/chart`; this file only paints plain SVG and translates
 * pointer/keyboard input into the contract's focus index. Prop names mirror
 * `@hjmds/react-native/chart` so products write one chart description for both surfaces.
 * Interaction follows react-native-wagmi-charts (press-and-drag cursor, release returns to the
 * latest value) with pointer events and `touch-action: pan-y` so vertical page scrolling still wins.
 * Optional data morphing updates SVG hosts directly and respects reduced motion.
 */

// ---------------------------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------------------------

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Chrome colors stay recipe references resolved through the provider's CSS variables, so a theme
 * switch repaints without re-rendering and the recipe (not styles.css) owns the choice.
 */
function cssColor(reference: ColorReference): string {
  const name = reference.source === "theme"
    ? `--hjm-color-${kebab(reference.key)}`
    : reference.source === "accent" ? `--hjm-accent-${kebab(reference.key)}` : `--hjm-accent-fill-${kebab(reference.key)}`;
  return reference.alpha === undefined || reference.alpha === 1
    ? `var(${name})`
    : `color-mix(in srgb, var(${name}) ${Math.round(reference.alpha * 100)}%, transparent)`;
}

const chrome = chartRecipe.chrome;
const chromeStyle = {
  "--hjm-chart-axis-line": cssColor(chrome.axisLine),
  "--hjm-chart-axis-label": cssColor(chrome.axisLabel),
  "--hjm-chart-grid-line": cssColor(chrome.gridLine),
  "--hjm-chart-grid-width": `${chrome.gridWidth}px`,
  "--hjm-chart-legend-label": cssColor(chrome.legendLabel),
  "--hjm-chart-tooltip-surface": cssColor(chrome.tooltipSurface),
  "--hjm-chart-tooltip-border": cssColor(chrome.tooltipBorder),
  "--hjm-chart-tooltip-content": cssColor(chrome.tooltipContent),
} as CSSProperties;

function useSeriesColor(): (series: Readonly<{ color?: string | undefined }>, index: number) => string {
  const theme = useOptionalHjmTheme()?.environment.theme ?? "light";
  return useCallback((series, index) => series.color ?? resolveDatavizSeriesColor(theme, index), [theme]);
}

function useSvgId(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Responsive width: `fallback` renders on the server and before the first measurement. */
function useMeasuredWidth(fallback: number): [(node: HTMLDivElement | null) => void, number] {
  const [width, setWidth] = useState(fallback);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (!node) return;
    const update = (next: number) => { if (next > 0) setWidth(Math.round(next)); };
    update(node.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => update(entries[0]?.contentRect.width ?? 0));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return [setNode, width];
}

type FocusDetail = Readonly<{ scrubbing: boolean }>;
type FocusProps = Readonly<{
  /** Controlled focused category; `null` shows no focus. */
  focusIndex?: number | null;
  defaultFocusIndex?: number | null;
  onFocusChange?: (index: number | null, detail: FocusDetail) => void;
  /** Keep the scrubbed point after release instead of returning to the default (Native parity, 2026-10-14). */
  holdOnRelease?: boolean;
}>;

/** Controlled/uncontrolled focus plus a transient scrub index (same model as the Native renderer). */
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
    if (scrubbing) { setScrub(index); last.current = index; }
    else { setScrub(null); if (focusIndex === undefined) { selectedKey.current = categoryKey(index); setOwn(index); } }
    onFocusChange?.(index, { scrubbing });
  }, [focusIndex, onFocusChange, categories]);
  const release = useCallback(() => set(holdOnRelease ? last.current : null, false), [set, holdOnRelease]);
  return { focus, scrubbing: scrub !== null, set, release };
}

/** Press-and-drag; the pointer is captured so a drag that leaves the plot keeps scrubbing. */
function useScrub(pick: (x: number, y: number) => number | null, onScrub: (index: number | null) => void, onEnd: () => void) {
  const active = useRef<number | null>(null);
  const at = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return pick(event.clientX - rect.left, event.clientY - rect.top);
  };
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (event.button !== 0) return;
      active.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      onScrub(at(event));
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (active.current !== event.pointerId) return;
      onScrub(at(event));
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      if (active.current !== event.pointerId) return;
      active.current = null;
      onEnd();
    },
    onPointerCancel(event: PointerEvent<HTMLElement>) {
      if (active.current !== event.pointerId) return;
      active.current = null;
      onEnd();
    },
  };
}

function valueText(categories: readonly string[], series: readonly ChartSeries[], index: number, format: (value: number) => string, missing: string): string {
  const values = series.map((item) => { const v = item.values[index]; return isChartNumber(v) ? format(v) : missing; });
  return series.length === 1 ? `${categories[index]} ${values[0]}` : `${categories[index]} ${series.map((item, s) => `${item.label} ${values[s]}`).join(", ")}`;
}

/** Arrow/Home/End stepping over observed indices only; returns undefined for unrelated keys. */
function keyStep(event: KeyboardEvent, available: readonly number[], focus: number | null, nextKeys: readonly string[], previousKeys: readonly string[]): number | null | undefined {
  if (nextKeys.includes(event.key)) return stepChartIndex(available, focus, 1);
  if (previousKeys.includes(event.key)) return stepChartIndex(available, focus, -1);
  if (event.key === "Home") return available[0] ?? null;
  if (event.key === "End") return available.at(-1) ?? null;
  return undefined;
}

function CursorBubble({ x, width, text }: Readonly<{ x: number; width: number; text: string }>) {
  // Clamped like the Native bubble so the label never leaves the plot.
  const half = 44, center = Math.min(width - half, Math.max(half, x));
  return <span className="hjm-chart__bubble" aria-hidden="true" style={{ left: center }}>{text}</span>;
}

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

// Paths/rectangles update their host attributes directly; values, axes and accessibility
// always come from the latest real data. No per-frame React reconciliation.
function MotionLinePath({ points, lower, floor, curve, animate, ...rest }: Omit<React.SVGProps<SVGPathElement>, "points" | "ref"> & { points: readonly { x: number; y: number }[]; lower?: readonly { x: number; y: number }[] | undefined; floor?: number | undefined; curve: ChartCurve; animate: boolean }) {
  const reducedMotion = useOptionalHjmTheme()?.environment.reducedMotion;
  const node = useRef<SVGPathElement | null>(null);
  const previous = useRef<{ points: readonly { x: number; y: number }[]; lower?: readonly { x: number; y: number }[] | undefined; floor?: number | undefined } | null>(null);
  const path = (p: readonly { x: number; y: number }[], base?: number, edge?: readonly { x: number; y: number }[]) => base === undefined ? linePath(p, curve) : areaPath(p, base, curve, edge);
  const signature = JSON.stringify([points, lower, floor, curve]);
  useLayoutEffect(() => {
    const before = previous.current;
    const target = { points, lower, floor };
    previous.current = target;
    // A bounded morph avoids multiplying frame work for dense historical datasets.
    const morph = animate && !reducedMotion && !document.hidden && before && points.length + before.points.length <= 1024 ? prepareChartLineMorph(before.points, points) : null;
    if (!morph) { node.current?.setAttribute("d", path(points, floor, lower)); return; }
    const lowerMorph = before?.lower && lower ? prepareChartLineMorph(before.lower, lower) : null;
    let frame = 0, start: number | undefined;
    const paint = (t: number) => {
      const current = t === 1 ? target : { points: morph(t), lower: lowerMorph?.(t) ?? lower, floor: floor === undefined ? undefined : (before?.floor ?? floor) + (floor - (before?.floor ?? floor)) * t };
      previous.current = current;
      const d = path(current.points, current.floor, current.lower); node.current?.setAttribute("d", d);
    };
    const tick = (now: number) => { start ??= now; const t = Math.min(1, (now - start) / 220); paint(1 - (1 - t) ** 3); if (t < 1) frame = requestAnimationFrame(tick); };
    paint(0); frame = requestAnimationFrame(tick);
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); paint(1); } }; document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
  }, [signature, animate, reducedMotion]);
  return <path {...rest} ref={node} d={path(points, floor, lower)} />;
}
function MotionBar({ bar, animate, vertical = true, rounded = true, ...rest }: React.SVGProps<SVGPathElement> & { bar: ChartBar; animate: boolean; vertical?: boolean; rounded?: boolean }) {
  const reducedMotion = useOptionalHjmTheme()?.environment.reducedMotion;
  const node = useRef<SVGPathElement | null>(null), previous = useRef<ChartBar | null>(null);
  const signature = JSON.stringify([bar, vertical, rounded]);
  useLayoutEffect(() => {
    const before = previous.current; previous.current = bar;
    if (!animate || reducedMotion || !before || document.hidden) { node.current?.setAttribute("d", barPath(bar, vertical, bar.value < 0, rounded)); return; }
    let frame = 0, start: number | undefined;
    const paint = (t: number) => {
      const value = { ...bar, x: before.x + (bar.x - before.x) * t, y: before.y + (bar.y - before.y) * t, width: before.width + (bar.width - before.width) * t, height: before.height + (bar.height - before.height) * t };
      previous.current = value; node.current?.setAttribute("d", barPath(value, vertical, value.value < 0, rounded));
    };
    const tick = (now: number) => { start ??= now; const t = Math.min(1, (now - start) / 220); paint(1 - (1 - t) ** 3); if (t < 1) frame = requestAnimationFrame(tick); };
    paint(0); frame = requestAnimationFrame(tick);
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); paint(1); } }; document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
  }, [signature, animate, reducedMotion]);
  return <path {...rest} ref={node} d={barPath(bar, vertical, bar.value < 0, rounded)} />;
}

// ---------------------------------------------------------------------------------------------
// LineChart
// ---------------------------------------------------------------------------------------------

export type LineChartProps = CartesianCommon & FocusProps & Readonly<{
  curve?: ChartCurve;
  /** Separate dotted vertical drops at the observed edges of missing periods; no bridge or invented values. */
  missingConnection?: "none" | "dotted";
  /** Gradient area under each line. Defaults to on for a single series. */
  area?: boolean;
  stacked?: boolean;
  /** Smallest value on top (ranks, ERA). */
  invert?: boolean;
  includeZero?: boolean;
  /** Dashed horizontal reference line; `"first"` uses the first observation (previous close). */
  referenceValue?: number | "first";
  /** Labels for the first series' high/low markers, shown while not scrubbing. */
  extremes?: Readonly<{ high: string; low: string }>;
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

export function LineChart({
  categories, series, accessibilityLabel, formatValue, missingLabel, height = chartRecipe.heights.regular, width: fallbackWidth = 320,
  curve = "linear", missingConnection = "none", area, stacked = false, invert = false, domain, includeZero, referenceValue, extremes, showAxis = false,
  valueAxis = false, ticks: tickOverride, cursorLabel, animateChanges = false, scrubEmphasis, className, layoutStyle, ...focusProps
}: LineChartProps) {
  validateChartSeries(categories, series);
  const colorOf = useSeriesColor(), id = useSvgId(), descriptionId = `${id}-description`;
  const [measure, width] = useMeasuredWidth(fallbackWidth);
  const available = useMemo(() => observedIndices(series), [series]);
  const { focus, scrubbing, set, release } = useFocus(focusProps, available.at(-1) ?? null, categories);
  const insets = showAxis || valueAxis ? chartRecipe.insets.axis : chartRecipe.insets.plot;
  const g = useMemo(() => resolveLineGeometry({
    categories, series, width, height, insets, invert, stacked,
    ...(domain ? { domain } : {}), ...(includeZero === undefined ? {} : { includeZero }),
  }), [categories, series, width, height, insets, invert, stacked, domain, includeZero]);
  // Release returns to the default (latest) focus unless holdOnRelease keeps the scrubbed point.
  const handlers = useScrub((x) => nearestChartIndex(g.xs, x, available), (index) => set(index, true), release);
  const showArea = area ?? series.length === 1;
  const reference = referenceValue === "first" ? series[0]?.values.find(isChartNumber) : referenceValue;
  const marks = extremes && !scrubbing ? seriesExtremes(series[0]?.values ?? []) : null;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = keyStep(event, available, focus, ["ArrowRight", "ArrowUp"], ["ArrowLeft", "ArrowDown"]);
    if (next === undefined) return;
    event.preventDefault();
    set(next, false);
  };
  return (
    <div ref={measure} className={classNames("hjm-chart", "hjm-chart--line", className)} style={{ ...chromeStyle, ...layoutStyle }} data-scrubbing={scrubbing || undefined}>
      <div
        className="hjm-chart__plot"
        role="slider"
        tabIndex={0}
        aria-label={accessibilityLabel}
        aria-describedby={descriptionId}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, categories.length - 1)}
        aria-valuenow={focus ?? 0}
        aria-valuetext={focus === null ? missingLabel : valueText(categories, series, focus, formatValue, missingLabel)}
        style={{ blockSize: height }}
        onKeyDown={onKeyDown}
        {...handlers}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={`${id}-scrub`}><rect x={scrubEmphasis === "after" && focus !== null ? g.xs[focus] ?? g.plot.left : g.plot.left} y={0} width={focus === null ? width : scrubEmphasis === "after" ? g.plot.right - (g.xs[focus] ?? g.plot.left) : (g.xs[focus] ?? g.plot.right) - g.plot.left} height={height} /></clipPath>
            {series.map((item, s) => (
              <linearGradient key={item.id} id={`${id}-area-${s}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={colorOf(item, s)} stopOpacity={chartRecipe.area.topOpacity} />
                <stop offset="1" stopColor={colorOf(item, s)} stopOpacity={chartRecipe.area.bottomOpacity} />
              </linearGradient>
            ))}
          </defs>
          {(tickOverride ?? g.ticks).map((tick) => <line key={tick} className="hjm-chart__grid" x1={g.plot.left} x2={g.plot.right} y1={g.y(tick)} y2={g.y(tick)} />)}
          {showAxis || valueAxis ? (tickOverride ?? g.ticks).map((tick) => <text key={`t${tick}`} className="hjm-chart__label" x={g.plot.left - 6} y={g.y(tick)} dominantBaseline="middle" textAnchor="end">{formatValue(tick)}</text>) : null}
          {isChartNumber(reference) ? (
            <line className="hjm-chart__reference" x1={g.plot.left} x2={g.plot.right} y1={g.y(reference)} y2={g.y(reference)} strokeDasharray={chartRecipe.reference.dash.join(" ")} />
          ) : null}
          {series.map((item, s) => {
            const color = colorOf(item, s), segments = splitSegments(g.plots[s]!);
            const lower = g.lower?.[s];
            return (
              <g key={item.id} data-series={item.id}>
                {/* Drop each observed edge vertically; never connect across the absent periods. */}
                {missingConnection === "dotted" && segments.slice(1).map((segment, index) => {
                  const before = segments[index]!.at(-1)!, after = segment[0]!;
                  return <g key={`gap${index}`}>{[before, after].map(point => <line key={point.index} x1={point.x} y1={point.y} x2={point.x} y2={g.plot.bottom} stroke={color} strokeWidth={chartRecipe.line.strokeWidth} strokeDasharray={chartRecipe.line.missingDash.join(" ")} strokeLinecap="round" opacity={chartRecipe.line.missingOpacity} />)}</g>;
                })}
                {showArea || stacked ? segments.map((segment, i) => (
                  <MotionLinePath animate={animateChanges} points={segment} floor={g.plot.bottom} curve={curve} lower={lower ? segment.map((p) => lower[p.index]!) : undefined} key={`a${i}`} className="hjm-chart__area" fill={`url(#${id}-area-${s})`} />
                )) : null}
                {segments.map((segment, i) => (
                  <g key={`l${i}`}><MotionLinePath animate={animateChanges} points={segment} curve={curve} className="hjm-chart__line" stroke={scrubEmphasis && focus !== null ? "var(--hjm-chart-axis-label)" : color} strokeWidth={chartRecipe.line.strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                    {scrubEmphasis && focus !== null && <g clipPath={`url(#${id}-scrub)`}><MotionLinePath animate={animateChanges} points={segment} curve={curve} className="hjm-chart__line" stroke={color} strokeWidth={chartRecipe.line.strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" /></g>}</g>
                ))}
                {/* An isolated observation between gaps has no line, so it gets a dot. */}
                {segments.filter((segment) => segment.length === 1).map((segment) => (
                  <circle key={`d${segment[0]!.index}`} cx={segment[0]!.x} cy={segment[0]!.y} r={3} fill={color} />
                ))}
              </g>
            );
          })}
          {focus !== null && g.xs[focus] !== undefined ? (
            <g className="hjm-chart__focus">
              <line className="hjm-chart__cursor" x1={g.xs[focus]} x2={g.xs[focus]} y1={g.plot.top - 4} y2={g.plot.bottom} strokeWidth={chartRecipe.cursor.strokeWidth} strokeDasharray={scrubbing ? undefined : chartRecipe.cursor.dash.join(" ")} />
              {series.map((item, s) => {
                const p = g.plots[s]![focus];
                if (!p) return null;
                const color = colorOf(item, s);
                return (
                  <g key={item.id}>
                    <circle cx={p.x} cy={p.y} r={chartRecipe.line.focusHaloRadius} fill={color} opacity={chartRecipe.line.focusHaloOpacity} />
                    <circle className="hjm-chart__dot" cx={p.x} cy={p.y} r={chartRecipe.line.pointRadius} fill={color} strokeWidth={2} />
                  </g>
                );
              })}
            </g>
          ) : null}
          {marks && extremes ? ([[marks.max, extremes.high], [marks.min, extremes.low]] as const)
            .filter(([index], i) => i === 0 || index !== marks.max)
            .map(([index, label]) => {
              const p = g.plots[0]![index];
              if (!p) return null;
              // Place extrema on opposite sides even in a compressed, inverted rank domain.
              const dy = index === (invert ? marks.min : marks.max) ? -10 : 16;
              return (
                <text key={label} className="hjm-chart__label hjm-chart__extreme" x={Math.min(g.plot.right - 4, Math.max(g.plot.left + 4, p.x))} y={Math.max(10, Math.min(height - 2, p.y + dy))}
                  textAnchor={p.x < width * 0.2 ? "start" : p.x > width * 0.8 ? "end" : "middle"}>{`${label} ${formatValue(p.value)}`}</text>
              );
            }) : null}
          {showAxis && categories.length > 0 ? (
            <>
              <text className="hjm-chart__label" x={g.xs[0]} y={height - 4} textAnchor="start">{categories[0]}</text>
              {categories.length > 1 ? <text className="hjm-chart__label" x={g.xs.at(-1)} y={height - 4} textAnchor="end">{categories.at(-1)}</text> : null}
            </>
          ) : null}
        </svg>
        {scrubbing && focus !== null && g.xs[focus] !== undefined ? <CursorBubble x={g.xs[focus]!} width={width} text={cursorLabel?.(focus) ?? categories[focus]!} /> : null}
      </div>
      <p id={descriptionId} className="hjm-visually-hidden">{describeChart(categories, series, formatValue, missingLabel)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// BarChart
// ---------------------------------------------------------------------------------------------

export type BarChartProps = CartesianCommon & FocusProps & Readonly<{
  orientation?: ChartOrientation;
  layout?: ChartBarLayout;
  /** Value label at each bar end (the stack total for stacked bars). */
  showValues?: boolean;
  animateChanges?: boolean;
}>;

/** Rounds only the value end of a bar so stacks read as one column. */
function barPath(bar: ChartBar, vertical: boolean, negative: boolean, round: boolean): string {
  const { x, y, width: w, height: h } = bar;
  const r = round ? Math.min(chartRecipe.bar.radius, vertical ? w / 2 : h / 2, vertical ? h : w) : 0;
  const n = (value: number) => Number(value.toFixed(2));
  if (r <= 0) return `M${n(x)},${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
  if (vertical && !negative) return `M${n(x)},${n(y + h)}V${n(y + r)}Q${n(x)},${n(y)} ${n(x + r)},${n(y)}H${n(x + w - r)}Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + r)}V${n(y + h)}Z`;
  if (vertical) return `M${n(x)},${n(y)}H${n(x + w)}V${n(y + h - r)}Q${n(x + w)},${n(y + h)} ${n(x + w - r)},${n(y + h)}H${n(x + r)}Q${n(x)},${n(y + h)} ${n(x)},${n(y + h - r)}Z`;
  if (!negative) return `M${n(x)},${n(y)}H${n(x + w - r)}Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + r)}V${n(y + h - r)}Q${n(x + w)},${n(y + h)} ${n(x + w - r)},${n(y + h)}H${n(x)}Z`;
  return `M${n(x + w)},${n(y)}V${n(y + h)}H${n(x + r)}Q${n(x)},${n(y + h)} ${n(x)},${n(y + h - r)}V${n(y + r)}Q${n(x)},${n(y)} ${n(x + r)},${n(y)}Z`;
}

export function BarChart({
  categories, series, accessibilityLabel, formatValue, missingLabel, height, width: fallbackWidth = 320, orientation = "vertical",
  layout = "grouped", domain, showAxis = false, showValues = false, animateChanges = false, className, layoutStyle, ...focusProps
}: BarChartProps) {
  validateChartSeries(categories, series);
  const colorOf = useSeriesColor(), id = useSvgId(), descriptionId = `${id}-description`;
  const [measure, width] = useMeasuredWidth(fallbackWidth);
  const vertical = orientation === "vertical";
  // Horizontal bars grow with the category count so labels never overlap (same rule as Native).
  const resolvedHeight = height ?? (vertical ? chartRecipe.heights.regular : Math.max(chartRecipe.heights.compact, categories.length * 36 + spacing.lg));
  const available = useMemo(() => observedIndices(series), [series]);
  const { focus, scrubbing, set } = useFocus(focusProps, null, categories);
  const insets: ChartInsets = vertical
    ? (showAxis ? chartRecipe.insets.axis : { ...chartRecipe.insets.plot, bottom: spacing.lg })
    : { top: spacing.xs, right: showValues ? 48 : spacing.sm, bottom: spacing.xs, left: 72 };
  const g = useMemo(() => resolveBarGeometry({ categories, series, width, height: resolvedHeight, insets, orientation, layout, ...(domain ? { domain } : {}) }),
    [categories, series, width, resolvedHeight, insets, orientation, layout, domain]);
  const categoryKeys = useMemo(() => {
    const occurrences = new Map<string, number>();
    return categories.map(label => { const occurrence = occurrences.get(label) ?? 0; occurrences.set(label, occurrence + 1); return JSON.stringify([label, occurrence]); });
  }, [categories]);
  // Only the outermost segment of each stack (per sign) gets rounded corners.
  const outer = useMemo(() => {
    if (layout !== "stacked") return null;
    const stacks = stackValues(series), result = new Set<string>();
    categories.forEach((_, i) => {
      let positive = -1, negative = -1;
      series.forEach((item, s) => { const v = item.values[i]; if (!isChartNumber(v) || !stacks[s]![i]) return; if (v >= 0) positive = s; else negative = s; });
      if (positive >= 0) result.add(`${positive}-${i}`);
      if (negative >= 0) result.add(`${negative}-${i}`);
    });
    return result;
  }, [categories, series, layout]);
  const handlers = useScrub((x, y) => nearestChartIndex(g.centers, vertical ? x : y, available), (index) => set(index, true), () => set(focus, false));
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && focus !== null) { event.preventDefault(); set(null, false); return; }
    const next = vertical
      ? keyStep(event, available, focus, ["ArrowRight", "ArrowUp"], ["ArrowLeft", "ArrowDown"])
      : keyStep(event, available, focus, ["ArrowDown", "ArrowRight"], ["ArrowUp", "ArrowLeft"]);
    if (next === undefined) return;
    event.preventDefault();
    set(next, false);
  };
  const totals = layout === "stacked" && showValues
    ? categories.map((_, i) => series.reduce((sum, item) => sum + (isChartNumber(item.values[i]) ? item.values[i]! : 0), 0))
    : null;
  return (
    <div ref={measure} className={classNames("hjm-chart", "hjm-chart--bar", className)} style={{ ...chromeStyle, ...layoutStyle }} data-orientation={orientation} data-scrubbing={scrubbing || undefined}>
      <div
        className="hjm-chart__plot"
        role="slider"
        tabIndex={0}
        aria-label={accessibilityLabel}
        aria-describedby={descriptionId}
        aria-orientation={vertical ? "horizontal" : "vertical"}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, categories.length - 1)}
        aria-valuenow={focus ?? 0}
        // Without a focus the slider has no value; its name stands in so nothing misleading is read.
        aria-valuetext={focus === null ? accessibilityLabel : valueText(categories, series, focus, formatValue, missingLabel)}
        style={{ blockSize: resolvedHeight }}
        onKeyDown={onKeyDown}
        {...handlers}
      >
        <svg width={width} height={resolvedHeight} viewBox={`0 0 ${width} ${resolvedHeight}`} aria-hidden="true" focusable="false">
          {g.ticks.map((tick) => vertical
            ? <line key={tick} className="hjm-chart__grid" x1={g.plot.left} x2={g.plot.right} y1={g.value(tick)} y2={g.value(tick)} />
            : <line key={tick} className="hjm-chart__grid" y1={g.plot.top} y2={g.plot.bottom} x1={g.value(tick)} x2={g.value(tick)} />)}
          {showAxis && vertical ? g.ticks.map((tick) => <text key={`t${tick}`} className="hjm-chart__label" x={g.plot.left - 6} y={g.value(tick)} dominantBaseline="middle" textAnchor="end">{formatValue(tick)}</text>) : null}
          {g.bars.map((bar) => (
            <MotionBar
              key={`${series[bar.seriesIndex]!.id}-${categoryKeys[bar.index]}`}
              bar={bar} animate={animateChanges && g.bars.length <= 200} vertical={vertical} rounded={outer ? outer.has(`${bar.seriesIndex}-${bar.index}`) : true}
              className="hjm-chart__bar"
              data-index={bar.index}
              fill={colorOf(series[bar.seriesIndex]!, bar.seriesIndex)}
              opacity={focus === null || focus === bar.index ? 1 : chartRecipe.bar.restOpacity}
            />
          ))}
          {showValues && layout === "grouped" ? g.bars.map((bar) => (
            <text key={`v${bar.seriesIndex}-${bar.index}`} className="hjm-chart__label hjm-chart__value"
              x={vertical ? bar.x + bar.width / 2 : bar.x + bar.width + 4} y={vertical ? bar.y - 4 : bar.y + bar.height / 2}
              dominantBaseline={vertical ? undefined : "middle"} textAnchor={vertical ? "middle" : "start"}>{formatValue(bar.value)}</text>
          )) : null}
          {totals ? totals.map((total, i) => {
            if (!available.includes(i)) return null;
            const end = g.value(Math.max(0, ...stackValues(series).map((row) => row[i]?.[1] ?? 0)));
            return (
              <text key={`total${i}`} className="hjm-chart__label hjm-chart__value" x={vertical ? g.centers[i] : end + 4} y={vertical ? end - 4 : g.centers[i]}
                dominantBaseline={vertical ? undefined : "middle"} textAnchor={vertical ? "middle" : "start"}>{formatValue(total)}</text>
            );
          }) : null}
          {categories.map((category, i) => vertical
            ? (categories.length <= 12 || i % Math.ceil(categories.length / 12) === 0)
              ? <text key={`c${i}`} className="hjm-chart__label" data-focused={focus === i || undefined} x={g.centers[i]} y={resolvedHeight - 4} textAnchor="middle">{category}</text>
              : null
            : <text key={`c${i}`} className="hjm-chart__label" data-focused={focus === i || undefined} x={g.plot.left - 8} y={g.centers[i]} dominantBaseline="middle" textAnchor="end">{category}</text>)}
        </svg>
        {scrubbing && focus !== null && vertical && g.centers[focus] !== undefined
          ? <CursorBubble x={g.centers[focus]!} width={width} text={valueText(categories, series, focus, formatValue, missingLabel)} />
          : null}
      </div>
      <p id={descriptionId} className="hjm-visually-hidden">{describeChart(categories, series, formatValue, missingLabel)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// ChartLegend
// ---------------------------------------------------------------------------------------------

export type ChartLegendItem = Readonly<{ id: string; label: string; color: string; value?: string }>;
export type ChartLegendProps = ChartRootProps & Readonly<{
  items: readonly ChartLegendItem[]; exclusion?: Readonly<{ excludedIds: readonly string[]; onToggle: (id: string) => void; label: (item: ChartLegendItem, included: boolean) => string }>;
  selectedId?: string | null;
  /** When given, rows are toggle buttons; pressing the selected row clears the selection. */
  onSelect?: (id: string | null) => void;
}>;

/** Swatch + label (+ value). Color is never the only encoding: every row carries its label. */
export function ChartLegend({ items, selectedId, onSelect, exclusion, className, layoutStyle }: ChartLegendProps) {
  return (
    <ul className={classNames("hjm-chart-legend", className)} style={{ ...chromeStyle, ...layoutStyle }} data-interactive={onSelect ? "" : undefined}>
      {items.map((item) => {
        const content = (
          <>
            <span className="hjm-chart-legend__swatch" aria-hidden="true" style={{ background: item.color }} />
            <span className="hjm-chart-legend__label">{item.label}</span>
            {item.value !== undefined ? <span className="hjm-chart-legend__value">{item.value}</span> : null}
          </>
        );
        const dimmed = selectedId != null && selectedId !== item.id;
        return (
          <li key={item.id} className="hjm-chart-legend__item" data-dimmed={dimmed || undefined}>
            {exclusion ? <input type="checkbox" checked={!exclusion.excludedIds.includes(item.id)} aria-label={exclusion.label(item, !exclusion.excludedIds.includes(item.id))} onChange={() => exclusion.onToggle(item.id)} /> : null}
            {onSelect ? (
              <button type="button" className="hjm-chart-legend__button" aria-pressed={selectedId === item.id} onClick={() => onSelect(selectedId === item.id ? null : item.id)}>
                {content}
              </button>
            ) : content}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------
// PieChart
// ---------------------------------------------------------------------------------------------

export type PieDatum = Readonly<{ id: string; label: string; value: number | null; color?: string }>;
export type PieChartProps = ChartRootProps & Readonly<{
  data: readonly PieDatum[];
  accessibilityLabel: string;
  formatValue: (value: number) => string;
  donut?: boolean;
  size?: number;
  /** Rendered in the donut hole (ignored for a full pie). */
  centerContent?: ReactNode | ((summary: PieVisibilitySummary) => ReactNode);
  /** Controlled denominator filtering, independent of selectedId emphasis. */
  exclusion?: Readonly<{ excludedIds: readonly string[]; onExcludedIdsChange: (ids: readonly string[]) => void; label: (datum: PieDatum, included: boolean) => string }>;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string | null) => void;
  showLegend?: boolean;
}>;

export function PieChart({
  data, accessibilityLabel, formatValue, donut = true, size = 180, centerContent, selectedId, defaultSelectedId = null, onSelect,
  showLegend = true, exclusion, className, layoutStyle,
}: PieChartProps) {
  const colorOf = useSeriesColor(), id = useSvgId(), descriptionId = `${id}-description`;
  const [own, setOwn] = useState<string | null>(defaultSelectedId);
  const candidate = selectedId !== undefined ? selectedId : own;
  const selected = candidate !== null && exclusion?.excludedIds.includes(candidate) ? null : candidate;
  const interactive = onSelect !== undefined || selectedId !== undefined;
  const select = (next: string | null) => { if (selectedId === undefined) setOwn(next); onSelect?.(next); };
  const toggle = (next: string) => select(selected === next ? null : next);
  // The selected slice moves outward by this much, so it is reserved inside the box.
  const lift = 4;
  const radius = size / 2 - lift - 2, inner = donut ? radius * chartRecipe.pie.donutRatio : 0;
  const visibility = resolvePieVisibility(data, exclusion?.excludedIds);
  const slices = resolvePieGeometry(visibility.values, { cx: size / 2, cy: size / 2, radius, innerRadius: inner });
  const center = typeof centerContent === "function" ? centerContent(visibility) : centerContent;
  const legendExclusion = exclusion ? { excludedIds: exclusion.excludedIds, label: (item: ChartLegendItem, included: boolean) => exclusion.label(data.find(datum => datum.id === item.id)!, included),
    onToggle: (id: string) => exclusion.onExcludedIdsChange(exclusion.excludedIds.includes(id) ? exclusion.excludedIds.filter(key => key !== id) : [...exclusion.excludedIds, id]) } : undefined;
  const colorAt = (index: number) => colorOf(data[index]!, index);
  const percentOf = (index: number) => slices.find((slice) => slice.index === index)?.percent;
  const percentText = (index: number) => { const p = percentOf(index); return p === undefined ? "" : `${Math.round(p)}%`; };
  const rowValue = (d: PieDatum, i: number) => isChartNumber(d.value) ? `${formatValue(d.value)}${percentOf(i) !== undefined ? ` · ${percentText(i)}` : ""}` : "—";
  const summary = data.map((d, i) => exclusion?.excludedIds.includes(d.id) ? "" : `${d.label} ${isChartNumber(d.value) ? formatValue(d.value) : ""}${percentOf(i) !== undefined ? ` (${percentText(i)})` : ""}`.trim()).filter(Boolean).join(", ");
  // With a legend, its rows are the keyboard path; slices stay pointer targets so each item has
  // one tab stop. Without a legend the slices themselves become the buttons.
  const sliceButtons = interactive && !showLegend;
  return (
    <div className={classNames("hjm-chart", "hjm-chart--pie", className)} style={{ ...chromeStyle, ...layoutStyle }}>
      <div className="hjm-chart__pie" role={sliceButtons ? "group" : "img"} aria-label={accessibilityLabel} aria-describedby={descriptionId} style={{ inlineSize: size, blockSize: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden={sliceButtons ? undefined : true} focusable="false">
          {slices.map((slice) => {
            const datum = data[slice.index]!, isSelected = selected === datum.id;
            const mid = (slice.startAngle + slice.endAngle) / 2;
            return (
              <path
                key={datum.id}
                className="hjm-chart__slice"
                data-id={datum.id}
                data-selected={isSelected || undefined}
                d={slice.path}
                fill={colorAt(slice.index)}
                opacity={selected !== null && !isSelected ? chartRecipe.bar.restOpacity : 1}
                transform={isSelected ? `translate(${(Math.sin(mid) * lift).toFixed(2)} ${(-Math.cos(mid) * lift).toFixed(2)})` : undefined}
                {...(interactive ? { onClick: () => toggle(datum.id) } : {})}
                {...(sliceButtons ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-pressed": isSelected,
                  "aria-label": `${datum.label} ${rowValue(datum, slice.index)}`,
                  onKeyDown: (event: KeyboardEvent<SVGPathElement>) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    toggle(datum.id);
                  },
                } : {})}
              />
            );
          })}
          {!donut ? slices.filter((slice) => slice.percent >= chartRecipe.pie.minLabelPercent * 2).map((slice) => (
            <text key={`t${slice.index}`} className="hjm-chart__slice-label" x={slice.centroid.x} y={slice.centroid.y} dominantBaseline="middle" textAnchor="middle">{percentText(slice.index)}</text>
          )) : null}
        </svg>
        {donut && center != null ? <div className="hjm-chart__pie-center">{center}</div> : null}
      </div>
      {showLegend ? (
        <ChartLegend
          items={data.map((d, i) => ({ id: d.id, label: d.label, color: colorAt(i), value: rowValue(d, i) }))}
          selectedId={selected}
          {...(legendExclusion ? { exclusion: legendExclusion } : {})}
          {...(interactive ? { onSelect: select } : {})}
        />
      ) : null}
      <p id={descriptionId} className="hjm-visually-hidden">{summary}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// RadarChart
// ---------------------------------------------------------------------------------------------

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

export function RadarChart({
  categories, series, accessibilityLabel, formatValue, missingLabel, domain, levels = chartRecipe.radar.levels, size = 240, showLegend,
  className, layoutStyle,
}: RadarChartProps) {
  validateChartSeries(categories, series);
  const colorOf = useSeriesColor(), id = useSvgId(), descriptionId = `${id}-description`;
  // Room around the polygon for axis labels (same reservation as Native).
  const pad = 44, center = size / 2;
  const g = resolveRadarGeometry({ categories, series, cx: center, cy: center, radius: center - pad, levels, ...(domain ? { domain } : {}) });
  return (
    <div className={classNames("hjm-chart", "hjm-chart--radar", className)} style={{ ...chromeStyle, ...layoutStyle }}>
      <div className="hjm-chart__radar" role="img" aria-label={accessibilityLabel} aria-describedby={descriptionId} style={{ inlineSize: size, blockSize: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
          {g.rings.map((ring, i) => <path key={i} className="hjm-chart__grid" d={ring} fill="none" />)}
          {g.axes.map((axis) => <line key={axis.index} className="hjm-chart__grid" x1={center} y1={center} x2={axis.end.x} y2={axis.end.y} />)}
          {g.polygons.map((polygon) => {
            const color = colorOf(series[polygon.seriesIndex]!, polygon.seriesIndex);
            return (
              <g key={polygon.seriesIndex} data-series={series[polygon.seriesIndex]!.id}>
                <path className="hjm-chart__polygon" d={polygon.path} fill={color} fillOpacity={chartRecipe.radar.fillOpacity} stroke={color} strokeWidth={chartRecipe.radar.strokeWidth} strokeLinejoin="round" />
                {polygon.points.map((p) => p.value !== null ? <circle key={p.index} cx={p.x} cy={p.y} r={3} fill={color} /> : null)}
              </g>
            );
          })}
          {g.axes.map((axis) => {
            const first = series[0]?.values[axis.index];
            return (
              <g key={`l${axis.index}`}>
                <text className="hjm-chart__label hjm-chart__axis-name" x={axis.labelAt.x} y={axis.labelAt.y} dominantBaseline="middle" textAnchor={axis.anchor}>{axis.label}</text>
                {series.length === 1 ? (
                  <text className="hjm-chart__label" x={axis.labelAt.x} y={axis.labelAt.y + 14} dominantBaseline="middle" textAnchor={axis.anchor}>{isChartNumber(first) ? formatValue(first) : missingLabel}</text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      {showLegend ?? series.length > 1 ? <ChartLegend items={series.map((item, s) => ({ id: item.id, label: item.label, color: colorOf(item, s) }))} /> : null}
      <p id={descriptionId} className="hjm-visually-hidden">{describeChart(categories, series, formatValue, missingLabel)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// ScatterChart
// ---------------------------------------------------------------------------------------------

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

export function ScatterChart({
  points, accessibilityLabel, xLabel, yLabel, formatX, formatY, height = chartRecipe.heights.tall, width: fallbackWidth = 320,
  seriesLabels, focusId, onFocusChange, className, layoutStyle,
}: ScatterChartProps) {
  const colorOf = useSeriesColor(), id = useSvgId(), descriptionId = `${id}-description`;
  const [measure, width] = useMeasuredWidth(fallbackWidth);
  const [own, setOwn] = useState<string | null>(null);
  const focused = focusId !== undefined ? focusId : own;
  const choose = (next: string | null) => { if (focusId === undefined) setOwn(next); onFocusChange?.(next); };
  const g = useMemo(() => resolveScatterGeometry({ points, width, height }), [points, width, height]);
  // Keyboard order follows the x axis so arrows read left to right.
  const ordered = useMemo(() => [...points].sort((a, b) => a.x - b.x || a.y - b.y), [points]);
  const handlers = useScrub((x, y) => nearestScatterPoint(g.points, x, y), (index) => { if (index !== null) choose(points[index]!.id); }, () => undefined);
  const focusPoint = g.points.find((p) => p.id === focused);
  const sx = scaleLinear(g.xDomain, [g.plot.left, g.plot.right]), sy = scaleLinear(g.yDomain, [g.plot.bottom, g.plot.top]);
  const describe = (p: ScatterDatum) => `${p.label}, ${xLabel} ${formatX(p.x)}, ${yLabel} ${formatY(p.y)}`;
  const position = ordered.findIndex((p) => p.id === focused);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: ScatterDatum | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = ordered[Math.min(ordered.length - 1, position + 1)];
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = ordered[position < 0 ? ordered.length - 1 : Math.max(0, position - 1)];
    else if (event.key === "Home") next = ordered[0];
    else if (event.key === "End") next = ordered.at(-1);
    else if (event.key === "Escape" && focused !== null) { event.preventDefault(); choose(null); return; }
    else return;
    event.preventDefault();
    if (next) choose(next.id);
  };
  return (
    <div ref={measure} className={classNames("hjm-chart", "hjm-chart--scatter", className)} style={{ ...chromeStyle, ...layoutStyle }}>
      <div
        className="hjm-chart__plot"
        role="slider"
        tabIndex={0}
        aria-label={accessibilityLabel}
        aria-describedby={descriptionId}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, points.length - 1)}
        aria-valuenow={Math.max(0, position)}
        aria-valuetext={focusPoint ? describe(focusPoint) : accessibilityLabel}
        style={{ blockSize: height }}
        onKeyDown={onKeyDown}
        {...handlers}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
          {g.yTicks.map((tick) => (
            <g key={`y${tick}`}>
              <line className="hjm-chart__grid" x1={g.plot.left} x2={g.plot.right} y1={sy(tick)} y2={sy(tick)} />
              <text className="hjm-chart__label" x={g.plot.left - 6} y={sy(tick)} dominantBaseline="middle" textAnchor="end">{formatY(tick)}</text>
            </g>
          ))}
          {g.xTicks.map((tick) => <text key={`x${tick}`} className="hjm-chart__label" x={sx(tick)} y={height - 4} textAnchor="middle">{formatX(tick)}</text>)}
          {g.points.map((p) => {
            const isFocused = p.id === focused;
            return (
              <circle key={p.id} className={classNames("hjm-chart__point", isFocused && "hjm-chart__dot")} data-id={p.id} cx={p.px} cy={p.py}
                r={isFocused ? chartRecipe.scatter.focusRadius : chartRecipe.scatter.radius} fill={colorOf({}, p.seriesIndex ?? 0)}
                opacity={focused !== null && !isFocused ? 0.45 : 0.9} strokeWidth={isFocused ? 2 : 0} />
            );
          })}
        </svg>
        {focusPoint ? <CursorBubble x={focusPoint.px} width={width} text={`${focusPoint.label} · ${formatX(focusPoint.x)} / ${formatY(focusPoint.y)}`} /> : null}
      </div>
      <div className="hjm-chart__axis-titles" aria-hidden="true"><span>{yLabel} ↑</span><span>{xLabel} →</span></div>
      {seriesLabels && seriesLabels.length > 1 ? <ChartLegend items={seriesLabels.map((label, i) => ({ id: String(i), label, color: colorOf({}, i) }))} /> : null}
      <p id={descriptionId} className="hjm-visually-hidden">{points.map(describe).join(". ")}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------------------------

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

export function Sparkline({
  values, color, invert = false, domain, width = chartRecipe.sparkline.width, height = chartRecipe.sparkline.height, accessibilityLabel,
  className, layoutStyle,
}: SparklineProps) {
  const colorOf = useSeriesColor(), id = useSvgId();
  const stroke = color ?? colorOf({}, 0);
  const pad = chartRecipe.sparkline.padding;
  const g = resolveLineGeometry({
    categories: values.map((_, i) => String(i)), series: [{ id: "s", label: "s", values }], width, height,
    insets: { top: pad, right: pad, bottom: pad, left: pad }, invert, ...(domain ? { domain } : {}),
  });
  const segments = splitSegments(g.plots[0]!);
  const labelled = accessibilityLabel !== undefined && accessibilityLabel.trim().length > 0;
  return (
    <svg
      className={classNames("hjm-sparkline", className)}
      style={layoutStyle}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      focusable="false"
      {...(labelled ? { role: "img", "aria-label": accessibilityLabel } : { "aria-hidden": true })}
    >
      <defs>
        <linearGradient id={`${id}-spark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="1" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      {segments.map((segment, i) => <path key={`a${i}`} d={areaPath(segment, height)} fill={`url(#${id}-spark)`} />)}
      {segments.map((segment, i) => <path key={`l${i}`} className="hjm-chart__line" d={linePath(segment)} stroke={stroke} strokeWidth={chartRecipe.sparkline.strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />)}
    </svg>
  );
}
