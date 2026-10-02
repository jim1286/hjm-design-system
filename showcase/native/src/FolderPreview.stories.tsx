import { View } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-native';import{FolderPreview}from'@hjmds/react-native/folder-preview';import{Stack,Text}from'@hjmds/react-native/primitives';
// These slots depict document artwork; readable titles belong in expanded content.
function DocumentPreview(){const {colors}=useHjmNativeTheme();return <View style={{padding:spacing.md,gap:spacing.sm}}>{["75%","100%","60%"].map(width=><View key={width} style={{height:spacing.xs,width:width as `${number}%`,borderRadius:radius.full,backgroundColor:colors.textMuted,opacity:0.45}}/>)}</View>;}
function Preview(){const[open,setOpen]=useState(false);return <FolderPreview label="이번 주 아이디어 · 3개" open={open} onOpenChange={setOpen} previews={['travel','habit','memo'].map(id=><DocumentPreview key={id}/>)}><Stack gap="md"><Text>폴더를 열어 보관한 아이디어를 이어서 살펴보세요.</Text><Text>여행 기록 · 새로운 습관 · 작은 메모</Text></Stack></FolderPreview>;}
const meta={title: "배포/컴포넌트/데이터 표시/폴더 미리보기",component:Preview}satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:'dark'}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:'2'}};
