import {ScrollView} from "react-native";
import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-native';import{ActivityHeatmap}from'@hjmds/react-native/activity-heatmap';import{Button}from'@hjmds/react-native/actions';import{Stack,Text}from'@hjmds/react-native/primitives';import{activityDescriptor,activityCopy as copy,formatActivity}from'../../shared/activity';
function Preview(){const[list,setList]=useState(false);return <ScrollView><Stack gap="md"><Text>{copy.label}</Text><Text>{copy.hint}</Text><Button tone="ghost" onPress={()=>setList(!list)}>{list?copy.grid:copy.list}</Button><ActivityHeatmap descriptor={activityDescriptor} label={copy.label} formatDay={formatActivity} view={list?'list':'grid'}/></Stack></ScrollView>;}
const meta = { title: "배포/컴포넌트/데이터 표시/활동 히트맵", component: Preview } satisfies Meta<typeof Preview>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
