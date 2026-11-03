import { useEffect, useRef } from "react";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { ListRow } from "../data-display.js";
import { Sheet } from "../overlays.js";
import { Stack } from "../primitives.js";
import { PhotoSourceIcon } from "./photo-source-icon.js";

/** Source choice only: permission, capture, decoding and draft persistence belong to the host. */
export type PhotoSourceSheetProps = Readonly<{
 open:boolean;onOpenChange(open:boolean):void;onSelect(source:PhotoSource):void;
 labels:PhotoSourceLabels;disabled?:boolean;cameraAvailable?:boolean;
}>;
export function PhotoSourceSheet({open,onOpenChange,onSelect,labels,disabled=false,cameraAvailable=true}:PhotoSourceSheetProps){
 const queued=useRef<PhotoSource|null>(null);
 useEffect(()=>()=>{queued.current=null;},[]);
 // iOS cannot present a camera/picker over a dismissing Modal. Sheet owns the real
 // dismissal completion (including Android fallback), so a timer is not a safe substitute.
 const select=(source:PhotoSource)=>{if(disabled||queued.current)return;queued.current=source;onOpenChange(false);};
 const complete=()=>{const source=queued.current;queued.current=null;if(source&&!disabled&&(source!=="camera"||cameraAvailable))onSelect(source);};
 // A later close action is cancellation, even if the controlled owner previously
 // deferred closing after source selection. Do not launch that abandoned picker.
 const dismiss=(next:boolean)=>{if(!next)queued.current=null;onOpenChange(next);};
 // Source choices are peer list actions; the shared row owns touch geometry and label alignment.
 return <Sheet open={open} onOpenChange={dismiss} title={labels.title} closeLabel={labels.cancel} onDismissComplete={complete}><Stack gap="xxs">
 <ListRow title={labels.library} leading={<PhotoSourceIcon source="library"/>} disabled={disabled} onPress={()=>select("library")}/>
 {cameraAvailable?<ListRow title={labels.camera} leading={<PhotoSourceIcon source="camera"/>} disabled={disabled} onPress={()=>select("camera")}/>:null}
 </Stack></Sheet>;
}

