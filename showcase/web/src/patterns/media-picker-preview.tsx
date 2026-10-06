import new0 from "../../../shared/photos/photo-1067.jpg";
import new1 from "../../../shared/photos/photo-1084.jpg";
import new2 from "../../../shared/photos/photo-1080.jpg";
import { useState } from "react";
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
const names=["강과 산","푸른 계곡","붉은 협곡","강아지","숲속 동물","성","폭포","숲","해안","도시","바다 동물","과일"];
const library=Array.from({length:12},(_,index)=>({id:String(index),index:index%photos.length,name:`${names[index%photos.length]} ${index+1}`}));
type Props={stateKind?:"ready"|"loading"|"empty"|"error"|"restricted";tools?:boolean};
/** Mirrors the system photo-picker grid; uploads and OS access remain product-owned. */
export function MediaPickerPreview({stateKind="ready",tools=false}:Props){
 const [selected,setSelected]=useState<string[]>([]);
 const [album,setAlbum]=useState("최근 항목");
 const [albumOpen,setAlbumOpen]=useState(false);
 const [recovered,setRecovered]=useState(false);
 const [finished,setFinished]=useState(false);
 const [failed,setFailed]=useState(false);
 const [failNext,setFailNext]=useState(tools);
 const toggle=(id:string)=>{setFailed(false);setSelected(items=>items.includes(id)?items.filter(item=>item!==id):items.length<5?[...items,id]:items);};
 const visible=album==="최근 항목"?library:library.filter(item=>item.index!==3&&item.index!==4);
 const state:ScreenContentState=recovered||stateKind==="ready"?{kind:"ready"}:stateKind==="loading"?{kind:"loading",title:"사진을 불러오는 중이에요"}:stateKind==="empty"?{kind:"empty",title:"사진이 없어요"}:stateKind==="restricted"?{kind:"restricted",title:"사진 접근을 허용해 주세요"}:{kind:"error",title:"사진을 불러오지 못했어요"};
 return <MediaSelectionScreen title={finished?"사진을 선택했어요":"사진 선택"} state={finished?{kind:"ready"}:state} stateAction={<Button onClick={()=>setRecovered(true)}>다시 시도</Button>}
 add={{label:finished?"다시 선택":"취소",onAction:()=>{setSelected([]);setFinished(false);setFailed(false);}}}
 done={{label:finished?"다시 선택":failed?"다시 시도":`${selected.length}장 선택 완료`,disabled:!finished&&(!selected.length||state.kind!=="ready"),onAction:()=>{if(finished){setFinished(false);setSelected([]);}else if(failNext){setFailed(true);setFailNext(false);}else setFinished(true);}}}
 items={[]} labels={{pending:"대기",uploading:"진행 중",success:"완료",retry:"재시도",cancel:"취소"}} actionLabels={{remove:"삭제",moveUp:"앞으로",moveDown:"뒤로"}} removeLabel={item=>item.descriptor.name} moveUpLabel={item=>item.descriptor.name} moveDownLabel={item=>item.descriptor.name} onRemove={toggle} onMove={()=>{}} onRetry={()=>{}} onCancel={toggle}
 notice={!finished?<Stack axis="inline" align="center" justify="between"><Button tone="ghost" size="small" onClick={()=>setAlbumOpen(true)}>{album} ▾</Button><Text variant="caption" tone="muted">최대 5장</Text></Stack>:null}
 selectionSummary={!finished?<Stack gap="sm"><Text variant="caption" tone={failed?"danger":"muted"}>{failed?"완료하지 못했어요. 선택한 사진은 유지했어요.":selected.length?`${selected.length}장 선택 · 선택한 순서대로 추가돼요`:"추가할 사진을 선택하세요"}</Text><div className="photo-library__selection">{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <button type="button" key={id} aria-label={`${item.name} 선택 해제`} onClick={()=>toggle(id)}><img src={photos[item.index]} alt="" draggable={false}/><span aria-hidden="true">×</span></button>;})}</div></Stack>:null}
 library={finished?<Stack gap="lg"><Text>{selected.length}장을 선택했어요.</Text><div className="photo-library__selection">{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <button type="button" key={id} aria-label={`${item.name} 선택 해제`} onClick={()=>toggle(id)}><img src={photos[item.index]} alt="" draggable={false}/><span aria-hidden="true">×</span></button>;})}</div></Stack>:<><Stack gap="sm"><Text variant="caption" emphasis="strong">최근 사진</Text><div className="photo-library">{visible.map(item=>{const order=selected.indexOf(item.id);const atLimit=order<0&&selected.length>=5;return <button key={item.id} type="button" role="checkbox" aria-label={item.name} aria-checked={order>=0} disabled={atLimit} onClick={()=>toggle(item.id)} className="photo-library__tile"><img src={photos[item.index]} alt="" draggable={false}/><span aria-hidden="true" className="photo-library__number">{order>=0?order+1:""}</span></button>;})}</div></Stack><Sheet open={albumOpen} onOpenChange={setAlbumOpen} title="앨범" closeLabel="닫기"><RadioGroup accessibilityLabel="앨범" orientation="vertical" value={album} items={["최근 항목","풍경"].map(value=>({value,label:value}))} onValueChange={value=>{if(value)setAlbum(value);setAlbumOpen(false);}}/></Sheet></>}/>
}
