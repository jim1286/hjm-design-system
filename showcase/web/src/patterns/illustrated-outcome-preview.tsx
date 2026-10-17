import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { EmptyState, Result } from "@hjmds/react/feedback";
import { OnboardingScreen } from "@hjmds/react/screen-flows";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";

// Showcase assets stay outside published packages. Titles carry their meaning,
// so losing a decorative image must never hide an action or announce duplicate copy.
const images = { notebook: new URL("../../../shared/assets/reference-icons/notebook.png", import.meta.url).href, tick: new URL("../../../shared/assets/reference-icons/tick.png", import.meta.url).href };
function Artwork({ kind, size = 120 }: { kind: keyof typeof images; size?: number }) {
 const [failed, setFailed] = useState(false);
 return failed ? null : <img src={images[kind]} alt="" width={size} height={size} style={{ objectFit: "contain" }} onError={() => setFailed(true)} />;
}

export function IllustratedOutcomePreview() {
 const [stage,setStage] = useState<"empty"|"intro"|"done">("empty");
 const [index,setIndex] = useState(0);
 const [draft,setDraft] = useState("");
 const [showArtwork,setShowArtwork] = useState(true);
 const host = useRef<HTMLDivElement>(null), result = useRef<HTMLDivElement>(null);
 const input = useRef<HTMLInputElement>(null), start = useRef<HTMLButtonElement>(null);
 const transitionFocus = useRef<HTMLElement | null>(null);
 const rememberFocus = () => {
  const active = document.activeElement;
  transitionFocus.current = active instanceof HTMLElement && active.matches("button") && host.current?.contains(active) ? active : null;
 };
 useLayoutEffect(() => {
  const previous = transitionFocus.current;
  transitionFocus.current = null;
  // Only a focused transition control owns recovery. Pointer activation without
  // focus, an explicit blur, or focus moved outside the preview keeps its current position.
  if (!previous || document.activeElement !== previous && document.activeElement !== document.body) return;
  const target = stage === "empty" ? start.current : stage === "done" ? result.current : index === 1 ? input.current : host.current?.querySelector<HTMLElement>("h1");
  if (target) { if (target.tagName.startsWith("H")) target.tabIndex = -1; target.focus(); }
 }, [stage, index]);
 const notebook = showArtwork ? <Artwork kind="notebook"/> : null;
 // The story fills the canvas (hjm.fillCanvas) so EmptyState centers in the body as on Native.
 return <Container size="reading"><Stack ref={host} gap="lg" layoutStyle={{ flexGrow: 1 }} onBlurCapture={event => { if (event.target === transitionFocus.current && event.target.isConnected) transitionFocus.current = null; }}>
  <PreviewTools><PreviewToolButton selected={!showArtwork} onClick={()=>setShowArtwork(v=>!v)}>그림 없이 보기</PreviewToolButton></PreviewTools>
  {stage === "empty" ? <EmptyState title="첫 기록을 기다리고 있어요" description="기록을 시작하는 두 단계를 체험해 보세요." icon={notebook} action={<Button ref={start} onClick={()=>{rememberFocus();setIndex(0);setStage("intro");}}>기록 시작하기</Button>}/> : stage === "intro" ?
   <OnboardingScreen steps={[
    {id:"welcome",title:"작은 장면부터 기록해요",description:"그림은 분위기를 더하고, 제목과 버튼은 할 일을 안내해요.",content:notebook},
    {id:"draft",title:"기록에 이름을 붙여요",description:"앞 단계로 돌아가도 입력한 제목은 유지돼요.",content:<TextField ref={input} label="기록 제목" value={draft} onValueChange={setDraft}/>}
   ]} index={index} onIndexChange={next=>{rememberFocus();setIndex(next);}} nextLabel="다음" backLabel="이전" complete={{label:"체험 완료",disabled:!draft.trim(),onAction:()=>{rememberFocus();setStage("done");}}} progressLabel={(step,total)=>`${step} / ${total} 단계`}/> :
   <Result ref={result} tabIndex={-1} status="success" title="시작할 준비가 됐어요" description={`입력한 제목: ${draft}. 이 체험에서는 서버에 저장하지 않아요.`} icon={showArtwork ? <Artwork kind="tick" size={32}/> : null} actions={[{label:"다시 체험하기",onAction:()=>{rememberFocus();setStage("empty");setIndex(0);}}]}/>}
  <Text variant="caption" tone="muted">그림이 없어도 안내와 모든 행동을 사용할 수 있어요.</Text>
 </Stack></Container>;
}
