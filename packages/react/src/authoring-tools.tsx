"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { validateBezier, resolveShortcutCapture, type BezierCoordinates, type Shortcut, type ShortcutCapture } from "@hjmds/design-contracts/authoring-tools";
import { Button } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Text } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
export type BezierEditorProps = Readonly<{
 value: BezierCoordinates; onValueChange: (value: BezierCoordinates) => void; disabled?: boolean; active?: boolean;
 duration?: number; yRange?: readonly [number, number];
 labels: Readonly<{ coordinates: readonly [string,string,string,string]; preview: string; curve: string; decrement: string; increment: string }>;
 formatCoordinate: (value: number) => string;
}>;
export function BezierEditor(props: BezierEditorProps) {
 validateBezier(props.value);
 const range=props.yRange??[-2,2],duration=props.duration??1000;
 if (!Number.isFinite(duration)||duration<=0||!range.every(Number.isFinite)||range[0]>=range[1]||props.value[1]<range[0]||props.value[1]>range[1]||props.value[3]<range[0]||props.value[3]>range[1]) throw new RangeError("Invalid Bezier preview duration or y range");
 const theme=useHjmTheme(),ball=useRef<HTMLDivElement>(null),animation=useRef<Animation|null>(null);
 const cancel=()=>{animation.current?.cancel();animation.current=null;};
 useEffect(()=>{cancel();return cancel;},[...props.value,duration,props.active,props.disabled,theme.environment.reducedMotion]);
 useEffect(()=>{const stop=()=>{if(document.hidden)cancel();};document.addEventListener("visibilitychange",stop);return()=>document.removeEventListener("visibilitychange",stop);},[]);
 const preview=()=>{cancel();if(props.disabled||theme.environment.reducedMotion||props.active===false||document.hidden)return;animation.current=ball.current?.animate([{transform:"translateX(0)"},{transform:"translateX(120px)"}],{duration,easing:`cubic-bezier(${props.value.join(",")})`,fill:"forwards"})??null;};
 const [x1,y1,x2,y2]=props.value;
 // Fit the selected controls and both endpoints; the allowed edit range would shrink the default curve.
 const curveMin=Math.min(0,1,y1,y2),curveMax=Math.max(0,1,y1,y2);
 return <Stack gap="md"><svg role="img" aria-label={props.labels.curve} width="100%" height={180} viewBox={`-10 ${100-curveMax*100-10} 120 ${(curveMax-curveMin)*100+20}`}><path d="M0 100 L100 0" fill="none" stroke="currentColor" opacity={.2}/><path d={`M0 100 L${x1*100} ${100-y1*100} M100 0 L${x2*100} ${100-y2*100}`} fill="none" stroke="currentColor" opacity={.5}/><path d={`M0 100 C${x1*100} ${100-y1*100} ${x2*100} ${100-y2*100} 100 0`} fill="none" stroke="var(--hjm-color-content-brand, currentColor)" strokeWidth={2}/><circle cx={x1*100} cy={100-y1*100} r={3} fill="currentColor"/><circle cx={x2*100} cy={100-y2*100} r={3} fill="currentColor"/></svg>
 {props.value.map((value,index)=><Slider key={index} label={props.labels.coordinates[index]!} min={index%2===0?0:range[0]} max={index%2===0?1:range[1]} step={.01} value={value} disabled={props.disabled===true} getValueText={props.formatCoordinate} onValueChange={next=>{const values=[...props.value] as [number,number,number,number];values[index]=next;props.onValueChange(values);}}/>)}
 <div aria-hidden="true" style={{height:24,paddingInline:4,overflow:"hidden"}}><div ref={ball} style={{width:20,height:20,borderRadius:"50%",background:"currentColor"}}/></div>
 <Button disabled={props.disabled||props.active===false} onClick={preview}>{props.labels.preview}</Button></Stack>;
}
export type ShortcutRecorderProps = Readonly<{
 value: Shortcut|null; onRegister: (shortcut: Shortcut) => void|Promise<void>; platform: "mac"|"windows"|"linux";
 conflicts?: readonly string[]; reserved?: readonly string[]; disabled?: boolean;
 formatShortcut: (shortcut: Shortcut) => string;
 labels: Readonly<{ record: string; recording: string; empty: string; register: string; cancel: string; error: string; status: (status: ShortcutCapture["status"]) => string }>;
}>;
export function ShortcutRecorder(props: ShortcutRecorderProps) {
 const [recording,setRecording]=useState(false),[draft,setDraft]=useState<Shortcut|null>(null),[status,setStatus]=useState<ShortcutCapture["status"]|null>("ignored");
 const action=useCompositionAction(props.disabled),area=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(recording)area.current?.focus();},[recording]);
 useEffect(()=>{if(props.disabled){setRecording(false);setDraft(null);}},[props.disabled]);
 const capture=(event:KeyboardEvent<HTMLDivElement>)=>{
  if(!recording||props.disabled||action.pending)return;
  // Tab keeps standard focus movement; the recorder stops when focus leaves.
  if(event.code==="Tab")return;
  event.preventDefault();event.stopPropagation();
  const result=resolveShortcutCapture({code:event.code,ctrlKey:event.ctrlKey,altKey:event.altKey,shiftKey:event.shiftKey,metaKey:event.metaKey,repeat:event.repeat,isComposing:event.nativeEvent.isComposing,altGraph:event.getModifierState("AltGraph")}, {platform:props.platform,...(props.conflicts?{conflicts:props.conflicts}:{}),...(props.reserved?{reserved:props.reserved}:{})});
  setStatus(result.status);if(result.status==="ready"){setDraft(result.shortcut);setRecording(false);}else if(result.status==="cancelled"){setRecording(false);setDraft(null);}else if(result.status!=="ignored")setDraft(null);
 };
 const register=()=>{if(!draft)return;const current=resolveShortcutCapture({code:draft.code,ctrlKey:draft.ctrl,altKey:draft.alt,shiftKey:draft.shift,metaKey:draft.meta},{platform:props.platform,...(props.conflicts?{conflicts:props.conflicts}:{}),...(props.reserved?{reserved:props.reserved}:{})});setStatus(current.status);if(current.status!=="ready")return;void action.run("register",()=>props.onRegister(current.shortcut)).then(result=>{if(result.status==="success"){setDraft(null);setStatus(null);}});};
 return <Stack gap="md"><div ref={area} tabIndex={recording?0:-1} role="group" aria-label={props.labels.recording} onKeyDown={capture} onBlur={()=>setRecording(false)} style={{minHeight:44,display:"grid",placeItems:"center",outline:recording?"2px solid currentColor":undefined}}><Text>{recording?props.labels.recording: draft?props.formatShortcut(draft):props.value?props.formatShortcut(props.value):props.labels.empty}</Text></div>
 <Stack axis="inline" gap="sm"><Button disabled={props.disabled||action.pending} onClick={()=>{setDraft(null);setStatus("ignored");setRecording(true);}}>{props.labels.record}</Button>{draft?<Button loading={action.pending} disabled={props.disabled===true} onClick={register}>{props.labels.register}</Button>:null}{recording||draft?<Button disabled={action.pending} tone="ghost" onClick={()=>{setRecording(false);setDraft(null);setStatus("cancelled");}}>{props.labels.cancel}</Button>:null}</Stack>
 {status!==null?<Text role="status">{props.labels.status(status)}</Text>:null}{action.failed?<Text role="alert" tone="danger" style={{textAlign:"center"}}>{props.labels.error}</Text>:null}</Stack>;
}
