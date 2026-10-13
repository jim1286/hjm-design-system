import { datavizChromeTokens } from "./dataviz.js";
import { radius, spacing, stroke } from "./foundations.js";
export const chartRecipe = {
    heights: { sparkline: 28, compact: 128, regular: 180, tall: 240 },
    insets: {
        plot: { top: spacing.lg, right: spacing.xs, bottom: spacing.xs, left: spacing.xs },
        axis: { top: spacing.md, right: spacing.xs, bottom: spacing.lg, left: 36 },
    },
    line: { strokeWidth: 2.4, pointRadius: 4.5, focusHaloRadius: 9, focusHaloOpacity: 0.25 },
    area: { topOpacity: 0.32, bottomOpacity: 0 },
    bar: { radius: radius.sm / 2, maxWidth: 28, bandPadding: 0.36, groupGap: 2, restOpacity: 0.4 },
    pie: { donutRatio: 0.62, padAngle: 0.012, minLabelPercent: 4 },
    radar: { levels: 4, strokeWidth: 2, fillOpacity: 0.22, labelOffset: spacing.sm },
    scatter: { radius: 5, focusRadius: 8 },
    sparkline: { width: 72, height: 28, strokeWidth: 1.8, padding: 2 },
    cursor: { strokeWidth: stroke.subtle, dash: [2, 3] },
    reference: { dash: [2, 4] },
    chrome: datavizChromeTokens,
};
// ---------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------
export function validateChartSeries(categories, series) {
    if (series.length === 0)
        throw new TypeError("Chart needs at least one series");
    const ids = new Set();
    for (const item of series) {
        if (!item.id.trim())
            throw new TypeError("Chart series id must not be empty");
        if (ids.has(item.id))
            throw new TypeError(`Duplicate chart series id: ${item.id}`);
        ids.add(item.id);
        if (!item.label.trim())
            throw new TypeError(`Chart series "${item.id}" label must not be empty`);
        if (item.values.length !== categories.length) {
            throw new RangeError(`Chart series "${item.id}" has ${item.values.length} values for ${categories.length} categories`);
        }
    }
}
export const isChartNumber = (value) => typeof value === "number" && Number.isFinite(value);
// ---------------------------------------------------------------------------------------------
// Scales and ticks
// ---------------------------------------------------------------------------------------------
/** "Nice" step (1, 2, 2.5, 5 × 10^n) so axis labels read like 0/25/50 rather than 0/23.7/47.4. */
export function niceStep(span, count) {
    if (!(span > 0) || count < 1)
        return 1;
    const raw = span / count, power = 10 ** Math.floor(Math.log10(raw)), ratio = raw / power;
    const nice = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 2.5 ? 2.5 : ratio <= 5 ? 5 : 10;
    return nice * power;
}
export function niceTicks(min, max, count = 4) {
    if (!Number.isFinite(min) || !Number.isFinite(max))
        return [];
    if (min === max)
        return [min];
    const step = niceStep(max - min, count), start = Math.ceil(min / step - 1e-9) * step;
    const ticks = [];
    for (let tick = start; tick <= max + step * 1e-9; tick += step)
        ticks.push(Number(tick.toPrecision(12)));
    return ticks;
}
/**
 * Value domain. Lines zoom to the observed range (stock charts) unless `includeZero`; bars always
 * include zero so heights compare honestly. `padding` widens a flat series so it is not drawn on an edge.
 */
export function resolveChartDomain(values, { domain, includeZero = false, nice = false, padding = 0 } = {}) {
    if (domain)
        return domain;
    const observed = values.filter(isChartNumber);
    if (!observed.length)
        return [0, 1];
    let min = Math.min(...observed), max = Math.max(...observed);
    if (includeZero) {
        min = Math.min(0, min);
        max = Math.max(0, max);
    }
    if (min === max) {
        const pad = Math.abs(min) * 0.1 || 1;
        min -= pad;
        max += pad;
    }
    if (padding > 0) {
        const pad = (max - min) * padding;
        if (!(includeZero && min === 0))
            min -= pad;
        max += pad;
    }
    if (nice) {
        const step = niceStep(max - min, 4);
        min = Math.floor(min / step) * step;
        max = Math.ceil(max / step) * step;
    }
    return [min, max];
}
/** Linear scale from value domain to pixel range; `invert` puts the minimum at the top (ranks, ERA). */
export function scaleLinear(domain, range, invert = false) {
    const [d0, d1] = domain, [r0, r1] = invert ? [range[1], range[0]] : range, span = d1 - d0;
    return value => span === 0 ? (r0 + r1) / 2 : r0 + (value - d0) / span * (r1 - r0);
}
export function scaleBand(count, range, padding = chartRecipe.bar.bandPadding) {
    const length = range[1] - range[0], step = count > 0 ? length / count : 0, bandwidth = step * (1 - padding);
    return { step, bandwidth, start: index => range[0] + index * step + (step - bandwidth) / 2, center: index => range[0] + index * step + step / 2 };
}
/** Evenly spaced x positions for line/area categories (first and last on the plot edges). */
export function pointPositions(count, range) {
    if (count <= 1)
        return [Math.round((range[0] + range[1]) / 2)];
    const step = (range[1] - range[0]) / (count - 1);
    return Array.from({ length: count }, (_, i) => range[0] + i * step);
}
// ---------------------------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------------------------
const fixed = (value) => Number(value.toFixed(2));
/** Monotone-X cubic (Fritsch–Carlson): smooth without overshooting the data, like d3.curveMonotoneX. */
function monotoneTangents(points) {
    const n = points.length, slopes = [], tangents = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++)
        slopes.push((points[i + 1].y - points[i].y) / ((points[i + 1].x - points[i].x) || 1));
    tangents[0] = slopes[0] ?? 0;
    tangents[n - 1] = slopes[n - 2] ?? 0;
    for (let i = 1; i < n - 1; i++)
        tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
        if (slopes[i] === 0) {
            tangents[i] = 0;
            tangents[i + 1] = 0;
            continue;
        }
        const a = tangents[i] / slopes[i], b = tangents[i + 1] / slopes[i], h = a * a + b * b;
        if (h > 9) {
            const t = 3 / Math.sqrt(h);
            tangents[i] = t * a * slopes[i];
            tangents[i + 1] = t * b * slopes[i];
        }
    }
    return tangents;
}
export function linePath(points, curve = "linear") {
    if (!points.length)
        return "";
    const head = `M${fixed(points[0].x)},${fixed(points[0].y)}`;
    if (points.length === 1)
        return head;
    if (curve === "step")
        return head + points.slice(1).map((p, i) => `H${fixed((points[i].x + p.x) / 2)}V${fixed(p.y)}H${fixed(p.x)}`).join("");
    if (curve === "monotone" && points.length > 2) {
        const t = monotoneTangents(points);
        return head + points.slice(1).map((p, i) => {
            const a = points[i], dx = (p.x - a.x) / 3;
            return `C${fixed(a.x + dx)},${fixed(a.y + dx * t[i])} ${fixed(p.x - dx)},${fixed(p.y - dx * t[i + 1])} ${fixed(p.x)},${fixed(p.y)}`;
        }).join("");
    }
    return head + points.slice(1).map(p => `L${fixed(p.x)},${fixed(p.y)}`).join("");
}
/** Closed area under a line down to `floor` (or between two edges for stacked areas via `lower`). */
export function areaPath(points, floor, curve = "linear", lower) {
    if (points.length < 2)
        return "";
    const top = linePath(points, curve);
    if (lower && lower.length === points.length) {
        const back = linePath([...lower].reverse(), curve).replace(/^M/, "L");
        return `${top}${back}Z`;
    }
    return `${top}L${fixed(points.at(-1).x)},${fixed(floor)}L${fixed(points[0].x)},${fixed(floor)}Z`;
}
/** Splits a series at missing values: a skipped month is a gap, never an interpolated trend. */
export function splitSegments(plots) {
    const segments = [];
    let current = [];
    for (const plot of plots) {
        if (plot === null) {
            if (current.length)
                segments.push(current);
            current = [];
            continue;
        }
        current.push(plot);
    }
    if (current.length)
        segments.push(current);
    return segments;
}
export function resolveLineGeometry({ categories, series, width, height, insets = chartRecipe.insets.plot, invert = false, stacked = false, ...domainOptions }) {
    validateChartSeries(categories, series);
    const plot = { left: insets.left, right: width - insets.right, top: insets.top, bottom: height - insets.bottom };
    const totals = stacked ? stackValues(series) : null;
    const domainValues = totals ? totals.flatMap(row => row.map(cell => cell?.[1] ?? null)) : series.flatMap(item => item.values);
    const domain = resolveChartDomain(domainValues, { includeZero: stacked || domainOptions.includeZero, ...domainOptions });
    const y = scaleLinear(domain, [plot.bottom, plot.top], invert);
    const xs = pointPositions(categories.length, [plot.left, plot.right]);
    const plots = series.map((item, s) => item.values.map((value, i) => {
        const top = totals ? totals[s][i]?.[1] : value;
        return isChartNumber(value) && isChartNumber(top) ? { index: i, seriesIndex: s, x: xs[i], y: y(top), value } : null;
    }));
    const lower = totals ? series.map((_, s) => categories.map((__, i) => { const cell = totals[s][i]; return cell ? { index: i, seriesIndex: s, x: xs[i], y: y(cell[0]), value: cell[0] } : null; })) : null;
    return { plot, domain, ticks: niceTicks(domain[0], domain[1], 4), xs, y, plots, lower };
}
/** Cumulative [lower, upper] per series per category; missing values do not add to the stack. */
export function stackValues(series) {
    const length = series[0]?.values.length ?? 0, positive = new Array(length).fill(0), negative = new Array(length).fill(0);
    return series.map(item => item.values.map((value, i) => {
        if (!isChartNumber(value))
            return null;
        const base = value >= 0 ? positive[i] : negative[i], top = base + value;
        if (value >= 0)
            positive[i] = top;
        else
            negative[i] = top;
        return [base, top];
    }));
}
export function resolveBarGeometry({ categories, series, width, height, insets = chartRecipe.insets.plot, orientation = "vertical", layout = "grouped", ...domainOptions }) {
    validateChartSeries(categories, series);
    const plot = { left: insets.left, right: width - insets.right, top: insets.top, bottom: height - insets.bottom };
    const stacks = layout === "stacked" ? stackValues(series) : null;
    const values = stacks ? stacks.flatMap(row => row.flatMap(cell => cell ? [cell[0], cell[1]] : [])) : series.flatMap(item => item.values);
    const domain = resolveChartDomain(values, { includeZero: true, ...domainOptions });
    const vertical = orientation === "vertical";
    const valueScale = vertical ? scaleLinear(domain, [plot.bottom, plot.top]) : scaleLinear(domain, [plot.left, plot.right]);
    const band = scaleBand(categories.length, vertical ? [plot.left, plot.right] : [plot.top, plot.bottom]);
    const thickness = Math.min(chartRecipe.bar.maxWidth * (layout === "grouped" ? series.length : 1), band.bandwidth);
    const each = layout === "grouped" ? Math.max(1, (thickness - chartRecipe.bar.groupGap * (series.length - 1)) / series.length) : thickness;
    const bars = [];
    series.forEach((item, s) => item.values.forEach((value, i) => {
        if (!isChartNumber(value))
            return;
        const [from, to] = stacks ? stacks[s][i] : [0, value];
        const a = valueScale(from), b = valueScale(to);
        const offset = band.center(i) - thickness / 2 + (layout === "grouped" ? s * (each + chartRecipe.bar.groupGap) : 0);
        bars.push(vertical
            ? { index: i, seriesIndex: s, value, x: offset, y: Math.min(a, b), width: each, height: Math.max(1, Math.abs(a - b)) }
            : { index: i, seriesIndex: s, value, x: Math.min(a, b), y: offset, width: Math.max(1, Math.abs(a - b)), height: each });
    }));
    return { plot, domain, ticks: niceTicks(domain[0], domain[1], 4), bars, centers: categories.map((_, i) => band.center(i)), value: valueScale };
}
const polar = (cx, cy, r, angle) => ({ x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) });
/** Annular sector from 12 o'clock clockwise. `innerRadius` 0 draws a pie wedge. */
export function arcPath(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
    const sweep = endAngle - startAngle;
    if (sweep >= Math.PI * 2 - 1e-6) {
        // A full circle cannot be one arc command; draw two halves.
        const mid = startAngle + Math.PI;
        return arcPath(cx, cy, outerRadius, innerRadius, startAngle, mid) + arcPath(cx, cy, outerRadius, innerRadius, mid, endAngle);
    }
    const large = sweep > Math.PI ? 1 : 0;
    const o0 = polar(cx, cy, outerRadius, startAngle), o1 = polar(cx, cy, outerRadius, endAngle);
    if (innerRadius <= 0)
        return `M${fixed(cx)},${fixed(cy)}L${fixed(o0.x)},${fixed(o0.y)}A${fixed(outerRadius)},${fixed(outerRadius)} 0 ${large} 1 ${fixed(o1.x)},${fixed(o1.y)}Z`;
    const i1 = polar(cx, cy, innerRadius, endAngle), i0 = polar(cx, cy, innerRadius, startAngle);
    return `M${fixed(o0.x)},${fixed(o0.y)}A${fixed(outerRadius)},${fixed(outerRadius)} 0 ${large} 1 ${fixed(o1.x)},${fixed(o1.y)}L${fixed(i1.x)},${fixed(i1.y)}A${fixed(innerRadius)},${fixed(innerRadius)} 0 ${large} 0 ${fixed(i0.x)},${fixed(i0.y)}Z`;
}
/** Negative and missing values are excluded: a share of a whole cannot be negative. */
export function resolvePieGeometry(values, { cx, cy, radius: outer, innerRadius = 0, padAngle = chartRecipe.pie.padAngle }) {
    const total = values.reduce((sum, value) => sum + (isChartNumber(value) && value > 0 ? value : 0), 0);
    if (total <= 0)
        return [];
    let angle = 0;
    const slices = [];
    values.forEach((value, index) => {
        if (!isChartNumber(value) || value <= 0)
            return;
        const sweep = value / total * Math.PI * 2, pad = slices.length || sweep < Math.PI * 2 ? Math.min(padAngle, sweep / 4) : 0;
        const start = angle + pad / 2, end = angle + sweep - pad / 2, mid = (start + end) / 2;
        slices.push({ index, value, percent: value / total * 100, startAngle: start, endAngle: end, path: arcPath(cx, cy, outer, innerRadius, start, end), centroid: polar(cx, cy, innerRadius > 0 ? (outer + innerRadius) / 2 : outer * 0.62, mid) });
        angle += sweep;
    });
    return slices;
}
/**
 * Radar (spider) chart. All axes share one domain (0..max by default) because the products'
 * ratings are on one 0–100 scale; per-axis scales would make the polygon area meaningless.
 */
export function resolveRadarGeometry({ categories, series, cx, cy, radius: outer, domain, levels = chartRecipe.radar.levels, labelOffset = chartRecipe.radar.labelOffset }) {
    validateChartSeries(categories, series);
    if (categories.length < 3)
        throw new RangeError("Radar chart needs at least three axes");
    const [min, max] = domain ?? [0, Math.max(...series.flatMap(item => item.values.filter(isChartNumber)), 1)];
    const step = Math.PI * 2 / categories.length;
    const axes = categories.map((label, index) => {
        const angle = index * step, end = polar(cx, cy, outer, angle), labelAt = polar(cx, cy, outer + labelOffset, angle);
        const sin = Math.sin(angle);
        return { index, label, angle, end, labelAt, anchor: Math.abs(sin) < 0.2 ? "middle" : sin > 0 ? "start" : "end" };
    });
    const rings = Array.from({ length: levels }, (_, level) => {
        const r = outer * (level + 1) / levels;
        return axes.map((axis, i) => { const p = polar(cx, cy, r, axis.angle); return `${i ? "L" : "M"}${fixed(p.x)},${fixed(p.y)}`; }).join("") + "Z";
    });
    const polygons = series.map((item, seriesIndex) => {
        const points = axes.map(axis => {
            const value = item.values[axis.index] ?? null;
            const ratio = isChartNumber(value) ? Math.max(0, Math.min(1, (value - min) / ((max - min) || 1))) : 0;
            return { ...polar(cx, cy, outer * ratio, axis.angle), index: axis.index, value: isChartNumber(value) ? value : null };
        });
        return { seriesIndex, points, path: points.map((p, i) => `${i ? "L" : "M"}${fixed(p.x)},${fixed(p.y)}`).join("") + "Z" };
    });
    return { axes, rings, polygons };
}
export function resolveScatterGeometry({ points, width, height, insets = chartRecipe.insets.axis, xDomain, yDomain }) {
    const plot = { left: insets.left, right: width - insets.right, top: insets.top, bottom: height - insets.bottom };
    const xd = resolveChartDomain(points.map(p => p.x), { domain: xDomain, padding: 0.06 }), yd = resolveChartDomain(points.map(p => p.y), { domain: yDomain, padding: 0.06 });
    const sx = scaleLinear(xd, [plot.left, plot.right]), sy = scaleLinear(yd, [plot.bottom, plot.top]);
    return { plot, xDomain: xd, yDomain: yd, xTicks: niceTicks(xd[0], xd[1], 4), yTicks: niceTicks(yd[0], yd[1], 4), points: points.map(p => ({ ...p, px: sx(p.x), py: sy(p.y) })) };
}
// ---------------------------------------------------------------------------------------------
// Focus (scrub / press) and accessibility
// ---------------------------------------------------------------------------------------------
/** Category index whose x is closest to a pointer x, among categories that have any value. */
export function nearestChartIndex(xs, x, available) {
    const candidates = available ?? xs.map((_, i) => i);
    let best = null, distance = Infinity;
    for (const index of candidates) {
        const d = Math.abs(xs[index] - x);
        if (d < distance) {
            distance = d;
            best = index;
        }
    }
    return best;
}
export function nearestScatterPoint(points, x, y, maxDistance = 32) {
    let best = null, distance = maxDistance * maxDistance;
    points.forEach((p, i) => { const d = (p.px - x) ** 2 + (p.py - y) ** 2; if (d <= distance) {
        distance = d;
        best = i;
    } });
    return best;
}
/** Adjustable-role step (VoiceOver swipe, arrow keys) over observed indices only. */
export function stepChartIndex(available, current, direction) {
    if (!available.length)
        return null;
    if (current === null)
        return direction > 0 ? available[0] : available.at(-1);
    const position = available.indexOf(current);
    return available[Math.min(available.length - 1, Math.max(0, (position < 0 ? 0 : position) + direction))];
}
export function observedIndices(series) {
    const length = series[0]?.values.length ?? 0;
    return Array.from({ length }, (_, i) => i).filter(i => series.some(item => isChartNumber(item.values[i])));
}
/** Index of the highest and lowest observation of one series (stock-chart high/low markers). */
export function seriesExtremes(values) {
    let max = -1, min = -1;
    values.forEach((value, i) => {
        if (!isChartNumber(value))
            return;
        if (max < 0 || value > values[max])
            max = i;
        if (min < 0 || value < values[min])
            min = i;
    });
    return max < 0 ? null : { max, min };
}
/**
 * Text alternative for an image-like chart: every category's values in order, product-formatted.
 * Products pass localized `format`; HJM never formats numbers into a language itself.
 */
export function describeChart(categories, series, format, missing) {
    return series.map(item => `${item.label}: ${categories.map((category, i) => { const v = item.values[i]; return `${category} ${isChartNumber(v) ? format(v) : missing}`; }).join(", ")}`).join(". ");
}
export const chartBehavior = {
    controlled: ["focusIndex"],
    inputs: ["categories", "series", "kind", "orientation", "layout", "domain", "invert", "curve"],
    events: ["onFocusChange"],
    configuration: { curve: ["linear", "monotone", "step"], orientation: ["vertical", "horizontal"], layout: ["grouped", "stacked"] },
    defaults: { curve: "linear", orientation: "vertical", layout: "grouped" },
    stateAxes: { value: ["focused", "scrubbing"], content: ["idle", "empty"] },
    web: { roles: ["img", "slider"], keyboard: ["ArrowLeft", "ArrowRight", "Home", "End"], focus: "native" },
    native: { roles: ["adjustable", "image"], states: [], actions: ["increment", "decrement"] },
    scenarios: [
        "missing-values-split-the-line-instead-of-drawing-zero",
        "bars-and-stacks-always-include-a-zero-baseline",
        "inverted-scale-puts-the-best-rank-on-top",
        "scrubbing-reports-the-focused-index-and-releasing-restores-the-latest",
        "the-focused-point-is-reachable-without-a-drag-via-adjustable-or-arrow-keys",
        "series-colors-come-from-the-product-or-the-dataviz-palette-never-status-colors",
        "every-chart-exposes-a-product-formatted-text-alternative",
        "radar-axes-share-one-domain",
        "pie-slices-ignore-negative-and-missing-values",
    ],
};
//# sourceMappingURL=chart.js.map