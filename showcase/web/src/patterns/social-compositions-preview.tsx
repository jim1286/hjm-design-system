import { MemberProfilePreview } from "./member-profile-preview.js";
import { Avatar } from "@hjmds/react/display";
import { useState } from "react";
import { failureToolCopy } from "../../../shared/failure-tools.js";
import { PreviewToolButton, PreviewTools } from "./preview-tools.js";
import { FollowProfileCard, EventAttendanceCard } from "@hjmds/react/social-compositions";
import { Stack } from "@hjmds/react/layout";
import { resolveFollowProposal, resolveAttendanceProposal } from "@hjmds/design-contracts/social-compositions";
const choices = [{ id: "yes", label: "참석", attending: true }, { id: "maybe", label: "미정", attending: false }, { id: "no", label: "불참", attending: false }];
export function FollowProfilePreview() {
 const [member,setMember]=useState<string|null>(null);
 const [state, setState] = useState({ following: false, count: 128 }), [fail, setFail] = useState(false);
 if(member)return <MemberProfilePreview name={member} avatar={<Avatar name={member} size="xlarge" decorative/>} onBack={()=>setMember(null)}/>;
 return <Stack gap="md"><FollowProfileCard avatarAction={{label:"지민의 기록 프로필 보기",onPress:()=>setMember("지민의 기록")}} profileId="writer" name="지민의 기록" description="작은 관찰을 모아 오래 남기는 기록가" locale="ko-KR" state={state}
   labels={{ follow: "팔로우", following: "팔로잉", pending: "팔로우 처리 중", count: "팔로워", error: "변경하지 못했어요. 이전 상태를 유지합니다." }}
   onFollowChange={async following => { if (fail) throw new Error("fixture failure"); setState(previous => resolveFollowProposal(previous, following)); }} />
  <PreviewTools><PreviewToolButton selected={fail} onClick={() => setFail(value => !value)}>{failureToolCopy.request}</PreviewToolButton></PreviewTools></Stack>;
}
export function EventAttendancePreview() {
 const [member,setMember]=useState<string|null>(null);
 const [state, setState] = useState<{ responseId: string | null; count: number }>({ responseId: null, count: 2 }), [fail, setFail] = useState(false);
 if(member)return <MemberProfilePreview name={member} avatar={<Avatar name={member} size="xlarge" decorative/>} onBack={()=>setMember(null)}/>;
 return <Stack gap="md"><EventAttendanceCard eventId="walk" title="함께 걷고 기록하는 토요일" description="동네 산책 후 마음에 남은 장면을 나눠요." dateLabel="10월 24일 토요일 · 오전 10시" locale="ko-KR" state={state} choices={choices}
   participants={[{id:"a",name:"민수"},{id:"b",name:"수진"},...(state.responseId==="yes"?[{id:"me",name:"나"}]:[])].map(person=>({...person,avatarAction:{label:`${person.name} 프로필 보기`,onPress:()=>setMember(person.name)}}))}
   labels={{ response: "참석 여부", pending: "처리 중", count: "참석자", calendar: "캘린더 연결 확인", calendarAdded: "예시 캘린더 연결 완료", error: "처리하지 못했어요. 같은 행동으로 다시 시도하세요." }}
   onResponseChange={async responseId => { if (fail) throw new Error("fixture failure"); setState(previous => resolveAttendanceProposal(previous, choices, responseId)); }}
   onAddToCalendar={async () => { if (fail) throw new Error("fixture failure"); }} />
  <PreviewTools><PreviewToolButton selected={fail} onClick={() => setFail(value => !value)}>{failureToolCopy.request}</PreviewToolButton></PreviewTools></Stack>;
}
