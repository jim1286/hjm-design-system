import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Text } from "@hjmds/react/layout";
import { ReferenceNavigationBars } from "./reference-navigation-bars";

// Navigation promotion was explicitly approved on 2026-10-02; comparison belongs in the gallery.
function NavigationBarCollection() {
  return <Stack gap="xl">
    <Text variant="heading">내비게이션 동작 비교</Text>
    <Text>각 바에서 목적지를 선택해 보세요. 추가 버튼은 이동과 별개의 동작입니다.</Text>
    <ReferenceNavigationBars />
  </Stack>;
}
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "experimental-navigation-bars", title: "배포/구성/내비게이션 바 비교", component: NavigationBarCollection } satisfies Meta<typeof NavigationBarCollection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
