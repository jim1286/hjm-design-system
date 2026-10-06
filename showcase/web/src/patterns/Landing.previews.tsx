import { useRef, useState } from "react";
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";
import { Collapsible } from "@hjmds/react/collapsible";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { List, ListRow } from "@hjmds/react/display";
import { ServiceIntroduction } from "./reference-flow-previews";
import { landingCopy as copy, normalizeLandingNote } from "../../../shared/landing-pattern";

function Landing(){
 const[open,setOpen]=useState(false);const[draft,setDraft]=useState("");const[error,setError]=useState(false);const[notes,setNotes]=useState([{ id: 0, text: copy.initial }]);const[saved,setSaved]=useState(false);
 const nextId=useRef(1);
 const start=()=>{setDraft("");setError(false);setSaved(false);setOpen(true);};
 const submit=()=>{try{const note=normalizeLandingNote(draft);setNotes(current=>[{ id: nextId.current++, text: note },...current]);setSaved(true);setOpen(false);}catch{setError(true);}};
 return <main><Container><Stack gap="xl"><EffectSurface descriptor={{layers:["mesh","grain"],seed:"landing",active:false}}><Surface padding="xl"><Stack gap="lg"><Text tone="muted">{copy.eyebrow}</Text><Heading level="level1">{copy.title}</Heading><Text>{copy.intro}</Text><Button onClick={start}>{copy.cta}</Button></Stack></Surface></EffectSurface>
 <Surface padding="lg"><Stack gap="md"><Heading level="level2">{copy.preview}</Heading>{saved?<Text role="status">{copy.saved}</Text>:null}<List label={copy.preview}>{notes.map(note=><ListRow key={note.id} title={note.text}/>)}</List></Stack></Surface>
 <Heading level="level2">{copy.featureTitle}</Heading>{copy.features.map(feature=><Surface key={feature.title} padding="lg"><Stack gap="sm"><Heading level="level3">{feature.title}</Heading><Text>{feature.body}</Text></Stack></Surface>)}
 <Heading level="level2">{copy.faqTitle}</Heading>{copy.faqs.map(item=><Collapsible key={item.id} trigger={item.question}><Text>{item.answer}</Text></Collapsible>)}
 <Button onClick={start}>{copy.cta}</Button><Text tone="muted">{copy.scope}</Text>
 <Sheet title={copy.sheetTitle} closeLabel={copy.close} open={open} onOpenChange={setOpen} footer={<Button onClick={submit}>{copy.submit}</Button>}><Stack gap="lg"><TextField label={copy.field} value={draft} onValueChange={value=>{setDraft(value);setError(false);}} {...(error?{error:copy.error}:{})}/></Stack></Sheet>
 </Stack></Container></main>;
}

// 2026-10-06 decision: 랜딩 화면 and 서비스 소개 (제품 체험 중심 · 설명과 사례 중심) answer the same "introduce the
// service" need, so they are one item whose variants are stories. `variant` picks the first section; the default stays
// the deployed landing so the old patterns-landing--default URL shows the same screen.
export type ServiceIntroductionVariant = "landing" | "product" | "editorial";
export function ServiceIntroductionPreview({ variant = "landing" }: { variant?: ServiceIntroductionVariant }) {
  if (variant === "landing") return <Landing />;
  return <ServiceIntroduction editorial={variant === "editorial"} />;
}
