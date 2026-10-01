import type{Meta,StoryObj}from'@storybook/react-native';import{CodeBlock}from'@hjmds/react-native/code-block';import{Text,Stack}from'@hjmds/react-native/primitives';import{codePreview}from'../../shared/code-preview';
function Preview(){return <Stack gap="md"><Text>코드를 길게 눌러 선택하고 시스템 메뉴에서 복사할 수 있어요.</Text><CodeBlock {...codePreview}/></Stack>;}
export default{title: "배포/컴포넌트/데이터 표시/코드 블록",component:Preview}satisfies Meta<typeof Preview>;export const Default:StoryObj<typeof Preview>={ name: "기본",};export const Wrapped:StoryObj<typeof Preview>={ name: "줄바꿈",render:()=> <CodeBlock {...codePreview} wrap/>};

export const Dark: StoryObj = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj = { name: "큰 글자", globals: { textScale: "2" } };
