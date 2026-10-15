import { useState } from "react";
import { FollowProfileCard, EventAttendanceCard } from "@hjmds/react-native/social-compositions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Checkbox } from "@hjmds/react-native/inputs";
import { resolveFollowProposal, resolveAttendanceProposal } from "@hjmds/design-contracts/social-compositions";
const choices = [{ id: "yes", label: "참석", attending: true }, { id: "maybe", label: "미정", attending: false }, { id: "no", label: "불참", attending: false }];
export function FollowProfilePreview() {
 const [state, setState] = useState({ following: false, count: 128 }), [fail, setFail] = useState(false);
 return <Stack gap="md"><FollowProfileCard profileId="writer" name="지민의 기록" description="작은 관찰을 모아 오래 남기는 기록가" locale="ko-KR" state={state}
   labels={{ follow: "팔로우", following: "팔로잉", pending: "팔로우 처리 중", count: "팔로워", error: "변경하지 못했어요. 이전 상태를 유지합니다." }}
   onFollowChange={async following => { if (fail) throw new Error("fixture failure"); setState(previous => resolveFollowProposal(previous, following)); }} />
  <Checkbox label="요청 실패 상황" checked={fail} onCheckedChange={setFail} />
  <Text>예시 어댑터 · 제품에서는 서버가 확정한 팔로우와 인원을 전달하세요.</Text></Stack>;
}
export function EventAttendancePreview() {
 const [state, setState] = useState<{ responseId: string | null; count: number }>({ responseId: null, count: 2 }), [fail, setFail] = useState(false), [calendar, setCalendar] = useState(0);
 return <Stack gap="md"><EventAttendanceCard eventId="walk" title="함께 걷고 기록하는 토요일" description="동네 산책 후 마음에 남은 장면을 나눠요." dateLabel="10월 24일 토요일 · 오전 10시" locale="ko-KR" state={state} choices={choices}
   participants={[{ id: "a", name: "민수" }, { id: "b", name: "수진" }, ...(state.responseId === "yes" ? [{ id: "me", name: "나" }] : [])]}
   labels={{ response: "참석 여부", pending: "처리 중", count: "참석자", calendar: "캘린더 연결 확인", calendarAdded: "예시 캘린더 연결 완료", error: "처리하지 못했어요. 같은 행동으로 다시 시도하세요." }}
   onResponseChange={async responseId => { if (fail) throw new Error("fixture failure"); setState(previous => resolveAttendanceProposal(previous, choices, responseId)); }}
   onAddToCalendar={async () => { if (fail) throw new Error("fixture failure"); setCalendar(n => n + 1); }} />
  <Checkbox label="요청 실패 상황" checked={fail} onCheckedChange={setFail} />
  <Text>예시 어댑터 · 캘린더 연결 호출 {calendar}회. 실제 제품은 기기 캘린더·권한 API를 연결합니다.</Text></Stack>;
}
