import {useEffect,useRef,useState} from "react";
import {fetch} from "expo/fetch";
import type {Meta,StoryObj} from "@storybook/react-native";
import {StreamingAnswer} from "@hjmds/react-native/streaming-answer";
import {TextField} from "@hjmds/react-native/inputs";
import {Container,Stack,Text} from "@hjmds/react-native/primitives";
import {answerLabels,readTextAnswer} from "../../shared/streaming-answer-example";
function Preview(){
 const [endpoint,setEndpoint]=useState(""),[busy,setBusy]=useState(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 return <Stack gap="md"><TextField label="실제 텍스트 스트림 URL" placeholder="https://…" value={endpoint} onValueChange={setEndpoint} disabled={busy}/>
 <StreamingAnswer answerId="plain-stream" label="스트림 응답" labels={answerLabels} disabled={!endpoint.trim()} onGenerate={context=>(async function*(){
  if(mounted.current)setBusy(true);
  try{const response=await fetch(endpoint,{signal:context.signal});yield* readTextAnswer(response,context);}finally{if(mounted.current)setBusy(false);}
 })()}/>
 <Text variant="caption">실제 text/plain 스트림 주소를 입력해 연결하세요. 고정 답변이나 가짜 지연을 재생하지 않습니다. AI 제공자 연결·인증·요청 데이터는 제품 adapter가 소유합니다.</Text></Stack>;
}
const meta={title:"실험/구성/피드백과 복구/스트림 응답과 중지",component:Preview,decorators:[Story=><Container size="reading"><Story/></Container>]} satisfies Meta<typeof Preview>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={name:"기본"};export const Dark:Story={name:"어두운 테마",globals:{theme:"dark"}};export const LargeText:Story={name:"큰 글자",globals:{textScale:"2"}};
