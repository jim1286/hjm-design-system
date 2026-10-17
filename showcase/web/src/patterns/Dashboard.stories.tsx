import { SegmentedControl } from "@hjmds/react/selection";
import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid, Section, Stack, Surface, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { EmptyState } from "@hjmds/react/feedback";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { ActivityHeatmap } from "@hjmds/react/activity-heatmap";
import { List, ListRow } from "@hjmds/react/display";
import { ScreenLayout } from "@hjmds/react/screens";
import { dashboardPeriods, summarizeDashboard, dashboardDay, dashboardStatMinWidth, dashboardCopy as copy, type DashboardPeriod } from "../../../shared/dashboard-pattern.js";

function Dashboard(){
 const periodControl=useRef<HTMLFieldSetElement>(null);
 // Empty recovery removes its own button; return keyboard users to the selected period.
 const resetPeriod=()=>{setPeriod("month");periodControl.current?.querySelector<HTMLInputElement>('input[value="month"]')?.focus();};
 const[period,setPeriod]=useState<DashboardPeriod>("month");const[list,setList]=useState(false);const data=summarizeDashboard(period);
 // Period selection lives in `notice`, outside the replaceable body, so it survives ScreenLayout loading/empty/error states.
 return <ScreenLayout title={copy.title} description={copy.intro} notice={<SegmentedControl ref={periodControl} label="조회 기간" presentation="pills" items={dashboardPeriods.map(item => ({ value: item.id, label: item.label }))} value={period} onValueChange={value => { const item = dashboardPeriods.find(item => item.id === value); if (item) setPeriod(item.id); }}/>}>
 <Stack gap="xl"><Text role="status">{data.period.start} — {data.period.end}</Text><Surface padding="lg"><Grid columns={{compact:3}} minColumnWidth={{compact:dashboardStatMinWidth}} gap={{compact:"lg"}}><AnimatedStatistic descriptor={{id:"record-count",label:"남긴 기록"}} value={data.count} locale="ko-KR"/><AnimatedStatistic descriptor={{id:"active-days",label:"기록한 날"}} value={data.activeDays} locale="ko-KR"/><AnimatedStatistic descriptor={{id:"record-minutes",label:"머문 시간 (분)"}} value={data.minutes} locale="ko-KR"/></Grid></Surface>
 {data.count?<><Section title={copy.activity} action={<Button tone="ghost" size="small" onClick={()=>setList(value=>!value)}>{list?copy.grid:copy.list}</Button>}><ActivityHeatmap descriptor={data.heatmap} label={copy.activity} formatDay={dashboardDay} view={list?"list":"grid"}/></Section><List label={copy.records}>{data.records.map(item=><ListRow key={item.id} title={item.title} description={`${item.date} · ${item.minutes}분`}/>)}</List></>:<EmptyState title={copy.empty} description={copy.emptyBody} action={<Button onClick={resetPeriod}>{copy.reset}</Button>}/>}
 </Stack></ScreenLayout>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "patterns-dashboard", title: "배포/화면/콘텐츠/대시보드",component:Dashboard} satisfies Meta<typeof Dashboard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
