import { CommentThreadScreen } from "@hjmds/react/screen-flows";
import { useRef, useState } from "react";
import { ScreenLayout, MessageComposer } from "@hjmds/react/screens";
import { Stack, Text } from "@hjmds/react/layout";
import { Avatar } from "@hjmds/react/display";
import { Button, IconButton } from "@hjmds/react/actions";
import { Heart, ArrowUp, X } from "lucide-react";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import "./instagram-comments.css";

type Comment = {id:number;parentId:number|null;user:string;body:string;time:string;likes:number};
const initial:Comment[] = [
 {id:1,parentId:null,user:"seoyeon",body:"여기 분위기 너무 좋다 🌿 다음에 같이 가요!",time:"2시간",likes:24},
 {id:2,parentId:1,user:"jimin",body:"@seoyeon 좋아요! 해 질 때가 정말 예뻐요",time:"1시간",likes:3},
 {id:3,parentId:1,user:"seoyeon",body:"@jimin 벌써 기대된다 🤍",time:"45분",likes:1},
 {id:4,parentId:null,user:"minjun",body:"사진만 봐도 마음이 편안해지네요",time:"3시간",likes:12},
 {id:5,parentId:null,user:"jiwoo",body:"이런 작은 순간들이 제일 오래 기억에 남는 것 같아요 ✨",time:"4시간",likes:8},
 {id:6,parentId:null,user:"yuna",body:"저장해두고 주말에 가봐야겠어요 ☕️",time:"5시간",likes:5},
];
type Props={stateKind?:"ready"|"loading"|"empty"|"error"|"restricted";tools?:boolean};
export function InstagramCommentsPreview({stateKind="ready",tools=false}:Props){
 // Demo failure toggle: a failed send keeps the draft and says so next to the composer.
 const [failNext,setFailNext]=useState(false),[sendFailed,setSendFailed]=useState(false);
 
 const [comments,setComments]=useState<Comment[]>(stateKind==="empty"?[]:initial);
 const [liked,setLiked]=useState<number[]>([]);
 const [expanded,setExpanded]=useState<number[]>([]);
 const [reply,setReply]=useState<Comment|null>(null);
 const [draft,setDraft]=useState("");
 const [closed,setClosed]=useState(false);
 const [recovered,setRecovered]=useState(false);
 const input=useRef<HTMLTextAreaElement>(null);
 const kind=recovered?"ready":stateKind;
 const state:ScreenContentState=kind==="loading"?{kind:"loading",title:"댓글을 불러오고 있어요"}:kind==="error"?{kind:"error",title:"댓글을 불러오지 못했어요",description:"연결을 확인하고 다시 시도해 주세요."}:kind==="restricted"?{kind:"restricted",title:"로그인하고 대화에 참여하세요"}:comments.length===0?{kind:"empty",title:"아직 댓글이 없어요",description:"첫 댓글을 남겨보세요."}:{kind:"ready"};
 const focus=()=>input.current?.focus();
 const send=()=>{if(!draft.trim())return;if(failNext){setFailNext(false);setSendFailed(true);return;}setSendFailed(false);const parentId=reply?(reply.parentId??reply.id):null;setComments(items=>[...items,{id:Date.now(),parentId,user:"jimin",body:draft,time:"방금",likes:0}]);if(parentId)setExpanded(ids=>[...ids,parentId]);setDraft("");setReply(null);setRecovered(true);focus();};
 // User-supplied screenshot takes precedence: white ArrowUp in a blue circle; latest instruction places it inside the input.
 // Share the DM field and send transition; comments intentionally have no photo actions.
 const composer=<Stack axis="inline" gap="sm" align="center"><Avatar name="jimin" size="small"/><Stack layoutStyle={{flex:1,minWidth:0}}>
  <MessageComposer context={sendFailed?<Text tone="danger">댓글을 보내지 못했어요. 작성한 내용은 남아 있어요.</Text>:null} inputRef={input} label={reply?`${reply.user}님에게 답글`:"댓글 달기"} sendLabel="댓글 전송" value={draft} onValueChange={setDraft} onSend={send} sendPresentation="circle" sendIcon={<ArrowUp size={20} strokeWidth={2} color="var(--hjm-color-on-primary)"/>}
   {...(reply ? {replyTo:{author:`${reply.user}님에게 답글`,excerpt:reply.body,cancelLabel:"답글 취소",onCancel:()=>{setReply(null);focus();}}} : {})}/>
 </Stack></Stack>;

 return <Stack gap="sm">{tools?<Button tone="secondary" selected={failNext} onClick={()=>setFailNext(v=>!v)}>{failNext?"전송 실패 예약됨":"다음 전송 실패"}</Button>:null}<div style={{height:"90dvh"}}>{closed?<ScreenLayout title="게시물"><Text>산책길에서 찾은 작은 여유</Text><Button onClick={()=>setClosed(false)}>댓글 보기</Button></ScreenLayout>:<CommentThreadScreen className="hjm-instagram-comments" title="댓글" notice={<Stack axis="inline" gap="sm" align="start"><Avatar name="jimin" size="small"/><Stack gap="xxs"><Text emphasis="strong">jimin</Text><Text>산책길에서 찾은 작은 여유.</Text><Text variant="caption" tone="muted">오늘 · 게시물</Text></Stack></Stack>} actions={<IconButton label="댓글 닫기" tone="ghost" onClick={()=>setClosed(true)}><X size={20} color={"var(--hjm-color-text-muted)"}/></IconButton>} state={state} stateAction={kind==="error"||kind==="restricted"?<Button onClick={()=>setRecovered(true)}>{kind==="error"?"다시 시도":"로그인"}</Button>:null} composer={kind==="ready"||kind==="empty"?composer:null}
 items={comments.map(comment=>({id:String(comment.id),parentId:comment.parentId===null?null:String(comment.parentId),author:comment.user,body:<Text>{comment.body}</Text>,timeLabel:comment.time,likeCountLabel:`좋아요 ${comment.likes+(liked.includes(comment.id)?1:0)}개`,avatar:<Avatar name={comment.user} size="small" />,likeLabel:`${comment.user} 댓글 ${liked.includes(comment.id)?"좋아요 취소":"좋아요"}`,likeIcon:<Heart size={16} color={liked.includes(comment.id)?"var(--hjm-color-danger)":"var(--hjm-color-text-muted)"} fill={liked.includes(comment.id)?"var(--hjm-color-danger)":"none"}/>}))}
 expandedIds={expanded.map(String)} onExpandedChange={id=>setExpanded(ids=>ids.includes(Number(id))?ids.filter(value=>value!==Number(id)):[...ids,Number(id)])}
 onLike={id=>setLiked(ids=>ids.includes(Number(id))?ids.filter(value=>value!==Number(id)):[...ids,Number(id)])}
 onReply={id=>{const comment=comments.find(item=>String(item.id)===id)!;setReply(comment);setDraft(`@${comment.user} `);focus();}} replyLabel="답글 달기" repliesLabel={(count,open)=>open?"답글 숨기기":`— 답글 ${count}개 보기`} />}</div></Stack>;
}
