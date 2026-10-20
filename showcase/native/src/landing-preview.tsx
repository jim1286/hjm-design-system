import type { ComponentRef } from "react";
import { PatternStatus } from "./pattern-status";
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
import { ScrollView, type TextInput, type View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
export function LandingPreview(){
 const[open,setOpen]=useState(false);const[draft,setDraft]=useState("");const[error,setError]=useState(false);const[notes,setNotes]=useState([{ id: 0, text: copy.initial }]);const[saved,setSaved]=useState(false);
 const nextId=useRef(1); const sessionOpen=useRef(false);
 const input=useRef<ComponentRef<typeof TextInput>>(null); const returnFocus=useRef<ComponentRef<typeof View>>(null);
 const topTrigger=useRef<ComponentRef<typeof View>>(null); const bottomTrigger=useRef<ComponentRef<typeof View>>(null);
 // Dismissal keeps the draft; only a successful save starts a fresh note.
 const start=(trigger: ComponentRef<typeof View> | null)=>{returnFocus.current=trigger;sessionOpen.current=true;setError(false);setSaved(false);setOpen(true);};
 const changeOpen=(next:boolean)=>{sessionOpen.current=next;setOpen(next);};
 const submit=()=>{
  // The ref closes this session before React commits, so two submit events cannot append twice.
  if(!sessionOpen.current)return;
  try{const note={id:nextId.current,text:normalizeLandingNote(draft)};nextId.current++;sessionOpen.current=false;setNotes(current=>[note,...current]);setDraft("");setError(false);setSaved(true);setOpen(false);}
  catch{setError(true);input.current?.focus();}
 };
 // Hero 24 → sections 20 → features 18: the display sizes (40/32) were removed on 2026-10-17 ("글자 너무 커").
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingVertical:spacing.lg}}><Container><Stack gap="xl"><EffectSurface descriptor={{layers:["mesh","grain"],seed:"landing",active:false}}><Surface padding="xl"><Stack gap="lg"><Text tone="muted">{copy.eyebrow}</Text><Heading level="level3" semanticLevel={1}>{copy.title}</Heading><Text>{copy.intro}</Text><Button ref={topTrigger} onPress={()=>start(topTrigger.current)}>{copy.cta}</Button></Stack></Surface></EffectSurface>
 <Surface padding="lg"><Stack gap="md"><Heading level="level4" semanticLevel={2}>{copy.preview}</Heading>{saved?<PatternStatus announceOnMount>{copy.saved}</PatternStatus>:null}<List label={copy.preview}>{notes.map(note=><ListRow key={note.id} title={note.text}/>)}</List></Stack></Surface>
 <Heading level="level4" semanticLevel={2}>{copy.featureTitle}</Heading>{copy.features.map(feature=><Surface key={feature.title} padding="lg"><Stack gap="sm"><Heading level="level5" semanticLevel={3}>{feature.title}</Heading><Text>{feature.body}</Text></Stack></Surface>)}
 <Heading level="level4" semanticLevel={2}>{copy.faqTitle}</Heading>{copy.faqs.map(item=><Collapsible key={item.id} trigger={item.question}><Text>{item.answer}</Text></Collapsible>)}
 <Button ref={bottomTrigger} tone="secondary" onPress={()=>start(bottomTrigger.current)}>{copy.cta}</Button><Text tone="muted">{copy.scope}</Text>
 {/* The sheet owns keyboard clearance so the editor and submit action remain reachable. */}
 <Sheet keyboardAvoidance scrollable title={copy.sheetTitle} closeLabel={copy.close} open={open} onOpenChange={changeOpen} returnFocusRef={returnFocus} footer={<Button fullWidth onPress={submit}>{copy.submit}</Button>}><Stack gap="lg"><TextField ref={input} autoFocus returnKeyType="done" onSubmitEditing={submit} label={copy.field} value={draft} onValueChange={value=>{setDraft(value);setError(false);}} {...(error?{error:copy.error}:{})}/></Stack></Sheet>
 </Stack></Container></ScrollView>;
}
