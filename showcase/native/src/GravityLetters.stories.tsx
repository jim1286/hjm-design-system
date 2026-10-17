import { View } from "react-native";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { GravityLetters } from "@hjmds/react-native/gravity-letters";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Switch } from "@hjmds/react-native/inputs";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
const glyphs = ["새", "로", "운", " ", "시", "작", "✨"];
function Preview() {
  const [replay, setReplay] = useState(0);
  const [active, setActive] = useState(false);
  // The letters are hidden decoration; the wrapper carries the readable heading (Native has no VisuallyHidden),
  // instead of a second visible copy of the title (2026-10-17 review F12).
  return <Stack gap="lg"><View accessible accessibilityRole="header" accessibilityLabel="새로운 시작"><GravityLetters level="level3" glyphs={glyphs} active={active} replayKey={replay}/></View><Text>글자가 떨어지고 가볍게 튀어요. 모션 줄이기 설정에서는 정지된 글자를 보여줍니다.</Text>
    <PreviewTools><PreviewToolButton onPress={() => { setActive(true); setReplay(value => value + 1); }}>다시 재생</PreviewToolButton><Switch presentation="inline" label="움직임" checked={active} onCheckedChange={setActive}/></PreviewTools></Stack>;
}
const meta = { title: "배포/컴포넌트/시각 효과/중력 글자", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
