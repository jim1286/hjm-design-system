import {ScrollView} from "react-native";
import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-native';import{ActivityHeatmap}from'@hjmds/react-native/activity-heatmap';import{SegmentedControl}from'@hjmds/react-native/inputs';import{Stack,Text}from'@hjmds/react-native/primitives';import{activityDescriptor,activityCopy as copy,formatActivity}from'../../shared/activity';
function Preview(){const[view,setView]=useState<'grid'|'list'>('grid');return <ScrollView><Stack gap="md"><Stack gap="xxs"><Text accessibilityRole="header" variant="title" emphasis="medium">{copy.label}</Text><Text tone="muted">{copy.hint}</Text></Stack><SegmentedControl label={copy.view} items={copy.views} value={view} onValueChange={next=>setView(next==='list'?'list':'grid')}/><ActivityHeatmap descriptor={activityDescriptor} label={copy.label} formatDay={formatActivity} view={view}/></Stack></ScrollView>;}
const meta = { title: "배포/컴포넌트/데이터 표시/활동 히트맵", component: Preview } satisfies Meta<typeof Preview>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
