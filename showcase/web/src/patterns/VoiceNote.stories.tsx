import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VoiceNote } from "@hjmds/react/voice-note";
import { PreviewToolButton, PreviewTools } from "./preview-tools";
import { voiceNoteTools as tools } from "../../../shared/component-examples";
import { Stack, Text } from "@hjmds/react/layout";
import { voiceCopy as copy, voiceTime } from "../../../shared/voice-note";
function Preview() {
 const [state,setState]=useState<"paused"|"playing"|"loading"|"error">("paused");
 const [position,setPosition]=useState(12);
 return <Stack gap="lg"><VoiceNote descriptor={{title:copy.title,duration:state==="loading"?null:84,position,state}} labels={copy.labels} formatTime={voiceTime} artwork={<Text>♪</Text>} onPlayingChange={playing=>setState(playing?"playing":"paused")} onSeek={setPosition} onRetry={()=>setState("paused")}/><Text tone="muted">{copy.simulated}</Text>
  {/* State switches are demo tools (2026-10-17 review E14). */}
  <PreviewTools><PreviewToolButton selected={state==="loading"} onClick={()=>setState(state==="loading"?"paused":"loading")}>{tools.loading}</PreviewToolButton><PreviewToolButton onClick={()=>setState("error")}>{tools.error}</PreviewToolButton></PreviewTools></Stack>;
}
const meta = { includeStories: ["Default","Dark","LargeText"],id: "components-display-voice-note", title: "배포/컴포넌트/데이터 표시/음성 메모",component:Preview} satisfies Meta<typeof Preview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
