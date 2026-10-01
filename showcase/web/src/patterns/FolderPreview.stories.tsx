import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-vite';import{FolderPreview}from'@hjmds/react/folder-preview';import{Stack,Text}from'@hjmds/react/layout';
// These slots depict document artwork; readable titles belong in expanded content.
function DocumentPreview(){return <div style={{padding:"var(--hjm-space-md)",display:"grid",gap:"var(--hjm-space-sm)"}}>{["75%","100%","60%"].map(width=><div key={width} style={{height:"var(--hjm-space-xs)",width,borderRadius:"var(--hjm-radius-full)",background:"var(--hjm-color-text-muted)",opacity:0.45}}/>)}</div>;}
function Preview(){const[open,setOpen]=useState(false);return <FolderPreview label="이번 주 아이디어 · 3개" open={open} onOpenChange={setOpen} previews={['travel','habit','memo'].map(id=><DocumentPreview key={id}/>)}><Stack gap="md"><Text>폴더를 열어 보관한 아이디어를 이어서 살펴보세요.</Text><Text>여행 기록 · 새로운 습관 · 작은 메모</Text></Stack></FolderPreview>;}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "components-display-folder-preview", title: "배포/컴포넌트/데이터 표시/폴더 미리보기",component:Preview}satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:'dark'}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:'2'}};
