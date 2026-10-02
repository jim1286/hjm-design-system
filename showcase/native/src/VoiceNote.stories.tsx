import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { VoiceNote } from "@hjmds/react-native/voice-note";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { voiceCopy as copy, voiceTime } from "../../shared/voice-note";
function Preview() {
 const [state,setState]=useState<"paused"|"playing"|"loading"|"error">("paused");
 const [position,setPosition]=useState(12);
 return <Stack gap="lg"><VoiceNote descriptor={{title:copy.title,duration:state==="loading"?null:84,position,state}} labels={copy.labels} formatTime={voiceTime} artwork={<Text>♪</Text>} onPlayingChange={playing=>setState(playing?"playing":"paused")} onSeek={setPosition} onRetry={()=>setState("paused")}/><Text tone="muted">{copy.simulated}</Text><Button tone="ghost" onPress={()=>setState(state==="loading"?"paused":"loading")}>로딩 상태</Button><Button tone="ghost" onPress={()=>setState("error")}>오류 상태</Button></Stack>;
}
const meta = {title: "배포/컴포넌트/데이터 표시/음성 메모",component:Preview} satisfies Meta<typeof Preview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
