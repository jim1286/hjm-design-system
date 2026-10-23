import { useState } from "react";
import { View } from "react-native";
import { IconTile } from "@hjmds/react-native/screens";
import { Stack, Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/아이콘 타일", component: NativeComponentPreview, args: { componentId: "icon-tile", variant: "default" }, parameters: { hjm: { componentIds: ["icon-tile"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본", render: () => <ActivationPreview /> };
// locked + accessory (2026-10-23): pressable but dimmed, with an undimmed corner lock mark.
export const Locked: Story = { name: "잠금 · 미게시", render: () => <LockedPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function ActivationPreview() {
  const [opened, setOpened] = useState(0);
  const [previewed, setPreviewed] = useState(false);
  return <Stack gap="sm"><View style={{ width: 88 }}><IconTile label="예시 도구" activationLabel="예시 도구 열기"
    activationHint="길게 누르면 미리보기를 표시해요"
    icon={<Text>★</Text>} onActivate={() => setOpened(value => value + 1)} onLongPress={() => setPreviewed(true)} /></View>
    <Text>{opened ? `${opened}번 열었어요` : "아이콘과 제목을 함께 눌러 보세요"}</Text>
    {previewed ? <Text>미리보기를 열었어요</Text> : null}</Stack>;
}

function LockedPreview() {
  const [reason, setReason] = useState(false);
  return <Stack gap="sm"><View style={{ width: 88 }}><IconTile label="날씨" icon={<Text>☀</Text>} onActivate={() => setReason(true)}
    locked lockedLabel="로그인 필요" accessory={<Text>🔒</Text>} /></View>
    <Text>{reason ? "로그인하면 쓸 수 있어요" : "잠긴 타일을 눌러 이유를 확인하세요"}</Text></Stack>;
}
