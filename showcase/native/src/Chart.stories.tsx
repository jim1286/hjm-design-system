import { SegmentedControl } from "@hjmds/react-native/inputs";
import { useState } from "react";
import { ScrollView } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart, Sparkline } from "@hjmds/react-native/chart";
import { Section, Stack, Text } from "@hjmds/react-native/primitives";
import {
  chartCopy as copy, comparisonSeries, formatCount, formatRate, hitMixSeries, homeRunSeries, months, opsSeries, pitchMix,
  ratingAxes, ratingSeries, scatterPoints, teamHomeRuns, teams,
} from "../../shared/chart-examples";

function Example({ title, children }: { title: string; children: React.ReactNode }) {
  return <Stack gap="sm"><Text variant="title" emphasis="medium">{title}</Text>{children}</Stack>;
}

/** Stock-style quote: the header follows the scrubbed month, release returns to the latest one. */
function LineExample() {
  const [focus, setFocus] = useState<number | null>(null);
  const [recent, setRecent] = useState(false);
  const labels = recent ? months.slice(-3) : months;
  const values = opsSeries.map(item => ({ ...item, values: recent ? item.values.slice(-3) : item.values }));
  const index = focus ?? values[0]!.values.length - 1, value = values[0]!.values[index];
  return <Example title={copy.line}>
    <Text variant="heading">{value == null ? copy.missing : formatRate(value)}</Text>
    <Text variant="caption" tone="muted">{labels[index]}</Text>
    <SegmentedControl label={copy.period} items={copy.periods} value={recent ? "recent" : "all"} onValueChange={(next) => { setFocus(null); setRecent(next === "recent"); }} />
    <LineChart animateChanges scrubEmphasis="before" categories={labels} series={values} accessibilityLabel={copy.line} formatValue={formatRate} missingLabel={copy.missing} referenceValue="first" extremes={{ high: copy.high, low: copy.low }} onFocusChange={(next, { scrubbing }) => setFocus(scrubbing ? next : null)} />
  </Example>;
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

function Gallery({ only }: { only?: "line" | "bar" | "horizontal" | "stacked" | "pie" | "radar" | "scatter" | "sparkline" }) {
  const show = (kind: typeof only) => only === undefined || only === kind;
  return <ScrollView><Section title="차트" description="눌러서 끌면 값을 따라가고, 키보드 화살표로도 옮길 수 있어요."><Stack gap="xl">
    {show("line") && <LineExample />}
    {show("line") && only === "line" && <Example title={`${copy.line} · 비교`}><LineChart categories={months} series={comparisonSeries} curve="monotone" showAxis accessibilityLabel={copy.line} formatValue={formatRate} missingLabel={copy.missing} /></Example>}
    {show("bar") && <BarExample />}
    {show("horizontal") && <Example title={copy.horizontal}><BarChart categories={teams} series={teamHomeRuns} orientation="horizontal" showValues accessibilityLabel={copy.horizontal} formatValue={formatCount} missingLabel={copy.missing} /></Example>}
    {show("stacked") && <Example title={copy.stacked}><BarChart categories={months} series={hitMixSeries} layout="stacked" showAxis accessibilityLabel={copy.stacked} formatValue={formatCount} missingLabel={copy.missing} /></Example>}
    {show("pie") && <Example title={copy.pie}><PieExample /></Example>}
    {show("radar") && <Example title={copy.radar}><RadarChart categories={ratingAxes} series={ratingSeries} domain={[0, 100]} accessibilityLabel={copy.radar} formatValue={formatCount} missingLabel={copy.missing} /></Example>}
    {show("scatter") && <Example title={copy.scatter}><ScatterChart points={scatterPoints} xLabel={copy.x} yLabel={copy.y} formatX={formatRate} formatY={formatCount} accessibilityLabel={copy.scatter} /></Example>}
    {show("sparkline") && <Example title={copy.sparkline}><Stack axis="inline" gap="md" align="center"><Sparkline values={opsSeries[0]!.values} /><Text>{formatRate(0.934)}</Text></Stack></Example>}
  </Stack></Section></ScrollView>;
}

const meta = { title: "배포/컴포넌트/데이터 표시/차트", component: Gallery } satisfies Meta<typeof Gallery>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Line: Story = { name: "꺾은선", args: { only: "line" } };
export const Bar: Story = { name: "막대", args: { only: "bar" } };
export const HorizontalBar: Story = { name: "가로 막대", args: { only: "horizontal" } };
export const StackedBar: Story = { name: "누적 막대", args: { only: "stacked" } };
export const Pie: Story = { name: "파이", args: { only: "pie" } };
export const Radar: Story = { name: "레이더", args: { only: "radar" } };
export const Scatter: Story = { name: "산점도", args: { only: "scatter" } };
export const SparklineStory: Story = { name: "스파크라인", args: { only: "sparkline" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };

import { ChartLegend } from "@hjmds/react-native/chart";
// ChartLegend layout="inline" (2026-10-23): a one-line key that wraps, e.g. under a map (Choose-window).
export const InlineLegend: Story = { name: "한 줄 범례", render: () => <ChartLegend layout="inline"
  items={[{ id: "left", label: "왼쪽 햇빛", color: "#f59e0b" }, { id: "right", label: "오른쪽 햇빛", color: "#3b82f6" }, { id: "none", label: "그늘", color: "#94a3b8" }]} /> };
