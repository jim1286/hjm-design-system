import { useState } from "react";
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
 const {colors}=useHjmNativeTheme();
 return <MediaSelectionScreen title={finished?"사진을 선택했어요":"사진 선택"} state={finished?{kind:"ready"}:state} stateAction={<Button onPress={()=>setRecovered(true)}>다시 시도</Button>}
 add={{label:finished?"다시 선택":"취소",onAction:()=>{setSelected([]);setFinished(false);setFailed(false);}}}
 done={{label:finished?"다시 선택":failed?"다시 시도":`${selected.length}장 선택 완료`,disabled:!finished&&(!selected.length||state.kind!=="ready"),onAction:()=>{if(finished){setFinished(false);setSelected([]);}else if(failNext){setFailed(true);setFailNext(false);}else setFinished(true);}}}
 items={[]} labels={{pending:"대기",uploading:"진행 중",success:"완료",retry:"재시도",cancel:"취소"}} actionLabels={{remove:"삭제",moveUp:"앞으로",moveDown:"뒤로"}} removeLabel={item=>item.descriptor.name} moveUpLabel={item=>item.descriptor.name} moveDownLabel={item=>item.descriptor.name} onRemove={toggle} onMove={()=>{}} onRetry={()=>{}} onCancel={toggle}
 notice={!finished?<Stack axis="inline" align="center" justify="between"><Button tone="ghost" size="small" onPress={()=>setAlbumOpen(true)}>{album} ▾</Button><Text variant="caption" tone="muted">최대 5장</Text></Stack>:null}
 selectionSummary={!finished?<Stack gap="sm"><Text variant="caption" tone={failed?"danger":"muted"}>{failed?"완료하지 못했어요. 선택한 사진은 유지했어요.":selected.length?`${selected.length}장 선택 · 선택한 순서대로 추가돼요`:"추가할 사진을 선택하세요"}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:spacing.xs}}>{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <Pressable key={id} accessibilityRole="button" accessibilityLabel={`${item.name} 선택 해제`} onPress={()=>toggle(id)} style={{width:spacing.xxxl*2,height:spacing.xxxl*2}}><Image source={photos[item.index]} style={{width:"100%",aspectRatio:1}}/></Pressable>;})}</ScrollView></Stack>:null}
 library={finished?<Stack gap="lg"><Text>{selected.length}장을 선택했어요.</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:spacing.xs}}>{selected.map(id=>{const item=library.find(photo=>photo.id===id)!;return <Pressable key={id} accessibilityRole="button" accessibilityLabel={`${item.name} 선택 해제`} onPress={()=>toggle(id)} style={{width:spacing.xxxl*2,height:spacing.xxxl*2}}><Image source={photos[item.index]} style={{width:"100%",aspectRatio:1}}/></Pressable>;})}</ScrollView></Stack>:<><Stack gap="sm"><Text variant="caption" emphasis="strong">최근 사진</Text><View style={{flexDirection:"row",flexWrap:"wrap",marginHorizontal:-spacing.md}}>{visible.map(item=>{const order=selected.indexOf(item.id);const atLimit=order<0&&selected.length>=5;return <Pressable key={item.id} accessibilityRole="checkbox" accessibilityLabel={item.name} accessibilityState={{checked:order>=0,disabled:atLimit}} disabled={atLimit} onPress={()=>toggle(item.id)} style={{width:"33.333333%",padding:spacing.xxs/2,opacity:atLimit?0.45:1}}><View style={{position:"relative"}}><Image source={photos[item.index]} style={{width:"100%",aspectRatio:1}}/><View pointerEvents="none" style={{position:"absolute",right:spacing.xs,top:spacing.xs,minWidth:spacing.xl,minHeight:spacing.xl,paddingHorizontal:spacing.xxs,borderRadius:radius.full,borderWidth:2,borderColor:colors.onPrimary,backgroundColor:order>=0?colors.primary:"transparent",alignItems:"center",justifyContent:"center"}}>{order>=0?<Text style={{color:colors.onPrimary}} variant="caption" emphasis="strong">{order+1}</Text>:null}</View></View></Pressable>;})}</View></Stack><Sheet open={albumOpen} onOpenChange={setAlbumOpen} title="앨범" closeLabel="닫기"><RadioGroup accessibilityLabel="앨범" orientation="vertical" value={album} items={["최근 항목","풍경"].map(value=>({value,label:value}))} onValueChange={value=>{if(value)setAlbum(value);setAlbumOpen(false);}}/></Sheet></>}/>
}
