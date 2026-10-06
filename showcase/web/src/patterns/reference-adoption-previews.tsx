import { BottomCTA } from "@hjmds/react/bottom-cta";
import { BottomInfo } from "@hjmds/react/bottom-info";
import { useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Rating } from "@hjmds/react/rating";
import { ImageComparison } from "@hjmds/react/image-comparison";
import { FilePicker } from "@hjmds/react/file-picker";
import { UploadItem } from "@hjmds/react/upload-item";
import { Collapsible } from "@hjmds/react/collapsible";
import type { UploadItemDescriptor } from "@hjmds/design-contracts/components/upload-item";
import { useDemoAction } from "./action-recovery-previews";
import { beforeImage, afterImage, scoreLabel, sampleFile, uploadLabels, mergeSelectedFiles, changeUploadState } from "../../../shared/reference-adoption";
import "./reference-adoption.css";
export function RatingPreview() {
  const [score, setScore] = useState<number | null>(null);
  return <Stack gap="lg"><Rating label="이 기록이 도움이 되었나요?" value={score} onValueChange={setScore} getValueLabel={scoreLabel} clearLabel="평가 지우기" /><Rating label="평균 평가" value={3.5} readOnly getValueLabel={scoreLabel} /><Rating label="변경할 수 없는 평가" value={4} disabled onValueChange={()=>{}} getValueLabel={scoreLabel} /></Stack>;
}
export function ImageComparisonPreview() {
  const [value, setValue] = useState(50);
  return <Stack gap="md"><Text variant="heading">같은 장면, 다른 색감</Text><ImageComparison label="보정 전 이미지 비율" before={beforeImage} after={afterImage} value={value} onValueChange={setValue} getValueText={n=>`${n}%`} /><Stack axis="inline" wrap><Button tone="secondary" onClick={()=>setValue(100)}>보정 전 전체 보기</Button><Button tone="secondary" onClick={()=>setValue(0)}>보정 후 전체 보기</Button></Stack></Stack>;
}
export function AdaptiveContentPreview() {
  const [panel, setPanel] = useState("summary");
  return <Stack gap="md"><SegmentedControl label="기록 정보" items={[{value:"summary",label:"요약"},{value:"details",label:"상세"}]} value={panel} onValueChange={setPanel} />
    <ContentTransition stateKey={panel} animateHeight preset="rise"><Surface padding="lg"><Stack gap="md"><Text variant="title">오늘의 기록</Text><Text>{panel==="summary"?"산책하며 만난 장면을 한 줄로 남겼어요.":"사진과 메모를 함께 보며 그날의 분위기를 떠올려요. 골목의 작은 가게, 걷다가 만난 고양이, 잠시 쉬어 간 공원까지 오늘의 장면을 모았어요."}</Text>{panel==="details"?<Text>나중에 다시 걷고 싶은 길이나 함께 나누고 싶은 생각을 메모로 남겨 보세요.</Text>:null}</Stack></Surface></ContentTransition>
    <TextField label="전환해도 남는 메모" placeholder="메모를 입력한 뒤 전환해 보세요" /></Stack>;
}
export function ActionFeedbackPreview() {
  const { state, session, request, busy, failureArmed, toggleFailure } = useDemoAction("");
  const [draft,setDraft]=useState("");
  const status=state.status;
  return <Stack gap="md"><Text variant="heading">입력은 남기고, 결과는 분명하게</Text><TextField label="기록 제목" value={draft} onValueChange={setDraft} />
    <Button loading={busy} disabled={!draft.trim()} onClick={()=>{void session.run(()=>request(draft),{retryable:true});}}>{status==="success"?"✓ 다시 저장":status==="error"?"다시 저장":"기록 저장"}</Button>
    <ContentTransition stateKey={status} animateHeight><Text role="status">{busy?"저장을 확인하고 있어요":status==="error"?"저장하지 못했어요. 제목은 남아 있으니 다시 시도해 주세요.":status==="success"?`저장한 제목: ${state.value}`:"제목을 입력한 뒤 저장해 주세요."}</Text></ContentTransition>
    <Button tone="ghost" selected={failureArmed} onClick={toggleFailure}>예제: 다음 저장 실패</Button></Stack>;
}
export function UploadRecoveryPreview() {
  const [items,setItems]=useState<UploadItemDescriptor[]>([]); const [notice,setNotice]=useState("");
  const fileRegions = useRef(new Map<string, HTMLDivElement>());
  const addExample = useRef<HTMLButtonElement>(null);
  const change=(id:string,state:UploadItemDescriptor["state"])=>{
    const region = fileRegions.current.get(id);
    // State actions unmount on start/cancel/retry. Keep keyboard position in the
    // same file instead of letting the removed action drop focus to the page.
    if (region?.contains(document.activeElement)) region.focus();
    setItems(current=>changeUploadState(current,id,state));
  };
  return <Stack gap="md"><Text variant="heading">파일 선택부터 다시 전송까지</Text>
    <FilePicker descriptor={{mode:"multiple",accept:["image/*"],maxCount:3,maxSizeBytes:5*1024*1024}} label="기록 사진" buttonLabel="사진 선택" dropzoneLabel="여기에 사진을 놓아 주세요" existingCount={items.length} getCandidateId={file=>`${file.name}:${file.size}:${file.lastModified}`} onSelect={result=>{setItems(current=>mergeSelectedFiles(current,result.accepted));setNotice(result.rejected.length?"추가하지 못한 파일이 있어요. 이미지 3개, 파일당 5MB까지 선택할 수 있어요.":"같은 파일은 한 번만 추가해요.");}} />
    <Button ref={addExample} tone="secondary" onClick={()=>setItems(current=>mergeSelectedFiles(current,[sampleFile]).slice(0,3))}>예제 사진 추가</Button>
    {/* Keep the demo boundary visible when a rejection replaces the status notice. */}
    <Text>파일은 서버로 전송하지 않습니다. 아래 예제 응답으로 상태를 확인하세요.</Text>
    {notice ? <Text role="status">{notice}</Text> : null}
    {items.map(item=><Surface key={item.id} padding="md"><div role="group" aria-label={item.name} tabIndex={-1} ref={node=>{ if(node) fileRegions.current.set(item.id,node); else fileRegions.current.delete(item.id); }}><Stack gap="sm"><UploadItem descriptor={item} labels={uploadLabels} onCancel={id=>change(id,{status:"pending"})} onRetry={id=>change(id,{status:"uploading",progress:null})} />
      <Stack axis="inline" wrap>{item.state.status==="pending"?<Button onClick={()=>change(item.id,{status:"uploading",progress:null})}>전송 시작</Button>:null}{item.state.status==="uploading"?<><Button tone="secondary" onClick={()=>change(item.id,{status:"success"})}>예제: 성공 응답</Button><Button tone="secondary" onClick={()=>change(item.id,{status:"error",message:"연결이 끊겼어요. 다시 전송해 주세요."})}>예제: 실패 응답</Button></>:null}<Button tone="ghost" disabled={item.state.status==="uploading"} onClick={()=>{addExample.current?.focus();setItems(current=>current.filter(file=>file.id!==item.id));}}>선택에서 제거</Button></Stack></Stack></div></Surface>)}
  </Stack>;
}
export function ProductBentoPreview() {
  const [started,setStarted]=useState(false);
  const [draft, setDraft] = useState("");
  const [details, setDetails] = useState(false);
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction("");
  // Keep conditions and the draft outside the conditional editor. Returning to
  // the introduction must not hide the product boundary or discard unfinished work.
  const save = () => { const submitted = draft.trim(); if (submitted) void session.run(() => request(submitted), { retryable: true }); };
  return <Stack gap="lg"><Text tone="brand" variant="label">장면 기록</Text><Text variant="heading">기록을 더 선명하게</Text><Text>사진의 변화와 그날의 생각을 한곳에 모아 보세요.</Text>
    <div className="hjm-reference-bento"><Surface padding="lg"><ImageComparisonPreview /></Surface><Stack gap="md"><Surface padding="lg"><Stack gap="sm"><Text variant="title">한 줄로 시작</Text><Text>짧은 제목을 적고, 필요한 만큼 이야기를 더하세요.</Text></Stack></Surface><Surface padding="lg"><Stack gap="sm"><Text variant="title">내가 고른 장면</Text><Text>다시 보고 싶은 순간을 직접 선택해요.</Text></Stack></Surface></Stack></div>
    {started ? <TextField label="첫 기록 제목" value={draft} onValueChange={setDraft} autoFocus /> : null}
    {details ? <Surface padding="md"><Text>사진을 비교하고 제목을 적으면 이 화면의 미리보기에 추가돼요. 다른 사람에게 전송되지는 않아요.</Text></Surface> : null}
    <BottomCTA description={started ? "입력한 제목으로 미리보기를 만들어요." : "먼저 사진을 비교하거나 첫 기록을 작성해 보세요."}
      primaryAction={{ label: started ? "미리보기에 저장" : "첫 기록 시작하기", onClick: started ? save : () => setStarted(true), loading: busy, loadingLabel: "미리보기 저장 중", disabled: started && !draft.trim() }}
      secondaryAction={{ label: started ? "소개로 돌아가기" : details ? "사용 방법 접기" : "사용 방법 보기", onClick: started ? () => setStarted(false) : () => setDetails(value => !value), disabled: busy }}/>
    <BottomInfo items={["실제 서버 요청 없이 체험하는 예제예요.", "제목은 이 화면이 열려 있는 동안만 유지돼요. 계정 생성이나 결제는 없어요."]}/>
    {started ? <Button tone="ghost" selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 저장 실패 체험</Button> : null}
    <Text role="status">{state.status === "error" ? "저장하지 못했어요. 제목은 유지되어 있어요. 다시 저장해 주세요." : state.status === "success" ? "미리보기에 저장했어요." : state.status === "pending" ? "저장 중이에요." : "아직 저장하지 않았어요."}</Text>
    {state.value ? <Text>저장된 제목: {state.value}</Text> : null}</Stack>;
}
export function ContextToolbarPreview() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("기본");
  // Exactly one expression is active. Independent selected Buttons announce
  // unrelated toggles and omit the shared single-selection keyboard contract.
  return <Stack gap="md">
    <TextField label="작성 중인 기록" placeholder="도구를 열어도 입력은 유지돼요" />
    <Collapsible open={open} onOpenChange={setOpen} trigger={<span>표현 도구 · {choice}</span>}>
      <SegmentedControl label="기록 표현" presentation="pills" items={["기본", "인용", "강조"].map(label => ({ value: label, label }))} value={choice} onValueChange={setChoice} />
    </Collapsible>
    <Text role="status">선택한 표현: {choice}</Text>
  </Stack>;
}

export function SelectionMotionPreview() {
  const [period, setPeriod] = useState("day");
  const options = [{ value: "day", label: "하루" }, { value: "week", label: "일주일" }, { value: "month", label: "한 달" }];
  return <Stack gap="lg"><Text variant="heading">기간 선택</Text><SegmentedControl label="연결형 기간 선택" items={options} value={period} onValueChange={setPeriod} selectionMotion="slide" /><SegmentedControl label="필터형 기간 선택" items={options} value={period} onValueChange={setPeriod} presentation="pills" selectionMotion="slide" /><Text>{period === "day" ? "오늘의 기록" : period === "week" ? "이번 주 기록" : "이번 달 기록"}</Text><TextField label="선택을 바꿔도 유지되는 메모" placeholder="선택 전후로 내용을 확인하세요" /></Stack>;
}
