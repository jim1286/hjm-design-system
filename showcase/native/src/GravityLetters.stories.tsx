import { Heading } from "@hjmds/react-native/heading";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { GravityLetters } from "@hjmds/react-native/gravity-letters";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
const glyphs = ["새", "로", "운", " ", "시", "작", "✨"];
function Preview() {
  const [replay, setReplay] = useState(0);
  const [active, setActive] = useState(false);
  return <Stack gap="lg"><Heading level="level3">새로운 시작</Heading><GravityLetters glyphs={glyphs} active={active} replayKey={replay}/><Text>글자가 떨어지고 가볍게 튀어요. 모션 줄이기 설정에서는 정지된 글자를 보여줍니다.</Text><Button onPress={() => { setActive(true); setReplay(value => value + 1); }}>다시 재생</Button><Button tone="ghost" onPress={() => setActive(false)}>움직임 멈추기</Button></Stack>;
}
const meta = { title: "배포/컴포넌트/시각 효과/중력 글자", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
