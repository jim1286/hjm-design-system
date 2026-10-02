import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { StepPlayer } from "@hjmds/react-native/step-player";
import { Text } from "@hjmds/react-native/primitives";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { playerCopy as copy, playerStepName } from "../../shared/step-player";
import { AppState } from "react-native";
function Preview() {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    // This explicitly started introduction has a demo clock; StepPlayer has none.
    const timer = setInterval(() => setPosition(value => Math.min(12, value + 1)), 500);
    const pause = () => setPlaying(false);
    const subscription = AppState.addEventListener("change", state => { if (state !== "active") pause(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [playing]);
  useEffect(() => { if (position === 12) setPlaying(false); }, [position]);
  const step = Math.min(2, Math.floor(position / 4));
  return <StepPlayer descriptor={{steps:copy.steps,currentStepId:copy.steps[step]!.id}} statusLabels={copy.statusLabels} composeAccessibleName={playerStepName} progress={position/12} playing={playing} labels={copy.labels} onPlayingChange={next=>{if(next && position===12)setPosition(0);setPlaying(next);}} onReplay={()=>{setPosition(0);setPlaying(true);}}>
    <ContentTransition stateKey={String(step)} preset="rise"><Text>{copy.panels[step]}</Text></ContentTransition>
  </StepPlayer>;
}
const meta = { title: "배포/컴포넌트/상태와 알림/단계별 진행 표시", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
