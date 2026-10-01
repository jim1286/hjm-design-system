import { useRef, useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { PatternStatus } from "./pattern-status";

function useDemoAction<T>(initial: T) {
 const [session] = useState(() => createActionSession(initial));
 const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
 const failNext = useRef(false);
 const [failureArmed, setFailureArmed] = useState(false);
 const toggleFailure = () => { failNext.current = !failNext.current; setFailureArmed(failNext.current); };
 const request = async (value: T) => {
  const fails = failNext.current; failNext.current = false; setFailureArmed(false);
  // Only this demo adds delay; production sessions never impose a minimum wait.
  await new Promise(resolve => setTimeout(resolve, 350));
  if (fails) throw new Error("demo-request-failed");
  return value;
 };
 return { session, state, request, failureArmed, toggleFailure, busy: state.status === "pending" };
}
function FailureToggle({ selected, onToggle }: { selected: boolean; onToggle(): void }) {
 return <Button tone="secondary" selected={selected} onPress={onToggle}>다음 요청 실패시키기</Button>;
}
export function SaveRecoveryPreview() {
 const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction("");
 const [draft, setDraft] = useState("");
 const message = state.status === "pending" ? "저장 중이에요." : state.status === "error" ? "저장하지 못했어요. 입력한 내용은 남아 있어요." : state.status === "success" ? "저장했어요." : "내용을 입력한 뒤 저장해 보세요.";
 return <Stack gap="md"><Text variant="heading">입력은 유지하고 다시 저장</Text>
  <TextField label="기록 내용" value={draft} onValueChange={setDraft} />
  <Button loading={busy} disabled={!draft.trim()} onPress={() => { const submitted = draft; void session.run(() => request(submitted), { retryable: true }); }}>저장</Button>
  {state.status === "error" && <Button onPress={() => { void session.retry(); }}>실패한 내용 다시 저장</Button>}
  <FailureToggle selected={failureArmed} onToggle={toggleFailure} />
  <PatternStatus>{message}</PatternStatus>
  <Text>저장된 내용: {state.value || "아직 없어요"}</Text>
  <Text>실제 서버 요청 없이 실패와 복구를 확인하는 예제예요. 입력은 이 화면이 열린 동안 유지돼요.</Text>
 </Stack>;
}
export function OptimisticRecoveryPreview() {
 const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction(false);
 const message = state.status === "error" ? "반영하지 못해 이전 상태로 돌아왔어요." : state.status === "pending" ? "화면에 먼저 반영했어요. 저장 확인 중이에요." : state.status === "success" ? "서버 저장이 확인됐어요." : "북마크를 눌러 보세요.";
 return <Stack gap="md"><Text variant="heading">즉시 반영하고 실패하면 복구</Text>
  <Button selected={state.value} disabled={busy} onPress={() => { const next = !state.value; void session.run(() => request(next), { optimisticValue: next, retryable: true }); }}>{state.value ? "북마크 해제" : "북마크 추가"}</Button>
  {state.status === "error" && <Button onPress={() => { void session.retry(); }}>다시 시도</Button>}
  <FailureToggle selected={failureArmed} onToggle={toggleFailure} />
  <Button tone="ghost" onPress={() => session.reset(false)}>서버에서 새 상태 불러오기</Button>
  <PatternStatus>{message}</PatternStatus>
  <Text>지연 중 새 상태를 불러오면 이전 요청의 응답은 화면을 덮어쓰지 않아요. 실제 서버 통신은 없는 예제예요.</Text>
 </Stack>;
}
export function UndoRecoveryPreview() {
 const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction(false);
 const message = state.status === "error" ? "작업에 실패했어요. 마지막으로 확인한 상태를 유지했어요." : state.status === "pending" ? "요청을 확인하고 있어요." : state.value ? "보관했어요. 실행 취소로 되돌릴 수 있어요." : "목록에 있어요.";
 return <Stack gap="md"><Text variant="heading">보관 후 실행 취소</Text>
  <Text>{state.value ? "보관함: 리서치 메모" : "목록: 리서치 메모"}</Text>
  <Button loading={busy} onPress={() => { const next = !state.value; void session.run(() => request(next), { retryable: true }); }}>{state.value ? "실행 취소" : "보관"}</Button>
  {state.status === "error" && <Button onPress={() => { void session.retry(); }}>실패한 작업 다시 시도</Button>}
  <FailureToggle selected={failureArmed} onToggle={toggleFailure} />
  <PatternStatus>{message}</PatternStatus>
  <Text>복구 요청이 성공해야 목록으로 돌아와요. 학습용 예제에는 자동 만료와 실제 서버 요청이 없어요.</Text>
 </Stack>;
}
