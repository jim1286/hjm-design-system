import { Heading } from "@hjmds/react/heading";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GravityLetters } from "@hjmds/react/gravity-letters";
import { Stack, Text, VisuallyHidden } from "@hjmds/react/layout";
import { Switch } from "@hjmds/react/selection";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
const glyphs = ["새", "로", "운", " ", "시", "작", "✨"];
function Preview() {
  const [replay, setReplay] = useState(0);
  const [active, setActive] = useState(false);
  // The letters are aria-hidden decoration; the readable heading text stays in the same Heading, visually hidden,
  // instead of a second visible copy of the title (2026-10-17 review F12).
  return <Stack gap="lg"><Heading level="level3"><VisuallyHidden>새로운 시작</VisuallyHidden><GravityLetters glyphs={glyphs} active={active} replayKey={replay}/></Heading><Text>글자가 떨어지고 가볍게 튀어요. 모션 줄이기 설정에서는 정지된 글자를 보여줍니다.</Text>
    <PreviewTools><PreviewToolButton onClick={() => { setActive(true); setReplay(value => value + 1); }}>다시 재생</PreviewToolButton><Switch presentation="inline" label="움직임" checked={active} onCheckedChange={setActive}/></PreviewTools></Stack>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "components-display-gravity-letters", title: "배포/컴포넌트/시각 효과/중력 글자", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
