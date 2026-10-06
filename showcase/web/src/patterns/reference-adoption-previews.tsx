import { useState } from "react";
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
  const change=(id:string,state:UploadItemDescriptor["state"])=>setItems(current=>changeUploadState(current,id,state));
  return <Stack gap="md"><Text variant="heading">파일 선택부터 다시 전송까지</Text>
    <FilePicker descriptor={{mode:"multiple",accept:["image/*"],maxCount:3,maxSizeBytes:5*1024*1024}} label="기록 사진" buttonLabel="사진 선택" dropzoneLabel="여기에 사진을 놓아 주세요" existingCount={items.length} getCandidateId={file=>`${file.name}:${file.size}:${file.lastModified}`} onSelect={result=>{setItems(current=>mergeSelectedFiles(current,result.accepted));setNotice(result.rejected.length?"추가하지 못한 파일이 있어요. 이미지 3개, 파일당 5MB까지 선택할 수 있어요.":"같은 파일은 한 번만 추가해요.");}} />
    <Button tone="secondary" onClick={()=>setItems(current=>mergeSelectedFiles(current,[sampleFile]).slice(0,3))}>예제 사진 추가</Button>
    <Text role="status">{notice||"파일은 서버로 전송하지 않습니다. 아래 예제 응답으로 상태를 확인하세요."}</Text>
    {items.map(item=><Surface key={item.id} padding="md"><Stack gap="sm"><UploadItem descriptor={item} labels={uploadLabels} onCancel={id=>change(id,{status:"pending"})} onRetry={id=>change(id,{status:"uploading",progress:null})} />
      <Stack axis="inline" wrap>{item.state.status==="pending"?<Button onClick={()=>change(item.id,{status:"uploading",progress:null})}>전송 시작</Button>:null}{item.state.status==="uploading"?<><Button tone="secondary" onClick={()=>change(item.id,{status:"success"})}>예제: 성공 응답</Button><Button tone="secondary" onClick={()=>change(item.id,{status:"error",message:"연결이 끊겼어요. 다시 전송해 주세요."})}>예제: 실패 응답</Button></>:null}<Button tone="ghost" disabled={item.state.status==="uploading"} onClick={()=>setItems(current=>current.filter(file=>file.id!==item.id))}>선택에서 제거</Button></Stack></Stack></Surface>)}
  </Stack>;
}
export function ProductBentoPreview() {
  const [started,setStarted]=useState(false);
  return <Stack gap="lg"><Text tone="brand" variant="label">장면 기록</Text><Text variant="heading">기록을 더 선명하게</Text><Text>사진의 변화와 그날의 생각을 한곳에 모아 보세요.</Text>
    <div className="hjm-reference-bento"><Surface padding="lg"><ImageComparisonPreview /></Surface><Stack gap="md"><Surface padding="lg"><Stack gap="sm"><Text variant="title">한 줄로 시작</Text><Text>짧은 제목을 적고, 필요한 만큼 이야기를 더하세요.</Text></Stack></Surface><Surface padding="lg"><Stack gap="sm"><Text variant="title">내가 고른 장면</Text><Text>다시 보고 싶은 순간을 직접 선택해요.</Text></Stack></Surface></Stack></div>
    <Button onClick={()=>setStarted(true)}>첫 기록 시작하기</Button>{started?<TextField label="첫 기록 제목" autoFocus />:<Text variant="caption" tone="muted">계정과 저장 방식은 사용하는 제품에서 안내합니다.</Text>}</Stack>;
}
export function ContextToolbarPreview() {
  const [open,setOpen]=useState(false);const [choice,setChoice]=useState("기본");
  return <Stack gap="md"><TextField label="작성 중인 기록" placeholder="도구를 열어도 입력은 유지돼요" /><Collapsible open={open} onOpenChange={setOpen} trigger={<span>표현 도구 · {choice}</span>}><Stack axis="inline" wrap>{["기본","인용","강조"].map(label=><Button key={label} tone="secondary" selected={choice===label} onClick={()=>setChoice(label)}>{label}</Button>)}</Stack></Collapsible><Text role="status">선택한 표현: {choice}</Text></Stack>;
}
