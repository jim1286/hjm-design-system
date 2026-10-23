import { Text as NativeText } from "react-native";
import { IconButton } from "@hjmds/react-native/actions";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/배경 영역", component: NativeComponentPreview, args: { componentId: "surface", variant: "default" }, parameters: { hjm: { componentIds: ["surface"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// elevation (2026-10-23): shadow token steps on Surface and on a filled floating IconButton.
export const Elevation: Story = { name: "높임 단계 · 미게시", render: () => <Stack gap="lg">
  {(["none", "raised", "floating", "overlay"] as const).map(step => <Surface key={step} elevation={step} padding="md"><Text>{step}</Text></Surface>)}
  <IconButton label="번뚝" tone="primary" size="large" shape="circle" elevation="floating"><NativeText>⚡</NativeText></IconButton>
</Stack> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
