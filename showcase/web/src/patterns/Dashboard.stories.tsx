import { SegmentedControl } from "@hjmds/react/selection";
import { Heading } from "@hjmds/react/heading";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { EmptyState } from "@hjmds/react/feedback";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { ActivityHeatmap } from "@hjmds/react/activity-heatmap";
import { List, ListRow } from "@hjmds/react/display";
import { dashboardPeriods, summarizeDashboard, dashboardDay, dashboardCopy as copy, type DashboardPeriod } from "../../../shared/dashboard-pattern";

function Dashboard(){
 const[period,setPeriod]=useState<DashboardPeriod>("month");const[list,setList]=useState(false);const data=summarizeDashboard(period);
 return <main><Container gutter="compact"><Stack gap="xl"><Text tone="muted">{copy.fixture}</Text><Heading level="level3" semanticLevel={1}  >{copy.title}</Heading><Text as="p">{copy.intro}</Text><SegmentedControl label="조회 기간" presentation="pills" items={dashboardPeriods.map(item => ({ value: item.id, label: item.label }))} value={period} onValueChange={value => { const item = dashboardPeriods.find(item => item.id === value); if (item) setPeriod(item.id); }}/>
 <Text role="status">{data.period.start} — {data.period.end}</Text><Surface padding="lg"><Stack gap="lg"><AnimatedStatistic descriptor={{id:"record-count",label:"남긴 기록"}} value={data.count} locale="ko-KR"/><AnimatedStatistic descriptor={{id:"active-days",label:"기록한 날"}} value={data.activeDays} locale="ko-KR"/><AnimatedStatistic descriptor={{id:"record-minutes",label:"머문 시간 (분)"}} value={data.minutes} locale="ko-KR"/></Stack></Surface>
 {data.count?<><Text emphasis="strong">{copy.activity}</Text><Button tone="ghost" onClick={()=>setList(value=>!value)}>{list?copy.grid:copy.list}</Button><ActivityHeatmap descriptor={data.heatmap} label={copy.activity} formatDay={dashboardDay} view={list?"list":"grid"}/><List label={copy.records}>{data.records.map(item=><ListRow key={item.id} title={item.title} description={`${item.date} · ${item.minutes}분`}/>)}</List></>:<EmptyState title={copy.empty} description={copy.emptyBody} action={<Button onClick={()=>setPeriod("month")}>{copy.reset}</Button>}/>}
 </Stack></Container></main>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "patterns-dashboard", title: "배포/화면/콘텐츠/대시보드",component:Dashboard} satisfies Meta<typeof Dashboard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
