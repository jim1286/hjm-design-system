import { useState } from "react";
import { ExpandableSearch,ReplyMessage,ReplyComposer } from "@hjmds/react-native/communication";
import type { ReplyTarget } from "@hjmds/design-contracts/communication";
import { PreviewToolButton, PreviewTools } from "./preview-tools";
import { Stack,Text } from "@hjmds/react-native/primitives";
// The failure switch is a demo-only tool, kept in PreviewTools after the composition (SELECTION.md 조립 규칙).
const documents=["여행 일정", "여행 준비물", "디자인 검토", "주간 회의"];
export function ExpandableSearchPreview(){
 const [expanded,setExpanded]=useState(false),[query,setQuery]=useState(""),[recent,setRecent]=useState<string[]>([]);
 return <ExpandableSearch<string[]> expanded={expanded} onExpandedChange={setExpanded} query={query} onQueryChange={setQuery} renderResult={items=><Stack gap="sm">{items.length?items.map(item=><Text key={item}>{item}</Text>):<Text>일치하는 문서가 없습니다.</Text>}</Stack>}
 onSubmit={value=>setRecent(items=>[value,...items.filter(item=>item!==value)])}
 onSearch={async(value,{signal})=>{if(signal.aborted)throw new Error("aborted");const result=documents.filter(item=>item.includes(value));return {result,suggestions:result.map(item=>({query:item}))};}}
 recentQueries={{title:"최근 검색",items:recent,onRemove:value=>setRecent(items=>items.filter(item=>item!==value)),onClearAll:()=>setRecent([]),removeLabel:value=>`${value} 삭제`,clearAllLabel:"최근 검색 비우기"}}
 labels={{title:"문서 검색",open:"문서 검색 펼치기",cancel:"검색 닫기",query:"문서 이름",clear:"검색어 지우기",searching:"문서 찾는 중",error:"문서를 찾지 못했어요",commit:value=>`‘${value}’ 검색`,suggestionCount:count=>`제안 ${count}개`}}/>;
}
export function ReplyComposerPreview(){
 const [draft,setDraft]=useState("지금 확인할게요."),[target,setTarget]=useState<ReplyTarget|null>(null),[fail,setFail]=useState(false),[receipt,setReceipt]=useState("");
 return <Stack gap="md"><ReplyMessage messageId="message-72" author="서연" timestamp="오후 2:32" direction="incoming" replyLabel="이 메시지에 답장" onReply={id=>setTarget({id,author:"서연",excerpt:"검토할 문서를 보내 드렸어요."})}>검토할 문서를 보내 드렸어요.</ReplyMessage>
 <ReplyComposer value={draft} onValueChange={setDraft} label="답장 내용" sendLabel="전송" maxLength={24} lengthFeedback={{label:"입력 길이",formatCount:(used,max)=>`${used}/${max}`}} replyTarget={target} onReplyCancel={()=>setTarget(null)} cancelReplyLabel="답장 취소" errorLabel="전송하지 못했어요. 초안을 보존했어요."
 onSend={async(value,{replyToId})=>{if(fail)throw new Error("Local fixture rejection");setReceipt(`로컬 수신: ${replyToId??"답장 대상 없음"} · ${value}`);setDraft("");setTarget(null);}}/>

 {receipt?<Text>{receipt}</Text>:null}<Text variant="caption">가로로 밀거나 Alt+방향키로 실제 message-72를 선택합니다. 로컬 수신 예제이며 서버 전송은 하지 않습니다.</Text>
 <PreviewTools><PreviewToolButton selected={fail} onPress={()=>setFail(value=>!value)}>실패 응답 확인</PreviewToolButton></PreviewTools></Stack>;
}
