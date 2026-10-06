import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { MorphingMenu } from "@hjmds/react/menu-morph";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
function Demo() {
  const [value, setValue] = useState(1280);
  const [action, setAction] = useState("선택 없음");
  return <Stack gap="md">
    <AnimatedStatistic descriptor={{ id: "views", label: "조회 수" }} value={value} locale="ko-KR" />
    <Button tone="secondary" onClick={() => setValue(current => current + 127)}>조회 수 변경</Button>
    <MorphingMenu label="작업 선택" items={[{ id: "save", label: "저장" }, { id: "share", label: "공유" }, { id: "delete", label: "삭제", disabled: true }]} onAction={id => setAction(({save:"저장했어요",share:"공유를 선택했어요"} as Record<string,string>)[id] ?? "작업을 선택해 주세요")} />
    <Text role="status">{action}</Text>
  </Stack>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-optional-motion", title: "배포/구성/직접 조작과 모션/숫자 변화와 메뉴 변형", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
