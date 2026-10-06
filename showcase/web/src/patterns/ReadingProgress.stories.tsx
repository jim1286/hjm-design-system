import {Button} from '@hjmds/react/actions';
import {useState} from 'react';
import type {Meta,StoryObj} from '@storybook/react-vite';
import {ScrollProgress,useScrollMetrics} from '@hjmds/react/scroll-progress';
import {Stack,Text} from '@hjmds/react/layout';import {Heading} from '@hjmds/react/heading';
import {readingCopy as copy} from '../../../shared/reading-progress';
// Change real content extent: progress is scroll position, never proof that the user read it.
function Reading(){const [summary,setSummary]=useState(false);const [host,setHost]=useState<HTMLDivElement|null>(null);const metrics=useScrollMetrics(host);return <Stack gap="xl"><Heading level="level2">{copy.title}</Heading><ScrollProgress label={copy.label} metrics={metrics}/><Button tone="secondary" onClick={()=>setSummary(value=>!value)}>{summary ? "전체 내용 보기" : "요약만 보기"}</Button><div ref={setHost} tabIndex={0} role="region" aria-label={copy.title} style={{maxHeight:'50vh',overflow:'auto'}}><Stack gap="xl">{summary ? <Text>{copy.body}</Text> : copy.sections.map(title=><section key={title}><Heading level="level3">{title}</Heading>{Array.from({length:5},(_,i)=><Text key={i}>{copy.body}</Text>)}</section>)}</Stack></div></Stack>;}
export default {id: "components-feedback-scroll-progress", title: "배포/컴포넌트/상태와 알림/읽기 진행 표시",component:Reading} satisfies Meta<typeof Reading>;
export const Default:StoryObj<typeof Reading>={ name: "기본",};
export const Dark: StoryObj = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj = { name: "큰 글자", globals: { textScale: "2" } };
