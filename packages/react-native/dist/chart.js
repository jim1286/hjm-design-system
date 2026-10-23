import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform, PanResponder, Pressable, View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { resolveDatavizSeriesColor } from "@hjmds/design-contracts/dataviz";
import { prepareChartLineMorph, areaPath, chartRecipe, describeChart, isChartNumber, linePath, nearestChartIndex, nearestScatterPoint, observedIndices, resolveBarGeometry, resolveLineGeometry, resolvePieGeometry, resolvePieVisibility, resolveRadarGeometry, resolveScatterGeometry, seriesExtremes, splitSegments, stepChartIndex, validateChartLegendLayout, validateChartSeries, } from "@hjmds/design-contracts/components/chart";
import { spacing } from "@hjmds/design-contracts/foundations";
// Chart labels and values use the text emphasis scale, the same weight the Web `.hjm-chart__*` rules read.
import { textRecipe } from "@hjmds/design-contracts/recipes";
import { Text, useHjmTextFace } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
// react-native-svg forwards native-only props to SVG DOM on Expo Web. Keep the
// decorative drawing hidden with the host platform's accessibility property.
const decorativeSvgAccessibility = Platform.OS === "web" ? { "aria-hidden": true } : { accessible: false };
function useChartPalette() {
    const theme = useHjmNativeTheme();
    const resolved = theme.environment.theme;
    return {
        theme,
        seriesColor: (series, index) => series.color ?? resolveDatavizSeriesColor(resolved, index),
        grid: resolveColorReference(chartRecipe.chrome.gridLine, theme.palette),
        axis: resolveColorReference(chartRecipe.chrome.axisLine, theme.palette),
        label: resolveColorReference(chartRecipe.chrome.axisLabel, theme.palette),
        legend: resolveColorReference(chartRecipe.chrome.legendLabel, theme.palette),
        surface: resolveColorReference(chartRecipe.chrome.tooltipSurface, theme.palette),
        background: theme.colors.bg,
    };
}
function useWidth(initial = 0) {
    const [width, setWidth] = useState(initial);
    return [width, useCallback((event) => setWidth(Math.round(event.nativeEvent.layout.width)), [])];
}
/** Controlled/uncontrolled focus with a separate transient scrub index. */
function useFocus({ focusIndex, defaultFocusIndex = null, onFocusChange, holdOnRelease = false }, fallback, categories) {
    const categoryKey = (index) => index === null || categories?.[index] === undefined ? null : JSON.stringify([categories[index], categories.slice(0, index).filter(value => value === categories[index]).length]);
    const selectedKey = useRef(categoryKey(defaultFocusIndex));
    const [own, setOwn] = useState(defaultFocusIndex);
    const [scrub, setScrub] = useState(null);
    const last = useRef(null);
    const mapped = categories && selectedKey.current !== null ? categories.findIndex((_, index) => categoryKey(index) === selectedKey.current) : own;
    const ownSelection = mapped === -1 ? null : mapped;
    const settled = focusIndex !== undefined ? (categories && (focusIndex === null || categories[focusIndex] === undefined) ? null : focusIndex) : ownSelection;
    const focus = scrub ?? settled ?? fallback;
    const set = useCallback((index, scrubbing) => {
        if (scrubbing) {
            setScrub(index);
            last.current = index;
        }
        else {
            setScrub(null);
            if (focusIndex === undefined) {
                selectedKey.current = categoryKey(index);
                setOwn(index);
            }
        }
        onFocusChange?.(index, { scrubbing });
    }, [focusIndex, onFocusChange, categories]);
    const release = useCallback(() => set(holdOnRelease ? last.current : null, false), [set, holdOnRelease]);
    return { focus, scrubbing: scrub !== null, set, release };
}
/**
 * Horizontal press-and-drag scrubbing. Vertical drags are released to the parent ScrollView so a
 * chart inside a scrolling screen never traps the page.
 */
function useScrub(pick, onScrub, onEnd) {
    const pickRef = useRef(pick);
    pickRef.current = pick;
    const scrubRef = useRef(onScrub);
    scrubRef.current = onScrub;
    const endRef = useRef(onEnd);
    endRef.current = onEnd;
    return useMemo(() => {
        const at = (event) => scrubRef.current(pickRef.current(event.nativeEvent.locationX, event.nativeEvent.locationY));
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
function CursorBubble({ x, width, text, surface, color }) {
    const { tokens } = useHjmNativeTheme();
    const box = 88, left = Math.min(width - box, Math.max(0, x - box / 2));
    return _jsx(View, { pointerEvents: "none", importantForAccessibility: "no-hide-descendants", accessibilityElementsHidden: true, style: { position: "absolute", top: 0, left, width: box, alignItems: "center" }, children: _jsx(View, { style: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: tokens.radius.sm, backgroundColor: surface }, children: _jsx(Text, { variant: "caption", fontRole: "ui", emphasis: "medium", numberOfLines: 1, style: { color }, children: text }) }) });
}
function ChartLabel({ fontWeight, ...props }) {
    const theme = useHjmNativeTheme();
    const metrics = theme.tokens.typography[chartRecipe.chrome.labelVariant];
    const face = useHjmTextFace({ fontRole: "ui", weight: fontWeight ?? metrics.fontWeight });
    return _jsx(SvgText, { ...props, ...(face.fontFamily ? { fontFamily: face.fontFamily } : {}), fontWeight: face.fontWeight ?? metrics.fontWeight, fontSize: metrics.fontSize * theme.textScaling.scale });
}
function AxisLabels({ ticks, y, x, color, format }) {
    return _jsx(_Fragment, { children: ticks.map(tick => _jsx(ChartLabel, { x: x, y: y(tick) + 4, fill: color, textAnchor: "end", children: format(tick) }, tick)) });
}
// Paths/rectangles update their host attributes directly; values, axes and accessibility
// always come from the latest real data. No per-frame React reconciliation.
function MotionLinePath({ points, lower, floor, curve, animate, ...rest }) {
    const reducedMotion = useHjmNativeTheme().environment.reducedMotion;
    const node = useRef(null);
    const previous = useRef(null);
    const path = (p, base, edge) => base === undefined ? linePath(p, curve) : areaPath(p, base, curve, edge);
    const signature = JSON.stringify([points, lower, floor, curve]);
    useLayoutEffect(() => {
        const before = previous.current;
        const target = { points, lower, floor };
        previous.current = target;
        // A bounded morph avoids multiplying frame work for dense historical datasets.
        const morph = animate && !reducedMotion && AppState.currentState === "active" && before && points.length + before.points.length <= 1024 ? prepareChartLineMorph(before.points, points) : null;
        if (!morph) {
            node.current?.setNativeProps({ d: path(points, floor, lower) });
            return;
        }
        const lowerMorph = before?.lower && lower ? prepareChartLineMorph(before.lower, lower) : null;
        let frame = 0, start;
        const paint = (t) => {
            const current = t === 1 ? target : { points: morph(t), lower: lowerMorph?.(t) ?? lower, floor: floor === undefined ? undefined : (before?.floor ?? floor) + (floor - (before?.floor ?? floor)) * t };
            previous.current = current;
            const d = path(current.points, current.floor, current.lower);
            node.current?.setNativeProps({ d });
        };
        const tick = (now) => { start ??= now; const t = Math.min(1, (now - start) / 220); paint(1 - (1 - t) ** 3); if (t < 1)
            frame = requestAnimationFrame(tick); };
        paint(0);
        frame = requestAnimationFrame(tick);
        const subscription = AppState.addEventListener("change", state => { if (state !== "active") {
            cancelAnimationFrame(frame);
            paint(1);
        } });
        return () => { cancelAnimationFrame(frame); subscription.remove(); };
    }, [signature, animate, reducedMotion]);
    return _jsx(Path, { ...rest, ref: node, d: path(points, floor, lower) });
}
function MotionBar({ bar, animate, ...rest }) {
    const reducedMotion = useHjmNativeTheme().environment.reducedMotion;
    const node = useRef(null), previous = useRef(null);
    const signature = JSON.stringify(bar);
    useLayoutEffect(() => {
        const before = previous.current;
        previous.current = bar;
        if (!animate || reducedMotion || !before || AppState.currentState !== "active") {
            node.current?.setNativeProps({ x: bar.x, y: bar.y, width: bar.width, height: bar.height });
            return;
        }
        let frame = 0, start;
        const paint = (t) => {
            const value = { ...bar, x: before.x + (bar.x - before.x) * t, y: before.y + (bar.y - before.y) * t, width: before.width + (bar.width - before.width) * t, height: before.height + (bar.height - before.height) * t };
            previous.current = value;
            node.current?.setNativeProps({ x: value.x, y: value.y, width: value.width, height: value.height });
        };
        const tick = (now) => { start ??= now; const t = Math.min(1, (now - start) / 220); paint(1 - (1 - t) ** 3); if (t < 1)
            frame = requestAnimationFrame(tick); };
        paint(0);
        frame = requestAnimationFrame(tick);
        const subscription = AppState.addEventListener("change", state => { if (state !== "active") {
            cancelAnimationFrame(frame);
            paint(1);
        } });
        return () => { cancelAnimationFrame(frame); subscription.remove(); };
    }, [signature, animate, reducedMotion]);
    return _jsx(Rect, { ...rest, ref: node, x: bar.x, y: bar.y, width: bar.width, height: bar.height });
}
export function LineChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height = chartRecipe.heights.regular, curve = "linear", missingConnection = "none", area, stacked = false, invert = false, domain, includeZero, referenceValue, extremes, showAxis = false, valueAxis = false, ticks: tickOverride, cursorLabel, animateChanges = false, scrubEmphasis, ...focusProps }) {
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
    return _jsxs(View, { accessible: true, accessibilityRole: "adjustable", accessibilityLabel: accessibilityLabel, accessibilityHint: describeChart(categories, series, formatValue, missingLabel), accessibilityValue: { text: focus === null ? missingLabel : `${categories[focus]} ${series.map(item => { const v = item.values[focus]; return isChartNumber(v) ? formatValue(v) : missingLabel; }).join(", ")}` }, accessibilityActions: [{ name: "increment" }, { name: "decrement" }], onAccessibilityAction: event => set(stepChartIndex(available, focus, event.nativeEvent.actionName === "increment" ? 1 : -1), false), onLayout: onLayout, style: { height }, ...handlers, children: [g && _jsxs(Svg, { width: width, height: height, ...decorativeSvgAccessibility, children: [_jsxs(Defs, { children: [scrubEmphasis && _jsx(ClipPath, { id: `hjmScrub${id}`, children: _jsx(Rect, { x: scrubEmphasis === "after" && focus !== null ? g.xs[focus] ?? g.plot.left : g.plot.left, y: 0, width: focus === null ? width : scrubEmphasis === "after" ? g.plot.right - (g.xs[focus] ?? g.plot.left) : (g.xs[focus] ?? g.plot.right) - g.plot.left, height: height }) }), series.map((item, s) => _jsxs(LinearGradient, { id: `hjmArea${id}${s}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx(Stop, { offset: "0", stopColor: palette.seriesColor(item, s), stopOpacity: chartRecipe.area.topOpacity }), _jsx(Stop, { offset: "1", stopColor: palette.seriesColor(item, s), stopOpacity: chartRecipe.area.bottomOpacity })] }, item.id))] }), (tickOverride ?? g.ticks).map(tick => _jsx(Line, { x1: g.plot.left, x2: g.plot.right, y1: g.y(tick), y2: g.y(tick), stroke: palette.grid, strokeWidth: chartRecipe.chrome.gridWidth }, tick)), (showAxis || valueAxis) && _jsx(AxisLabels, { ticks: tickOverride ?? g.ticks, y: g.y, x: g.plot.left - 6, color: palette.label, format: formatValue }), isChartNumber(reference) && _jsx(Line, { x1: g.plot.left, x2: g.plot.right, y1: g.y(reference), y2: g.y(reference), stroke: palette.label, strokeDasharray: [...chartRecipe.reference.dash], strokeWidth: 1 }), series.map((item, s) => {
                        const color = palette.seriesColor(item, s), segments = splitSegments(g.plots[s]);
                        const lowerSegments = g.lower ? splitSegments(g.lower[s]) : null;
                        return _jsxs(G, { children: [missingConnection === "dotted" && segments.flatMap(segment => segment.filter((point, index) => (index === 0 && point.index > 0) || (index === segment.length - 1 && point.index < categories.length - 1))).map(point => _jsx(Line, { x1: point.x, y1: point.y, x2: point.x, y2: g.plot.bottom, stroke: color, strokeWidth: chartRecipe.line.strokeWidth, strokeDasharray: [...chartRecipe.line.missingDash], strokeLinecap: "round", opacity: chartRecipe.line.missingOpacity }, `gap${point.index}`)), missingConnection === "bridge" && segments.slice(1).map((segment, index) => {
                                    const before = segments[index].at(-1), after = segment[0];
                                    return _jsx(Line, { x1: before.x, y1: before.y, x2: after.x, y2: after.y, stroke: color, strokeWidth: chartRecipe.line.strokeWidth, strokeDasharray: [...chartRecipe.line.missingDash], strokeLinecap: "round", opacity: chartRecipe.line.missingOpacity }, `bridge${index}`);
                                }), (showArea || stacked) && segments.map((segment, i) => _jsx(MotionLinePath, { animate: animateChanges, points: segment, floor: g.plot.bottom, curve: curve, lower: lowerSegments?.[i], fill: `url(#hjmArea${id}${s})` }, `a${i}`)), segments.map((segment, i) => _jsxs(G, { children: [_jsx(MotionLinePath, { animate: animateChanges, points: segment, curve: curve, stroke: scrubEmphasis && focus !== null ? palette.label : color, strokeWidth: chartRecipe.line.strokeWidth, fill: "none", strokeLinejoin: "round", strokeLinecap: "round" }), scrubEmphasis && focus !== null && _jsx(G, { clipPath: `url(#hjmScrub${id})`, children: _jsx(MotionLinePath, { animate: animateChanges, points: segment, curve: curve, stroke: color, strokeWidth: chartRecipe.line.strokeWidth, fill: "none", strokeLinejoin: "round", strokeLinecap: "round" }) })] }, `l${i}`)), segments.filter(segment => segment.length === 1).map(segment => _jsx(Circle, { cx: segment[0].x, cy: segment[0].y, r: 3, fill: color }, `d${segment[0].index}`))] }, item.id);
                    }), focus !== null && _jsxs(_Fragment, { children: [_jsx(Line, { x1: g.xs[focus], x2: g.xs[focus], y1: g.plot.top - 4, y2: g.plot.bottom, stroke: palette.label, strokeWidth: chartRecipe.cursor.strokeWidth, ...(scrubbing ? {} : { strokeDasharray: [...chartRecipe.cursor.dash] }) }), series.map((item, s) => { const p = g.plots[s][focus]; const color = palette.seriesColor(item, s); return p ? _jsxs(G, { children: [_jsx(Circle, { cx: p.x, cy: p.y, r: chartRecipe.line.focusHaloRadius, fill: color, opacity: chartRecipe.line.focusHaloOpacity }), _jsx(Circle, { cx: p.x, cy: p.y, r: chartRecipe.line.pointRadius, fill: color, stroke: palette.background, strokeWidth: 2 })] }, item.id) : null; })] }), marks && extremes && [[marks.max, extremes.high], [marks.min, extremes.low]].filter(([index], i) => i === 0 || index !== marks.max).map(([index, label]) => {
                        const p = g.plots[0][index];
                        // Opposite sides of the extrema keep labels apart even when a fixed rank domain packs
                        // both points into the top of the plot. Inversion swaps which numeric extreme is higher.
                        const above = index === (invert ? marks.min : marks.max);
                        return p ? _jsx(ChartLabel, { x: Math.min(g.plot.right - 4, Math.max(g.plot.left + 4, p.x)), y: Math.max(10, Math.min(height - 2, p.y + (above ? -10 : 16))), fontWeight: textRecipe.emphasis.medium, fill: palette.label, textAnchor: p.x < width * 0.2 ? "start" : p.x > width * 0.8 ? "end" : "middle", children: `${label} ${formatValue(p.value)}` }, label) : null;
                    }), showAxis && categories.length > 0 && _jsxs(_Fragment, { children: [_jsx(ChartLabel, { x: g.xs[0], y: height - 4, fill: palette.label, textAnchor: "start", children: categories[0] }), _jsx(ChartLabel, { x: g.xs.at(-1), y: height - 4, fill: palette.label, textAnchor: "end", children: categories.at(-1) })] })] }), g && scrubbing && focus !== null && _jsx(CursorBubble, { x: g.xs[focus], width: width, text: cursorLabel?.(focus) ?? categories[focus], surface: palette.surface, color: palette.legend })] });
}
export function BarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, height, orientation = "vertical", layout = "grouped", domain, showAxis = false, showValues = false, animateChanges = false, ...focusProps }) {
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
        const occurrences = new Map();
        return categories.map(label => { const occurrence = occurrences.get(label) ?? 0; occurrences.set(label, occurrence + 1); return JSON.stringify([label, occurrence]); });
    }, [categories]);
    const handlers = useScrub((x, y) => g ? nearestChartIndex(g.centers, vertical ? x : y, available) : null, index => set(index, true), () => set(focus, false));
    return _jsxs(View, { accessible: true, accessibilityRole: "adjustable", accessibilityLabel: accessibilityLabel, accessibilityHint: describeChart(categories, series, formatValue, missingLabel), accessibilityValue: { text: focus === null ? "" : `${categories[focus]} ${series.map(item => { const v = item.values[focus]; return isChartNumber(v) ? formatValue(v) : missingLabel; }).join(", ")}` }, accessibilityActions: [{ name: "increment" }, { name: "decrement" }], onAccessibilityAction: event => set(stepChartIndex(available, focus, event.nativeEvent.actionName === "increment" ? 1 : -1), false), onLayout: onLayout, style: { height: resolvedHeight }, ...handlers, children: [g && _jsxs(Svg, { width: width, height: resolvedHeight, ...decorativeSvgAccessibility, children: [g.ticks.map(tick => vertical
                        ? _jsx(Line, { x1: g.plot.left, x2: g.plot.right, y1: g.value(tick), y2: g.value(tick), stroke: palette.grid, strokeWidth: chartRecipe.chrome.gridWidth }, tick)
                        : _jsx(Line, { y1: g.plot.top, y2: g.plot.bottom, x1: g.value(tick), x2: g.value(tick), stroke: palette.grid, strokeWidth: chartRecipe.chrome.gridWidth }, tick)), showAxis && vertical && _jsx(AxisLabels, { ticks: g.ticks, y: g.value, x: g.plot.left - 6, color: palette.label, format: formatValue }), g.bars.map(bar => _jsx(MotionBar, { bar: bar, animate: animateChanges && g.bars.length <= 200, rx: chartRecipe.bar.radius, fill: palette.seriesColor(series[bar.seriesIndex], bar.seriesIndex), opacity: focus === null || focus === bar.index ? 1 : chartRecipe.bar.restOpacity }, `${series[bar.seriesIndex].id}-${categoryKeys[bar.index]}`)), showValues && layout === "grouped" && g.bars.map(bar => _jsx(ChartLabel, { x: vertical ? bar.x + bar.width / 2 : bar.x + bar.width + 4, y: vertical ? bar.y - 4 : bar.y + bar.height / 2 + 4, fontWeight: textRecipe.emphasis.medium, fill: palette.legend, textAnchor: vertical ? "middle" : "start", children: formatValue(bar.value) }, `v${bar.seriesIndex}-${bar.index}`)), categories.map((category, i) => vertical
                        ? (categories.length <= 12 || i % Math.ceil(categories.length / 12) === 0) && _jsx(ChartLabel, { x: g.centers[i], y: resolvedHeight - 4, fill: focus === i ? palette.legend : palette.label, textAnchor: "middle", children: category }, category + i)
                        : _jsx(ChartLabel, { x: g.plot.left - 8, y: g.centers[i] + 4, fill: focus === i ? palette.legend : palette.label, textAnchor: "end", children: category }, category + i))] }), g && scrubbing && focus !== null && vertical && _jsx(CursorBubble, { x: g.centers[focus], width: width, text: `${categories[focus]} ${series.map(item => { const v = item.values[focus]; return isChartNumber(v) ? formatValue(v) : missingLabel; }).join(" · ")}`, surface: palette.surface, color: palette.legend })] });
}
export function ChartLegend({ items, selectedId, onSelect, exclusion, layout = "stack" }) {
    const palette = useChartPalette();
    validateChartLegendLayout(layout);
    const legend = chartRecipe.legend;
    const inline = layout === "inline";
    const rootStyle = inline
        ? { flexDirection: "row", flexWrap: "wrap", alignItems: "center", rowGap: legend.layouts.inline.rowGap, columnGap: legend.layouts.inline.columnGap }
        : { gap: legend.layouts.stack.rowGap };
    return _jsx(View, { style: rootStyle, children: items.map(item => {
            // Inline entries size to their content and wrap as a whole; stacked rows take the width and end-align the value.
            const content = _jsxs(View, { style: { flexDirection: "row", alignItems: "center", gap: legend.itemGap, ...(inline ? {} : { minHeight: legend.layouts.stack.rowMinHeight }), opacity: selectedId && selectedId !== item.id ? legend.dimmedOpacity : 1 }, children: [_jsx(View, { style: { width: legend.swatch.size, height: legend.swatch.size, borderRadius: legend.swatch.radius, backgroundColor: item.color } }), _jsx(Text, { variant: "body", ...(inline ? { layoutStyle: { flexShrink: 1 } } : { layoutStyle: { flex: 1 }, numberOfLines: 1 }), children: item.label }), item.value !== undefined && _jsx(Text, { variant: "label", fontRole: "ui", emphasis: "medium", style: { color: palette.legend, fontVariant: ["tabular-nums"] }, children: item.value })] });
            const selection = onSelect ? _jsx(Pressable, { accessibilityRole: "button", accessibilityState: { selected: selectedId === item.id }, accessibilityLabel: `${item.label}${item.value ? ` ${item.value}` : ""}`, onPress: () => onSelect(selectedId === item.id ? null : item.id), children: content }, item.id)
                : _jsx(View, { accessible: true, accessibilityLabel: `${item.label}${item.value ? ` ${item.value}` : ""}`, children: content }, item.id);
            return exclusion ? _jsxs(View, { style: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, children: [_jsx(Pressable, { style: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center" }, accessibilityRole: "checkbox", accessibilityState: { checked: !exclusion.excludedIds.includes(item.id) }, accessibilityLabel: exclusion.label(item, !exclusion.excludedIds.includes(item.id)), onPress: () => exclusion.onToggle(item.id), children: _jsx(Text, { children: exclusion.excludedIds.includes(item.id) ? "□" : "✓" }) }), _jsx(View, { style: inline ? {} : { flex: 1 }, children: selection })] }, item.id) : selection;
        }) });
}
export function PieChart({ data, accessibilityLabel, formatValue, donut = true, size = 180, centerContent, selectedId, defaultSelectedId = null, onSelect, showLegend = true, exclusion }) {
    const palette = useChartPalette();
    const [own, setOwn] = useState(defaultSelectedId);
    const candidate = selectedId !== undefined ? selectedId : own;
    const selected = candidate !== null && exclusion?.excludedIds.includes(candidate) ? null : candidate;
    const select = (id) => { if (selectedId === undefined)
        setOwn(id); onSelect?.(id); };
    const radius = size / 2 - 6, inner = donut ? radius * chartRecipe.pie.donutRatio : 0;
    const visibility = resolvePieVisibility(data, exclusion?.excludedIds);
    const slices = resolvePieGeometry(visibility.values, { cx: size / 2, cy: size / 2, radius, innerRadius: inner });
    const center = typeof centerContent === "function" ? centerContent(visibility) : centerContent;
    const legendExclusion = exclusion ? { excludedIds: exclusion.excludedIds, label: (item, included) => exclusion.label(data.find(datum => datum.id === item.id), included),
        onToggle: (id) => exclusion.onExcludedIdsChange(exclusion.excludedIds.includes(id) ? exclusion.excludedIds.filter(key => key !== id) : [...exclusion.excludedIds, id]) } : undefined;
    const colorOf = (index) => data[index].color ?? palette.seriesColor({}, index);
    const percent = (index) => slices.find(slice => slice.index === index)?.percent;
    const summary = data.map((d, i) => exclusion?.excludedIds.includes(d.id) ? "" : `${d.label} ${isChartNumber(d.value) ? formatValue(d.value) : ""}${percent(i) !== undefined ? ` (${Math.round(percent(i))}%)` : ""}`).filter(Boolean).join(", ");
    return _jsxs(View, { style: { gap: spacing.md }, children: [_jsxs(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: `${accessibilityLabel}. ${summary}`, style: { width: size, height: size, alignSelf: "center" }, children: [_jsxs(Svg, { width: size, height: size, ...decorativeSvgAccessibility, children: [slices.map(slice => _jsx(Path, { d: slice.path, fill: colorOf(slice.index), opacity: selected && data[slice.index].id !== selected ? 0.35 : 1, ...(onSelect || selectedId !== undefined ? { onPress: () => select(data[slice.index].id === selected ? null : data[slice.index].id) } : {}) }, slice.index)), slices.filter(slice => !donut && slice.percent >= chartRecipe.pie.minLabelPercent * 2).map(slice => {
                                const label = `${Math.round(slice.percent)}%`;
                                const metrics = palette.theme.tokens.typography[chartRecipe.chrome.labelVariant];
                                const fontSize = metrics.fontSize * palette.theme.textScaling.scale;
                                const labelWidth = label.length * fontSize + spacing.xxs * 2;
                                const labelHeight = metrics.lineHeight * palette.theme.textScaling.scale + spacing.xxs;
                                return _jsxs(G, { pointerEvents: "none", children: [_jsx(Rect, { x: slice.centroid.x - labelWidth / 2, y: slice.centroid.y - labelHeight / 2, width: labelWidth, height: labelHeight, rx: palette.theme.tokens.radius.sm, fill: resolveColorReference(chartRecipe.chrome.labelSurface, palette.theme.palette) }), _jsx(ChartLabel, { x: slice.centroid.x, y: slice.centroid.y + fontSize * 0.35, fontWeight: textRecipe.emphasis.medium, fill: resolveColorReference(chartRecipe.chrome.labelContent, palette.theme.palette), textAnchor: "middle", children: label })] }, `t${slice.index}`);
                            })] }), donut && center != null && _jsx(View, { pointerEvents: "none", style: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }, children: center })] }), showLegend && _jsx(ChartLegend, { items: data.map((d, i) => ({ id: d.id, label: d.label, color: colorOf(i), value: isChartNumber(d.value) ? `${formatValue(d.value)}${percent(i) !== undefined ? ` · ${Math.round(percent(i))}%` : ""}` : "—" })), selectedId: selected, ...(legendExclusion ? { exclusion: legendExclusion } : {}), ...(onSelect || selectedId !== undefined ? { onSelect: select } : {}) })] });
}
export function RadarChart({ categories, series, accessibilityLabel, formatValue, missingLabel, domain, levels = chartRecipe.radar.levels, size = 240, showLegend }) {
    const palette = useChartPalette();
    validateChartSeries(categories, series);
    // Reserve room around the polygon for axis labels.
    const pad = 44, radius = size / 2 - pad;
    const g = resolveRadarGeometry({ categories, series, cx: size / 2, cy: size / 2, radius, levels, ...(domain ? { domain } : {}) });
    return _jsxs(View, { style: { gap: spacing.sm }, children: [_jsx(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: `${accessibilityLabel}. ${describeChart(categories, series, formatValue, missingLabel)}`, style: { width: size, height: size, alignSelf: "center" }, children: _jsxs(Svg, { width: size, height: size, ...decorativeSvgAccessibility, children: [g.rings.map((ring, i) => _jsx(Path, { d: ring, fill: "none", stroke: palette.grid, strokeWidth: chartRecipe.chrome.gridWidth }, i)), g.axes.map(axis => _jsx(Line, { x1: size / 2, y1: size / 2, x2: axis.end.x, y2: axis.end.y, stroke: palette.grid, strokeWidth: chartRecipe.chrome.gridWidth }, axis.index)), g.polygons.map(polygon => {
                            const color = palette.seriesColor(series[polygon.seriesIndex], polygon.seriesIndex);
                            return _jsxs(G, { children: [_jsx(Path, { d: polygon.path, fill: color, fillOpacity: chartRecipe.radar.fillOpacity, stroke: color, strokeWidth: chartRecipe.radar.strokeWidth, strokeLinejoin: "round" }), polygon.points.map(p => p.value !== null && _jsx(Circle, { cx: p.x, cy: p.y, r: 3, fill: color }, p.index))] }, polygon.seriesIndex);
                        }), g.axes.map(axis => {
                            const first = series[0]?.values[axis.index];
                            return _jsxs(G, { children: [_jsx(ChartLabel, { x: axis.labelAt.x, y: axis.labelAt.y, fontWeight: textRecipe.emphasis.medium, fill: palette.legend, textAnchor: axis.anchor, children: axis.label }), series.length === 1 && _jsx(ChartLabel, { x: axis.labelAt.x, y: axis.labelAt.y + 14, fill: palette.label, textAnchor: axis.anchor, children: isChartNumber(first) ? formatValue(first) : missingLabel })] }, `l${axis.index}`);
                        })] }) }), (showLegend ?? series.length > 1) && _jsx(ChartLegend, { items: series.map((item, s) => ({ id: item.id, label: item.label, color: palette.seriesColor(item, s) })) })] });
}
export function ScatterChart({ points, accessibilityLabel, xLabel, yLabel, formatX, formatY, height = chartRecipe.heights.tall, seriesLabels, focusId, onFocusChange }) {
    const palette = useChartPalette();
    const [width, onLayout] = useWidth();
    const [own, setOwn] = useState(null);
    const focused = focusId !== undefined ? focusId : own;
    const choose = (id) => { if (focusId === undefined)
        setOwn(id); onFocusChange?.(id); };
    const g = useMemo(() => width > 0 ? resolveScatterGeometry({ points, width, height }) : null, [points, width, height]);
    const ordered = useMemo(() => [...points].sort((a, b) => a.x - b.x || a.y - b.y), [points]);
    const handlers = useScrub((x, y) => { const index = g ? nearestScatterPoint(g.points, x, y) : null; return index; }, index => { if (index !== null)
        choose(points[index].id); }, () => undefined);
    const focusPoint = g?.points.find(p => p.id === focused);
    return _jsxs(View, { style: { gap: spacing.sm }, children: [_jsxs(View, { accessible: true, accessibilityRole: "adjustable", accessibilityLabel: accessibilityLabel, accessibilityValue: { text: focusPoint ? `${focusPoint.label}, ${xLabel} ${formatX(focusPoint.x)}, ${yLabel} ${formatY(focusPoint.y)}` : `${points.length}` }, accessibilityActions: [{ name: "increment" }, { name: "decrement" }], onAccessibilityAction: event => {
                    const at = ordered.findIndex(p => p.id === focused), next = ordered[Math.min(ordered.length - 1, Math.max(0, (at < 0 ? -1 : at) + (event.nativeEvent.actionName === "increment" ? 1 : -1)))];
                    if (next)
                        choose(next.id);
                }, onLayout: onLayout, style: { height }, ...handlers, children: [g && _jsxs(Svg, { width: width, height: height, ...decorativeSvgAccessibility, children: [g.yTicks.map(tick => { const y = g.plot.bottom - (tick - g.yDomain[0]) / ((g.yDomain[1] - g.yDomain[0]) || 1) * (g.plot.bottom - g.plot.top); return _jsxs(G, { children: [_jsx(Line, { x1: g.plot.left, x2: g.plot.right, y1: y, y2: y, stroke: palette.grid, strokeWidth: chartRecipe.chrome.gridWidth }), _jsx(ChartLabel, { x: g.plot.left - 6, y: y + 4, fill: palette.label, textAnchor: "end", children: formatY(tick) })] }, `y${tick}`); }), g.xTicks.map(tick => { const x = g.plot.left + (tick - g.xDomain[0]) / ((g.xDomain[1] - g.xDomain[0]) || 1) * (g.plot.right - g.plot.left); return _jsx(ChartLabel, { x: x, y: height - 4, fill: palette.label, textAnchor: "middle", children: formatX(tick) }, `x${tick}`); }), g.points.map(p => _jsx(Circle, { cx: p.px, cy: p.py, r: p.id === focused ? chartRecipe.scatter.focusRadius : chartRecipe.scatter.radius, fill: palette.seriesColor({}, p.seriesIndex ?? 0), opacity: focused && p.id !== focused ? 0.45 : 0.9, stroke: p.id === focused ? palette.background : "none", strokeWidth: 2 }, p.id))] }), g && focusPoint && _jsx(CursorBubble, { x: focusPoint.px, width: width, text: `${focusPoint.label} · ${formatX(focusPoint.x)} / ${formatY(focusPoint.y)}`, surface: palette.surface, color: palette.legend })] }), _jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between" }, children: [_jsxs(Text, { variant: "caption", tone: "muted", children: [yLabel, " \u2191"] }), _jsxs(Text, { variant: "caption", tone: "muted", children: [xLabel, " \u2192"] })] }), seriesLabels && seriesLabels.length > 1 && _jsx(ChartLegend, { items: seriesLabels.map((label, i) => ({ id: String(i), label, color: palette.seriesColor({}, i) })) })] });
}
export function Sparkline({ values, color, invert = false, domain, width = chartRecipe.sparkline.width, height = chartRecipe.sparkline.height, accessibilityLabel }) {
    const palette = useChartPalette(), id = useId().replace(/[^a-zA-Z0-9]/g, "");
    const stroke = color ?? palette.seriesColor({}, 0);
    const pad = chartRecipe.sparkline.padding;
    const g = resolveLineGeometry({ categories: values.map((_, i) => String(i)), series: [{ id: "s", label: "s", values }], width, height, insets: { top: pad, right: pad, bottom: pad, left: pad }, invert, domain });
    const segments = splitSegments(g.plots[0]);
    const svg = _jsxs(Svg, { width: width, height: height, ...decorativeSvgAccessibility, children: [_jsx(Defs, { children: _jsxs(LinearGradient, { id: `hjmSpark${id}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx(Stop, { offset: "0", stopColor: stroke, stopOpacity: 0.28 }), _jsx(Stop, { offset: "1", stopColor: stroke, stopOpacity: 0 })] }) }), segments.map((segment, i) => _jsx(Path, { d: areaPath(segment, height), fill: `url(#hjmSpark${id})` }, `a${i}`)), segments.map((segment, i) => _jsx(Path, { d: linePath(segment), stroke: stroke, strokeWidth: chartRecipe.sparkline.strokeWidth, fill: "none", strokeLinejoin: "round", strokeLinecap: "round" }, `l${i}`))] });
    return accessibilityLabel
        ? _jsx(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: accessibilityLabel, children: svg })
        : _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: svg });
}
//# sourceMappingURL=chart.js.map