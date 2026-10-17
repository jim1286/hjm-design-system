import { resolveSaveFeedback } from "@hjmds/design-contracts/action-session";
import { Heading } from "@hjmds/react/heading";
import { BottomCTA } from "@hjmds/react/bottom-cta";
import { BottomInfo } from "@hjmds/react/bottom-info";
import { useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Rating } from "@hjmds/react/rating";
import { ImageComparison } from "@hjmds/react/image-comparison";
import { FilePicker } from "@hjmds/react/file-picker";
import { UploadItem } from "@hjmds/react/upload-item";
import { Collapsible } from "@hjmds/react/collapsible";
import type { FilePickerSelectionResult } from "@hjmds/design-contracts/components/file-picker";
import type { UploadItemDescriptor } from "@hjmds/design-contracts/components/upload-item";
import { StatusText } from "@hjmds/react/status-text";
import { ScreenLayout } from "@hjmds/react/screens";
import { useDemoAction } from "./action-recovery-previews.js";
import { PreviewTools, PreviewToolButton } from "./preview-tools.js";
import { beforeImage, afterImage, scoreLabel, sampleFile, uploadLabels, mergeUploadSelection, changeUploadState, uploadExampleNote, productBentoStatus, productBentoSavedTitle } from "../../../shared/reference-adoption.js";
import "./reference-adoption.css";
export function RatingPreview() {
  const [score, setScore] = useState<number | null>(null);
  return <Stack gap="lg"><Rating label="이 기록이 도움이 되었나요?" value={score} onValueChange={setScore} getValueLabel={scoreLabel} clearLabel="평가 지우기" /><Rating label="평균 평가" value={3.5} readOnly getValueLabel={scoreLabel} /><Rating label="변경할 수 없는 평가" value={4} disabled onValueChange={()=>{}} getValueLabel={scoreLabel} /></Stack>;
}
export function ImageComparisonPreview() {
  const [value, setValue] = useState(50);
  return <Stack gap="md"><Text variant="heading" emphasis="medium">같은 장면, 다른 색감</Text><ImageComparison label="보정 전 이미지 비율" before={beforeImage} after={afterImage} value={value} onValueChange={setValue} getValueText={n=>`${n}%`} /><Stack axis="inline" gap="sm" wrap><Button tone="secondary" onClick={()=>setValue(100)}>보정 전 전체 보기</Button><Button tone="secondary" onClick={()=>setValue(0)}>보정 후 전체 보기</Button></Stack></Stack>;
}
export function AdaptiveContentPreview() {
  const [panel, setPanel] = useState("summary");
  return <Stack gap="md"><SegmentedControl label="기록 정보" items={[{value:"summary",label:"요약"},{value:"details",label:"상세"}]} value={panel} onValueChange={setPanel} />
    <ContentTransition stateKey={panel} animateHeight preset="rise"><Surface padding="lg"><Stack gap="md"><Heading level="level5">오늘의 기록</Heading><Text>{panel==="summary"?"산책하며 만난 장면을 한 줄로 남겼어요.":"사진과 메모를 함께 보며 그날의 분위기를 떠올려요. 골목의 작은 가게, 걷다가 만난 고양이, 잠시 쉬어 간 공원까지 오늘의 장면을 모았어요."}</Text>{panel==="details"?<Text>나중에 다시 걷고 싶은 길이나 함께 나누고 싶은 생각을 메모로 남겨 보세요.</Text>:null}</Stack></Surface></ContentTransition>
    <TextField label="전환해도 남는 메모" placeholder="메모를 입력한 뒤 전환해 보세요" /></Stack>;
}
export function ActionFeedbackPreview() {
  const { state, session, request, busy, failureArmed, toggleFailure } = useDemoAction("");
  const [draft,setDraft]=useState("");
  const status=state.status;
  // The completed snapshot does not confirm edits made while its request was pending.
  const feedback = resolveSaveFeedback({ phase: state.status, dirty: draft.trim() !== state.value, valid: !!draft.trim(), hasSaved: state.value !== "" });
  const { currentSaved } = feedback;
  const save=()=>{const submitted=draft.trim();if(submitted)void session.run(()=>request(submitted),{retryable:true});};
  return <Container gutter="compact" size="reading"><Stack gap="md"><Heading level="level3">입력은 남기고, 결과는 분명하게</Heading><TextField label="기록 제목" value={draft} onValueChange={setDraft} />
    <Button loading={busy} disabled={!feedback.canSubmit} completion={{ confirmed: currentSaved, label: "✓ 기록을 저장했어요" }} onClick={save}>기록 저장</Button>
    <ContentTransition stateKey={status} animateHeight><StatusText>{busy?"저장을 확인하고 있어요":status==="error"?"저장하지 못했어요. 제목은 남아 있으니 다시 시도해 주세요.":state.value&&!currentSaved?"현재 제목은 아직 저장하지 않았어요.":currentSaved?"현재 제목을 저장했어요.":"제목을 입력한 뒤 저장해 주세요."}</StatusText></ContentTransition>
    {state.value?<Text>저장한 제목: {state.value}</Text>:null}
    <Text>실제 서버 요청 없는 예제예요. 다시 저장하면 현재 입력한 제목을 사용해요.</Text>
    <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 저장 실패시키기</PreviewToolButton></PreviewTools></Stack></Container>;
}
export function UploadRecoveryPreview() {
  const [items,setItems]=useState<UploadItemDescriptor[]>([]); const [notice,setNotice]=useState("");
  // These refs serialize same-render picks and distinguish a removed/retried item's callbacks.
  const itemsRef=useRef(items);
  const update=(next:UploadItemDescriptor[])=>{itemsRef.current=next;setItems(next);};
  const select=(selection:FilePickerSelectionResult)=>{const next=mergeUploadSelection(itemsRef.current,selection);update(next.items);setNotice(next.rejected.length?"추가하지 못한 파일이 있어요. 이미지 3개, 파일당 5MB까지 선택할 수 있어요.":"같은 파일은 한 번만 추가해요.");};
  const fileRegions = useRef(new Map<string, HTMLDivElement>());
  // Removing a file returns focus to the picker's own button, the persistent way to add files.
  const picker = useRef<HTMLDivElement>(null);
  const change=(item:UploadItemDescriptor,state:UploadItemDescriptor["state"])=>{
    if(itemsRef.current.find(current=>current.id===item.id)!==item)return;
    const id=item.id;
    const region = fileRegions.current.get(id);
    // State actions unmount on start/cancel/retry. Keep keyboard position in the
    // same file instead of letting the removed action drop focus to the page.
    if (region?.contains(document.activeElement)) region.focus();
    update(changeUploadState(itemsRef.current,id,state));
  };
  return <Container gutter="compact" size="reading"><Stack gap="md"><Heading level="level3">파일 선택부터 다시 전송까지</Heading>
    <FilePicker ref={picker} descriptor={{mode:"multiple",accept:["image/*"],maxCount:3,maxSizeBytes:5*1024*1024}} label="기록 사진" buttonLabel="사진 선택" dropzoneLabel="여기에 사진을 놓아 주세요" existingCount={items.length} getCandidateId={file=>`${file.name}:${file.size}:${file.lastModified}`} onSelect={select} />
    <Text>{uploadExampleNote}</Text>
    <PreviewTools><PreviewToolButton onClick={()=>select({accepted:[sampleFile],rejected:[]})}>예제 사진 추가</PreviewToolButton></PreviewTools>
    {notice ? <StatusText>{notice}</StatusText> : null}
    {items.map(item=><Surface key={item.id} padding="md"><div role="group" aria-label={item.name} tabIndex={-1} ref={node=>{ if(node) fileRegions.current.set(item.id,node); else fileRegions.current.delete(item.id); }}><Stack gap="sm"><UploadItem descriptor={item} labels={uploadLabels} onCancel={()=>change(item,{status:"pending"})} onRetry={()=>change(item,{status:"uploading",progress:null})} />
      <Stack axis="inline" wrap>{item.state.status==="pending"?<Button onClick={()=>change(item,{status:"uploading",progress:null})}>전송 시작</Button>:null}<Button tone="ghost" disabled={item.state.status==="uploading"} onClick={()=>{if(itemsRef.current.find(current=>current.id===item.id)!==item||item.state.status==="uploading")return;picker.current?.querySelector("button")?.focus();update(itemsRef.current.filter(file=>file.id!==item.id));}}>선택에서 제거</Button></Stack>
      {/* Simulated server responses are demo-only tools, not file actions (2026-10-16 review). */}
      {item.state.status==="uploading"?<PreviewTools><PreviewToolButton onClick={()=>change(item,{status:"success"})}>성공 응답 보내기</PreviewToolButton><PreviewToolButton onClick={()=>change(item,{status:"error",message:"연결이 끊겼어요. 다시 전송해 주세요."})}>실패 응답 보내기</PreviewToolButton></PreviewTools>:null}</Stack></div></Surface>)}
  </Stack></Container>;
}
export function ProductBentoPreview() {
  const [started,setStarted]=useState(false);
  const [draft, setDraft] = useState("");
  const [details, setDetails] = useState(false);
  const { session, state, request, failureArmed, toggleFailure } = useDemoAction("");
  // Keep conditions and the draft outside the conditional editor. Returning to
  // the introduction must not hide the product boundary or discard unfinished work.
  const feedback = resolveSaveFeedback({ phase: state.status, dirty: draft.trim() !== state.value, valid: !!draft.trim(), hasSaved: state.value !== "" });
  const { currentSaved, pending: busy } = feedback;
  const save = () => {
    const submitted = draft.trim();
    if (feedback.canSubmit && submitted !== session.getSnapshot().value) void session.run(() => request(submitted), { retryable: true });
  };
  const back = () => { if (session.getSnapshot().status !== "pending") setStarted(false); };
  // A completed request confirms its snapshot, not edits made while it was pending.
  const status = productBentoStatus(feedback, state.value);
  // ScreenLayout owns the screen inset, width and body scroll as on Native. The intro scrolls with the body, so the
  // route title is hidden there and the in-body Heading is the page heading.
  return <ScreenLayout title="기록을 더 선명하게" titleVisibility="hidden"><Stack gap="lg">
    <Stack gap="md"><Text tone="brand" variant="label">장면 기록</Text><Heading level="level3" semanticLevel={1}>기록을 더 선명하게</Heading><Text>사진의 변화와 그날의 생각을 한곳에 모아 보세요.</Text></Stack>
    <div className="hjm-reference-bento"><Surface padding="lg"><ImageComparisonPreview /></Surface><Stack gap="md"><Surface padding="lg"><Stack gap="sm"><Heading level="level5" semanticLevel={2}>한 줄로 시작</Heading><Text>짧은 제목을 적고, 필요한 만큼 이야기를 더하세요.</Text></Stack></Surface><Surface padding="lg"><Stack gap="sm"><Heading level="level5" semanticLevel={2}>내가 고른 장면</Heading><Text>다시 보고 싶은 순간을 직접 선택해요.</Text></Stack></Surface></Stack></div>
    {started ? <TextField label="첫 기록 제목" value={draft} onValueChange={setDraft} autoFocus /> : null}
    {details ? <Surface padding="md"><Text>사진을 비교하고 제목을 적으면 이 화면의 미리보기에 추가돼요. 다른 사람에게 전송되지는 않아요.</Text></Surface> : null}
    {/* Demo tools stay above the CTA so the CTA remains the surface's closing action (2026-10-16 review). */}
    {started ? <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 저장 실패시키기</PreviewToolButton></PreviewTools> : null}
    <BottomCTA description={started ? "입력한 제목으로 미리보기를 만들어요." : "먼저 사진을 비교하거나 첫 기록을 작성해 보세요."}
      primaryAction={{ label: started ? currentSaved ? "저장했어요" : "미리보기에 저장" : "첫 기록 시작하기", onClick: started ? save : () => setStarted(true), loading: busy, loadingLabel: "미리보기 저장 중", disabled: started && !feedback.canSubmit }}
      secondaryAction={{ label: started ? "소개로 돌아가기" : details ? "사용 방법 접기" : "사용 방법 보기", onClick: started ? back : () => setDetails(value => !value), disabled: busy }}/>
    <BottomInfo items={["실제 서버 요청 없이 체험하는 예제예요.", "제목은 이 화면이 열려 있는 동안만 유지돼요. 계정 생성이나 결제는 없어요."]}/>
    {/* Result follows the action and its conditions; the untouched introduction has no save state. */}
    {started || state.value ? <StatusText>{status}</StatusText> : null}
    {state.value ? <Text>{productBentoSavedTitle(state.value)}</Text> : null}
    </Stack></ScreenLayout>;
}
export function ContextToolbarPreview() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("기본");
  // Exactly one expression is active. Independent selected Buttons announce
  // unrelated toggles and omit the shared single-selection keyboard contract.
  return <Stack gap="md">
    <TextField label="작성 중인 기록" placeholder="도구를 열어도 입력은 유지돼요" />
    <Collapsible open={open} onOpenChange={setOpen} trigger={`표현 도구 · ${choice}`}>
      <SegmentedControl label="기록 표현" presentation="pills" items={["기본", "인용", "강조"].map(label => ({ value: label, label }))} value={choice} onValueChange={setChoice} />
    </Collapsible>
    <StatusText>{`선택한 표현: ${choice}`}</StatusText>
  </Stack>;
}

export function SelectionMotionPreview() {
  const [period, setPeriod] = useState("day");
  const options = [{ value: "day", label: "하루" }, { value: "week", label: "일주일" }, { value: "month", label: "한 달" }];
  return <Stack gap="lg"><Heading level="level3">기간 선택</Heading><SegmentedControl label="연결형 기간 선택" items={options} value={period} onValueChange={setPeriod} selectionMotion="slide" /><SegmentedControl label="필터형 기간 선택" items={options} value={period} onValueChange={setPeriod} presentation="pills" selectionMotion="slide" /><Text>{period === "day" ? "오늘의 기록" : period === "week" ? "이번 주 기록" : "이번 달 기록"}</Text><TextField label="선택을 바꿔도 유지되는 메모" placeholder="선택 전후로 내용을 확인하세요" /></Stack>;
}
