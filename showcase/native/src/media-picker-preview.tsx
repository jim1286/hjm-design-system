import { useEffect, useState, useSyncExternalStore } from "react";
import { MediaSelectionScreen } from "@hjmds/react-native/screen-flows";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { Sheet } from "@hjmds/react-native/overlays";
import { RadioGroup } from "@hjmds/react-native/inputs";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { View, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
const photos=[require("../../shared/photos/river.jpg"),require("../../shared/photos/mountain.jpg"),require("../../shared/photos/valley.jpg"),require("../../shared/photos/photo-1025.jpg"),require("../../shared/photos/photo-1020.jpg"),require("../../shared/photos/photo-1040.jpg"),require("../../shared/photos/photo-1035.jpg"),require("../../shared/photos/photo-1043.jpg"),require("../../shared/photos/photo-1050.jpg"),require("../../shared/photos/photo-1067.jpg"),require("../../shared/photos/photo-1084.jpg"),require("../../shared/photos/photo-1080.jpg")];
import { createMediaPickerExample, mediaLibrary as library, mediaPickerCopy as copy, mediaSelectionLimit } from "../../shared/media-picker-example";
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
 const [album,setAlbum]=useState<string>(copy.albums[0]);
 const [albumOpen,setAlbumOpen]=useState(false);
 const [recovered,setRecovered]=useState(false);
 const visible=album===copy.albums[0]?library:library.filter(item=>item.index!==3&&item.index!==4);
 const state:ScreenContentState=recovered||stateKind==="ready"?{kind:"ready"}:stateKind==="loading"?{kind:"loading",title:copy.states.loading}:stateKind==="empty"?{kind:"empty",title:copy.states.empty}:stateKind==="restricted"?{kind:"restricted",title:copy.states.restricted}:{kind:"error",title:copy.states.error};
 const {colors}=useHjmNativeTheme();
 // Each tile owns a sized square box and the photo fills it: an Image aspectRatio inside an unsized wrapper resolved
 // against the asset ratio and drew ~550pt strips.
 return <MediaSelectionScreen title={finished?copy.title.finished:reviewing?copy.title.review:copy.title.selecting} state={finished?{kind:"ready"}:state} stateAction={<Button onPress={()=>setRecovered(true)}>{copy.retry}</Button>}
 {...(finished?{}:{exit:reviewing?{kind:"back" as const,label:copy.exit.review,onPress:example.back}:{kind:"close" as const,label:copy.exit.selecting,onPress:example.reset}})}
 done={{label:finished?copy.done.finished:reviewing?uploading?copy.done.uploading:copy.done.review(selected.length):copy.done.selecting(selected.length),disabled:finished?false:state.kind!=="ready"||(reviewing?!canFinish:!selected.length),onAction:()=>{if(finished)example.reset();else if(state.kind==="ready")example.done();}}}
 items={reviewing?model.entries.map(entry=>({descriptor:{id:entry.id,name:library.find(item=>item.id===entry.id)!.name,state:entry.upload},preview:<Image source={photos[Number(entry.id)]} style={{width:"100%",aspectRatio:1}}/>})):[]}
 labels={copy.labels} actionLabels={copy.actionLabels} removeLabel={item=>copy.remove(item.descriptor.name)} moveUpLabel={item=>copy.moveUp(item.descriptor.name)} moveDownLabel={item=>copy.moveDown(item.descriptor.name)} onRemove={example.remove} onMove={example.move} onRetry={example.retry} onCancel={example.remove}
 notice={model.phase==="selecting"?<Stack axis="inline" align="center" justify="between"><Button tone="ghost" size="small" onPress={()=>setAlbumOpen(true)}>{album} ▾</Button><Text variant="caption" tone="muted">{copy.limit}</Text></Stack>:null}
 selectionSummary={model.phase==="selecting"?<Stack gap="sm"><Text variant="caption" tone="muted">{selected.length?copy.selected(selected.length):copy.selectPrompt}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:spacing.xs}}>{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <Pressable key={id} accessibilityRole="button" accessibilityLabel={copy.deselect(item.name)} onPress={()=>toggle(id)} style={{width:spacing.xxxl*2,height:spacing.xxxl*2}}><Image source={photos[item.index]} style={{width:"100%",aspectRatio:1}}/></Pressable>;})}</ScrollView></Stack>:<Text variant="caption" tone="muted">{finished?copy.finishedNote:selected.length?copy.reviewNote:copy.reviewEmpty}</Text>}
 library={reviewing?undefined:finished?<Stack gap="lg"><Text>{copy.completedCount(model.completed.length)}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:spacing.xs}}>{model.completed.map(id=>{const item=library.find(photo=>photo.id===id)!;return <Image key={id} accessible accessibilityLabel={copy.completedItem(item.name)} source={photos[item.index]} style={{width:spacing.xxxl*2,height:spacing.xxxl*2}}/>;})}</ScrollView></Stack>:<><Stack gap="sm"><View style={{flexDirection:"row",flexWrap:"wrap",marginHorizontal:-spacing.md}}>{visible.map(item=>{const order=selected.indexOf(item.id);const atLimit=order<0&&selected.length>=mediaSelectionLimit;return <Pressable key={item.id} accessibilityRole="checkbox" accessibilityLabel={item.name} accessibilityState={{checked:order>=0,disabled:atLimit}} disabled={atLimit} onPress={()=>toggle(item.id)} style={{width:"33.333333%",padding:spacing.xxs/2,opacity:atLimit?0.45:1}}><View style={{width:"100%",aspectRatio:1,overflow:"hidden"}}><Image source={photos[item.index]} resizeMode="cover" style={StyleSheet.absoluteFill}/><View pointerEvents="none" style={{position:"absolute",right:spacing.xs,top:spacing.xs,minWidth:spacing.xl,minHeight:spacing.xl,paddingHorizontal:spacing.xxs,borderRadius:radius.full,borderWidth:2,borderColor:colors.onPrimary,backgroundColor:order>=0?colors.primary:"transparent",alignItems:"center",justifyContent:"center"}}>{order>=0?<Text style={{color:colors.onPrimary}} variant="caption" emphasis="strong">{order+1}</Text>:null}</View></View></Pressable>;})}</View></Stack><Sheet open={albumOpen} onOpenChange={setAlbumOpen} title={copy.albumTitle} closeLabel={copy.close}><RadioGroup accessibilityLabel={copy.albumTitle} orientation="vertical" value={album} items={copy.albums.map(value=>({value,label:value}))} onValueChange={value=>{if(value)setAlbum(value);setAlbumOpen(false);}}/></Sheet></>}/>
}
