import { useRef, useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { View } from "react-native";
import { PatternStatus } from "./pattern-status";

export function ApplyOrDiscardSelection() {
 const [open, setOpen] = useState(false);
 const [applied, setApplied] = useState("간결하게");
 const [draft, setDraft] = useState(applied);
 const trigger = useRef<View>(null);
 const start = () => { setDraft(applied); setOpen(true); };
 return <Stack gap="md"><Text variant="heading">선택 후 적용하거나 취소</Text>
  <PatternStatus>{`현재 표시: ${applied}`}</PatternStatus>
  <View ref={trigger} collapsable={false}><Button onPress={start}>표시 방식 선택</Button></View>
  <Sheet open={open} onOpenChange={setOpen} title="표시 방식 선택" closeLabel="닫기" returnFocusRef={trigger}
   footer={<Stack gap="sm"><Button onPress={() => { setApplied(draft); setOpen(false); }}>선택 적용</Button><Button tone="secondary" onPress={() => setOpen(false)}>선택 취소</Button></Stack>}>
   <Stack gap="md">{["간결하게", "자세하게", "크게 보기"].map(option => <Button key={option} tone="secondary" selected={draft === option} onPress={() => setDraft(option)}>{option}</Button>)}
    <Text>적용을 눌러야 화면이 바뀌어요. 취소하거나 닫으면 기존 선택을 유지해요.</Text>
   </Stack>
  </Sheet>
 </Stack>;
}

export function ReopenDraft() {
 const [open, setOpen] = useState(false); const [draft, setDraft] = useState(""); const [saved, setSaved] = useState("");
 const trigger = useRef<View>(null);
 return <Stack gap="md"><Text variant="heading">작성 중 닫고 초안 이어쓰기</Text>
  <View ref={trigger} collapsable={false}><Button onPress={() => setOpen(true)}>메모 작성</Button></View>
  <PatternStatus>{draft ? "작성 중인 초안이 있어요." : "작성 중인 초안이 없어요."}</PatternStatus>
  <Text>저장된 메모: {saved || "아직 없어요"}</Text>
  <Sheet open={open} onOpenChange={setOpen} title="메모 작성" closeLabel="초안을 남기고 닫기" returnFocusRef={trigger} keyboardAvoidance scrollable
   footer={<Stack gap="sm"><Button disabled={!draft.trim()} onPress={() => { setSaved(draft); setDraft(""); setOpen(false); }}>메모 저장</Button><Button tone="secondary" onPress={() => { setDraft(""); setOpen(false); }}>초안 버리기</Button></Stack>}>
   <Stack gap="md"><TextField label="메모 내용" value={draft} onValueChange={setDraft} />
    <Text>닫았다 다시 열면 이어 쓸 수 있어요. 이 예제는 화면이 열린 동안 초안을 유지해요.</Text>
   </Stack>
  </Sheet>
 </Stack>;
}

export function LatestSearchWins() {
 const [session] = useState(() => createActionSession("아직 검색하지 않았어요."));
 const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
 const [query, setQuery] = useState("일기");
 const search = (delay: number) => {
  const submitted = query.trim(); if (!submitted) return;
  // Search is read-only, so a new intent can detach the old result. This is not
  // a server cancellation or a concurrent-mutation policy (action-session.md).
  session.reset(state.value);
  void session.run(async () => { await new Promise(resolve => setTimeout(resolve, delay)); return `검색 결과: ${submitted}`; });
 };
 return <Stack gap="md"><Text variant="heading">최신 검색 결과 유지</Text>
  <TextField label="검색어" value={query} onValueChange={setQuery} />
  <Button disabled={!query.trim()} onPress={() => search(900)}>느린 응답으로 검색</Button>
  <Button disabled={!query.trim()} onPress={() => search(150)}>빠른 응답으로 검색</Button>
  <PatternStatus>{state.status === "pending" ? "검색 중이에요." : state.value}</PatternStatus>
  <Text>느린 검색을 시작한 뒤 검색어를 바꿔 빠른 검색을 해보세요. 늦게 도착한 이전 결과가 최신 결과를 덮지 않아요. 실제 서버 요청은 없는 예제예요.</Text>
 </Stack>;
}
