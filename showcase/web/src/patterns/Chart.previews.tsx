import { SegmentedControl } from "@hjmds/react/selection";
import { useState, type ReactNode } from "react";
import type { DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { sortDataTableRows, toDataTableSortValue } from "@hjmds/design-contracts/components/data-table";
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart, Sparkline } from "@hjmds/react/chart";
import { DataTable } from "@hjmds/react/data-table";
import { Section, Stack, Text } from "@hjmds/react/layout";
import {
  chartCopy as copy, comparisonSeries, formatCount, formatRate, hitMixSeries, homeRunSeries, months, opsSeries, pitchMix,
  ratingAxes, ratingSeries, scatterPoints, tableColumns, tableRows, teamHomeRuns, teams,
} from "../../../shared/chart-examples";

// Web chart showcase (2026-10-14). Data and copy come from the Web/Native shared fixtures so both
// Storybooks show the same examples; products pass their own series and formatters.

export type ChartKind = "line" | "bar" | "horizontal" | "stacked" | "pie" | "radar" | "scatter" | "sparkline";

function Example({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return <Stack gap="sm"><Text as="p" variant="title" emphasis="medium">{title}</Text>{children}</Stack>;
}

/** Stock-style quote: the header follows the scrubbed month; release returns to the latest one. */
function LineExample() {
  const [focus, setFocus] = useState<number | null>(null);
  const [recent, setRecent] = useState(false);
  const labels = recent ? months.slice(-3) : months;
  const values = opsSeries.map(item => ({ ...item, values: recent ? item.values.slice(-3) : item.values }));
  const index = focus ?? values[0]!.values.length - 1, value = values[0]!.values[index];
  return (
    <Example title={copy.line}>
      <Text as="p" variant="heading">{value == null ? copy.missing : formatRate(value)}</Text>
      <Text as="p" variant="caption" tone="muted">{labels[index]}</Text>
      <SegmentedControl label={copy.period} items={copy.periods} value={recent ? "recent" : "all"} onValueChange={(next) => { setFocus(null); setRecent(next === "recent"); }} />
      <LineChart animateChanges scrubEmphasis="before" categories={labels} series={values} accessibilityLabel={copy.line} formatValue={formatRate} missingLabel={copy.missing}
        referenceValue="first" extremes={{ high: copy.high, low: copy.low }} onFocusChange={(next, { scrubbing }) => setFocus(scrubbing ? next : null)} />
    </Example>
  );
}

function BarExample() {
  const [recent, setRecent] = useState(false);
  const categories = recent ? months.slice(-3) : months;
  const series = homeRunSeries.map(item => ({ ...item, values: recent ? item.values.slice(-3) : item.values }));
  return <Example title={copy.bar}><SegmentedControl label={copy.period} items={copy.periods} value={recent ? "recent" : "all"} onValueChange={(next) => setRecent(next === "recent")} />
    <BarChart animateChanges categories={categories} series={series} showValues accessibilityLabel={copy.bar} formatValue={formatCount} missingLabel={copy.missing} />
  </Example>;
}

function PieExample() {
  const [excluded, setExcluded] = useState<readonly string[]>([]);
  return <PieChart data={pitchMix} accessibilityLabel={copy.pie} formatValue={String} onSelect={() => undefined}
    exclusion={{ excludedIds: excluded, onExcludedIdsChange: setExcluded, label: (datum, included) => `${datum.label} ${included ? "포함" : "제외"}` }}
    centerContent={summary => <Text variant="title">합계 {summary.total}</Text>} />;
}

export function ChartGalleryPreview({ only }: Readonly<{ only?: ChartKind }>) {
  const show = (kind: ChartKind) => only === undefined || only === kind;
  return (
    <Section title="차트" description="눌러서 끌면 값을 따라가고, 키보드 화살표로도 옮길 수 있어요.">
      <Stack gap="xl">
        {show("line") ? <LineExample /> : null}
        {only === "line" ? (
          <Example title={`${copy.line} · 비교`}>
            <LineChart categories={months} series={comparisonSeries} curve="monotone" showAxis accessibilityLabel={copy.line} formatValue={formatRate} missingLabel={copy.missing} />
          </Example>
        ) : null}
        {show("bar") ? <BarExample /> : null}
        {show("horizontal") ? <Example title={copy.horizontal}><BarChart categories={teams} series={teamHomeRuns} orientation="horizontal" showValues accessibilityLabel={copy.horizontal} formatValue={formatCount} missingLabel={copy.missing} /></Example> : null}
        {show("stacked") ? <Example title={copy.stacked}><BarChart categories={months} series={hitMixSeries} layout="stacked" showAxis accessibilityLabel={copy.stacked} formatValue={formatCount} missingLabel={copy.missing} /></Example> : null}
        {show("pie") ? <Example title={copy.pie}><PieExample /></Example> : null}
        {show("radar") ? <Example title={copy.radar}><RadarChart categories={ratingAxes} series={ratingSeries} domain={[0, 100]} accessibilityLabel={copy.radar} formatValue={formatCount} missingLabel={copy.missing} /></Example> : null}
        {show("scatter") ? <Example title={copy.scatter}><ScatterChart points={scatterPoints} xLabel={copy.x} yLabel={copy.y} formatX={formatRate} formatY={formatCount} accessibilityLabel={copy.scatter} /></Example> : null}
        {show("sparkline") ? (
          <Example title={copy.sparkline}>
            <Stack axis="inline" gap="md" align="center"><Sparkline values={opsSeries[0]!.values} /><Text>{formatRate(0.934)}</Text></Stack>
          </Example>
        ) : null}
      </Stack>
    </Section>
  );
}

/** Stat table: pinned player column, highest-first stat columns, product-computed summary row. */
export function StatTablePreview() {
  const [sortState, setSortState] = useState<DataTableSortState<string>>(null);
  const ids = sortDataTableRows(Object.keys(tableRows), sortState, (id, columnId) => toDataTableSortValue(tableRows[id]![columnId]), { locale: "ko" });
  const average = (columnId: string) => {
    const values = Object.values(tableRows).map((row) => toDataTableSortValue(row[columnId])).filter((v): v is number => typeof v === "number");
    if (!values.length) return null;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return columnId === "avg" || columnId === "ops" ? formatRate(mean) : mean.toFixed(1);
  };
  return (
    <Section title={copy.table} description="선수 열은 고정되고 나머지는 옆으로 넘겨 봐요. 기록 열은 높은 순부터 정렬해요.">
      <DataTable
        columns={tableColumns}
        rows={ids.map((id) => ({ id }))}
        labels={{ table: copy.table, selectAll: "", selectRow: (id) => id, sortColumn: (header, state) => copy.sortColumn(header, state) }}
        renderCell={(rowId, columnId) => tableRows[rowId]![columnId]}
        sortState={sortState}
        onSortChange={setSortState}
        summaryRow={(columnId) => columnId === "name" ? copy.total : columnId === "team" ? null : average(columnId)}
      />
    </Section>
  );
}
