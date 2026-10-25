"use client";
import { useEffect,useRef,useState,type ReactNode } from "react";
import { validateReplyTarget,type ReplyTarget,type SearchResponse } from "@hjmds/design-contracts/communication";
import { ChatMessage,MessageComposer,ScreenLayout,type ChatMessageProps,type MessageComposerProps } from "./screens.js";
import { SearchScreen,type SearchRecentQueries } from "./screen-flows.js";
import { Button,IconButton } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { Stack,Text } from "./layout.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { canSubmitChatRoom,filterChatRoomMembers,selectedChatRoomMembers,type ChatRoomProfileValue,type ChatRoomMember,type ChatRoomConfirmation,type ChatRoomMemberActions,type ChatRoomMemberSearch,type ChatRoomSelectionLabels } from "@hjmds/design-contracts/communication";
import { chatRoomRecipe,resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import type { CharacterCountOptions } from "@hjmds/design-contracts/character-count";
import { Avatar } from "./advanced-display.js";
import { ListRow } from "./display.js";
import { AlertDialog,Menu } from "./overlays.js";
import { TextField,SearchField } from "./forms.js";
import { Checkbox } from "./selection.js";

export type ReplyMessageProps = Omit<ChatMessageProps,"replyAction"|"timestampPresentation"> & Readonly<{
 messageId: string; onReply: (messageId:string)=>void; replyLabel: string; replyDisabled?: boolean;
 /** A drag has one owner: reply, or time reveal. Accessible reply stays available in either mode. */
 swipeAction?: "reply"|"timestamp";
}>;
export function ReplyMessage({messageId,onReply,replyLabel,replyDisabled=false,swipeAction="reply",...message}:ReplyMessageProps){
 if(!messageId.trim())throw new TypeError("Reply message requires the actual message ID");
 return <ChatMessage {...message} timestampPresentation={swipeAction==="timestamp"?"swipe":"always"} replyAction={{label:replyLabel,onPress:()=>onReply(messageId),disabled:replyDisabled}}/>;
}
export type ReplyComposerProps=Omit<MessageComposerProps,"onSend"|"replyTo"|"pending"|"error"> & Readonly<{
 replyTarget: ReplyTarget|null; onReplyCancel:()=>void; cancelReplyLabel:string; errorLabel:string;
 /** Resolve only after the actual send acknowledgement. The controlled draft is never cleared here. */
 onSend:(value:string,context:Readonly<{replyToId:string|null}>)=>void|Promise<void>;
}>;
export function ReplyComposer({replyTarget,onReplyCancel,cancelReplyLabel,errorLabel,onSend,...composer}:ReplyComposerProps){
 validateReplyTarget(replyTarget);const action=useCompositionAction(composer.disabled);
 return <Stack gap="sm"><MessageComposer {...composer} pending={action.pending}
 {...(replyTarget?{replyTo:{author:replyTarget.author,excerpt:replyTarget.excerpt,cancelLabel:cancelReplyLabel,onCancel:onReplyCancel}}:{})}
 onSend={value=>{const id=replyTarget?.id??null;void action.run("send",()=>onSend(value,{replyToId:id}));}}/>
 {action.failed?<Text role="alert" tone="danger" style={{textAlign:"center"}}>{errorLabel}</Text>:null}</Stack>;
}
export type ExpandableSearchProps<T>=Readonly<{
 expanded:boolean;onExpandedChange:(expanded:boolean)=>void;query:string;onQueryChange:(query:string)=>void;
 onSearch:(query:string,context:Readonly<{signal:AbortSignal}>)=>Promise<SearchResponse<T>>;
 renderResult:(result:T)=>ReactNode;onSubmit?:(query:string)=>void;recentQueries?:SearchRecentQueries;debounceMs?:number;disabled?:boolean;
 labels:Readonly<{title:string;open:string;cancel:string;query:string;clear:string;searching:string;error:string;commit:(query:string)=>string;suggestionCount:(count:number)=>string}>;
}>;
export function ExpandableSearch<T>(props:ExpandableSearchProps<T>){
 const [snapshot,setSnapshot]=useState<Readonly<{query:string;response:SearchResponse<T>}>|null>(null),[pending,setPending]=useState(false),[failed,setFailed]=useState(false),[committed,setCommitted]=useState("");
 const latest=useRef(props);latest.current=props;const generation=useRef(0),controller=useRef<AbortController|null>(null);
 const host=useRef<HTMLDivElement>(null),opener=useRef<HTMLButtonElement>(null),restore=useRef(false);
 useEffect(()=>{if(!props.expanded){controller.current?.abort();generation.current++;setPending(false);setCommitted("");}},[props.expanded]);
 useEffect(()=>()=>{generation.current++;controller.current?.abort();},[]);
 useEffect(()=>{if(props.expanded)host.current?.querySelector("input")?.focus();else if(restore.current){opener.current?.focus();restore.current=false;}},[props.expanded]);
 const search=(query:string,{signal}:Readonly<{signal:AbortSignal}>)=>{
  controller.current?.abort();const token=++generation.current,request=new AbortController();controller.current=request;
  const abort=()=>request.abort();signal.addEventListener("abort",abort,{once:true});if(signal.aborted)request.abort();
  // Some adapters ignore abort; generation and current-query checks still prevent stale UI writes.
  const valid=()=>!request.signal.aborted&&token===generation.current&&latest.current.expanded&&latest.current.query===query;
  if(!query.trim()){setSnapshot(null);setPending(false);setFailed(false);signal.removeEventListener("abort",abort);return;}
  setPending(true);setFailed(false);
  const execute=latest.current.onSearch;
  void Promise.resolve().then(()=>request.signal.aborted?null:execute(query,{signal:request.signal})).then(response=>{if(valid()&&response)setSnapshot({query,response});},()=>{if(valid())setFailed(true);}).finally(()=>{signal.removeEventListener("abort",abort);if(valid())setPending(false);});
 };
 const cancel=()=>{controller.current?.abort();generation.current++;setPending(false);restore.current=true;props.onExpandedChange(false);};
 const commit=(query:string)=>{const normalized=resolveSearchCommit(query);if(normalized===null)return;setCommitted(normalized);props.onSubmit?.(normalized);};
 const current=snapshot?.query===props.query?snapshot.response:null;
 // Opening and closing are tool actions: a search icon at the area's end, and the search screen's own header-leading
 // close exit. A full-width primary "Expand" button and a text "Close" button read as product actions (2026-10-17 review).
 return <Stack ref={host} gap="sm">{!props.expanded?<IconButton ref={opener} label={props.labels.open} tone="ghost" disabled={props.disabled===true} layoutStyle={{alignSelf:"flex-end"}} onClick={()=>props.onExpandedChange(true)}><Icon name="search" /></IconButton>:<>
 <SearchScreen title={props.labels.title} titleVisibility="hidden" exit={{kind:"close",label:props.labels.cancel,onClick:cancel}} queryLabel={props.labels.query} queryClearLabel={props.labels.clear} query={props.query} onQueryChange={props.onQueryChange} onSearch={search}
 {...(props.debounceMs===undefined?{}:{debounceMs:props.debounceMs})} {...(props.recentQueries?{recentQueries:props.recentQueries}:{})}
 committedQuery={committed} onSubmit={commit} searching={pending} searchingLabel={props.labels.searching}
 suggestions={{items:current?.suggestions??[],commitLabel:props.labels.commit,countLabel:props.labels.suggestionCount}}>
 {current?props.renderResult(current.result):null}
 </SearchScreen>{failed?<Text role="alert" tone="danger" style={{textAlign:"center"}}>{props.labels.error}</Text>:null}</>}</Stack>;
}

/*
  Room management (2026-10-23 redesign, chatRoomRecipe). Function and placement follow the compared Telegram, KakaoTalk
  and WhatsApp screens; color, type and spacing stay HJM tokens and the product theme.
*/
type Exit=Readonly<{label:string;onPress:()=>void}>;
const photoOf=(url?:string|null)=>url?{src:url}:{};

export type ChatRoomProfileProps = Readonly<{
 value: ChatRoomProfileValue; onValueChange: (value: ChatRoomProfileValue) => void;
 onSave: (value: ChatRoomProfileValue) => void | Promise<void>;
 /** The product picks/uploads the image and returns its persistent URL; null means cancellation. */
 onPickPhoto?: () => Promise<string | null>;
 presentation?:"centered"|"inline"; title:string; back?:Exit;
 /** Live count under the name field (KakaoTalk 0/20); the product owns the limit its server accepts and the locale. */
 nameCharacterCount?: CharacterCountOptions;
 disabled?: boolean; submitDisabled?: boolean; children?: ReactNode | ((disabled: boolean) => ReactNode);
 labels: Readonly<{ name: string; description: string; photo: string; changePhoto: string; removePhoto: string; save: string; error: string; photoError: string }>;
}>;
export function ChatRoomProfile({value,onValueChange,onSave,onPickPhoto,disabled=false,submitDisabled=false,presentation="centered",title,back,nameCharacterCount,children,labels}:ChatRoomProfileProps){
 // Photo upload and save fail for different reasons, so each keeps its own state and message.
 const save=useCompositionAction(disabled),photo=useCompositionAction(disabled);const blocked=disabled||save.pending||photo.pending;
 const latest=useRef({value,onValueChange});latest.current={value,onValueChange};
 const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const patch=(change:Partial<ChatRoomProfileValue>)=>onValueChange({...value,...change});
 // A new room has no identity yet; its photo slot is decorative until a name exists.
 const identity=value.name.trim()?{name:value.name,alt:labels.photo}:{decorative:true as const,renderFallback:()=><Icon name="users" tone="secondary"/>};
 const avatar=(accessory?:ReactNode)=><Avatar {...photoOf(value.photoUrl)} size={chatRoomRecipe.heroAvatar} {...identity} {...(accessory?{accessory}:{})}/>;
 const inline=presentation==="inline";
 return <ScreenLayout title={title} {...(back?{exit:{kind:"back" as const,label:back.label,onClick:back.onPress}}:{})} actions={<Button tone="ghost" disabled={blocked||submitDisabled||!canSubmitChatRoom(value)} loading={save.pending} onClick={()=>void save.run("save",()=>onSave(value))}>{labels.save}</Button>}><Stack gap="md">
 <Stack axis={inline?"inline":"block"} align="center" gap="md">
 <Stack align="center" gap="xs">{onPickPhoto?<button type="button" className="hjm-chat-room__photo" aria-label={labels.changePhoto} aria-busy={photo.pending} disabled={blocked} onClick={()=>void photo.run("photo",async()=>{const url=await onPickPhoto();if(url!==null&&mounted.current)latest.current.onValueChange({...latest.current.value,photoUrl:url});})}>{avatar(<span className="hjm-chat-room__badge"><Icon name="edit" size="xs"/></span>)}</button>:avatar()}
 {onPickPhoto&&value.photoUrl&&!inline?<Button tone="ghost" size="small" disabled={blocked} onClick={()=>patch({photoUrl:null})}>{labels.removePhoto}</Button>:null}</Stack>
 <Stack gap="xs" layoutStyle={inline?{flex:1,minWidth:0}:{alignSelf:"stretch"}}><TextField label={labels.name} value={value.name} onValueChange={name=>patch({name})} disabled={blocked} {...(nameCharacterCount?{characterCount:nameCharacterCount}:{})}/></Stack></Stack>
 {onPickPhoto&&value.photoUrl&&inline?<Button tone="ghost" size="small" disabled={blocked} layoutStyle={{alignSelf:"flex-start"}} onClick={()=>patch({photoUrl:null})}>{labels.removePhoto}</Button>:null}
 <TextField label={labels.description} value={value.description} onValueChange={description=>patch({description})} disabled={blocked}/>
 {photo.failed?<Text role="alert" tone="danger">{labels.photoError}</Text>:null}
 {save.failed?<Text role="alert" tone="danger">{labels.error}</Text>:null}
 {typeof children==="function"?children(blocked):children}
 </Stack></ScreenLayout>;
}

export type ChatRoomMembersProps = Readonly<{
 members: readonly ChatRoomMember[]; title: string; emptyLabel: string;
 /** Shown beside the title ("3"); the product formats it. */
 countLabel?: string;
 onSelectionChange?: (id:string,selected:boolean)=>void; disabled?:boolean;
 /** Row above the list that opens the product's invite route (Telegram "Add Members"). Omit without permission. */
 invite?: Exit;
 /** Omit actions without permission. The product owns roles and server authorization. */
 renderActions?: (member:ChatRoomMember)=>ReactNode;
 memberActions?: ChatRoomMemberActions;
 /** Ordinary member rows open the member profile; selection pickers keep their selection behavior. */
 memberProfile?: Readonly<{label(member:ChatRoomMember):string;onPress(member:ChatRoomMember):void}>;
}>;
export function ChatRoomMembers({members,title,emptyLabel,countLabel,onSelectionChange,disabled=false,invite,renderActions,memberActions,memberProfile}:ChatRoomMembersProps){
 const leading=(member:ChatRoomMember)=><Avatar size={chatRoomRecipe.memberAvatar} {...photoOf(member.photoUrl)} name={member.name} decorative/>;
 return <Stack gap="xs"><div className="hjm-chat-room__heading"><Text variant="label">{title}</Text>{countLabel?<Text variant="label" tone="brand">{countLabel}</Text>:null}</div>
 {invite?<ListRow title={invite.label} tone="brand" leading={<span className="hjm-chat-room__add"><Icon name="add" size="sm"/></span>} disabled={disabled} onClick={invite.onPress}/>:null}
 {members.length===0?<Text tone="muted">{emptyLabel}</Text>:members.map(member=>onSelectionChange?
 <Checkbox key={member.id} presentation="plain" label={member.name} {...(member.detail?{description:member.detail}:{})} renderLeading={()=>leading(member)} checked={member.selected===true} disabled={disabled||member.disabled===true} onCheckedChange={selected=>onSelectionChange(member.id,selected)} layoutStyle={{width:"100%"}}/>:
 <ListRow key={member.id} title={member.name} {...(member.detail?{description:member.detail}:{})} leading={leading(member)} {...(memberProfile?{leadingAction:{label:memberProfile.label(member),onPress:()=>memberProfile.onPress(member)},onClick:()=>memberProfile.onPress(member)}:{})} {...(member.role?{trailing:<Text variant="caption" tone="brand">{member.role}</Text>}:{})}
 trailingAction={<>{memberActions?<RoomActionList actions={memberActions.items(member)} disabled={disabled} menu={{label:memberActions.label(member),dismissLabel:memberActions.dismissLabel}}/>:null}{renderActions?.(member)}</>}/> )}</Stack>;
}

/** People picked so far, kept visible above the list while the search narrows it; tapping one deselects it. */
function SelectedMembers({members,labels,onRemove,disabled}:{members:readonly ChatRoomMember[];labels:ChatRoomSelectionLabels;onRemove:(id:string)=>void;disabled:boolean}){
 if(members.length===0)return null;
 return <ul className="hjm-chat-room__selected" aria-label={labels.count(members.length)}>{members.map(member=><li key={member.id}>
 <button type="button" className="hjm-chat-room__selected-item" aria-label={labels.remove(member)} disabled={disabled} onClick={()=>onRemove(member.id)}>
 <Avatar size={chatRoomRecipe.selectedAvatar} {...photoOf(member.photoUrl)} name={member.name} decorative accessory={<span className="hjm-chat-room__badge" data-tone="neutral"><Icon name="close" size="xs"/></span>}/>
 <Text variant="caption" className="hjm-chat-room__selected-name">{member.name}</Text></button></li>)}</ul>;
}
type MemberPickerProps=Readonly<{members:readonly ChatRoomMember[];title:string;emptyLabel:string;search:ChatRoomMemberSearch;selection:ChatRoomSelectionLabels;onSelectionChange:(id:string,selected:boolean)=>void;disabled:boolean}>;
function MemberPicker({members,title,emptyLabel,search,selection,onSelectionChange,disabled}:MemberPickerProps){
 const [localQuery,setLocalQuery]=useState("");
 // A product that searches its server owns the query and the result list; otherwise names are filtered here.
 const remote=search.onQueryChange!==undefined,query=remote?search.query??"":localQuery;
 const selected=selectedChatRoomMembers(members);
 return <Stack gap="sm">
 <SearchField placeholder={search.label} aria-label={search.label} clearLabel={search.clearLabel} loading={search.searching===true} value={query} onValueChange={remote?search.onQueryChange!:setLocalQuery}/>
 <SelectedMembers members={selected} labels={selection} onRemove={id=>onSelectionChange(id,false)} disabled={disabled}/>
 <ChatRoomMembers members={remote?members:filterChatRoomMembers(members,query)} title={title} {...(selected.length>0?{countLabel:selection.count(selected.length)}:{})} emptyLabel={emptyLabel} onSelectionChange={onSelectionChange} disabled={disabled}/></Stack>;
}

export type ChatRoomCreateProps = Omit<ChatRoomProfileProps,"onSave"|"children"|"title"|"back"|"presentation"> & Readonly<{
 members: readonly ChatRoomMember[]; onSelectionChange:(id:string,selected:boolean)=>void;
 membersLabel:string; emptyMembersLabel:string; nextLabel:string; backLabel:string; title:string;
 search:ChatRoomMemberSearch; selection:ChatRoomSelectionLabels; onCancel?:()=>void;
 onCreate:(value:ChatRoomProfileValue,memberIds:readonly string[])=>void|Promise<void>;
}>;
export function ChatRoomCreate({members,onSelectionChange,membersLabel,emptyMembersLabel,onCreate,disabled=false,nextLabel,backLabel,title,search,selection,onCancel,...profile}:ChatRoomCreateProps){
 const [stage,setStage]=useState<"members"|"profile">("members");
 const selected=selectedChatRoomMembers(members),ids=selected.map(member=>member.id);
 if(stage==="members")return <ScreenLayout title={title} {...(onCancel?{exit:{kind:"close" as const,label:backLabel,onClick:onCancel}}:{})}
 actions={<Button tone="ghost" disabled={disabled||ids.length===0} onClick={()=>setStage("profile")}>{nextLabel}</Button>}>
 <MemberPicker members={members} title={membersLabel} emptyLabel={emptyMembersLabel} search={search} selection={selection} onSelectionChange={onSelectionChange} disabled={disabled}/></ScreenLayout>;
 return <ChatRoomProfile {...profile} presentation="inline" title={title} back={{label:backLabel,onPress:()=>setStage("members")}} disabled={disabled} onSave={value=>{if(!canSubmitChatRoom(value,ids))return;return onCreate(value,ids);}} submitDisabled={!canSubmitChatRoom(profile.value,ids)}>
 {blocked=><ChatRoomMembers members={selected} title={membersLabel} countLabel={selection.count(selected.length)} emptyLabel={emptyMembersLabel} disabled={blocked}/>}
 </ChatRoomProfile>;
}

export type ChatRoomActionsProps = Readonly<{
 /** Local history deletion and membership exit are deliberately separate actions. */
 leave?:ChatRoomConfirmation; deleteHistory?:ChatRoomConfirmation; deleteRoom?:ChatRoomConfirmation;
 disabled?:boolean;
}>;
export function ChatRoomActions({leave,deleteHistory,deleteRoom,disabled=false}:ChatRoomActionsProps){
 const [active,setActive]=useState<ChatRoomConfirmation|null>(null);
 // Exits are full-width buttons; local history deletion is secondary, leaving or deleting the room is danger.
 const items=([[deleteHistory,"secondary"],[leave,"danger"],[deleteRoom,"danger"]] as const).filter((item):item is readonly [ChatRoomConfirmation,"secondary"|"danger"]=>Boolean(item[0]));
 if(items.length===0)return null;
 return <Stack gap="xs">{items.map(([item,tone])=><Button key={item.label} tone={tone} disabled={disabled||active!==null} layoutStyle={{alignSelf:"stretch"}} onClick={()=>setActive({...item,destructive:true})}>{item.label}</Button>)}
 {active?<RoomConfirmDialog action={active} onClose={()=>setActive(null)}/>:null}</Stack>;
}
function RoomConfirmDialog({action,onClose}:{action:ChatRoomConfirmation;onClose:()=>void}){
 return <AlertDialog open onOpenChange={open=>{if(!open)onClose();}} request={{mode:"confirm",tone:action.destructive?"danger":"attention",title:action.title,description:action.description,confirmLabel:action.confirmLabel,cancelLabel:action.cancelLabel,fallbackErrorMessage:action.errorLabel,onConfirm:action.onConfirm}}/>;
}
function RoomActionList({actions,disabled=false,menu}:{actions:readonly ChatRoomConfirmation[];disabled?:boolean;menu:Readonly<{label:string;dismissLabel:string}>}){
 const [active,setActive]=useState<ChatRoomConfirmation|null>(null);
 if(actions.length===0)return null;
 const dialog=active?<RoomConfirmDialog action={active} onClose={()=>setActive(null)}/>:null;
 return <><Menu label={menu.label} trigger={<IconButton label={menu.label} tone="ghost"><Icon name="more"/></IconButton>} presentation="anchored" align="end" disabled={disabled||active!==null} dismissLabel={menu.dismissLabel} items={actions.map((action,index)=>({id:String(index),label:action.label,...(action.destructive?{tone:"danger" as const}:{})}))} onActionAfterDismiss={id=>setActive(actions[Number(id)]??null)}/>{dialog}</>;
}

/** `pressed` makes the tile a toggle (mute): its surface and the product icon show the current state. */
export type ChatRoomTool = Readonly<{id:string;label:string;icon?:ReactNode;pressed?:boolean;onPress:()=>void|Promise<void>}>;
export type ChatRoomDetailsProps = Readonly<{
 profile: ChatRoomProfileValue; back?:Exit; photoLabel:string; memberCountLabel:string;
 edit?:Exit;
 /** Search, shared media, invite and notification settings use product-owned routes. */
 tools?:readonly ChatRoomTool[];
 members:ChatRoomMembersProps; actions?:ChatRoomActionsProps; errorLabel:string;
}>;
export function ChatRoomDetails({profile,back,photoLabel,memberCountLabel,edit,tools=[],members,actions,errorLabel}:ChatRoomDetailsProps){
 const action=useCompositionAction();
 return <ScreenLayout title={profile.name} titleVisibility="hidden" {...(back?{exit:{kind:"back" as const,label:back.label,onClick:back.onPress}}:{})} actions={edit?<Button tone="ghost" onClick={edit.onPress}>{edit.label}</Button>:null}>
 <Stack gap="lg"><Stack align="center" gap="sm">
 <Avatar {...photoOf(profile.photoUrl)} size={chatRoomRecipe.heroAvatar} alt={photoLabel} name={profile.name}/>
 <Stack align="center" gap="xxs"><Text variant="title" className="hjm-chat-room__name">{profile.name}</Text><Text tone="muted">{memberCountLabel}</Text></Stack>
 </Stack>{tools.length>0?<div className="hjm-chat-room__tools">{tools.map(tool=><button key={tool.id} type="button" className="hjm-chat-room__tool" disabled={action.pending} aria-busy={action.active===tool.id} {...(tool.pressed===undefined?{}:{"aria-pressed":tool.pressed})} onClick={()=>void action.run(tool.id,tool.onPress)}><Stack align="center" gap="xs">{tool.icon}<Text variant="caption" tone="brand">{tool.label}</Text></Stack></button>)}</div>:null}
 {action.failed?<Text role="alert" tone="danger">{errorLabel}</Text>:null}
 {profile.description?<Text>{profile.description}</Text>:null}
 <ChatRoomMembers {...members}/>{actions?<ChatRoomActions {...actions}/>:null}</Stack></ScreenLayout>;
}

export type ChatRoomInviteProps = Readonly<{
 members: readonly ChatRoomMember[]; title: string; membersLabel: string; emptyLabel: string;
 onSelectionChange:(id:string,selected:boolean)=>void;
 onInvite:(memberIds:readonly string[])=>void|Promise<void>;
 search:ChatRoomMemberSearch; selection:ChatRoomSelectionLabels;
 back?:Exit; confirmLabel:string; errorLabel:string; disabled?:boolean;
}>;
export function ChatRoomInvite({members,title,membersLabel,emptyLabel,onSelectionChange,onInvite,search,selection,back,confirmLabel,errorLabel,disabled=false}:ChatRoomInviteProps){
 const action=useCompositionAction(disabled),ids=selectedChatRoomMembers(members).map(member=>member.id),blocked=disabled||action.pending;
 return <ScreenLayout title={title} {...(back?{exit:{kind:"close" as const,label:back.label,onClick:back.onPress}}:{})}
 actions={<Button tone="ghost" disabled={blocked||ids.length===0} loading={action.pending} onClick={()=>void action.run("invite",()=>onInvite(ids))}>{confirmLabel}</Button>}><Stack gap="md">
 <MemberPicker members={members} title={membersLabel} emptyLabel={emptyLabel} search={search} selection={selection} onSelectionChange={onSelectionChange} disabled={blocked}/>
 {action.failed?<Text role="alert" tone="danger">{errorLabel}</Text>:null}</Stack></ScreenLayout>;
}
