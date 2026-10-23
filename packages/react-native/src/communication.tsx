import type { ComponentRef } from "react";
"use client";
import { useEffect,useRef,useState,type ReactNode } from "react";
import { resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import { validateReplyTarget,type ReplyTarget,type SearchResponse } from "@hjmds/design-contracts/communication";
import { ChatMessage,MessageComposer,type ChatMessageProps,type MessageComposerProps } from "./screens.js";
import { SearchScreen,type SearchRecentQueries } from "./screen-flows.js";
import { Button,IconButton } from "./actions.js";
import { glyph } from "@hjmds/design-contracts/foundations";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnSearch } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { Stack,Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { Keyboard,type TextInput } from "react-native";
import { SearchField } from "./inputs.js";
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
 {action.failed?<Text accessibilityRole="alert" accessibilityLiveRegion="assertive" tone="danger" align="center">{errorLabel}</Text>:null}</Stack>;
}
export type ExpandableSearchProps<T>=Readonly<{
 expanded:boolean;onExpandedChange:(expanded:boolean)=>void;query:string;onQueryChange:(query:string)=>void;
 onSearch:(query:string,context:Readonly<{signal:AbortSignal}>)=>Promise<SearchResponse<T>>;
 renderResult:(result:T)=>ReactNode;onSubmit?:(query:string)=>void;recentQueries?:SearchRecentQueries;debounceMs?:number;disabled?:boolean;
 labels:Readonly<{title:string;open:string;cancel:string;query:string;clear:string;searching:string;error:string;commit:(query:string)=>string;suggestionCount:(count:number)=>string}>;
}>;
export function ExpandableSearch<T>(props:ExpandableSearchProps<T>){
 const [snapshot,setSnapshot]=useState<Readonly<{query:string;response:SearchResponse<T>}>|null>(null),[pending,setPending]=useState(false),[failed,setFailed]=useState(false),[committed,setCommitted]=useState("");
 const latest=useRef(props);latest.current=props;const input=useRef<ComponentRef<typeof TextInput>>(null),generation=useRef(0),controller=useRef<AbortController|null>(null);

 useEffect(()=>{if(!props.expanded){controller.current?.abort();generation.current++;setPending(false);setCommitted("");}},[props.expanded]);
 useEffect(()=>()=>{generation.current++;controller.current?.abort();},[]);

 useEffect(()=>{if(props.expanded)input.current?.focus();},[props.expanded]);
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
 const cancel=()=>{controller.current?.abort();generation.current++;setPending(false);Keyboard.dismiss();props.onExpandedChange(false);};
 const commit=(query:string)=>{const normalized=resolveSearchCommit(query);if(normalized===null)return;setCommitted(normalized);props.onSubmit?.(normalized);};
 const current=snapshot?.query===props.query?snapshot.response:null;
 const glyphColor=resolveIconButtonPresentation("ghost",useHjmNativeTheme().palette,false).content;
 // Opening and closing are tool actions, as on Web: a search icon at the area's end, and the search screen's own
 // header-leading close exit instead of a full-width primary button and a text close button (2026-10-17 review).
 return <Stack gap="sm">{!props.expanded?<IconButton label={props.labels.open} tone="ghost" disabled={props.disabled===true} layoutStyle={{alignSelf:"flex-end"}} onPress={()=>props.onExpandedChange(true)}><DrawnSearch size={glyph.sm} color={glyphColor} /></IconButton>:<>
 <SearchScreen title={props.labels.title} titleVisibility="hidden" exit={{kind:"close",label:props.labels.cancel,onPress:cancel}} queryLabel={props.labels.query} queryField={<SearchField ref={input} label={props.labels.query} clearLabel={props.labels.clear} busyLabel={props.labels.searching} value={props.query} onValueChange={props.onQueryChange} busy={pending} onSubmitEditing={()=>commit(props.query)} returnKeyType="search"/>} query={props.query} onQueryChange={props.onQueryChange} onSearch={search}
 {...(props.debounceMs===undefined?{}:{debounceMs:props.debounceMs})} {...(props.recentQueries?{recentQueries:props.recentQueries}:{})}
 committedQuery={committed} onSubmit={commit} searching={pending} searchingLabel={props.labels.searching}
 suggestions={{items:current?.suggestions??[],commitLabel:props.labels.commit,countLabel:props.labels.suggestionCount}}>
 {current?props.renderResult(current.result):null}
 </SearchScreen>{failed?<Text accessibilityRole="alert" accessibilityLiveRegion="assertive" tone="danger" align="center">{props.labels.error}</Text>:null}</>}</Stack>;
}

import { canSubmitChatRoom,type ChatRoomProfileValue,type ChatRoomMember,type ChatRoomConfirmation } from "@hjmds/design-contracts/communication";
import { Avatar,ListRow } from "./data-display.js";
import { AlertDialog } from "./overlays.js";
import { Menu,TopBar } from "./navigation.js";
import { View,Pressable } from "react-native";
import { spacing,radius } from "@hjmds/design-contracts/foundations";
import { TextField,Checkbox } from "./inputs.js";

export type ChatRoomProfileProps = Readonly<{
 value: ChatRoomProfileValue; onValueChange: (value: ChatRoomProfileValue) => void;
 onSave: (value: ChatRoomProfileValue) => void | Promise<void>;
 /** The product picks/uploads the image and returns its persistent URL; null means cancellation. */
 onPickPhoto?: () => Promise<string | null>;
 presentation?:"centered"|"inline"; title?:string; back?:Readonly<{label:string;onPress:()=>void}>;
 disabled?: boolean; submitDisabled?: boolean; children?: ReactNode | ((disabled: boolean) => ReactNode);
 labels: Readonly<{ name: string; description: string; photo: string; changePhoto: string; removePhoto: string; save: string; error: string }>;
}>;
export function ChatRoomProfile({value,onValueChange,onSave,onPickPhoto,disabled=false,submitDisabled=false,presentation="centered",title,back,children,labels}:ChatRoomProfileProps){
 const action=useCompositionAction(disabled);const blocked=disabled||action.pending;
 const latest=useRef({value,onValueChange});latest.current={value,onValueChange};
 const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const patch=(change:Partial<ChatRoomProfileValue>)=>onValueChange({...value,...change});
 // A new room has no identity yet; its photo slot is decorative until a name exists.
 return <Stack gap="md">
 <TopBar {...(title?{title}:{})} {...(back?{exit:{kind:"back" as const,label:back.label,onPress:back.onPress}}:{})} actions={<Button tone="ghost" disabled={blocked||submitDisabled||!canSubmitChatRoom(value)} loading={action.active==="save"} onPress={()=>void action.run("save",()=>onSave(value))}>{labels.save}</Button>}/>
 <Stack axis={presentation==="inline"?"inline":"block"} align={presentation==="inline"?"center":"stretch"} gap="md"><Stack align="center" gap="xs">{onPickPhoto?<Pressable accessibilityRole="button" accessibilityLabel={labels.changePhoto} disabled={blocked} onPress={()=>void action.run("photo",async()=>{const url=await onPickPhoto!();if(url!==null&&mounted.current)latest.current.onValueChange({...latest.current.value,photoUrl:url});})}><Avatar {...(value.photoUrl?{source:{uri:value.photoUrl}}:{})} size="xlarge" {...(value.name.trim()?{name:value.name,accessibilityLabel:labels.photo}:{decorative:true as const,renderFallback:()=> <Text>＋</Text>})}/></Pressable>:<Avatar {...(value.photoUrl?{source:{uri:value.photoUrl}}:{})} size="xlarge" {...(value.name.trim()?{name:value.name,accessibilityLabel:labels.photo}:{decorative:true as const,renderFallback:()=> <Text>＋</Text>})}/>}
 {onPickPhoto&&value.photoUrl?<Button tone="ghost" size="small" disabled={blocked} onPress={()=>patch({photoUrl:null})}>{labels.removePhoto}</Button>:null}</Stack>
<Stack gap="xs" layoutStyle={{flex:1}}><TextField label={labels.name} value={value.name} onValueChange={name=>patch({name})} disabled={blocked}/></Stack></Stack>
 <TextField label={labels.description} value={value.description} onValueChange={description=>patch({description})} disabled={blocked}/>
 {typeof children==="function"?children(blocked):children}
 {action.failed?<Text accessibilityRole="alert" tone="danger">{labels.error}</Text>:null}
 </Stack>;
}
export type ChatRoomMembersProps = Readonly<{
 members: readonly ChatRoomMember[]; title: string; emptyLabel: string;
 onSelectionChange?: (id:string,selected:boolean)=>void; disabled?:boolean;
 /** Omit actions without permission. The product owns roles and server authorization. */
 renderActions?: (member:ChatRoomMember)=>ReactNode;
 actions?: (member:ChatRoomMember)=>readonly ChatRoomConfirmation[];
}>;
export function ChatRoomMembers({members,title,emptyLabel,onSelectionChange,disabled=false,renderActions,actions}:ChatRoomMembersProps){
 return <Stack gap="sm"><Text variant="label">{title}</Text>{members.length===0?<Text tone="muted">{emptyLabel}</Text>:members.map(member=>onSelectionChange?
 <Checkbox key={member.id} presentation="plain" label={member.name} {...(member.detail?{description:member.detail}:{})} renderLeading={()=><Avatar size="medium" {...(member.photoUrl?{source:{uri:member.photoUrl}}:{})} name={member.name} decorative/>} checked={member.selected===true} disabled={disabled||member.disabled===true} onCheckedChange={selected=>onSelectionChange(member.id,selected)} layoutStyle={{width:"100%"}}/>:
 <ListRow key={member.id} title={member.name} {...(member.detail?{description:member.detail}:{})} leading={<Avatar size="medium" {...(member.photoUrl?{source:{uri:member.photoUrl}}:{})} name={member.name} decorative/>} trailingAction={<>{actions?<RoomActionList actions={actions(member)} disabled={disabled} menuLabel={member.name}/>:null}{renderActions?.(member)}</>}/> )}</Stack>;
}
export type ChatRoomCreateProps = Omit<ChatRoomProfileProps,"onSave"|"children"|"title"|"back"> & Readonly<{
 members: readonly ChatRoomMember[]; onSelectionChange:(id:string,selected:boolean)=>void;
 membersLabel:string; emptyMembersLabel:string; nextLabel:string; backLabel:string; title:string;
 searchLabel:string; clearSearchLabel:string; searchBusyLabel:string; onCancel?:()=>void;
 onCreate:(value:ChatRoomProfileValue,memberIds:readonly string[])=>void|Promise<void>;
}>;
export function ChatRoomCreate({members,onSelectionChange,membersLabel,emptyMembersLabel,onCreate,disabled=false,nextLabel,backLabel,title,searchLabel,clearSearchLabel,searchBusyLabel,onCancel,...profile}:ChatRoomCreateProps){
 const [stage,setStage]=useState<"members"|"profile">("members"),[query,setQuery]=useState("");
 const ids=members.filter(member=>member.selected&&!member.disabled).map(member=>member.id);
 if(stage==="members")return <Stack gap="md"><TopBar title={title} {...(onCancel?{exit:{kind:"close" as const,label:backLabel,onPress:onCancel}}:{})}
 actions={<Button tone="ghost" disabled={disabled||ids.length===0} onPress={()=>setStage("profile")}>{nextLabel}</Button>}/>
 <SearchField busyLabel={searchBusyLabel} accessibilityLabel={searchLabel} clearLabel={clearSearchLabel} value={query} onValueChange={setQuery}/>
 <ChatRoomMembers members={members.filter(member=>member.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))} title={membersLabel} emptyLabel={emptyMembersLabel} onSelectionChange={onSelectionChange} disabled={disabled}/></Stack>;
 return <ChatRoomProfile {...profile} presentation="inline" title={title} back={{label:backLabel,onPress:()=>setStage("members")}} disabled={disabled} onSave={value=>{if(!canSubmitChatRoom(value,ids))return;return onCreate(value,ids);}} submitDisabled={!canSubmitChatRoom(profile.value,ids)}>
 {blocked=><ChatRoomMembers members={members.filter(member=>ids.includes(member.id))} title={membersLabel} emptyLabel={emptyMembersLabel} disabled={blocked}/>}
 </ChatRoomProfile>;
}
export type ChatRoomActionsProps = Readonly<{
 /** Local history deletion and membership exit are deliberately separate actions. */
 leave?:ChatRoomConfirmation; deleteHistory?:ChatRoomConfirmation; deleteRoom?:ChatRoomConfirmation;
 disabled?:boolean;
}>;
export function ChatRoomActions({leave,deleteHistory,deleteRoom,disabled=false}:ChatRoomActionsProps){
 return <RoomActionList actions={[leave,deleteHistory,deleteRoom].filter((item):item is ChatRoomConfirmation=>Boolean(item)).map(item=>({...item,destructive:true}))} disabled={disabled}/>;
}
function RoomActionList({actions,disabled=false,menuLabel}:{actions:readonly ChatRoomConfirmation[];disabled?:boolean;menuLabel?:string}){
 const [active,setActive]=useState<ChatRoomConfirmation|null>(null);
 return <Stack gap="sm">{menuLabel&&actions.length>0?<Menu triggerLabel={menuLabel} renderTrigger={props=><IconButton label={menuLabel} tone="ghost" onPress={props.onPress} accessibilityState={props.accessibilityState}><Text>•••</Text></IconButton>} presentation="anchored" disabled={disabled||active!==null} dismissLabel={actions[0]!.cancelLabel} items={actions.map((action,index)=>({id:String(index),label:action.label,...(action.destructive?{tone:"danger" as const}:{})}))} onActionAfterDismiss={id=>setActive(actions[Number(id)]??null)}/>:actions.map((action,index)=>action?<ListRow key={index} title={action.label} tone={action.destructive?"danger":"default"} disabled={disabled||active!==null} onPress={()=>setActive(action)}/>:null)}
 {active?<AlertDialog open onOpenChange={open=>{if(!open)setActive(null);}} request={{mode:"confirm",tone:active.destructive?"danger":"attention",title:active.title,description:active.description,confirmLabel:active.confirmLabel,cancelLabel:active.cancelLabel,fallbackErrorMessage:active.errorLabel,onConfirm:active.onConfirm}}/>:null}</Stack>;
}

export type ChatRoomDetailsProps = Readonly<{
 profile: ChatRoomProfileValue; back?:Readonly<{label:string;onPress:()=>void}>; photoLabel:string; memberCountLabel:string;
 edit?:Readonly<{label:string;onPress:()=>void}>;
 /** Search, shared media, invite and notification settings use product-owned routes. */
 tools?:readonly Readonly<{id:string;label:string;icon?:ReactNode;onPress:()=>void|Promise<void>}>[];
 members:ChatRoomMembersProps; actions?:ChatRoomActionsProps; errorLabel:string;
}>;
export function ChatRoomDetails({profile,back,photoLabel,memberCountLabel,edit,tools=[],members,actions,errorLabel}:ChatRoomDetailsProps){
 const action=useCompositionAction();const {colors}=useHjmNativeTheme();
 return <View style={{backgroundColor:colors.bg,padding:spacing.md}}><TopBar surface="transparent" {...(back?{exit:{kind:"back" as const,label:back.label,onPress:back.onPress}}:{})} actions={edit?<Button tone="ghost" onPress={edit.onPress}>{edit.label}</Button>:null}/>
 <Stack gap="lg"><Stack align="center" gap="xs">
 <Avatar {...(profile.photoUrl?{source:{uri:profile.photoUrl}}:{})} size="xlarge" accessibilityLabel={photoLabel} name={profile.name}/>
 <Text variant="title">{profile.name}</Text><Text tone="muted">{memberCountLabel}</Text>
 </Stack><View style={{flexDirection:"row",gap:spacing.xs}}>{tools.map(tool=><Pressable key={tool.id} accessibilityRole="button" accessibilityLabel={tool.label} accessibilityState={{disabled:action.pending,busy:action.active===tool.id}} disabled={action.pending} onPress={()=>void action.run(tool.id,tool.onPress)} style={({pressed})=>({flex:1,minWidth:0,minHeight:64,justifyContent:"center",backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.xs,opacity:pressed ? .7 : 1})}><Stack align="center" gap="xs">{tool.icon}<Text variant="caption" tone="brand">{tool.label}</Text></Stack></Pressable>)}</View>
 {profile.description?<View style={{backgroundColor:colors.surface,padding:spacing.md,borderRadius:radius.lg}}><Text>{profile.description}</Text></View>:null}
 {action.failed?<Text accessibilityRole="alert" tone="danger">{errorLabel}</Text>:null}
 <View style={{backgroundColor:colors.surface,padding:spacing.md,borderRadius:radius.lg}}><ChatRoomMembers {...members}/></View>{actions?<View style={{backgroundColor:colors.surface,padding:spacing.md,borderRadius:radius.lg}}><ChatRoomActions {...actions}/></View>:null}</Stack></View>;
}

export type ChatRoomInviteProps = Omit<ChatRoomMembersProps,"renderActions"|"actions"|"onSelectionChange"> & Readonly<{
 onSelectionChange:(id:string,selected:boolean)=>void;
 onInvite:(memberIds:readonly string[])=>void|Promise<void>;
 confirmLabel:string;errorLabel:string;
}>;
export function ChatRoomInvite({onInvite,confirmLabel,errorLabel,disabled=false,...members}:ChatRoomInviteProps){
 const action=useCompositionAction(disabled),ids=members.members.filter(member=>member.selected&&!member.disabled).map(member=>member.id);
 return <Stack gap="md"><ChatRoomMembers {...members} disabled={disabled||action.pending}/>
 {action.failed?<Text accessibilityRole="alert" tone="danger">{errorLabel}</Text>:null}
 <Button disabled={disabled||action.pending||ids.length===0} loading={action.pending} onPress={()=>void action.run("invite",()=>onInvite(ids))}>{confirmLabel}</Button></Stack>;
}
