import { resolveSaveFeedback } from "@hjmds/design-contracts/action-session";
import { Heading } from "@hjmds/react-native/heading";
import { spacing } from "@hjmds/design-contracts/foundations";
import { KeyboardAvoiding } from "@hjmds/react-native/keyboard";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { BottomInfo } from "@hjmds/react-native/bottom-info";
import { useRef, useState } from "react";
import { Button } from "@hjmds/react-native/actions";
import { Container, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Rating } from "@hjmds/react-native/rating";
import { ImageComparison } from "@hjmds/react-native/image-comparison";
import { FilePicker } from "@hjmds/react-native/file-picker";
import { UploadItem } from "@hjmds/react-native/upload-item";
import { Collapsible } from "@hjmds/react-native/collapsible";
import type { FilePickerSelectionResult } from "@hjmds/design-contracts/components/file-picker";
import type { UploadItemDescriptor } from "@hjmds/design-contracts/components/upload-item";
import { useDemoAction } from "./action-recovery-previews";
import { PatternStatus } from "./pattern-status";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { beforeImage, afterImage, scoreLabel, sampleFile, uploadLabels, mergeUploadSelection, changeUploadState, uploadExampleNote, productBentoStatus, productBentoSavedTitle } from "../../shared/reference-adoption";

export function RatingPreview() {
  const [score, setScore] = useState<number | null>(null);
  return <Stack gap="lg"><Rating label="이 기록이 도움이 되었나요?" value={score} onValueChange={setScore} getValueLabel={scoreLabel} clearLabel="평가 지우기" /><Rating label="평균 평가" value={3.5} readOnly getValueLabel={scoreLabel} /><Rating label="변경할 수 없는 평가" value={4} disabled onValueChange={()=>{}} getValueLabel={scoreLabel} /></Stack>;
}
export function ImageComparisonPreview() {
  const [value, setValue] = useState(50);
  return <Stack gap="md"><Text variant="heading" emphasis="medium">같은 장면, 다른 색감</Text><ImageComparison decrementLabel="보정 전 비율 줄이기" incrementLabel="보정 전 비율 늘리기" label="보정 전 이미지 비율" before={beforeImage} after={afterImage} value={value} onValueChange={setValue} getValueText={n=>`${n}%`} /><Stack axis="inline" gap="xs" wrap><Button tone="secondary" onPress={()=>setValue(100)}>보정 전 전체 보기</Button><Button tone="secondary" onPress={()=>setValue(0)}>보정 후 전체 보기</Button></Stack></Stack>;
}
export function AdaptiveContentPreview() {
  const [panel, setPanel] = useState("summary");
  // Large text plus the expanded panel can move the memo below the keyboard.
  // The canvas needs a scroll host; end spacing keeps the final field border off
  // its clipping edge when the keyboard reduces the available viewport.
  return <KeyboardAvoiding style={{ flex: 1 }}><ScreenLayout title="기록 정보" header={<></>} contentInset="none"><Stack gap="md" layoutStyle={{ marginBottom: spacing.md }}><SegmentedControl label="기록 정보" items={[{value:"summary",label:"요약"},{value:"details",label:"상세"}]} value={panel} onValueChange={setPanel} />
    <ContentTransition stateKey={panel} animateHeight preset="rise"><Surface padding="lg"><Stack gap="md"><Heading level="level5">오늘의 기록</Heading><Text>{panel==="summary"?"산책하며 만난 장면을 한 줄로 남겼어요.":"사진과 메모를 함께 보며 그날의 분위기를 떠올려요. 골목의 작은 가게, 걷다가 만난 고양이, 잠시 쉬어 간 공원까지 오늘의 장면을 모았어요."}</Text>{panel==="details"?<Text>나중에 다시 걷고 싶은 길이나 함께 나누고 싶은 생각을 메모로 남겨 보세요.</Text>:null}</Stack></Surface></ContentTransition>
    <TextField label="전환해도 남는 메모" placeholder="메모를 입력한 뒤 전환해 보세요" /></Stack></ScreenLayout></KeyboardAvoiding>;
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
    <Button loading={busy} disabled={!feedback.canSubmit} completion={{ confirmed: currentSaved, label: "✓ 기록을 저장했어요" }} onPress={save}>기록 저장</Button>
    <ContentTransition stateKey={status} animateHeight><PatternStatus>{busy?"저장을 확인하고 있어요":status==="error"?"저장하지 못했어요. 제목은 남아 있으니 다시 시도해 주세요.":state.value&&!currentSaved?"현재 제목은 아직 저장하지 않았어요.":currentSaved?"현재 제목을 저장했어요.":"제목을 입력한 뒤 저장해 주세요."}</PatternStatus></ContentTransition>
    {state.value?<Text>저장한 제목: {state.value}</Text>:null}
    <Text>실제 서버 요청 없는 예제예요. 다시 저장하면 현재 입력한 제목을 사용해요.</Text>
    <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy} onPress={toggleFailure}>다음 저장 실패시키기</PreviewToolButton></PreviewTools></Stack></Container>;
}
export function UploadRecoveryPreview() {
  const [items,setItems]=useState<UploadItemDescriptor[]>([]); const [notice,setNotice]=useState("");
  // These refs serialize same-render picks and distinguish a removed/retried item's callbacks.
  const itemsRef=useRef(items);
  const update=(next:UploadItemDescriptor[])=>{itemsRef.current=next;setItems(next);};
  const select=(selection:FilePickerSelectionResult)=>{const next=mergeUploadSelection(itemsRef.current,selection);update(next.items);setNotice(next.rejected.length?"추가하지 못한 파일이 있어요. 이미지 3개, 파일당 5MB까지 선택할 수 있어요.":"같은 파일은 한 번만 추가해요.");};

  const change=(item:UploadItemDescriptor,state:UploadItemDescriptor["state"])=>{if(itemsRef.current.find(current=>current.id===item.id)===item)update(changeUploadState(itemsRef.current,item.id,state));};
  return <Container gutter="compact" size="reading"><Stack gap="md"><Heading level="level3">파일 선택부터 다시 전송까지</Heading>
    <FilePicker descriptor={{mode:"multiple",accept:["image/*"],maxCount:3,maxSizeBytes:5*1024*1024}} label="기록 사진" buttonLabel="사진 선택" existingCount={items.length} onPick={async()=>[sampleFile]} onPickError={()=>setNotice("사진을 선택하지 못했어요.")} onSelect={select} />
    <Text>{uploadExampleNote}</Text>
    <PreviewTools><PreviewToolButton onPress={()=>select({accepted:[sampleFile],rejected:[]})}>예제 사진 추가</PreviewToolButton></PreviewTools>
    {notice ? <PatternStatus>{notice}</PatternStatus> : null}
    {items.map(item=><Surface key={item.id} padding="md"><Stack gap="sm"><UploadItem descriptor={item} labels={uploadLabels} onCancel={()=>change(item,{status:"pending"})} onRetry={()=>change(item,{status:"uploading",progress:null})} />
      <Stack axis="inline" wrap gap="xs">{item.state.status==="pending"?<Button onPress={()=>change(item,{status:"uploading",progress:null})}>전송 시작</Button>:null}<Button tone="ghost" disabled={item.state.status==="uploading"} onPress={()=>{if(itemsRef.current.find(current=>current.id===item.id)===item&&item.state.status!=="uploading")update(itemsRef.current.filter(file=>file.id!==item.id));}}>선택에서 제거</Button></Stack>
      {/* Simulated server responses are demo-only tools, not file actions (2026-10-16 review). */}
      {item.state.status==="uploading"?<PreviewTools><PreviewToolButton onPress={()=>change(item,{status:"success"})}>성공 응답 보내기</PreviewToolButton><PreviewToolButton onPress={()=>change(item,{status:"error",message:"연결이 끊겼어요. 다시 전송해 주세요."})}>실패 응답 보내기</PreviewToolButton></PreviewTools>:null}</Stack></Surface>)}
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
  // The Native Storybook canvas is not scrollable. Use the canonical screen host
  // so the long feature preview cannot strand its CTA below the viewport. The recipe inset applies (contentInset
  // none put cards against the screen edges); the intro scrolls in the body, so the route title is hidden there.
  return <KeyboardAvoiding style={{ flex: 1 }}><ScreenLayout title="기록을 더 선명하게" titleVisibility="hidden">
    <Stack gap="lg">
    <Stack gap="md"><Text tone="brand" variant="label">장면 기록</Text><Heading level="level3" semanticLevel={1}>기록을 더 선명하게</Heading><Text>사진의 변화와 그날의 생각을 한곳에 모아 보세요.</Text></Stack>
    <Stack gap="md"><Surface padding="lg"><ImageComparisonPreview /></Surface><Stack gap="md"><Surface padding="lg"><Stack gap="sm"><Heading level="level5" semanticLevel={2}>한 줄로 시작</Heading><Text>짧은 제목을 적고, 필요한 만큼 이야기를 더하세요.</Text></Stack></Surface><Surface padding="lg"><Stack gap="sm"><Heading level="level5" semanticLevel={2}>내가 고른 장면</Heading><Text>다시 보고 싶은 순간을 직접 선택해요.</Text></Stack></Surface></Stack></Stack>
    {started ? <TextField label="첫 기록 제목" value={draft} onValueChange={setDraft} autoFocus /> : null}
    {details ? <Surface padding="md"><Text>사진을 비교하고 제목을 적으면 이 화면의 미리보기에 추가돼요. 다른 사람에게 전송되지는 않아요.</Text></Surface> : null}
    {/* Demo tools stay above the CTA so the CTA remains the surface's closing action (2026-10-16 review). */}
    {started ? <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy} onPress={toggleFailure}>다음 저장 실패시키기</PreviewToolButton></PreviewTools> : null}
    <BottomCTA description={started ? "입력한 제목으로 미리보기를 만들어요." : "먼저 사진을 비교하거나 첫 기록을 작성해 보세요."}
      primaryAction={{ label: started ? currentSaved ? "저장했어요" : "미리보기에 저장" : "첫 기록 시작하기", onPress: started ? save : () => setStarted(true), loading: busy, loadingLabel: "미리보기 저장 중", disabled: started && !feedback.canSubmit }}
      secondaryAction={{ label: started ? "소개로 돌아가기" : details ? "사용 방법 접기" : "사용 방법 보기", onPress: started ? back : () => setDetails(value => !value), disabled: busy }}/>
    <BottomInfo items={["실제 서버 요청 없이 체험하는 예제예요.", "제목은 이 화면이 열려 있는 동안만 유지돼요. 계정 생성이나 결제는 없어요."]}/>
    {/* Result follows the action and its conditions; the untouched introduction has no save state. */}
    {started || state.value ? <PatternStatus>{status}</PatternStatus> : null}
    {state.value ? <Text>{productBentoSavedTitle(state.value)}</Text> : null}
    </Stack></ScreenLayout></KeyboardAvoiding>;
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
    <PatternStatus>{`선택한 표현: ${choice}`}</PatternStatus>
  </Stack>;
}

export function SelectionMotionPreview() {
  const [period, setPeriod] = useState("day");
  const options = [{ value: "day", label: "하루" }, { value: "week", label: "일주일" }, { value: "month", label: "한 달" }];
  // At 2x text the stacked selector pushes the memo behind the keyboard.
  // A scrolling screen host preserves access without shrinking the control or text.
  return <KeyboardAvoiding style={{ flex: 1 }}><ScreenLayout title="기간 선택" header={<></>} contentInset="none"><Stack gap="lg" layoutStyle={{ marginBottom: spacing.md }}><Heading level="level3">기간 선택</Heading><SegmentedControl label="연결형 기간 선택" items={options} value={period} onValueChange={setPeriod} selectionMotion="slide" /><SegmentedControl label="필터형 기간 선택" items={options} value={period} onValueChange={setPeriod} presentation="pills" selectionMotion="slide" /><Text>{period === "day" ? "오늘의 기록" : period === "week" ? "이번 주 기록" : "이번 달 기록"}</Text><TextField label="선택을 바꿔도 유지되는 메모" placeholder="선택 전후로 내용을 확인하세요" /></Stack></ScreenLayout></KeyboardAvoiding>;
}
