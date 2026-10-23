import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/구분선", component: NativeComponentPreview, args: { componentId: "divider", variant: "default" }, parameters: { hjm: { componentIds: ["divider"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Divider } from '@hjmds/react-native/data-display';
import { Stack, Text } from '@hjmds/react-native/primitives';
// lineStyle="dashed" (2026-10-23): a break inside one surface; dash/gap from dividerRecipe.lineStyles (Diairy DashedRule).
export const Dashed: Story = { name: '점선', render: () => <Stack gap="md">
  <Text>오늘 받은 편지</Text><Divider lineStyle="dashed" /><Text>이어지는 이야기</Text>
</Stack> };
