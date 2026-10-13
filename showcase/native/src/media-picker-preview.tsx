import { useEffect, useState, useSyncExternalStore } from "react";
import { MediaSelectionScreen } from "@hjmds/react-native/screen-flows";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { Sheet } from "@hjmds/react-native/overlays";
import { RadioGroup } from "@hjmds/react-native/inputs";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { View, Image, Pressable, ScrollView } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
const photos=[require("../../shared/photos/river.jpg"),require("../../shared/photos/mountain.jpg"),require("../../shared/photos/valley.jpg"),require("../../shared/photos/photo-1025.jpg"),require("../../shared/photos/photo-1020.jpg"),require("../../shared/photos/photo-1040.jpg"),require("../../shared/photos/photo-1035.jpg"),require("../../shared/photos/photo-1043.jpg"),require("../../shared/photos/photo-1050.jpg"),require("../../shared/photos/photo-1067.jpg"),require("../../shared/photos/photo-1084.jpg"),require("../../shared/photos/photo-1080.jpg")];
import { createMediaPickerExample, mediaLibrary as library } from "../../shared/media-picker-example";
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
 const [album,setAlbum]=useState("최근 항목");
 const [albumOpen,setAlbumOpen]=useState(false);
 const [recovered,setRecovered]=useState(false);
 const visible=album==="최근 항목"?library:library.filter(item=>item.index!==3&&item.index!==4);
 const state:ScreenContentState=recovered||stateKind==="ready"?{kind:"ready"}:stateKind==="loading"?{kind:"loading",title:"사진을 불러오는 중이에요"}:stateKind==="empty"?{kind:"empty",title:"사진이 없어요"}:stateKind==="restricted"?{kind:"restricted",title:"사진 접근을 허용해 주세요"}:{kind:"error",title:"사진을 불러오지 못했어요"};
 const {colors}=useHjmNativeTheme();
 return <MediaSelectionScreen title={finished?"사진을 선택했어요":reviewing?"선택한 사진 업로드":"사진 선택"} state={finished?{kind:"ready"}:state} stateAction={<Button onPress={()=>setRecovered(true)}>다시 시도</Button>}
 add={{label:finished?"새로 선택":reviewing?"선택으로 돌아가기":"취소",onAction:()=>{if(reviewing)example.back();else example.reset();}}}
 done={{label:finished?"새로 선택":reviewing?uploading?"업로드 중":`${selected.length}장 추가 완료`:`${selected.length}장 선택 완료`,disabled:finished?false:state.kind!=="ready"||(reviewing?!canFinish:!selected.length),onAction:()=>{if(finished)example.reset();else if(state.kind==="ready")example.done();}}}
 items={reviewing?model.entries.map(entry=>({descriptor:{id:entry.id,name:library.find(item=>item.id===entry.id)!.name,state:entry.upload},preview:<Image source={photos[Number(entry.id)]} style={{width:"100%",aspectRatio:1}}/>})):[]}
 labels={{pending:"대기",uploading:"업로드 중",success:"업로드 완료",retry:"재시도",cancel:"업로드 취소"}} actionLabels={{remove:"삭제",moveUp:"앞으로",moveDown:"뒤로"}} removeLabel={item=>`${item.descriptor.name} 삭제`} moveUpLabel={item=>`${item.descriptor.name} 앞으로`} moveDownLabel={item=>`${item.descriptor.name} 뒤로`} onRemove={example.remove} onMove={example.move} onRetry={example.retry} onCancel={example.remove}
 notice={model.phase==="selecting"?<Stack axis="inline" align="center" justify="between"><Button tone="ghost" size="small" onPress={()=>setAlbumOpen(true)}>{album} ▾</Button><Text variant="caption" tone="muted">최대 5장 · 메모리 예제</Text></Stack>:null}
 selectionSummary={model.phase==="selecting"?<Stack gap="sm"><Text variant="caption" tone="muted">{selected.length?`${selected.length}장 선택 · 선택한 순서대로 추가돼요`:"추가할 사진을 선택하세요"}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:spacing.xs}}>{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <Pressable key={id} accessibilityRole="button" accessibilityLabel={`${item.name} 선택 해제`} onPress={()=>toggle(id)} style={{width:spacing.xxxl*2,height:spacing.xxxl*2}}><Image source={photos[item.index]} style={{width:"100%",aspectRatio:1}}/></Pressable>;})}</ScrollView></Stack>:<Text variant="caption" tone="muted">{finished?"메모리 예제에서 추가를 완료했어요. 실제 서버나 사진 보관함은 바뀌지 않아요.":selected.length?"메모리 업로드 예제예요. 실패한 사진만 다시 시도하거나 삭제하세요.":"선택한 사진이 없어요. 선택으로 돌아가 사진을 추가하세요."}</Text>}
 library={reviewing?undefined:finished?<Stack gap="lg"><Text>{model.completed.length}장을 선택했어요.</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:spacing.xs}}>{model.completed.map(id=>{const item=library.find(photo=>photo.id===id)!;return <Image key={id} accessible accessibilityLabel={`${item.name} 선택 완료`} source={photos[item.index]} style={{width:spacing.xxxl*2,height:spacing.xxxl*2}}/>;})}</ScrollView></Stack>:<><Stack gap="sm"><Text variant="caption" emphasis="strong">{album}</Text><View style={{flexDirection:"row",flexWrap:"wrap",marginHorizontal:-spacing.md}}>{visible.map(item=>{const order=selected.indexOf(item.id);const atLimit=order<0&&selected.length>=5;return <Pressable key={item.id} accessibilityRole="checkbox" accessibilityLabel={item.name} accessibilityState={{checked:order>=0,disabled:atLimit}} disabled={atLimit} onPress={()=>toggle(item.id)} style={{width:"33.333333%",padding:spacing.xxs/2,opacity:atLimit?0.45:1}}><View style={{position:"relative"}}><Image source={photos[item.index]} style={{width:"100%",aspectRatio:1}}/><View pointerEvents="none" style={{position:"absolute",right:spacing.xs,top:spacing.xs,minWidth:spacing.xl,minHeight:spacing.xl,paddingHorizontal:spacing.xxs,borderRadius:radius.full,borderWidth:2,borderColor:colors.onPrimary,backgroundColor:order>=0?colors.primary:"transparent",alignItems:"center",justifyContent:"center"}}>{order>=0?<Text style={{color:colors.onPrimary}} variant="caption" emphasis="strong">{order+1}</Text>:null}</View></View></Pressable>;})}</View></Stack><Sheet open={albumOpen} onOpenChange={setAlbumOpen} title="앨범" closeLabel="닫기"><RadioGroup accessibilityLabel="앨범" orientation="vertical" value={album} items={["최근 항목","풍경"].map(value=>({value,label:value}))} onValueChange={value=>{if(value)setAlbum(value);setAlbumOpen(false);}}/></Sheet></>}/>
}
