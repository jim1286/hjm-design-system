import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { MorphingMenu } from "@hjmds/react/menu-morph";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react/layout";

// Result copy is chosen from a constant table, as the guide's `resultKey` (template keys escape extraction).
const resultCopy = { idle: "작업을 선택해 주세요", saved: "저장했어요", shared: "공유를 선택했어요" } as const;
function Demo() {
  const [value, setValue] = useState(1280);
  const [result, setResult] = useState<keyof typeof resultCopy>("idle");
  return <Stack gap="md">
    <AnimatedStatistic descriptor={{ id: "views", label: "조회 수" }} value={value} locale="ko-KR" />
    <Button tone="secondary" onClick={() => setValue(current => current + 127)}>조회 수 새로고침</Button>
    <MorphingMenu label="작업 선택" items={[{ id: "save", label: "저장" }, { id: "share", label: "공유" }, { id: "delete", label: "삭제", disabled: true }]} onAction={id => setResult(id === "share" ? "shared" : "saved")} />
    <Text as="p" role="status">{resultCopy[result]}</Text>
  </Stack>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-optional-motion", title: "배포/구성/직접 조작과 모션/숫자 변화와 메뉴 변형", component: Demo, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof Demo>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
