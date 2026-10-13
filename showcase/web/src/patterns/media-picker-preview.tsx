import new0 from "../../../shared/photos/photo-1067.jpg";
import new1 from "../../../shared/photos/photo-1084.jpg";
import new2 from "../../../shared/photos/photo-1080.jpg";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MediaSelectionScreen } from "@hjmds/react/screen-flows";
import { Stack, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { Sheet } from "@hjmds/react/overlays";
import { RadioGroup } from "@hjmds/react/selection";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import "./media-picker.css";
import photo0 from "../../../shared/photos/river.jpg";
import photo1 from "../../../shared/photos/mountain.jpg";
import photo2 from "../../../shared/photos/valley.jpg";
import photo3 from "../../../shared/photos/photo-1025.jpg";
import photo4 from "../../../shared/photos/photo-1020.jpg";
import photo5 from "../../../shared/photos/photo-1040.jpg";
import photo6 from "../../../shared/photos/photo-1035.jpg";
import photo7 from "../../../shared/photos/photo-1043.jpg";
import photo8 from "../../../shared/photos/photo-1050.jpg";
const photos=[photo0,photo1,photo2,photo3,photo4,photo5,photo6,photo7,photo8,new0,new1,new2];
import { createMediaPickerExample, mediaLibrary as library } from "../../../shared/media-picker-example.js";
type Props={stateKind?:"ready"|"loading"|"empty"|"error"|"restricted";tools?:boolean};
/** Mirrors the system photo-picker grid; uploads and OS access remain product-owned. */
export function MediaPickerPreview({stateKind="ready",tools=false}:Props){
 const [example] = useState(() => createMediaPickerExample(tools));
 const model = useSyncExternalStore(example.subscribe, example.getSnapshot, example.getSnapshot);
 useEffect(() => () => example.dispose(), [example]);
 const selected = model.entries.map(item => item.id);
 const finished = model.phase === "finished", reviewing = model.phase === "review";
 const uploading = model.entries.some(item => item.upload.status === "uploading");
 const canFinish = selected.length > 0 && model.entries.every(item => item.upload.status === "success");
 const toggle = example.toggle;
 const libraryRef = useRef<HTMLDivElement>(null), albumButtonRef = useRef<HTMLButtonElement>(null);
 const [album,setAlbum]=useState("최근 항목");
 const [albumOpen,setAlbumOpen]=useState(false);
 const [recovered,setRecovered]=useState(false);
 const visible=album==="최근 항목"?library:library.filter(item=>item.index!==3&&item.index!==4);
 const state:ScreenContentState=recovered||stateKind==="ready"?{kind:"ready"}:stateKind==="loading"?{kind:"loading",title:"사진을 불러오는 중이에요"}:stateKind==="empty"?{kind:"empty",title:"사진이 없어요"}:stateKind==="restricted"?{kind:"restricted",title:"사진 접근을 허용해 주세요"}:{kind:"error",title:"사진을 불러오지 못했어요"};
 return <MediaSelectionScreen title={finished?"사진을 선택했어요":reviewing?"선택한 사진 업로드":"사진 선택"} state={finished?{kind:"ready"}:state} stateAction={<Button onClick={()=>setRecovered(true)}>다시 시도</Button>}
 add={{label:finished?"새로 선택":reviewing?"선택으로 돌아가기":"취소",onAction:()=>{if(reviewing)example.back();else example.reset();}}}
 done={{label:finished?"새로 선택":reviewing?uploading?"업로드 중":`${selected.length}장 추가 완료`:`${selected.length}장 선택 완료`,disabled:finished?false:state.kind!=="ready"||(reviewing?!canFinish:!selected.length),onAction:()=>{if(finished)example.reset();else if(state.kind==="ready")example.done();}}}
 items={reviewing?model.entries.map(entry=>({descriptor:{id:entry.id,name:library.find(item=>item.id===entry.id)!.name,state:entry.upload},preview:<img src={photos[Number(entry.id)]} alt="" style={{width:"100%",aspectRatio:1,objectFit:"cover"}}/>})):[]}
 labels={{pending:"대기",uploading:"업로드 중",success:"업로드 완료",retry:"재시도",cancel:"업로드 취소"}} actionLabels={{remove:"삭제",moveUp:"앞으로",moveDown:"뒤로"}} removeLabel={item=>`${item.descriptor.name} 삭제`} moveUpLabel={item=>`${item.descriptor.name} 앞으로`} moveDownLabel={item=>`${item.descriptor.name} 뒤로`} onRemove={example.remove} onMove={example.move} onRetry={example.retry} onCancel={example.remove}
 notice={model.phase==="selecting"?<Stack axis="inline" align="center" justify="between"><Button tone="ghost" size="small" ref={albumButtonRef} onClick={()=>setAlbumOpen(true)}>{album} ▾</Button><Text variant="caption" tone="muted">최대 5장 · 메모리 예제</Text></Stack>:null}
 selectionSummary={model.phase==="selecting"?<Stack gap="sm"><Text variant="caption" tone="muted">{selected.length?`${selected.length}장 선택 · 선택한 순서대로 추가돼요`:"추가할 사진을 선택하세요"}</Text><div className="photo-library__selection">{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <button type="button" key={id} aria-label={`${item.name} 선택 해제`} onClick={()=>{toggle(id); const tile=Array.from(libraryRef.current?.querySelectorAll<HTMLButtonElement>("button")??[]).find(node=>node.dataset.photoId===id); (tile??albumButtonRef.current)?.focus();}}><img src={photos[item.index]} alt="" draggable={false}/><span aria-hidden="true">×</span></button>;})}</div></Stack>:<Text variant="caption" tone="muted">{finished?"메모리 예제에서 추가를 완료했어요. 실제 서버나 사진 보관함은 바뀌지 않아요.":selected.length?"메모리 업로드 예제예요. 실패한 사진만 다시 시도하거나 삭제하세요.":"선택한 사진이 없어요. 선택으로 돌아가 사진을 추가하세요."}</Text>}
 library={reviewing?undefined:finished?<Stack gap="lg"><Text>{model.completed.length}장을 선택했어요.</Text><div className="photo-library__selection">{model.completed.map(id=>{const item=library.find(photo=>photo.id===id)!;return <img key={id} src={photos[item.index]} alt={`${item.name} 선택 완료`} style={{flex:"none",width:"calc(var(--hjm-space-xxxl) * 2)",height:"calc(var(--hjm-space-xxxl) * 2)"}}/>;})}</div></Stack>:<><Stack gap="sm"><Text variant="caption" emphasis="strong">{album}</Text><div className="photo-library" ref={libraryRef}>{visible.map(item=>{const order=selected.indexOf(item.id);const atLimit=order<0&&selected.length>=5;return <button key={item.id} data-photo-id={item.id} type="button" role="checkbox" aria-label={item.name} aria-checked={order>=0} disabled={atLimit} onClick={()=>toggle(item.id)} className="photo-library__tile"><img src={photos[item.index]} alt="" draggable={false}/><span aria-hidden="true" className="photo-library__number">{order>=0?order+1:""}</span></button>;})}</div></Stack><Sheet open={albumOpen} onOpenChange={setAlbumOpen} title="앨범" closeLabel="닫기"><RadioGroup accessibilityLabel="앨범" orientation="vertical" value={album} items={["최근 항목","풍경"].map(value=>({value,label:value}))} onValueChange={value=>{if(value)setAlbum(value);setAlbumOpen(false);}}/></Sheet></>}/>
}
