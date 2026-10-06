import { PatternStatus } from "./pattern-status";
import { ServiceIntroduction } from "./reference-flow-previews";
import { useRef, useState } from "react";
import { Container, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { EffectSurface } from "@hjmds/react-native/effect-surface";
import { List, ListRow } from "@hjmds/react-native/data-display";
import { landingCopy as copy, normalizeLandingNote } from "../../shared/landing-pattern";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
function Landing(){
 const[open,setOpen]=useState(false);const[draft,setDraft]=useState("");const[error,setError]=useState(false);const[notes,setNotes]=useState([{ id: 0, text: copy.initial }]);const[saved,setSaved]=useState(false);
 const nextId=useRef(1);
 const start=()=>{setDraft("");setError(false);setSaved(false);setOpen(true);};
 const submit=()=>{try{const note=normalizeLandingNote(draft);setNotes(current=>[{ id: nextId.current++, text: note },...current]);setSaved(true);setOpen(false);}catch{setError(true);}};
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingVertical:spacing.lg}}><Container><Stack gap="xl"><EffectSurface descriptor={{layers:["mesh","grain"],seed:"landing",active:false}}><Surface padding="xl"><Stack gap="lg"><Text tone="muted">{copy.eyebrow}</Text><Heading level="level1">{copy.title}</Heading><Text>{copy.intro}</Text><Button onPress={start}>{copy.cta}</Button></Stack></Surface></EffectSurface>
 <Surface padding="lg"><Stack gap="md"><Heading level="level2">{copy.preview}</Heading>{saved?<PatternStatus announceOnMount>{copy.saved}</PatternStatus>:null}<List label={copy.preview}>{notes.map(note=><ListRow key={note.id} title={note.text}/>)}</List></Stack></Surface>
 <Heading level="level2">{copy.featureTitle}</Heading>{copy.features.map(feature=><Surface key={feature.title} padding="lg"><Stack gap="sm"><Heading level="level3">{feature.title}</Heading><Text>{feature.body}</Text></Stack></Surface>)}
 <Heading level="level2">{copy.faqTitle}</Heading>{copy.faqs.map(item=><Collapsible key={item.id} trigger={item.question}><Text>{item.answer}</Text></Collapsible>)}
 <Button onPress={start}>{copy.cta}</Button><Text tone="muted">{copy.scope}</Text>
 {/* The sheet owns keyboard clearance so the editor and submit action remain reachable. */}
 <Sheet keyboardAvoidance scrollable title={copy.sheetTitle} closeLabel={copy.close} open={open} onOpenChange={setOpen} footer={<Button onPress={submit}>{copy.submit}</Button>}><Stack gap="lg"><TextField label={copy.field} value={draft} onValueChange={value=>{setDraft(value);setError(false);}} {...(error?{error:copy.error}:{})}/></Stack></Sheet>
 </Stack></Container></ScrollView>;
}

// 2026-10-06: 랜딩 화면 and the experimental 서비스 소개 (제품 체험 중심·설명과 사례 중심) are one introduction item.
// The landing page stays the default; the other two are variants of the same purpose (FINAL_MAPPING §2).
export type IntroductionVariant = "landing" | "product" | "editorial";
export function IntroductionPreview({ variant = "landing" }: { variant?: IntroductionVariant }) {
 if (variant === "landing") return <Landing />;
 return <ServiceIntroduction editorial={variant === "editorial"} />;
}
