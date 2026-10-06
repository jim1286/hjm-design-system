import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { CodeBlock } from "@hjmds/react/code-block";
import { typographyCopy as copy } from "../../../shared/typography-studio";
function TypographyStudio(){
 const[status,setStatus]=useState<"empty"|"loading"|"ready"|"error">("empty");const[fileName,setFileName]=useState("");const[source,setSource]=useState("");const[license,setLicense]=useState("");
 const[family,setFamily]=useState<string>();const font=useRef<FontFace|null>(null);const sequence=useRef(0);
 const clear=()=>{sequence.current++;if(font.current)document.fonts.delete(font.current);font.current=null;setFamily(undefined);setFileName("");setStatus("empty");};
 useEffect(()=>()=>{sequence.current++;if(font.current)document.fonts.delete(font.current);},[]);
 async function load(file:File){
  clear();const id=sequence.current;setFileName(file.name);setStatus("loading");
  try{
   // ArrayBuffer avoids URL lifetime/CORS issues and never uploads a local font.
   const candidate=new FontFace(`HjmStudio${id}`,await file.arrayBuffer());await candidate.load();
   if(sequence.current!==id)return;document.fonts.add(candidate);font.current=candidate;setFamily(candidate.family);setStatus("ready");
  }catch{if(sequence.current===id)setStatus("error");}
 }
 return <main><Stack gap="xl"><Text variant="heading">{copy.title}</Text><Text>{copy.intro}</Text><label>{copy.file}<input style={{width:"100%",maxWidth:"100%"}} type="file" accept=".woff,.woff2,.ttf,.otf" onChange={event=>{const file=event.target.files?.[0];if(file)void load(file);event.target.value="";}}/></label><Text role="status">{copy[status]}</Text><TextField label={copy.source} value={source} onValueChange={setSource}/><TextField label={copy.license} value={license} onValueChange={setLicense}/>
 {([false,true] as const).map(candidate=><Surface key={String(candidate)} padding="lg"><Stack gap="md"><Text emphasis="strong">{candidate?copy.candidate:copy.fallback}</Text><Text variant="heading" style={candidate&&family?{fontFamily:`"${family}", system-ui, sans-serif`}:{}}>{copy.sample}</Text><Text style={candidate&&family?{fontFamily:`"${family}", system-ui, sans-serif`}:{}}>{copy.body}</Text><Text emphasis="strong" style={candidate&&family?{fontFamily:`"${family}", system-ui, sans-serif`}:{}}>{copy.body}</Text></Stack></Surface>)}
 <Button onClick={clear}>{copy.reset}</Button><Text tone="muted">{copy.scope}</Text><CodeBlock label="서체 후보 설정" code={JSON.stringify({fileName,source,license,status,fallback:"system-ui, sans-serif"},null,2)} wrap/>
 </Stack></main>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "foundations-typography-studio", title: "배포/토큰/편집 도구/글꼴 편집",component:TypographyStudio} satisfies Meta<typeof TypographyStudio>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
