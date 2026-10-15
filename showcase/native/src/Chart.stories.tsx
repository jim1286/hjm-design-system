import { useState } from "react";
import { ScrollView } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart, Sparkline } from "@hjmds/react-native/chart";
import { Stack, Text } from "@hjmds/react-native/primitives";
import {
  chartCopy as copy, comparisonSeries, formatCount, formatRate, hitMixSeries, homeRunSeries, months, opsSeries, pitchMix,
  ratingAxes, ratingSeries, scatterPoints, teamHomeRuns, teams,
} from "../../shared/chart-examples";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Stack gap="sm"><Text variant="title">{title}</Text>{children}</Stack>;
}

/** Stock-style quote: the header follows the scrubbed month, release returns to the latest one. */
function LineExample() {
  const [focus, setFocus] = useState<number | null>(null);
  const index = focus ?? opsSeries[0]!.values.length - 1, value = opsSeries[0]!.values[index];
  return <Section title={copy.line}>
    <Text variant="heading">{value == null ? copy.missing : formatRate(value)}</Text>
    <Text variant="caption" tone="muted">{months[index]}</Text>
    <LineChart categories={months} series={opsSeries} accessibilityLabel={copy.line} formatValue={formatRate} missingLabel={copy.missing} referenceValue="first" extremes={{ high: copy.high, low: copy.low }} onFocusChange={(next, { scrubbing }) => setFocus(scrubbing ? next : null)} />
  </Section>;
}

function PieExample() {
  const [excluded, setExcluded] = useState<readonly string[]>([]);
  return <PieChart data={pitchMix} accessibilityLabel={copy.pie} formatValue={String} onSelect={() => undefined}
    exclusion={{ excludedIds: excluded, onExcludedIdsChange: setExcluded, label: (datum, included) => `${datum.label} ${included ? "포함" : "제외"}` }}
    centerContent={summary => <Text variant="title">합계 {summary.total}</Text>} />;
}

function Gallery({ only }: { only?: "line" | "bar" | "horizontal" | "stacked" | "pie" | "radar" | "scatter" | "sparkline" }) {
  const show = (kind: typeof only) => only === undefined || only === kind;
  return <ScrollView><Stack gap="xl">
    {show("line") && <LineExample />}
    {show("line") && only === "line" && <Section title={`${copy.line} · 비교`}><LineChart categories={months} series={comparisonSeries} curve="monotone" showAxis accessibilityLabel={copy.line} formatValue={formatRate} missingLabel={copy.missing} /></Section>}
    {show("bar") && <Section title={copy.bar}><BarChart categories={months} series={homeRunSeries} showValues accessibilityLabel={copy.bar} formatValue={formatCount} missingLabel={copy.missing} /></Section>}
    {show("horizontal") && <Section title={copy.horizontal}><BarChart categories={teams} series={teamHomeRuns} orientation="horizontal" showValues accessibilityLabel={copy.horizontal} formatValue={formatCount} missingLabel={copy.missing} /></Section>}
    {show("stacked") && <Section title={copy.stacked}><BarChart categories={months} series={hitMixSeries} layout="stacked" showAxis accessibilityLabel={copy.stacked} formatValue={formatCount} missingLabel={copy.missing} /></Section>}
    {show("pie") && <Section title={copy.pie}><PieExample /></Section>}
    {show("radar") && <Section title={copy.radar}><RadarChart categories={ratingAxes} series={ratingSeries} domain={[0, 100]} accessibilityLabel={copy.radar} formatValue={formatCount} missingLabel={copy.missing} /></Section>}
    {show("scatter") && <Section title={copy.scatter}><ScatterChart points={scatterPoints} xLabel={copy.x} yLabel={copy.y} formatX={formatRate} formatY={formatCount} accessibilityLabel={copy.scatter} /></Section>}
    {show("sparkline") && <Section title={copy.sparkline}><Stack axis="inline" gap="md" align="center"><Sparkline values={opsSeries[0]!.values} /><Text>{formatRate(0.934)}</Text></Stack></Section>}
  </Stack></ScrollView>;
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
