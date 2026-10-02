import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-vite';import{AnimatedStatistic}from'@hjmds/react/statistic-motion';import{Button}from'@hjmds/react/actions';import{Stack}from'@hjmds/react/layout';
function Preview(){const[value,setValue]=useState(1280);return <Stack gap="xl"><AnimatedStatistic descriptor={{id:'weekly-records',label:'이번 주 기록',hint:'로컬 예제 데이터'}} value={value} locale="ko-KR"/><Stack axis="inline" gap="sm"><Button tone="secondary" onClick={()=>setValue(Math.max(0,value-125))}>줄이기</Button><Button onClick={()=>setValue(value+125)}>늘리기</Button></Stack></Stack>;}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "components-display-animated-statistic", title: "배포/컴포넌트/데이터 표시/움직이는 수치",component:Preview}satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:'dark'}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:'2'}};
