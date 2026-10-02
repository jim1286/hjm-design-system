import { ThemeSample } from "./theme-sample";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HjmProvider } from "@hjmds/react/provider";
import { Stack, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { CodeBlock } from "@hjmds/react/code-block";
import { THEMES, type ResolvedTheme } from "@hjmds/design-contracts/colors";
import { studioCopy as copy, studioRoles } from "../../../shared/theme-studio";
import { studioReport, applyStudioColor, exportStudioPalette, type StudioPalette } from "@hjmds/design-contracts/theme-studio";

function Editor({theme,role,value,onApply}:{theme:ResolvedTheme;role:typeof studioRoles[number];value:string;onApply:(color:string)=>void}){
 const[draft,setDraft]=useState(value);const[error,setError]=useState<string>();
 return <Stack gap="sm"><TextField label={`${theme} · ${role.label}`} value={draft} onValueChange={setDraft} {...(error?{error}: {})}/><Button tone="ghost" onClick={()=>{try{onApply(draft);setError(undefined);}catch(error){setError("#으로 시작하는 여섯 자리 색상 코드를 입력해 주세요.");}}}>{copy.apply}</Button></Stack>;
}
function ThemeStudio(){
 const[palette,setPalette]=useState<StudioPalette>({});const[revision,setRevision]=useState(0);const[exportError,setExportError]=useState(false);
 async function save(){try{const blob=new Blob([exportStudioPalette(palette)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="hjm-brand-palette.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); setExportError(false);}catch{setExportError(true);}}
 return <main><Stack gap="xl"><Text variant="heading">{copy.title}</Text><Text>{copy.intro}</Text>
 {(["light","dark"] as const).map(theme=><Stack gap="lg" key={theme}><Text emphasis="strong">{theme === "light" ? "밝은 테마" : "어두운 테마"}</Text>
 {studioRoles.map(role=><Editor key={`${revision}-${role.key}`} theme={theme} role={role} value={palette[theme]?.[role.key]??THEMES[theme][role.key]} onApply={color=>setPalette(current=>applyStudioColor(current,theme,role.key,color))}/>)}
 <HjmProvider theme={theme} brandPalette={palette}><ThemeSample/></HjmProvider>
 <Text emphasis="strong">{copy.report}</Text>{studioReport(palette,theme).map(row=><Text key={`${row.foreground}-${row.background}`}>{row.pass?"통과":"미달"} · {row.foreground} / {row.background} · {row.ratio.toFixed(2)}:1 (기준 {row.minimum}:1)</Text>)}
 </Stack>)}<Text tone="muted">{copy.note}</Text><Button onClick={()=>{setPalette({});setRevision(value=>value+1);}}>{copy.reset}</Button><Button onClick={()=>void save()}>{copy.export}</Button>{exportError?<Text>{copy.failedExport}</Text>:null}<CodeBlock label="브랜드 팔레트 설정" code={exportStudioPalette(palette)} language="json" wrap/>
 </Stack></main>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "foundations-theme-studio", title: "배포/토큰/테마 편집",component:ThemeStudio} satisfies Meta<typeof ThemeStudio>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
