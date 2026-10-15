"use client";
import { useEffect,useRef,useState,type ReactNode } from "react";
import { resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import { validateReplyTarget,type ReplyTarget,type SearchResponse } from "@hjmds/design-contracts/communication";
import { ChatMessage,MessageComposer,type ChatMessageProps,type MessageComposerProps } from "./screens.js";
import { SearchScreen,type SearchRecentQueries } from "./screen-flows.js";
import { Button } from "./actions.js";
import { Stack,Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { View,Keyboard,type TextInput } from "react-native";
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
 const latest=useRef(props);latest.current=props;const input=useRef<TextInput>(null),generation=useRef(0),controller=useRef<AbortController|null>(null);

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
 return <View ><Stack gap="sm">{!props.expanded?<Button  disabled={props.disabled===true} onPress={()=>props.onExpandedChange(true)}>{props.labels.open}</Button>:<>
 <Button tone="ghost" onPress={cancel}>{props.labels.cancel}</Button>
 <SearchScreen title={props.labels.title} titleVisibility="hidden" queryLabel={props.labels.query} queryField={<SearchField ref={input} label={props.labels.query} clearLabel={props.labels.clear} busyLabel={props.labels.searching} value={props.query} onValueChange={props.onQueryChange} busy={pending} onSubmitEditing={()=>commit(props.query)} returnKeyType="search"/>} query={props.query} onQueryChange={props.onQueryChange} onSearch={search}
 {...(props.debounceMs===undefined?{}:{debounceMs:props.debounceMs})} {...(props.recentQueries?{recentQueries:props.recentQueries}:{})}
 committedQuery={committed} onSubmit={commit} searching={pending} searchingLabel={props.labels.searching}
 suggestions={{items:current?.suggestions??[],commitLabel:props.labels.commit,countLabel:props.labels.suggestionCount}}>
 {current?props.renderResult(current.result):null}
 </SearchScreen>{failed?<Text accessibilityRole="alert" accessibilityLiveRegion="assertive" tone="danger" align="center">{props.labels.error}</Text>:null}</>}</Stack></View>;
}
