import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";
import { Collapsible } from "@hjmds/react/collapsible";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { List, ListRow } from "@hjmds/react/display";
import { landingCopy as copy, normalizeLandingNote } from "../../../shared/landing-pattern";

function Landing(){
 const[open,setOpen]=useState(false);const[draft,setDraft]=useState("");const[error,setError]=useState(false);const[notes,setNotes]=useState([copy.initial]);const[saved,setSaved]=useState(false);
 const start=()=>{setDraft("");setError(false);setSaved(false);setOpen(true);};
 const submit=()=>{try{const note=normalizeLandingNote(draft);setNotes(current=>[note,...current]);setSaved(true);setOpen(false);}catch{setError(true);}};
 return <main><Stack gap="xl"><EffectSurface descriptor={{layers:["mesh","grain"],seed:"landing",active:false}}><Stack gap="lg"><Text tone="muted">{copy.eyebrow}</Text><Heading level="level1">{copy.title}</Heading><Text>{copy.intro}</Text><Button onClick={start}>{copy.cta}</Button></Stack></EffectSurface>
 <Surface padding="lg"><Stack gap="md"><Heading level="level2">{copy.preview}</Heading>{saved?<Text role="status">{copy.saved}</Text>:null}<List label={copy.preview}>{notes.map((note,index)=><ListRow key={index} title={note}/>)}</List></Stack></Surface>
 <Heading level="level2">{copy.featureTitle}</Heading>{copy.features.map(feature=><Surface key={feature.title} padding="lg"><Stack gap="sm"><Heading level="level3">{feature.title}</Heading><Text>{feature.body}</Text></Stack></Surface>)}
 <Heading level="level2">{copy.faqTitle}</Heading>{copy.faqs.map(item=><Collapsible key={item.id} trigger={item.question}><Text>{item.answer}</Text></Collapsible>)}
 <Button onClick={start}>{copy.cta}</Button><Text tone="muted">{copy.scope}</Text>
 <Sheet title={copy.sheetTitle} closeLabel={copy.close} open={open} onOpenChange={setOpen}><Stack gap="lg"><TextField label={copy.field} value={draft} onValueChange={value=>{setDraft(value);setError(false);}} {...(error?{error:copy.error}:{})}/><Button onClick={submit}>{copy.submit}</Button></Stack></Sheet>
 </Stack></main>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "patterns-landing", title: "배포/화면/랜딩 화면",component:Landing} satisfies Meta<typeof Landing>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
