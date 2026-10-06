import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { Button, IconButton } from "./actions.js";
import { Stack, Text, Grid } from "./primitives.js";
import { TextField } from "./inputs.js";
import { RadioGroup } from "./inputs.js";
import { AlertDialog, Sheet } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { validateCommentThread, resolvePermissionAction, resolveOnboardingStep, screenPatternRecipe, type PermissionScreenStatus, type PhotoSource, type PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { View } from "react-native";
function Pane({hidden=false,children}:{hidden?:boolean;children:ReactNode}){return <View style={{flex:1,display:hidden?"none":"flex"}}>{children}</View>;}

/** Copy, pending state and mutations are controlled by the consuming product. */
export type ScreenFlowAction = Readonly<{label:string; onAction():void; disabled?:boolean; pending?:boolean}>;
function Action({action,secondary=false}:{action:ScreenFlowAction;secondary?:boolean}){return <Button tone={secondary?"ghost":"primary"} disabled={!!(action.disabled||action.pending)} loading={action.pending??false} onPress={action.onAction}>{action.label}</Button>;}
type Base = Omit<ScreenLayoutProps,"children"|"footer">;

export type ListDetailScreenProps = Base & { list:ReactNode; detail?:{title:string;content:ReactNode}; back:ScreenFlowAction; refresh?:ScreenFlowAction; loadMore?:ScreenFlowAction };
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
export function ListDetailScreen({list,detail,back,refresh,loadMore,...screen}:ListDetailScreenProps){return <View style={{flex:1}}><Pane hidden={!!detail}><ScreenLayout {...screen} actions={refresh?<Action action={refresh} secondary/>:screen.actions} footer={loadMore?<Action action={loadMore} secondary/>:null}>{list}</ScreenLayout></Pane>{detail?<Pane><ScreenLayout title={detail.title} leading={<Action action={back} secondary/>}>{detail.content}</ScreenLayout></Pane>:null}</View>;}

export type EditorScreenProps = Base & {children:ReactNode;submitPlacement?:"header"|"footer";dirty:boolean;submit:ScreenFlowAction;cancel:ScreenFlowAction;discard:Omit<Extract<AlertDialogRequest,{mode:"confirm"}>,"onConfirm"|"fallbackErrorMessage"> & {fallbackErrorMessage:string};draftStatus?:ReactNode};
export function EditorScreen({children,dirty,submitPlacement="footer",submit,cancel,discard,draftStatus,...screen}:EditorScreenProps){
 const [confirm,setConfirm]=useState(false);
 return <><ScreenLayout {...screen} leading={<Action action={{...cancel,disabled:!!(cancel.disabled||submit.pending),onAction:()=>{if(dirty)setConfirm(true);else cancel.onAction();}}} secondary/>} actions={submitPlacement==="header"?<Action action={submit}/>:screen.actions} footer={submitPlacement==="header"?draftStatus:<Stack gap="sm">{draftStatus}<Action action={submit}/></Stack>}>{children}</ScreenLayout><AlertDialog open={confirm} onOpenChange={setConfirm} request={{...discard,mode:"confirm",onConfirm:()=>cancel.onAction()}}/></>;
}

export type ProfileScreenProps = Base & {summary:ReactNode;edit:ScreenFlowAction;children?:ReactNode;accountActions?:ReactNode};
export function ProfileScreen({summary,edit,children,accountActions,...screen}:ProfileScreenProps){return <ScreenLayout {...screen}><Stack gap="xl"><Stack gap="md">{summary}<Action action={edit} secondary/></Stack>{children}{accountActions}</Stack></ScreenLayout>;}

export type ModerationScreenProps = Base & {reasonPicker?:ReactNode;reasons:readonly {value:string;label:string}[];reason:string|null;onReasonChange(value:string):void;reasonLabel:string;children?:ReactNode;submit:ScreenFlowAction;block?:{action:ScreenFlowAction;confirmation:Extract<AlertDialogRequest,{mode:"confirm"}>}};
export function ModerationScreen({reasonPicker,reasons,reason,onReasonChange,reasonLabel,children,submit,block,...screen}:ModerationScreenProps){const [confirm,setConfirm]=useState(false);return <><ScreenLayout {...screen} footer={<Stack gap="sm"><Action action={{...submit,disabled:submit.disabled||!!screen.state&&screen.state.kind!=="ready"||!reasons.some(item=>item.value===reason)}}/>{block?<Action action={{...block.action,onAction:()=>setConfirm(true)}} secondary/>:null}</Stack>}><Stack gap="lg">{reasonPicker??(reasons.length?<RadioGroup accessibilityLabel={reasonLabel} orientation="vertical" items={reasons} value={reason} onValueChange={value=>{if(value)onReasonChange(value);}}/>:null)}{children}</Stack></ScreenLayout>{block?<AlertDialog open={confirm} onOpenChange={setConfirm} request={block.confirmation}/>:null}</>;}


/** Source choice only: permission, capture, decoding and draft persistence belong to the host. */
export type PhotoSourceSheetProps = Readonly<{
 open:boolean;onOpenChange(open:boolean):void;onSelect(source:PhotoSource):void;
 labels:PhotoSourceLabels;disabled?:boolean;cameraAvailable?:boolean;
}>;
export function PhotoSourceSheet({open,onOpenChange,onSelect,labels,disabled=false,cameraAvailable=true}:PhotoSourceSheetProps){
 const queued=useRef<PhotoSource|null>(null);
 useEffect(()=>()=>{queued.current=null;},[]);
 // iOS cannot present a camera/picker over a dismissing Modal. Sheet owns the real
 // dismissal completion (including Android fallback), so a timer is not a safe substitute.
 const select=(source:PhotoSource)=>{if(disabled||queued.current)return;queued.current=source;onOpenChange(false);};
 const complete=()=>{const source=queued.current;queued.current=null;if(source&&!disabled)onSelect(source);};
 return <Sheet open={open} onOpenChange={onOpenChange} title={labels.title} closeLabel={labels.cancel} onDismissComplete={complete}><Stack gap="sm">
 <Button tone="secondary" disabled={disabled} onPress={()=>select("library")}>{labels.library}</Button>
 {cameraAvailable?<Button tone="secondary" disabled={disabled} onPress={()=>select("camera")}>{labels.camera}</Button>:null}
 </Stack></Sheet>;
}

export type MediaSelectionItem = {descriptor:UploadItemDescriptor;preview?:ReactNode};
export type MediaSelectionScreenProps = Base & {library?:ReactNode;selectionSummary?:ReactNode;items:readonly MediaSelectionItem[];add:ScreenFlowAction;done:ScreenFlowAction;labels:UploadItemLabels;actionLabels:{remove:string;moveUp:string;moveDown:string};removeLabel(item:MediaSelectionItem):string;moveUpLabel(item:MediaSelectionItem):string;moveDownLabel(item:MediaSelectionItem):string;onRemove(id:string):void;onMove(id:string,direction:-1|1):void;onRetry(id:string):void;onCancel(id:string):void};
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({library,selectionSummary,items,add,done,labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,...screen}:MediaSelectionScreenProps){return <ScreenLayout {...screen} actions={<Action action={add} secondary/>} footer={<Stack gap="sm">{selectionSummary}<Action action={done}/></Stack>}>{library??<Grid columns={{compact:2,expanded:3}} gap={{compact:"md"}}>{items.map((item,index)=><Stack key={item.descriptor.id} gap="xs">{item.preview}<UploadItem descriptor={item.descriptor} labels={labels} onRetry={onRetry} onCancel={onCancel}/><Stack axis="inline" gap="xxs" layoutStyle={{flexWrap:"wrap"}}><Button accessibilityLabel={moveUpLabel(item)} size="small" tone="ghost" disabled={index===0} onPress={()=>onMove(item.descriptor.id,-1)}>{actionLabels.moveUp}</Button><Button accessibilityLabel={moveDownLabel(item)} size="small" tone="ghost" disabled={index===items.length-1} onPress={()=>onMove(item.descriptor.id,1)}>{actionLabels.moveDown}</Button><Button accessibilityLabel={removeLabel(item)} size="small" tone="ghost" onPress={()=>onRemove(item.descriptor.id)}>{actionLabels.remove}</Button></Stack></Stack>)}</Grid>}</ScreenLayout>;}


export type SearchScreenProps = Base & {query:string;queryLabel:string;queryField?:ReactNode;onQueryChange(value:string):void;onSearch(query:string,context:{signal:AbortSignal}):void;debounceMs?:number;filters?:ReactNode;recentSearches?:ReactNode;children:ReactNode};
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export function SearchScreen({query,queryLabel,queryField,onQueryChange,onSearch,debounceMs=300,filters,recentSearches,children,...screen}:SearchScreenProps){
 const callback=useRef(onSearch);callback.current=onSearch;
 useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>callback.current(query,{signal:controller.signal}),Math.max(0,debounceMs));return()=>{clearTimeout(timer);controller.abort();};},[query,debounceMs]);
 return <ScreenLayout {...screen} notice={<Stack gap="sm">{queryField??<TextField label={queryLabel} value={query} onValueChange={onQueryChange}/>}{filters}{screen.notice}</Stack>}><Stack gap="lg">{!query.trim()?recentSearches:null}{children}</Stack></ScreenLayout>;
}

export type PermissionScreenProps = Base & {status:PermissionScreenStatus;illustration?:ReactNode;explanation:ReactNode;request:ScreenFlowAction;settings:ScreenFlowAction;continueAction:ScreenFlowAction;skip?:ScreenFlowAction};
export function PermissionScreen({status,illustration,explanation,request,settings,continueAction,skip,...screen}:PermissionScreenProps){const kind=resolvePermissionAction(status);const primary=kind==="request"?request:kind==="settings"?settings:kind==="continue"?continueAction:null;return <ScreenLayout {...screen} footer={<Stack gap="sm">{primary?<Action action={primary}/>:null}{skip?<Action action={skip} secondary/>:null}</Stack>}><Stack gap="xl" align="center">{illustration}{explanation}</Stack></ScreenLayout>;}

export type OnboardingStep = {id:string;title:string;description:string;content:ReactNode};
export type OnboardingScreenProps = {steps:readonly OnboardingStep[];index:number;onIndexChange(index:number):void;nextLabel:string;backLabel:string;complete:ScreenFlowAction;skip?:ScreenFlowAction;progressLabel(index:number,total:number):string};
export function OnboardingScreen({steps,index,onIndexChange,nextLabel,backLabel,complete,skip,progressLabel}:OnboardingScreenProps){const position=resolveOnboardingStep(steps.length,index);const step=steps[index]!;return <ScreenLayout title={step.title} description={step.description} actions={skip?<Action action={skip} secondary/>:null} notice={<Text variant="caption" tone="muted">{progressLabel(index+1,steps.length)}</Text>} footer={<Stack gap="sm"><Action action={position.last?complete:{label:nextLabel,onAction:()=>onIndexChange(index+1)}}/>{!position.first?<Action action={{label:backLabel,onAction:()=>onIndexChange(index-1)}} secondary/>:null}</Stack>}>{step.content}</ScreenLayout>;}

export type CommentThreadItem = Readonly<{id:string;parentId:string|null;author:string;body:ReactNode;bodyText?:string;timeLabel:string;likeCountLabel:string;avatar?:ReactNode;likeIcon:ReactNode;likeLabel:string;likeAction?:ReactNode;actions?:ReactNode;canReply?:boolean;replyDisabled?:boolean}>;
export type CommentThreadScreenProps = Base & {items:readonly CommentThreadItem[];expandedIds:readonly string[];onExpandedChange(id:string):void;onLike(id:string):void;onReply(id:string):void;replyLabel:string;repliesLabel(count:number,expanded:boolean):string;composer?:ReactNode;threadFooter?:ReactNode};
/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export function CommentThreadScreen({items,expandedIds,onExpandedChange,onLike,onReply,replyLabel,repliesLabel,composer,threadFooter,...screen}:CommentThreadScreenProps){
 validateCommentThread(items);
 // The supplied reference joins the author to the first body line and reserves the right edge
 // for one reaction target. Keep legacy rich bodies intact; bodyText opts into that compact flow.
 const row=(item:CommentThreadItem)=><Stack key={item.id} axis="inline" align="start" gap="sm">{item.avatar}<Stack gap="xxs" layoutStyle={{flex:1,minWidth:0}}>
 {item.bodyText!==undefined?<Text><Text emphasis="strong">{item.author}</Text>{" "}{item.bodyText}</Text>:<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}><Text emphasis="strong">{item.author}</Text><Text variant="caption" tone="muted">{item.timeLabel}</Text></Stack>}
 {item.body}<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}>{item.bodyText!==undefined&&item.timeLabel?<Text variant="caption" tone="muted">{item.timeLabel}</Text>:null}{item.likeCountLabel?<Text variant="caption" tone="muted">{item.likeCountLabel}</Text>:null}{(item.canReply??item.parentId===null)?<Button size="small" tone="ghost" disabled={item.replyDisabled??false} onPress={()=>onReply(item.id)}>{replyLabel}</Button>:null}</Stack>{item.actions}</Stack>{item.likeAction!==undefined?item.likeAction:<IconButton label={item.likeLabel} tone="ghost" onPress={()=>onLike(item.id)}>{item.likeIcon}</IconButton>}</Stack>;
 return <ScreenLayout {...screen} footer={!screen.state||screen.state.kind==="ready"||screen.state.kind==="empty"?composer:null}><Stack gap="lg">{items.filter(item=>item.parentId===null).map(item=>{const replies=items.filter(reply=>reply.parentId===item.id);return <Stack key={item.id} gap="xs">{row(item)}{replies.length?<Stack gap="md" layoutStyle={{marginStart:screenPatternRecipe.sectionGap}}><Button layoutStyle={{alignSelf:"flex-start"}} tone="ghost" size="small" onPress={()=>onExpandedChange(item.id)}>{repliesLabel(replies.length,expandedIds.includes(item.id))}</Button>{expandedIds.includes(item.id)?replies.map(row):null}</Stack>:null}</Stack>;})}{threadFooter}</Stack></ScreenLayout>;
}
