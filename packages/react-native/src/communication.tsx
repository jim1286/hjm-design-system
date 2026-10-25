import type { ComponentRef } from "react";
"use client";
import { useEffect,useRef,useState,type ReactNode } from "react";
import { chatRoomRecipe,resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import type { CharacterCountOptions } from "@hjmds/design-contracts/character-count";
import { canSubmitChatRoom,filterChatRoomMembers,selectedChatRoomMembers,type ChatRoomProfileValue,type ChatRoomMember,type ChatRoomConfirmation,type ChatRoomMemberActions,type ChatRoomMemberSearch,type ChatRoomSelectionLabels } from "@hjmds/design-contracts/communication";
import { validateReplyTarget,type ReplyTarget,type SearchResponse } from "@hjmds/design-contracts/communication";
import { ChatMessage,MessageComposer,ScreenLayout,type ChatMessageProps,type MessageComposerProps } from "./screens.js";
import { SearchScreen,type SearchRecentQueries } from "./screen-flows.js";
import { Button,IconButton } from "./actions.js";
import { glyph,spacing,radius } from "@hjmds/design-contracts/foundations";
import { withAlpha } from "@hjmds/design-contracts/colors";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnClose,DrawnMoreHorizontal,DrawnPencil,DrawnPlus,DrawnSearch } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { Stack,Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { Keyboard,Pressable,ScrollView,View,type TextInput } from "react-native";
import { Checkbox,SearchField,TextField } from "./inputs.js";
import { Avatar,ListRow } from "./data-display.js";
import { AlertDialog } from "./overlays.js";
import { Menu } from "./navigation.js";
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

/*
  Room management (2026-10-23 redesign, chatRoomRecipe). Function and placement follow the compared Telegram, KakaoTalk
  and WhatsApp screens; color, type and spacing stay HJM tokens and the product theme. Same props as Web.
*/
type Exit=Readonly<{label:string;onPress:()=>void}>;
const photoOf=(url?:string|null)=>url?{source:{uri:url}}:{};
function CornerBadge({size,tone,children}:{size:number;tone:"brand"|"neutral";children:(color:string,size:number)=>ReactNode}){
 const {colors}=useHjmNativeTheme();const mark=Math.round(size*.6);
 return <View style={{width:size,height:size,borderRadius:size/2,alignItems:"center",justifyContent:"center",backgroundColor:tone==="brand"?colors.primary:colors.textMuted,borderWidth:2,borderColor:colors.bg}}>{children(colors.onPrimary,mark)}</View>;
}

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
 const {colors}=useHjmNativeTheme();
 const latest=useRef({value,onValueChange});latest.current={value,onValueChange};
 const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const patch=(change:Partial<ChatRoomProfileValue>)=>onValueChange({...value,...change});
 // A new room has no identity yet; its photo slot is decorative until a name exists.
 const identity=value.name.trim()?{name:value.name,accessibilityLabel:labels.photo}:{decorative:true as const,renderFallback:()=><DrawnPlus size={glyph.md} color={colors.textMuted}/>};
 const avatar=(accessory?:ReactNode)=><Avatar {...photoOf(value.photoUrl)} size={chatRoomRecipe.heroAvatar} {...identity} {...(accessory?{accessory}:{})}/>;
 const inline=presentation==="inline";
 const remove=onPickPhoto&&value.photoUrl?<Button tone="ghost" size="small" disabled={blocked} {...(inline?{layoutStyle:{alignSelf:"flex-start" as const}}:{})} onPress={()=>patch({photoUrl:null})}>{labels.removePhoto}</Button>:null;
 return <ScreenLayout title={title} {...(back?{exit:{kind:"back" as const,label:back.label,onPress:back.onPress}}:{})} actions={<Button tone="ghost" disabled={blocked||submitDisabled||!canSubmitChatRoom(value)} loading={save.pending} onPress={()=>void save.run("save",()=>onSave(value))}>{labels.save}</Button>}><Stack gap="md">
 <Stack axis={inline?"inline":"block"} align="center" gap="md">
 <Stack align="center" gap="xs">{onPickPhoto?<Pressable accessibilityRole="button" accessibilityLabel={labels.changePhoto} accessibilityState={{disabled:blocked,busy:photo.pending}} disabled={blocked} onPress={()=>void photo.run("photo",async()=>{const url=await onPickPhoto();if(url!==null&&mounted.current)latest.current.onValueChange({...latest.current.value,photoUrl:url});})}>{avatar(<CornerBadge size={chatRoomRecipe.badgeSize} tone="brand">{(color,size)=><DrawnPencil size={size} color={color} strokeWidth={1.5}/>}</CornerBadge>)}</Pressable>:avatar()}
 {inline?null:remove}</Stack>
 <Stack gap="xs" layoutStyle={inline?{flex:1,minWidth:0}:{alignSelf:"stretch"}}><TextField label={labels.name} value={value.name} onValueChange={name=>patch({name})} disabled={blocked} {...(nameCharacterCount?{characterCount:nameCharacterCount}:{})}/></Stack></Stack>
 {inline?remove:null}
 <TextField label={labels.description} value={value.description} onValueChange={description=>patch({description})} disabled={blocked}/>
 {photo.failed?<Text accessibilityRole="alert" tone="danger">{labels.photoError}</Text>:null}
 {save.failed?<Text accessibilityRole="alert" tone="danger">{labels.error}</Text>:null}
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
 const {colors}=useHjmNativeTheme();
 const leading=(member:ChatRoomMember)=><Avatar size={chatRoomRecipe.memberAvatar} {...photoOf(member.photoUrl)} name={member.name} decorative/>;
 const add=chatRoomRecipe.addLeadingSize;
 return <Stack gap="xs"><Stack axis="inline" align="end" gap="xxs"><Text variant="label">{title}</Text>{countLabel?<Text variant="label" tone="brand">{countLabel}</Text>:null}</Stack>
 {invite?<ListRow title={invite.label} tone="brand" leading={<View style={{width:add,height:add,borderRadius:add/2,alignItems:"center",justifyContent:"center",backgroundColor:withAlpha(colors.contentBrand,.12)}}><DrawnPlus size={glyph.sm} color={colors.contentBrand}/></View>} disabled={disabled} onPress={invite.onPress}/>:null}
 {members.length===0?<Text tone="muted">{emptyLabel}</Text>:members.map(member=>onSelectionChange?
 <Checkbox key={member.id} presentation="plain" label={member.name} {...(member.detail?{description:member.detail}:{})} renderLeading={()=>leading(member)} checked={member.selected===true} disabled={disabled||member.disabled===true} onCheckedChange={selected=>onSelectionChange(member.id,selected)} layoutStyle={{width:"100%"}}/>:
 <ListRow key={member.id} title={member.name} {...(member.detail?{description:member.detail}:{})} leading={leading(member)} {...(memberProfile?{leadingAction:{label:memberProfile.label(member),onPress:()=>memberProfile.onPress(member)},onPress:()=>memberProfile.onPress(member)}:{})} {...(member.role?{trailing:<Text variant="caption" tone="brand">{member.role}</Text>}:{})}
 trailingAction={<>{memberActions?<RoomActionList actions={memberActions.items(member)} disabled={disabled} menu={{label:memberActions.label(member),dismissLabel:memberActions.dismissLabel}}/>:null}{renderActions?.(member)}</>}/> )}</Stack>;
}

/** People picked so far, kept visible above the list while the search narrows it; tapping one deselects it. */
function SelectedMembers({members,labels,onRemove,disabled}:{members:readonly ChatRoomMember[];labels:ChatRoomSelectionLabels;onRemove:(id:string)=>void;disabled:boolean}){
 if(members.length===0)return null;
 return <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={labels.count(members.length)} contentContainerStyle={{gap:chatRoomRecipe.selectedGap,paddingVertical:spacing.xxs}}>{members.map(member=>
 <Pressable key={member.id} accessibilityRole="button" accessibilityLabel={labels.remove(member)} accessibilityState={{disabled}} disabled={disabled} onPress={()=>onRemove(member.id)} style={({pressed})=>({width:chatRoomRecipe.selectedItemWidth,alignItems:"center",gap:spacing.xxs,borderRadius:radius.md,opacity:pressed?.7:1})}>
 <Avatar size={chatRoomRecipe.selectedAvatar} {...photoOf(member.photoUrl)} name={member.name} decorative accessory={<CornerBadge size={chatRoomRecipe.removeBadgeSize} tone="neutral">{(color,size)=><DrawnClose size={size} color={color} strokeWidth={1.5}/>}</CornerBadge>}/>
 <Text variant="caption" numberOfLines={1}>{member.name}</Text></Pressable>)}</ScrollView>;
}
type MemberPickerProps=Readonly<{members:readonly ChatRoomMember[];title:string;emptyLabel:string;search:ChatRoomMemberSearch;selection:ChatRoomSelectionLabels;onSelectionChange:(id:string,selected:boolean)=>void;disabled:boolean}>;
function MemberPicker({members,title,emptyLabel,search,selection,onSelectionChange,disabled}:MemberPickerProps){
 const [localQuery,setLocalQuery]=useState("");
 // A product that searches its server owns the query and the result list; otherwise names are filtered here.
 const remote=search.onQueryChange!==undefined,query=remote?search.query??"":localQuery;
 const selected=selectedChatRoomMembers(members);
 return <Stack gap="sm">
 <SearchField placeholder={search.label} accessibilityLabel={search.label} clearLabel={search.clearLabel} busyLabel={search.busyLabel} busy={search.searching===true} value={query} onValueChange={remote?search.onQueryChange!:setLocalQuery}/>
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
 if(stage==="members")return <ScreenLayout title={title} {...(onCancel?{exit:{kind:"close" as const,label:backLabel,onPress:onCancel}}:{})}
 actions={<Button tone="ghost" disabled={disabled||ids.length===0} onPress={()=>setStage("profile")}>{nextLabel}</Button>}>
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
 return <Stack gap="xs">{items.map(([item,tone])=><Button key={item.label} tone={tone} disabled={disabled||active!==null} layoutStyle={{alignSelf:"stretch"}} onPress={()=>setActive({...item,destructive:true})}>{item.label}</Button>)}
 {active?<RoomConfirmDialog action={active} onClose={()=>setActive(null)}/>:null}</Stack>;
}
function RoomConfirmDialog({action,onClose}:{action:ChatRoomConfirmation;onClose:()=>void}){
 return <AlertDialog open onOpenChange={open=>{if(!open)onClose();}} request={{mode:"confirm",tone:action.destructive?"danger":"attention",title:action.title,description:action.description,confirmLabel:action.confirmLabel,cancelLabel:action.cancelLabel,fallbackErrorMessage:action.errorLabel,onConfirm:action.onConfirm}}/>;
}
function RoomActionList({actions,disabled=false,menu}:{actions:readonly ChatRoomConfirmation[];disabled?:boolean;menu:Readonly<{label:string;dismissLabel:string}>}){
 const [active,setActive]=useState<ChatRoomConfirmation|null>(null);const {colors}=useHjmNativeTheme();
 if(actions.length===0)return null;
 const dialog=active?<RoomConfirmDialog action={active} onClose={()=>setActive(null)}/>:null;
 return <><Menu triggerLabel={menu.label} renderTrigger={props=><IconButton label={menu.label} tone="ghost" onPress={props.onPress} accessibilityState={props.accessibilityState}><DrawnMoreHorizontal size={glyph.md} color={colors.textMuted}/></IconButton>} presentation="anchored" disabled={disabled||active!==null} dismissLabel={menu.dismissLabel} items={actions.map((action,index)=>({id:String(index),label:action.label,...(action.destructive?{tone:"danger" as const}:{})}))} onActionAfterDismiss={id=>setActive(actions[Number(id)]??null)}/>{dialog}</>;
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
 const action=useCompositionAction();const {colors}=useHjmNativeTheme();
  return <ScreenLayout title={profile.name} titleVisibility="hidden" {...(back?{exit:{kind:"back" as const,label:back.label,onPress:back.onPress}}:{})} actions={edit?<Button tone="ghost" onPress={edit.onPress}>{edit.label}</Button>:null}>
 <Stack gap="lg"><Stack align="center" gap="sm">
 <Avatar {...photoOf(profile.photoUrl)} size={chatRoomRecipe.heroAvatar} accessibilityLabel={photoLabel} name={profile.name}/>
 <Stack align="center" gap="xxs"><Text variant="title" align="center">{profile.name}</Text><Text tone="muted" align="center">{memberCountLabel}</Text></Stack>
 </Stack>{tools.length>0?<View style={{flexDirection:"row",gap:chatRoomRecipe.toolGap}}>{tools.map(tool=><Pressable key={tool.id} accessibilityRole={tool.pressed===undefined?"button":"togglebutton"} accessibilityLabel={tool.label} accessibilityState={{disabled:action.pending,busy:action.active===tool.id,...(tool.pressed===undefined?{}:{checked:tool.pressed})}} disabled={action.pending} onPress={()=>void action.run(tool.id,tool.onPress)} style={({pressed})=>({flex:1,minWidth:0,minHeight:chatRoomRecipe.toolMinHeight,justifyContent:"center",backgroundColor:tool.pressed?colors.surfaceSelected:colors.surface,borderRadius:radius.md,padding:spacing.xs,opacity:pressed ? .7 : 1})}><Stack align="center" gap="xs">{tool.icon}<Text variant="caption" tone="brand" numberOfLines={1}>{tool.label}</Text></Stack></Pressable>)}</View>:null}
 {action.failed?<Text accessibilityRole="alert" tone="danger">{errorLabel}</Text>:null}
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
 return <ScreenLayout title={title} {...(back?{exit:{kind:"close" as const,label:back.label,onPress:back.onPress}}:{})}
 actions={<Button tone="ghost" disabled={blocked||ids.length===0} loading={action.pending} onPress={()=>void action.run("invite",()=>onInvite(ids))}>{confirmLabel}</Button>}><Stack gap="md">
 <MemberPicker members={members} title={membersLabel} emptyLabel={emptyLabel} search={search} selection={selection} onSelectionChange={onSelectionChange} disabled={blocked}/>
 {action.failed?<Text accessibilityRole="alert" tone="danger">{errorLabel}</Text>:null}</Stack></ScreenLayout>;
}
