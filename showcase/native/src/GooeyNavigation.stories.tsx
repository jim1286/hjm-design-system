import { Heading } from "@hjmds/react-native/heading";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Tabs } from "@hjmds/react-native/navigation";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
const items = [{ id: "today", label: "오늘", panel: <Text>오늘의 기록을 모았어요.</Text> }, { id: "saved", label: "보관함", panel: <Text>저장한 기록을 다시 보세요.</Text> }, { id: "soon", label: "준비 중", disabled: true }, { id: "profile", label: "내 정보", panel: <Text>내 정보를 확인하세요.</Text> }];
function Preview() {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  return <Stack gap="lg"><Heading level="level3">유연하게 이어지는 선택</Heading><Tabs label="기록 보기" appearance="gooey" items={items} direction={direction}/><Button tone="ghost" onPress={() => setDirection(value => value === "ltr" ? "rtl" : "ltr")}>방향 바꾸기</Button><Text>선택 표시만 늘어나며 이동해요. 준비 중인 항목은 건너뜁니다.</Text></Stack>;
}
const meta = { title: "배포/컴포넌트/탐색/선택 표시가 이어지는 탭", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
