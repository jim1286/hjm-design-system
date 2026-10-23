import { View } from "react-native";
import { Avatar } from "@hjmds/react-native/data-display";
import { Stack } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/아바타", component: NativeComponentPreview, args: { componentId: "avatar", variant: "default" }, parameters: { hjm: { componentIds: ["avatar"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// 2026-10-23: small steps (22·28), the 44 touch step, rounded shape, frame "none" and a corner accessory.
const teamMark = <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#3366ff" }} />;
export const Presentation: Story = { name: "크기·모양·모서리 표식 · 미게시", render: () => <Stack axis="inline" gap="sm">
  <Avatar decorative size="xxsmall" name="Kim Min" />
  <Avatar decorative size="xsmall" name="Kim Min" />
  <Avatar name="Kim Min" accessibilityLabel="Kim Min" size="small" />
  <Avatar name="Lee Ha" accessibilityLabel="Lee Ha" size="touch" frame="surface" />
  <Avatar name="Park Jun" accessibilityLabel="Park Jun" size="large" shape="rounded" accessory={teamMark} />
  <Avatar decorative size="touch" frame="none" />
</Stack> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
