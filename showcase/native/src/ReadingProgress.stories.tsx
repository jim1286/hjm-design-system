import {SegmentedControl} from '@hjmds/react-native/inputs';
import {useState} from 'react';import {ScrollView} from 'react-native';
import type {Meta,StoryObj} from '@storybook/react-native';
import {ScrollProgress} from '@hjmds/react-native/scroll-progress';
import {Stack,Text} from '@hjmds/react-native/primitives';import {Heading} from '@hjmds/react-native/heading';
import {readingCopy as copy,type ReadingView} from '../../shared/reading-progress';
// Change real content extent: progress is scroll position, never proof that the user read it.
function Reading(){const [view,setView]=useState<ReadingView>('full');const summary=view==='summary';const [metrics,setMetrics]=useState({offset:0,contentSize:0,viewportSize:0});return <Stack gap="xl"><Heading level="level2">{copy.title}</Heading><ScrollProgress label={copy.label} metrics={metrics}/><SegmentedControl label={copy.view.label} items={copy.view.items} value={view} onValueChange={setView}/><ScrollView style={{height:360}} accessibilityLabel={copy.title} scrollEventThrottle={32} onLayout={event=>{const viewportSize=event.nativeEvent.layout.height;setMetrics(old=>({...old,viewportSize}));}} onContentSizeChange={(_,contentSize)=>setMetrics(old=>({...old,contentSize}))} onScroll={event=>{const offset=event.nativeEvent.contentOffset.y;setMetrics(old=>({...old,offset}));}}><Stack gap="xl">{summary ? <Text>{copy.body}</Text> : copy.sections.map(title=><Stack key={title} gap="sm"><Heading level="level3">{title}</Heading>{Array.from({length:5},(_,i)=><Text key={i}>{copy.body}</Text>)}</Stack>)}</Stack></ScrollView></Stack>;}
export default {title: "배포/컴포넌트/상태와 알림/읽기 진행 표시",component:Reading} satisfies Meta<typeof Reading>;
export const Default:StoryObj<typeof Reading>={ name: "기본",};

export const Dark: StoryObj = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj = { name: "큰 글자", globals: { textScale: "2" } };
