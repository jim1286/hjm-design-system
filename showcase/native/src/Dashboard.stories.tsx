import { PatternStatus } from "./pattern-status";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { EmptyState } from "@hjmds/react-native/feedback";
import { AnimatedStatistic } from "@hjmds/react-native/statistic-motion";
import { ActivityHeatmap } from "@hjmds/react-native/activity-heatmap";
import { List, ListRow } from "@hjmds/react-native/data-display";
import { dashboardPeriods, summarizeDashboard, dashboardDay, dashboardCopy as copy, type DashboardPeriod } from "../../shared/dashboard-pattern";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
function Dashboard(){
 const[period,setPeriod]=useState<DashboardPeriod>("month");const[list,setList]=useState(false);const data=summarizeDashboard(period);
 return <ScrollView contentContainerStyle={{padding:spacing.lg}}><Stack gap="xl"><Text tone="muted">{copy.fixture}</Text><Text variant="heading" accessibilityRole="header">{copy.title}</Text><Text>{copy.intro}</Text><Stack axis="inline" wrap gap="sm">{dashboardPeriods.map(item=><Button key={item.id} tone="ghost" selected={period===item.id} onPress={()=>setPeriod(item.id)}>{item.label}</Button>)}</Stack>
 <PatternStatus>{`${data.period.start} — ${data.period.end}`}</PatternStatus><Surface padding="lg"><Stack gap="lg"><AnimatedStatistic descriptor={{id:"record-count",label:"남긴 기록"}} value={data.count} locale="ko-KR"/><AnimatedStatistic descriptor={{id:"active-days",label:"기록한 날"}} value={data.activeDays} locale="ko-KR"/><AnimatedStatistic descriptor={{id:"record-minutes",label:"머문 시간 (분)"}} value={data.minutes} locale="ko-KR"/></Stack></Surface>
 {data.count?<><Text emphasis="strong">{copy.activity}</Text><Button tone="ghost" onPress={()=>setList(value=>!value)}>{list?copy.grid:copy.list}</Button><ActivityHeatmap descriptor={data.heatmap} label={copy.activity} formatDay={dashboardDay} view={list?"list":"grid"}/><List label={copy.records}>{data.records.map(item=><ListRow key={item.id} title={item.title} description={`${item.date} · ${item.minutes}분`}/>)}</List></>:<EmptyState title={copy.empty} description={copy.emptyBody} action={<Button onPress={()=>setPeriod("month")}>{copy.reset}</Button>}/>}
 </Stack></ScrollView>;
}
const meta={title: "배포/화면/대시보드",component:Dashboard} satisfies Meta<typeof Dashboard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
