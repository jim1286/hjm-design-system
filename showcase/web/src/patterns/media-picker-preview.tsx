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
import { createMediaPickerExample, mediaLibrary as library, mediaPickerCopy as copy, mediaSelectionLimit } from "../../../shared/media-picker-example.js";
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
 const [album,setAlbum]=useState<string>(copy.albums[0]);
 const [albumOpen,setAlbumOpen]=useState(false);
 const [recovered,setRecovered]=useState(false);
 const visible=album===copy.albums[0]?library:library.filter(item=>item.index!==3&&item.index!==4);
 const state:ScreenContentState=recovered||stateKind==="ready"?{kind:"ready"}:stateKind==="loading"?{kind:"loading",title:copy.states.loading}:stateKind==="empty"?{kind:"empty",title:copy.states.empty}:stateKind==="restricted"?{kind:"restricted",title:copy.states.restricted}:{kind:"error",title:copy.states.error};
 return <MediaSelectionScreen title={finished?copy.title.finished:reviewing?copy.title.review:copy.title.selecting} state={finished?{kind:"ready"}:state} stateAction={<Button onClick={()=>setRecovered(true)}>{copy.retry}</Button>}
 {...(finished?{}:{exit:reviewing?{kind:"back" as const,label:copy.exit.review,onClick:example.back}:{kind:"close" as const,label:copy.exit.selecting,onClick:example.reset}})}
 done={{label:finished?copy.done.finished:reviewing?uploading?copy.done.uploading:copy.done.review(selected.length):copy.done.selecting(selected.length),disabled:finished?false:state.kind!=="ready"||(reviewing?!canFinish:!selected.length),onAction:()=>{if(finished)example.reset();else if(state.kind==="ready")example.done();}}}
 items={reviewing?model.entries.map(entry=>({descriptor:{id:entry.id,name:library.find(item=>item.id===entry.id)!.name,state:entry.upload},preview:<img src={photos[Number(entry.id)]} alt="" style={{width:"100%",aspectRatio:1,objectFit:"cover"}}/>})):[]}
 labels={copy.labels} actionLabels={copy.actionLabels} removeLabel={item=>copy.remove(item.descriptor.name)} moveUpLabel={item=>copy.moveUp(item.descriptor.name)} moveDownLabel={item=>copy.moveDown(item.descriptor.name)} onRemove={example.remove} onMove={example.move} onRetry={example.retry} onCancel={example.remove}
 notice={model.phase==="selecting"?<Stack axis="inline" align="center" justify="between"><Button tone="ghost" size="small" ref={albumButtonRef} onClick={()=>setAlbumOpen(true)}>{album} ▾</Button><Text variant="caption" tone="muted">{copy.limit}</Text></Stack>:null}
 selectionSummary={model.phase==="selecting"?<Stack gap="sm"><Text variant="caption" tone="muted">{selected.length?copy.selected(selected.length):copy.selectPrompt}</Text><div className="photo-library__selection">{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <button type="button" key={id} aria-label={copy.deselect(item.name)} onClick={()=>{toggle(id); const tile=Array.from(libraryRef.current?.querySelectorAll<HTMLButtonElement>("button")??[]).find(node=>node.dataset.photoId===id); (tile??albumButtonRef.current)?.focus();}}><img src={photos[item.index]} alt="" draggable={false}/><span aria-hidden="true">×</span></button>;})}</div></Stack>:<Text variant="caption" tone="muted">{finished?copy.finishedNote:selected.length?copy.reviewNote:copy.reviewEmpty}</Text>}
 library={reviewing?undefined:finished?<Stack gap="lg"><Text>{copy.completedCount(model.completed.length)}</Text><div className="photo-library__selection">{model.completed.map(id=>{const item=library.find(photo=>photo.id===id)!;return <img key={id} src={photos[item.index]} alt={copy.completedItem(item.name)} style={{flex:"none",width:"calc(var(--hjm-space-xxxl) * 2)",height:"calc(var(--hjm-space-xxxl) * 2)"}}/>;})}</div></Stack>:<><Stack gap="sm"><div className="photo-library" ref={libraryRef}>{visible.map(item=>{const order=selected.indexOf(item.id);const atLimit=order<0&&selected.length>=mediaSelectionLimit;return <button key={item.id} data-photo-id={item.id} type="button" role="checkbox" aria-label={item.name} aria-checked={order>=0} disabled={atLimit} onClick={()=>toggle(item.id)} className="photo-library__tile"><img src={photos[item.index]} alt="" draggable={false}/><span aria-hidden="true" className="photo-library__number">{order>=0?order+1:""}</span></button>;})}</div></Stack><Sheet open={albumOpen} onOpenChange={setAlbumOpen} title={copy.albumTitle} closeLabel={copy.close}><RadioGroup accessibilityLabel={copy.albumTitle} orientation="vertical" value={album} items={copy.albums.map(value=>({value,label:value}))} onValueChange={value=>{if(value)setAlbum(value);setAlbumOpen(false);}}/></Sheet></>}/>
}
