import { Heading } from "@hjmds/react-native/heading";
import { useRef, useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { StatusText } from "@hjmds/react-native/status-text";
import { PreviewToolButton, PreviewTools } from "./preview-tools";

export function useDemoAction<T>(initial: T) {
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
// Demo-only controls (failure arming, simulated server refresh) sit in PreviewTools after the composition
// so they never read as product actions (SELECTION.md 조립 규칙).
// The product screen owns the outer frame (ScrollView + Container); the preview shows it so the example matches the usage guide.
// Status copy is a status→copy table like the product's status→i18n-key table; no template-built keys.
const saveStatusCopy = { idle: "내용을 입력한 뒤 저장해 보세요.", pending: "저장 중이에요.", success: "저장했어요.", error: "저장하지 못했어요. 입력한 내용은 남아 있어요." } as const;
const bookmarkStatusCopy = { idle: "북마크를 눌러 보세요.", pending: "화면에 먼저 반영했어요. 저장 확인 중이에요.", success: "서버 저장이 확인됐어요.", error: "반영하지 못해 이전 상태로 돌아왔어요." } as const;
const archiveStatusCopy = { pending: "요청을 확인하고 있어요.", error: "작업에 실패했어요. 마지막으로 확인한 상태를 유지했어요.", archived: "보관했어요. 실행 취소로 되돌릴 수 있어요.", listed: "목록에 있어요." } as const;
export function SaveRecoveryPreview() {
 const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction("");
 const [draft, setDraft] = useState("");
 // A request confirms its submitted snapshot; edits made during that request remain unsaved.
 const status = state.status === "success" && draft !== state.value
  ? "제출한 내용은 저장했어요. 현재 입력은 아직 저장하지 않았어요." : saveStatusCopy[state.status];
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.lg }}><Container gutter="compact" size="reading"><Stack gap="md"><Heading level="level3">입력은 유지하고 다시 저장</Heading>
  <TextField label="기록 내용" value={draft} onValueChange={setDraft} />
  <Stack gap="xs"><Button loading={busy} disabled={!draft.trim()} onPress={() => { const submitted = draft; void session.run(() => request(submitted), { retryable: true }); }}>저장</Button>
  {state.status === "error" && <Button tone="secondary" onPress={() => { void session.retry(); }}>실패한 내용 다시 저장</Button>}</Stack>
  <StatusText>{status}</StatusText>
  <Text>저장된 내용: {state.value || "아직 없어요"}</Text>
  <Text>실제 서버 요청 없이 실패와 복구를 확인하는 예제예요. 입력은 이 화면이 열린 동안 유지돼요.</Text>
  <PreviewTools><PreviewToolButton selected={failureArmed} onPress={toggleFailure}>다음 요청 실패시키기</PreviewToolButton></PreviewTools>
 </Stack></Container></ScrollView>;
}
export function OptimisticRecoveryPreview() {
 const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction(false);
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.lg }}><Container gutter="compact" size="reading"><Stack gap="md"><Heading level="level3">즉시 반영하고 실패하면 복구</Heading>
  <Stack gap="xs"><Button selected={state.value} disabled={busy} onPress={() => { const next = !state.value; void session.run(() => request(next), { optimisticValue: next, retryable: true }); }}>{state.value ? "북마크 해제" : "북마크 추가"}</Button>
  {state.status === "error" && <Button tone="secondary" onPress={() => { void session.retry(); }}>북마크 다시 반영</Button>}</Stack>
  <StatusText>{bookmarkStatusCopy[state.status]}</StatusText>
  <Text>지연 중 새 상태를 불러오면 이전 요청의 응답은 화면을 덮어쓰지 않아요. 실제 서버 통신은 없는 예제예요.</Text>
  <PreviewTools><PreviewToolButton selected={failureArmed} onPress={toggleFailure}>다음 요청 실패시키기</PreviewToolButton><PreviewToolButton onPress={() => session.reset(false)}>서버에서 새 상태 불러오기</PreviewToolButton></PreviewTools>
 </Stack></Container></ScrollView>;
}
export function UndoRecoveryPreview() {
 const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction(false);
 const statusKey = state.status === "error" || state.status === "pending" ? state.status : state.value ? "archived" : "listed";
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.lg }}><Container gutter="compact" size="reading"><Stack gap="md"><Heading level="level3">보관 후 실행 취소</Heading>
  <Text>{state.value ? "보관함: 리서치 메모" : "목록: 리서치 메모"}</Text>
  <Stack gap="xs"><Button loading={busy} onPress={() => { const next = !state.value; void session.run(() => request(next), { retryable: true }); }}>{state.value ? "실행 취소" : "보관"}</Button>
  {state.status === "error" && <Button tone="secondary" onPress={() => { void session.retry(); }}>실패한 작업 다시 시도</Button>}</Stack>
  <StatusText>{archiveStatusCopy[statusKey]}</StatusText>
  <Text>복구 요청이 성공해야 목록으로 돌아와요. 학습용 예제에는 자동 만료와 실제 서버 요청이 없어요.</Text>
  <PreviewTools><PreviewToolButton selected={failureArmed} onPress={toggleFailure}>다음 요청 실패시키기</PreviewToolButton></PreviewTools>
 </Stack></Container></ScrollView>;
}
