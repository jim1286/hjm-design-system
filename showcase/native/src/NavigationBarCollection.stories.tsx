import { Heading } from "@hjmds/react-native/heading";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { ReferenceNavigationBars } from "./reference-navigation-bars";

// Navigation promotion was explicitly approved on 2026-10-02; comparison belongs in the gallery.
function NavigationBarCollection() {
  return <Stack gap="xl">
    <Heading level="level3">내비게이션 동작 비교</Heading>
    <Text>각 바에서 목적지를 선택해 보세요. 추가 버튼은 이동과 별개의 동작입니다.</Text>
    <ReferenceNavigationBars />
  </Stack>;
}
const meta = { title: "배포/구성/비교와 검증/내비게이션 바 비교", component: NavigationBarCollection } satisfies Meta<typeof NavigationBarCollection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
