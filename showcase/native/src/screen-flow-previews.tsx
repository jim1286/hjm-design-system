import { Heading } from "@hjmds/react-native/heading";
import { ProfileEditFields } from "./saved-profile-previews";
import { PreviewPhoto, PhotoTile, ProfileSummary, PermissionPreview, IntroPreview } from "./reference-screen-parts";
import { MediaPickerPreview } from "./media-picker-preview";
import { useEffect, useRef, useState } from "react";
import { ListDetailScreen, EditorScreen, ProfileScreen, ModerationScreen, PermissionScreen, OnboardingScreen } from "@hjmds/react-native/screen-flows";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Stack, Text, Grid } from "@hjmds/react-native/primitives";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { TextField, TextArea } from "@hjmds/react-native/inputs";
import { Chip } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";
import { onboardingCopy, onboardingSummary, toggleOnboardingTopic } from "../../shared/onboarding-pattern";
import { Avatar, ListRow } from "@hjmds/react-native/data-display";
import { Sheet, AlertDialog } from "@hjmds/react-native/overlays";
import { Bell, Compass, PenLine, Check, ChevronRight, Menu, Bookmark } from "lucide-react-native";
import type { ScreenContentState, PermissionScreenStatus } from "@hjmds/design-contracts/screen-patterns";
import { View } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";

type Kind="collection"|"editor"|"account"|"moderation"|"permission"|"onboarding";
// initialStep lets a story open one onboarding step directly (2026-10-06 Topics story) instead of tapping through.
type Props={stateKind?:"ready"|"loading"|"empty"|"error"|"restricted";tools?:boolean;initialEditing?:boolean;initialStep?:number};
const copy={collection:"나의 기록",editor:"기록 쓰기",account:"프로필과 계정",moderation:"신고 및 차단",media:"사진 선택",permission:"알림을 받아보세요",onboarding:"나만의 공간 시작하기"};
const entries=Array.from({length:24},(_,i)=>({id:String(i+1),title:["산책길에서 찾은 작은 여유","주말에 읽고 싶은 책","나만의 아침 루틴","좋아하는 동네 카페"][i%4]!,type:i%2?"기록":"사진",description:`10월 ${5-i%5}일 · ${i+1}번째 이야기`}));
function FlowPreview({kind,stateKind="ready",tools=false,initialEditing=false,initialStep=0}:Props&{kind:Kind}){
 const {colors}=useHjmNativeTheme();
 const [bio,setBio]=useState("산책, 책, 그리고 일상의 작은 순간들."),[bioDraft,setBioDraft]=useState(bio);
 const [photo,setPhoto]=useState(0),[photoDraft,setPhotoDraft]=useState(photo);
 const [recovered,setRecovered]=useState(false);
 const [count,setCount]=useState(12);
 const [records,setRecords]=useState(entries);
 const [selected,setSelected]=useState<string|null>(null);
 const [title,setTitle]=useState("산책길에서 찾은 작은 여유");
 const [body,setBody]=useState("바쁜 하루에도 잠깐 멈출 수 있는 곳이 있더라고요.");
 const [snapshot,setSnapshot]=useState({title,body});
 const [draftStatus,setDraftStatus]=useState("");
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);
 const [failNext,setFailNext]=useState(false);
 const [closed,setClosed]=useState(false);
 const [editing,setEditing]=useState(initialEditing);
 const [accountOpen,setAccountOpen]=useState(false);
 const [collectionFilter,setCollectionFilter]=useState("전체");
 const [profileTab,setProfileTab]=useState("게시물");
 const [profileDetail,setProfileDetail]=useState<string|null>(null);
 const [nickname,setNickname]=useState("지민");
 const [nicknameDraft,setNicknameDraft]=useState(nickname);
 const [logout,setLogout]=useState(false);
 const [reason,setReason]=useState<string|null>(null);
 const [blocked,setBlocked]=useState(false);
 const [reported,setReported]=useState(false);
 const [permission,setPermission]=useState<PermissionScreenStatus>(tools?"denied":"prompt");
 const [step,setStep]=useState(initialStep);
 // Topics are multi-select like the retired hand-assembled onboarding; a single-choice radio group forced one interest (2026-10-06).
 const [topics,setTopics]=useState<readonly string[]>([]);
 const [failed,setFailed]=useState(false);
 const jobs=useRef<ReturnType<typeof setTimeout>[]>([]);
 useEffect(()=>()=>jobs.current.forEach(clearTimeout),[]);
 const later=(fn:()=>void)=>{const timer=setTimeout(fn,400);jobs.current.push(timer);};
 // Demo service latency makes pending and retry observable; real consumers supply their own mutation state.
 const mutate=(success:()=>void)=>{if(busy)return;setBusy(true);setNotice("");setFailed(false);later(()=>{setBusy(false);if(failNext){setFailNext(false);setFailed(true);setNotice("저장하지 못했어요. 입력한 내용은 남아 있어요.");}else success();});};
 const finishOnboarding=()=>mutate(()=>setClosed(true));
 const dirty=kind==="account"?nicknameDraft!==nickname||bioDraft!==bio||photoDraft!==photo:title!==snapshot.title||body!==snapshot.body;
 useEffect(()=>{if(!dirty){setDraftStatus("");return;}setDraftStatus("초안 저장 중…");const timer=setTimeout(()=>setDraftStatus("이 화면에 초안을 보관했어요"),300);return()=>clearTimeout(timer);},[dirty,title,body,nicknameDraft]);
 const state:ScreenContentState=recovered||stateKind==="ready"?{kind:"ready"}:stateKind==="loading"?{kind:"loading",title:"불러오는 중이에요"}:stateKind==="empty"?{kind:"empty",title:"아직 내용이 없어요",description:"새로운 이야기로 시작해 보세요."}:stateKind==="restricted"?{kind:"restricted",title:"로그인이 필요해요"}:{kind:"error",title:"불러오지 못했어요",description:"연결을 확인하고 다시 시도해 주세요."};
 const base={title:copy[kind],state,stateAction:state.kind==="error"||state.kind==="restricted"?<Button onPress={()=>setRecovered(true)}>다시 시도</Button>:null,// Native Notice defaults to announcement="none"; a save failure must interrupt the screen reader, a success need not.
 notice:notice?(failed?<Notice tone="danger" announcement="assertive" title={notice}/>:<Notice tone="success" title={notice}/>):null};
 const discard={mode:"confirm" as const,tone:"danger" as const,title:"수정한 내용을 버릴까요?",description:"저장하지 않은 변경 내용은 사라져요.",confirmLabel:"버리고 나가기",cancelLabel:"계속 작성",fallbackErrorMessage:"다시 시도해 주세요."};
 let screen;
 if(closed)screen=<ScreenLayout title={kind==="onboarding"?"시작할 준비가 됐어요":"완료했어요"}><Stack gap="lg"><Check size={40} color={colors.contentBrand}/><Text>{kind==="account"?"로그아웃했어요.":kind==="permission"?"알림 설정을 확인했어요.":"변경 내용을 확인했어요."}</Text><Button onPress={()=>setClosed(false)}>다시 열기</Button></Stack></ScreenLayout>;
 else if(kind==="collection"&&!editing)screen=<ListDetailScreen {...base} notice={<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}>{["전체","즐겨찾기"].map(value=><Button key={value} size="small" tone="ghost" selected={collectionFilter===value} onPress={()=>setCollectionFilter(value)}>{value}</Button>)}<Button size="small" tone="ghost" onPress={()=>setEditing(true)}>새 기록</Button></Stack>} list={<Stack gap="sm">{records.slice(0,count).filter(entry=>collectionFilter==="전체"||Number(entry.id)%3===1).map((entry,index)=><Stack key={entry.id} gap="sm">{index===0||index===4?<Heading level="level5">{index===0?"오늘":"지난 7일"}</Heading>:null}<ListRow title={entry.title} description={`${entry.description} · ${entry.id==="1"?"바쁜 하루에도 잠깐 멈출 수 있는 곳":"기억하고 싶은 순간을 남겼어요"}`} trailing={<ChevronRight size={16}/>} onPress={()=>setSelected(entry.id)}/></Stack>)}</Stack>} {...(selected?{detail:{title:records.find(e=>e.id===selected)!.title,content:<Stack gap="lg"><PreviewPhoto index={Number(selected)%3}/><Text tone="muted">{records.find(e=>e.id===selected)!.description}</Text><Text>{body}</Text></Stack>}}:{})} back={{label:"목록으로",onAction:()=>setSelected(null)}} refresh={{label:"새로고침",pending:busy,onAction:()=>mutate(()=>setNotice("목록을 새로 불러왔어요."))}} {...(count<records.length?{loadMore:{label:"더 보기",onAction:()=>setCount(v=>v+6)}}:{})}/>;
 else if(kind==="editor"||(kind==="account"||kind==="collection")&&editing)screen=<EditorScreen {...base} submitPlacement={kind==="account"?"footer":"header"} title={kind==="account"?"프로필 수정":"기록 쓰기"} dirty={dirty} discard={discard} cancel={{label:"닫기",onAction:()=>{setTitle(snapshot.title);setBody(snapshot.body);setNicknameDraft(nickname);setBioDraft(bio);setPhotoDraft(photo);if(kind==="account"||kind==="collection")setEditing(false);else setClosed(true);}}} submit={{label:kind==="account"?"변경사항 저장":"저장",pending:busy,disabled:kind==="account"?!nicknameDraft.trim()||!dirty:!title.trim()||!body.trim(),onAction:()=>mutate(()=>{if(kind==="account"){setNickname(nicknameDraft.trim());setBio(bioDraft.trim());setPhoto(photoDraft);setEditing(false);}else{setSnapshot({title,body});setNotice("저장했어요.");if(kind==="collection"){setRecords(items=>[{id:String(Date.now()),title,type:"기록",description:"오늘 · 방금 작성"},...items]);setEditing(false);}}})}} draftStatus={draftStatus?<Text variant="caption" tone="muted">{draftStatus}</Text>:null}>
 <Stack gap="lg">{kind!=="account"?<Stack axis="inline" gap="sm" align="center"><Avatar decorative name={nickname} size={32}/><Stack gap="xxs"><Text emphasis="strong">{nickname}</Text><Text variant="caption" tone="muted">나만 보기 · 오늘</Text></Stack></Stack>:null}{kind==="account"?<ProfileEditFields name={nicknameDraft} bio={bioDraft} photo={photoDraft} onNameChange={setNicknameDraft} onBioChange={setBioDraft} onPhotoChange={setPhotoDraft} disabled={busy}/>:<><TextField label="제목" value={title} onValueChange={setTitle}/><TextArea label="내용" value={body} onValueChange={setBody} minVisibleLines={6}/></>}</Stack></EditorScreen>;
 else if(kind==="account")screen=profileDetail?<ScreenLayout title="게시물" leading={<Button tone="ghost" onPress={()=>setProfileDetail(null)}>뒤로</Button>}><Stack gap="lg"><PreviewPhoto/><Heading level="level4">{profileDetail}</Heading><Text>{body}</Text></Stack></ScreenLayout>:<><ProfileScreen {...base} title="jimin" actions={<IconButton label="계정 메뉴" tone="ghost" onPress={()=>setAccountOpen(true)}><Menu size={22}/></IconButton>} summary={<ProfileSummary name={nickname} bio={bio} photo={photo}/>} edit={{label:"프로필 수정",onAction:()=>{setNicknameDraft(nickname);setBioDraft(bio);setPhotoDraft(photo);setEditing(true);}}}><Stack gap="md"><Stack axis="inline" gap="md">{["게시물","저장됨"].map(value=><Button key={value} tone="ghost" selected={profileTab===value} onPress={()=>setProfileTab(value)}>{value}</Button>)}</Stack><Grid columns={{compact:3,expanded:3}} gap={{compact:"xxs"}}>{entries.slice(0,profileTab==="게시물"?6:2).map((entry,index)=><PhotoTile hideTitle key={entry.id} index={index} title={entry.title} onOpen={()=>setProfileDetail(entry.title)}/>)}</Grid></Stack></ProfileScreen><Sheet open={accountOpen} onOpenChange={setAccountOpen} title="계정" closeLabel="닫기" footer={<Stack gap="sm"><Button tone="ghost" onPress={()=>{setAccountOpen(false);setLogout(true);}}>로그아웃</Button></Stack>}><Stack gap="md"><ListRow title="연결된 계정" description="Apple · 이메일 비공개"/></Stack></Sheet><AlertDialog open={logout} onOpenChange={setLogout} request={{mode:"confirm",title:"로그아웃할까요?",description:"저장한 기록은 계정에 남아 있어요.",confirmLabel:"로그아웃",cancelLabel:"취소",onConfirm:()=>setClosed(true),fallbackErrorMessage:"로그아웃하지 못했어요."}}/></>;
 else if(kind==="moderation")screen=reported?<ScreenLayout title="신고를 접수했어요"><Stack gap="lg"><Text>내용을 검토한 뒤 필요한 조치를 진행할게요.</Text><Button onPress={()=>{setReported(false);setReason(null);}}>돌아가기</Button></Stack></ScreenLayout>:<ModerationScreen {...base} title="신고" description={reason?"선택한 내용을 확인해 주세요":"어떤 문제가 있나요?"} reasonPicker={reason?<ListRow title={{spam:"스팸 또는 광고",abuse:"괴롭힘 또는 혐오 표현",privacy:"개인정보 노출",other:"기타"}[reason]??"기타"} description="다른 사유 선택" trailing={<ChevronRight size={18}/>} onPress={()=>setReason(null)}/>:<Stack gap="xs">{[{id:"spam",label:"스팸 또는 광고"},{id:"abuse",label:"괴롭힘 또는 혐오 표현"},{id:"privacy",label:"개인정보 노출"},{id:"other",label:"기타"}].map(item=><ListRow key={item.id} title={item.label} trailing={<ChevronRight size={18}/>} onPress={()=>setReason(item.id)}/>)}</Stack>} reasonLabel="신고 사유" reasons={[{value:"spam",label:"스팸 또는 광고"},{value:"abuse",label:"괴롭힘 또는 혐오 표현"},{value:"privacy",label:"개인정보 노출"},{value:"other",label:"기타"}]} reason={reason} onReasonChange={setReason} submit={{label:"신고하기",pending:busy,onAction:()=>mutate(()=>setReported(true))}} block={{action:{label:blocked?"차단 해제":"이 사용자 차단",onAction:()=>{}},confirmation:{mode:"confirm",tone:"danger",title:blocked?"차단을 해제할까요?":"이 사용자를 차단할까요?",description:blocked?"이 사용자의 활동이 다시 표시돼요.":"이 사용자의 메시지와 활동을 숨겨요.",confirmLabel:blocked?"차단 해제":"차단",cancelLabel:"취소",onConfirm:()=>setBlocked(value=>!value),fallbackErrorMessage:"변경하지 못했어요."}}}><Stack gap="lg">{reason?<TextArea label="추가 설명 (선택)" value={body==="바쁜 하루에도 잠깐 멈출 수 있는 곳이 있더라고요."?"":body} onValueChange={setBody}/>:null}<Text tone="muted">{blocked?"현재 차단한 사용자예요.":"신고자의 정보는 상대에게 전달하지 않아요."}</Text></Stack></ModerationScreen>;
 else if(kind==="permission")screen=<PermissionScreen {...base} title={permission==="granted"?"알림이 켜졌어요":permission==="denied"?"알림을 다시 켜려면":"답글이 오면 알려드릴까요?"} status={permission} illustration={<Bell size={64} color={colors.contentBrand}/>} explanation={<PermissionPreview/>} request={{label:"알림 허용",onAction:()=>setPermission("granted")}} settings={{label:"기기 설정 열기",onAction:()=>setPermission("granted")}} continueAction={{label:"계속",onAction:()=>setClosed(true)}} skip={{label:"나중에",onAction:()=>setClosed(true)}}/>;
 else screen=<OnboardingScreen steps={[{id:"welcome",title:"작은 순간을 기록해요",description:"나만의 속도로 채우는 일상",content:<IntroPreview step={0}/>},{id:"interests",title:"어떤 이야기를 좋아하세요?",description:"여러 개 골라도 되고 나중에 정해도 돼요",content:<Stack axis="inline" wrap gap="xs">{onboardingCopy.topics.map(topic=><Chip key={topic.id} label={topic.label} selectionMode="multiple" selected={topics.includes(topic.id)} onPress={()=>setTopics(current=>toggleOnboardingTopic(current,topic.id))}/>)}</Stack>},{id:"ready",title:"함께 시작해요",description:"언제든 내 취향에 맞게 바꿀 수 있어요",content:<Stack gap="lg"><IntroPreview step={2}/><Text>{topics.length?`${onboardingSummary(topics)} 이야기를 준비했어요.`:onboardingCopy.empty}</Text>{notice?<Notice tone="danger" announcement="assertive" title={notice} action={<Button tone="secondary" size="small" disabled={busy} onPress={finishOnboarding}>다시 시도</Button>}/>:null}</Stack>}]} index={step} onIndexChange={setStep} nextLabel="다음" backLabel="이전" complete={{label:"시작하기",pending:busy,onAction:finishOnboarding}} skip={{label:"건너뛰기",onAction:()=>setClosed(true)}} progressLabel={(index,total)=>`${index} / ${total}`}/>;
 return <Stack gap="sm">{tools&&kind!=="permission"?<Button tone="ghost" onPress={()=>setFailNext(true)}>{failNext?"다음 저장 실패 예약됨":"다음 저장 실패"}</Button>:null}<View style={{height:720}}>{screen}</View></Stack>;
}
export function CollectionFlowPreview(props:Props){return <FlowPreview kind="collection" {...props}/>;}
export function EditorFlowPreview(props:Props){return <FlowPreview kind="editor" {...props}/>;}
export function AccountFlowPreview(props:Props){return <FlowPreview kind="account" {...props}/>;}
export function ModerationFlowPreview(props:Props){return <FlowPreview kind="moderation" {...props}/>;}
export function MediaFlowPreview(props:Props){return <View style={{height:720}}><MediaPickerPreview {...props}/></View>;}
export function PermissionFlowPreview(props:Props){return <FlowPreview kind="permission" {...props}/>;}
export function OnboardingFlowPreview(props:Props){return <FlowPreview kind="onboarding" {...props}/>;}
