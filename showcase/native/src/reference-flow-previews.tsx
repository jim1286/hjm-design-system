import { Container } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";
// Platform views share data/validation and the existing action-session demo; no new public engine.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { SearchField, SegmentedControl, TextField } from "@hjmds/react-native/inputs";
import { Grid, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Sheet } from "@hjmds/react-native/overlays";
import { Steps } from "@hjmds/react-native/steps";
import { EmptyState, Notice } from "@hjmds/react-native/feedback";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { PatternStatus } from "./pattern-status";
import { useDemoAction } from "./action-recovery-previews";
import { categories, records, emptyFilters, filterRecords, initialDraft, sameDraft, draftError, editorCopy, scopeCopy, flowSteps, stepLabels, stepName, introFeatures, comparisonModeCopy, type ComparisonMode, type EditorKind, type Draft } from "../../shared/reference-flows";

const ReturnFocus = createContext<RefObject<View | null> | undefined>(undefined);
function Frame({ children }: { children: ReactNode }) {
  const target = useRef<View>(null);
  return <ReturnFocus.Provider value={target}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.lg, paddingBottom: spacing.xxxl }}><Container><Stack gap="xl">{children}</Stack></Container></ScrollView></ReturnFocus.Provider>;
}
function Title({ children }: { children: string }) { return <Heading level="level3" >{children}</Heading>; }
function Status({ children }: { children: string }) { return <PatternStatus>{children}</PatternStatus>; }
function Row({ children }: { children: ReactNode }) { return <Stack axis="inline" wrap gap="sm">{children}</Stack>; }
function Action({ children, onAction, disabled = false, loading = false, selected, primary = false }: { children: string; onAction(): void; disabled?: boolean; loading?: boolean; selected?: boolean; primary?: boolean }) {
  const host = useRef<View>(null); const target = useContext(ReturnFocus);
  return <View ref={host} collapsable={false} style={{ flexShrink: 1 }}><Button tone={primary ? "primary" : "secondary"} onPress={() => { if (target) target.current = host.current; onAction(); }} disabled={disabled} loading={loading} {...(selected === undefined ? {} : { selected })}>{children}</Button></View>;
}
function Field({ label, value, onChange, disabled = false, error }: { label: string; value: string; onChange(value: string): void; disabled?: boolean; error?: string }) {
  return <TextField label={label} value={value} onValueChange={onChange} disabled={disabled} {...(error ? { error } : {})} />;
}
function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose(): void; title: string; children: ReactNode; footer?: ReactNode }) {
  const target = useContext(ReturnFocus);
  // Freeze the trigger while open: an action inside the sheet must not become its return target.
  const trigger = useRef<View>(null); const wasOpen = useRef(false);
  if (open && !wasOpen.current) trigger.current = target?.current ?? null;
  wasOpen.current = open;
  return <Sheet open={open} onOpenChange={value => { if (!value) onClose(); }} title={title} closeLabel="닫기" footer={footer} returnFocusRef={trigger} keyboardAvoidance scrollable><Stack gap="md">{children}</Stack></Sheet>;
}
// Screens render ScreenLayout inside the host's remaining height (720 like the other screen previews).
// 2026-10-06: they used the composition Frame (ScrollView + Container) and a width/fontScale column
// switch; ScreenLayout owns scroll and padding and Grid folds the columns.
function ScreenHost({ children }: { children: ReactNode }) {
  const target = useRef<View>(null);
  return <ReturnFocus.Provider value={target}><View style={{ height: 720 }}>{children}</View></ReturnFocus.Provider>;
}
// Two columns fold to one below 240 (`spacing.xxxl` × 6), the Web reading minimum.
const twoColumnMin = { compact: spacing.xxxl * 6 };
function Art({ label }: { label: string }) {
  const { colors } = useHjmNativeTheme();
  return <View accessible accessibilityRole="image" accessibilityLabel={`${label} · 직접 만든 추상 일러스트`} style={{ aspectRatio: 1.6, overflow: "hidden", backgroundColor: colors.surfaceAccent, borderRadius: radius.lg, padding: spacing.lg, justifyContent: "flex-end" }}>
    <View style={{ position: "absolute", width: "25%", aspectRatio: 1, borderRadius: radius.full, top: "15%", right: "15%", backgroundColor: colors.primary }} />
    <View style={{ position: "absolute", width: "130%", height: "55%", borderRadius: radius.full, left: "-10%", bottom: "-15%", backgroundColor: colors.surfaceAlt }} />
    <Text variant="label">{label}</Text>
  </View>;
}

function Editor({ kind }: { kind: EditorKind }) {
  const copy = editorCopy[kind];
  const [draft, setDraft] = useState<Draft>(() => initialDraft(kind));
  const [stage, setStage] = useState(kind === "first" ? 0 : 1);
  const [paused, setPaused] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [viewResult, setViewResult] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const { session, state, request, busy, failureArmed, toggleFailure } = useDemoAction<Draft>(initialDraft(kind));
  const dirty = !sameDraft(draft, state.value);
  const done = state.status === "success" && !dirty;
  const change = (patch: Partial<Draft>) => { setDraft(previous => ({ ...previous, ...patch })); setInvalid(false); if (state.status !== "idle") session.reset(state.value); };
  const reset = () => { const next = initialDraft(kind); session.reset(next); setDraft(next); setStage(kind === "first" ? 0 : 1); setPaused(false); setInvalid(false); setViewResult(false); };
  const leave = () => { if (busy) return; if (kind === "settings" && dirty) setConfirmLeave(true); else setPaused(true); };
  const review = () => { if (draftError(draft)) setInvalid(true); else setStage(2); };
  const save = () => { if (draftError(draft)) { setInvalid(true); return; } const submitted = { ...draft }; void session.run(() => request(submitted), { retryable: true }); };
  // Host back uses the same draft policy as the visible leave action; sheets own their dismissal.
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (paused || confirmLeave) return false;
      leave(); return true;
    });
    return () => subscription.remove();
  }, [paused, confirmLeave, busy, dirty]);
  const summary = <Stack gap="md"><Text variant="title">{draft.title || "아직 입력하지 않았어요"}</Text><Text>{draft.category} · 알림 {draft.enabled ? "켜짐" : "꺼짐"}</Text></Stack>;
  return <Frame><Text tone="brand" variant="label">기록의 시작</Text><Title>{copy.title}</Title><Text tone="muted">{copy.intro}</Text>
    {paused ? <Surface padding="lg"><Stack gap="lg"><Title>{kind === "settings" ? "설정에서 나왔어요" : "초안이 남아 있어요"}</Title>{summary}<Row><Action primary onAction={() => setPaused(false)}>이어하기</Action><Action onAction={reset}>처음부터</Action></Row></Stack></Surface>
    : done ? <Surface padding="lg"><Stack gap="lg"><Notice tone="success" title={copy.complete} />{summary}<Text>{viewResult ? "저장한 기록의 상세 내용입니다." : "확인된 결과를 바로 열어 볼 수 있어요."}</Text><Row><Action primary onAction={() => { if (kind === "settings") session.reset(state.value); else setViewResult(value => !value); }}>{kind === "settings" ? "계속 수정하기" : viewResult ? "완료 화면으로" : "저장한 기록 보기"}</Action><Action onAction={reset}>다시 해보기</Action></Row></Stack></Surface>
    : <Stack gap="lg">
      {kind !== "settings" && <Steps descriptor={{ steps: flowSteps, currentStepId: flowSteps[stage]!.id }} statusLabels={stepLabels} composeAccessibleName={stepName} />}
      <Surface padding="lg"><Stack gap="lg">
        <Status>{kind === "settings" ? dirty ? "저장하지 않은 변경이 있어요" : "저장된 설정입니다" : `${stage + 1}단계 · ${flowSteps[stage]!.label}`}</Status>
        {stage === 0 ? <><Heading level="level5">어떤 장면을 기록할까요?</Heading><Row>{categories.map(category => <Action key={category} selected={draft.category === category} onAction={() => change({ category })}>{category}</Action>)}</Row><Action primary onAction={() => setStage(1)}>이 주제로 기록하기</Action><Action onAction={() => setStage(1)}>나중에 정하기</Action></>
        : stage === 1 ? <><Field label={copy.field} value={draft.title} disabled={busy} onChange={title => change({ title })} {...(invalid ? { error: draftError(draft) ?? "" } : {})} /><Row>{categories.map(category => <Action key={category} disabled={busy} selected={draft.category === category} onAction={() => change({ category })}>{category}</Action>)}</Row>
          <Action disabled={busy} selected={draft.enabled} onAction={() => change({ enabled: !draft.enabled })}>{draft.enabled ? "기록 알림 켜짐" : "기록 알림 꺼짐"}</Action>
          {kind === "settings" ? <Row><Action primary loading={busy} disabled={!dirty} onAction={save}>{copy.submit}</Action><Action disabled={busy || !dirty} onAction={() => { setDraft(state.value); session.reset(state.value); setInvalid(false); }}>변경 되돌리기</Action></Row> : <Action primary onAction={review}>기록 확인</Action>}</>
        : <>{summary}<Row><Action disabled={busy} onAction={() => setStage(1)}>내용 수정</Action><Action primary loading={busy} onAction={save}>{state.status === "error" ? "입력한 내용 다시 저장" : copy.submit}</Action></Row></>}
        {state.status === "error" && <Notice tone="danger" title="저장하지 못했어요" description="입력은 그대로 남아 있어요. 내용을 확인하고 다시 저장해 주세요." />}
      </Stack></Surface>
      <Row>{stage > 0 && kind === "first" && <Action disabled={busy} onAction={() => setStage(previous => previous - 1)}>이전 단계</Action>}<Action disabled={busy} onAction={leave}>{kind === "settings" ? "설정 나가기" : "초안 남기고 쉬기"}</Action></Row>
      <Action disabled={busy} selected={failureArmed} onAction={toggleFailure}>{failureArmed ? "다음 저장 실패 예약됨" : "다음 저장 실패시키기"}</Action>
    </Stack>}
    <Text tone="muted" variant="caption">{scopeCopy}</Text>
    <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="저장하지 않은 변경이 있어요" footer={<Stack gap="sm"><Action primary onAction={() => setConfirmLeave(false)}>계속 수정</Action><Action onAction={() => { setDraft(state.value); session.reset(state.value); setConfirmLeave(false); setPaused(true); }}>변경 버리고 나가기</Action></Stack>}><Text>변경을 버리면 마지막으로 저장한 설정으로 돌아가요.</Text></Modal>
  </Frame>;
}
export function FirstTask() { return <Editor kind="first" />; }
export function RecoverableSettings() { return <Editor kind="settings" />; }
export function SelectionReview() { return <Editor kind="review" />; }

export function ServiceIntroduction({ editorial = false }: { editorial?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [faq, setFaq] = useState(false);
  // Both CTAs open the same sheet, so the screen still has one primary intent.
  const intro = <Stack gap="lg"><Text tone="brand" variant="label">오늘의 한 장면</Text><Text>대단한 이야기일 필요 없어요. 지금 기억하고 싶은 순간부터 시작해요.</Text><Action primary onAction={() => setOpen(true)}>첫 장면 남기기</Action></Stack>;
  const preview = <Surface padding="lg"><Stack gap="lg"><Text variant="label">{note ? "방금 남긴 장면" : "직접 만든 기록 예시"}</Text><Art label="산책의 빛" /><Heading level="level5">{note || records[0].title}</Heading><Text>{note ? "이 미리보기에 저장했어요." : records[0].body}</Text></Stack></Surface>;
  const story = <Stack gap="lg"><Heading level="level4">매일 쓰지 않아도 괜찮아요</Heading><Text>다시 시작한 날부터 이어지는 기록. 빈칸을 채우는 대신 남기고 싶은 것을 골라요.</Text><Text>한 줄을 적고, 주제를 고르고, 나중에 다시 읽어요.</Text></Stack>;
  return <ScreenHost><ScreenLayout title={editorial ? "오래 남는 건, 작은 장면이에요" : "지나간 하루를 한 줄로 붙잡아요"} scrollProps={{ keyboardDismissMode: "on-drag" }}><Stack gap="xl">
    {editorial ? intro : null}
    <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{editorial ? story : intro}{preview}</Grid>
    <Grid columns={{ compact: 3 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{introFeatures.map(feature => <Stack key={feature.id} gap="sm"><Text tone="brand" variant="label">{feature.order}</Text><Heading level="level5">{feature.title}</Heading><Text>{feature.body}</Text></Stack>)}</Grid>
    <Action selected={faq} onAction={() => setFaq(value => !value)}>기록은 어디에 저장되나요?</Action>{faq && <Text>{scopeCopy}</Text>}
    <Surface padding="lg"><Stack gap="md"><Heading level="level5">오늘, 어떤 장면을 남길까요?</Heading><Action primary onAction={() => setOpen(true)}>한 줄 써보기</Action></Stack></Surface>
    {note && <Status>{`저장한 장면: ${note}`}</Status>}<Text tone="muted" variant="caption">{scopeCopy}</Text>
  </Stack></ScreenLayout>
    <Modal open={open} onClose={() => setOpen(false)} title="첫 장면 남기기" footer={<Action primary disabled={!draft.trim()} onAction={() => { setNote(draft.trim()); setOpen(false); }}>미리보기에 저장</Action>}><Field label="기억하고 싶은 장면" value={draft} onChange={setDraft} /></Modal>
  </ScreenHost>;
}

export function RecordComparison() {
  const [mode, setMode] = useState<ComparisonMode>("list");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<typeof records[number] | null>(null);
  const results = filterRecords(query, emptyFilters());
  const cards = results.map(record => <Surface key={record.id} padding="lg"><Stack gap={mode === "list" ? "sm" : "lg"}>{mode === "image" && record.image && <Art label={record.category} />}<Text tone="muted" variant="caption">{record.category}</Text><Heading level={mode === "reading" ? "level4" : "level5"}>{record.title}</Heading>{mode !== "list" && <Text>{record.body}</Text>}<Row><Action onAction={() => setSelected(record)}>{`${record.title} 읽기`}</Action><Action selected={saved.includes(record.id)} onAction={() => setSaved(current => current.includes(record.id) ? current.filter(id => id !== record.id) : [...current, record.id])}>{`${record.title} ${saved.includes(record.id) ? "저장 취소" : "저장"}`}</Action></Row></Stack></Surface>);
  return <ScreenHost><ScreenLayout title="무엇을 먼저 보고 싶나요?" description="데이터와 행동은 유지하고 정보의 밀도와 순서를 비교해 보세요." scrollProps={{ keyboardDismissMode: "on-drag" }}><Stack gap="xl">
    <SegmentedControl label="보기 방식" items={(Object.keys(comparisonModeCopy) as ComparisonMode[]).map(value => ({ value, label: comparisonModeCopy[value] }))} value={mode} onValueChange={setMode} />
    <SearchField label="같은 기록 검색" clearLabel="검색어 지우기" value={query} onValueChange={setQuery} busyLabel="검색 중" /><Status>{`${comparisonModeCopy[mode]} · ${results.length}개의 기록 · ${saved.length}개 저장`}</Status>
    {!results.length ? <EmptyState density="compact" announcement="polite" title="찾는 기록이 없어요" description="다른 검색어로 찾아보세요." action={<Action onAction={() => setQuery("")}>검색 초기화</Action>} />
    : mode === "image" ? <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{cards}</Grid> : <Stack gap="lg">{cards}</Stack>}
    <Text tone="muted" variant="caption">직접 만든 기록과 추상 일러스트입니다. 사진이 없는 기록도 본문을 온전히 보여 줍니다.</Text>
  </Stack></ScreenLayout>
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? "기록"} footer={<Action onAction={() => setSelected(null)}>읽기 마치기</Action>}><Text>{selected?.body}</Text></Modal>
  </ScreenHost>;
}
