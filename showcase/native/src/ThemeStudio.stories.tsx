import { ThemeSample } from "./theme-sample";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { CodeBlock } from "@hjmds/react-native/code-block";
import { THEMES, type ResolvedTheme } from "@hjmds/design-contracts/colors";
import { studioCopy as copy, studioRoles } from "../../shared/theme-studio";
import { studioReport, applyStudioColor, exportStudioPalette, type StudioPalette } from "@hjmds/design-contracts/theme-studio";
import { ScrollView, Share } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
function Editor({theme,role,value,onApply}:{theme:ResolvedTheme;role:typeof studioRoles[number];value:string;onApply:(color:string)=>void}){
 const[draft,setDraft]=useState(value);const[error,setError]=useState<string>();
 return <Stack gap="sm"><TextField label={`${theme} · ${role.label}`} value={draft} onValueChange={setDraft} {...(error?{error}: {})}/><Button tone="ghost" onPress={()=>{try{onApply(draft);setError(undefined);}catch(error){setError("#으로 시작하는 여섯 자리 색상 코드를 입력해 주세요.");}}}>{copy.apply}</Button></Stack>;
}
function ThemeStudio(){
 const[palette,setPalette]=useState<StudioPalette>({});const[revision,setRevision]=useState(0);const[exportError,setExportError]=useState(false);
 async function save(){try{await Share.share({message:exportStudioPalette(palette)}); setExportError(false);}catch{setExportError(true);}}
 // Both studios edit text before an action; keep controls reachable above the iOS keyboard,
  // especially at 200% text size, instead of requiring an unavailable number-pad dismiss key.
  return <ScrollView automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{padding:spacing.lg}}><Stack gap="xl"><Text variant="heading">{copy.title}</Text><Text>{copy.intro}</Text>
 {(["light","dark"] as const).map(theme=><Stack gap="lg" key={theme}><Text emphasis="strong">{theme === "light" ? "밝은 테마" : "어두운 테마"}</Text>
 {studioRoles.map(role=><Editor key={`${revision}-${role.key}`} theme={theme} role={role} value={palette[theme]?.[role.key]??THEMES[theme][role.key]} onApply={color=>setPalette(current=>applyStudioColor(current,theme,role.key,color))}/>)}
 <HjmNativeProvider theme={theme} brandPalette={palette}><ThemeSample/></HjmNativeProvider>
 <Text emphasis="strong">{copy.report}</Text>{studioReport(palette,theme).map(row=><Text key={`${row.foreground}-${row.background}`}>{row.pass?"통과":"미달"} · {row.foreground} / {row.background} · {row.ratio.toFixed(2)}:1 (기준 {row.minimum}:1)</Text>)}
 </Stack>)}<Text tone="muted">{copy.note}</Text><Button onPress={()=>{setPalette({});setRevision(value=>value+1);}}>{copy.reset}</Button><Button onPress={()=>void save()}>{copy.export}</Button>{exportError?<Text>{copy.failedExport}</Text>:null}<CodeBlock label="브랜드 팔레트 설정" code={exportStudioPalette(palette)} language="json" wrap/>
 </Stack></ScrollView>;
}
const meta={title: "배포/토큰/편집 도구/테마 편집",component:ThemeStudio} satisfies Meta<typeof ThemeStudio>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
