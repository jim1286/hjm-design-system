import { Heading } from "@hjmds/react/heading";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Bookmark, Search } from "lucide-react";
import { Button, IconButton } from "@hjmds/react/actions";
import { SearchField, TextField } from "@hjmds/react/forms";
import { Grid, Stack, Surface, Text } from "@hjmds/react/layout";
import { Chip, SegmentedControl, Switch } from "@hjmds/react/selection";
import { Collapsible } from "@hjmds/react/collapsible";
import { StatusText } from "@hjmds/react/status-text";
import { ScreenLayout } from "@hjmds/react/screens";
import { Sheet } from "@hjmds/react/overlays";
import { Steps } from "@hjmds/react/steps";
import { EmptyState, Notice } from "@hjmds/react/feedback";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useDemoAction } from "./action-recovery-previews.js";
import { PreviewRoute, PreviewTools, PreviewToolButton } from "./preview-tools.js";
import { categories, records, emptyFilters, filterRecords, initialDraft, sameDraft, draftError, editorCopy, scopeCopy, flowSteps, stepLabels, stepName, introFeatures, comparisonModeCopy, comparisonActionCopy, type ComparisonMode, type EditorKind, type Draft } from "../../../shared/reference-flows.js";
import "./reference-flows.css";

// Screens use ScreenLayout inside the shared PreviewRoute host (the story canvas is the route); Grid folds the columns.
// 2026-10-06: the earlier `.hjm-reference` CSS padding/max-width re-implemented Container's gutter and
// width, and the screens bypassed ScreenLayout, so the usage guide had to describe a different frame.
// 2026-10-17: file-local Action/Row/Title/Status/Modal/ScreenHost wrappers were removed so the example
// reads as product code: public Button/Stack/Heading/StatusText/Sheet only.
// Two columns fold to one below 240 (`spacing.xxxl` × 6), the same reading minimum as before.
const twoColumnMin = { compact: spacing.xxxl * 6 };
function Art({ label }: { label: string }) { return <div className="hjm-reference__art" role="img" aria-label={`${label} · 직접 만든 추상 일러스트`}><span className="hjm-reference__sun" /><span className="hjm-reference__land" /><Text variant="label">{label}</Text></div>; }

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
  const inputRef = useRef<HTMLInputElement>(null);
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
  const leave = () => { if (locked()) return; if (kind === "settings" && dirty) setConfirmLeave(true); else setPaused(true); };
  const validate = () => { if (!draftError(draft)) return true; setInvalid(true); inputRef.current?.focus(); return false; };
  const review = () => { if (!locked() && validate()) setStage(2); };
  const save = () => { if (locked() || !validate()) return; const submitted = { ...draft }; void session.run(() => request(submitted), { retryable: true }); };
  const revert = () => { if (locked()) return; const saved = session.getSnapshot().value; setDraft(saved); session.reset(saved); setInvalid(false); };
  // Keep a stable heading target across stages; moving focus is tied to navigation, not typing.
  const stageRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement>(null);
  const navigation = `${stage}:${paused}:${done}:${viewResult}`;
  const previousNavigation = useRef(navigation);
  useEffect(() => { if (previousNavigation.current !== navigation) stageRef.current?.focus(); previousNavigation.current = navigation; }, [navigation]);
  const summary = <Stack gap="md"><Text variant="title">{draft.title || "아직 입력하지 않았어요"}</Text><Text>{draft.category} · 알림 {draft.enabled ? "켜짐" : "꺼짐"}</Text></Stack>;
  // 2026-10-17 user rule: leaving ("설정 나가기", "초안 남기고 쉬기") is the header's leading icon button, not a body text button.
  const exit = paused || done ? {} : { exit: { kind: kind === "settings" ? "back" as const : "close" as const, label: kind === "settings" ? "설정 나가기" : "초안 남기고 쉬기", disabled: busy, onClick: () => { returnFocusRef.current = document.activeElement as HTMLElement | null; leave(); } } };
  return <PreviewRoute><ScreenLayout title={copy.title} {...exit}><Stack gap="xl"><div ref={stageRef} tabIndex={-1} aria-label={copy.title}><Text tone="muted">{copy.intro}</Text></div>
    {paused ? <Surface padding="lg"><Stack gap="lg"><Heading level="level3" semanticLevel={1}>{kind === "settings" ? "설정에서 나왔어요" : "초안이 남아 있어요"}</Heading>{summary}<Stack axis="inline" wrap gap="sm" justify="end"><Button tone="secondary" onClick={reset}>처음부터</Button><Button onClick={() => setPaused(false)}>이어하기</Button></Stack></Stack></Surface>
    : done ? <Surface padding="lg"><Stack gap="lg"><Notice tone="success" title={copy.complete} />{summary}<Text>{viewResult ? "저장한 기록의 상세 내용이에요." : "확인된 결과를 바로 열어 볼 수 있어요."}</Text><Stack axis="inline" wrap gap="sm" justify="end"><Button tone="secondary" onClick={reset}>다시 해보기</Button><Button onClick={() => { if (kind === "settings") session.reset(state.value); else setViewResult(value => !value); }}>{kind === "settings" ? "계속 수정하기" : viewResult ? "완료 화면으로" : "저장한 기록 보기"}</Button></Stack></Stack></Surface>
    : <Stack gap="lg">
      {kind !== "settings" && <Steps descriptor={{ steps: flowSteps, currentStepId: flowSteps[stage]!.id, currentStepStatus: invalid || state.status === "error" ? "error" : "current" }} statusLabels={stepLabels} composeAccessibleName={stepName} />}
      <Surface padding="lg"><Stack gap="lg">
        <StatusText>{kind === "settings" ? dirty ? "저장하지 않은 변경이 있어요" : "설정을 저장했어요" : `${stage + 1}단계 · ${flowSteps[stage]!.label}`}</StatusText>
        {stage === 0 ? <><Heading level="level5" semanticLevel={2}>어떤 장면을 기록할까요?</Heading><Stack axis="inline" wrap gap="sm">{categories.map(category => <Chip key={category} label={category} selectionMode="single" selected={draft.category === category} onSelectedChange={() => change({ category })} />)}</Stack><Stack gap="xs"><Button onClick={() => { if (!locked()) setStage(1); }}>이 주제로 기록하기</Button><Button tone="secondary" onClick={() => { if (!locked()) setStage(1); }}>나중에 정하기</Button></Stack></>
        : stage === 1 ? <><TextField ref={inputRef} label={copy.field} value={draft.title} disabled={busy} onValueChange={title => change({ title })} {...(invalid ? { error: draftError(draft) ?? "" } : {})} /><Stack axis="inline" wrap gap="sm">{categories.map(category => <Chip key={category} label={category} selectionMode="single" disabled={busy} selected={draft.category === category} onSelectedChange={() => change({ category })} />)}</Stack>
          {/* 2026-10-16 review: an on/off setting is a Switch, not a text button. */}<Switch label="기록 알림" description="기록할 시간에 알려 드려요." checked={draft.enabled} disabled={busy} onCheckedChange={enabled => change({ enabled })} />
          {kind === "settings" ? <Stack gap="xs"><Button loading={busy} disabled={!dirty} onClick={save}>{copy.submit}</Button><Button tone="secondary" disabled={busy || !dirty} onClick={revert}>변경 되돌리기</Button></Stack> : <Button onClick={review}>기록 확인</Button>}</>
        : <>{summary}<Stack axis="inline" wrap gap="sm" justify="end"><Button tone="secondary" disabled={busy} onClick={() => { if (!locked()) setStage(1); }}>내용 수정</Button><Button loading={busy} onClick={save}>{state.status === "error" ? "입력한 내용 다시 저장" : copy.submit}</Button></Stack></>}
        {state.status === "error" && <Notice tone="danger" title="저장하지 못했어요" description="입력은 그대로 남아 있어요. 내용을 확인하고 다시 저장해 주세요." />}
      </Stack></Surface>
      {stage > 0 && kind === "first" && <Stack axis="inline" wrap gap="sm"><Button tone="secondary" disabled={busy} onClick={() => { if (!locked()) setStage(previous => Math.max(0, previous - 1)); }}>이전 단계</Button></Stack>}
      <PreviewTools><PreviewToolButton disabled={busy} selected={failureArmed} onClick={() => { if (!locked()) toggleFailure(); }}>다음 저장 실패시키기</PreviewToolButton></PreviewTools>
    </Stack>}
    <Text tone="muted" variant="caption">{scopeCopy}</Text>
    <Sheet returnFocusRef={returnFocusRef} open={confirmLeave} onOpenChange={value => { if (!value) setConfirmLeave(false); }} closeLabel="닫기" title="저장하지 않은 변경이 있어요" footer={<Stack axis="inline" wrap gap="sm" justify="end"><Button tone="danger" onClick={() => { if (locked()) return; revert(); setConfirmLeave(false); setPaused(true); returnFocusRef.current = stageRef.current; }}>변경 버리고 나가기</Button><Button onClick={() => setConfirmLeave(false)}>계속 수정</Button></Stack>}><Text>변경을 버리면 마지막으로 저장한 설정으로 돌아가요.</Text></Sheet>
  </Stack></ScreenLayout></PreviewRoute>;
}
export function FirstTask() { return <Editor kind="first" />; }
export function RecoverableSettings() { return <Editor kind="settings" />; }
export function SelectionReview() { return <Editor kind="review" />; }

export function ServiceIntroduction({ editorial = false }: { editorial?: boolean }) {
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  // Pointer activation does not focus buttons in Safari; remember the actual invoking CTA.
  const start = (event: MouseEvent<HTMLButtonElement>) => { returnFocusRef.current = event.currentTarget; setOpen(true); };
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  // Both CTAs open the same sheet, so the screen still has one primary intent.
  const intro = <Stack gap="lg"><Text tone="brand" variant="label">오늘의 한 장면</Text><Text>대단한 이야기일 필요 없어요. 지금 기억하고 싶은 순간부터 시작해요.</Text><Button onClick={start}>첫 장면 남기기</Button></Stack>;
  const preview = <Surface padding="lg"><Stack gap="lg"><Text variant="label">{note ? "방금 남긴 장면" : "직접 만든 기록 예시"}</Text><Art label="산책의 빛" /><Heading level="level5" semanticLevel={2}>{note || records[0].title}</Heading><Text>{note ? "이 미리보기에 저장했어요." : records[0].body}</Text></Stack></Surface>;
  const story = <Stack gap="lg"><Heading level="level4" semanticLevel={2}>매일 쓰지 않아도 괜찮아요</Heading><Text>다시 시작한 날부터 이어지는 기록. 빈칸을 채우는 대신 남기고 싶은 것을 골라요.</Text><Text>한 줄을 적고, 주제를 고르고, 나중에 다시 읽어요.</Text></Stack>;
  return <PreviewRoute><ScreenLayout title={editorial ? "오래 남는 건, 작은 장면이에요" : "지나간 하루를 한 줄로 붙잡아요"}><Stack gap="xl">
    {editorial ? intro : null}
    <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{editorial ? story : intro}{preview}</Grid>
    <Grid columns={{ compact: 3 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{introFeatures.map(feature => <Stack key={feature.id} gap="sm"><Text tone="brand" variant="label">{feature.order}</Text><Heading level="level5" semanticLevel={2}>{feature.title}</Heading><Text>{feature.body}</Text></Stack>)}</Grid>
    {/* A question that reveals its answer is a disclosure, not a selected Button (2026-10-16 review). */}
    <Collapsible trigger="기록은 어디에 저장되나요?"><Text>{scopeCopy}</Text></Collapsible>
    <Surface padding="lg"><Stack gap="md"><Heading level="level5" semanticLevel={2}>오늘, 어떤 장면을 남길까요?</Heading><Button onClick={start}>한 줄 써보기</Button></Stack></Surface>
    {note && <StatusText>{`저장한 장면: ${note}`}</StatusText>}<Text tone="muted" variant="caption">{scopeCopy}</Text>
  </Stack></ScreenLayout>
    <Sheet returnFocusRef={returnFocusRef} open={open} onOpenChange={value => { if (!value) setOpen(false); }} closeLabel="닫기" title="첫 장면 남기기" footer={<Button disabled={!draft.trim()} onClick={() => { setNote(draft.trim()); setOpen(false); }}>미리보기에 저장</Button>}><TextField label="기억하고 싶은 장면" value={draft} onValueChange={setDraft} /></Sheet>
  </PreviewRoute>;
}

export function RecordComparison() {
  const [mode, setMode] = useState<ComparisonMode>("list");
  const [query, setQuery] = useState("");
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Reset removes its own empty-state button; continue typing in the preserved search field.
  const resetSearch = () => { searchRef.current?.focus(); setQuery(""); };
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<typeof records[number] | null>(null);
  const results = filterRecords(query, emptyFilters());
  const cards = results.map(record => <Surface key={record.id} padding="lg"><Stack gap={mode === "list" ? "sm" : "lg"}>{mode === "image" && record.image && <Art label={record.category} />}<Text tone="muted" variant="caption">{record.category}</Text><Heading level={mode === "reading" ? "level4" : "level5"} semanticLevel={2}>{record.title}</Heading>{mode !== "list" && <Text>{record.body}</Text>}<Stack axis="inline" wrap gap="sm" align="center"><Button tone="secondary" onClick={event => { returnFocusRef.current = event.currentTarget; setSelected(record); }} aria-label={comparisonActionCopy.readName(record.title)}>{comparisonActionCopy.read}</Button><IconButton tone="secondary" selected={saved.includes(record.id)} label={comparisonActionCopy.saveName(record.title)} onClick={() => setSaved(current => current.includes(record.id) ? current.filter(id => id !== record.id) : [...current, record.id])}><Bookmark size={20} aria-hidden fill={saved.includes(record.id) ? "currentColor" : "none"} /></IconButton></Stack></Stack></Surface>);
  return <PreviewRoute><ScreenLayout title="무엇을 먼저 보고 싶나요?" description="데이터와 행동은 유지하고 정보의 밀도와 순서를 비교해 보세요."><Stack gap="xl">
    <SegmentedControl label="보기 방식" items={(Object.keys(comparisonModeCopy) as ComparisonMode[]).map(value => ({ value, label: comparisonModeCopy[value] }))} value={mode} onValueChange={value => setMode(value as ComparisonMode)} />
    <SearchField ref={searchRef} label="같은 기록 검색" clearLabel="검색어 지우기" placeholder={comparisonActionCopy.searchPlaceholder} renderSearchIcon={({ color, size }) => <Search aria-hidden color={color} size={size} />} value={query} onValueChange={setQuery} /><StatusText>{`${comparisonModeCopy[mode]} · ${results.length}개의 기록 · ${saved.length}개 저장`}</StatusText>
    {!results.length ? <EmptyState density="compact" title="찾는 기록이 없어요" description="다른 검색어로 찾아보세요." action={<Button tone="secondary" onClick={resetSearch}>검색 초기화</Button>} />
    : mode === "image" ? <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={twoColumnMin}>{cards}</Grid> : <Stack gap="lg">{cards}</Stack>}
    <Text tone="muted" variant="caption">직접 만든 기록과 추상 일러스트입니다. 사진이 없는 기록도 본문을 온전히 보여 줍니다.</Text>
  </Stack></ScreenLayout>
    <Sheet returnFocusRef={returnFocusRef} open={selected !== null} onOpenChange={value => { if (!value) setSelected(null); }} closeLabel="닫기" title={selected?.title ?? "기록"} footer={<Button tone="secondary" onClick={() => setSelected(null)}>읽기 마치기</Button>}><Text>{selected?.body}</Text></Sheet>
  </PreviewRoute>;
}
