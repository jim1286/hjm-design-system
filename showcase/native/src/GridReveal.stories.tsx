import{useState}from"react";import type{Meta,StoryObj}from"@storybook/react-native";
import{GridReveal}from"@hjmds/react-native/grid-reveal";import{Image}from"@hjmds/react-native/data-display";import{Stack,Text}from"@hjmds/react-native/primitives";import{PreviewTools,PreviewToolButton}from"./preview-tools";import{revealImage}from"../../shared/grid-reveal";
// Replay and failure are demo-only tools, not product actions (2026-10-17 review F9).
function Preview(){const[ready,setReady]=useState(false);const[failed,setFailed]=useState(false);const[attempt,setAttempt]=useState(0);const reload=(broken:boolean)=>{setReady(false);setFailed(broken);setAttempt(value=>value+1);};return <Stack gap="lg"><GridReveal ready={ready}><Image key={attempt} src={failed?"data:image/png;base64,invalid":revealImage} width={320} height={200} decorative={false} accessibilityLabel="햇살과 겹친 산 능선" onLoadStatusChange={status=>setReady(status==="loaded")} fallback={<Text>이미지를 불러오지 못했어요.</Text>}/></GridReveal><PreviewTools><PreviewToolButton onPress={()=>reload(false)}>다시 보기</PreviewToolButton><PreviewToolButton onPress={()=>reload(true)}>이미지 오류 보기</PreviewToolButton></PreviewTools></Stack>;}
const meta={title: "배포/컴포넌트/시각 효과/격자 등장 효과",component:Preview}satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
