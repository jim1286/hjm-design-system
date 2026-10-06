import { PreviewPhoto, PhotoTile } from "./reference-screen-parts";
import { AccountFlowPreview } from "./screen-flow-previews";
import { SearchScreen } from "@hjmds/react-native/screen-flows";
import { InstagramCommentsPreview } from "./instagram-comments-preview";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { View } from "react-native";
import { useState } from "react";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Stack, Text, Grid } from "@hjmds/react-native/primitives";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { ListRow } from "@hjmds/react-native/data-display";
import { ChevronLeft, Bookmark } from "lucide-react-native";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";

const posts = [{id:1,title:"산책길에서 찾은 작은 여유",body:"바쁜 하루에도 잠깐 멈출 수 있는 곳이 있더라고요.",author:"서연"},{id:2,title:"나만의 아침 루틴",body:"창문을 열고 물 한 잔. 오늘도 작게 시작해요.",author:"민준"},{id:3,title:"좋아하는 동네 카페",body:"오래 앉아 책을 읽고 싶은 오후였어요.",author:"지우"}];
type Kind = "search" | "saved";
type Options = { stateKind?: "ready" | "loading" | "empty" | "error" | "restricted" };
const titles = { search:"검색",saved:"저장한 항목" };
function BasicScreen({kind,stateKind="ready"}: Options & {kind:Kind}) {
 const { colors } = useHjmNativeTheme();
 const [recovered,setRecovered]=useState(false);
 const [query,setQuery]=useState("");
 const [settledQuery,setSettledQuery]=useState("");
 const [saved,setSaved]=useState([1,2,3]);
 const [removed,setRemoved]=useState<number|null>(null);
 const [detail,setDetail]=useState<typeof posts[number]|null>(null);
 const [home,setHome]=useState(false);
 const currentKind=recovered?"ready":stateKind;
 const state:ScreenContentState=currentKind==="ready"?{kind:"ready"}:currentKind==="loading"?{kind:"loading",title:"잠시만 기다려 주세요"}:currentKind==="empty"?{kind:"empty",title:kind==="saved"?"아직 저장한 항목이 없어요":"아직 이야기가 없어요",description:"관심 있는 이야기로 시작해 보세요."}:currentKind==="error"?{kind:"error",title:"불러오지 못했어요",description:"연결을 확인한 뒤 다시 시도해 주세요."}:{kind:"restricted",title:"로그인하고 이어가세요",description:"나의 이야기와 저장한 항목을 확인해 보세요."};
 const back=<IconButton label="뒤로" tone="ghost" onPress={()=>{if(detail)setDetail(null);else setHome(true);}}><ChevronLeft color={colors.text} size={20}/></IconButton>;
 const retry=currentKind==="error"||currentKind==="restricted"?<Button onPress={()=>setRecovered(true)}>{currentKind==="error"?"다시 시도":"로그인"}</Button>:null;
 let content;
 if(kind==="search") {const results=posts.filter(post=>`${post.title} ${post.body} ${post.author}`.includes(settledQuery.trim()));content=<Stack gap="lg">{query!==settledQuery?<Text tone="muted">검색 중…</Text>:settledQuery?<Text tone="muted">검색 결과 {results.length}개</Text>:<Text emphasis="strong">둘러볼 이야기</Text>}{results.map(post=><ListRow key={post.id} title={post.title} description={post.author} onPress={()=>setDetail(post)}/>)}{!results.length?<Text tone="muted">검색 결과가 없어요. 다른 단어로 찾아보세요.</Text>:null}</Stack>;}
 else if(kind==="saved") content=<Stack gap="lg">{removed!==null?<Stack gap="sm"><Text tone="muted">저장 목록에서 해제했어요.</Text><Button tone="ghost" onPress={()=>{setSaved(ids=>[...ids,removed].sort());setRemoved(null);}}>되돌리기</Button></Stack>:null}<Text variant="caption" tone="muted">나만 볼 수 있는 저장 목록</Text><Grid columns={{compact:2,expanded:3}} gap={{compact:"md"}}>{posts.filter(post=>saved.includes(post.id)).map((post,index)=><Stack key={post.id} gap="xs"><PhotoTile index={index} title={post.title} onOpen={()=>setDetail(post)}/><Stack axis="inline" align="center" justify="between"><Text variant="caption" tone="muted">{post.author}</Text><IconButton label="저장 해제" tone="ghost" onPress={()=>{setSaved(ids=>ids.filter(id=>id!==post.id));setRemoved(post.id);}}><Bookmark size={18}/></IconButton></Stack></Stack>)}</Grid>{saved.length===0?<Text>저장한 항목이 없어요.</Text>:null}</Stack>;
 return <View style={{height:720}}>{home?<ScreenLayout title="이야기"><Button onPress={()=>setHome(false)}>{titles[kind]} 다시 열기</Button></ScreenLayout>:detail?<ScreenLayout title="이야기" leading={back}><Stack gap="lg"><PreviewPhoto index={detail.id-1}/><Text variant="title" emphasis="strong">{detail.title}</Text><Text tone="muted">{detail.author}</Text><Text>{detail.body}</Text></Stack></ScreenLayout>:kind==="search"?<SearchScreen title="검색" leading={back} state={state} stateAction={retry} queryLabel="이야기 검색" query={query} onQueryChange={setQuery} onSearch={(value,{signal})=>{if(!signal.aborted)setSettledQuery(value);}}>{content}</SearchScreen>:<ScreenLayout title={titles[kind]} leading={back} state={state} stateAction={retry}>{content}</ScreenLayout>}</View>;
}
export function CommentsScreenPreview(props:Options){return <InstagramCommentsPreview {...props}/>;}
export function SearchScreenPreview(props:Options){return <BasicScreen kind="search" {...props}/>;}
export function SavedScreenPreview(props:Options){return <BasicScreen kind="saved" {...props}/>;}
export function ProfileScreenPreview(props:Options){return <AccountFlowPreview {...props}/>;}
