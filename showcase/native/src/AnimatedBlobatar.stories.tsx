import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-native';import{createAnimatedBlobatarFallback}from'@hjmds/react-native/avatar-blobatar-motion';import{Avatar}from'@hjmds/react-native/data-display';import{Button}from'@hjmds/react-native/actions';import{Stack,Text}from'@hjmds/react-native/primitives';
const poses=['idle','happy','sad','surprised','wink','sleepy','thinking'] as const;
function Preview(){const[index,setIndex]=useState(0);const[active,setActive]=useState(false);return <Stack gap="xl"><Avatar name="미리보기" accessibilityLabel="미리보기" size={96} renderFallback={createAnimatedBlobatarFallback({seed:'hjm-motion-demo',expression:poses[index]!,active})}/><Text>{poses[index]}</Text><Button onPress={()=>setIndex((index+1)%poses.length)}>다음 표정</Button><Button selected={active} onPress={()=>setActive(!active)}>{active?'움직임 멈추기':'움직임 시작'}</Button></Stack>;}
const meta={title: "배포/컴포넌트/데이터 표시/움직이는 블로바타 캐릭터",component:Preview}satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:'dark'}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:'2'}};
