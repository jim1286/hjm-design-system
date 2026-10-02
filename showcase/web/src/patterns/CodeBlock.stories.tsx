import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-vite';import{CodeBlock}from'@hjmds/react/code-block';import{ClipboardButton}from'@hjmds/react/clipboard';import{codePreview}from'../../../shared/code-preview';
function Preview(){const[error,setError]=useState(false);return <><CodeBlock {...codePreview} copyAction={<ClipboardButton value={codePreview.code} labels={{idle:'복사',copied:'복사했어요'}} onCopy={()=>setError(false)} onCopyError={()=>setError(true)}/>}/>{error?<p role="alert">복사하지 못했어요. 코드를 선택해 직접 복사해 주세요.</p>:null}</>;}
export default{id: "components-display-code-block", title: "배포/컴포넌트/데이터 표시/코드 블록",component:Preview}satisfies Meta<typeof Preview>;export const Default:StoryObj<typeof Preview>={ name: "기본",};

export const Dark: StoryObj = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj = { name: "큰 글자", globals: { textScale: "2" } };
