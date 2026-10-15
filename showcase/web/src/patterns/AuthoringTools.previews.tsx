import { useEffect, useRef, useState } from "react";
import { BezierEditor, ShortcutRecorder } from "@hjmds/react/authoring-tools";
import { normalizeShortcut, type BezierCoordinates, type Shortcut } from "@hjmds/design-contracts/authoring-tools";
import { Stack, Text } from "@hjmds/react/layout";
export function BezierEditorPreview(){
 const [value,setValue]=useState<BezierCoordinates>([.25,.1,.25,1]);
 return <Stack gap="md"><BezierEditor value={value} onValueChange={setValue} labels={{coordinates:["첫 제어점 X","첫 제어점 Y","둘째 제어점 X","둘째 제어점 Y"],preview:"움직임 미리 보기",curve:"두 제어점의 베지어 곡선",decrement:"줄이기",increment:"늘리기"}} formatCoordinate={value=>value.toFixed(2)}/><Text variant="caption">{`cubic-bezier(${value.join(", ")})`}</Text><Text variant="caption">현재 초안만 바꿉니다. 제품 모션 토큰에는 저장하지 않습니다.</Text></Stack>;
}
export function ShortcutRecorderPreview(){
 const [value,setValue]=useState<Shortcut|null>(null),[count,setCount]=useState(0),handler=useRef<((event:KeyboardEvent)=>void)|null>(null);
 useEffect(()=>()=>{if(handler.current)document.removeEventListener("keydown",handler.current);},[]);
 const register=(shortcut:Shortcut)=>{
  if(handler.current)document.removeEventListener("keydown",handler.current);
  handler.current=event=>{const target=event.target;if(event.repeat||event.isComposing||target instanceof HTMLElement&&(target.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(target.tagName)))return;
   if(normalizeShortcut({code:event.code,ctrl:event.ctrlKey,alt:event.altKey,shift:event.shiftKey,meta:event.metaKey})===normalizeShortcut(shortcut)){event.preventDefault();setCount(n=>n+1);}};
  document.addEventListener("keydown",handler.current);setValue(shortcut);
 };
 return <Stack gap="md"><ShortcutRecorder value={value} onRegister={register} platform={typeof navigator!=="undefined"&&/Mac/.test(navigator.userAgent)?"mac":"windows"} conflicts={["Ctrl+Shift+KeyJ","Shift+Meta+KeyJ"]} formatShortcut={normalizeShortcut} labels={{record:"새 조합 기록",recording:"수정키와 키를 누르세요. Escape로 취소",empty:"등록한 단축키가 없습니다",register:"실제 키 동작 등록",cancel:"취소",error:"등록하지 못했어요",status:status=>({ignored:"Ctrl·Alt·Command 중 하나와 키를 함께 누르세요.",ready:"등록할 조합을 확인하세요.",reserved:"브라우저·OS에서 쓰는 조합입니다.",conflict:"이미 다른 동작이 쓰는 조합입니다.",invalid:"이 조합은 사용할 수 없습니다.",cancelled:"기록을 취소했어요."})[status]}}/><Text>등록한 조합을 누른 횟수: {count}</Text><Text variant="caption">J 조합은 다른 동작과 충돌합니다. K 조합을 기록·등록한 뒤 눌러 실제 동작을 확인하세요.</Text></Stack>;
}
