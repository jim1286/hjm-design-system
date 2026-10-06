import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { Sheet } from "@hjmds/react/overlays";
import { Steps } from "@hjmds/react/steps";
import { Notice } from "@hjmds/react/feedback";
import { useDemoAction } from "./action-recovery-previews";
import { categories, records, emptyFilters, filterRecords, toggleCategory, initialDraft, sameDraft, draftError, editorCopy, scopeCopy, flowSteps, stepLabels, stepName, type EditorKind, type Draft, type Filters } from "../../../shared/reference-flows";
import "./reference-flows.css";

function Frame({ children }: { children: ReactNode }) { return <main className="hjm-reference"><Stack gap="xl">{children}</Stack></main>; }
function Title({ children }: { children: string }) { return <Text variant="heading" role="heading" aria-level={1}>{children}</Text>; }
function Status({ children }: { children: string }) { return <Text role="status">{children}</Text>; }
function Row({ children }: { children: ReactNode }) { return <Stack axis="inline" wrap gap="sm">{children}</Stack>; }
function Action({ children, onAction, disabled = false, loading = false, selected, primary = false }: { children: string; onAction(): void; disabled?: boolean; loading?: boolean; selected?: boolean; primary?: boolean }) {
  return <Button tone={primary ? "primary" : "secondary"} onClick={onAction} disabled={disabled} loading={loading} {...(selected === undefined ? {} : { selected })}>{children}</Button>;
}
function Field({ label, value, onChange, disabled = false, error }: { label: string; value: string; onChange(value: string): void; disabled?: boolean; error?: string }) {
  return <TextField label={label} value={value} onValueChange={onChange} disabled={disabled} {...(error ? { error } : {})} />;
}
function Modal({ open, onClose, title, children }: { open: boolean; onClose(): void; title: string; children: ReactNode }) {
  return <Sheet open={open} onOpenChange={value => { if (!value) onClose(); }} title={title} closeLabel="닫기"><Stack gap="md">{children}</Stack></Sheet>;
}
function Columns({ children }: { children: ReactNode }) { return <div className="hjm-reference__columns">{children}</div>; }
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
  const change = (patch: Partial<Draft>) => { setDraft(previous => ({ ...previous, ...patch })); setInvalid(false); if (state.status !== "idle") session.reset(state.value); };
  const reset = () => { const next = initialDraft(kind); session.reset(next); setDraft(next); setStage(kind === "first" ? 0 : 1); setPaused(false); setInvalid(false); setViewResult(false); };
  const leave = () => { if (busy) return; if (kind === "settings" && dirty) setConfirmLeave(true); else setPaused(true); };
  const review = () => { if (draftError(draft)) setInvalid(true); else setStage(2); };
  const save = () => { if (draftError(draft)) { setInvalid(true); return; } const submitted = { ...draft }; void session.run(() => request(submitted), { retryable: true }); };
  // Keep a stable heading target across stages; moving focus is tied to navigation, not typing.
  const stageRef = useRef<HTMLDivElement>(null);
  const navigation = `${stage}:${paused}:${done}:${viewResult}`;
  const previousNavigation = useRef(navigation);
  useEffect(() => { if (previousNavigation.current !== navigation) stageRef.current?.focus(); previousNavigation.current = navigation; }, [navigation]);
  const summary = <Stack gap="md"><Text variant="title">{draft.title || "아직 입력하지 않았어요"}</Text><Text>{draft.category} · 알림 {draft.enabled ? "켜짐" : "꺼짐"}</Text></Stack>;
  return <Frame><Text tone="brand" variant="label">기록의 시작</Text><div ref={stageRef} tabIndex={-1}><Title>{copy.title}</Title></div><Text tone="muted">{copy.intro}</Text>
    {paused ? <Surface padding="lg"><Stack gap="lg"><Title>{kind === "settings" ? "설정에서 나왔어요" : "초안이 남아 있어요"}</Title>{summary}<Row><Action primary onAction={() => setPaused(false)}>이어하기</Action><Action onAction={reset}>처음부터</Action></Row></Stack></Surface>
    : done ? <Surface padding="lg"><Stack gap="lg"><Notice tone="success" title={copy.complete} />{summary}<Text>{viewResult ? "저장한 기록의 상세 내용입니다." : "확인된 결과를 바로 열어 볼 수 있어요."}</Text><Row><Action primary onAction={() => { if (kind === "settings") session.reset(state.value); else setViewResult(value => !value); }}>{kind === "settings" ? "계속 수정하기" : viewResult ? "완료 화면으로" : "저장한 기록 보기"}</Action><Action onAction={reset}>다시 해보기</Action></Row></Stack></Surface>
    : <Stack gap="lg">
      {kind !== "settings" && <Steps descriptor={{ steps: flowSteps, currentStepId: flowSteps[stage]!.id }} statusLabels={stepLabels} composeAccessibleName={stepName} />}
      <Surface padding="lg"><Stack gap="lg">
        <Status>{kind === "settings" ? dirty ? "저장하지 않은 변경이 있어요" : "저장된 설정입니다" : `${stage + 1}단계 · ${flowSteps[stage]!.label}`}</Status>
        {stage === 0 ? <><Text variant="title">어떤 장면을 기록할까요?</Text><Row>{categories.map(category => <Action key={category} selected={draft.category === category} onAction={() => change({ category })}>{category}</Action>)}</Row><Action primary onAction={() => setStage(1)}>이 주제로 기록하기</Action><Action onAction={() => setStage(1)}>나중에 정하기</Action></>
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
    <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="저장하지 않은 변경이 있어요"><Text>변경을 버리면 마지막으로 저장한 설정으로 돌아가요.</Text><Action primary onAction={() => setConfirmLeave(false)}>계속 수정</Action><Action onAction={() => { setDraft(state.value); session.reset(state.value); setConfirmLeave(false); setPaused(true); }}>변경 버리고 나가기</Action></Modal>
  </Frame>;
}
export function FirstTask() { return <Editor kind="first" />; }
export function RecoverableSettings() { return <Editor kind="settings" />; }
export function SelectionReview() { return <Editor kind="review" />; }

export function FilterSearch() {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof records[number] | null>(null);
  const results = filterRecords(query, applied);
  const clear = () => { setApplied(emptyFilters()); setQuery(""); };
  return <Frame><Text tone="brand" variant="label">나의 기록 찾기</Text><Title>조건을 좁혀, 장면을 찾아요</Title><Field label="기록 검색" value={query} onChange={setQuery} />
    <Row><Action primary onAction={() => { setDraft({ ...applied, categories: [...applied.categories] }); setOpen(true); }}>조건 변경</Action><Action onAction={clear}>전체 초기화</Action></Row>
    <Row>{applied.categories.map(category => <Action key={category} onAction={() => setApplied(previous => toggleCategory(previous, category))}>{`${category} 조건 해제`}</Action>)}{applied.savedOnly && <Action onAction={() => setApplied(previous => ({ ...previous, savedOnly: false }))}>저장한 기록 조건 해제</Action>}</Row>
    <Status>{`${results.length}개의 기록`}</Status>
    {results.length ? results.map(record => <Surface key={record.id} padding="lg"><Stack gap="sm"><Text tone="muted">{record.category}</Text><Text variant="title">{record.title}</Text><Text>{record.body}</Text><Action onAction={() => setSelected(record)}>{`${record.title} 자세히 보기`}</Action></Stack></Surface>)
    : <Surface padding="lg"><Stack gap="md"><Text variant="title">이 조건의 기록은 없어요</Text><Text>검색어를 바꾸거나 조건을 하나씩 해제해 보세요.</Text><Action primary onAction={clear}>검색과 조건 초기화</Action></Stack></Surface>}
    <Modal open={open} onClose={() => setOpen(false)} title="적용 전 조건"><Text>선택을 마친 뒤 적용해 주세요. 닫거나 취소하면 기존 조건이 유지돼요.</Text><Row>{categories.map(category => <Action key={category} selected={draft.categories.includes(category)} onAction={() => setDraft(previous => toggleCategory(previous, category))}>{category}</Action>)}</Row><Action selected={draft.savedOnly} onAction={() => setDraft(previous => ({ ...previous, savedOnly: !previous.savedOnly }))}>저장한 기록만</Action><Status>{`적용하면 ${filterRecords(query, draft).length}개의 기록`}</Status><Action primary onAction={() => { setApplied(draft); setOpen(false); }}>조건 적용</Action><Action onAction={() => setOpen(false)}>조건 취소</Action></Modal>
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? "기록 상세"}><Text>{selected?.body}</Text><Action onAction={() => setSelected(null)}>목록으로 돌아가기</Action></Modal><Text tone="muted" variant="caption">직접 만든 예제 기록입니다. 검색은 현재 데이터에서 즉시 실행됩니다.</Text>
  </Frame>;
}

function Introduction({ editorial = false }: { editorial?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [faq, setFaq] = useState(false);
  const intro = <Stack gap="lg"><Text tone="brand" variant="label">오늘의 한 장면</Text><Title>{editorial ? "오래 남는 건, 작은 장면이에요" : "지나간 하루를 한 줄로 붙잡아요"}</Title><Text>대단한 이야기일 필요 없어요. 지금 기억하고 싶은 순간부터 시작해요.</Text><Action primary onAction={() => setOpen(true)}>첫 장면 남기기</Action></Stack>;
  const preview = <Surface padding="lg"><Stack gap="lg"><Text variant="label">{note ? "방금 남긴 장면" : "직접 만든 기록 예시"}</Text><Art label="산책의 빛" /><Text variant="title">{note || records[0].title}</Text><Text>{note ? "이 미리보기에 저장했어요." : records[0].body}</Text></Stack></Surface>;
  return <Frame>{editorial ? <>{intro}<Columns><Stack gap="lg"><Text variant="heading">매일 쓰지 않아도 괜찮아요</Text><Text>다시 시작한 날부터 이어지는 기록. 빈칸을 채우는 대신 남기고 싶은 것을 골라요.</Text><Text>한 줄을 적고, 주제를 고르고, 나중에 다시 읽어요.</Text></Stack>{preview}</Columns></> : <Columns>{intro}{preview}</Columns>}
    <Columns>{["한 줄이면 충분해요", "내가 정한 주제로", "다시 읽기 쉽게"].map((title, index) => <Stack key={title} gap="sm"><Text tone="brand" variant="label">{`0${index + 1}`}</Text><Text variant="title">{title}</Text><Text>{["생각이 사라지기 전에 짧게 남겨요.", "일상·독서·여행을 내 방식으로 모아요.", "제목과 본문에서 기억을 찾아요."][index]}</Text></Stack>)}</Columns>
    <Action selected={faq} onAction={() => setFaq(value => !value)}>기록은 어디에 저장되나요?</Action>{faq && <Text>{scopeCopy}</Text>}
    <Surface padding="lg"><Stack gap="md"><Text variant="title">오늘, 어떤 장면을 남길까요?</Text><Action primary onAction={() => setOpen(true)}>한 줄 써보기</Action></Stack></Surface>
    <Modal open={open} onClose={() => setOpen(false)} title="첫 장면 남기기"><Field label="기억하고 싶은 장면" value={draft} onChange={setDraft} /><Action primary disabled={!draft.trim()} onAction={() => { setNote(draft.trim()); setOpen(false); }}>미리보기에 저장</Action></Modal>
    {note && <Status>{`저장한 장면: ${note}`}</Status>}<Text tone="muted" variant="caption">{scopeCopy}</Text>
  </Frame>;
}
export function ProductIntroduction() { return <Introduction />; }
export function EditorialIntroduction() { return <Introduction editorial />; }

export function RecordComparison() {
  const [mode, setMode] = useState("목록 중심");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<typeof records[number] | null>(null);
  const results = filterRecords(query, emptyFilters());
  return <Frame><Text tone="brand" variant="label">같은 기록, 다른 읽기</Text><Title>무엇을 먼저 보고 싶나요?</Title><Text>데이터와 행동은 유지하고 정보의 밀도와 순서를 비교해 보세요.</Text><Row>{["목록 중심", "읽기 중심", "이미지 중심"].map(value => <Action key={value} selected={mode === value} onAction={() => setMode(value)}>{value}</Action>)}</Row><Field label="같은 기록 검색" value={query} onChange={setQuery} /><Status>{`${mode} · ${results.length}개의 기록 · ${saved.length}개 저장`}</Status>
    <div className={mode === "이미지 중심" ? "hjm-reference__columns" : "hjm-reference__reading"}>{results.map(record => <Surface key={record.id} padding="lg"><Stack gap={mode === "목록 중심" ? "sm" : "lg"}>{mode === "이미지 중심" && record.image && <Art label={record.category} />}<Text tone="muted" variant="caption">{record.category}</Text><Text variant={mode === "읽기 중심" ? "heading" : "title"}>{record.title}</Text>{mode !== "목록 중심" && <Text>{record.body}</Text>}<Row><Action onAction={() => setSelected(record)}>{`${record.title} 읽기`}</Action><Action selected={saved.includes(record.id)} onAction={() => setSaved(current => current.includes(record.id) ? current.filter(id => id !== record.id) : [...current, record.id])}>{`${record.title} ${saved.includes(record.id) ? "저장 취소" : "저장"}`}</Action></Row></Stack></Surface>)}</div>
    {!results.length && <Action primary onAction={() => setQuery("")}>검색 초기화</Action>}
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? "기록"}><Text>{selected?.body}</Text><Action onAction={() => setSelected(null)}>읽기 마치기</Action></Modal><Text tone="muted" variant="caption">직접 만든 기록과 추상 일러스트입니다. 사진이 없는 기록도 본문을 온전히 보여 줍니다.</Text>
  </Frame>;
}
