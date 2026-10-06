import { useState } from "react";
import { SavedItemsScreen } from "@hjmds/react-native/saved-items";
import { Stack, Text, Surface, Grid } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { SearchField, TextField, TextArea } from "@hjmds/react-native/inputs";
import { ListRow } from "@hjmds/react-native/data-display";
import { Sheet } from "@hjmds/react-native/overlays";
import { Bookmark, ArrowLeft, LockKeyhole } from "lucide-react-native";
import { PreviewPhoto, ProfilePhoto } from "./reference-screen-parts";
import { screenPatternRecipe, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { View } from "react-native";

import { savedPreviewItems, savedPreviewCollections } from "../../shared/saved-items-preview";
type Options = {stateKind?: "ready" | "loading" | "empty" | "error" | "restricted"};
export function SavedItemsPreview({stateKind="ready"}: Options){
 const [saved,setSaved]=useState(savedPreviewItems.map(item=>item.id));
 const [collections,setCollections]=useState(savedPreviewCollections);
 const [collectionId,setCollectionId]=useState<string|null|undefined>(undefined);
 const [selectedItemId,setSelectedItemId]=useState<string|null>(null);
 const [removed,setRemoved]=useState<string|null>(null),[recovered,setRecovered]=useState(false);
 const [creating,setCreating]=useState(false),[name,setName]=useState(""),[chosen,setChosen]=useState<string[]>([]);
 const kind=recovered?"ready":stateKind;
 const items=savedPreviewItems.filter(item=>saved.includes(item.id));
 const state:ScreenContentState=kind==="ready"?{kind:"ready"}:{kind,title:kind==="loading"?"저장한 항목을 불러오는 중":kind==="empty"?"아직 저장한 게시물이 없어요":kind==="restricted"?"로그인하고 컬렉션을 만나세요":"저장한 항목을 불러오지 못했어요",description:kind==="empty"?"게시물의 북마크를 눌러 나만의 컬렉션을 만들어 보세요.":"잠시 후 다시 이어갈 수 있어요."};
 const back=()=>{if(selectedItemId!==null)setSelectedItemId(null);else setCollectionId(undefined);};
 const create=()=>{if(!name.trim())return;const id=`collection-${collections.length+1}`;setCollections(current=>[...current,{id,title:name.trim(),itemIds:chosen}]);setCreating(false);setCollectionId(id);};
 const restore=()=>{if(removed!==null)setSaved(ids=>[...ids,removed]);setRemoved(null);};
 const body=<><SavedItemsScreen title="저장됨" state={state} items={items} collections={collections}
 {...(collectionId===undefined?{}:{collectionId})} selectedItemId={selectedItemId}
 labels={{allItems:"모든 게시물",privateNotice:"저장한 내용은 회원님만 볼 수 있습니다.",back:selectedItemId?"컬렉션으로":"저장됨으로",empty:"이 컬렉션에는 아직 게시물이 없어요.",createCollection:"새 컬렉션"}}
 onOpenCollection={setCollectionId} onOpenItem={setSelectedItemId} onBack={back}
 onCreateCollection={()=>{setName("");setChosen([]);setCreating(true);}}
 stateAction={kind==="error"||kind==="restricted"?<Button onPress={()=>setRecovered(true)}>{kind==="error"?"다시 불러오기":"예제 계정으로 이어가기"}</Button>:null}
 notice={removed!==null?<Stack axis="inline" wrap align="center" justify="between"><Text accessibilityLiveRegion="polite">저장한 항목에서 삭제했습니다.</Text><Button tone="secondary" size="small" onPress={restore}>실행 취소</Button></Stack>:null}
 renderThumbnail={item=><PreviewPhoto index={item.photo} rounded={false} square label={item.title}/>}
 renderDetail={item=><Stack gap="md"><Stack axis="inline" align="center" justify="between"><Text emphasis="strong">{item.author}</Text><IconButton label={`${item.title} 저장 해제`} tone="ghost" onPress={()=>{setSaved(ids=>ids.filter(id=>id!==item.id));setRemoved(item.id);setSelectedItemId(null);}}><Bookmark size={20}/></IconButton></Stack><PreviewPhoto index={item.photo} square label={item.title}/><Text>{item.body}</Text></Stack>}/>
 {/* Photo buttons need content height; the sheet owns scroll and keyboard clearance once. */}
 <Sheet scrollable keyboardAvoidance open={creating} onOpenChange={setCreating} title="새 컬렉션" closeLabel="닫기" footer={<Button disabled={!name.trim()} onPress={create}>만들기</Button>}>
  <Stack gap="md"><TextField label="컬렉션 이름" placeholder="이름을 입력하세요" value={name} onValueChange={setName} maxLength={40}/><Text tone="muted">컬렉션에 담을 게시물을 선택하세요.</Text>
  <Grid columns={{compact:3}} gap={{compact:"xxs"}} minColumnWidth={{compact:44}}>{items.map(item=><Button key={item.id} growWithContent tone="ghost" selected={chosen.includes(item.id)} onPress={()=>setChosen(ids=>ids.includes(item.id)?ids.filter(id=>id!==item.id):[...ids,item.id])} accessibilityLabel={`${item.title} 선택`}><PreviewPhoto index={item.photo} square label={item.title}/></Button>)}</Grid></Stack>
 </Sheet></>;
 return <View style={{height:720}}>{body}</View>;
}

export function ProfileEditFields({name,bio,photo,onNameChange,onBioChange,onPhotoChange,disabled=false}:{name:string;bio:string;photo:number;onNameChange(value:string):void;onBioChange(value:string):void;onPhotoChange(value:number):void;disabled?:boolean}){
 const [choosePhoto,setChoosePhoto]=useState(false);
 return <><Stack gap="xl">
  <Stack align="center" gap="md"><ProfilePhoto name={name||"내 프로필"} index={photo}/><Button tone="secondary" size="small" disabled={disabled} onPress={()=>setChoosePhoto(true)}>프로필 사진 변경</Button><Text variant="caption" tone="muted">내 이야기에 함께 표시되는 사진이에요.</Text></Stack>
  <Stack gap="lg"><Heading level="level5">공개 프로필</Heading><TextField label="이름" description="다른 사람에게 표시할 이름이에요." value={name} onValueChange={onNameChange} disabled={disabled} maxLength={30} {...(!name.trim()?{error:"이름을 입력해 주세요."}:{})}/><TextArea label="소개" description="좋아하는 것, 요즘의 관심사를 들려주세요." value={bio} onValueChange={onBioChange} minVisibleLines={3} maxLength={160} disabled={disabled}/><Text variant="caption" tone="muted">{bio.length} / 160</Text></Stack>
  <Surface padding="md"><Stack gap="xs"><Text variant="caption" tone="muted">사용자 이름</Text><Text emphasis="strong">@jimin</Text><Text variant="caption" tone="muted">계정을 구분하는 고유한 이름이에요.</Text></Stack></Surface>
 </Stack><Sheet open={choosePhoto} onOpenChange={setChoosePhoto} title="프로필 사진 선택" closeLabel="닫기" footer={<Button tone="secondary" onPress={()=>setChoosePhoto(false)}>취소</Button>}><Stack gap="md"><Text tone="muted">예제 사진을 골라 프로필에 적용해 보세요.</Text><Stack axis="inline" wrap gap="sm">{[0,1,2].map(index=><Stack key={index} gap="sm"><ProfilePhoto name={`예제 사진 ${index+1}`} index={index}/><Button tone="ghost" selected={photo===index} onPress={()=>{onPhotoChange(index);setChoosePhoto(false);}}>{`사진 ${index+1} 선택`}</Button></Stack>)}</Stack></Stack></Sheet></>;
}
