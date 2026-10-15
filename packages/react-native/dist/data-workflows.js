"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { binHistogram, resolveCohorts, resolveFunnel, resolveImportMapping, resolveTarget, validateCorrelation } from "@hjmds/design-contracts/data-workflows";
import { assertDistinctIds } from "@hjmds/design-contracts/collection-editing";
import { resolveDatavizSeriesColor } from "@hjmds/design-contracts/dataviz";
import { Button } from "./actions.js";
import { Select } from "./forms.js";
import { Stack, Text } from "./primitives.js";
import { DataTable } from "./data-table.js";
import { BarChart } from "./chart.js";
import { Statistic } from "./data-display.js";
import { Progress } from "./feedback.js";
import { useHjmNativeTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
// These read-only tables expose neither sort controls nor row selection.
const labelsFor = (label) => ({ table: label, selectAll: label, selectRow: (id) => id, sortColumn: (header) => header });
export function ImportFieldMapping(props) {
    const action = useCompositionAction(props.disabled), resolved = resolveImportMapping(props.sources, props.targets, props.mapping);
    const locked = props.disabled === true || action.pending, rows = props.previewRows ?? [];
    assertDistinctIds(rows);
    const pairs = props.targets.flatMap(target => { const source = props.sources.find(source => props.mapping[source.id] === target.id); return source ? [{ source, target }] : []; });
    return _jsxs(Stack, { gap: "md", children: [_jsx(Text, { emphasis: "strong", children: props.label }), props.sources.map(source => _jsx(Select, { label: source.label, placeholder: props.skipLabel, dismissLabel: props.dismissLabel, disabled: locked, items: [{ id: resolved.skipKey, label: props.skipLabel, textValue: props.skipLabel }, ...props.targets.map(target => ({ id: target.id, label: target.label, textValue: target.label }))], selectedKey: props.mapping[source.id] ?? resolved.skipKey, onSelectionChange: key => { if (!locked)
                    props.onMappingChange({ ...props.mapping, [source.id]: key === resolved.skipKey ? null : key }); } }, source.id)), !resolved.valid ? _jsx(Text, { accessibilityLiveRegion: "polite", align: "center", children: props.validationLabel(resolved) }) : null, resolved.valid && rows.length ? _jsx(DataTable, { columns: pairs.map(pair => ({ id: pair.target.id, header: pair.target.label })), rows: rows.map(row => ({ id: row.id })), labels: labelsFor(props.label), renderCell: (id, column) => rows.find(row => row.id === id)?.values[pairs.find(pair => pair.target.id === column).source.id] ?? "" }) : null, _jsx(Button, { loading: action.pending, disabled: props.disabled === true || !resolved.valid, onPress: () => { if (resolved.valid)
                    void action.run("import", () => props.onImport(resolved.mapping)); }, children: props.importLabel }), action.failed ? _jsx(Text, { accessibilityRole: "alert", accessibilityLiveRegion: "assertive", tone: "danger", align: "center", children: props.errorLabel }) : null] });
}
export function ConversionFunnel(props) {
    const stages = resolveFunnel(props.stages), [chosen, setChosen] = useState(null);
    const selected = Math.max(0, stages.findIndex(stage => stage.id === chosen));
    return _jsxs(Stack, { gap: "md", children: [_jsx(Text, { emphasis: "strong", children: props.label }), stages.length ? _jsxs(_Fragment, { children: [_jsx(BarChart, { categories: stages.map(stage => stage.label), series: [{ id: "count", label: props.label, values: stages.map(stage => stage.count) }], accessibilityLabel: props.label, formatValue: props.formatCount, missingLabel: props.missingLabel, orientation: "horizontal", focusIndex: selected, onFocusChange: index => { if (index !== null && stages[index])
                            setChosen(stages[index].id); } }), _jsx(Stack, { axis: "inline", gap: "sm", wrap: true, children: stages.map(stage => _jsx(Button, { tone: "ghost", selected: stages[selected].id === stage.id, onPress: () => setChosen(stage.id), children: stage.label }, stage.id)) }), _jsx(Text, { accessibilityLiveRegion: "polite", children: props.detailLabel(stages[selected]) })] }) : _jsx(Text, { align: "center", children: props.missingLabel })] });
}
export function CohortRetentionTable(props) {
    const rows = resolveCohorts(props.cohorts, props.periods.length);
    const color = useHjmNativeTheme().environment.theme;
    // MatrixTable intentionally suppresses its diagonal for head-to-head teams. Cohort data is rectangular.
    return _jsx(DataTable, { columns: [{ id: "label", header: props.cohortColumnLabel, pinned: "start" }, ...props.periods.map((header, index) => ({ id: `p-${index}`, header }))], rows: rows.map(row => ({ id: row.id })), labels: labelsFor(props.label), heatColors: { high: resolveDatavizSeriesColor(color, 0), low: resolveDatavizSeriesColor(color, 1) }, cellStyle: (rowId, column) => { const rate = rows.find(row => row.id === rowId).rates[Number(column.slice(2))]; return typeof rate === "number" && rate > 0 ? { heat: { side: "high", strength: rate >= .7 ? 3 : rate >= .35 ? 2 : 1 } } : null; }, renderCell: (rowId, column) => { const row = rows.find(row => row.id === rowId); if (column === "label")
            return row.label; const index = Number(column.slice(2)), rate = row.rates[index]; return rate === null || rate === undefined ? props.missingLabel : props.formatRate(rate, row.retained[index], row.size); } });
}
export function CorrelationMatrix(props) {
    validateCorrelation(props.data);
    const color = useHjmNativeTheme().environment.theme;
    const valueOf = (row, column) => props.data.values[props.data.variables.findIndex(variable => variable.id === row)][Number(column.slice(2))];
    return _jsx(DataTable, { columns: [{ id: "label", header: props.variableColumnLabel, pinned: "start" }, ...props.data.variables.map((variable, index) => ({ id: `v-${index}`, header: variable.label }))], rows: props.data.variables.map(variable => ({ id: variable.id })), labels: labelsFor(props.label), heatColors: { high: resolveDatavizSeriesColor(color, 0), low: resolveDatavizSeriesColor(color, 1) }, cellStyle: (row, column) => { if (column === "label")
            return null; const value = valueOf(row, column); return value === null || value === undefined || value === 0 ? null : { heat: { side: value > 0 ? "high" : "low", strength: Math.abs(value) >= .7 ? 3 : Math.abs(value) >= .35 ? 2 : 1 } }; }, renderCell: (row, column) => { if (column === "label")
            return props.data.variables.find(variable => variable.id === row).label; const value = valueOf(row, column); return value === null || value === undefined ? props.missingLabel : props.formatValue(value); } });
}
export function TargetSummary(props) {
    const summary = resolveTarget(props.actual, props.target), label = props.summaryLabel(summary);
    return _jsxs(Stack, { gap: "sm", children: [_jsx(Statistic, { descriptor: { id: "target-summary", label: props.label, value: props.formatActual(summary.actual), hint: label } }), summary.progress === null ? null : _jsx(Progress, { label: props.label, value: summary.progress, max: 1, valueText: label })] });
}
export function HistogramExplorer(props) {
    if (!props.binCounts.length || !props.binCounts.includes(props.binCount) || new Set(props.binCounts).size !== props.binCounts.length)
        throw new RangeError("Histogram requires distinct choices including the selected bin count");
    const variants = props.binCounts.map(count => binHistogram(props.samples, count, props.domain)), histogram = variants[props.binCounts.indexOf(props.binCount)];
    // Hold the y domain across rebinning. Normalizing each set to its tallest bar changes the meaning.
    const maximum = Math.max(...variants.map(variant => variant.maxCount));
    return _jsxs(Stack, { gap: "md", children: [_jsx(Text, { emphasis: "strong", children: props.label }), _jsx(Stack, { axis: "inline", gap: "sm", wrap: true, children: props.binCounts.map(count => _jsx(Button, { tone: "secondary", selected: count === props.binCount, onPress: () => props.onBinCountChange(count), children: props.binCountLabel(count) }, count)) }), histogram.observed ? _jsx(BarChart, { categories: histogram.bins.map(props.binLabel), series: [{ id: "frequency", label: props.label, values: histogram.bins.map(bin => bin.count) }], accessibilityLabel: props.label, formatValue: props.formatCount, missingLabel: props.missingLabel, domain: [0, maximum], showValues: true }) : _jsx(Text, { align: "center", children: props.missingLabel }), _jsx(Text, { accessibilityLiveRegion: "polite", children: props.summaryLabel(histogram) })] });
}
//# sourceMappingURL=data-workflows.js.map