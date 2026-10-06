import { useState } from "react";
import { Image as NativeImage } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { EmptyState, Result } from "@hjmds/react-native/feedback";
import { OnboardingScreen } from "@hjmds/react-native/screen-flows";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";

// Showcase assets stay outside published packages. Titles carry their meaning,
// so losing a decorative image must never hide an action or announce duplicate copy.
const images = { notebook: require("../../shared/assets/reference-icons/notebook.png"), tick: require("../../shared/assets/reference-icons/tick.png") };
function Artwork({ kind, size = 120 }: { kind: keyof typeof images; size?: number }) {
 const [failed, setFailed] = useState(false);
 return failed ? null : <NativeImage source={images[kind]} accessible={false} resizeMode="contain" style={{ width: size, height: size }} onError={() => setFailed(true)} />;
}

export function IllustratedOutcomePreview() {
 const [stage,setStage] = useState<"empty"|"intro"|"done">("empty");
 const [index,setIndex] = useState(0);
 const [draft,setDraft] = useState("");
 const [showArtwork,setShowArtwork] = useState(true);
 const notebook = showArtwork ? <Artwork kind="notebook"/> : null;
 return <Stack gap="lg">
  <Button tone="ghost" selected={!showArtwork} onPress={()=>setShowArtwork(v=>!v)}>{showArtwork ? "그림 없이 보기" : "그림 다시 보기"}</Button>
  {stage === "empty" ? <EmptyState title="첫 기록을 기다리고 있어요" description="기록을 시작하는 두 단계를 체험해 보세요." illustration={notebook} action={<Button onPress={()=>{setIndex(0);setStage("intro");}}>기록 시작하기</Button>}/> : stage === "intro" ?
   <OnboardingScreen steps={[
    {id:"welcome",title:"작은 장면부터 기록해요",description:"그림은 분위기를 더하고, 제목과 버튼은 할 일을 안내해요.",content:notebook},
    {id:"draft",title:"기록에 이름을 붙여요",description:"앞 단계로 돌아가도 입력한 제목은 유지돼요.",content:<TextField label="기록 제목" value={draft} onValueChange={setDraft}/>}
   ]} index={index} onIndexChange={setIndex} nextLabel="다음" backLabel="이전" complete={{label:"체험 완료",disabled:!draft.trim(),onAction:()=>setStage("done")}} progressLabel={(step,total)=>`${step} / ${total} 단계`}/> :
   <Result status="success" title="시작할 준비가 됐어요" description={`입력한 제목: ${draft}. 이 체험에서는 서버에 저장하지 않아요.`} renderIcon={() => showArtwork ? <Artwork kind="tick" size={32}/> : null} actions={[{label:"다시 체험하기",onAction:()=>{setStage("empty");setIndex(0);}}]}/>}
  <Text variant="caption" tone="muted">그림이 없어도 안내와 모든 행동을 사용할 수 있어요.</Text>
 </Stack>;
}
