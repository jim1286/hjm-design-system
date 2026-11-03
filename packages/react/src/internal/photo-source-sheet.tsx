"use client";


import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { ListRow } from "../display.js";
import { Stack } from "../layout.js";
import { Sheet } from "../overlays.js";
import { PhotoSourceIcon } from "./photo-source-icon.js";

/** Source choice only: permission, capture, decoding and draft persistence belong to the host. */
export type PhotoSourceSheetProps = Readonly<{
 open:boolean;onOpenChange(open:boolean):void;onSelect(source:PhotoSource):void;
 labels:PhotoSourceLabels;disabled?:boolean;cameraAvailable?:boolean;
}>;
export function PhotoSourceSheet({open,onOpenChange,onSelect,labels,disabled=false,cameraAvailable=true}:PhotoSourceSheetProps){
 // File-input click must stay in the user's activation stack. Deferring until the
 // sheet animation ends can cause browsers to reject camera/album selection.
 const select=(source:PhotoSource)=>{if(disabled)return;onOpenChange(false);onSelect(source);};
 // Same peer list actions as Native, without changing the browser activation stack.
 return <Sheet open={open} onOpenChange={onOpenChange} title={labels.title} closeLabel={labels.cancel}><Stack gap="xxs">
 <ListRow title={labels.library} leading={<PhotoSourceIcon source="library"/>} disabled={disabled} onClick={()=>select("library")}/>
 {cameraAvailable?<ListRow title={labels.camera} leading={<PhotoSourceIcon source="camera"/>} disabled={disabled} onClick={()=>select("camera")}/>:null}
 </Stack></Sheet>;
}

