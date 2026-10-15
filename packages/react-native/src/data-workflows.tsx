"use client";
import { useState } from "react";
import { binHistogram, resolveCohorts, resolveFunnel, resolveImportMapping, resolveTarget, validateCorrelation, type Cohort, type CorrelationData, type FunnelStage, type HistogramBin, type ImportMapping, type WorkflowField } from "@hjmds/design-contracts/data-workflows";
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
const labelsFor = (label: string) => ({ table: label, selectAll: label, selectRow: (id: string) => id, sortColumn: (header: string) => header });

export type ImportFieldMappingProps = Readonly<{
  label: string; sources: readonly WorkflowField[]; targets: readonly WorkflowField[]; mapping: ImportMapping;
  onMappingChange: (mapping: ImportMapping) => void; onImport: (mapping: ImportMapping) => void | Promise<void>;
  importLabel: string; dismissLabel: string; skipLabel: string; errorLabel: string; disabled?: boolean;
  validationLabel: (state: ReturnType<typeof resolveImportMapping>) => string;
  previewRows?: readonly Readonly<{ id: string; values: Readonly<Record<string, string>> }>[];
}>;
export function ImportFieldMapping(props: ImportFieldMappingProps) {
  const action = useCompositionAction(props.disabled), resolved = resolveImportMapping(props.sources, props.targets, props.mapping);
  const locked = props.disabled === true || action.pending, rows = props.previewRows ?? [];
  assertDistinctIds(rows);
  const pairs = props.targets.flatMap(target => { const source = props.sources.find(source => props.mapping[source.id] === target.id); return source ? [{ source, target }] : []; });
  return <Stack gap="md"><Text emphasis="strong">{props.label}</Text>
    {props.sources.map(source => <Select key={source.id} label={source.label} placeholder={props.skipLabel} dismissLabel={props.dismissLabel} disabled={locked}
      items={[{ id: resolved.skipKey, label: props.skipLabel, textValue: props.skipLabel }, ...props.targets.map(target => ({ id: target.id, label: target.label, textValue: target.label }))]} selectedKey={props.mapping[source.id] ?? resolved.skipKey}
      onSelectionChange={key => { if (!locked) props.onMappingChange({ ...props.mapping, [source.id]: key === resolved.skipKey ? null : key }); }} />)}
    {!resolved.valid ? <Text accessibilityLiveRegion="polite" align="center">{props.validationLabel(resolved)}</Text> : null}
    {resolved.valid && rows.length ? <DataTable columns={pairs.map(pair => ({ id: pair.target.id, header: pair.target.label }))} rows={rows.map(row => ({ id: row.id }))}
      labels={labelsFor(props.label)} renderCell={(id, column) => rows.find(row => row.id === id)?.values[pairs.find(pair => pair.target.id === column)!.source.id] ?? ""} /> : null}
    <Button loading={action.pending} disabled={props.disabled === true || !resolved.valid} onPress={() => { if (resolved.valid) void action.run("import", () => props.onImport(resolved.mapping)); }}>{props.importLabel}</Button>
    {action.failed ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" tone="danger" align="center">{props.errorLabel}</Text> : null}
  </Stack>;
}

export type ConversionFunnelProps = Readonly<{
  label: string; stages: readonly FunnelStage[]; formatCount: (count: number) => string; missingLabel: string;
  detailLabel: (stage: ReturnType<typeof resolveFunnel>[number]) => string;
}>;
export function ConversionFunnel(props: ConversionFunnelProps) {
  const stages = resolveFunnel(props.stages), [chosen, setChosen] = useState<string | null>(null);
  const selected = Math.max(0, stages.findIndex(stage => stage.id === chosen));
  return <Stack gap="md"><Text emphasis="strong">{props.label}</Text>
    {stages.length ? <><BarChart categories={stages.map(stage => stage.label)} series={[{ id: "count", label: props.label, values: stages.map(stage => stage.count) }]}
      accessibilityLabel={props.label} formatValue={props.formatCount} missingLabel={props.missingLabel} orientation="horizontal" focusIndex={selected}
      onFocusChange={index => { if (index !== null && stages[index]) setChosen(stages[index]!.id); }} />
      <Stack axis="inline" gap="sm" wrap>{stages.map(stage => <Button key={stage.id} tone="ghost" selected={stages[selected]!.id === stage.id} onPress={() => setChosen(stage.id)}>{stage.label}</Button>)}</Stack>
      <Text accessibilityLiveRegion="polite">{props.detailLabel(stages[selected]!)}</Text></> : <Text align="center">{props.missingLabel}</Text>}
  </Stack>;
}

export type CohortRetentionTableProps = Readonly<{
  label: string; cohorts: readonly Cohort[]; periods: readonly string[]; cohortColumnLabel: string;
  formatRate: (rate: number, retained: number, size: number) => string; missingLabel: string;
}>;
export function CohortRetentionTable(props: CohortRetentionTableProps) {
  const rows = resolveCohorts(props.cohorts, props.periods.length);
  const color = useHjmNativeTheme().environment.theme;
  // MatrixTable intentionally suppresses its diagonal for head-to-head teams. Cohort data is rectangular.
  return <DataTable columns={[{ id: "label", header: props.cohortColumnLabel, pinned: "start" as const }, ...props.periods.map((header, index) => ({ id: `p-${index}`, header }))]}
    rows={rows.map(row => ({ id: row.id }))} labels={labelsFor(props.label)}
    heatColors={{ high: resolveDatavizSeriesColor(color, 0), low: resolveDatavizSeriesColor(color, 1) }}
    cellStyle={(rowId, column) => { const rate = rows.find(row => row.id === rowId)!.rates[Number(column.slice(2))]; return typeof rate === "number" && rate > 0 ? { heat: { side: "high", strength: rate >= .7 ? 3 : rate >= .35 ? 2 : 1 } } : null; }}
    renderCell={(rowId, column) => { const row = rows.find(row => row.id === rowId)!; if (column === "label") return row.label; const index = Number(column.slice(2)), rate = row.rates[index]; return rate === null || rate === undefined ? props.missingLabel : props.formatRate(rate, row.retained[index]!, row.size); }} />;
}

export type CorrelationMatrixProps = Readonly<{ label: string; data: CorrelationData; variableColumnLabel: string; formatValue: (value: number) => string; missingLabel: string }>;
export function CorrelationMatrix(props: CorrelationMatrixProps) {
  validateCorrelation(props.data);
  const color = useHjmNativeTheme().environment.theme;
  const valueOf = (row: string, column: string) => props.data.values[props.data.variables.findIndex(variable => variable.id === row)]![Number(column.slice(2))];
  return <DataTable columns={[{ id: "label", header: props.variableColumnLabel, pinned: "start" as const }, ...props.data.variables.map((variable, index) => ({ id: `v-${index}`, header: variable.label }))]}
    rows={props.data.variables.map(variable => ({ id: variable.id }))} labels={labelsFor(props.label)}
    heatColors={{ high: resolveDatavizSeriesColor(color, 0), low: resolveDatavizSeriesColor(color, 1) }}
    cellStyle={(row, column) => { if (column === "label") return null; const value = valueOf(row, column); return value === null || value === undefined || value === 0 ? null : { heat: { side: value > 0 ? "high" : "low", strength: Math.abs(value) >= .7 ? 3 : Math.abs(value) >= .35 ? 2 : 1 } }; }}
    renderCell={(row, column) => { if (column === "label") return props.data.variables.find(variable => variable.id === row)!.label; const value = valueOf(row, column); return value === null || value === undefined ? props.missingLabel : props.formatValue(value); }} />;
}

export type TargetSummaryProps = Readonly<{ label: string; actual: number; target: number; formatActual: (actual: number) => string; summaryLabel: (summary: ReturnType<typeof resolveTarget>) => string }>;
export function TargetSummary(props: TargetSummaryProps) {
  const summary = resolveTarget(props.actual, props.target), label = props.summaryLabel(summary);
  return <Stack gap="sm"><Statistic descriptor={{ id: "target-summary", label: props.label, value: props.formatActual(summary.actual), hint: label }} />
    {summary.progress === null ? null : <Progress label={props.label} value={summary.progress} max={1} valueText={label} />}
  </Stack>;
}

export type HistogramExplorerProps = Readonly<{
  label: string; samples: readonly (number | null)[]; binCounts: readonly number[]; binCount: number; onBinCountChange: (count: number) => void;
  domain?: readonly [number, number]; binLabel: (bin: HistogramBin) => string; binCountLabel: (count: number) => string;
  formatCount: (count: number) => string; missingLabel: string; summaryLabel: (histogram: ReturnType<typeof binHistogram>) => string;
}>;
export function HistogramExplorer(props: HistogramExplorerProps) {
  if (!props.binCounts.length || !props.binCounts.includes(props.binCount) || new Set(props.binCounts).size !== props.binCounts.length) throw new RangeError("Histogram requires distinct choices including the selected bin count");
  const variants = props.binCounts.map(count => binHistogram(props.samples, count, props.domain)), histogram = variants[props.binCounts.indexOf(props.binCount)]!;
  // Hold the y domain across rebinning. Normalizing each set to its tallest bar changes the meaning.
  const maximum = Math.max(...variants.map(variant => variant.maxCount));
  return <Stack gap="md"><Text emphasis="strong">{props.label}</Text><Stack axis="inline" gap="sm" wrap>{props.binCounts.map(count => <Button key={count} tone="secondary" selected={count === props.binCount} onPress={() => props.onBinCountChange(count)}>{props.binCountLabel(count)}</Button>)}</Stack>
    {histogram.observed ? <BarChart categories={histogram.bins.map(props.binLabel)} series={[{ id: "frequency", label: props.label, values: histogram.bins.map(bin => bin.count) }]}
      accessibilityLabel={props.label} formatValue={props.formatCount} missingLabel={props.missingLabel} domain={[0, maximum]} showValues /> : <Text align="center">{props.missingLabel}</Text>}
    <Text accessibilityLiveRegion="polite">{props.summaryLabel(histogram)}</Text>
  </Stack>;
}
