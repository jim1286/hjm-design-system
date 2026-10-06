import { Heading } from "@hjmds/react-native/heading";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { compositionBrandFixtures } from "../../shared/composition-brand-fixtures";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { Button } from "@hjmds/react-native/actions";
import { SearchField, TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { PatternStatus } from "./pattern-status";

// Selection state holds ids; visible copy comes from an id→copy table like the product's id→i18n-key table.
const displayCopy = { compact: "간결하게", detailed: "자세하게", large: "크게 보기" } as const;
type DisplayId = keyof typeof displayCopy;
const displayOptions = Object.keys(displayCopy) as DisplayId[];
// The product screen owns the outer frame; the preview shows it so the example matches the usage guide.
function Frame({ children }: { children: ReactNode }) { return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.md }}><Container gutter="compact"><Stack gap="md">{children}</Stack></Container></ScrollView>; }

export function ApplyOrDiscardSelection() {
 const [open, setOpen] = useState(false);
 const [applied, setApplied] = useState<DisplayId>("compact");
 const [draft, setDraft] = useState<DisplayId>(applied);
 const trigger = useRef<View>(null);
 const start = () => { setDraft(applied); setOpen(true); };
 return <Frame><Heading level="level3">선택 후 적용하거나 취소</Heading>
  <PatternStatus>{`현재 표시: ${displayCopy[applied]}`}</PatternStatus>
  <View ref={trigger} collapsable={false}><Button onPress={start}>표시 방식 선택</Button></View>
  <Sheet open={open} onOpenChange={setOpen} title="표시 방식 선택" closeLabel="닫기" returnFocusRef={trigger}
   footer={<Stack gap="sm"><Button onPress={() => { setApplied(draft); setOpen(false); }}>선택 적용</Button><Button tone="secondary" onPress={() => setOpen(false)}>선택 취소</Button></Stack>}>
   <Stack gap="md">{displayOptions.map(id => <Button key={id} tone="secondary" selected={draft === id} onPress={() => setDraft(id)}>{displayCopy[id]}</Button>)}
    <Text>적용을 눌러야 화면이 바뀌어요. 취소하거나 닫으면 기존 선택을 유지해요.</Text>
   </Stack>
  </Sheet>
 </Frame>;
}

export function ReopenDraft() {
 const [open, setOpen] = useState(false); const [draft, setDraft] = useState(""); const [saved, setSaved] = useState("");
 const trigger = useRef<View>(null);
 return <Frame><Heading level="level3">작성 중 닫고 초안 이어쓰기</Heading>
  <View ref={trigger} collapsable={false}><Button onPress={() => setOpen(true)}>메모 작성</Button></View>
  <PatternStatus>{draft ? "작성 중인 초안이 있어요." : "작성 중인 초안이 없어요."}</PatternStatus>
  <Text>저장된 메모: {saved || "아직 없어요"}</Text>
  <Sheet open={open} onOpenChange={setOpen} title="메모 작성" closeLabel="초안을 남기고 닫기" returnFocusRef={trigger} keyboardAvoidance scrollable
   footer={<Stack gap="sm"><Button disabled={!draft.trim()} onPress={() => { setSaved(draft); setDraft(""); setOpen(false); }}>메모 저장</Button><Button tone="secondary" onPress={() => { setDraft(""); setOpen(false); }}>초안 버리기</Button></Stack>}>
   <Stack gap="md"><TextField label="메모 내용" value={draft} onValueChange={setDraft} />
    <Text>닫았다 다시 열면 이어 쓸 수 있어요. 이 예제는 화면이 열린 동안 초안을 유지해요.</Text>
   </Stack>
  </Sheet>
 </Frame>;
}

// Status copy per session status (product: status → i18n key table; template-built keys escape key checks).
const latestSearchCopy = { idle: "아직 검색하지 않았어요.", pending: "검색 중이에요.", error: "검색하지 못했어요. 검색어는 그대로예요." } as const;
// Demo-only latency in ms; `held` keeps the pending still frame observable. Products never add a minimum wait.
const searchDelay = { slow: 900, fast: 150, held: 60_000 } as const;
type LatestSearchProps = { initialState?: "idle" | "pending" | "error"; brand?: "default" | keyof typeof compositionBrandFixtures };
function LatestSearchContents({ initialState = "idle" }: Pick<LatestSearchProps, "initialState">) {
 const [session] = useState(() => createActionSession<string | null>(null));
 const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
 const [query, setQuery] = useState("일기");
 // Read at execution time so `retry()` re-runs the same task without replaying the armed failure.
 const failNext = useRef(false);
 const [failureArmed, setFailureArmed] = useState(false);
 const search = (delay: number) => {
  const submitted = query.trim(); if (!submitted) return;
  // Search is read-only, so a new intent can detach the old result. This is not
  // a server cancellation or a concurrent-mutation policy (action-session.md).
  session.reset(session.getSnapshot().value);
  void session.run(async () => {
   await new Promise(resolve => setTimeout(resolve, delay));
   if (failNext.current) { failNext.current = false; setFailureArmed(false); throw new Error("demo-search-failed"); }
   return submitted;
  }, { retryable: true });
 };
 // The pending/error stories open in that state; the absorbed 검색 입력 example showed the same field states.
 useEffect(() => {
  if (initialState === "pending") search(searchDelay.held);
  if (initialState === "error") { failNext.current = true; search(searchDelay.fast); }
  return () => session.reset(null);
 }, []);
 const pending = state.status === "pending";
 const message = state.status === "pending" || state.status === "error" ? latestSearchCopy[state.status] : state.value ? `검색 결과: ${state.value}` : latestSearchCopy.idle;
 return <Frame><Heading level="level3">최신 검색 결과 유지</Heading>
  <SearchField label="검색어" clearLabel="검색어 지우기" value={query} onValueChange={setQuery} busy={pending} busyLabel="검색 중" />
  <Button tone="secondary" disabled={!query.trim()} onPress={() => search(searchDelay.slow)}>느린 응답으로 검색</Button>
  <Button tone="secondary" disabled={!query.trim()} onPress={() => search(searchDelay.fast)}>빠른 응답으로 검색</Button>
  <PatternStatus>{message}</PatternStatus>
  {state.status === "error" ? <Button tone="secondary" onPress={() => void session.retry()}>다시 검색</Button> : null}
  <Button tone="ghost" selected={failureArmed} onPress={() => { failNext.current = !failNext.current; setFailureArmed(failNext.current); }}>다음 검색 실패시키기</Button>
  <Text>느린 검색을 시작한 뒤 검색어를 바꿔 빠른 검색을 해보세요. 늦게 도착한 이전 결과가 최신 결과를 덮지 않아요. 실제 서버 요청은 없는 예제예요.</Text>
 </Frame>;
}

// The same composition receives a product palette; no product-specific layout or behavioral fork.
export function LatestSearchWins({ brand = "default", ...props }: LatestSearchProps) {
 return brand === "default" ? <LatestSearchContents {...props} /> : <HjmNativeProvider brandPalette={compositionBrandFixtures[brand]}><LatestSearchContents {...props} /></HjmNativeProvider>;
}
