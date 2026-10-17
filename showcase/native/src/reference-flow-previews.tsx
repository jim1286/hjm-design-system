import { Heading } from "@hjmds/react-native/heading";
// Platform views share data/validation and the existing action-session demo; no new public engine.
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react-native";
import { AccessibilityInfo, BackHandler, findNodeHandle, View, type TextInput } from "react-native";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { Chip, SearchField, SegmentedControl, Switch, TextField } from "@hjmds/react-native/inputs";
import { Grid, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Sheet } from "@hjmds/react-native/overlays";
import { Steps } from "@hjmds/react-native/steps";
import { EmptyState, Notice } from "@hjmds/react-native/feedback";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { StatusText } from "@hjmds/react-native/status-text";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { useDemoAction } from "./action-recovery-previews";
import { categories, records, emptyFilters, filterRecords, initialDraft, sameDraft, draftError, editorCopy, scopeCopy, flowSteps, stepLabels, stepName, introFeatures, comparisonModeCopy, comparisonActionCopy, type ComparisonMode, type EditorKind, type Draft } from "../../shared/reference-flows";

// Screens render ScreenLayout inside a 720-high host View like the other screen previews.
// 2026-10-06: they used the composition Frame (ScrollView + Container) and a width/fontScale column
// switch; ScreenLayout owns scroll and padding and Grid folds the columns.
// 2026-10-17: file-local Action/Row/Title/Status/Modal/ScreenHost wrappers were removed so the example
// reads as product code: public Button/Stack/Heading/StatusText/Sheet only.
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
  const inputRef = useRef<TextInput>(null);
  // Host callbacks may have been queued before disabled rendered; the session is the live lock.
  const locked = () => session.getSnapshot().status === "pending";
  const change = (patch: Partial<Draft> | ((previous: Draft) => Partial<Draft>)) => {
    if (locked()) return;
    setDraft(previous => ({ ...previous, ...(typeof patch === "function" ? patch(previous) : patch) }));
    setInvalid(false);
    const current = session.getSnapshot();
    if (current.status !== "idle") session.reset(current.value);
  };
  const reset = () => { if (locked()) return; const next = initialDraft(kind); session.reset(next); setDraft(next); setStage(kind === "first" ? 0 : 1); setPaused(false); setInvalid(false); setViewResult(false); };
  const leave = () => { if (locked()) return; returnFocusRef.current = stageRef.current; if (kind === "settings" && dirty) setConfirmLeave(true); else setPaused(true); };
  const validate = () => { if (!draftError(draft)) return true; setInvalid(true); inputRef.current?.focus(); return false; };
  const review = () => { if (!locked() && validate()) setStage(2); };
  const save = () => { if (locked() || !validate()) return; const submitted = { ...draft }; void session.run(() => request(submitted), { retryable: true }); };
  const revert = () => { if (locked()) return; const saved = session.getSnapshot().value; setDraft(saved); session.reset(saved); setInvalid(false); };
  // Host back uses the same draft policy as the visible leave action; sheets own their dismissal.
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (paused || confirmLeave) return false;
      leave(); return true;
    });
    return () => subscription.remove();
  }, [paused, confirmLeave, busy, dirty]);
  const stageRef = useRef<View>(null);
  const returnFocusRef = useRef<View>(null);
  const navigation = `${stage}:${paused}:${done}:${viewResult}`;
  const previousNavigation = useRef(navigation);
  useEffect(() => {
    if (previousNavigation.current === navigation) return;
    previousNavigation.current = navigation;
    const frame = requestAnimationFrame(() => {
      const target = stageRef.current;
      if (!target) return;
      const handle = findNodeHandle(target);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    });
    return () => cancelAnimationFrame(frame);
  }, [navigation]);
  const summary = <Stack gap="md"><Text variant="title">{draft.title || "아직 입력하지 않았어요"}</Text><Text>{draft.category} · 알림 {draft.enabled ? "켜짐" : "꺼짐"}</Text></Stack>;
  // 2026-10-17 user rule: leaving ("설정 나가기", "초안 남기고 쉬기") is the header's leading icon button, not a body text button.
  const exit = paused || done ? {} : { exit: { kind: kind === "settings" ? "back" as const : "close" as const, label: kind === "settings" ? "설정 나가기" : "초안 남기고 쉬기", disabled: busy, onPress: leave } };
  return <ScreenLayout title={copy.title} layoutStyle={{ flex: 1 }} {...exit}><Stack gap="xl"><View ref={stageRef} accessible accessibilityLabel={copy.intro}><Text tone="muted">{copy.intro}</Text></View>
    {paused ? <Surface padding="lg"><Stack gap="lg"><Heading level="level3">{kind === "settings" ? "설정에서 나왔어요" : "초안이 남아 있어요"}</Heading>{summary}<Stack axis="inline" wrap gap="sm" justify="end"><Button tone="secondary" onPress={reset}>처음부터</Button><Button onPress={() => setPaused(false)}>이어하기</Button></Stack></Stack></Surface>
    : done ? <Surface padding="lg"><Stack gap="lg"><Notice tone="success" title={copy.complete} />{summary}<Text>{viewResult ? "저장한 기록의 상세 내용이에요." : "확인된 결과를 바로 열어 볼 수 있어요."}</Text><Stack axis="inline" wrap gap="sm" justify="end"><Button tone="secondary" onPress={reset}>다시 해보기</Button><Button onPress={() => { if (kind === "settings") session.reset(state.value); else setViewResult(value => !value); }}>{kind === "settings" ? "계속 수정하기" : viewResult ? "완료 화면으로" : "저장한 기록 보기"}</Button></Stack></Stack></Surface>
    : <Stack gap="lg">
      {kind !== "settings" && <Steps descriptor={{ steps: flowSteps, currentStepId: flowSteps[stage]!.id, currentStepStatus: invalid || state.status === "error" ? "error" : "current" }} statusLabels={stepLabels} composeAccessibleName={stepName} />}
      <Surface padding="lg"><Stack gap="lg">
        <StatusText>{kind === "settings" ? dirty ? "저장하지 않은 변경이 있어요" : "설정을 저장했어요" : `${stage + 1}단계 · ${flowSteps[stage]!.label}`}</StatusText>
        {stage === 0 ? <><Heading level="level5">어떤 장면을 기록할까요?</Heading><Stack axis="inline" wrap gap="sm">{categories.map(category => <Chip key={category} label={category} selectionMode="single" selected={draft.category === category} onPress={() => change({ category })} />)}</Stack><Stack gap="xs"><Button onPress={() => { if (!locked()) setStage(1); }}>이 주제로 기록하기</Button><Button tone="secondary" onPress={() => { if (!locked()) setStage(1); }}>나중에 정하기</Button></Stack></>
        : stage === 1 ? <><TextField ref={inputRef} label={copy.field} value={draft.title} disabled={busy} onValueChange={title => change({ title })} {...(invalid ? { error: draftError(draft) ?? "" } : {})} /><Stack axis="inline" wrap gap="sm">{categories.map(category => <Chip key={category} label={category} selectionMode="single" disabled={busy} selected={draft.category === category} onPress={() => change({ category })} />)}</Stack>
          {/* 2026-10-16 review: an on/off setting is a Switch, not a text button. */}<Switch label="기록 알림" description="기록할 시간에 알려 드려요." checked={draft.enabled} disabled={busy} onCheckedChange={enabled => change({ enabled })} />
          {kind === "settings" ? <Stack gap="xs"><Button loading={busy} disabled={!dirty} onPress={save}>{copy.submit}</Button><Button tone="secondary" disabled={busy || !dirty} onPress={revert}>변경 되돌리기</Button></Stack> : <Button onPress={review}>기록 확인</Button>}</>
        : <>{summary}<Stack axis="inline" wrap gap="sm" justify="end"><Button tone="secondary" disabled={busy} onPress={() => { if (!locked()) setStage(1); }}>내용 수정</Button><Button loading={busy} onPress={save}>{state.status === "error" ? "입력한 내용 다시 저장" : copy.submit}</Button></Stack></>}
        {state.status === "error" && <Notice tone="danger" title="저장하지 못했어요" description="입력은 그대로 남아 있어요. 내용을 확인하고 다시 저장해 주세요." />}
      </Stack></Surface>
      {stage > 0 && kind === "first" && <Stack axis="inline" wrap gap="sm"><Button tone="secondary" disabled={busy} onPress={() => { if (!locked()) setStage(previous => Math.max(0, previous - 1)); }}>이전 단계</Button></Stack>}
      <PreviewTools><PreviewToolButton disabled={busy} selected={failureArmed} onPress={() => { if (!locked()) toggleFailure(); }}>다음 저장 실패시키기</PreviewToolButton></PreviewTools>
    </Stack>}
    <Text tone="muted" variant="caption">{scopeCopy}</Text>
    <Sheet returnFocusRef={returnFocusRef} open={confirmLeave} onOpenChange={open => { if (!open) setConfirmLeave(false); }} closeLabel="닫기" keyboardAvoidance scrollable title="저장하지 않은 변경이 있어요" footer={<Stack gap="xs"><Button onPress={() => setConfirmLeave(false)}>계속 수정</Button><Button tone="danger" onPress={() => { if (locked()) return; revert(); setConfirmLeave(false); setPaused(true); returnFocusRef.current = stageRef.current; }}>변경 버리고 나가기</Button></Stack>}><Text>변경을 버리면 마지막으로 저장한 설정으로 돌아가요.</Text></Sheet>
  </Stack></ScreenLayout>;
}
export function FirstTask() { return <Editor kind="first" />; }
export function RecoverableSettings() { return <Editor kind="settings" />; }
export function SelectionReview() { return <Editor kind="review" />; }

export function ServiceIntroduction({ editorial = false }: { editorial?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  // The sheet returns focus to whichever CTA opened it.
  const introCta = useRef<View>(null); const closingCta = useRef<View>(null); const returnFocusRef = useRef<View>(null);
  const start = (cta: View | null) => { returnFocusRef.current = cta; setOpen(true); };
  // Both CTAs open the same sheet, so the screen still has one primary intent.
  const intro = <Stack gap="lg"><Text tone="brand" variant="label">오늘의 한 장면</Text><Text>대단한 이야기일 필요 없어요. 지금 기억하고 싶은 순간부터 시작해요.</Text><Button ref={introCta} onPress={() => start(introCta.current)}>첫 장면 남기기</Button></Stack>;
  const preview = <Surface padding="lg"><Stack gap="lg"><Text variant="label">{note ? "방금 남긴 장면" : "직접 만든 기록 예시"}</Text><Art label="산책의 빛" /><Heading level="level5">{note || records[0].title}</Heading><Text>{note ? "이 미리보기에 저장했어요." : records[0].body}</Text></Stack></Surface>;
  const story = <Stack gap="lg"><Heading level="level4">매일 쓰지 않아도 괜찮아요</Heading><Text>다시 시작한 날부터 이어지는 기록. 빈칸을 채우는 대신 남기고 싶은 것을 골라요.</Text><Text>한 줄을 적고, 주제를 고르고, 나중에 다시 읽어요.</Text></Stack>;
  return <View style={{ height: 720 }}><ScreenLayout title={editorial ? "오래 남는 건, 작은 장면이에요" : "지나간 하루를 한 줄로 붙잡아요"} scrollProps={{ keyboardDismissMode: "on-drag" }}><Stack gap="xl">
    {editorial ? intro : null}
    <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{editorial ? story : intro}{preview}</Grid>
    <Grid columns={{ compact: 3 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{introFeatures.map(feature => <Stack key={feature.id} gap="sm"><Text tone="brand" variant="label">{feature.order}</Text><Heading level="level5">{feature.title}</Heading><Text>{feature.body}</Text></Stack>)}</Grid>
    {/* A question that reveals its answer is a disclosure, not a selected Button (2026-10-16 review). */}
    <Collapsible trigger="기록은 어디에 저장되나요?"><Text>{scopeCopy}</Text></Collapsible>
    <Surface padding="lg"><Stack gap="md"><Heading level="level5">오늘, 어떤 장면을 남길까요?</Heading><Button ref={closingCta} onPress={() => start(closingCta.current)}>한 줄 써보기</Button></Stack></Surface>
    {note && <StatusText announceOnMount>{`저장한 장면: ${note}`}</StatusText>}<Text tone="muted" variant="caption">{scopeCopy}</Text>
  </Stack></ScreenLayout>
    <Sheet open={open} onOpenChange={value => { if (!value) setOpen(false); }} title="첫 장면 남기기" closeLabel="닫기" returnFocusRef={returnFocusRef} keyboardAvoidance scrollable footer={<Button disabled={!draft.trim()} onPress={() => { setNote(draft.trim()); setOpen(false); }}>미리보기에 저장</Button>}><TextField label="기억하고 싶은 장면" value={draft} onValueChange={setDraft} /></Sheet>
  </View>;
}

export function RecordComparison() {
  const [mode, setMode] = useState<ComparisonMode>("list");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<typeof records[number] | null>(null);
  // Each record's read button is the sheet's return-focus target for that record.
  const readButtons = useRef(new Map<string, View>()); const returnFocusRef = useRef<View>(null);
  const results = filterRecords(query, emptyFilters());
  const cards = results.map(record => <Surface key={record.id} padding="lg"><Stack gap={mode === "list" ? "sm" : "lg"}>{mode === "image" && record.image && <Art label={record.category} />}<Text tone="muted" variant="caption">{record.category}</Text><Heading level={mode === "reading" ? "level4" : "level5"}>{record.title}</Heading>{mode !== "list" && <Text>{record.body}</Text>}<Stack axis="inline" wrap gap="sm"><Button tone="secondary" ref={node => { if (node) readButtons.current.set(record.id, node); else readButtons.current.delete(record.id); }} onPress={() => { returnFocusRef.current = readButtons.current.get(record.id) ?? null; setSelected(record); }} accessibilityLabel={comparisonActionCopy.readName(record.title)}>{comparisonActionCopy.read}</Button><Button tone="secondary" selected={saved.includes(record.id)} accessibilityLabel={comparisonActionCopy.saveName(record.title, saved.includes(record.id))} onPress={() => setSaved(current => current.includes(record.id) ? current.filter(id => id !== record.id) : [...current, record.id])}>{saved.includes(record.id) ? comparisonActionCopy.unsave : comparisonActionCopy.save}</Button></Stack></Stack></Surface>);
  return <View style={{ height: 720 }}><ScreenLayout title="무엇을 먼저 보고 싶나요?" description="데이터와 행동은 유지하고 정보의 밀도와 순서를 비교해 보세요." scrollProps={{ keyboardDismissMode: "on-drag" }}><Stack gap="xl">
    <SegmentedControl label="보기 방식" items={(Object.keys(comparisonModeCopy) as ComparisonMode[]).map(value => ({ value, label: comparisonModeCopy[value] }))} value={mode} onValueChange={setMode} />
    <SearchField label="같은 기록 검색" clearLabel="검색어 지우기" placeholder={comparisonActionCopy.searchPlaceholder} renderLeading={({ color, size }) => <Search color={color} size={size} />} value={query} onValueChange={setQuery} busyLabel="검색 중" /><StatusText>{`${comparisonModeCopy[mode]} · ${results.length}개의 기록 · ${saved.length}개 저장`}</StatusText>
    {!results.length ? <EmptyState density="compact" announcement="polite" title="찾는 기록이 없어요" description="다른 검색어로 찾아보세요." action={<Button tone="secondary" onPress={() => setQuery("")}>검색 초기화</Button>} />
    : mode === "image" ? <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{cards}</Grid> : <Stack gap="lg">{cards}</Stack>}
    <Text tone="muted" variant="caption">직접 만든 기록과 추상 일러스트입니다. 사진이 없는 기록도 본문을 온전히 보여 줍니다.</Text>
  </Stack></ScreenLayout>
    <Sheet open={selected !== null} onOpenChange={value => { if (!value) setSelected(null); }} title={selected?.title ?? "기록"} closeLabel="닫기" returnFocusRef={returnFocusRef} keyboardAvoidance scrollable footer={<Button tone="secondary" onPress={() => setSelected(null)}>읽기 마치기</Button>}><Text>{selected?.body}</Text></Sheet>
  </View>;
}
